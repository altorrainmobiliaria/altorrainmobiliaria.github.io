/**
 * admin-dashboard.js — Dashboard analytics para el panel admin
 * Altorra Inmobiliaria — D6
 *
 * Secciones:
 *   1. Stat cards (propiedades, leads, pendientes, reseñas, WhatsApp, newsletter)
 *   2. Leads recientes (últimos 5)
 *   3. Leads por tipo (barras horizontales)
 *   4. WhatsApp clicks por fuente (Firestore analytics_events)
 *   5. Leads últimos 30 días (barras verticales)
 *   6. Embudo de conversión (pendiente → contactado → visita → cierre)
 *   7. Top propiedades vistas + Top búsquedas (localStorage)
 */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  function escHtml(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str ?? ''));
    return d.innerHTML;
  }

  function fmtDate(ts) {
    if (!ts) return '\u2014';
    var d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function fmtShortDate(d) {
    return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
  }

  var TIPO_LABELS = {
    contacto_propiedad:        'Contacto propiedad',
    publicar_propiedad:        'Publicar propiedad',
    solicitud_avaluo:          'Aval\u00FAo',
    solicitud_juridica:        'Jur\u00EDdico',
    solicitud_contable:        'Contable',
    gestion_renta_turistica:   'Renta tur\u00EDstica',
    otro:                      'Otro',
  };

  function tipoLabel(tipo) { return TIPO_LABELS[tipo] || tipo || '\u2014'; }

  var SOURCE_LABELS = {
    float_button:   'Bot\u00F3n flotante',
    hero:           'Hero',
    contact_form:   'Formulario',
    property_card:  'Tarjeta propiedad',
    cta_section:    'CTA',
    footer:         'Footer',
    sidebar:        'Sidebar',
    inline:         'Enlace inline',
  };

  var STAGE_LABELS = {
    pendiente:   { label: 'Nuevo',      color: '#6366f1', icon: '\uD83C\uDD95' },
    en_gestion:  { label: 'Contactado', color: '#f59e0b', icon: '\uD83D\uDCDE' },
    visita:      { label: 'Visita',     color: '#3b82f6', icon: '\uD83D\uDCC5' },
    cerrado:     { label: 'Cierre',     color: '#16a34a', icon: '\u2705' },
  };

  /* ─── Firestore helpers ──────────────────────────────── */
  var _fsMod = null;
  async function fs() {
    if (!_fsMod) _fsMod = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    return _fsMod;
  }

  /* ─── Main load ──────────────────────────────────────── */
  async function loadDashboard() {
    if (!window.db || !window.AdminAuth?.getCurrentUser()) return;

    try {
      var m = await fs();
      var thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      var [propsSnap, leadsSnap, resenasSnap, waSnap, nlSnap] = await Promise.all([
        m.getDocs(m.query(m.collection(window.db, 'propiedades'), m.where('disponible', '==', true), m.limit(200))),
        m.getDocs(m.query(m.collection(window.db, 'solicitudes'), m.orderBy('createdAt', 'desc'), m.limit(200))),
        m.getDocs(m.query(m.collection(window.db, 'resenas'), m.where('activa', '==', true))),
        m.getDocs(m.query(
          m.collection(window.db, 'analytics_events'),
          m.where('type', '==', 'whatsapp_click'),
          m.orderBy('createdAt', 'desc'),
          m.limit(500)
        )),
        m.getDocs(m.query(m.collection(window.db, 'newsletter'), m.where('activo', '==', true), m.limit(500))),
      ]);

      try {
        window.AltorraMeter?.add(
          propsSnap.size + leadsSnap.size + resenasSnap.size + waSnap.size + nlSnap.size,
          'admin.dashboard'
        );
      } catch (_) {}

      var leads   = leadsSnap.docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); });
      var waClicks = waSnap.docs.map(function (d) { return d.data(); });
      var pending = leads.filter(function (l) { return l.estado === 'pendiente'; }).length;

      // Stat cards
      setStatCard('statProps',     propsSnap.size, 'disponibles');
      setStatCard('statLeads',     leads.length,   'total recibidos');
      setStatCard('statPending',   pending,         pending > 0 ? 'sin atender' : 'al d\u00EDa');
      setStatCard('statResenas',   resenasSnap.size, 'publicadas');
      setStatCard('statWhatsApp',  waClicks.length,  'clicks');
      setStatCard('statNewsletter', nlSnap.size,     'suscriptores');

      renderRecentLeads(leads.slice(0, 5));
      renderAnalyticsGrid(leads, waClicks);
      try { window.AltorraMeter?.renderWidget('readsMeterContainer'); } catch (_) {}

    } catch (err) {
      console.error('[Dashboard] Error:', err);
    }
  }

  function setStatCard(id, value, sub) {
    var el = $(id);
    if (el) el.textContent = value;
    var subEl = el?.parentElement?.querySelector('.stat-sub');
    if (subEl && sub !== undefined) subEl.textContent = sub;
  }

  /* ─── Recent leads table ─────────────────────────────── */
  function renderRecentLeads(leads) {
    var c = $('recentLeads');
    if (!c) return;
    if (!leads.length) {
      c.innerHTML = '<p style="color:var(--muted);padding:16px 0">No hay leads a\u00FAn.</p>';
      return;
    }
    c.innerHTML =
      '<div class="admin-table-wrap"><table class="admin-table">' +
      '<thead><tr><th>Fecha</th><th>Nombre</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>' +
      leads.map(function (l) {
        return '<tr>' +
          '<td>' + escHtml(fmtDate(l.createdAt)) + '</td>' +
          '<td><strong>' + escHtml(l.nombre || '\u2014') + '</strong><br><small>' + escHtml(l.email || '') + '</small></td>' +
          '<td>' + escHtml(tipoLabel(l.tipo)) + '</td>' +
          '<td><span class="badge-status badge-' + escHtml(l.estado || 'pendiente') + '">' + escHtml(l.estado || 'pendiente') + '</span></td>' +
          '</tr>';
      }).join('') +
      '</tbody></table></div>' +
      '<div style="margin-top:10px"><a href="#leads" class="btn-admin btn-sm btn-secondary" data-section="leads" ' +
      'onclick="document.querySelector(\'[data-section=leads]\')?.click()">Ver todos los leads \u2192</a></div>';
  }

  /* ─── Analytics grid ─────────────────────────────────── */
  function renderAnalyticsGrid(leads, waClicks) {
    var target = $('analyticsGrid');
    if (!target) return;

    var html = '';
    html += buildLeadsByType(leads);
    html += buildWhatsAppBySource(waClicks);
    html += buildLeadsTimeline(leads);
    html += buildConversionFunnel(leads);
    html += buildTopProperties();
    html += buildTopSearches();
    target.innerHTML = html;
  }

  /* ── 1. Leads by type ─────────────────────────────────── */
  function buildLeadsByType(leads) {
    var counts = {};
    leads.forEach(function (l) {
      var k = tipoLabel(l.tipo);
      counts[k] = (counts[k] || 0) + 1;
    });
    var entries = Object.entries(counts).sort(function (a, b) { return b[1] - a[1]; });
    var max = entries.length ? entries[0][1] : 1;

    return cardWrap('Leads por tipo', entries.length
      ? entries.map(function (e) { return barRow(e[0], e[1], max, 'var(--gold)'); }).join('')
      : emptyMsg());
  }

  /* ── 2. WhatsApp by source ────────────────────────────── */
  function buildWhatsAppBySource(clicks) {
    var counts = {};
    clicks.forEach(function (c) {
      var src = SOURCE_LABELS[c.source] || c.source || 'Otro';
      counts[src] = (counts[src] || 0) + 1;
    });
    var entries = Object.entries(counts).sort(function (a, b) { return b[1] - a[1]; });
    var max = entries.length ? entries[0][1] : 1;

    return cardWrap('WhatsApp por fuente', entries.length
      ? entries.map(function (e) { return barRow(e[0], e[1], max, '#25d366'); }).join('')
      : emptyMsg());
  }

  /* ── 3. Leads timeline (last 30 days) ─────────────────── */
  function buildLeadsTimeline(leads) {
    var days = {};
    var now = new Date();
    for (var i = 29; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    leads.forEach(function (l) {
      if (!l.createdAt) return;
      var d = l.createdAt.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
      var key = d.toISOString().slice(0, 10);
      if (key in days) days[key]++;
    });

    var entries = Object.entries(days);
    var max = Math.max.apply(null, entries.map(function (e) { return e[1]; }).concat([1]));
    var totalPeriod = entries.reduce(function (s, e) { return s + e[1]; }, 0);

    var barsHtml = entries.map(function (e) {
      var pct = Math.round((e[1] / max) * 100);
      var dateLabel = fmtShortDate(new Date(e[0] + 'T12:00:00'));
      return '<div class="tl-bar-col" title="' + escHtml(dateLabel) + ': ' + e[1] + ' leads">' +
        '<div class="tl-bar" style="height:' + Math.max(pct, 4) + '%' +
        (e[1] > 0 ? ';background:var(--gold)' : ';background:#e5e7eb') + '"></div></div>';
    }).join('');

    var content =
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">' +
        '<span style="font-size:.85rem;color:var(--muted)">\u00DAltimos 30 d\u00EDas</span>' +
        '<strong style="font-size:1.3rem">' + totalPeriod + ' leads</strong>' +
      '</div>' +
      '<div class="tl-chart">' + barsHtml + '</div>' +
      '<div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--muted);margin-top:4px">' +
        '<span>' + fmtShortDate(new Date(entries[0][0] + 'T12:00:00')) + '</span>' +
        '<span>Hoy</span>' +
      '</div>';

    return cardWrap('Leads \u00FAltimos 30 d\u00EDas', content);
  }

  /* ── 4. Conversion funnel ─────────────────────────────── */
  function buildConversionFunnel(leads) {
    var stages = { pendiente: 0, en_gestion: 0, visita: 0, cerrado: 0 };
    leads.forEach(function (l) {
      var s = l.estado || 'pendiente';
      if (s in stages) stages[s]++;
    });
    var total = leads.length || 1;

    var html = Object.entries(stages).map(function (e) {
      var key = e[0], count = e[1];
      var info = STAGE_LABELS[key] || { label: key, color: '#999', icon: '' };
      var pct = Math.round((count / total) * 100);
      return '<div class="funnel-row">' +
        '<div class="funnel-label">' +
          '<span>' + info.icon + ' ' + escHtml(info.label) + '</span>' +
          '<strong>' + count + ' <small style="font-weight:400;color:var(--muted)">(' + pct + '%)</small></strong>' +
        '</div>' +
        '<div class="funnel-bar-bg">' +
          '<div class="funnel-bar" style="width:' + Math.max(pct, 2) + '%;background:' + info.color + '"></div>' +
        '</div>' +
      '</div>';
    }).join('');

    return cardWrap('Embudo de conversi\u00F3n', html || emptyMsg());
  }

  /* ── 5. Top properties (localStorage) ─────────────────── */
  function buildTopProperties() {
    var stats = window.AltorraAnalytics?.getStats?.() || {};
    var entries = Object.entries(stats.topProperties || {})
      .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    var content = entries.length
      ? '<ol style="padding-left:18px;margin:0">' + entries.map(function (e) {
          return '<li style="margin-bottom:6px;font-size:.9rem">' +
            '<a href="detalle-propiedad.html?id=' + escHtml(e[0]) + '" target="_blank" rel="noopener" ' +
            'style="color:var(--gold);font-weight:700">' + escHtml(e[0]) + '</a>' +
            '<span style="color:var(--muted);margin-left:6px">(' + e[1] + ' vistas)</span></li>';
        }).join('') + '</ol>'
      : emptyMsg('Sin datos de vistas');
    return cardWrap('Propiedades m\u00E1s vistas <small style="font-weight:400;color:var(--muted)">(dispositivo)</small>', content);
  }

  /* ── 6. Top searches (localStorage) ───────────────────── */
  function buildTopSearches() {
    var stats = window.AltorraAnalytics?.getStats?.() || {};
    var entries = Object.entries(stats.searchTerms || {})
      .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    var content = entries.length
      ? '<ol style="padding-left:18px;margin:0">' + entries.map(function (e) {
          return '<li style="margin-bottom:6px;font-size:.9rem">' +
            '<strong>' + escHtml(e[0]) + '</strong>' +
            '<span style="color:var(--muted);margin-left:6px">(' + e[1] + ')</span></li>';
        }).join('') + '</ol>'
      : emptyMsg('Sin datos de b\u00FAsquedas');
    return cardWrap('B\u00FAsquedas frecuentes <small style="font-weight:400;color:var(--muted)">(dispositivo)</small>', content);
  }

  /* ─── Chart / UI helpers ─────────────────────────────── */
  function cardWrap(title, body) {
    return '<div class="admin-card dash-analytics-card" style="padding:0">' +
      '<div class="admin-card-header"><h2>' + title + '</h2></div>' +
      '<div class="admin-card-body" style="padding:16px">' + body + '</div></div>';
  }

  function barRow(label, value, max, color) {
    var pct = Math.round((value / max) * 100);
    return '<div style="margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:4px">' +
        '<span>' + escHtml(label) + '</span><strong>' + value + '</strong></div>' +
      '<div style="height:6px;background:#f3f4f6;border-radius:3px;overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;transition:width .4s"></div>' +
      '</div></div>';
  }

  function emptyMsg(txt) {
    return '<p style="color:var(--muted);font-size:.9rem">' + (txt || 'Sin datos a\u00FAn') + '</p>';
  }

  /* ─── Bootstrap ──────────────────────────────────────── */
  function init() {
    if ($('section-dashboard')?.classList.contains('active')) loadDashboard();
    window.addEventListener('altorra:admin-navigate', function (e) {
      if (e.detail?.section === 'dashboard') loadDashboard();
    });
  }

  window.AdminDashboard = { load: loadDashboard };

  document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('altorra:admin-ready', init, { once: true });
    if (window.AdminAuth?.getCurrentUser()) init();
  });

})();
