import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { renderAvatar } from '../components/avatar.js';
import { renderHeatmap } from '../components/heatmap.js';
import { getMember } from '../services/members.js';
import { getHabitsForMember } from '../services/habits.js';
import { getCheckinsForRange } from '../services/checkins.js';
import { computeStreaks, computePoints, resolveBadges, computeLeaderboard } from '../services/scoring.js';
import { today, daysAgo } from '../lib/dates.js';

export function destroy() {}

export async function render(container, { id }) {
  showNavbar();

  html(container, `
    <div class="page">
      <div class="text-center mt-md"><div class="loader" style="margin:0 auto"></div></div>
    </div>
  `);

  const member = await getMember(id);
  if (!member) {
    html(container, `<div class="page"><div class="empty-state"><p class="empty-state-emoji">🤷</p><p>Membre introuvable</p></div></div>`);
    return;
  }

  const [habits, checkins90, streaks, points] = await Promise.all([
    getHabitsForMember(id),
    getCheckinsForRange(id, daysAgo(89), today()),
    computeStreaks(id),
    computePoints(id),
  ]);

  // Get leaderboard rank
  const leaderboard = await computeLeaderboard();
  const myEntry = leaderboard.find(e => e.member.id === id);
  const rank = myEntry?.rank || '-';
  const badges = await resolveBadges(id, myEntry?.rank);

  // Completion rate (last 30 days)
  const checkins30 = checkins90.filter(c => c.date >= daysAgo(29));
  const completionRate = habits.length > 0 ? Math.round((checkins30.length / (habits.length * 30)) * 100) : 0;

  let maxStreak = 0;
  for (const s of Object.values(streaks)) {
    maxStreak = Math.max(maxStreak, s.maxStreak);
  }

  html(container, `
    <div class="page">
      <div class="profile-header">
        ${renderAvatar(member.avatar_emoji, 'xl', 'profile-avatar')}
        <h2 class="profile-pseudo">${member.pseudo}</h2>
        ${member.bio ? `<p class="profile-bio">${member.bio}</p>` : ''}
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <p class="profile-stat-value">${points.total}</p>
          <p class="profile-stat-label">Points</p>
        </div>
        <div class="profile-stat">
          <p class="profile-stat-value">${maxStreak}</p>
          <p class="profile-stat-label">Max Streak</p>
        </div>
        <div class="profile-stat">
          <p class="profile-stat-value">${completionRate}%</p>
          <p class="profile-stat-label">30j</p>
        </div>
      </div>

      <div class="profile-section">
        <h3 class="profile-section-title">Habitudes</h3>
        ${habits.map(h => {
          const streak = streaks[h.id]?.currentStreak || 0;
          return `
            <div class="profile-habit">
              <div class="profile-habit-dot" style="background:${h.color}"></div>
              <span>${h.icon}</span>
              <span class="profile-habit-name">${h.name}</span>
              ${streak > 0 ? `<span class="profile-habit-streak">🔥 ${streak}j</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div id="heatmap-container"></div>

      <div class="profile-section">
        <h3 class="profile-section-title">Badges</h3>
        <div class="badges-grid">
          ${badges.map(b => `
            <div class="badge-item ${b.earned ? 'earned' : 'locked'}">
              <p class="badge-emoji">${b.emoji}</p>
              <p class="badge-name">${b.name}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `);

  const heatmapContainer = $('#heatmap-container', container);
  renderHeatmap(heatmapContainer, checkins90, habits, { mode: 'full', days: 90 });
}
