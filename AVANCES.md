# AVANCES.md — Altorra Inmobiliaria
## Bitácora de implementación hacia plataforma dinámica con Firebase

> Documento de seguimiento. Se actualiza con cada fase completada.
> Referencia técnica: ver `CLAUDE.md` y `ALTORRACARSCLAUDE.md`.

---

## ESTADO GENERAL

```
Etapa 0 — Preparación Firebase:        🔄 En progreso
Etapa 1 — Lectura dinámica Firestore:  ⏳ Pendiente
Etapa 2 — Formularios → Firestore:     ⏳ Pendiente
Etapa 3 — Panel de administración:     ⏳ Pendiente
Etapa 4 — Imágenes en Cloud Storage:   ⏳ Pendiente
Etapa 5 — SEO dinámico + CI/CD:        ⏳ Pendiente
Etapa 6 — Favoritos sincronizados:     ⏳ Pendiente
Etapa 7 — Analytics y Marketing:       ⏳ Pendiente
Etapa 8 — Mejoras comerciales:         ⏳ Pendiente
```

---

## REGISTRO DE FASES COMPLETADAS

---

### ✅ FASE PREVIA — Dominio y correo (2026-04-09)

**Qué se hizo:**
- Verificado que el dominio `altorrainmobiliaria.co` responde HTTP 200 ✅
- CNAME ya estaba correcto en el repo ✅
- Corregidas **17 archivos** que aún apuntaban a `altorrainmobiliaria.github.io` → `altorrainmobiliaria.co`
  - `tools/og.config.json`, `tools/generate_og_pages.js`
  - `sitemap.xml`, `robots.txt`
  - `scripts.js`, `index.html`, `privacidad.html`
  - `contacto.html`, `detalle-propiedad.html`, `publicar-propiedad.html`
  - `.github/workflows/og-publish.yml`
  - `p/*.html` (6 páginas OG generadas)
- Corregido el **correo**: `altorrainmobiliaria@gmail.com` → `info@altorrainmobiliaria.co` en 4 archivos:
  - `contacto.html`, `detalle-propiedad.html`, `publicar-propiedad.html`, `privacidad.html`

**Commits:**
- `78e6e9e` — fix(domain): actualizar todas las URLs de github.io al dominio personalizado
- `0e033a6` — fix(email): reemplazar correo gmail por info@altorrainmobiliaria.co

**Estado:** ✅ Completado

---

### ✅ FASE DOC — CLAUDE.md y ALTORRACARSCLAUDE.md (2026-04-09)

**Qué se hizo:**
- Creado `CLAUDE.md` (guía maestra de migración, ~1.600 líneas) con:
  - Sección 1: Contexto, objetivo y **restricción de costos Firebase plan Blaze**
  - Sección 2: Estado actual del repo (estructura, JS, formularios, limitaciones)
  - Sección 3: Arquitectura de referencia de Altorra Cars
  - Sección 4: Schema Firestore completo + config Firebase + reglas de seguridad
  - Sección 5: Plan de migración 9 etapas
  - Sección 6: Convenciones de código y reglas del proyecto
- Traído `ALTORRACARSCLAUDE.md` desde el repo de Altorra Cars (759 líneas)
  - Documenta sistema de presencia RTDB, drafts, migración de schema, errores conocidos

**Commits:**
- `a9d43b3` — docs(claude): fase 1
- `a96986f` — docs(claude): fase 2
- `73c6866` — docs(claude): fase 3
- `722be53` — docs(claude): fase 4
- `f2e8aa9` — docs(claude): fase 5
- `850facb` — docs(claude): restricción de costos Firebase plan Blaze

**Estado:** ✅ Completado

---

### 🔄 ETAPA 0-A — Archivos de configuración Firebase (2026-04-09)

**Objetivo:** Crear la estructura base de Firebase en el repo sin tocar el frontend.

**Qué se está haciendo:**
- [ ] `ALTORRACARSCLAUDE.md` — traído al repo ✅
- [ ] `AVANCES.md` — creado (este archivo) ✅
- [ ] `firebase.json` — config de reglas y functions
- [ ] `firestore.rules` — reglas de seguridad RBAC
- [ ] `storage.rules` — reglas Cloud Storage
- [ ] `package.json` — deps: firebase v12.9.0, firebase-admin, sharp
- [ ] `data/deploy-info.json` — señal de versión para cache-manager
- [ ] `scripts/upload-to-firestore.mjs` — migra las 5 propiedades de data.json a Firestore

**Pendiente del dueño del proyecto:**
- [ ] Crear proyecto Firebase `altorra-inmobiliaria` en Firebase Console
- [ ] Activar: Firestore, Authentication, Storage, Functions, RTDB, Analytics
- [ ] Crear primer usuario super_admin en Firebase Auth
- [ ] Compartir credenciales (apiKey, authDomain, projectId, etc.)

**Estado:** 🔄 En progreso

---

## DECISIONES TÉCNICAS TOMADAS

| Decisión | Opción elegida | Razón |
|---|---|---|
| SDK Firebase frontend | Modular v12.9.0 (ESM) | Más moderno, mejor tree-shaking |
| SDK Firebase Node.js | Modular v12.9.0 (firebase-admin v13) | Consistente con Cars |
| Hosting | GitHub Pages (se mantiene) | Sin costo, ya funciona |
| Imágenes | Cloud Storage (migración gradual) | Liberar peso del repo |
| Formularios | Firestore `solicitudes` + Cloud Function email | Eliminar dependencia de FormSubmit |
| Favoritos | localStorage ahora, Firestore sync después (Etapa 6) | Progresivo, no rompe nada |
| Admin panel | `admin.html` SPA, objeto global `window.IP` | Patrón `window.AP` de Cars adaptado |
| Código único prop. | `INM-YYYYMM-XXXX` (contador atómico Firestore) | Patrón Cars adaptado |
| Deploy rules | Manual (`firebase deploy --only firestore:rules`) | Igual que Cars — NO es automático |

---

## ERRORES CONOCIDOS (heredados de Cars — evitar repetirlos)

| Error | Causa | Fix |
|---|---|---|
| "Access denied for UID" al login | Red lenta → trataba error de red como permiso denegado | Retry 3x con backoff antes de signOut |
| RTDB `permission_denied` en presencia | Listeners escribían después de logout | Guards que verifican `auth.currentUser` antes de cada write |
| "Failed to obtain primary lease" Firestore | Múltiples tabs con IndexedDB | `window.clearFirestoreCache()` en consola |
| Modals no funcionan fuera de index.html | HTML hardcodeado solo en index | `loadModalsIfNeeded()` en `components.js` inyecta dinámicamente |
| `set(data, {merge:true})` falla en rules | Rules evalúan ambiguamente | Usar `set()` sin merge para crear, `update()` para editar |

---

## PENDIENTE DEL DUEÑO DEL PROYECTO

- [ ] Crear proyecto Firebase `altorra-inmobiliaria` en [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Activar servicios: Firestore, Authentication (email/pass), Storage, Functions, RTDB, Analytics
- [ ] Crear primer super_admin en Firebase Auth Console
- [ ] Compartir `firebaseConfig` object con las credenciales del proyecto
- [ ] Configurar secrets en GitHub Actions: `GOOGLE_APPLICATION_CREDENTIALS`, `GITHUB_PAT`
- [ ] Configurar secrets en Firebase Functions: `EMAIL_USER`, `EMAIL_PASS`, `GITHUB_PAT`

---

*Última actualización: 2026-04-09*
