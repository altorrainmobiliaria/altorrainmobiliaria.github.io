/**
 * admin-properties.js — CRUD de propiedades en Firestore
 * Altorra Inmobiliaria
 *
 * Patrón: Altorra Cars admin-vehicles.js
 * Requiere: window.db (Firestore), window.AdminAuth, window.storage
 *
 * Funciones principales:
 *   - Listar propiedades con filtros
 *   - Crear nueva propiedad (formulario completo)
 *   - Editar propiedad existente (con _version optimistic locking)
 *   - Cambiar estado (disponible/reservado/vendido/arrendado)
 *   - Eliminar (solo super_admin)
 *   - Subir imágenes a Cloud Storage
 *   - Invalidar caché (system/meta.lastModified)
 */

(function () {
  'use strict';

  /* ─── Estado ──────────────────────────────────────────── */
  let _properties     = [];
  let _filteredProps  = [];
  let _editingId      = null;  // null = nueva propiedad
  let _currentPage    = 1;
  const PAGE_SIZE     = 20;

  /* ─── Helpers ─────────────────────────────────────────── */
  function $(sel, ctx = document) { return ctx.querySelector(sel); }
  function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

  function showToast(msg, type = 'success') {
    if (window.AltorraUtils?.showToast) {
      window.AltorraUtils.showToast(msg, type);
      return;
    }
    const t = document.createElement('div');
    t.className = `admin-toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  var _u = window.AltorraUtils || {};
  function formatCOP(n) { if (!n) return '—'; return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n); }
  function escHtml(str) { return _u.escapeHtml ? _u.escapeHtml(str) : (function(){ var d=document.createElement('div'); d.appendChild(document.createTextNode(str??'')); return d.innerHTML; })(); }

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('open');
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
  }

  /* ─── Invalidar caché en system/meta ─────────────────── */
  // Escribe lastModified para que el onSnapshot de cache-manager.js dispare
  // invalidación inmediata en todas las pestañas abiertas (admin + públicas).
  async function touchSystemMeta() {
    const { doc, setDoc, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    try {
      await setDoc(doc(window.db, 'system', 'meta'), {
        lastModified: serverTimestamp()
      }, { merge: true });
      console.info('[AdminProps] system/meta.lastModified actualizado → cache invalidado');
    } catch (err) {
      // No bloquea el guardado de la propiedad, pero sí rompe la invalidación
      // cross-tab. Log visible para que sea detectable.
      console.warn('[AdminProps] Falló touchSystemMeta (los tabs públicos no se refrescarán automáticamente):', err?.code || err?.message || err);
    }
  }

  /* ─── Carga desde Firestore ─────────────────────────────── */
  async function loadProperties(silent = false) {
    if (!silent) setTableLoading(true);
    const { collection, getDocs, query, orderBy, limit } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

    try {
      const q = query(
        collection(window.db, 'propiedades'),
        orderBy('updatedAt', 'desc'),
        limit(200)
      );
      const snap = await getDocs(q);
      try { window.AltorraMeter?.add(snap.size, 'admin.properties'); } catch (_) {}
      _properties = snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
      applyFilters();
    } catch (err) {
      console.error('[AdminProps] Error cargando propiedades:', err);
      showToast('Error al cargar propiedades', 'error');
    } finally {
      if (!silent) setTableLoading(false);
    }
  }

  /* ─── Filtros y paginación ───────────────────────────── */
  function applyFilters() {
    const search    = ($('#propSearch')?.value || '').toLowerCase().trim();
    const operacion = $('#propFilterOp')?.value  || '';
    const estado    = $('#propFilterEstado')?.value || '';

    _filteredProps = _properties.filter(p => {
      if (operacion && p.operacion !== operacion) return false;
      if (estado    && p.estado    !== estado)    return false;
      if (search) {
        const hay = [p.titulo, p.ciudad, p.barrio, p.id].join(' ').toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    _currentPage = 1;
    renderTable();
  }

  function setTableLoading(on) {
    const tbody = $('#propTableBody');
    if (!tbody) return;
    if (on) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Cargando propiedades...</td></tr>';
    }
  }

  /* ─── Renderizado de tabla ─────────────────────────────── */
  function renderTable() {
    const tbody = $('#propTableBody');
    if (!tbody) return;

    const total = _filteredProps.length;
    const start = (_currentPage - 1) * PAGE_SIZE;
    const page  = _filteredProps.slice(start, start + PAGE_SIZE);

    if (!page.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No se encontraron propiedades</td></tr>';
      renderPagination(0);
      return;
    }

    tbody.innerHTML = page.map(p => {
      const estado   = p.estado || 'disponible';
      const disabled = !window.AdminAuth?.isSuperAdmin() ? 'disabled title="Solo super admin"' : '';
      return `
      <tr>
        <td><code>${escHtml(p.id || p._docId)}</code></td>
        <td><strong>${escHtml(p.titulo || '—')}</strong><br><small>${escHtml(p.ciudad || '')}${p.barrio ? ' · ' + escHtml(p.barrio) : ''}</small></td>
        <td><span class="badge-operacion badge-${escHtml(p.operacion || '')}">${escHtml(p.operacion || '—')}</span></td>
        <td>${escHtml(p.tipo || '—')}</td>
        <td>${formatCOP(p.precio)}</td>
        <td><span class="badge-status badge-${escHtml(estado)}">${escHtml(estado)}</span></td>
        <td>
          <button class="btn-admin btn-sm" onclick="AdminProperties.openEdit('${escHtml(p.id || p._docId)}')">Editar</button>
          <button class="btn-admin btn-sm btn-danger" onclick="AdminProperties.confirmDelete('${escHtml(p.id || p._docId)}')" ${disabled}>Eliminar</button>
        </td>
      </tr>`;
    }).join('');

    renderPagination(total);
  }

  function renderPagination(total) {
    const el = $('#propPagination');
    if (!el) return;
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) { el.innerHTML = ''; return; }

    let html = '';
    for (let i = 1; i <= pages; i++) {
      html += `<button class="btn-admin btn-sm ${i === _currentPage ? 'btn-primary' : 'btn-secondary'}"
        onclick="AdminProperties.goPage(${i})">${i}</button>`;
    }
    el.innerHTML = html;
  }

  /* ─── Subida de imágenes a Cloud Storage ─────────────── */
  async function uploadImage(file, propId) {
    if (!window.storage) throw new Error('Cloud Storage no disponible');
    const { ref, uploadBytes, getDownloadURL } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js');

    // Comprimir imagen con Canvas antes de subir (< 150KB)
    const compressed = await compressImage(file, 800, 600, 0.82);
    const ts = Date.now();
    const rnd = Math.random().toString(36).slice(2, 6);
    const storageRef = ref(window.storage, `propiedades/${propId}/${ts}-${rnd}.webp`);
    await uploadBytes(storageRef, compressed, { contentType: 'image/webp' });
    return getDownloadURL(storageRef);
  }

  async function compressImage(file, maxW, maxH, quality) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(maxW / width, maxH / height, 1);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        canvas.toBlob(resolve, 'image/webp', quality);
      };
      img.src = url;
    });
  }

  /* ─── Apertura del modal (nueva propiedad o edición) ──── */
  async function openCreate() {
    if (!window.AdminAuth?.isEditor()) {
      showToast('Sin permisos para crear propiedades', 'error');
      return;
    }
    _editingId = null;
    resetForm();
    $('#propModalTitle').textContent = 'Nueva propiedad';
    openModal('propModal');
  }

  async function openEdit(id) {
    if (!window.AdminAuth?.isEditor()) {
      showToast('Sin permisos para editar propiedades', 'error');
      return;
    }
    const prop = _properties.find(p => (p.id || p._docId) === id);
    if (!prop) { showToast('Propiedad no encontrada', 'error'); return; }

    _editingId = id;
    populateForm(prop);
    $('#propModalTitle').textContent = 'Editar propiedad';
    openModal('propModal');
  }

  function resetForm() {
    const form = $('#propForm');
    if (form) form.reset();
    const imgsPreview = $('#imagesPreview');
    if (imgsPreview) imgsPreview.innerHTML = '';
  }

  function populateForm(p) {
    resetForm();
    const form = $('#propForm');
    if (!form) return;

    const fields = {
      'propId':          p.id || p._docId || '',
      'propTitulo':      p.titulo || '',
      'propTipo':        p.tipo || '',
      'propOperacion':   p.operacion || '',
      'propEstado':      p.estado || 'disponible',
      'propCiudad':      p.ciudad || '',
      'propBarrio':      p.barrio || '',
      'propDireccion':   p.direccion || '',
      'propEstrato':     p.estrato || '',
      'propPrecio':      p.precio || '',
      'propAdminFee':    p.admin_fee || '',
      'propHabitaciones':p.habitaciones || '',
      'propBanos':       p.banos || '',
      'propSqm':         p.sqm || '',
      'propSqmTerreno':  p.sqm_terreno || '',
      'propGarajes':     p.garajes || '',
      'propPiso':        p.piso || '',
      'propAno':         p.ano_construccion || '',
      'propDescripcion': p.descripcion || '',
      'propFeatures':    (p.features || []).join(', '),
      'propLat':         p.coords?.lat || '',
      'propLng':         p.coords?.lng || '',
      'propFeatured':    '',  // checkbox
      'propAmoblado':    '',  // checkbox
    };

    Object.entries(fields).forEach(([id, val]) => {
      const el = form.querySelector(`#${id}`);
      if (!el) return;
      if (el.type === 'checkbox') {
        el.checked = !!p[id.replace('prop', '').toLowerCase()];
      } else {
        el.value = val;
      }
    });

    // Checkboxes especiales
    const featuredCb = form.querySelector('#propFeatured');
    const amobladoCb = form.querySelector('#propAmoblado');
    if (featuredCb) featuredCb.checked = !!p.featured;
    if (amobladoCb) amobladoCb.checked = !!p.amoblado;

    // Preview de imágenes existentes
    const imgsPreview = $('#imagesPreview');
    if (imgsPreview && p.imagenes?.length) {
      imgsPreview.innerHTML = p.imagenes.map(url =>
        `<div class="img-thumb"><img src="${escHtml(url)}" loading="lazy" alt="imagen"></div>`
      ).join('');
    }
  }

  /* ─── Guardar (crear o actualizar) ─────────────────────── */
  async function saveProperty() {
    if (!window.AdminAuth?.isEditor()) {
      showToast('Sin permisos', 'error');
      return;
    }

    const form = $('#propForm');
    if (!form || !form.checkValidity()) {
      form?.reportValidity();
      return;
    }

    const btn = $('#propSaveBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

    try {
      const { doc, setDoc, updateDoc, runTransaction, serverTimestamp, collection } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

      const uid = window.AdminAuth.getCurrentUser()?.uid || 'desconocido';

      // Leer campos del formulario
      const id = form.querySelector('#propId')?.value.trim();
      if (!id) { showToast('El ID es obligatorio', 'error'); return; }

      const featuresRaw = form.querySelector('#propFeatures')?.value || '';
      const features    = featuresRaw.split(',').map(s => s.trim()).filter(Boolean);

      const lat = parseFloat(form.querySelector('#propLat')?.value) || null;
      const lng = parseFloat(form.querySelector('#propLng')?.value) || null;

      const payload = {
        id:               id,
        titulo:           form.querySelector('#propTitulo')?.value.trim()    || '',
        tipo:             form.querySelector('#propTipo')?.value              || 'apartamento',
        operacion:        form.querySelector('#propOperacion')?.value         || 'comprar',
        estado:           form.querySelector('#propEstado')?.value            || 'disponible',
        ciudad:           form.querySelector('#propCiudad')?.value.trim()    || '',
        barrio:           form.querySelector('#propBarrio')?.value.trim()    || '',
        direccion:        form.querySelector('#propDireccion')?.value.trim() || '',
        estrato:          parseInt(form.querySelector('#propEstrato')?.value) || null,
        precio:           parseInt(form.querySelector('#propPrecio')?.value)  || 0,
        admin_fee:        parseInt(form.querySelector('#propAdminFee')?.value) || 0,
        habitaciones:     parseInt(form.querySelector('#propHabitaciones')?.value) || 0,
        banos:            parseInt(form.querySelector('#propBanos')?.value)   || 0,
        sqm:              parseFloat(form.querySelector('#propSqm')?.value)   || 0,
        sqm_terreno:      parseFloat(form.querySelector('#propSqmTerreno')?.value) || null,
        garajes:          parseInt(form.querySelector('#propGarajes')?.value) || 0,
        piso:             parseInt(form.querySelector('#propPiso')?.value)    || null,
        ano_construccion: parseInt(form.querySelector('#propAno')?.value)     || null,
        descripcion:      form.querySelector('#propDescripcion')?.value.trim() || '',
        features,
        coords:           (lat && lng) ? { lat, lng } : null,
        featured:         form.querySelector('#propFeatured')?.checked || false,
        amoblado:         form.querySelector('#propAmoblado')?.checked || false,
        disponible:       (form.querySelector('#propEstado')?.value || 'disponible') === 'disponible',
        updatedAt:        serverTimestamp(),
        slug:             generateSlug(form.querySelector('#propTitulo')?.value || '', id),
      };

      // Subir imágenes nuevas si las hay
      const fileInput = form.querySelector('#propImages');
      if (fileInput?.files?.length) {
        const urls = [];
        for (const file of fileInput.files) {
          const url = await uploadImage(file, id);
          urls.push(url);
        }
        if (urls.length) {
          // Añadir a las existentes
          const existing = _properties.find(p => (p.id || p._docId) === _editingId);
          payload.imagenes = [...(existing?.imagenes || []), ...urls];
          payload.imagen   = payload.imagenes[0];
        }
      }

      if (_editingId) {
        // Actualizar con optimistic locking
        const propRef = doc(window.db, 'propiedades', _editingId);
        await runTransaction(window.db, async (tx) => {
          const snap = await tx.get(propRef);
          if (!snap.exists()) throw new Error('Propiedad no encontrada');
          tx.update(propRef, { ...payload, _version: (snap.data()._version || 0) + 1 });
        });
        showToast('Propiedad actualizada correctamente');
      } else {
        // Crear nueva
        const propRef = doc(window.db, 'propiedades', id);
        await setDoc(propRef, {
          ...payload,
          _version:  1,
          createdAt: serverTimestamp(),
          creadoPor: uid,
          imagenes:  payload.imagenes || [],
          imagen:    payload.imagen   || '',
          prioridad: 50,
        });
        showToast('Propiedad creada correctamente');
      }

      await touchSystemMeta();
      closeModal('propModal');
      await loadProperties(true);

    } catch (err) {
      console.error('[AdminProps] Error guardando:', err);
      showToast('Error al guardar: ' + (err.message || 'intenta de nuevo'), 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
    }
  }

  /* ─── Eliminar ─────────────────────────────────────────── */
  async function confirmDelete(id) {
    if (!window.AdminAuth?.isSuperAdmin()) {
      showToast('Solo el super admin puede eliminar propiedades', 'error');
      return;
    }
    if (!confirm(`¿Eliminar la propiedad "${id}"? Esta acción no se puede deshacer.`)) return;

    const { doc, deleteDoc } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    try {
      await deleteDoc(doc(window.db, 'propiedades', id));
      await touchSystemMeta();
      showToast('Propiedad eliminada');
      await loadProperties(true);
    } catch (err) {
      showToast('Error al eliminar: ' + err.message, 'error');
    }
  }

  /* ─── Cambio rápido de estado ────────────────────────── */
  async function changeStatus(id, newStatus) {
    if (!window.AdminAuth?.isEditor()) {
      showToast('Sin permisos', 'error');
      return;
    }
    const { doc, updateDoc, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    try {
      await updateDoc(doc(window.db, 'propiedades', id), {
        estado:    newStatus,
        disponible: newStatus === 'disponible',
        updatedAt:  serverTimestamp(),
      });
      await touchSystemMeta();
      showToast(`Estado actualizado a "${newStatus}"`);
      await loadProperties(true);
    } catch (err) {
      showToast('Error al cambiar estado', 'error');
    }
  }

  /* ─── Slug helper ─────────────────────────────────────── */
  function generateSlug(titulo, id) {
    const base = titulo
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);
    return `${base}-${id}`;
  }

  /* ─── Bindings ──────────────────────────────────────────── */
  function bindEvents() {
    // Botón nueva propiedad
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btnNewProp')) openCreate();
      if (e.target.closest('#propSaveBtn')) saveProperty();
      if (e.target.closest('[data-close-modal="propModal"]')) closeModal('propModal');
    });

    // Filtros
    ['#propSearch', '#propFilterOp', '#propFilterEstado'].forEach(sel => {
      const el = $(sel);
      if (el) el.addEventListener('input', applyFilters);
    });

    // Preview de imagen nueva
    const fileInput = $('#propImages');
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const preview = $('#imagesPreview');
        if (!preview) return;
        const newPreviews = [...fileInput.files].map(file => {
          const url = URL.createObjectURL(file);
          return `<div class="img-thumb"><img src="${url}" alt="preview"></div>`;
        }).join('');
        preview.insertAdjacentHTML('beforeend', newPreviews);
      });
    }
  }

  /* ─── Bootstrap: escuchar evento de navegación ──────────── */
  function init() {
    bindEvents();

    window.addEventListener('altorra:admin-navigate', (e) => {
      if (e.detail?.section === 'propiedades') {
        loadProperties();
      }
    });

    // Si ya está en la sección propiedades al cargar
    if ($('#section-propiedades')?.classList.contains('active')) {
      loadProperties();
    }
  }

  /* ─── API pública ─────────────────────────────────────── */
  window.AdminProperties = {
    load:          loadProperties,
    openCreate,
    openEdit,
    confirmDelete,
    changeStatus,
    goPage(n) { _currentPage = n; renderTable(); },
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('altorra:admin-ready', init, { once: true });
    // Si admin-auth ya disparó el evento antes de que cargáramos
    if (window.AdminAuth?.getCurrentUser()) init();
  });

})();
