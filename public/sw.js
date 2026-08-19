const CACHE_NAME = 'dsssbpyq-online-v12';
const OFFLINE_URL = '/offline.html';

// Assets to precache immediately on installation
const PRECACHE_ASSETS = [
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

// Install Event - Force immediate activation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell & offline fallback...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== 'dsssb-quiz-cache-v2') {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Exclude non-GET requests and external third-party tracking/ads/firebase
  if (
    url.origin !== self.location.origin ||
    request.method !== 'GET' ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('google') ||
    url.pathname.includes('firestore') ||
    url.pathname.includes('firebase') ||
    url.pathname.includes('pagead') ||
    url.pathname === '/app-ads.txt' ||
    url.pathname === '/ads.txt'
  ) {
    return;
  }

  // HTML Navigation Requests: Network-First with Fast Fallback to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
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

  // Critical Static Assets (JS, CSS, Images, Fonts, JSON): Cache-First with Background Update
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background revalidation
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {/* Silent cache update failure */});
        return cachedResponse;
      }

      // Network Fallback for uncached static assets
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
        } else if (networkResponse && networkResponse.status === 404 && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
          // Stale asset requested due to deployment build hash update: flush cache
          caches.delete(CACHE_NAME);
        }
        return networkResponse;
      }).catch((err) => {
        if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
          caches.delete(CACHE_NAME);
        }
        throw err;
      });
    })
  );
});


// Background Sync API
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[Service Worker] Syncing data in background...');
  // Implementation for background sync
}

// Web Push Notifications API
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received.');
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: event.data.text() };
    }
  }

  const title = data.title || 'DSSSB Practice Update';
  const options = {
    body: data.body || 'New content or updates are available!',
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
  console.log('[Service Worker] Notification click received.');
  event.notification.close();
  const targetUrl = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Periodic Sync API
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic sync triggered:', event.tag);
  if (event.tag === 'fetch-latest-content') {
    event.waitUntil(fetchLatestContent());
  }
});

async function fetchLatestContent() {
  console.log('[Service Worker] Fetching latest content in background...');
  try {
    const response = await fetch('/content/index.json');
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/content/index.json', response);
      console.log('[Service Worker] Successfully updated content index.');
    }
  } catch (error) {
    console.error('[Service Worker] Failed to fetch latest content:', error);
  }
}
