# 🗄️ Lecciones MIGRADAS AL CEREBRO MAESTRO — cuarentena §G.4 (cuerpo íntegro)

> Estas lecciones **no se han perdido ni se han editado**: su cuerpo íntegro está aquí y su copia
> consultable vive en el maestro (`brain-private/maestro/lecciones/migradas/INMO/<ID>.md`), donde
> se lee desde CUALQUIER proyecto. En `docs/30-LECCIONES.md` sigue su titular —que es lo que hace
> resolver cualquier `[[L-NN]]` del repo— y en `docs/35-LECCIONES-PLATAFORMA.md`, su stub.
>
> **Para qué sirve este fichero**: es el punto de retorno. El ABORT del lote reconstruye el cuerpo
> DESDE AQUÍ, a propósito y no con `git checkout` — un checkout restaura blobs de git y no probaría
> nada del mecanismo (`brain-private/cerebro-maestro/ENSAYO-ROLLBACK-F2.md §5`).

> Lote 1 · migrado 2026-09-01 · 6 lecciones.

---
> Origen: INMO `docs/35-LECCIONES-PLATAFORMA.md` (titular en `docs/30-LECCIONES.md`) · importada de CARS y pagada en INMO §15.2(b) (payload sinapsis L-08..L-12 aplicado a `30`) · migrado 2026-09-01 lote 1

### L-08 — Reglas Firestore: leer un campo AUSENTE de `resource.data` LANZA (no es null) *(importada de cars — sinapsis 2026-07-10)*
**Disparador**: una regla con `resource.data.x == null` o que compara `_version` falla con `Property x is undefined` al tocar docs viejos/seed. **Causa**: en rules, acceder a una clave inexistente es un evaluation-error, NO `null` — y el `||` no rescata (el primer operando ya lanzó). **Fix**: guardar la PRESENCIA antes de leer: `!('x' in resource.data) || resource.data.x is T`, o `resource.data.get('x', default)`. En los tests de rules, sembrar también docs LEGACY sin el campo — los tests que siempre lo siembran esconden el bug (a cars le duró meses).

> Origen: INMO `docs/35-LECCIONES-PLATAFORMA.md` (titular en `docs/30-LECCIONES.md`) · pagada en INMO §15 (`.nojekyll`; producción llevaba congelada desde antes del 2026-07-10) · migrado 2026-09-01 lote 1

### L-13 — GitHub Pages (deploy-from-branch): sin `.nojekyll` Jekyll construye TODO el repo — y si falla, PRODUCCIÓN SE CONGELA EN SILENCIO
**Disparador**: pusheas a `main` y el dominio sigue sirviendo contenido viejo; o el `deploy-info` live está meses atrás. **Causa**: Pages corre "Build with Jekyll" sobre el repo ENTERO (`docs/`, `_legacy/`, `skills/`, node_modules committeados); un archivo que Jekyll no traga rompe el build → deploy `skipped` → el dominio sirve el ÚLTIMO build exitoso, sin síntoma visible (descubierto 2026-07-10: fallaba desde ANTES de la sesión; el deploy-info live era de mayo). **Fix**: (a) `.nojekyll` en la raíz = deploy crudo (lo correcto para un sitio estático puro); (b) verificar deploy con SENTINELA ÚNICA del contenido nuevo + cache-buster `?cb=` — grep de un string que ya existía en el sitio viejo = falso positivo (pasó con `info@…`); (c) el estado real del build vive en la API pública de Actions (`…/actions/runs` + `jobs_url`, sin token) — JAMÁS asumir "push = deployado" (§3.3).

> Origen: INMO `docs/35-LECCIONES-PLATAFORMA.md` (titular en `docs/30-LECCIONES.md`) · pagada en INMO §19 (Ola 0.1, scaffold del portal — el ADR cierra su §19.1 con «(→ L-14)») · migrado 2026-09-01 lote 1

