// Prayer Journal — Service Worker
// Strategy:
//   • HTML / navigation requests → network-first (so updates ship), fallback to cache.
//   • Other static assets → cache-first.
// Bump CACHE_NAME whenever you want all clients to refresh their cached app shell.

const CACHE_NAME = 'prayer-journal-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-maskable.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin requests; let the browser deal with anything else
  if (url.origin !== self.location.origin) return;

  // HTML / navigation → network-first
  if (req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  // Everything else → cache-first
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => new Response('Offline — and this resource is not cached.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      }));
    })
  );
});
