/* Logia Genesis Service Worker
 * Enhanced caching strategy for optimal performance
 * - Cache static assets (JS, CSS, images, fonts) long-term with versioning
 * - Cache HTML with network-first + cache fallback
 * - Cache size management and automatic cleanup
 * - Cache warming for critical pages
 */

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `logia-static-${CACHE_VERSION}`;
const HTML_CACHE = `logia-html-${CACHE_VERSION}`;
const DATA_CACHE = `logia-data-${CACHE_VERSION}`;

// Cache size limits (in MB)
const MAX_STATIC_CACHE_SIZE = 50; // 50MB for static assets
const MAX_HTML_CACHE_SIZE = 10; // 10MB for HTML pages
const MAX_DATA_CACHE_SIZE = 5; // 5MB for JSON data

// Critical pages to pre-cache
const CRITICAL_PAGES = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/contact.html'
];

// Critical static assets to pre-cache
const CRITICAL_ASSETS = [
  '/css/style.css',
  '/js/main.js',
  '/js/components.js'
];

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

/**
 * Determine if a request is for JSON data
 * @param {Request} request
 * @returns {boolean}
 */
const isDataAsset = (request) => {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;

  return /\.(?:json)$/.test(url.pathname) || url.pathname.includes('/data/');
};

/**
 * Calculate cache size in MB
 * @param {Cache} cache
 * @returns {Promise<number>} Size in MB
 */
const getCacheSize = async (cache) => {
  const keys = await cache.keys();
  let totalSize = 0;

  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }

  return totalSize / (1024 * 1024); // Convert to MB
};

/**
 * Clean cache if it exceeds size limit
 * @param {Cache} cache
 * @param {number} maxSizeMB
 * @returns {Promise<void>}
 */
const cleanCacheIfNeeded = async (cache, maxSizeMB) => {
  const currentSize = await getCacheSize(cache);
  
  if (currentSize <= maxSizeMB) return;

  const keys = await cache.keys();
  const entries = [];

  // Get all entries with their sizes
  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const blob = await response.blob();
      entries.push({
        key,
        size: blob.size,
        lastUsed: response.headers.get('sw-cache-date') || 0
      });
    }
  }

  // Sort by last used (oldest first)
  entries.sort((a, b) => a.lastUsed - b.lastUsed);

  // Remove oldest entries until under limit
  let sizeToRemove = (currentSize - maxSizeMB) * 1024 * 1024;
  for (const entry of entries) {
    if (sizeToRemove <= 0) break;
    await cache.delete(entry.key);
    sizeToRemove -= entry.size;
  }
};

/**
 * Add response to cache with metadata
 * @param {Cache} cache
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<void>}
 */
const cacheWithMetadata = async (cache, request, response) => {
  // Clone response to add metadata
  const headers = new Headers(response.headers);
  headers.set('sw-cache-date', Date.now().toString());
  
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });

  await cache.put(request, modifiedResponse);
};

