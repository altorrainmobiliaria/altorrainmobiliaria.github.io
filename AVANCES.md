# AVANCES.md — Altorra Inmobiliaria
## Bitácora de implementación hacia plataforma dinámica con Firebase

> Documento vivo. Se actualiza con cada microfase completada.
> Última actualización: 2026-04-15 (sync en vivo + limpieza UX home)

---

## POR QUÉ EXISTEN CLAUDE.md Y ALTORRACARSCLAUDE.md EN ESTE REPO

### `CLAUDE.md` — La guía maestra de migración

Este archivo es la **memoria técnica del proyecto**. Fue creado específicamente para que Claude (el asistente de IA que ejecuta el trabajo) no pierda contexto entre sesiones. Dado que cada conversación con Claude comienza desde cero, `CLAUDE.md` actúa como el documento de onboarding que le explica:

- Qué es Altorra Inmobiliaria y qué problema se quiere resolver
- Cómo está construida hoy (estructura de archivos, JS, CSS, formularios)
- Qué restricciones NO se pueden romper (diseño visual, tipografía, colores)
- El schema completo de Firestore que se va a implementar
- Las reglas de seguridad de Firestore y Storage
- Las convenciones de código que se deben seguir
- El plan de migración completo en 9 etapas
- Los límites del plan Blaze de Firebase que NUNCA se deben exceder

Sin este archivo, cada sesión con Claude requeriría explicar todo desde cero, lo que desperdiciaría la licencia de $20/mes.

### `ALTORRACARSCLAUDE.md` — La referencia arquitectónica de Altorra Cars

Altorra Cars (`altorracars/altorracars.github.io`) es la versión avanzada del mismo concepto aplicado a vehículos. **Ya está 100% integrada con Firebase** y es el modelo a replicar en Inmobiliaria.

Este archivo es el `CLAUDE.md` que el equipo de Altorra Cars generó para su propio proyecto. Contiene:

- Implementación real y funcional de patrones que se necesitan copiar
- Sistema de presencia en tiempo real (RTDB) con guards de seguridad
- Sistema de caché de 4 capas que ya resuelve problemas conocidos
- Sistema de drafts (borradores) para propiedades
- Errores reales que aparecieron en Cars y cómo se corrigieron
- Migración de schema documentada

Tener ambos documentos en el repo garantiza que Claude siempre trabaje con el contexto correcto y replique exactamente los patrones que ya funcionan en producción en Cars.

---

## ESTADO GENERAL

```
FASE PREVIA — Dominio y correo:            ✅ Completado
FASE DOC    — CLAUDE.md + ALTORRACARSCLAUDE.md: ✅ Completado
Etapa 0-A   — Archivos base Firebase:      ✅ Completado
Etapa 0-B   — Proyecto Firebase + servicios: ✅ Completado (2026-04-10)
Etapa 0-C   — Cloud Functions deploy:      ⚠️  Parcial (createManagedUserV2 OK, resto requiere re-deploy: ver DEPLOY-RUNBOOK.md)
Etapa 1     — Lectura dinámica Firestore:  ✅ Código listo — falta poblar Firestore (npm run upload)
Etapa 2     — Formularios → Firestore:     ⚠️  Código listo — falta re-deploy de Functions
Etapa 3     — Panel de administración:     ✅ Código listo — updateUserRoleV2 añadida en esta sesión
Etapa 4     — Imágenes en Cloud Storage:   ✅ Script listo (bucket name corregido, ejecutar npm run migrate-images)
Etapa 5     — SEO dinámico + CI/CD:        ✅ Script + workflow listos (bug del if: arreglado, falta secret GOOGLE_APPLICATION_CREDENTIALS_JSON)
Etapa 6     — Favoritos sincronizados:     ✅ Completado (funciona local + sync Firebase automático)
Etapa 7     — Analytics y Marketing:       ✅ Completado (GA4 activa con measurementId)
Etapa 8     — Mejoras comerciales:         ✅ Código listo — claves centralizadas en window.AltorraKeys (ver DEPLOY-RUNBOOK.md)
```

**📖 Runbook del propietario:** `DEPLOY-RUNBOOK.md` contiene los 6 pasos
pendientes con comandos PowerShell exactos. Cuando todos estén ejecutados,
la migración estará 100% completa.

---

## REGISTRO DE FASES COMPLETADAS

---

### ✅ A11 — Sección "Todo en un lugar" (3 columnas CTA) (2026-04-16)

**Contexto:** Cars tiene una sección de "hub" que agrupa los caminos
principales del usuario. Inmobiliaria replica la idea con 3 tarjetas
grandes para dirigir el flujo hacia Comprar / Arrendar / Invertir desde la
home, justo arriba del bloque "Publica tu propiedad".

**Qué se añadió:**

1. **HTML en `index.html`:** nuevo `<section class="hub-section">` con 3
   `.hub-card`:
   - **Comprar** → `propiedades-comprar.html` (icono casa).
   - **Arrendar** → `propiedades-arrendar.html` (icono llave/casa).
   - **Invertir** → `turismo-inmobiliario.html` (icono gráfica).
   Cada tarjeta tiene icono SVG, título, descripción corta y CTA "→".
2. **CSS en `style.css`:** bloque Hub con gradient sutil, hover
   `translateY(-4px)` + sombra dorada y `border-color` resaltado. Responsive
   a 1 columna en ≤860px.
3. **Accesibilidad:** `aria-labelledby` + `aria-label` por tarjeta;
   `aria-hidden` en los iconos SVG.

**Archivos tocados:**
- `index.html` — +34 líneas de markup.
- `style.css` — +82 líneas del bloque Hub.
- Sin JS (enlaces estáticos a páginas existentes).

**Criterio de éxito:**
- [x] Las 3 tarjetas se ven igual en desktop (grid 3 cols) y se apilan en
      móvil (1 col) con `:hover` suave.
- [x] Respeta `--gold` / `--accent` — no se inventaron colores nuevos.
- [x] Los enlaces apuntan a páginas que ya existen en el repo.

---

### ✅ A3 — Featured Week Banner como carrusel dinámico (2026-04-16)

**Contexto:** Existía una versión simple de `featured-week-banner.js` que
renderiza UNA sola propiedad. Cars usa el patrón de carrusel con `#fw-*`
(track, dots, prev/next, live region). A3 lleva Inmobiliaria al mismo patrón
manteniendo la API pública `FeaturedBanner.init(selector)`.

**Qué cambió:**

1. **`selectFeatured()`** ahora devuelve las TOP 3 propiedades válidas
   (prioridad > 0 o featured), ordenadas por `prioridad` → `featured` →
   `added/createdAt` desc.
2. **Shell del carrusel** inyectado en el mismo container existente
   (`#featured-banner-container`):
   - `<div id="fw-banner">` con `role="region"`
   - `#fw-viewport + #fw-track` (translateX por slide)
   - Botones `#fw-prev` / `#fw-next`
   - `#fw-dots` con `role="tablist"` y `aria-selected`
   - `#fw-live` `aria-live="polite"` para anunciar slide actual
3. **Rotación automática** cada 6s con `state.paused` activado por
   `mouseenter/focusin` y liberado en `mouseleave/focusout`. Click en dots o
   flechas reinicia el timer vía `restart()`.
4. **Edge cases:**
   - 0 slides válidos → oculta `<section>` completo (preserva comportamiento
     anterior) y limpia `localStorage`.
   - 1 slide → oculta prev/next/dots.
   - DB refresca (`altorra:db-refreshed`) → recalcula y repinta.
