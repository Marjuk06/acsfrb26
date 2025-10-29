const CACHE_NAME = 'acs-frb26-pwa-v1.3.0'; // PWA version with clean URLs
const urlsToCache = [
    '/',
    '/index',
    '/chapters',
    '/lectures',
    '/video-player',
    '/pdf-viewer',
    '/converter',
    '/routine',
    '/style.css',
    '/script.js',
    '/videos.json',
    '/frb26/videos.json',
    '/frb26/notes.json',
    '/lecture-slides.json',
    '/chapter-notes.json',
    '/settings.json',
    '/marquee.json',
    '/routine.json',
    '/assets/assets.json',
    '/manifest.json',
    '/icons/FRB-26.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-brands-400.woff2'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Fetch event - network first, then cache fallback
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // For videos.json, ALWAYS fetch from network first, never cache
    if (event.request.url.includes('videos.json')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    return response;
                })
                .catch(error => {
                    // Return a basic error response
                    return new Response(JSON.stringify({
                        error: 'Failed to load data',
                        message: 'Network request failed'
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // For HTML pages and critical resources, use network-first strategy
    if (event.request.destination === 'document' ||
        event.request.url.includes('.html') ||
        event.request.url.includes('.json')) {

        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone the response before using it
                    const responseClone = response.clone();

                    // Update cache with fresh content
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });

                    return response;
                })
                .catch(error => {
                    // If network fails, serve from cache
                    return caches.match(event.request);
                })
        );
    } else {
        // For CSS, JS, and other assets, use cache-first with network update
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        // Update cache with fresh content
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                        });
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || fetchPromise;
                })
        );
    }
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
}); 