import { html, $, on, delegate } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, isDueOnDate, getWeekday } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { getHabitsForMember } from '../services/habits.js';
import { getCheckinsForRange, checkin, uncheckin } from '../services/checkins.js';
import { hexToRgba } from '../lib/color.js';

let currentMonth = null;
let habits = [];
let checkins = [];
let memberId = null;
let containerRef = null;

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function destroy() {
  currentMonth = null;
  habits = [];
  checkins = [];
  memberId = null;
  containerRef = null;
}

export async function render(container) {
  showNavbar();
  containerRef = container;
  memberId = Store.getMemberId();
  if (!memberId) return;

  const now = new Date();
  currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  html(container, `
    <div class="tracker-page">
      <div class="tracker-topbar">
        <button class="tracker-back-btn" id="tracker-back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 class="tracker-title">Suivi mensuel</h1>
        <div style="width:40px"></div>
      </div>
      <div class="tracker-month-nav">
        <button class="tracker-nav-btn" id="tracker-prev">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="tracker-month-label" id="tracker-month-label"></span>
        <button class="tracker-nav-btn" id="tracker-next">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
      </div>
      <div class="tracker-stats-bar" id="tracker-stats"></div>
      <div class="tracker-grid-wrapper" id="tracker-grid-wrapper">
        <div class="tracker-grid-scroll" id="tracker-grid-scroll"></div>
      </div>
    </div>
  `);

  on($('#tracker-back', container), 'click', () => history.back());
  on($('#tracker-prev', container), 'click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    loadAndRender();
  });
  on($('#tracker-next', container), 'click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    loadAndRender();
  });

  delegate(container, '.tracker-cell[data-habit][data-date]', 'click', handleCellClick);

  await loadAndRender();
}

async function loadAndRender() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const startDate = formatDate(year, month + 1, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = formatDate(year, month + 1, lastDay);

  [habits, checkins] = await Promise.all([
    getHabitsForMember(memberId),
    getCheckinsForRange(memberId, startDate, endDate)
  ]);

  renderMonthLabel();
  renderStats();
  renderGrid();
}

