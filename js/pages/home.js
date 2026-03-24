import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, daysAgo } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { renderQuote } from '../components/quote.js';
import { renderHeatmap } from '../components/heatmap.js';
import { showToast } from '../components/toast.js';
import { getTodayHabits, getHabitsForMember } from '../services/habits.js';
import { checkin, uncheckin, getTodayCheckins, getCheckinsForRange } from '../services/checkins.js';
import { getDailyScore, computeStreaks } from '../services/scoring.js';
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

  html(container, `
    <div class="page">
      <div class="home-header">
        <span class="home-logo">EMPIRE</span>
        <span class="home-date">${formatDate()}</span>
      </div>
      <div id="daily-score-section"></div>
      <div id="nmt-section"></div>
      <div id="habit-list" class="habit-list"></div>
      <div id="quote-section"></div>
      <div id="heatmap-section"></div>
    </div>
  `);

  await refreshHome(container, memberId);

  // Realtime
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
  try {
    streaks = await computeStreaks(memberId);
  } catch {}

  // Score bar
  const scoreSection = $('#daily-score-section', container);
  if (scoreSection) {
    scoreSection.innerHTML = `
      <div class="daily-score">
        <div class="daily-score-text">
          <span>Aujourd'hui</span>
          <span class="daily-score-value">${score.checked}/${score.total} ${score.isPerfect ? '🔥' : ''}</span>
        </div>
        <div class="score-bar">
          <div class="score-bar-fill" style="width:${score.percentage}%"></div>
        </div>
      </div>
    `;
  }

  // Never miss twice
  const nmtSection = $('#nmt-section', container);
  if (nmtSection) {
    const yesterday = daysAgo(1);
    const yesterdayCheckins = await getCheckinsForRange(memberId, yesterday, yesterday);
    const yesterdayCheckedIds = new Set(yesterdayCheckins.map(c => c.habit_id));
    const missedYesterday = allHabits.filter(h => !yesterdayCheckedIds.has(h.id));
    if (missedYesterday.length > 0 && yesterdayCheckins.length < allHabits.length) {
      nmtSection.innerHTML = `
        <div class="nmt-alert">
          <p class="nmt-alert-title">⚠️ Ne rate jamais deux fois</p>
          <p class="nmt-alert-text">Tu as raté hier : ${missedYesterday.map(h => h.icon + ' ' + h.name).join(', ')}</p>
        </div>
      `;
    } else {
      nmtSection.innerHTML = '';
    }
  }

  // Habit list
  const habitList = $('#habit-list', container);
  if (habitList) {
    habitList.innerHTML = habits.map(h => {
      const isChecked = checkedIds.has(h.id);
      const streak = streaks[h.id]?.currentStreak || 0;
      return `
        <div class="habit-item ${isChecked ? 'checked' : ''}" data-habit-id="${h.id}" style="border-left-color:${h.color}">
          <span class="habit-icon">${h.icon}</span>
          <div class="habit-info">
            <p class="habit-name">${h.name}</p>
            ${streak > 0 ? `<p class="habit-streak">🔥 ${streak} jour${streak > 1 ? 's' : ''}</p>` : ''}
          </div>
          <div class="habit-checkbox">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
      `;
    }).join('');

    // Rebind click handlers
    habitList.querySelectorAll('.habit-item').forEach(item => {
      on(item, 'click', async () => {
        const habitId = item.dataset.habitId;
        const isChecked = item.classList.contains('checked');

        // Optimistic UI
        item.classList.toggle('checked');

        try {
          if (isChecked) {
            await uncheckin(habitId, today());
          } else {
            await checkin({ habit_id: habitId, member_id: memberId, date: today() });
            showToast('✅ Habit checked!');
          }
          await refreshHome(container, memberId);
        } catch {
          item.classList.toggle('checked'); // revert
          showToast('Erreur, réessaie', 'error');
        }
      });
    });
  }

  // Quote
  const quoteSection = $('#quote-section', container);
  if (quoteSection) renderQuote(quoteSection);

  // Heatmap
  const heatmapSection = $('#heatmap-section', container);
  if (heatmapSection) {
    const weekCheckins = await getCheckinsForRange(memberId, daysAgo(6), today());
    renderHeatmap(heatmapSection, weekCheckins, allHabits, { mode: 'mini', days: 7 });
  }
}

function formatDate() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}
