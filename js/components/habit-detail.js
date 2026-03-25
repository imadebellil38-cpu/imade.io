import { on } from '../lib/dom.js';

let activeTimer = null;

function hexToRgba(hex, alpha) {
  if (!hex || hex[0] !== '#') return `rgba(139,92,246,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const CIRCUMFERENCE = 2 * Math.PI * 108;

export function showHabitDetail({ habit, streak = 0, onClose }) {
  // Clean up any previous timer
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }

  let totalSeconds = 60;
  let remainingSeconds = totalSeconds;
  let timerRunning = false;
  let intervalId = null;

  const color = habit.color || '#8B5CF6';

  const overlay = document.createElement('div');
  overlay.className = 'habit-detail-overlay';

  function renderContent() {
    const progress = timerRunning || remainingSeconds < totalSeconds
      ? remainingSeconds / totalSeconds
      : 1;
    const dashOffset = CIRCUMFERENCE * (1 - progress);

    overlay.innerHTML = `
      <div class="habit-detail-modal">
        <div class="habit-detail-handle"></div>

        <!-- Header -->
        <div class="habit-detail-header">
          <div class="habit-detail-header-left">
            <div class="habit-detail-icon" style="background:${hexToRgba(color, 0.2)}; box-shadow: 0 0 20px ${hexToRgba(color, 0.3)}">
              <span>${habit.icon || '⭐'}</span>
            </div>
            <div class="habit-detail-title-block">
              <h2 class="habit-detail-name">${habit.name}</h2>
              <p class="habit-detail-freq">Chaque jour, ${Math.round(totalSeconds / 60)} minute${Math.round(totalSeconds / 60) !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button class="habit-detail-close-btn" id="hd-close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Toolbar icons -->
        <div class="habit-detail-toolbar">
          <button class="habit-detail-tool-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button class="habit-detail-tool-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </button>
          <button class="habit-detail-tool-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </button>
          <button class="habit-detail-tool-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>

        <!-- Streak badge -->
        ${streak > 0 ? `
        <div class="habit-detail-streak" style="background:${hexToRgba(color, 0.15)}; border-color:${hexToRgba(color, 0.3)}">
          <span class="habit-detail-streak-fire">🔥</span>
          <span class="habit-detail-streak-num" style="color:${color}">${streak}</span>
          <span class="habit-detail-streak-label">jours</span>
        </div>
        ` : ''}

        <!-- Timer ring -->
        <div class="habit-detail-timer-container">
          <div class="habit-detail-timer-glow" style="background: radial-gradient(circle, ${hexToRgba(color, 0.15)} 0%, transparent 70%)"></div>
          <svg class="habit-detail-timer-svg" viewBox="0 0 240 240">
            <defs>
              <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${color}"/>
                <stop offset="100%" stop-color="${hexToRgba(color, 0.5)}"/>
              </linearGradient>
              <filter id="timer-glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Background ring -->
            <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(139,92,246,0.08)" stroke-width="8"/>
            <!-- Track ring -->
            <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(139,92,246,0.15)" stroke-width="8" stroke-dasharray="4 8" stroke-linecap="round"/>
            <!-- Progress ring -->
            <circle class="habit-detail-ring"
              cx="120" cy="120" r="108"
              fill="none"
              stroke="url(#timer-gradient)"
              stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="${CIRCUMFERENCE}"
              stroke-dashoffset="${dashOffset}"
              transform="rotate(-90 120 120)"
              filter="url(#timer-glow)"
            />
            <!-- End cap glow dot -->
            ${progress > 0.01 && progress < 1 ? `
            <circle cx="120" cy="12" r="6" fill="${color}" filter="url(#timer-glow)" transform="rotate(${360 * progress - 90} 120 120)" opacity="0.8"/>
            ` : ''}
          </svg>
          <div class="habit-detail-timer-display">
            <span class="habit-detail-timer-time">${formatTime(remainingSeconds)}</span>
            <span class="habit-detail-timer-label">${timerRunning ? 'En cours...' : remainingSeconds < totalSeconds ? 'En pause' : 'Prêt'}</span>
          </div>
        </div>

        <!-- Time adjust -->
        <div class="habit-detail-adjust">
          <button class="habit-detail-adjust-btn" id="hd-minus">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <div class="habit-detail-adjust-display">${Math.round(totalSeconds / 60)} min</div>
          <button class="habit-detail-adjust-btn" id="hd-plus">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <!-- Quick add -->
        <button class="habit-detail-quick-add" id="hd-add30" style="border-color:${hexToRgba(color, 0.3)}; color:${color}">
          +30 minutes
        </button>

        <!-- Start button -->
        <button class="habit-detail-start-btn" id="hd-start" style="background: linear-gradient(135deg, ${color}, ${hexToRgba(color, 0.7)}); box-shadow: 0 4px 24px ${hexToRgba(color, 0.4)}">
          ${timerRunning ? '⏸ Pause' : remainingSeconds < totalSeconds ? '▶ Reprendre' : '▶ Démarrer le timer'}
        </button>

        <!-- Bottom actions -->
        <div class="habit-detail-bottom-actions">
          <button class="habit-detail-bottom-btn" id="hd-skip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
            Passer
          </button>
          <button class="habit-detail-bottom-btn" id="hd-cancel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Annuler
          </button>
          <button class="habit-detail-bottom-btn" id="hd-reset">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            Réinitialiser
          </button>
        </div>
      </div>
    `;
  }

  function updateTimer() {
    const ring = overlay.querySelector('.habit-detail-ring');
    const timeDisplay = overlay.querySelector('.habit-detail-timer-time');
    const timeLabel = overlay.querySelector('.habit-detail-timer-label');
    const startBtn = overlay.querySelector('#hd-start');

    if (!ring || !timeDisplay) return;

    const progress = remainingSeconds / totalSeconds;
    const dashOffset = CIRCUMFERENCE * (1 - progress);
    ring.style.strokeDashoffset = dashOffset;
    ring.style.transition = 'stroke-dashoffset 1s linear';

    timeDisplay.textContent = formatTime(remainingSeconds);
    timeLabel.textContent = timerRunning ? 'En cours...' : remainingSeconds < totalSeconds ? 'En pause' : 'Prêt';
    startBtn.innerHTML = timerRunning ? '⏸ Pause' : remainingSeconds < totalSeconds ? '▶ Reprendre' : '▶ Démarrer le timer';

    // Update the glow dot
    const svgEl = overlay.querySelector('.habit-detail-timer-svg');
    const existingDot = svgEl.querySelector('.hd-end-dot');
    if (existingDot) existingDot.remove();
    if (progress > 0.01 && progress < 1) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('class', 'hd-end-dot');
      dot.setAttribute('cx', '120');
      dot.setAttribute('cy', '12');
      dot.setAttribute('r', '6');
      dot.setAttribute('fill', color);
      dot.setAttribute('filter', 'url(#timer-glow)');
      dot.setAttribute('transform', `rotate(${360 * progress - 90} 120 120)`);
      dot.setAttribute('opacity', '0.8');
      svgEl.appendChild(dot);
    }

    // Update adjust display
    const adjustDisplay = overlay.querySelector('.habit-detail-adjust-display');
    if (adjustDisplay) adjustDisplay.textContent = `${Math.round(totalSeconds / 60)} min`;

    // Update frequency subtitle
    const freqEl = overlay.querySelector('.habit-detail-freq');
    if (freqEl) freqEl.textContent = `Chaque jour, ${Math.round(totalSeconds / 60)} minute${Math.round(totalSeconds / 60) !== 1 ? 's' : ''}`;
  }

  function startTimer() {
    if (timerRunning) {
      // Pause
      timerRunning = false;
      clearInterval(intervalId);
      activeTimer = null;
      updateTimer();
      return;
    }

    timerRunning = true;
    updateTimer();

    intervalId = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        timerRunning = false;
        clearInterval(intervalId);
        activeTimer = null;
        updateTimer();
        // Pulse the ring to indicate completion
        const ring = overlay.querySelector('.habit-detail-ring');
        if (ring) {
          ring.style.stroke = 'var(--accent-green)';
          ring.style.filter = 'drop-shadow(0 0 12px rgba(6, 214, 160, 0.6))';
        }
        const timeLabel = overlay.querySelector('.habit-detail-timer-label');
        if (timeLabel) timeLabel.textContent = 'Terminé !';
        return;
      }
      updateTimer();
    }, 1000);

    activeTimer = intervalId;
  }

  function resetTimer() {
    timerRunning = false;
    clearInterval(intervalId);
    activeTimer = null;
    remainingSeconds = totalSeconds;
    updateTimer();
  }

  function adjustTime(delta) {
    if (timerRunning) return;
    const newTotal = Math.max(60, totalSeconds + delta);
    totalSeconds = newTotal;
    remainingSeconds = newTotal;
    updateTimer();
  }

  function close() {
    timerRunning = false;
    clearInterval(intervalId);
    activeTimer = null;
    overlay.classList.add('closing');
    const modal = overlay.querySelector('.habit-detail-modal');
    if (modal) modal.classList.add('closing');
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 250);
  }

  // Render initial content
  renderContent();

  // Attach event listeners
  function attachListeners() {
    on(overlay, 'click', (e) => {
      if (e.target === overlay) close();
    });

    const closeBtn = overlay.querySelector('#hd-close');
    if (closeBtn) on(closeBtn, 'click', close);

    const startBtn = overlay.querySelector('#hd-start');
    if (startBtn) on(startBtn, 'click', startTimer);

    const minusBtn = overlay.querySelector('#hd-minus');
    if (minusBtn) on(minusBtn, 'click', () => adjustTime(-60));

    const plusBtn = overlay.querySelector('#hd-plus');
    if (plusBtn) on(plusBtn, 'click', () => adjustTime(60));

    const add30Btn = overlay.querySelector('#hd-add30');
    if (add30Btn) on(add30Btn, 'click', () => adjustTime(1800));

    const resetBtn = overlay.querySelector('#hd-reset');
    if (resetBtn) on(resetBtn, 'click', resetTimer);

    const cancelBtn = overlay.querySelector('#hd-cancel');
    if (cancelBtn) on(cancelBtn, 'click', close);

    const skipBtn = overlay.querySelector('#hd-skip');
    if (skipBtn) on(skipBtn, 'click', close);

    // Swipe down to close
    let startY = 0;
    const modal = overlay.querySelector('.habit-detail-modal');
    if (modal) {
      on(modal, 'touchstart', (e) => {
        startY = e.touches[0].clientY;
      }, { passive: true });
      on(modal, 'touchmove', (e) => {
        const dy = e.touches[0].clientY - startY;
        if (dy > 0) {
          modal.style.transform = `translateY(${dy}px)`;
        }
      }, { passive: true });
      on(modal, 'touchend', (e) => {
        const dy = e.changedTouches[0].clientY - startY;
        if (dy > 120) {
          close();
        } else {
          modal.style.transform = '';
        }
      });
    }
  }

  attachListeners();
  document.body.appendChild(overlay);

  // Trigger entrance animation
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });

  return { close, overlay };
}
