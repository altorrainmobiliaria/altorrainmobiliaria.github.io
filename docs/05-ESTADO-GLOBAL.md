# 🩺 05 — ESTADO GLOBAL (Altorra Inmobiliaria · Heartbeat)

> Nodo de signos vitales. Se **AUTO-CARGA** (con `CLAUDE.md` + `10`). "¿En qué estado está el sistema AHORA?". Tope ~25 líneas (§G.5) — tablero, no bitácora.
> ✅ **git/obra RE-VERIFICADOS 2026-07-10** (arranque Fable 5, ADR §15). El estado de FIREBASE (CFs vivas, datos) sigue sin re-verificar → R0 lo censa (§3.3 antes de afirmar).

| Señal | Valor (al **2026-07-10**) |
|---|---|
| **Misión** | 🏗️ **GREENFIELD TOTAL** (mandato del dueño, `specs/2026-07-10-INMOBILIARIA-KICKOFF-fable5.md` = SSoT): portal nuevo desde cero; del viejo SOLO se cosechan datos/SEO(301)/docs/aprendizaje. Fable 5 planifica/investiga/audita · Opus 4.8 implementa. 🏛️ Este operador = **escritor único del kernel ×4** (ADR §15). |
| **Build** | ✅ **MODO OBRA LIVE y VERIFICADO** (2026-07-10, curl+sentinela): mantenimiento (blanco/navy/oro, WhatsApp +57 300 243 9810, info@) + 65 stubs redirect→home + 404→home + sitemap solo-home + `og-publish.yml` solo manual + **`.nojekyll`** (Pages fallaba con Jekyll desde ~mayo = producción congelada, L-13). Sitio viejo RETIRADO (git history). GSC preservado (meta + archivo). |
| **Cache version vigente** | `altorra-pwa-v5` (`service-worker.js` = **kill-switch**: borra cachés, se des-registra y recarga — modo obra 2026-07-10). |
| **Branch** | `greenfield/mantenimiento-live` (desde `origin/main` = merge PR #107 `6149652`). Estado de deploy: verificar con `git fetch` + live check, no con este tablero. |
| **Deploy** | GH Pages auto al push a `main`; **Claude pushea/mergea** (autonomía total, mandato 2026-07-10, ADR §15.7). Deploy de **Firebase** (functions/rules) = DUEÑO (`50-CONFIG-INFRA`). |

## ⚠️ Flags de riesgo activos
- ⚖️ **Gate legal**: matrícula de arrendador EN TRÁMITE con observaciones (EXT-AMC-26-0060455 / oficio AMC-OFI-0074376-2026) — estado real A VERIFICAR con el dueño; bloquea formalizar arriendos (kickoff §1).
- 🔥 **Firebase legacy vivo sin censar**: 8 CFs gen2 + Firestore (5 propiedades a cosechar) siguen corriendo sin sitio que las use — R0 censa y decide apagado. ⛔ BLOQUEO: el CLI/MCP local está logueado en una cuenta que solo ve `altorra-cars` — hace falta sesión `altorrainmobiliaria@gmail.com` (dueño). |
- 🔗 **Constancias de liderazgo pendientes ×3**: payloads en `sinapsis-cerebros/references/import-{cars,bersaglio,insema}-2026-07-10-liderazgo.md` — los aplica el operador local de cada repo.

## 🧩 Sub-sistemas
mantenimiento LIVE ✅ verificado 2026-07-10 · `admin.html` (consulta de datos legacy) ✅ · 8 CF legacy ⚠️ sin censar (cuenta CLI equivocada) · sitio público viejo ⛔ RETIRADO (greenfield)
