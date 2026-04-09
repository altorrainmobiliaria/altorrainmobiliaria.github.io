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

---

## 4. SCHEMA FIRESTORE + CONFIG FIREBASE PARA INMOBILIARIA

### 4.1 Proyecto Firebase

```
Nombre del proyecto:  altorra-inmobiliaria
Project ID:           altorra-inmobiliaria
Region:               us-central1 (para Cloud Functions)
```

### 4.2 Colecciones Firestore

#### Colección: `propiedades`

Documento ID: el campo `id` de la propiedad (ej. `"101-27"`)

```javascript
{
  // ── Identificación ──────────────────────────────────────
  id:             "101-27",            // string — clave única
  titulo:         "Apartamento exclusivo - Edificio Allure",
  slug:           "apartamento-allure-bocagrande-101-27",  // para URL SEO

  // ── Clasificación ────────────────────────────────────────
  tipo:           "apartamento",       // apartamento | casa | lote | oficina | bodega | local
  operacion:      "comprar",           // comprar | arrendar | dias
  estado:         "disponible",        // disponible | reservado | vendido | arrendado

  // ── Ubicación ────────────────────────────────────────────
  ciudad:         "Cartagena",
  barrio:         "Bocagrande",
  direccion:      "Av. San Martín #...",  // opcional, puede omitirse por privacidad
  coords:         { lat: 10.402567, lng: -75.552746 },
  estrato:        4,

  // ── Características ──────────────────────────────────────
  precio:         5350000000,          // COP, entero
  admin_fee:      230000,              // Cuota administración mensual COP
  habitaciones:   4,                   // == beds anterior
  banos:          5,                   // == baths anterior
  sqm:            240,                 // m² construidos
  sqm_terreno:    null,                // m² de terreno (para casas/lotes)
  garajes:        2,
  piso:           17,
  estaciones:     1,                   // parqueaderos
  ano_construccion: 2018,
  amoblado:       true,                // bool

  // ── Multimedia ───────────────────────────────────────────
  imagen:         "https://storage.googleapis.com/.../101-27/main.webp",  // thumbnail
  imagenes:       [                    // array de URLs (Cloud Storage)
    "https://storage.googleapis.com/.../101-27/1.webp",
    "https://storage.googleapis.com/.../101-27/2.webp",
  ],
  imagen_og:      "https://storage.googleapis.com/.../101-27/og.jpg",  // 1200×630

  // ── Features (amenidades) ────────────────────────────────
  features: [
    "Aire Acondicionado", "Balcón", "Ascensor",
    "Piscina", "Portería/Vigilancia", "Vista al mar"
  ],

  // ── Texto ────────────────────────────────────────────────
  descripcion:    "Exclusivo apartamento en el corazón de Bocagrande...",

  // ── SEO / Ranking ────────────────────────────────────────
  featured:       true,                // bool — propiedad destacada
  prioridad:      95,                  // 0-100 — score de relevancia manual
  disponible:     true,                // bool — visible en el catálogo

  // ── Metadata Firestore ───────────────────────────────────
  createdAt:      Timestamp,           // serverTimestamp()
  updatedAt:      Timestamp,           // serverTimestamp() en cada edición
  _version:       1,                   // control optimista de versiones
  creadoPor:      "uid-del-admin",     // UID del editor que lo creó
}
```

**Migración de campos existentes:**
| Campo en data.json | Campo en Firestore | Notas |
|---|---|---|
| `title` | `titulo` | Renombrado |
| `operation` | `operacion` | Renombrado |
| `beds` | `habitaciones` | Renombrado |
| `baths` | `banos` | Renombrado |
| `available` | `disponible` | `1/0` → `true/false` |
| `featured` | `featured` | Mismo |
| `highlightScore` | `prioridad` | Mismo |
| `year_built` | `ano_construccion` | Renombrado |
| `admin_fee` | `admin_fee` | Mismo |
| `strata` | `estrato` | Renombrado |
| `garages` | `garajes` | Renombrado |
| `floor` | `piso` | Renombrado |
| `shareImage` | `imagen_og` | Renombrado |
| `added` | `createdAt` | String → Timestamp |

#### Subcolección: `propiedades/{id}/auditLog`

