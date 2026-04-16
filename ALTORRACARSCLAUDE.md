# CLAUDE.md — Altorra Cars Knowledge Base

> Referencia unica para Claude. Evita reprocesos en parches, errores y mejoras.
> Ultima actualizacion: 2026-04-10

---

## 1. Arquitectura General

- **Tipo**: Sitio estatico (GitHub Pages) + Firebase backend
- **Dominio**: `altorracars.github.io` (sin dominio propio)
- **Repo**: `altorracars/altorracars.github.io`
- **Deploy**: Push a `main` → GitHub Pages auto-deploy
- **CI**: GitHub Actions genera paginas de vehiculos cada 4h desde Firestore
- **Negocio**: Compra/venta de carros usados en Cartagena, Colombia
- **Empresa**: ALTORRA Company SAS
- **Color brand**: `#b89658` (dorado)

### Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | HTML/CSS/JS vanilla (sin framework, sin bundler) |
| Backend | Firebase: Auth, Firestore, RTDB, Storage, Functions, Analytics |
| SDK | Firebase Compat SDK v11.3.0 (cargado desde CDN, NO modular) |
| Generacion | `scripts/generate-vehicles.mjs` (Node.js, Firebase modular SDK v12) |
| PWA | Service Worker + manifest.json + cache-manager.js (4 capas) |
| Iconos | Lucide Icons v0.468.0 via CDN (admin panel) |
| Linting | Biome 1.9.4 (`npm run lint`, `npm run format`) |
| Package | `npm run generate` ejecuta el generador de paginas |

---

## 2. Estructura Completa de Archivos

### Paginas HTML publicas

| Archivo | Proposito |
|---------|-----------|
| `index.html` | Homepage: hero, vehiculos destacados, marcas, categorias |
| `busqueda.html` | Catalogo completo con filtros avanzados |
| `detalle-vehiculo.html` | Template para paginas de vehiculo (usado por generate-vehicles.mjs) |
| `marca.html` | Pagina individual de marca (carga dinamica por query param o prerendered) |
| `marcas.html` | Listado de todas las marcas disponibles |
| `vehiculos-suv.html` | Catalogo filtrado: SUVs |
| `vehiculos-sedan.html` | Catalogo filtrado: sedanes |
| `vehiculos-pickup.html` | Catalogo filtrado: pickups |
| `vehiculos-hatchback.html` | Catalogo filtrado: hatchbacks |
| `vehiculos-camionetas.html` | Catalogo filtrado: camionetas |
| `vehiculos-nuevos.html` | Catalogo filtrado: vehiculos nuevos |
| `vehiculos-usados.html` | Catalogo filtrado: vehiculos usados |
| `comparar.html` | Comparador lado a lado de vehiculos |
| `simulador-credito.html` | Calculadora de financiamiento |
| `favoritos.html` | Vehiculos guardados por el usuario (localStorage) |
| `resenas.html` | Resenas/testimonios de clientes |
| `contacto.html` | Formulario de contacto general |
| `nosotros.html` | Pagina "Sobre nosotros" |
| `terminos.html` | Terminos y condiciones |
| `privacidad.html` | Politica de privacidad |
| `cookies.html` | Politica de cookies con banner de consentimiento |
| `404.html` | Pagina de error 404 personalizada |

### Paginas admin / internas

| Archivo | Proposito |
|---------|-----------|
| `admin.html` | Panel de administracion (SPA completa) |
| `admin-upload.html` | Subida de imagenes (auxiliar) |
| `google8d667a72b0e3536b.html` | Verificacion de Google Search Console |

### Directorios auto-generados

| Directorio | Contenido | Generado por |
|------------|-----------|-------------|
| `vehiculos/` | `{slug}.html` por vehiculo (ej: `chevrolet-equinox-ls-2018-1.html`) | generate-vehicles.mjs |
| `marcas/` | `{slug}.html` por marca (ej: `toyota.html`) | generate-vehicles.mjs |

### JavaScript — Sitio publico (`js/`)

| Archivo | Proposito |
|---------|-----------|
| `firebase-config.js` | Init Firebase app + Auth + Firestore + persistence + deferred SDKs |
| `components.js` | Header/footer dinamicos (fetch snippets), smooth scroll, loadModalsIfNeeded() |
| `database.js` | Lectura publica de Firestore: vehiculos, marcas, banners. Cache en localStorage |
| `render.js` | Renderizado de cards de vehiculos en el DOM |
| `contact-forms.js` | Modals: "Vende tu Auto" (wizard 3 pasos) + "Financiacion". Guarda en Firestore `solicitudes` |
| `contact.js` | Formulario de contacto general |
| `cache-manager.js` | Cache inteligente de 4 capas (Memory → IndexedDB → localStorage → SW) |
| `favorites-manager.js` | Gestion de favoritos en localStorage |
| `filtros-avanzados.js` | Filtros sidebar: marca, precio, year, km, tipo, categoria |
| `comparador.js` | Logica del comparador de vehiculos |
| `cookies.js` | Banner de consentimiento de cookies |
| `citas.js` | Formulario publico de solicitud de citas |
| `dynamic-lists.js` | Listados dinamicos de vehiculos por categoria/marca |
| `featured-week-banner.js` | Banner de vehiculo destacado de la semana |
| `historial-visitas.js` | Tracking de vehiculos visitados recientemente |
| `page-loader.js` | Animacion de carga de pagina |
| `performance.js` | Lazy loading de imagenes, IntersectionObserver |
| `reviews.js` | Renderizado publico de resenas |
| `simulador/` | Directorio con logica del simulador de credito |
| `toast.js` | Sistema de notificaciones toast |
| `main.js` | Punto de entrada general (legacy) |

### JavaScript — Panel admin (`js/admin-*.js`)

| Archivo | Proposito |
|---------|-----------|
| `admin-state.js` | Estado global `window.AP`, RBAC helpers, escapeHtml, closestAction, formatPrice, refreshIcons |
| `admin-auth.js` | Login, logout, 2FA, rate limiting, presencia RTDB, session timeout |
| `admin-sync.js` | Listeners realtime Firestore, migracion de schema, stats, cache invalidation |
| `admin-vehicles.js` | CRUD vehiculos, imagenes, drafts, wizard, drag-reorder destacados |
| `admin-brands.js` | CRUD de marcas |
| `admin-dealers.js` | Gestion de aliados/concesionarios |
| `admin-users.js` | Gestion de usuarios (solo super_admin) |
| `admin-appointments.js` | Gestion de citas/solicitudes |
| `admin-operations.js` | Registro de ventas, exportacion, deploy a GitHub |
| `admin-lists.js` | Leads |
| `admin-reviews.js` | Gestion de resenas |
| `admin-banners.js` | Gestion de banners promocionales |
| `admin-activity.js` | Visor de audit log |
| `admin-table-utils.js` | Paginacion, sort, search, export CSV para tablas |
| `admin-phase5.js` | Wizard avanzado, charts de actividad, theme toggle |

### CSS (`css/`)

