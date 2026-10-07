const CACHE_NAME = 'legato-v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) {
    return
  }

  // El propio service worker y el manifest siempre desde la red.
  if (url.pathname === '/sw.js' || url.pathname === '/manifest.webmanifest') {
    return
  }

  // HTML / navegación: network-first para recoger cada despliegue.
  // Si no hay red, se usa la última copia cacheada.
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy.clone())
              cache.put('/', copy)
            })
          }
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match('/')),
        ),
    )
    return
  }

  // Assets con hash: cache-first (no cambian de contenido).
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached !== undefined) {
        return cached
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
