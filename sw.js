const CACHE_NAME = 'alsay-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/script.js',
    '/images/logo.png',
    '/images/logo.webp',
    '/fonts/SegoeUI-Regular.woff2',
    '/fonts/SegoeUI-Bold.woff2'
];

// Install service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});

// Fetch strategy: Cache first, then network
self.addEventListener('fetch', event => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    // Fetch new version in background
                    fetch(event.request).then(newResponse => {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, newResponse);
                        });
                    });
                    return response;
                }

                // If not in cache, fetch from network
                return fetch(event.request).then(response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response as it can only be used once
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // Return offline fallback for HTML requests
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/offline.html');
                }
                return new Response('Network error occurred', {
                    status: 408,
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
    );
});

// Handle push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/images/logo.png',
        badge: '/images/logo.png'
    };

    event.waitUntil(
        self.registration.showNotification('Alsay', options)
    );
});