| Archivo | Proposito |
|---------|-----------|
| `style.css` | Estilos principales del sitio publico |
| `dark-theme.css` | Variante dark mode |
| `admin.css` | Estilos del panel admin |
| `hero.css` | Hero banner de homepage |
| `contact-forms.css` | Modals de contacto/financiacion |
| `toast-notifications.css` | Notificaciones toast |
| `comparador.css` | Estilos del comparador |
| `calculadora-financiamiento.css` | Simulador de credito |
| `cookies.css` | Banner de cookies |
| `citas.css` | Formulario de citas |
| `reviews.css` | Seccion de resenas |
| `filtros-avanzados.css` | Filtros sidebar |
| `favorites-page.css` | Pagina de favoritos |
| `favorites-fix.css` | Fixes de favoritos |
| `favorites-empty-fullpage.css` | Estado vacio de favoritos |
| `featured-week-banner.css` | Banner vehiculo destacado |
| `featured-fixes.css` | Fixes de destacados |
| `vehicles-cards-fix.css` | Fixes de cards de vehiculos |
| `brands-fixes.css` | Fixes de paginas de marcas |
| `sidebar-filters-fix.css` | Fixes de sidebar |
| `footer-fixes.css` | Fixes de footer |
| `mobile-fixes.css` | Ajustes responsive mobile |
| `performance-fixes.css` | Optimizaciones CSS |
| `animaciones.css` | Animaciones y transiciones |
| `historial-visitas.css` | Widget de historial de visitas |
| `page-loader.css` | Animacion de carga |

### Snippets (`snippets/`)

Fragmentos HTML inyectados dinamicamente por `components.js`:

| Archivo | Contenido |
|---------|-----------|
| `header.html` | Navegacion principal, menu mobile, dropdowns de marcas/categorias |
| `footer.html` | Footer con links, redes sociales, info de contacto |
| `modals.html` | Modals de "Vende tu Auto" y "Financiacion" |
| `seo-meta.html` | Meta tags SEO reutilizables |

### Data (`data/`)

| Archivo | Contenido | Generado por |
|---------|-----------|-------------|
| `vehicle-slugs.json` | Mapa `{id: slug}` para URLs de vehiculos | generate-vehicles.mjs |
| `brand-slugs.json` | Mapa `{brandId: slug}` para URLs de marcas | generate-vehicles.mjs |
| `deploy-info.json` | `{version, sha, ref}` — señal de nuevo deploy | GitHub Actions |

### Multimedia (`multimedia/`)

| Directorio | Contenido |
|------------|-----------|
| `Logos/` | Logos de marcas de vehiculos |
| `banner/` | Banners de marca (ej: `b_toyota.png`, `b_chevrolet.png`) |
| `categories/` | Imagenes de categorias (SUV, sedan, pickup, etc.) |
| `heroes/` | Imagenes hero de paginas internas |
| `vehicles/` | Fotos de vehiculos subidas desde admin |
| `heroindex.webp` | Hero principal del homepage |
| `logo-placeholder.png` | Logo de Altorra Cars |
| `hero-car.jpg` | Imagen hero genérica |

### Archivos de configuracion raiz

| Archivo | Proposito |
|---------|-----------|
| `firebase.json` | Config de deploy Firebase (rules, functions) |
| `firestore.rules` | Reglas de seguridad Firestore |
| `database.rules.json` | Reglas de seguridad Realtime Database |
| `storage.rules` | Reglas de Firebase Storage |
| `package.json` | Scripts: `generate`, `lint`, `format`. Dep: firebase v12 |
| `manifest.json` | PWA manifest (standalone, es-CO, shortcuts) |
| `sitemap.xml` | Sitemap auto-generado |
| `robots.txt` | SEO: Allow + Disallow admin + Sitemap directive |
| `service-worker.js` | SW en raiz (scope: /) |
| `.nojekyll` | Evita procesamiento Jekyll en GitHub Pages |
| `.github/workflows/generate-vehicles.yml` | CI: genera paginas cada 4h |

### Cloud Functions (`functions/`)

| Archivo | Contenido |
|---------|-----------|
| `index.js` | Cloud Functions V2 + triggers Firestore + email via nodemailer |
| `package.json` | Node 22, firebase-admin v13, firebase-functions v7, nodemailer |

**Secrets requeridos**: `EMAIL_USER`, `EMAIL_PASS` (Gmail SMTP), `GITHUB_PAT`

### Otros directorios

| Directorio | Contenido |
|------------|-----------|
| `v/` | Paginas legacy de vehiculos por ID (backward compat) |
| `backups/` | Snapshots de Firestore |
| `public/` | `_redirects` (Netlify legacy, no usado en GitHub Pages) |
| `js/simulador/` | Logica del simulador de credito (simulator.js, ui.js, data.js, finance.js) |

### GitHub Actions (`.github/workflows/`)

| Workflow | Trigger | Accion |
|----------|---------|--------|
| `generate-vehicles.yml` | Push main, cron 4h, dispatch | Genera vehiculos + sitemap + bump cache |
| `deploy-firebase-rules.yml` | Push main (si cambian rules) | Deploy Firestore + Storage rules |

---

## 3. Firebase

### Config

```
Project ID: altorra-cars
Auth Domain: altorra-cars.firebaseapp.com
RTDB URL: https://altorra-cars-default-rtdb.firebaseio.com
Storage: altorra-cars.firebasestorage.app
```

### Deploy de reglas (manual, NO automatico)

```bash
firebase deploy --only firestore:rules
firebase deploy --only database
firebase deploy --only storage
firebase deploy --only functions
```

> Un cambio en las reglas del repo NO se aplica automaticamente a Firebase.
> Siempre desplegar manualmente despues de modificar reglas.

### SDK en el frontend

`firebase-config.js` carga el SDK compat v11.3.0 desde CDN en 2 fases:
1. **Critico** (bloquea login): firebase-app + firebase-auth + firebase-firestore
2. **Diferido** (background): firebase-storage + firebase-functions + firebase-analytics + firebase-database

Persistence habilitada: `db.enablePersistence({ synchronizeTabs: true })`

Objetos globales: `window.db`, `window.auth`, `window.storage`, `window.functions`, `window.rtdb`, `window.firebaseAnalytics`

Troubleshooting: `window.clearFirestoreCache()` limpia IndexedDB y recarga.

---

## 4. RBAC (Control de Acceso por Roles)

### Roles

| Rol | Permisos |
|-----|----------|
| `super_admin` | Acceso total. Gestiona usuarios, vehiculos, marcas, aliados, config |
| `editor` | Crea/edita vehiculos y marcas. No gestiona usuarios ni elimina |
| `viewer` | Solo lectura en panel admin |

### Helpers RBAC en admin-state.js

```javascript
AP.isSuperAdmin()           // rol === 'super_admin'
AP.isEditor()               // rol === 'editor'
AP.isViewer()               // rol === 'viewer'
AP.canManageUsers()         // solo super_admin
AP.canCreateOrEditInventory() // editor+
AP.canDeleteInventory()     // solo super_admin
AP.isEditorOrAbove()        // editor o super_admin
```

