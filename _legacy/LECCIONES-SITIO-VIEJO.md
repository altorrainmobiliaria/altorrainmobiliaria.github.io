# ⚰️ Lecciones del SITIO PÚBLICO VIEJO (retirado, ADR §15) — cuarentena §G.4

> Movidas ÍNTEGRAS desde `docs/30-LECCIONES.md` en la auditoría Nivel-2 #4 (§49, 2026-07-20).
> Aplicaban al sitio público legacy (retirado 2026-07-10, modo obra). **Resucitar a `30` si el
> cutover del portal reusa SW/onSnapshot/inyección de modals.** `admin.html` (consulta) NO las usa.

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

### Guardarraíl legacy (del bloque "Guardarraíles de diseño" de `30`)
**Formularios del sitio viejo** → gap J2: quedaban `action` FormSubmit residuales (riesgo doble envío). Pertenecía a
TODO-01 (obsoleto en bloque por §15). El portal nuevo NO usa FormSubmit: forms → Firestore `solicitudes` + CF email.