5. **Estilos inline** inyectados una sola vez bajo `#fw-styles`. Paleta
   dorada (`--gold` / `--accent`) conservada. Responsive a 640px (slide
   vertical).

**Archivos tocados:**
- `js/featured-week-banner.js` — reescritura completa (+209, -171 líneas
  netas). Sin tocar `index.html` ni `style.css` (API preservada).

**Criterio de éxito:**
- [x] `node --check js/featured-week-banner.js` → sintaxis válida.
- [x] Solo se inyectan los estilos una vez (`#fw-styles` guard).
- [x] `FeaturedBanner.init('#featured-banner-container')` sigue funcionando
      sin cambios en `index.html`.
- [x] Accesibilidad: `aria-live`, `aria-selected`, `aria-label` en controles.

---

### ✅ A2 — Trust bar con stats en vivo (2026-04-16)

**Contexto:** Cars muestra bajo el hero una franja con 2 stats dinámicos +
1 fijo con icono. Inmobiliaria replica el patrón para reforzar percepción de
actividad y cobertura sin necesidad de reseñas manuales.

**Qué se añadió:**

1. **HTML:** `<aside class="trust-bar">` insertado entre el hero y la sección
   "Publica tu propiedad" en `index.html`. Contiene 3 `.trust-item`:
   - `#trustStatPropiedades` con `<strong class="trust-num">` (dinámico).
   - `#trustStatCiudades` con `<strong class="trust-num">` (dinámico).
   - Item fijo "Respaldo legal y financiero" con icono de estrella.
2. **CSS en `style.css`:** gradiente dorado sutil top/bottom, separadores "•",
   colapso de separadores en pantallas <640px. Mantiene `--gold`/`--accent`.
3. **JS en `scripts.js`:** IIFE `paint()` que lee `window.propertyDB.properties`,
   filtra activas (`available !== 0 && disponible !== false`) y calcula
   `new Set(p.city)`. Se engancha a:
   - `DOMContentLoaded`
   - `altorra:db-ready`
   - `altorra:db-refreshed`
   - `altorra:cache-invalidated`
4. **ARIA:** `aria-live="polite"` en cada span dinámico; `aria-label` en el aside.

**Archivos tocados:**
- `index.html` — +24 líneas de markup.
- `style.css` — +49 líneas (bloque Trust Bar).
- `scripts.js` — +28 líneas (IIFE paint + listeners).

**Criterio de éxito:**
- [x] `node --check` OK en los archivos JS.
- [x] Los números reaccionan cuando Firestore refresca el dataset.
- [x] No rompe mobile (≤640px): se colapsan separadores, la franja queda
      compacta centrada.

---

### ✅ A1c — ARIA combobox completa + indicador fuzzy "~" (2026-04-16)

**Contexto:** El smart-search ya corrige typos con Damerau-Levenshtein, pero el
usuario no tenía pista visual de que el resultado vino por corrección ortográfica.
Además, el patrón ARIA de combobox no estaba completo (aria-expanded/controls/
activedescendant ausentes), bloqueando parte del acceso con lectores de pantalla.

**Qué se añadió:**

1. **ARIA combobox completa en `#f-search` y `#f-city`:**
   - `role="combobox"`, `aria-autocomplete="list"`, `aria-haspopup="listbox"`
   - `aria-controls="smart-search-dropdown"`
   - `aria-expanded` se actualiza al `show()`/`hide()` del dropdown
   - `aria-activedescendant` apunta al `id` del item con foco del teclado
2. **ID único por opción** — `ss-opt-0`, `ss-opt-1`, ... para grupos,
   propiedades y recientes.
3. **`aria-selected`** alterna `true`/`false` con las flechas.
4. **Indicador fuzzy "~":** badge dorado pequeño junto al título cuando
   `p.__isFuzzy === true`. Se marca fuzzy cuando `parseQuery` aplicó corrección
   de typo Y el match del property no se cumple con los tokens originales
   (`tokensHitStrong(originals, f) === false`).
5. **`parseQuery`** ahora también expone `originals[]` y `hadTypo:boolean`
   sin romper callers existentes.

**Archivos tocados:**
- `js/smart-search.js` — +59 líneas netas.

**Criterio de éxito:**
- [x] `node --check js/smart-search.js` → sintaxis válida.
- [x] Badge "~" aparece SOLO en resultados corregidos, no en matches exactos.
- [x] `aria-expanded` cambia con show/hide, `aria-activedescendant` apunta al
      item con foco de teclado y se limpia al cerrar el dropdown.

---

### ✅ A1b — Sugerencias agrupadas por barrio/tipo/ciudad con contador (2026-04-16)

**Contexto:** Extensión natural del smart-search. Cars agrupa resultados por
"Marca · N vehículos" en su dropdown. Inmobiliaria adopta el patrón adaptado al
dominio: barrio, tipo de propiedad y ciudad, con contador por categoría.

**Qué se añadió:**

1. **`buildGroupSuggestions(query, allProps)`** — detecta coincidencias de la
   query contra `p.neighborhood`, `p.type` (+ `TYPE_LABEL` en ES) y `p.city`.
   Retorna hasta 3 grupos ordenados por `count` desc. Respeta `available` /
   `disponible`.
2. **`renderGroups(groups)`** — renderiza sección "Sugerencias" arriba de las
   propiedades individuales, con icono específico por `kind` (pin, casa, ciudad),
   label en negrita y badge redondeado `N propiedades`.
3. **`buildGroupHref(group)`** — resuelve destino según `#op` seleccionado
   (comprar/arrendar/alojar) y arma los query params:
   - `barrio` → `?search={barrio}` (listado filtra en descripción + hood)
   - `tipo`   → `?type={type}&city={city?}`
   - `ciudad` → `?city={city}`
4. **Teclado** — `ArrowUp/ArrowDown/Enter` ahora incluye grupos, propiedades y
   recientes (selector `.ss-group-item, .ss-item, .ss-recent-item`).

**Archivos tocados:**
- `js/smart-search.js` — +119 líneas netas, sin tocar `searchProps()` ni vocab.

**Criterio de éxito:**
- [x] `node --check js/smart-search.js` → sintaxis válida.
- [x] Grupos aparecen solo cuando hay matches reales (count ≥ 1).
- [x] Click en grupo navega al listado correcto según operación elegida.

---

### ✅ A1a — Hero search: búsquedas recientes + atajo "/" (2026-04-16)

**Contexto:** Primera micro-fase del plan unificado tras revisar el repo vivo de
Altorra Cars. El `js/smart-search.js` actual ya supera a Cars en typos
(Damerau-Levenshtein), parseo de presupuesto, sinónimos y re-ranking por clicks.
Faltaban tres cosas que Cars sí tiene y aportan UX directa.

**Qué se añadió (sin tocar la lógica semántica existente):**

1. **Búsquedas recientes** en `localStorage` (clave `altorra:hero-recent-searches`,
   máx. 5). Helpers `getRecent()`, `saveRecent()`, `removeRecent()`.
2. **Render de recientes al enfocar el hero** (`#f-search`) cuando el input está
   vacío — cada fila con icono de reloj, texto y botón × para eliminar. Al hacer
   clic en una reciente, se rellena el input y dispara la búsqueda automática.
