import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, isDueOnDate } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { hexToRgba } from '../lib/color.js';
import { getHabitsForMember } from '../services/habits.js';
import { checkin, uncheckin, getCheckinsForRange } from '../services/checkins.js';
import { computeStreaks, computePoints } from '../services/scoring.js';

let pendingToggle = false;

export function destroy() {
  pendingToggle = false;
  if (window.__empireRevealDestroy) {
    window.__empireRevealDestroy();
    window.__empireRevealDestroy = null;
  }
}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) return;

  html(container, `
    <div class="grit-page">
      <div class="grit-topbar">
        <div class="grit-topbar-left">
          <button class="grit-icon-btn" id="btn-stats">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </button>
          <button class="grit-icon-btn" id="btn-leaderboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14v8"/><path d="M14 14v8"/><circle cx="12" cy="9" r="5"/></svg>
          </button>
        </div>
        <h1 class="grit-title">Aujourd'hui</h1>
        <div class="grit-topbar-right">
          <button class="grit-icon-btn" id="btn-theme-toggle" aria-label="Toggle theme">
            ${Store.getTheme() === 'light'
              ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
              : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
            }
          </button>
          <button class="grit-icon-btn" id="btn-profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </div>

      <div id="date-selector" class="grit-date-selector"></div>

      <div class="empire-reveal" id="empire-reveal">
        <div class="empire-reveal-ghost">CONSTRUIS TON EMPIRE</div>
        <div class="empire-reveal-text">CONSTRUIS TON EMPIRE</div>
        <div class="empire-reveal-circle"></div>
      </div>

      <div id="habit-grid"></div>
      <div id="perfect-section"></div>
    </div>
  `);

  // Topbar navigation
  on($('#btn-stats', container), 'click', () => { location.hash = '#statistics'; });
  on($('#btn-leaderboard', container), 'click', () => { location.hash = '#leaderboard'; });
  on($('#btn-profile', container), 'click', () => { location.hash = '#me'; });

  // Theme toggle
  on($('#btn-theme-toggle', container), 'click', () => {
    const current = document.documentElement.dataset.theme || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    Store.setTheme(next);
    // Update the meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = next === 'light' ? '#f5f5f0' : '#050510';
    }
    // Update the toggle icon
    const toggleBtn = $('#btn-theme-toggle', container);
    if (toggleBtn) {
      toggleBtn.innerHTML = next === 'light'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    }
  });

  // Empire reveal animation
  initEmpireReveal(container);

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

  // ===== DATE SELECTOR =====
  const dateEl = $('#date-selector', container);
  if (dateEl) {
    dateEl.innerHTML = `
      <div class="grit-week">
        ${weekDays.map(d => {
          const isToday = d.date === todayStr;
          const isPast = d.date < todayStr;
          const dueHabits = habits.filter(h => isDueOnDate(h.frequency, d.date));
          const checked = dueHabits.filter(h => checkinSet.has(`${h.id}_${d.date}`)).length;
          const allDone = dueHabits.length > 0 && checked === dueHabits.length;
          return `
            <div class="grit-day ${isToday ? 'today' : ''} ${isPast && allDone ? 'done' : ''} ${isPast && !allDone ? 'past' : ''}">
              <span class="grit-day-name">${d.dayName}</span>
              <div class="grit-day-circle ${isToday ? 'active' : ''}">${d.dayNum}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ===== HABIT LIST =====
  const habitGrid = $('#habit-grid', container);
  if (!habitGrid) return;

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

  const checkedCount = todayHabits.filter(h => checkinSet.has(`${h.id}_${todayStr}`)).length;

  habitGrid.innerHTML = `
    <div class="grit-section">
      <div class="grit-section-header">
        <span class="grit-section-icon">⚡</span>
        <span class="grit-section-label">Mes habitudes</span>
        <span class="grit-section-count" id="habit-counter">${checkedCount}/${todayHabits.length}</span>
      </div>
      <div class="grit-habit-list">
        ${todayHabits.map(h => {
          const isChecked = checkinSet.has(`${h.id}_${todayStr}`);
          const streak = streaks[h.id]?.currentStreak || 0;
          return `
            <div class="grit-habit ${isChecked ? 'checked' : ''}" data-habit-id="${h.id}" data-color="${h.color}">
              <div class="grit-habit-color" style="background:${h.color}; width:${isChecked ? '100%' : '50%'}; opacity:${isChecked ? '0.5' : '0.35'}"></div>
              <div class="grit-habit-content">
                <div class="grit-habit-icon" style="background:${hexToRgba(h.color, 0.2)}">
                  <span>${h.icon}</span>
                </div>
                <div class="grit-habit-info">
                  <p class="grit-habit-name">${h.name}</p>
                  <p class="grit-habit-sub">${formatFrequency(h.frequency)}</p>
                </div>
                ${streak > 0 ? `<div class="grit-habit-streak"><span class="grit-streak-icon">🔥</span>${streak}</div>` : ''}
                <div class="grit-habit-btn ${isChecked ? 'done' : ''}" style="border-color:${isChecked ? 'var(--accent-green)' : h.color}; color:${isChecked ? 'var(--accent-green)' : h.color}">
                  ${isChecked
                    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
                    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
                  }
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Click handler: ENTIRE card toggles check/uncheck
  habitGrid.querySelectorAll('.grit-habit').forEach(card => {
    on(card, 'click', async () => {
      if (pendingToggle) return;
      pendingToggle = true;

      const habitId = card.dataset.habitId;
      const isChecked = card.classList.contains('checked');
      const color = card.dataset.color;

      // Instant visual feedback
      card.classList.toggle('checked');
      card.style.transform = 'scale(0.95)';
      setTimeout(() => { card.style.transform = ''; }, 150);

      // Update color bar width
      const colorBar = card.querySelector('.grit-habit-color');
      if (colorBar) colorBar.style.width = isChecked ? '55%' : '100%';

      // Update button icon
      const btn = card.querySelector('.grit-habit-btn');
      if (btn) {
        btn.classList.toggle('done');
        btn.style.borderColor = !isChecked ? 'var(--accent-green)' : color;
        btn.style.color = !isChecked ? 'var(--accent-green)' : color;
        btn.innerHTML = !isChecked
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      }

      // Update counter
      const counter = $('#habit-counter', container);
      if (counter) {
        const allCards = habitGrid.querySelectorAll('.grit-habit');
        const doneCount = habitGrid.querySelectorAll('.grit-habit.checked').length;
        counter.textContent = `${doneCount}/${allCards.length}`;
      }

      // API call
      try {
        if (isChecked) {
          await uncheckin(habitId, todayStr);
        } else {
          await checkin({ habit_id: habitId, member_id: memberId, date: todayStr });
        }
      } catch {
        // Revert on error
        card.classList.toggle('checked');
        if (colorBar) colorBar.style.width = isChecked ? '100%' : '55%';
        showToast('Erreur, réessaie', 'error');
      }

      pendingToggle = false;

      // Check perfect day
      const doneNow = habitGrid.querySelectorAll('.grit-habit.checked').length;
      const perfectSection = $('#perfect-section', container);
      if (perfectSection) {
        if (doneNow === todayHabits.length) {
          perfectSection.innerHTML = `
            <div class="perfect-day">
              <div class="perfect-day-emoji">👑</div>
              <p class="perfect-day-text">Journée parfaite !</p>
              <p class="perfect-day-sub">Empire renforcé !</p>
            </div>
          `;
        } else {
          perfectSection.innerHTML = '';
        }
      }
    });
  });

  // Perfect day (initial)
  const perfectSection = $('#perfect-section', container);
  if (perfectSection) {
    if (checkedCount === todayHabits.length && todayHabits.length > 0) {
      perfectSection.innerHTML = `
        <div class="perfect-day">
          <div class="perfect-day-emoji">👑</div>
          <p class="perfect-day-text">Journée parfaite !</p>
          <p class="perfect-day-sub">Empire renforcé !</p>
        </div>
      `;
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

function initEmpireReveal(container) {
  const reveal = $('#empire-reveal', container);
  if (!reveal) return;

  const circle = reveal.querySelector('.empire-reveal-circle');
  const text = reveal.querySelector('.empire-reveal-text');
  if (!circle || !text) return;

  let progress = 0;
  let animFrame;

  function animate() {
    progress += 0.0012;
    if (progress > 1) progress = 0;

    const x = progress * 100;
    text.style.clipPath = `circle(42px at ${x}% 50%)`;
    circle.style.left = `${x}%`;
    circle.style.opacity = '1';

    animFrame = requestAnimationFrame(animate);
  }

  animFrame = requestAnimationFrame(animate);

  // Clean up on destroy
  const origDestroy = window.__empireRevealDestroy;
  window.__empireRevealDestroy = () => {
    cancelAnimationFrame(animFrame);
    if (origDestroy) origDestroy();
  };
}

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function formatFrequency(freq) {
  if (!freq || freq === 'daily') return 'Chaque jour';
  if (freq === 'weekly_5') return 'Lun - Ven';
  if (freq === 'weekly_3') return 'Lun, Mer, Ven';
  if (freq.startsWith('custom:')) {
    const days = freq.slice(7).split(',').map(Number);
    return days.map(d => DAY_NAMES_SHORT[d]).join(', ');
  }
  return 'Chaque jour';
}
