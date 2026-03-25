import { html } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';

export function destroy() {}

export async function render(container) {
  hideNavbar();

  html(container, `
    <div class="landing-page">
      <div class="landing-hero">
        <div class="landing-orb">
          <div class="landing-orb-ring"></div>
          <div class="landing-orb-core">⚡</div>
        </div>
        <h1 class="landing-title">Empire<span class="landing-title-accent">Track</span></h1>
        <p class="landing-tagline">Construis ton empire d'habitudes</p>
      </div>

      <div class="landing-stats-row">
        <div class="landing-stat">
          <span class="landing-stat-num">100%</span>
          <span class="landing-stat-label">Gratuit</span>
        </div>
        <div class="landing-stat-divider"></div>
        <div class="landing-stat">
          <span class="landing-stat-num">⚡</span>
          <span class="landing-stat-label">Instantané</span>
        </div>
        <div class="landing-stat-divider"></div>
        <div class="landing-stat">
          <span class="landing-stat-num">∞</span>
          <span class="landing-stat-label">Habitudes</span>
        </div>
      </div>

      <div class="landing-features">
        <div class="landing-feature" style="animation-delay: 0.1s">
          <div class="landing-feature-icon" style="background: rgba(139, 92, 246, 0.12); color: #8B5CF6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="landing-feature-text">
            <strong>Suis tes habitudes</strong>
            <span>Check quotidien, timer, streaks de feu</span>
          </div>
        </div>
        <div class="landing-feature" style="animation-delay: 0.2s">
          <div class="landing-feature-icon" style="background: rgba(251, 191, 36, 0.12); color: #F59E0B">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><circle cx="12" cy="9" r="5"/></svg>
          </div>
          <div class="landing-feature-text">
            <strong>Affronte tes amis</strong>
            <span>Classement live, niveaux, XP</span>
          </div>
        </div>
        <div class="landing-feature" style="animation-delay: 0.3s">
          <div class="landing-feature-icon" style="background: rgba(6, 214, 160, 0.12); color: #06D6A0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div class="landing-feature-text">
            <strong>Visualise ta progression</strong>
            <span>Stats, heatmap, graphiques</span>
          </div>
        </div>
      </div>

      <div class="landing-cta">
        <button class="landing-cta-primary" onclick="location.hash='#login'">
          Se connecter
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  `);
}
