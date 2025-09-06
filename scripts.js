/* scripts.js */

/* Lazy para imágenes */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
  });
});

/* Utilidades */
function moneyCOP(n) {
  try { return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n||0); }
  catch { return '$ ' + (n||0).toLocaleString('es-CO'); }
}
function escapeHtml(s){ return String(s||'').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

/* Carga resiliente: PRIORIDAD a properties/data.json (y fallback) */
async function loadDataJSON() {
  const CANDIDATES = [
    'properties/data.json', './properties/data.json', '/properties/data.json',
    'data.json', './data.json', '/data.json'
  ];
  let lastErr;
  for (const url of CANDIDATES) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (Array.isArray(data)) return data;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('No se encontró data.json');
}

/* Construcción de tarjeta */
function cardHTML(p) {
  const op = (p.operation||'').toLowerCase();
  const url = op==='arrendar' ? 'propiedades-arrendar.html'
            : op==='comprar'  ? 'propiedades-comprar.html'
                               : 'propiedades-alojamientos.html';

  // Imagen: admite 'image' o 'images[0]' y corrige rutas relativas
  let img = (p.image || (p.images && p.images[0]) || '').trim();
  if (img && !/^https?:\/\//i.test(img) && img[0] !== '/') img = '/' + img;

  return `
    <article class="card" role="listitem" tabindex="0" onclick="location.href='${url}#${encodeURIComponent(p.id||'')}'" aria-label="${escapeHtml(p.title||'Propiedad')}">
      <img src="${escapeHtml(img)}" alt="${escapeHtml(p.title||'Propiedad')}" loading="lazy" decoding="async"/>
      <div class="body">
        <div style="font-weight:800">${escapeHtml(p.title||'Propiedad')}</div>
        <div style="color:#6b7280;margin-top:4px">${escapeHtml(p.city||'')} • ${escapeHtml(p.type||'')}</div>
        <div style="margin-top:6px;font-weight:800">${p.price?moneyCOP(p.price):''}</div>
        <div style="margin-top:4px;color:#6b7280">
          ${[p.beds&&(p.beds+' hab'), p.baths&&(p.baths+' baños'), p.sqm&&(p.sqm+' m²')].filter(Boolean).join(' • ')}
        </div>
      </div>
    </article>
  `;
}

/* Pinta carruseles */
(async function renderCarousels(){
  const R = {
    venta: document.getElementById('carouselVenta'),
    arriendo: document.getElementById('carouselArriendo'),
    dias: document.getElementById('carouselDias')
  };
  if (!R.venta && !R.arriendo && !R.dias) return;

  try {
    const items = await loadDataJSON();

    const venta    = items.filter(p => (p.operation||'').toLowerCase()==='comprar');
    const arriendo = items.filter(p => (p.operation||'').toLowerCase()==='arrendar');
    const dias     = items.filter(p => ['alojar','dias','por_dias','por-dias'].includes((p.operation||'').toLowerCase()));

    if (R.venta)    R.venta.innerHTML    = venta.length   ? venta.map(cardHTML).join('')   : '<div style="padding:12px;color:#6b7280">Pronto añadiremos propiedades en venta.</div>';
    if (R.arriendo) R.arriendo.innerHTML = arriendo.length? arriendo.map(cardHTML).join('') : '<div style="padding:12px;color:#6b7280">Pronto añadiremos propiedades en arriendo.</div>';
    if (R.dias)     R.dias.innerHTML     = dias.length    ? dias.map(cardHTML).join('')     : '<div style="padding:12px;color:#6b7280">Pronto añadiremos alojamientos por días.</div>';
  } catch (err) {
    console.warn('No se pudieron cargar propiedades', err);
    Object.values(R).forEach(el => {
      if (el) el.innerHTML = '<div style="padding:12px;color:#6b7280">No fue posible cargar las propiedades en este momento.</div>';
    });
  }
})();

/* Flechas de carrusel */
(function(){
  function setupArrows(){
    document.querySelectorAll('.arrow').forEach(btn=>{
      const targetId = btn.dataset.target;
      const root = document.getElementById(targetId);
      if (!root) return;
      btn.addEventListener('click', ()=>{
        const card = root.querySelector('.card');
        if (!card) return;
        const gap = parseFloat(getComputedStyle(root).gap) || 12;
        const step = card.getBoundingClientRect().width + gap;
        const dir = btn.classList.contains('left') ? -1 : 1;
        root.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });
  }
  (document.readyState==='loading') ? document.addEventListener('DOMContentLoaded', setupArrows) : setupArrows();
})();

/* Reseñas (desde reviews.json) */
(function () {
  const wrap = document.getElementById('google-reviews');
  if (!wrap) return;
  fetch('reviews.json')
    .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(reviews => {
      if (!Array.isArray(reviews) || !reviews.length) return;
      const pick = reviews.slice().sort(() => Math.random() - 0.5).slice(0, 3);
      wrap.innerHTML = '';
      pick.forEach(r => {
        const card = document.createElement('article');
        card.className = 'review-card';
        const head = document.createElement('div'); head.className = 'review-head';
        const name = document.createElement('div'); name.textContent = r.author || 'Usuario';
        const stars = document.createElement('div'); stars.className = 'review-stars';
        const rating = Math.round(parseFloat(r.rating) || 0);
        stars.textContent = '★★★★★'.slice(0, Math.max(0, Math.min(rating, 5)));
        stars.setAttribute('aria-label', 'rating ' + rating + ' de 5');
        const time = document.createElement('div'); time.style.marginLeft='auto'; time.style.color='#6b7280'; time.style.fontSize='.75rem'; time.textContent = r.time || '';
        const body = document.createElement('p'); body.className='review-text'; body.textContent = r.content || '';
        head.appendChild(name); head.appendChild(stars); head.appendChild(time);
        card.appendChild(head); card.appendChild(body);
        wrap.appendChild(card);
      });
    })
    .catch(err => console.warn('No se pudieron cargar reseñas', err));
})();

/* PWA (silencioso) */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(err => console.warn('SW registration failed', err));
}
