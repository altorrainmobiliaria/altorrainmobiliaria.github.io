/* Load external header and footer and initialize navigation */
function loadHeaderFooterAndNav() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    // Remove existing header and footer to avoid duplicates
    const oldHeader = document.querySelector('body > header');
    if (oldHeader) oldHeader.remove();
    const oldFooter = document.querySelector('body > footer');
    if (oldFooter) oldFooter.remove();
    fetch('header.html').then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }).then(function(html) {
      headerPlaceholder.innerHTML = html;
      initNavigation();
    }).catch(function(err) {
      console.warn('No se pudo cargar header.html', err);
    });
  }
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    fetch('footer.html').then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }).then(function(html) {
      footerPlaceholder.innerHTML = html;
    }).catch(function(err) {
      console.warn('No se pudo cargar footer.html', err);
    });
  }
}

document.addEventListener('DOMContentLoaded', loadHeaderFooterAndNav);

/* Initialize navigation (desktop menus and mobile drawer) */
function initNavigation() {
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
