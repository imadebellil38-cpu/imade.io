// EmpireTrack Service Worker - Offline Mode
const CACHE_VERSION = 'empire-v1';
const API_CACHE = 'empire-api-v1';
const SYNC_QUEUE_KEY = 'empire_sync_queue';

// Static assets to pre-cache
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/reset.css',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/animations.css',
  './css/pages/home.css',
  './css/pages/tracker.css',
  './css/pages/profile.css',
  './css/pages/statistics.css',
  './css/pages/achievements.css',
  './css/pages/leaderboard.css',
  './css/pages/onboarding.css',
  './css/pages/auth.css',
  './js/app.js',
  './js/config.js',
  './js/router.js',
  './js/lib/dom.js',
  './js/lib/store.js',
  './js/lib/dates.js',
  './js/lib/color.js',
  './js/lib/supabase.js',
  './js/lib/localdb.js',
  './js/lib/state.js',
  './js/lib/photo.js',
  './js/services/checkins.js',
  './js/services/habits.js',
  './js/services/members.js',
  './js/services/auth.js',
  './js/services/scoring.js',
  './js/services/realtime.js',
  './js/components/navbar.js',
  './js/components/toast.js',
  './js/components/modal.js',
  './js/components/topbar.js',
  './js/components/heatmap.js',
  './js/components/chart.js',
  './js/components/avatar.js',
  './js/components/timer-modal.js',
  './js/pages/home.js',
  './js/pages/landing.js',
  './js/pages/login.js',
  './js/pages/onboarding.js',
  './js/pages/tracker.js',
  './js/pages/leaderboard.js',
  './js/pages/my-profile.js',
  './js/pages/member-profile.js',
  './js/pages/achievements.js',
  './js/pages/statistics.js',
  './js/pages/settings.js',
  './js/data/habits-catalog.js',
  './js/data/badges.js',
  './js/data/quotes.js',
  './js/data/emojis.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/logo-original.png',
];

// Supabase API hostname
const SUPABASE_HOST = 'wruzvwxsdyvjmahfojgm.supabase.co';

// ---- Install: pre-cache static assets ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ---- Activate: clean old caches ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ---- Fetch: strategy depends on request type ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET for caching (POST/PATCH/DELETE go through sync queue)
  if (request.method !== 'GET') {
    // For Supabase mutations, try network and queue on failure
    if (url.hostname === SUPABASE_HOST) {
      event.respondWith(handleMutation(request));
    }
    return;
  }

  // Supabase API calls: network-first
  if (url.hostname === SUPABASE_HOST) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Google Fonts: cache-first (they're versioned)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request, CACHE_VERSION));
    return;
  }

  // esm.sh (Supabase JS client CDN): cache-first
  if (url.hostname === 'esm.sh') {
    event.respondWith(cacheFirst(request, CACHE_VERSION));
    return;
  }

  // Static assets: cache-first
  event.respondWith(cacheFirst(request, CACHE_VERSION));
});

// ---- Cache-first strategy ----
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback for navigation
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// ---- Network-first strategy (for API) ----
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ data: [], error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ---- Handle mutations (POST/PATCH/DELETE) with offline queue ----
async function handleMutation(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch {
    // Queue the request for later
    const body = await request.text();
    const queued = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      timestamp: Date.now(),
    };

    // Store in IndexedDB-like approach via cache API
    const queue = await getQueue();
    queue.push(queued);
    await saveQueue(queue);

    // Notify clients that we're offline and request is queued
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_QUEUED', count: queue.length });
      });
    });

    // Return a fake success so the UI doesn't break
    return new Response(JSON.stringify({ data: { id: 'offline-' + Date.now() }, error: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ---- Sync queue using Cache API for persistence ----
async function getQueue() {
  try {
    const cache = await caches.open('empire-sync-queue');
    const response = await cache.match('queue');
    if (response) {
      return await response.json();
    }
  } catch {}
  return [];
}

async function saveQueue(queue) {
  const cache = await caches.open('empire-sync-queue');
  await cache.put('queue', new Response(JSON.stringify(queue)));
}

// ---- Background sync: replay queued requests ----
self.addEventListener('message', async (event) => {
  if (event.data?.type === 'REPLAY_QUEUE') {
    await replayQueue();
  }
});

async function replayQueue() {
  const queue = await getQueue();
  if (!queue.length) return;

  const remaining = [];

  for (const item of queue) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body || undefined,
      });
    } catch {
      remaining.push(item);
    }
  }

  await saveQueue(remaining);

  // Notify clients
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        replayed: queue.length - remaining.length,
        remaining: remaining.length,
      });
    });
  });
}
