import { html, $, on, delegate } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, isDueOnDate, getWeekday } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { getHabitsForMember } from '../services/habits.js';
import { getCheckinsForRange, checkin, uncheckin } from '../services/checkins.js';
import { hexToRgba } from '../lib/color.js';

let currentWeekStart = null;
let viewMode = 'week'; // 'week' or 'month'
let habits = [];
let checkins = [];
let memberId = null;
let containerRef = null;

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function destroy() {
  currentWeekStart = null;
  habits = [];
  checkins = [];
  memberId = null;
  containerRef = null;
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDate(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function dateToStr(d) {
  return d.toLocaleDateString('en-CA');
}

export async function render(container) {
  showNavbar();
  containerRef = container;
  memberId = Store.getMemberId();
  if (!memberId) return;

  currentWeekStart = getMonday(new Date());

  html(container, `
    <div class="tracker-page">
      <div class="tracker-header">
        <div class="tracker-nav-row">
          <button class="tracker-arrow" id="t-prev">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="tracker-period-label" id="t-label"></span>
          <button class="tracker-arrow" id="t-next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 6 15 12 9 18"/></svg>
          </button>
        </div>
        <div class="tracker-view-toggle">
          <button class="tracker-toggle-btn active" id="t-week">Semaine</button>
          <button class="tracker-toggle-btn" id="t-month">Mois</button>
        </div>
      </div>
      <div class="tracker-stats" id="t-stats"></div>
      <div class="tracker-grid-area" id="t-grid"></div>
      <div class="tracker-chart-area" id="t-chart"></div>
    </div>
  `);

  on($('#t-prev', container), 'click', () => { navigate(-1); });
  on($('#t-next', container), 'click', () => { navigate(1); });
  on($('#t-week', container), 'click', () => { setView('week'); });
  on($('#t-month', container), 'click', () => { setView('month'); });
  delegate(container, '.t-cell[data-h][data-d]', 'click', handleCellClick);

  await loadAndRender();
}

function navigate(dir) {
  if (viewMode === 'week') {
    currentWeekStart.setDate(currentWeekStart.getDate() + dir * 7);
  } else {
    currentWeekStart.setMonth(currentWeekStart.getMonth() + dir);
    currentWeekStart.setDate(1);
  }
  loadAndRender();
}

function setView(mode) {
  viewMode = mode;
  containerRef.querySelectorAll('.tracker-toggle-btn').forEach(b => b.classList.remove('active'));
  $(`#t-${mode}`, containerRef)?.classList.add('active');
  if (mode === 'month') {
    currentWeekStart = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1);
  } else {
    currentWeekStart = getMonday(currentWeekStart);
  }
  loadAndRender();
}

async function loadAndRender() {
  const { startDate, endDate } = getRange();
  [habits, checkins] = await Promise.all([
    getHabitsForMember(memberId),
    getCheckinsForRange(memberId, startDate, endDate)
  ]);
  renderLabel();
  renderStats();
  renderGrid();
  renderChart();
}

function getRange() {
  if (viewMode === 'week') {
    const start = dateToStr(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return { startDate: start, endDate: dateToStr(end) };
  }
  const y = currentWeekStart.getFullYear();
  const m = currentWeekStart.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  return { startDate: fmtDate(y, m + 1, 1), endDate: fmtDate(y, m + 1, lastDay) };
}

function getDays() {
  const { startDate, endDate } = getRange();
  const days = [];
  const cur = new Date(startDate);
  const last = new Date(endDate);
  while (cur <= last) {
    const str = dateToStr(cur);
    days.push({ dateStr: str, dayNum: cur.getDate(), weekday: getWeekday(str) });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function buildSet() {
  return new Set(checkins.map(c => `${c.habit_id}_${c.date}`));
}

function renderLabel() {
  const label = $('#t-label', containerRef);
  if (!label) return;
  if (viewMode === 'week') {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const s = currentWeekStart;
    label.textContent = `${s.getDate()} ${MONTH_NAMES[s.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
  } else {
    label.textContent = `${MONTH_NAMES[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()}`;
  }
}

function renderStats() {
  const el = $('#t-stats', containerRef);
  if (!el) return;
  const days = getDays();
  const set = buildSet();
  const todayStr = today();
  let due = 0, done = 0;
  for (const d of days) {
    if (d.dateStr > todayStr) continue;
    for (const h of habits) {
      if (isDueOnDate(h.frequency, d.dateStr)) { due++; if (set.has(`${h.id}_${d.dateStr}`)) done++; }
    }
  }
  const pct = due > 0 ? Math.round((done / due) * 100) : 0;
  el.innerHTML = `
    <div class="t-stat"><span class="t-stat-val">${habits.length}</span><span class="t-stat-lbl">Habitudes</span></div>
    <div class="t-stat"><span class="t-stat-val">${done}</span><span class="t-stat-lbl">Faits</span></div>
    <div class="t-stat"><span class="t-stat-val">${due}</span><span class="t-stat-lbl">Prévus</span></div>
    <div class="t-stat t-stat-accent"><span class="t-stat-val">${pct}%</span><span class="t-stat-lbl">Score</span></div>
  `;
}

function renderGrid() {
  const el = $('#t-grid', containerRef);
  if (!el) return;
  const days = getDays();
  const set = buildSet();
  const todayStr = today();

  let h = '<div class="t-grid-scroll"><table class="t-table">';
  // Header
  h += '<thead><tr><th class="t-name-col t-sticky">Habitude</th>';
  for (const d of days) {
    const cls = d.dateStr === todayStr ? ' t-today' : '';
    h += `<th class="t-day-col${cls}"><span class="t-day-ltr">${DAY_NAMES[d.weekday].charAt(0)}</span><span class="t-day-num">${d.dayNum}</span></th>`;
  }
  h += '<th class="t-analysis-col">Score</th></tr></thead><tbody>';

  // Rows
  for (const habit of habits) {
    let goal = 0, actual = 0;
    h += `<tr class="t-row">`;
    h += `<td class="t-name-col t-sticky"><span class="t-h-icon">${habit.icon}</span><span class="t-h-name">${habit.name}</span></td>`;
    for (const d of days) {
      const isDue = isDueOnDate(habit.frequency, d.dateStr);
      const checked = set.has(`${habit.id}_${d.dateStr}`);
      const future = d.dateStr > todayStr;
      // Count goal for all due days (including today), actual for all checked
      if (isDue && !future) goal++;
      if (isDue && d.dateStr === todayStr) goal++; // include today
      if (checked) actual++;

      let cls = 't-cell';
      if (d.dateStr === todayStr) cls += ' t-today';
      if (future) cls += ' t-future';
      else if (!isDue) cls += ' t-notdue';
      else if (checked) cls += ' t-done';
      else cls += ' t-miss';

      // Allow checking today AND past due days
      const clickable = isDue && !future ? `data-h="${habit.id}" data-d="${d.dateStr}"` : '';
      // Also allow today
      const clickToday = isDue && d.dateStr === todayStr ? `data-h="${habit.id}" data-d="${d.dateStr}"` : '';
      const click = clickable || clickToday;
      h += `<td class="${cls}" ${click}><div class="t-dot">${checked ? '✓' : ''}</div></td>`;
    }
    // Deduplicate today count
    const uniqueGoal = new Set();
    for (const d of days) {
      if (isDueOnDate(habit.frequency, d.dateStr) && d.dateStr <= todayStr) uniqueGoal.add(d.dateStr);
    }
    const realGoal = uniqueGoal.size;
    const pct = realGoal > 0 ? Math.round((actual / realGoal) * 100) : 0;
    h += `<td class="t-analysis-col"><div class="t-score-bar"><div class="t-score-fill" style="width:${pct}%;background:${habit.color}"></div></div><span class="t-score-txt">${pct}%</span></td>`;
    h += '</tr>';
  }
  h += '</tbody></table></div>';
  el.innerHTML = h;
}

function renderChart() {
  const el = $('#t-chart', containerRef);
  if (!el) return;
  const days = getDays();
  const set = buildSet();
  const todayStr = today();

  const dailyPcts = days.map(d => {
    if (d.dateStr > todayStr) return null;
    let due = 0, done = 0;
    for (const h of habits) {
      if (isDueOnDate(h.frequency, d.dateStr)) { due++; if (set.has(`${h.id}_${d.dateStr}`)) done++; }
    }
    return due > 0 ? Math.round((done / due) * 100) : 0;
  });

  const validPcts = dailyPcts.filter(p => p !== null);
  if (validPcts.length === 0) { el.innerHTML = ''; return; }

  const avg = Math.round(validPcts.reduce((a, b) => a + b, 0) / validPcts.length);
  const max = Math.max(...validPcts);
  const perfectDays = validPcts.filter(p => p === 100).length;

  // SVG chart
  const W = 360;
  const H = 120;
  const padL = 0;
  const padR = 0;
  const padT = 10;
  const padB = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const step = validPcts.length > 1 ? chartW / (validPcts.length - 1) : chartW;

  let points = '';
  let areaPoints = `${padL},${H - padB} `;
  validPcts.forEach((p, i) => {
    const x = padL + i * step;
    const y = padT + chartH - (p / 100) * chartH;
    points += `${x},${y} `;
    areaPoints += `${x},${y} `;
  });
  areaPoints += `${padL + (validPcts.length - 1) * step},${H - padB}`;

  const dayLabels = days.filter(d => d.dateStr <= todayStr).map((d, i) => {
    const x = padL + i * step;
    return `<text x="${x}" y="${H - 4}" text-anchor="middle" fill="var(--text-muted)" font-size="8" font-weight="600">${d.dayNum}</text>`;
  }).join('');

  el.innerHTML = `
    <div class="t-chart-header">
      <span class="t-chart-title">Progression</span>
      <div class="t-chart-pills">
        <span class="t-pill">Moy. <strong>${avg}%</strong></span>
        <span class="t-pill">Max <strong>${max}%</strong></span>
        <span class="t-pill t-pill-green">${perfectDays}j parfaits</span>
      </div>
    </div>
    <div class="t-chart-svg-wrap">
      <svg viewBox="0 0 ${W} ${H}" class="t-chart-svg">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00ff88" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#00ff88" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <line x1="${padL}" y1="${padT + chartH * 0.5}" x2="${W - padR}" y2="${padT + chartH * 0.5}" stroke="var(--text-muted)" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.3"/>
        <line x1="${padL}" y1="${padT}" x2="${W - padR}" y2="${padT}" stroke="var(--text-muted)" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.2"/>
        <polygon points="${areaPoints}" fill="url(#chartGrad)"/>
        <polyline points="${points}" fill="none" stroke="#00ff88" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${validPcts.map((p, i) => {
          const x = padL + i * step;
          const y = padT + chartH - (p / 100) * chartH;
          const color = p === 100 ? '#00ff88' : '#8B5CF6';
          return `<circle cx="${x}" cy="${y}" r="3.5" fill="${color}" stroke="#050510" stroke-width="1.5"/>`;
        }).join('')}
        ${dayLabels}
      </svg>
    </div>
  `;
}

async function handleCellClick(e, target) {
  const habitId = target.dataset.h;
  const dateStr = target.dataset.d;
  if (!habitId || !dateStr) return;

  const dot = target.querySelector('.t-dot');
  const wasChecked = target.classList.contains('t-done');

  // Optimistic UI
  if (wasChecked) {
    target.classList.remove('t-done');
    target.classList.add('t-miss');
    if (dot) dot.textContent = '';
  } else {
    target.classList.remove('t-miss');
    target.classList.add('t-done');
    if (dot) dot.textContent = '✓';
  }

  try {
    if (wasChecked) {
      await uncheckin(habitId, dateStr);
      checkins = checkins.filter(c => !(c.habit_id === habitId && c.date === dateStr));
    } else {
      const result = await checkin({ habit_id: habitId, member_id: memberId, date: dateStr });
      checkins.push(result);
    }
    renderStats();
    renderChart();
  } catch {
    if (wasChecked) { target.classList.remove('t-miss'); target.classList.add('t-done'); if (dot) dot.textContent = '✓'; }
    else { target.classList.remove('t-done'); target.classList.add('t-miss'); if (dot) dot.textContent = ''; }
  }
}