### Firestore Rules (resumen)

```
vehiculos/{id}       — read: public | create/update: editor+ (con _version) | delete: super_admin
usuarios/{uid}       — read: own doc OR super_admin | write: super_admin only
marcas/{id}          — read: public | write: editor+ (con _version)
banners/{id}         — read: public | write: editor+ (con _version)
solicitudes/{id}     — read: authenticated | create: public | update: editor+ | delete: super_admin
citas/{id}           — read: authenticated | create: public | update: editor+ | delete: super_admin
leads/{id}           — read: authenticated | create: public | delete: super_admin
resenas/{id}         — read: public | create/update: editor+ | delete: super_admin
concesionarios/{id}  — read: authenticated | write: super_admin only
loginAttempts/{hash} — read/write: public (rate limiting cross-device)
auditLog/{id}        — read: authenticated | create: editor+ | delete: super_admin (INMUTABLE)
config/{docId}       — read: public | write: varies (bookedSlots: public, counters: editor+)
system/{docId}       — read: public | write: editor+ (cache invalidation)
drafts_activos/{uid} — read/write: editor+ (own uid only)
```

### Optimistic Locking (`_version`)

- Editores DEBEN incrementar `_version` en cada update
- Super Admin puede editar SIN incrementar (bypass en rules)
- Creacion: `_version = 1`
- Update: `_version = resource.data._version + 1`
- Previene conflictos en edicion concurrente

### Cloud Functions (V2 — activas)

| Funcion | Guard | Accion |
|---------|-------|--------|
| `createManagedUserV2` | `verifySuperAdminV2` | Crea Auth user + doc en `usuarios/{uid}` |
| `deleteManagedUserV2` | `verifySuperAdminV2` + self-delete protection | Elimina doc + Auth user |
| `updateUserRoleV2` | `verifySuperAdminV2` | Actualiza rol, nombre en `usuarios/{uid}` |

### RTDB Rules (Realtime Database)

```json
{
  "presence": {
    ".read": "auth != null",
    ".indexOn": ["online"],
    "$sessionId": {
      ".write": "(!data.exists() && newData.child('uid').val() === auth.uid) || data.child('uid').val() === auth.uid",
      ".validate": "newData.hasChild('uid') && newData.child('uid').val() === auth.uid"
    }
  }
}
```

- Estructura: `/presence/{sessionId}` — un nodo por dispositivo/tab (no por usuario)
- Cada sesion se crea con `push()` y contiene campo `uid` para identificar al dueno
- `.read: auth != null` a nivel `/presence` permite que `loadActiveSessions()` lea todos los nodos
- `.indexOn: ["online"]` requerido por la query `orderByChild('online').equalTo(true)`
- `.write`: solo el dueno (`uid === auth.uid`) puede crear, actualizar o eliminar su sesion
- `.validate`: asegura que siempre exista campo `uid` y que coincida con auth
- `onDisconnect().remove()` elimina el nodo al desconectarse (desaparicion instantanea)
- **Deploy manual obligatorio**: `firebase deploy --only database` despues de cambiar reglas

### Checklist de no-regresion RBAC

Ejecutar despues de CUALQUIER cambio que toque auth, usuarios o Cloud Functions:

1. super_admin puede loguear y ver seccion de gestion de usuarios
2. super_admin puede crear usuario (rol editor)
3. Nuevo usuario aparece en la lista inmediatamente
4. super_admin puede editar rol (editor → viewer)
5. super_admin puede eliminar usuario
6. editor NO ve seccion de gestion de usuarios
7. viewer NO ve seccion de gestion de usuarios
8. editor PUEDE crear/editar vehiculos y marcas
9. editor NO puede eliminar vehiculos ni marcas
10. viewer solo lectura (sin botones de crear/editar/eliminar)
11. super_admin NO puede eliminarse a si mismo

---

## 5. Firestore Schema (Colecciones y Campos)

### vehiculos/{id}

| Campo | Tipo | Notas |
|-------|------|-------|
| marca | string | Nombre de la marca |
| modelo | string | Nombre del modelo |
| year | number | Ano del vehiculo |
| tipo | string | "nuevo" o "usado" |
| categoria | string | "suv", "sedan", "pickup", "hatchback", "camioneta" |
| precio | number | Precio de lista en COP |
| precioOferta | number | Precio promocional (opcional) |
| kilometraje | number | Kilometraje en km |
| transmision | string | "Manual", "Automatica" |
| combustible | string | "Gasolina", "Diesel", "Hibrido", "Electrico" |
| motor | string | Descripcion del motor |
| potencia | number | Caballos de fuerza |
| cilindraje | string | CC del motor |
| traccion | string | "Delantera", "Trasera", "4x4" |
| direccion | string | "Hidraulica", "Electrica" |
| color | string | Color del vehiculo |
| puertas | number | Default: 5 |
| pasajeros / asientos | number | Default: 5 |
| ubicacion | string | Default: "Cartagena" |
| placa | string | Placa o "Disponible al contactar" |
| codigoFasecolda | string | Codigo tecnico o "Consultar" |
| codigoUnico | string | `ALT-YYYYMM-XXXX` (auto-generado, inmutable, nunca reutilizado) |
| descripcion | string | Descripcion larga |
| estado | string | "disponible", "reservado", "vendido", "borrador" |
| imagen | string | URL imagen principal |
| imagenes | array | URLs de todas las imagenes |
| caracteristicas | array | ["ABS", "Aire acondicionado", ...] |
| destacado | boolean | Destacado en homepage |
| featuredOrder | number | Orden de destacado |
| featuredCutoutPng | string | URL imagen recortada PNG |
| oferta | boolean | Tiene precio promocional |
| prioridad | number | Prioridad de destacado (0-100) |
| concesionario | string | Referencia al aliado ("_particular" = consignacion) |
| consignaParticular | string | Nombre del dueno si es consignacion |
| revisionTecnica | boolean | Default: true |
| peritaje | boolean | Default: true |
| _version | number | Optimistic locking |
| createdAt | timestamp | Fecha de creacion |
| createdBy / createdByName | string | Quien lo creo |
| lastModifiedAt | timestamp | Ultima edicion |
| lastModifiedBy / lastModifiedByName | string | Quien lo edito |
| updatedAt | timestamp | Para lastmod en sitemap |

**Subcollection**: `vehiculos/{id}/auditLog/{logId}` — action, user, userName, timestamp, changes[]

### usuarios/{uid}

| Campo | Tipo |
|-------|------|
| uid | string (Firebase Auth UID) |
| email | string |
| nombre | string |
| rol | string ("super_admin", "editor", "viewer") |
| estado | string ("activo") |
| bloqueado | boolean |
| habilitado2FA | boolean |
| telefono2FA | string |
| prefijo2FA | string (default "+57") |
| trustedDevices | array |
| creadoEn / creadoPor | timestamp / string |

**Subcollection**: `usuarios/{uid}/drafts/{draftId}` — borradores de vehiculos en edicion

### solicitudes/{id} (sistema unificado de comunicaciones)

