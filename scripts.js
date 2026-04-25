/* ==== ORDEN INTELIGENTE ==== */
function dailySeed(){
  const k='altorra:shuffleSeed';
  const today=(new Date()).toISOString().slice(0,10);
  try{
    const raw=localStorage.getItem(k);
    if(raw){
      const obj=JSON.parse(raw);
      if(obj && obj.date===today) return obj.seed;
    }
  }catch(_){}
  const seed=Math.floor(Math.random()*1e9);
  try{ localStorage.setItem(k, JSON.stringify({date:today, seed})); }catch(_){}
  return seed;
}
function seededShuffle(list, seed){
  let s = seed || 1; const a=1664525, c=1013904223, m=2**32;
  const r=()=> (s = (a*s + c) % m) / m;
  const arr=list.slice();
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(r()*(i+1)); const t=arr[i]; arr[i]=arr[j]; arr[j]=t;
  }
  return arr;
}
function smartOrder(list){
  const url = new URL(document.location);
  const qOrder = (url.searchParams.get('order')||'').toLowerCase(); // ?order=featured|views|random
  let L = list.slice();

  if(qOrder==='random') return seededShuffle(L, dailySeed());

  // Siempre prioriza featured si existe
  L.sort((a,b)=> (Number(b.featured||0) - Number(a.featured||0)));

  if(qOrder==='views'){
    L.sort((a,b)=>{
      const fb=(Number(b.featured||0)-Number(a.featured||0));
      if(fb) return fb;
      return Number(b.views||0) - Number(a.views||0);
    });
    return L;
  }

  // Por defecto: featured primero, luego highlightScore, luego barajado diario
  L.sort((a,b)=>{
    const fb=(Number(b.featured||0)-Number(a.featured||0));
    if(fb) return fb;
    const hb=Number(b.highlightScore||0)-Number(a.highlightScore||0);
    if(hb) return hb;
    return 0;
  });
  return seededShuffle(L, dailySeed());
}


window.__ALT_BUILD='2025-09-15d';
/* ========== Altorra - scripts base (optimizado rendimiento) ========== */
/* v2025-09-07.1 — Fixes: city sin doble encode + URLs absolutas en imágenes */

/* ============== 0) Utilidades comunes ============== */
const ALT_CACHE_VER = '2025-09-07.1';        // ↺ Sube si cambias estructura de datos
const ALT_NS = 'altorra:json:';
function jsonKey(url){ return `${ALT_NS}${url}::${ALT_CACHE_VER}`; }
function now(){ return Date.now(); }
// Normaliza rutas (soporta subcarpetas)
function resolveAsset(u){ if(!u) return ''; try{ return new URL(u, document.baseURI).href; }catch(_){ return u; }}

/**
 * Cache JSON en localStorage con TTL y revalidación en segundo plano.
 * - Si hay caché válida ⇒ devuelve rápido (resolve con caché) y además revalida.
 * - Si no hay caché ⇒ hace fetch normal, guarda y devuelve.
 */
async function getJSONCached(url, { ttlMs = 1000 * 60 * 60 * 6, revalidate = true } = {}) {
  let cached = null;
  try {
    const raw = localStorage.getItem(jsonKey(url));
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && obj.t && (now() - obj.t) < ttlMs && obj.data) {
        cached = obj.data;
      }
    }
  } catch(_) {}

  // Si hay caché vigente, lo entregamos ya
  if (cached) {
    if (revalidate) {
      // Revalidación en background no bloqueante
      fetch(url, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
          try { localStorage.setItem(jsonKey(url), JSON.stringify({ t: now(), data })); } catch(_){}
          // Aviso opcional por evento (por si una vista quiere re-pintar)
          document.dispatchEvent(new CustomEvent('altorra:json-updated', { detail: { url } }));
        })
        .catch(()=>{ /* silencio */ });
    }
    return cached;
  }

  // Sin caché: fetch normal
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  try { localStorage.setItem(jsonKey(url), JSON.stringify({ t: now(), data })); } catch(_){}
  return data;
}