```javascript
{
  accion:    "update",          // create | update | delete
  campo:     "precio",
  antes:     386000000,
  despues:   400000000,
  usuario:   "uid-admin",
  timestamp: Timestamp
}
```

#### Colección: `solicitudes`

Leads y contactos de formularios. **Creación pública, lectura solo admin.**

```javascript
{
  // ── Contacto ─────────────────────────────────────────────
  nombre:    "Juan Pérez",
  telefono:  "+573001234567",
  email:     "juan@example.com",

  // ── Clasificación ────────────────────────────────────────
  tipo:      "contacto_propiedad",
  // Valores: contacto_propiedad | publicar_propiedad | solicitud_avaluo |
  //          solicitud_juridica | solicitud_contable | otro

  origen:    "detalle-propiedad",   // página donde se originó
  estado:    "pendiente",           // pendiente | en_gestion | cerrado

  // ── Datos específicos ────────────────────────────────────
  datosExtra: {
    propiedadId:      "101-27",
    propiedadTitulo:  "Apartamento Allure",
    mensaje:          "Me interesa agendar una visita...",
    // Para publicar propiedad:
    tipoInmueble:     "apartamento",
    ciudad:           "Cartagena",
    precioAproximado: 500000000,
  },

  // ── Metadata ─────────────────────────────────────────────
  createdAt:    Timestamp,
  updatedAt:    Timestamp,
  emailSent:    false,        // flag de idempotencia para Cloud Function
  requiereCita: false,
}
```

#### Colección: `resenas`

```javascript
{
  autor:      "María García",
  rating:     5,              // 1-5
  texto:      "Excelente servicio, muy profesionales...",
  fecha:      "2025-03-15",
  fuente:     "google",       // google | directo
  activa:     true,
  orden:      1,              // para ordenar en pantalla
}
```

#### Colección: `usuarios`

Solo accesible por super_admin. Perfil extendido de Firebase Auth.

```javascript
{
  // Document ID = Firebase Auth UID
  nombre:    "Admin Altorra",
  email:     "admin@altorrainmobiliaria.co",
  rol:       "super_admin",   // super_admin | editor | viewer
  activo:    true,
  bloqueado: false,
  creadoEn:  Timestamp,
  creadoPor: "uid-super-admin",
}
```

#### Colección: `config`

Configuración global editable desde admin.

```javascript
// Document ID: "general"
{
  telefono_whatsapp: "573002439810",
  telefono_display:  "+57 300 243 9810",
  email_contacto:    "info@altorrainmobiliaria.co",
  instagram:         "https://www.instagram.com/altorrainmobiliaria",
  facebook:          "https://www.facebook.com/...",
  tiktok:            "https://www.tiktok.com/@altorrainmobiliaria",
  slogan:            "Gestión integral en soluciones inmobiliarias",
}

// Document ID: "counters"  (actualizado por editors)
{
  totalPropiedades: 5,
  totalCiudades: 1,
}
```

#### Colección: `system`

```javascript
// Document ID: "meta"
{
  lastModified: Timestamp   // Actualizado por admin al cambiar propiedades
                            // cache-manager.js lo escucha con onSnapshot
}
```

#### Colección: `loginAttempts`

```javascript
// Document ID: hash del email
{
  intentos:  3,
  bloqueado: false,
  ultimoIntento: Timestamp,
}
```

### 4.3 Reglas de seguridad Firestore

