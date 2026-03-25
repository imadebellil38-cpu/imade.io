import { html, $, on, escapeHtml } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { renderAvatar } from '../components/avatar.js';
import { computeLeaderboard } from '../services/scoring.js';
import { subscribeToCheckins, removeChannel } from '../services/realtime.js';

let channel = null;
let refreshTimeout = null;

export function destroy() {
  if (channel) {
    removeChannel(channel);
    channel = null;
  }
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
}

export async function render(container) {
  showNavbar();

  html(container, `
    <div class="page">
      <div class="leaderboard-header">
        <h2 class="leaderboard-title">🏆 Classement de l'Empire</h2>
      </div>
      <div id="podium-section"></div>
      <div id="ranking-section" class="ranking-list"></div>
      <div id="empire-stats-section"></div>
      <div class="text-center mt-md">
        <div class="loader" style="margin:0 auto" id="lb-loader"></div>
      </div>
    </div>
  `);

  await refreshLeaderboard(container);

  channel = subscribeToCheckins(() => {
    if (refreshTimeout) return;
    refreshTimeout = setTimeout(async () => {
      await refreshLeaderboard(container);
      refreshTimeout = null;
    }, 10000);
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
          <div class="podium-place" data-member="${e.member.id}" style="cursor:pointer">
            <div class="podium-avatar">${renderAvatar(e.member.avatar_emoji, 'md', '', e.member.id, e.member)}</div>
            <p class="podium-pseudo">${escapeHtml(e.member.pseudo)}</p>
            <p class="podium-points">${e.points} pts</p>
            <div class="podium-bar">${e.medal}</div>
          </div>
        `).join('')}
      </div>
    `;
    podiumSection.querySelectorAll('.podium-place[data-member]').forEach(el => {
      on(el, 'click', () => { location.hash = `#member/${el.dataset.member}`; });
    });
  }

  // Ranking list (all entries including top 3 if no podium members)
  const rankingSection = $('#ranking-section', container);
  if (rankingSection) {
    const listEntries = entries.length <= 3 ? [] : rest;
    rankingSection.innerHTML = listEntries.map((e, i) => `
      <div class="ranking-item ${e.member.id === memberId ? 'is-me' : ''}" data-member="${e.member.id}" style="animation-delay:${i * 50}ms;cursor:pointer">
        <span class="ranking-rank">${e.rank}</span>
        ${renderAvatar(e.member.avatar_emoji, 'sm', '', e.member.id, e.member)}
        <div class="ranking-info">
          <p class="ranking-pseudo">${escapeHtml(e.member.pseudo)}</p>
          <p class="ranking-badge">${e.tier.emoji} ${e.tier.name}</p>
        </div>
        <span class="ranking-points">${e.points}</span>
      </div>
    `).join('');
    rankingSection.querySelectorAll('.ranking-item[data-member]').forEach(el => {
      on(el, 'click', () => { location.hash = `#member/${el.dataset.member}`; });
    });
  }

  // Empire stats section
  const empireStats = $('#empire-stats-section', container);
  if (empireStats) {
    const totalMembers = entries.length;
    const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
    const me = entries.find(e => e.member.id === memberId);
    const myRank = me ? me.rank : '-';
    const myPoints = me ? me.points : 0;
    const myTier = me ? me.tier : { emoji: '🪖', name: 'Recrue' };

    empireStats.innerHTML = `
      <div class="empire-summary">
        <div class="empire-summary-title">📊 L'Empire en chiffres</div>
        <div class="empire-summary-grid">
          <div class="empire-summary-stat">
            <span class="empire-summary-val">${totalMembers}</span>
            <span class="empire-summary-lbl">Membres</span>
          </div>
          <div class="empire-summary-stat">
            <span class="empire-summary-val">${totalPoints}</span>
            <span class="empire-summary-lbl">Points totaux</span>
          </div>
        </div>

        ${me ? `
          <div class="empire-my-rank">
            <div class="empire-my-rank-left">
              <span style="font-size:1.5rem">${myTier.emoji}</span>
              <div>
                <p style="font-weight:700;font-size:0.95rem">${myTier.name}</p>
                <p style="font-size:0.78rem;color:var(--text-secondary)">#${myRank} · ${myPoints} pts</p>
              </div>
            </div>
            <div class="empire-my-rank-next">
              ${getNextRankMessage(myPoints)}
            </div>
          </div>
        ` : ''}

        <div class="empire-invite">
          <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:var(--space-sm)">
            Plus on est nombreux, plus c'est compétitif
          </p>
          <p style="font-size:0.78rem;color:var(--text-muted)">
            Partage EmpireTrack aux membres de l'Empire
          </p>
        </div>
      </div>
    `;
  }
}

function getNextRankMessage(points) {
  const tiers = [
    { name: 'Soldat', min: 100 },
    { name: 'Guerrier', min: 500 },
    { name: 'Général', min: 1000 },
    { name: 'Empereur', min: 5000 },
  ];
  for (const t of tiers) {
    if (points < t.min) {
      const remaining = t.min - points;
      return `<span style="font-size:0.75rem;color:var(--accent-primary)">${remaining} pts → ${t.name}</span>`;
    }
  }
  return `<span style="font-size:0.75rem;color:var(--accent-primary)">Rang max atteint 👑</span>`;
}
