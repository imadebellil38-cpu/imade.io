import { html, $, on } from '../lib/dom.js';
import { hideNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../services/auth.js';

let mode = 'login'; // 'login' or 'signup'

export function destroy() {
  mode = 'login';
}

export async function render(container, params) {
  hideNavbar();

  // Check if mode=signup in hash
  if (location.hash.includes('mode=signup')) mode = 'signup';

  renderForm(container);
}

function renderForm(container) {
  const isSignup = mode === 'signup';

  html(container, `
    <div class="login-page">
      <div class="login-header">
        <div class="landing-logo-wrap">
          <h1 class="landing-logo" data-text="EmpireTrack">EmpireTrack</h1>
        </div>
      </div>

      <h2 class="login-title">${isSignup ? 'Créer un compte' : 'Se connecter'}</h2>

      <button class="login-google-btn" id="google-btn">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuer avec Google
      </button>

      <div class="login-divider">
        <span>ou avec email</span>
      </div>

      <form class="login-form" id="login-form">
        <input type="email" class="input" id="login-email" placeholder="Email" required autocomplete="email">
        <input type="password" class="input" id="login-password" placeholder="Mot de passe" required autocomplete="${isSignup ? 'new-password' : 'current-password'}" minlength="6">
        <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-submit">
          ${isSignup ? 'Créer mon compte' : 'Se connecter'}
        </button>
      </form>

      <p class="login-toggle">
        ${isSignup
          ? 'Déjà un compte ? <a href="#" id="toggle-mode">Se connecter</a>'
          : 'Pas encore de compte ? <a href="#" id="toggle-mode">Créer un compte</a>'
        }
      </p>
    </div>
  `);

  // Google sign in
  on($('#google-btn', container), 'click', async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      showToast(err.message || 'Erreur Google', 'error');
    }
  });

  // Email form
  on($('#login-form', container), 'submit', async (e) => {
    e.preventDefault();
    const email = $('#login-email', container).value.trim();
    const password = $('#login-password', container).value;
    const btn = $('#login-submit', container);

    if (!email || !password) return;

    btn.disabled = true;
    btn.textContent = 'Chargement...';

    try {
      if (isSignup) {
        await signUpWithEmail(email, password);
        // After signup, go to onboarding
        location.hash = '#onboarding';
      } else {
        await signInWithEmail(email, password);
        // Auth state change listener in app.js will handle routing
        location.hash = '#home';
      }
    } catch (err) {
      let msg = err.message || 'Erreur';
      if (msg.includes('Invalid login')) msg = 'Email ou mot de passe incorrect';
      if (msg.includes('already registered')) msg = 'Cet email est déjà utilisé';
      if (msg.includes('Password should be')) msg = 'Le mot de passe doit faire au moins 6 caractères';
      showToast(msg, 'error');
      btn.disabled = false;
      btn.textContent = isSignup ? 'Créer mon compte' : 'Se connecter';
    }
  });

  // Toggle mode
  on($('#toggle-mode', container), 'click', (e) => {
    e.preventDefault();
    mode = mode === 'login' ? 'signup' : 'login';
    renderForm(container);
  });
}
