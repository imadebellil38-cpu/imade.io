import { html, $, on, escapeHtml } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { getGoalsForMember, createGoal, updateGoal, deleteGoal } from '../services/goals.js';
import { today } from '../lib/dates.js';

const CIRCUMFERENCE = 2 * Math.PI * 34; // r=34

const GOAL_TEMPLATES = [
  { emoji: '🏋️', title: 'Prise de masse', milestones: ['Atteindre 70kg', 'Manger 2500 cal/jour pendant 1 mois', 'Augmenter le bench press de 10kg', 'Prendre 3kg de muscle'], months: 6, category: 'Sport' },
  { emoji: '📖', title: 'Lire 12 livres', milestones: ['Lire 3 livres', 'Lire 6 livres', 'Lire 9 livres', 'Lire 12 livres'], months: 12, category: 'Perso' },
  { emoji: '💰', title: 'Économiser 1000€', milestones: ['Économiser 250€', 'Économiser 500€', 'Économiser 750€', 'Économiser 1000€'], months: 6, category: 'Finance' },
  { emoji: '🏃', title: 'Courir un 10km', milestones: ['Courir 2km sans s\'arrêter', 'Courir 5km', 'Courir 7km', 'Courir 10km'], months: 3, category: 'Sport' },
  { emoji: '🧠', title: 'Apprendre une langue', milestones: ['100 mots de vocabulaire', 'Tenir une conversation basique', 'Regarder un film sans sous-titres', 'Avoir une conversation fluide'], months: 12, category: 'Études' },
  { emoji: '💪', title: 'Sèche / Perte de poids', milestones: ['Perdre 2kg', 'Perdre 4kg', 'Tenir un déficit calorique 30 jours', 'Atteindre l\'objectif final'], months: 3, category: 'Santé' },
];

const GOAL_CATEGORIES = [
  { name: 'Sport', emoji: '🏋️', color: '#00ff88' },
  { name: 'Finance', emoji: '💰', color: '#FBBF24' },
  { name: 'Études', emoji: '📚', color: '#38BDF8' },
  { name: 'Perso', emoji: '⭐', color: '#8B5CF6' },
  { name: 'Santé', emoji: '❤️', color: '#F472B6' },
];

function getCategoryColor(catName) {
  const cat = GOAL_CATEGORIES.find(c => c.name === catName);
  return cat ? cat.color : 'var(--text-muted)';
}

