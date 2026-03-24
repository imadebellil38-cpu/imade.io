import { daysAgo, dateRange } from '../lib/dates.js';

export function renderHeatmap(container, checkins, habits, { mode = 'mini', days = 7 } = {}) {
  if (mode === 'mini') {
    renderMiniHeatmap(container, checkins, habits, days);
  } else {
    renderFullHeatmap(container, checkins, habits, days);
  }
}

function getLevel(count, totalHabits) {
  if (!count) return 0;
  const ratio = count / totalHabits;
  if (ratio >= 1) return 4;
  if (ratio >= 0.75) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

function buildCheckinMap(checkins) {
  const map = {};
  for (const c of checkins) {
    if (!map[c.date]) map[c.date] = 0;
    map[c.date]++;
  }
  return map;
}

function renderMiniHeatmap(container, checkins, habits, days) {
  const range = dateRange(daysAgo(days - 1), daysAgo(0));
  const checkinMap = buildCheckinMap(checkins);
  const totalHabits = habits.length || 1;

  const cells = range.map(date => {
    const count = checkinMap[date] || 0;
    const level = getLevel(count, totalHabits);
    return `<div class="heatmap-cell level-${level}" title="${date}: ${count}/${totalHabits}"></div>`;
  });

  container.innerHTML = `
    <div class="mini-heatmap">
      <p class="mini-heatmap-title">7 derniers jours</p>
      <div class="mini-heatmap-grid">${cells.join('')}</div>
    </div>
  `;
}

function renderFullHeatmap(container, checkins, habits, days) {
  const range = dateRange(daysAgo(days - 1), daysAgo(0));
  const checkinMap = buildCheckinMap(checkins);
  const totalHabits = habits.length || 1;

  const cells = range.map(date => {
    const count = checkinMap[date] || 0;
    const level = getLevel(count, totalHabits);
    return `<div class="full-heatmap-cell heatmap-cell level-${level}" title="${date}: ${count}/${totalHabits}"></div>`;
  });

  container.innerHTML = `
    <div class="heatmap-section">
      <h3 class="section-title">Activité (${days} jours)</h3>
      <div class="full-heatmap">
        <div class="full-heatmap-grid">${cells.join('')}</div>
      </div>
    </div>
  `;
}
