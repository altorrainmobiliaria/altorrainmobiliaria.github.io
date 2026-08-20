# 🩺 05 — ESTADO GLOBAL (Altorra Inmobiliaria · Heartbeat)

> Nodo de signos vitales. Se **AUTO-CARGA** (con `CLAUDE.md` + `10`). "¿En qué estado está el sistema AHORA?". Tope ~25 líneas (§G.5) — tablero, no bitácora.
> 💓 Lo DERIVABLE (git/SW-cache/costo/consolidación) ya **NO vive aquí**: lo genera el heartbeat en CADA boot (sidecar `docs/.estado-auto.md`, §52) — este nodo solo guarda JUICIO. FIREBASE (CFs, datos) sigue sin re-verificar → §3.3 antes de afirmar.

| Señal | Valor (al **2026-08-19**) |
|---|---|
| **Misión** | ⭐ **FRENTE 0 = FUNDACIÓN OPERATIVA** (TODO-34) sobre 🏗️ **GREENFIELD** del portal (**R0-R4 ✅ + STACK SELLADO** §16). 🏛️ **Escritor único del kernel ×4** (§15). Frentes y foco vivo → `10`. |
| **Kit fundacional** | 📜 **24 generan · 22 se firman** (13 y 23 RETIRADOS) con gate de emisión verde (§67) y **24/24 AUDITADOS** (§68). Críticos y altos de B-03 ya aplicados (§70·§71); **lo que resta y su cautela → TODO-34**. El manual (15) **ya no se edita a mano**: se ensambla de sus fragmentos. |
| **Build** | ✅ **MODO OBRA LIVE** `verificado-vivo: 2026-08-19` (curl 200 + sentinela «portal en construcción»): mantenimiento + 66 redirects→home + `.nojekyll` (L-13, §15). El SW legacy = **kill-switch** del modo obra. Sitio viejo RETIRADO; GSC preservado. |
| **Branch / Deploy** | `main` → GH Pages auto al push. CI `portal-ci.yml` **auto-despliega el portal** en cada push (`CF_DEPLOY_ENABLED` ON, verificado 07-19). Quién despliega qué → `CLAUDE.md §2` + `50-CONFIG-INFRA`. |
| **Portal (staging)** | ✅ **OLA 1 FIDELIDAD COMPLETA Y LIVE** (TODO-27 cerrado, §43-§48): las **6 páginas FIELES** al mockup en `altorra-portal.altorrainmobiliaria.workers.dev` (Astro+Workers, noindex). `verificado-vivo: 2026-08-19` (curl 200 · 135 KB · noindex,nofollow). Go-forward → TODO-30. |

## ⚠️ Flags de riesgo activos
- ⚖️ **Matrícula de arrendador OTORGADA** — `Resolución 6636` del 23-jul-2026, papel recibido 2026-08-20 (el flag viejo "no consta la resolución" queda RESUELTO) — **pero SIN NÚMERO**: su art. 2º deja el nº a "asígnese por el sistema" ⇒ falta la **constancia de inscripción en el registro digital de arrendadores**. **Ley 820 art. 31 exige ese nº en toda publicidad de arriendo** ⇒ sigue bloqueando el footer del portal (hoy `000000`) y la pauta. ⚠️ El acto cita el establecimiento con matrícula **10011978**, que en `43` es la de la **SOCIEDAD** (el establecimiento sería 10013497) → **aclarar en CC antes de publicar número alguno**. RNT: declarado, sin verificar. Del dueño: la constancia con el nº + **dirección COMERCIAL** (la del acto es el domicilio del representante). Detalle → `43 §Matrícula`.
- 🔥 **Firebase BLAZE activo** ✅ (restaurado 2026-07-12 tras aviso de Google; sin costo — portal usa datos DEMO en Cloudflare aún).
- 📣 **HUMO CERRADA ✅ · campaña DESACTIVADA** (`verificado-vivo: 2026-07-27`): fontanería §4b cerrada (factura con IVA OK). Cifras, benchmarks propios y hallazgos → `pauta-captacion` playbook §10. Falta de Daniel: ¿los 3 chats eran propietarios reales? Campaña REAL gateada por matrícula + cierre de obra. Ads-MCP de Altorra sin habilitar (rollout Meta ×2) → navegador.

## 🧩 Sub-sistemas
mantenimiento LIVE ✅ · `admin.html` (consulta legacy) ✅ · **CF: 9 en código / 7 desplegadas** (`verificado-vivo: 2026-08-02`; las 2 restantes envían correos solas → desplegarlas es decisión, `20`) · sitio público viejo ⛔ RETIRADO · **modelo de datos v1** (§22 auditado ✅ + catálogo=doc-índice §54; E2E 21/21) · **mapa MapLibre §55** (ficha+SERP; `.pmtiles` y Worker+Range §55.9 verificados vivos 2026-08-20: 206 + content-range, archivo v3/MVT/540 tiles OK). **Sigue faltando la vista en foreground y SOLO la confirma Daniel**: toda pestaña automatizada va `hidden` ⇒ `rAF` congelado ⇒ el mapa no completa el estilo y parece roto sin estarlo ([[L-39]]) · D1 sellado (§23, tokens.css = SSoT) · `gestion` (admin 3 roles, §31) · Pendiente → **TODO-30** (`10`).