3. **Guardado automático** en dos puntos de intención:
   - Al enviar el formulario `#quickSearch` (click en "Buscar" o Enter).
   - Al hacer clic en una sugerencia de propiedad (se guarda el query que la
     produjo, detectado vía `document.activeElement`).
4. **Atajo `/`** global: enfoca `#f-search` desde cualquier parte de la página,
   respetando inputs/textareas/selects activos y `contenteditable`. En blanco,
   abre las recientes directamente.

**Archivos tocados:**
- `js/smart-search.js` — +103 líneas netas, sin cambiar el motor de búsqueda.

**Criterio de éxito:**
- [x] `node --check js/smart-search.js` → sintaxis válida.
- [x] El dropdown existente (singleton `DD`) se reutiliza; no se crea uno nuevo.
- [x] El comportamiento previo (typos, presupuesto, features, click-ranking)
      queda intacto — solo se añade la capa de recientes sobre el mismo `DD`.

**Qué sigue (A1b):** agrupar sugerencias por barrio/tipo con contador de
propiedades (ej: "Bocagrande · 8 propiedades") como hace Cars con marca/modelo.

---

### ✅ SESIÓN AUDITORÍA Y FIXES (2026-04-10)

**Contexto:** Al revisar los MDs y auditar el estado real del código, se encontraron
6 bugs/huecos que impedían que "todo lo marcado como listo" funcionara de verdad
en cuanto el propietario ejecute los pasos pendientes. Todos arreglados en esta sesión.

**Bugs arreglados:**

1. **Bucket name incorrecto en `scripts/migrate-images-to-storage.mjs`** — estaba
   hardcodeado `altorra-inmobiliaria.appspot.com` pero el proyecto real es
   `altorra-inmobiliaria-345c6.firebasestorage.app`. Ahora es configurable con
   variable de entorno `STORAGE_BUCKET` y el default apunta al bucket correcto.

2. **Placeholder de Google Maps API key expuesto en `js/mapa-propiedades.js`** —
   había una key de aspecto real pero ficticia. Ahora la key se lee desde
   `window.AltorraKeys.gmapsApiKey` (centralizada en `firebase-config.js`).
   Si falta, el mapa muestra un mensaje claro "Mapa no disponible" en vez de romperse.

3. **Placeholder VAPID key en `js/push-notifications.js`** — mismo patrón. Ahora
   se lee desde `window.AltorraKeys.vapidKey`. Si no está configurada, el botón
   de suscripción se oculta automáticamente y `requestPermission()` retorna null
   sin errores.

4. **Función `updateUserRoleV2` faltante en `functions/index.js`** — `admin-users.js`
   la llamaba con `httpsCallable` pero no estaba definida en el backend, lo que
   habría roto el cambio de rol desde el panel admin. Añadida con la misma
   validación de `requireSuperAdmin` + guard anti-auto-degradación.

5. **Bug en `.github/workflows/og-publish.yml`** — la condición
   `if: ${{ env.GOOGLE_APPLICATION_CREDENTIALS_JSON != '' }}` intentaba leer una
   variable de entorno que solo existe dentro del propio step, por lo que siempre
   evaluaba a truthy aunque el secret no existiera. Ahora se usa un env a nivel
   de job (`HAS_FIREBASE_CREDS`) para elegir entre Firestore y el fallback a
   `data.json` correctamente.

6. **Script `migrate-images` no expuesto en `package.json`** — añadido como
   `npm run migrate-images`.

**Otras mejoras:**

- Se creó `DEPLOY-RUNBOOK.md` en la raíz: documento ejecutable con los pasos
  exactos (comandos PowerShell) que el propietario debe correr para terminar
  los 6 bloqueantes pendientes. Incluye: fix Eventarc, subir propiedades,
  migrar imágenes, configurar secret de GitHub Actions, Google Maps key y
  VAPID key. También tiene checklist de verificación final y troubleshooting.

- Comentario de cabecera de `js/firebase-config.js` simplificado: ya no dice
  "TODO reemplazar credenciales" porque las credenciales ya están puestas.
  Explica el rol de `window.AltorraKeys` como único bloque que el propietario
  necesita editar para las claves opcionales.

**Archivos modificados en esta sesión:**
```
js/firebase-config.js              (+window.AltorraKeys, docs actualizada)
js/mapa-propiedades.js             (lee gmapsApiKey desde AltorraKeys + fallback limpio)
js/push-notifications.js           (lee vapidKey desde AltorraKeys + no-op si falta)
functions/index.js                 (+updateUserRoleV2, actualiza header de docs)
scripts/migrate-images-to-storage.mjs (bucket correcto + env STORAGE_BUCKET)
.github/workflows/og-publish.yml   (HAS_FIREBASE_CREDS a nivel de job)
package.json                       (+script migrate-images)
DEPLOY-RUNBOOK.md                  (NUEVO — runbook para el propietario)
AVANCES.md                         (esta sección)
```

**Lo que sigue bloqueado hasta que el propietario ejecute el runbook:**
- Fix de permisos Eventarc para completar deploy de las 6 Cloud Functions restantes
- Ejecutar `npm run upload` para poblar Firestore
- Ejecutar `npm run migrate-images` para subir fotos a Storage
- Configurar secret `GOOGLE_APPLICATION_CREDENTIALS_JSON` en GitHub
- Pegar Google Maps API key en `window.AltorraKeys.gmapsApiKey`
- Pegar VAPID key en `window.AltorraKeys.vapidKey`

Ver `DEPLOY-RUNBOOK.md` para los comandos exactos.

---

### ⚠️ ETAPA 0-C — Deploy de Cloud Functions (2026-04-10) — PENDIENTE FIX

**Contexto:**
Primera vez que se despliegan Cloud Functions 2nd gen en el proyecto `altorra-inmobiliaria-345c6`.

**Lo que funcionó:**
- ✅ `createManagedUserV2` — desplegada correctamente
- ✅ Cleanup policy configurada: imágenes de contenedor se borran a los 30 días
- ✅ Secret Manager API habilitada
- ✅ Secrets creados: `EMAIL_USER`, `EMAIL_PASS`, `GITHUB_PAT`
- ✅ Permisos de Secret Manager otorgados automáticamente a la cuenta de servicio

**Lo que falló:**
- ❌ `onNewSolicitud` — Error 400 Eventarc, invalid resource state
- ❌ `onSolicitudStatusChanged` — mismo error
- ❌ `onPropertyChange` — mismo error
- ❌ `deleteManagedUserV2` — mismo error
- ❌ `triggerSeoRegeneration` — mismo error

**Causa del error:**
```
HTTP Error: 400, Validation failed for trigger. Invalid resource state for
'permission denied while using the Eventarc Service Agent. If you recently
started to use Eventarc, it may take a few minutes before all necessary
permissions are propagated to the Service Agent.'
```

También apareció error de Cloud Build:
```
Build failed: Could not build the function due to a missing permission on
the build service account.
```

**Cómo resolver (próxima sesión):**

**Opción A — Esperar y reintentar** (más probable que funcione):
El error de Eventarc es común en el primer deploy. Esperar 5-10 minutos y ejecutar:
```powershell
cd C:\Users\romad\Documents\GitHub\altorrainmobiliaria.github.io
firebase deploy --only functions --account altorrainmobiliaria@gmail.com
```

**Opción B — Dar permisos manualmente si Opción A falla:**

1. Ir a Google Cloud Console → IAM:
   `console.cloud.google.com/iam-admin/iam?project=altorra-inmobiliaria-345c6`

