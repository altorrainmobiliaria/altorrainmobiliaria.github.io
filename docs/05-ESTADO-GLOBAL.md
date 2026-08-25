# 🩺 05 — ESTADO GLOBAL (Altorra Inmobiliaria · Heartbeat)

> Nodo de signos vitales. Se **AUTO-CARGA** (con `CLAUDE.md` + `10`). "¿En qué estado está el sistema AHORA?". Tope ~25 líneas (§G.5) — tablero, no bitácora.
> 💓 Lo DERIVABLE (git/SW-cache/costo/consolidación) ya **NO vive aquí**: lo genera el heartbeat en CADA boot (sidecar `docs/.estado-auto.md`, §52) — este nodo solo guarda JUICIO. FIREBASE (CFs, datos) sigue sin re-verificar → §3.3 antes de afirmar.

| Señal | Valor (al **2026-08-20**) |
|---|---|
| **Misión** | ⭐ **TERMINAR EL MEGA-PLAN** (Daniel 21-ago: la web y el sistema primero; pauta y Gmail al final) sobre 🏗️ **GREENFIELD** del portal (**R0-R4 ✅ + STACK SELLADO** §16). La FUNDACIÓN (TODO-34) sigue en pausa. 🏛️ Escritor único del kernel ×4 (§15). Foco vivo → `10`. |
| **Kit fundacional** | 📜 **24 generan · 22 se firman** (13 y 23 RETIRADOS) con gate de emisión verde (§67) y **24/24 AUDITADOS** (§68). Críticos y altos de B-03 ya aplicados (§70·§71); **lo que resta y su cautela → TODO-34**. El manual (15) **ya no se edita a mano**: se ensambla de sus fragmentos. |
| **Build** | ✅ **MODO OBRA LIVE** `verificado-vivo: 2026-08-19` (curl 200 + sentinela «portal en construcción»): mantenimiento + 66 redirects→home + `.nojekyll` (L-13, §15). El SW legacy = **kill-switch** del modo obra. Sitio viejo RETIRADO; GSC preservado. |
| **Branch / Deploy** | `main` → GH Pages auto al push. CI `portal-ci.yml` **auto-despliega el portal** en cada push (`CF_DEPLOY_ENABLED` ON, verificado 07-19). Quién despliega qué → `CLAUDE.md §2` + `50-CONFIG-INFRA`. |
| **Portal (staging)** | ✅ **OLA 1 — 13/13 y VIVA EN STAGING** `verificado-vivo: 2026-08-25` (curl contra el worker: `/seguridad`, la bóveda en `/gestion`, el código en `/ingresar`, el **Journal con 4 artículos** y los **65 redirects** — servido, `noindex` y ya sin el 307 a la forma con barra, §150): cero cifras inventadas. Censo → `21`+`22`. Resta: GATES DEL DUEÑO en el orden del `10`. |

## ⚠️ Flags de riesgo activos
- ✅ **Matrícula de Arrendador `6636` — PUBLICADA** (Resolución 6636, 23-jul-2026). **Gate de Ley 820 art. 31 LEVANTADO**: está en el footer y en la Política; la pauta de arriendo ya no la espera. ⚠️ Falta la **dirección COMERCIAL** y verificar en CC la matrícula del establecimiento; RNT declarado, SIN verificar. Todo el detalle → `43 §Matrícula`.
- 🔥 **Firebase BLAZE activo** ✅ (restaurado 2026-07-12 tras aviso de Google; sin costo — portal usa datos DEMO en Cloudflare aún).
- 📣 **HUMO cerrada ✅ · ⚠️ apagado de la campaña SIN VERIFICAR** (§90 → pelota 9 del `10`): la campaña solo gasta si se recarga saldo. Cifras → `pauta-captacion` §10. Campaña REAL gateada por el cierre de obra.

## 🧩 Sub-sistemas
mantenimiento LIVE ✅ · `admin.html` (consulta legacy) ✅ · **CF legacy: 15 en código / 13 DESPLEGADAS** · **Auth = Identity Platform: 2FA TOTP con pantalla de alta (`/seguridad`) y resolver en las DOS puertas — nadie inscrito AÚN**, clave mín 12, reglas fase 2 EN VIVO (`verificado-vivo: 2026-08-25`, §132·§137) · **CF portal: 19 en código / 17 DESPLEGADAS** (§140·§142·§144·§151·§152). Las 2 que faltan son las ÚNICAS programadas (`catalogoBarrido`, `alertasDigest`): comprometen 2 de los 3 jobs gratuitos de Scheduler y una espera a Resend → decisión del dueño, runbook fase 3. El CÓDIGO lo cuenta el gate #29; el DESPLIEGUE no se puede contar desde el repo, por eso lleva sello. Las 2 legacy fuera mandan correo solas y se quedan fuera A PROPÓSITO; las 4 que faltan del portal esperan a la fase 3 · sitio público viejo ⛔ RETIRADO · **modelo de datos v1** (§22 auditado ✅ + catálogo=doc-índice §54; E2E 21/21) · **mapa MapLibre §55** (ficha+SERP; `.pmtiles` y Worker+Range verificados vivos 2026-08-20). **Falta SOLO la vista en foreground y la confirma Daniel** — el porqué está en [[L-39]], no aquí · D1 sellado (§23, tokens.css = SSoT) · `gestion` (admin 3 roles, §31) · Pendiente → **TODO-30** (`10`).
