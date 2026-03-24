import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { renderAvatar } from '../components/avatar.js';
import { computeLeaderboard } from '../services/scoring.js';
import { subscribeToCheckins, removeChannel } from '../services/realtime.js';
import { navigate } from '../router.js';

let channel = null;

export function destroy() {
  if (channel) {
    removeChannel(channel);
    channel = null;
  }
}

export async function render(container) {
  showNavbar();

  html(container, `
    <div class="page">
      <div class="leaderboard-header">
        <h2 class="leaderboard-title">🏆 Classement</h2>
      </div>
      <div id="podium-section"></div>
      <div id="ranking-section" class="ranking-list"></div>
      <div class="text-center mt-md">
        <div class="loader" style="margin:0 auto" id="lb-loader"></div>
      </div>
    </div>
  `);

  await refreshLeaderboard(container);

  channel = subscribeToCheckins(async () => {
    await refreshLeaderboard(container);
  });
}

async function refreshLeaderboard(container) {
  const entries = await computeLeaderboard();
  const memberId = Store.getMemberId();
  const loader = $('#lb-loader', container);
  if (loader) loader.remove();

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Podium: render in order [2nd, 1st, 3rd]
  const podiumSection = $('#podium-section', container);
  if (podiumSection && top3.length >= 1) {
    const ordered = [];
    if (top3[1]) ordered.push({ ...top3[1], medal: '🥈' });
    if (top3[0]) ordered.push({ ...top3[0], medal: '🥇' });
    if (top3[2]) ordered.push({ ...top3[2], medal: '🥉' });

    podiumSection.innerHTML = `
      <div class="podium">
        ${ordered.map(e => `
          <div class="podium-place" data-member-id="${e.member.id}">
            <div class="podium-avatar">${renderAvatar(e.member.avatar_emoji, 'md')}</div>
            <p class="podium-pseudo">${e.member.pseudo}</p>
            <p class="podium-points">${e.points} pts</p>
            <div class="podium-bar">${e.medal}</div>
          </div>
        `).join('')}
      </div>
    `;

    podiumSection.querySelectorAll('.podium-place').forEach(el => {
      on(el, 'click', () => navigate(`#profile/${el.dataset.memberId}`));
    });
  }

  // Ranking list
  const rankingSection = $('#ranking-section', container);
  if (rankingSection) {
    rankingSection.innerHTML = rest.map(e => `
      <div class="ranking-item ${e.member.id === memberId ? 'is-me' : ''}" data-member-id="${e.member.id}">
        <span class="ranking-rank">${e.rank}</span>
        ${renderAvatar(e.member.avatar_emoji, 'sm')}
        <div class="ranking-info">
          <p class="ranking-pseudo">${e.member.pseudo}</p>
          <p class="ranking-badge">${e.tier.emoji} ${e.tier.name}</p>
        </div>
        <span class="ranking-points">${e.points}</span>
      </div>
    `).join('');

    rankingSection.querySelectorAll('.ranking-item').forEach(el => {
      on(el, 'click', () => navigate(`#profile/${el.dataset.memberId}`));
    });
  }
}