2. Buscar la cuenta de servicio:
   `service-794130975989@gcp-sa-eventarc.iam.gserviceaccount.com`

3. Darle el rol: **"Eventarc Service Agent"** (`roles/eventarc.serviceAgent`)

4. Buscar también:
   `794130975989@cloudbuild.gserviceaccount.com`

5. Darle el rol: **"Cloud Build Service Account"** (`roles/cloudbuild.builds.builder`)

6. Esperar 2-3 minutos y reintentar el deploy.

**Opción C — Habilitar APIs faltantes:**
```powershell
# En PowerShell con gcloud instalado, o desde Cloud Console:
# Habilitar: cloudbuild.googleapis.com, eventarc.googleapis.com, run.googleapis.com
```
Desde la consola: `console.cloud.google.com/apis/library` → buscar y habilitar cada una.

**Datos del proyecto:**
- Project ID: `altorra-inmobiliaria-345c6`
- Project Number: `794130975989`
- Region de Functions: `us-central1`
- Cuenta Firebase CLI: `altorrainmobiliaria@gmail.com`
- Ruta local: `C:\Users\romad\Documents\GitHub\altorrainmobiliaria.github.io`

---

### ✅ ETAPA 0-B — Proyecto Firebase configurado (2026-04-10)

**Qué se hizo:**
- ✅ Proyecto Firebase `altorra-inmobiliaria-345c6` creado
- ✅ App web registrada, credenciales reales en `js/firebase-config.js`
- ✅ Firestore activado (Standard, nam5, modo producción, reglas desplegadas)
- ✅ Authentication activado: Email/contraseña + Anónimo
- ✅ Storage activado (us-central1, modo producción, reglas desplegadas)
- ✅ Realtime Database activado (us-central1, modo bloqueado, reglas desplegadas)
- ✅ Primer usuario admin creado en Firebase Auth:
  - Email: `info@altorrainmobiliaria.co`
  - UID: `J1sXuV78OhPA5KyCoWNYFVQehF23`
- ✅ Documento `usuarios/J1sXuV78OhPA5KyCoWNYFVQehF23` creado en Firestore con `rol: super_admin`
- ✅ Secret Manager API habilitada
- ✅ Secrets configurados: `EMAIL_USER`, `EMAIL_PASS` (app password Gmail), `GITHUB_PAT`
- ✅ Firebase CLI vinculado: `firebase use altorra-inmobiliaria-345c6 --account altorrainmobiliaria@gmail.com`

**Pendiente:**
- ⚠️ Completar deploy de Cloud Functions (ver Etapa 0-C arriba)
- ⚠️ Subir propiedades a Firestore: `node scripts/upload-to-firestore.mjs`
- ⚠️ Configurar GOOGLE_APPLICATION_CREDENTIALS_JSON en GitHub Actions secrets

**Commit credenciales:** `72103b1`

---

### ✅ ETAPA 8 — Mejoras comerciales (2026-04-10)

**Qué se hizo:**

- **8-A** `js/simulador-hipotecario.js` + `simulador.html` — Calculadora hipotecaria con amortización francesa. Sliders de cuota inicial (10–50%), plazo (5–30 años), tasa (8–24% E.A.). Presets VIS/no-VIS. Tabla de amortización por año (elemento `<details>`). CTA a WhatsApp + lead `solicitud_credito` en Firestore. Acepta `?precio=` desde detalle-propiedad.

- **8-B** `js/comparador.js` — Comparador de hasta 3 propiedades. Tray flotante con thumbnails. Modal con tabla side-by-side (specs completos). Highlight del mejor valor por columna (`cmp-best`). Inyección de botones en tarjetas via MutationObserver. Persistencia en localStorage. API: `window.AltorraComparador`.

- **8-C** `js/mapa-propiedades.js` + `mapa.html` — Mapa interactivo con Google Maps. Markers por operación (🟡 venta, 🔵 arriendo, 🟢 días). InfoWindow con imagen, specs y CTA. Filtros (operación, tipo, ciudad) encima del mapa. Carga SDK de Maps de forma lazy. Fallback a `data.json` si Firebase no disponible. API: `window.MapaPropiedades`.

- **8-D** `avaluo.html` — Formulario de solicitud de avalúo comercial. Estimación orientativa en tiempo real por ciudad y tipo (precio/m² de mercado). Lead `solicitud_avaluo` → Firestore con fallback FormSubmit. Sidebar con info del proceso y CTA WhatsApp. Validación en tiempo real + honeypot.

- **8-E** `scripts.js` — Reseñas cargadas desde Firestore `resenas` (activa == true, ordenadas por `orden`) con timeout 5s y fallback a `reviews.json`. Espera `altorra:firebase-ready` antes de consultar Firestore.

- **8-F/G/H** `js/push-notifications.js` + `js/newsletter.js` — Push: FCM con VAPID key configurable, `requestPermission()` → `getToken` → guarda en `push_tokens/{token}`, `renderButton()` con toggle de estado. Newsletter: suscripción a alertas por email con criterios (operación, tipo, ciudad, presupuesto máx.), guarda en Firestore `newsletter`, detecta duplicados y reactiva, `renderForm()` widget completo con estado suscrito/no suscrito, fallback FormSubmit AJAX.

**Pendiente (requiere credenciales del propietario):**
- Reemplazar `GMAPS_API_KEY` en `js/mapa-propiedades.js` con key real de Google Maps
- Reemplazar `VAPID_KEY` en `js/push-notifications.js` con key de Firebase Console
- Agregar `measurementId` en `js/firebase-config.js` para GA4

**Commits:** `51a7dc8` (comparador), `4a1cd67` (mapa), `f0ce296` (avalúo), `a76ed11` (reseñas Firestore), `3e0026a` (push + newsletter)

---

### ✅ FASE PREVIA — Dominio y correo (2026-04-09)

**Qué se hizo:**
- Verificado que `altorrainmobiliaria.co` responde HTTP 200 ✅
- CNAME ya estaba correcto en el repo ✅
- Corregidas referencias en **17 archivos** que apuntaban a `altorrainmobiliaria.github.io` → `altorrainmobiliaria.co`
  - `tools/og.config.json`, `tools/generate_og_pages.js`
  - `sitemap.xml` (30+ URLs), `robots.txt`
  - `scripts.js`, `index.html`, `privacidad.html`
  - `contacto.html`, `detalle-propiedad.html`, `publicar-propiedad.html`
  - `.github/workflows/og-publish.yml`
  - `p/*.html` (6 páginas OG generadas)
- Corregido **correo**: `altorrainmobiliaria@gmail.com` → `info@altorrainmobiliaria.co` en 4 archivos

**Commits:** `78e6e9e`, `0e033a6`

---

### ✅ FASE DOC — CLAUDE.md y ALTORRACARSCLAUDE.md (2026-04-09)

**Qué se hizo:**
- Creado `CLAUDE.md` (~1.600 líneas) — guía maestra completa de migración Firebase
- Traído `ALTORRACARSCLAUDE.md` desde rama `main` del repo de Altorra Cars (759 líneas)
- Añadida restricción crítica de costos (plan Blaze, tier gratuito)

**Commits:** `a9d43b3`, `a96986f`, `73c6866`, `722be53`, `f2e8aa9`, `850facb`

---

### ✅ ETAPA 7 — Analytics y Marketing (2026-04-10)

