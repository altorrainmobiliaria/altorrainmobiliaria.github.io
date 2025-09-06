/* scripts.js */

/* Lazy load para todas las imágenes */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('img').forEach(function (img) {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
  });
});

/* Reseñas dinámicas desde reviews.json (muestra hasta 3 aleatorias) */
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
        const head = document.createElement('div');
        head.className = 'review-head';
        const name = document.createElement('div');
        name.textContent = r.author || 'Usuario';
        const stars = document.createElement('div');
        stars.className = 'review-stars';
        const rating = Math.round(parseFloat(r.rating) || 0);
        stars.textContent = '★★★★★'.slice(0, Math.max(0, Math.min(rating, 5)));
        stars.setAttribute('aria-label', 'rating ' + rating + ' de 5');
        const time = document.createElement('div');
        time.style.marginLeft = 'auto';
        time.style.color = '#6b7280';
        time.style.fontSize = '.75rem';
        time.textContent = r.time || '';
        head.appendChild(name); head.appendChild(stars); head.appendChild(time);
        const body = document.createElement('p');
        body.className = 'review-text';
        body.textContent = r.content || '';
        card.appendChild(head); card.appendChild(body);
        wrap.appendChild(card);
      });
    })
    .catch(err => console.warn('No se pudieron cargar reseñas', err));
})();

/* Botones de flecha para carruseles */
(function () {
  function setupArrows() {
    document.querySelectorAll('.arrow').forEach(btn => {
      const targetId = btn.dataset.target;
      const root = document.getElementById(targetId);
      if (!root) return;
      btn.addEventListener('click', () => {
        const card = root.querySelector('.card');
        if (!card) return;
        const gap = parseFloat(getComputedStyle(root).gap) || 12;
        const step = card.getBoundingClientRect().width + gap;
        const dir = btn.classList.contains('left') ? -1 : 1;
        root.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupArrows);
  } else {
    setupArrows();
  }
})();

/* Buscador rápido (redirige con querystring) */
(function () {
  const form = document.getElementById('quickSearch');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const op = document.getElementById('op')?.value || 'comprar';
    const type = document.getElementById('f-type')?.value || '';
    const city = encodeURIComponent(document.getElementById('f-city')?.value || '');
    const min = document.getElementById('f-min')?.value || '';
    const max = document.getElementById('f-max')?.value || '';
    const map = { comprar: 'propiedades-comprar.html', arrendar: 'propiedades-arrendar.html', alojar: 'propiedades-alojamientos.html' };
    const dest = map[op] || 'propiedades-comprar.html';
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (min) params.set('min', min);
    if (max) params.set('max', max);
    window.location.href = dest + (params.toString() ? '?' + params.toString() : '');
  });
})();

/* Propiedades en carruseles (data.json) */
(function () {
  const R = {
    venta: document.getElementById('carouselVenta'),
    arriendo: document.getElementById('carouselArriendo'),
    dias: document.getElementById('carouselDias')
  };
  if (!R.venta && !R.arriendo && !R.dias) return;

  function money(n) {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
    } catch { return '$ ' + (n || 0).toLocaleString('es-CO'); }
  }

  function cardHTML(p) {
    const url = p.operation === 'arrendar' ? 'propiedades-arrendar.html'
              : (p.operation === 'comprar' ? 'propiedades-comprar.html' : 'propiedades-alojamientos.html');
    return `
      <article class="card" role="listitem" tabindex="0" onclick="location.href='${url}#${encodeURIComponent(p.id || '')}'" aria-label="${p.title || ''}">
        <img src="${(p.image || (p.images && p.images[0]) || '').replace(/"/g,'&quot;')}" alt="${(p.title || 'Propiedad')}" loading="lazy"/>
        <div class="body">
          <div style="font-weight:800">${p.title || 'Propiedad'}</div>
          <div style="color:#6b7280;margin-top:4px">${p.city || ''} • ${p.type || ''}</div>
          <div style="margin-top:6px;font-weight:800">${p.price ? money(p.price) : ''}</div>
          <div style="margin-top:4px;color:#6b7280">${[p.beds && (p.beds+' hab'), p.baths && (p.baths+' baños'), p.sqm && (p.sqm+' m²')].filter(Boolean).join(' • ')}</div>
        </div>
      </article>
    `;
  }

  fetch('data.json')
    .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(items => {
      if (!Array.isArray(items)) return;
      const venta = items.filter(p => (p.operation || '').toLowerCase() === 'comprar');
      const arriendo = items.filter(p => (p.operation || '').toLowerCase() === 'arrendar');
      const dias = items.filter(p => {
        const op = (p.operation || '').toLowerCase();
        return op === 'alojar' || op === 'dias' || op === 'por_dias' || op === 'por-dias';
      });

      if (R.venta) R.venta.innerHTML = venta.length ? venta.map(cardHTML).join('') : '<div style="padding:12px;color:#6b7280">Pronto añadiremos propiedades en venta.</div>';
      if (R.arriendo) R.arriendo.innerHTML = arriendo.length ? arriendo.map(cardHTML).join('') : '<div style="padding:12px;color:#6b7280">Pronto añadiremos propiedades en arriendo.</div>';
      if (R.dias) R.dias.innerHTML = dias.length ? dias.map(cardHTML).join('') : '<div style="padding:12px;color:#6b7280">Pronto añadiremos alojamientos por días.</div>';
    })
    .catch(err => {
      console.warn('No se pudieron cargar propiedades', err);
      Object.values(R).forEach(el => {
        if (el) el.innerHTML = '<div style="padding:12px;color:#6b7280">No fue posible cargar las propiedades en este momento.</div>';
      });
    });
})();

/* PWA (silencioso si no existe service-worker.js) */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(err => console.warn('SW registration failed', err));
}