/* ============== 1) Lazy load de imágenes (excluye críticas) ============== */
document.addEventListener('DOMContentLoaded', function() {
  const isCritical = (img) => {
    if (img.hasAttribute('loading')) return true;             // respeta configuración explícita (eager/lazy)
    if (img.matches('.no-lazy, [data-eager]')) return true;   // opt-out explícito
    // No hacer lazy en header/footer (logo, íconos) ni hero
    const inHeader = img.closest('header');
    const inFooter = img.closest('footer');
    const isHero   = img.closest('.hero');
    return !!(inHeader || inFooter || isHero);
  };

  document.querySelectorAll('img').forEach(function(img) {
    if (!isCritical(img)) {
      img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    }
  });
});

/* ============== 2) Reseñas: Firestore primero, fallback reviews.json ============== */
(function(){
  const wrap = document.getElementById('google-reviews');
  if(!wrap) return;

  function renderReviews(reviews) {
    if(!Array.isArray(reviews) || !reviews.length) return;
    const activas = reviews.filter(r => r.activa !== false && r.active !== false);
    const sample  = activas.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    wrap.innerHTML = '';
    sample.forEach(function(r){
      const card = document.createElement('article');
      card.className = 'review-card';
      const head = document.createElement('div');
      head.className = 'review-head';
      const name = document.createElement('div');
      name.textContent = r.autor || r.author || 'Anónimo';
      const stars = document.createElement('div');
      stars.className = 'review-stars';
      const rating = Math.round(parseFloat(r.rating) || 5);
      stars.textContent = '★★★★★'.slice(0, rating);
      stars.setAttribute('aria-label', rating + ' de 5');
      const time = document.createElement('div');
      time.style.marginLeft = 'auto';
      time.style.color = '#6b7280';
      time.style.fontSize = '.9rem';
      time.textContent = r.fecha || r.time || '';
      head.appendChild(name); head.appendChild(stars); head.appendChild(time);
      const body = document.createElement('p');
      body.className = 'review-text';
      body.textContent = r.texto || r.content || '';
      card.appendChild(head); card.appendChild(body); wrap.appendChild(card);
    });
  }

  async function loadFromFirestore() {
    if(!window.db) return false;
    try {
      const { collection, getDocs, query, where, orderBy, limit } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      const q = query(
        collection(window.db, 'resenas'),
        where('activa', '==', true),
        orderBy('orden', 'asc'),
        limit(20)
      );
      const snap = await Promise.race([
        getDocs(q),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
      ]);
      const docs = snap.docs.map(d => d.data());
      if(docs.length) { renderReviews(docs); return true; }
    } catch(_) {}
    return false;
  }

  async function loadReviews() {
    // Intentar Firestore primero
    const fromFS = await loadFromFirestore();
    if(fromFS) return;

    // Fallback a reviews.json
    try {
      const res = await fetch('reviews.json');
      if(!res.ok) throw new Error('HTTP ' + res.status);
      renderReviews(await res.json());
    } catch(err) { console.warn('No se pudieron cargar reseñas', err); }
  }

  // Esperar a Firebase o cargar directamente
  if(window.db) {
    loadReviews();
  } else {
    window.addEventListener('altorra:firebase-ready', loadReviews, { once: true });
    setTimeout(loadReviews, 3000); // fallback si Firebase tarda
  }
})();

/* ============== 3) Buscador rápido → redirección con querystring ============== */
(function(){
  const form = document.getElementById('quickSearch');
  if(!form) return;

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    e.stopImmediatePropagation();

    // 1) Si el usuario digitó un código, validamos primero contra Firestore
    const codeEl = document.getElementById('f-code');
    const code = (codeEl && codeEl.value || '').trim();
    if (code) {
      try {
        // Esperar a PropertyDatabase (fuente única: Firestore)
        if (!(window.propertyDB && window.propertyDB.isLoaded)) {
          await new Promise(resolve => {
            if (window.propertyDB?.isLoaded) return resolve();
            window.addEventListener('altorra:db-ready', resolve, { once: true });
            setTimeout(resolve, 6000); // timeout de seguridad
          });
        }
        const match = window.propertyDB?.getById(code);
        if (match) {
          window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(match.id);
        } else {
          alert('El código ingresado no existe. Por favor ingresa un código válido.');
        }
      } catch {
        alert('No fue posible validar el código en este momento.');
      }
      return; // ✅ Nunca seguimos a listados si hubo intento de código
    }

    // 2) Si no hay código, armamos redirección a listados
    const op   = document.getElementById('op')?.value || 'comprar';
    const type = document.getElementById('f-type')?.value || '';
    const city = document.getElementById('f-city')?.value || '';
    // En la home solo tienes un campo de presupuesto:
    const budget = document.getElementById('f-budget')?.value || ''; // ← este es tu "Presupuesto"

    const map = {
      comprar: 'propiedades-comprar.html',
      arrendar: 'propiedades-arrendar.html',
      alojar: 'propiedades-alojamientos.html'
    };
    const dest = map[op] || 'propiedades-comprar.html';

    const params = new URLSearchParams();
    if (city)  params.set('city', city);
    if (type)  params.set('type', type);
    if (budget) params.set('max', budget); // ✅ presupuesto → max

    const query = params.toString();
    window.location.href = dest + (query ? '?' + query : '');
  });
})();

