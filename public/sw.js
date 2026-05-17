/**
 * Service Worker — Offline support with auth-safe caching
 *
 * STRATEGY:
 * - Static assets (JS/CSS/images): Cache First (fast offline)
 * - API routes & auth: Network Only (NEVER cache)
 * - HTML pages: Network First, fallback to cache (always fresh auth state)
 */

const CACHE_NAME = 'mppsc-cache-v4'; // Bumped to v4 for fresh icon and manifest alignment

const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Routes that must NEVER be cached (auth, API, dynamic data)
const NEVER_CACHE_PATTERNS = [
  '/api/',
  '/login',
  '/logout',
  '/signup',
  '/dashboard',
  '/admin',
  '/forgot-password',
];

function shouldNeverCache(url) {
  const path = new URL(url).pathname;
  return NEVER_CACHE_PATTERNS.some((pattern) => path.startsWith(pattern));
}

function isStaticAsset(url) {
  const path = new URL(url).pathname;
  return (
    path.startsWith('/_next/static/') ||
    path.startsWith('/icons/') ||
    path.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2|woff|ico)$/)
  );
}

// INSTALL: Cache essential files.
// Using a pattern that doesn't block installation if a file is missing.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use map to attempt adding each URL individually to avoid one failure blocking all
      return Promise.allSettled(
        urlsToCache.map(url => 
          cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err))
        )
      ).then(() => self.skipWaiting());
    })
  );
});

// ACTIVATE: Delete ALL old caches + claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim()) // Take control of all tabs immediately
  );
});

// FETCH: Smart routing based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Only handle http and https schemes (ignores chrome-extension://, etc.)
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // RULE 1: Auth & API routes → ALWAYS go to network, NEVER cache
  if (shouldNeverCache(request.url)) {
    event.respondWith(fetch(request));
    return;
  }

  // RULE 2: Static assets (JS/CSS/images) → Cache First (fast)
  if (isStaticAsset(request.url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch((err) => {
            console.warn(`Fetch failed for ${request.url}:`, err);
            return new Response('Resource not available', { status: 404 });
          });
      })
    );
    return;
  }

  // RULE 3: HTML pages (Syllabus, Blogs, Quiz) → Network First (FRESH content)
  // We try network first. If it fails (offline), THEN we use cache.
  // This ensures users always see the latest blog updates if they have internet.
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful HTML responses for offline fallback
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline → try cache, then offline page
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match('/offline').then((offlineResponse) => {
              return offlineResponse || new Response('<h1>Offline</h1><p>You are offline and this page is not cached.</p>', {
                status: 503,
                headers: { 'Content-Type': 'text/html' }
              });
            });
          });
        })
    );
    return;
  }

  // RULE 4: Everything else → Network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || new Response('Resource not available offline', { status: 503 });
        });
      })
  );
});
