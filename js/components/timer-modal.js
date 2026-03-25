import { on } from '../lib/dom.js';
import { hexToRgba } from '../lib/color.js';
import { checkin } from '../services/checkins.js';
import { today } from '../lib/dates.js';
import { showToast } from './toast.js';

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DEFAULT_MINUTES = 5;

/**
 * Show the timer bottom-sheet modal for a habit.
 * @param {{ habit: object, streak: number, memberId: string, onComplete: function }} opts
 */
export function showTimerModal({ habit, streak, memberId, onComplete }) {
  // State
  let totalSeconds = DEFAULT_MINUTES * 60;
  let remainingSeconds = totalSeconds;
  let timerInterval = null;
  let running = false;
  let completed = false;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.className = 'timer-overlay';

  const color = habit.color || '#00ff88';
  const colorLight = hexToRgba(color, 0.25);
  const colorMed = hexToRgba(color, 0.5);

  overlay.innerHTML = `
    <div class="timer-sheet">
      <div class="timer-handle"></div>

      <div class="timer-header">
        <div class="timer-habit-icon" style="background:${hexToRgba(color, 0.2)}; border: 1px solid ${hexToRgba(color, 0.3)}">
          <span>${habit.icon || '⚡'}</span>
        </div>
        <div class="timer-habit-meta">
          <p class="timer-habit-name">${habit.name}</p>
          <p class="timer-habit-freq">Chaque jour</p>
        </div>
        ${streak > 0 ? `<div class="timer-streak-badge" style="background:${hexToRgba(color, 0.15)}; color:${color}">🔥 ${streak}</div>` : ''}
      </div>

      <div class="timer-ring-wrap">
        <svg class="timer-ring-svg" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="timer-grad-${habit.id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${color}" />
              <stop offset="50%" stop-color="${hexToRgba(color, 0.8)}" />
              <stop offset="100%" stop-color="${color}" />
            </linearGradient>
          </defs>
          <!-- Background ring -->
          <circle
            cx="100" cy="100" r="${RADIUS}"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            stroke-width="8"
          />
          <!-- Progress ring -->
          <circle
            class="timer-ring-progress"
            cx="100" cy="100" r="${RADIUS}"
            fill="none"
            stroke="url(#timer-grad-${habit.id})"
            stroke-width="8"
            stroke-linecap="round"
            stroke-dasharray="${CIRCUMFERENCE}"
            stroke-dashoffset="0"
            transform="rotate(-90 100 100)"
            style="filter: drop-shadow(0 0 6px ${colorMed}); transition: stroke-dashoffset 1s linear;"
          />
        </svg>
        <div class="timer-time-display">
          <span class="timer-time-text">${formatTime(remainingSeconds)}</span>
        </div>
      </div>

      <div class="timer-adjust-row">
        <button class="timer-adjust-btn timer-minus" aria-label="Moins 1 minute">−</button>
        <button class="timer-adjust-pill">+5 min</button>
        <button class="timer-adjust-btn timer-plus" aria-label="Plus 1 minute">+</button>
      </div>

      <button class="timer-start-btn" style="background:${color}; box-shadow: 0 4px 20px ${colorMed}">
        Démarrer
      </button>

      <div class="timer-bottom-row">
        <button class="timer-bottom-btn timer-skip">Passer</button>
        <button class="timer-bottom-btn timer-reset">Réinitialiser</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Refs
  const sheet = overlay.querySelector('.timer-sheet');
  const progressRing = overlay.querySelector('.timer-ring-progress');
  const timeText = overlay.querySelector('.timer-time-text');
  const startBtn = overlay.querySelector('.timer-start-btn');
  const minusBtn = overlay.querySelector('.timer-minus');
  const plusBtn = overlay.querySelector('.timer-plus');
  const pillBtn = overlay.querySelector('.timer-adjust-pill');
  const skipBtn = overlay.querySelector('.timer-skip');
  const resetBtn = overlay.querySelector('.timer-reset');

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    sheet.classList.add('visible');
  });

  // --- Helpers ---

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function updateRing() {
    const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
    const offset = CIRCUMFERENCE * (1 - progress);
    progressRing.style.strokeDashoffset = offset;
  }

  function updateDisplay() {
    timeText.textContent = formatTime(remainingSeconds);
    updateRing();
  }

  function setTime(newTotal) {
    if (running || completed) return;
    totalSeconds = Math.max(60, Math.min(newTotal, 99 * 60));
    remainingSeconds = totalSeconds;
    updateDisplay();
  }

  function startTimer() {
    if (completed) return;
    running = true;
    startBtn.textContent = 'Pause';
    startBtn.style.background = hexToRgba(color, 0.3);
    startBtn.style.color = color;
    startBtn.style.boxShadow = 'none';

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateDisplay();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        running = false;
        completed = true;
        onTimerComplete();
      }
    }, 1000);
  }

  function pauseTimer() {
    running = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    startBtn.textContent = 'Reprendre';
    startBtn.style.background = color;
    startBtn.style.color = '#fff';
    startBtn.style.boxShadow = `0 4px 20px ${colorMed}`;
  }

  function resetTimer() {
    pauseTimer();
    completed = false;
    remainingSeconds = totalSeconds;
    startBtn.textContent = 'Démarrer';
    updateDisplay();
  }

  async function onTimerComplete() {
    // Visual feedback
    timeText.textContent = '✓';
    timeText.style.fontSize = '2.5rem';
    progressRing.style.stroke = color;
    progressRing.style.strokeDashoffset = '0';
    startBtn.textContent = 'Terminé !';
    startBtn.style.background = color;
    startBtn.style.color = '#fff';
    startBtn.style.boxShadow = `0 4px 20px ${colorMed}`;
    startBtn.disabled = true;

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // Auto-check the habit
    try {
      await checkin({ habit_id: habit.id, member_id: memberId, date: today() });
      showToast(`${habit.icon || '⚡'} ${habit.name} validé !`, 'success');
    } catch (err) {
      showToast('Erreur lors du check-in', 'error');
    }

    // Close after 2s
    setTimeout(() => {
      closeModal();
      if (onComplete) onComplete();
    }, 2000);
  }

  function closeModal() {
    // Cleanup interval
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    sheet.classList.remove('visible');
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 350);
  }

  // --- Event listeners ---

  on(startBtn, 'click', () => {
    if (completed) return;
    if (running) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  on(minusBtn, 'click', () => setTime(totalSeconds - 60));
  on(plusBtn, 'click', () => setTime(totalSeconds + 60));
  on(pillBtn, 'click', () => setTime(totalSeconds + 300));
  on(skipBtn, 'click', closeModal);
  on(resetBtn, 'click', resetTimer);

  // Close on overlay tap (not sheet)
  on(overlay, 'click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Swipe down to close
  let touchStartY = 0;
  let touchCurrentY = 0;
  let isDragging = false;

  on(sheet, 'touchstart', (e) => {
    const target = e.target;
    // Only start drag from handle or top area
    if (target.closest('.timer-handle') || target === sheet) {
      touchStartY = e.touches[0].clientY;
      isDragging = true;
    }
  });

  on(sheet, 'touchmove', (e) => {
    if (!isDragging) return;
    touchCurrentY = e.touches[0].clientY;
    const dy = touchCurrentY - touchStartY;
    if (dy > 0) {
      sheet.style.transform = `translateY(${dy}px)`;
      sheet.style.transition = 'none';
    }
  });

  on(sheet, 'touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const dy = touchCurrentY - touchStartY;
    sheet.style.transition = '';

    if (dy > 120) {
      closeModal();
    } else {
      sheet.style.transform = '';
    }
    touchStartY = 0;
    touchCurrentY = 0;
  });

  // Initial ring state (full)
  updateRing();
}
