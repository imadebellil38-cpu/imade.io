import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { computeStreaks, computePoints, resolveBadges, computeLeaderboard } from '../services/scoring.js';
import { getCheckinsForRange } from '../services/checkins.js';
import { getHabitsForMember } from '../services/habits.js';
import { today, daysAgo, isDueOnDate } from '../lib/dates.js';
import { navigate } from '../router.js';

export function destroy() {}

// SVG icons for badge types
const FIRE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M12 23c-4.97 0-9-3.58-9-8 0-3.07 2.13-5.59 3.42-6.84.48-.46 1.28-.1 1.22.55-.12 1.35.22 2.82 1.36 3.79.08.07.2.02.2-.08 0-2.42.62-5.22 3.3-7.42.36-.3.92-.07.92.4 0 2.21 1.09 3.83 2.33 5.23.72.82 1.51 1.52 2.09 2.37C18.72 14.62 19 16.1 19 17.5c0 3.22-3.13 5.5-7 5.5z"/></svg>`;

const FLAG_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2"/></svg>`;

const STAR_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

const TROPHY_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7m12 2h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22m7-7.34V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`;

// Streak milestone definitions
const STREAK_MILESTONES = [
  { days: 2,   label: '2 Jours',   description: 'Streak de 2 jours' },
  { days: 5,   label: '5 Jours',   description: 'Streak de 5 jours' },
  { days: 7,   label: '1 Semaine', description: 'Streak de 7 jours' },
  { days: 14,  label: '2 Semaines', description: 'Streak de 14 jours' },
  { days: 30,  label: '1 Mois',    description: 'Streak de 30 jours' },
  { days: 60,  label: '2 Mois',    description: 'Streak de 60 jours' },
  { days: 90,  label: '3 Mois',    description: 'Streak de 90 jours' },
  { days: 180, label: '6 Mois',    description: 'Streak de 180 jours' },
  { days: 365, label: '1 An',      description: 'Streak de 365 jours' },
];

// Goal milestone definitions
const GOAL_MILESTONES = [
  { percent: 100, label: '100%', description: 'Journée parfaite (100%)' },
  { percent: 200, label: '200%', description: 'Double objectif (200 checkins)' },
  { percent: 300, label: '300%', description: 'Triple objectif (300 checkins)' },
];

// Special badges
const SPECIAL_BADGES = [
  { id: 'first_check', label: 'Premier Pas', description: 'Premier check-in', icon: STAR_SVG, condition: (s) => s.totalCheckins >= 1 },
  { id: 'perfect_10', label: '10 Parfaits', description: '10 journées parfaites', icon: TROPHY_SVG, condition: (s) => s.perfectDays >= 10 },
  { id: 'centurion', label: 'Centurion', description: '100 check-ins', icon: STAR_SVG, condition: (s) => s.totalCheckins >= 100 },
  { id: 'champion', label: 'Champion', description: '500 points', icon: TROPHY_SVG, condition: (s) => s.total >= 500 },
  { id: 'legend', label: 'Légende', description: '1000 points', icon: TROPHY_SVG, condition: (s) => s.total >= 1000 },
  { id: 'emperor', label: 'Empereur', description: '#1 au classement', icon: TROPHY_SVG, condition: (s) => s.leaderboardRank === 1 },
];

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) { navigate('#onboarding'); return; }

  html(container, `<div class="page"><div class="text-center mt-md"><div class="loader" style="margin:0 auto"></div></div></div>`);

  const [streaks, points, habits, checkins30, leaderboard] = await Promise.all([
    computeStreaks(memberId),
    computePoints(memberId),
    getHabitsForMember(memberId),
    getCheckinsForRange(memberId, daysAgo(29), today()),
    computeLeaderboard().catch(() => []),
  ]);

  // Compute max streak across all habits
  let maxStreak = 0;
  for (const s of Object.values(streaks)) {
    maxStreak = Math.max(maxStreak, s.maxStreak);
  }

  // Compute completion rate for goal badges
  const totalCheckins = points.totalCheckins;

  // Compute actual leaderboard rank for the current user
  const userEntry = leaderboard.find(e => e.member.id === memberId);
  const leaderboardRank = userEntry ? userEntry.rank : 999;

  // Stats object for special badges
  const stats = { ...points, leaderboardRank };

  // Count earned badges
  const streakEarned = STREAK_MILESTONES.filter(m => maxStreak >= m.days).length;
  const goalEarned = GOAL_MILESTONES.filter(m => totalCheckins >= m.percent).length;
  const specialEarned = SPECIAL_BADGES.filter(b => b.condition(stats)).length;
  const totalEarned = streakEarned + goalEarned + specialEarned;
  const totalBadges = STREAK_MILESTONES.length + GOAL_MILESTONES.length + SPECIAL_BADGES.length;

  html(container, `
    <div class="page achievements-page">
      <div class="achievements-header">
        <button class="achievements-back" id="ach-back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 class="achievements-title">Achievements</h1>
        <div class="achievements-count">
          <span class="achievements-count-num">${totalEarned}</span>
          <span class="achievements-count-sep">/</span>
          <span class="achievements-count-total">${totalBadges}</span>
        </div>
      </div>

      <div class="achievements-progress-bar">
        <div class="achievements-progress-fill" style="width: ${Math.round((totalEarned / totalBadges) * 100)}%"></div>
      </div>

      <div class="achievements-section">
        <div class="achievements-section-header">
          <span class="achievements-section-icon">${FIRE_SVG}</span>
          <h2 class="achievements-section-title">Longest Streak</h2>
          <span class="achievements-section-count">${streakEarned}/${STREAK_MILESTONES.length}</span>
        </div>
        <div class="achievements-grid">
          ${STREAK_MILESTONES.map(m => {
            const earned = maxStreak >= m.days;
            return renderBadge(earned, FIRE_SVG, m.label, m.description, 'streak');
          }).join('')}
        </div>
      </div>

      <div class="achievements-section">
        <div class="achievements-section-header">
          <span class="achievements-section-icon">${FLAG_SVG}</span>
          <h2 class="achievements-section-title">Goals</h2>
          <span class="achievements-section-count">${goalEarned}/${GOAL_MILESTONES.length}</span>
        </div>
        <div class="achievements-grid">
          ${GOAL_MILESTONES.map(m => {
            const earned = totalCheckins >= m.percent;
            return renderBadge(earned, FLAG_SVG, m.label, m.description, 'goal');
          }).join('')}
        </div>
      </div>

      <div class="achievements-section">
        <div class="achievements-section-header">
          <span class="achievements-section-icon">${TROPHY_SVG}</span>
          <h2 class="achievements-section-title">Special</h2>
          <span class="achievements-section-count">${specialEarned}/${SPECIAL_BADGES.length}</span>
        </div>
        <div class="achievements-grid">
          ${SPECIAL_BADGES.map(b => {
            const earned = b.condition(stats);
            return renderBadge(earned, b.icon, b.label, b.description, 'special');
          }).join('')}
        </div>
      </div>
    </div>
  `);

  // Back button
  on($('#ach-back', container), 'click', () => navigate('#me'));

  // Animate badges in with stagger
  const badges = container.querySelectorAll('.ach-badge');
  badges.forEach((badge, i) => {
    badge.style.animationDelay = `${i * 60}ms`;
  });
}

function renderBadge(earned, iconSvg, label, description, type) {
  const earnedClass = earned ? 'earned' : 'locked';
  const typeClass = `ach-badge--${type}`;
  return `
    <div class="ach-badge ${earnedClass} ${typeClass}" title="${description}">
      <div class="ach-badge-hexagon">
        <div class="ach-badge-glow"></div>
        <div class="ach-badge-icon">${iconSvg}</div>
      </div>
      <p class="ach-badge-label">${label}</p>
    </div>
  `;
}
