// Wirddy Progressive Web App Service Worker
// The page registers this worker as /sw.js?v=<build id>, so every deploy
// installs a fresh worker with its own cache and the old cache is removed.
const BUILD_VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE_NAME = `wirddy-pwa-${BUILD_VERSION}`;
// Quran text never changes, so it lives in its own cache that survives deploys.
const QURAN_TEXT_CACHE = 'wirddy-quran-text-v1';
const QURAN_API_HOST = 'api.alquran.cloud';

const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/wirddy-icon-black.png',
  '/wirddy-icon-white.png',
  '/logo-black.png',
  '/logo-white.png',
  '/wirddy-logo-black.png',
  '/wirddy-logo-white.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

// Installation: Cache static core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation: Clean up older cache versions and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME && name !== QURAN_TEXT_CACHE) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Strategy: Network-first for navigational pages with Cache fallback, Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests, chrome-extension URLs, localhost development, HMR, and Auth routes
  if (
    request.method !== 'GET' ||
    !url.protocol.startsWith('http') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/login')
  ) {
    return;
  }

  // 0. Quran text from the API: cache-first, so pages read once open
  //    instantly and keep working offline.
  if (url.hostname === QURAN_API_HOST) {
    event.respondWith(
      caches.open(QURAN_TEXT_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  // 1. Navigation requests (HTML pages): Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached root shell
          return caches.match('/');
        })
    );
    return;
  }

  // 2. Static Assets (_next/static, images, fonts, icons): Cache-first with network fallback
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|woff|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached asset and update cache in background (Stale-While-Revalidate)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {
              // Network error in background, ignored
            });
          return cachedResponse;
        }

        // Fetch from network and cache for subsequent visits
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Default: Network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// 4. Web Push Notification Listener
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'وِردي | Wirddy';
    const options = {
      body: data.body || 'حان وقت قراءة وردك اليومي من القرآن الكريم.',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      data: {
        url: data.url || '/dashboard',
      },
      dir: data.dir || 'rtl',
      lang: data.lang || 'ar',
      tag: data.tag || 'wirddy-daily-reminder',
      renotify: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error showing push notification:', err);
  }
});

// 5. Notification Click Listener: Open target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