Copiar exactamente de Cars, adaptando nombres de colecciones:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function hasProfile() {
      return request.auth != null
        && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid));
    }
    function getUserRole() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol;
    }
    function isSuperAdmin()    { return hasProfile() && getUserRole() == 'super_admin'; }
    function isEditorOrAbove() { return hasProfile() && getUserRole() in ['super_admin', 'editor']; }
    function isAuthenticated() { return hasProfile(); }

    // Control optimista de versiones
    function validVersion() {
      return request.resource.data._version == resource.data._version + 1
          || (resource.data._version == null && request.resource.data._version == 1);
    }
    function validCreateVersion() {
      return request.resource.data._version == 1;
    }

    // ── PROPIEDADES ──────────────────────────────────────────────
    match /propiedades/{propId} {
      allow read: if true;   // catálogo público
      allow create: if isSuperAdmin() || (isEditorOrAbove() && validCreateVersion());
      allow update: if isSuperAdmin() || (isEditorOrAbove() && validVersion());
      allow delete: if isSuperAdmin();

      match /auditLog/{logId} {
        allow read:   if isAuthenticated();
        allow create: if isEditorOrAbove();
        allow delete: if isSuperAdmin();
      }
    }

    // ── SOLICITUDES ──────────────────────────────────────────────
    match /solicitudes/{solicitudId} {
      allow read:          if isAuthenticated();
      allow create:        if true;   // formularios públicos pueden crear
      allow update, delete: if isSuperAdmin();
    }

    // ── RESEÑAS ──────────────────────────────────────────────────
    match /resenas/{resenaId} {
      allow read:   if true;
      allow create, update: if isEditorOrAbove();
      allow delete: if isSuperAdmin();
    }

    // ── USUARIOS ─────────────────────────────────────────────────
    match /usuarios/{userId} {
      allow read:               if request.auth != null && (request.auth.uid == userId || isSuperAdmin());
      allow create, update, delete: if isSuperAdmin();
    }

    // ── CONFIG ───────────────────────────────────────────────────
    match /config/{docId} {
      allow read: if true;
      allow write: if isSuperAdmin()
        || (isEditorOrAbove() && docId == 'counters');
    }

    // ── SYSTEM ───────────────────────────────────────────────────
    match /system/{docId} {
      allow read: if true;
      allow write: if isEditorOrAbove()
        || !exists(/databases/$(database)/documents/system/$(docId));
    }

    // ── LOGIN ATTEMPTS ────────────────────────────────────────────
    match /loginAttempts/{emailHash} {
      allow read, create, update: if true;
      allow delete:               if isSuperAdmin();
    }

    // ── AUDIT LOG GLOBAL ─────────────────────────────────────────
    match /auditLog/{logId} {
      allow read:   if isAuthenticated();
      allow create: if isEditorOrAbove();
      allow delete: if isSuperAdmin();
    }

    // ── DEFAULT: DENEGAR TODO ────────────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 4.4 `firebase.json`

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": ["node_modules", ".git"]
    }
  ]
}
```

### 4.5 Storage Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Imágenes de propiedades: lectura pública, escritura solo admin autenticado
    match /propiedades/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Multimedia general
    match /multimedia/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4.6 `package.json`

```json
{
  "name": "altorra-inmobiliaria",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "generate": "node scripts/generate-properties.mjs",
    "upload":   "node scripts/upload-to-firestore.mjs",
    "backup":   "node scripts/backup-firestore.mjs"
  },
  "dependencies": {
    "firebase": "^12.9.0"
  },
  "devDependencies": {
    "firebase-admin": "^13.0.0",
    "sharp": "^0.33.0"
  }
}
```

### 4.7 `data/deploy-info.json`

```json
{
  "version": "2026-04-09T00:00:00.000Z",
  "commit":  "initial"
}
```

Actualizado automáticamente por GitHub Actions en cada deploy.

### 4.8 Cloud Functions requeridas (`functions/index.js`)

| Función | Trigger | Prioridad |
|---|---|---|
| `onNewSolicitud` | Firestore create `solicitudes/{id}` | **Alta** — email al admin |
| `onSolicitudStatusChanged` | Firestore update | Media — email al cliente |
| `onPropertyChange` | Firestore write `propiedades/{id}` | **Alta** — regenera SEO |
| `triggerSeoRegeneration` | HTTPS callable | Alta — manual desde admin |
| `createManagedUserV2` | HTTPS callable | Alta — crear admins |
| `deleteManagedUserV2` | HTTPS callable | Media |
| `updateUserRoleV2` | HTTPS callable | Media |

**Secrets en Firebase:**
```
GITHUB_PAT    = Personal Access Token con permiso repo + workflow
EMAIL_USER    = info@altorrainmobiliaria.co (o cuenta Gmail de relay)
EMAIL_PASS    = App password de Gmail
```

---

## 5. PLAN DE MIGRACIÓN POR ETAPAS

> Cada etapa debe estar completamente funcional antes de avanzar a la siguiente.
> La web nunca debe quedar rota para el usuario final.

### ETAPA 0 — Preparación Firebase (sin cambios al frontend)

**Objetivo:** Crear el proyecto Firebase y subir los datos actuales.

**Tareas:**
- [ ] Crear proyecto Firebase `altorra-inmobiliaria`
- [ ] Activar Firestore, Authentication, Storage, Functions, Analytics, RTDB
- [ ] Crear archivo `firebase.json`, `firestore.rules`, `storage.rules`
- [ ] Crear `scripts/upload-to-firestore.mjs` — migrar las 5 propiedades de `data.json` a Firestore
- [ ] Crear `data/deploy-info.json`
- [ ] Crear colección `system/meta` con `lastModified: now`
- [ ] Crear primer usuario super_admin en Firebase Auth + `usuarios/{uid}`
- [ ] Verificar reglas Firestore con Firebase Emulator

**Archivos nuevos:**
```
firebase.json
firestore.rules
storage.rules
package.json
data/deploy-info.json
scripts/upload-to-firestore.mjs
scripts/backup-firestore.mjs
```

---

### ETAPA 1 — Firebase Config + PropertyDatabase (lectura dinámica)

**Objetivo:** El frontend lee propiedades de Firestore en lugar de `data.json`. El usuario no nota ningún cambio visual.

**Tareas:**
- [ ] Crear `js/firebase-config.js` (patrón Cars sección 3.3)
- [ ] Crear `js/database.js` — clase `PropertyDatabase` (patrón Cars sección 3.4)
- [ ] Crear `js/cache-manager.js` — caché 3 capas (patrón Cars sección 3.5)
- [ ] Modificar `js/listado-propiedades.js` — reemplazar `fetch('properties/data.json')` por `window.propertyDB.load()` + `propertyDB.filter()`
- [ ] Modificar `scripts.js` — reemplazar carga de JSON por `propertyDB`
- [ ] Añadir `<script type="module" src="js/firebase-config.js">` a todas las páginas HTML
- [ ] Verificar que los 3 listados (comprar/arrendar/días) y el home siguen funcionando
- [ ] Mantener `properties/data.json` como backup mientras se valida

**Páginas afectadas:** `index.html`, `propiedades-comprar.html`, `propiedades-arrendar.html`, `propiedades-alojamientos.html`, `detalle-propiedad.html`

**Criterio de éxito:** El sitio carga propiedades desde Firestore sin cambios visuales.

---

### ETAPA 2 — Formularios → Firestore + Cloud Functions email

**Objetivo:** Los formularios de contacto dejan de usar FormSubmit y guardan leads en Firestore. El admin recibe email automáticamente.

**Tareas:**
- [ ] Crear `functions/index.js` con `onNewSolicitud` (email al admin via Nodemailer/Gmail)
- [ ] Configurar secrets: `EMAIL_USER`, `EMAIL_PASS` en Firebase
- [ ] Crear `js/contact-forms.js` (patrón Cars) — envía a colección `solicitudes`
- [ ] Modificar `contacto.html` — reemplazar `<form action="formsubmit...">` por JS submit
- [ ] Modificar `detalle-propiedad.html` — idem
- [ ] Modificar `publicar-propiedad.html` — idem, tipo `publicar_propiedad`
- [ ] Mantener redirección a `gracias.html` post-envío (no cambia para el usuario)
- [ ] Añadir `onSolicitudStatusChanged` (email al cliente cuando admin actualiza estado)

**Criterio de éxito:** Al enviar cualquier formulario, el lead aparece en Firestore Console y llega email al admin.

---

### ETAPA 3 — Panel de Administración

**Objetivo:** Crear `admin.html` — panel donde el admin puede gestionar propiedades sin tocar código.

**Tareas:**
- [ ] Crear `admin.html` + `css/admin.css`
- [ ] Crear `js/admin-auth.js` — login con Firebase Auth, RBAC (patrón Cars sección 3.12)
- [ ] Crear `js/admin-properties.js` — CRUD de propiedades en Firestore
  - Listar todas las propiedades con estado
  - Crear nueva propiedad (formulario completo)
  - Editar propiedad existente (con control de versiones `_version`)
  - Marcar como disponible/reservado/vendido
  - Eliminar (solo super_admin)
- [ ] Crear `js/admin-leads.js` — ver y gestionar solicitudes/leads
- [ ] Crear `js/admin-users.js` — gestionar usuarios admin (via Cloud Functions)
- [ ] Implementar Cloud Functions: `createManagedUserV2`, `deleteManagedUserV2`
- [ ] Panel de reseñas — crear/editar/eliminar reseñas en Firestore
- [ ] Subida de imágenes a Cloud Storage desde el admin
- [ ] Rutas protegidas — si no autenticado, redirige a login

**Criterio de éxito:** El admin puede publicar una propiedad nueva desde el navegador y aparece en el sitio en menos de 5 minutos.

---

### ETAPA 4 — Imágenes en Cloud Storage

**Objetivo:** Las imágenes de propiedades se alojan en Cloud Storage en vez del repositorio Git.

**Tareas:**
- [ ] Crear estructura en Storage: `propiedades/{id}/{filename}.webp`
- [ ] Migrar imágenes existentes del repo a Cloud Storage
  - `allure/` → `propiedades/101-27/`
  - `fmia/` → `propiedades/102-11402/`
  - `serena/` → `propiedades/103-B305/`
  - `fotoprop/` → `propiedades/104-01/`
  - `Milan/` → `propiedades/105-4422/`
- [ ] Actualizar URLs en documentos Firestore
- [ ] Actualizar `admin-properties.js` — subida de imágenes a Storage con compresión (sharp o browser Canvas API)
- [ ] Eliminar carpetas de imágenes del repo Git después de verificar

**Criterio de éxito:** Las imágenes cargan desde Storage, el repo Git pesa mucho menos.

---

### ETAPA 5 — SEO Dinámico + GitHub Actions avanzado

**Objetivo:** Las páginas SEO `/p/*.html` se regeneran automáticamente cuando cambia una propiedad en Firestore.

**Tareas:**
- [ ] Crear `scripts/generate-properties.mjs` (patrón Cars `generate-vehicles.mjs`)
  - Conecta a Firestore con `GOOGLE_APPLICATION_CREDENTIALS`
  - Descarga todas las propiedades con `disponible: true`
  - Genera `/p/{id}.html` con OG tags + JSON-LD `RealEstateListing` + redirect
  - Genera imágenes OG 1200×630 con Sharp (ya existe en `tools/generate_og_pages.js`)
  - Regenera `sitemap.xml` con todas las URLs
- [ ] Actualizar `.github/workflows/og-publish.yml`:
  - Añadir trigger `repository_dispatch: [property-changed]`
  - Añadir trigger `schedule: '0 */4 * * *'` (cada 4 horas)
  - Bump de `data/deploy-info.json` y version del Service Worker
