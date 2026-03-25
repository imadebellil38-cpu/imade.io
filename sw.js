// EmpireTrack Service Worker v2 - Network-first for reliability
const CACHE_VERSION = 'empire-v2';
const API_CACHE = 'empire-api-v2';

const SUPABASE_HOST = 'wruzvwxsdyvjmahfojgm.supabase.co';

// ---- Install: skip waiting immediately ----
self.addEventListener('install', () => self.skipWaiting());

// ---- Activate: clean ALL old caches, claim clients ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION && k !== API_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ---- Fetch ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Non-GET mutations to Supabase: try network, queue on fail
  if (request.method !== 'GET') {
    if (url.hostname === SUPABASE_HOST) {
      event.respondWith(handleMutation(request));
    }
    return;
  }

  // Supabase API: network-first
  if (url.hostname === SUPABASE_HOST) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Google Fonts & esm.sh CDN: cache-first (they're versioned/immutable)
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname === 'esm.sh') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else (our JS, CSS, HTML): network-first with cache fallback
  event.respondWith(networkFirst(request, CACHE_VERSION));
});

// ---- Network-first: try network, fall back to cache ----
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // For navigation, serve index.html
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

// ---- Cache-first: for immutable CDN assets ----
async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// ---- Mutation handler: queue failed writes ----
async function handleMutation(request) {
  try {
    return await fetch(request.clone());
  } catch {
    const body = await request.text();
    const queue = await getQueue();
    queue.push({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      timestamp: Date.now(),
    });
    await saveQueue(queue);
    return new Response(JSON.stringify({ data: { id: 'offline-' + Date.now() }, error: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ---- Queue persistence ----
async function getQueue() {
  try {
    const cache = await caches.open('empire-sync-queue');
    const response = await cache.match('queue');
    if (response) return await response.json();
  } catch {}
  return [];
}

async function saveQueue(queue) {
  const cache = await caches.open('empire-sync-queue');
  await cache.put('queue', new Response(JSON.stringify(queue)));
}

// ---- Replay queued requests ----
self.addEventListener('message', async (event) => {
  if (event.data?.type === 'REPLAY_QUEUE') {
    const queue = await getQueue();
    if (!queue.length) return;
    const remaining = [];
    for (const item of queue) {
      try {
        await fetch(item.url, { method: item.method, headers: item.headers, body: item.body || undefined });
      } catch {
        remaining.push(item);
      }
    }
    await saveQueue(remaining);
  }
});
