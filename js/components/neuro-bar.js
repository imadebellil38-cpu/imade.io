// Barre Neuroplasticité 66 jours — version ultra-minimal
// Juste une fine ligne colorée : rouge (effort) → orange (transition) → vert (automatique)

const PHASE_1_END = 21;
const PHASE_2_END = 66;

/**
 * @param {number} totalCheckins - total checkins all-time for this habit
 * @returns {string} HTML string — thin colored bar, no text
 */
export function renderNeuroBar(totalCheckins) {
  const n = totalCheckins || 0;
  if (n === 0) return ''; // Don't show anything if no checkins yet

  let pct, color;

  if (n >= PHASE_2_END) {
    pct = 100;
    color = 'var(--accent-primary, #00FF88)';
  } else if (n > PHASE_1_END) {
    pct = Math.round((n / PHASE_2_END) * 100);
    color = '#F59E0B';
  } else {
    pct = Math.round((n / PHASE_1_END) * 100);
    color = '#EF4444';
  }

  return `<div class="neuro-bar" title="${n}/${n >= PHASE_2_END ? '66+' : n > PHASE_1_END ? '66' : '21'} jours — ${n >= PHASE_2_END ? 'Automatique' : n > PHASE_1_END ? 'Transition' : 'Effort'}">
    <div class="neuro-bar-fill" style="width:${pct}%;background:${color}"></div>
  </div>`;
}
