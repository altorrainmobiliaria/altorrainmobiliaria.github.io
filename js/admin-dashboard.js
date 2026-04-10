/**
 * admin-dashboard.js — Dashboard de estadísticas para el panel admin
 * Altorra Inmobiliaria
 *
 * Muestra en section-dashboard:
 *   - 4 stat-cards: propiedades activas, leads totales, leads pendientes, reseñas activas
 *   - Tabla de leads recientes (últimos 5)
 *   - Top 5 propiedades más vistas (desde analytics localStorage)
 *   - Top 5 términos de búsqueda (desde analytics localStorage)
 *   - Leads por tipo (gráfico de barras simple CSS)
 *
 * Requiere: window.db, window.AdminAuth, window.AltorraAnalytics
 */

(function () {
  'use strict';

  /* ─── Helpers ─────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }

  function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str ?? ''));
    return d.innerHTML;
  }

  function fmtDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function tipoLabel(tipo) {
    const map = {
      contacto_propiedad: 'Contacto',
      publicar_propiedad: 'Publicar',
      solicitud_avaluo:   'Avalúo',
      solicitud_juridica: 'Jurídico',
      solicitud_contable: 'Contable',
      otro:               'Otro',
    };
    return map[tipo] || tipo || '—';
  }

  /* ─── Cargar datos del dashboard ────────────────────────── */
  async function loadDashboard() {
    if (!window.db || !window.AdminAuth?.getCurrentUser()) return;

    try {
      const { collection, getDocs, query, orderBy, limit, where } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

      // ── Queries en paralelo ──────────────────────────────
      const [propsSnap, leadsSnap, resenasSnap] = await Promise.all([
        getDocs(query(collection(window.db, 'propiedades'), where('disponible', '==', true), limit(200))),
        getDocs(query(collection(window.db, 'solicitudes'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(window.db, 'resenas'),    where('activa', '==', true))),
      ]);

      const props    = propsSnap.docs.map(d => d.data());
      const leads    = leadsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
      const resenas  = resenasSnap.docs.length;

      // ── Stat cards ───────────────────────────────────────
      const pending = leads.filter(l => l.estado === 'pendiente').length;
      setStatCard('statProps',   props.length,  'disponibles');
      setStatCard('statLeads',   leads.length,  'total recibidos');
      setStatCard('statPending', pending,        pending > 0 ? 'sin atender' : 'al día');
      setStatCard('statResenas', resenas,        'publicadas');

      // ── Leads recientes ──────────────────────────────────
      renderRecentLeads(leads.slice(0, 5));

      // ── Analytics locales ────────────────────────────────
      renderAnalyticsSection(leads);

    } catch (err) {
      console.error('[Dashboard] Error cargando datos:', err);
    }
  }

  function setStatCard(id, value, sub) {
    const el = $(id);
    if (el) el.textContent = value;
    const subEl = el?.parentElement?.querySelector('.stat-sub');
    if (subEl && sub !== undefined) subEl.textContent = sub;
  }

  /* ─── Leads recientes ───────────────────────────────────── */
  function renderRecentLeads(leads) {
    const container = $('recentLeads');
    if (!container) return;

    if (!leads.length) {
      container.innerHTML = '<p style="color:var(--muted);padding:16px 0">No hay leads aún.</p>';
      return;
    }

    container.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Fecha</th><th>Nombre</th><th>Tipo</th><th>Estado</th></tr></thead>
          <tbody>
            ${leads.map(l => `
            <tr>
              <td>${escHtml(fmtDate(l.createdAt))}</td>
              <td>
                <strong>${escHtml(l.nombre || '—')}</strong>
                <br><small>${escHtml(l.email || '')}</small>
              </td>
              <td>${escHtml(tipoLabel(l.tipo))}</td>
              <td><span class="badge-status badge-${escHtml(l.estado || 'pendiente')}">${escHtml(l.estado || 'pendiente')}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top:10px">
        <a href="#leads" class="btn-admin btn-sm btn-secondary" data-section="leads"
           onclick="document.querySelector('[data-section=leads]')?.click()">
          Ver todos los leads →
        </a>
      </div>`;
  }

  /* ─── Analytics — datos del localStorage ───────────────── */
  function renderAnalyticsSection(leads) {
    const container = $('recentLeads');
    if (!container) return;

    const stats = window.AltorraAnalytics?.getStats?.() || {};

    // ── Leads por tipo ───────────────────────────────────────
    const leadsByType = {};
    leads.forEach(l => {
      const k = tipoLabel(l.tipo);
      leadsByType[k] = (leadsByType[k] || 0) + 1;
    });
    const maxLeadType = Math.max(...Object.values(leadsByType), 1);

    // ── Top búsquedas ────────────────────────────────────────
    const searches = Object.entries(stats.searchTerms || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 5);

    // ── Top propiedades vistas ───────────────────────────────
    const topProps = Object.entries(stats.topProperties || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 5);

    const analyticsHtml = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:24px">

        <!-- Leads por tipo -->
        <div class="admin-card" style="padding:0">
          <div class="admin-card-header"><h2>Leads por tipo</h2></div>
          <div class="admin-card-body" style="padding:16px">
            ${Object.keys(leadsByType).length ? Object.entries(leadsByType)
              .sort((a, b) => b[1] - a[1])
              .map(([tipo, n]) => `
              <div style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:4px">
                  <span>${escHtml(tipo)}</span><strong>${n}</strong>
                </div>
                <div style="height:6px;background:#f3f4f6;border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${Math.round(n/maxLeadType*100)}%;background:var(--gold);border-radius:3px"></div>
                </div>
              </div>`).join('')
            : '<p style="color:var(--muted);font-size:.9rem">Sin datos aún</p>'}
          </div>
        </div>

        <!-- Top búsquedas -->
        <div class="admin-card" style="padding:0">
          <div class="admin-card-header"><h2>Búsquedas frecuentes <small style="font-weight:400;color:var(--muted)">(este dispositivo)</small></h2></div>
          <div class="admin-card-body" style="padding:16px">
            ${searches.length ? `
            <ol style="padding-left:18px;margin:0">
              ${searches.map(([q, n]) => `
              <li style="margin-bottom:6px;font-size:.9rem">
                <strong>${escHtml(q)}</strong>
                <span style="color:var(--muted);margin-left:6px">(${n})</span>
              </li>`).join('')}
            </ol>` : '<p style="color:var(--muted);font-size:.9rem">Sin datos aún</p>'}
          </div>
        </div>

        <!-- Top propiedades vistas -->
        <div class="admin-card" style="padding:0">
          <div class="admin-card-header"><h2>Propiedades más vistas <small style="font-weight:400;color:var(--muted)">(este dispositivo)</small></h2></div>
          <div class="admin-card-body" style="padding:16px">
            ${topProps.length ? `
            <ol style="padding-left:18px;margin:0">
              ${topProps.map(([id, n]) => `
              <li style="margin-bottom:6px;font-size:.9rem">
                <a href="detalle-propiedad.html?id=${escHtml(id)}" target="_blank" rel="noopener"
                   style="color:var(--gold);font-weight:700">${escHtml(id)}</a>
                <span style="color:var(--muted);margin-left:6px">(${n} vistas)</span>
              </li>`).join('')}
            </ol>` : '<p style="color:var(--muted);font-size:.9rem">Sin datos aún</p>'}
          </div>
        </div>

      </div>`;

    container.insertAdjacentHTML('afterend', analyticsHtml);
  }

  /* ─── Bootstrap ─────────────────────────────────────────── */
  function init() {
    // Cargar al inicio (si ya está en dashboard)
    if ($('section-dashboard')?.classList.contains('active')) {
      loadDashboard();
    }

    // Cargar al navegar a dashboard
    window.addEventListener('altorra:admin-navigate', (e) => {
      if (e.detail?.section === 'dashboard') {
        // Limpiar el contenido previo de analytics para no duplicar
        const prev = document.querySelectorAll('#recentLeads ~ div');
        prev.forEach(el => el.remove());
        loadDashboard();
      }
    });
  }

  /* ─── API pública ─────────────────────────────────────────── */
  window.AdminDashboard = { load: loadDashboard };

  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('altorra:admin-ready', init, { once: true });
    if (window.AdminAuth?.getCurrentUser()) init();
  });

})();
