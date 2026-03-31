// Barre Neuroplasticité 66 jours
// Phase 1: Effort      (1–21 checkins)  → rouge
// Phase 2: Transition  (22–65 checkins) → orange
// Phase 3: Automatique (66+ checkins)   → vert

const PHASE_1_END = 21;
const PHASE_2_END = 66;

/**
 * @param {number} totalCheckins - total checkins all-time for this habit
 * @returns {string} HTML string
 */
export function renderNeuroBar(totalCheckins) {
  const n = totalCheckins || 0;

  let phase, phaseLabel, phaseSub, pct, c1, c2;

  if (n >= PHASE_2_END) {
    phase = 3;
    phaseLabel = 'Automatique';
    phaseSub = '66+ jours';
    pct = 100;
    c1 = '#00FF88';
    c2 = '#D4A853';
  } else if (n > PHASE_1_END) {
    phase = 2;
    phaseLabel = 'Transition';
    phaseSub = `${n}/66j`;
    pct = Math.round((n / PHASE_2_END) * 100);
    c1 = '#F59E0B';
    c2 = '#EF4444';
  } else {
    phase = 1;
    phaseLabel = 'Effort';
    phaseSub = `${n}/21j`;
    pct = n === 0 ? 0 : Math.round((n / PHASE_1_END) * 100);
    c1 = '#EF4444';
    c2 = '#7C3AED';
  }

  return `<div class="neuro-bar-wrap">
    <div class="neuro-bar-track">
      <div class="neuro-bar-fill neuro-phase-${phase}" style="width:${pct}%;--nb-c1:${c1};--nb-c2:${c2}"></div>
      <div class="neuro-bar-milestone neuro-m1"></div>
    </div>
    <div class="neuro-bar-labels">
      <span class="neuro-phase-label neuro-phase-label-${phase}">🧠 ${phaseLabel}</span>
      <span class="neuro-bar-count">${phaseSub}</span>
    </div>
  </div>`;
}
