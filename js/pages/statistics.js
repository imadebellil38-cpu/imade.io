import { html, $, on, escapeHtml } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, dateRange, isDueOnDate, getWeekday } from '../lib/dates.js';
import { hideNavbar } from '../components/navbar.js';
import { getHabitsForMember } from '../services/habits.js';
import { getAllCheckins, getCheckinsForRange } from '../services/checkins.js';
import { computeStreaks } from '../services/scoring.js';

let currentMonth = null;
let selectedHabitId = null;

export function destroy() {
  currentMonth = null;
  selectedHabitId = null;
}

export async function render(container) {
  hideNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) return;

  const now = new Date();
  currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  html(container, `
    <div class="stats-page">
      <div class="stats-topbar">
        <button class="stats-back-btn" id="stats-back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 class="stats-title">Statistiques</h1>
        <div style="width:40px"></div>
      </div>

      <div class="stats-content">
        <div class="stats-filter-section">
          <label class="stats-filter-label">Habitudes</label>
          <div class="stats-select-wrapper">
            <select id="stats-habit-select" class="stats-select">
              <option value="all">Toutes les habitudes</option>
            </select>
            <svg class="stats-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div id="stats-insights" class="stats-insights-section"></div>
        <div id="stats-calendar" class="stats-calendar-section"></div>
        <div id="stats-records" class="stats-records-section"></div>
        <div id="stats-heatmap" class="stats-heatmap-section"></div>
      </div>
    </div>
  `);

  on($('#stats-back', container), 'click', () => history.back());

  const habits = await getHabitsForMember(memberId);
  const select = $('#stats-habit-select', container);
  habits.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h.id;
    opt.textContent = `${h.icon} ${h.name}`;
    select.appendChild(opt);
  });

  on(select, 'change', () => {
    selectedHabitId = select.value === 'all' ? null : select.value;
    refreshAll(container, memberId);
  });

  await refreshAll(container, memberId);
}

async function refreshAll(container, memberId) {
  const [habits, allCheckins, streaks] = await Promise.all([
    getHabitsForMember(memberId),
    getAllCheckins(memberId),
    computeStreaks(memberId).catch(() => ({})),
  ]);

  renderInsights(container, habits, allCheckins, streaks);
  renderCalendar(container, habits, allCheckins);
  renderRecords(container, habits, allCheckins, streaks);
  renderHeatmap(container, habits, allCheckins);

  // Wire up month nav after calendar render
  const prevBtn = $('#cal-prev', container);
  const nextBtn = $('#cal-next', container);
  if (prevBtn) {
    on(prevBtn, 'click', () => {
      currentMonth.setMonth(currentMonth.getMonth() - 1);
      refreshAll(container, memberId);
    });
  }
  if (nextBtn) {
    on(nextBtn, 'click', () => {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      refreshAll(container, memberId);
    });
  }
}

function filterCheckins(allCheckins, habits) {
  if (!selectedHabitId) return allCheckins;
  return allCheckins.filter(c => c.habit_id === selectedHabitId);
}

function filterHabits(habits) {
  if (!selectedHabitId) return habits;
  return habits.filter(h => h.id === selectedHabitId);
}

