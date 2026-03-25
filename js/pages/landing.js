import { html } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';

export function destroy() {}

export async function render(container) {
  hideNavbar();

  html(container, `
    <div class="landing-page">
      <!-- Electric grid background -->
      <div class="electric-bg">
        <div class="electric-line electric-line-1"></div>
        <div class="electric-line electric-line-2"></div>
        <div class="electric-line electric-line-3"></div>
        <div class="electric-bolt electric-bolt-1"></div>
        <div class="electric-bolt electric-bolt-2"></div>
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
        </div>

        <!-- Title -->
        <div class="landing-title-wrap">
          <h1 class="landing-title-big">
            <span class="title-empire">Empire</span><span class="title-track">Track</span>
          </h1>
          <p class="landing-subtitle">Construis ton empire d'habitudes</p>
        </div>
      </div>

      <!-- Infinity Orbit -->
      <div class="infinity-wrap" id="infinity-wrap">
        <svg class="infinity-svg" viewBox="0 0 300 120" fill="none">
          <path class="infinity-trace" d="M150,60 C150,15 210,-5 240,25 C270,55 260,95 230,105 C200,115 155,95 150,60 C145,25 100,-5 70,25 C40,55 30,95 60,105 C90,115 145,95 150,60" stroke="rgba(0,255,136,0.08)" stroke-width="1"/>
          <path id="infinity-motion-path" d="M150,60 C150,15 210,-5 240,25 C270,55 260,95 230,105 C200,115 155,95 150,60 C145,25 100,-5 70,25 C40,55 30,95 60,105 C90,115 145,95 150,60" fill="none"/>
        </svg>
      </div>

      <!-- Features -->
      <div class="landing-cards">
        <div class="glass-card glass-card-anim" style="animation-delay:0.15s">
          <div class="glass-card-icon" style="background: rgba(0,255,136,0.12)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="glass-card-text">
            <strong>Suis tes habitudes</strong>
            <span>Check quotidien, timer, streaks</span>
          </div>
        </div>
        <div class="glass-card glass-card-anim" style="animation-delay:0.25s">
          <div class="glass-card-icon" style="background: rgba(0,255,136,0.12)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2.5" stroke-linecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><circle cx="12" cy="9" r="5"/></svg>
          </div>
          <div class="glass-card-text">
            <strong>Affronte tes amis</strong>
            <span>Classement live, niveaux, XP</span>
          </div>
        </div>
        <div class="glass-card glass-card-anim" style="animation-delay:0.35s">
          <div class="glass-card-icon" style="background: rgba(0,255,136,0.12)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
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

  // Animate habit icons along infinity path
  const wrap = document.getElementById('infinity-wrap');
  const pathEl = document.getElementById('infinity-motion-path');
  if (wrap && pathEl) {
    const icons = ['🧘','🏋️','📖','💧','🧊','💻','🔥','⚡','🎯','🛡️'];
    const totalLen = pathEl.getTotalLength();
    const count = icons.length;
    const els = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'infinity-icon';
      el.textContent = icons[i];
      wrap.appendChild(el);
      els.push(el);
    }

    const svgRect = wrap.querySelector('.infinity-svg').getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const scaleX = wrapRect.width / 300;
    const scaleY = wrapRect.height / 120;
    const offsetX = -18;
    const offsetY = -18;

    let startTime = null;
    const duration = 14000; // 14s full loop

    function animate(ts) {
      if (!startTime) startTime = ts;
      if (!document.body.contains(wrap)) return;
      const elapsed = (ts - startTime) % duration;

      for (let i = 0; i < count; i++) {
        const progress = ((elapsed / duration) + (i / count)) % 1;
        const point = pathEl.getPointAtLength(progress * totalLen);
        const x = point.x * scaleX + offsetX;
        const y = point.y * scaleY + offsetY;
        // Scale effect: bigger at sides, smaller at center cross
        const distFromCenter = Math.abs(point.x - 150) / 150;
        const scale = 0.75 + distFromCenter * 0.5;
        els[i].style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        els[i].style.opacity = 0.5 + distFromCenter * 0.5;
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
}
