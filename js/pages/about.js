import { html, $ } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';

export function destroy() {}

export async function render(container) {
  hideNavbar();

  html(container, `
    <div class="about-page">
      <button class="about-back" id="about-back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <!-- Hero -->
      <div class="about-hero">
        <div class="about-hero-glow"></div>
        <h1 class="about-logo">Empire<span>Track</span></h1>
        <p class="about-tagline">Construis ton empire, une habitude à la fois.</p>
      </div>

      <!-- Cards section -->
      <div class="about-cards">
        <div class="about-card about-card-1">
          <span class="about-card-emoji">🔥</span>
          <h3 class="about-card-title">1% par jour = 37x en 1 an</h3>
          <p class="about-card-text">Les petites actions quotidiennes créent des résultats extraordinaires. C'est mathématique.</p>
        </div>
        <div class="about-card about-card-2">
          <span class="about-card-emoji">💪</span>
          <h3 class="about-card-title">La discipline bat la motivation</h3>
          <p class="about-card-text">La motivation va et vient. La discipline reste. EmpireTrack te garde sur la bonne voie.</p>
        </div>
        <div class="about-card about-card-3">
          <span class="about-card-emoji">🧠</span>
          <h3 class="about-card-title">Tu deviens ce que tu répètes</h3>
          <p class="about-card-text">Tes habitudes définissent qui tu es, pas tes intentions. Track-les, améliore-les, domine.</p>
        </div>
      </div>

      <!-- What is EmpireTrack -->
      <div class="about-section">
        <h2 class="about-section-title">C'est quoi EmpireTrack ?</h2>
        <p class="about-section-text">Une app pour suivre tes habitudes quotidiennes et te challenger avec tes potes. Sport, lecture, nutrition, méditation — tu choisis tes habitudes, tu les valides chaque jour, et tu vois qui tient et qui lâche.</p>
      </div>

      <!-- Features -->
      <div class="about-features">
        <div class="about-feature">
          <div class="about-feature-icon" style="background: linear-gradient(135deg, #00ff88, #059669)">✓</div>
          <div>
            <strong>Check quotidien</strong>
            <span>Valide tes habitudes chaque jour en un tap</span>
          </div>
        </div>
        <div class="about-feature">
          <div class="about-feature-icon" style="background: linear-gradient(135deg, #FBBF24, #F59E0B)">🔥</div>
          <div>
            <strong>Streaks & XP</strong>
            <span>Enchaîne les jours, gagne des points, monte de niveau</span>
          </div>
        </div>
        <div class="about-feature">
          <div class="about-feature-icon" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9)">🏆</div>
          <div>
            <strong>Classement live</strong>
            <span>Vois qui est le plus discipliné parmi tes potes</span>
          </div>
        </div>
        <div class="about-feature">
          <div class="about-feature-icon" style="background: linear-gradient(135deg, #38BDF8, #0EA5E9)">📊</div>
          <div>
            <strong>Stats & Insights</strong>
            <span>Heatmap, courbes, analyses de tes forces et faiblesses</span>
          </div>
        </div>
        <div class="about-feature">
          <div class="about-feature-icon" style="background: linear-gradient(135deg, #F472B6, #EC4899)">🎯</div>
          <div>
            <strong>Objectifs long terme</strong>
            <span>Pose des objectifs à 3, 6, 12 mois avec des milestones</span>
          </div>
        </div>
        <div class="about-feature">
          <div class="about-feature-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626)">⏱️</div>
          <div>
            <strong>Timer intégré</strong>
            <span>Chronomètre pour la méditation, lecture, deep work</span>
          </div>
        </div>
      </div>

      <!-- Levels section -->
      <div class="about-section">
        <h2 class="about-section-title">10 niveaux à débloquer</h2>
        <div class="about-levels">
          <div class="about-level"><span>🌱</span> Novice</div>
          <div class="about-level"><span>🪖</span> Recrue</div>
          <div class="about-level"><span>⚔️</span> Soldat</div>
          <div class="about-level"><span>🛡️</span> Guerrier</div>
          <div class="about-level"><span>🏹</span> Chasseur</div>
          <div class="about-level"><span>🎖️</span> Capitaine</div>
          <div class="about-level"><span>⚜️</span> Commandant</div>
          <div class="about-level"><span>🦅</span> Général</div>
          <div class="about-level"><span>💎</span> Légende</div>
          <div class="about-level"><span>👑</span> Empereur</div>
        </div>
      </div>

      <!-- Quote -->
      <div class="about-quote">
        <p>"Celui qui lit 20 min par jour, qui s'entraîne, qui se couche tôt, qui lâche rien — dans 6 mois c'est plus la même personne."</p>
      </div>

      <!-- CTA -->
      <div class="about-cta">
        <button class="about-cta-btn" onclick="history.back()">Retour à l'app</button>
      </div>

      <div class="about-footer">
        <p>EmpireTrack · 2026</p>
        <p>Construis. Track. Domine.</p>
      </div>
    </div>
  `);

  const backBtn = $('#about-back', container);
  if (backBtn) backBtn.addEventListener('click', () => history.back());

  // Animate cards on scroll
  const cards = container.querySelectorAll('.about-card');
  const features = container.querySelectorAll('.about-feature');
  const levels = container.querySelectorAll('.about-level');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(c => observer.observe(c));
  features.forEach(f => observer.observe(f));
  levels.forEach(l => observer.observe(l));
}
