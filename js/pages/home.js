import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, daysAgo, dateRange, isDueOnDate } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { getHabitsForMember } from '../services/habits.js';
import { checkin, uncheckin, getCheckinsForRange } from '../services/checkins.js';
import { computeStreaks, computePoints } from '../services/scoring.js';

export function destroy() {}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) return;

  const pseudo = Store.getPseudo();

  html(container, `
    <div class="page">
      <div class="home-header">
        <p class="home-date">${formatDate()}</p>
        <h1 class="home-greeting" data-text="Salut ${pseudo} 👋">Salut ${pseudo} 👋</h1>
      </div>

      <div class="empire-reveal">
        <div class="empire-reveal-text" aria-hidden="true">BUILD YOUR EMPIRE</div>
        <div class="empire-reveal-circle">
          <div class="empire-reveal-inner">BUILD YOUR EMPIRE</div>
        </div>
      </div>

      <div id="week-chart"></div>
      <div id="day-selector"></div>
      <div id="habit-grid"></div>
      <div id="perfect-section"></div>
    </div>
  `);

  await refreshHome(container, memberId);
}

async function refreshHome(container, memberId) {
  // Get all data for the week
  const weekDays = getWeekDays();
  const startDate = weekDays[0].date;
  const endDate = weekDays[6].date;

  const [habits, weekCheckins, streaks, points] = await Promise.all([
    getHabitsForMember(memberId),
    getCheckinsForRange(memberId, startDate, endDate),
    computeStreaks(memberId).catch(() => ({})),
    computePoints(memberId).catch(() => ({ total: 0 })),
  ]);

  const checkinSet = new Set(weekCheckins.map(c => `${c.habit_id}_${c.date}`));
  const todayStr = today();

  // Compute daily scores for chart
  const dailyScores = weekDays.map(d => {
    const dueHabits = habits.filter(h => isDueOnDate(h.frequency, d.date));
    const checked = dueHabits.filter(h => checkinSet.has(`${h.id}_${d.date}`)).length;
    const total = dueHabits.length;
    return { date: d.date, checked, total, pct: total > 0 ? Math.round((checked / total) * 100) : 0 };
  });

  const todayScore = dailyScores.find(d => d.date === todayStr) || { checked: 0, total: 0, pct: 0 };

  // Week chart (bar chart)
  const chartEl = $('#week-chart', container);
  if (chartEl) {
    const maxBarHeight = 80;
    chartEl.innerHTML = `
      <div class="week-chart">
        <div class="week-chart-header">
          <div class="week-chart-stats">
            <span class="week-chart-score">${todayScore.checked}/${todayScore.total}</span>
            <span class="week-chart-label">aujourd'hui</span>
          </div>
          <div class="week-chart-right">
            <div class="week-chart-streak">🔥 ${getMaxCurrentStreak(streaks)} jours</div>
            <div class="week-chart-points">${points.total} pts · ${getRankLabel(points.total)}</div>
          </div>
        </div>
        <div class="week-chart-bars">
          ${dailyScores.map(d => {
            const barH = d.total > 0 ? Math.max(4, (d.pct / 100) * maxBarHeight) : 4;
            const isToday = d.date === todayStr;
            const isPast = d.date < todayStr;
            const isFull = d.pct === 100 && d.total > 0;
            return `
              <div class="week-bar-col ${isToday ? 'today' : ''}" data-date="${d.date}">
                <div class="week-bar-value">${d.total > 0 ? d.pct + '%' : ''}</div>
                <div class="week-bar-track">
                  <div class="week-bar-fill ${isFull ? 'perfect' : ''} ${isPast && !isFull && d.total > 0 ? 'missed' : ''}" style="height:${barH}px"></div>
                </div>
                <div class="week-bar-label">${getDayLabel(d.date)}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Habit grid for today
  const habitGrid = $('#habit-grid', container);
  if (habitGrid) {
    const todayHabits = habits.filter(h => isDueOnDate(h.frequency, todayStr));

    if (todayHabits.length === 0) {
      habitGrid.innerHTML = `
        <div class="empty-habits">
          <p class="empty-habits-icon">📋</p>
          <p class="empty-habits-text">Aucune habitude pour aujourd'hui</p>
          <p class="empty-habits-sub">Ajoute des habitudes dans ton profil</p>
        </div>
      `;
      return;
    }

    habitGrid.innerHTML = `
      <div class="habit-section-title">Aujourd'hui</div>
      <div class="habit-list stagger">
        ${todayHabits.map(h => {
          const isChecked = checkinSet.has(`${h.id}_${todayStr}`);
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
        }).join('')}
      </div>
    `;

    // Click handlers
    habitGrid.querySelectorAll('.habit-item').forEach(item => {
      on(item, 'click', async () => {
        const habitId = item.dataset.habitId;
        const isChecked = item.classList.contains('checked');
        item.classList.toggle('checked');

        try {
          if (isChecked) {
            await uncheckin(habitId, todayStr);
          } else {
            await checkin({ habit_id: habitId, member_id: memberId, date: todayStr });
          }
          // Refresh chart and data in real-time
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
    if (todayScore.pct === 100 && todayScore.total > 0) {
      perfectSection.innerHTML = `
        <div class="perfect-day">
          <div class="perfect-day-emoji">👑</div>
          <p class="perfect-day-text">Journée parfaite !</p>
          <p class="perfect-day-sub">+${todayScore.total * 10 + 50} points aujourd'hui</p>
        </div>
      `;
    } else {
      perfectSection.innerHTML = '';
    }
  }
}

// Get 7 days: Mon to Sun of current week
function getWeekDays() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d.toLocaleDateString('en-CA'),
      dayName: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3),
      dayNum: d.getDate(),
    });
  }
  return days;
}

function getDayLabel(dateStr) {
  const d = new Date(dateStr);
  const name = d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3);
  return `<span class="week-bar-day">${name}</span><span class="week-bar-num">${d.getDate()}</span>`;
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
  if (!hex || hex[0] !== '#') return `rgba(200,200,200,${alpha})`;
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
