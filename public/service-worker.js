self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('kalanden-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/courses',
          '/instructors',
          '/manifest.json',
          '/favicon.ico',
          '/styles.css',
          // Add any other assets that need to be cached
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Serve from cache
        }
        return fetch(event.request); // Fetch from network if not in cache
      })
    );
  });
  