/* ============== 4) Flechas de carruseles (home) ============== */
(function(){
  document.querySelectorAll('.arrow').forEach(function(btn){
    const targetId = btn.dataset.target;
    const root = document.getElementById(targetId);
    if(!root) return;
    btn.addEventListener('click', function(){
      const card = root.querySelector('.card');
      if(!card) return;
      const gap = parseFloat(getComputedStyle(root).gap) || 12;
      const step = card.getBoundingClientRect().width + gap;
      const dir = btn.classList.contains('left') ? -1 : 1;
      root.scrollBy({ left: dir * step, behavior: 'smooth' });
    });
  });
})();


/* ============== 4.bis) (Handler duplicado deshabilitado — toda la lógica vive en el bloque #3) ============== */
 /* ============== 5) Carrusel unificado "Recién publicadas" ============== */
(function(){
  const CAROUSEL_ID = 'carouselRecientes';
  const MAX_CARDS   = 12;
  let activeOp      = 'all';
  let allProps       = [];

  const OP_PAGE = {
    comprar:       'propiedades-comprar.html',
    arrendar:      'propiedades-arrendar.html',
    alojamientos:  'propiedades-alojamientos.html',
  };

  function formatCOP(n){ if(n==null) return ''; return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

  function buildSkeletonCard(){
    const el = document.createElement('article');
    el.className = 'card card--skeleton';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = ''
      + '<div class="sk-media"></div>'
      + '<div class="sk-body">'
      +   '<div class="sk-line w-80"></div>'
      +   '<div class="sk-line w-50"></div>'
      +   '<div class="sk-line w-60"></div>'
      + '</div>';
    return el;
  }

  function showFavToast(added){
    try{
      const toast = document.createElement('div');
      toast.textContent = added ? '♥ Agregado a favoritos' : 'Removido de favoritos';
      toast.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        background:#111;color:#fff;padding:12px 24px;border-radius:8px;
        font-weight:700;z-index:9999;opacity:0;transition:opacity .2s ease;
        box-shadow:0 10px 26px rgba(0,0,0,.18);
      `;
      document.body.appendChild(toast);
      requestAnimationFrame(()=>{ toast.style.opacity='1'; });
      setTimeout(()=>{ toast.style.opacity='0'; setTimeout(()=>toast.remove(), 250); }, 2000);
    }catch(_){}
  }

  function modeForOp(op){
    if(op === 'arrendar') return 'arriendo';
    if(op === 'dias' || op === 'alojamientos' || op === 'alojar') return 'dias';
    return 'venta';
  }

  function buildCard(p){
    const mode = modeForOp(p.operation);
    const el = document.createElement('article');
    el.className = 'card'; el.setAttribute('role','listitem');
    if (p.id) el.setAttribute('data-id', p.id);

    const img = document.createElement('img');
    img.loading='lazy'; img.decoding='async'; img.alt = escapeHtml(p.title || 'Propiedad');
    const raw = p.image || p.img || p.img_url || p.imgUrl || p.photo;
    if (raw) {
      const str = String(raw);
      const isAbsolute = /^https?:\/\//i.test(str);
      if (isAbsolute || str.startsWith('/')) { img.src = str; }
      else { img.src = '/' + str.replace(/^\.?\//,''); }
    } else {
      img.src = 'https://i.postimg.cc/0yYb8Y6r/placeholder.png';
    }

    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'media';
    mediaDiv.style.position = 'relative';
    mediaDiv.appendChild(img);

    const body = document.createElement('div'); body.className='body';

    const favRow = document.createElement('div');
    favRow.style.cssText = 'display:flex;justify-content:center;margin:8px 0 6px;';
    const favBtn = document.createElement('button');
    favBtn.className = 'fav-btn'; favBtn.type = 'button';
    favBtn.setAttribute('aria-label', 'Guardar favorito');
    favBtn.setAttribute('aria-pressed', 'false');
    favBtn.setAttribute('data-prop-id', p.id || '');
    favBtn.innerHTML = `
      <span class="heart" style="font-size:1.1rem;line-height:1">♡</span>
      <span class="label" style="font-weight:700;font-size:.92rem">Guardar en favoritos</span>
    `;
    Object.assign(favBtn.style, {
      display:'inline-flex', alignItems:'center', gap:'8px',
      padding:'6px 12px', borderRadius:'999px',
      background:'#fff', border:'1px solid rgba(17,24,39,.12)',
      boxShadow:'0 4px 10px rgba(0,0,0,.06)', cursor:'pointer'
    });
    favRow.appendChild(favBtn);

    try{
      if (window.AltorraFavoritos && p && p.id){
        var isFav = !!window.AltorraFavoritos.isFavorite(p.id);
        favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
        var heartEl = favBtn.querySelector('.heart');
        var labelEl = favBtn.querySelector('.label');
        if(heartEl){ heartEl.textContent = isFav ? '♥' : '♡'; }
        if(labelEl){ labelEl.textContent = isFav ? 'Guardado en favoritos' : 'Guardar en favoritos'; }
      }
    }catch(_){}

    favBtn.addEventListener('click', function(ev){
      ev.preventDefault(); ev.stopPropagation();
      if (!window.AltorraFavoritos || !(p && p.id)) return;
      try{
        var nowFav = window.AltorraFavoritos.toggle({
          id: p.id, title: p.title, city: p.city, price: p.price,
          image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
          operation: p.operation, beds: p.beds, baths: p.baths, sqm: p.sqm, type: p.type
        });
        favBtn.setAttribute('aria-pressed', nowFav ? 'true' : 'false');
        var h2 = favBtn.querySelector('.heart');
        var lbl = favBtn.querySelector('.label');
        if(h2){ h2.textContent = nowFav ? '♥' : '♡'; }
        if(lbl){ lbl.textContent = nowFav ? 'Guardado en favoritos' : 'Guardar en favoritos'; }
        favBtn.style.transform='scale(1.04)';
        setTimeout(()=>{ favBtn.style.transform='scale(1)'; }, 160);
        showFavToast(nowFav);
      }catch(_){}
    });

    const h3 = document.createElement('h3'); h3.innerHTML = escapeHtml(p.title || 'Sin título');
    const specs = document.createElement('div'); specs.style.color='var(--muted)';
    const parts = [];
    if(p.beds)  parts.push(p.beds+'H');
    if(p.baths) parts.push(p.baths+'B');
    if(p.sqm)   parts.push(p.sqm+' m²');
    specs.textContent = parts.join(' · ');

    const price = document.createElement('div');
    price.style.marginTop='4px'; price.style.fontWeight='800'; price.style.color='var(--gold)';
    if(p.price){
      price.textContent = (mode==='arriendo' ? '$'+formatCOP(p.price)+' COP / mes' :
                           mode==='dias'     ? '$'+formatCOP(p.price)+' COP / noche' :
                                               '$'+formatCOP(p.price)+' COP');
    }

    el.appendChild(mediaDiv);
    el.appendChild(body);
    body.appendChild(favRow);
    body.appendChild(h3);
    body.appendChild(specs);
    body.appendChild(price);

    el.addEventListener('click', function(e){
      var n = e.target;
      while(n && n !== el){ if(n.classList && n.classList.contains('fav-btn')) return; n = n.parentNode; }
      window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(p.id || '');
    });

    return el;
  }

  function getFiltered(){
    if(activeOp === 'all') return allProps.slice();
    return allProps.filter(function(p){
      var op = String(p.operation || '').toLowerCase();
      if(activeOp === 'comprar') return op === 'comprar';
      if(activeOp === 'arrendar') return op === 'arrendar';
      return ['dias','por_dias','alojar','alojamientos','temporada','vacacional','noche'].indexOf(op) !== -1;
    });
  }

  function renderCards(){
    var root = document.getElementById(CAROUSEL_ID);
    if(!root) return;
    var list = getFiltered();
    root.innerHTML = '';
    list.slice(0, MAX_CARDS).forEach(function(p){ root.appendChild(buildCard(p)); });
    root.scrollLeft = 0;
    if(window.AltorraFavoritos && typeof window.AltorraFavoritos.init === 'function'){
      try{ window.AltorraFavoritos.init(); }catch(_){}
    }
    try{ document.dispatchEvent(new CustomEvent('altorra:properties-loaded')); }catch(_){}

    var link = document.getElementById('recientesVerTodo');
    if(link){
      if(activeOp === 'all') link.href = 'propiedades-comprar.html';
      else link.href = OP_PAGE[activeOp] || 'propiedades-comprar.html';
    }
  }

  function wireChips(){
    var chips = document.querySelectorAll('.recientes-chip');
    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        chips.forEach(function(c){ c.classList.remove('active'); c.setAttribute('aria-selected','false'); });
        chip.classList.add('active');
        chip.setAttribute('aria-selected','true');
        activeOp = chip.dataset.op || 'all';
        renderCards();
      });
    });
  }

  async function loadAll(){
    if(!(window.propertyDB && window.propertyDB.isLoaded)){
      await new Promise(function(resolve){
        if(window.propertyDB?.isLoaded) return resolve();
        window.addEventListener('altorra:db-ready', resolve, { once: true });
        setTimeout(resolve, 8000);
      });
    }
    if(!window.propertyDB) return;
    allProps = window.propertyDB.filter({ sort: 'newest' });
    renderCards();
  }

  document.addEventListener('DOMContentLoaded', function(){
    var root = document.getElementById(CAROUSEL_ID);
    if(root && !(window.propertyDB && window.propertyDB.isLoaded)){
      root.innerHTML = '';
      var frag = document.createDocumentFragment();
      for(var i = 0; i < 4; i++) frag.appendChild(buildSkeletonCard());
      root.appendChild(frag);
    }
    wireChips();
    loadAll();

    function refresh(){
      if(!window.propertyDB) return;
      allProps = window.propertyDB.filter({ sort: 'newest' });
      renderCards();
    }
    window.addEventListener('altorra:db-refreshed', refresh);
    window.addEventListener('altorra:cache-invalidated', refresh);
  });
})();

/* ============== 6) Registrar service worker para PWA (si existe) ============== */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js').catch(function(err){
    console.warn('SW registration failed', err);
  });
}

/* === JSON-LD: RealEstateAgent + LocalBusiness + BreadcrumbList (E1.3) === */
(function(){
  try{
    if(document.querySelector('script[type="application/ld+json"].org-jsonld')) return;

    var BASE = 'https://altorrainmobiliaria.co';
    var LOGO = 'https://i.postimg.cc/SsPmBFXt/Chat-GPT-Image-9-altorra-logo-2025-10-31-20.png';

    var agent = {
      "@context": "https://schema.org",
      "@type": ["RealEstateAgent", "LocalBusiness"],
      "@id": BASE + "/#organization",
      "name": "ALTORRA Inmobiliaria",
      "alternateName": "Altorra S.A.S.",
      "slogan": "Gestión integral en soluciones inmobiliarias",
      "url": BASE + "/",
      "logo": LOGO,
      "image": LOGO,
      "description": "Inmobiliaria en Cartagena de Indias especializada en venta, arriendo, renta turística y administración de propiedades premium, con asesoría legal, contable y fiscal integrada para inversionistas locales y extranjeros.",
      "telephone": ["+573002439810", "+573235016747"],
      "email": "info@altorrainmobiliaria.co",
      "foundingDate": "2018",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cartagena de Indias",
        "addressRegion": "Bolívar",
        "addressCountry": "CO"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 10.3910,
        "longitude": -75.5144
      },
      "areaServed": [
        { "@type": "City", "name": "Cartagena de Indias" },
        { "@type": "Place", "name": "Bocagrande, Cartagena" },
        { "@type": "Place", "name": "Castillogrande, Cartagena" },
        { "@type": "Place", "name": "Manga, Cartagena" },
        { "@type": "Place", "name": "Centro Histórico, Cartagena" },
        { "@type": "Place", "name": "La Boquilla, Cartagena" },
        { "@type": "Place", "name": "Barú, Bolívar" }
      ],
      "knowsLanguage": ["es", "en"],
      "priceRange": "$$",
      "currenciesAccepted": "COP, USD",
      "paymentAccepted": "Cash, Bank transfer, Wire transfer",
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "18:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "13:00" }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Servicios Altorra Inmobiliaria",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Venta de propiedades en Cartagena" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Arriendo tradicional" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Renta turística (Airbnb)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Administración de propiedades" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Avalúos comerciales" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Asesoría legal inmobiliaria" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Acompañamiento a inversionistas extranjeros" } }
        ]
      },
      "sameAs": [
        "https://www.instagram.com/altorrainmobiliaria",
        "https://www.facebook.com/share/16MEXCeAB4/",
        "https://www.tiktok.com/@altorrainmobiliaria",
        "https://www.youtube.com/@altorrainmobiliaria"
      ]
    };

    var s1 = document.createElement('script');
    s1.type = 'application/ld+json';
    s1.className = 'org-jsonld';
    s1.textContent = JSON.stringify(agent);
    document.head.appendChild(s1);

    var path = location.pathname.replace(/\/$/,'') || '/';
    var pageName = document.title.split('|')[0].trim();
    var crumbs = [{"@type":"ListItem","position":1,"name":"Inicio","item": BASE + "/"}];
    if(path !== '/' && path !== '/index.html'){
      crumbs.push({"@type":"ListItem","position":2,"name": pageName,"item": BASE + path});
    }
    var breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": crumbs
    };
    var s2 = document.createElement('script');
    s2.type = 'application/ld+json';
    s2.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(s2);

  }catch(e){ console.warn("JSON-LD inject failed", e); }
})();

/* ============== Promo banner desde Firestore config/promo (A10) ============== */
(function(){
  var DISMISSED_KEY = 'altorra:promo-dismissed';
  var el = document.getElementById('promo-banner');
  if (!el) return;

  function escHtml(s){ return String(s||'').replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];}); }

  function render(promo){
    if (!promo || !promo.activo) return;
    try {
      var dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}');
      if (dismissed.id === promo.id) return;
    } catch(_){}

    var html = '';
    if (promo.texto) html += escHtml(promo.texto);
    if (promo.enlace && promo.enlaceTexto) {
      html += ' <a href="' + escHtml(promo.enlace) + '">' + escHtml(promo.enlaceTexto) + '</a>';
    }
    html += '<button type="button" class="promo-close" aria-label="Cerrar promoción">✕</button>';
    el.innerHTML = html;
    el.style.display = '';

    el.querySelector('.promo-close').addEventListener('click', function(){
      el.style.display = 'none';
      try { localStorage.setItem(DISMISSED_KEY, JSON.stringify({ id: promo.id || 'default' })); } catch(_){}
    });
  }

  async function loadPromo(){
    if (!window.db) return;
    try {
      var { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      var snap = await Promise.race([
        getDoc(doc(window.db, 'config', 'promo')),
        new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 4000); })
      ]);
      if (snap.exists()) render(snap.data());
    } catch(_){}
  }

  if (window.db) { loadPromo(); }
  else { window.addEventListener('altorra:firebase-ready', loadPromo, { once: true }); }
})();

/* ============== Trust bar stats (A2) ============== */
(function(){
  function paint(){
    const elProps = document.querySelector('#trustStatPropiedades .trust-num');
    const elCities = document.querySelector('#trustStatCiudades .trust-num');
    if (!elProps && !elCities) return;
    const db = window.propertyDB;
    if (!db || !db.isLoaded) return;

    const all = Array.isArray(db.properties) ? db.properties : [];
    const active = all.filter(p => p.available !== 0 && p.disponible !== false);
    const cities = new Set(active.map(p => (p.city || '').trim()).filter(Boolean));

    if (elProps) elProps.textContent = active.length;
    if (elCities) elCities.textContent = cities.size;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
  window.addEventListener('altorra:db-ready',       paint);
  window.addEventListener('altorra:db-refreshed',   paint);
  window.addEventListener('altorra:cache-invalidated', paint);
})();
