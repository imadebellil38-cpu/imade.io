import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { renderAvatar } from '../components/avatar.js';
import { showToast } from '../components/toast.js';
import { getRecentCheckinsAll } from '../services/checkins.js';
import { addReaction } from '../services/reactions.js';
import { formatRelative } from '../lib/dates.js';
import { REACTION_EMOJIS } from '../config.js';
import { subscribeToCheckins, subscribeToReactions, removeChannel } from '../services/realtime.js';

let channels = [];

export function destroy() {
  channels.forEach(ch => removeChannel(ch));
  channels = [];
}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();

  html(container, `
    <div class="page">
      <div class="feed-header">
        <h2 class="feed-title">📢 Activité</h2>
      </div>
      <div id="feed-list" class="feed-list">
        <div class="text-center mt-md"><div class="loader" style="margin:0 auto"></div></div>
      </div>
    </div>
  `);

  await loadFeed(container, memberId);

  const ch1 = subscribeToCheckins(() => loadFeed(container, memberId));
  const ch2 = subscribeToReactions((payload) => {
    if (payload.new?.to_member_id === memberId) {
      showToast(`${payload.new.emoji} Nouvelle réaction!`);
    }
    loadFeed(container, memberId);
  });
  channels = [ch1, ch2];
}

async function loadFeed(container, memberId) {
  const feedList = $('#feed-list', container);
  if (!feedList) return;

  const checkins = await getRecentCheckinsAll(50);

  if (!checkins.length) {
    feedList.innerHTML = `<div class="empty-state"><p class="empty-state-emoji">📭</p><p>Aucune activité pour le moment</p></div>`;
    return;
  }

  feedList.innerHTML = checkins.map(c => `
    <div class="feed-item" data-checkin-id="${c.id}" data-member-id="${c.member_id}">
      ${renderAvatar(c.members?.avatar_emoji, 'sm')}
      <div class="feed-item-content">
        <p class="feed-item-text">
          <strong>${c.members?.pseudo || '?'}</strong> a complété
          <span style="color:${c.habits?.color || 'var(--accent-green)'}">${c.habits?.icon || '✅'} ${c.habits?.name || '?'}</span>
          ${c.note ? `<br><span class="text-muted" style="font-size:0.8rem">"${c.note}"</span>` : ''}
        </p>
        <p class="feed-item-time">${formatRelative(c.created_at)}</p>
        <div class="feed-item-reactions">
          <button class="feed-add-reaction" data-checkin-id="${c.id}" data-to-member="${c.member_id}">+</button>
        </div>
      </div>
    </div>
  `).join('');

  // Reaction picker
  feedList.querySelectorAll('.feed-add-reaction').forEach(btn => {
    on(btn, 'click', (e) => {
      e.stopPropagation();
      // Remove any existing picker
      const existing = document.querySelector('.reaction-picker');
      if (existing) existing.remove();

      const picker = document.createElement('div');
      picker.className = 'reaction-picker';
      picker.innerHTML = REACTION_EMOJIS.map(emoji =>
        `<span class="reaction-picker-emoji" data-emoji="${emoji}">${emoji}</span>`
      ).join('');

      document.body.appendChild(picker);

      on(picker, 'click', async (ev) => {
        const emojiEl = ev.target.closest('.reaction-picker-emoji');
        if (emojiEl) {
          try {
            await addReaction({
              from_member_id: memberId,
              to_member_id: btn.dataset.toMember,
              checkin_id: btn.dataset.checkinId,
              emoji: emojiEl.dataset.emoji,
            });
            showToast(`${emojiEl.dataset.emoji} Réaction envoyée!`);
          } catch {
            showToast('Erreur', 'error');
          }
          picker.remove();
        }
      });

      // Close on outside click
      setTimeout(() => {
        on(document, 'click', () => picker.remove(), { once: true });
      }, 10);
    });
  });
}
