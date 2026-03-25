import { Store } from './lib/store.js?v=4';
import { initSupabase, isLocal } from './lib/supabase.js?v=4';
import { getMember, getMemberByAuthId } from './services/members.js?v=4';
import { getSession, onAuthStateChange } from './services/auth.js?v=4';
import { onRoute, start, navigate } from './router.js?v=4';
import { renderNavbar } from './components/navbar.js?v=4';

import * as landingPage from './pages/landing.js?v=4';
import * as loginPage from './pages/login.js?v=4';
import * as onboardingPage from './pages/onboarding.js?v=4';
import * as homePage from './pages/home.js?v=4';
import * as leaderboardPage from './pages/leaderboard.js?v=4';
import * as myProfilePage from './pages/my-profile.js?v=4';
import * as achievementsPage from './pages/achievements.js?v=4';
import * as statisticsPage from './pages/statistics.js?v=4';
import * as trackerPage from './pages/tracker.js?v=4';
import * as memberProfilePage from './pages/member-profile.js?v=4';
import * as settingsPage from './pages/settings.js?v=4';

async function init() {
  // Apply saved theme
  let savedTheme = localStorage.getItem('empire_theme');
  if (!savedTheme) {
    savedTheme = 'light';
    localStorage.setItem('empire_theme', savedTheme);
  }
  document.documentElement.dataset.theme = savedTheme;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = savedTheme === 'light' ? '#f5f5f0' : '#050510';
  }

  // Initialize Supabase
  await initSupabase();

  // Register all routes
  onRoute('landing', landingPage);
  onRoute('login', loginPage);
  onRoute('onboarding', onboardingPage);
  onRoute('home', homePage);
  onRoute('leaderboard', leaderboardPage);
  onRoute('me', myProfilePage);
  onRoute('achievements', achievementsPage);
  onRoute('statistics', statisticsPage);
  onRoute('tracker', trackerPage);
  onRoute('member/:id', memberProfilePage);
  onRoute('settings', settingsPage);

  renderNavbar();

  // Determine where to go
  const hash = window.location.hash;
  const onAuthPage = hash.includes('login') || hash.includes('landing');

  if (isLocal()) {
    // Local mode — simple memberId check
    const memberId = Store.getMemberId();
    if (!memberId) {
      if (!onAuthPage && !hash.includes('onboarding')) navigate('#landing');
    } else if (!hash || hash === '#') {
      navigate('#home');
    }
  } else {
    // Supabase auth
    let session = null;
    try {
      session = await getSession();
    } catch {
      // Session check failed — treat as not logged in
    }

    if (!session) {
      // Not logged in — show landing or login
      if (!onAuthPage) {
        navigate('#landing');
      }
    } else {
      // Logged in — try to find member
      await loadMemberAndRoute(session.user);
    }

    // React to future auth events
    onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        Store.clear();
        navigate('#landing');
      }
      if (event === 'SIGNED_IN' && newSession) {
        await loadMemberAndRoute(newSession.user);
      }
    });
  }

  start();
}

async function loadMemberAndRoute(user) {
  if (!user) return;

  let member = null;
  try {
    member = await getMemberByAuthId(user.id);
  } catch {
    // RLS or network error — try by stored memberId as fallback
    const storedId = Store.getMemberId();
    if (storedId) {
      try { member = await getMember(storedId); } catch {}
    }
  }

  if (member) {
    // Known user — save to store and go home
    Store.setMemberId(member.id);
    Store.setPseudo(member.pseudo);
    Store.setAvatar(member.avatar_emoji);

    const hash = window.location.hash;
    if (!hash || hash === '#' || hash.includes('landing') || hash.includes('login')) {
      navigate('#home');
    }
  } else {
    // New user — needs to set up profile
    navigate('#onboarding');
  }
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
