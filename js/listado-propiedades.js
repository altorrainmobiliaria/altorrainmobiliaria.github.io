/* ========================================
   ALTORRA - LISTADO DE PROPIEDADES
   Versión: 7.0 - FASE 2: Categorías, badges, vista, sort
   ======================================== */

(function() {
  'use strict';

  const PAGE_SIZE = 9;
  const WHATSAPP = { phone: '573002439810', company: 'Altorra Inmobiliaria' };

  const path = window.location.pathname.toLowerCase();
  const IS_BUSQUEDA = path.includes('busqueda');
  const PAGE_MODE = IS_BUSQUEDA ? null :
                    path.includes('arrendar') ? 'arrendar' :
                    path.includes('alojamientos') ? 'alojamientos' : 'comprar';

  const OPERATION_MAP = {
    'comprar': ['comprar', 'venta', 'ventas', 'sell', 'sale'],
    'arrendar': ['arrendar', 'arriendo', 'alquiler', 'alquilar', 'renta', 'rent'],
    'alojamientos': ['dias', 'por_dias', 'alojar', 'alojamientos', 'por día', 'por_dias', 'temporada', 'vacacional', 'noche']
  };

  // B1: Category filter definitions
  const CATEGORY_FILTERS = {
    'all': () => true,
    'frente-al-mar': p => {
      const s = [p.title, p.neighborhood, (p.features||[]).join(' '), p.description||''].join(' ').toLowerCase();
      return s.includes('frente al mar') || s.includes('pie de playa') || s.includes('beachfront') || s.includes('primera línea');
    },
    'centro-historico': p => {
      const barrio = (p.neighborhood || p.city || '').toLowerCase();
      return barrio.includes('san diego') || barrio.includes('getsemaní') || barrio.includes('centro') || barrio.includes('santo domingo');
    },
    'con-piscina': p => {
      const feats = (p.features||[]).join(' ').toLowerCase();
      return feats.includes('piscina') || feats.includes('pool');
    },
    'vista-al-mar': p => {
      const s = [p.title, (p.features||[]).join(' '), p.description||''].join(' ').toLowerCase();
      return s.includes('vista al mar') || s.includes('vista mar') || s.includes('ocean view') || s.includes('sea view');
    },
    'nuevo': p => {
      const year = p.year_built || p.ano_construccion || 0;
      return year >= 2024 || (p.added && new Date(p.added) > new Date(Date.now() - 90*24*60*60*1000));
    },
    'inversion': p => {
      const s = [p.title, p.description||'', (p.features||[]).join(' ')].join(' ').toLowerCase();
      return s.includes('inversión') || s.includes('inversion') || s.includes('rentabilidad') || s.includes('roi') || p.featured;
    },
    'lujo': p => {
      const price = p.price || 0;
      const feats = (p.features||[]).join(' ').toLowerCase();
      return price >= 2000000000 || feats.includes('lujo') || feats.includes('premium') || feats.includes('jacuzzi') || (p.sqm && p.sqm >= 200);
    },
    'amoblado': p => {
      const s = [p.title, (p.features||[]).join(' '), p.description||''].join(' ').toLowerCase();
      return s.includes('amoblad') || s.includes('furnished') || p.amoblado === true;
    },
    'lotes': p => (p.type || '').toLowerCase() === 'lote',
    'estrato-alto': p => (p.strata || p.estrato || 0) >= 5,
    'familiar': p => (p.beds || p.habitaciones || 0) >= 3,
    'economico': p => {
      const price = p.price || 0;
      return PAGE_MODE === 'arrendar' ? price > 0 && price <= 3000000 : price > 0 && price <= 300000000;
    },
    'parejas': p => {
      const beds = p.beds || p.habitaciones || 0;
      return beds <= 2 && beds >= 1;
    }
  };

  function buildEmptyState(hasFilters) {
    const otherPages = {
      'comprar': [{href:'propiedades-arrendar.html',label:'Arrendar'},{href:'propiedades-alojamientos.html',label:'Por días'}],
      'arrendar': [{href:'propiedades-comprar.html',label:'Comprar'},{href:'propiedades-alojamientos.html',label:'Por días'}],
      'alojamientos': [{href:'propiedades-comprar.html',label:'Comprar'},{href:'propiedades-arrendar.html',label:'Arrendar'}]
    };
    const links = (otherPages[PAGE_MODE] || []).map(l =>
      '<a href="' + l.href + '" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:99px;background:#fff;border:1px solid rgba(212,175,55,.3);font-weight:700;font-size:.88rem;color:var(--text);text-decoration:none;transition:all .15s">' + l.label + '</a>'
    ).join('');
    const clearBtn = hasFilters
      ? '<button type="button" onclick="document.getElementById(\'btnClear\')?.click()" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:99px;background:linear-gradient(90deg,var(--gold),var(--accent));color:#000;font-weight:800;font-size:.88rem;border:0;cursor:pointer">Limpiar filtros</button>'
      : '';
    return '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--muted)">'
      + '<div style="font-size:3rem;margin-bottom:12px;opacity:.5">🔍</div>'
      + '<h3 style="font-size:1.15rem;font-weight:800;color:var(--text);margin-bottom:8px">'
      + (hasFilters ? 'No se encontraron propiedades con estos filtros' : 'Por el momento no hay propiedades en esta categoría')
      + '</h3>'
      + '<p style="max-width:420px;margin:0 auto 20px;line-height:1.5;font-size:.92rem">'
      + (hasFilters ? 'Prueba ampliando tu búsqueda, eliminando filtros o explorando otras categorías.' : 'El catálogo se actualiza constantemente. Vuelve pronto o cuéntanos qué buscas.')
      + '</p>'
      + '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:16px">'
      + clearBtn + links
      + '</div>'
      + '<a href="contacto.html" style="display:inline-flex;align-items:center;gap:6px;font-size:.85rem;color:var(--gold);font-weight:700;text-decoration:none">💬 Cuéntanos qué buscas — te ayudamos gratis</a>'
      + '</div>';
  }

  let allProperties = [];
  let filteredProperties = [];
  let renderedCount = 0;
  let activeCategory = 'all';
  let currentView = 'grid';

  var _u = window.AltorraUtils || {};
  function formatCOP(n) { return _u.formatCOP ? _u.formatCOP(n) : (!n && n !== 0 ? '' : n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')); }
  function capitalize(s) { return _u.capitalize ? _u.capitalize(s) : (s ? s.charAt(0).toUpperCase() + s.slice(1) : ''); }
  function escapeHtml(s) { return _u.escapeHtml ? _u.escapeHtml(s) : String(s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function getPriceLabel(p) {
    if (!p.price) return '';
    const formatted = '$' + formatCOP(p.price) + ' COP';
    const op = IS_BUSQUEDA ? String(p.operation || '').toLowerCase() : PAGE_MODE;
    if (op === 'arrendar' || op === 'arriendo') return formatted + ' / mes';
    if (['alojamientos','dias','por_dias','alojar','noche'].includes(op)) return formatted + ' / noche';
    return formatted;
  }

  function getPricePerSqm(p) {
    var op = IS_BUSQUEDA ? String(p.operation || '').toLowerCase() : PAGE_MODE;
    if (op !== 'comprar' && op !== '' && op !== undefined) return '';
    if (!p.price || !p.sqm || p.sqm <= 0) return '';
    var perSqm = Math.round(p.price / p.sqm);
    if (perSqm < 100000) return '';
    return ' <span class="price-sqm">$' + formatCOP(perSqm) + '/m²</span>';
  }

  function buildWhatsAppLink(p) {
    const detailsUrl = new URL('detalle-propiedad.html?id=' + encodeURIComponent(p.id), location.href).href;
    const price = getPriceLabel(p);
    const text = `Hola ${WHATSAPP.company}, me interesa la propiedad "${p.title}" (ID: ${p.id}) en ${p.city} por ${price}. ¿Podemos agendar una visita? Detalles: ${detailsUrl}`;
    return `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(text)}`;
  }

  // Tarjeta skeleton de carga — shimmer mientras Firestore responde
  function createSkeletonCard() {
    const card = document.createElement('article');
    card.className = 'card card--skeleton';
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = `
      <div class="sk-media"></div>
      <div class="sk-body">
        <div class="sk-line w-80"></div>
        <div class="sk-line w-50"></div>
        <div class="sk-line w-60"></div>
        <div class="sk-line w-40"></div>
        <div class="sk-ctas">
          <div class="sk-btn"></div>
          <div class="sk-btn"></div>
        </div>
      </div>
    `;
    return card;
  }

  function renderSkeletons(count = 6) {
    const root = document.getElementById('list');
    if (!root) return;
    root.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) fragment.appendChild(createSkeletonCard());
    root.appendChild(fragment);
  }

  // B2: Generate smart badges based on property data
  function getSmartBadges(p) {
    const badges = [];
    const added = p.added ? new Date(p.added) : null;
    const isNew = added && (Date.now() - added.getTime()) < 30*24*60*60*1000;
    const isFeatured = p.featured || p.highlightScore >= 90;

    if (isFeatured) badges.push('<span class="badge badge--featured">★ Destacada</span>');
    if (isNew) badges.push('<span class="badge badge--new">Nueva</span>');

    badges.push(`<span class="badge badge--dark">${capitalize(p.type)}</span>`);
    if (p.neighborhood) badges.push(`<span class="badge">${escapeHtml(p.neighborhood)}</span>`);
    else badges.push(`<span class="badge">${escapeHtml(p.city)}</span>`);

    return badges.join('');
  }

  function getAmenityTags(p) {
    var feats = p.features || p.amenidades || [];
    if (!feats.length) return '';
    var icons = {'Piscina':'🏊','Vista al mar':'🌊','Aire Acondicionado':'❄️','Balcón':'🌅','Ascensor':'🛗','Portería/Vigilancia':'🔒','Gimnasio':'🏋️','Amoblado':'🛋️','Jacuzzi':'🛁','BBQ':'🔥','Terraza':'☀️'};
    var shown = feats.slice(0, 3);
    var html = '<div class="amenity-tags">';
    shown.forEach(function(f){ html += '<span class="amenity-tag">' + (icons[f] || '✓') + ' ' + escapeHtml(f) + '</span>'; });
    if (feats.length > 3) html += '<span class="amenity-tag amenity-more">+' + (feats.length - 3) + '</span>';
    html += '</div>';
    return html;
  }

  function createCard(p) {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-id', p.id);

    const imgSrc = p.image ?
      (p.image.startsWith('http') || p.image.startsWith('/') ? p.image : '/' + p.image) :
      'https://i.postimg.cc/0yYb8Y6r/placeholder.png';

    card.innerHTML = `
      <div class="media">
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.title || 'Propiedad')}" loading="lazy" decoding="async"/>
        <div class="badges">
          ${getSmartBadges(p)}
        </div>
        <button class="fav-btn" type="button" aria-label="Guardar favorito" aria-pressed="false" data-prop-id="${escapeHtml(p.id)}">
          <span class="heart">♡</span>
        </button>
        <button class="compare-btn" type="button" aria-label="Agregar al comparador" data-prop-id="${escapeHtml(p.id)}" title="Comparar">⚖</button>
      </div>
      <div class="meta">
        <h3>${escapeHtml(p.title)}</h3>
        <div class="price">${getPriceLabel(p)}${getPricePerSqm(p)}</div>
        <div class="specs">${p.beds ? p.beds + 'H · ' : ''}${p.baths ? p.baths + 'B · ' : ''}${p.sqm ? p.sqm + ' m² · ' : ''}${escapeHtml(p.city)} · ${capitalize(p.type)}</div>
        ${getAmenityTags(p)}
        <div class="cta">
          <a class="btn btn-primary" href="detalle-propiedad.html?id=${encodeURIComponent(p.id)}">Ver detalles</a>
          <a class="btn btn-ghost" href="${buildWhatsAppLink(p)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.cta') || e.target.closest('.fav-btn') || e.target.closest('.compare-btn')) return;
      window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(p.id);
    });

    var cmpBtn = card.querySelector('.compare-btn');
    if (cmpBtn) cmpBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (window.AltorraComparador) {
        window.AltorraComparador.add(p);
        this.classList.toggle('active', window.AltorraComparador.has(p.id));
      }
    });

    return card;
  }

  function renderList(items, replace) {
    const root = document.getElementById('list');
    if (!root) {
      console.warn('[Listado] Elemento #list no encontrado');
      return;
    }
    
    if (replace) {
      root.innerHTML = '';
      renderedCount = 0;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(p => fragment.appendChild(createCard(p)));
    root.appendChild(fragment);
    
    renderedCount += items.length;

    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('altorra:properties-loaded'));
    }, 100);
  }

  function applyFilters() {
    const city = (document.getElementById('f-city')?.value || '').trim();
    const type = document.getElementById('f-type')?.value || '';
    const min = document.getElementById('f-min')?.value || '';
    const max = document.getElementById('f-max')?.value || '';
    // B7: Support both advanced filter sort and inline sort
    const sortInline = document.getElementById('f-sort-inline')?.value || '';
    const sort = sortInline || document.getElementById('f-sort')?.value || 'relevance';
    const search = (document.getElementById('f-search')?.value || '').trim();

    const bedsMin = document.getElementById('f-beds-min')?.value || '';
    const bathsMin = document.getElementById('f-baths-min')?.value || '';
    const sqmMin = document.getElementById('f-sqm-min')?.value || '';
    const sqmMax = document.getElementById('f-sqm-max')?.value || '';

    let arr = allProperties.slice();

    // B1: Apply category filter
    if (activeCategory && activeCategory !== 'all' && CATEGORY_FILTERS[activeCategory]) {
      arr = arr.filter(CATEGORY_FILTERS[activeCategory]);
    }

    if (IS_BUSQUEDA) {
      const opFilter = document.getElementById('f-op')?.value || '';
      if (opFilter) {
        const valid = OPERATION_MAP[opFilter] || [opFilter];
        arr = arr.filter(p => valid.includes(String(p.operation || '').toLowerCase()));
      }
    }

    if (search) {
      const terms = search.toLowerCase().split(/\s+/);
      arr = arr.filter(p => {
        const searchable = [
          p.title, p.description, p.city, p.type, 
          p.neighborhood, p.id, (p.features || []).join(' ')
        ].join(' ').toLowerCase();
        return terms.every(term => searchable.includes(term));
      });
    }

    if (city) {
      arr = arr.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    }

    if (type) {
      arr = arr.filter(p => p.type === type);
    }
    
    if (bedsMin && bedsMin !== '') {
      const minBeds = parseInt(bedsMin, 10);
      if (!isNaN(minBeds)) {
        arr = arr.filter(p => (p.beds || 0) >= minBeds);
      }
    }
    
    if (bathsMin && bathsMin !== '') {
      const minBaths = parseInt(bathsMin, 10);
      if (!isNaN(minBaths)) {
        arr = arr.filter(p => (p.baths || 0) >= minBaths);
      }
    }
    
    if (sqmMin && sqmMin !== '') {
      const minSqm = parseFloat(sqmMin);
      if (!isNaN(minSqm)) {
        arr = arr.filter(p => (p.sqm || 0) >= minSqm);
      }
    }
    
    if (sqmMax && sqmMax !== '') {
      const maxSqm = parseFloat(sqmMax);
      if (!isNaN(maxSqm)) {
        arr = arr.filter(p => (p.sqm || 0) <= maxSqm);
      }
    }
    
    if (min) {
      const v = Number(min);
      if (!isNaN(v)) {
        arr = arr.filter(p => (p.price || 0) >= v);
      }
    }

    if (max) {
      const v = Number(max);
      if (!isNaN(v)) {
        arr = arr.filter(p => (p.price || 0) <= v);
      }
    }

    if (sort === 'price-asc') {
      arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price-desc') {
      arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'newest') {
      arr.sort((a, b) => new Date(b.added || '2000-01-01') - new Date(a.added || '2000-01-01'));
    } else if (sort === 'sqm-desc') {
      arr.sort((a, b) => (b.sqm || 0) - (a.sqm || 0));
    } else {
      arr.sort((a, b) => {
        const featDiff = (b.featured || 0) - (a.featured || 0);
        if (featDiff !== 0) return featDiff;
        return (b.highlightScore || 0) - (a.highlightScore || 0);
      });
    }

    return arr;
  }

  function updateResultsCount(total, filtered) {
    const el = document.getElementById('resultsCount');
    if (!el) return;
    
    if (filtered === total) {
      el.innerHTML = `Mostrando <strong>${total}</strong> ${total === 1 ? 'propiedad' : 'propiedades'}`;
    } else {
      el.innerHTML = `<strong>${filtered}</strong> de <strong>${total}</strong> propiedades encontradas`;
    }
  }

  function updateLoadMoreButton(filteredCount) {
    const btn = document.getElementById('btnLoadMore');
    if (!btn) return;
    
    if (filteredCount > renderedCount) {
      btn.style.display = 'inline-block';
      btn.textContent = `Cargar más (${filteredCount - renderedCount} restantes)`;
    } else {
      btn.style.display = 'none';
    }
  }

  function renderSearchBanner() {
    const el = document.getElementById('searchBanner');
    if (!el) return;
    const search = (document.getElementById('f-search')?.value || '').trim();
    if (!search) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = `Resultados para: <strong>${escapeHtml(search)}</strong> <button type="button" class="chip-x" aria-label="Quitar búsqueda" style="margin-left:8px;background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--muted)">✕</button>`;
    el.querySelector('.chip-x')?.addEventListener('click', () => {
      const input = document.getElementById('f-search');
      if (input) input.value = '';
      reapply();
    });
  }

  function renderActiveChips() {
    const container = document.getElementById('activeChips');
    if (!container) return;
    container.innerHTML = '';
    const chips = [];
    const vals = {
      search: document.getElementById('f-search')?.value || '',
      city: document.getElementById('f-city')?.value || '',
      type: document.getElementById('f-type')?.value || '',
      min: document.getElementById('f-min')?.value || '',
      max: document.getElementById('f-max')?.value || '',
      op: IS_BUSQUEDA ? (document.getElementById('f-op')?.value || '') : '',
    };
    const labels = { search:'Búsqueda', city:'Ciudad', type:'Tipo', min:'Precio mín.', max:'Precio máx.', op:'Operación' };
    for (const [k,v] of Object.entries(vals)) {
      if (!v) continue;
      chips.push({ key: k, label: labels[k], value: k === 'op' ? capitalize(v) : (k === 'type' ? capitalize(v) : v) });
    }
    if (!chips.length) return;
    chips.forEach(c => {
      const chip = document.createElement('span');
      chip.className = 'active-chip';
      chip.innerHTML = `${escapeHtml(c.label)}: <strong>${escapeHtml(c.value)}</strong> <button type="button" class="chip-x" aria-label="Quitar filtro ${escapeHtml(c.label)}" style="margin-left:4px;background:none;border:none;cursor:pointer;font-size:.9rem;color:var(--muted)">✕</button>`;
      chip.querySelector('.chip-x').addEventListener('click', () => {
        const el = document.getElementById(c.key === 'op' ? 'f-op' : c.key === 'search' ? 'f-search' : c.key === 'city' ? 'f-city' : c.key === 'type' ? 'f-type' : c.key === 'min' ? 'f-min' : 'f-max');
        if (el) { el.tagName === 'SELECT' ? el.selectedIndex = 0 : el.value = ''; }
        reapply();
      });
      container.appendChild(chip);
    });
  }

  function renderAlertButton() {
    var container = document.getElementById('alertBtnWrap');
    if (!container) return;
    var hasFilters = !!(
      (document.getElementById('f-search')?.value||'').trim() ||
      (document.getElementById('f-city')?.value||'') ||
      (document.getElementById('f-type')?.value||'') ||
      (document.getElementById('f-min')?.value||'') ||
      (document.getElementById('f-max')?.value||'')
    );
    if (!hasFilters) { container.innerHTML=''; return; }
    container.innerHTML = '<button type="button" class="btn-save-alert" id="btnSaveAlert">🔔 Guardar alerta</button>';
    document.getElementById('btnSaveAlert').addEventListener('click', showAlertModal);
  }

  function showAlertModal() {
    if (document.getElementById('alertModal')) return;
    var filters = {
      operacion: PAGE_MODE || '',
      ciudad: document.getElementById('f-city')?.value||'',
      tipo: document.getElementById('f-type')?.value||'',
      precioMin: document.getElementById('f-min')?.value||'',
      precioMax: document.getElementById('f-max')?.value||'',
      busqueda: (document.getElementById('f-search')?.value||'').trim()
    };
    var desc = Object.entries(filters).filter(function(e){return e[1];}).map(function(e){return e[0]+': '+e[1];}).join(', ');
    var modal = document.createElement('div');
    modal.id='alertModal';
    modal.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)';
    modal.innerHTML='<div style="background:#fff;border-radius:18px;padding:32px;max-width:420px;width:90%;box-shadow:0 20px 50px rgba(0,0,0,.15)">'
      +'<h3 style="margin:0 0 8px;font-weight:800;font-size:1.2rem">🔔 Crear alerta de propiedades</h3>'
      +'<p style="margin:0 0 16px;font-size:.88rem;color:var(--muted)">Te avisaremos por WhatsApp cuando llegue una propiedad que coincida con tu búsqueda.</p>'
      +'<div style="background:#f9fafb;border-radius:10px;padding:12px;margin-bottom:16px;font-size:.82rem;color:var(--muted)"><strong>Filtros:</strong> '+escapeHtml(desc||'Todos')+'</div>'
      +'<label style="display:block;margin-bottom:12px"><span style="font-weight:700;font-size:.85rem;display:block;margin-bottom:4px">Tu nombre</span><input id="alert-name" type="text" placeholder="Nombre" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid rgba(0,0,0,.12);font-family:inherit;font-size:.92rem"/></label>'
      +'<label style="display:block;margin-bottom:16px"><span style="font-weight:700;font-size:.85rem;display:block;margin-bottom:4px">WhatsApp</span><input id="alert-phone" type="tel" placeholder="+57 300 123 4567" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid rgba(0,0,0,.12);font-family:inherit;font-size:.92rem"/></label>'
      +'<div style="display:flex;gap:10px"><button id="alertSubmit" type="button" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(90deg,var(--accent),#ffd95e);font-weight:800;cursor:pointer;font-size:.95rem">Activar alerta</button>'
      +'<button id="alertClose" type="button" style="padding:12px 18px;border-radius:12px;border:1px solid rgba(0,0,0,.08);background:#fff;cursor:pointer;font-weight:700;font-size:.95rem">Cancelar</button></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click',function(e){if(e.target===modal)closeAlertModal();});
    document.getElementById('alertClose').addEventListener('click',closeAlertModal);
    document.getElementById('alertSubmit').addEventListener('click',function(){
      var name=(document.getElementById('alert-name')?.value||'').trim();
      var phone=(document.getElementById('alert-phone')?.value||'').trim();
      if(!name||!phone){window.AltorraUtils&&window.AltorraUtils.showToast?window.AltorraUtils.showToast('Completa nombre y teléfono','warning'):alert('Completa nombre y teléfono');return;}
      var saved=JSON.parse(localStorage.getItem('altorra:alerts')||'[]');
      saved.push({name:name,phone:phone,filters:filters,created:new Date().toISOString()});
      localStorage.setItem('altorra:alerts',JSON.stringify(saved));
      var msg='Hola! Soy '+name+'. Quiero recibir alertas de propiedades con estos criterios: '+desc+'. Mi WhatsApp: '+phone;
      window.open('https://wa.me/573002439810?text='+encodeURIComponent(msg),'_blank');
      closeAlertModal();
      if(window.AltorraUtils&&window.AltorraUtils.showToast)window.AltorraUtils.showToast('Alerta guardada ✓','success');
    });
  }

  function closeAlertModal(){
    var m=document.getElementById('alertModal');
    if(m)m.remove();
  }

  function reapply() {
    filteredProperties = applyFilters();
    updateResultsCount(allProperties.length, filteredProperties.length);
    renderedCount = 0;
    renderList(filteredProperties.slice(0, PAGE_SIZE), true);
    updateLoadMoreButton(filteredProperties.length);
    renderSearchBanner();
    renderActiveChips();
    renderAlertButton();
    // B8: Preserve view mode after re-render
    const grid = document.getElementById('list');
    if (grid && currentView === 'list') grid.classList.add('view-list');
  }

  // Esperar a que PropertyDatabase esté lista (fuente única: Firestore)
  function waitForDB() {
    return new Promise((resolve) => {
      if (window.propertyDB && window.propertyDB.isLoaded) return resolve(window.propertyDB);
      window.addEventListener('altorra:db-ready', () => resolve(window.propertyDB), { once: true });
      setTimeout(() => resolve(window.propertyDB || null), 10000); // safety
    });
  }

  // Re-render cada vez que Firestore trae datos nuevos (admin → página pública en vivo)
  let _refreshBound = false;
  function bindRefreshListener() {
    if (_refreshBound) return;
    _refreshBound = true;
    const reload = () => {
      if (!window.propertyDB?.isLoaded) return;
      allProperties = window.propertyDB.filter(PAGE_MODE ? { operacion: PAGE_MODE } : {});
      filteredProperties = applyFilters();
      updateResultsCount(allProperties.length, filteredProperties.length);
      renderedCount = 0;
      renderList(filteredProperties.slice(0, PAGE_SIZE), true);
      updateLoadMoreButton(filteredProperties.length);

      if (filteredProperties.length === 0) {
        const list = document.getElementById('list');
        if (list) list.innerHTML = buildEmptyState(allProperties.length > 0);
      }
    };
    window.addEventListener('altorra:db-refreshed', reload);
    window.addEventListener('altorra:cache-invalidated', reload);
  }

  async function init() {
    const counter = document.getElementById('resultsCount');
    const list = document.getElementById('list');

    if (counter) {
      counter.innerHTML = '<span style="color:var(--muted)">Cargando propiedades...</span>';
    }
    if (list) {
      renderSkeletons(PAGE_SIZE);
    }

    try {
      // Fuente única: PropertyDatabase (Firestore)
      const db = await waitForDB();
      const data = db ? db.filter(PAGE_MODE ? { operacion: PAGE_MODE } : {}) : [];

      allProperties = Array.isArray(data) ? data : [];
      bindRefreshListener();

      const qs = new URLSearchParams(location.search);
      if (qs.has('city')) {
        const cityInput = document.getElementById('f-city');
        if (cityInput) cityInput.value = qs.get('city');
      }
      if (qs.has('type')) {
        const typeSelect = document.getElementById('f-type');
        if (typeSelect) typeSelect.value = qs.get('type');
      }
      if (qs.has('min')) {
        const minInput = document.getElementById('f-min');
        if (minInput) minInput.value = qs.get('min');
      }
      if (qs.has('max')) {
        const maxInput = document.getElementById('f-max');
        if (maxInput) maxInput.value = qs.get('max');
      }
      if (qs.has('search')) {
        const searchInput = document.getElementById('f-search');
        if (searchInput) searchInput.value = qs.get('search');
      }
      if (IS_BUSQUEDA && qs.has('op')) {
        const opSelect = document.getElementById('f-op');
        if (opSelect) opSelect.value = qs.get('op');
      }
      // B1: Category from URL
      if (qs.has('category')) {
        const cat = qs.get('category');
        if (CATEGORY_FILTERS[cat]) {
          activeCategory = cat;
          document.querySelectorAll('.category-chip').forEach(c =>
            c.classList.toggle('active', c.dataset.category === cat)
          );
        }
      }

      filteredProperties = applyFilters();
      renderSearchBanner();
      renderActiveChips();
      
      updateResultsCount(allProperties.length, filteredProperties.length);
      
      renderList(filteredProperties.slice(0, PAGE_SIZE), true);
      updateLoadMoreButton(filteredProperties.length);

      if (filteredProperties.length === 0) {
        const list = document.getElementById('list');
        if (list) list.innerHTML = buildEmptyState(allProperties.length > 0);
      }

    } catch (err) {
      console.error('[Altorra] Error al cargar propiedades:', err);
      const list = document.getElementById('list');
      if (list) {
        list.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)"><p>Error al cargar propiedades. Por favor, recarga la página.</p></div>';
      }
      const counter = document.getElementById('resultsCount');
      if (counter) counter.textContent = 'Error al cargar';
    }
  }

  function attachEvents() {
    const btnApply = document.getElementById('btnApply');
    if (btnApply && !btnApply.dataset.attached) {
      btnApply.dataset.attached = 'true';
      btnApply.addEventListener('click', () => {
        reapply();
        if (filteredProperties.length === 0) {
          const list = document.getElementById('list');
          if (list) list.innerHTML = buildEmptyState(true);
        }
      });
    }

    const btnClear = document.getElementById('btnClear');
    if (btnClear && !btnClear.dataset.attached) {
      btnClear.dataset.attached = 'true';
      btnClear.addEventListener('click', () => {
        ['f-city', 'f-type', 'f-min', 'f-max', 'f-sort', 'f-search', 'f-beds-min', 'f-baths-min', 'f-sqm-min', 'f-sqm-max', 'f-op'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.tagName === 'SELECT' ? el.selectedIndex = 0 : el.value = '';
        });
        if (document.getElementById('f-sort')) document.getElementById('f-sort').value = 'relevance';
        if (document.getElementById('f-sort-inline')) document.getElementById('f-sort-inline').value = 'relevance';
        // Reset category
        activeCategory = 'all';
        document.querySelectorAll('.category-chip').forEach(c => c.classList.toggle('active', c.dataset.category === 'all'));
        reapply();
      });
    }

    const btnLoadMore = document.getElementById('btnLoadMore');
    if (btnLoadMore && !btnLoadMore.dataset.attached) {
      btnLoadMore.dataset.attached = 'true';
      btnLoadMore.addEventListener('click', () => {
        const next = filteredProperties.slice(renderedCount, renderedCount + PAGE_SIZE);
        renderList(next, false);
        updateLoadMoreButton(filteredProperties.length);
      });
    }

    // B1: Category chip clicks
    const chipsContainer = document.getElementById('categoryChips');
    if (chipsContainer && !chipsContainer.dataset.attached) {
      chipsContainer.dataset.attached = 'true';
      chipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.category-chip');
        if (!chip) return;
        activeCategory = chip.dataset.category || 'all';
        chipsContainer.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        reapply();
      });
      // Scroll indicator for category bar
      chipsContainer.addEventListener('scroll', () => {
        const bar = chipsContainer.closest('.category-bar');
        if (bar) bar.classList.toggle('scrolled-start', chipsContainer.scrollLeft > 20);
      });
    }

    // B7: Inline sort
    const sortInline = document.getElementById('f-sort-inline');
    if (sortInline && !sortInline.dataset.attached) {
      sortInline.dataset.attached = 'true';
      sortInline.addEventListener('change', () => {
        const advSort = document.getElementById('f-sort');
        if (advSort) advSort.value = sortInline.value;
        reapply();
      });
    }

    // B8: View toggle (grid/list)
    const viewBtns = document.querySelectorAll('.view-toggle-btn');
    viewBtns.forEach(btn => {
      if (btn.dataset.attached) return;
      btn.dataset.attached = 'true';
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view === currentView) return;
        currentView = view;
        viewBtns.forEach(b => b.classList.toggle('active', b.dataset.view === view));
        const grid = document.getElementById('list');
        if (grid) {
          grid.classList.toggle('view-list', view === 'list');
        }
      });
    });
  }

  function startApp() {
    if (window.__ALTORRA_LISTADO_INIT__) return;
    window.__ALTORRA_LISTADO_INIT__ = true;
    
    init();
    attachEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }

  console.log('[Listado] Sistema inicializado ✅');
})();
