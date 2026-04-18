(function () {
  'use strict';

  var STORAGE_KEY = 'altorra:lang';
  var DEFAULT_LANG = 'es';

  // Spanish → English text map (exact match on trimmed textContent)
  var TEXT_MAP = {
    // ── Nav / Header ──
    'Propiedades':                    'Properties',
    'Servicios':                      'Services',
    'Nosotros':                       'About us',
    'Contacto':                       'Contact',
    'Menú':                           'Menu',

    // Header panels
    'Comprar':                        'Buy',
    'Arrendar':                       'Rent',
    'Rentar por días':                'Vacation rental',
    'Gestión inmobiliaria':           'Property management',
    'Administración de inmuebles':    'Property administration',
    'Avalúos':                        'Appraisals',
    'Mantenimiento y reparaciones':   'Maintenance & repairs',
    'Mudanzas y logística':           'Moving & logistics',
    'Asesoría legal y contable':      'Legal & accounting',
    'Servicios jurídicos':            'Legal services',
    'Servicios contables':            'Accounting services',
    'Gestión de contratos':           'Contract management',
    'Turismo inmobiliario':           'Real estate tourism',
    'Yates, pasadías en islas y experiencias en Cartagena': 'Yachts, island day trips & experiences in Cartagena',

    // Mobile drawer
    'Mis Favoritos':                  'My Favorites',
    'Ir a Mis Favoritos':             'Go to My Favorites',
    'Por días':                       'Vacation',
    'Empresa':                        'Company',
    'Quiénes somos':                  'About us',
    'Yates, pasadías y experiencias en Cartagena': 'Yachts, island tours & experiences in Cartagena',

    // Hero
    '⭐ Inmobiliaria #1 en Cartagena': '⭐ #1 Real Estate Agency in Cartagena',
    'Gestión Integral en Soluciones Inmobiliarias': 'Comprehensive Real Estate Solutions',
    'Seguridad • Legalidad • Confianza': 'Security • Legality • Trust',
    'Buscar':                         'Search',

    // Search form options
    // 'Comprar' already above
    // 'Arrendar' already above
    'Cualquiera':                     'Any',
    'Apartamento':                    'Apartment',
    'Casa':                           'House',
    'Lote':                           'Lot',
    'Oficina':                        'Office',

    // Trust bar
    'propiedades activas':            'active properties',
    'ciudades cubiertas':             'cities covered',
    'Respaldo legal y financiero':    'Legal & financial backing',

    // Hub section - split text nodes (spans break the text)
    'Todo en un':                     'All in one',
    'lugar':                          'place',
    'Recién':                         'Recently',
    'publicadas':                     'listed',
    'Exclusivas':                     'Exclusive',
    'Elige tu camino. Te guiamos con asesoría legal, financiera y comercial.': 'Choose your path. We guide you with legal, financial and commercial advice.',
    'Apartamentos, casas y lotes con escritura y antecedentes verificados.': 'Apartments, houses and lots with verified titles and background checks.',
    'Ver propiedades en venta →':     'View properties for sale →',
    'Contratos con respaldo jurídico y opción de administración integral.': 'Contracts with legal backing and optional full property management.',
    'Ver propiedades en arriendo →':  'View rental properties →',
    'Invertir':                       'Invest',
    'Renta turística en Cartagena con estimación de ocupación y rentabilidad.': 'Short-term rental in Cartagena with occupancy and ROI estimates.',
    'Ver oportunidades de inversión →': 'View investment opportunities →',

    // Publish section
    '¿Quieres publicar tu propiedad?': 'Want to list your property?',
    'Si tienes un inmueble para vender, arrendar o rentar por días, Altorra te ayuda a promocionarlo de forma rápida y segura.':
      'If you have a property to sell, rent or lease for short stays, Altorra helps you market it quickly and safely.',
    'Publicar mi propiedad':          'List my property',

    // Recently published
    'Todas':                          'All',
    'Venta':                          'Sale',
    'Arriendo':                       'Rental',
    'Ver todo →':                     'View all →',

    // Exclusivas
    '✨ Colección privada':           '✨ Private collection',

    // Cards
    'Ver detalles':                   'View details',

    // Categories
    'Inmuebles por categoría':        'Properties by category',
    'Apartamentos':                   'Apartments',
    'Casas':                          'Houses',
    'Oficinas':                       'Offices',
    'Lotes':                          'Lots',

    // Neighborhoods
    'Barrios populares':              'Popular neighborhoods',
    'Explorar propiedades en este barrio →': 'Explore properties in this area →',

    // Testimonials
    'Lo que dicen nuestros clientes': 'What our clients say',

    // Footer (each text node between <br> tags)
    'Administración, Arriendo y Venta de Inmuebles': 'Property Management, Rental & Sales',
    'Servicios Legales Especializados': 'Specialized Legal Services',
    'Privacidad':                     'Privacy',
    '© 2025 Altorra Inmobiliaria — Hecho con confianza.': '© 2025 Altorra Inmobiliaria — Built with trust.',

    // Listing pages
    'Propiedades en Venta':           'Properties for Sale',
    'Propiedades en Arriendo':        'Properties for Rent',
    'Alojamientos por Días':          'Vacation Rentals',
    'Resultados de Búsqueda':         'Search Results',
    'Filtrar propiedades':            'Filter properties',
    'Tipo de propiedad':              'Property type',
    'Ciudad':                         'City',
    'Barrio':                         'Neighborhood',
    'Habitaciones':                   'Bedrooms',
    'Baños':                          'Bathrooms',
    'Precio mínimo':                  'Min price',
    'Precio máximo':                  'Max price',
    'Ordenar por':                    'Sort by',
    'Más recientes':                  'Newest',
    'Menor precio':                   'Lowest price',
    'Mayor precio':                   'Highest price',
    'Aplicar filtros':                'Apply filters',
    'Limpiar filtros':                'Clear filters',
    'No se encontraron propiedades.': 'No properties found.',

    // Detail page
    'Descripción':                    'Description',
    'Características':                'Features',
    'Ubicación':                      'Location',
    'Precio':                         'Price',
    'Enviar mensaje':                 'Send message',
    'Avisarme':                       'Notify me',
    '📅 Agendar visita':             'Schedule a visit',
    '📊 Calcular rentabilidad Airbnb': '📊 Calculate Airbnb ROI',
    'Propiedades similares':          'Similar properties',

    // Contact page
    'Contáctanos':                    'Contact us',
    'Nombre completo':                'Full name',
    'Teléfono / WhatsApp':            'Phone / WhatsApp',
    'Correo electrónico':             'Email',
    'Mensaje':                        'Message',
    'Enviar':                         'Send',
    'Enviar consulta':                'Send inquiry',

    // Quienes somos
    'Sobre nosotros':                 'About us',
    'Nuestra historia':               'Our story',
    'Nuestro equipo':                 'Our team',

    // Invest page - ROI cards
    'ROI Airbnb':                     'Airbnb ROI',
    'ROI Arriendo':                   'Rental ROI',
    'Precio m²':                      'Price/m²',
    'Ocupación':                      'Occupancy',
    'Alto ROI':                       'High ROI',
    'ROI medio':                      'Mid ROI',
    'Inversión total':                'Total investment',
    'Tarifa/noche Airbnb':            'Airbnb rate/night',
    'Ocupación promedio':             'Average occupancy',
    'Ingreso mensual bruto':          'Gross monthly income',
    'Gastos mensuales':               'Monthly expenses',
    'Ingreso neto mensual':           'Net monthly income',
    'ROI anual':                      'Annual ROI',
    'Arriendo mensual':               'Monthly rent',
    'Valorización est.':              'Est. appreciation',
    'Valorización constante':         'Steady appreciation',
    'Renta turística':                'Vacation rental',
    'Desarrollo urbano':              'Urban development',
    'Demanda internacional':          'International demand',

    // Invest page
    '📈 Guía de inversión 2026':      '📈 Investment guide 2026',
    '¿Por qué invertir en Cartagena?': 'Why invest in Cartagena?',
    'Una de las ciudades con mayor plusvalía y demanda turística de Colombia.':
      'One of Colombia\'s cities with the highest appreciation and tourism demand.',
    'ROI estimado por zona':          'Estimated ROI by zone',
    'Rentabilidad anual estimada según tipo de operación y ubicación.':
      'Estimated annual return by operation type and location.',
    'Casos de inversión':             'Investment cases',
    'Ejemplos reales de rentabilidad en propiedades gestionadas con Altorra.':
      'Real profitability examples from Altorra-managed properties.',
    '¿Listo para invertir?':          'Ready to invest?',
    'Nuestros asesores te ayudan a encontrar la propiedad ideal para tu perfil de inversión.':
      'Our advisors help you find the ideal property for your investment profile.',
    'Ver propiedades':                'Browse properties',
    'Calculadora Airbnb':             'Airbnb Calculator',
    'Abrir calculadora':              'Open calculator',

    // Renta turística page
    '🏖️ Gestión profesional de renta turística': '🏖️ Professional vacation rental management',
    '¿Qué hacemos por ti?':           'What do we do for you?',
    'Gestión integral 360° para maximizar la rentabilidad de tu propiedad.': 'Full 360° management to maximize your property returns.',
    'Cómo funciona':                  'How it works',
    'En 4 pasos convertimos tu propiedad en un activo rentable.': 'In 4 steps we turn your property into a profitable asset.',
    'Renta turística vs arriendo tradicional': 'Vacation rental vs traditional lease',
    'Compara qué opción maximiza tus ingresos.': 'Compare which option maximizes your income.',
    'Preguntas frecuentes':           'Frequently asked questions',
    '¿Tienes propiedad pero no tiempo?': 'Own property but have no time?',
    'Déjanos la gestión. Tú solo recibes los ingresos.': 'Let us manage. You just collect the income.',
    'Solicitar asesoría':             'Request consultation',
    'Calcular mi ROI':                'Calculate my ROI',
    'Quiero más información':         'I want more information',
    'Calcular rentabilidad':          'Calculate profitability',
    'Evaluación':                     'Assessment',
    'Preparación':                    'Preparation',
    'Operación':                      'Operations',
    'Liquidación':                    'Settlement',
    'Fotografía profesional':         'Professional photography',
    'Publicación multicanal':         'Multi-channel listing',
    'Check-in / Check-out':           'Check-in / Check-out',
    'Limpieza profesional':           'Professional cleaning',
    'Mantenimiento':                  'Maintenance',
    'Atención 24/7':                  '24/7 Guest support',
    'Reportes mensuales':             'Monthly reports',
    'Pagos directos':                 'Direct payments',
    'Característica':                 'Feature',
    'Quiero una asesoría':            'I want a consultation',
    'Te contactamos en menos de 24 horas.': 'We\'ll contact you within 24 hours.',
    'Nombre completo *':              'Full name *',
    'Teléfono / WhatsApp *':          'Phone / WhatsApp *',
    'Email *':                        'Email *',
    'Tipo de propiedad':              'Property type',
    'Mensaje (opcional)':             'Message (optional)',
    'Quiero información sobre gestión de renta turística': 'I want info on vacation rental management',

    // Categories
    'Explora por':                    'Explore by',
    'tipo':                           'type',
    'Encuentra exactamente lo que buscas.': 'Find exactly what you\'re looking for.',
    'Apartamento':                    'Apartment',
    'Casa':                           'House',
    'Lote':                           'Lot',
    'Oficina':                        'Office',
    'Local':                          'Retail',
    'Bodega':                         'Warehouse',

    // Neighborhoods
    'Barrios':                        'Neighborhoods',
    'premium':                        'premium',
    'Las zonas más exclusivas de Cartagena.': 'The most exclusive areas in Cartagena.',
    'Frente al mar · Alta valorización': 'Beachfront · High appreciation',
    'Tradición · Vista a la bahía':   'Tradition · Bay view',
    'Exclusividad · Tranquilidad':    'Exclusivity · Tranquility',
    'Patrimonio UNESCO · Renta turística': 'UNESCO Heritage · Vacation rental',
    'Playa privada · Proyectos nuevos': 'Private beach · New developments',

    // Featured
    'Propiedad destacada':            'Featured property',
    'de la semana':                   'of the week',

    // Testimonials
    'Lo que dicen nuestros':          'What our',
    'clientes':                       'clients say',

    // Footer extra
    'Administración':                 'Management',

    // Favoritos
    'Mis favoritos':                  'My favorites',
    'No tienes favoritos guardados.': 'You have no saved favorites.',

    // Simulador
    'Simulador de crédito hipotecario': 'Mortgage calculator',
    'Calcular':                       'Calculate',
    'Solicitar asesoría':             'Request advice',

    // Airbnb calculator
    'Calculadora Rentabilidad Airbnb': 'Airbnb Profitability Calculator',
    'Precio de la propiedad (COP)':   'Property price (COP)',
    'Tarifa por noche (COP)':         'Nightly rate (COP)',
    'Ocupación mensual (%)':          'Monthly occupancy (%)',
    'Administración / mes':           'HOA / month',
    'Servicios / mes':                'Utilities / month',
    'Limpieza / check-out':           'Cleaning / check-out',
    'Comisión plataforma (%)':        'Platform commission (%)',
    'Mantenimiento / mes':            'Maintenance / month',
    'Impuestos (%)':                  'Taxes (%)',
    'Calcular rentabilidad':          'Calculate profitability',
    'Hablar con un asesor por WhatsApp': 'Talk to an advisor on WhatsApp',
    'Retorno sobre la inversión':     'Return on investment',
    'Ingresos':                       'Income',
    'Ingreso bruto / mes':            'Gross income / month',
    'Ingreso bruto / año':            'Gross income / year',

    // Misc
    'Guardar favorito':               'Save favorite',
    'Cargando...':                    'Loading...',
    'Error al enviar. Intenta de nuevo.': 'Error sending. Please try again.',
  };

  // Reverse map for EN→ES restoration
  var REVERSE_MAP = {};
  for (var k in TEXT_MAP) REVERSE_MAP[TEXT_MAP[k]] = k;

  var state = { lang: DEFAULT_LANG };

  function getStoredLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setStoredLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }
  function detectLang() {
    var stored = getStoredLang();
    if (stored === 'es' || stored === 'en') return stored;
    return 'es';
  }

  function t(esText) {
    if (state.lang === 'es') return esText;
    return TEXT_MAP[esText] || esText;
  }

  // Walk all text nodes and translate
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, SVG: 1, CANVAS: 1 };

  function translateNode(root) {
    var toEN = state.lang === 'en';
    var map = toEN ? TEXT_MAP : REVERSE_MAP;

    // Text nodes
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (SKIP_TAGS[node.parentElement?.tagName]) continue;
      var txt = node.textContent.trim();
      if (!txt || txt.length < 2) continue;
      if (map[txt]) {
        node.textContent = node.textContent.replace(txt, map[txt]);
      }
    }

    // Placeholders
    root.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {
      var ph = el.getAttribute('placeholder').trim();
      if (map[ph]) el.setAttribute('placeholder', map[ph]);
    });

    // Select options
    root.querySelectorAll('select option').forEach(function (el) {
      var txt = el.textContent.trim();
      if (map[txt]) el.textContent = map[txt];
    });

    // Title tag
    if (root === document.body || root === document.documentElement) {
      var title = document.title;
      if (toEN) {
        document.title = title
          .replace('Propiedades en Venta', 'Properties for Sale')
          .replace('Propiedades en Arriendo', 'Properties for Rent')
          .replace('Alojamientos por Días', 'Vacation Rentals')
          .replace('Resultados de Búsqueda', 'Search Results')
          .replace('Invertir en Cartagena', 'Invest in Cartagena')
          .replace('Detalle de Propiedad', 'Property Detail')
          .replace('Contacto', 'Contact')
          .replace('Quiénes Somos', 'About Us')
          .replace('Mis Favoritos', 'My Favorites')
          .replace('Altorra Inmobiliaria', 'Altorra Real Estate');
      }
    }
  }

  // Placeholder translations
  var PLACEHOLDER_MAP = {
    '🔍 Buscar por palabra clave':    '🔍 Search by keyword',
    'Ciudad (ej. Cartagena)':         'City (e.g. Cartagena)',
    'Código (ej. c-p1)':              'Code (e.g. c-p1)',
    '$ Presupuesto':                  '$ Budget',
    'Buscar por nombre, email…':      'Search by name, email…',
    'Ej: Bocagrande':                 'E.g.: Bocagrande',
    'Cuéntanos sobre tu propiedad...': 'Tell us about your property...',
    'Escribe tu mensaje aquí...':     'Write your message here...',
  };
  var PLACEHOLDER_REVERSE = {};
  for (var pk in PLACEHOLDER_MAP) PLACEHOLDER_REVERSE[PLACEHOLDER_MAP[pk]] = pk;

  function translatePlaceholders(root) {
    var toEN = state.lang === 'en';
    var pmap = toEN ? PLACEHOLDER_MAP : PLACEHOLDER_REVERSE;
    root.querySelectorAll('[placeholder]').forEach(function (el) {
      var ph = el.getAttribute('placeholder');
      if (pmap[ph]) el.setAttribute('placeholder', pmap[ph]);
    });
  }

  function applyAll() {
    document.documentElement.setAttribute('lang', state.lang);
    translateNode(document.body);
    translatePlaceholders(document.body);
    updateToggleUI();
  }

  function setLang(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    if (state.lang === lang) return;
    // Restore to ES first if switching from EN to ES
    if (state.lang === 'en' && lang === 'es') {
      state.lang = 'es';
      setStoredLang('es');
      translateNode(document.body);
      translatePlaceholders(document.body);
      updateToggleUI();
      window.dispatchEvent(new CustomEvent('altorra:lang-changed', { detail: { lang: 'es' } }));
      return;
    }
    state.lang = lang;
    setStoredLang(lang);
    applyAll();
    window.dispatchEvent(new CustomEvent('altorra:lang-changed', { detail: { lang: lang } }));
  }

  function toggle() {
    setLang(state.lang === 'es' ? 'en' : 'es');
  }

  // ── Toggle UI ──
  function injectCSS() {
    if (document.getElementById('i18n-css')) return;
    var s = document.createElement('style');
    s.id = 'i18n-css';
    s.textContent = [
      '.lang-toggle{position:fixed;top:calc(var(--header-h,72px)+12px);right:12px;z-index:1200;',
      'display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.95);',
      'backdrop-filter:blur(8px);border:1px solid rgba(212,175,55,.35);border-radius:999px;',
      'padding:4px;box-shadow:0 4px 14px rgba(17,24,39,.10);font-family:Poppins,system-ui,sans-serif}',
      '.lang-toggle button{background:transparent;border:none;padding:5px 11px;font-size:.8rem;',
      'font-weight:700;color:#6b7280;cursor:pointer;border-radius:999px;font-family:inherit;',
      'letter-spacing:.5px;transition:background .15s,color .15s}',
      '.lang-toggle button.active{background:linear-gradient(135deg,#d4af37,#ffb400);color:#000}',
      '.lang-toggle button:not(.active):hover{color:#d4af37}',
      '@media(max-width:540px){.lang-toggle{top:auto;bottom:90px;right:12px}}'
    ].join('');
    document.head.appendChild(s);
  }

  function mountToggle() {
    if (document.getElementById('altorra-lang-toggle')) return;
    injectCSS();
    var wrap = document.createElement('div');
    wrap.className = 'lang-toggle';
    wrap.id = 'altorra-lang-toggle';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language selector');
    wrap.innerHTML =
      '<button type="button" data-lang="es" aria-label="Español">ES</button>' +
      '<button type="button" data-lang="en" aria-label="English">EN</button>';
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-lang]');
      if (!btn) return;
      setLang(btn.getAttribute('data-lang'));
    });
    document.body.appendChild(wrap);
    updateToggleUI();
  }

  function updateToggleUI() {
    var wrap = document.getElementById('altorra-lang-toggle');
    if (!wrap) return;
    wrap.querySelectorAll('button[data-lang]').forEach(function (b) {
      var active = b.getAttribute('data-lang') === state.lang;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  // ── Re-translate dynamically loaded content (header/footer/cards) ──
  function observeMutations() {
    var observer = new MutationObserver(function (muts) {
      if (state.lang === 'es') return;
      for (var i = 0; i < muts.length; i++) {
        for (var j = 0; j < muts[i].addedNodes.length; j++) {
          var node = muts[i].addedNodes[j];
          if (node.nodeType === 1) {
            translateNode(node);
            translatePlaceholders(node);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Init ──
  function init() {
    state.lang = detectLang();
    mountToggle();
    observeMutations();
    // Wait a tick for header/footer injection, then translate
    setTimeout(function () {
      if (state.lang !== 'es') applyAll();
    }, 500);
    // Also translate after components are loaded
    window.addEventListener('altorra:components-ready', function () {
      if (state.lang !== 'es') {
        setTimeout(function () { applyAll(); }, 100);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AltorraI18n = { t: t, setLang: setLang, toggle: toggle, getLang: function () { return state.lang; } };
})();
