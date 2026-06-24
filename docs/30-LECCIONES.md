# 🧪 30 — LECCIONES (Memoria Procedimental · Altorra Inmobiliaria)

> Trigger de Experiencia (§G.2): ANTES de una op riesgosa/repetitiva o si un síntoma "te suena". Gotchas + recetas.
> Formato `### L-NN — <título>` (disparador + causa + fix). Varias son **heredadas de Altorra Cars** (mismo patrón
> arquitectónico) — destiladas de `_legacy/AVANCES.md §"ERRORES CONOCIDOS"`.

---

## Lecciones (L-NN)

### L-01 — "Access denied for UID" al login (red lenta ≠ permiso denegado)
**Disparador**: el login falla intermitentemente con "access denied". **Causa**: un error de RED se trató como permiso
denegado y se hizo `signOut`. **Fix**: **retry 3× con backoff ANTES de `signOut`** — no asumir denegado a la primera.

### L-02 — RTDB `permission_denied` en presencia
**Disparador**: el widget de presencia se queda "Cargando…" o tira `permission_denied`. **Causa**: (a) listeners que
escriben a RTDB DESPUÉS del logout; (b) RTDB rules sin `.read` ni `.indexOn`. **Fix**: guards que verifican
`auth.currentUser` antes de CADA write a RTDB; en las rules de presencia: `.read: "auth != null"` + `.indexOn: ["online"]`.

### L-03 — Firestore "Failed to obtain primary lease"
**Disparador**: error de lease en Firestore. **Causa**: múltiples tabs compartiendo IndexedDB. **Fix**:
`window.clearFirestoreCache()` desde consola.

### L-04 — `set(data, {merge:true})` falla con las security rules
**Disparador**: un guardado con `merge:true` es rechazado por reglas. **Causa**: las rules evalúan ambiguamente el merge.
**Fix**: usar **`set()` SIN merge para CREAR**, **`update()` para EDITAR** (concurrencia optimista `_version`: create==1, update==prev+1 vía `runTransaction`).

### L-05 — Modals no funcionan fuera de `index.html`
**Disparador**: un modal no abre en una página que no es el index. **Causa**: HTML de modals hardcodeado solo en index.
**Fix**: `loadModalsIfNeeded()` en `components.js` los inyecta dinámicamente (id `modals-container`).

### L-06 — Invalidación de cache en tiempo real cross-pestañas (`system/meta` → onSnapshot)
**Disparador**: vas a tocar el flujo de invalidación de cache, el listener de `system/meta`, las reglas de `system`, o un
admin reporta "edité una propiedad pero el sitio público no se actualiza". **Cadena E2E** (la fuente de verdad):
```
admin-properties.js:touchSystemMeta()  (tras crear/editar/cambiar-estado/borrar)
  → setDoc('system/meta', {lastModified: serverTimestamp()})
  → onSnapshot dispara en TODAS las pestañas → cache-manager.js:startMetaListener()
  → invalidate() (memClear+lsClear+idbClear) + propertyDB.refresh() + dispatchEvent('altorra:cache-invalidated')
  → listado-propiedades.js / scripts.js (bindRefreshListener) re-renderizan  → usuario ve el cambio en < 5s
```
**Diagnóstico por log**: `touchSystemMeta permission-denied` → reglas bloquearon el write (revisar `firestore.rules`
regla `system/{docId}` — debe permitir write a editor/super_admin; **la línea exacta puede desincronizarse, leer el archivo
real**, §3.3); `onSnapshot system/meta permission-denied` → la regla **read de `system` debe ser `allow read: if true``**;
sin log `[AltorraCache]` → `cache-manager.js` no se cargó; se ve el log pero la UI no cambia → falta `bindRefreshListener()`.
**Verificación consola**: pública `window.AltorraCache.info()` (`meta:'sin escuchar'` ⇒ onSnapshot no arrancó → `.invalidate()`).
> Procedimiento manual completo (con snippet de touch manual) → `tests/MANUAL-meta-snapshot.md`.

### L-07 — Primer deploy de Cloud Functions 2nd gen falla por Eventarc
**Disparador**: deploy de CF con triggers (`onNewSolicitud`, etc.) falla con error 400 "Eventarc Service Agent permission
denied / Invalid resource state". **Causa**: en el 1er deploy 2nd gen los permisos de Eventarc/Cloud Build se están
propagando. **Fix**: (a) Opción A — esperar 5-10 min y reintentar (suele auto-resolverse); (b) si persiste, otorgar en IAM
`roles/eventarc.serviceAgent` a `service-<projNum>@gcp-sa-eventarc.iam.gserviceaccount.com` y `roles/cloudbuild.builds.builder`
a `<projNum>@cloudbuild.gserviceaccount.com`, habilitar APIs cloudbuild/eventarc/run/pubsub. Cuentas exactas → `50-CONFIG-INFRA`.

---

## Guardarraíles de diseño (vinculantes)
- **Carga de propiedades**: SIEMPRE `limit(9)` paginado, NUNCA todo el catálogo (free-tier).
- **Caché frontend 3 capas**: Memory + IndexedDB + localStorage (reducir lecturas Firestore); TTL 5 min CRÍTICO.
- **Deploy de reglas es MANUAL** (`firebase deploy --only firestore:rules`) — NO automático.
- **Formularios** → Firestore `solicitudes` + Cloud Function email (eliminar dependencia de FormSubmit). ⚠️ Gap J2: quedaban `action` FormSubmit residuales → riesgo doble envío (verificar, `10` TODO-01).

---

## §Meta — meta-aprendizajes del propio cerebro
> (Vacío al instalar. Se llena cuando el cerebro contribuya a un error — Reflejo de Autocrítica §G.4.)

## 🧭 Decisiones de gobernanza 2026-06-24 (operador-cars → ×4 cerebros) [HONOR]
> De la sesión cars (PLAN UNIFICADO, cars §237). Mismo dueño/operación en los 4 repos.
1. **La extensión Claude-in-Chrome la maneja CLAUDE directamente** (no relay): tras merge+~5min de deploy el dueño avisa y Claude conduce la validación live SOLO (es los OJOS), caza diseño/bugs/regresiones. Skill `validacion-live-chrome` modo (b) = DEFAULT con navegador conectado. Login/credenciales = solo el dueño; cambios locales no-deployados → `preview_*`.
2. **NO preguntar "qué sigue" en un plan ya hecho + revisado estratégicamente por mí** (survey/comité/Gemini/arquitecto): yo manejo el ORDEN técnico; solo interrumpo por decisiones del DUEÑO (dinero/legal/go-no-go/irreversible) o su verificación final. Refuerzo emphático del dueño 24/06. Hablarle SIEMPRE en cristiano (es no-técnico).
3. **Un workflow/comité ACOTADO (in-cwd read-only, sin git, sin lecturas fuera de cwd) NO se cuelga** — lo que cuelga es la lectura GATEADA por permiso (git/fuera-de-cwd), NO el fan-out acotado en sí (survey de 5 agentes corrió limpio). La maquinaria pesada (comité/Gemini/workflow) se usa para Decisión Fuerte, acotada.
4. **Verificar TODO claim de un asesor externo (Gemini) contra el código** antes de adoptar — la joya: en cars Gemini revirtió su propio verdicto previo y sus 6 claims se confirmaron leyendo el código. Insumo, no oráculo.
