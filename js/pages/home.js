import { html, $, on, escapeHtml } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, isDueOnDate } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { showTimerModal } from '../components/timer-modal.js';
import { hexToRgba } from '../lib/color.js';
import { getHabitsForMember, deactivateHabit } from '../services/habits.js';
import { checkin, uncheckin, getCheckinsForRange } from '../services/checkins.js';
import { computeStreaks, computePoints, getFirstCheckinDate } from '../services/scoring.js';
import { getQuoteOfDay } from '../data/quotes.js';
import { daysBetween } from '../lib/dates.js';

let pendingToggle = false;

export function destroy() {
  pendingToggle = false;
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
          <button class="grit-icon-btn" id="btn-add-habit" aria-label="Ajouter une habitude">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="grit-icon-btn" id="btn-theme-toggle" aria-label="Toggle theme">
            ${Store.getTheme() === 'light'
              ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
              : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
            }
          </button>
          <button class="grit-icon-btn" id="btn-settings" aria-label="Paramètres">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button class="grit-icon-btn" id="btn-profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </div>

      <div id="date-selector" class="grit-date-selector"></div>

      <div class="empire-reveal">
        <div class="empire-reveal-ghost">CONSTRUIS TON EMPIRE</div>
        <div class="empire-reveal-text">CONSTRUIS TON EMPIRE</div>
        <div class="empire-orb">
          <div class="empire-orb-core"></div>
          <div class="empire-orb-ring"></div>
          <div class="empire-orb-glow"></div>
        </div>
      </div>

      <div id="motivation-section"></div>
      <div id="habit-grid"></div>
      <div id="perfect-section"></div>
    </div>
  `);

  // Topbar navigation
  on($('#btn-stats', container), 'click', () => { location.hash = '#statistics'; });
  on($('#btn-leaderboard', container), 'click', () => { location.hash = '#leaderboard'; });
  on($('#btn-profile', container), 'click', () => { location.hash = '#me'; });
  on($('#btn-settings', container), 'click', () => { location.hash = '#settings'; });
  on($('#btn-add-habit', container), 'click', () => { location.hash = '#me'; });

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

  await refreshHome(container, memberId);
}

async function refreshHome(container, memberId) {
  const weekDays = getWeekDays();
  const startDate = weekDays[0].date;
  const endDate = weekDays[6].date;

  const [habits, weekCheckins, streaks, points, firstDate] = await Promise.all([
    getHabitsForMember(memberId),
    getCheckinsForRange(memberId, startDate, endDate),
    computeStreaks(memberId).catch(() => ({})),
    computePoints(memberId).catch(() => ({ total: 0 })),
    getFirstCheckinDate(memberId).catch(() => null),
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

  // ===== MOTIVATION SECTION =====
  const todayHabits = habits.filter(h => isDueOnDate(h.frequency, todayStr));
  const checkedNow = todayHabits.filter(h => checkinSet.has(`${h.id}_${todayStr}`)).length;
  const todayPct = todayHabits.length > 0 ? Math.round((checkedNow / todayHabits.length) * 100) : 0;
  const maxStreak = getMaxStreak(streaks);
  const totalPts = points.total || 0;
  const level = Math.floor(totalPts / 100) + 1;
  const xpInLevel = totalPts % 100;
  const xpNeeded = 100;
  const streakInfo = getStreakLevel(maxStreak);
  const daysActive = firstDate ? Math.max(1, daysBetween(firstDate, todayStr)) : 0;
  const atomicPct = daysActive > 0 ? Math.round((Math.pow(1.01, daysActive) - 1) * 100) : 0;

  const motivEl = $('#motivation-section', container);
  if (motivEl) {
    motivEl.innerHTML = `
      <div class="motiv-card">
        <div class="xp-row">
          <div class="xp-level-badge">${streakInfo.emoji} Nv.${level}</div>
          <div class="xp-bar-wrap">
            <div class="xp-bar-fill" style="width:${(xpInLevel / xpNeeded) * 100}%"></div>
          </div>
          <span class="xp-label">${xpInLevel}/${xpNeeded} XP</span>
        </div>
        ${maxStreak > 0 ? `
          <div class="streak-row ${streakInfo.cls}">
            <span class="streak-fire">${streakInfo.fire}</span>
            <span class="streak-num">${maxStreak}</span>
            <span class="streak-label">jour${maxStreak > 1 ? 's' : ''} ${streakInfo.text}</span>
          </div>
        ` : ''}
        ${daysActive > 1 ? `
          <div class="atomic-row">
            <span class="atomic-icon">📈</span>
            <span class="atomic-text">Jour ${daysActive} · <strong>+${atomicPct}%</strong> meilleur · 37x dans ${365 - (daysActive % 365)}j</span>
          </div>
        ` : ''}
        <div class="motiv-msg">${getMotivMessage(checkedNow, todayHabits.length, maxStreak, todayPct)}</div>
        <div class="daily-quote">« ${getQuoteOfDay()} »</div>
      </div>
    `;
  }

  // ===== HABIT LIST =====
  const habitGrid = $('#habit-grid', container);
  if (!habitGrid) return;

  if (todayHabits.length === 0) {
    habitGrid.innerHTML = `
      <div class="empty-habits">
        <p class="empty-habits-icon">📋</p>
        <p class="empty-habits-text">Aucune habitude pour aujourd'hui</p>
        <p class="empty-habits-sub">Ajoute des habitudes dans ton profil</p>
        <button class="btn btn-primary btn-sm" id="btn-empty-add" style="margin-top: var(--space-md);">Ajouter des habitudes</button>
      </div>
    `;
    on($('#btn-empty-add', container), 'click', () => { location.hash = '#me'; });
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
              <div class="grit-habit-color" style="background:${h.color}; width:${isChecked ? '100%' : '55%'}; opacity:${isChecked ? '0.75' : '0.6'}"></div>
              <div class="grit-habit-content">
                <div class="grit-habit-icon" style="background:${hexToRgba(h.color, 0.3)}">
                  <span>${escapeHtml(h.icon)}</span>
                </div>
                <div class="grit-habit-info">
                  <p class="grit-habit-name">${escapeHtml(h.name)}</p>
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

  // Click handler: icon/name opens timer (only for timed habits), check button toggles
  habitGrid.querySelectorAll('.grit-habit').forEach(card => {
    on(card, 'click', async (e) => {
      // If tapping the icon or habit info area
      const iconOrName = e.target.closest('.grit-habit-icon') || e.target.closest('.grit-habit-info');
      if (iconOrName) {
        const habitId = card.dataset.habitId;
        const h = todayHabits.find(hab => hab.id === habitId);
        if (!h) return;
        // Only open timer for habits that make sense with a timer
        if (isTimerHabit(h.name)) {
          const streak = streaks[h.id]?.currentStreak || 0;
          showTimerModal({
            habit: h,
            streak,
            memberId,
            onComplete: () => refreshHome(container, memberId),
          });
          return;
        }
        // Otherwise fall through to normal toggle
      }

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

    // Swipe to delete (mobile) + long press fallback
    let startX = 0, startY = 0, swiping = false, pressTimer = null;

    on(card, 'touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      swiping = false;

      // Long press fallback
      pressTimer = setTimeout(() => {
        pressTimer = null;
        if (!swiping) showHabitMenu(card, card.dataset.habitId, container, memberId);
      }, 600);
    });

    on(card, 'touchmove', (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      // If vertical scroll, cancel swipe
      if (Math.abs(dy) > Math.abs(dx) && !swiping) {
        if (pressTimer) clearTimeout(pressTimer);
        return;
      }

      // Swipe left detection
      if (dx < -20) {
        swiping = true;
        if (pressTimer) clearTimeout(pressTimer);
        e.preventDefault();
        const offset = Math.max(dx, -100);
        card.style.transform = `translateX(${offset}px)`;
        card.style.transition = 'none';

        // Show/create delete zone
        let deleteZone = card.parentElement.querySelector(`.swipe-delete[data-for="${card.dataset.habitId}"]`);
        if (!deleteZone) {
          deleteZone = document.createElement('div');
          deleteZone.className = 'swipe-delete';
          deleteZone.dataset.for = card.dataset.habitId;
          deleteZone.innerHTML = '🗑️';
          card.parentElement.style.position = 'relative';
          card.after(deleteZone);
          deleteZone.style.top = `${card.offsetTop}px`;
          deleteZone.style.height = `${card.offsetHeight}px`;
        }
        deleteZone.style.opacity = Math.min(1, Math.abs(dx) / 80);
      }
    });

    on(card, 'touchend', () => {
      if (pressTimer) clearTimeout(pressTimer);

      if (swiping) {
        const currentX = parseFloat(card.style.transform.replace('translateX(', '').replace('px)', '')) || 0;

        if (currentX <= -70) {
          // Swiped enough — show confirm
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = 'translateX(-100px)';

          const deleteZone = card.parentElement.querySelector(`.swipe-delete[data-for="${card.dataset.habitId}"]`);
          if (deleteZone) {
            deleteZone.style.opacity = '1';
            deleteZone.onclick = async () => {
              if (confirm('Supprimer cette habitude ?')) {
                try {
                  await deactivateHabit(card.dataset.habitId);
                  card.style.transition = 'all 0.3s';
                  card.style.transform = 'translateX(-100%)';
                  card.style.opacity = '0';
                  card.style.height = '0';
                  card.style.marginBottom = '0';
                  card.style.padding = '0';
                  setTimeout(() => { card.remove(); deleteZone.remove(); }, 300);
                  showToast('Habitude supprimée');
                } catch {
                  showToast('Erreur', 'error');
                }
              } else {
                // Cancel — slide back
                card.style.transition = 'transform 0.2s ease';
                card.style.transform = 'translateX(0)';
                setTimeout(() => deleteZone.remove(), 200);
              }
            };
          }
        } else {
          // Not enough swipe — snap back
          card.style.transition = 'transform 0.2s ease';
          card.style.transform = 'translateX(0)';
          const deleteZone = card.parentElement.querySelector(`.swipe-delete[data-for="${card.dataset.habitId}"]`);
          if (deleteZone) setTimeout(() => deleteZone.remove(), 200);
        }
        swiping = false;
      }
    });

    // Right click (PC) — show delete option
    on(card, 'contextmenu', (e) => {
      e.preventDefault();
      showHabitMenu(card, card.dataset.habitId, container, memberId);
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

function getMaxStreak(streaks) {
  let max = 0;
  for (const id in streaks) {
    if (streaks[id].currentStreak > max) max = streaks[id].currentStreak;
  }
  return max;
}

function getStreakLevel(streak) {
  if (streak >= 30) return { fire: '💎', text: 'Légendaire', cls: 'streak-legendary', emoji: '👑' };
  if (streak >= 15) return { fire: '🔥🔥🔥', text: 'Inarrêtable', cls: 'streak-unstoppable', emoji: '🎖️' };
  if (streak >= 8) return { fire: '🔥🔥', text: 'En feu', cls: 'streak-fire', emoji: '🛡️' };
  if (streak >= 4) return { fire: '🔥', text: 'En forme', cls: 'streak-warm', emoji: '⚔️' };
  if (streak >= 1) return { fire: '🔥', text: 'Début', cls: 'streak-start', emoji: '🪖' };
  return { fire: '', text: '', cls: '', emoji: '🪖' };
}

function getMotivMessage(done, total, streak, pct) {
  const hour = new Date().getHours();
  if (done === total && total > 0) return "Machine. Rien ne t'arrête. 👑";
  if (pct >= 80) return "Presque ! Il reste si peu. Termine en beauté.";
  if (pct >= 50) return `${done}/${total} — Tu es à mi-chemin. Continue.`;
  if (streak >= 7 && done === 0) return "Ne brise pas ta série de " + streak + " jours.";
  if (hour < 10 && done === 0) return "Le premier check de la journée est le plus puissant.";
  if (hour < 12) return "Le matin, c'est là que tout se joue.";
  if (hour < 17) return `${total - done} habitudes restantes. Tu peux le faire.`;
  if (hour < 21) return "La fin de journée approche. Chaque check compte.";
  return "Il n'est jamais trop tard pour avancer.";
}

// Habits that make sense with a timer (duration-based)
const TIMER_KEYWORDS = ['min', 'sport', 'méditer', 'méditation', 'lire', 'lecture', 'deep work', 'yoga', 'étirement', 'stretching', 'cardio', 'musculation', 'hiit', 'marche', 'foam', 'plank', 'sieste'];

function isTimerHabit(name) {
  const lower = name.toLowerCase();
  return TIMER_KEYWORDS.some(kw => lower.includes(kw));
}

function showHabitMenu(card, habitId, container, memberId) {
  // Remove existing menu
  const old = document.querySelector('.habit-context-menu');
  if (old) old.remove();

  // Vibrate for haptic feedback (mobile)
  if (navigator.vibrate) navigator.vibrate(30);

  const rect = card.getBoundingClientRect();
  const menu = document.createElement('div');
  menu.className = 'habit-context-menu';
  menu.innerHTML = `
    <button class="ctx-menu-item ctx-delete">🗑️ Supprimer l'habitude</button>
    <button class="ctx-menu-item ctx-cancel">Annuler</button>
  `;

  // Position near the card
  menu.style.position = 'fixed';
  menu.style.top = `${Math.min(rect.bottom + 4, window.innerHeight - 100)}px`;
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.zIndex = '200';

  document.body.appendChild(menu);

  // Animate in
  requestAnimationFrame(() => menu.classList.add('visible'));

  const close = () => {
    menu.classList.remove('visible');
    setTimeout(() => menu.remove(), 150);
  };

  // Delete
  on(menu.querySelector('.ctx-delete'), 'click', async () => {
    close();
    card.style.transform = 'scale(0.9)';
    card.style.opacity = '0.5';
    try {
      await deactivateHabit(habitId);
      card.style.transition = 'all 0.3s';
      card.style.height = '0';
      card.style.padding = '0';
      card.style.margin = '0';
      card.style.opacity = '0';
      setTimeout(() => card.remove(), 300);
      showToast('Habitude supprimée');
    } catch {
      card.style.transform = '';
      card.style.opacity = '';
      showToast('Erreur', 'error');
    }
  });

  // Cancel
  on(menu.querySelector('.ctx-cancel'), 'click', close);

  // Close on outside click
  setTimeout(() => {
    on(document, 'click', (e) => {
      if (!menu.contains(e.target)) close();
    });
  }, 10);
}
