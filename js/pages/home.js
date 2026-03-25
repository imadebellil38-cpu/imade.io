import { html, $, $$, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, daysAgo, dateRange, isDueOnDate } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { showHabitDetail } from '../components/habit-detail.js';
import { getHabitsForMember } from '../services/habits.js';
import { checkin, uncheckin, getCheckinsForRange } from '../services/checkins.js';
import { computeStreaks, computePoints } from '../services/scoring.js';

export function destroy() {}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) return;

  html(container, `
    <div class="grit-page">
      <div class="grit-topbar">
        <div class="grit-topbar-left">
          <button class="grit-icon-btn" id="btn-stats" onclick="location.hash='#me'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </button>
          <button class="grit-icon-btn" id="btn-leaderboard" onclick="location.hash='#leaderboard'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14v8"/><path d="M14 14v8"/><circle cx="12" cy="9" r="5"/></svg>
          </button>
        </div>
        <h1 class="grit-title">Aujourd'hui</h1>
        <div class="grit-topbar-right">
          <button class="grit-icon-btn" id="btn-profile" onclick="location.hash='#me'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div id="date-selector" class="grit-date-selector"></div>
      <div id="habit-grid"></div>
      <div id="perfect-section"></div>
    </div>
  `);

  await refreshHome(container, memberId);
}

async function refreshHome(container, memberId) {
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

  // ===== DATE SELECTOR (Grit style) =====
  const dateEl = $('#date-selector', container);
  if (dateEl) {
    dateEl.innerHTML = `
      <div class="grit-week">
        ${weekDays.map((d, i) => {
          const isToday = d.date === todayStr;
          const isPast = d.date < todayStr;
          const dueHabits = habits.filter(h => isDueOnDate(h.frequency, d.date));
          const checked = dueHabits.filter(h => checkinSet.has(`${h.id}_${d.date}`)).length;
          const allDone = dueHabits.length > 0 && checked === dueHabits.length;
          return `
            <div class="grit-day ${isToday ? 'today' : ''} ${isPast && allDone ? 'done' : ''} ${isPast && !allDone ? 'past' : ''}">
              <span class="grit-day-name">${d.dayName}</span>
              <div class="grit-day-circle ${isToday ? 'active' : ''}">
                ${d.dayNum}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ===== HABIT LIST (Grit style) =====
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

    const todayScore = todayHabits.length > 0
      ? todayHabits.filter(h => checkinSet.has(`${h.id}_${todayStr}`)).length
      : 0;

    habitGrid.innerHTML = `
      <div class="grit-section">
        <div class="grit-section-header">
          <span class="grit-section-icon">⚡</span>
          <span class="grit-section-label">Mes habitudes</span>
          <span class="grit-section-count">${todayScore}/${todayHabits.length}</span>
          <button class="grit-section-toggle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
        </div>
        <div class="grit-habit-list">
          ${todayHabits.map(h => {
            const isChecked = checkinSet.has(`${h.id}_${todayStr}`);
            const streak = streaks[h.id]?.currentStreak || 0;
            return `
              <div class="grit-habit ${isChecked ? 'checked' : ''}" data-habit-id="${h.id}">
                <div class="grit-habit-color" style="background:${h.color}; width:${isChecked ? '100%' : '60%'}"></div>
                <div class="grit-habit-content">
                  <div class="grit-habit-icon" style="background:${hexToRgba(h.color, 0.25)}">
                    <span>${h.icon}</span>
                  </div>
                  <div class="grit-habit-info">
                    <p class="grit-habit-name">${h.name}</p>
                    <p class="grit-habit-sub">${h.frequency === 'daily' ? 'Chaque jour' : 'Personnalisé'}</p>
                  </div>
                  ${streak > 0 ? `<div class="grit-habit-streak"><span class="grit-streak-icon">🔥</span>${streak}</div>` : ''}
                  <button class="grit-habit-btn ${isChecked ? 'done' : ''}" style="border-color:${isChecked ? 'var(--accent-green)' : h.color}; color:${isChecked ? 'var(--accent-green)' : h.color}">
                    ${isChecked
                      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
                      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
                    }
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Click handlers - check button toggles completion, icon/name opens detail
    habitGrid.querySelectorAll('.grit-habit').forEach(item => {
      const habitId = item.dataset.habitId;
      const habit = todayHabits.find(h => h.id === habitId);
      const habitStreak = streaks[habitId]?.currentStreak || 0;

      // Check button click - toggle check/uncheck
      const checkBtn = item.querySelector('.grit-habit-btn');
      if (checkBtn) {
        on(checkBtn, 'click', async (e) => {
          e.stopPropagation();
          const isChecked = item.classList.contains('checked');
          item.classList.toggle('checked');

          try {
            if (isChecked) {
              await uncheckin(habitId, todayStr);
            } else {
              await checkin({ habit_id: habitId, member_id: memberId, date: todayStr });
            }
            await refreshHome(container, memberId);
          } catch {
            item.classList.toggle('checked');
            showToast('Erreur, réessaie', 'error');
          }
        });
      }

      // Icon / name area click - open habit detail modal
      const iconArea = item.querySelector('.grit-habit-icon');
      const infoArea = item.querySelector('.grit-habit-info');
      [iconArea, infoArea].forEach(el => {
        if (el) {
          on(el, 'click', (e) => {
            e.stopPropagation();
            showHabitDetail({ habit, streak: habitStreak });
          });
        }
      });
    });
  }

  // Perfect day
  const perfectSection = $('#perfect-section', container);
  if (perfectSection) {
    const todayHabits = habits.filter(h => isDueOnDate(h.frequency, todayStr));
    const checkedCount = todayHabits.filter(h => checkinSet.has(`${h.id}_${todayStr}`)).length;
    if (checkedCount === todayHabits.length && todayHabits.length > 0) {
      perfectSection.innerHTML = `
        <div class="perfect-day">
          <div class="perfect-day-emoji">👑</div>
          <p class="perfect-day-text">Journée parfaite !</p>
          <p class="perfect-day-sub">Empire renforcé ! +${todayHabits.length * 10 + 50} pts</p>
        </div>
      `;
    } else {
      perfectSection.innerHTML = '';
    }
  }
}

function getWeekDays() {
  const now = new Date();
  const dayOfWeek = now.getDay();
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

function getMaxCurrentStreak(streaks) {
  let max = 0;
  for (const id in streaks) {
    if (streaks[id].currentStreak > max) max = streaks[id].currentStreak;
  }
  return max;
}

function hexToRgba(hex, alpha) {
  if (!hex || hex[0] !== '#') return `rgba(200,200,200,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
