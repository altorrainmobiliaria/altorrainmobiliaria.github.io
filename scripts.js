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

/* Load header and footer into placeholders and initialize navigation */
function loadHeaderFooter(){
    const headerPlaceholder = document.getElementById('header-placeholder');
    if(headerPlaceholder){
                        // Remove static header and footer if present
      onst oldHeader = document.querySelector('body > header');
    if(oldHeader) oldHeader.remove();
    const oldFooter = document.querySelector('body > footer');
    if(oldFooter) oldFooter.remove();
feftch(o'header.html').then(function(res){
            if(!res.ok) throw new Error('HTTP '+res.status);
            return res.text();
        }).then(function(html){
            headerPlaceholder.innerHTML = html;
            // initialize navigation after header insertion
            initNavigation();
        }).catch(function(err){
            console.warn('No se pudo cargar header.html', err);
        });
    }
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if(footerPlaceholder){
        fetch('footer.html').then(function(res){
            if(!res.ok) throw new Error('HTTP '+res.status);
            return res.text();
        }).then(function(html){
            footerPlaceholder.innerHTML = html;
        }).catch(function(err){
            console.warn('No se pudo cargar footer.html', err);
        });
    }
}

document.addEventListener('DOMContentLoaded', loadHeaderFooter);

/* Initialize navigation (desktop menus and mobile drawer) */
function initNavigation(){
    // Desktop mega menu
    (function(){
        const buttons = document.querySelectorAll('.nav-btn[data-panel]');
        if(!buttons.length) return;
        let current = null;
        function hideImmediate(obj){
            const panel = obj.panel;
            const btn = obj.btn;
            panel.classList.remove('menu-visible');
            panel.style.display = 'none';
            panel.setAttribute('aria-hidden','true');
            if(btn) btn.setAttribute('aria-expanded','false');
        }
        function resetPanelStyles(panel){
            panel.style.top = '';
            panel.style.left = '';
            panel.style.right = '';
            panel.style.width = '';
        }
        function placeAndShow(btn,panel,size){
            resetPanelStyles(panel);
            panel.style.display = 'block';
            panel.setAttribute('aria-hidden','false');
            btn.setAttribute('aria-expanded','true');
            const rect = btn.getBoundingClientRect();
            const margin = 12;
            if(size === 'mega'){
                panel.classList.add('panel-mega');
                panel.style.top = rect.bottom + 'px';
                panel.style.left = margin + 'px';
                panel.style.right = margin + 'px';
            }else{
                panel.classList.add('panel-compact');
                panel.style.top = rect.bottom + 'px';
                const left = rect.left;
                panel.style.left = Math.max(margin, left) + 'px';
            }
            panel.classList.add('menu-visible');
        }
        buttons.forEach(function(btn){
            const id = btn.getAttribute('data-panel');
            const panel = document.getElementById(id);
            const size = btn.getAttribute('data-size') || 'compact';
            if(!panel) return;
            btn.addEventListener('pointerenter', function(){
                if(window.innerWidth > 860){
                    if(current && current.panel !== panel){
                        hideImmediate(current);
                    }
                    placeAndShow(btn,panel,size);
                    current = {panel:panel, btn:btn};
                }
            });
            btn.addEventListener('pointerleave', function(){
                if(window.innerWidth > 860){
                    setTimeout(function(){
                        if(current && !current.panel.matches(':hover') && !current.btn.matches(':hover')){
                            hideImmediate(current);
                            current = null;
                        }
                    }, 120);
                }
            });
            panel.addEventListener('pointerleave', function(){
                if(window.innerWidth > 860){
                    hideImmediate({panel:panel, btn:btn});
                    current = null;
                }
            });
        });
        document.addEventListener('click', function(e){
            if(e.target.closest('nav') || e.target.closest('.menu-panel')) return;
            document.querySelectorAll('.menu-panel.menu-visible').forEach(function(p){
                p.classList.remove('menu-visible');
                p.style.display = 'none';
                p.setAttribute('aria-hidden','true');
            });
            document.querySelectorAll('.nav-btn[data-panel]').forEach(function(b){
                b.setAttribute('aria-expanded','false');
            });
            current = null;
        });
        document.addEventListener('keydown', function(e){
            if(e.key === 'Escape'){
                document.querySelectorAll('.menu-panel.menu-visible').forEach(function(p){
                    p.classList.remove('menu-visible');
                    p.style.display = 'none';
                    p.setAttribute('aria-hidden','true');
                });
                document.querySelectorAll('.nav-btn[data-panel]').forEach(function(b){
                    b.setAttribute('aria-expanded','false');
                });
                current = null;
            }
        });
        window.addEventListener('resize', function(){
            document.querySelectorAll('.menu-panel').forEach(function(p){
                p.classList.remove('menu-visible');
                p.style.display = 'none';
                p.setAttribute('aria-hidden','true');
                resetPanelStyles(p);
            });
            document.querySelectorAll('.nav-btn[data-panel]').forEach(function(b){
                b.setAttribute('aria-expanded','false');
            });
            current = null;
        });
    })();

    // Mobile drawer
    (function(){
        const toggle = document.getElementById('navToggle');
        const drawer = document.getElementById('mobileMenu');
        const backdrop = document.getElementById('drawerBackdrop');
        if(!toggle || !drawer || !backdrop) return;
        let lastFocus = null;
        function focusable(root){
            return root.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        }
        function setDrawerHeight(){
            const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
            drawer.style.height = (window.innerHeight - headerH) + 'px';
        }
        function clearDrawerHeight(){ drawer.style.height = ''; }
        function openDrawer(){
            lastFocus = document.activeElement;
            drawer.hidden = false;
            setDrawerHeight();
            window.addEventListener('resize', setDrawerHeight);
            window.addEventListener('orientationchange', setDrawerHeight);
            requestAnimationFrame(function(){
                drawer.classList.add('open');
                backdrop.classList.add('open');
                document.body.style.overflow = 'hidden';
                toggle.setAttribute('aria-expanded','true');
                const el = focusable(drawer)[0];
                if(el) el.focus();
            });
        }
        function closeDrawer(){
            drawer.classList.remove('open');
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
            toggle.setAttribute('aria-expanded','false');
            window.removeEventListener('resize', setDrawerHeight);
            window.removeEventListener('orientationchange', setDrawerHeight);
            setTimeout(function(){
                drawer.hidden = true;
                clearDrawerHeight();
            }, 200);
            if(lastFocus) lastFocus.focus();
        }
        toggle.addEventListener('click', function(){
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            expanded ? closeDrawer() : openDrawer();
        });
        backdrop.addEventListener('click', closeDrawer);
        document.addEventListener('keydown', function(e){
            if(e.key === 'Escape' && !drawer.hidden) closeDrawer();
            if(e.key === 'Tab' && !drawer.hidden){
                const els = Array.from(focusable(drawer));
                if(els.length === 0) return;
                const first = els[0], last = els[els.length-1];
                if(e.shiftKey && document.activeElement === first){
                    last.focus(); e.preventDefault();
                }else if(!e.shiftKey && document.activeElement === last){
                    first.focus(); e.preventDefault();
                }
            }
        });
        window.addEventListener('resize', function(){
            if(window.innerWidth > 860 && !drawer.hidden) closeDrawer();
        });
    })();
}
