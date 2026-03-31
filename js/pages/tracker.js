import { html, $, on, delegate, escapeHtml } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { today, isDueOnDate, getWeekday } from '../lib/dates.js';
import { showNavbar } from '../components/navbar.js';
import { renderTopbar, wireTopbar } from '../components/topbar.js';
import { getHabitsForMember } from '../services/habits.js';
import { getCheckinsForRange, checkin, uncheckin } from '../services/checkins.js';
import { hexToRgba } from '../lib/color.js';

let currentWeekStart = null;
let viewMode = 'week'; // 'week' or 'month'
let habits = [];
let checkins = [];
let memberId = null;
let containerRef = null;
let cleanups = [];

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function destroy() {
  cleanups.forEach(fn => fn());
  cleanups = [];
  currentWeekStart = null;
  viewMode = 'week';
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
      ${renderTopbar('Tracker')}
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
      <button class="t-stats-cta" id="t-stats-cta">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Voir mes statistiques détaillées
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  `);

  cleanups.push(wireTopbar(container));

  cleanups.push(on($('#t-prev', container), 'click', () => { navigate(-1); }));
  cleanups.push(on($('#t-next', container), 'click', () => { navigate(1); }));
  cleanups.push(on($('#t-week', container), 'click', () => { setView('week'); }));
  cleanups.push(on($('#t-month', container), 'click', () => { setView('month'); }));
  cleanups.push(delegate(container, '.t-cell[data-h][data-d]', 'click', handleCellClick));
  cleanups.push(on($('#t-stats-cta', container), 'click', () => { location.hash = '#statistics'; }));

  await loadAndRender();
}

function navigate(dir) {
  if (viewMode === 'week') {
    currentWeekStart.setDate(currentWeekStart.getDate() + dir * 7);
  } else {
    // Safe month navigation: always start from day 1 to avoid month skipping
    const y = currentWeekStart.getFullYear();
    const m = currentWeekStart.getMonth() + dir;
    currentWeekStart = new Date(y, m, 1);
  }
  loadAndRender();
}

function setView(mode) {
  viewMode = mode;
  containerRef.querySelectorAll('.tracker-toggle-btn').forEach(b => b.classList.remove('active'));
  $(`#t-${mode}`, containerRef)?.classList.add('active');
  if (mode === 'month') {
    // Switch to month: use current month of wherever we are
    currentWeekStart = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1);
  } else {
    // Switch to week: jump back to current week (today)
    currentWeekStart = getMonday(new Date());
  }
  loadAndRender();
}