- [ ] Crear Cloud Function `onPropertyChange` (patrón Cars) — debounce 5 min, dispara `repository_dispatch`
  - Secret: `GITHUB_PAT`
- [ ] Crear Cloud Function `triggerSeoRegeneration` (callable, solo super_admin)

**Criterio de éxito:** Al guardar una propiedad desde el admin, en ~5 minutos la página `/p/{id}.html` está actualizada con los nuevos datos.

---

### ETAPA 6 — Favoritos Sincronizados

**Objetivo:** Los favoritos se sincronizan entre dispositivos para usuarios autenticados (opcional: auth anónima de Firebase).

**Tareas:**
- [ ] Crear colección `favoritos` en Firestore (o subcolección `usuarios/{uid}/favoritos`)
- [ ] Modificar `js/favoritos.js` — si hay auth, sync con Firestore; si no, mantiene localStorage
- [ ] Usar Firebase Anonymous Auth para usuarios sin cuenta
- [ ] Pantalla `favoritos.html` — muestra favoritos desde Firestore en tiempo real

**Criterio de éxito:** Agregar una propiedad a favoritos en el móvil aparece en el desktop.

---

### ETAPA 7 — Analytics y Marketing

**Objetivo:** Métricas reales de comportamiento de usuarios.

**Tareas:**
- [ ] Integrar Google Analytics 4 (ya hay `measurementId` en firebase-config)
- [ ] Reemplazar `js/analytics.js` (localStorage) por `logEvent` de Firebase Analytics
- [ ] Crear dashboard en admin con métricas básicas:
  - Propiedades más vistas
  - Términos de búsqueda más populares
  - Leads por tipo de solicitud
  - Conversiones (views → contacto)