| Campo | Tipo |
|-------|------|
| nombre, telefono, email | string |
| prefijoPais | string (default "+57") |
| tipo | string ("consignacion_venta", "financiacion", "contacto_general") |
| origen | string ("vende_tu_auto", "financiacion", "form_contacto") |
| vehiculo | string |
| datosExtra | object (datos especificos del tipo) |
| comentarios | string |
| estado | string ("pendiente", "contactado", "completado", "rechazado") |
| observaciones | string (notas del admin) |
| createdAt | timestamp |

### Otras colecciones

| Coleccion | Campos clave |
|-----------|-------------|
| `marcas/{id}` | nombre, logo, descripcion, _version |
| `concesionarios/{id}` | nombre, telefono, responsable, direccion |
| `resenas/{id}` | nombre, calificacion (1-5), comentario, estado |
| `banners/{id}` | titulo, imagen, enlace, position, active, order, _version |
| `loginAttempts/{hash}` | email, intentos, bloqueado, ultimoIntento |
| `auditLog/{id}` | action, user, timestamp, details (INMUTABLE) |
| `config/counters` | vehicleCodeSeq (para codigoUnico) |
| `config/bookedSlots` | Disponibilidad de citas |
| `system/meta` | lastModified (senal de cache invalidation) |
| `drafts_activos/{uid}` | Borradores activos visibles para colaboracion |

---

## 6. Sistemas Clave

### 6.1 Pipeline Firestore → GitHub Pages

**Flujo**: Firestore (datos) → GitHub Actions → generate-vehicles.mjs → HTML estatico → GitHub Pages

**Triggers** (`.github/workflows/generate-vehicles.yml`):
1. Push a `main`
2. Cron cada 4 horas
3. `repository_dispatch` (webhook desde Cloud Function)
4. `workflow_dispatch` (manual desde GitHub UI)

**Que genera `generate-vehicles.mjs`**:
- `vehiculos/{slug}.html` — pagina por vehiculo con meta OG, Twitter Cards, JSON-LD (Car), noscript SEO
- `marcas/{slug}.html` — pagina por marca con listado de vehiculos, JSON-LD (AutoDealer)
- `data/vehicle-slugs.json` — mapa id→slug (inmutable, nunca se reutiliza un slug)
- `data/brand-slugs.json` — mapa brandId→slug
- `sitemap.xml` — con lastmod fijo para estaticas, dinamico para vehiculos

**Slugs**: `marca-modelo-year-id` normalizado (sin acentos, lowercase). Inmutables una vez creados.

**Variables inyectadas**: `PRERENDERED_VEHICLE_ID` y `PRERENDERED_BRAND_ID` en cada pagina generada para que el JS del frontend cargue datos sin query params.

**Post-generacion** (solo si hay cambios reales):
- `data/deploy-info.json` → `{version: "YYYYMMDDHHMMSS", sha, ref}`
- `service-worker.js` → bump `CACHE_VERSION`
- `js/cache-manager.js` → bump `APP_VERSION`
- Commit con `[skip ci]` para evitar loop recursivo

### 6.2 Cache de 4 Capas (`cache-manager.js`)

| Capa | Almacenamiento | Persistencia | Uso |
|------|---------------|-------------|-----|
| L1 | Memory (Map) | Session | Lectura rapida |
| L2 | IndexedDB (`app-data`, `cache-meta`) | Permanente | Entre sesiones |
| L3 | localStorage (`altorra-db-cache`) | Permanente | Usado por database.js |
| L4 | Service Worker Cache | Permanente | Assets estaticos |

**Dos senales de invalidacion:**

1. **Admin cambia datos** → `admin-sync.js` escribe `system/meta.lastModified` → cache-manager tiene listener realtime → `AltorraCache.invalidate()` limpia L1/L2/L3
2. **GitHub deploy** → `deploy-info.json` cambia → cache-manager lo poll cada 10 min → si version cambio → muestra banner "Nueva version disponible" → `AltorraCache.clearAndReload()` limpia TODO + recarga

**Grace period**: 30s despues de clearAndReload para evitar loop infinito de recargas.

**API publica**: `window.AltorraCache.get()`, `.set()`, `.invalidate()`, `.clearAndReload()`, `.validateWithFirestore()`, `.validateDeployVersion()`

### 6.3 Service Worker (`service-worker.js`)

| Tipo de request | Estrategia |
|----------------|-----------|
| `.json` | Network Only (siempre fresco) |
| HTML pages | Network First → cache fallback → /index.html |
| Hero/banner/category images | Network First (cambian con deploys) |
| CSS, JS, logos | Stale-While-Revalidate |
| Otros assets | Stale-While-Revalidate |

**Precache**: Solo logos de marcas (inmutables). NO precachea HTML ni vehiculos.
**Install**: `skipWaiting()` inmediato.
**Activate**: Limpia caches viejos. Envia `SW_UPDATED` a clients solo en updates reales.

### 6.4 Admin Panel (SPA)

**Patron de estado**: Objeto global `window.AP` (AdminPanel) con:
- Arrays de datos: `vehicles`, `brands`, `users`, `dealers`, `appointments`, `reviews`, `banners`
- Perfil: `currentUserProfile`, `currentUserRole`
- Funciones unsubscribe de listeners Firestore
- Helpers: `$()`, `toast()`, `escapeHtml()`, `formatPrice()`, `closestAction()`, `refreshIcons()`

**Navegacion**: Secciones por `data-section` attributes. Sidebar links muestran/ocultan secciones.

**Sesion**:
- Inactividad: 30 min timeout (warning a los 28 min)
- Sesion maxima: 8 horas absoluto
- Tracking: mousemove, click, scroll, keydown
- Persistence: `Auth.Persistence.LOCAL` (sesion sobrevive cierre de tab)

**2FA** (implementado con seguridad reforzada):
- Opcional por usuario (`habilitado2FA`)
- Verificacion por SMS via Firebase Auth Phone Provider + reCAPTCHA invisible
- Rate limiting en verificacion de codigo: max 5 intentos por codigo, luego requiere reenvio
- Cooldown de reenvio: 30 segundos entre reenvios con countdown visual
- Max 5 reenvios por sesion (previene abuso de SMS)
- Mensajes de error diagnosticos para problemas de SMS (billing, config, red)
- Super admin puede auto-desbloquear cuenta con codigo temporal
- Auto-desbloqueo de cuentas bloqueadas despues de 15 minutos
- Super admin sync: si `loginAttempts` fue auto-desbloqueado, sincroniza `usuarios.bloqueado`

