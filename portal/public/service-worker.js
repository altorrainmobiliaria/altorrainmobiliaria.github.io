/* ===========================================
   service-worker.js — PORTAL · kill-switch heredado del sitio viejo
   ===========================================
   QUÉ ES. La misma pieza que el sitio viejo sirve hoy en `/service-worker.js`
   desde la RAÍZ del repo (GitHub Pages). El código de abajo es idéntico línea
   por línea; solo cambian estos comentarios.

   POR QUÉ ESTÁ AQUÍ. Hasta el 10-jul-2026 el sitio viejo era una PWA: su
   `scripts.js` registraba `/service-worker.js` con scope `/` y aquel SW tenía
   caché propia y handler de `fetch`. Un navegador que lo registró y no ha
   vuelto lo sigue teniendo. El día que el DNS de altorrainmobiliaria.co pase
   al Worker del portal, ese navegador le pedirá `/service-worker.js` AL WORKER
   para ver si hay versión nueva:
     · si recibe un 404, la actualización falla y CONSERVA el SW viejo, que
       sigue interceptando peticiones con la caché del sitio viejo;
     · si recibe este fichero (bytes distintos, así que lo instala), borra
       TODAS las cachés, se des-registra y recarga las pestañas, que ya cargan
       el portal desde la red.
   No tiene handler de `fetch`: mientras vive, todo va a red. Dispara una sola
   vez por navegador; después no queda registro y nadie lo vuelve a pedir.

   LO QUE NO ES. Ninguna página del portal lo registra (no hay
   `serviceWorker.register` en `portal/src` ni en el HTML construido), así que
   no añade una capa de caché al portal: solo atiende registros que ya existen.

   `CACHE_NAME` no la lee nadie (lección L-67): no se bumpea. El gate #4 del
   cerebro y `scripts/fix-i18n-macro.mjs` leen la copia de la RAÍZ, no esta.

   CABECERAS. Lo sirve la capa de assets de Workers (`run_worker_first` solo
   cubre `/*.html`) con su cabecera por defecto `Cache-Control: public,
   max-age=0, must-revalidate` + ETag: se revalida en cada petición. Además el
   registro viejo usa `updateViaCache` por defecto ('imports'), así que el
   navegador pide este script saltándose su caché HTTP. No hace falta `_headers`.

   HASTA CUÁNDO. Un registro de SW no caduca solo, y desde aquí no se puede
   contar cuántos navegadores lo conservan. Tenerlo cuesta unos 3 KB estáticos
   y cero ejecución; quitarlo antes de tiempo deja a quien vuelva tarde con el
   sitio viejo en caché. Como mínimo, 12 meses después del cambio de dominio
   (decisión técnica del 5-oct-2026, registrada en el ADR-326 del cerebro:
   resuelve el TODO-24); retirarlo después es una decisión, no una limpieza.
   =========================================== */

const CACHE_NAME = 'altorra-pwa-v6'; // kill-switch (v4 = último shell del sitio viejo)

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => client.navigate(client.url));
  })());
});
