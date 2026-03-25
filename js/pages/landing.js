import { html } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';

export function destroy() {}

export async function render(container) {
  hideNavbar();

  html(container, `
    <div class="landing-page">
      <!-- Animated mesh gradient background -->
      <div class="landing-bg">
        <div class="bg-blob bg-blob-1"></div>
        <div class="bg-blob bg-blob-2"></div>
        <div class="bg-blob bg-blob-3"></div>
      </div>

      <!-- Floating particles -->
      <div class="landing-particles">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
      </div>

      <div class="landing-hero">
        <!-- 3D iPhone Mockup -->
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
          <!-- Floating tickets -->
          <div class="orbit-ticket orbit-ticket-1">
            <span>⚡</span><span>Empire</span>
          </div>
          <div class="orbit-ticket orbit-ticket-2">
            <span>🔥</span><span>Streaks</span>
          </div>
          <div class="orbit-ticket orbit-ticket-3">
            <span>🏆</span><span>XP</span>
          </div>
        </div>

        <!-- Animated title -->
        <div class="landing-title-wrap">
          <h1 class="landing-title-big">
            <span class="title-empire">Empire</span><span class="title-track">Track</span>
          </h1>
          <div class="landing-title-line"></div>
          <p class="landing-subtitle">Construis ton empire d'habitudes</p>
        </div>
      </div>

      <!-- Features — glass cards -->
      <div class="landing-cards">
        <div class="glass-card glass-card-anim" style="animation-delay:0.15s">
          <div class="glass-card-icon" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="glass-card-text">
            <strong>Suis tes habitudes</strong>
            <span>Check, timer, streaks</span>
          </div>
        </div>
        <div class="glass-card glass-card-anim" style="animation-delay:0.25s">
          <div class="glass-card-icon" style="background: linear-gradient(135deg, #F59E0B, #EF4444)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><circle cx="12" cy="9" r="5"/></svg>
          </div>
          <div class="glass-card-text">
            <strong>Affronte tes amis</strong>
            <span>Classement, niveaux, XP</span>
          </div>
        </div>
        <div class="glass-card glass-card-anim" style="animation-delay:0.35s">
          <div class="glass-card-icon" style="background: linear-gradient(135deg, #00ff88, #059669)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div class="glass-card-text">
            <strong>Visualise ta progression</strong>
            <span>Stats, heatmap, graphiques</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="landing-cta">
        <button class="landing-cta-primary" onclick="location.hash='#login'">
          <span>Commencer maintenant</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
        <p class="landing-cta-sub">Gratuit · Pas de pub · Instantané</p>
      </div>
    </div>
  `);
}
