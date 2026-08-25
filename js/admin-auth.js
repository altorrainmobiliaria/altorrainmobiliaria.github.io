/**
 * admin-auth.js — Autenticación y RBAC del panel de administración
 * Altorra Inmobiliaria
 *
 * Flujo:
 *   1. signInWithEmailAndPassword()  ← el límite de fuerza bruta lo pone el proveedor, no nosotros
 *   2. Cargar perfil usuarios/{uid} → rol
 *   3. Verificar estado bloqueado / desactivado
 *   4. Registrar el acceso en la bitácora (servidor)
 *   5. applyRolePermissions() → mostrar/ocultar UI
 *
 * Seguridad:
 *   - Timeout de sesión: 8 horas · Inactividad: 30 min (advertencia 1 min antes)
 *   - Retry 3x con backoff al cargar perfil (fix bug "Access denied for UID")
 *   - Recuperación de contraseña sin filtrar qué correos existen (§128)
 *   - Bitácora de acceso escrita por el SERVIDOR (§130)
 *
 * ⚠️ Esto NO es una frontera de seguridad: corre en el navegador y decide qué se DIBUJA. La frontera
 * son las Security Rules. Se dejó de imitar el patrón de Altorra Cars justamente por ahí: allá el
 * segundo factor se resuelve con una variable de JavaScript (`_2faVerified`), y una variable del
 * navegador no protege un dato del servidor (§130).
 */

