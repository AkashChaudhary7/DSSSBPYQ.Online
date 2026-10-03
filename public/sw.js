// Service Worker for PWA (DSSSB PYQ Online / BytePrep)
// Caches app shell (HTML, CSS, JS) and dynamically caches JSON quiz data fetched from GitHub raw URLs & content APIs
// Includes offline fallback mechanisms.

const SHELL_CACHE_NAME = 'dsssb-app-shell-v17';
const QUIZ_DATA_CACHE = 'dsssb-quiz-data-cache-v1';
const OFFLINE_URL = '/offline.html';

// App shell assets to precache immediately on install
const PRECACHE_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/logo.svg',
  '/pwa-192.png',
  '/pwa-512.png',
  '/screenshot-mobile.svg',
  '/screenshot-desktop.svg'
];

// Helper: Determine if URL is a GitHub raw URL or JSON quiz dataset
function isQuizDataUrl(url) {
  const href = url.href.toLowerCase();
  const hostname = url.hostname.toLowerCase();
  
  // 1. GitHub raw URLs
  if (hostname === 'raw.githubusercontent.com' || 
      hostname === 'gist.githubusercontent.com' || 
      (hostname.includes('github.com') && href.includes('/raw/'))) {
    return true;
  }

  // 2. Local /content JSON quiz files
  if (url.origin === self.location.origin && (url.pathname.startsWith('/content/') || url.pathname.endsWith('.json'))) {
    return true;
  }

  return false;
}

// Install Event: Precache app shell and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell & offline fallback...');
        return cache.addAll(PRECACHE_SHELL_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== SHELL_CACHE_NAME && cacheName !== QUIZ_DATA_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Orchestrate caching strategies with offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Exclude non-GET requests and external analytics/ads/firebase tracking
  if (
    request.method !== 'GET' ||
    url.pathname.includes('pagead') ||
    url.pathname.includes('google-analytics') ||
    url.pathname.includes('firestore.googleapis.com') ||
    url.pathname === '/app-ads.txt' ||
    url.pathname === '/ads.txt'
  ) {
    return;
  }

  // 1. Navigation Requests (HTML Pages): Network-First with Cache/Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(SHELL_CACHE_NAME).then((cache) => {
              cache.put('/index.html', cacheCopy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html').then((cachedIndex) => {
            return cachedIndex || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // 2. Dynamic Caching for Quiz Data (GitHub Raw URLs & JSON Files)
  // Network-First with Fallback to QUIZ_DATA_CACHE & Offline JSON object
  if (isQuizDataUrl(url)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If valid response, clone into QUIZ_DATA_CACHE
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(QUIZ_DATA_CACHE).then((cache) => {
              cache.put(request, cacheCopy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed: attempt retrieval from QUIZ_DATA_CACHE
          return caches.open(QUIZ_DATA_CACHE).then((cache) => {
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not cached, return graceful offline JSON fallback
              return new Response(
                JSON.stringify({
                  error: 'offline',
                  message: 'This quiz dataset is not yet cached for offline use. Please reconnect to load.'
                }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
          });
        })
    );
    return;
  }

  // 3. Static App Shell Assets (JS, CSS, Images, Fonts): Cache-First with Revalidation
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Background revalidation
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(SHELL_CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {/* Silent cache update failure */});
          return cachedResponse;
        }

        // Network fallback for uncached assets
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const cacheCopy = networkResponse.clone();
            caches.open(SHELL_CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
          }
          return networkResponse;
        }).catch((err) => {
          // Return offline page fallback for static document requests if any
          if (request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
          throw err;
        });
      })
    );
    return;
  }

  // Default passthrough for other external assets
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Background Sync API
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[Service Worker] Syncing offline progress in background...');
}

// Web Push Notifications API
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: event.data.text() };
    }
  }

  const title = data.title || 'DSSSB PYQ Practice Alert';
  const options = {
    body: data.body || 'Daily Mock Test & New PYQs are available for practice!',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    data: data.url || '/',
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open_url', title: 'Open App' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