- [ ] Añadir `historial-visitas.js` (patrón Cars) — últimas propiedades vistas por el usuario
- [ ] Crear `js/featured-week-banner.js` (patrón Cars) — banner de propiedad destacada de la semana

---

### ETAPA 8 — Mejoras Comerciales Adicionales

**Objetivo:** Funcionalidades que aumentan la captación y conversión.

**Tareas:**
- [ ] **Simulador de crédito hipotecario** — adaptado de `js/simulador/` de Cars
  - Parámetros: precio, cuota inicial (%), plazo (años), tasa de interés
  - Muestra cuota mensual estimada
- [ ] **Comparador de propiedades** — seleccionar 2-3 propiedades y comparar specs
- [ ] **Notificaciones push** — Firebase Cloud Messaging para avisar nuevas propiedades
- [ ] **Newsletter / alertas de propiedades** — guardar búsqueda y recibir email cuando llegue propiedad que coincida
- [ ] **Mapa de propiedades** — Google Maps con markers de todas las propiedades disponibles (usando `coords` de Firestore)
- [ ] **Calculadora de avalúo básica** — formulario que genera lead de avalúo
- [ ] **Sistema de reseñas mejorado** — carga desde Firestore (colección `resenas`) en vez de `reviews.json`
- [ ] **Página de agentes/equipo** — con perfil de cada asesor y sus propiedades activas
- [ ] **WhatsApp Business API** (futuro) — notificaciones automáticas de leads al asesor

