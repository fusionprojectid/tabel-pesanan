const CACHE_NAME = 'ttl-pesanan-cache-v1';
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'js/script.js',
  'js/prices.json',
  'js/sw.js',
  'css/style.css',
  'assets/logo-warna.png',
  'assets/logo-bw.png',
  'assets/logo-footer.png',
  'assets/icons/icon-192x192.png',
  'assets/icons/icon-512x512.png'
];

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

// Event fetch: menyajikan file dari cache jika ada (strategi cache-first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, sajikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak, ambil dari jaringan
        return fetch(event.request);
      })
  );
});