**Qué se hizo:**
- `js/analytics.js` — Reescrito con Firebase Analytics (`logEvent()` GA4) + buffer localStorage permanente (max 500 eventos). Auto-tracking: `page_view`, `whatsapp_click`, `external_click`, `time_on_page`. Helpers públicos: `trackPropertyView()`, `trackSearch()`, `trackFilterApplied()`, `trackFormSubmit()`, `trackFavorite()`. Compatible con API anterior.
- `js/admin-dashboard.js` — Dashboard de stats en el admin: 4 stat-cards (propiedades, leads, pendientes, reseñas), tabla de 5 leads recientes, barras de leads por tipo, top 5 búsquedas, top 5 propiedades más vistas. Usa `Promise.all` para 3 queries en paralelo.
- `js/historial-visitas.js` — Historial de las últimas 10 propiedades visitadas. `localStorage` principal + sync asíncrono con Firestore `favoritos/{uid}/historial`. Renderiza tarjetas con estilos inyectados. API: `AltorraHistorial.{add, get, render, renderSection, clear}`.
- `js/featured-week-banner.js` — Banner de propiedad destacada: selecciona la de mayor `prioridad` + `featured`, cache 1h, rotación semanal por semana ISO. Tarjeta horizontal responsive con CTA. API: `FeaturedBanner.{init, renderBanner, clearCache}`.
- `detalle-propiedad.html` — Llama `AltorraHistorial.add(prop)` al ver cada propiedad.
- `index.html` — Añadidas secciones "Destacada de la semana" (`FeaturedBanner.init`) y "Vistas recientemente" (`AltorraHistorial.renderSection`), activadas por `altorra:db-ready`.

**Pendiente (requiere credenciales):**
- 7-E: Agregar `measurementId: "G-XXXXXXXXXX"` en `js/firebase-config.js` con el ID real de GA4.

**Commits:** `981e2e6`, `5217b5e`, `82c25ec`

---

### ✅ ETAPAS 4, 5 y 6 — Storage + SEO dinámico + Favoritos Firebase (2026-04-10)

**Qué se hizo (Etapa 4 — Imágenes en Cloud Storage):**
- `scripts/migrate-images-to-storage.mjs` — Sube las 5 carpetas locales (`allure/`, `fmia/`, `serena/`, `fotoprop/`, `Milan/`) a `propiedades/{id}/*.webp` en Cloud Storage, actualiza URLs en Firestore. `DRY_RUN=1` para simular.
- `scripts/backup-firestore.mjs` — Exporta todas las colecciones a JSON local con Timestamps convertidos a ISO. Directorio configurable vía `OUTPUT_DIR`.
- `.gitignore` — Creado: `node_modules/`, `backups/`, credenciales (`sa.json`, `serviceAccount.json`, `.env*`), `.DS_Store`.

**Qué se hizo (Etapa 5 — SEO dinámico + GitHub Actions):**
- `scripts/generate-properties.mjs` — Lee propiedades disponibles de Firestore, genera `/p/{id}.html` con OG tags, Twitter Card, JSON-LD `RealEstateListing`, noscript fallback para crawlers. Regenera `sitemap.xml` (páginas estáticas + propiedades). Actualiza `data/deploy-info.json`.
- `.github/workflows/og-publish.yml` — Actualizado con lógica condicional: si hay `GOOGLE_APPLICATION_CREDENTIALS_JSON` secret → usa `generate-properties.mjs` desde Firestore; si no → usa `generate_og_pages.js` desde `data.json` (fallback). Compatibilidad total antes y después de Firebase.

**Qué se hizo (Etapa 6 — Favoritos sincronizados):**
- `js/favorites-manager.js` — Drop-in replacement del sistema de favoritos. Offline-first (siempre localStorage). Si Firebase Auth disponible, autentica anónimamente y sincroniza con `favoritos/{uid}` en Firestore. Merge bidireccional local↔remoto al iniciar. API `window.AltorraFavoritos` idéntica a la anterior.
- `favoritos.html` — Integrado con `favorites-manager.js`: usa `AltorraFavoritos.get/remove/clear`, escucha `altorra:fav-update` para re-renderizar tras sync Firebase. Fallback a localStorage si favorites-manager no cargó.

**Commits:** `9cf87bc`, `7235ed0`, `a101ac1`, `6b69cbe`

---

### ✅ ETAPAS 1, 2 y 3 — Frontend dinámico + Formularios + Panel Admin (2026-04-10)

**Qué se hizo (Etapa 1 — Lectura dinámica):**
- `js/firebase-config.js` — Inicialización Firebase SDK v12.9.0 ESM, carga crítica (Auth+Firestore) en paralelo, carga diferida (Storage/Functions/Analytics/RTDB). Placeholders TODO para credenciales.
- `js/database.js` — Clase `PropertyDatabase` con 3 niveles de carga: Memory → localStorage (TTL 5 min) → Firestore → fallback `data.json`. Normalización Firestore→JS (`titulo→title`, `habitaciones→beds`, etc.). Paginación con `limit(100)`. Eventos: `altorra:db-ready`, `altorra:db-refreshed`.
- `js/cache-manager.js` — Caché 3 capas (Memory/Map, localStorage, IndexedDB). TTL 5 min. Dos señales de invalidación: `onSnapshot system/meta` + polling `data/deploy-info.json` cada 10 min. API: `window.AltorraCache.{get, set, invalidate, clearAndReload}`.
- `js/render.js` — `window.AltorraRender.propertyCard(p)` genera `<article class="card">` con lazy image, badges, fav button, specs, precio. `renderList()`, `showEmpty()`, `showError()`.
- `js/components.js` — Reemplaza `header-footer.js`. `fetch()` simple (sin localStorage). Inyecta `header.html` + `footer.html` + `snippets/modals.html`. Maneja nav desktop y drawer móvil.
- `js/listado-propiedades.js` — Reemplaza `getJSONCached()` por `waitForDB()`. Escucha `altorra:db-refreshed` para re-renderizar sin recargar.
- `scripts.js` — `fetchByOperation()` usa `propertyDB.filter()`. `quicksearch` usa `propertyDB.getById()`.
- **10 páginas HTML** — Añadido `<script type="module" src="js/firebase-config.js">` en `<head>`, reemplazado `header-footer.js` por `database.js + cache-manager.js + components.js`.

**Qué se hizo (Etapa 2 — Formularios → Firestore):**
- `functions/package.json` — Node 20, `firebase-functions ^6`, `firebase-admin ^13`, `nodemailer ^6.9`.
- `functions/index.js` — 6 Cloud Functions: `onNewSolicitud` (email admin), `onSolicitudStatusChanged` (email cliente), `onPropertyChange` (debounce 5 min → GitHub Actions), `triggerSeoRegeneration` (callable), `createManagedUserV2`, `deleteManagedUserV2`. Secrets via `defineSecret()`.
- `js/contact-forms.js` — 3 formularios → Firestore `solicitudes`. `waitForFirebase()` con timeout 8s → fallback FormSubmit. Rate limiting 30s, honeypot, `addDoc`.
- `contacto.html`, `detalle-propiedad.html`, `publicar-propiedad.html` — Limpiados campos FormSubmit, mantenida acción como fallback, añadido `contact-forms.js`.

