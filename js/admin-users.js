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
          <button class="btn-admin btn-sm" onclick="AdminUsers.reenviarInvitacion('${escHtml(u.email || '')}')" title="Le manda un correo para que elija una contraseña nueva">Reenviar invitación</button>
          <button class="btn-admin btn-sm" onclick="AdminUsers.alternarActivo('${escHtml(u._uid)}', ${!activo}, '${escHtml(u.email || '')}')" title="${activo ? 'Le corta el acceso ahora mismo, sin borrar nada' : 'Le devuelve el acceso'}">${activo ? 'Suspender' : 'Reactivar'}</button>
          <button class="btn-admin btn-sm btn-danger" onclick="AdminUsers.confirmDelete('${escHtml(u._uid)}', '${escHtml(u.email || '')}')">Eliminar</button>
          ` : '<em>(tú)</em>'}
        </td>
      </tr>`;
    }).join('');
  }

  /* ─── Invitar a alguien al equipo (§131) ──────────────────────────────────────────────────────
   * Antes esto pedía una «contraseña temporal» que tecleaba el administrador y le mandaba a la otra
   * persona por WhatsApp: quedaba en un chat para siempre y la sabían dos. Ahora la Function genera
   * una credencial aleatoria que NO VE NADIE, y desde aquí se dispara el correo para que la persona
   * elija la suya.
   *
   * El correo lo manda **Firebase con su propia infraestructura**, no el SMTP de Gmail del proyecto:
   * por eso funciona hoy, con la contraseña de aplicación sin rotar (misma razón que en §128).
   *
   * Si el correo falla, la cuenta YA existe — y decirlo importa: el remedio es reenviar la invitación,
   * no volver a crear al usuario. Un mensaje de «error» a secas llevaría a intentar lo segundo.
   */
  async function createUser() {
    if (!window.AdminAuth?.isSuperAdmin()) {
      showToast('Solo super admin puede crear usuarios', 'error');
      return;
    }

    const nombre = $('#newUserNombre')?.value.trim() || '';
    const email  = $('#newUserEmail')?.value.trim()  || '';
    const rol    = $('#newUserRol')?.value           || 'editor';

    if (!nombre || !email) {
      showToast('Escribe el nombre y el correo', 'error');
      return;
    }

    const btn = $('#newUserSaveBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Invitando...'; }

    try {
      await callFunction('createManagedUserV2', { nombre, email, rol });
    } catch (err) {
      console.error('[AdminUsers] Error creando usuario:', err);
      showToast('No se pudo crear el usuario: ' + (err.message || ''), 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Enviar invitación'; }
      return;
    }

    // La cuenta ya existe a partir de aquí: los fallos siguientes NO se cuentan como fallo de alta.
    try {
      await enviarInvitacion(email);
      showToast(`Invitación enviada a ${email}`);
    } catch (err) {
      console.error('[AdminUsers] Error enviando la invitación:', err);
      showToast(`Usuario creado, pero el correo no salió. Usa «Reenviar invitación» en la fila de ${email}.`, 'error');
    }

    closeModal('userModal');
    await loadUsers();
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar invitación'; }
  }

  /** Manda el enlace para que la persona elija su contraseña. También sirve para reenviar. */
  async function enviarInvitacion(email) {
    const { sendPasswordResetEmail } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');
    await sendPasswordResetEmail(window.auth, email);
  }

  async function reenviarInvitacion(email) {
    if (!window.AdminAuth?.isSuperAdmin()) { showToast('Sin permisos', 'error'); return; }
    try {
      await enviarInvitacion(email);
      showToast(`Invitación reenviada a ${email}`);
    } catch (err) {
      showToast('No se pudo enviar el correo: ' + (err.message || ''), 'error');
    }
  }

  /* ─── Suspender / reactivar (§131) ────────────────────────────────────────────────────────────
   * Corta el acceso al instante SIN destruir la cuenta: la Function escribe `activo`, el trigger de
   * claims relee el documento, revoca el permiso y **invalida los tokens**. La sesión que esa persona
   * tuviera abierta en otro dispositivo muere en el acto, no dentro de una hora.
   */
  async function alternarActivo(uid, activo, email) {
    if (!window.AdminAuth?.isSuperAdmin()) { showToast('Sin permisos', 'error'); return; }
    const accion = activo ? 'reactivar' : 'suspender';
    if (!confirm(`¿Seguro que quieres ${accion} a "${email}"?` +
      (activo ? '' : '\n\nSe le cierra la sesión en todos sus dispositivos de inmediato. Se puede reactivar cuando quieras.'))) return;
    try {
      await callFunction('suspenderUsuarioV2', { uid, activo });
      showToast(activo ? `"${email}" reactivado` : `"${email}" suspendido`);
      await loadUsers();
    } catch (err) {
      showToast(`No se pudo ${accion}: ` + (err.message || ''), 'error');
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
    // §131 — los invocan los `onclick` de la tabla, así que TIENEN que salir aquí: sin esto los
    // botones existen, se ven, y no hacen nada (la clase de §126, un control que promete y no cumple).
    alternarActivo,
    reenviarInvitacion,
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
