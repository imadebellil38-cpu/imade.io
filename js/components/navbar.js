import { $, on } from '../lib/dom.js';
import { navigate } from '../router.js';

const TABS = [
  { id: 'home', icon: '🏠', label: 'Home', hash: '#home' },
  { id: 'leaderboard', icon: '🏆', label: 'Ranking', hash: '#leaderboard' },
  { id: 'challenges', icon: '⚔️', label: 'Défis', hash: '#challenges' },
  { id: 'feed', icon: '📢', label: 'Feed', hash: '#feed' },
  { id: 'me', icon: '👤', label: 'Profil', hash: '#me' },
];

export function renderNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  nav.innerHTML = `
    <div class="navbar-inner">
      ${TABS.map(t => `
        <button class="navbar-tab" data-tab="${t.id}" data-hash="${t.hash}">
          <span class="navbar-icon">${t.icon}</span>
          <span class="navbar-label">${t.label}</span>
        </button>
      `).join('')}
    </div>
  `;

  nav.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--bg-elevated);
    padding-bottom: var(--safe-bottom);
    z-index: 50;
  `;

  const inner = $('.navbar-inner', nav);
  inner.style.cssText = `
    display: flex;
    height: var(--navbar-height);
  `;

  nav.querySelectorAll('.navbar-tab').forEach(btn => {
    btn.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.65rem;
      cursor: pointer;
      transition: color 0.2s;
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `;
    btn.querySelector('.navbar-icon').style.fontSize = '1.3rem';
  });

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
    btn.style.color = isActive ? 'var(--accent-green)' : 'var(--text-muted)';
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
