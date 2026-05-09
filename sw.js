const CACHE_NAME = 'flashcards-v4';
const PRECACHE_ASSETS = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (
    url.hostname === 'cdn.jsdelivr.net' ||
    PRECACHE_ASSETS.includes(url.pathname) ||
    url.pathname === '/'
  ) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          if (fetchResponse.ok) {
            const clone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return fetchResponse;
        }).catch(() => caches.match('/'))
      })
    );
  }
});
