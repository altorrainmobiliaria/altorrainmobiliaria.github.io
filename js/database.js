/**
 * database.js — Altorra Inmobiliaria
 * Clase PropertyDatabase: fuente de datos 100% Firestore, sin fallback estático.
 *
 * Jerarquía de carga:
 *   1. Cache localStorage (TTL 5 min) → respuesta inmediata al usuario
 *      y revalidación en background desde Firestore
 *   2. Firestore (cuando window.db esté listo)
 *
 * Normalización:
 *   Los documentos Firestore usan nombres en español (titulo, habitaciones,
 *   operacion…). Esta función los convierte al formato unificado (title, beds,
 *   operation…) que el resto del frontend ya usa.
 *
 * Uso:
 *   const db = await window.propertyDB.load();
 *   const results = db.filter({ operacion: 'comprar', precioMax: 500000000 });
 *
 * Eventos emitidos en window:
 *   altorra:db-ready       → PropertyDatabase lista para usar
 *   altorra:db-refreshed   → datos actualizados desde Firestore en background
 */

(function () {
  'use strict';

  const CACHE_KEY   = 'altorra:properties:v1';
  const CACHE_TTL   = 1000 * 60 * 5;   // 5 minutos
  const FB_TIMEOUT  = 8000;             // ms máximo esperando Firestore
  const COLLECTION  = 'propiedades';

  // ── Mapeo operación: valores aceptados por página ─────────────────────────
  const OPERATION_MAP = {
    comprar:      ['comprar', 'venta', 'ventas', 'sell', 'sale'],
    arrendar:     ['arrendar', 'arriendo', 'alquiler', 'alquilar', 'renta', 'rent'],
    alojamientos: ['dias', 'por_dias', 'alojar', 'alojamientos', 'temporada', 'vacacional', 'noche'],
  };

  // ── Normalización Firestore → formato unificado ───────────────────────────
  // El resto del JS usa los campos que antes venían de data.json (title, beds,
  // operation…). Los documentos Firestore usan nombres en español (titulo,
  // habitaciones, operacion…). Esta función los traduce.
  function normalizeFromFirestore(doc) {
    const p = { ...doc };
    return {
      id:             p.id             || '',
      title:          p.titulo         || p.title || '',
      city:           p.ciudad         || p.city  || 'Cartagena',
      type:           p.tipo           || p.type  || 'apartamento',
      operation:      p.operacion      || p.operation || 'comprar',
      price:          p.precio         || p.price || 0,
      beds:           p.habitaciones   ?? p.beds  ?? null,
      baths:          p.banos          ?? p.baths ?? null,
      sqm:            p.sqm            ?? null,
      sqm_terreno:    p.sqm_terreno    ?? null,
      image:          p.imagen         || p.image || '',
      images:         p.imagenes       || p.images || [],
      shareImage:     p.imagen_og      || p.shareImage || '',
      available:      p.disponible !== undefined
                        ? (p.disponible ? 1 : 0)
                        : (p.available !== undefined ? p.available : 1),
      admin_fee:      p.admin_fee      ?? null,
      neighborhood:   p.barrio         || p.neighborhood || '',
      strata:         p.estrato        ?? p.strata ?? null,
      garages:        p.garajes        ?? p.garages ?? null,
      floor:          p.piso           ?? p.floor ?? null,
      year_built:     p.ano_construccion ?? p.year_built ?? null,
      features:       p.features       || [],
      description:    p.descripcion    || p.description || '',
      coords:         p.coords         || null,
      featured:       p.featured ? 1 : 0,
      highlightScore: p.prioridad      ?? p.highlightScore ?? 0,
      amoblado:       p.amoblado       || false,
      estado:         p.estado         || 'disponible',
      slug:           p.slug           || '',
      _version:       p._version       || 1,
      // Fechas: Firestore Timestamp → ISO string
      added: (() => {
        if (p.createdAt && typeof p.createdAt.toDate === 'function') {
          return p.createdAt.toDate().toISOString().slice(0, 10);
        }
        if (p.added) return p.added;
        return null;
      })(),
      _source: 'firestore',
    };
  }

  // ── Caché localStorage ────────────────────────────────────────────────────
  function cacheRead() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.t || !obj.data) return null;
      if (Date.now() - obj.t > CACHE_TTL) return null;
      return obj.data;
    } catch (_) { return null; }
  }

  function cacheWrite(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data }));
    } catch (_) {}
  }

  function cacheClear() {
    try { localStorage.removeItem(CACHE_KEY); } catch (_) {}
  }

  // ── Carga desde Firestore ─────────────────────────────────────────────────
  async function loadFromFirestore() {
    const { collection, getDocs, query, where, limit, orderBy } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

    // Query preferida: solo disponibles ordenadas por prioridad
    try {
      const q = query(
        collection(window.db, COLLECTION),
        where('disponible', '==', true),
        orderBy('prioridad', 'desc'),
        limit(100)                        // máx 100 documentos — tier gratuito
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => normalizeFromFirestore({ id: d.id, ...d.data() }));
    } catch (err) {
      // Si no hay índice compuesto aún, caer a query simple (sin orderBy)
      console.warn('[PropertyDB] Query con índice falló, usando query simple:', err.message);
      const q2 = query(
        collection(window.db, COLLECTION),
        where('disponible', '==', true),
        limit(100)
      );
      const snap = await getDocs(q2);
      return snap.docs
        .map(d => normalizeFromFirestore({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.highlightScore || 0) - (a.highlightScore || 0));
    }
  }

  // ── Espera a que window.db esté listo ─────────────────────────────────────
  function waitForFirestore(timeoutMs = FB_TIMEOUT) {
    return new Promise((resolve, reject) => {
      if (window.db) return resolve();
      let done = false;
      const onReady = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        window.removeEventListener('altorra:firebase-ready', onReady);
        reject(new Error('Firebase no inicializado tras ' + timeoutMs + ' ms'));
      }, timeoutMs);
      window.addEventListener('altorra:firebase-ready', onReady, { once: true });
    });
  }

  // ── Score de ranking ──────────────────────────────────────────────────────
  function calculateRankingScore(p) {
    let score = 0;
    if (p.featured)        score += 1000;
    if (p.highlightScore)  score += (p.highlightScore || 0) * 10;
    // Bonus por recientes (últimos 30 días)
    if (p.added) {
      const days = (Date.now() - new Date(p.added).getTime()) / 86400000;
      if (days < 30) score += Math.max(0, 30 - days) * 5;
    }
    return score;
  }

  // ── Clase principal ───────────────────────────────────────────────────────
  class PropertyDatabase {
    constructor() {
      this._data       = [];     // todos los datos normalizados
      this._loaded     = false;
      this._listeners  = [];     // callbacks onChange
    }

    // Exponer los datos para consumidores que iteran sobre toda la lista
    get properties() { return this._data; }

    // ── Carga desde Firestore con cache warm-start ──────────────────────────
    async load(forceRefresh = false) {
      // 1. Warm-start desde cache si está fresca → revalida en background
      if (!forceRefresh) {
        const cached = cacheRead();
        if (cached && cached.length) {
          this._data   = cached;
          this._loaded = true;
          this._ready();
          this._refreshInBackground();
          return this;
        }
      }

      // 2. Firestore (única fuente de verdad)
      try {
        await waitForFirestore();
        const props = await loadFromFirestore();
        this._data = props;
        cacheWrite(props);
      } catch (err) {
        console.error('[PropertyDB] Error cargando desde Firestore:', err);
        // Sin fallback: si Firestore falla, partimos vacío (catálogo dinámico)
        this._data = [];
      }

      this._loaded = true;
      this._ready();
      return this;
    }

    _refreshInBackground() {
      (async () => {
        try {
          await waitForFirestore();
          const props = await loadFromFirestore();
          cacheWrite(props);
          this._data = props;
          this._notify();
          window.dispatchEvent(new CustomEvent('altorra:db-refreshed'));
        } catch (_) { /* silencio: la cache ya cubrió la UI */ }
      })();
    }

    _ready() {
      window.dispatchEvent(new CustomEvent('altorra:db-ready'));
    }

    _notify() {
      this._listeners.forEach(cb => { try { cb(this._data); } catch (_) {} });
    }

    // ── API pública ───────────────────────────────────────────────────────────

    /** Callback llamado cuando los datos se actualizan desde Firestore */
    onChange(cb) { this._listeners.push(cb); }

    /** Propiedad por ID */
    getById(id) {
      return this._data.find(p => String(p.id) === String(id)) || null;
    }

    /** Propiedades ordenadas por ranking */
    getRanked() {
      return this._data
        .slice()
        .sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a));
    }

    /** Ciudades únicas presentes en el catálogo */
    getUniqueCities() {
      return [...new Set(this._data.map(p => p.city).filter(Boolean))].sort();
    }

    /** Tipos únicos presentes en el catálogo */
    getUniqueTypes() {
      return [...new Set(this._data.map(p => p.type).filter(Boolean))].sort();
    }

    /** Rango de precios {min, max} */
    getPriceRange() {
      const prices = this._data.map(p => p.price || 0).filter(Boolean);
      if (!prices.length) return { min: 0, max: 0 };
      return { min: Math.min(...prices), max: Math.max(...prices) };
    }

    /**
     * Filtrar propiedades
     * @param {Object} filters
     *   operacion   'comprar' | 'arrendar' | 'alojamientos'
     *   tipo        string — tipo de inmueble
     *   ciudad      string — búsqueda parcial
     *   barrio      string — búsqueda parcial
     *   precioMin   number
     *   precioMax   number
     *   habitacionesMin number
     *   banosMin    number
     *   sqmMin      number
     *   sqmMax      number
     *   destacado   boolean
     *   search      string — texto libre
     *   sort        'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'sqm-desc'
     */
    filter(filters = {}) {
      const {
        operacion,
        tipo,
        ciudad,
        barrio,
        precioMin,
        precioMax,
        habitacionesMin,
        banosMin,
        sqmMin,
        sqmMax,
        destacado,
        search,
        sort = 'relevance',
      } = filters;

      let arr = this._data.slice();

      // Operación (acepta tanto el valor exacto como los aliases del mapa)
      if (operacion) {
        const valid = OPERATION_MAP[operacion] || [operacion];
        arr = arr.filter(p => {
          const op = String(p.operation || '').toLowerCase().trim();
          return valid.includes(op);
        });
      }

      // Tipo
      if (tipo) arr = arr.filter(p => p.type === tipo);

      // Ciudad (parcial, insensible a mayúsculas)
      if (ciudad) {
        const q = ciudad.toLowerCase();
        arr = arr.filter(p => (p.city || '').toLowerCase().includes(q));
      }

      // Barrio (parcial)
      if (barrio) {
        const q = barrio.toLowerCase();
        arr = arr.filter(p => (p.neighborhood || '').toLowerCase().includes(q));
      }

      // Precio
      if (precioMin != null && !isNaN(precioMin)) {
        arr = arr.filter(p => (p.price || 0) >= Number(precioMin));
      }
      if (precioMax != null && !isNaN(precioMax)) {
        arr = arr.filter(p => (p.price || 0) <= Number(precioMax));
      }

      // Habitaciones
      if (habitacionesMin != null && !isNaN(habitacionesMin)) {
        arr = arr.filter(p => (p.beds || 0) >= Number(habitacionesMin));
      }

      // Baños
      if (banosMin != null && !isNaN(banosMin)) {
        arr = arr.filter(p => (p.baths || 0) >= Number(banosMin));
      }

      // m²
      if (sqmMin != null && !isNaN(sqmMin)) {
        arr = arr.filter(p => (p.sqm || 0) >= Number(sqmMin));
      }
      if (sqmMax != null && !isNaN(sqmMax)) {
        arr = arr.filter(p => (p.sqm || 0) <= Number(sqmMax));
      }

      // Solo destacadas
      if (destacado) arr = arr.filter(p => !!p.featured);

      // Búsqueda de texto libre
      if (search && search.trim()) {
        const terms = search.trim().toLowerCase().split(/\s+/);
        arr = arr.filter(p => {
          const haystack = [
            p.title, p.description, p.city, p.type,
            p.neighborhood, p.id, (p.features || []).join(' '),
          ].join(' ').toLowerCase();
          return terms.every(t => haystack.includes(t));
        });
      }

      // Ordenamiento
      switch (sort) {
        case 'price-asc':
          arr.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-desc':
          arr.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'newest':
          arr.sort((a, b) => new Date(b.added || '2000-01-01') - new Date(a.added || '2000-01-01'));
          break;
        case 'sqm-desc':
          arr.sort((a, b) => (b.sqm || 0) - (a.sqm || 0));
          break;
        default: // 'relevance'
          arr.sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a));
      }

      return arr;
    }

    /** Forzar recarga limpia (invalida cache) */
    async refresh() {
      cacheClear();
      return this.load(true);
    }

    /** Total de propiedades cargadas */
    get count() { return this._data.length; }

    /** ¿Están los datos listos? */
    get isLoaded() { return this._loaded; }
  }

  // ── Instancia global + auto-arranque ─────────────────────────────────────
  window.propertyDB = new PropertyDatabase();

  // Arrancar carga tan pronto como el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.propertyDB.load());
  } else {
    window.propertyDB.load();
  }

  console.log('[PropertyDB] Módulo cargado ✅ (fuente única: Firestore)');
})();
