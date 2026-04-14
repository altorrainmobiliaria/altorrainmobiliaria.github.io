(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────
     mapa-propiedades.js  — Mapa interactivo con markers
     API pública: window.MapaPropiedades.{init, setFilter, destroy}
  ────────────────────────────────────────────────────────────────*/

  // La API key se lee desde window.AltorraKeys.gmapsApiKey (definida en firebase-config.js).
  // Si está vacía, el mapa muestra un estado "no configurado" en lugar de romperse.
  function getGmapsKey() {
    return (window.AltorraKeys && window.AltorraKeys.gmapsApiKey) || '';
  }
  const DEFAULT_CENTER = { lat: 10.391049, lng: -75.479426 }; // Cartagena
  const DEFAULT_ZOOM   = 12;

  let _map       = null;
  let _markers   = [];
  let _infoWin   = null;
  let _props     = [];
  let _filter    = {};
  let _container = null;
  let _gmLoaded  = false;

  /* ── Carga dinámica de Google Maps SDK ── */
  function loadGoogleMaps() {
    if (_gmLoaded || window.google?.maps) { _gmLoaded = true; return Promise.resolve(); }
    const key = getGmapsKey();
    if (!key) {
      return Promise.reject(new Error('GMAPS_API_KEY_MISSING'));
    }
    return new Promise((resolve, reject) => {
      const callbackName = '__altorra_maps_cb';
      window[callbackName] = () => { _gmLoaded = true; resolve(); };
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${callbackName}&loading=async`;
      s.async = true;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* ── Inicializar mapa ── */
  function initMap(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    _container = el;

    _map = new google.maps.Map(el, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
      styles: mapStyles(),
    });

    _infoWin = new google.maps.InfoWindow({ maxWidth: 280 });
  }

  /* ── Crear markers ── */
  function renderMarkers(props) {
    clearMarkers();

    const filtered = applyFilter(props);
    if (!filtered.length) return;

    const bounds = new google.maps.LatLngBounds();

    filtered.forEach(p => {
      const lat = p.coords?.lat ?? p.lat;
      const lng = p.coords?.lng ?? p.lng;
      if (!lat || !lng) return;

      const pos = { lat, lng };
      const marker = new google.maps.Marker({
        position: pos,
        map: _map,
        title: p.titulo || p.title || '',
        icon: markerIcon(p),
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => openInfoWindow(marker, p));
      _markers.push(marker);
      bounds.extend(pos);
    });

    if (_markers.length === 1) {
      _map.setCenter(bounds.getCenter());
      _map.setZoom(15);
    } else if (_markers.length > 1) {
      _map.fitBounds(bounds, 60);
    }
  }

  function clearMarkers() {
    _markers.forEach(m => m.setMap(null));
    _markers = [];
  }

  /* ── InfoWindow HTML ── */
  function openInfoWindow(marker, p) {
    const precio  = p.precio        ? formatCOP(p.precio)        : (p.price ? formatCOP(p.price) : '—');
    const titulo  = p.titulo        || p.title || 'Propiedad';
    const ciudad  = p.ciudad        || p.city  || '';
    const barrio  = p.barrio        || p.neighborhood || '';
    const beds    = p.habitaciones  ?? p.beds  ?? '';
    const baths   = p.banos         ?? p.baths ?? '';
    const sqm     = p.sqm           ?? '';
    const op      = p.operacion     || p.operation || '';
    const id      = p.id            || '';
    const img     = p.imagen        || p.image || '';
    const opLabel = { comprar: 'Venta', arrendar: 'Arriendo', dias: 'Por días' }[op] || op;

    const imgHtml = img
      ? `<img src="${esc(img)}" alt="${esc(titulo)}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;display:block">`
      : '';

    const specsHtml = [
      beds  ? `${beds} hab.`    : '',
      baths ? `${baths} baños`  : '',
      sqm   ? `${sqm} m²`       : '',
    ].filter(Boolean).join(' · ');

    _infoWin.setContent(`
      <div style="font-family:Poppins,sans-serif;min-width:220px;border-radius:8px;overflow:hidden">
        ${imgHtml}
        <div style="padding:12px">
          <div style="font-size:.7rem;font-weight:700;color:#d4af37;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${esc(opLabel)}</div>
          <div style="font-size:.88rem;font-weight:700;color:#111827;line-height:1.3;margin-bottom:4px">${esc(titulo)}</div>
          ${ciudad || barrio ? `<div style="font-size:.75rem;color:#6b7280;margin-bottom:6px">${esc([barrio, ciudad].filter(Boolean).join(', '))}</div>` : ''}
          ${specsHtml ? `<div style="font-size:.75rem;color:#6b7280;margin-bottom:8px">${esc(specsHtml)}</div>` : ''}
          <div style="font-size:1rem;font-weight:800;color:#111827;margin-bottom:10px">${esc(precio)}</div>
          <a href="detalle-propiedad.html?id=${esc(id)}"
             style="display:block;text-align:center;background:linear-gradient(135deg,#d4af37,#ffb400);color:#000;text-decoration:none;padding:7px 0;border-radius:8px;font-size:.8rem;font-weight:700">
            Ver propiedad →
          </a>
        </div>
      </div>
    `);
    _infoWin.open(_map, marker);
  }

  /* ── Icono de marker por operación ── */
  function markerIcon(p) {
    const op = p.operacion || p.operation || '';
    const colors = { comprar: '#d4af37', arrendar: '#3b82f6', dias: '#10b981' };
    const fill = colors[op] || '#d4af37';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26S36 30 36 18C36 8.06 27.94 0 18 0z" fill="${fill}"/>
      <circle cx="18" cy="18" r="8" fill="#fff"/>
    </svg>`;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(36, 44),
      anchor: new google.maps.Point(18, 44),
    };
  }

  /* ── Filtro ── */
  function applyFilter(props) {
    return props.filter(p => {
      const op     = p.operacion || p.operation || '';
      const tipo   = p.tipo      || p.type      || '';
      const ciudad = (p.ciudad   || p.city      || '').toLowerCase();
      const disp   = p.disponible !== undefined ? p.disponible : p.available;

      if (disp === false || disp === 0) return false;
      if (_filter.operacion && op !== _filter.operacion) return false;
      if (_filter.tipo      && tipo !== _filter.tipo)    return false;
      if (_filter.ciudad    && !ciudad.includes(_filter.ciudad.toLowerCase())) return false;
      return true;
    });
  }

  /* ── Utilidades ── */
  function formatCOP(v) {
    if (window.AltorraUtils?.formatCOP) return window.AltorraUtils.formatCOP(v);
    if (!v) return '—';
    return '$ ' + Number(v).toLocaleString('es-CO');
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Estilos del mapa (gris neutro elegante) ── */
  function mapStyles() {
    return [
      { featureType: 'all',         elementType: 'labels.text.fill',   stylers: [{ color: '#374151' }] },
      { featureType: 'water',       elementType: 'geometry',            stylers: [{ color: '#bfdbfe' }] },
      { featureType: 'landscape',   elementType: 'geometry',            stylers: [{ color: '#f3f4f6' }] },
      { featureType: 'road',        elementType: 'geometry',            stylers: [{ color: '#ffffff' }] },
      { featureType: 'road.arterial', elementType: 'geometry',          stylers: [{ color: '#e5e7eb' }] },
      { featureType: 'poi',         elementType: 'geometry',            stylers: [{ color: '#e5e7eb' }] },
      { featureType: 'poi',         elementType: 'labels',              stylers: [{ visibility: 'off' }] },
      { featureType: 'transit',     elementType: 'geometry',            stylers: [{ color: '#f3f4f6' }] },
    ];
  }

  /* ── Inyectar controles de filtro encima del mapa ── */
  function renderControls(wrapper) {
    const bar = document.createElement('div');
    bar.id = 'mapa-filtros';
    bar.style.cssText = [
      'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;',
      'align-items:center;',
    ].join('');

    bar.innerHTML = `
      <select id="mapaFiltroOp" style="${selStyle()}">
        <option value="">Todas las operaciones</option>
        <option value="comprar">Venta</option>
        <option value="arrendar">Arriendo</option>
        <option value="dias">Por días</option>
      </select>
      <select id="mapaFiltroTipo" style="${selStyle()}">
        <option value="">Todos los tipos</option>
        <option value="apartamento">Apartamento</option>
        <option value="casa">Casa</option>
        <option value="lote">Lote</option>
        <option value="oficina">Oficina</option>
      </select>
      <input id="mapaFiltroCiudad" placeholder="Ciudad…"
             style="${selStyle()}padding-right:10px" maxlength="60"/>
      <button id="mapaFiltroReset"
              style="padding:7px 14px;border:1.5px solid #d4af37;border-radius:8px;background:#fff;color:#d4af37;font-weight:700;cursor:pointer;font-size:.82rem">
        Limpiar
      </button>
      <span id="mapaCount" style="margin-left:auto;font-size:.8rem;color:#6b7280"></span>
    `;

    wrapper.parentNode.insertBefore(bar, wrapper);

    bar.querySelector('#mapaFiltroOp').addEventListener('change', e => {
      _filter.operacion = e.target.value; refresh();
    });
    bar.querySelector('#mapaFiltroTipo').addEventListener('change', e => {
      _filter.tipo = e.target.value; refresh();
    });
    bar.querySelector('#mapaFiltroCiudad').addEventListener('input', e => {
      _filter.ciudad = e.target.value; refresh();
    });
    bar.querySelector('#mapaFiltroReset').addEventListener('click', () => {
      _filter = {};
      bar.querySelector('#mapaFiltroOp').value = '';
      bar.querySelector('#mapaFiltroTipo').value = '';
      bar.querySelector('#mapaFiltroCiudad').value = '';
      refresh();
    });
  }

  function selStyle() {
    return [
      'padding:7px 10px;border:1.5px solid #e5e7eb;border-radius:8px;',
      'font-size:.82rem;color:#111827;background:#fff;cursor:pointer;',
      'font-family:Poppins,sans-serif;min-width:160px;',
    ].join('');
  }

  function updateCount() {
    const el = document.getElementById('mapaCount');
    if (el) {
      const n = applyFilter(_props).length;
      el.textContent = `${n} propiedad${n !== 1 ? 'es' : ''} en el mapa`;
    }
  }

  function refresh() {
    renderMarkers(_props);
    updateCount();
  }

  /* ── API pública ── */
  async function init(containerId) {
    const wrapper = document.getElementById(containerId);
    if (!wrapper) return;

    // Mostrar skeleton mientras carga
    wrapper.style.background = '#f3f4f6';
    wrapper.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:.9rem">Cargando mapa…</div>';

    // Inyectar controles
    renderControls(wrapper);

    try {
      // Cargar propiedades (fuente única: Firestore vía PropertyDatabase)
      const dbReady = new Promise(resolve => {
        if (window.propertyDB?.isLoaded) return resolve();
        window.addEventListener('altorra:db-ready', resolve, { once: true });
        setTimeout(resolve, 8000);
      });
      await dbReady;

      _props = window.propertyDB?.properties || [];

      // Cargar Google Maps
      await loadGoogleMaps();

      // Limpiar skeleton
      wrapper.innerHTML = '';
      wrapper.style.background = '';

      initMap(containerId);
      renderMarkers(_props);
      updateCount();

      // Re-render cuando Firestore trae datos nuevos
      const onRefresh = () => {
        _props = window.propertyDB?.properties || [];
        renderMarkers(_props);
        updateCount();
      };
      window.addEventListener('altorra:db-refreshed', onRefresh);
      window.addEventListener('altorra:cache-invalidated', onRefresh);

    } catch (err) {
      console.error('[MapaPropiedades] Error:', err);
      const msg = err && err.message === 'GMAPS_API_KEY_MISSING'
        ? 'Mapa no disponible: falta configurar la clave de Google Maps.'
        : 'No se pudo cargar el mapa. Verifica tu conexión o la clave de Google Maps.';
      wrapper.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#6b7280;font-size:.9rem;padding:24px;text-align:center">
          <span style="font-size:2rem">🗺️</span>
          <span>${msg}</span>
        </div>`;
    }
  }

  function setFilter(filterObj) {
    _filter = { ..._filter, ...filterObj };
    if (_map && _props.length) refresh();
  }

  function destroy() {
    clearMarkers();
    _infoWin?.close();
    _map    = null;
    _infoWin = null;
    _props  = [];
    _filter = {};
    _container = null;
  }

  window.MapaPropiedades = { init, setFilter, destroy };

  // Auto-init si hay elemento en página
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('mapa-propiedades');
    if (el) MapaPropiedades.init('mapa-propiedades');
  });

})();
