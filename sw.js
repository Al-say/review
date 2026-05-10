// service-worker.js - Service Worker for PWA
const CACHE_NAME = 'alsay-notes-v2';
const API_CACHE_NAME = 'alsay-notes-api-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './notes.html',
  './style.css',
  './script.js',
  './css/styles.css',
  './css/mobile.css',
  './css/high-contrast.css',
  './js/app.js',
  './js/router.js',
  './js/store.js',
  './js/data.js',
  './js/utils.js',
  './js/typing.js',
  './js/script.js',
  './js/ui/search-panel.js',
  './js/ui/shortcuts-panel.js',
  './js/search/engine.js',
  './js/render/timeline-view.js',
  './js/render/graph-view.js',
  './js/render/note-detail.js',
  './js/utils/loading-manager.js',
  './js/utils/touch-gestures.js',
  './js/utils/search-optimizer.js',
  './js/utils/accessibility.js',
  './js/utils/error-handler.js',
  './js/utils/lazy-loader.js',
  './js/utils/pwa-handler.js',
  './manifest.json',
  './images/logo.png',
  './data/search.json'
];
const API_URLS = ['./data/search.json'];
const SCOPE_URL = new URL(self.registration.scope);
const OFFLINE_FALLBACK_URL = new URL('./notes.html', self.registration.scope).pathname;

function toScopedPath(relativePath) {
  return new URL(relativePath, self.registration.scope).pathname;
}

const STATIC_CACHE_URLS = STATIC_ASSETS.map(toScopedPath);
const API_CACHE_PATHS = API_URLS.map(toScopedPath);

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  // Cache static assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Skip waiting for the new service worker to activate
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients for the new service worker
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API requests
  if (API_CACHE_PATHS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Return cached version if available
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise, fetch from network
          return fetch(event.request).then((response) => {
            // Cache the response for future use
            return caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          }).catch(() => {
            // If both cache and network fail, return offline page
            return caches.match(OFFLINE_FALLBACK_URL);
          });
        })
    );
    return;
  }

  // Handle static assets
  if (event.request.destination === 'document' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      event.request.destination === 'image') {

    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Return cached version if available
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise, fetch from network
          return fetch(event.request).then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache the response for future use
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          });
        })
        .catch(() => {
          // If both cache and network fail, return offline page
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_FALLBACK_URL);
          }
          return new Response('Offline', { status: 503 });
        })
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: toScopedPath('./images/logo.png'),
      badge: toScopedPath('./images/logo.png'),
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };

    event.waitUntil(
      self.registration.showNotification('Alsay Notes', options)
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow(new URL('./notes.html', self.registration.scope).href)
    );
  } else {
    // Default action
    event.waitUntil(
      clients.openWindow(new URL('./notes.html', self.registration.scope).href)
    );
  }
});

// Sync notes function
async function syncNotes() {
  try {
    // Get pending notes from IndexedDB
    const pendingNotes = await getPendingNotes();

    if (pendingNotes.length > 0) {
      // Sync notes to server
      await syncNotesToServer(pendingNotes);

      // Clear pending notes
      await clearPendingNotes();
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingNotes() {
  return new Promise((resolve) => {
    const request = indexedDB.open('notes-db', 1);

    request.onerror = () => {
      resolve([]);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['pending-notes'], 'readonly');
      const store = transaction.objectStore('pending-notes');
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        resolve(getAll.result);
      };
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-notes')) {
        db.createObjectStore('pending-notes', { keyPath: 'id' });
      }
    };
  });
}

async function syncNotesToServer(notes) {
  // Implementation for syncing notes to server
  console.log('Syncing notes:', notes);
}

async function clearPendingNotes() {
  return new Promise((resolve) => {
    const request = indexedDB.open('notes-db', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['pending-notes'], 'readwrite');
      const store = transaction.objectStore('pending-notes');
      const clear = store.clear();

      clear.onsuccess = () => {
        resolve();
      };
    };
  });
}

// Handle offline/online events
self.addEventListener('online', () => {
  console.log('App is online');
  // Trigger sync when back online
  if ('sync' in self.registration) {
    self.registration.sync.register('sync-notes');
  }
});

self.addEventListener('offline', () => {
  console.log('App is offline');
});
