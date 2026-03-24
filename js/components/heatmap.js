import { daysAgo, dateRange } from '../lib/dates.js';

export function renderHeatmap(container, checkins, habits, { mode = 'mini', days = 7 } = {}) {
  if (mode === 'mini') {
    renderMiniHeatmap(container, checkins, habits, days);
  } else {
    renderFullHeatmap(container, checkins, habits, days);
  }
}

function renderMiniHeatmap(container, checkins, habits, days) {
  const range = dateRange(daysAgo(days - 1), daysAgo(0));
  const checkinMap = {};
  for (const c of checkins) {
    if (!checkinMap[c.date]) checkinMap[c.date] = 0;
    checkinMap[c.date]++;
  }

  const totalHabits = habits.length || 1;
  const cells = range.map(date => {
    const count = checkinMap[date] || 0;
    const ratio = count / totalHabits;
    let level = 0;
    if (ratio > 0) level = 1;
    if (ratio >= 0.5) level = 2;
    if (ratio >= 0.75) level = 3;
    if (ratio >= 1) level = 4;
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
  const checkinMap = {};
  for (const c of checkins) {
    if (!checkinMap[c.date]) checkinMap[c.date] = 0;
    checkinMap[c.date]++;
  }

  const totalHabits = habits.length || 1;
  const cells = range.map(date => {
    const count = checkinMap[date] || 0;
    const ratio = count / totalHabits;
    let level = 0;
    if (ratio > 0) level = 1;
    if (ratio >= 0.5) level = 2;
    if (ratio >= 0.75) level = 3;
    if (ratio >= 1) level = 4;
    return `<div class="full-heatmap-cell heatmap-cell level-${level}" title="${date}: ${count}/${totalHabits}"></div>`;
  });

  container.innerHTML = `
    <div class="profile-section">
      <h3 class="profile-section-title">Activité (${days} jours)</h3>
      <div class="full-heatmap">
        <div class="full-heatmap-grid">${cells.join('')}</div>
      </div>
    </div>
  `;
}
