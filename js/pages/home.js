import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, daysAgo } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { renderHeatmap } from '../components/heatmap.js';
import { showToast } from '../components/toast.js';
import { getTodayHabits, getHabitsForMember } from '../services/habits.js';
import { checkin, uncheckin, getTodayCheckins, getCheckinsForRange } from '../services/checkins.js';
import { getDailyScore, computeStreaks, computePoints } from '../services/scoring.js';
import { subscribeToCheckins, removeChannel } from '../services/realtime.js';

let channel = null;

export function destroy() {
  if (channel) {
    removeChannel(channel);
    channel = null;
  }
}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) return;

  const pseudo = Store.getPseudo();

  html(container, `
    <div class="page">
      <div class="home-header">
        <p class="home-date">${formatDate()}</p>
        <h1 class="home-greeting">Salut ${pseudo} 👋</h1>
      </div>
      <div id="home-score"></div>
      <div id="habit-list" class="habit-list stagger"></div>
      <div id="perfect-section"></div>
      <div id="heatmap-section"></div>
    </div>
  `);

  await refreshHome(container, memberId);

  channel = subscribeToCheckins(async (payload) => {
    if (payload.new?.member_id === memberId || payload.old?.member_id === memberId) {
      await refreshHome(container, memberId);
    }
  });
}

async function refreshHome(container, memberId) {
  const [habits, checkins, allHabits] = await Promise.all([
    getTodayHabits(memberId),
    getTodayCheckins(memberId),
    getHabitsForMember(memberId),
  ]);

  const checkedIds = new Set(checkins.map(c => c.habit_id));
  const score = await getDailyScore(memberId, habits, checkins);

  let streaks = {};
  try { streaks = await computeStreaks(memberId); } catch {}

  let points = { total: 0 };
  try { points = await computePoints(memberId); } catch {}

  // Score ring
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score.percentage / 100) * circumference;

  const scoreEl = $('#home-score', container);
  if (scoreEl) {
    scoreEl.innerHTML = `
      <div class="home-score">
        <div class="home-score-ring">
          <svg viewBox="0 0 80 80">
            <circle class="ring-bg" cx="40" cy="40" r="36" stroke-width="6"/>
            <circle class="ring-fill" cx="40" cy="40" r="36" stroke-width="6"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="home-score-text">
            <span class="home-score-number">${score.checked}/${score.total}</span>
            <span class="home-score-label">aujourd'hui</span>
          </div>
        </div>
        <div class="home-score-info">
          <div class="home-streak">
            🔥 <span class="home-streak-value">${getMaxCurrentStreak(streaks)}</span> jours de streak
          </div>
          <div class="home-points">${points.total} pts · ${getRankLabel(points.total)}</div>
        </div>
      </div>
    `;
  }

  // Habit list
  const habitList = $('#habit-list', container);
  if (habitList) {
    habitList.innerHTML = habits.map(h => {
      const isChecked = checkedIds.has(h.id);
      const streak = streaks[h.id]?.currentStreak || 0;
      return `
        <div class="habit-item ${isChecked ? 'checked' : ''} animate-slide-up" data-habit-id="${h.id}">
          <div class="habit-check" style="background:${hexToRgba(h.color, isChecked ? 0.18 : 0.08)}">
            <span class="habit-check-icon">${h.icon}</span>
            <span class="habit-check-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            </span>
          </div>
          <div class="habit-info">
            <p class="habit-name">${h.name}</p>
            ${streak > 0 ? `<p class="habit-streak-mini">🔥 ${streak} jour${streak > 1 ? 's' : ''}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    habitList.querySelectorAll('.habit-item').forEach(item => {
      on(item, 'click', async () => {
        const habitId = item.dataset.habitId;
        const isChecked = item.classList.contains('checked');
        item.classList.toggle('checked');

        try {
          if (isChecked) {
            await uncheckin(habitId, today());
          } else {
            await checkin({ habit_id: habitId, member_id: memberId, date: today() });
          }
          await refreshHome(container, memberId);
        } catch {
          item.classList.toggle('checked');
          showToast('Erreur, réessaie', 'error');
        }
      });
    });
  }

  // Perfect day
  const perfectSection = $('#perfect-section', container);
  if (perfectSection) {
    if (score.isPerfect && habits.length > 0) {
      perfectSection.innerHTML = `
        <div class="perfect-day">
          <div class="perfect-day-emoji">👑</div>
          <p class="perfect-day-text">Journée parfaite !</p>
          <p class="perfect-day-sub">+${habits.length * 10 + 50} points aujourd'hui</p>
        </div>
      `;
    } else {
      perfectSection.innerHTML = '';
    }
  }

  // Mini heatmap
  const heatmapSection = $('#heatmap-section', container);
  if (heatmapSection) {
    const weekCheckins = await getCheckinsForRange(memberId, daysAgo(6), today());
    renderHeatmap(heatmapSection, weekCheckins, allHabits, { mode: 'mini', days: 7 });
  }
}

function getMaxCurrentStreak(streaks) {
  let max = 0;
  for (const id in streaks) {
    if (streaks[id].currentStreak > max) max = streaks[id].currentStreak;
  }
  return max;
}

function getRankLabel(points) {
  if (points >= 5000) return '👑 Empereur';
  if (points >= 1000) return '🎖️ Général';
  if (points >= 500) return '🛡️ Guerrier';
  if (points >= 100) return '⚔️ Soldat';
  return '🪖 Recrue';
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatDate() {
  const d = new Date();
  const str = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return str.charAt(0).toUpperCase() + str.slice(1);
}
