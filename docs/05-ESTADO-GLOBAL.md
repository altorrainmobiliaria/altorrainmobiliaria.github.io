# 🩺 05 — ESTADO GLOBAL (Altorra Inmobiliaria · Heartbeat)

> Nodo de signos vitales. Se **AUTO-CARGA** (con `CLAUDE.md` + `10`). "¿En qué estado está el sistema AHORA?". Tope ~25 líneas (§G.5) — tablero, no bitácora.
> ✅ **git/obra RE-VERIFICADOS 2026-07-12** (auditoría §30: HEAD==origin/main==`9549b38`; prod=página en obra). FIREBASE (CFs, datos) sigue sin re-verificar → §3.3 antes de afirmar.

| Señal | Valor (al **2026-07-12**) |
|---|---|
| **Misión** | 🏗️ **GREENFIELD TOTAL** (kickoff = SSoT en `specs/`): portal nuevo desde cero. **R0-R4 ✅ + STACK SELLADO** (ADR §16: Workers+Astro híbrido+Firebase+R2+Wompi+MapLibre; Gemini pendiente como adenda) → siguen MEGA-PLAN + D0 diseño + arranque Opus 4.8. Fable planifica/audita · Opus implementa. 🏛️ Este operador = **escritor único del kernel ×4** (ADR §15). |
| **Build** | ✅ **MODO OBRA LIVE y VERIFICADO** (2026-07-10, curl+sentinela): mantenimiento (blanco/navy/oro, WhatsApp +57 300 243 9810, info@) + 65 stubs redirect→home + 404→home + sitemap solo-home + `og-publish.yml` solo manual + **`.nojekyll`** (Pages fallaba con Jekyll desde ~mayo = producción congelada, L-13). Sitio viejo RETIRADO (git history). GSC preservado (meta + archivo). |
| **Cache version vigente** | `altorra-pwa-v5` (`service-worker.js` = **kill-switch**: borra cachés, se des-registra y recarga — modo obra 2026-07-10). |
| **Branch** | `main` (trabajo directo con push delegado, ADR §15.7). Estado de deploy: verificar con `git fetch` + live check, no con este tablero. |
| **Deploy** | GH Pages auto al push a `main`; **Claude pushea/mergea** (autonomía total, mandato 2026-07-10, ADR §15.7). Deploy de **Firebase** (functions/rules) = **Claude ejecuta** (delegado por el dueño 2026-07-11), COORDINADO con retiro legacy; CLI auth por confirmar (`50-CONFIG-INFRA`). |

## ⚠️ Flags de riesgo activos
- ⚖️ **Matrícula de arrendador OBTENIDA** ✅ (dueño, 2026-07-10); el Nº real va al footer al cierre de obra (hoy `000000`) → blocker de producción (kickoff §1).
- 🔥 **Firebase CENSADO 2026-07-10** (detalle → `50-CONFIG` + R0): **7** CFs gen2 vivas (no 8) · `propiedades` VACÍA y las 5 fichas viejas **DESCARTADAS por el dueño** ("ya no son inventario") → migración de datos ≈ CERO (solo `solicitudes` por contar) · CLI ya en `altorrainmobiliaria@gmail.com` · Blaze (dueño) vs "Billing:No" (MCP) — verificar en consola.
- 🔗 **Constancias de liderazgo pendientes ×3**: payloads en `sinapsis-cerebros/references/import-{cars,bersaglio,insema}-2026-07-10-liderazgo.md` — los aplica el operador local de cada repo.

## 🧩 Sub-sistemas
mantenimiento LIVE ✅ · `admin.html` (consulta legacy) ✅ · 7 CF legacy censadas ✅ (apagado → MEGA-PLAN) · sitio público viejo ⛔ RETIRADO (greenfield) · **`portal/` LIVE en staging** `verificado-vivo: 2026-07-12` (`altorra-portal.altorrainmobiliaria.workers.dev` — Astro 7 + CF Workers, híbrido, noindex; KV+R2; ADR §21) · **modelo de datos v1** (tipos+rules+`client.ts` REST edge-safe, §22 `[REVISAR-FABLE]`; E2E 21/21 emulador; falta E2E "tras cache" en staging) · **Portal Ola 1 público COMPLETO (staging)** (ADR §23-§29; detalle → `20 §Portal`): D1 sellado (paleta oficial + solo-paleta + Cormorant/Hanken + neumorfismo+glass) + TODAS las páginas mockup-backed (home/comprar/arrendar/ficha/publicar/estancias/turismo/404) + Header/Footer/PropertyCard + WebP · **0 off-palette**. Pendiente: **gestion** (admin, único mockup) · MapLibre real · datos Firestore reales · wiring forms→`solicitudes`.
