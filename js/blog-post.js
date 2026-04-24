// js/blog-post.js — Carga dinámica de artículo desde Firestore (colección `blog`)
(function () {
  'use strict';

  var MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
  }

  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    return params.get('slug');
  }

  function showError() {
    document.getElementById('postLoading').style.display = 'none';
    document.getElementById('postArticle').style.display = 'none';
    document.getElementById('postError').style.display = 'block';
  }

  function renderPost(p) {
    var $ = function (id) { return document.getElementById(id); };
    $('postCategoria').textContent = p.categoria || 'Artículo';
    $('postTitulo').textContent = p.titulo || 'Artículo';
    $('postFecha').textContent = formatDate(p.fecha);
    $('postTiempo').textContent = (p.tiempoLectura || 5) + ' min lectura';
    if (p.imagen) {
      $('postImagen').src = p.imagen;
      $('postImagen').alt = p.titulo || '';
    }
    // cuerpo: HTML sanitizado (asumimos autores confiables con `_version` + RBAC)
    // Añadimos el contenido dentro del cuerpo después del botón "Volver"
    var body = $('postBody');
    var backBtn = body.querySelector('.post-back');
    body.innerHTML = '';
    if (backBtn) body.appendChild(backBtn);
    else {
      var a = document.createElement('a');
      a.href = 'blog.html';
      a.className = 'post-back';
      a.textContent = '← Volver al blog';
      body.appendChild(a);
    }
    var content = document.createElement('div');
    content.innerHTML = p.contenido || '<p>Este artículo aún no tiene contenido.</p>';
    body.appendChild(content);

    // Meta tags dinámicos para SEO/OG
    var title = (p.titulo || 'Artículo') + ' | Blog Inversionista | Altorra Inmobiliaria';
    document.title = title;
    var set = function (id, attr, val) {
      var el = document.getElementById(id);
      if (el && val) el.setAttribute(attr, val);
    };
    set('metaTitle', 'content', title);
    set('metaDesc', 'content', p.resumen || '');
    set('metaCanonical', 'href', 'https://altorrainmobiliaria.co/blog-post.html?slug=' + encodeURIComponent(p.slug));
    set('metaOgTitle', 'content', title);
    set('metaOgDesc', 'content', p.resumen || '');
    set('metaOgUrl', 'content', 'https://altorrainmobiliaria.co/blog-post.html?slug=' + encodeURIComponent(p.slug));
    if (p.imagen) set('metaOgImage', 'content', p.imagen);

    // JSON-LD Article
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.titulo,
      description: p.resumen,
      image: p.imagen,
      datePublished: p.fecha,
      author: { '@type': 'Organization', name: 'Altorra Inmobiliaria' },
      publisher: {
        '@type': 'Organization',
        name: 'Altorra Inmobiliaria',
        logo: { '@type': 'ImageObject', url: 'https://i.postimg.cc/SsPmBFXt/Chat-GPT-Image-9-ago-2025-10-31-20.png' }
      },
      mainEntityOfPage: 'https://altorrainmobiliaria.co/blog-post.html?slug=' + encodeURIComponent(p.slug)
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);

    document.getElementById('postLoading').style.display = 'none';
    document.getElementById('postArticle').style.display = 'block';
  }

  async function loadPost(slug) {
    // Espera Firebase (máx 6s)
    var waited = 0;
    while (!window.db && waited < 6000) {
      await new Promise(function (r) { setTimeout(r, 200); });
      waited += 200;
    }
    if (!window.db) return showError();

    try {
      var m = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      // Buscar por campo `slug` (no asumimos que docId == slug)
      var q = m.query(
        m.collection(window.db, 'blog'),
        m.where('slug', '==', slug),
        m.where('publicado', '==', true),
        m.limit(1)
      );
      var snap = await m.getDocs(q);
      if (snap.empty) return showError();
      var data = snap.docs[0].data();
      data.slug = slug;
      if (data.fecha && data.fecha.toDate) {
        data.fecha = data.fecha.toDate().toISOString().slice(0, 10);
      }
      renderPost(data);
    } catch (err) {
      console.error('[blog-post] Error cargando:', err);
      showError();
    }
  }

  function init() {
    var slug = getSlug();
    if (!slug) return showError();
    loadPost(slug);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
