# 🩺 05 — ESTADO GLOBAL (Altorra Inmobiliaria · Heartbeat)

> Nodo de signos vitales. Se **AUTO-CARGA** (con `CLAUDE.md` + `10`). "¿En qué estado está el sistema AHORA?". Tope ~25 líneas (§G.5) — tablero, no bitácora.
> 💓 Lo DERIVABLE (git/SW-cache/costo/consolidación) ya **NO vive aquí**: lo genera el heartbeat en CADA boot (sidecar `docs/.estado-auto.md`, §52) — este nodo solo guarda JUICIO. FIREBASE (CFs, datos) sigue sin re-verificar → §3.3 antes de afirmar.

| Señal | Valor (al **2026-07-20**) |
|---|---|
| **Misión** | 🏗️ **GREENFIELD TOTAL** (kickoff = SSoT en `specs/`): portal nuevo desde cero. **R0-R4 ✅ + STACK SELLADO** (ADR §16: Workers+Astro híbrido+Firebase+R2+Wompi+MapLibre). Fable planifica/audita · Opus implementa. 🏛️ Este operador = **escritor único del kernel ×4** (ADR §15). |
| **Build** | ✅ **MODO OBRA LIVE** `verificado-vivo: 2026-07-10` (curl+sentinela): mantenimiento + **66 redirects→home** (53 raíz incl. 404 + 7 `blog/` + 6 `p/`) + `.nojekyll` (L-13, §15). El SW legacy = **kill-switch** del modo obra (su versión vigente → heartbeat). Sitio viejo RETIRADO. GSC preservado. |
| **Branch / Deploy** | `main`; GH Pages auto al push; **Claude pushea/mergea** (ADR §15.7) y ejecuta deploy Firebase (delegado 2026-07-11; `50-CONFIG-INFRA`). La CI `portal-ci.yml` **AUTO-DESPLIEGA cada push del portal** (`CF_DEPLOY_ENABLED` ON — verificado en Actions, run del 07-19). |
| **Portal (staging)** | ✅ **OLA 1 FIDELIDAD COMPLETA Y LIVE (TODO-27 CERRADO §48)**: las **6 páginas FIELES** al mockup (§43-§48), en `altorra-portal.altorrainmobiliaria.workers.dev` (Astro+Workers, noindex). `verificado-vivo: 2026-07-20` (curl 200 + noindex). **Go-forward → TODO-30** (`10`). |

## ⚠️ Flags de riesgo activos
- ⚖️ **Matrícula de arrendador Y RNT: AMBOS OBTENIDOS** ✅ (Daniel 2026-07-18); **los NÚMEROS los entrega al CIERRE DE OBRA** (web lista y confiable primero). Footer del **PORTAL** (staging) hoy `000000` — el modo obra NO exhibe matrícula. La pauta de arriendo exige el nº visible (Ley 820 art. 31) → **toda la pauta se enciende con la entrega, junto con la web**. Falta del dueño: dirección física.
- 🔥 **Firebase BLAZE activo** ✅ (restaurado 2026-07-12 tras aviso de Google; sin costo — portal usa datos DEMO en Cloudflare aún).
- 🔗 **Skills visibilidad de cars/bersaglio (copias repo) desactualizadas** → las porta cada operador (el user-level ya quedó ✅ ×4).
- 📣 **HUMO encendida 07-18** (§42.8): campaña `120250036063330588` Leads+CTWA $4.000/día; muere sola al agotar el prepago ~$5k (**a D+2 probablemente YA agotada — verificar en Ads Manager por navegador**). Días 1-7 NO tocar · responder chats · planilla CPQL desde el 1er lead. Al agotarse: verificar factura/CPM/clic→chat (fontanería §4b) → calibra la campaña REAL (gate = cierre de obra). Ads-MCP sin habilitar — operación por navegador · activos → `activos-meta.md`.

## 🧩 Sub-sistemas
mantenimiento LIVE ✅ · `admin.html` (consulta legacy) ✅ · 7 CF legacy censadas ✅ · sitio público viejo ⛔ RETIRADO · **modelo de datos v1** (§22 auditado ✅ + catálogo=doc-índice §54; E2E 21/21) · **mapa real MapLibre §55** (ficha+SERP; tiles Cartagena ✅ empacados §55.8 — falta solo visto bueno visual de Daniel) · D1 sellado (§23, tokens.css = SSoT) · `gestion` (admin 3 roles, §31) · Pendiente → **TODO-30** (`10`).
