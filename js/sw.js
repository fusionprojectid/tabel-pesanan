const CACHE_NAME = 'ttl-pesanan-cache-v4'; // Versi cache dinaikkan
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'js/script.js',
  'css/style.css',
  'js/prices.json',
  'js/manifest.json',
  'assets/logo-warna.png',
  'assets/logo-bw.png',
  'assets/logo-footer.png',
  // Path Ikon Lengkap Sesuai Folder
  'assets/icons/android-chrome-192x192.png',
  'assets/icons/android-chrome-512x512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon-32x32.png',
  'assets/icons/favicon-16x16.png'
];

// Event activate: menghapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Event install: menyimpan file ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Event fetch: menyajikan file dari cache jika ada
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});