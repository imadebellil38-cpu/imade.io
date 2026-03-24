import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { renderAvatar } from '../components/avatar.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { getActiveChallenges, getPastChallenges, createChallenge, joinChallenge } from '../services/challenges.js';
import { daysBetween, today } from '../lib/dates.js';
import { subscribeToChallenges, removeChannel } from '../services/realtime.js';

let channel = null;

export function destroy() {
  if (channel) {
    removeChannel(channel);
    channel = null;
  }
}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();

  html(container, `
    <div class="page">
      <div class="challenges-header">
        <h2>⚔️ Défis</h2>
        <button class="btn btn-primary btn-sm" id="create-challenge-btn">+ Créer</button>
      </div>
      <div class="tabs mb-lg">
        <div class="tab active" data-tab="active">Actifs</div>
        <div class="tab" data-tab="past">Passés</div>
      </div>
      <div id="challenges-content"></div>
    </div>
  `);

  let activeTab = 'active';

  async function loadChallenges() {
    const content = $('#challenges-content', container);
    const challenges = activeTab === 'active' ? await getActiveChallenges() : await getPastChallenges();

    if (!challenges.length) {
      content.innerHTML = `<div class="empty-state"><p class="empty-state-emoji">⚔️</p><p>Aucun défi ${activeTab === 'active' ? 'en cours' : 'passé'}</p></div>`;
      return;
    }

    content.innerHTML = challenges.map(ch => {
      const participants = ch.challenge_participants || [];
      const sorted = [...participants].sort((a, b) => (b.checkin_count || 0) - (a.checkin_count || 0));
      const daysLeft = daysBetween(today(), ch.end_date);
      const isJoined = participants.some(p => p.member_id === memberId);
      const isPast = activeTab === 'past';
      const winner = isPast && sorted.length > 0 ? sorted[0] : null;

      return `
        <div class="challenge-card ${isPast && winner ? 'challenge-winner' : ''}">
          <h3 class="challenge-title">${ch.title}</h3>
          ${ch.description ? `<p class="challenge-desc">${ch.description}</p>` : ''}
          <div class="challenge-meta">
            <span class="challenge-habit">🎯 ${ch.habit_name}</span>
            ${!isPast ? `<span class="challenge-countdown">${daysLeft > 0 ? daysLeft + 'j restants' : 'Dernier jour!'}</span>` : ''}
          </div>
          <div class="challenge-participants" style="display:flex;gap:0;margin-bottom:var(--space-md)">
            ${participants.slice(0, 6).map(p => renderAvatar(p.members?.avatar_emoji, 'sm', 'challenge-participant')).join('')}
            ${participants.length > 6 ? `<span class="text-muted" style="font-size:0.8rem;margin-left:8px">+${participants.length - 6}</span>` : ''}
          </div>
          ${sorted.length > 0 ? `
            <div class="challenge-ranking">
              ${sorted.slice(0, 5).map((p, i) => `
                <div class="challenge-rank-item">
                  <span class="challenge-rank-pos">${i + 1}</span>
                  <span>${p.members?.avatar_emoji || '😀'}</span>
                  <span>${p.members?.pseudo || '?'}</span>
                  <span class="challenge-rank-count">${p.checkin_count || 0}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${!isPast && !isJoined ? `<button class="btn btn-primary btn-sm btn-block mt-md join-challenge-btn" data-challenge-id="${ch.id}">Rejoindre</button>` : ''}
        </div>
      `;
    }).join('');

    // Join handlers
    content.querySelectorAll('.join-challenge-btn').forEach(btn => {
      on(btn, 'click', async () => {
        try {
          await joinChallenge(btn.dataset.challengeId, memberId);
          showToast('Défi rejoint!');
          loadChallenges();
        } catch {
          showToast('Erreur', 'error');
        }
      });
    });
  }

  // Tab switching
  container.querySelectorAll('.tab').forEach(tab => {
    on(tab, 'click', () => {
      container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      loadChallenges();
    });
  });

  // Create challenge
  on($('#create-challenge-btn', container), 'click', () => {
    const formEl = document.createElement('div');
    formEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:var(--space-md)">
        <div><label class="label">Titre</label><input class="input" id="ch-title" placeholder="Ex: 30 jours de sport"></div>
        <div><label class="label">Description</label><input class="input" id="ch-desc" placeholder="Description (optionnel)"></div>
        <div><label class="label">Habitude ciblée</label><input class="input" id="ch-habit" placeholder="Ex: Sport"></div>
        <div><label class="label">Date de fin</label><input class="input" id="ch-end" type="date"></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="ch-cancel">Annuler</button>
          <button class="btn btn-primary" id="ch-save">Créer</button>
        </div>
      </div>
    `;
    const modal = showModal({ title: 'Nouveau Défi', content: formEl });
    on($('#ch-cancel', formEl), 'click', () => modal.close());
    on($('#ch-save', formEl), 'click', async () => {
      const title = $('#ch-title', formEl).value.trim();
      const habitName = $('#ch-habit', formEl).value.trim();
      const endDate = $('#ch-end', formEl).value;
      if (!title || !habitName || !endDate) return showToast('Remplis tous les champs', 'error');
      try {
        const ch = await createChallenge({
          title,
          description: $('#ch-desc', formEl).value.trim() || null,
          created_by: memberId,
          start_date: today(),
          end_date: endDate,
          habit_name: habitName,
        });
        await joinChallenge(ch.id, memberId);
        modal.close();
        loadChallenges();
        showToast('Défi créé!');
      } catch (err) {
        showToast('Erreur', 'error');
      }
    });
  });

  await loadChallenges();

  channel = subscribeToChallenges(() => loadChallenges());
}
