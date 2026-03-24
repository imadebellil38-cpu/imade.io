import { Store } from './lib/store.js';
import { getMember } from './services/members.js';
import { onRoute, start, navigate } from './router.js';
import { renderNavbar } from './components/navbar.js';

import * as onboardingPage from './pages/onboarding.js';
import * as homePage from './pages/home.js';
import * as leaderboardPage from './pages/leaderboard.js';
import * as memberProfilePage from './pages/member-profile.js';
import * as myProfilePage from './pages/my-profile.js';
import * as challengesPage from './pages/challenges.js';
import * as feedPage from './pages/feed.js';

async function init() {
  // Register routes
  onRoute('onboarding', onboardingPage);
  onRoute('home', homePage);
  onRoute('leaderboard', leaderboardPage);
  onRoute('profile/(?<id>[^/]+)', memberProfilePage);
  onRoute('me', myProfilePage);
  onRoute('challenges', challengesPage);
  onRoute('feed', feedPage);

  // Render navbar
  renderNavbar();

  // Check auth
  const memberId = Store.getMemberId();
  if (!memberId) {
    navigate('#onboarding');
  } else {
    // Verify member still exists
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
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
