(function () {
  'use strict';

  const SECTION_ID = 'exclusivas-section';
  const CAROUSEL_ID = 'carouselExclusivas';
  const MIN_PRIORITY = 90;
  const MIN_RESULTS = 3;

  function injectCSS() {
    if (document.getElementById('exclusivas-css')) return;
    const s = document.createElement('style');
    s.id = 'exclusivas-css';
    s.textContent = `
      .exclusivas-section{
        position:relative;padding:64px 16px;overflow:hidden;
        background:linear-gradient(180deg,#0b0b0b 0%,#1a1a2e 100%);
      }
      .exclusivas-bg{
        position:absolute;inset:0;pointer-events:none;
        background:
          radial-gradient(ellipse at 20% 40%,rgba(212,175,55,.10),transparent 50%),
          radial-gradient(ellipse at 80% 70%,rgba(255,180,0,.08),transparent 45%);
      }
      .exclusivas-header{
        position:relative;max-width:var(--page-max);margin:0 auto 32px;
        text-align:center;color:#fff;
      }
      .exclusivas-badge{
        display:inline-block;padding:6px 16px;border-radius:999px;
        background:linear-gradient(135deg,rgba(212,175,55,.2),rgba(255,180,0,.15));
        border:1px solid rgba(212,175,55,.4);
        color:#d4af37;font-size:.78rem;font-weight:700;letter-spacing:1px;
        margin-bottom:14px;text-transform:uppercase;
      }
      .exclusivas-header h2{
        font-size:clamp(1.6rem,4vw,2.4rem);font-weight:800;margin:0 0 8px;color:#fff;
      }
      .exclusivas-sub{
        color:rgba(255,255,255,.65);margin:0;font-size:1rem;
      }
      .exclusivas-wrap{position:relative;max-width:var(--page-max);margin:0 auto}
      .exclusivas-wrap .carousel-row{
        display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;
        padding:8px 4px 20px;scrollbar-width:none;
      }
      .exclusivas-wrap .carousel-row::-webkit-scrollbar{display:none}
      .exclusivas-wrap .card{
        flex:0 0 300px;scroll-snap-align:start;
        background:#fff;border-radius:18px;overflow:hidden;
        box-shadow:0 12px 40px rgba(0,0,0,.28);
        border:1px solid rgba(212,175,55,.35);
        transition:transform .22s,box-shadow .22s;
      }
      .exclusivas-wrap .card:hover{
        transform:translateY(-6px);
        box-shadow:0 24px 60px rgba(212,175,55,.25);
      }
      .exclusivas-wrap .arrow{
        position:absolute;top:calc(50% - 20px);width:44px;height:44px;border-radius:50%;
        background:rgba(255,255,255,.95);border:none;cursor:pointer;
        display:flex;align-items:center;justify-content:center;color:#0b0b0b;
        box-shadow:0 6px 18px rgba(0,0,0,.3);transition:transform .15s;z-index:2;
      }
      .exclusivas-wrap .arrow:hover{transform:scale(1.08)}
      .exclusivas-wrap .arrow.left{left:-6px}
      .exclusivas-wrap .arrow.right{right:-6px}
      .exclusivas-wrap .arrow svg{width:20px;height:20px}
      .ex-premium-ribbon{
        position:absolute;top:14px;right:-34px;transform:rotate(36deg);
        background:linear-gradient(135deg,#d4af37,#ffb400);
        color:#000;font-weight:800;font-size:.68rem;padding:4px 40px;
        letter-spacing:1px;box-shadow:0 2px 8px rgba(0,0,0,.25);
        z-index:3;
      }
      .exclusivas-wrap .card .media{position:relative}
    `;
    document.head.appendChild(s);
  }

  var _u = window.AltorraUtils || {};
  function escapeHtml(s) { return _u.escapeHtml ? _u.escapeHtml(s) : String(s||'').replace(/[&<>"]/g, function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m];}); }
  function formatCOP(n) { if (n == null) return ''; return 'COP $ ' + (_u.formatCOP ? _u.formatCOP(n) : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')); }

  function getExclusivas(props) {
    const filtered = (props || []).filter(function (p) {
      const score = Number(p.highlightScore || p.prioridad || 0);
      const featured = Number(p.featured || 0);
      return score >= MIN_PRIORITY || featured >= 1;
    });
    filtered.sort(function (a, b) {
      const sa = Number(a.highlightScore || a.prioridad || 0);
      const sb = Number(b.highlightScore || b.prioridad || 0);
      if (sb !== sa) return sb - sa;
      return Number(b.featured || 0) - Number(a.featured || 0);
    });
    return filtered.slice(0, 10);
  }

  function buildCard(p) {
    const el = document.createElement('article');
    el.className = 'card';
    el.setAttribute('role', 'listitem');
    if (p.id) el.setAttribute('data-id', p.id);

    const imgSrc = p.image ?
      (p.image.startsWith('http') || p.image.startsWith('/') ? p.image : '/' + p.image) :
      'https://i.postimg.cc/0yYb8Y6r/placeholder.png';

    const specs = [
      p.beds ? (p.beds + 'H') : '',
      p.baths ? (p.baths + 'B') : '',
      p.sqm ? (p.sqm + ' m²') : ''
    ].filter(Boolean).join(' · ');

    el.innerHTML = `
      <div class="media" style="position:relative">
        <div class="ex-premium-ribbon">EXCLUSIVA</div>
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.title || 'Propiedad')}" loading="lazy" decoding="async" style="width:100%;height:200px;object-fit:cover;display:block"/>
      </div>
      <div class="meta" style="padding:16px">
        <h3 style="font-size:1rem;margin:0 0 6px;color:#111827;font-weight:800;line-height:1.3">${escapeHtml(p.title || '')}</h3>
        <div class="price" style="color:var(--gold);font-weight:800;font-size:1.1rem;margin-bottom:4px">${formatCOP(p.price)}</div>
        <div class="specs" style="font-size:.85rem;color:#6b7280;margin-bottom:12px">${escapeHtml(specs)}${p.city ? ' · ' + escapeHtml(p.city) : ''}</div>
        <a class="btn btn-primary" href="detalle-propiedad.html?id=${encodeURIComponent(p.id)}" style="width:100%;display:block;text-align:center;padding:10px;border-radius:10px;font-weight:700;font-size:.9rem">Ver detalles</a>
      </div>
    `;

    el.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(p.id);
    });

    return el;
  }

  function render() {
    const section = document.getElementById(SECTION_ID);
    const carousel = document.getElementById(CAROUSEL_ID);
    if (!section || !carousel) return;

    if (!window.propertyDB || !Array.isArray(window.propertyDB.properties)) return;

    const exclusivas = getExclusivas(window.propertyDB.properties);
    if (exclusivas.length < MIN_RESULTS) {
      section.style.display = 'none';
      return;
    }

    carousel.innerHTML = '';
    exclusivas.forEach(function (p) {
      carousel.appendChild(buildCard(p));
    });

    section.style.display = 'block';
    wireArrows();
  }

  function wireArrows() {
    document.querySelectorAll('.exclusivas-wrap .arrow').forEach(function (btn) {
      if (btn.__exWired) return;
      btn.__exWired = true;
      btn.addEventListener('click', function () {
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (!target) return;
        const dir = btn.classList.contains('left') ? -1 : 1;
        const scrollBy = Math.min(target.clientWidth * 0.9, 640);
        target.scrollBy({ left: dir * scrollBy, behavior: 'smooth' });
      });
    });
  }

  function init() {
    injectCSS();
    if (window.propertyDB && Array.isArray(window.propertyDB.properties) && window.propertyDB.properties.length) {
      render();
    }
    window.addEventListener('altorra:db-ready', render);
    window.addEventListener('altorra:db-refreshed', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
