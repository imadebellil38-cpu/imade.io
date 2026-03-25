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
    const bars = Array.from({ length: 20 }, () => 0.15 + Math.random() * 0.75);
    const curve1 = Array.from({ length: 40 }, (_, i) => {
      const x = i / 39;
      return 0.25 + 0.45 * Math.sin(x * Math.PI * 2) + (Math.random() - 0.5) * 0.12;
    });
    const curve2 = Array.from({ length: 40 }, (_, i) => {
      const x = i / 39;
      return 0.4 + 0.3 * Math.cos(x * Math.PI * 1.5 + 1) + (Math.random() - 0.5) * 0.1;
    });
    const miniDots = Array.from({ length: 25 }, () => ({
      x: Math.random(), y: Math.random(), r: 1.5 + Math.random() * 2.5
    }));

    function drawBg(ts) {
      if (!document.body.contains(abg)) return;
      const dark = isDark();
      actx.setTransform(dpr, 0, 0, dpr, 0, 0);
      actx.clearRect(0, 0, bW, bH);

      // Colors — our green #00ff88
      const gridColor = dark ? 'rgba(0,255,136,0.04)' : 'rgba(5,150,105,0.05)';
      const barColor1 = dark ? 'rgba(0,255,136,0.07)' : 'rgba(5,150,105,0.07)';
      const barColor2 = dark ? 'rgba(139,92,246,0.05)' : 'rgba(124,58,237,0.05)';
      const curve1Color = dark ? 'rgba(0,255,136,0.15)' : 'rgba(5,150,105,0.12)';
      const curve2Color = dark ? 'rgba(139,92,246,0.1)' : 'rgba(124,58,237,0.08)';
      const fillUnder = dark ? 'rgba(0,255,136,0.03)' : 'rgba(5,150,105,0.03)';
      const dotColor = dark ? 'rgba(0,255,136,0.2)' : 'rgba(5,150,105,0.15)';
      const scatterColor = dark ? 'rgba(0,255,136,0.06)' : 'rgba(5,150,105,0.04)';

      // Grid
      actx.strokeStyle = gridColor;
      actx.lineWidth = 1;
      const gs = 45;
      for (let x = 0; x < bW; x += gs) {
        actx.beginPath();
        actx.moveTo(x, 0);
        actx.lineTo(x, bH);
        actx.stroke();
      }
      for (let y = 0; y < bH; y += gs) {
        actx.beginPath();
        actx.moveTo(0, y);
        actx.lineTo(bW, y);
        actx.stroke();
      }

      // Scatter dots
      for (const d of miniDots) {
        const px = d.x * bW;
        const py = d.y * bH;
        const pulse = 1 + 0.3 * Math.sin(ts / 2000 + d.x * 10);
        actx.beginPath();
        actx.arc(px, py, d.r * pulse, 0, Math.PI * 2);
        actx.fillStyle = scatterColor;
        actx.fill();
      }

      // Bars (spread across full height)
      const barAreaTop = bH * 0.45;
      const barAreaH = bH * 0.45;
      const barW = (bW - 30) / bars.length;
      const animPhase = ts / 3000;
      for (let i = 0; i < bars.length; i++) {
        const pulse = 1 + 0.1 * Math.sin(animPhase + i * 0.4);
        const h = bars[i] * barAreaH * pulse;
        const x = 15 + i * barW + barW * 0.1;
        const y = barAreaTop + barAreaH - h;
        // Alternate green and purple bars
        actx.fillStyle = i % 3 === 0 ? barColor2 : barColor1;
        actx.beginPath();
        actx.roundRect(x, y, barW * 0.8, h, 3);
        actx.fill();
      }

      // Curve 1 — green (with fill under)
      const c1Top = bH * 0.08;
      const c1H = bH * 0.4;
      const c1Phase = ts / 5000;
      actx.beginPath();
      for (let i = 0; i < curve1.length; i++) {
        const x = 15 + (i / (curve1.length - 1)) * (bW - 30);
        const wave = 0.04 * Math.sin(c1Phase + i * 0.25);
        const y = c1Top + (1 - curve1[i] - wave) * c1H;
        i === 0 ? actx.moveTo(x, y) : actx.lineTo(x, y);
      }
      // Fill under curve
      const lastX1 = 15 + (bW - 30);
      actx.lineTo(lastX1, c1Top + c1H);
      actx.lineTo(15, c1Top + c1H);
      actx.closePath();
      actx.fillStyle = fillUnder;
      actx.fill();
      // Stroke curve
      actx.beginPath();
      actx.strokeStyle = curve1Color;
      actx.lineWidth = 2;
      for (let i = 0; i < curve1.length; i++) {
        const x = 15 + (i / (curve1.length - 1)) * (bW - 30);
        const wave = 0.04 * Math.sin(c1Phase + i * 0.25);
        const y = c1Top + (1 - curve1[i] - wave) * c1H;
        i === 0 ? actx.moveTo(x, y) : actx.lineTo(x, y);
      }
      actx.stroke();

      // Curve 2 — purple
      actx.beginPath();
      actx.strokeStyle = curve2Color;
      actx.lineWidth = 1.5;
      actx.setLineDash([4, 4]);
      for (let i = 0; i < curve2.length; i++) {
        const x = 15 + (i / (curve2.length - 1)) * (bW - 30);
        const wave = 0.03 * Math.sin(c1Phase * 0.8 + i * 0.2 + 2);
        const y = c1Top + (1 - curve2[i] - wave) * c1H;
        i === 0 ? actx.moveTo(x, y) : actx.lineTo(x, y);
      }
      actx.stroke();
      actx.setLineDash([]);

      // Data dots on curve 1
      for (let i = 0; i < curve1.length; i += 3) {
        const x = 15 + (i / (curve1.length - 1)) * (bW - 30);
        const wave = 0.04 * Math.sin(c1Phase + i * 0.25);
        const y = c1Top + (1 - curve1[i] - wave) * c1H;
        actx.beginPath();
        actx.arc(x, y, 3.5, 0, Math.PI * 2);
        actx.fillStyle = dotColor;
        actx.fill();
      }

      // Horizontal reference lines
      actx.strokeStyle = dark ? 'rgba(0,255,136,0.03)' : 'rgba(5,150,105,0.04)';
      actx.lineWidth = 1;
      actx.setLineDash([8, 6]);
      for (let i = 1; i <= 3; i++) {
        const y = c1Top + (i / 4) * c1H;
        actx.beginPath();
        actx.moveTo(15, y);
        actx.lineTo(bW - 15, y);
        actx.stroke();
      }
      actx.setLineDash([]);

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
