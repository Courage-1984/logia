/* Logia Genesis Service Worker
 * - Cache static assets (JS, CSS, images, fonts) long-term
 * - Cache HTML with network-first + cache fallback
 */

const STATIC_CACHE = 'logia-static-v1';
const HTML_CACHE = 'logia-html-v1';

/**
 * Determine if a request is for a static asset (JS, CSS, images, fonts)
 * @param {Request} request
 * @returns {boolean}
 */
const isStaticAsset = (request) => {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;

  return /\.(?:js|css|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|eot)$/.test(url.pathname);
};

self.addEventListener('install', (event) => {
  // Activate the new service worker immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(HTML_CACHE).then((cache) => {
      // Pre-cache shell HTML; asset paths are runtime-cached
      return cache.addAll(['/', '/index.html']);
    }).catch(() => {
      // Ignore install errors; SW will still provide runtime caching
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== HTML_CACHE) {
            return caches.delete(key);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Cache-first strategy for static assets
  if (isSameOrigin && isStaticAsset(request)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);

          // Return cached first if available, otherwise network
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Network-first strategy for HTML/navigation
  if (request.mode === 'navigate' || (isSameOrigin && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(HTML_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
  }
});
