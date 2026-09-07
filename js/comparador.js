/**
 * comparador.js — Comparador de propiedades (hasta 3 simultáneas)
 * Altorra Inmobiliaria
 *
 * Funcionamiento:
 *   1. El usuario agrega propiedades al comparador desde las tarjetas (botón "Comparar")
 *   2. Un "tray" flotante muestra cuántas tiene seleccionadas (1-3)
 *   3. Al hacer clic en "Comparar ahora", se abre el modal de comparación
 *   4. El modal muestra una tabla lado a lado con todas las specs
 *
 * Se puede iniciar desde detalle-propiedad.html con ?compare=id
 *
 * API pública: window.AltorraComparador
 */

(function () {
  'use strict';

  const MAX_COMPARE = 3;
  const LS_KEY      = 'altorra:comparador';
  const EVENT       = 'altorra:comparador-update';

  /* ─── Estado ─────────────────────────────────────────────── */
  let _items = [];   // array de objetos de propiedad

  /* ─── localStorage ──────────────────────────────────────── */
  function lsLoad() {
    try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : []; }
    catch { return []; }
  }

  function lsSave() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(_items)); } catch { /* ignore */ }
  }

  /* ─── Gestión de items ──────────────────────────────────── */
  function add(prop) {
    if (!prop?.id) return { ok: false, reason: 'sin-id' };
    if (_items.some(p => String(p.id) === String(prop.id))) return { ok: false, reason: 'ya-existe' };
    if (_items.length >= MAX_COMPARE) return { ok: false, reason: 'limite' };

    const item = {
      id:         String(prop.id),
      title:      prop.title     || prop.titulo     || '',
      city:       prop.city      || prop.ciudad      || '',
      barrio:     prop.neighborhood || prop.barrio   || '',
      price:      prop.price     || prop.precio      || 0,
      image:      prop.image     || prop.imagen      || '',
      operation:  prop.operation || prop.operacion   || '',
      tipo:       prop.type      || prop.tipo        || '',
      beds:       prop.beds      || prop.habitaciones|| 0,
      baths:      prop.baths     || prop.banos       || 0,
      sqm:        prop.sqm       || 0,
      garajes:    prop.garajes   || prop.garages     || 0,
      piso:       prop.piso      || prop.floor       || null,
      estrato:    prop.estrato   || prop.strata      || null,
      admin_fee:  prop.admin_fee || 0,
      features:   prop.features  || [],
      featured:   !!prop.featured,
    };

    _items.push(item);
    lsSave();
    notify();
    return { ok: true };
  }

  function remove(id) {
    _items = _items.filter(p => String(p.id) !== String(id));
    lsSave();
    notify();
    updateCardButtons();
  }

  function clear() {
    _items = [];
    lsSave();
    notify();
    updateCardButtons();
    closeModal();
  }

  function has(id) { return _items.some(p => String(p.id) === String(id)); }

  function notify() {
    document.dispatchEvent(new CustomEvent(EVENT, { detail: { count: _items.length } }));
    updateTray();
  }

  /* ─── Tray flotante ─────────────────────────────────────── */
  function updateTray() {
    let tray = document.getElementById('comparador-tray');
    if (!tray) {
      tray = document.createElement('div');
      tray.id = 'comparador-tray';
      document.body.appendChild(tray);
    }

    if (!_items.length) {
      tray.style.display = 'none';
      return;
    }

    tray.style.display = '';
    const thumbnails = _items.map(p => `
      <div class="cmp-tray-thumb" title="${p.title}">
        ${p.image ? `<img src="${p.image}" alt="${p.title}" loading="lazy"/>` : '<div class="cmp-ph"></div>'}
        <button class="cmp-tray-remove" onclick="AltorraComparador.remove('${p.id}')" aria-label="Quitar">×</button>
      </div>`).join('');

    tray.innerHTML = `
      <div class="cmp-tray-inner">
        <div class="cmp-tray-thumbs">${thumbnails}</div>
        <div class="cmp-tray-actions">
          <span class="cmp-tray-count">${_items.length}/${MAX_COMPARE} propiedades</span>
          <button class="cmp-tray-btn primary" onclick="AltorraComparador.openModal()" ${_items.length < 2 ? 'disabled' : ''}>
            Comparar ahora
          </button>
          <button class="cmp-tray-btn ghost" onclick="AltorraComparador.clear()">Limpiar</button>
        </div>
      </div>`;
  }

  /* ─── Botones en tarjetas ────────────────────────────────── */
  function updateCardButtons() {
    document.querySelectorAll('[data-compare-btn]').forEach(btn => {
      const id = btn.dataset.compareBtnId;
      const inList = has(id);
      btn.textContent    = inList ? '✓ En comparador' : 'Comparar';
      btn.classList.toggle('active', inList);
    });
  }

  /* ─── Inyectar botón en tarjetas ────────────────────────── */
  function injectButtonsInCards() {
    document.querySelectorAll('.card[data-id]').forEach(card => {
      if (card.querySelector('[data-compare-btn]')) return;
      const id = card.dataset.id;
      if (!id) return;

      const btn = document.createElement('button');
      btn.className        = 'cmp-card-btn';
      btn.dataset.compareBtn   = '1';
      btn.dataset.compareBtnId = id;
      btn.textContent      = has(id) ? '✓ En comparador' : 'Comparar';
      if (has(id)) btn.classList.add('active');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (has(id)) {
          remove(id);
        } else {
          // Obtener datos desde propertyDB
          const prop = window.propertyDB?.getById?.(id);
          if (prop) {
            const res = add(prop);
            if (res.reason === 'limite') {
              alert(`Solo puedes comparar hasta ${MAX_COMPARE} propiedades a la vez.`);
            }
          }
        }
        updateCardButtons();
      });

      // Insertar en el footer de la tarjeta
      const footer = card.querySelector('.footer') || card.querySelector('.property-footer') || card;
      footer.appendChild(btn);
    });
  }

  /* ─── Modal de comparación ──────────────────────────────── */
  function openModal() {
    if (_items.length < 2) return;
    injectStyles();

    let modal = document.getElementById('comparador-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'comparador-modal';
      modal.className = 'cmp-modal-overlay';
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    const cols = _items.length;
    const colWidth = Math.floor(100 / (cols + 1)) + '%';

    const fmtCOP = (n) => n ? '$ ' + Math.round(n).toLocaleString('es-CO') : '—';
    const fmtYN  = (v) => v ? '✅' : '❌';

    // Specs a comparar
    const specs = [
      { label: 'Tipo',           key: p => p.tipo || '—' },
      { label: 'Operación',      key: p => p.operation || '—' },
      { label: 'Ciudad',         key: p => p.city || '—' },
      { label: 'Barrio',         key: p => p.barrio || '—' },
      { label: 'Precio',         key: p => fmtCOP(p.price), highlight: true },
      { label: 'Administración', key: p => p.admin_fee ? fmtCOP(p.admin_fee) + '/mes' : '—' },
      { label: 'Habitaciones',   key: p => p.beds   || '—', numeric: true },
      { label: 'Baños',          key: p => p.baths  || '—', numeric: true },
      { label: 'Área',           key: p => p.sqm ? p.sqm + ' m²' : '—', numeric: true },
      { label: 'Garajes',        key: p => p.garajes || '—', numeric: true },
      { label: 'Piso',           key: p => p.piso   || '—' },
      { label: 'Estrato',        key: p => p.estrato || '—' },
      { label: 'Destacada',      key: p => fmtYN(p.featured) },
    ];

    // Para specs numéricas, resaltar el mejor valor
    function getBest(spec, items) {
      if (!spec.numeric) return null;
      const values = items.map(p => parseFloat(spec.key(p)) || 0);
      const max = Math.max(...values);
      return values.map(v => v === max && max > 0);
    }

    const headerCells = _items.map(p => `
      <th>
        <div class="cmp-card-header">
          ${p.image ? `<img src="${p.image}" alt="${p.title}" class="cmp-modal-img"/>` : ''}
          <p class="cmp-modal-title">${p.title}</p>
          <button class="cmp-modal-remove" onclick="AltorraComparador.remove('${p.id}');AltorraComparador.openModal()">
            × Quitar
          </button>
          <a href="detalle-propiedad.html?id=${encodeURIComponent(p.id)}" class="cmp-modal-link" target="_blank" rel="noopener">
            Ver detalle →
          </a>
        </div>
      </th>`).join('');

    const specRows = specs.map(spec => {
      const bests = getBest(spec, _items);
      const cells = _items.map((p, i) => {
        const val    = spec.key(p);
        const isBest = bests && bests[i];
        return `<td class="${spec.highlight ? 'cmp-highlight' : ''} ${isBest ? 'cmp-best' : ''}">${val}</td>`;
      }).join('');
      return `<tr><th class="cmp-row-label">${spec.label}</th>${cells}</tr>`;
    }).join('');

    // Amenidades
    const allFeatures = [...new Set(_items.flatMap(p => p.features || []))].sort();
    const featureRows = allFeatures.length ? allFeatures.map(f => {
      const cells = _items.map(p =>
        `<td>${(p.features || []).includes(f) ? '✅' : '—'}</td>`
      ).join('');
      return `<tr><th class="cmp-row-label">${f}</th>${cells}</tr>`;
    }).join('') : '';

    modal.innerHTML = `
      <div class="cmp-modal-box">
        <div class="cmp-modal-header">
          <h2>Comparar propiedades</h2>
          <button class="cmp-modal-close" onclick="AltorraComparador.closeModal()">✕</button>
        </div>
        <div class="cmp-modal-scroll">
          <table class="cmp-table">
            <colgroup>
              <col style="width:120px"/>
              ${_items.map(() => `<col style="width:${colWidth}"/>`).join('')}
            </colgroup>
            <thead><tr><th></th>${headerCells}</tr></thead>
            <tbody>
              ${specRows}
              ${allFeatures.length ? `
              <tr><th class="cmp-row-label cmp-section-header" colspan="${cols + 1}">Amenidades</th></tr>
              ${featureRows}` : ''}
            </tbody>
          </table>
        </div>
        <div class="cmp-modal-footer">
          <button class="cmp-tray-btn ghost" onclick="AltorraComparador.clear()">Limpiar comparador</button>
          ${_items.length < MAX_COMPARE
            ? `<span style="font-size:.85rem;color:var(--muted,#6b7280)">
                Puedes agregar ${MAX_COMPARE - _items.length} propiedad más</span>`
            : ''}
        </div>
      </div>`;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('comparador-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ─── Estilos ───────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('cmp-styles')) return;
    const s = document.createElement('style');
    s.id = 'cmp-styles';
    s.textContent = `
      /* Tray flotante */
      #comparador-tray {
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        z-index: 9000; display: none;
      }
      .cmp-tray-inner {
        display: flex; align-items: center; gap: 14px;
        background: #111; color: #fff; border-radius: 16px;
        padding: 10px 16px; box-shadow: 0 8px 32px rgba(0,0,0,.4);
      }
      .cmp-tray-thumbs { display: flex; gap: 8px; }
      .cmp-tray-thumb  { position: relative; width: 44px; height: 44px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
      .cmp-tray-thumb img { width: 100%; height: 100%; object-fit: cover; }
      .cmp-ph          { width: 100%; height: 100%; background: #333; }
      .cmp-tray-remove {
        position: absolute; top: -4px; right: -4px; width: 18px; height: 18px;
        border-radius: 50%; background: #ef4444; color: #fff; border: none;
        font-size: 11px; font-weight: 800; cursor: pointer; line-height: 1;
        display: flex; align-items: center; justify-content: center;
      }
      .cmp-tray-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .cmp-tray-count  { font-size: .82rem; color: rgba(255,255,255,.7); white-space: nowrap; }
      .cmp-tray-btn {
        padding: 8px 16px; border-radius: 10px; border: none; font-weight: 700;
        cursor: pointer; font-size: .88rem; transition: opacity .15s;
      }
      .cmp-tray-btn.primary { background: var(--gold,#d4af37); color: #111; }
      .cmp-tray-btn.ghost   { background: rgba(255,255,255,.15); color: #fff; }
      .cmp-tray-btn:disabled { opacity: .45; cursor: not-allowed; }

      /* Botón en tarjeta */
      .cmp-card-btn {
        padding: 5px 12px; border-radius: 8px; border: 1.5px solid rgba(17,24,39,.15);
        background: #fff; font-size: .78rem; font-weight: 700; cursor: pointer;
        transition: all .15s; white-space: nowrap;
      }
      .cmp-card-btn:hover, .cmp-card-btn.active {
        background: var(--gold,#d4af37); border-color: var(--gold,#d4af37); color: #111;
      }

      /* Modal */
      .cmp-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 9100;
        display: none; align-items: flex-start; justify-content: center; padding: 20px;
        overflow-y: auto;
      }
      .cmp-modal-overlay.open { display: flex; }
      .cmp-modal-box {
        background: #fff; border-radius: 20px; width: 100%; max-width: 960px;
        box-shadow: 0 24px 64px rgba(0,0,0,.25); margin: auto; flex-shrink: 0;
      }
      .cmp-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 24px; border-bottom: 1px solid rgba(17,24,39,.08);
      }
      .cmp-modal-header h2 { font-size: 1.3rem; font-weight: 800; margin: 0; }
      .cmp-modal-close {
        width: 36px; height: 36px; border-radius: 50%; border: none; background: #f3f4f6;
        font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
      }
      .cmp-modal-scroll { overflow-x: auto; }
      .cmp-table { width: 100%; border-collapse: collapse; min-width: 480px; }
      .cmp-table th, .cmp-table td { padding: 10px 14px; text-align: center; border-bottom: 1px solid #f3f4f6; font-size: .88rem; }
      .cmp-table thead th { background: #f9fafb; border-bottom: 2px solid rgba(17,24,39,.08); }
      .cmp-row-label { text-align: left !important; font-weight: 600; color: var(--muted,#6b7280); background: #fafafa; white-space: nowrap; }
      .cmp-section-header { background: rgba(212,175,55,.12); color: var(--text,#111827); font-weight: 800; }
      .cmp-highlight { font-weight: 800; color: var(--gold,#d4af37); font-size: 1rem; }
      .cmp-best { font-weight: 800; background: rgba(212,175,55,.08); }
      .cmp-card-header { display: flex; flex-direction: column; gap: 6px; align-items: center; }
      .cmp-modal-img { width: 100%; height: 100px; object-fit: cover; border-radius: 8px; }
      .cmp-modal-title { font-size: .82rem; font-weight: 700; line-height: 1.3; margin: 0; }
      .cmp-modal-remove { background: none; border: none; color: #ef4444; font-size: .75rem; cursor: pointer; font-weight: 700; }
      .cmp-modal-link { color: var(--gold,#d4af37); font-size: .78rem; font-weight: 700; text-decoration: none; }
      .cmp-modal-footer { padding: 14px 24px; border-top: 1px solid rgba(17,24,39,.08); display: flex; align-items: center; gap: 14px; }
    `;
    document.head.appendChild(s);
  }

  /* ─── Observador de tarjetas nuevas ─────────────────────── */
  const _observer = new MutationObserver(() => {
    if (document.querySelectorAll('.card[data-id]').length) injectButtonsInCards();
  });

  /* ─── Bootstrap ─────────────────────────────────────────── */
  function init() {
    injectStyles();
    _items = lsLoad();
    updateTray();

    // Inyectar botones en tarjetas ya existentes
    injectButtonsInCards();

    // Observar nuevas tarjetas renderizadas dinámicamente
    _observer.observe(document.body, { childList: true, subtree: true });

    // Si viene de detalle con ?compare=id
    const params = new URLSearchParams(window.location.search);
    const compareId = params.get('compare');
    if (compareId && window.propertyDB) {
      const prop = window.propertyDB.getById(compareId);
      if (prop) add(prop);
    }

    // Escuchar evento de DB lista para inyectar botones
    window.addEventListener('altorra:db-ready', injectButtonsInCards);
    window.addEventListener('altorra:db-refreshed', injectButtonsInCards);
  }

  /* ─── API pública ───────────────────────────────────────── */
  window.AltorraComparador = { add, remove, clear, has, openModal, closeModal, init };

  // Auto-init cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
