import { html } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';

export function destroy() {}

export async function render(container) {
  hideNavbar();

  html(container, `
    <div class="landing-page">
      <div class="landing-hero">
        <div class="landing-logo-wrap">
          <h1 class="landing-logo" data-text="EmpireTrack">EmpireTrack</h1>
        </div>
        <p class="landing-tagline">Construis ton empire d'habitudes</p>
      </div>

      <div class="landing-features">
        <div class="landing-feature">
          <div class="landing-feature-icon">⚡</div>
          <div class="landing-feature-text">
            <strong>Suis tes habitudes</strong>
            <span>Check quotidien, timer intégré, streaks</span>
          </div>
        </div>
        <div class="landing-feature">
          <div class="landing-feature-icon">🏆</div>
          <div class="landing-feature-text">
            <strong>Affronte tes amis</strong>
            <span>Classement en temps réel, niveaux, XP</span>
          </div>
        </div>
        <div class="landing-feature">
          <div class="landing-feature-icon">📊</div>
          <div class="landing-feature-text">
            <strong>Visualise ta progression</strong>
            <span>Stats, heatmap, graphiques détaillés</span>
          </div>
        </div>
      </div>

      <div class="landing-cta">
        <button class="btn btn-primary btn-block btn-lg" onclick="location.hash='#login?mode=signup'">
          Commencer gratuitement
        </button>
        <button class="btn btn-secondary btn-block" onclick="location.hash='#login'">
          J'ai déjà un compte
        </button>
      </div>
    </div>
  `);
}