### L-14 — Stack que evoluciona rápido (Astro/adapter CF): verificar versión y config contra DOCS, no de memoria *(Ola 0.1, ADR §19)*
**Disparador**: scaffold nuevo de un stack sellado (Astro + `@astrojs/cloudflare`). **Trampa**: pinear versiones o escribir la config de memoria. Realidad 2026-07-10: `@latest` trajo Astro **7** / adapter **v14** / wrangler 4.110 / TS 7 — mayores más nuevos que el cutoff. **Gotcha load-bearing**: en Astro **6+** el `main` del `wrangler.jsonc` apunta al **entrypoint unificado** `@astrojs/cloudflare/entrypoints/server` (resuelve en `node_modules` en build-time), NO a `dist/server/entry.mjs` (no existe aún → `@cloudflare/vite-plugin` lanza "main doesn't point to an existing file"). El adapter LEE el `wrangler.jsonc` raíz y FUSIONA los bindings en el `dist/server/wrangler.json` generado. **Receta**: instalar `@latest` → build real → inspeccionar el `dist/server/wrangler.json` generado (ground truth) → `wrangler deploy --dry-run` (valida offline, sin cuenta CF) → `wrangler dev` para verificar SSR+estática en vivo. Docs: context7 `/withastro/docs` + cloudflare-docs MCP.

> Origen: INMO `docs/35-LECCIONES-PLATAFORMA.md` (titular en `docs/30-LECCIONES.md`) · pagada en INMO §01 (etapa 0-C, primer deploy de Cloud Functions 2nd gen) · migrado 2026-09-01 lote 1

### L-07 — Primer deploy de Cloud Functions 2nd gen falla por Eventarc
**Disparador**: deploy de CF con triggers (`onNewSolicitud`, etc.) falla con error 400 "Eventarc Service Agent permission
denied / Invalid resource state". **Causa**: en el 1er deploy 2nd gen los permisos de Eventarc/Cloud Build se están
propagando. **Fix**: (a) Opción A — esperar 5-10 min y reintentar (suele auto-resolverse); (b) si persiste, otorgar en IAM
`roles/eventarc.serviceAgent` a `service-<projNum>@gcp-sa-eventarc.iam.gserviceaccount.com` y `roles/cloudbuild.builds.builder`
a `<projNum>@cloudbuild.gserviceaccount.com`, habilitar APIs cloudbuild/eventarc/run/pubsub. Cuentas exactas → `50-CONFIG-INFRA`.

> Origen: INMO `docs/35-LECCIONES-PLATAFORMA.md` (titular en `docs/30-LECCIONES.md`) · importada de CARS y pagada en INMO §15.2(b) (payload sinapsis L-08..L-12 aplicado a `30`) · migrado 2026-09-01 lote 1

### L-10 — Un GET público linkeado por WhatsApp/email JAMÁS muta estado *(importada de cars — sinapsis 2026-07-10)*
**Disparador**: magic-links de confirmar/cancelar/unsubscribe en emails o WhatsApp. **Causa**: WhatsApp hace fetch del link al COMPONER el mensaje (vista previa); Outlook SafeLinks/antivirus igual → "el cliente confirmó sin abrir el link". **Fix**: GET = página intersticial con botón; SOLO el POST muta (`req.method === 'POST'`). De paso: escapar todo dato reflejado (XSS) + header CSP.

> Origen: INMO `docs/35-LECCIONES-PLATAFORMA.md` (titular en `docs/30-LECCIONES.md`) · heredada de Altorra Cars y destilada en INMO §11 (instalación del cerebro, de `_legacy/AVANCES.md §"ERRORES CONOCIDOS"`) · migrado 2026-09-01 lote 1

### L-01 — "Access denied for UID" al login (red lenta ≠ permiso denegado)
**Disparador**: el login falla intermitentemente con "access denied". **Causa**: un error de RED se trató como permiso
denegado y se hizo `signOut`. **Fix**: **retry 3× con backoff ANTES de `signOut`** — no asumir denegado a la primera.
