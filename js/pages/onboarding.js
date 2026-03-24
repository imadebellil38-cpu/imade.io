import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { navigate } from '../router.js';
import { createMember, checkPseudoAvailable } from '../services/members.js';
import { createHabit } from '../services/habits.js';
import { AVATAR_EMOJIS } from '../data/emojis.js';
import { HABIT_COLORS } from '../config.js';
import { hideNavbar } from '../components/navbar.js';
import { initParticles } from '../components/particles.js';

let step = 1;
let pseudo = '';
let pseudoValid = false;
let selectedAvatar = '😀';
let createdHabits = [];
let debounceTimer = null;

export function destroy() {
  step = 1;
  pseudo = '';
  pseudoValid = false;
  selectedAvatar = '😀';
  createdHabits = [];
}

export async function render(container) {
  hideNavbar();
  step = 1;
  pseudo = '';
  pseudoValid = false;
  selectedAvatar = '😀';
  createdHabits = [];
  renderStep(container);
}

function renderStep(container) {
  if (step === 1) renderStep1(container);
  else if (step === 2) renderStep2(container);
  else if (step === 3) renderStep3(container);
}

function renderStepIndicator() {
  return `
    <div class="onboarding-step-indicator">
      <div class="step-dot ${step >= 1 ? 'active' : ''}"></div>
      <div class="step-dot ${step >= 2 ? 'active' : ''}"></div>
      <div class="step-dot ${step >= 3 ? 'active' : ''}"></div>
    </div>
  `;
}

function renderStep1(container) {
  html(container, `
    <div class="onboarding">
      <div class="onboarding-header">
        <h1 class="onboarding-logo">Empire</h1>
        <p class="onboarding-subtitle">Construis ton empire d'habitudes</p>
      </div>
      ${renderStepIndicator()}
      <div class="onboarding-step">
        <h2 class="onboarding-step-title">Choisis ton pseudo</h2>
        <div class="pseudo-input-wrapper">
          <input type="text" class="input" id="pseudo-input" placeholder="Ton pseudo..." maxlength="20" autocomplete="off">
          <span class="pseudo-status" id="pseudo-status"></span>
        </div>
        <p class="text-secondary mt-sm" id="pseudo-hint" style="font-size:0.8rem"></p>
      </div>
      <div class="onboarding-next">
        <button class="btn btn-primary btn-block" id="next-btn" disabled>Suivant</button>
      </div>
    </div>
  `);

  const input = $('#pseudo-input', container);
  const status = $('#pseudo-status', container);
  const hint = $('#pseudo-hint', container);
  const nextBtn = $('#next-btn', container);

  input.focus();

  on(input, 'input', () => {
    pseudo = input.value.trim();
    if (!pseudo || pseudo.length < 2) {
      status.textContent = '';
      hint.textContent = 'Minimum 2 caractères';
      pseudoValid = false;
      nextBtn.disabled = true;
      return;
    }
    status.textContent = '...';
    hint.textContent = '';
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const available = await checkPseudoAvailable(pseudo);
        if (input.value.trim() !== pseudo) return;
        pseudoValid = available;
        status.textContent = available ? '✅' : '❌';
        hint.textContent = available ? '' : 'Pseudo déjà pris';
        nextBtn.disabled = !available;
      } catch {
        status.textContent = '⚠️';
        hint.textContent = 'Erreur de connexion';
      }
    }, 400);
  });

  on(nextBtn, 'click', () => {
    if (pseudoValid) {
      step = 2;
      renderStep(container);
    }
  });
}

function renderStep2(container) {
  html(container, `
    <div class="onboarding">
      <div class="onboarding-header">
        <h1 class="onboarding-logo">Empire</h1>
      </div>
      ${renderStepIndicator()}
      <div class="onboarding-step">
        <h2 class="onboarding-step-title">Choisis ton avatar</h2>
        <div class="text-center mb-lg">
          <div class="avatar avatar-xl" id="preview-avatar" style="margin:0 auto">${selectedAvatar}</div>
        </div>
        <div class="emoji-grid">
          ${AVATAR_EMOJIS.map(e => `
            <div class="emoji-option ${e === selectedAvatar ? 'selected' : ''}" data-emoji="${e}">${e}</div>
          `).join('')}
        </div>
      </div>
      <div class="onboarding-next">
        <button class="btn btn-primary btn-block" id="next-btn">Suivant</button>
      </div>
    </div>
  `);

  on(container, 'click', (e) => {
    const opt = e.target.closest('.emoji-option');
    if (opt) {
      selectedAvatar = opt.dataset.emoji;
      $('#preview-avatar', container).textContent = selectedAvatar;
      container.querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
      opt.classList.add('selected');
    }
  });

  on($('#next-btn', container), 'click', () => {
    step = 3;
    renderStep(container);
  });
}

