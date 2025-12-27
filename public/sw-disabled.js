// SERVICE WORKER DESACTIVADO TEMPORALMENTE
// Para evitar conflictos con Next.js development

console.log('Service Worker desactivado - modo desarrollo')

self.addEventListener('install', event => {
  console.log('SW: Install - No caching')
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  console.log('SW: Activate - Clearing all caches')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Eliminando cache:', cacheName)
          return caches.delete(cacheName)
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// NO hacer fetch interception - dejar que Next.js maneje todo
self.addEventListener('fetch', event => {
  // No hacer nada - dejar pasar todas las requests
  return
})