export function destroy() {}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) return;

  html(container, `<div class="page goals-page"><div class="text-center mt-md"><div class="loader" style="margin:0 auto"></div></div></div>`);

  let goals = [];
  try {
    goals = await Promise.race([
      getGoalsForMember(memberId),
      new Promise((_, r) => setTimeout(() => r(), 8000)),
    ]);
  } catch { goals = []; }
  if (!goals) goals = [];

  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  const todayStr = today();

  // Stats
  const totalRate = (active.length + completed.length) > 0 ? Math.round((completed.length / (active.length + completed.length)) * 100) : 0;
  let nextDeadline = null;
  for (const g of active) {
    const days = Math.ceil((new Date(g.target_date) - new Date(todayStr)) / 86400000);
    if (nextDeadline === null || days < nextDeadline) nextDeadline = days;
  }

  // SVG gradient defs
  const svgDefs = `<svg width="0" height="0" style="position:absolute"><defs>
    <linearGradient id="ringGreen" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00ff88"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient>
    <linearGradient id="ringWarn" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F472B6"/><stop offset="100%" stop-color="#FBBF24"/></linearGradient>
    <linearGradient id="ringUrgent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#EF4444"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  </defs></svg>`;

  html(container, `
    <div class="page goals-page">
      ${svgDefs}

      <!-- Stats -->
      <div class="goals-stats">
        <div class="goals-stat-card"><span class="goals-stat-val">${active.length}</span><span class="goals-stat-lbl">Actifs</span></div>
        <div class="goals-stat-card"><span class="goals-stat-val">${totalRate}%</span><span class="goals-stat-lbl">Réussite</span></div>
        <div class="goals-stat-card ${nextDeadline !== null && nextDeadline < 7 ? 'goals-stat-urgent' : ''}"><span class="goals-stat-val">${nextDeadline !== null ? nextDeadline + 'j' : '—'}</span><span class="goals-stat-lbl">Deadline</span></div>
      </div>

      <!-- Header -->
      <div class="goals-header">
        <div>
          <h1 class="goals-title">Objectifs</h1>
          <p class="goals-subtitle">Construis ta vision long terme</p>
        </div>
        <button class="btn btn-primary btn-sm" id="new-goal-btn" style="box-shadow:0 2px 12px rgba(0,255,136,0.3)">+ Nouveau</button>
      </div>

      ${active.length === 0 && completed.length === 0 ? `
        <div class="goals-empty">
          <div class="goals-empty-ring">
            <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-subtle)" stroke-width="3" stroke-dasharray="8 12"/></svg>
            <span class="goals-empty-icon">🎯</span>
          </div>
          <h3>Définis ta vision</h3>
          <p>Pose ton premier objectif et trace ta route.</p>
          <button class="btn btn-primary" id="new-goal-btn-empty">Créer un objectif</button>
          <p style="color:var(--text-muted);font-size:0.8rem;margin-top:var(--space-lg);margin-bottom:var(--space-sm)">Ou commence avec un modèle :</p>
          <div class="goal-templates-scroll">
            ${GOAL_TEMPLATES.map((t, i) => `
              <div class="goal-template-card" data-tpl-idx="${i}">
                <span class="goal-tpl-emoji">${t.emoji}</span>
                <span class="goal-tpl-title">${t.title}</span>
                <span class="goal-tpl-dur">${t.months} mois</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${(active.length > 0 || completed.length > 0) ? `
        <div class="goal-cat-pills">
          <button class="goal-cat-pill active" data-cat="all">Tout</button>
          ${GOAL_CATEGORIES.map(c => `<button class="goal-cat-pill" data-cat="${c.name}">${c.emoji} ${c.name}</button>`).join('')}
        </div>
      ` : ''}

      <div id="goals-active">
        ${active.map((g, i) => renderGoalCard(g, i)).join('')}
      </div>

      ${completed.length > 0 ? `
        <div class="goals-done-section">
          <button class="goals-done-toggle" id="toggle-done">🏆 Objectifs atteints (${completed.length}) <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>
          <div class="goals-done-list hidden" id="done-list">
            ${completed.map((g, i) => renderGoalCard(g, i, true)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `);

  // Wire events
  const newBtn = $('#new-goal-btn', container) || $('#new-goal-btn-empty', container);
  if (newBtn) on(newBtn, 'click', () => showCreateModal(memberId, container));
  const newBtn2 = $('#new-goal-btn-empty', container);
  if (newBtn2 && newBtn2 !== newBtn) on(newBtn2, 'click', () => showCreateModal(memberId, container));

  // Template clicks (empty state)
  container.querySelectorAll('.goal-template-card').forEach(card => {
    on(card, 'click', () => {
      const tpl = GOAL_TEMPLATES[parseInt(card.dataset.tplIdx)];
      if (tpl) showCreateModal(memberId, container, tpl);
    });
  });

  // Category filter
  container.querySelectorAll('.goal-cat-pill').forEach(pill => {
    on(pill, 'click', () => {
      container.querySelectorAll('.goal-cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.cat;
      container.querySelectorAll('#goals-active .goal-card').forEach(card => {
        const cardCat = card.dataset.category || '';
        card.style.display = (cat === 'all' || cardCat === cat) ? '' : 'none';
      });
    });
  });

  // Toggle done section
  const toggleBtn = $('#toggle-done', container);
  if (toggleBtn) on(toggleBtn, 'click', () => {
    $('#done-list', container)?.classList.toggle('hidden');
    toggleBtn.classList.toggle('open');
  });

  // Milestone clicks (delegation)
  container.addEventListener('click', async (e) => {
    const ms = e.target.closest('.goal-milestone');
    if (!ms) return;
    const card = ms.closest('.goal-card');
    const goalId = card?.dataset.goalId;
    const idx = parseInt(ms.dataset.idx);
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const milestones = [...(goal.milestones || [])];
    milestones[idx] = { ...milestones[idx], done: !milestones[idx].done };
    ms.classList.toggle('done');

    // Update ring
    const doneCount = milestones.filter(m => m.done).length;
    const pct = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0;
    const ring = card.querySelector('.goal-ring-fill');
    const pctEl = card.querySelector('.goal-ring-pct');
    if (ring) ring.style.strokeDashoffset = (CIRCUMFERENCE * (1 - pct / 100)).toFixed(1);
    if (pctEl) pctEl.textContent = pct + '%';

    const allDone = milestones.every(m => m.done);
    try {
      await updateGoal(goalId, { milestones, status: allDone ? 'completed' : 'active' });
      goal.milestones = milestones;
      if (allDone) {
        launchConfetti(container);
        showToast('🎉 Objectif atteint ! Bravo frérot !');
        setTimeout(() => render(container), 1500);
      }
    } catch {
      ms.classList.toggle('done');
      showToast('Erreur', 'error');
    }
  });

  // Edit clicks
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.goal-edit-btn');
    if (!btn) return;
    e.stopPropagation();
    const card = btn.closest('.goal-card');
    const goalId = card?.dataset.goalId;
    const goal = goals.find(g => g.id === goalId);
    if (goal) showEditModal(goal, memberId, container, goals);
  });

  // Delete clicks
  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.goal-delete-btn');
    if (!btn) return;
    e.stopPropagation();
    const card = btn.closest('.goal-card');
    const goalId = card?.dataset.goalId;
    if (confirm('Supprimer cet objectif ?')) {
      try {
        await deleteGoal(goalId);
        card.style.transition = 'all 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => card.remove(), 300);
        showToast('Objectif supprimé');
      } catch { showToast('Erreur', 'error'); }
    }
  });
}

function renderGoalCard(goal, index, isCompleted = false) {
  const milestones = goal.milestones || [];
  const doneCount = milestones.filter(m => m.done).length;
  const pct = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0;
  const offset = (CIRCUMFERENCE * (1 - pct / 100)).toFixed(1);

  // Time
  const now = new Date(today());
  const target = new Date(goal.target_date);
  const created = new Date(goal.created_at);
  const daysLeft = Math.ceil((target - now) / 86400000);
  const totalDays = Math.max(1, Math.ceil((target - created) / 86400000));
  const elapsed = Math.min(100, Math.max(0, Math.round(((now - created) / (target - created)) * 100)));

  let timeLabel = '', urgency = 'calm';
  if (daysLeft < 0) { timeLabel = 'Dépassé'; urgency = 'overdue'; }
  else if (daysLeft === 0) { timeLabel = "Aujourd'hui !"; urgency = 'urgent'; }
  else if (daysLeft <= 7) { timeLabel = `${daysLeft}j restants`; urgency = 'urgent'; }
  else if (daysLeft <= 30) { timeLabel = `${daysLeft}j restants`; urgency = 'warning'; }
  else if (daysLeft < 365) { timeLabel = `${Math.round(daysLeft / 30)} mois`; urgency = 'calm'; }
  else { timeLabel = `${Math.round(daysLeft / 365)} an(s)`; urgency = 'calm'; }

  const gradientId = urgency === 'urgent' || urgency === 'overdue' ? 'ringUrgent' : urgency === 'warning' ? 'ringWarn' : 'ringGreen';

  return `
    <div class="goal-card ${isCompleted ? 'goal-completed' : ''}" data-goal-id="${goal.id}" data-category="${goal.category || ''}" style="animation-delay:${index * 0.08}s">
      <div class="goal-card-top">
        <div class="goal-ring-wrap">
          <svg class="goal-ring" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-elevated)" stroke-width="5"/>
            <circle class="goal-ring-fill" cx="40" cy="40" r="34" fill="none" stroke="url(#${gradientId})" stroke-width="5" stroke-linecap="round" stroke-dasharray="${CIRCUMFERENCE.toFixed(1)}" stroke-dashoffset="${offset}"/>
          </svg>
          <span class="goal-ring-icon">${goal.icon || '🎯'}</span>
          <span class="goal-ring-pct">${pct}%</span>
        </div>
        <div class="goal-info">
          <h3 class="goal-card-title">${escapeHtml(goal.title)}</h3>
          ${goal.category ? `<span class="goal-cat-badge" style="--cat-color:${getCategoryColor(goal.category)}">${goal.category}</span>` : ''}
          ${goal.description ? `<p class="goal-card-desc">${escapeHtml(goal.description)}</p>` : ''}
          <span class="goal-time-badge ${urgency}">${timeLabel}</span>
        </div>
        <div class="goal-actions">
          <button class="goal-edit-btn">✏️</button>
          <button class="goal-delete-btn">🗑️</button>
        </div>
      </div>
      ${!isCompleted && milestones.length > 0 && doneCount > 0 ? `
        <p class="goal-prediction">📈 À ce rythme : objectif atteint dans ~${getPrediction(goal)} jours</p>
      ` : ''}
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
      <div class="goal-timeline">
        <div class="goal-timeline-fill" style="width:${elapsed}%"></div>
        <div class="goal-timeline-labels">
          <span>Créé</span>
          <span>${doneCount}/${milestones.length} étapes</span>
          <span>Deadline</span>
        </div>
      </div>
    </div>
  `;
}

function showCreateModal(memberId, container, template = null) {
  const emojis = ['🎯','💪','📖','🏋️','🏃','💰','🧠','🎓','✈️','🏠','💼','❤️','🔥','⭐','🚀','👑','🏆','💎','🌍','🎵'];
  let selectedEmoji = template ? template.emoji : '🎯';
  let currentStep = 0;
  let milestones = template ? [...template.milestones] : [];
  let selectedMonths = template ? template.months : 3;
  let selectedCategory = template ? (template.category || '') : '';

  const formEl = document.createElement('div');

  function renderStep() {
    const dots = [0,1,2].map(i => `<div class="step-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}"></div>`).join('');

    if (currentStep === 0) {
      formEl.innerHTML = `
        <div class="goal-step">
          <div class="step-dots">${dots}</div>
          <h3 class="step-title">Ton objectif</h3>
          <div class="emoji-picker-row goal-emoji-row">
            ${emojis.map(e => `<button class="emoji-pick-btn ${e === selectedEmoji ? 'active' : ''}" data-emoji="${e}">${e}</button>`).join('')}
          </div>
          <input class="input" id="goal-title" placeholder="Ex: Perdre 5kg, Lire 20 livres..." value="${template ? escapeHtml(template.title) : ''}" style="margin-top:var(--space-md)">
          <input class="input" id="goal-desc" placeholder="Pourquoi ? (optionnel)" value="" style="margin-top:var(--space-sm)">
          <label class="label" style="margin-top:var(--space-sm);font-size:0.75rem;color:var(--text-muted)">Catégorie</label>
          <div class="goal-cat-select">
            <button class="goal-cat-opt ${selectedCategory === '' ? 'active' : ''}" data-cat="">Aucune</button>
            ${GOAL_CATEGORIES.map(c => `<button class="goal-cat-opt ${selectedCategory === c.name ? 'active' : ''}" data-cat="${c.name}" style="--cat-color:${c.color}">${c.emoji} ${c.name}</button>`).join('')}
          </div>
          ${!template ? `
            <button class="btn btn-secondary btn-sm" id="show-templates-btn" style="width:100%;margin-top:var(--space-sm)">📋 Partir d'un modèle</button>
            <div class="goal-templates-scroll" id="modal-templates" style="display:none;margin-top:var(--space-sm)">
              ${GOAL_TEMPLATES.map((t, i) => `
                <div class="goal-template-card" data-tpl-idx="${i}">
                  <span class="goal-tpl-emoji">${t.emoji}</span>
                  <span class="goal-tpl-title">${t.title}</span>
                  <span class="goal-tpl-dur">${t.months} mois</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <button class="btn btn-primary" id="step-next" style="width:100%;margin-top:var(--space-lg)">Suivant →</button>
        </div>
      `;
      formEl.querySelectorAll('.emoji-pick-btn').forEach(b => b.addEventListener('click', (e) => {
        e.preventDefault();
        formEl.querySelectorAll('.emoji-pick-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        selectedEmoji = b.dataset.emoji;
      }));
      // Category selection
      formEl.querySelectorAll('.goal-cat-opt').forEach(b => b.addEventListener('click', (e) => {
        e.preventDefault();
        formEl.querySelectorAll('.goal-cat-opt').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        selectedCategory = b.dataset.cat;
      }));
      // Show templates toggle
      const showTplBtn = formEl.querySelector('#show-templates-btn');
      if (showTplBtn) {
        showTplBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const tplWrap = formEl.querySelector('#modal-templates');
          if (tplWrap) tplWrap.style.display = tplWrap.style.display === 'none' ? 'flex' : 'none';
        });
      }
      // Template selection inside modal
      formEl.querySelectorAll('#modal-templates .goal-template-card').forEach(card => {
        card.addEventListener('click', () => {
          const tpl = GOAL_TEMPLATES[parseInt(card.dataset.tplIdx)];
          if (tpl) {
            template = tpl;
            selectedEmoji = tpl.emoji;
            milestones = [...tpl.milestones];
            selectedMonths = tpl.months;
            selectedCategory = tpl.category || '';
            renderStep();
          }
        });
      });
      formEl.querySelector('#step-next').addEventListener('click', () => {
        const title = formEl.querySelector('#goal-title').value.trim();
        if (!title) { showToast('Donne un titre', 'error'); return; }
        formEl._title = title;
        formEl._desc = formEl.querySelector('#goal-desc').value.trim();
        currentStep = 1;
        renderStep();
      });
    } else if (currentStep === 1) {
      formEl.innerHTML = `
        <div class="goal-step">
          <div class="step-dots">${dots}</div>
          <h3 class="step-title">Échéance</h3>
          <div class="goal-dur-grid">
            <button class="goal-dur-btn ${selectedMonths === 1 ? 'active' : ''}" data-m="1">1 mois</button>
            <button class="goal-dur-btn ${selectedMonths === 3 ? 'active' : ''}" data-m="3">3 mois</button>
            <button class="goal-dur-btn ${selectedMonths === 6 ? 'active' : ''}" data-m="6">6 mois</button>
            <button class="goal-dur-btn ${selectedMonths === 12 ? 'active' : ''}" data-m="12">1 an</button>
          </div>
          <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-lg)">
            <button class="btn btn-secondary" id="step-prev" style="flex:1">← Retour</button>
            <button class="btn btn-primary" id="step-next" style="flex:1">Suivant →</button>
          </div>
        </div>
      `;
      formEl.querySelectorAll('.goal-dur-btn').forEach(b => b.addEventListener('click', (e) => {
        e.preventDefault();
        formEl.querySelectorAll('.goal-dur-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        selectedMonths = parseInt(b.dataset.m);
      }));
      formEl.querySelector('#step-prev').addEventListener('click', () => { currentStep = 0; renderStep(); });
      formEl.querySelector('#step-next').addEventListener('click', () => { currentStep = 2; renderStep(); });
    } else if (currentStep === 2) {
      formEl.innerHTML = `
        <div class="goal-step">
          <div class="step-dots">${dots}</div>
          <h3 class="step-title">Étapes pour y arriver</h3>
          <div id="ms-list" class="goal-ms-inputs">
            ${milestones.map((m, i) => `<div class="goal-ms-item"><span>${escapeHtml(m)}</span><button class="goal-ms-rm" data-i="${i}">✕</button></div>`).join('')}
          </div>
          <div style="display:flex;gap:var(--space-sm)">
            <input class="input" id="ms-input" placeholder="Ex: Courir 5km" style="flex:1">
            <button class="btn btn-secondary btn-sm" id="ms-add">+</button>
          </div>
          <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-lg)">
            <button class="btn btn-secondary" id="step-prev" style="flex:1">← Retour</button>
            <button class="btn btn-primary" id="step-create" style="flex:1">Créer 🚀</button>
          </div>
        </div>
      `;
      const addMs = () => {
        const v = formEl.querySelector('#ms-input').value.trim();
        if (v && milestones.length < 10) { milestones.push(v); formEl.querySelector('#ms-input').value = ''; renderStep(); }
      };
      formEl.querySelector('#ms-add').addEventListener('click', (e) => { e.preventDefault(); addMs(); });
      formEl.querySelector('#ms-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addMs(); } });
      formEl.querySelectorAll('.goal-ms-rm').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); milestones.splice(parseInt(b.dataset.i), 1); renderStep(); }));
      formEl.querySelector('#step-prev').addEventListener('click', () => { currentStep = 1; renderStep(); });
      formEl.querySelector('#step-create').addEventListener('click', async () => {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + selectedMonths);
        try {
          await createGoal({
            member_id: memberId,
            title: formEl._title,
            icon: selectedEmoji,
            description: formEl._desc || '',
            target_date: targetDate.toLocaleDateString('en-CA'),
            milestones: milestones.map(m => ({ title: m, done: false })),
            status: 'active',
            category: selectedCategory || null,
          });
          modal.close();
          showToast(`${selectedEmoji} Objectif créé !`);
          render(container);
        } catch { showToast('Erreur', 'error'); }
      });
    }
  }

  renderStep();
  const modal = showModal({ title: 'Nouvel objectif', content: formEl });
}

// Prediction: estimate days to complete based on current rate
function getPrediction(goal) {
  const ms = goal.milestones || [];
  if (ms.length === 0) return '?';
  const done = ms.filter(m => m.done).length;
  if (done === 0) return '?';
  const created = new Date(goal.created_at);
  const now = new Date();
  const daysElapsed = Math.max(1, Math.ceil((now - created) / 86400000));
  const rate = done / daysElapsed; // milestones per day
  const remaining = ms.length - done;
  const daysNeeded = Math.ceil(remaining / rate);
  return daysNeeded;
}

// Edit goal modal
function showEditModal(goal, memberId, container, goals) {
  const emojis = ['🎯','💪','📖','🏋️','🏃','💰','🧠','🎓','✈️','🏠','💼','❤️','🔥','⭐','🚀','👑','🏆','💎','🌍','🎵'];
  let selectedEmoji = goal.icon || '🎯';
  let milestones = (goal.milestones || []).map(m => m.title);

  const formEl = document.createElement('div');
  function renderEdit() {
    formEl.innerHTML = `
      <div class="goal-step">
        <div class="emoji-picker-row goal-emoji-row">
          ${emojis.map(e => `<button class="emoji-pick-btn ${e === selectedEmoji ? 'active' : ''}" data-emoji="${e}">${e}</button>`).join('')}
        </div>
        <input class="input" id="edit-goal-title" value="${escapeHtml(goal.title)}" style="margin-top:var(--space-md)">
        <input class="input" id="edit-goal-desc" value="${escapeHtml(goal.description || '')}" placeholder="Description (optionnel)" style="margin-top:var(--space-sm)">
        <label class="label" style="margin-top:var(--space-md)">Étapes</label>
        <div id="edit-ms-list" class="goal-ms-inputs">
          ${milestones.map((m, i) => `<div class="goal-ms-item"><span>${escapeHtml(m)}</span><button class="goal-ms-rm" data-i="${i}">✕</button></div>`).join('')}
        </div>
        <div style="display:flex;gap:var(--space-sm)">
          <input class="input" id="edit-ms-input" placeholder="Nouvelle étape" style="flex:1">
          <button class="btn btn-secondary btn-sm" id="edit-ms-add">+</button>
        </div>
        <button class="btn btn-primary" id="edit-goal-save" style="width:100%;margin-top:var(--space-lg)">Sauvegarder</button>
      </div>
    `;
    formEl.querySelectorAll('.emoji-pick-btn').forEach(b => b.addEventListener('click', (e) => {
      e.preventDefault();
      formEl.querySelectorAll('.emoji-pick-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      selectedEmoji = b.dataset.emoji;
    }));
    const addMs = () => {
      const v = formEl.querySelector('#edit-ms-input')?.value.trim();
      if (v && milestones.length < 15) { milestones.push(v); renderEdit(); }
    };
    formEl.querySelector('#edit-ms-add')?.addEventListener('click', (e) => { e.preventDefault(); addMs(); });
    formEl.querySelector('#edit-ms-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addMs(); } });
    formEl.querySelectorAll('.goal-ms-rm').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); milestones.splice(parseInt(b.dataset.i), 1); renderEdit(); }));
    formEl.querySelector('#edit-goal-save')?.addEventListener('click', async () => {
      const title = formEl.querySelector('#edit-goal-title').value.trim();
      if (!title) return;
      const description = formEl.querySelector('#edit-goal-desc').value.trim();
      // Preserve done state for existing milestones
      const oldMs = goal.milestones || [];
      const newMs = milestones.map(m => {
        const existing = oldMs.find(om => om.title === m);
        return existing ? { ...existing } : { title: m, done: false };
      });
      try {
        await updateGoal(goal.id, { title, description, icon: selectedEmoji, milestones: newMs });
        modal.close();
        showToast('Objectif modifié');
        render(container);
      } catch { showToast('Erreur', 'error'); }
    });
  }
  renderEdit();
  const modal = showModal({ title: 'Modifier l\'objectif', content: formEl });
}

// Confetti burst animation
function launchConfetti(container) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#00ff88','#8B5CF6','#FBBF24','#F472B6','#38BDF8','#EF4444','#FFD700'];
  const pieces = Array.from({ length: 80 }, () => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 16,
    vy: Math.random() * -14 - 4,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 10,
    life: 1,
  }));

  let frame = 0;
  function animate() {
    if (frame > 90) { canvas.remove(); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.rotation += p.vr;
      p.life -= 0.01;
      if (p.life <= 0) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    frame++;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
