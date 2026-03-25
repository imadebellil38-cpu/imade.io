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
  const path = hash.replace(/^#\/?/, '') || 'home';
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
    currentPage.destroy();
  }

  const matched = matchRoute(window.location.hash);
  if (matched) {
    currentPage = matched.handler;
    app.innerHTML = '';
    app.scrollTop = 0;
    await matched.handler.render(app, matched.params);
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
