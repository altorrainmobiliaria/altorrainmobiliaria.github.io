/* ========== Altorra - scripts base (optimizado rendimiento) ========== */
/* v2025-09-07.1 — Fixes: city sin doble encode + URLs absolutas en imágenes */

/* ============== 0) Utilidades comunes ============== */
const ALT_CACHE_VER = '2025-09-07.1';        // ↺ Sube si cambias estructura de datos
const ALT_NS = 'altorra:json:';
function jsonKey(url){ return `${ALT_NS}${url}::${ALT_CACHE_VER}`; }
function now(){ return Date.now(); }

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

/* ============== 2) Reseñas: carga desde reviews.json y pinta 3 al azar ============== */
(function(){
  const wrap = document.getElementById('google-reviews');
  const fallback = document.getElementById('reviews-fallback');
  if(!wrap) return;
  fetch('reviews.json').then(function(res){
    if(!res.ok) throw new Error('HTTP '+res.status);
    return res.json();
  }).then(function(reviews){
    if(Array.isArray(reviews) && reviews.length){
      if(fallback) fallback.hidden = true;
      let sample = reviews.slice().sort(()=>Math.random()-0.5).slice(0,3);
      wrap.innerHTML = '';
      sample.forEach(function(r){
        const card = document.createElement('article');
        card.className = 'review-card';
        const head = document.createElement('div');
        head.className = 'review-head';
        const name = document.createElement('div'); name.textContent = r.author;
        const stars = document.createElement('div'); stars.className = 'review-stars';
        const rating = Math.round(parseFloat(r.rating) || 0);
        stars.textContent = '★★★★★'.slice(0, rating);
        stars.setAttribute('aria-label', rating+' de 5');
        const time = document.createElement('div');
        time.style.marginLeft='auto'; time.style.color='#6b7280'; time.style.fontSize='.9rem';
        time.textContent = r.time || '';
        head.appendChild(name); head.appendChild(stars); head.appendChild(time);
        const body = document.createElement('p');
        body.className = 'review-text'; body.textContent = r.content;
        card.appendChild(head); card.appendChild(body); wrap.appendChild(card);
      });
    }
  }).catch(function(err){ console.warn('No se pudieron cargar reseñas', err); });
})();

/* ============== 3) Buscador rápido → redirección con querystring ============== */
(function(){
  const form = document.getElementById('quickSearch');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const op = document.getElementById('op')?.value || 'comprar';
    const type = document.getElementById('f-type')?.value || '';
    const city = document.getElementById('f-city')?.value || ''; // ✅ sin encode manual
    const min = document.getElementById('f-min')?.value || '';
    const max = document.getElementById('f-max')?.value || '';
    const map = {
      comprar: 'propiedades-comprar.html',
      arrendar: 'propiedades-arrendar.html',
      alojar: 'propiedades-alojamientos.html'
    };
    const dest = map[op] || 'propiedades-comprar.html';
    const params = new URLSearchParams();
    if(city) params.set('city', city); // URLSearchParams maneja el encode
    if(type) params.set('type', type);
    if(min) params.set('min', min);
    if(max) params.set('max', max);
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

/* ============== 5) Miniaturas home ← properties/data.json (con caché) ============== */
(function(){
  const cfg = [
    {operation:'comprar', targetId:'carouselVenta',    mode:'venta'},
    {operation:'arrendar',targetId:'carouselArriendo', mode:'arriendo'},
    {operation:'dias',    targetId:'carouselDias',     mode:'dias'}
  ];

  function formatCOP(n){ if(n==null) return ''; return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

  function buildCard(p, mode){
    const el = document.createElement('article');
    el.className = 'card'; el.setAttribute('role','listitem');

    const img = document.createElement('img');
    // Respetamos lazy por defecto, pero permitimos excluir si se desea con .no-lazy / data-eager
    img.loading='lazy'; img.decoding='async'; img.alt = escapeHtml(p.title || 'Propiedad');
    const raw = p.image || p.img || p.img_url || p.imgUrl || p.photo;

    if (raw) {
      const isAbsolute = /^https?:\/\//i.test(raw);
      if (isAbsolute || raw.startsWith('/')) {
        img.src = raw;
      } else {
        img.src = '/' + raw.replace(/^\.?\//,''); // normaliza a ruta absoluta local
      }
    } else {
      img.src = 'https://i.postimg.cc/0yYb8Y6r/placeholder.png';
    }

    const body = document.createElement('div'); body.className='body';
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

    el.appendChild(img); el.appendChild(body);
    body.appendChild(h3); body.appendChild(specs); body.appendChild(price);

    el.addEventListener('click', function(){
      const id = p.id || '';
      window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(id);
    });
    return el;
  }

  async function fetchByOperation(op){
    try{
      const data = await getJSONCached('properties/data.json', { ttlMs: 1000 * 60 * 60 * 6, revalidate: true });
      if(!Array.isArray(data)) throw new Error('Formato inválido');
      return data.filter(it => String(it.operation).toLowerCase() === String(op).toLowerCase());
    }catch(e){
      console.warn('No se pudieron cargar propiedades', op, e);
      return [];
    }
  }

  document.addEventListener('DOMContentLoaded', async function(){
    const tasks = cfg.map(c => fetchByOperation(c.operation).then(arr => ({c, arr})));
    const results = await Promise.all(tasks);
    results.forEach(({c, arr})=>{
      const root = document.getElementById(c.targetId);
      if(!root) return;
      root.innerHTML = '';
      if(!arr.length){
        const note = document.createElement('div');
        note.style.padding='12px'; note.style.color='var(--muted)';
        note.textContent = 'Sin propiedades para mostrar.';
        root.appendChild(note);
        return;
      }
      arr.slice(0,8).forEach(p => root.appendChild(buildCard(p, c.mode)));
    });

    // Si la revalidación en background actualiza el JSON, podemos refrescar cards (opcional)
    document.addEventListener('altorra:json-updated', (ev) => {
      if (ev.detail?.url !== 'properties/data.json') return;
      // Render simple otra vez (sin flicker porque ya hay contenido)
      cfg.forEach(async (c) => {
        const root = document.getElementById(c.targetId);
        if(!root) return;
        const arr = await fetchByOperation(c.operation);
        root.innerHTML = '';
        arr.slice(0,8).forEach(p => root.appendChild(buildCard(p, c.mode)));
      });
    }, { once: true });
  });
})();

/* ============== 6) Registrar service worker para PWA (si existe) ============== */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js').catch(function(err){
    console.warn('SW registration failed', err);
  });
}