function renderStep3(container) {
  const habitIconEmojis = ['✅', '📚', '🏋️', '🧘', '💻', '🎨', '🏃', '💤', '🥗', '💧', '📝', '🎵'];

  html(container, `
    <div class="onboarding">
      <div class="onboarding-header">
        <h1 class="onboarding-logo">Empire</h1>
      </div>
      ${renderStepIndicator()}
      <div class="onboarding-step">
        <h2 class="onboarding-step-title">Crée tes habitudes (min. 3)</h2>
        <div class="habit-form">
          <div>
            <label class="label">Nom</label>
            <input type="text" class="input" id="habit-name" placeholder="Ex: Méditer 10 min" maxlength="40">
          </div>
          <div>
            <label class="label">Icône</label>
            <div class="emoji-grid" style="grid-template-columns:repeat(12,1fr);max-height:none" id="icon-grid">
              ${habitIconEmojis.map((e, i) => `<div class="emoji-option ${i === 0 ? 'selected' : ''}" data-icon="${e}" style="font-size:1.3rem;padding:4px">${e}</div>`).join('')}
            </div>
          </div>
          <div>
            <label class="label">Couleur</label>
            <div class="habit-colors" id="color-grid">
              ${HABIT_COLORS.map((c, i) => `<div class="color-swatch ${i === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c}"></div>`).join('')}
            </div>
          </div>
          <div>
            <label class="label">Fréquence</label>
            <div class="frequency-options">
              <div class="frequency-option selected" data-freq="daily">Tous les jours</div>
              <div class="frequency-option" data-freq="weekly_5">Lun-Ven</div>
              <div class="frequency-option" data-freq="weekly_3">3x/sem</div>
            </div>
          </div>
          <button class="btn btn-secondary btn-block" id="add-habit-btn">+ Ajouter</button>
        </div>
        <div class="created-habits" id="created-habits"></div>
      </div>
      <div class="onboarding-next">
        <button class="btn btn-primary btn-block" id="start-btn" disabled>Lancer Empire 🚀</button>
      </div>
    </div>
  `);

  let selectedIcon = '✅';
  let selectedColor = HABIT_COLORS[0];
  let selectedFreq = 'daily';

  on($('#icon-grid', container), 'click', (e) => {
    const opt = e.target.closest('.emoji-option');
    if (opt) {
      selectedIcon = opt.dataset.icon;
      $('#icon-grid', container).querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
      opt.classList.add('selected');
    }
  });

  on($('#color-grid', container), 'click', (e) => {
    const sw = e.target.closest('.color-swatch');
    if (sw) {
      selectedColor = sw.dataset.color;
      $('#color-grid', container).querySelectorAll('.color-swatch').forEach(el => el.classList.remove('selected'));
      sw.classList.add('selected');
    }
  });

  container.querySelectorAll('.frequency-option').forEach(opt => {
    on(opt, 'click', () => {
      selectedFreq = opt.dataset.freq;
      container.querySelectorAll('.frequency-option').forEach(el => el.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  function updateHabitList() {
    const list = $('#created-habits', container);
    list.innerHTML = createdHabits.map(h => `
      <div class="created-habit-item">
        <div class="created-habit-color" style="background:${h.color}"></div>
        <span>${h.icon}</span>
        <span>${h.name}</span>
        <span class="text-muted" style="margin-left:auto;font-size:0.75rem">${h.frequency === 'daily' ? 'Quotidien' : h.frequency === 'weekly_5' ? 'Lun-Ven' : '3x/sem'}</span>
      </div>
    `).join('');
    $('#start-btn', container).disabled = createdHabits.length < 3;
  }

  on($('#add-habit-btn', container), 'click', () => {
    const nameInput = $('#habit-name', container);
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.classList.add('input-error');
      setTimeout(() => nameInput.classList.remove('input-error'), 1000);
      return;
    }
    createdHabits.push({ name, icon: selectedIcon, color: selectedColor, frequency: selectedFreq });
    nameInput.value = '';
    updateHabitList();
  });

  on($('#start-btn', container), 'click', async () => {
    const btn = $('#start-btn', container);
    btn.disabled = true;
    btn.textContent = 'Création...';

    try {
      const member = await createMember({ pseudo, avatar_emoji: selectedAvatar });
      Store.setMemberId(member.id);
      Store.setPseudo(member.pseudo);
      Store.setAvatar(member.avatar_emoji);

      for (const h of createdHabits) {
        await createHabit({ member_id: member.id, ...h });
      }

      showWelcome(container, member.pseudo);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Lancer Empire 🚀';
      alert('Erreur: ' + (err.message || 'Réessaie'));
    }
  });
}

function showWelcome(container, name) {
  const welcome = document.createElement('div');
  welcome.className = 'welcome-screen';
  welcome.innerHTML = `
    <canvas id="particles-canvas" style="position:absolute;inset:0"></canvas>
    <p class="welcome-text">Bienvenue</p>
    <p class="welcome-pseudo">${name}</p>
  `;
  document.body.appendChild(welcome);

  const canvas = welcome.querySelector('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles(canvas);

  setTimeout(() => {
    welcome.style.opacity = '0';
    welcome.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      welcome.remove();
      navigate('#home');
    }, 500);
  }, 2500);
}
