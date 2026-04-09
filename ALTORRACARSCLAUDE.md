# CLAUDE.md — Altorra Cars Knowledge Base

> Referencia unica para Claude. Evita reprocesos en parches, errores y mejoras.
> Ultima actualizacion: 2026-04-09

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
| `admin-state.js` | Estado global `window.AP`, RBAC helpers, escapeHtml, closestAction, formatPrice |
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
    "$uid": {
      ".read": true,
      ".write": "$uid === auth.uid"
    }
  }
}
```

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
- Helpers: `$()`, `toast()`, `escapeHtml()`, `formatPrice()`, `closestAction()`

**Navegacion**: Secciones por `data-section` attributes. Sidebar links muestran/ocultan secciones.

**Sesion**:
- Inactividad: 30 min timeout (warning a los 28 min)
- Sesion maxima: 8 horas absoluto
- Tracking: mousemove, click, scroll, keydown
- Persistence: `Auth.Persistence.LOCAL` (sesion sobrevive cierre de tab)

**2FA** (parcialmente implementado):
- Opcional por usuario (`habilitado2FA`)
- Verificacion por SMS via Firebase Auth
- Dispositivos de confianza por 30 dias
- Super admin puede auto-desbloquear cuenta con codigo temporal

### 6.5 Sistema de Drafts (Borradores)

- Auto-guardado cada 10s mientras se edita un vehiculo
- Almacenados en `usuarios/{uid}/drafts/vehicleDraft`
- Visibilidad compartida via `drafts_activos/{userId}` (otros editores ven quien esta editando)
- Al abrir modal: pregunta si restaurar draft existente
- Al cerrar modal: pregunta si guardar cambios no guardados
- Dirty check evita writes redundantes

### 6.6 Migracion Automatica de Schema

**Ubicacion**: `admin-sync.js` → `migrateVehicleSchema()`
**Ejecucion**: Una vez por sesion, en el primer snapshot de vehiculos
**Comportamiento**: Idempotente, no destructivo, usa batch writes (max 500)

Para agregar un campo nuevo: agregar entrada en `DEFAULTS` dentro de `migrateVehicleSchema()`.

Campos que migra: codigoUnico, _version, estado, tipo, direccion, ubicacion, puertas, pasajeros, placa, destacado, prioridad.

### 6.7 Formularios Publicos

**"Vende tu Auto"** (wizard 3 pasos):
1. Datos de contacto (nombre, telefono, email)
2. Datos del vehiculo (marca, modelo, year, km, precio esperado)
3. Resumen + confirmacion
→ Guarda en `solicitudes` con tipo `consignacion_venta` + abre WhatsApp

**"Financiacion"** (formulario unico):
- Datos contacto + vehiculo de interes + cuota inicial, plazo, ingresos, situacion laboral
→ Guarda en `solicitudes` con tipo `financiacion` + abre WhatsApp

**WhatsApp**: Todos los formularios abren chat con mensaje pre-formateado al +573235016747

### 6.8 CodigoUnico (Auto-generado)

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

**Causa**: Error de red impide cargar perfil de Firestore → el codigo trataba
cualquier error como "acceso denegado" y hacia signOut.

**Fix aplicado** (2026-04-08): `loadUserProfile` ahora reintenta hasta 3 veces
con backoff (2s, 4s, 6s) para errores de red antes de rendirse. Solo hace
signOut para errores reales de permisos.

**Si persiste**: Verificar que las reglas de Firestore esten desplegadas:
```bash
firebase deploy --only firestore:rules
```

### Errores de presencia "permission_denied" en RTDB

**Causa**: Listeners de presencia escribian a `/presence/{uid}` despues de que
el usuario fue deslogueado, causando permission_denied.

**Fix aplicado** (2026-04-08): Guards en `startPresence()` verifican que el
usuario sigue autenticado antes de cada escritura. `stopPresence()` limpia
listeners. `showAccessDenied()` llama a `stopPresence()`.

**Si persiste**: Verificar que las reglas de RTDB esten desplegadas:
```bash
firebase deploy --only database
```

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

---

## 10. Fase 12 — Pendiente (Futuro)

| ID | Tarea | Complejidad |
|----|-------|-------------|
| F12.1 | Notificacion por email al recibir cita (Cloud Function trigger) | Alta |
| F12.2 | Preview en tiempo real del vehiculo como se vera en el sitio | Media |
| F12.3 | 2FA opcional via Firebase Auth (parcialmente implementado) | Media |
| F12.4 | Historial de cambios con rollback visual (timeline + revert) | Alta |
| F12.5 | Buscador/filtro en lista de aliados + filtro por rango de fechas | Media |
| F12.6 | Virtual scrolling para tablas grandes (+100 filas) | Media |
| F12.7 | Indicadores de sesiones activas por usuario | Completado (RTDB presence) |

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