**Dispositivos de confianza** (`admin-auth.js`):
- Duracion: 30 dias (`TRUST_DURATION_MS`)
- Token aleatorio guardado en localStorage + array `trustedDevices` en Firestore `usuarios/{uid}`
- Cada entrada almacena: token, browser, os, city, region, country, ip (anonimizada), timezone, createdAt, expiresAt, lastUsed
- `fetchLocationInfo()` obtiene geolocalizacion por IP via `get.geojs.io/v1/ip/geo.json` (HTTPS, CORS `*`, sin API key, sin permisos)
- IP anonimizada: ultimo octeto reemplazado con `***` (ej: `190.28.123.***`)
- Resultado cacheado por page load (`_locationCache`) para evitar llamadas redundantes
- IP anonimizada: ultimo octeto reemplazado con `***` (ej: `190.28.123.***`)
- Ubicacion se refresca en cada login (`updateDeviceLastUsed`)
- UI muestra: navegador, OS, ubicacion con pin, IP anonimizada, ultimo uso, dias restantes
- Acciones: revocar individual o revocar todos

### 6.5 Sistema de Presencia y Sesiones Activas (RTDB)

**Ubicacion**: `admin-auth.js` → `startPresence()`, `stopPresence()`, `loadActiveSessions()`

**Arquitectura**: `/presence/{sessionId}` — un nodo por dispositivo/tab, no por usuario. Permite que el mismo usuario aparezca en multiples dispositivos simultaneamente, y que multiples usuarios se vean entre si.

**Escritura** (`startPresence`):
- Crea nodo con `push()` en `/presence/` con datos: uid, email, nombre, rol, browser, os, city, region, country, ip, lastSeen, online
- Usa `.info/connected` para detectar conexion/desconexion de RTDB
- `onDisconnect().remove()` elimina el nodo al perder conexion (desaparicion instantanea)
- Heartbeat cada 2 min actualiza `lastSeen` (mantiene sesion fresca para deteccion de stale)
- Guards de autenticacion: verifica `auth.currentUser` + `_presenceActive` flag antes de cada write
- Orphan cleanup: busca sesiones huerfanas con mismo `uid + deviceId`, las elimina (excluye el push key nuevo)
- Geolocalizacion por IP via `fetchLocationInfo()` al iniciar sesion

**Lectura** (`loadActiveSessions`):
- Query realtime: `presence.orderByChild('online').equalTo(true)`
- Filtra sesiones stale: descarta sesiones con `lastSeen` > 5 min (tab cerrada sin onDisconnect limpio)
- Auto-limpia entradas propias stale (via `remove()`)
- Muestra: nombre, rol, ubicacion (ciudad/pais), navegador/OS, indicador "(tu)"
- Retry automatico si RTDB no esta cargado (SDK diferido)
- Error callback muestra "No se pudieron cargar" en vez de "Cargando..." infinito

**Limpieza** (`stopPresence`):
- Pone `_presenceActive = false` PRIMERO (previene set() de callbacks pendientes)
- Detiene heartbeat interval
- Desuscribe listener de `.info/connected`
- Desuscribe listener de sesiones activas (`_activeSessionsRef`)
- Cancela `onDisconnect()` para evitar removes duplicados
- Elimina nodo de sesion con `remove()` (desaparece instantaneamente en todos los clientes)
- Se llama ANTES de `auth.signOut()` en TODOS los paths de logout

**Propiedades en `AP`**: `_presenceRef`, `_presenceConnectedRef`, `_presenceHeartbeat`, `_activeSessionsRef`, `_presenceLocation`, `_presenceDevice`

### 6.6 Sistema de Drafts (Borradores)

- Auto-guardado cada 10s mientras se edita un vehiculo
- Almacenados en `usuarios/{uid}/drafts/vehicleDraft`
- Visibilidad compartida via `drafts_activos/{userId}` (otros editores ven quien esta editando)
- Al abrir modal: pregunta si restaurar draft existente
- Al cerrar modal: pregunta si guardar cambios no guardados
- Dirty check evita writes redundantes

### 6.7 Migracion Automatica de Schema

**Ubicacion**: `admin-sync.js` → `migrateVehicleSchema()`
**Ejecucion**: Una vez por sesion, en el primer snapshot de vehiculos
**Comportamiento**: Idempotente, no destructivo, usa batch writes (max 500)

Para agregar un campo nuevo: agregar entrada en `DEFAULTS` dentro de `migrateVehicleSchema()`.

Campos que migra: codigoUnico, _version, estado, tipo, direccion, ubicacion, puertas, pasajeros, placa, destacado, prioridad.

### 6.8 Formularios Publicos

**"Vende tu Auto"** (wizard 3 pasos):
1. Datos de contacto (nombre, telefono, email)
2. Datos del vehiculo (marca, modelo, year, km, precio esperado)
3. Resumen + confirmacion
→ Guarda en `solicitudes` con tipo `consignacion_venta` + abre WhatsApp

**"Financiacion"** (formulario unico):
- Datos contacto + vehiculo de interes + cuota inicial, plazo, ingresos, situacion laboral
→ Guarda en `solicitudes` con tipo `financiacion` + abre WhatsApp

**WhatsApp**: Todos los formularios abren chat con mensaje pre-formateado al +573235016747

### 6.9 CodigoUnico (Auto-generado)

- Formato: `ALT-YYYYMM-XXXX` (ej: `ALT-202604-0042`)
- Secuencia atomica en `config/counters.vehicleCodeSeq` (transaction)
- Inmutable una vez creado, nunca reutilizado
- Generado en `admin-vehicles.js` al crear vehiculo

---

## 7. Patrones y Convenciones del Codigo

### Event Delegation (NO usar onclick inline)

```javascript
// CORRECTO — event delegation con data-action
container.addEventListener('click', function(e) {
    var btn = AP.closestAction(e); // SVG-safe closest()
    if (!btn) return;
    var action = btn.dataset.action;
    // ...
});

// INCORRECTO — NUNCA usar onclick inline (vulnerabilidad XSS)
// <button onclick="doSomething('${variable}')">
```

`AP.closestAction(e)` verifica `nodeType` antes de `closest()` para evitar crash con SVG child nodes.

### Escapar datos de usuario en HTML

```javascript
// SIEMPRE usar AP.escapeHtml() al insertar datos en innerHTML
cell.innerHTML = '<span>' + AP.escapeHtml(vehiculo.marca) + '</span>';
```

### Firestore: create vs update

```javascript
// Crear: usar set() SIN merge
transaction.set(docRef, data);

// Actualizar: usar update() o transaction.update()
transaction.update(docRef, data);

// NUNCA usar set(data, { merge: true }) para creacion — las rules
// evaluan ambiguamente y puede fallar con permission-denied
```

### Sitemap: lastmod

Las paginas estaticas en `generate-vehicles.mjs` usan fechas fijas de lastmod.
Solo actualizar la fecha cuando el contenido de la pagina realmente cambia.
Google ignora lastmod si siempre muestra la fecha actual.

### Subida de imagenes

```javascript
AP.UPLOAD_CONFIG = {
    maxFileSizeMB: 2,
    maxWidthPx: 1200,
    compressionQuality: 0.75,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    storagePath: 'cars/'
}
```

Las imagenes se comprimen client-side antes de subir a Firebase Storage.

### Lucide Icons (Admin Panel)

Libreria de iconos profesional integrada en `admin.html`. Reemplaza los 59+ SVGs inline y emojis que habia antes.

**CDN**: `https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js` (cargado con `defer`)

