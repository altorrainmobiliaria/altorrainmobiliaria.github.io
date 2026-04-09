/**
 * firebase-config.js — Altorra Inmobiliaria
 * Inicialización de Firebase con carga prioritaria.
 *
 * CREDENCIALES: Reemplazar los valores TODO con los del proyecto Firebase.
 * Las API keys de Firebase son públicas por diseño (la seguridad real
 * está en firestore.rules y storage.rules).
 *
 * Patrón: carga crítica primero (Auth + Firestore), resto diferido.
 */

(async function initFirebase() {
  // ── Configuración del proyecto ─────────────────────────────────
  // TODO: reemplazar con los valores reales de Firebase Console
  // Proyecto → Configuración del proyecto → Tus apps → Config
  const FIREBASE_CONFIG = {
    apiKey:            'TODO_API_KEY',
    authDomain:        'altorra-inmobiliaria.firebaseapp.com',
    databaseURL:       'https://altorra-inmobiliaria-default-rtdb.firebaseio.com',
    projectId:         'altorra-inmobiliaria',
    storageBucket:     'altorra-inmobiliaria.appspot.com',
    messagingSenderId: 'TODO_SENDER_ID',
    appId:             'TODO_APP_ID',
    measurementId:     'TODO_MEASUREMENT_ID',
  };

  // Guardia: no inicializar si ya está listo (evita doble init en PWA)
  if (window.db && window.auth) return;

  try {
    // ── 1. Carga crítica en paralelo: App + Auth + Firestore ──────
    const [
      { initializeApp },
      { getAuth, onAuthStateChanged },
      { getFirestore, enableMultiTabIndexedDbPersistence, doc, getDoc, setDoc, serverTimestamp },
    ] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js'),
    ]);

    window.firebaseApp = initializeApp(FIREBASE_CONFIG);
    window.auth        = getAuth(window.firebaseApp);
    window.db          = getFirestore(window.firebaseApp);

    // Persistencia offline multi-tab (IndexedDB)
    try {
      await enableMultiTabIndexedDbPersistence(window.db);
    } catch (err) {
      if (err.code === 'failed-precondition') {
        // Múltiples tabs — solo la primera obtiene persistencia
        console.warn('[Firebase] Persistencia limitada (múltiples tabs).');
      } else if (err.code === 'unimplemented') {
        console.warn('[Firebase] Navegador sin soporte de IndexedDB.');
      }
    }

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
    // El sitio sigue funcionando con data.json de fallback (mientras se migra)
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
