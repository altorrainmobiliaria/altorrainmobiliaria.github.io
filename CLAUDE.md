# CLAUDE.md — Altorra Inmobiliaria
## Guía maestra para la transformación a plataforma dinámica con Firebase

> **Documento vivo.** Actualizar cuando cambien decisiones de arquitectura, schema o convenciones.
> Última actualización: 2026-04-09

---

## ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Estado actual del repositorio](#2-estado-actual-del-repositorio)
3. [Arquitectura de referencia — Altorra Cars](#3-arquitectura-de-referencia--altorra-cars)
4. [Schema Firestore + Config Firebase](#4-schema-firestore--config-firebase)
5. [Plan de migración por etapas](#5-plan-de-migración-por-etapas)
6. [Convenciones de código y reglas del proyecto](#6-convenciones-de-código-y-reglas-del-proyecto)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 ¿Qué es Altorra Inmobiliaria?

Sitio web de una inmobiliaria colombiana con sede en Cartagena. Actualmente es una **web 100% estática** alojada en GitHub Pages con dominio personalizado `altorrainmobiliaria.co`. Los datos de propiedades viven en un archivo JSON local (`properties/data.json`) que se edita manualmente y se commitea a GitHub.

### 1.2 El problema

- Agregar o editar una propiedad requiere hacer un commit a GitHub.
- No existe panel de administración.
- Los formularios de contacto dependen de un tercero (FormSubmit).
- Los favoritos solo existen en `localStorage` del navegador (se pierden al cambiar de dispositivo).
- No hay autenticación de usuarios.
- Las imágenes OG se generan en GitHub Actions solo cuando cambia `data.json`.
- No hay analytics en tiempo real ni historial de leads.

### 1.3 El objetivo

Transformar Altorra Inmobiliaria en una **plataforma dinámica** usando el mismo stack de **Altorra Cars** (Firebase + Firestore + Cloud Functions + GitHub Actions), pero:

- **Manteniendo el diseño actual** (paleta dorada, Poppins, layout de tarjetas, toda la esencia visual).
- **Mejorando la tecnología sin romper la experiencia** del usuario actual.
- **Añadiendo capacidades comerciales y de marketing** que hoy no existen.

### 1.4 Stack objetivo

```
Frontend          → HTML + Vanilla JS (sin frameworks, igual que hoy)
Base de datos     → Firestore (Firebase)
Autenticación     → Firebase Authentication
Almacenamiento    → Cloud Storage (imágenes de propiedades)
Funciones         → Cloud Functions (Node.js) — emails, OG, SEO
Hosting           → GitHub Pages (se mantiene) + Firebase Hosting (alternativa futura)
CI/CD             → GitHub Actions (regeneración de páginas SEO)
Analytics         → Google Analytics 4 + eventos Firestore
```

### 1.5 Repositorios relevantes

| Repo | URL | Rol |
|---|---|---|
| Altorra Inmobiliaria | `altorrainmobiliaria/altorrainmobiliaria.github.io` | Este repo — el que se migra |
| Altorra Cars | `altorracars/altorracars.github.io` | **Referencia arquitectónica** — copiar patrones |

---

## 2. ESTADO ACTUAL DEL REPOSITORIO

### 2.1 Estructura de archivos

```
altorrainmobiliaria.github.io/
├── .github/workflows/
│   └── og-publish.yml          # Genera /p y /og cuando cambia data.json
├── css/
│   └── whatsapp-float.css
├── js/
│   ├── analytics.js            # Analytics sin cookies (solo localStorage)
│   ├── cache-manager.js        # Legacy
│   ├── favoritos.js            # Favoritos en localStorage + badge nav
│   ├── form-validation.js      # Validación formularios en tiempo real
│   ├── listado-propiedades.js  # Filtrado/búsqueda/paginación de listados
│   ├── performance.js          # Legacy
│   ├── smart-search.js         # Búsqueda con typos + sinónimos + presupuesto
│   └── utils.js                # Utilidades: formatCOP, WhatsApp, toast, caché
├── og/                         # Imágenes OG 1200×630 (generadas por Actions)
├── p/                          # Páginas redirect con metadatos OG (generadas)
├── properties/
│   └── data.json               # FUENTE ÚNICA DE VERDAD — será reemplazada por Firestore
├── snippets/
│   ├── detalle-share.html
│   └── inject-jsonld.html
├── tools/
│   ├── generate_og_pages.js    # Script Node.js que genera /p y /og
│   └── og.config.json          # baseUrl: "https://altorrainmobiliaria.co"
├── header.html                 # Header inyectado dinámicamente
├── footer.html                 # Footer inyectado dinámicamente
├── header-footer.js            # Sistema de inyección con caché 7 días
├── scripts.js                  # Script principal: carruseles, reviews, buscador, JSON-LD
├── style.css                   # CSS principal con variables y diseño
├── service-worker.js           # PWA: network-first HTML/JS, SWR CSS, cache-first IMG
├── manifest.json               # PWA manifest
├── reviews.json                # 10 reseñas Google Maps (estáticas)
├── index.html                  # Home
├── propiedades-comprar.html    # Listado venta
├── propiedades-arrendar.html   # Listado arriendo
├── propiedades-alojamientos.html # Listado por días
├── detalle-propiedad.html      # Detalle de propiedad (query param ?id=)
├── contacto.html               # Formulario + generador mensaje WhatsApp
├── publicar-propiedad.html     # Formulario para publicar (solo email hoy)
├── favoritos.html              # Favoritos guardados
├── quienes-somos.html
├── privacidad.html
├── gracias.html                # Post-envío formulario
├── servicios-mantenimiento.html
├── servicios-mudanzas.html
├── 404.html
├── sitemap.xml
├── robots.txt
└── CNAME                       # altorrainmobiliaria.co
```

### 2.2 Diseño y estilos — NO TOCAR

Variables CSS en `style.css` que definen la identidad visual. **Estas NO se cambian:**

```css
:root {
  --gold:     #d4af37;   /* Color principal — oro elegante */
  --accent:   #ffb400;   /* Amarillo acentuado — botones CTA */
  --bg:       #ffffff;
  --text:     #111827;
  --muted:    #6b7280;
  --header-h: 72px;
  --page-max: 1200px;
  --card-r:   18px;
  --card-p:   12px;
  --card-gap: 16px;
}
```

- **Tipografía:** `Poppins` (300, 500, 700, 800) desde Google Fonts.
- **Paleta:** Fondo blanco, texto casi negro (`#111827`), oro como color de marca.
- **Footer:** Background `#0b0b0b` (negro profundo), grid 4 columnas.
- **Tarjetas:** `border-radius: 18px`, `hover: translateY(-4px)`, shadow suave.
- **Botón primario:** Gradient `--gold → --accent`, texto `#000`.

### 2.3 Schema actual de propiedad (`properties/data.json`)

```json
{
  "id":             "101-27",
  "title":          "Apartamento exclusivo en venta - Edificio Allure",
  "city":           "Cartagena",
  "type":           "apartamento",
  "operation":      "comprar",
  "price":          5350000000,
  "beds":           4,
  "baths":          5,
  "sqm":            240,
  "image":          "/allure/allure.webp",
  "images":         ["..."],
  "available":      1,
  "admin_fee":      230000,
  "neighborhood":   "Bocagrande",
  "strata":         4,
  "garages":        2,
  "floor":          17,
  "year_built":     2018,
  "features":       ["Aire Acondicionado", "Balcón", "Vista al mar"],
  "coords":         { "lat": 10.402567, "lng": -75.552746 },
  "description":    "Exclusivo apartamento...",
  "featured":       1,
  "highlightScore": 95,
  "added":          "2025-01-15",
  "shareImage":     "/allure/share.webp"
}
```

**Propiedades actuales en data.json (5 total):**

| ID | Título | Operación | Precio COP |
|---|---|---|---|
| 101-27 | Apartamento Allure, Bocagrande | comprar | 5.350.000.000 |
| 102-11402 | Milán Amoblado | comprar | 386.000.000 |
| 103-B305 | Trevi - Serena | comprar | 565.000.000 |
| 104-01 | Casa Country | comprar | 380.000.000 |
| 105-4422 | Milán Moderno | comprar | 350.000.000 |

### 2.4 JavaScript clave — qué hace cada archivo

| Archivo | Función principal |
|---|---|
| `header-footer.js` | Inyecta header/footer con caché localStorage 7 días |
| `scripts.js` | Carruseles home, reseñas, buscador rápido, JSON-LD Organization |
| `js/listado-propiedades.js` | Carga `data.json`, filtra, pagina (9 por página), renderiza tarjetas |
| `js/smart-search.js` | Búsqueda con typos (Levenshtein), sinónimos, presupuesto semántico |
| `js/favoritos.js` | localStorage favoritos + badge contador en nav |
| `js/utils.js` | `formatCOP()`, `buildWhatsAppLink()`, `showToast()`, `getJSONCached()` |
| `js/form-validation.js` | Validación en tiempo real (email, tel Colombia, nombre) |
| `js/analytics.js` | Eventos en localStorage: page_view, whatsapp_click, time_on_page |

### 2.5 Formularios actuales

| Formulario | Proveedor | Destino |
|---|---|---|
| Contacto (`contacto.html`) | FormSubmit | `info@altorrainmobiliaria.co` |
| Publicar propiedad | FormSubmit | `info@altorrainmobiliaria.co` |
| Contactar sobre propiedad (`detalle-propiedad.html`) | FormSubmit | `info@altorrainmobiliaria.co` |

**Todos se migrarán a Firestore** (colección `solicitudes`) + Cloud Function que envía email.

### 2.6 Limitaciones actuales (lo que no puede hacer)

| Limitación | Impacto de negocio |
|---|---|
| Sin panel admin | Publicar/editar propiedad requiere Git |
| Sin autenticación | No hay usuarios ni roles |
| Sin BD dinámica | No hay historial de leads ni contactos |
| Sin imágenes en la nube | Fotos viven en el repo (pesa y es lento) |
| Favoritos solo locales | Se pierden al cambiar de dispositivo |
| Sin analytics real | No sabe cuántos visitan, qué buscan |
| Sin push notifications | No puede avisar al admin de nuevos leads |
| Búsqueda carga TODO el JSON | No escala con muchas propiedades |
| Sin SEO dinámico | Páginas OG solo se regeneran con commits |

---

## 3. ARQUITECTURA DE REFERENCIA — ALTORRA CARS

> Altorra Cars (`altorracars/altorracars.github.io`) es la versión avanzada del mismo concepto pero para vehículos. Está completamente integrada con Firebase. **Copiar sus patrones exactamente**, adaptando campos y nombres al dominio inmobiliario.

### 3.1 Stack completo de Altorra Cars

```
Frontend:          HTML + Vanilla JS (sin frameworks)
Firebase SDK:      v12.9.0 (módulos ES via CDN)
Base de datos:     Firestore (colecciones principales)
Autenticación:     Firebase Authentication (email + contraseña)
Almacenamiento:    Cloud Storage (imágenes de vehículos)
Funciones:         Cloud Functions Node.js (us-central1)
Tiempo real:       Firebase Realtime Database (presencia/sesiones)
Analytics:         Google Analytics 4 (medición ID en config)
CI/CD:             GitHub Actions (generación páginas SEO)
Linting:           Biome + ESLint + TypeScript (solo build-time)
```

### 3.2 Estructura de archivos de Cars (patrón a replicar)

```
altorracars.github.io/
├── js/
│   ├── firebase-config.js      ← CRÍTICO: inicialización Firebase con lazy loading
│   ├── database.js             ← CRÍTICO: clase VehicleDatabase (→ PropertyDatabase)
│   ├── main.js                 ← Script principal de home
│   ├── render.js               ← Renderizado de tarjetas
│   ├── components.js           ← Inyección dinámica de header/footer/modals
│   ├── cache-manager.js        ← Sistema de caché inteligente 3 capas
│   ├── admin-auth.js           ← Autenticación y RBAC del admin
│   ├── admin-vehicles.js       ← CRUD de vehículos (→ CRUD propiedades)
│   ├── contact-forms.js        ← Formularios → Firestore colección `solicitudes`
│   ├── favorites-manager.js    ← Favoritos con Firebase sync
│   ├── filtros-avanzados.js    ← Filtros laterales en listados
│   └── toast.js                ← Notificaciones toast
├── snippets/
│   ├── header.html             ← Header inyectado (sin caché localStorage, usa fetch)
│   ├── footer.html
│   └── modals.html             ← Modals de contacto inyectados globalmente
├── functions/
│   └── index.js                ← Cloud Functions: emails, SEO, user management
├── scripts/
│   ├── generate-vehicles.mjs   ← Genera páginas SEO desde Firestore
│   └── upload-to-firestore.mjs ← Sube datos JSON inicial a Firestore
├── .github/workflows/
│   └── generate-vehicles.yml   ← CI/CD: genera páginas SEO automáticamente
├── firebase.json               ← Config Firebase (rules paths, functions source)
├── firestore.rules             ← Reglas de seguridad Firestore
├── storage.rules               ← Reglas Cloud Storage
├── database.rules.json         ← Reglas Realtime Database
└── package.json                ← Firebase v12.9.0 como única dep de producción
```

### 3.3 Inicialización Firebase (`firebase-config.js`) — patrón exacto

**Estrategia:** Carga prioritaria (Auth + Firestore críticos primero, el resto diferido).

```javascript
// Patrón de firebase-config.js de Cars — replicar en Inmobiliaria
(async function initFirebase() {
  // 1. Carga crítica: App + Auth + Firestore en paralelo
  const [{ initializeApp }, { getAuth }, { getFirestore, enableMultiTabIndexedDbPersistence }]
    = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js'),
    ]);

  const FIREBASE_CONFIG = {
    apiKey:            "...",
    authDomain:        "altorra-inmobiliaria.firebaseapp.com",
    databaseURL:       "https://altorra-inmobiliaria-default-rtdb.firebaseio.com",
    projectId:         "altorra-inmobiliaria",
    storageBucket:     "altorra-inmobiliaria.appspot.com",
    messagingSenderId: "...",
    appId:             "...",
    measurementId:     "G-XXXXXXXXXX"
  };

  window.firebaseApp = initializeApp(FIREBASE_CONFIG);
  window.auth        = getAuth(window.firebaseApp);
  window.db          = getFirestore(window.firebaseApp);

  // Persistencia offline multi-tab
  await enableMultiTabIndexedDbPersistence(window.db);

  // Asegura documento system/meta
  // (para caché inteligente — ver sección cache-manager)

  // 2. Carga diferida: Storage, Functions, Analytics, RTDB
  Promise.all([
    import('https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js'),
    import('https://www.gstatic.com/firebasejs/12.9.0/firebase-functions.js'),
    import('https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js'),
    import('https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js'),
  ]).then(([storageM, functionsM, analyticsM, rtdbM]) => {
    window.storage           = storageM.getStorage(window.firebaseApp);
    window.functions         = functionsM.getFunctions(window.firebaseApp, 'us-central1');
    window.firebaseAnalytics = analyticsM.getAnalytics(window.firebaseApp);
    window.rtdb              = rtdbM.getDatabase(window.firebaseApp);
  });

  // Helper de debug para limpiar caché
  window.clearFirestoreCache = async () => { /* terminar Firestore + limpiar IndexedDB */ };
})();
```

**Variables globales expuestas:** `window.db`, `window.auth`, `window.storage`, `window.functions`, `window.firebaseAnalytics`, `window.rtdb`

### 3.4 Clase Database (`database.js`) — patrón VehicleDatabase → PropertyDatabase

Cars usa una clase `VehicleDatabase` con estos patrones. En Inmobiliaria se crea `PropertyDatabase`:

```javascript
class PropertyDatabase {
  constructor() {
    this.properties  = [];  // cache local
    this.brands      = [];  // en inmobiliaria: no aplica
    this._listeners  = [];
    this._realtime   = false;
  }

  // Carga con fallback: localStorage (5min TTL) → Firestore (6s timeout)
  async load(forceRefresh = false) { ... }

  // Actualización en tiempo real con onSnapshot
  startRealtime() { ... }
  stopRealtime()  { ... }
  onChange(cb)    { this._listeners.push(cb); }

  // Filtros (equivalente a filter() de Cars):
  filter(filters) {
    // filters: { operacion, tipo, ciudad, barrio, precioMin, precioMax,
    //            habitacionesMin, banosMin, sqmMin, sqmMax, destacado, search }
  }

  // Ranking (equivalente calculateRankingScore de Cars):
  calculateRankingScore(prop) {
    let score = 0;
    if (prop.prioridad)      score += prop.prioridad * 100;
    if (prop.featured)       score += 1000;
    if (prop.highlightScore) score += prop.highlightScore;
    // bonus por recientes, precio, etc.
    return score;
  }

  getPropertyById(id)    { ... }
  getRankedProperties()  { ... }
  getUniqueCities()      { ... }
  getUniqueTypes()       { ... }
  getPriceRange()        { ... }
}

window.propertyDB = new PropertyDatabase();
```

**Cache key:** `altorra:properties:v1` (localStorage, TTL 5 min)

### 3.5 Sistema de caché inteligente 3 capas (`cache-manager.js`)

Cars usa un sistema de 3 capas que detecta cambios tanto de admin como de deploys:

```
L1: Memory (Map JS)          — más rápido, se pierde al recargar
L2: IndexedDB                — persiste entre sesiones
L3: localStorage             — solo DB cache (altorra-db-cache)
```

**Dos señales de invalidación:**
1. `Firestore system/meta.lastModified` → onSnapshot → invalida inmediatamente en todas las tabs
2. `deploy-info.json` → polling cada 10 min → invalida si versión cambió (GitHub Actions actualiza este archivo)

**API pública:**
```javascript
AltorraCache.get(key)
AltorraCache.set(key, value)
AltorraCache.invalidate()
AltorraCache.clearAndReload()  // nuclear: limpia todo y recarga
AltorraCache.markFresh(ts)
```

### 3.6 Renderizado de tarjetas (`render.js`) — estructura HTML

```html
<!-- Template de tarjeta de propiedad (adaptar de vehicle-card) -->
<div class="property-card clickable-card" data-id="{{id}}">
  <div class="property-image">
    <div class="img-skeleton"></div>
    <img class="property-img" src="{{image}}" loading="lazy" alt="{{title}}">
    <div class="property-actions">
      <button class="fav-btn" data-id="{{id}}">♡</button>
    </div>
    <div class="property-badges">
      <!-- badge destacado, badge operacion -->
    </div>
  </div>
  <div class="property-info">
    <h3 class="property-title">{{title}}</h3>
    <p class="property-specs">{{beds}}H · {{baths}}B · {{sqm}}m²</p>
    <div class="property-footer">
      <span class="property-price">$ {{precio formateado}}</span>
    </div>
  </div>
</div>
```

### 3.7 Inyección de componentes (`components.js`) — patrón Cars

Cars **no usa localStorage** para cachear header/footer. Usa `fetch()` simple + `Promise.all()`:

```javascript
async function loadAllComponents() {
  // Paralelo: header + footer
  await Promise.all([
    loadComponent('header-placeholder', 'snippets/header.html'),
    loadComponent('footer-placeholder', 'snippets/footer.html'),
  ]);

  // Condicional: modals (evita duplicar en páginas que ya los tienen)
  if (!document.querySelector('#contacto-modal')) {
    await loadComponent('modals-container', 'snippets/modals.html');
    loadDynamicAssets(['css/contact-forms.css', 'js/contact-forms.js']);
  }
}
```

**Diferencia con Inmobiliaria actual:** `header-footer.js` usa caché de 7 días en localStorage. En la migración se adopta el patrón Cars (sin caché JS, el navegador cachea por HTTP headers).

### 3.8 Formularios → Firestore (`contact-forms.js`)

Cars envía todos los formularios a la colección `solicitudes` en Firestore:

```javascript
// Estructura de documento en `solicitudes`
{
  nombre:       "Juan Pérez",
  telefono:     "+573001234567",
  email:        "juan@example.com",
  tipo:         "contacto_propiedad",   // o "publicar_propiedad", "solicitud_avaluo", etc.
  origen:       "detalle-propiedad",
  estado:       "pendiente",
  createdAt:    serverTimestamp(),
  datosExtra: {
    propiedadId:  "101-27",
    propiedadTitulo: "Apartamento Allure",
    mensaje:     "Me interesa...",
  },
  requiereCita: false
}
```

Una **Cloud Function** (`onNewSolicitud`) escucha esta colección y envía email al admin via Gmail SMTP (Nodemailer).

### 3.9 Cloud Functions (`functions/index.js`) — 6 funciones clave

| Función | Trigger | Qué hace |
|---|---|---|
| `onNewSolicitud` | Firestore create `solicitudes/{id}` | Email al admin: nuevo lead |
| `onSolicitudStatusChanged` | Firestore update `solicitudes/{id}` | Email al cliente: estado cambió |
| `onPropertyChange` | Firestore write `propiedades/{id}` | Dispara GitHub Actions para regenerar SEO |
| `triggerSeoRegeneration` | HTTPS callable | Super admin regenera SEO manualmente |
| `createManagedUserV2` | HTTPS callable | Crea usuario admin con rol |
| `deleteManagedUserV2` | HTTPS callable | Elimina usuario admin |

**Secrets necesarios en Firebase:**
- `GITHUB_PAT` — para disparar GitHub Actions desde Cloud Functions
- `EMAIL_USER` — cuenta Gmail del remitente
- `EMAIL_PASS` — app password de Gmail

### 3.10 GitHub Actions (`generate-vehicles.yml`) — patrón CI/CD

```yaml
# Triggers del workflow de generación SEO en Cars
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 */4 * * *'       # Cada 4 horas
  repository_dispatch:
    types: [vehicle-changed]    # Disparado por Cloud Function onPropertyChange
  workflow_dispatch:             # Manual desde GitHub UI

# Pasos clave:
# 1. npm ci
# 2. node scripts/generate-vehicles.mjs  ← conecta a Firestore, genera /vehiculos/*.html
# 3. Valida sitemap.xml
# 4. Si hay cambios: bump deploy-info.json + cache version
# 5. git commit "[skip ci]" + push
```

**Para Inmobiliaria:** El script se llamará `generate-properties.mjs` y generará `/p/*.html`.

### 3.11 Seguridad Firestore — Reglas RBAC

Roles del sistema (colección `usuarios`):

| Rol | Permisos |
|---|---|
| `super_admin` | Todo: crear, editar, eliminar, gestionar usuarios |
| `editor` | Crear y editar propiedades (con control de versiones `_version`) |
| `viewer` | Solo lectura de datos autenticados |

**Control de versiones optimista (`_version`):**
```javascript
// Al crear: _version debe ser 1
// Al actualizar: _version debe ser resource._version + 1
// Previene conflictos de edición simultánea
```

**Colecciones públicas** (read: true):
- `propiedades` — el catálogo
- `marcas` / equivalente
- `resenas` — reseñas

**Colecciones privadas** (solo admin):
- `usuarios` — perfiles y roles
- `concesionarios` / equivalente

**Colecciones de creación pública** (formularios):
- `solicitudes` — leads y contactos (create: true, read: isAuthenticated)
- `citas` — citas (create: true)

### 3.12 Autenticación admin (`admin-auth.js`)

```
Flujo de login:
1. Verificar loginAttempts (Firestore) — bloqueo tras 5 intentos fallidos
2. signInWithEmailAndPassword() — Firebase Auth
3. Cargar perfil usuarios/{uid} — obtener rol
4. Verificar estado de bloqueo en usuarios + loginAttempts
5. applyRolePermissions() — mostrar/ocultar UI según rol

Seguridad adicional:
- Timeout de sesión: 8 horas (SESSION_MAX_MS)
- Inactividad: 30 min con advertencia de 1 min antes
- 2FA: SMS con confianza de 30 días
- Presencia en tiempo real: RTDB
```

### 3.13 Generación de páginas SEO (`generate-vehicles.mjs`)

El script:
1. Conecta a Firestore con `GOOGLE_APPLICATION_CREDENTIALS`
2. Descarga todos los documentos de `vehiculos` (filtra `disponible: true`)
3. Lee template HTML (`detalle-vehiculo.html`) y reemplaza placeholders
4. Inyecta: canonical URL, Open Graph tags, JSON-LD (Car schema), `<noscript>` con datos para crawlers, variable `PRERENDERED_VEHICLE_ID`
5. Escribe archivos en `/vehiculos/marca-modelo-year-id.html`
6. Regenera `sitemap.xml`

**Para Inmobiliaria:** El script genera `/p/ID.html` y actualiza `sitemap.xml`. El JSON-LD usa `RealEstateListing` schema (ya implementado).

### 3.14 Deploy info y versioning

Cars usa `data/deploy-info.json` para comunicar al frontend cuándo hay una nueva versión:

```json
{
  "version": "2026-02-13T23:16:21.000Z",
  "commit":  "abc1234"
}
```

GitHub Actions actualiza este archivo en cada deploy. El `cache-manager.js` lo lee cada 10 minutos y fuerza recarga si la versión cambió.
