import { Store } from './lib/store.js';
import { getMember } from './services/members.js';
import { onRoute, start, navigate } from './router.js';
import { renderNavbar } from './components/navbar.js';

import * as onboardingPage from './pages/onboarding.js';
import * as homePage from './pages/home.js';
import * as leaderboardPage from './pages/leaderboard.js';
import * as myProfilePage from './pages/my-profile.js';
import * as achievementsPage from './pages/achievements.js';
import * as statisticsPage from './pages/statistics.js';
import * as trackerPage from './pages/tracker.js';

// Migration: fix habits created without is_active field
function migrateHabits() {
  const key = 'empire_db_habits';
  try {
    const habits = JSON.parse(localStorage.getItem(key)) || [];
    let changed = false;
    for (const h of habits) {
      if (h.is_active === undefined) {
        h.is_active = true;
        changed = true;
      }
    }
    if (changed) localStorage.setItem(key, JSON.stringify(habits));
  } catch {}
}

async function init() {
  // Apply saved theme
  const savedTheme = Store.getTheme();
  document.documentElement.dataset.theme = savedTheme;
  // Update meta theme-color for browser chrome
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = savedTheme === 'light' ? '#f5f5f0' : '#050510';
  }

  migrateHabits();

  // Register routes
  onRoute('onboarding', onboardingPage);
  onRoute('home', homePage);
  onRoute('leaderboard', leaderboardPage);
  onRoute('me', myProfilePage);
  onRoute('achievements', achievementsPage);
  onRoute('statistics', statisticsPage);
  onRoute('tracker', trackerPage);

  // Render navbar
  renderNavbar();

  // Check auth
  const memberId = Store.getMemberId();
  if (!memberId) {
    navigate('#onboarding');
  } else {
    const member = await getMember(memberId);
    if (!member) {
      Store.clear();
      navigate('#onboarding');
    } else {
      if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#onboarding') {
        navigate('#home');
      }
    }
  }

  // Start router
  start();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
