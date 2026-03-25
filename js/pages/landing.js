import { html } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';

export function destroy() {}

export async function render(container) {
  hideNavbar();

  html(container, `
    <div class="landing-page">
      <!-- Analytics background canvas -->
      <canvas id="analytics-bg"></canvas>

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
          <div class="glass-card-icon" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="glass-card-text">
            <strong>Suis tes habitudes</strong>
            <span>Check quotidien, timer, streaks</span>
          </div>
        </div>
        <div class="glass-card glass-card-anim" style="animation-delay:0.25s">
          <div class="glass-card-icon" style="background: linear-gradient(135deg, #F59E0B, #EF4444)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><circle cx="12" cy="9" r="5"/></svg>
          </div>
          <div class="glass-card-text">
            <strong>Affronte tes amis</strong>
            <span>Classement live, niveaux, XP</span>
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

  // Analytics background
  const abg = document.getElementById('analytics-bg');
  if (abg) {
    const actx = abg.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const page = abg.parentElement;

    function resizeBg() {
      const w = page.offsetWidth;
      const h = page.offsetHeight;
      abg.width = w * dpr;
      abg.height = h * dpr;
      abg.style.width = w + 'px';
      abg.style.height = h + 'px';
      actx.scale(dpr, dpr);
      return { w, h };
    }

    let { w: bW, h: bH } = resizeBg();
    const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

    // Generate stable random data
    const bars = Array.from({ length: 14 }, () => 0.2 + Math.random() * 0.7);
    const curve = Array.from({ length: 30 }, (_, i) => {
      const x = i / 29;
      return 0.3 + 0.4 * Math.sin(x * Math.PI * 1.8) + (Math.random() - 0.5) * 0.15;
    });

    function drawBg(ts) {
      if (!document.body.contains(abg)) return;
      const dark = isDark();
      actx.setTransform(dpr, 0, 0, dpr, 0, 0);
      actx.clearRect(0, 0, bW, bH);

      const gridColor = dark ? 'rgba(0,255,136,0.025)' : 'rgba(5,150,105,0.03)';
      const barColor = dark ? 'rgba(0,255,136,0.04)' : 'rgba(5,150,105,0.04)';
      const curveColor = dark ? 'rgba(0,255,136,0.08)' : 'rgba(5,150,105,0.06)';
      const dotColor = dark ? 'rgba(0,255,136,0.12)' : 'rgba(5,150,105,0.08)';

      // Grid
      actx.strokeStyle = gridColor;
      actx.lineWidth = 1;
      const gridSpacing = 50;
      for (let x = 0; x < bW; x += gridSpacing) {
        actx.beginPath();
        actx.moveTo(x, 0);
        actx.lineTo(x, bH);
        actx.stroke();
      }
      for (let y = 0; y < bH; y += gridSpacing) {
        actx.beginPath();
        actx.moveTo(0, y);
        actx.lineTo(bW, y);
        actx.stroke();
      }

      // Bars (bottom half area)
      const barAreaTop = bH * 0.55;
      const barAreaH = bH * 0.35;
      const barW = (bW - 40) / bars.length;
      const animPhase = ts / 3000;
      for (let i = 0; i < bars.length; i++) {
        const pulse = 1 + 0.08 * Math.sin(animPhase + i * 0.5);
        const h = bars[i] * barAreaH * pulse;
        const x = 20 + i * barW + barW * 0.15;
        const y = barAreaTop + barAreaH - h;
        actx.fillStyle = barColor;
        actx.fillRect(x, y, barW * 0.7, h);
      }

      // Curve (top half)
      const curveTop = bH * 0.15;
      const curveH = bH * 0.35;
      const curvePhase = ts / 5000;
      actx.beginPath();
      actx.strokeStyle = curveColor;
      actx.lineWidth = 2;
      for (let i = 0; i < curve.length; i++) {
        const x = 20 + (i / (curve.length - 1)) * (bW - 40);
        const wave = 0.03 * Math.sin(curvePhase + i * 0.3);
        const y = curveTop + (1 - curve[i] - wave) * curveH;
        i === 0 ? actx.moveTo(x, y) : actx.lineTo(x, y);
      }
      actx.stroke();

      // Dots on curve
      for (let i = 0; i < curve.length; i += 4) {
        const x = 20 + (i / (curve.length - 1)) * (bW - 40);
        const wave = 0.03 * Math.sin(curvePhase + i * 0.3);
        const y = curveTop + (1 - curve[i] - wave) * curveH;
        actx.beginPath();
        actx.arc(x, y, 3, 0, Math.PI * 2);
        actx.fillStyle = dotColor;
        actx.fill();
      }

      requestAnimationFrame(drawBg);
    }
    requestAnimationFrame(drawBg);
  }

  // Infinity orbit with canvas + emoji
  const canvas = document.getElementById('infinity-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const wrap = canvas.parentElement;
    const W = wrap.offsetWidth;
    const H = 180;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const icons = ['🧘','🏋️','📖','💧','🧊','💻','🔥','⚡'];
    const colors = ['#8B5CF6','#FF6B6B','#FBBF24','#38BDF8','#22D3EE','#00ff88','#F472B6','#F59E0B'];
    const count = icons.length;
    const cx = W / 2, cy = H / 2;
    const rx = W * 0.44, ry = H * 0.4;

    // Lemniscate of Bernoulli
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
      const lineColor = dark ? 'rgba(0,255,136,0.15)' : 'rgba(5,150,105,0.15)';

      // Draw infinity path
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      for (let i = 0; i <= 300; i++) {
        const t = (i / 300) * Math.PI * 2;
        const p = lemniscate(t);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw icons
      const time = ts / 12000;
      for (let i = 0; i < count; i++) {
        const t = (time + (i / count)) * Math.PI * 2;
        const p = lemniscate(t);
        const distFromCenter = Math.abs(p.x - cx) / rx;
        const scale = 0.9 + distFromCenter * 0.3;
        const r = 24 * scale;

        const c = colors[i];
        // Filled circle background with color tint
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = dark ? `${c}18` : '#fff';
        ctx.fill();
        // Colored border
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = dark ? `${c}60` : `${c}50`;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Shadow
        if (!dark) {
          ctx.save();
          ctx.shadowColor = `${c}30`;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.01)';
          ctx.fill();
          ctx.restore();
        }

        // Emoji
        ctx.font = `${Math.round(26 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.7 + distFromCenter * 0.3;
        ctx.fillText(icons[i], p.x, p.y + 1);
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
}
