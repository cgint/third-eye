// Development service worker that unregisters itself
self.addEventListener('install', event => {
  console.log('Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service worker activated');
  
  // Unregister this service worker in development
  self.registration.unregister()
    .then(() => {
      console.log('Service worker unregistered successfully');
    })
    .catch(error => {
      console.error('Error unregistering service worker:', error);
    });
    
  // Clear any caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Let browser handle requests normally in development
}); 