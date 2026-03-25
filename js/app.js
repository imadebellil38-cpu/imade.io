import { Store } from './lib/store.js';
import { initSupabase, isLocal } from './lib/supabase.js';
import { getMember, getMemberByAuthId } from './services/members.js';
import { getSession, onAuthStateChange } from './services/auth.js';
import { onRoute, start, navigate } from './router.js';
import { renderNavbar } from './components/navbar.js';

import * as landingPage from './pages/landing.js';
import * as loginPage from './pages/login.js';
import * as onboardingPage from './pages/onboarding.js';
import * as homePage from './pages/home.js';
import * as leaderboardPage from './pages/leaderboard.js';
import * as myProfilePage from './pages/my-profile.js';
import * as achievementsPage from './pages/achievements.js';
import * as statisticsPage from './pages/statistics.js';
import * as trackerPage from './pages/tracker.js';
import * as memberProfilePage from './pages/member-profile.js';
import * as settingsPage from './pages/settings.js';
import * as goalsPage from './pages/goals.js';

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

  // Initialize Supabase with global safety timeout
  try {
    await Promise.race([
      initSupabase(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('init timeout')), 10000))
    ]);
  } catch (err) {
    console.warn('Init timed out, using local mode:', err.message);
  }

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
  onRoute('goals', goalsPage);

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