---

### Orden de prioridad recomendado

```
AHORA (fundamento):       Etapa 0 → 1 → 2
PRONTO (admin + imágenes): Etapa 3 → 4
DESPUÉS (SEO + sync):      Etapa 5 → 6
FUTURO (marketing):        Etapa 7 → 8
```

---

## 6. CONVENCIONES DE CÓDIGO Y REGLAS DEL PROYECTO

### 6.1 Reglas absolutas — NUNCA romper

```
❌ NO cambiar variables CSS (--gold, --accent, --bg, --text, --muted, --card-r, etc.)
❌ NO cambiar la tipografía Poppins
❌ NO cambiar colores de botones, badges o cards
❌ NO cambiar el layout general de ninguna página existente
❌ NO usar frameworks JS (React, Vue, Angular, Svelte) — Vanilla JS únicamente
❌ NO usar frameworks CSS (Tailwind, Bootstrap) — el style.css propio es suficiente
❌ NO commitear credenciales Firebase (apiKey, secrets) al repositorio
❌ NO hardcodear URLs — usar la colección config de Firestore o las variables CSS
❌ NO romper el service worker sin actualizar CACHE_NAME
❌ NO eliminar el archivo CNAME
```

### 6.2 Convenciones de nombres

**Archivos JavaScript:**
```
js/firebase-config.js     — inicialización Firebase
js/database.js            — clase PropertyDatabase
js/cache-manager.js       — caché 3 capas
js/render.js              — función renderPropertyCard()
js/components.js          — inyección header/footer/modals
js/admin-auth.js          — autenticación admin
js/admin-properties.js    — CRUD propiedades (admin)
js/admin-leads.js         — gestión de solicitudes (admin)
js/admin-users.js         — gestión de usuarios (admin)
js/contact-forms.js       — formularios → Firestore
js/favorites-manager.js   — favoritos con sync Firebase
js/toast.js               — notificaciones toast
```

**Colecciones Firestore (siempre en español, plural):**
```
propiedades      — catálogo de propiedades
solicitudes      — leads y formularios de contacto
resenas          — reseñas de clientes
usuarios         — perfiles y roles de admin
config           — configuración global
system           — metadatos internos (lastModified, etc.)
loginAttempts    — intentos fallidos de login
auditLog         — log de cambios (subcol. de propiedades)
```

**Variables globales (`window.*`):**
```javascript
window.db               // Firestore instance
window.auth             // Firebase Auth instance
window.storage          // Cloud Storage instance
window.functions        // Cloud Functions instance
window.firebaseAnalytics // Analytics instance
window.rtdb             // Realtime Database instance
window.propertyDB       // instancia de PropertyDatabase
window.AltorraCache     // cache manager API
window.AltorraUtils     // utilidades (ya existe)
window.AltorraFavoritos // favoritos (ya existe)
```

