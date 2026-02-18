// src/service-worker.ts

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');

  // Define the cache name and assets to cache
  const CACHE_NAME = 'my-pwa-cache-v1';
  const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/curated-assets/image1.jpg',
    '/curated-assets/image2.png'
    // Add other static assets that need to be cached
  ];

  // Open the cache and add all URLs to it
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');

  // Remove old caches if necessary
  const CACHE_NAME = 'my-pwa-cache-v1';
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (CACHE_NAME !== cacheName && cacheName.includes('my-pwa')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Fetch event:', event.request.url);

  // Handle fetch events
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        // If not in cache, fetch from the network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

This is a basic Service Worker script that implements caching for static assets, handles fetch events to serve cached content when available, and allows the service worker to activate immediately by skipping the waiting state. You can expand upon this with additional features such as handling dynamic content, background sync, or other PWA capabilities as needed.