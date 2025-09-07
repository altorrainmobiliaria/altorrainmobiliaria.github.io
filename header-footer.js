/* Carga header/footer externos e inicializa navegación (una sola vez) */
(function(){
  if (window.__altorraHeaderInit__) return;
  window.__altorraHeaderInit__ = true;

  function inject(id, url, after){
    const host = document.getElementById(id);
    if(!host) return;
    fetch(url, {cache:'no-store'}).then(r=>{
      if(!r.ok) throw new Error('HTTP '+r.status);
      return r.text();
    }).then(html=>{
      host.innerHTML = html;
      if(after) after();
    }).catch(e=>console.warn('No se pudo cargar', url, e));
  }

  function initHeader(){
    const header = document.querySelector('header');
    if(!header) return;

    // ===== Desktop dropdowns =====
    let open=null, hideTimer=null;
    const isDesktop = ()=> window.innerWidth > 860;
    const panels = document.querySelectorAll('.menu-panel');

    function reset(p){ if(!p) return; p.style.left='';p.style.top='';p.style.width='';p.style.maxWidth='';p.style.visibility='';}
    function place(btn,panel){
      if(!panel || !btn) return;
      if(open && open.panel!==panel) hideNow(open.panel,open.btn);
      clearTimeout(hideTimer);

      const item = btn.closest('.nav-item');
      const isMega = (item?.dataset.size||'compact')==='mega';

      panel.style.display='block';
      panel.style.visibility='hidden';
      panel.style.position='fixed';
      panel.style.maxHeight = Math.max(260, window.innerHeight - 24) + 'px';

      if(isMega){ panel.style.width = Math.min(920, window.innerWidth - 24) + 'px'; }
      else { panel.style.width='auto'; panel.style.maxWidth = Math.min(520, window.innerWidth - 24) + 'px'; }

      const pre = panel.getBoundingClientRect();
      const b = btn.getBoundingClientRect();

      let left;
      if(isMega){
        left = Math.round(b.left + b.width/2 - pre.width/2);
        left = Math.max(12, Math.min(left, window.innerWidth - pre.width - 12));
      }else{
        left = Math.round(Math.min(b.left, window.innerWidth - pre.width - 12));
        left = Math.max(left, 12);
      }
      let top = Math.round(b.bottom + 8);
      if(top + pre.height > window.innerHeight - 12){
        top = Math.round(b.top - pre.height - 8);
        if(top < 12) top = 12;
      }
      panel.style.left=left+'px';
      panel.style.top=top+'px';
      panel.style.visibility='visible';
      panel.classList.add('menu-visible');
      panel.setAttribute('aria-hidden','false');
      btn.setAttribute('aria-expanded','true');
      open = {panel,btn};
    }
    function hideNow(panel,btn){
      if(!panel) return;
      btn && btn.setAttribute('aria-expanded','false');
      panel.classList.remove('menu-visible');
      panel.style.display='none';
      panel.setAttribute('aria-hidden','true');
      reset(panel);
      if(open && open.panel===panel) open=null;
    }
    function scheduleClose(){
      clearTimeout(hideTimer);
      hideTimer = setTimeout(()=>{ if(open) hideNow(open.panel, open.btn); }, 120);
    }

    header.addEventListener('pointerenter', (e)=>{
      if(!isDesktop()) return;
      const btn = e.target.closest('.nav-btn[data-panel]');
      if(btn){ const p = document.getElementById(btn.getAttribute('data-panel')); place(btn,p); }
    }, true);
    header.addEventListener('click', (e)=>{
      const btn = e.target.closest('.nav-btn[data-panel]');
      if(btn && isDesktop()){
        e.preventDefault();
        const p = document.getElementById(btn.getAttribute('data-panel'));
        if(open && open.panel===p) hideNow(p,btn); else place(btn,p);
      }
    });
    header.addEventListener('pointerleave', ()=>{ if(isDesktop()) scheduleClose(); });
    panels.forEach(p=>{
      p.addEventListener('pointerenter', ()=> clearTimeout(hideTimer));
      p.addEventListener('pointerleave', scheduleClose);
    });
    document.addEventListener('pointerdown', (e)=>{
      if(!open) return;
      if(e.target.closest('header') || e.target.closest('.menu-panel')) return;
      hideNow(open.panel, open.btn);
    });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape' && open) hideNow(open.panel,open.btn); });
    window.addEventListener('resize', ()=>{ if(open) hideNow(open.panel,open.btn); });

    // ===== Drawer móvil =====
    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('drawerBackdrop');
    if(toggle && drawer && backdrop){
      let lastFocus=null;
      const focusable = root=> root.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');

      function setH(){
        const h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))||72;
        drawer.style.height = (window.innerHeight - h) + 'px';
      }
      function openDrawer(){
        lastFocus=document.activeElement;
        drawer.hidden=false; setH();
        requestAnimationFrame(()=>{
          drawer.classList.add('open'); backdrop.classList.add('open');
          document.body.style.overflow='hidden'; toggle.setAttribute('aria-expanded','true');

          // 👉 Enfoca el título del menú (no el primer enlace) para evitar el borde azul
          const title = drawer.querySelector('#mobileMenuTitle');
          if (title){
            title.setAttribute('tabindex','-1');
            // preventScroll evita “saltar” la página en iOS
            title.focus({preventScroll:true});
          } else {
            // fallback: si falta el título, enfoca el propio drawer
            drawer.setAttribute('tabindex','-1');
            drawer.focus({preventScroll:true});
          }
        });
        window.addEventListener('resize', setH);
        window.addEventListener('orientationchange', setH);
      }
      function closeDrawer(){
        drawer.classList.remove('open'); backdrop.classList.remove('open');
        document.body.style.overflow=''; toggle.setAttribute('aria-expanded','false');
        window.removeEventListener('resize', setH);
        window.removeEventListener('orientationchange', setH);
        setTimeout(()=>{ drawer.hidden=true; drawer.style.height=''; }, 200);
        lastFocus && lastFocus.focus();
      }
      toggle.addEventListener('click', ()=> (toggle.getAttribute('aria-expanded')==='true'? closeDrawer():openDrawer()));
      backdrop.addEventListener('click', closeDrawer);
      document.addEventListener('keydown', e=>{
        if(e.key==='Escape' && !drawer.hidden) closeDrawer();
        if(e.key==='Tab' && !drawer.hidden){
          const els = Array.from(focusable(drawer)); if(!els.length) return;
          const first=els[0], last=els[els.length-1];
          if(e.shiftKey && document.activeElement===first){ last.focus(); e.preventDefault(); }
          else if(!e.shiftKey && document.activeElement===last){ first.focus(); e.preventDefault(); }
        }
      });
      window.addEventListener('resize', ()=>{ if(isDesktop() && !drawer.hidden) closeDrawer(); });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    inject('header-placeholder','header.html', initHeader);
    inject('footer-placeholder','footer.html');
  });
})();
