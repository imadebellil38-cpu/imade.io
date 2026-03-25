import { html, $, on } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { signInWithEmail } from '../services/auth.js';

export function destroy() {}

export async function render(container) {
  hideNavbar();

  html(container, `
    <div class="login-page">
      <canvas id="login-bg-canvas"></canvas>
      <div class="login-3d-scene">
        <div class="login-ticket login-ticket-1">
          <div class="ticket-face ticket-front ticket-green">
            <div class="ticket-shine"></div>
            <span class="ticket-emoji">⚡</span>
            <span class="ticket-label">Empire</span>
            <span class="ticket-label-accent">Track</span>
          </div>
          <div class="ticket-face ticket-back ticket-purple">
            <div class="ticket-shine"></div>
            <span class="ticket-emoji">🏆</span>
            <span class="ticket-label-light">Construis</span>
            <span class="ticket-label-light">ton empire</span>
          </div>
        </div>
        <div class="login-ticket login-ticket-2">
          <div class="ticket-face ticket-front ticket-violet">
            <div class="ticket-shine"></div>
            <span class="ticket-stat">∞</span>
            <span class="ticket-label-light">Habitudes</span>
            <span class="ticket-label-xs">Streaks · XP · Niveaux</span>
          </div>
          <div class="ticket-face ticket-back ticket-fire">
            <div class="ticket-shine"></div>
            <span class="ticket-emoji">🔥</span>
            <span class="ticket-label-light">Discipline</span>
            <span class="ticket-label-light">= Liberté</span>
          </div>
        </div>
      </div>

      <div class="login-header">
        <h2 class="login-title">Connexion</h2>
        <p class="login-subtitle">Entre tes identifiants pour continuer</p>
      </div>

      <form class="login-form" id="login-form">
        <div class="login-input-group">
          <label class="login-label">Email</label>
          <input type="email" class="login-input" id="login-email" placeholder="prenom@empiretrack.app" required autocomplete="email">
        </div>
        <div class="login-input-group">
          <label class="login-label">Mot de passe</label>
          <input type="password" class="login-input" id="login-password" placeholder="••••••••" required autocomplete="current-password" minlength="6">
        </div>
        <button type="submit" class="login-submit-btn" id="login-submit">
          Se connecter
        </button>
      </form>
    </div>
  `);

  on($('#login-form', container), 'submit', async (e) => {
    e.preventDefault();
    const email = $('#login-email', container).value.trim();
    const password = $('#login-password', container).value;
    const btn = $('#login-submit', container);

    if (!email || !password) return;

    btn.disabled = true;
    btn.textContent = 'Connexion...';

    try {
      await signInWithEmail(email, password);
      showToast('Connexion réussie !');
      // onAuthStateChange in app.js handles the redirect
    } catch (err) {
      let msg = err.message || 'Erreur';
      if (msg.includes('Invalid login')) msg = 'Email ou mot de passe incorrect';
      showToast(msg, 'error');
      btn.disabled = false;
      btn.textContent = 'Se connecter';
    }
  });

  // Login analytics background
  requestAnimationFrame(() => {
  const lbg = document.getElementById('login-bg-canvas');
  if (lbg) {
    const ctx = lbg.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const page = lbg.parentElement;
    const w = page.offsetWidth || window.innerWidth;
    const h = Math.max(page.offsetHeight, window.innerHeight);
    lbg.width = w * dpr;
    lbg.height = h * dpr;
    lbg.style.width = w + 'px';
    lbg.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

    // Mini donut segments
    const segments = [0.35, 0.25, 0.2, 0.12, 0.08];
    const segColors = ['#00ff88', '#8B5CF6', '#F472B6', '#38BDF8', '#FBBF24'];

    // Small sparkline data
    const spark1 = Array.from({ length: 20 }, (_, i) => 0.3 + 0.5 * Math.sin(i * 0.4) + Math.random() * 0.1);
    const spark2 = Array.from({ length: 20 }, (_, i) => 0.5 + 0.3 * Math.cos(i * 0.3 + 1) + Math.random() * 0.08);

    // Mini bars
    const miniBars = Array.from({ length: 7 }, () => 0.2 + Math.random() * 0.7);

    function draw(ts) {
      if (!document.body.contains(lbg)) return;
      const dark = isDark();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const alpha = dark ? 0.06 : 0.05;

      // Grid dots pattern
      const gs = 30;
      ctx.fillStyle = dark ? 'rgba(0,255,136,0.06)' : 'rgba(5,150,105,0.06)';
      for (let gx = gs; gx < w; gx += gs) {
        for (let gy = gs; gy < h; gy += gs) {
          ctx.beginPath();
          ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Top-right: donut chart
      const donutX = w - 60;
      const donutY = 90;
      const donutR = 38;
      const donutW = 9;
      let angle = -Math.PI / 2 + ts / 8000;
      for (let i = 0; i < segments.length; i++) {
        const sweep = segments[i] * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(donutX, donutY, donutR, angle, angle + sweep);
        ctx.strokeStyle = segColors[i] + (dark ? '35' : '25');
        ctx.lineWidth = donutW;
        ctx.lineCap = 'round';
        ctx.stroke();
        angle += sweep + 0.04;
      }

      // Bottom-left: sparkline
      const spX = 20, spY = h - 140, spW = 120, spH = 50;
      const spPhase = ts / 4000;
      ctx.beginPath();
      ctx.strokeStyle = dark ? 'rgba(0,255,136,0.2)' : 'rgba(5,150,105,0.15)';
      ctx.lineWidth = 2;
      for (let i = 0; i < spark1.length; i++) {
        const x = spX + (i / (spark1.length - 1)) * spW;
        const wave = 0.05 * Math.sin(spPhase + i * 0.3);
        const y = spY + (1 - spark1[i] - wave) * spH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second sparkline (purple, dashed)
      ctx.beginPath();
      ctx.strokeStyle = dark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      for (let i = 0; i < spark2.length; i++) {
        const x = spX + (i / (spark2.length - 1)) * spW;
        const wave = 0.04 * Math.sin(spPhase * 0.7 + i * 0.25 + 1);
        const y = spY + (1 - spark2[i] - wave) * spH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Bottom-right: bar chart
      const mbX = w - 120, mbY = h - 90, mbW = 100, mbH = 55;
      const bw = mbW / miniBars.length;
      const barPhase = ts / 3500;
      for (let i = 0; i < miniBars.length; i++) {
        const pulse = 1 + 0.08 * Math.sin(barPhase + i * 0.6);
        const bh = miniBars[i] * mbH * pulse;
        const x = mbX + i * bw + 2;
        const y = mbY + mbH - bh;
        ctx.fillStyle = i % 2 === 0
          ? (dark ? 'rgba(0,255,136,0.12)' : 'rgba(5,150,105,0.1)')
          : (dark ? 'rgba(139,92,246,0.1)' : 'rgba(124,58,237,0.08)');
        ctx.beginPath();
        ctx.roundRect(x, y, bw - 4, bh, 2);
        ctx.fill();
      }

      // Top-left: ascending steps
      const stX = 15, stY = 160;
      ctx.strokeStyle = dark ? 'rgba(0,255,136,0.12)' : 'rgba(5,150,105,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const x1 = stX + i * 12;
        const y1 = stY - i * 10;
        const x2 = x1 + 14;
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y1);
      }
      ctx.stroke();

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
  }); // end requestAnimationFrame wrapper
}
