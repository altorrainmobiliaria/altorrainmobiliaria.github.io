# AVANCES.md — Altorra Inmobiliaria
## Bitácora de implementación hacia plataforma dinámica con Firebase

> Documento vivo. Se actualiza con cada microfase completada.
> Última actualización: 2026-04-09

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
Etapa 0-A   — Archivos base Firebase:      ✅ Completado (esperando credenciales)
Etapa 0-B   — Credenciales + primer deploy: ⏸️  Bloqueado (tarea del propietario)
Etapa 1     — Lectura dinámica Firestore:  ⏳ Pendiente (no requiere credenciales aún)
Etapa 2     — Formularios → Firestore:     ⏳ Pendiente
Etapa 3     — Panel de administración:     ⏳ Pendiente
Etapa 4     — Imágenes en Cloud Storage:   ⏳ Pendiente
Etapa 5     — SEO dinámico + CI/CD:        ⏳ Pendiente
Etapa 6     — Favoritos sincronizados:     ⏳ Pendiente
Etapa 7     — Analytics y Marketing:       ⏳ Pendiente
Etapa 8     — Mejoras comerciales:         ⏳ Pendiente
```

---

## REGISTRO DE FASES COMPLETADAS

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

## PENDIENTE DEL PROPIETARIO (tarea humana)

Estas tareas no las puede hacer Claude — requieren acceso a la consola de Firebase y cuentas del negocio:

- [ ] Crear proyecto Firebase `altorra-inmobiliaria` en [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Activar: Firestore, Authentication (email/pass), Storage, Functions, Realtime Database, Analytics
- [ ] Copiar `firebaseConfig` (apiKey, messagingSenderId, appId, measurementId) y compartirlo
- [ ] Descargar service account JSON para scripts Node.js
- [ ] Ejecutar `GOOGLE_APPLICATION_CREDENTIALS=./sa.json node scripts/upload-to-firestore.mjs`
- [ ] Crear primer usuario super_admin en Firebase Auth Console
- [ ] Crear documento `usuarios/{uid}` con `{ rol: "super_admin", activo: true }` en Firestore
- [ ] Configurar secrets en GitHub Actions: `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Configurar secrets en Firebase Functions: `EMAIL_USER`, `EMAIL_PASS`, `GITHUB_PAT`

---

*Última actualización: 2026-04-09*
