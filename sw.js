// Nama cache dengan versi – tukar nombor ini setiap kali kandungan aset berubah
const CACHE_VERSION = 'v5';
const CACHE_NAME = `flashcards-${CACHE_VERSION}`;

// Senarai aset tempatan yang wajib di-cache semasa pemasangan
const PRECACHE_ASSETS = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'icons.js',
  'manifest.json'
];

// --- PEMASANGAN SERVICE WORKER ---
self.addEventListener('install', event => {
  console.log(`[SW] Memasang cache ${CACHE_NAME}`);
  // Paksa service worker baru aktif serta-merta
  self.skipWaiting();

  // Precache semua aset tempatan
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-cache aset tempatan');
      return cache.addAll(PRECACHE_ASSETS);
    }).catch(err => console.error('[SW] Pre-cache gagal:', err))
  );
});

// --- AKTIVASI & PEMBERSIHAN CACHE LAMA ---
self.addEventListener('activate', event => {
  console.log('[SW] Mengaktifkan service worker');
  // Ambil kawalan semua klien segera
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Buang cache versi lama
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('flashcards-') && name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Menghapus cache lama:', name);
              return caches.delete(name);
            })
        );
      })
    ])
  );
});

// --- STRATEGI CACHE UNTUK PERMINTAAN ---
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Hanya kendalikan permintaan GET
  if (event.request.method !== 'GET') return;

  // 1. PERMINTAAN KEPADA CDN DEVICON (cache-first)
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Kembalikan dari cache jika ada, jika tidak ambil dari rangkaian
        if (cachedResponse) {
          // Pilihan: kemas kini cache di latar belakang (stale-while-revalidate)
          fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || !networkResponse.ok) return networkResponse;
          // Cache respon untuk kegunaan akan datang
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return networkResponse;
        }).catch(() => {
          // Jika tiada rangkaian dan tiada cache, ralat
          return new Response('Ikon tidak tersedia', { status: 404 });
        });
      })
    );
    return;
  }

  // 2. PERMINTAAN ASET TEMPATAN (network-first dengan fallback cache)
  if (PRECACHE_ASSETS.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        // Kemas kini cache dengan versi terbaru
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return networkResponse;
      }).catch(() => {
        // Jika offline, guna cache
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || caches.match('/');
        });
      })
    );
    return;
  }

  // 3. LAIN-LAIN: biarkan (jika perlu, boleh ditambah)
});