async function loadAndRender() {
  const { startDate, endDate } = getRange();
  try {
    [habits, checkins] = await Promise.race([
      Promise.all([
        getHabitsForMember(memberId),
        getCheckinsForRange(memberId, startDate, endDate)
      ]),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
    ]);
  } catch {
    habits = habits || [];
    checkins = checkins || [];
  }
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
    let goalDays = 0, doneDays = 0;
    let cellsHTML = '';

    for (const d of days) {
      const isDue = isDueOnDate(habit.frequency, d.dateStr);
      const checked = set.has(`${habit.id}_${d.dateStr}`);
      const future = d.dateStr > todayStr;

      // Score: count due days up to today, count checked days up to today
      if (isDue && d.dateStr <= todayStr) goalDays++;
      if (checked && d.dateStr <= todayStr) doneDays++;

      let cls = 't-cell';
      const isVisible = isDue && !future;
      if (d.dateStr === todayStr) cls += ' t-today';
      if (future) cls += ' t-future';
      else if (!isDue) cls += ' t-notdue';
      else if (checked) cls += ' t-done';
      else cls += ' t-miss';

      const canClick = isDue && d.dateStr <= todayStr;
      const click = canClick ? `data-h="${habit.id}" data-d="${d.dateStr}"` : '';
      cellsHTML += `<td class="${cls}" ${click}><div class="t-dot">${checked && isVisible ? '✓' : ''}</div></td>`;
    }

    const pct = goalDays > 0 ? Math.round((doneDays / goalDays) * 100) : 0;

    h += `<tr class="t-row">`;
    h += `<td class="t-name-col t-sticky"><span class="t-h-icon">${escapeHtml(habit.icon)}</span><span class="t-h-name">${escapeHtml(habit.name)}</span></td>`;
    h += cellsHTML;
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

  // Only keep days up to today for the chart
  const chartDays = days.filter(d => d.dateStr <= todayStr);

  // SVG chart
  const W = 360;
  const H = 150;
  const padL = 28;
  const padR = 10;
  const padT = 10;
  const padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const step = validPcts.length > 1 ? chartW / (validPcts.length - 1) : chartW;

  // Build smooth bezier curve points
  const pts = validPcts.map((p, i) => ({
    x: padL + i * step,
    y: padT + chartH - (p / 100) * chartH
  }));

  function smoothPath(points) {
    if (points.length < 2) return `M ${points[0].x},${points[0].y}`;
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  const linePath = smoothPath(pts);
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const areaPath = `${linePath} L ${lastPt.x},${H - padB} L ${firstPt.x},${H - padB} Z`;

  // Show fewer labels when many days — only numbers, well spaced
  const labelEvery = chartDays.length <= 7 ? 1 : chartDays.length <= 14 ? 2 : 4;
  const dayLabels = chartDays.map((d, i) => {
    if (i % labelEvery !== 0 && i !== chartDays.length - 1) return '';
    const x = padL + i * step;
    return `<text x="${x}" y="${H - 5}" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="9" font-weight="700">${d.dayNum}</text>`;
  }).join('');

  // Y-axis labels
  const yLabels = [0, 50, 100].map(v => {
    const y = padT + chartH - (v / 100) * chartH;
    return `<text x="${padL - 4}" y="${y + 3}" text-anchor="end" fill="rgba(255,255,255,0.2)" font-size="7" font-weight="600">${v}%</text>`;
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
            <stop offset="0%" stop-color="var(--accent-primary)" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="var(--accent-primary)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${yLabels}
        <line x1="${padL}" y1="${padT + chartH}" x2="${W - padR}" y2="${padT + chartH}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
        <line x1="${padL}" y1="${padT + chartH * 0.5}" x2="${W - padR}" y2="${padT + chartH * 0.5}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" stroke-dasharray="3,3"/>
        <line x1="${padL}" y1="${padT}" x2="${W - padR}" y2="${padT}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" stroke-dasharray="3,3"/>
        <path d="${areaPath}" fill="url(#chartGrad)"/>
        <path d="${linePath}" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
        ${pts.filter((_, i) => {
          // Show dots only every few points, or on 100% days, or first/last
          if (validPcts.length <= 7) return true;
          if (i === 0 || i === pts.length - 1) return true;
          if (validPcts[i] === 100) return true;
          if (validPcts.length <= 14) return i % 2 === 0;
          return i % 3 === 0;
        }).map((pt, _, arr) => {
          const idx = pts.indexOf(pt);
          const color = validPcts[idx] === 100 ? 'var(--accent-green)' : 'var(--accent-purple)';
          return `<circle cx="${pt.x}" cy="${pt.y}" r="2" fill="${color}" stroke="var(--bg-card)" stroke-width="1"/>`;
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

  // Optimistic UI - toggle cell immediately
  if (wasChecked) {
    target.classList.remove('t-done');
    target.classList.add('t-miss');
    if (dot) dot.textContent = '';
    // Remove from local checkins
    checkins = checkins.filter(c => !(c.habit_id === habitId && c.date === dateStr));
  } else {
    target.classList.remove('t-miss');
    target.classList.add('t-done');
    if (dot) dot.textContent = '✓';
    // Add to local checkins immediately
    checkins.push({ habit_id: habitId, date: dateStr, member_id: memberId });
  }

  // Update everything in real-time BEFORE API call
  updateRowScore(target.closest('.t-row'), habitId);
  renderStats();
  renderChart();

  // API call in background
  try {
    if (wasChecked) {
      await uncheckin(habitId, dateStr);
    } else {
      const result = await checkin({ habit_id: habitId, member_id: memberId, date: dateStr });
      // Replace the temp checkin with the real one from API
      if (result) {
        checkins = checkins.filter(c => !(c.habit_id === habitId && c.date === dateStr));
        checkins.push(result);
      }
    }
  } catch (err) {
    console.error('Tracker checkin error:', err);
    // Revert on error
    if (wasChecked) {
      target.classList.remove('t-miss'); target.classList.add('t-done');
      if (dot) dot.textContent = '✓';
      checkins.push({ habit_id: habitId, date: dateStr, member_id: memberId });
    } else {
      target.classList.remove('t-done'); target.classList.add('t-miss');
      if (dot) dot.textContent = '';
      checkins = checkins.filter(c => !(c.habit_id === habitId && c.date === dateStr));
    }
    updateRowScore(target.closest('.t-row'), habitId);
    renderStats();
    renderChart();
  }
}

function updateRowScore(row, habitId) {
  if (!row) return;
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  const days = getDays();
  const set = buildSet();
  const todayStr = today();
  let goalDays = 0, doneDays = 0;

  for (const d of days) {
    if (isDueOnDate(habit.frequency, d.dateStr) && d.dateStr <= todayStr) goalDays++;
    if (set.has(`${habit.id}_${d.dateStr}`) && d.dateStr <= todayStr) doneDays++;
  }

  const pct = goalDays > 0 ? Math.round((doneDays / goalDays) * 100) : 0;
  const scoreCell = row.querySelector('.t-analysis-col');
  if (scoreCell) {
    const bar = scoreCell.querySelector('.t-score-fill');
    const txt = scoreCell.querySelector('.t-score-txt');
    if (bar) {
      bar.style.width = `${pct}%`;
      bar.style.background = habit.color;
    }
    if (txt) txt.textContent = `${pct}%`;
  }
}