### 6.3 Convenciones de HTML

Todas las páginas deben tener esta estructura base:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title><!-- título de página --> | Altorra Inmobiliaria</title>
  <meta name="description" content="..."/>
  <link rel="canonical" href="https://altorrainmobiliaria.co/PAGINA.html"/>
  <link rel="manifest" href="manifest.json"/>
  <meta name="theme-color" content="#d4af37"/>

  <!-- Open Graph -->
  <meta property="og:title" content="..."/>
  <meta property="og:description" content="..."/>
  <meta property="og:url" content="https://altorrainmobiliaria.co/PAGINA.html"/>
  <meta property="og:image" content="..."/>
  <meta property="og:type" content="website"/>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700;800&display=swap" rel="stylesheet"/>

  <!-- CSS -->
  <link rel="stylesheet" href="style.css"/>

  <!-- Firebase (cargar primero en páginas que lo necesiten) -->
  <script type="module" src="js/firebase-config.js"></script>
</head>
<body>
  <!-- Skip link de accesibilidad -->
  <a href="#main" class="skip-link">Ir al contenido principal</a>

  <!-- Componentes dinámicos -->
  <div id="header-placeholder"></div>
  <div id="modals-container"></div>

  <main id="main">
    <!-- Contenido de la página -->
  </main>

  <div id="footer-placeholder"></div>

  <!-- WhatsApp flotante -->
  <a class="whatsapp-float" href="https://wa.me/573002439810" target="_blank" rel="noopener">
    <!-- SVG WhatsApp -->
  </a>

  <!-- Scripts -->
  <script src="js/components.js" defer></script>
  <!-- Scripts específicos de la página -->
</body>
</html>
```

### 6.4 Patrón de carga de Firebase en páginas públicas

```javascript
// Al inicio de cada script que necesite Firestore:
async function waitForDB() {
  return new Promise((resolve) => {
    if (window.propertyDB) return resolve(window.propertyDB);
    window.addEventListener('altorra:db-ready', () => resolve(window.propertyDB), { once: true });
  });
}

