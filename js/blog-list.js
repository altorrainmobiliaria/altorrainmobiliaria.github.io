// js/blog-list.js — Renderizado dinámico del índice del blog desde Firestore
(function () {
  'use strict';

  var FALLBACK_POSTS = [
    {
      slug: 'por-que-invertir-cartagena-2026',
      titulo: '¿Por qué invertir en Cartagena en 2026?',
      resumen: 'Cartagena se consolida como uno de los mercados inmobiliarios más atractivos de Latinoamérica. Descubre las razones clave y los datos que respaldan esta tendencia.',
      categoria: 'Inversión',
      imagen: 'https://i.postimg.cc/FHy13q2M/pexels-rdne-8293700.jpg',
      fecha: '2026-04-15',
      tiempoLectura: 8,
      url: 'blog/por-que-invertir-cartagena-2026.html'
    },
    {
      slug: 'renta-turistica-vs-arriendo-tradicional',
      titulo: 'Renta turística vs arriendo tradicional: ¿Qué es más rentable?',
      resumen: 'Comparamos ingresos, ocupación, gastos y ROI real entre ambas modalidades para propiedades en las zonas premium de Cartagena.',
      categoria: 'Rentabilidad',
      imagen: 'https://i.postimg.cc/FHy13q2M/pexels-rdne-8293700.jpg',
      fecha: '2026-04-10',
      tiempoLectura: 10,
      url: 'blog/renta-turistica-vs-arriendo-tradicional.html'
    },
    {
      slug: 'guia-legal-inversionistas-extranjeros',
      titulo: 'Guía legal para inversionistas extranjeros en Colombia',
      resumen: 'Todo lo que necesitas saber sobre impuestos, visas de inversionista, escrituración y trámites para comprar propiedad en Colombia.',
      categoria: 'Legal',
      imagen: 'https://i.postimg.cc/FHy13q2M/pexels-rdne-8293700.jpg',
      fecha: '2026-04-05',
      tiempoLectura: 12,
      url: 'blog/guia-legal-inversionistas-extranjeros.html'
    }
  ];

  var MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function postUrl(p) {
    if (p.url) return p.url;
    if (p.slug) return 'blog/' + p.slug + '.html';
    return '#';
  }

  function renderCards(posts) {
    var grid = document.getElementById('blogGrid');
    if (!grid) return;
    grid.innerHTML = posts.map(function (p) {
      return '<a class="blog-card" href="' + esc(postUrl(p)) + '">' +
        '<img src="' + esc(p.imagen || 'https://i.postimg.cc/FHy13q2M/pexels-rdne-8293700.jpg') + '" ' +
          'alt="' + esc(p.titulo) + '" loading="lazy" decoding="async" width="400" height="200"/>' +
        '<div class="blog-card-body">' +
          '<span class="blog-tag">' + esc(p.categoria || 'Artículo') + '</span>' +
          '<h2>' + esc(p.titulo) + '</h2>' +
          '<p>' + esc(p.resumen || '') + '</p>' +
          '<div class="blog-meta">' +
            '<span>' + esc(formatDate(p.fecha)) + '</span>' +
            (p.tiempoLectura ? '<span>·</span><span>' + esc(p.tiempoLectura) + ' min lectura</span>' : '') +
          '</div>' +
          '<span class="blog-read">Leer artículo →</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  async function loadFromFirestore() {
    if (!window.db) return null;
    try {
      var m = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      var q = m.query(
        m.collection(window.db, 'blog'),
        m.where('publicado', '==', true),
        m.orderBy('fecha', 'desc'),
        m.limit(30)
      );
      var snap = await m.getDocs(q);
      var posts = [];
      snap.forEach(function (doc) {
        var d = doc.data();
        posts.push({
          slug: d.slug || doc.id,
          titulo: d.titulo,
          resumen: d.resumen,
          categoria: d.categoria,
          imagen: d.imagen,
          fecha: d.fecha && d.fecha.toDate ? d.fecha.toDate().toISOString().slice(0,10) : d.fecha,
          tiempoLectura: d.tiempoLectura,
          url: d.url
        });
      });
      return posts.length > 0 ? posts : null;
    } catch (err) {
      console.warn('[blog-list] Firestore error, usando fallback:', err);
      return null;
    }
  }

  async function init() {
    // Render inmediato con fallback para no bloquear el LCP
    renderCards(FALLBACK_POSTS);

    // Esperar a que Firebase esté listo (máx 5s)
    var waited = 0;
    while (!window.db && waited < 5000) {
      await new Promise(function (r) { setTimeout(r, 200); });
      waited += 200;
    }
    if (!window.db) return; // seguimos con fallback

    var posts = await loadFromFirestore();
    if (posts) renderCards(posts);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