**Qué se hizo (Etapa 3 — Panel de administración):**
- `admin.html` — SPA con login (`#loginForm`), sidebar (Dashboard/Propiedades/Leads/Reseñas/Usuarios), 5 secciones de contenido (`section-dashboard`, `section-propiedades`, etc.), 4 modales (`propModal`, `leadModal`, `resenaModal`, `userModal`). Todos los IDs coordinados con los módulos JS.
- `css/admin.css` — Layout sidebar fijo 240px, header 60px, tablas, badges de estado, modales, botones, formularios, responsive ≤860px.
- `js/admin-auth.js` — Login Firebase Auth + verificación intentos (bloqueo 5 fallos / 15 min), carga de perfil con retry 3x+backoff (fix bug Cars "Access denied"), RBAC `applyRolePermissions()`, timeout 8h + inactividad 30 min. API: `window.AdminAuth`.
- `js/admin-properties.js` — CRUD Firestore completo: listar (filtros+paginación), crear (slug automático), editar (optimistic locking `_version`), cambiar estado, eliminar (solo super_admin), subida imágenes a Cloud Storage con compresión Canvas API. Invalida `system/meta` tras cambios. API: `window.AdminProperties`.
- `js/admin-leads.js` — Lista leads con filtros, ver detalle, actualizar estado (tabla y modal), badge sidebar de pendientes, `onSnapshot` en tiempo real solo cuando la sección está activa. API: `window.AdminLeads`.
- `js/admin-users.js` — Gestión de usuarios admin (listar, crear via callable, cambiar rol, eliminar). CRUD completo de reseñas (colección `resenas`). Solo accesible para `super_admin`. API: `window.AdminUsers`.

**Commits:** `047092c`, `2a12467`, `74eb0fd`, `0b7c880`, `2b89a16`, `26422fe`, `a03dab0`, `c9668c8`, `f4de6da`, `644bce7`, `8d352ec`, `0ec0d76`, `7e7c400`, `87fd1d6`, `6619d50`, `5968031`, `7bd0c20`, `a819fa3`, `52dcc37`, `6e2c94f`

---

### ✅ ETAPA 0-A — Archivos base Firebase en el repo (2026-04-09)

**Qué se hizo:**
- `firebase.json` — enruta reglas de Firestore, Storage, RTDB y Functions
- `firestore.rules` — RBAC completo: roles super_admin / editor / viewer, locking optimista con `_version`, colecciones públicas y privadas
- `storage.rules` — lectura pública de imágenes, escritura solo para admins autenticados, máximo 5 MB, solo imágenes
- `database.rules.json` — presencia de admin en RTDB con guards de seguridad por sesión
- `package.json` — dependencias: `firebase ^12.9.0`, `firebase-admin ^13`, `sharp ^0.33`
- `data/deploy-info.json` — señal de versión para que el cache-manager detecte nuevos deploys
- `scripts/upload-to-firestore.mjs` — migra las 5 propiedades de `properties/data.json` a Firestore, crea `system/meta`, `config/general` y `config/counters`
- `js/firebase-config.js` — inicialización Firebase SDK v12.9.0 ESM, carga crítica + diferida, placeholders TODO para credenciales
- `.github/workflows/og-publish.yml` — actualizado con triggers `schedule: '0 */4 * * *'` y `repository_dispatch: property-changed`; bump automático de `data/deploy-info.json` en cada deploy

**Commits:** `b46b1d7`, `4e4e7b1`, `047092c`, `2a12467`

---

## PLAN COMPLETO EN MICROFASES

> Cada microfase produce un commit limpio y el sitio nunca queda roto.
> Las microfases marcadas con 🔑 requieren credenciales Firebase del propietario.
> Las marcadas con ⚙️ Claude las puede ejecutar sin credenciales.

---

### ETAPA 1 — Lectura dinámica desde Firestore

**Objetivo:** El frontend lee propiedades de Firestore en vez de `data.json`. El usuario no nota ningún cambio visual.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 1-A | `js/database.js` — clase `PropertyDatabase` con fallback a `data.json` | ⚙️ No |
| 1-B | `js/cache-manager.js` — caché 3 capas (Memory + IndexedDB + localStorage) | ⚙️ No |
| 1-C | `js/render.js` — función `renderPropertyCard()` | ⚙️ No |
| 1-D | `js/components.js` — inyección dinámica de header/footer/modals | ⚙️ No |
| 1-E | Modificar `js/listado-propiedades.js` — reemplazar `fetch data.json` por `propertyDB` | ⚙️ No |
| 1-F | Modificar `scripts.js` — reemplazar carga JSON por `propertyDB` | ⚙️ No |
| 1-G | Añadir `<script type="module" src="js/firebase-config.js">` a todas las páginas HTML | ⚙️ No |
| 1-H | Prueba con datos reales de Firestore — reemplazar TODOs en firebase-config.js | 🔑 Sí |

**Criterio de éxito:** Propiedades cargan desde Firestore, fallback a `data.json` si Firebase no responde.

---

### ETAPA 2 — Formularios → Firestore + email automático

**Objetivo:** Los formularios dejan FormSubmit y guardan leads en Firestore. El admin recibe email.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 2-A | `functions/package.json` + estructura básica de Functions | ⚙️ No |
| 2-B | `functions/index.js` — función `onNewSolicitud` (email al admin via Nodemailer) | ⚙️ No |
| 2-C | `js/contact-forms.js` — lógica de envío a colección `solicitudes` | ⚙️ No |
| 2-D | Modificar `contacto.html` — reemplazar FormSubmit por JS | ⚙️ No |
| 2-E | Modificar `detalle-propiedad.html` — reemplazar FormSubmit por JS | ⚙️ No |
| 2-F | Modificar `publicar-propiedad.html` — reemplazar FormSubmit por JS | ⚙️ No |
| 2-G | Deploy de Functions + configurar secrets `EMAIL_USER`, `EMAIL_PASS` | 🔑 Sí |
| 2-H | `functions/index.js` — añadir `onSolicitudStatusChanged` (email al cliente) | ⚙️ No |

**Criterio de éxito:** Lead aparece en Firestore Console y llega email al admin sin tocar FormSubmit.

---

### ETAPA 3 — Panel de administración

**Objetivo:** El admin gestiona propiedades desde el navegador sin tocar código.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 3-A | `admin.html` + `css/admin.css` — estructura y estilos base | ⚙️ No |
| 3-B | `js/admin-auth.js` — login Firebase Auth, RBAC, timeout de sesión | ⚙️ No |
| 3-C | `js/admin-properties.js` — listar propiedades con estado | ⚙️ No |
| 3-D | `js/admin-properties.js` — formulario crear propiedad nueva | ⚙️ No |
| 3-E | `js/admin-properties.js` — formulario editar propiedad (con `_version`) | ⚙️ No |
| 3-F | `js/admin-properties.js` — cambiar estado (disponible/reservado/vendido) | ⚙️ No |
| 3-G | `js/admin-leads.js` — ver y gestionar solicitudes/leads | ⚙️ No |
| 3-H | `js/admin-users.js` + Cloud Functions `createManagedUserV2` / `deleteManagedUserV2` | ⚙️ No |
| 3-I | Panel de reseñas — CRUD desde Firestore (reemplaza `reviews.json`) | ⚙️ No |
| 3-J | Prueba completa con Firebase real — crear primer usuario super_admin | 🔑 Sí |

**Criterio de éxito:** El admin publica una propiedad nueva desde el navegador y aparece en el sitio.

---

### ETAPA 4 — Imágenes en Cloud Storage

