const CACHE_NAME = 'flashcards-v3';

// Aset yang ingin dicache segera semasa install
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
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Cache semua permintaan ke aset tempatan dan CDN devicon
  if (
    url.hostname === 'cdn.jsdelivr.net' ||
    PRECACHE_ASSETS.includes(url.pathname) ||
    url.pathname === '/'
  ) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return fetchResponse;
        });
      }).catch(() => {
        // Jika offline dan tiada cache, boleh kembalikan halaman utama (fallback)
        return caches.match('/');
      })
    );
  }
});
