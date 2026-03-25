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

async function init() {
  // Apply saved theme
  let savedTheme = Store.getTheme();
  if (!localStorage.getItem('empire_theme')) {
    savedTheme = 'light';
    Store.setTheme(savedTheme);
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

  // Auth flow
  const hash = window.location.hash;
  const isAuthPage = hash.includes('login') || hash.includes('landing') || hash.includes('onboarding');

  if (isLocal()) {
    // Local mode: no Supabase auth available
    const memberId = Store.getMemberId();
    if (!memberId && !isAuthPage) {
      navigate('#landing');
    } else if (memberId && (!hash || hash === '#')) {
      navigate('#home');
    }
  } else {
    // Supabase auth flow
    const session = await getSession();

    if (!session) {
      if (!isAuthPage) {
        navigate('#landing');
      }
    } else {
      await handleAuthenticatedUser(session.user);
    }

    // Listen for auth changes
    onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        Store.clear();
        location.hash = '#login';
      }
      if (event === 'SIGNED_IN' && session) {
        await handleAuthenticatedUser(session.user);
      }
    });
  }

  start();
}

async function handleAuthenticatedUser(user) {
  if (!user) return;

  // Check if member exists for this auth user
  const member = await getMemberByAuthId(user.id);

  if (member) {
    // Existing user — populate store and go home
    Store.setMemberId(member.id);
    Store.setPseudo(member.pseudo);
    Store.setAvatar(member.avatar_emoji);

    const hash = window.location.hash;
    if (!hash || hash === '#' || hash.includes('landing') || hash.includes('login')) {
      navigate('#home');
    }
  } else {
    // New user — needs onboarding
    navigate('#onboarding');
  }
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