**Objetivo:** Las fotos viven en la nube, no en el repositorio Git.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 4-A | `scripts/migrate-images-to-storage.mjs` — script que sube las imágenes existentes | ⚙️ No (código) / 🔑 Sí (ejecución) |
| 4-B | Subida de las 5 carpetas de imágenes a Storage (`allure/`, `fmia/`, etc.) | 🔑 Sí |
| 4-C | Actualizar URLs en documentos Firestore después de la migración | 🔑 Sí |
| 4-D | Actualizar `js/admin-properties.js` — subida de imágenes a Storage con compresión Canvas API | ⚙️ No |
| 4-E | Eliminar carpetas de imágenes del repo Git (solo tras verificar) | 🔑 Sí |

**Criterio de éxito:** Imágenes cargan desde `storage.googleapis.com`, el repo Git pesa menos.

---

### ETAPA 5 — SEO dinámico + GitHub Actions avanzado

**Objetivo:** Las páginas `/p/*.html` se regeneran automáticamente al cambiar una propiedad en Firestore.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 5-A | `scripts/generate-properties.mjs` — genera `/p/*.html` desde Firestore con OG tags + JSON-LD | ⚙️ No (código) |
| 5-B | Regenerar `sitemap.xml` desde el script | ⚙️ No (código) |
| 5-C | `functions/index.js` — añadir `onPropertyChange` (debounce 5 min → dispara `repository_dispatch`) | ⚙️ No (código) |
| 5-D | `functions/index.js` — añadir `triggerSeoRegeneration` (callable, solo super_admin) | ⚙️ No (código) |
| 5-E | Actualizar `.github/workflows/og-publish.yml` para usar el nuevo script | ⚙️ No |
| 5-F | Configurar secret `GITHUB_PAT` en Firebase Functions | 🔑 Sí |
| 5-G | Prueba end-to-end: cambiar propiedad → Cloud Function → GitHub Actions → `/p/*.html` actualizado | 🔑 Sí |

**Criterio de éxito:** En ~5 minutos tras guardar desde el admin, `/p/{id}.html` refleja los cambios.

---

### ETAPA 6 — Favoritos sincronizados entre dispositivos

**Objetivo:** Los favoritos no se pierden al cambiar de dispositivo.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 6-A | `js/favorites-manager.js` — favoritos con Firebase Anonymous Auth + sync Firestore | ⚙️ No (código) |
| 6-B | Modificar `js/favoritos.js` — integrar `favorites-manager.js` | ⚙️ No |
| 6-C | Modificar `favoritos.html` — cargar desde Firestore en tiempo real | ⚙️ No |
| 6-D | Reglas Firestore para colección `favoritos` | ⚙️ No |
| 6-E | Prueba real — agregar favorito en móvil, verificar en desktop | 🔑 Sí |

**Criterio de éxito:** Favorito agregado en móvil aparece en desktop sin login manual.

---

### ETAPA 7 — Analytics y Marketing

**Objetivo:** Métricas reales de comportamiento de usuarios y herramientas de conversión.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 7-A | Reemplazar `js/analytics.js` (localStorage) por Firebase Analytics `logEvent` | ⚙️ No (código) |
| 7-B | Dashboard en admin: propiedades más vistas, términos de búsqueda, leads por tipo | ⚙️ No (código) |
| 7-C | `js/historial-visitas.js` — últimas propiedades vistas por el usuario | ⚙️ No |
| 7-D | `js/featured-week-banner.js` — banner de propiedad destacada de la semana | ⚙️ No |
| 7-E | Configurar GA4 measurement ID en firebase-config.js | 🔑 Sí |

---

### ETAPA 8 — Mejoras comerciales

**Objetivo:** Funcionalidades que aumentan captación y conversión de clientes.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 8-A | Simulador de crédito hipotecario (tasa, plazo, cuota inicial) | ⚙️ No |
| 8-B | Comparador de propiedades (seleccionar 2-3 y comparar specs) | ⚙️ No |
| 8-C | Mapa de propiedades — Google Maps con markers usando `coords` de Firestore | ⚙️ No |
| 8-D | Calculadora de avalúo básica (genera lead tipo `solicitud_avaluo`) | ⚙️ No |
| 8-E | Reseñas desde Firestore (reemplaza `reviews.json`) | ⚙️ No (código) / 🔑 Sí (datos) |
| 8-F | Sistema de reseñas mejorado con CRUD en admin | ⚙️ No |
| 8-G | Notificaciones push (Firebase Cloud Messaging) | 🔑 Sí |
| 8-H | Newsletter / alertas de propiedades por email | 🔑 Sí |

---

## LO QUE CLAUDE PUEDE HACER SIN CREDENCIALES

Todo el código de las microfases ⚙️ puede escribirse, revisarse y commitearse ahora mismo.
Cuando el propietario tenga Firebase configurado, solo habrá que:

1. Reemplazar los `TODO_*` en `js/firebase-config.js`
2. Ejecutar los scripts de migración (`upload-to-firestore.mjs`, `migrate-images-to-storage.mjs`)
3. Desplegar las Cloud Functions (`firebase deploy --only functions`)
4. Desplegar las reglas (`firebase deploy --only firestore:rules,storage`)

---

## DECISIONES TÉCNICAS TOMADAS

| Decisión | Opción elegida | Razón |
|---|---|---|
| SDK Firebase frontend | Modular v12.9.0 (ESM) | Más moderno, mejor tree-shaking |
| SDK Firebase Node.js | firebase-admin v13 | Consistente con Cars |
| Hosting | GitHub Pages (se mantiene) | Sin costo, ya funciona |
| Imágenes | Cloud Storage (migración gradual en Etapa 4) | Liberar peso del repo |
| Formularios | Firestore `solicitudes` + Cloud Function email | Eliminar dependencia de FormSubmit |
| Favoritos | localStorage ahora, Firestore sync en Etapa 6 | Progresivo, no rompe nada |
| Admin panel | `admin.html` SPA, objeto global `window.IP` | Patrón `window.AP` de Cars adaptado |
| Código único prop. | `INM-YYYYMM-XXXX` (contador atómico Firestore) | Patrón Cars adaptado |
| Deploy de reglas | Manual (`firebase deploy --only firestore:rules`) | Igual que Cars — NO es automático |
| Caché frontend | 3 capas: Memory + IndexedDB + localStorage | Reducir lecturas Firestore |
| Carga propiedades | `limit(9)` paginado, nunca carga TODO | Cumplir tier gratuito Firebase |

---

## ERRORES CONOCIDOS (de Cars — evitar repetirlos aquí)

| Error | Causa | Fix |
|---|---|---|
| "Access denied for UID" al login | Red lenta → error de red tratado como permiso denegado | Retry 3x con backoff antes de signOut |
| RTDB `permission_denied` en presencia | Listeners escribían después de logout | Guards que verifican `auth.currentUser` antes de cada write |
| "Failed to obtain primary lease" Firestore | Múltiples tabs con IndexedDB | `window.clearFirestoreCache()` en consola |
| Modals no funcionan fuera de index.html | HTML hardcodeado solo en index | `loadModalsIfNeeded()` en `components.js` inyecta dinámicamente |
| `set(data, {merge:true})` falla con rules | Rules evalúan ambiguamente el merge | Usar `set()` sin merge para crear, `update()` para editar |
| Widget presencia siempre en "Cargando..." | RTDB rules sin `.read` + sin `.indexOn` | Agregar `.read: "auth != null"` y `.indexOn: ["online"]` a las rules |

---

## SESIÓN 2026-04-14/15 — Catálogo 100% dinámico + UX home