**Uso en HTML estatico**:
```html
<i data-lucide="icon-name"></i>
```

**Inicializacion**: `lucide.createIcons()` se llama en `DOMContentLoaded`. Si el script carga despues, se escucha su evento `load`.

**Despues de renders dinamicos**: Llamar `AP.refreshIcons()` para que Lucide procese los nuevos `<i data-lucide>` inyectados en el DOM.

```javascript
// Despues de innerHTML con iconos Lucide
container.innerHTML = htmlConIcones;
AP.refreshIcons(); // Convierte <i data-lucide="x"> en SVGs
```

**Sizing en CSS** (`admin.css`):
```css
.nav-item [data-lucide]    { width: 18px; height: 18px; }
.stat-icon [data-lucide]   { width: 22px; height: 22px; }
.btn [data-lucide]         { width: 16px; height: 16px; }
.quick-action-btn [data-lucide] { width: 20px; height: 20px; }
.v-act [data-lucide]       { width: 16px; height: 16px; }
```

**Excepcion**: El logo de WhatsApp sigue siendo SVG inline (icono de marca, no esta en Lucide).

### Botones de Accion de Vehiculos

Los botones de accion en la tabla de vehiculos usan un sistema icon-only con tooltips CSS.

**Clases CSS**:
- `.v-actions` — contenedor flex con gap y wrap
- `.v-act` — boton icono base (32px, transparente, hover con color)
- `.v-act-sep` — separador vertical entre grupos
- `.v-act--info/--gold/--success/--warning/--danger` — variantes de color en hover
- `.v-act--active` — estado activo persistente (ej: vehiculo ya destacado)
- `.v-act--operation` — boton con texto + icono (caso especial: "Operacion")
- `.v-act-protected` — badge para vehiculos vendidos protegidos

**Grupos visuales** (separados por `.v-act-sep`):
1. **Ver**: eye (vista previa), clock-3 (historial) — siempre visible
2. **Editar**: star (destacar), pencil (editar), copy (duplicar), handshake (operacion) — editor+
3. **Peligro**: trash-2 (eliminar) — solo super_admin

**Responsive**: 3 breakpoints (32px desktop, 30px tablet, 28px mobile). Los separadores se ocultan en <480px.

**Tooltips CSS**: `::after` con `content: attr(title)`. Se desactivan en `@media (hover: none)` para touch.

### Cache invalidation desde admin

Despues de cualquier write a Firestore desde el admin, llamar:
```javascript
// admin-sync.js: signalCacheInvalidation()
db.doc('system/meta').update({ lastModified: Date.now() });
```
Esto dispara la invalidacion en el sitio publico via cache-manager.js.

---

## 8. Errores Conocidos y Soluciones

### "Access denied for UID" al hacer login

**Causa**: Dos problemas combinados:
1. Error de red impide cargar perfil de Firestore → el codigo trataba cualquier error como "acceso denegado" y hacia signOut
2. `showAccessDenied()` llamaba a `signOut()`, que disparaba `onAuthStateChanged(null)` → `showLogin()` → **ocultaba el mensaje de error** antes de que el usuario pudiera leerlo

**Fix aplicado** (2026-04-08 / 2026-04-10):
- `loadUserProfile` reintenta hasta 3 veces con backoff (2s, 4s, 6s) para errores de red
- `_accessDeniedShown` flag: `showLogin()` no oculta el error si `showAccessDenied` lo puso visible
- `console.warn('[Auth] Reason:', reason)` para diagnostico en consola

**Si persiste**: Verificar que las reglas de Firestore esten desplegadas:
```bash
firebase deploy --only firestore:rules
```

### Errores de presencia "permission_denied" en RTDB

**Causa**: Multiples problemas combinados:
1. Listeners de presencia escribian a `/presence/` despues de que el usuario fue deslogueado
2. No todos los paths de `signOut()` llamaban a `stopPresence()` primero (inactividad, sesion expirada, password change, mobile logout)
3. Race condition: `.info/connected` podia disparar `set()` despues de que `off()` fue llamado
4. Orphan cleanup podia eliminar la sesion recien creada por race condition con el cache local

**Fix aplicado** (2026-04-09):
- `_presenceActive` flag: el connected callback verifica este flag antes de llamar `set()`. Se pone `false` en `stopPresence()` ANTES de limpiar listeners
- `stopPresence()` ahora cancela `onDisconnect()` antes de hacer `remove()`
- `stopPresence()` se llama ANTES de `signOut()` en TODOS los paths: logout button, mobile logout, inactivity timeout, session expired, access denied, 2FA cancel, unlock cancel, password change invalid, `onAuthStateChanged(null)` safety net
- Orphan cleanup ahora excluye `presenceRef.key` para evitar borrar la sesion recien creada
- Push ref se crea ANTES del orphan cleanup para que el key exista en el callback

**Si persiste**: Verificar que las reglas de RTDB esten desplegadas:
```bash
firebase deploy --only database
```

### Widget "Sesiones Activas" siempre mostraba "Cargando..."

**Causa**: Tres problemas combinados:
1. `loadActiveSessions()` hacia `return` silencioso si `window.rtdb` no estaba cargado (SDK diferido), sin reintento
2. Reglas RTDB solo permitian `.read` a nivel `/presence/$uid`, no a nivel `/presence` (la query necesita leer toda la coleccion)
3. No habia `.indexOn: ["online"]` — RTDB rechaza queries `orderByChild` sin indice

**Fix aplicado** (2026-04-09):
- `database.rules.json`: `.read: "auth != null"` a nivel `/presence` + `.indexOn: ["online"]`
- `loadActiveSessions()`: retry cuando RTDB no esta listo + error callback + filtro de sesiones stale (>5 min)
- `startPresence()`: heartbeat cada 2 min para mantener `lastSeen` fresco
- `stopPresence()`: limpia heartbeat + listener de sesiones activas

**Requiere deploy manual**: `firebase deploy --only database`

### "Failed to obtain primary lease" en Firestore

**Causa**: Multiples tabs abiertas compiten por el lease de IndexedDB.

**Fix**: Cerrar tabs duplicadas. Si persiste, ejecutar en consola del navegador:
```javascript
window.clearFirestoreCache()
```

### Sitemap no se sincroniza en Google Search Console

**Documentado en**: `SITEMAP-FIX.md`

**Causa**: Google intento fetchar el sitemap cuando tenia errores, no reintento.

**Fix**: Re-enviar sitemap en Search Console + ping a Google.
Ver `SITEMAP-FIX.md` para pasos detallados.

### Modals de financiacion/venta no funcionan fuera de index.html

**Fix aplicado**: `loadModalsIfNeeded()` en `components.js` inyecta modals
dinamicamente en todas las paginas desde `snippets/modals.html`.

### Storage Estimator eliminado (2026-04-10)

**Seccion eliminada**: "Consumo Storage (Free Tier)" en el dashboard admin.

