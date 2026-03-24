import { $, on } from '../lib/dom.js';
import { navigate } from '../router.js';

const TABS = [
  { id: 'home', label: 'Aujourd\'hui', hash: '#home', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { id: 'leaderboard', label: 'Classement', hash: '#leaderboard', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 22V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14"/><path d="M18 22V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v18"/></svg>' },
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
  window.addEventListener('hashchange', updateActiveTab);
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