Rama: `claude/review-repo-docs-A5pvR`
Commits clave: `d28437e`, `f5fc70a`, `e9d1dd6`, `1abc74e`

### Contexto

Después del deploy inicial, se detectaron tres síntomas:

1. Una propiedad creada desde el admin **no aparecía** en el sitio público aunque se refrescara la página.
2. La sección "Propiedad destacada de la semana" y el carrusel "Vistas recientemente" mostraban propiedades que ya habían sido **eliminadas** del admin.
3. Al cargar el home sin inventario, los carruseles mostraban "Cargando propiedades…" que **parpadeaba** antes de desaparecer.

El usuario había borrado manualmente `properties/data.json` porque quería que Firestore fuera la **única fuente de verdad**, igual que en Altorra Cars.

### Cambios aplicados

#### A) Catálogo 100% dinámico desde Firestore (`d28437e`)

- Eliminado cualquier `fetch('properties/data.json')` del runtime. Las únicas referencias residuales son comentarios históricos en `js/database.js:40` y `js/smart-search.js:26`.
- `PropertyDatabase` (en `js/database.js`) carga únicamente desde Firestore; sin fallback a JSON estático.
- `js/smart-search.js` ahora consulta `window.propertyDB` en vez de un JSON local.
- `scripts/upload-to-firestore.mjs` sigue existiendo pero solo como herramienta puntual de seed inicial; no se llama en runtime.

#### B) Sync admin → público en vivo (`d28437e`, `f5fc70a`)

Se cableó una red de eventos globales para que cualquier cambio en Firestore se propague al frontend público sin recargar:

| Evento | Emisor | Propósito |
|---|---|---|
| `altorra:firebase-ready` | `js/firebase-config.js` | Firebase SDK inicializado |
| `altorra:db-ready` | `js/database.js` | Primera carga de propiedades completa |
| `altorra:db-refreshed` | `js/database.js` (onSnapshot sobre `system/meta.lastModified`) | Hubo cambios en el catálogo |
| `altorra:cache-invalidated` | `js/cache-manager.js` | Invalidación manual o por versión de deploy |

**Consumidores** (ya no usan `{ once: true }` para mantenerse escuchando):

- `js/listado-propiedades.js` — repinta la grilla completa
- `scripts.js` — refresca los 3 carruseles del home
- `js/featured-week-banner.js` — recalcula y muestra/oculta destacada
- `js/historial-visitas.js` — **prune** contra DB viva: si una propiedad del historial ya no existe en Firestore, la elimina de `localStorage`
- `js/smart-search.js` — invalida índice
- `js/mapa-propiedades.js`, `js/comparador.js`, `detalle-propiedad.html`, `index.html`

#### C) Ocultar secciones vacías (no dejar huecos) (`f5fc70a`)

Los módulos de home esconden la sección entera cuando no hay datos en vez de mostrar un contenedor con título vacío:

- Destacada semana: `featured-week-banner.js:199-206` → si no hay propiedad viable, `container.style.display='none'` + `section.style.display='none'`.
- Historial: `historial-visitas.js` → misma lógica en `renderSection()`.

#### D) Reseñas movidas al Quiénes somos (`e9d1dd6`)

Reorganización de IA de página:

- **Eliminada** sección "Nuestro equipo" (Daniel Romero / Guido Rodriguez / Yesit Romero) de `quienes-somos.html`.
- **Movida** la sección "Opiniones de nuestros clientes" desde `index.html` hacia `quienes-somos.html`, en el slot que ocupaba el equipo.
- Añadido `scripts.js` como dependencia de `quienes-somos.html` para que la lógica de carga de reseñas (Firestore → fallback `reviews.json`) funcione también allí.
- `header.html`: el link "Nuestro equipo" (apuntaba a `#equipo`, ancla ya inexistente) se cambió a "Reseñas" apuntando a `quienes-somos.html#reseñas`.

#### E) Fix parpadeo "Cargando propiedades…" en home (`1abc74e`)

Problema: el HTML renderizaba los 5 bloques del home (Venta/Arriendo/Días/Destacada/Historial) visibles con placeholder "Cargando…", luego el JS consultaba Firestore y si no había resultado ocultaba la sección. Esto producía un flash de ~500ms con UI que desaparecía.

Fix: las cinco secciones ahora arrancan con `style="display:none"` inline. El JS las revela con `section.style.display = ''` únicamente cuando Firestore devuelve datos reales. Se eliminaron los `<div class="loading">Cargando propiedades...</div>` porque ya no se ven nunca.

Resultado: cuando hay inventario las secciones aparecen limpias al llegar los datos; cuando no hay, nunca se pintan.

### Estado final de los módulos

```
Catálogo:              Firestore (única fuente)
data.json:             Eliminado del filesystem
Sync admin→público:    Eventos globales, sin recarga
Historial local:       Pruning automático contra DB viva
Destacada semana:      Validada contra DB, se oculta si no hay
Home vacío:            Sin flash, sin placeholders huérfanos
Reseñas:               En quienes-somos.html#reseñas
Menú "Nuestro equipo": Reemplazado por "Reseñas"
```

### Lo que NO se tocó (intencional)

- Los comentarios en `js/database.js:40` y `js/smart-search.js:26` que mencionan `data.json` — son historia del refactor, no referencias vivas.
- El schema Firestore (colecciones `propiedades`, `solicitudes`, etc.) — sin cambios.
- Las reglas de seguridad (`firestore.rules`, `storage.rules`) — sin cambios.
- Cloud Functions — siguen con el estado parcial descrito en `DEPLOY-RUNBOOK.md`.

### Pendientes derivados de esta sesión

- [ ] Si el usuario percibe el rato en blanco como largo cuando SÍ hay inventario, considerar skeleton cards animadas en lugar de espacio vacío.
- [ ] Verificar que al crear una propiedad desde admin, `system/meta.lastModified` se actualiza correctamente (es lo que dispara el `onSnapshot`). Si no, la sincro en vivo no funciona.
- [ ] Monitorear el límite de lecturas Firestore — cada refresh en vivo dispara una recarga del catálogo. Con tráfico alto podría acercarse a las 50K lecturas/día del tier gratuito.

---

## PENDIENTE DEL PROPIETARIO (tarea humana)

Estas tareas no las puede hacer Claude — requieren acceso a la consola de Firebase y cuentas del negocio:

- [x] Crear proyecto Firebase `altorra-inmobiliaria-345c6` ✅
- [x] Activar: Firestore, Authentication, Storage, Realtime Database ✅
- [x] Copiar credenciales Firebase en `js/firebase-config.js` ✅
- [x] Crear primer usuario super_admin en Firebase Auth ✅
- [x] Crear documento `usuarios/{uid}` con `{ rol: "super_admin" }` ✅
- [x] Configurar secrets: `EMAIL_USER`, `EMAIL_PASS`, `GITHUB_PAT` ✅
- [ ] ⚠️ Completar deploy de Cloud Functions (ver Etapa 0-C — fix permisos Eventarc)
- [ ] Ejecutar `node scripts/upload-to-firestore.mjs` para subir las 5 propiedades
- [ ] Configurar secret `GOOGLE_APPLICATION_CREDENTIALS_JSON` en GitHub Actions
- [ ] Reemplazar `GMAPS_API_KEY` en `js/mapa-propiedades.js` con key real de Google Maps
- [ ] Reemplazar `VAPID_KEY` en `js/push-notifications.js` con key de Firebase Console

---

*Última actualización: 2026-04-15*
