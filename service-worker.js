/* ===========================================
   service-worker.js — ALTORRA (modo obra / kill-switch)
   El sitio viejo quedó en mantenimiento (greenfield 2026-07-10).
   Este SW se auto-destruye: borra TODOS los cachés del shell viejo,
   se des-registra y recarga las pestañas para que el visitante vea
   la página de mantenimiento fresca. Sin handler de fetch → todo va a red.
   =========================================== */

const CACHE_NAME = 'altorra-pwa-v5'; // kill-switch (v4 = último shell del sitio viejo)

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
