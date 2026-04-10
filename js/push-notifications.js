(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────
     push-notifications.js  — Firebase Cloud Messaging (FCM)
     Requiere: VAPID key en firebase-config.js + service worker registrado

     Para activar:
     1. Obtener VAPID public key desde Firebase Console
        (Project settings → Cloud Messaging → Web Push certificates)
     2. Reemplazar VAPID_KEY abajo
     3. Descomentar el registro del SW en service-worker.js
     4. El usuario debe dar permiso al hacer clic en un CTA

     API pública: window.AltorraPush.{requestPermission, subscribe, unsubscribe, isSupported}
  ────────────────────────────────────────────────────────────────*/

  const VAPID_KEY = 'REEMPLAZAR_CON_VAPID_KEY_DE_FIREBASE_CONSOLE';
  const LS_TOKEN  = 'altorra:fcm-token';
  const LS_SUBS   = 'altorra:push-subscribed';

  function isSupported() {
    return 'Notification' in window
      && 'serviceWorker' in navigator
      && 'PushManager' in window;
  }

  async function getMessaging() {
    if (!window.firebaseApp) return null;
    try {
      const { getMessaging } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging.js');
      return getMessaging(window.firebaseApp);
    } catch (_) { return null; }
  }

  async function requestPermission() {
    if (!isSupported()) {
      console.warn('[Push] No soportado en este navegador');
      return null;
    }

    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      console.warn('[Push] Permiso denegado');
      return null;
    }

    return subscribe();
  }

  async function subscribe() {
    const messaging = await getMessaging();
    if (!messaging) return null;

    try {
      const { getToken } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging.js');

      const sw = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: sw,
      });

      if (token) {
        localStorage.setItem(LS_TOKEN, token);
        localStorage.setItem(LS_SUBS, '1');
        await saveTokenToFirestore(token);
        console.info('[Push] Suscripción exitosa');
        return token;
      }
    } catch (err) {
      console.warn('[Push] Error al suscribir:', err);
    }
    return null;
  }

  async function unsubscribe() {
    const messaging = await getMessaging();
    if (!messaging) return;

    try {
      const { getToken, deleteToken } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging.js');

      const sw    = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: sw });
      if (token) await deleteToken(messaging, token);

      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_SUBS);
      console.info('[Push] Desuscripción exitosa');
    } catch (err) {
      console.warn('[Push] Error al desuscribir:', err);
    }
  }

  async function saveTokenToFirestore(token) {
    if (!window.db) return;
    try {
      const { doc, setDoc, serverTimestamp } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

      // Guardar bajo /push_tokens/{token} (o /usuarios/{uid}/tokens si autenticado)
      await setDoc(doc(window.db, 'push_tokens', token), {
        token,
        ua:        navigator.userAgent.slice(0, 200),
        createdAt: serverTimestamp(),
        activo:    true,
      }, { merge: true });
    } catch (_) { /* no crítico */ }
  }

  /* Manejar mensajes en primer plano */
  async function setupForegroundHandler() {
    const messaging = await getMessaging();
    if (!messaging) return;

    try {
      const { onMessage } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging.js');

      onMessage(messaging, payload => {
        const { title, body, icon } = payload.notification || {};
        if (!title) return;

        // Mostrar toast nativo (si no está en foco) o toast Altorra
        if (document.hidden) {
          new Notification(title, { body, icon: icon || '/favicon.ico' });
        } else if (window.AltorraUtils?.showToast) {
          window.AltorraUtils.showToast(`${title}: ${body}`, 'info');
        }
      });
    } catch (_) {}
  }

  /* Renderizar botón de suscripción en un contenedor */
  function renderButton(containerId, opts = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!isSupported()) { el.style.display = 'none'; return; }

    const subscribed = localStorage.getItem(LS_SUBS) === '1';
    const label      = subscribed ? (opts.labelOff || 'Desactivar alertas') : (opts.labelOn || 'Activar alertas de propiedades');
    const style      = [
      'padding:9px 18px;border:1.5px solid var(--gold,#d4af37);border-radius:10px;',
      'background:' + (subscribed ? '#fff' : 'linear-gradient(135deg,#d4af37,#ffb400)') + ';',
      'color:' + (subscribed ? 'var(--gold,#d4af37)' : '#000') + ';',
      'font-weight:700;font-size:.85rem;cursor:pointer;font-family:Poppins,sans-serif;',
    ].join('');

    el.innerHTML = `<button id="_pushBtn" style="${style}">🔔 ${label}</button>`;
    el.querySelector('#_pushBtn').addEventListener('click', async () => {
      if (subscribed) {
        await unsubscribe();
      } else {
        await requestPermission();
      }
      renderButton(containerId, opts); // re-render con estado actualizado
    });
  }

  window.AltorraPush = { requestPermission, subscribe, unsubscribe, isSupported, renderButton };

  // Setup handler en primer plano cuando Firebase esté listo
  window.addEventListener('altorra:firebase-full-ready', setupForegroundHandler, { once: true });
  if (window.firebaseApp) setupForegroundHandler();

})();
