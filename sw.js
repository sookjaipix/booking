const CACHE_NAME = 'sookjai-pix-cache-v12';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Prompt:wght@200;300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Install Event - Pre-cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching offline assets');
      // Using addAll with CORS requests
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache First with Network Fallback (Bypassing API endpoints)
self.addEventListener('fetch', event => {
  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) return;

  // Bypass service worker caching for API calls
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('api.sheetbest.com') ||
      event.request.url.includes('script.google.com') ||
      event.request.url.includes('script.googleusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        // Cache new static GET requests
        if (!networkResponse || networkResponse.status !== 200 || event.request.method !== 'GET') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(err => {
        console.log('[Service Worker] Fetch failed offline:', err);
      });
    })
  );
});