function formatDate(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function renderMonthLabel() {
  const label = $('#tracker-month-label', containerRef);
  if (label) {
    label.textContent = `${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  }
}

function buildCheckinSet() {
  const set = new Set();
  for (const c of checkins) {
    set.add(`${c.habit_id}_${c.date}`);
  }
  return set;
}

function renderStats() {
  const statsEl = $('#tracker-stats', containerRef);
  if (!statsEl) return;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const checkinSet = buildCheckinSet();

  let totalDue = 0;
  let totalDone = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month + 1, day);
    for (const h of habits) {
      if (isDueOnDate(h.frequency, dateStr)) {
        totalDue++;
        if (checkinSet.has(`${h.id}_${dateStr}`)) {
          totalDone++;
        }
      }
    }
  }

  const pct = totalDue > 0 ? Math.round((totalDone / totalDue) * 100) : 0;

  statsEl.innerHTML = `
    <div class="tracker-stat">
      <span class="tracker-stat-value">${habits.length}</span>
      <span class="tracker-stat-label">Habitudes</span>
    </div>
    <div class="tracker-stat">
      <span class="tracker-stat-value">${totalDone}</span>
      <span class="tracker-stat-label">Complétés</span>
    </div>
    <div class="tracker-stat">
      <span class="tracker-stat-value">${totalDue}</span>
      <span class="tracker-stat-label">Prévus</span>
    </div>
    <div class="tracker-stat">
      <span class="tracker-stat-value">${pct}%</span>
      <span class="tracker-stat-label">Progression</span>
    </div>
  `;
}

function renderGrid() {
  const scrollEl = $('#tracker-grid-scroll', containerRef);
  if (!scrollEl) return;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today();
  const checkinSet = buildCheckinSet();

  // Build day info with week grouping
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month + 1, d);
    const weekday = getWeekday(dateStr); // 0=Mon..6=Sun
    const weekNum = Math.ceil((d + new Date(year, month, 1).getDay() - 1) / 7) || 1;
    days.push({ day: d, dateStr, weekday, weekNum, isToday: dateStr === todayStr });
  }

  // Determine week boundaries for group headers
  const weeks = [];
  let currentWeek = 0;
  for (const d of days) {
    if (d.weekNum !== currentWeek) {
      currentWeek = d.weekNum;
      weeks.push({ weekNum: currentWeek, startIdx: days.indexOf(d) });
    }
  }

  // Build table HTML
  let tableHTML = '<table class="tracker-table"><thead>';

  // Week number header row
  tableHTML += '<tr class="tracker-week-row"><th class="tracker-habit-header tracker-sticky-col">Habitude</th>';
  for (const w of weeks) {
    const daysInWeek = days.filter(d => d.weekNum === w.weekNum).length;
    tableHTML += `<th colspan="${daysInWeek}" class="tracker-week-header">S${w.weekNum}</th>`;
  }
  tableHTML += '<th class="tracker-analysis-header" rowspan="2">Analyse</th></tr>';

  // Day number + initial header row
  tableHTML += '<tr class="tracker-day-row"><th class="tracker-habit-header tracker-sticky-col"></th>';
  for (const d of days) {
    const cls = d.isToday ? ' tracker-today-col' : '';
    tableHTML += `<th class="tracker-day-header${cls}">
      <span class="tracker-day-initial">${DAY_INITIALS[d.weekday]}</span>
      <span class="tracker-day-num">${d.day}</span>
    </th>`;
  }
  tableHTML += '</tr></thead><tbody>';

  // Habit rows
  for (const habit of habits) {
    let goalDays = 0;
    let actualDone = 0;

    tableHTML += `<tr class="tracker-habit-row">`;
    tableHTML += `<td class="tracker-habit-name tracker-sticky-col">
      <span class="tracker-habit-icon">${habit.icon}</span>
      <span class="tracker-habit-text">${habit.name}</span>
    </td>`;

    for (const d of days) {
      const isDue = isDueOnDate(habit.frequency, d.dateStr);
      const isChecked = checkinSet.has(`${habit.id}_${d.dateStr}`);
      const isFuture = d.dateStr > todayStr;

      if (isDue) goalDays++;
      if (isChecked) actualDone++;

      let cellClass = 'tracker-cell';
      if (d.isToday) cellClass += ' tracker-today-col';
      if (isFuture) {
        cellClass += ' future';
      } else if (!isDue) {
        cellClass += ' not-due';
      } else if (isChecked) {
        cellClass += ' checked';
      } else {
        cellClass += ' unchecked';
      }

      const clickable = isDue && !isFuture ? `data-habit="${habit.id}" data-date="${d.dateStr}"` : '';

      tableHTML += `<td class="${cellClass}" ${clickable}>
        <span class="tracker-cell-inner" style="--habit-color: ${habit.color}">
          ${isChecked ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </span>
      </td>`;
    }

    // Analysis column
    const habitPct = goalDays > 0 ? Math.round((actualDone / goalDays) * 100) : 0;
    tableHTML += `<td class="tracker-analysis-cell">
      <div class="tracker-analysis-content">
        <span class="tracker-analysis-ratio">${actualDone}/${goalDays}</span>
        <div class="tracker-analysis-bar">
          <div class="tracker-analysis-fill" style="width: ${habitPct}%; background: ${habit.color}"></div>
        </div>
        <span class="tracker-analysis-pct">${habitPct}%</span>
      </div>
    </td>`;

    tableHTML += '</tr>';
  }

  // Bottom progress row
  tableHTML += '<tr class="tracker-progress-row">';
  tableHTML += '<td class="tracker-habit-name tracker-sticky-col tracker-progress-label">Progression</td>';

  for (const d of days) {
    let dueCt = 0;
    let doneCt = 0;
    for (const h of habits) {
      if (isDueOnDate(h.frequency, d.dateStr)) {
        dueCt++;
        if (checkinSet.has(`${h.id}_${d.dateStr}`)) doneCt++;
      }
    }
    const dayPct = dueCt > 0 ? Math.round((doneCt / dueCt) * 100) : 0;
    const isFuture = d.dateStr > todayStr;
    const pctClass = isFuture ? 'future' : dayPct === 100 ? 'perfect' : dayPct > 0 ? 'partial' : 'zero';

    tableHTML += `<td class="tracker-progress-cell ${d.isToday ? 'tracker-today-col' : ''}">
      <span class="tracker-progress-value ${pctClass}">${isFuture ? '' : dayPct + '%'}</span>
    </td>`;
  }

  tableHTML += '<td class="tracker-analysis-cell"></td>';
  tableHTML += '</tr></tbody></table>';

  scrollEl.innerHTML = tableHTML;
}

async function handleCellClick(e, target) {
  const habitId = target.dataset.habit;
  const dateStr = target.dataset.date;
  if (!habitId || !dateStr) return;

  const key = `${habitId}_${dateStr}`;
  const inner = target.querySelector('.tracker-cell-inner');
  const wasChecked = target.classList.contains('checked');

  // Optimistic UI toggle
  if (wasChecked) {
    target.classList.remove('checked');
    target.classList.add('unchecked');
    if (inner) inner.innerHTML = '';
  } else {
    target.classList.remove('unchecked');
    target.classList.add('checked');
    if (inner) inner.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  }

  try {
    if (wasChecked) {
      await uncheckin(habitId, dateStr);
      // Remove from local checkins array
      checkins = checkins.filter(c => !(c.habit_id === habitId && c.date === dateStr));
    } else {
      const result = await checkin({ habit_id: habitId, member_id: memberId, date: dateStr });
      checkins.push(result);
    }
    // Update stats and progress row without full re-render
    renderStats();
    updateProgressRow();
  } catch (err) {
    // Revert on error
    if (wasChecked) {
      target.classList.remove('unchecked');
      target.classList.add('checked');
      if (inner) inner.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else {
      target.classList.remove('checked');
      target.classList.add('unchecked');
      if (inner) inner.innerHTML = '';
    }
  }
}

function updateProgressRow() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today();
  const checkinSet = buildCheckinSet();

  const cells = containerRef.querySelectorAll('.tracker-progress-row .tracker-progress-cell');
  if (!cells.length) return;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month + 1, d);
    const isFuture = dateStr > todayStr;
    let dueCt = 0;
    let doneCt = 0;
    for (const h of habits) {
      if (isDueOnDate(h.frequency, dateStr)) {
        dueCt++;
        if (checkinSet.has(`${h.id}_${dateStr}`)) doneCt++;
      }
    }
    const dayPct = dueCt > 0 ? Math.round((doneCt / dueCt) * 100) : 0;
    const pctClass = isFuture ? 'future' : dayPct === 100 ? 'perfect' : dayPct > 0 ? 'partial' : 'zero';
    const cell = cells[d - 1];
    if (cell) {
      const span = cell.querySelector('.tracker-progress-value');
      if (span) {
        span.className = `tracker-progress-value ${pctClass}`;
        span.textContent = isFuture ? '' : dayPct + '%';
      }
    }
  }

  // Also update analysis column
  updateAnalysisColumn();
}

function updateAnalysisColumn() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const checkinSet = buildCheckinSet();

  const rows = containerRef.querySelectorAll('.tracker-habit-row');
  rows.forEach((row, idx) => {
    if (idx >= habits.length) return;
    const habit = habits[idx];
    let goalDays = 0;
    let actualDone = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(year, month + 1, d);
      if (isDueOnDate(habit.frequency, dateStr)) goalDays++;
      if (checkinSet.has(`${habit.id}_${dateStr}`)) actualDone++;
    }

    const habitPct = goalDays > 0 ? Math.round((actualDone / goalDays) * 100) : 0;
    const analysisCell = row.querySelector('.tracker-analysis-content');
    if (analysisCell) {
      analysisCell.querySelector('.tracker-analysis-ratio').textContent = `${actualDone}/${goalDays}`;
      analysisCell.querySelector('.tracker-analysis-pct').textContent = `${habitPct}%`;
      analysisCell.querySelector('.tracker-analysis-fill').style.width = `${habitPct}%`;
    }
  });
}