(function () {
  'use strict';

  /* ─── Constantes ─────────────────────────────────────── */
  const SESSION_MAX_MS    = 8 * 60 * 60 * 1000;   // 8 horas
  const INACTIVITY_MS     = 30 * 60 * 1000;        // 30 min
  const WARN_BEFORE_MS    = 60 * 1000;             // 1 min antes de expirar
  const PROFILE_RETRY_MAX = 3;
  // MAX_LOGIN_ATTEMPTS y LOCKOUT_MS se fueron con el candado de intentos (§130).

  /* ─── Estado interno ──────────────────────────────────── */
  let _inactivityTimer = null;
  let _warnTimer       = null;
  let _sessionStart    = null;
  let _currentUser     = null;  // { uid, email, rol, nombre }
  let _initialized     = false;

  /* ─── Helpers de UI ───────────────────────────────────── */
  function $(sel, ctx = document) { return ctx.querySelector(sel); }

  function showLogin(msg = '') {
    const loginScreen = $('#loginScreen');
    const adminApp    = $('#adminApp');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminApp) {
      adminApp.classList.remove('visible');
      adminApp.style.display = 'none';
    }
    if (msg) {
      const errEl = $('#loginError');
      if (errEl) { errEl.textContent = msg; errEl.hidden = false; }
    }
  }

  function showApp() {
    const loginScreen = $('#loginScreen');
    const adminApp    = $('#adminApp');
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminApp) {
      // Nota: CSS tiene `#adminApp { display:none }` + HTML inline `style="display:none"`.
      // Necesitamos ambos: clase .visible (`display:flex`) Y sobrescribir el inline.
      adminApp.classList.add('visible');
      adminApp.style.display = 'flex';
    }
  }

  function showToast(msg, type = 'info') {
    if (window.AltorraUtils && window.AltorraUtils.showToast) {
      window.AltorraUtils.showToast(msg, type);
      return;
    }
    const t = document.createElement('div');
    t.className = `admin-toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  function setLoginLoading(loading) {
    const btn = $('#loginBtn');
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Verificando...' : 'Iniciar sesión';
  }

  /* ─── El candado de intentos: RETIRADO (§130) ─────────────────────────────────────────────────
   * Aquí vivían `hashEmail`, `checkLoginAttempts`, `recordLoginFailure` y `resetLoginAttempts`:
   * un contador en Firestore, indexado por el SHA-256 del correo, que bloqueaba la cuenta 15 minutos
   * tras 5 fallos. Se retira entero, y no por simplificar:
   *
   *   · NO protegía — el contador vivía donde escribe el atacante. Poner `intentos:0` antes de cada
   *     prueba lo desactivaba, y la regla lo permitía (`allow create, update: if true`).
   *   · SÍ atacaba — un hash NO es un secreto. Cualquiera calcula el de `info@altorrainmobiliaria.co`,
   *     escribe `bloqueado:true` y deja al dueño fuera. En bucle, indefinidamente.
   *
   * Quien protege de verdad es el límite por IP de **Firebase Auth**: vive en el servidor de Google,
   * es anterior a nuestro código y no se puede tocar desde el navegador. Cuando salta, la propia
   * librería devuelve `auth/too-many-requests`, que ya se traduce abajo.
   *
   * ⚠️ Bloquear una cuenta por intentos fallidos es, por diseño, una negación de servicio esperando
   * a que alguien la use (OWASP ASVS 6.1.1: los controles anti-automatización deben *«prevent
   * malicious account lockout»*). La defensa correcta no es contar en el cliente: es la protección
   * anti-bot del proveedor — hoy APAGADA, y es de las cosas que hay que encender en la consola.
   */

  /* ─── Bitácora de acceso (§130) ───────────────────────────────────────────────────────────────
   * La colección `auditLog` existía en las reglas desde siempre… y NADIE escribía en ella. Una
   * bitácora declarada y vacía es peor que ninguna: quien la busque el día que pase algo creerá que
   * hubo registro y no lo hubo.
   *
   * Se escribe desde el SERVIDOR a propósito. El navegador solo dispara la llamada; el uid, el correo
   * y el rol los pone la Function leyéndolos del token verificado, y la IP la ve ella. Si lo escribiera
   * el cliente, el vigilado estaría redactando su propia bitácora — y las reglas ahora lo prohíben
   * (`create: if false`).
   *
   * ⚠️ Límite honesto: esto registra los ingresos que SALEN BIEN. Un intento fallido nunca llega a
   * nuestro backend, así que registrarlos de verdad exige las *blocking functions* del proveedor.
   * Queda dicho aquí para que nadie lea esta bitácora creyendo que ve los ataques.
   */
  async function registrarAcceso() {
    try {
      const { httpsCallable } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-functions.js');
      await httpsCallable(window.functions, 'registrarEvento')({
        accion: 'acceso',
        origen: 'panel-legacy',
      });
    } catch (err) {
      // Nunca romper el login por la bitácora.
      console.warn('[AdminAuth] no se pudo registrar el acceso:', err && err.code);
    }
  }

  /* ─── Carga de perfil con retry (fix "Access denied for UID") ── */
  async function loadUserProfile(uid, attempt = 1) {
    const { getDoc, doc } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    try {
      const snap = await getDoc(doc(window.db, 'usuarios', uid));
      if (!snap.exists()) return null;
      return snap.data();
    } catch (err) {
      if (attempt < PROFILE_RETRY_MAX) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        return loadUserProfile(uid, attempt + 1);
      }
      console.error('[AdminAuth] Error cargando perfil tras', PROFILE_RETRY_MAX, 'intentos:', err);
      return null;
    }
  }

  /* ─── RBAC — mostrar/ocultar UI según rol ──────────────── */
  function applyRolePermissions(rol) {
    // Elementos visibles solo para super_admin
    document.querySelectorAll('[data-role="super_admin"]').forEach(el => {
      el.style.display = (rol === 'super_admin') ? '' : 'none';
    });
    // Elementos visibles para editor o superior
    document.querySelectorAll('[data-role="editor"]').forEach(el => {
      el.style.display = (rol === 'super_admin' || rol === 'editor') ? '' : 'none';
    });
    // Texto de rol en sidebar
    const rolBadge = $('#sidebarRole');
    if (rolBadge) rolBadge.textContent = rol.replace('_', ' ');
    // Nombre de usuario
    const nameEl = $('#sidebarName');
    if (nameEl && _currentUser) nameEl.textContent = _currentUser.nombre || _currentUser.email;
  }

  /* ─── Timeout e inactividad ────────────────────────────── */
  function resetInactivity() {
    clearTimeout(_inactivityTimer);
    clearTimeout(_warnTimer);

    // Check sesión máxima
    if (_sessionStart && Date.now() - _sessionStart > SESSION_MAX_MS) {
      signOut('Sesión expirada. Por favor vuelve a iniciar sesión.');
      return;
    }

    _warnTimer = setTimeout(() => {
      showToast('Tu sesión expirará en 1 minuto por inactividad.', 'warning');
    }, INACTIVITY_MS - WARN_BEFORE_MS);

    _inactivityTimer = setTimeout(() => {
      signOut('Sesión cerrada por inactividad.');
    }, INACTIVITY_MS);
  }

  function startInactivityWatch() {
    ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(ev => {
      document.addEventListener(ev, resetInactivity, { passive: true });
    });
    resetInactivity();
  }

  function stopInactivityWatch() {
    clearTimeout(_inactivityTimer);
    clearTimeout(_warnTimer);
    ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(ev => {
      document.removeEventListener(ev, resetInactivity);
    });
  }

  /* ─── Sign out ─────────────────────────────────────────── */
  async function signOut(msg = '') {
    stopInactivityWatch();
    _currentUser = null;
    _sessionStart = null;
    try {
      const { signOut: fbSignOut } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');
      await fbSignOut(window.auth);
    } catch { /* si falla el signout, igual limpiamos UI */ }
    showLogin(msg);
    // Avisar a otros módulos
    window.dispatchEvent(new CustomEvent('altorra:admin-signout'));
  }

  /* ─── Login ────────────────────────────────────────────── */
  /* ─── Recuperar contraseña (§128) ───────────────────────
   * Firebase manda el correo por su propia infraestructura, NO por el SMTP de Gmail del proyecto:
   * funciona aunque la contraseña de aplicación siga sin rotar.
   *
   * El mensaje es el MISMO exista o no la cuenta, a propósito: decir «ese correo no está
   * registrado» convierte el formulario en un detector de qué direcciones tienen acceso al panel.
   */
  async function recuperarPassword() {
    const btn   = document.getElementById('btnForgotPass');
    const input = document.getElementById('loginEmail');
    const email = (input && input.value || '').trim();
    const err   = document.getElementById('loginError');

    const decir = (msg) => { if (err) { err.textContent = msg; err.hidden = false; } };

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      decir('Escribe tu correo arriba y vuelve a pulsar aquí.');
      if (input) input.focus();
      return;
    }
    const original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
    try {
      const { sendPasswordResetEmail } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');
      await sendPasswordResetEmail(window.auth, email);
      decir('Si ese correo tiene acceso al panel, le llega un enlace para cambiar la contraseña. Revisa también la carpeta de spam.');
    } catch (e) {
      console.error('[admin] sendPasswordResetEmail:', e);
      // `auth/user-not-found` se trata como éxito por lo mismo de arriba: no se filtra quién existe.
      if (e && e.code === 'auth/user-not-found') {
        decir('Si ese correo tiene acceso al panel, le llega un enlace para cambiar la contraseña. Revisa también la carpeta de spam.');
      } else if (e && e.code === 'auth/too-many-requests') {
        decir('Demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.');
      } else {
        decir('No pudimos enviar el correo. Revisa la conexión e inténtalo de nuevo.');
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = original || '¿Olvidaste tu contraseña?'; }
    }
  }

  async function handleLogin(email, password) {
    if (!window.db || !window.auth) {
      showLogin('Firebase no está disponible aún. Intenta en unos segundos.');
      return;
    }

    setLoginLoading(true);
    const errEl = $('#loginError');
    if (errEl) errEl.hidden = true;

    try {
      // 1. Autenticar con Firebase. El límite de fuerza bruta lo pone el propio proveedor (§130):
      //    es por IP, vive en su servidor y devuelve `auth/too-many-requests` cuando salta.
      const { signInWithEmailAndPassword } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');

      let credential;
      try {
        credential = await signInWithEmailAndPassword(window.auth, email.trim(), password);
      } catch (authErr) {
        // El mensaje NO distingue «no existe» de «clave mala»: decirlo convertiría el formulario en
        // un detector de qué correos tienen acceso al panel (misma razón que en la recuperación, §128).
        if (authErr && authErr.code === 'auth/too-many-requests') {
          showLogin('Demasiados intentos seguidos desde esta conexión. Espera unos minutos y vuelve a intentarlo.');
        } else if (authErr && authErr.code === 'auth/network-request-failed') {
          showLogin('No pudimos contactar el servidor. Revisa tu conexión e inténtalo de nuevo.');
        } else {
          showLogin('Correo o contraseña incorrectos.');
        }
        setLoginLoading(false);
        return;
      }

      const uid = credential.user.uid;

      // 3. Cargar perfil desde Firestore
      const profile = await loadUserProfile(uid);
      if (!profile) {
        await signOut();
        showLogin('No se encontró tu perfil de usuario. Contacta al administrador.');
        setLoginLoading(false);
        return;
      }

      // 4. Verificar que no está bloqueado en Firestore
      if (profile.bloqueado || !profile.activo) {
        await signOut();
        showLogin('Tu cuenta está desactivada. Contacta al administrador.');
        setLoginLoading(false);
        return;
      }

      // 5. Verificar rol válido
      const rolesValidos = ['super_admin', 'editor', 'viewer'];
      if (!rolesValidos.includes(profile.rol)) {
        await signOut();
        showLogin('Rol no reconocido. Contacta al administrador.');
        setLoginLoading(false);
        return;
      }

      // 6. Login exitoso — dejarlo ESCRITO (§130). La bitácora la escribe el servidor con el uid del
      //    token verificado; desde aquí solo se avisa. No se espera (`void`): si la red falla, el
      //    registro se pierde pero la persona entra igual — una bitácora no debe poder tumbar el acceso.
      void registrarAcceso();

      _currentUser  = { uid, email: credential.user.email, ...profile };
      _sessionStart = Date.now();

      applyRolePermissions(profile.rol);
      showApp();
      startInactivityWatch();

      // Avisar a otros módulos
      window.dispatchEvent(new CustomEvent('altorra:admin-ready', {
        detail: { user: _currentUser }
      }));

    } catch (err) {
      console.error('[AdminAuth] Error inesperado en login:', err);
      showLogin('Error inesperado. Intenta de nuevo.');
    } finally {
      setLoginLoading(false);
    }
  }

  /* ─── onAuthStateChanged — restaurar sesión ─────────────── */
  async function initAuthListener() {
    if (!window.auth) {
      // Esperar a que Firebase esté listo
      window.addEventListener('altorra:firebase-ready', () => initAuthListener(), { once: true });
      return;
    }

    const { onAuthStateChanged } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');

    onAuthStateChanged(window.auth, async (fbUser) => {
      if (!fbUser) {
        showLogin();
        return;
      }

      // Usuario ya autenticado (recarga de página)
      const profile = await loadUserProfile(fbUser.uid);
      if (!profile || profile.bloqueado || !profile.activo) {
        await signOut('Sesión inválida. Por favor inicia sesión nuevamente.');
        return;
      }

      _currentUser  = { uid: fbUser.uid, email: fbUser.email, ...profile };
      _sessionStart = Date.now();

      applyRolePermissions(profile.rol);
      showApp();
      startInactivityWatch();

      window.dispatchEvent(new CustomEvent('altorra:admin-ready', {
        detail: { user: _currentUser }
      }));
    });
  }

  /* ─── Inicialización del formulario de login ─────────────── */
  function bindLoginForm() {
    const form = $('#loginForm');
    if (!form) return;

    // Recuperación de contraseña (§128): mismo sitio donde se cablea el login.
    form.querySelector('#btnForgotPass')?.addEventListener('click', recuperarPassword);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = (form.querySelector('#loginEmail') || form.querySelector('[name="email"]'))?.value || '';
      const password = (form.querySelector('#loginPassword') || form.querySelector('[name="password"]'))?.value || '';
      if (!email || !password) return;
      await handleLogin(email, password);
    });
  }

  /* ─── Botón de logout ─────────────────────────────────────── */
  function bindLogout() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#logoutBtn') || e.target.closest('[data-action="logout"]')) {
        signOut();
      }
    });
  }

  /* ─── Navegación de secciones ─────────────────────────────── */
  function bindNavigation() {
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('[data-section]');
      if (!navItem) return;
      const section = navItem.dataset.section;

      // Activar ítem del sidebar
      document.querySelectorAll('[data-section]').forEach(el => el.classList.remove('active'));
      navItem.classList.add('active');

      // Mostrar sección
      document.querySelectorAll('.admin-section').forEach(el => {
        el.classList.toggle('active', el.id === `section-${section}`);
      });

      // Cerrar drawer móvil
      const sidebar = $('.admin-sidebar');
      if (sidebar) sidebar.classList.remove('open');

      // Disparar evento para que el módulo correspondiente cargue datos
      window.dispatchEvent(new CustomEvent('altorra:admin-navigate', { detail: { section } }));
    });

    // Toggle móvil
    const menuBtn = $('#sidebarToggle');
    const sidebar = $('.admin-sidebar');
    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
  }

  /* ─── API pública ─────────────────────────────────────────── */
  window.AdminAuth = {
    getCurrentUser: () => _currentUser,
    getRole:        () => _currentUser?.rol || null,
    isSuperAdmin:   () => _currentUser?.rol === 'super_admin',
    isEditor:       () => ['super_admin', 'editor'].includes(_currentUser?.rol),
    signOut,
    requireAuth(minRole = 'viewer') {
      const roles = ['viewer', 'editor', 'super_admin'];
      const userIdx = roles.indexOf(_currentUser?.rol);
      const minIdx  = roles.indexOf(minRole);
      return _currentUser && userIdx >= minIdx;
    },
  };

  /* ─── Bootstrap ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    if (!_initialized) {
      _initialized = true;
      bindLoginForm();
      bindLogout();
      bindNavigation();
      initAuthListener();
    }
  });

})();
