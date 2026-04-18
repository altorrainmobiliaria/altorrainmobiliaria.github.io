/**
 * admin-leads.js — Gestión de solicitudes/leads en Firestore
 * Altorra Inmobiliaria
 *
 * Patrón: Altorra Cars admin-leads.js
 * Requiere: window.db (Firestore), window.AdminAuth
 *
 * Funciones:
 *   - Listar leads con filtros (tipo, estado, búsqueda)
 *   - Ver detalle completo de un lead
 *   - Actualizar estado (pendiente → en_gestion → cerrado)
 *   - Badge de contador en el sidebar
 *   - Listener en tiempo real (onSnapshot) solo cuando la sección está activa
 */

(function () {
  'use strict';

  /* ─── Estado ─────────────────────────────────────────── */
  let _leads         = [];
  let _filteredLeads = [];
  let _currentPage   = 1;
  let _unsubscribe   = null;   // unsubscribe de onSnapshot
  const PAGE_SIZE    = 20;

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

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('open');
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
  }

  function fmtDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function estadoLabel(e) {
    return { pendiente: 'Nuevo', en_gestion: 'Contactado', visita: 'Visita', cerrado: 'Cierre' }[e] || e;
  }

  /* ─── Actualizar badge del sidebar ───────────────────── */
  function updateBadge(leads) {
    const badge   = $('#leadsCountBadge');
    const pending = leads.filter(l => l.estado === 'pendiente').length;
    if (badge) {
      badge.textContent = pending || '';
      badge.hidden      = pending === 0;
    }
  }

  /* ─── Cargar leads desde Firestore ─────────────────────── */
  async function loadLeads() {
    const { collection, getDocs, query, orderBy, limit } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

    setTableLoading(true);
    try {
      const q = query(
        collection(window.db, 'solicitudes'),
        orderBy('createdAt', 'desc'),
        limit(200)
      );
      const snap = await getDocs(q);
      _leads = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
      updateBadge(_leads);
      applyFilters();
    } catch (err) {
      console.error('[AdminLeads] Error cargando leads:', err);
      showToast('Error al cargar solicitudes', 'error');
    } finally {
      setTableLoading(false);
    }
  }

  /* ─── Listener en tiempo real (solo mientras sección activa) ── */
  async function startRealtime() {
    if (_unsubscribe) return;
    const { collection, query, orderBy, limit, onSnapshot } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

    const q = query(
      collection(window.db, 'solicitudes'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    _unsubscribe = onSnapshot(q, (snap) => {
      _leads = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
      updateBadge(_leads);
      applyFilters();
    }, (err) => {
      console.warn('[AdminLeads] onSnapshot error:', err);
    });
  }

  function stopRealtime() {
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
  }

  /* ─── Filtros ─────────────────────────────────────────── */
  function applyFilters() {
    window.dispatchEvent(new CustomEvent('altorra:leads-updated', { detail: { leads: _leads } }));

    const search = ($('#leadSearch')?.value || '').toLowerCase().trim();
    const tipo   = $('#leadFilterTipo')?.value   || '';
    const estado = $('#leadFilterEstado')?.value || '';

    _filteredLeads = _leads.filter(l => {
      if (tipo   && l.tipo   !== tipo)   return false;
      if (estado && l.estado !== estado) return false;
      if (search) {
        const hay = [l.nombre, l.email, l.telefono,
                     l.datosExtra?.propiedadTitulo, l.datosExtra?.mensaje]
          .join(' ').toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    _currentPage = 1;
    renderTable();
  }

  function setTableLoading(on) {
    const tbody = $('#leadsTableBody');
    if (tbody && on) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Cargando solicitudes...</td></tr>';
    }
  }

  /* ─── Renderizado de tabla ─────────────────────────────── */
  function renderTable() {
    const tbody = $('#leadsTableBody');
    if (!tbody) return;

    const total = _filteredLeads.length;
    const start = (_currentPage - 1) * PAGE_SIZE;
    const page  = _filteredLeads.slice(start, start + PAGE_SIZE);

    if (!page.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No se encontraron solicitudes</td></tr>';
      renderPagination(0);
      return;
    }

    tbody.innerHTML = page.map(l => {
      const estado = l.estado || 'pendiente';
      return `
      <tr>
        <td>${escHtml(fmtDate(l.createdAt))}</td>
        <td><strong>${escHtml(l.nombre || '—')}</strong><br><small>${escHtml(l.email || '')}</small></td>
        <td>${escHtml(l.telefono || '—')}</td>
        <td>${escHtml(tipoLabel(l.tipo))}</td>
        <td>${escHtml(l.datosExtra?.propiedadTitulo || l.ciudad || '—')}</td>
        <td>
          <select class="lead-status-select" data-id="${escHtml(l._docId)}" onchange="AdminLeads.updateStatus('${escHtml(l._docId)}', this.value)">
            <option value="pendiente"   ${estado === 'pendiente'   ? 'selected' : ''}>🆕 Nuevo</option>
            <option value="en_gestion"  ${estado === 'en_gestion'  ? 'selected' : ''}>📞 Contactado</option>
            <option value="visita"      ${estado === 'visita'      ? 'selected' : ''}>📅 Visita</option>
            <option value="cerrado"     ${estado === 'cerrado'     ? 'selected' : ''}>✅ Cierre</option>
          </select>
        </td>
        <td>
          <button class="btn-admin btn-sm" onclick="AdminLeads.openDetail('${escHtml(l._docId)}')">Ver</button>
        </td>
      </tr>`;
    }).join('');

    renderPagination(total);
  }

  function tipoLabel(tipo) {
    const map = {
      contacto_propiedad: 'Contacto propiedad',
      publicar_propiedad: 'Publicar propiedad',
      solicitud_avaluo:   'Avalúo',
      solicitud_juridica: 'Jurídica',
      solicitud_contable: 'Contable',
      otro:               'Otro',
    };
    return map[tipo] || tipo || '—';
  }

  function renderPagination(total) {
    const el = $('#leadsPagination');
    if (!el) return;
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) { el.innerHTML = ''; return; }
    let html = '';
    for (let i = 1; i <= pages; i++) {
      html += `<button class="btn-admin btn-sm ${i === _currentPage ? 'btn-primary' : 'btn-secondary'}"
        onclick="AdminLeads.goPage(${i})">${i}</button>`;
    }
    el.innerHTML = html;
  }

  /* ─── Ver detalle ─────────────────────────────────────── */
  function openDetail(docId) {
    const lead = _leads.find(l => l._docId === docId);
    if (!lead) return;

    const body = $('#leadDetailBody');
    if (body) {
      const extra = lead.datosExtra || {};
      body.innerHTML = `
        <table class="detail-table">
          <tr><th>Nombre</th><td>${escHtml(lead.nombre || '—')}</td></tr>
          <tr><th>Email</th><td><a href="mailto:${escHtml(lead.email)}">${escHtml(lead.email || '—')}</a></td></tr>
          <tr><th>Teléfono</th><td><a href="tel:${escHtml(lead.telefono)}">${escHtml(lead.telefono || '—')}</a></td></tr>
          <tr><th>Tipo</th><td>${escHtml(tipoLabel(lead.tipo))}</td></tr>
          <tr><th>Estado</th><td><span class="badge-status badge-${escHtml(lead.estado || 'pendiente')}">${escHtml(estadoLabel(lead.estado))}</span></td></tr>
          <tr><th>Origen</th><td>${escHtml(lead.origen || '—')}</td></tr>
          <tr><th>Fecha</th><td>${escHtml(fmtDate(lead.createdAt))}</td></tr>
          ${extra.propiedadId ? `<tr><th>Propiedad</th><td>${escHtml(extra.propiedadTitulo || extra.propiedadId)}</td></tr>` : ''}
          ${extra.mensaje ? `<tr><th>Mensaje</th><td>${escHtml(extra.mensaje)}</td></tr>` : ''}
          ${extra.ciudad ? `<tr><th>Ciudad</th><td>${escHtml(extra.ciudad)}</td></tr>` : ''}
          ${extra.tipoInmueble ? `<tr><th>Tipo inmueble</th><td>${escHtml(extra.tipoInmueble)}</td></tr>` : ''}
          ${extra.precioAproximado ? `<tr><th>Precio aprox.</th><td>${new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(extra.precioAproximado)}</td></tr>` : ''}
        </table>
        <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
          <select id="leadStatusSelect" class="lead-status-select">
            <option value="pendiente"  ${lead.estado==='pendiente'  ?'selected':''}>🆕 Nuevo</option>
            <option value="en_gestion" ${lead.estado==='en_gestion' ?'selected':''}>📞 Contactado</option>
            <option value="visita"     ${lead.estado==='visita'     ?'selected':''}>📅 Visita</option>
            <option value="cerrado"    ${lead.estado==='cerrado'    ?'selected':''}>✅ Cierre</option>
          </select>
          <button class="btn-admin btn-primary" onclick="AdminLeads.updateStatusFromModal('${escHtml(docId)}')">Actualizar estado</button>
          <a class="btn-admin btn-secondary" href="https://wa.me/${escHtml(lead.telefono?.replace(/\D/g,'') || '')}" target="_blank" rel="noopener">WhatsApp</a>
        </div>`;
    }

    openModal('leadModal');
  }

  /* ─── Actualizar estado ─────────────────────────────── */
  async function updateStatus(docId, newStatus) {
    if (!window.AdminAuth?.isEditor()) { showToast('Sin permisos', 'error'); return; }
    const { doc, updateDoc, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    try {
      await updateDoc(doc(window.db, 'solicitudes', docId), {
        estado:    newStatus,
        updatedAt: serverTimestamp(),
      });
      // Actualizar local sin re-fetch
      const lead = _leads.find(l => l._docId === docId);
      if (lead) lead.estado = newStatus;
      updateBadge(_leads);
    } catch (err) {
      showToast('Error al actualizar estado', 'error');
    }
  }

  function updateStatusFromModal(docId) {
    const sel = $('#leadStatusSelect');
    if (!sel) return;
    updateStatus(docId, sel.value);
    closeModal('leadModal');
    showToast('Estado actualizado');
  }

  /* ─── Bindings ──────────────────────────────────────────── */
  function bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-modal="leadModal"]')) closeModal('leadModal');
    });
    ['#leadSearch', '#leadFilterTipo', '#leadFilterEstado'].forEach(sel => {
      const el = $(sel);
      if (el) el.addEventListener('input', applyFilters);
    });
  }

  /* ─── Bootstrap ─────────────────────────────────────────── */
  function init() {
    bindEvents();

    window.addEventListener('altorra:admin-navigate', (e) => {
      if (e.detail?.section === 'leads') {
        loadLeads();
        startRealtime();
      } else {
        // Detener realtime cuando no está en la sección de leads
        stopRealtime();
      }
    });

    // Cargar leads para el badge siempre que el admin cargue
    loadLeads();
  }

  /* ─── API pública ─────────────────────────────────────── */
  window.AdminLeads = {
    load:                loadLeads,
    openDetail,
    updateStatus,
    updateStatusFromModal,
    goPage(n) { _currentPage = n; renderTable(); },
    get _allLeads() { return _leads; },
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('altorra:admin-ready', init, { once: true });
    if (window.AdminAuth?.getCurrentUser()) init();
  });

})();
