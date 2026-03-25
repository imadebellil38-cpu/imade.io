import { html, $, on } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { signInWithEmail } from '../services/auth.js';

export function destroy() {}

export async function render(container) {
  hideNavbar();

  html(container, `
    <div class="login-page">
      <div class="login-header">
        <div class="login-avatar-icon">👋</div>
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
}
