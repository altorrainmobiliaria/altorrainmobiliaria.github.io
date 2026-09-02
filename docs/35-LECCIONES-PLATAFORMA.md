# 🧩 35 — LECCIONES DE PLATAFORMA (hoja hija de `30-LECCIONES`)

> **Gotchas de INFRAESTRUCTURA ya pagados** (`L-01`..`L-21`): Firebase (Auth, RTDB, Firestore, Rules,
> emulador), Cloud Functions gen2, Cloudflare (Workers, cachés, wrangler), Astro y su adapter, el REST
> de Firestore, y GitHub Pages. Son la era de **Ola 0**: se aprendieron montando la plataforma y se
> consultan cuando se vuelve a tocar esa capa, no en el trabajo del día a día.
>
> **Por qué viven aquí y no en `30`**: `30` reventó su tope (§G.5) y este era el grupo con frontera más
> limpia — una capa entera, no un recorte arbitrario. En `30` queda un PUNTERO por lección, así que
> cualquier `[[L-NN]]` de este rango sigue resolviendo desde allí (es lo que comprueba `brain:check` #5).
>
> ⚠️ Al añadir una lección de plataforma nueva, va AQUÍ y su puntero a `30`. Las dos cosas, o el
> siguiente lector no la encuentra.

---
### L-01 — "Access denied for UID" al login (red lenta ≠ permiso denegado)
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-01]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-02 — RTDB `permission_denied` en presencia
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-02]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-03 — Firestore "Failed to obtain primary lease"
**Disparador**: error de lease en Firestore. **Causa**: múltiples tabs compartiendo IndexedDB. **Fix**:
`window.clearFirestoreCache()` desde consola.

### L-04 — ⚗️ FUSIONADA en L-09 (merge:true vs rules/upsert) — regla viva **aquí, en L-09**: `set()` SIN merge para CREAR, `update()` para EDITAR (el puntero apuntaba a `CLAUDE.md §3.5`, que se mudó a `34-DOCTRINA-CODIGO` en la poda §84; el dueño del hecho siempre fue L-09)

### L-05 — ⚰️ (sitio viejo retirado §15) Modals inyectados fuera de index → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md`

### L-06 — ⚰️ (sitio viejo retirado §15) Invalidación de cache `system/meta`→onSnapshot → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md` (resucitar si el cutover reusa SW/onSnapshot)

### L-07 — Primer deploy de Cloud Functions 2nd gen falla por Eventarc
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-07]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-08 — Reglas Firestore: leer un campo AUSENTE de `resource.data` LANZA (no es null) *(importada de cars — sinapsis 2026-07-10)*
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-08]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-09 — Upsert de ingestión: `merge:true` PISA los campos presentes y NO borra los ausentes *(importada de cars — sinapsis 2026-07-10; ABSORBE L-04)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-09]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-10 — Un GET público linkeado por WhatsApp/email JAMÁS muta estado *(importada de cars — sinapsis 2026-07-10)*
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-10]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-11 — Cloud Functions gen2: tres gotchas de operación que se ven como bugs *(importadas de bersaglio — sinapsis 2026-07-10)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-11]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-13 — GitHub Pages (deploy-from-branch): sin `.nojekyll` Jekyll construye TODO el repo — y si falla, PRODUCCIÓN SE CONGELA EN SILENCIO
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-13]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-12 — Dinero (arriendos/comisiones/pagos): método ANTES de construir *(sinapsis 2026-07-10)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-12]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-14 — Stack que evoluciona rápido (Astro/adapter CF): verificar versión y config contra DOCS, no de memoria *(Ola 0.1, ADR §19)*
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-14]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-15 — Windows: `wrangler dev` deja un `workerd.exe` huérfano que bloquea `dist/` *(Ola 0.1)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-15]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
### L-16 — Cloudflare Workers, primer deploy: registrar el subdominio `workers.dev` ANTES *(relato → §21)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-16]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
### L-17 — Decodificar el REST de Firestore: mapas/arrays VACÍOS y despacho por clave *(Ola 0.7, ADR §22)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-17]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-18 — Cloudflare: DOS cachés distintas; en `workers.dev` solo sirve **Workers Caching** *(Ola 0.7, ADR §22 / sello T8)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-18]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-19 — `@astrojs/cloudflare` v14: `locals.runtime` deprecado/sin tipo; `platformProxy` removido *(Ola 0.7, ADR §22)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-19]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-20 — Firestore Rules: un `get` de doc INEXISTENTE con `resource.data` en la regla → 403, no 404 *(Ola 0.7, ADR §22, confirmado T6 emulador)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-20]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-21 — Aislar tests que comparten un emulador Firestore: projectId PROPIO por archivo *(Ola 0.7, ADR §22.8, confirmado en vivo)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-21]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-55 — 🧬 Varias copias del MISMO SDK = varios registros, y el error no menciona versiones *(2026-08-25, §141)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-55]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-53 — 🔐 Firebase MFA (TOTP): cuatro conductas que sorprenden y una que NO existe *(2026-08-25, §137)*
⇒ **Migrada al maestro** (F2 lote 13): [[INMO:L-53]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-54 — 🌩️ Los tipos de Cloudflare Workers PISAN el DOM: `Element.append` deja de ser la del navegador *(2026-08-25, §138)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-54]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-49 — La configuración de la CONSOLA es parte del sistema y NO está en el repo: ningún gate puede verla *(TODO-47, ADR §129)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-49]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-60 — 🔀 Antes de desplegar un TRIGGER, mira quién más escucha ese evento y qué escribe *(§199)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-60]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
