/**
 * database.js — Altorra Inmobiliaria
 * Clase PropertyDatabase: fuente de datos unificada con doble origen.
 *
 * Jerarquía de carga:
 *   1. Cache localStorage (TTL 5 min) → respuesta inmediata al usuario
 *   2. Firestore (cuando window.db esté listo, timeout 6 s)
 *   3. properties/data.json (fallback estático — siempre funciona)
 *
 * Normalización:
 *   Tanto el schema de Firestore (titulo, habitaciones, operacion…)
 *   como el de data.json (title, beds, operation…) se convierten al
 *   formato unificado que el resto del frontend ya usa.
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
  const FB_TIMEOUT  = 6000;             // ms antes de caer a data.json
  const FALLBACK    = 'properties/data.json';
  const COLLECTION  = 'propiedades';

  // ── Mapeo operación: valores aceptados por página ─────────────────────────
  const OPERATION_MAP = {
    comprar:      ['comprar', 'venta', 'ventas', 'sell', 'sale'],
    arrendar:     ['arrendar', 'arriendo', 'alquiler', 'alquilar', 'renta', 'rent'],
    alojamientos: ['dias', 'por_dias', 'alojar', 'alojamientos', 'temporada', 'vacacional', 'noche'],
  };

  // ── Normalización Firestore → formato unificado ───────────────────────────
  // El resto del JS usa los campos de data.json (title, beds, operation…).
  // Los documentos Firestore usan nombres en español (titulo, habitaciones, operacion…).
  // Esta función convierte Firestore → formato existente para no romper nada.
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
      // Marcar origen para debug
      _source: 'firestore',
    };
  }

  // ── Normalización data.json → formato unificado ───────────────────────────
  function normalizeFromJSON(p) {
    return { ...p, _source: 'json' };
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

    const q = query(
      collection(window.db, COLLECTION),
      where('disponible', '==', true),
      orderBy('prioridad', 'desc'),
      limit(100)                        // máx 100 documentos — tier gratuito
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => normalizeFromFirestore({ id: d.id, ...d.data() }));
  }

  // ── Carga desde data.json (fallback) ─────────────────────────────────────
  async function loadFromJSON() {
    const res = await fetch(FALLBACK, { cache: 'no-store' });
    if (!res.ok) throw new Error('data.json HTTP ' + res.status);
    const data = await res.json();
    return (Array.isArray(data) ? data : [])
      .filter(p => p.available !== 0)
      .map(normalizeFromJSON);
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

    // ── Carga con fallback en 3 niveles ──────────────────────────────────────
    async load(forceRefresh = false) {
      // 1. Cache fresca
      if (!forceRefresh) {
        const cached = cacheRead();
        if (cached && cached.length) {
          this._data   = cached;
          this._loaded = true;
          this._ready();
          // Revalidar en background desde Firestore (sin bloquear)
          this._refreshInBackground();
          return this;
        }
      }

      // 2. Intentar Firestore (si window.db ya existe)
      if (window.db) {
        try {
          const props = await Promise.race([
            loadFromFirestore(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), FB_TIMEOUT)),
          ]);
          this._data = props;
          cacheWrite(props);
          this._loaded = true;
          this._ready();
          return this;
        } catch (err) {
          console.warn('[PropertyDB] Firestore no disponible, usando data.json:', err.message);
        }
      } else {
        // Firestore todavía no está listo — esperar el evento y cargar en background
        this._waitForFirebaseAndRefresh();
      }

      // 3. Fallback: data.json
      try {
        const props    = await loadFromJSON();
        this._data     = props;
        this._loaded   = true;
        // No cachear JSON para que Firestore pueda sobreescribir limpiamente
        this._ready();
      } catch (err) {
        console.error('[PropertyDB] Error crítico cargando datos:', err);
        this._data   = [];
        this._loaded = true;
        this._ready();
      }

      return this;
    }

    // ── Refrescar en background cuando Firebase esté listo ───────────────────
    _waitForFirebaseAndRefresh() {
      const handler = async () => {
        if (!window.db) return;
        try {
          const props = await Promise.race([
            loadFromFirestore(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), FB_TIMEOUT)),
          ]);
          if (props.length) {
            this._data = props;
            cacheWrite(props);
            this._notify();
            window.dispatchEvent(new CustomEvent('altorra:db-refreshed'));
          }
        } catch (_) {}
      };
      window.addEventListener('altorra:firebase-ready', handler, { once: true });
    }

    _refreshInBackground() {
      if (!window.db) {
        this._waitForFirebaseAndRefresh();
        return;
      }
      loadFromFirestore()
        .then(props => {
          if (!props.length) return;
          cacheWrite(props);
          this._data = props;
          this._notify();
          window.dispatchEvent(new CustomEvent('altorra:db-refreshed'));
        })
        .catch(() => {});
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

  console.log('[PropertyDB] Módulo cargado ✅');
})();
