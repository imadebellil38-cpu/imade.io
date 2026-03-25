import { $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';

const MOON_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const SUN_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

export function renderTopbar(title) {
  const theme = Store.getTheme();
  return `
    <div class="grit-topbar">
      <div class="grit-topbar-left">
        <button class="grit-icon-btn grit-icon-btn-accent" id="btn-stats">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </button>
        <button class="grit-icon-btn" id="btn-leaderboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14v8"/><path d="M14 14v8"/><circle cx="12" cy="9" r="5"/></svg>
        </button>
      </div>
      <h1 class="grit-title">${title}</h1>
      <div class="grit-topbar-right">
        <button class="grit-icon-btn" id="btn-add-habit" aria-label="Ajouter une habitude">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button class="grit-icon-btn" id="btn-theme-toggle" aria-label="Toggle theme">
          ${theme === 'light' ? MOON_SVG : SUN_SVG}
        </button>
        <button class="grit-icon-btn" id="btn-settings" aria-label="Paramètres">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
        <button class="grit-icon-btn" id="btn-profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </div>
  `;
}

export function wireTopbar(container) {
  const cleanups = [];

  const statsBtn = $('#btn-stats', container);
  const lbBtn = $('#btn-leaderboard', container);
  const profileBtn = $('#btn-profile', container);
  const settingsBtn = $('#btn-settings', container);
  const addBtn = $('#btn-add-habit', container);
  const themeBtn = $('#btn-theme-toggle', container);

  if (statsBtn) cleanups.push(on(statsBtn, 'click', () => { location.hash = '#statistics'; }));
  if (lbBtn) cleanups.push(on(lbBtn, 'click', () => { location.hash = '#leaderboard'; }));
  if (profileBtn) cleanups.push(on(profileBtn, 'click', () => { location.hash = '#me'; }));
  if (settingsBtn) cleanups.push(on(settingsBtn, 'click', () => { location.hash = '#settings'; }));
  if (addBtn) cleanups.push(on(addBtn, 'click', () => { location.hash = '#me'; }));

  if (themeBtn) {
    cleanups.push(on(themeBtn, 'click', () => {
      const current = document.documentElement.dataset.theme || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      Store.setTheme(next);
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.content = next === 'light' ? '#f5f5f0' : '#050510';
      themeBtn.innerHTML = next === 'light' ? MOON_SVG : SUN_SVG;
    }));
  }

  return () => cleanups.forEach(fn => fn());
}
