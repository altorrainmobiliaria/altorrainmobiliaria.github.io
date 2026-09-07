/**
 * firebase-config.js — Altorra Inmobiliaria
 * Inicialización de Firebase con carga prioritaria.
 *
 * Las API keys de Firebase son públicas por diseño (la seguridad real
 * está en firestore.rules, storage.rules y database.rules.json).
 *
 * El propietario solo necesita mantener actualizados:
 *   - FIREBASE_CONFIG      (ya con valores reales del proyecto)
 *   - window.AltorraKeys   (Google Maps + VAPID / FCM — ver arriba)
 *
 * Patrón: carga crítica primero (Auth + Firestore), resto diferido.
 */

// ══════════════════════════════════════════════════════════════════════════
// Claves adicionales del proyecto (Google Maps, FCM, etc.)
// El propietario SOLO debe editar este bloque — los módulos consumidores
// (mapa-propiedades.js) lee desde window.AltorraKeys.
// ══════════════════════════════════════════════════════════════════════════
window.AltorraKeys = Object.assign({
  // Google Maps JavaScript API — https://console.cloud.google.com/google/maps-apis
  // Restringir por HTTP referrer a altorrainmobiliaria.co y *.altorrainmobiliaria.co
  gmapsApiKey: '',
  // FCM Web Push — Firebase Console → Project settings → Cloud Messaging → Web Push certificates
  vapidKey:    '',
}, window.AltorraKeys || {});

(async function initFirebase() {
  // ── Configuración del proyecto ─────────────────────────────────
  // Las API keys de Firebase son públicas por diseño — la seguridad
  // real vive en firestore.rules / storage.rules / database.rules.json.
  const FIREBASE_CONFIG = {
    apiKey:            'AIzaSyCLxOwj3837m6p9QFDBWzVTuNUFhBkCg_I',
    authDomain:        'altorra-inmobiliaria-345c6.firebaseapp.com',
    databaseURL:       'https://altorra-inmobiliaria-345c6-default-rtdb.firebaseio.com',
    projectId:         'altorra-inmobiliaria-345c6',
    storageBucket:     'altorra-inmobiliaria-345c6.firebasestorage.app',
    messagingSenderId: '794130975989',
    appId:             '1:794130975989:web:0874276ae92ad65dcb89bc',
    measurementId:     'G-K028T9SV9Z',
  };

  // Guardia: no inicializar si ya está listo (evita doble init en PWA)
  if (window.db && window.auth) return;

  try {
    // ── 1. Carga crítica en paralelo: App + Auth + Firestore ──────
    const [
      { initializeApp },
      { getAuth, onAuthStateChanged },
      { getFirestore, doc, getDoc, setDoc, serverTimestamp },
    ] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js'),
    ]);

    window.firebaseApp = initializeApp(FIREBASE_CONFIG);
    window.auth        = getAuth(window.firebaseApp);
    window.db          = getFirestore(window.firebaseApp);

    /* ── SIN persistencia offline, a propósito (§135) ─────────────────────────────────────────────
     * Aquí vivía `enableMultiTabIndexedDbPersistence()`. Se retira por DOS razones, y la segunda
     * pesa más que la primera:
     *
     * 1️⃣ CAUSABA UN FALLO DE ACCESO. Esa API comparte UNA sola conexión entre todas las pestañas
     *    abiertas: una hace de «principal» y las demás salen por ella. Si la principal es una pestaña
     *    vieja sin sesión, las lecturas de las otras viajan **sin credencial** y Firestore responde
     *    `Missing or insufficient permissions` — aunque la persona esté perfectamente autenticada en
     *    la pestaña que mira. Es lo que dejó al dueño fuera de su panel: entraba bien y el sistema le
     *    decía «no se encontró tu perfil». Los 3 reintentos que había ya existían por este mismo bug
     *    («fix Access denied for UID»), pero reintentar no arregla salir por la puerta equivocada.
     *    Google además la marcó DEPRECADA; el aviso salía en consola desde hace tiempo.
     *
     * 2️⃣ 🔒 GUARDABA DATOS AJENOS EN EL DISCO DEL NAVEGADOR. La persistencia copia a IndexedDB TODO
     *    lo que el panel lee: leads con nombre y teléfono, contratos, expedientes. En un computador
     *    compartido o robado, eso queda ahí, legible, sin sesión. Para un panel que maneja cédulas y
     *    arriendos, el principio de minimización de la Ley 1581 no admite «lo cacheo por comodidad».
     *
     * ¿Qué se pierde? Trabajar sin internet. En un panel de administración eso no es una función:
     * es una forma de mirar datos viejos creyendo que son de hoy. Si algún día hiciera falta, la API
     * viva es `persistentLocalCache({ tabManager: persistentMultipleTabManager() })` — pero volvería
     * a traer el punto 2️⃣, así que tendría que decidirse a sabiendas.
     */

    // Asegurar documento system/meta para cache-manager
    try {
      const metaRef  = doc(window.db, 'system', 'meta');
      const metaSnap = await getDoc(metaRef);
      if (!metaSnap.exists()) {
        await setDoc(metaRef, { lastModified: serverTimestamp() });
      }
    } catch (_) {
      // Sin credenciales aún — ignorar silenciosamente
    }

    // Señal: Firebase listo
    window.dispatchEvent(new CustomEvent('altorra:firebase-ready'));

    // ── 2. Carga diferida en background: Storage, Functions, Analytics, RTDB
    Promise.all([
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-functions.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js'),
    ]).then(([storageM, functionsM, analyticsM, rtdbM]) => {
      window.storage           = storageM.getStorage(window.firebaseApp);
      window.functions         = functionsM.getFunctions(window.firebaseApp, 'us-central1');
      window.firebaseAnalytics = analyticsM.getAnalytics(window.firebaseApp);
      window.rtdb              = rtdbM.getDatabase(window.firebaseApp);
      window.dispatchEvent(new CustomEvent('altorra:firebase-full-ready'));
    }).catch(err => console.warn('[Firebase] Error cargando SDKs diferidos:', err));

  } catch (err) {
    console.error('[Firebase] Error de inicialización:', err);
    // Sin fallback estático: el catálogo es 100% dinámico desde Firestore.
  }

  // ── Helper de debug para limpiar caché (usar en consola del navegador) ──
  window.clearFirestoreCache = async () => {
    try {
      const { terminate } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      if (window.db) await terminate(window.db);
      const dbs = await indexedDB.databases();
      for (const d of dbs) {
        if (d.name && d.name.includes('firestore')) {
          indexedDB.deleteDatabase(d.name);
        }
      }
      console.log('[Firebase] Caché limpiado. Recargando...');
      location.reload();
    } catch (e) {
      console.error('[Firebase] Error limpiando caché:', e);
    }
  };
})();
