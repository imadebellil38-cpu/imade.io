const routes = [];
let currentPage = null;

export function onRoute(pattern, handler) {
  const regex = new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$');
  routes.push({ regex, handler });
}

export function navigate(hash) {
  window.location.hash = hash;
}

function matchRoute(hash) {
  const path = (hash.replace(/^#\/?/, '') || 'home').split('?')[0];
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      return { handler: route.handler, params: match.groups || {} };
    }
  }
  return null;
}

async function handleRoute() {
  const app = document.getElementById('app');
  if (!app) return;

  // Exit animation on current content
  const current = app.firstElementChild;
  if (current) {
    current.classList.add('page-exit');
    await new Promise(r => setTimeout(r, 120));
  }

  if (currentPage && currentPage.destroy) {
    try { currentPage.destroy(); } catch {}
  }

  const matched = matchRoute(window.location.hash);
  if (matched) {
    currentPage = matched.handler;
    app.innerHTML = '';
    app.scrollTop = 0;
    try {
      await Promise.race([
        matched.handler.render(app, matched.params),
        new Promise((_, rej) => setTimeout(() => rej(new Error('page render timeout')), 3000)),
      ]);
    } catch (err) {
      console.warn('Page render slow/failed, retrying:', err);
      // Auto-retry once after 1s
      if (!handleRoute._retrying) {
        handleRoute._retrying = true;
        setTimeout(() => {
          handleRoute._retrying = false;
          handleRoute();
        }, 1000);
      } else {
        handleRoute._retrying = false;
        // After retry still fails, show reload button
        app.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:16px;padding:24px;text-align:center">
            <div style="font-size:2.5rem">⚠️</div>
            <p style="font-weight:700;font-size:1rem;color:var(--text-primary)">Connexion lente</p>
            <button onclick="location.reload()" style="padding:12px 24px;background:var(--accent-primary);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:0.9rem;cursor:pointer">Recharger</button>
          </div>
        `;
      }
    }
    // Enter animation
    const newContent = app.firstElementChild;
    if (newContent) newContent.classList.add('page-enter');
  }
}

export function start() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function getCurrentPage() {
  return currentPage;
}
