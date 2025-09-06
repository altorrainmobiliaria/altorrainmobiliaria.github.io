/* Lazy load all images for performance */
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('img').forEach(function(img) {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
});

/* Dynamic reviews from reviews.json */
(function() {
    const wrap = document.getElementById('google-reviews');
    const fallback = document.getElementById('reviews-fallback');
    if (!wrap) return;
    fetch('reviews.json').then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    }).then(function(reviews) {
        if (Array.isArray(reviews) && reviews.length) {
            if (fallback) fallback.hidden = true;
            // Select randomly up to 3 unique reviews to avoid duplicates.
            let sample = reviews.slice();
            // Shuffle the array for a fair random selection
            sample.sort(() => Math.random() - 0.5);
            sample = sample.slice(0, 3);
            // Clear container in case it runs again
            wrap.innerHTML = '';
            sample.forEach(function(r) {
                const card = document.createElement('article');
                card.className = 'review-card';
                // head: name, stars, time
                const head = document.createElement('div');
                head.className = 'review-head';
                const name = document.createElement('div');
 (function(){
    const form = document.getElementById('quickSearch');
    if(!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const op = document.getElementById('op')?.value || 'comprar';
      const type = document.getElementById('f-type')?.value || '';
      const city = encodeURIComponent(document.getElementById('f-city')?.value || '');
      const min = document.getElementById('f-min')?.value || '';
      const max = document.getElementById('f-max')?.value || '';
      const map = { comprar:'propiedades-comprar.html', arrendar:'propiedades-arrendar.html', alojar:'propiedades-alojamientos.html' };
      const dest = map[op] || 'propiedades-comprar.html';
      const params = new URLSearchParams();
      if(city) params.set('city', city);
      if(type) params.set('type', type);
      if(min) params.set('min', min);
      if(max) params.set('max', max);
      const query = params.toString();
      window.location.href = dest + (query ? '?' + query : '');
    });                name.textContent = r.author;
                const stars = document.createElement('div');
                stars.className = 'review-stars';
                // build star rating string
                const rating = Math.round(parseFloat(r.rating) || 0);
                stars.textContent = '\u2605\u2605\u2605\u2605\u2605'.slice(0, rating);
                stars.setAttribute('aria-label', 'rating ' + rating + ' de 5');
                const time = document.createElement('div');
                time.style.marginLeft = 'auto';
                time.style.color = '#6b7280';
                time.style.fontSize = '.75rem';
                time.textContent = r.time || '';
                head.appendChild(name);
                head.appendChild(stars);
                head.appendChild(time);
                const body = document.createElement('p');
                body.className = 'review-text';
                body.textContent = r.content;
                card.appendChild(head);
                card.appendChild(body);
                wrap.appendChild(card);
            });
        }
    }).catch(function(err) {
        console.warn('No se pudieron cargar rese\u00f1as din\u00e1micas', err);
    });
})();

/* Register service worker for PWA if supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(function(err) {
        console.warn('SW registration failed', err);
    });
}