**Razon**: Usaba calculos hardcodeados/aproximados (`FREE_TIER.storageMB`, `FREE_TIER.firestoreDocsFree`) que no median datos reales de Firebase. No existe API client-side para medir consumo real de Storage/Firestore en el tier gratuito.

**Archivos modificados**:
- `admin.html`: Eliminada seccion HTML (lineas 366-378)
- `admin-state.js`: Eliminadas constantes `FREE_TIER`
- `admin-sync.js`: Eliminada funcion `updateEstimator()` (~53 lineas), su event listener y llamada init

### Bloqueo de puntero al usar "Ver todas" en menu de marcas

**Fix aplicado**: `pointer-events: none` en `.modal-overlay` inactivo +
cierre de dropdowns/menu al hacer smooth scroll.

---

## 9. Fases Completadas (Historico)

> No reimplementar — ya estan en produccion.

| Fase | Descripcion | Estado |
|------|-------------|--------|
| 1-5 | Admin panel: rendimiento, UX, responsive, seguridad basica, visual polish | Completada |
| 0 | Fix critico CRUD vehiculos (set→update, rules, persistence, SVG events) | Completada |
| 6 | Seguridad: XSS, file validation, event delegation, parseInt radix | Completada |
| 7 | Login: reset password, perfil sidebar, bienvenida, URL validation | Completada |
| 8 | Dashboard: acciones rapidas, stats clickeables, badge citas, paginacion auditLog | Completada |
| 9 | Performance: debounce, CSS variables, lazy images, breakpoints, z-index | Completada |
| 10 | Productividad: atajos teclado, duplicar vehiculo, batch ops, export CSV | Completada |
| 11 | Accesibilidad: ARIA roles, labels, focus styles, live regions | Completada |

### Mejoras aplicadas 2026-04-08 — 2026-04-10

| Cambio | Archivos | Descripcion |
|--------|----------|-------------|
| Fix presencia RTDB | admin-auth.js, database.rules.json | `_presenceActive` flag, stopPresence antes de signOut en 8 paths, orphan cleanup safe |
| Fix Access Denied invisible | admin-auth.js | `_accessDeniedShown` flag, retry con backoff en loadUserProfile |
| Eliminar Storage Estimator | admin.html, admin-state.js, admin-sync.js | Seccion "Consumo Storage" usaba datos falsos, eliminada |
| Integrar Lucide Icons | admin.html, admin-state.js, css/admin.css | 59+ SVGs inline → `<i data-lucide>`, CDN v0.468.0, `AP.refreshIcons()` |
| Rediseño botones vehiculos | admin-vehicles.js, css/admin.css | Emojis → Lucide icons, grupos visuales, tooltips CSS, responsive 3 breakpoints |
| Lucide en todo el admin | 13 archivos | Emojis en actividad, brands, users, reviews, banners, dealers, sort indicators, theme toggle, devices, sesiones → todo Lucide |
| Seguridad 2FA reforzada | admin-auth.js | Rate limiting 5 intentos/codigo, cooldown 30s reenvio, max 5 reenvios/sesion, auto-unblock 15 min, error diagnostico SMS, proteccion super_admin |
| Fix reCAPTCHA SMS delivery | admin-auth.js, firebase-config.js | `.render()` explicito para fallback Enterprise→v2, limpieza contenedor DOM, `useDeviceLanguage()` para SMS en espanol, `expired-callback` |

---

## 10. Fase 12 — Pendiente (Futuro)

| ID | Tarea | Complejidad |
|----|-------|-------------|
| F12.1 | Notificacion por email al recibir cita (Cloud Function trigger) | Alta |
| F12.2 | Preview en tiempo real del vehiculo como se vera en el sitio | Media |
| F12.3 | 2FA opcional via Firebase Auth (implementado, seguridad reforzada) | Completado |
| F12.4 | Historial de cambios con rollback visual (timeline + revert) | Alta |
| F12.5 | Buscador/filtro en lista de aliados + filtro por rango de fechas | Media |
| F12.6 | Virtual scrolling para tablas grandes (+100 filas) | Media |
| F12.7 | Indicadores de sesiones activas por usuario | Completado (RTDB presence + heartbeat + stale detection) |

---

## 11. SEO

Ver `SITEMAP-FIX.md` para estado detallado del sitemap y Google Search Console.

### Implementado
- Meta tags completos en todas las paginas (description, keywords, OG, Twitter Cards)
- `<link rel="canonical">` en todas las paginas
- `<meta name="robots" content="index, follow">`
- Structured Data JSON-LD: AutoDealer + WebSite + FAQ + Car (en paginas de vehiculo)
- Sitemap auto-generado con prioridades diferenciadas y lastmod fijo
- robots.txt limpio (un solo User-agent block)
- Paginas de vehiculo pre-renderizadas con noscript SEO fallback
- google8d667a72b0e3536b.html (verificacion Search Console)
- `<link rel="sitemap">` en head de index.html
- Preconnect a fonts.googleapis.com, firestore.googleapis.com

### Pendiente
- Dominio personalizado (mejoraria crawl priority de Google)
- Re-enviar sitemap en Search Console (ver SITEMAP-FIX.md)

---

## 12. Hallazgos investigación live — 2026-04-16

> Verificados contra `https://altorracars.github.io/` y `raw.githubusercontent.com/altorracars/altorracars.github.io/main/...`. Estos detalles se usan para replicar 1:1 en Altorra Inmobiliaria durante el Bloque A del `PLAN-MEJORAS.md`.

### 12.1 Hero del home — estructura HTML exacta

```
<section class="hero">
  <div class="hero-overlay"></div>
  <div class="hero-ambient"></div>
  <div class="hero-particles">
    <div class="hero-particle"></div> × 8
  </div>
  <div class="hero-content">
    <div class="hero-badge">
      <span class="hero-badge-dot"></span>
      Concesionario Líder en Cartagena
    </div>
    <h1 class="hero-title">
      Encuentra el Auto
      <span class="hero-title-accent">de tus Sueños</span>
    </h1>
    <div class="hero-cta">
      <a href="busqueda.html" class="hero-btn-main">Explorar Catálogo</a>
    </div>
    <div class="hero-search-wrap" role="search">
      <div class="hero-search-inner">
        <svg class="hero-search-icon">...</svg>
        <input id="heroSearchInput"
               class="hero-search-input"
               placeholder="Busca por marca, modelo, año o código…"
               aria-controls="heroSearchDropdown"
               aria-autocomplete="list" />
      </div>
      <ul id="heroSearchDropdown"
          class="hero-search-dropdown"
          role="listbox"
          hidden></ul>
    </div>
  </div>
</section>
```

**Adaptación para Inmobiliaria (C1):** cambiar copy a "Invierte donde otros solo miran · Cartagena", mantener overlay + ambient + 8 partículas, badge pulsante "Inmobiliaria con sello Lonja".

### 12.2 Trust bar