// ======= INSIGHTS =======
function renderInsights(container, habits, allCheckins, streaks) {
  const el = $('#stats-insights', container);
  if (!el) return;

  const filteredHabits = filterHabits(habits);
  const filteredCheckins = filterCheckins(allCheckins, habits);
  const todayStr = today();
  const insights = [];
  const dayNames = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  if (filteredHabits.length === 0 || filteredCheckins.length < 7) {
    el.innerHTML = '';
    return;
  }

  // 1. Best habit (highest completion rate)
  if (!selectedHabitId && filteredHabits.length > 1) {
    let bestHabit = null, bestRate = 0, worstHabit = null, worstRate = 100;
    for (const h of filteredHabits) {
      let due = 0, done = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(todayStr);
        d.setDate(d.getDate() - i);
        const ds = d.toLocaleDateString('en-CA');
        if (isDueOnDate(h.frequency, ds)) {
          due++;
          if (filteredCheckins.find(c => c.habit_id === h.id && c.date === ds)) done++;
        }
      }
      const rate = due > 0 ? (done / due) * 100 : 0;
      if (rate > bestRate) { bestRate = rate; bestHabit = h; }
      if (rate < worstRate && due > 5) { worstRate = rate; worstHabit = h; }
    }
    if (bestHabit && bestRate > 0) {
      insights.push({
        icon: '🏆',
        color: '#00ff88',
        title: 'Meilleure habitude',
        text: `${bestHabit.icon} ${bestHabit.name} — ${Math.round(bestRate)}% de réussite sur 30 jours`
      });
    }
    if (worstHabit && worstRate < 50) {
      insights.push({
        icon: '⚠️',
        color: '#FBBF24',
        title: 'À améliorer',
        text: `${worstHabit.icon} ${worstHabit.name} — seulement ${Math.round(worstRate)}% complété`
      });
    }
  }

  // 2. Worst day of week
  const dayMissed = [0, 0, 0, 0, 0, 0, 0];
  const dayDue = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 60; i++) {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - i);
    const ds = d.toLocaleDateString('en-CA');
    const wd = getWeekday(ds);
    const due = filteredHabits.filter(h => isDueOnDate(h.frequency, ds));
    const done = filteredCheckins.filter(c => c.date === ds);
    const dueIds = new Set(due.map(h => h.id));
    const doneIds = new Set(done.map(c => c.habit_id));
    const missed = [...dueIds].filter(id => !doneIds.has(id)).length;
    dayMissed[wd] += missed;
    dayDue[wd] += due.length;
  }

  let worstDay = 0, worstDayRate = 0;
  let bestDay = 0, bestDayRate = 0;
  for (let i = 0; i < 7; i++) {
    if (dayDue[i] > 0) {
      const missRate = dayMissed[i] / dayDue[i];
      const successRate = 1 - missRate;
      if (missRate > worstDayRate) { worstDayRate = missRate; worstDay = i; }
      if (successRate > bestDayRate) { bestDayRate = successRate; bestDay = i; }
    }
  }

  if (worstDayRate > 0.3) {
    insights.push({
      icon: '📅',
      color: '#EF4444',
      title: `Le ${dayNames[worstDay]}, c'est dur`,
      text: `Tu rates ${Math.round(worstDayRate * 100)}% de tes habitudes le ${dayNames[worstDay]}`
    });
  }

  if (bestDayRate > 0.7) {
    insights.push({
      icon: '💪',
      color: '#00ff88',
      title: `Le ${dayNames[bestDay]}, tu gères`,
      text: `${Math.round(bestDayRate * 100)}% de réussite le ${dayNames[bestDay]} — ton meilleur jour !`
    });
  }

  // 3. Streak analysis
  let longestCurrent = 0, longestHabit = null;
  for (const [hid, s] of Object.entries(streaks)) {
    if (s.currentStreak > longestCurrent) {
      longestCurrent = s.currentStreak;
      longestHabit = filteredHabits.find(h => h.id === hid);
    }
  }
  if (longestCurrent >= 7 && longestHabit) {
    insights.push({
      icon: '🔥',
      color: '#F472B6',
      title: `${longestCurrent} jours de suite !`,
      text: `${longestHabit.icon} ${longestHabit.name} — continue comme ça, ne lâche rien !`
    });
  }

  // 4. Morning vs evening pattern (based on recent activity)
  const recentCheckins = filteredCheckins.filter(c => c.date >= (() => { const d = new Date(todayStr); d.setDate(d.getDate() - 14); return d.toLocaleDateString('en-CA'); })());
  const totalRecent = recentCheckins.length;
  const totalDueRecent = (() => {
    let count = 0;
    for (let i = 0; i < 14; i++) {
      const d = new Date(todayStr);
      d.setDate(d.getDate() - i);
      const ds = d.toLocaleDateString('en-CA');
      count += filteredHabits.filter(h => isDueOnDate(h.frequency, ds)).length;
    }
    return count;
  })();

  if (totalDueRecent > 0) {
    const recentRate = Math.round((totalRecent / totalDueRecent) * 100);
    // Compare to 30-60 day rate
    const olderCheckins = filteredCheckins.filter(c => {
      const d14 = new Date(todayStr); d14.setDate(d14.getDate() - 14);
      const d60 = new Date(todayStr); d60.setDate(d60.getDate() - 60);
      return c.date < d14.toLocaleDateString('en-CA') && c.date >= d60.toLocaleDateString('en-CA');
    });
    let olderDue = 0;
    for (let i = 14; i < 60; i++) {
      const d = new Date(todayStr);
      d.setDate(d.getDate() - i);
      const ds = d.toLocaleDateString('en-CA');
      olderDue += filteredHabits.filter(h => isDueOnDate(h.frequency, ds)).length;
    }
    const olderRate = olderDue > 0 ? Math.round((olderCheckins.length / olderDue) * 100) : 0;

    if (olderRate > 0 && recentRate > olderRate + 10) {
      insights.push({
        icon: '📈',
        color: '#00ff88',
        title: 'En progression !',
        text: `${recentRate}% ces 2 dernières semaines vs ${olderRate}% avant — tu t'améliores !`
      });
    } else if (olderRate > 0 && recentRate < olderRate - 10) {
      insights.push({
        icon: '📉',
        color: '#EF4444',
        title: 'Attention, baisse de régime',
        text: `${recentRate}% ces 2 dernières semaines vs ${olderRate}% avant — reprends-toi !`
      });
    }
  }

  // 5. Perfect days count
  let perfectDays = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - i);
    const ds = d.toLocaleDateString('en-CA');
    const due = filteredHabits.filter(h => isDueOnDate(h.frequency, ds));
    if (due.length === 0) continue;
    const doneSet = new Set(filteredCheckins.filter(c => c.date === ds).map(c => c.habit_id));
    if (due.every(h => doneSet.has(h.id))) perfectDays++;
  }
  if (perfectDays > 0) {
    insights.push({
      icon: '👑',
      color: '#8B5CF6',
      title: `${perfectDays} jour${perfectDays > 1 ? 's' : ''} parfait${perfectDays > 1 ? 's' : ''}`,
      text: `Tu as tout complété ${perfectDays} fois sur les 30 derniers jours`
    });
  }

  if (insights.length === 0) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = `
    <div class="stats-card">
      <h3 class="stats-section-title">💡 Insights</h3>
      <div class="insights-list">
        ${insights.map(ins => `
          <div class="insight-item">
            <div class="insight-icon" style="background:${ins.color}15;color:${ins.color}">${ins.icon}</div>
            <div class="insight-body">
              <div class="insight-title" style="color:${ins.color}">${escapeHtml(ins.title)}</div>
              <div class="insight-text">${escapeHtml(ins.text)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ======= CALENDAR =======
function renderCalendar(container, habits, allCheckins) {
  const calEl = $('#stats-calendar', container);
  if (!calEl) return;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday=0 offset
  let startWeekday = firstDay.getDay();
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

  const todayStr = today();
  const filteredCheckins = filterCheckins(allCheckins, habits);
  const filteredHabits = filterHabits(habits);

  // Build a set of dates with completions
  const completedDates = new Set();
  const partialDates = new Set();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayCheckins = filteredCheckins.filter(c => c.date === dateStr);
    const dueHabits = filteredHabits.filter(h => isDueOnDate(h.frequency, dateStr));

    if (dueHabits.length > 0 && dayCheckins.length > 0) {
      const checkedIds = new Set(dayCheckins.map(c => c.habit_id));
      const allDone = dueHabits.every(h => checkedIds.has(h.id));
      if (allDone) {
        completedDates.add(dateStr);
      } else {
        partialDates.add(dateStr);
      }
    }
  }

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  let cells = '';
  // Day name headers
  cells += dayLabels.map(d => `<div class="cal-header">${d}</div>`).join('');

  // Empty leading cells
  for (let i = 0; i < startWeekday; i++) {
    cells += '<div class="cal-cell empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isComplete = completedDates.has(dateStr);
    const isPartial = partialDates.has(dateStr);

    let cls = 'cal-cell';
    if (isToday) cls += ' today';
    if (isComplete) cls += ' complete';
    if (isPartial) cls += ' partial';

    cells += `<div class="${cls}"><span class="cal-num">${day}</span></div>`;
  }

  calEl.innerHTML = `
    <div class="stats-card">
      <div class="cal-nav">
        <button class="cal-nav-btn" id="cal-prev">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="cal-month-label">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</span>
        <button class="cal-nav-btn" id="cal-next">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
      </div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-legend">
        <span class="cal-legend-item"><span class="cal-dot complete"></span> Complet</span>
        <span class="cal-legend-item"><span class="cal-dot partial"></span> Partiel</span>
      </div>
    </div>
  `;
}

