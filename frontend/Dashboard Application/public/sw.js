// Service Worker for Smart Irrigation Dashboard
// Implements caching strategies for better performance

const CACHE_NAME = 'smart-irrigation-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/vite.svg',
  // Add other static assets as needed
];

// API cache settings
const API_CACHE_NAME = 'api-cache-v1.0.0';
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/') || url.hostname === 'localhost' && url.port === '5000') {
    event.respondWith(
      networkFirstStrategy(request, API_CACHE_NAME)
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      cacheFirstStrategy(request, CACHE_NAME)
    );
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstStrategy(request, CACHE_NAME)
    );
    return;
  }

  // Default: try cache first, fallback to network
  event.respondWith(
    cacheFirstStrategy(request, CACHE_NAME)
  );
});

// Cache-first strategy: check cache first, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    // Return offline fallback if available
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Network-first strategy: try network first, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // Don't cache POST, PUT, DELETE requests
      if (request.method === 'GET') {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Background sync for when network is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle background sync operations
    event.waitUntil(
      // Add your background sync logic here
      Promise.resolve()
    );
  }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/vite.svg',
      badge: '/vite.svg',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('Smart Irrigation Alert', options)
    );
  }
});