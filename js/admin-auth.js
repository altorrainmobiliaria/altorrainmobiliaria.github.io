/**
 * admin-auth.js — Autenticación y RBAC del panel de administración
 * Altorra Inmobiliaria
 *
 * Patrón: Altorra Cars admin-auth.js
 * Flujo:
 *   1. Verificar loginAttempts (bloqueo tras 5 intentos)
 *   2. signInWithEmailAndPassword()
 *   3. Cargar perfil usuarios/{uid} → rol
 *   4. Verificar estado bloqueado
 *   5. applyRolePermissions() → mostrar/ocultar UI
 *
 * Seguridad:
 *   - Timeout de sesión: 8 horas
 *   - Inactividad: 30 min (advertencia 1 min antes)
 *   - Retry 3x con backoff al cargar perfil (fix bug "Access denied for UID")
 */

(function () {
  'use strict';

  /* ─── Constantes ─────────────────────────────────────── */
  const SESSION_MAX_MS    = 8 * 60 * 60 * 1000;   // 8 horas
  const INACTIVITY_MS     = 30 * 60 * 1000;        // 30 min
  const WARN_BEFORE_MS    = 60 * 1000;             // 1 min antes de expirar
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_MS        = 15 * 60 * 1000;        // 15 min bloqueo
  const PROFILE_RETRY_MAX = 3;

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

  /* ─── Hash rápido de email para loginAttempts ────────── */
  async function hashEmail(email) {
    const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase().trim()));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 20);
  }

  /* ─── Control de intentos de login ───────────────────── */
  async function checkLoginAttempts(emailHash) {
    const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    try {
      const snap = await getDoc(doc(window.db, 'loginAttempts', emailHash));
      if (!snap.exists()) return { blocked: false, intentos: 0 };
      const d = snap.data();
      if (d.bloqueado) {
        const elapsed = Date.now() - d.ultimoIntento.toMillis();
        if (elapsed < LOCKOUT_MS) {
          const remaining = Math.ceil((LOCKOUT_MS - elapsed) / 60000);
          return { blocked: true, remaining };
        }
        // El bloqueo expiró — resetear
        await resetLoginAttempts(emailHash);
      }
      return { blocked: false, intentos: d.intentos || 0 };
    } catch {
      return { blocked: false, intentos: 0 };
    }
  }

  async function recordLoginFailure(emailHash, intentos) {
    const { setDoc, doc, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    const newIntentos = intentos + 1;
    await setDoc(doc(window.db, 'loginAttempts', emailHash), {
      intentos:      newIntentos,
      bloqueado:     newIntentos >= MAX_LOGIN_ATTEMPTS,
      ultimoIntento: serverTimestamp(),
    }, { merge: true });
    return newIntentos;
  }

  async function resetLoginAttempts(emailHash) {
    const { setDoc, doc, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    await setDoc(doc(window.db, 'loginAttempts', emailHash), {
      intentos: 0, bloqueado: false, ultimoIntento: serverTimestamp(),
    }, { merge: true });
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
  async function handleLogin(email, password) {
    if (!window.db || !window.auth) {
      showLogin('Firebase no está disponible aún. Intenta en unos segundos.');
      return;
    }

    setLoginLoading(true);
    const errEl = $('#loginError');
    if (errEl) errEl.hidden = true;

    try {
      const emailHash = await hashEmail(email);

      // 1. Verificar bloqueo por intentos
      const { blocked, remaining, intentos } = await checkLoginAttempts(emailHash);
      if (blocked) {
        showLogin(`Cuenta bloqueada. Intenta de nuevo en ${remaining} minutos.`);
        setLoginLoading(false);
        return;
      }

      // 2. Autenticar con Firebase
      const { signInWithEmailAndPassword } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');

      let credential;
      try {
        credential = await signInWithEmailAndPassword(window.auth, email.trim(), password);
      } catch (authErr) {
        const newIntentos = await recordLoginFailure(emailHash, intentos || 0);
        const remaining = MAX_LOGIN_ATTEMPTS - newIntentos;
        if (remaining <= 0) {
          showLogin('Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.');
        } else {
          showLogin(`Email o contraseña incorrectos. ${remaining} intento(s) restante(s).`);
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

      // 6. Login exitoso — resetear intentos
      await resetLoginAttempts(emailHash);

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