// ======= RECORDS =======
function renderRecords(container, habits, allCheckins, streaks) {
  const el = $('#stats-records', container);
  if (!el) return;

  const filteredCheckins = filterCheckins(allCheckins, habits);
  const filteredHabits = filterHabits(habits);
  const filteredStreaks = {};

  if (selectedHabitId) {
    if (streaks[selectedHabitId]) {
      filteredStreaks[selectedHabitId] = streaks[selectedHabitId];
    }
  } else {
    Object.assign(filteredStreaks, streaks);
  }

  // Current streak: max current streak across filtered habits
  let currentStreak = 0;
  let bestStreak = 0;
  for (const s of Object.values(filteredStreaks)) {
    if (s.currentStreak > currentStreak) currentStreak = s.currentStreak;
    if (s.maxStreak > bestStreak) bestStreak = s.maxStreak;
  }

  const totalCompleted = filteredCheckins.length;

  // Success rate: days with all due habits completed / total days with due habits
  const checkinsByDate = {};
  for (const c of filteredCheckins) {
    if (!checkinsByDate[c.date]) checkinsByDate[c.date] = new Set();
    checkinsByDate[c.date].add(c.habit_id);
  }

  // Gather all unique dates where habits were due
  const allDates = new Set();
  for (const c of filteredCheckins) allDates.add(c.date);
  // Also include dates with no checkins but habits were due (last 90 days)
  const todayStr = today();
  for (let i = 0; i < 90; i++) {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - i);
    allDates.add(d.toLocaleDateString('en-CA'));
  }

  let successDays = 0;
  let totalDueDays = 0;
  for (const dateStr of allDates) {
    const dueHabits = filteredHabits.filter(h => isDueOnDate(h.frequency, dateStr));
    if (dueHabits.length === 0) continue;
    totalDueDays++;
    const checkedIds = checkinsByDate[dateStr] || new Set();
    if (dueHabits.every(h => checkedIds.has(h.id))) {
      successDays++;
    }
  }
  const successRate = totalDueDays > 0 ? Math.round((successDays / totalDueDays) * 100) : 0;

  el.innerHTML = `
    <div class="stats-card">
      <h3 class="stats-section-title">Records</h3>
      <div class="records-grid">
        <div class="record-item">
          <div class="record-icon fire">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z"/></svg>
          </div>
          <span class="record-value">${currentStreak}</span>
          <span class="record-label">Série en cours</span>
        </div>
        <div class="record-item">
          <div class="record-icon trophy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14v8"/><path d="M14 14v8"/><circle cx="12" cy="9" r="5"/></svg>
          </div>
          <span class="record-value">${bestStreak}</span>
          <span class="record-label">Meilleure série</span>
        </div>
        <div class="record-item">
          <div class="record-icon check">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span class="record-value">${totalCompleted}</span>
          <span class="record-label">Complétées</span>
        </div>
        <div class="record-item">
          <div class="record-icon chart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <span class="record-value">${successRate}%</span>
          <span class="record-label">Taux de réussite</span>
        </div>
      </div>
    </div>
  `;
}

