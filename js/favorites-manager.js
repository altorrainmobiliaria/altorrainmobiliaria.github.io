/**
 * favorites-manager.js — Favoritos con sincronización Firebase
 * Altorra Inmobiliaria
 *
 * Patrón: Altorra Cars favorites-manager.js
 *
 * Estrategia:
 *   1. Siempre lee/escribe en localStorage primero (offline-first).
 *   2. Si hay Firebase Auth (usuario anónimo o autenticado), sincroniza
 *      con Firestore: colección `favoritos/{uid}/items`.
 *   3. Si no hay Firebase, funciona 100% con localStorage (igual que antes).
 *
 * Compatibilidad: API idéntica a window.AltorraFavoritos para no romper
 * el código existente (favoritos.js + favoritos.html).
 *
 * Campos almacenados (mismos que favoritos.js actual):
 *   { id, title, city, price, image, operation, beds, baths, sqm, type, addedAt }
 */

(function () {
  'use strict';

  const LS_KEY  = 'altorra:favoritos';
  const EVENT   = 'altorra:fav-update';

  /* ─── localStorage ──────────────────────────────────────── */
  function lsGet() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function lsSet(favs) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(favs));
    } catch { /* cuota excedida */ }
  }

  /* ─── Firestore sync (si está disponible) ───────────────── */
  let _fsUnsubscribe = null;

  async function getColRef(uid) {
    const { collection, doc } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    return collection(window.db, 'favoritos', uid, 'items');
  }

  async function fsWrite(uid, favs) {
    if (!window.db) return;
    const { doc, setDoc, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    const docRef = doc(window.db, 'favoritos', uid);
    await setDoc(docRef, { items: favs, updatedAt: serverTimestamp() }, { merge: true });
  }

  async function fsRead(uid) {
    if (!window.db) return null;
    const { doc, getDoc } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    const snap = await getDoc(doc(window.db, 'favoritos', uid));
    return snap.exists() ? (snap.data().items || []) : null;
  }

  /* ─── Merge local + remoto ──────────────────────────────── */
  function mergeFavorites(local, remote) {
    if (!remote || !remote.length) return local;
    const map = new Map(local.map(f => [f.id, f]));
    remote.forEach(f => { if (!map.has(f.id)) map.set(f.id, f); });
    return Array.from(map.values()).sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }

  /* ─── Autenticación anónima helper ──────────────────────── */
  async function ensureAuth() {
    if (!window.auth) return null;
    const { signInAnonymously, onAuthStateChanged } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');
    if (window.auth.currentUser) return window.auth.currentUser;
    try {
      const { user } = await signInAnonymously(window.auth);
      return user;
    } catch { return null; }
  }

  /* ─── Sincronización inicial: merge local ↔ Firestore ──── */
  async function syncOnInit() {
    const user = await ensureAuth();
    if (!user || !window.db) return;

    try {
      const remote = await fsRead(user.uid);
      const local  = lsGet();

      if (remote !== null) {
        const merged = mergeFavorites(local, remote);
        lsSet(merged);
        if (JSON.stringify(merged) !== JSON.stringify(remote)) {
          await fsWrite(user.uid, merged);
        }
      } else {
        // No hay datos remotos — subir los locales
        if (local.length) await fsWrite(user.uid, local);
      }

      // Notificar que el badge puede haber cambiado
      document.dispatchEvent(new CustomEvent(EVENT, { detail: { count: lsGet().length } }));
    } catch (err) {
      console.warn('[FavManager] Error en sync inicial:', err);
    }
  }

  /* ─── API pública ───────────────────────────────────────── */
  function getAll() { return lsGet(); }

  function isFavorite(id) { return lsGet().some(f => f.id === String(id)); }

  async function add(prop) {
    const favs = lsGet();
    const id   = String(prop.id);
    if (favs.some(f => f.id === id)) return;

    const item = {
      id,
      title:     prop.title     || prop.titulo     || '',
      city:      prop.city      || prop.ciudad      || '',
      price:     prop.price     || prop.precio      || 0,
      image:     prop.image     || prop.imagen      || '',
      operation: prop.operation || prop.operacion   || '',
      beds:      prop.beds      || prop.habitaciones|| 0,
      baths:     prop.baths     || prop.banos       || 0,
      sqm:       prop.sqm       || 0,
      type:      prop.type      || prop.tipo        || '',
      addedAt:   Date.now(),
    };

    favs.push(item);
    lsSet(favs);
    document.dispatchEvent(new CustomEvent(EVENT, { detail: { count: favs.length } }));

    // Sync asíncrono — no bloquea UI
    ensureAuth().then(user => {
      if (user && window.db) fsWrite(user.uid, lsGet()).catch(() => {});
    });
  }

  async function remove(id) {
    const favs = lsGet().filter(f => f.id !== String(id));
    lsSet(favs);
    document.dispatchEvent(new CustomEvent(EVENT, { detail: { count: favs.length } }));

    ensureAuth().then(user => {
      if (user && window.db) fsWrite(user.uid, lsGet()).catch(() => {});
    });
  }

  async function toggle(prop) {
    const id = String(prop.id);
    if (isFavorite(id)) { await remove(id); return false; }
    await add(prop); return true;
  }

  function clear() {
    lsSet([]);
    document.dispatchEvent(new CustomEvent(EVENT, { detail: { count: 0 } }));
    ensureAuth().then(user => {
      if (user && window.db) fsWrite(user.uid, []).catch(() => {});
    });
  }

  /* ─── Bootstrap ─────────────────────────────────────────── */
  // Intentar sync cuando Firebase esté listo
  function trySync() {
    if (window.auth && window.db) {
      syncOnInit();
    } else {
      window.addEventListener('altorra:firebase-ready', () => syncOnInit(), { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trySync);
  } else {
    trySync();
  }

  /* ─── Exponer API global — compatible con favoritos.js anterior ── */
  window.AltorraFavoritos = {
    get:        getAll,
    add,
    remove,
    toggle,
    isFavorite,
    clear,
    sync:       syncOnInit,
    // Alias para compatibilidad
    init: () => {},   // no-op, inicialización es automática
  };

})();
