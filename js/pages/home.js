import { html, $, on, escapeHtml } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, isDueOnDate } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { showTimerModal } from '../components/timer-modal.js';
import { renderTopbar, wireTopbar } from '../components/topbar.js';
import { hexToRgba } from '../lib/color.js';
import { getHabitsForMember, deactivateHabit } from '../services/habits.js';
import { checkin, uncheckin, getCheckinsForRange } from '../services/checkins.js';
import { computeAll } from '../services/scoring.js';
import { getQuoteOfDay } from '../data/quotes.js';
import { daysBetween } from '../lib/dates.js';

const pendingToggles = new Set();
let cleanupTopbar = null;

export function destroy() {
  pendingToggles.clear();
  if (cleanupTopbar) { cleanupTopbar(); cleanupTopbar = null; }
}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) return;

  html(container, `
    <div class="grit-page">
      ${renderTopbar('Aujourd\'hui')}

      <div id="date-selector" class="grit-date-selector"></div>

      <div class="home-logo-section">
        <span class="home-logo-wrap"><h2 class="home-logo" data-text="EmpireTrack">EmpireTrack</h2></span>
      </div>
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

  // Topbar navigation + theme toggle
  cleanupTopbar = wireTopbar(container);

  await refreshHome(container, memberId);

}

async function refreshHome(container, memberId) {
  const weekDays = getWeekDays();
  const startDate = weekDays[0].date;
  const endDate = weekDays[6].date;

  // Single fetch for all scoring data
  let habits = [], streaks = {}, points = { total: 0 }, firstDate = null, weekCheckins = [];
  try {
    const [allData, wc] = await Promise.all([
      computeAll(memberId).catch(() => ({ habits: [], checkins: [], streaks: {}, points: { total: 0 }, firstDate: null })),
      getCheckinsForRange(memberId, startDate, endDate).catch(() => []),
    ]);
    habits = allData.habits || [];
    streaks = allData.streaks || {};
    points = allData.points || { total: 0 };
    firstDate = allData.firstDate || null;
    weekCheckins = wc || [];
  } catch (err) {
    console.warn('Home data fetch failed:', err);
  }

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
          const isFuture = d.date > todayStr;
          const dueHabits = habits.filter(h => isDueOnDate(h.frequency, d.date));
          const dueCount = dueHabits.length;
          const checked = dueHabits.filter(h => checkinSet.has(`${h.id}_${d.date}`)).length;
          // If no habits data yet but we have checkins for this day, show as partial
          const dayCheckins = weekCheckins.filter(c => c.date === d.date).length;
          const pct = dueCount > 0 ? Math.round((checked / dueCount) * 100) : (dayCheckins > 0 ? 50 : -1);
          // Color classes based on completion %
          let dayClass = '';
          if (isPast && pct >= 0) {
            if (pct === 100) dayClass = 'perfect';
            else if (pct >= 65) dayClass = 'good';
            else if (pct >= 50) dayClass = 'half';
            else if (pct > 0) dayClass = 'low';
            else dayClass = 'missed';
          }
          return `
            <div class="grit-day ${isToday ? 'today' : ''} ${isPast ? dayClass : ''} ${isFuture ? 'future' : ''}">
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

      const habitId = card.dataset.habitId;
      if (pendingToggles.has(habitId)) return;
      pendingToggles.add(habitId);
      const pick = (...m) => m[Math.floor(Math.random() * m.length)];
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

      // Motivational micro-toast on check
      if (!isChecked) {
        const allCards = habitGrid.querySelectorAll('.grit-habit');
        const doneNow = habitGrid.querySelectorAll('.grit-habit.checked').length;
        if (doneNow === allCards.length) {
          showToast('👑 PARFAIT ! Journée complète !');
        } else if (doneNow === 1) {
          showToast(pick('Premier check ✓ C\'est parti !', '💪 Let\'s go, c\'est lancé !', '🔥 Premier domino !'));
        } else if (doneNow === Math.ceil(allCards.length / 2)) {
          showToast(pick('Mi-chemin 🔥 Continue !', '💪 La moitié, lâche rien !'));
        }
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

      pendingToggles.delete(habitId);

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

    // Long press to show delete menu (mobile)
    let pressTimer = null;
    let moved = false;

    on(card, 'touchstart', () => {
      moved = false;
      pressTimer = setTimeout(() => {
        pressTimer = null;
        if (!moved) {
          // Haptic feedback
          if (navigator.vibrate) navigator.vibrate(30);
          showHabitMenu(card, card.dataset.habitId, container, memberId);
        }
      }, 500);
    });

    on(card, 'touchmove', () => {
      moved = true;
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    });

    on(card, 'touchend', () => {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
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
  if (freq === 'weekly_3') return '3x / semaine';
  if (freq === 'monthly') return '1x / mois';
  if (freq === 'bimonthly') return '2x / mois';
  if (freq && freq.startsWith('monthly:')) return '1x / mois';
  if (freq && freq.startsWith('custom:')) {
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
  const pick = (...msgs) => msgs[Math.floor(Math.random() * msgs.length)];

  if (done === total && total > 0) return pick(
    "👑 Machine absolue. T'es un monstre.",
    "💎 100% — Personne peut te toucher aujourd'hui.",
    "🔥 Journée parfaite. Tu construis ton empire, frérot.",
    "⚔️ Guerrier. Tout validé. Repose-toi comme un roi.",
    "🏆 Discipline légendaire. Tu fais partie de l'élite."
  );
  if (pct >= 80) return pick(
    "Lâche rien frérot, il en reste si peu ! 💪",
    "T'es à ${done}/${total} — finis le travail, t'es presque au sommet.",
    "C'est maintenant que les vrais se séparent des autres. Termine.",
    "Presque parfait. Un dernier effort et t'es une légende."
  );
  if (pct >= 50) return pick(
    `${done}/${total} — T'es lancé, arrête pas maintenant.`,
    "Mi-chemin. Les winners finissent ce qu'ils commencent. 🔥",
    "Bien joué, mais c'est pas fini. Continue à empiler.",
    `Plus que ${total - done}. Chaque check te rapproche du sommet.`
  );
  if (streak >= 14 && done === 0) return `🔥 ${streak} jours de suite frérot. Casse pas ça. T'es trop fort pour ça.`;
  if (streak >= 7 && done === 0) return pick(
    `${streak} jours de streak — lâche rien, c'est ta série en or.`,
    `Frérot, ${streak} jours sans lâcher. Fais pas l'erreur de casser ça.`,
    `🔥 ${streak} jours. Chaque jour qui passe, tu deviens plus fort.`
  );
  if (hour < 7 && done === 0) return pick(
    "Debout avant tout le monde. C'est ça la mentalité. ⚡",
    "Le monde dort, toi tu construis. Respect.",
    "5h du mat' gang. Les empires se construisent tôt. 🌅"
  );
  if (hour < 10 && done === 0) return pick(
    "Le premier check de la journée, c'est le plus puissant. Go.",
    "Nouvelle journée, nouvelles victoires. Commence maintenant. 💪",
    "Frérot, ta journée commence là. Chaque action compte."
  );
  if (hour < 12) return pick(
    "Le matin c'est là que les empires se construisent. 🏗️",
    "Les heures du matin valent de l'or. Profite.",
    "Matinée productive = journée réussie. T'as ça dans le sang."
  );
  if (hour < 17) return pick(
    `Plus que ${total - done} habitudes. Tu peux le faire, frérot.`,
    "L'après-midi c'est le moment de finir fort. 💪",
    "Pas d'excuses. Juste des résultats. Go."
  );
  if (hour < 21) return pick(
    "La soirée approche. Termine ce que t'as commencé. 🌙",
    "Dernière ligne droite. Les champions finissent tard.",
    "C'est dans les dernières heures qu'on voit les vrais."
  );
  return pick(
    "Il est tard mais il est jamais trop tard. Fais-le. 🔥",
    "Même à cette heure, un check c'est une victoire.",
    "Le monde dort. Toi tu bosses. C'est ça la diff."
  );
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
    <button class="ctx-menu-item ctx-delete">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      Supprimer
    </button>
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