// ======= WEEKLY HEATMAP =======
function renderHeatmap(container, habits, allCheckins) {
  const el = $('#stats-heatmap', container);
  if (!el) return;

  const filteredHabits = filterHabits(habits);
  if (filteredHabits.length === 0) {
    el.innerHTML = '';
    return;
  }

  // Get last 4 weeks (28 days), aligned to current week
  const todayDate = new Date(today());
  const dayOfWeek = todayDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = new Date(todayDate);
  thisMonday.setDate(todayDate.getDate() + mondayOffset);

  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() - w * 7);
    const weekDays = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      weekDays.push(day.toLocaleDateString('en-CA'));
    }
    weeks.push(weekDays);
  }

  const allDays = weeks.flat();
  const startDate = allDays[0];
  const endDate = allDays[allDays.length - 1];
  const todayStr = today();

  // Index checkins
  const checkinMap = {};
  for (const c of allCheckins) {
    if (c.date >= startDate && c.date <= endDate) {
      const key = `${c.habit_id}_${c.date}`;
      checkinMap[key] = true;
    }
  }

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  let habitRows = '';
  for (const habit of filteredHabits) {
    let cells = '';
    for (let w = 0; w < weeks.length; w++) {
      for (let d = 0; d < 7; d++) {
        const dateStr = weeks[w][d];
        const isDue = isDueOnDate(habit.frequency, dateStr);
        const isChecked = checkinMap[`${habit.id}_${dateStr}`];
        const isFuture = dateStr > todayStr;

        let cls = 'heatmap-dot';
        if (isFuture) {
          cls += ' future';
        } else if (!isDue) {
          cls += ' not-due';
        } else if (isChecked) {
          cls += ' done';
        } else {
          cls += ' missed';
        }

        cells += `<div class="${cls}" title="${dateStr}"></div>`;
      }
    }

    habitRows += `
      <div class="heatmap-row">
        <div class="heatmap-habit-label">
          <span class="heatmap-icon">${escapeHtml(habit.icon)}</span>
          <span class="heatmap-name">${escapeHtml(habit.name)}</span>
        </div>
        <div class="heatmap-grid">${cells}</div>
      </div>
    `;
  }

  // Week labels (show the Monday date for each week)
  let weekLabels = '';
  for (const week of weeks) {
    const d = new Date(week[0]);
    const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    weekLabels += `<span class="heatmap-week-label">${label}</span>`;
  }

  el.innerHTML = `
    <div class="stats-card">
      <h3 class="stats-section-title">Activité hebdomadaire</h3>
      <div class="heatmap-day-headers">
        <div class="heatmap-spacer"></div>
        <div class="heatmap-days-row">
          ${dayLabels.map(d => `<span class="heatmap-day-label">${d}</span>`).join('')}
        </div>
      </div>
      <div class="heatmap-week-headers">
        <div class="heatmap-spacer"></div>
        <div class="heatmap-weeks-row">${weekLabels}</div>
      </div>
      ${habitRows}
      <div class="heatmap-legend">
        <span class="heatmap-legend-item"><span class="heatmap-legend-dot done"></span> Fait</span>
        <span class="heatmap-legend-item"><span class="heatmap-legend-dot missed"></span> Manqué</span>
        <span class="heatmap-legend-item"><span class="heatmap-legend-dot not-due"></span> Non prévu</span>
      </div>
    </div>
  `;
}
