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
        <canvas id="infinity-canvas"></canvas>
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

  // Infinity orbit with canvas + emoji
  const canvas = document.getElementById('infinity-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const wrap = canvas.parentElement;
    const W = wrap.offsetWidth;
    const H = 130;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const icons = ['🧘','🏋️','📖','💧','🧊','💻','🔥','⚡','🎯','🛡️'];
    const count = icons.length;
    const cx = W / 2, cy = H / 2;
    const rx = W * 0.38, ry = H * 0.38;

    // Lemniscate of Bernoulli: x = a*cos(t)/(1+sin²(t)), y = a*sin(t)*cos(t)/(1+sin²(t))
    function lemniscate(t) {
      const s = Math.sin(t);
      const c = Math.cos(t);
      const d = 1 + s * s;
      return { x: cx + (rx * c) / d, y: cy + (ry * s * c) / d };
    }

    const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

    function draw(ts) {
      if (!document.body.contains(canvas)) return;
      ctx.clearRect(0, 0, W, H);

      const dark = isDark();
      const lineColor = dark ? 'rgba(0,255,136,0.07)' : 'rgba(5,150,105,0.08)';
      const glowColor = dark ? 'rgba(0,255,136,0.15)' : 'rgba(5,150,105,0.1)';

      // Draw infinity path
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 200; i++) {
        const t = (i / 200) * Math.PI * 2;
        const p = lemniscate(t);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw icons
      const time = ts / 16000; // speed
      for (let i = 0; i < count; i++) {
        const t = (time + (i / count)) * Math.PI * 2;
        const p = lemniscate(t);
        const distFromCenter = Math.abs(p.x - cx) / rx;
        const scale = 0.7 + distFromCenter * 0.4;
        const size = 26 * scale;

        // Glow circle behind
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.fill();

        // Emoji
        ctx.font = `${Math.round(16 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.6 + distFromCenter * 0.4;
        ctx.fillText(icons[i], p.x, p.y);
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
}