```
<div class="trust-bar">
  <div class="trust-bar-stats">
    <div class="trust-bar-item">
      <span id="trustStatVehicles" class="trust-bar-num" aria-live="polite">–</span>
      <span class="trust-bar-label">Vehículos Disponibles</span>
    </div>
    <div class="trust-bar-sep"></div>
    <div class="trust-bar-item">
      <span id="trustStatBrands" class="trust-bar-num" aria-live="polite">–</span>
      <span class="trust-bar-label">Marcas Premium</span>
    </div>
    <div class="trust-bar-sep"></div>
    <div class="trust-bar-item">
      <span class="trust-bar-icon">⚡</span>
      <span class="trust-bar-label">Financiación Inmediata</span>
    </div>
  </div>
</div>
```

**Observación clave:** solo 2 stats son dinámicos, el tercero es un badge fijo con icono. **Adaptación para Inmobiliaria (A2):** `#trustStatPropiedades`, `#trustStatCiudades`, y tercer slot con "🛡️ Vigilados Lonja" o "⭐ +10 reseñas Google".

### 12.3 Featured Week Banner

```
<section id="fw-banner" class="fw-section" style="display:none;">
  <div class="container">
    <div class="fw-inner">
      <span id="fw-live" class="fw-sr-only" aria-live="polite"></span>
      <button id="fw-prev" class="fw-nav fw-nav--prev"><svg>‹</svg></button>
      <button id="fw-next" class="fw-nav fw-nav--next"><svg>›</svg></button>
      <div id="fw-track" class="fw-track" role="region"></div>
      <div id="fw-dots" class="fw-dots" role="tablist"></div>
    </div>
  </div>
</section>
```

**Comportamiento:** arranca `display:none`, solo se muestra cuando la función de JS encuentra propiedades marcadas como "destacada de la semana". Auto-rotación configurable. `#fw-live` es sr-only para lectores de pantalla.

### 12.4 Modal wizard 3 pasos — spec exacta

**Progreso:**
```
<div class="wizard-progress">
  <div class="wizard-track">
    <div id="vendeWizardFill" class="wizard-fill" style="width:33%"></div>
  </div>
  <div class="wizard-steps-row">
    <div class="wizard-step-item active" data-step="1">
      <div class="wizard-dot">1</div><span>Contacto</span>
    </div>
    <div class="wizard-step-item" data-step="2">
      <div class="wizard-dot">2</div><span>Vehículo</span>
    </div>
    <div class="wizard-step-item" data-step="3">
      <div class="wizard-dot">3</div><span>Oferta</span>
    </div>
  </div>
</div>
```

**Fill width:** `33% / 66% / 100%` según paso.
**Subtítulo:** `<p id="vendeWizardSubtitle">Paso 1 de 3 — Datos de contacto</p>`.
**Paneles:** `<div class="wizard-panel active" data-panel="1">` — solo uno con `active`.
**Navegación:** botones `.wizard-btn-back` y `.wizard-btn-next` con `data-panel`.

**Adaptación para Inmobiliaria (B4):** tres pasos `Contacto / Propiedad / Preferencias` para "Agenda visita"; o `Contacto / Inmueble / Precio esperado` para "Publica tu propiedad" (A12).

### 12.5 Country selector — lista exacta (10 países)

Orden exacto a replicar en Inmobiliaria para consistencia con Cars:

```
<option value="+57">🇨🇴 +57</option>   Colombia (default)
<option value="+58">🇻🇪 +58</option>   Venezuela
<option value="+593">🇪🇨 +593</option> Ecuador
<option value="+507">🇵🇦 +507</option> Panamá
<option value="+52">🇲🇽 +52</option>   México
<option value="+1">🇺🇸 +1</option>     EE.UU.
<option value="+51">🇵🇪 +51</option>   Perú
<option value="+56">🇨🇱 +56</option>   Chile
<option value="+54">🇦🇷 +54</option>   Argentina
<option value="+34">🇪🇸 +34</option>   España
```

Estos son los mercados emisores para Cartagena — apto también para inversionistas extranjeros.

### 12.6 initHeroSearch() de Cars — lo que hace

Referencia: `js/main.js` de Cars.

- Input `#heroSearchInput` + dropdown `#heroSearchDropdown`.
- **Fuzzy matching:** Levenshtein simple con `maxDist = qWord.length <= 5 ? 1 : 2`. Skip fuzzy para palabras < 4 chars.
- **Word-boundary aware:** para palabras numéricas cortas (1-2 dígitos) exige límite de palabra. Evita que "6" matchee dentro de "2016".
- **Recientes:** `localStorage` con clave `altorra-recent-searches`, máx 5.
- **Atajo `/`:** enfoca el input desde cualquier parte (respeta INPUT/TEXTAREA/SELECT activos).
- **Conteo por sugerencia:** agrupa por marca y modelo; muestra "Marca (12)" y "Marca Modelo (3)".
- **Fuzzy indicator "~":** cuando el match no es exacto, añade un "~" junto al contador.
- **ARIA:** `role="listbox"` en dropdown, `aria-controls="heroSearchDropdown"` y `aria-autocomplete="list"` en input.
- **Navegación teclado:** ArrowDown/Up, Enter, Escape.
- **Touch:** distingue tap (< 8px) de scroll (> 8px) para no seleccionar al scrollear.

**Comparación con `js/smart-search.js` de Inmobiliaria (al 2026-04-16):**

| Feature | Cars | Inmobiliaria |
|---------|------|--------------|
| Typos fuzzy | Levenshtein | Damerau-Levenshtein ✨ (superior) |
| Presupuesto | ❌ | ✅ (350m, 0.35b, 250-400m) |
| Sinónimos features | ❌ | ✅ (ES/EN con auto-aprendizaje) |
| Re-ranking clicks | ❌ | ✅ (popularidad) |
| Recientes localStorage | ✅ | ✅ (añadido en A1a) |
| Atajo `/` | ✅ | ✅ (añadido en A1a) |
| Conteo por sugerencia | ✅ | 🔲 (A1b) |
| Indicador `~` fuzzy | ✅ | 🔲 (A1c) |
| ARIA completa | ✅ | 🔲 (A1c) |

### 12.7 Flujo home (orden de secciones)

```
1. Header
2. Hero (con search + overlay + partículas)
3. Trust bar
4. Featured Week Banner (si hay destacadas)
5. Categorías (4-6 imágenes grid)
6. Brands carousel (marquee infinito)
7. Sección 3 columnas "Todo en un Solo Lugar"
   └─ Comprar | Vender | Financiar
8. Financing Request Form (modal callable)
9. Testimonials (Firestore)
10. Footer
```

**Adaptación Inmobiliaria (Sprint 1):**

```
1. Header
2. Hero (con search + overlay + partículas)
3. Trust bar
4. Featured Week Banner
5. Categorías: Apartamento / Casa / Lote / Oficina / Local / Bodega
6. Barrios premium carousel: Bocagrande / Manga / Castillogrande / Centro / Crespo / Manzanillo
7. Sección 3 columnas "Todo en un lugar"
   └─ Comprar | Arrendar | Invertir
8. Publicar propiedad CTA (abre wizard)
9. Testimonials (Firestore)
10. Footer
```

---

*Apéndice 12 cerrado — 2026-04-16 (investigación live Cars).*
