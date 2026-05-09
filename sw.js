const CACHE_NAME = 'flashcards-v2';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Cache aset tempatan dan ikon daripada CDN devicon
  if (url.hostname === 'cdn.jsdelivr.net' || url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return fetchResponse;
        });
      })
    );
  }
});
