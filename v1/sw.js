// Nombre de la caché
const CACHE_NAME = 'tareas-app-v1';

// Recursos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index1.html',
  '/manifest.json'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activa el SW inmediatamente
  );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Eliminando caché obsoleta', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Reclama todas las pestañas abiertas
  );
});

// Estrategia de caché: Network First, luego caché
self.addEventListener('fetch', event => {
  // No interceptamos peticiones a Firebase o ImgBB
  if (event.request.url.includes('firebasestorage') || 
      event.request.url.includes('firestore') || 
      event.request.url.includes('imgbb.com') ||
      event.request.url.includes('firebase')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, la clonamos y almacenamos en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentamos recuperar desde la caché
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no encontramos en caché, mostramos la página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            // Para otros recursos, simplemente fallamos
            return new Response('No se pudo cargar el recurso', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});