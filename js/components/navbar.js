import { $, on } from '../lib/dom.js';
import { navigate } from '../router.js';

let hashChangeCleanup = null;

const TABS = [
  { id: 'home', label: 'Aujourd\'hui', hash: '#home', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { id: 'tracker', label: 'Tracker', hash: '#tracker', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>' },
  { id: 'leaderboard', label: 'Classement', hash: '#leaderboard', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 22V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14"/><path d="M18 22V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v18"/></svg>' },
  { id: 'goals', label: 'Objectifs', hash: '#goals', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
  { id: 'me', label: 'Profil', hash: '#me', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
];

export function renderNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  nav.innerHTML = `
    <div class="navbar-inner">
      ${TABS.map(t => `
        <button class="navbar-tab" data-tab="${t.id}" data-hash="${t.hash}">
          <span class="navbar-icon">${t.svg}</span>
          <span class="navbar-label">${t.label}</span>
        </button>
      `).join('')}
    </div>
  `;

  on(nav, 'click', (e) => {
    const tab = e.target.closest('.navbar-tab');
    if (tab) navigate(tab.dataset.hash);
  });

  updateActiveTab();
  if (hashChangeCleanup) hashChangeCleanup();
  hashChangeCleanup = on(window, 'hashchange', updateActiveTab);
}

function updateActiveTab() {
  const nav = $('#navbar');
  if (!nav) return;
  const hash = window.location.hash || '#home';
  nav.querySelectorAll('.navbar-tab').forEach(btn => {
    const isActive = hash.startsWith(btn.dataset.hash);
    btn.classList.toggle('active', isActive);
  });
}

export function showNavbar() {
  const nav = $('#navbar');
  if (nav) nav.classList.remove('hidden');
}

export function hideNavbar() {
  const nav = $('#navbar');
  if (nav) nav.classList.add('hidden');
}
