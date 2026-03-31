// Barre Neuroplasticité 66 jours
// Ligne colorée + compteur de jours : rouge (effort) → orange (transition) → vert (automatique)

const PHASE_1_END = 21;
const PHASE_2_END = 66;

/**
 * @param {number} totalCheckins - total checkins all-time for this habit
 * @returns {string} HTML string
 */
export function renderNeuroBar(totalCheckins) {
  const n = totalCheckins || 0;
  if (n === 0) return '';

  let pct, color, label, target;

  if (n >= PHASE_2_END) {
    pct = 100;
    color = '#00FF88';
    label = '✓ Automatique';
    target = '';
  } else if (n > PHASE_1_END) {
    pct = Math.round((n / PHASE_2_END) * 100);
    color = '#F59E0B';
    label = `J.${n}`;
    target = '/66';
  } else {
    pct = Math.round((n / PHASE_1_END) * 100);
    color = '#EF4444';
    label = `J.${n}`;
    target = '/21';
  }

  return `<div class="neuro-bar-wrap">
    <div class="neuro-bar">
      <div class="neuro-bar-fill" style="width:${pct}%;background:${color};transition:width 0.6s cubic-bezier(0.4,0,0.2,1)"></div>
    </div>
    <span class="neuro-bar-label" style="color:${color}">${label}<span class="neuro-bar-target">${target}</span></span>
  </div>`;
}
