const CACHE_NAME = 'altorra-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/home.html',
  '/propiedades-comprar.html',
  '/propiedades-arrendar.html',
  '/propiedades-alojamientos.html',
  '/detalle-propiedad.html',
  '/gracias.html',
  '/contacto.html',
  '/properties/data.json',
  '/header.html',
  '/footer.html',
  // imágenes en raíz (prefijo slash) utilizadas en data.json
  '/comprar1.png','/comprar2.png','/comprar3.png','/comprar4.png',
  '/arrendar1.png','/arrendar2.png','/arrendar3.png',
  '/dias1.png','/dias2.png','/dias3.png',
  // imágenes duplicadas en carpeta uploads por compatibilidad
  '/img/uploads/comprar1.png','/img/uploads/comprar2.png','/img/uploads/comprar3.png','/img/uploads/comprar4.png',
  '/img/uploads/arrendar1.png','/img/uploads/arrendar2.png','/img/uploads/arrendar3.png',
  '/img/uploads/dias1.png','/img/uploads/dias2.png','/img/uploads/dias3.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});