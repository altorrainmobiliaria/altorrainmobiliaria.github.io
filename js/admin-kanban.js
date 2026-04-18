(function () {
  'use strict';

  const COLUMNS = [
    { id: 'pendiente',  title: '🆕 Nuevo',      color: '#3b82f6', description: 'Leads recién recibidos' },
    { id: 'en_gestion', title: '📞 Contactado', color: '#f59e0b', description: 'Ya iniciamos contacto' },
    { id: 'visita',     title: '📅 Visita',     color: '#a855f7', description: 'Visita agendada o realizada' },
    { id: 'cerrado',    title: '✅ Cierre',     color: '#22c55e', description: 'Cerrado (ganado/perdido)' }
  ];

  let currentView = 'list';

  function injectCSS() {
    if (document.getElementById('kanban-css')) return;
    const s = document.createElement('style');
    s.id = 'kanban-css';
    s.textContent = `
      .kanban-toggle{display:flex;gap:6px;margin-bottom:14px;align-items:center}
      .kanban-toggle button{padding:8px 14px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;font-weight:700;font-size:.82rem;cursor:pointer;transition:all .15s;font-family:inherit}
      .kanban-toggle button.active{background:linear-gradient(135deg,#d4af37,#ffb400);border-color:transparent;color:#000}
      .kanban-board{display:grid;grid-template-columns:repeat(4,minmax(230px,1fr));gap:14px;overflow-x:auto;padding-bottom:12px}
      @media(max-width:900px){.kanban-board{grid-template-columns:repeat(4,260px);width:100%}}
      .kanban-col{background:#f9fafb;border-radius:12px;padding:14px;min-height:400px;display:flex;flex-direction:column}
      .kanban-col-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;margin-bottom:10px;border-bottom:2px solid}
      .kanban-col-title{font-weight:800;font-size:.88rem}
      .kanban-col-count{background:#fff;border-radius:999px;padding:2px 10px;font-size:.72rem;font-weight:800;color:#6b7280}
      .kanban-col-body{flex:1;display:flex;flex-direction:column;gap:8px;min-height:80px;transition:background .15s;border-radius:8px;padding:4px}
      .kanban-col-body.drag-over{background:rgba(212,175,55,.08);outline:2px dashed rgba(212,175,55,.4)}
      .kanban-card{background:#fff;border-radius:10px;padding:12px;box-shadow:0 2px 6px rgba(0,0,0,.05);cursor:grab;border-left:3px solid #e5e7eb;transition:transform .12s,box-shadow .12s}
      .kanban-card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08)}
      .kanban-card:active{cursor:grabbing}
      .kanban-card.dragging{opacity:.4;transform:rotate(2deg)}
      .kanban-card-name{font-weight:700;font-size:.9rem;margin:0 0 4px;line-height:1.3}
      .kanban-card-tipo{font-size:.72rem;color:#6b7280;margin:0 0 6px;text-transform:uppercase;letter-spacing:.3px}
      .kanban-card-meta{font-size:.78rem;color:#374151;margin:0;line-height:1.4}
      .kanban-card-date{font-size:.7rem;color:#9ca3af;margin-top:6px}
      .kanban-card-tier-hot{border-left-color:#ef4444}
      .kanban-card-tier-warm{border-left-color:#f59e0b}
      .kanban-card-tier-cold{border-left-color:#3b82f6}
      .kanban-empty{color:#9ca3af;font-size:.78rem;text-align:center;padding:18px 8px;font-style:italic}
      .kanban-score{display:inline-block;padding:1px 6px;border-radius:4px;font-size:.66rem;font-weight:800;margin-left:4px}
      .kanban-score.hot{background:#fee2e2;color:#991b1b}
      .kanban-score.warm{background:#fef3c7;color:#92400e}
      .kanban-score.cold{background:#dbeafe;color:#1e40af}
    `;
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function fmtDate(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diffH = (now - d) / (1000 * 60 * 60);
    if (diffH < 1) return 'Hace ' + Math.max(1, Math.floor(diffH * 60)) + ' min';
    if (diffH < 24) return 'Hace ' + Math.floor(diffH) + 'h';
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }

  function tipoLabel(t) {
    const map = {
      contacto_propiedad: 'Contacto propiedad',
      publicar_propiedad: 'Publicar',
      solicitud_avaluo:   'Avalúo',
      solicitud_juridica: 'Jurídico',
      solicitud_contable: 'Contable',
      agenda_visita:      'Agenda visita',
      solicitud_credito:  'Crédito',
      gestion_renta_turistica: 'Gestión Airbnb',
    };
    return map[t] || t || 'Otro';
  }

  function buildCard(lead) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', lead._docId);
    card.setAttribute('data-estado', lead.estado || 'pendiente');

    const tier = lead.leadTier || '';
    if (tier) card.classList.add('kanban-card-tier-' + tier);

    const propTitle = lead.datosExtra?.propiedadTitulo || lead.datosExtra?.propiedadId || '';
    const scoreBadge = tier
      ? `<span class="kanban-score ${tier}">${(lead.leadScore || 0)}</span>`
      : '';

    card.innerHTML = `
      <div class="kanban-card-name">${esc(lead.nombre || 'Sin nombre')}${scoreBadge}</div>
      <div class="kanban-card-tipo">${esc(tipoLabel(lead.tipo))}</div>
      ${propTitle ? `<div class="kanban-card-meta">🏠 ${esc(propTitle)}</div>` : ''}
      ${lead.telefono ? `<div class="kanban-card-meta">📱 ${esc(lead.telefono)}</div>` : ''}
      <div class="kanban-card-date">${fmtDate(lead.createdAt)}</div>
    `;

    card.addEventListener('dragstart', function (e) {
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', lead._docId);
    });

    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
    });

    card.addEventListener('click', function () {
      if (window.AdminLeads && typeof window.AdminLeads.openDetail === 'function') {
        window.AdminLeads.openDetail(lead._docId);
      }
    });

    return card;
  }

  function render(leads) {
    injectCSS();
    const host = document.getElementById('kanbanBoard');
    if (!host) return;

    host.innerHTML = '';
    COLUMNS.forEach(function (col) {
      const colEl = document.createElement('div');
      colEl.className = 'kanban-col';
      colEl.setAttribute('data-estado', col.id);

      const colLeads = (leads || []).filter(function (l) {
        return (l.estado || 'pendiente') === col.id;
      });

      colEl.innerHTML = `
        <div class="kanban-col-header" style="border-bottom-color:${col.color}">
          <div>
            <div class="kanban-col-title" style="color:${col.color}">${col.title}</div>
          </div>
          <div class="kanban-col-count">${colLeads.length}</div>
        </div>
        <div class="kanban-col-body" data-estado="${col.id}"></div>
      `;

      const body = colEl.querySelector('.kanban-col-body');

      if (colLeads.length === 0) {
        body.innerHTML = '<div class="kanban-empty">Sin leads</div>';
      } else {
        colLeads.forEach(function (lead) {
          body.appendChild(buildCard(lead));
        });
      }

      body.addEventListener('dragover', function (e) {
        e.preventDefault();
        body.classList.add('drag-over');
      });
      body.addEventListener('dragleave', function () {
        body.classList.remove('drag-over');
      });
      body.addEventListener('drop', function (e) {
        e.preventDefault();
        body.classList.remove('drag-over');
        const docId = e.dataTransfer.getData('text/plain');
        const newEstado = body.getAttribute('data-estado');
        if (!docId || !newEstado) return;
        if (window.AdminLeads && typeof window.AdminLeads.updateStatus === 'function') {
          window.AdminLeads.updateStatus(docId, newEstado);
        }
      });

      host.appendChild(colEl);
    });
  }

  function setupToggle() {
    const container = document.getElementById('section-leads');
    if (!container) return;
    if (container.querySelector('.kanban-toggle')) return;

    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'kanban-toggle';
    toggleWrap.innerHTML = `
      <span style="font-size:.82rem;color:#6b7280;margin-right:6px">Vista:</span>
      <button type="button" data-view="list" class="active">📋 Lista</button>
      <button type="button" data-view="kanban">📊 Kanban</button>
    `;

    const filters = container.querySelector('.admin-filters') || container.querySelector('.admin-card-body');
    if (filters) filters.parentElement.insertBefore(toggleWrap, filters);

    const listWrap = container.querySelector('.admin-table-wrap');
    const pagination = container.querySelector('#leadsPagination');

    const kanbanHost = document.createElement('div');
    kanbanHost.id = 'kanbanBoard';
    kanbanHost.className = 'kanban-board';
    kanbanHost.style.display = 'none';
    if (listWrap) listWrap.parentElement.insertBefore(kanbanHost, listWrap.nextSibling);

    toggleWrap.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-view]');
      if (!btn) return;
      const view = btn.getAttribute('data-view');
      currentView = view;

      toggleWrap.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      if (view === 'kanban') {
        if (listWrap) listWrap.style.display = 'none';
        if (pagination) pagination.style.display = 'none';
        kanbanHost.style.display = 'grid';
        if (window.AdminLeads && window.AdminLeads._allLeads) {
          render(window.AdminLeads._allLeads);
        }
      } else {
        if (listWrap) listWrap.style.display = '';
        if (pagination) pagination.style.display = '';
        kanbanHost.style.display = 'none';
      }
    });
  }

  function init() {
    setupToggle();
    window.addEventListener('altorra:leads-updated', function (e) {
      if (currentView === 'kanban' && e.detail && e.detail.leads) {
        render(e.detail.leads);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AdminKanban = { render: render, getCurrentView: function () { return currentView; } };
})();
