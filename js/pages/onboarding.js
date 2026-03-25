import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { navigate } from '../router.js';
import { createMember, checkPseudoAvailable } from '../services/members.js';
import { createHabit } from '../services/habits.js';
import { AVATAR_EMOJIS } from '../data/emojis.js';
import { HABIT_PACKS, HABIT_CATEGORIES } from '../data/habits-catalog.js';
import { hideNavbar } from '../components/navbar.js';

let step = 1;
let pseudo = '';
let pseudoValid = false;
let selectedAvatar = '😀';
let selectedPack = null;
let selectedHabits = new Map(); // name -> habit object
let debounceTimer = null;

export function destroy() {
  step = 1;
  pseudo = '';
  pseudoValid = false;
  selectedAvatar = '😀';
  selectedPack = null;
  selectedHabits = new Map();
}

export async function render(container) {
  hideNavbar();
  destroy();
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

// Step 1: Pseudo + Avatar
function renderStep1(container) {
  html(container, `
    <div class="onboarding">
      <div class="onboarding-header">
        <span class="onboarding-logo-wrap"><h1 class="onboarding-logo" data-text="EmpireTrack">EmpireTrack</h1></span>
        <p class="onboarding-subtitle">Construis ton empire d'habitudes</p>
      </div>
      ${renderStepIndicator()}
      <div class="onboarding-step">
        <h2 class="onboarding-step-title">Ton profil</h2>
        <div class="text-center mb-lg">
          <div class="avatar avatar-xl" id="preview-avatar" style="margin:0 auto">${selectedAvatar}</div>
        </div>
        <div class="emoji-grid" id="emoji-grid" style="max-height:140px;margin-bottom:var(--space-lg)">
          ${AVATAR_EMOJIS.map(e => `
            <div class="emoji-option ${e === selectedAvatar ? 'selected' : ''}" data-emoji="${e}">${e}</div>
          `).join('')}
        </div>
        <div class="pseudo-input-wrapper">
          <input type="text" class="input" id="pseudo-input" placeholder="Choisis un pseudo..." maxlength="20" autocomplete="off" value="${pseudo}">
          <span class="pseudo-status" id="pseudo-status"></span>
        </div>
        <p class="text-secondary mt-xs" id="pseudo-hint" style="font-size:0.78rem"></p>
      </div>
      <div class="onboarding-next">
        <button class="btn btn-primary btn-block btn-lg" id="next-btn" ${pseudoValid ? '' : 'disabled'}>Suivant</button>
      </div>
    </div>
  `);

  const input = $('#pseudo-input', container);
  const status = $('#pseudo-status', container);
  const hint = $('#pseudo-hint', container);
  const nextBtn = $('#next-btn', container);

  input.focus();

  // Emoji selection
  on($('#emoji-grid', container), 'click', (e) => {
    const opt = e.target.closest('.emoji-option');
    if (opt) {
      selectedAvatar = opt.dataset.emoji;
      $('#preview-avatar', container).textContent = selectedAvatar;
      container.querySelectorAll('#emoji-grid .emoji-option').forEach(el => el.classList.remove('selected'));
      opt.classList.add('selected');
    }
  });

  // Pseudo validation
  on(input, 'input', () => {
    pseudo = input.value.trim();
    if (!pseudo || pseudo.length < 2) {
      status.textContent = '';
      hint.textContent = pseudo.length > 0 ? 'Minimum 2 caractères' : '';
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

// Step 2: Pack Selection
function renderStep2(container) {
  html(container, `
    <div class="onboarding">
      <div class="onboarding-header">
        <span class="onboarding-logo-wrap"><h1 class="onboarding-logo" data-text="EmpireTrack">EmpireTrack</h1></span>
      </div>
      ${renderStepIndicator()}
      <div class="onboarding-step">
        <h2 class="onboarding-step-title">Par quoi tu veux commencer ?</h2>
        <p class="text-secondary mb-lg" style="font-size:0.9rem">Choisis un thème, tu pourras tout modifier après</p>
        <div class="pack-grid" id="pack-grid">
          ${HABIT_PACKS.map(p => `
            <div class="pack-card ${selectedPack === p.id ? 'selected' : ''}" data-pack="${p.id}">
              <div class="pack-icon">${p.icon}</div>
              <div class="pack-name">${p.name}</div>
              <div class="pack-desc">${p.description}</div>
              <div class="pack-count">${p.habits.length} habitudes</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="onboarding-next">
        <button class="btn btn-primary btn-block btn-lg" id="next-btn" ${selectedPack ? '' : 'disabled'}>Personnaliser</button>
      </div>
    </div>
  `);

  on($('#pack-grid', container), 'click', (e) => {
    const card = e.target.closest('.pack-card');
    if (card) {
      selectedPack = card.dataset.pack;
      container.querySelectorAll('.pack-card').forEach(el => el.classList.remove('selected'));
      card.classList.add('selected');
      $('#next-btn', container).disabled = false;

      // Pre-select pack habits
      const pack = HABIT_PACKS.find(p => p.id === selectedPack);
      if (pack) {
        selectedHabits = new Map();
        for (const h of pack.habits) {
          selectedHabits.set(h.name, h);
        }
      }
    }
  });

  on($('#next-btn', container), 'click', () => {
    step = 3;
    renderStep(container);
  });
}

// Step 3: Customize Habits
function renderStep3(container) {
  html(container, `
    <div class="onboarding">
      <div class="onboarding-header">
        <span class="onboarding-logo-wrap"><h1 class="onboarding-logo" data-text="EmpireTrack">EmpireTrack</h1></span>
      </div>
      ${renderStepIndicator()}
      <div class="onboarding-step">
        <h2 class="onboarding-step-title">Tes habitudes</h2>
        <p class="text-secondary mb-md" style="font-size:0.85rem">
          <span class="text-gold" id="habit-count">${selectedHabits.size}</span> sélectionnées — coche ou décoche
        </p>
        <div id="categories-list" class="customize-section">
          ${(() => {
            // Only show habits from selected pack + already selected
            const packHabits = selectedPack ? HABIT_PACKS.find(p => p.id === selectedPack)?.habits || [] : [];
            const packNames = new Set(packHabits.map(h => h.name));
            // Show pack habits first
            return `
              <div class="customize-category">
                <div class="habit-select-grid">
                  ${packHabits.map(h => `
                    <div class="habit-select-item ${selectedHabits.has(h.name) ? 'selected' : ''}" data-habit-name="${h.name}" data-habit='${JSON.stringify(h)}'>
                      <span class="habit-select-icon">${h.icon}</span>
                      <span class="habit-select-name">${h.name}</span>
                      <div class="habit-select-check">${selectedHabits.has(h.name) ? '✓' : ''}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          })()}
        </div>
        <div class="custom-habit-add" id="show-more-habits">
          + Voir plus d'habitudes
        </div>
        <div id="more-habits" class="customize-section hidden">
          ${HABIT_CATEGORIES.map(cat => {
            const packHabitNames = selectedPack ? new Set((HABIT_PACKS.find(p => p.id === selectedPack)?.habits || []).map(h => h.name)) : new Set();
            const extraHabits = cat.habits.filter(h => !packHabitNames.has(h.name));
            if (extraHabits.length === 0) return '';
            return `
              <div class="customize-category">
                <div class="category-title">${cat.icon} ${cat.name}</div>
                <div class="habit-select-grid">
                  ${extraHabits.map(h => `
                    <div class="habit-select-item ${selectedHabits.has(h.name) ? 'selected' : ''}" data-habit-name="${h.name}" data-habit='${JSON.stringify(h)}'>
                      <span class="habit-select-icon">${h.icon}</span>
                      <span class="habit-select-name">${h.name}</span>
                      <div class="habit-select-check">${selectedHabits.has(h.name) ? '✓' : ''}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="custom-habit-add" id="add-custom">
          + Créer une habitude personnalisée
        </div>
        <div id="custom-form" class="hidden mt-md">
          <div class="flex gap-sm">
            <input type="text" class="input" id="custom-name" placeholder="Nom de l'habitude" maxlength="40" style="flex:1">
            <button class="btn btn-secondary btn-sm" id="custom-add-btn">OK</button>
          </div>
        </div>
      </div>
      <div class="onboarding-next">
        <button class="btn btn-primary btn-block btn-lg" id="start-btn" ${selectedHabits.size >= 1 ? '' : 'disabled'}>
          C'est parti ! 🚀
        </button>
      </div>
    </div>
  `);

  // Toggle habits
  on($('#categories-list', container), 'click', (e) => {
    const item = e.target.closest('.habit-select-item');
    if (!item) return;

    const name = item.dataset.habitName;
    if (selectedHabits.has(name)) {
      selectedHabits.delete(name);
      item.classList.remove('selected');
      item.querySelector('.habit-select-check').textContent = '';
    } else {
      const habit = JSON.parse(item.dataset.habit);
      selectedHabits.set(name, habit);
      item.classList.add('selected');
      item.querySelector('.habit-select-check').textContent = '✓';
    }
    updateCount(container);
  });

  // Show more habits toggle
  on($('#show-more-habits', container), 'click', () => {
    const more = $('#more-habits', container);
    const btn = $('#show-more-habits', container);
    more.classList.toggle('hidden');
    btn.textContent = more.classList.contains('hidden') ? '+ Voir plus d\'habitudes' : '− Masquer';
  });

  // Toggle habits in "more" section too
  on($('#more-habits', container), 'click', (e) => {
    const item = e.target.closest('.habit-select-item');
    if (!item) return;
    const name = item.dataset.habitName;
    if (selectedHabits.has(name)) {
      selectedHabits.delete(name);
      item.classList.remove('selected');
      item.querySelector('.habit-select-check').textContent = '';
    } else {
      const habit = JSON.parse(item.dataset.habit);
      selectedHabits.set(name, habit);
      item.classList.add('selected');
      item.querySelector('.habit-select-check').textContent = '✓';
    }
    updateCount(container);
  });

  // Custom habit
  on($('#add-custom', container), 'click', () => {
    $('#custom-form', container).classList.toggle('hidden');
    const input = $('#custom-name', container);
    if (input) input.focus();
  });

  on($('#custom-add-btn', container), 'click', () => {
    const input = $('#custom-name', container);
    const name = input.value.trim();
    if (!name) return;
    selectedHabits.set(name, { name, icon: '⭐', color: '#D4A853', frequency: 'daily' });
    input.value = '';
    $('#custom-form', container).classList.add('hidden');
    updateCount(container);
    // Show it was added
    const addBtn = $('#add-custom', container);
    const original = addBtn.textContent;
    addBtn.textContent = `✓ "${name}" ajoutée`;
    setTimeout(() => addBtn.textContent = original, 1500);
  });

  // Start
  on($('#start-btn', container), 'click', async () => {
    const btn = $('#start-btn', container);
    btn.disabled = true;
    btn.textContent = 'Création...';

    try {
      const member = await createMember({ pseudo, avatar_emoji: selectedAvatar });
      Store.setMemberId(member.id);
      Store.setPseudo(member.pseudo);
      Store.setAvatar(member.avatar_emoji);

      let sortOrder = 0;
      for (const [, h] of selectedHabits) {
        await createHabit({
          member_id: member.id,
          name: h.name,
          icon: h.icon,
          color: h.color,
          frequency: h.frequency || 'daily',
          sort_order: sortOrder++,
        });
      }

      showWelcome(container, member.pseudo, member.avatar_emoji);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'C\'est parti ! 🚀';
    }
  });
}

function updateCount(container) {
  const countEl = $('#habit-count', container);
  if (countEl) countEl.textContent = selectedHabits.size;
  const startBtn = $('#start-btn', container);
  if (startBtn) startBtn.disabled = selectedHabits.size < 1;
}

function showWelcome(container, name, avatar) {
  const welcome = document.createElement('div');
  welcome.className = 'welcome-screen';
  welcome.innerHTML = `
    <div class="welcome-avatar">${avatar}</div>
    <p class="welcome-text">Bienvenue</p>
    <p class="welcome-pseudo">${name}</p>
  `;
  document.body.appendChild(welcome);

  setTimeout(() => {
    welcome.style.opacity = '0';
    welcome.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      welcome.remove();
      navigate('#home');
    }, 500);
  }, 2500);
}
