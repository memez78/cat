const CACHE_NAME = 'cyber-cat-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/css/missions.css',
  '/js/app.js',
  '/js/game.js',
  '/js/ai.js',
  '/js/missions.js',
  '/assets/images/background.png',
  '/assets/images/cyber_cat.png',
  '/assets/images/shield.png',
  '/assets/images/virus.png',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/mission-icon.png',
  '/assets/images/profile-icon.png',
  '/assets/sounds/click.mp4',
  '/assets/sounds/collect.mp4',
  '/assets/sounds/gameover.mp4',
  '/assets/sounds/levelup.mp4',
  '/assets/sounds/notification.mp4'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Don't cache responses that aren't successful
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Clone the response since it can only be consumed once
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/notification-badge.png',
    sound: '/assets/sounds/notification.mp4',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Start Mission',
        icon: '/assets/images/mission-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/close-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Cyber Cat', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/?action=mission')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncUserProgress());
  }
});

// Helper function to sync user progress
async function syncUserProgress() {
  try {
    const db = await openDB('cybercat', 1);
    const tx = db.transaction('progress', 'readonly');
    const store = tx.objectStore('progress');
    const unsyncedProgress = await store.index('synced').getAll(0);

    if (unsyncedProgress.length > 0) {
      // Sync with server
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(unsyncedProgress)
      });

      if (response.ok) {
        const tx = db.transaction('progress', 'readwrite');
        const store = tx.objectStore('progress');
        for (const progress of unsyncedProgress) {
          progress.synced = 1;
          await store.put(progress);
        }
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
} 