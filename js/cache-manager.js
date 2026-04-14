/**
 * cache-manager.js — Altorra Inmobiliaria
 * Sistema de caché de 3 capas con invalidación inteligente.
 *
 * Capas:
 *   L1  Memory (Map JS)    — más rápido, se pierde al recargar la pestaña
 *   L2  localStorage       — persiste entre sesiones, ~5 MB límite
 *   L3  IndexedDB          — persiste entre sesiones, sin límite práctico
 *
 * Señales de invalidación:
 *   1. Firestore system/meta.lastModified  — onSnapshot → invalida en tiempo real
 *      (se activa cuando el admin guarda una propiedad)
 *   2. data/deploy-info.json polling cada 10 min → invalida si versión cambió
 *      (GitHub Actions actualiza este archivo en cada deploy)
 *
 * API pública (window.AltorraCache):
 *   AltorraCache.get(key)
 *   AltorraCache.set(key, value, ttlMs?)
 *   AltorraCache.invalidate()        — limpia todas las capas
 *   AltorraCache.clearAndReload()    — nuclear: limpia todo + recarga la página
 *   AltorraCache.markFresh(ts)       — actualiza sello de versión meta
 *   AltorraCache.info()              — info de debug del estado actual
 */

(function () {
  'use strict';

  const NS              = 'altorra:cache:';
  const META_KEY        = NS + 'meta-version';
  const DEPLOY_KEY      = NS + 'deploy-version';
  const DEPLOY_URL      = 'data/deploy-info.json';
  const DEPLOY_POLL_MS  = 10 * 60 * 1000;   // 10 minutos
  const DEFAULT_TTL     = 5 * 60 * 1000;    // 5 minutos
  const IDB_NAME        = 'altorra-cache';
  const IDB_STORE       = 'entries';
  const IDB_VERSION     = 1;

  // ── L1: Memory ────────────────────────────────────────────────────────────
  const memStore = new Map();

  function memGet(key) {
    const entry = memStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) { memStore.delete(key); return null; }
    return entry.value;
  }

  function memSet(key, value, ttlMs = DEFAULT_TTL) {
    memStore.set(key, { value, expires: Date.now() + ttlMs });
  }

  function memClear() { memStore.clear(); }

  // ── L2: localStorage ──────────────────────────────────────────────────────
  function lsGet(key) {
    try {
      const raw = localStorage.getItem(NS + key);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry || Date.now() > entry.expires) {
        localStorage.removeItem(NS + key);
        return null;
      }
      return entry.value;
    } catch (_) { return null; }
  }

  function lsSet(key, value, ttlMs = DEFAULT_TTL) {
    try {
      localStorage.setItem(NS + key, JSON.stringify({ value, expires: Date.now() + ttlMs }));
    } catch (_) {}
  }

  function lsClear() {
    try {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(NS)) toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    } catch (_) {}
  }

  // ── L3: IndexedDB ─────────────────────────────────────────────────────────
  let _idb = null;

  function openIDB() {
    if (_idb) return Promise.resolve(_idb);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = e => {
        e.target.result.createObjectStore(IDB_STORE, { keyPath: 'key' });
      };
      req.onsuccess = e => { _idb = e.target.result; resolve(_idb); };
      req.onerror   = () => reject(req.error);
    });
  }

  async function idbGet(key) {
    try {
      const db = await openIDB();
      return new Promise((resolve) => {
        const tx  = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get(NS + key);
        req.onsuccess = () => {
          const entry = req.result;
          if (!entry || Date.now() > entry.expires) { resolve(null); return; }
          resolve(entry.value);
        };
        req.onerror = () => resolve(null);
      });
    } catch (_) { return null; }
  }

  async function idbSet(key, value, ttlMs = DEFAULT_TTL) {
    try {
      const db = await openIDB();
      return new Promise((resolve) => {
        const tx  = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put({ key: NS + key, value, expires: Date.now() + ttlMs });
        tx.oncomplete = () => resolve();
        tx.onerror    = () => resolve();
      });
    } catch (_) {}
  }

  async function idbClear() {
    try {
      const db = await openIDB();
      return new Promise((resolve) => {
        const tx  = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror    = () => resolve();
      });
    } catch (_) {}
  }

  // ── API principal ─────────────────────────────────────────────────────────

  /** Leer: L1 → L2 → L3 → null */
  async function get(key) {
    const m = memGet(key);
    if (m !== null) return m;

    const l = lsGet(key);
    if (l !== null) { memSet(key, l); return l; }

    const i = await idbGet(key);
    if (i !== null) { memSet(key, i); lsSet(key, i); return i; }

    return null;
  }

  /** Escribir en las 3 capas */
  async function set(key, value, ttlMs = DEFAULT_TTL) {
    memSet(key, value, ttlMs);
    lsSet(key, value, ttlMs);
    await idbSet(key, value, ttlMs);
  }

  /** Invalidar todas las capas y refrescar datos.
   *  Importante: espera a que PropertyDatabase termine de recargar ANTES de
   *  disparar 'altorra:cache-invalidated', para que los listeners vean datos
   *  frescos cuando consulten window.propertyDB.filter() / getById(). */
  async function invalidate() {
    memClear();
    lsClear();
    await idbClear();
    if (window.propertyDB && typeof window.propertyDB.refresh === 'function') {
      try { await window.propertyDB.refresh(); } catch (_) { /* no crítico */ }
    }
    window.dispatchEvent(new CustomEvent('altorra:cache-invalidated'));
    console.log('[AltorraCache] Caché invalidada ✅');
  }

  /** Nuclear: limpia todo + recarga la página */
  async function clearAndReload() {
    await invalidate();
    try {
      const { terminate } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      if (window.db) await terminate(window.db);
      const dbs = await indexedDB.databases();
      for (const d of dbs) {
        if (d.name && (d.name.includes('firestore') || d.name.includes('firebase'))) {
          indexedDB.deleteDatabase(d.name);
        }
      }
    } catch (_) {}
    console.log('[AltorraCache] Limpieza total. Recargando...');
    location.reload();
  }

  /** Guardar timestamp de versión Firestore */
  function markFresh(timestamp) {
    try { localStorage.setItem(META_KEY, String(timestamp)); } catch (_) {}
  }

  /** Info de debug */
  function info() {
    const deploy  = localStorage.getItem(DEPLOY_KEY) || 'desconocida';
    const meta    = localStorage.getItem(META_KEY) || 'sin escuchar';
    const memSize = memStore.size;
    return { deploy, meta, memEntries: memSize };
  }

  // ── Señal 1: Firestore system/meta.lastModified (onSnapshot) ─────────────
  function startMetaListener() {
    if (!window.db) {
      window.addEventListener('altorra:firebase-ready', startMetaListener, { once: true });
      return;
    }
    (async () => {
      try {
        const { doc, onSnapshot } =
          await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

        onSnapshot(doc(window.db, 'system', 'meta'), (snap) => {
          if (!snap.exists()) return;
          const ts = snap.data().lastModified;
          if (!ts) return;

          const incoming  = typeof ts.toMillis === 'function' ? String(ts.toMillis()) : String(ts);
          const lastKnown = localStorage.getItem(META_KEY);

          if (lastKnown && lastKnown !== incoming) {
            console.log('[AltorraCache] Cambio en Firestore detectado → invalidando caché');
            markFresh(incoming);
            invalidate();
          } else {
            markFresh(incoming);
          }
        }, (err) => {
          // Falla silenciosa si no hay credenciales aún
          console.debug('[AltorraCache] onSnapshot system/meta:', err.code);
        });
      } catch (_) {}
    })();
  }

  // ── Señal 2: Polling deploy-info.json (GitHub Actions) ───────────────────
  async function checkDeploy() {
    try {
      const res     = await fetch(DEPLOY_URL, { cache: 'no-store' });
      if (!res.ok) return;
      const info    = await res.json();
      const version = info.version || info.commit || '';
      if (!version) return;

      const stored = localStorage.getItem(DEPLOY_KEY);
      if (stored && stored !== version) {
        console.log('[AltorraCache] Nuevo deploy detectado →', version);
        localStorage.setItem(DEPLOY_KEY, version);
        invalidate();
      } else if (!stored) {
        localStorage.setItem(DEPLOY_KEY, version);
      }
    } catch (_) {}
  }

  // ── Arranque ──────────────────────────────────────────────────────────────
  function init() {
    startMetaListener();
    checkDeploy();
    setInterval(checkDeploy, DEPLOY_POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── API global ────────────────────────────────────────────────────────────
  window.AltorraCache = { get, set, invalidate, clearAndReload, markFresh, info };

  console.log('[AltorraCache] Módulo cargado ✅');
})();
