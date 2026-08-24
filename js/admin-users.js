/**
 * admin-users.js — Gestión de usuarios administradores
 * Altorra Inmobiliaria
 *
 * Patrón: Altorra Cars admin-users.js
 * Requiere: window.db (Firestore), window.functions, window.AdminAuth
 *
 * Solo accesible para super_admin.
 * Usa Cloud Functions (callable) para crear/eliminar usuarios en Firebase Auth:
 *   - createManagedUserV2
 *   - deleteManagedUserV2
 *   - updateUserRoleV2
 *
 * También gestiona reseñas (colección `resenas`) desde esta sección.
 */

(function () {
  'use strict';

  /* ─── Estado ─────────────────────────────────────────── */
  let _users   = [];
  let _resenas = [];

  /* ─── Helpers ─────────────────────────────────────────── */
  function $(sel, ctx = document) { return ctx.querySelector(sel); }

  function showToast(msg, type = 'success') {
    if (window.AltorraUtils?.showToast) { window.AltorraUtils.showToast(msg, type); return; }
    const t = document.createElement('div');
    t.className = `admin-toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str ?? ''));
    return d.innerHTML;
  }

  function openModal(id) { document.getElementById(id)?.classList.add('open'); }
  function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

  function fmtDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-CO', { dateStyle: 'medium' });
  }

  /* ─── Callable helper ────────────────────────────────── */
  async function callFunction(name, data) {
    const { httpsCallable } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-functions.js');
    const fn = httpsCallable(window.functions, name);
    return fn(data);
  }

  /* ─── Sincronizar permisos del PORTAL (custom claims) ──── */
  /*
   * Por qué existe: el portal nuevo (`/gestion`) decide quién es del equipo leyendo un CUSTOM CLAIM
   * del token, no el documento de `usuarios`. El claim lo pone `claimsStaffSync` cuando se ESCRIBE
   * un usuario — pero a los que ya existían no les había escrito nadie. Esto es el backfill.
   *
   * Se puede pulsar sin miedo y las veces que haga falta: la Function es idempotente (a quien ya
   * tiene el claim correcto no le toca nada) y su guarda lee el DOCUMENTO, no el claim, para poder
   * funcionar el día cero — cuando todavía no hay ni un permiso puesto.
   */
  async function syncClaims() {
    const btn = document.getElementById('btnSyncClaims');
    if (!window.AdminAuth?.isSuperAdmin()) {
      showToast('Solo un super admin puede sincronizar permisos', 'error');
      return;
    }
    const original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sincronizando…'; }
    try {
      const res = await callFunction('sincronizarClaimsV2', {});
      const d = (res && res.data) || {};
      const n = d.sincronizados || 0;
      const personas = n === 1 ? '1 persona sincronizada' : n + ' personas sincronizadas';
      const revocados = d.huerfanos ? ' · ' + d.huerfanos + ' permiso(s) retirado(s)' : '';
      showToast(personas + revocados + '. Cierra sesión y vuelve a entrar para que te aplique.', 'success');
      // El censo incompleto NO se calla: significa que el barrido de huérfanos se saltó a propósito
      // (fusible de la Function), y quien pulsó tiene que saber que la pasada quedó a medias.
      if (d.censoCompleto === false) {
        showToast('Aviso: el censo quedó incompleto, vuelve a pulsar en un momento', 'error');
      }
    } catch (e) {
      console.error('[admin] sincronizarClaimsV2:', e);
      showToast('No se pudieron sincronizar los permisos: ' + (e && e.message ? e.message : 'error'), 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = original || 'Sincronizar permisos del portal'; }
    }
  }

  /* ─── Usuarios ──────────────────────────────────────────── */
  async function loadUsers() {
    if (!window.AdminAuth?.isSuperAdmin()) return;

    setTableLoading('usersTableBody', 'Cargando usuarios...');
    const { collection, getDocs, query, orderBy } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    try {
      const q    = query(collection(window.db, 'usuarios'), orderBy('creadoEn', 'desc'));
      const snap = await getDocs(q);
      _users     = snap.docs.map(d => ({ _uid: d.id, ...d.data() }));
      renderUsers();
    } catch (err) {
      console.error('[AdminUsers] Error cargando usuarios:', err);
      showToast('Error al cargar usuarios', 'error');
    }
  }

  function setTableLoading(tbodyId, msg = 'Cargando...') {
    const tbody = document.getElementById(tbodyId);
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${msg}</td></tr>`;
  }

  function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (!_users.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay usuarios registrados</td></tr>';
      return;
    }

    const currentUid = window.AdminAuth.getCurrentUser()?.uid;

    tbody.innerHTML = _users.map(u => {
      const isSelf    = u._uid === currentUid;
      const activo    = u.activo !== false;
      const bloqueado = u.bloqueado === true;
      return `
      <tr>
        <td>${escHtml(u.nombre || '—')}</td>
        <td>${escHtml(u.email || '—')}</td>
        <td><span class="badge-role badge-${escHtml(u.rol || '')}">${escHtml(u.rol?.replace('_', ' ') || '—')}</span></td>
        <td><span class="badge-status badge-${activo && !bloqueado ? 'disponible' : 'cerrado'}">${bloqueado ? 'Bloqueado' : (activo ? 'Activo' : 'Inactivo')}</span></td>
        <td>${escHtml(fmtDate(u.creadoEn))}</td>
        <td>
          ${!isSelf ? `
          <select class="lead-status-select" onchange="AdminUsers.changeRole('${escHtml(u._uid)}', this.value)">
            <option value="viewer"      ${u.rol==='viewer'      ?'selected':''}>Viewer</option>
            <option value="editor"      ${u.rol==='editor'      ?'selected':''}>Editor</option>
            <option value="super_admin" ${u.rol==='super_admin' ?'selected':''}>Super Admin</option>
          </select>
          <button class="btn-admin btn-sm btn-danger" onclick="AdminUsers.confirmDelete('${escHtml(u._uid)}', '${escHtml(u.email || '')}')">Eliminar</button>
          ` : '<em>(tú)</em>'}
        </td>
      </tr>`;
    }).join('');
  }

  /* ─── Crear usuario ─────────────────────────────────────── */
  async function createUser() {
    if (!window.AdminAuth?.isSuperAdmin()) {
      showToast('Solo super admin puede crear usuarios', 'error');
      return;
    }

    const nombre   = $('#newUserNombre')?.value.trim()    || '';
    const email    = $('#newUserEmail')?.value.trim()     || '';
    const password = $('#newUserPassword')?.value         || '';
    const rol      = $('#newUserRol')?.value              || 'editor';

    if (!nombre || !email || !password) {
      showToast('Completa todos los campos', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('La contraseña debe tener mínimo 8 caracteres', 'error');
      return;
    }

    const btn = $('#newUserSaveBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Creando...'; }

    try {
      await callFunction('createManagedUserV2', { nombre, email, password, rol });
      showToast(`Usuario "${email}" creado correctamente`);
      closeModal('userModal');
      await loadUsers();
    } catch (err) {
      console.error('[AdminUsers] Error creando usuario:', err);
      showToast('Error al crear usuario: ' + (err.message || ''), 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Crear usuario'; }
    }
  }

  /* ─── Cambiar rol ─────────────────────────────────────── */
  async function changeRole(uid, newRol) {
    if (!window.AdminAuth?.isSuperAdmin()) {
      showToast('Sin permisos', 'error');
      return;
    }
    try {
      await callFunction('updateUserRoleV2', { uid, rol: newRol });
      const user = _users.find(u => u._uid === uid);
      if (user) user.rol = newRol;
      showToast('Rol actualizado');
    } catch (err) {
      showToast('Error al cambiar rol', 'error');
      renderUsers(); // revertir UI
    }
  }

  /* ─── Eliminar usuario ─────────────────────────────────── */
  async function confirmDelete(uid, email) {
    if (!window.AdminAuth?.isSuperAdmin()) { showToast('Sin permisos', 'error'); return; }
    if (!confirm(`¿Eliminar al usuario "${email}"? Esta acción no se puede deshacer.`)) return;

    try {
      await callFunction('deleteManagedUserV2', { uid });
      showToast(`Usuario "${email}" eliminado`);
      await loadUsers();
    } catch (err) {
      showToast('Error al eliminar usuario: ' + (err.message || ''), 'error');
    }
  }

  /* ─── Reseñas ───────────────────────────────────────────── */
  async function loadResenas() {
    const { collection, getDocs, query, orderBy } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    try {
      const q    = query(collection(window.db, 'resenas'), orderBy('orden', 'asc'));
      const snap = await getDocs(q);
      _resenas   = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
      renderResenas();
    } catch (err) {
      console.error('[AdminUsers] Error cargando reseñas:', err);
    }
  }

  function renderResenas() {
    const tbody = document.getElementById('resenasTableBody');
    if (!tbody) return;

    if (!_resenas.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay reseñas registradas</td></tr>';
      return;
    }

    tbody.innerHTML = _resenas.map(r => `
      <tr>
        <td>${escHtml(r.autor || '—')}</td>
        <td>${'★'.repeat(r.rating || 0)}${'☆'.repeat(5 - (r.rating || 0))}</td>
        <td>${escHtml((r.texto || '').slice(0, 80))}${(r.texto || '').length > 80 ? '...' : ''}</td>
        <td><span class="badge-status badge-${r.activa ? 'disponible' : 'cerrado'}">${r.activa ? 'Activa' : 'Inactiva'}</span></td>
        <td>
          <button class="btn-admin btn-sm" onclick="AdminUsers.openEditResena('${escHtml(r._docId)}')">Editar</button>
          <button class="btn-admin btn-sm btn-danger" onclick="AdminUsers.deleteResena('${escHtml(r._docId)}')">Eliminar</button>
        </td>
      </tr>`
    ).join('');
  }

  function openEditResena(docId) {
    const r = _resenas.find(x => x._docId === docId) || {};

    const form = $('#resenaForm');
    if (form) {
      const f = (id, val) => { const el = form.querySelector(id); if (el) el.value = val; };
      f('#resenaDocId',   docId);
      f('#resenaAutor',   r.autor   || '');
      f('#resenaRating',  r.rating  || 5);
      f('#resenaTexto',   r.texto   || '');
      f('#resenaFecha',   r.fecha   || '');
      f('#resenaOrden',   r.orden   || 1);
      const activa = form.querySelector('#resenaActiva');
      if (activa) activa.checked = r.activa !== false;
    }

    $('#resenaModalTitle').textContent = docId ? 'Editar reseña' : 'Nueva reseña';
    openModal('resenaModal');
  }

  function openNewResena() {
    openEditResena(null);
    $('#resenaDocId').value = '';
    $('#resenaModalTitle').textContent = 'Nueva reseña';
  }

  async function saveResena() {
    const form   = $('#resenaForm');
    if (!form) return;

    const docId  = form.querySelector('#resenaDocId')?.value.trim() || null;
    const data   = {
      autor:   form.querySelector('#resenaAutor')?.value.trim()   || '',
      rating:  parseInt(form.querySelector('#resenaRating')?.value)  || 5,
      texto:   form.querySelector('#resenaTexto')?.value.trim()   || '',
      fecha:   form.querySelector('#resenaFecha')?.value           || '',
      orden:   parseInt(form.querySelector('#resenaOrden')?.value) || 1,
      activa:  form.querySelector('#resenaActiva')?.checked !== false,
      fuente:  'directo',
    };

    const { doc, setDoc, addDoc, collection, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

    const btn = $('#resenaSaveBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

    try {
      if (docId) {
        await setDoc(doc(window.db, 'resenas', docId), data, { merge: true });
      } else {
        await addDoc(collection(window.db, 'resenas'), { ...data, createdAt: serverTimestamp() });
      }
      showToast('Reseña guardada');
      closeModal('resenaModal');
      await loadResenas();
    } catch (err) {
      showToast('Error al guardar reseña', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
    }
  }

  async function deleteResena(docId) {
    if (!window.AdminAuth?.isEditor()) { showToast('Sin permisos', 'error'); return; }
    if (!confirm('¿Eliminar esta reseña?')) return;

    const { doc, deleteDoc } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    try {
      await deleteDoc(doc(window.db, 'resenas', docId));
      showToast('Reseña eliminada');
      await loadResenas();
    } catch (err) {
      showToast('Error al eliminar reseña', 'error');
    }
  }

  /* ─── Bindings ──────────────────────────────────────────── */
  function bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btnNewUser'))          openModal('userModal');
      if (e.target.closest('#btnSyncClaims'))       syncClaims();
      if (e.target.closest('#newUserSaveBtn'))      createUser();
      if (e.target.closest('[data-close-modal="userModal"]'))   closeModal('userModal');
      if (e.target.closest('#btnNewResena'))        openNewResena();
      if (e.target.closest('#resenaSaveBtn'))       saveResena();
      if (e.target.closest('[data-close-modal="resenaModal"]')) closeModal('resenaModal');
    });
  }

  /* ─── Bootstrap ─────────────────────────────────────────── */
  function init() {
    bindEvents();

    window.addEventListener('altorra:admin-navigate', (e) => {
      if (e.detail?.section === 'usuarios') loadUsers();
      if (e.detail?.section === 'resenas')  loadResenas();
    });
  }

  /* ─── API pública ─────────────────────────────────────── */
  window.AdminUsers = {
    loadUsers,
    loadResenas,
    createUser,
    changeRole,
    confirmDelete,
    openEditResena,
    openNewResena,
    saveResena,
    deleteResena,
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('altorra:admin-ready', init, { once: true });
    if (window.AdminAuth?.getCurrentUser()) init();
  });

})();
