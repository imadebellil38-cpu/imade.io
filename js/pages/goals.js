import { html, $, on, escapeHtml } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { getGoalsForMember, createGoal, updateGoal, deleteGoal } from '../services/goals.js';
import { today } from '../lib/dates.js';

export function destroy() {}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) return;

  html(container, `<div class="page goals-page"><div class="text-center mt-md"><div class="loader" style="margin:0 auto"></div></div></div>`);

  let goals = [];
  try {
    goals = await getGoalsForMember(memberId);
  } catch (err) {
    console.warn('Goals fetch error:', err);
  }

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  html(container, `
    <div class="page goals-page">
      <div class="goals-header">
        <button class="goals-back" id="goals-back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 class="goals-title">🎯 Mes Objectifs</h1>
        <button class="btn btn-primary btn-sm" id="new-goal-btn" style="box-shadow:0 2px 12px rgba(0,255,136,0.3)">+ Nouveau</button>
      </div>

      ${activeGoals.length === 0 && completedGoals.length === 0 ? `
        <div class="goals-empty">
          <div class="goals-empty-icon">🎯</div>
          <p class="goals-empty-text">Aucun objectif pour l'instant</p>
          <p class="goals-empty-sub">Pose ton premier objectif et commence à construire.</p>
        </div>
      ` : ''}

      <div id="goals-list">
        ${activeGoals.map(g => renderGoalCard(g)).join('')}
      </div>

      ${completedGoals.length > 0 ? `
        <div class="goals-completed-section">
          <button class="goals-completed-toggle" id="toggle-completed">
            ✅ Complétés (${completedGoals.length})
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="goals-completed-list hidden" id="completed-list">
            ${completedGoals.map(g => renderGoalCard(g, true)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `);

  // Back
  on($('#goals-back', container), 'click', () => history.back());

  // Toggle completed section
  const toggleBtn = $('#toggle-completed', container);
  if (toggleBtn) {
    on(toggleBtn, 'click', () => {
      const list = $('#completed-list', container);
      list.classList.toggle('hidden');
      toggleBtn.classList.toggle('open');
    });
  }

  // New goal
  on($('#new-goal-btn', container), 'click', () => showCreateGoalModal(memberId, container));

  // Milestone toggles
  container.querySelectorAll('.goal-milestone').forEach(ms => {
    on(ms, 'click', async () => {
      const goalId = ms.closest('.goal-card').dataset.goalId;
      const idx = parseInt(ms.dataset.idx);
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const milestones = [...(goal.milestones || [])];
      milestones[idx] = { ...milestones[idx], done: !milestones[idx].done };

      // Instant visual feedback
      ms.classList.toggle('done');
      const card = ms.closest('.goal-card');
      const doneCount = milestones.filter(m => m.done).length;
      const pct = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0;
      const bar = card.querySelector('.goal-bar-fill');
      const pctLabel = card.querySelector('.goal-pct');
      if (bar) bar.style.width = pct + '%';
      if (pctLabel) pctLabel.textContent = pct + '%';

      // Check if all done
      const allDone = milestones.every(m => m.done);
      const status = allDone ? 'completed' : 'active';

      try {
        await updateGoal(goalId, { milestones, status });
        goal.milestones = milestones;
        goal.status = status;
        if (allDone) {
          showToast('🎉 Objectif atteint ! Bravo frérot !');
          setTimeout(() => render(container), 1000);
        }
      } catch {
        ms.classList.toggle('done');
        showToast('Erreur', 'error');
      }
    });
  });

  // Delete goal
  container.querySelectorAll('.goal-delete-btn').forEach(btn => {
    on(btn, 'click', async (e) => {
      e.stopPropagation();
      const card = btn.closest('.goal-card');
      const goalId = card.dataset.goalId;
      if (confirm('Supprimer cet objectif ?')) {
        try {
          await deleteGoal(goalId);
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateX(-100%)';
          setTimeout(() => card.remove(), 300);
          showToast('Objectif supprimé');
        } catch {
          showToast('Erreur', 'error');
        }
      }
    });
  });
}

function renderGoalCard(goal, isCompleted = false) {
  const milestones = goal.milestones || [];
  const doneCount = milestones.filter(m => m.done).length;
  const pct = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0;

  // Time left
  const todayDate = new Date(today());
  const targetDate = new Date(goal.target_date);
  const daysLeft = Math.ceil((targetDate - todayDate) / (1000 * 60 * 60 * 24));
  let timeLabel = '';
  if (daysLeft < 0) timeLabel = 'Dépassé';
  else if (daysLeft === 0) timeLabel = "Aujourd'hui";
  else if (daysLeft === 1) timeLabel = 'Demain';
  else if (daysLeft < 30) timeLabel = `Dans ${daysLeft} jours`;
  else if (daysLeft < 365) timeLabel = `Dans ${Math.round(daysLeft / 30)} mois`;
  else timeLabel = `Dans ${Math.round(daysLeft / 365)} an(s)`;

  return `
    <div class="goal-card ${isCompleted ? 'completed' : ''}" data-goal-id="${goal.id}">
      <div class="goal-card-header">
        <span class="goal-icon">${goal.icon || '🎯'}</span>
        <div class="goal-info">
          <h3 class="goal-title">${escapeHtml(goal.title)}</h3>
          <span class="goal-time ${daysLeft < 7 && daysLeft >= 0 ? 'urgent' : ''}">${timeLabel}</span>
        </div>
        <div class="goal-right">
          <span class="goal-pct">${pct}%</span>
          <button class="goal-delete-btn">🗑️</button>
        </div>
      </div>
      <div class="goal-bar">
        <div class="goal-bar-fill" style="width:${pct}%"></div>
      </div>
      ${milestones.length > 0 ? `
        <div class="goal-milestones">
          ${milestones.map((m, i) => `
            <div class="goal-milestone ${m.done ? 'done' : ''}" data-idx="${i}">
              <div class="goal-ms-check">${m.done ? '✓' : ''}</div>
              <span class="goal-ms-text">${escapeHtml(m.title)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${goal.description ? `<p class="goal-desc">${escapeHtml(goal.description)}</p>` : ''}
    </div>
  `;
}

function showCreateGoalModal(memberId, container) {
  const emojis = ['🎯','💪','📖','🏋️','🏃','💰','🧠','🎓','✈️','🏠','💼','❤️','🔥','⭐','🚀','👑','🏆','💎','🌍','🎵'];
  let selectedEmoji = '🎯';
  let milestones = [];

  const formEl = document.createElement('div');
  formEl.innerHTML = `
    <div class="goal-create-form">
      <label class="label">Icône</label>
      <div class="emoji-picker-row" id="goal-emoji-picker">
        ${emojis.map(e => `
          <button class="emoji-pick-btn ${e === '🎯' ? 'active' : ''}" data-emoji="${e}">${e}</button>
        `).join('')}
      </div>

      <label class="label" style="margin-top:var(--space-md)">Objectif</label>
      <input class="input" id="goal-title-input" placeholder="Ex: Perdre 5kg, Lire 20 livres..." maxlength="100">

      <label class="label" style="margin-top:var(--space-md)">Description (optionnel)</label>
      <input class="input" id="goal-desc-input" placeholder="Pourquoi cet objectif ?" maxlength="200">

      <label class="label" style="margin-top:var(--space-md)">Échéance</label>
      <div class="goal-duration-options">
        <button class="freq-option goal-dur-btn" data-months="1"><span class="freq-option-emoji">📅</span><span class="freq-option-text">1 mois</span></button>
        <button class="freq-option goal-dur-btn active" data-months="3"><span class="freq-option-emoji">🗓️</span><span class="freq-option-text">3 mois</span></button>
        <button class="freq-option goal-dur-btn" data-months="6"><span class="freq-option-emoji">📆</span><span class="freq-option-text">6 mois</span></button>
        <button class="freq-option goal-dur-btn" data-months="12"><span class="freq-option-emoji">🎆</span><span class="freq-option-text">1 an</span></button>
      </div>

      <label class="label" style="margin-top:var(--space-md)">Étapes (sous-objectifs)</label>
      <div id="milestones-list" class="goal-ms-inputs"></div>
      <div class="goal-ms-add-row">
        <input class="input" id="ms-input" placeholder="Ex: Courir 5km sans s'arrêter" maxlength="100">
        <button class="btn btn-secondary btn-sm" id="ms-add-btn">+</button>
      </div>

      <button class="btn btn-primary" id="goal-create-btn" style="width:100%;margin-top:var(--space-lg)">Créer l'objectif</button>
    </div>
  `;

  const modal = showModal({ title: 'Nouvel objectif', content: formEl });
  let selectedMonths = 3;

  // Emoji picker
  formEl.querySelectorAll('.emoji-pick-btn').forEach(btn => {
    on(btn, 'click', (e) => {
      e.preventDefault();
      formEl.querySelectorAll('.emoji-pick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEmoji = btn.dataset.emoji;
    });
  });

  // Duration picker
  formEl.querySelectorAll('.goal-dur-btn').forEach(btn => {
    on(btn, 'click', (e) => {
      e.preventDefault();
      formEl.querySelectorAll('.goal-dur-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMonths = parseInt(btn.dataset.months);
    });
  });

  // Milestones
  const msListEl = formEl.querySelector('#milestones-list');
  function renderMilestones() {
    msListEl.innerHTML = milestones.map((m, i) => `
      <div class="goal-ms-item">
        <span class="goal-ms-item-text">${escapeHtml(m)}</span>
        <button class="goal-ms-remove" data-idx="${i}">✕</button>
      </div>
    `).join('');
    msListEl.querySelectorAll('.goal-ms-remove').forEach(btn => {
      on(btn, 'click', (e) => {
        e.preventDefault();
        milestones.splice(parseInt(btn.dataset.idx), 1);
        renderMilestones();
      });
    });
  }

  on($('#ms-add-btn', formEl), 'click', (e) => {
    e.preventDefault();
    const input = $('#ms-input', formEl);
    const val = input.value.trim();
    if (val && milestones.length < 10) {
      milestones.push(val);
      input.value = '';
      renderMilestones();
    }
  });

  // Enter key to add milestone
  on($('#ms-input', formEl), 'keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('#ms-add-btn', formEl).click();
    }
  });

  // Create
  on($('#goal-create-btn', formEl), 'click', async () => {
    const title = $('#goal-title-input', formEl).value.trim();
    if (!title) {
      showToast('Donne un titre à ton objectif', 'error');
      return;
    }

    const description = $('#goal-desc-input', formEl)?.value.trim() || '';
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + selectedMonths);
    const targetDateStr = targetDate.toLocaleDateString('en-CA');

    const goalData = {
      member_id: memberId,
      title,
      icon: selectedEmoji,
      description,
      target_date: targetDateStr,
      milestones: milestones.map(m => ({ title: m, done: false })),
      status: 'active',
    };

    try {
      await createGoal(goalData);
      modal.close();
      showToast(`${selectedEmoji} Objectif créé !`);
      render(container);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la création', 'error');
    }
  });
}