self.addEventListener('install', (event) => {
  // Activate the new service worker immediately
  self.skipWaiting();

  event.waitUntil(
    Promise.all([
      // Pre-cache critical HTML pages
      caches.open(HTML_CACHE).then((cache) => {
        // Detect base path from service worker scope
        // Service worker scope is the directory it's registered from
        const scope = self.registration?.scope || self.location.pathname;
        const basePath = scope.replace(/\/service-worker\.js$/, '').replace(/\/$/, '') || '';
        
        const pagesToCache = CRITICAL_PAGES.map(page => {
          const normalizedPage = page.startsWith('/') ? page.slice(1) : page;
          // Handle root page specially
          if (normalizedPage === '' || normalizedPage === 'index.html') {
            return basePath ? `${basePath}/index.html` : '/index.html';
          }
          return basePath ? `${basePath}/${normalizedPage}` : `/${normalizedPage}`;
        });
        
        return cache.addAll(pagesToCache).catch((err) => {
          console.warn('Service Worker: Failed to pre-cache some pages', err);
          // Continue even if some pages fail
        });
      }),
      // Pre-cache critical static assets
      caches.open(STATIC_CACHE).then((cache) => {
        // Detect base path from service worker scope
        const scope = self.registration?.scope || self.location.pathname;
        const basePath = scope.replace(/\/service-worker\.js$/, '').replace(/\/$/, '') || '';
        
        const assetsToCache = CRITICAL_ASSETS.map(asset => {
          const normalizedAsset = asset.startsWith('/') ? asset.slice(1) : asset;
          return basePath ? `${basePath}/${normalizedAsset}` : `/${normalizedAsset}`;
        });
        
        return cache.addAll(assetsToCache).catch((err) => {
          console.warn('Service Worker: Failed to pre-cache some assets', err);
        });
      })
    ]).catch(() => {
      // Ignore install errors; SW will still provide runtime caching
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== STATIC_CACHE && key !== HTML_CACHE && key !== DATA_CACHE) {
              return caches.delete(key);
            }
            return null;
          })
        )
      ),
      // Clean up oversized caches
      caches.open(STATIC_CACHE).then(cache => cleanCacheIfNeeded(cache, MAX_STATIC_CACHE_SIZE)),
      caches.open(HTML_CACHE).then(cache => cleanCacheIfNeeded(cache, MAX_HTML_CACHE_SIZE)),
      caches.open(DATA_CACHE).then(cache => cleanCacheIfNeeded(cache, MAX_DATA_CACHE_SIZE))
    ]).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Cache-first strategy for static assets (long-term cache)
  if (isSameOrigin && isStaticAsset(request)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        
        if (cached) {
          // Return cached version immediately
          // Update cache in background (stale-while-revalidate)
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cacheWithMetadata(cache, request, response.clone());
                // Clean cache if needed after update
                cleanCacheIfNeeded(cache, MAX_STATIC_CACHE_SIZE);
              }
            })
            .catch(() => {
              // Ignore fetch errors for background update
            });
          
          return cached;
        }

        // Not in cache, fetch from network
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            await cacheWithMetadata(cache, request, response.clone());
            await cleanCacheIfNeeded(cache, MAX_STATIC_CACHE_SIZE);
          }
          return response;
        } catch (error) {
          // Network error, return cached if available
          return cached;
        }
      })
    );
    return;
  }

  // Cache-first strategy for JSON data (with revalidation)
  if (isSameOrigin && isDataAsset(request)) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        
        // Check if cache is stale (older than 1 hour)
        let isStale = true;
        if (cached) {
          const cacheDate = cached.headers.get('sw-cache-date');
          if (cacheDate) {
            const age = Date.now() - parseInt(cacheDate, 10);
            isStale = age > 60 * 60 * 1000; // 1 hour
          }
        }

        if (cached && !isStale) {
          // Return cached version, update in background
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cacheWithMetadata(cache, request, response.clone());
                cleanCacheIfNeeded(cache, MAX_DATA_CACHE_SIZE);
              }
            })
            .catch(() => {
              // Ignore fetch errors
            });
          
          return cached;
        }

        // Stale or not cached, fetch from network
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            await cacheWithMetadata(cache, request, response.clone());
            await cleanCacheIfNeeded(cache, MAX_DATA_CACHE_SIZE);
          }
          return response;
        } catch (error) {
          // Network error, return stale cache if available
          return cached || new Response('Network error', { status: 503 });
        }
      })
    );
    return;
  }

  // Network-first strategy for HTML/navigation (short-term cache)
  if (request.mode === 'navigate' || (isSameOrigin && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            const cache = await caches.open(HTML_CACHE);
            await cacheWithMetadata(cache, request, response.clone());
            await cleanCacheIfNeeded(cache, MAX_HTML_CACHE_SIZE);
          }
          return response;
        })
        .catch(async () => {
          // Network failed, try cache
          const cache = await caches.open(HTML_CACHE);
          const cached = await cache.match(request);
          
          if (cached) {
            return cached;
          }
          
          // Fallback to index.html
          const swPath = self.location.pathname;
          let basePath = '';
          
          if (swPath.includes('/service-worker.js')) {
            basePath = swPath.replace(/\/service-worker\.js$/, '').replace(/\/$/, '');
          } else if (swPath !== '/' && swPath !== '/index.html') {
            basePath = swPath.split('/').slice(0, -1).join('/');
          }
          
          const indexPath = basePath ? `${basePath}/index.html` : '/index.html';
          return cache.match(indexPath) || new Response('Offline', { status: 503 });
        })
    );
  }
});
