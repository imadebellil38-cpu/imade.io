import { html } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';

export function destroy() {}

export async function render(container) {
  hideNavbar();

  html(container, `
    <div class="landing-page">
      <!-- Floating particles background -->
      <div class="landing-particles">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
      </div>

      <div class="landing-hero">
        <!-- 3D iPhone Mockup + Floating Tickets -->
        <div class="phone-scene">
          <div class="phone-float">
            <div class="phone-mockup">
              <div class="phone-frame">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <div class="phone-app">
                    <div class="app-header">
                      <span class="app-title">Aujourd'hui</span>
                      <span class="app-date">Jeu 25</span>
                    </div>
                    <div class="app-xp-bar">
                      <div class="app-xp-fill" style="width:65%"></div>
                    </div>
                    <div class="app-streak">🔥 12 jours</div>
                    <div class="app-habits">
                      <div class="app-habit" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9)">
                        <span>🧘</span><span>Méditer</span>
                        <div class="app-check done">✓</div>
                      </div>
                      <div class="app-habit" style="background: linear-gradient(135deg, #FF6B6B, #EF4444)">
                        <span>🏋️</span><span>Musculation</span>
                        <div class="app-check done">✓</div>
                      </div>
                      <div class="app-habit" style="background: linear-gradient(135deg, #00ff88, #059669)">
                        <span>📖</span><span>Lire 20 min</span>
                        <div class="app-check">+</div>
                      </div>
                      <div class="app-habit" style="background: linear-gradient(135deg, #FBBF24, #F59E0B)">
                        <span>💧</span><span>3L d'eau</span>
                        <div class="app-check">+</div>
                      </div>
                      <div class="app-habit" style="background: linear-gradient(135deg, #F472B6, #EC4899)">
                        <span>🧊</span><span>Cold shower</span>
                        <div class="app-check done">✓</div>
                      </div>
                      <div class="app-habit" style="background: linear-gradient(135deg, #38BDF8, #0EA5E9)">
                        <span>💻</span><span>Deep work</span>
                        <div class="app-check">+</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="phone-btn-side"></div>
                <div class="phone-btn-vol1"></div>
                <div class="phone-btn-vol2"></div>
              </div>
              <div class="phone-glow"></div>
              <div class="phone-shadow"></div>
            </div>
          </div>
          <!-- Floating tickets around phone -->
          <div class="orbit-ticket orbit-ticket-1">
            <span>⚡</span>
            <span>Empire</span>
          </div>
          <div class="orbit-ticket orbit-ticket-2">
            <span>🔥</span>
            <span>Streaks</span>
          </div>
          <div class="orbit-ticket orbit-ticket-3">
            <span>🏆</span>
            <span>XP</span>
          </div>
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
        <div class="landing-feature landing-feature-anim" style="animation-delay: 0.1s">
          <div class="landing-feature-icon" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05)); color: #A78BFA">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="landing-feature-text">
            <strong>Suis tes habitudes</strong>
            <span>Check quotidien, timer, streaks de feu</span>
          </div>
          <div class="feature-glow feature-glow-purple"></div>
        </div>
        <div class="landing-feature landing-feature-anim" style="animation-delay: 0.2s">
          <div class="landing-feature-icon" style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.05)); color: #FBBF24">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><circle cx="12" cy="9" r="5"/></svg>
          </div>
          <div class="landing-feature-text">
            <strong>Affronte tes amis</strong>
            <span>Classement live, niveaux, XP</span>
          </div>
          <div class="feature-glow feature-glow-gold"></div>
        </div>
        <div class="landing-feature landing-feature-anim" style="animation-delay: 0.3s">
          <div class="landing-feature-icon" style="background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.05)); color: #00ff88">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div class="landing-feature-text">
            <strong>Visualise ta progression</strong>
            <span>Stats, heatmap, graphiques</span>
          </div>
          <div class="feature-glow feature-glow-green"></div>
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