// Uso:
const db = await waitForDB();
const props = await db.filter({ operacion: 'comprar' });
```

**`database.js` dispara el evento** cuando está listo:
```javascript
window.dispatchEvent(new CustomEvent('altorra:db-ready'));
```

### 6.5 Patrón de formularios → Firestore

```javascript
// Patrón estándar para todos los formularios de contacto
async function submitContactForm(formData) {
  try {
    const { collection, addDoc, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

    await addDoc(collection(window.db, 'solicitudes'), {
      nombre:    formData.nombre,
      telefono:  formData.telefono,
      email:     formData.email,
      tipo:      formData.tipo,        // ver valores en sección 4.2
      origen:    window.location.pathname.replace('/', ''),
      estado:    'pendiente',
      createdAt: serverTimestamp(),
      datosExtra: formData.datosExtra || {},
      emailSent:    false,
      requiereCita: false,
    });

    // Redirigir a gracias.html (mantener comportamiento actual)
    window.location.href = '/gracias.html';
  } catch (err) {
    console.error('Error enviando formulario:', err);
    AltorraUtils.showToast('Error al enviar. Intenta de nuevo.', 'error');
  }
}
```

### 6.6 Patrón de control de versiones optimista

Siempre que un admin edite una propiedad:

```javascript
// Al crear:
{ ...datos, _version: 1, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }

// Al actualizar (con transacción para evitar conflictos):
await runTransaction(db, async (tx) => {
  const ref = doc(db, 'propiedades', id);
  const snap = await tx.get(ref);
  const current = snap.data();

  tx.update(ref, {
    ...cambios,
    _version:  current._version + 1,
    updatedAt: serverTimestamp(),
  });
});
```

### 6.7 Convenciones de imágenes

```
Cloud Storage path:  propiedades/{id}/{nombre}.webp
Formato preferido:   WebP (mejor compresión)
Thumbnail (imagen):  800×600 px aprox, < 150 KB
Imagen OG:           1200×630 px, JPEG calidad 85
Placeholder:         multimedia/placeholder-propiedad.jpg
```

**Al subir desde admin:**
1. Comprimir con Canvas API en el navegador antes de subir
2. Nombre: `{timestamp}-{random}.webp`
3. Guardar URL pública en el array `imagenes` del documento Firestore
4. La primera imagen del array es el `thumbnail` / `imagen`

### 6.8 Service Worker — actualización de versión

Cuando se despliega una nueva versión (GitHub Actions lo hace automáticamente):

```javascript
// service-worker.js — actualizar este valor en cada deploy:
const CACHE_NAME = 'altorra-pwa-v2';  // incrementar número
```

GitHub Actions actualiza `CACHE_NAME` automáticamente al detectar cambios (patrón Cars).

### 6.9 SEO — reglas de URLs

```
Home:                https://altorrainmobiliaria.co/
Listado comprar:     https://altorrainmobiliaria.co/propiedades-comprar.html
Listado arrendar:    https://altorrainmobiliaria.co/propiedades-arrendar.html
Listado días:        https://altorrainmobiliaria.co/propiedades-alojamientos.html
Detalle propiedad:   https://altorrainmobiliaria.co/detalle-propiedad.html?id={id}
Página OG/SEO:       https://altorrainmobiliaria.co/p/{id}.html
Admin:               https://altorrainmobiliaria.co/admin.html
```

**Nunca usar** query strings en URLs compartibles. La URL `/p/{id}.html` es la URL que se comparte en redes sociales — tiene todos los OG tags.

### 6.10 Seguridad — checklist de cada PR

Antes de hacer merge de cualquier cambio:

```
✅ No hay credenciales hardcodeadas (Firebase config OK si es pública, pero no secrets)
✅ Las reglas Firestore permiten solo lo necesario
✅ Los formularios tienen honeypot anti-spam
✅ Las rutas admin verifican rol antes de mostrar datos
✅ Las imágenes tienen alt text
✅ Los links externos tienen rel="noopener noreferrer"
✅ No se usa eval() ni innerHTML con datos de usuario sin escapar
✅ Los datos de Firestore se escapan antes de insertar en DOM
```

### 6.11 Performance — reglas base

```javascript
// Imágenes: siempre lazy loading excepto LCP (primera imagen visible)
<img loading="lazy" decoding="async" src="..." alt="...">

// Primera imagen de la página: preload
<link rel="preload" as="image" href="imagen-hero.webp">

// Scripts no críticos: defer o module
<script src="js/analytics.js" defer></script>
<script type="module" src="js/firebase-config.js"></script>

// No bloquear el hilo principal con queries Firestore grandes
// Usar paginación: limit(9) por defecto en listados
```

### 6.12 Teléfonos y contacto oficial

```
WhatsApp:  +57 300 243 9810  (wa.me/573002439810)
Teléfono:  +57 323 501 6747
Email:     info@altorrainmobiliaria.co
Dominio:   altorrainmobiliaria.co
```

### 6.13 Redes sociales oficiales

```
Instagram: https://www.instagram.com/altorrainmobiliaria
Facebook:  https://www.facebook.com/share/16MEXCeAB4/
TikTok:    https://www.tiktok.com/@altorrainmobiliaria
```

### 6.14 Rama de desarrollo

```
Producción:   main
Desarrollo:   claude/verify-domain-setup-LipU9 (rama actual)
Convención:   feature/nombre-feature, fix/nombre-bug, docs/nombre-doc
```

---

## APÉNDICE — Archivos a crear en la migración

Lista completa de archivos nuevos que se deben crear (no existen aún):

```
# Firebase Config
js/firebase-config.js
js/database.js          (PropertyDatabase)
js/cache-manager.js
js/render.js
js/components.js
js/contact-forms.js
js/toast.js
js/favorites-manager.js

# Admin
admin.html
css/admin.css
js/admin-auth.js
js/admin-properties.js
js/admin-leads.js
js/admin-users.js

# Snippets (reemplaza header.html/footer.html actuales)
snippets/header.html
snippets/footer.html
snippets/modals.html

# Cloud Functions
functions/index.js
functions/package.json

# Scripts Node.js
scripts/generate-properties.mjs
scripts/upload-to-firestore.mjs
scripts/backup-firestore.mjs

# Config Firebase
firebase.json
firestore.rules
storage.rules
data/deploy-info.json
package.json   (nuevo — hoy no existe)
```

---

*Fin del CLAUDE.md — Altorra Inmobiliaria v1.0*
