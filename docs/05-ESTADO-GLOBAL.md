# 🩺 05 — ESTADO GLOBAL (Altorra Inmobiliaria · Heartbeat)

> Nodo de signos vitales. Se **AUTO-CARGA** (con `CLAUDE.md` + `10`). "¿En qué estado está el sistema AHORA?". Tope ~25 líneas (§G.5) — tablero, no bitácora.
> ✅ **git RE-VERIFICADO 2026-07-18** (auditoría Nivel-2 #3): `HEAD == origin/main == 7cedf5c`. FIREBASE (CFs, datos) sigue sin re-verificar → §3.3 antes de afirmar.

| Señal | Valor (al **2026-07-18**) |
|---|---|
| **Misión** | 🏗️ **GREENFIELD TOTAL** (kickoff = SSoT en `specs/`): portal nuevo desde cero. **R0-R4 ✅ + STACK SELLADO** (ADR §16: Workers+Astro híbrido+Firebase+R2+Wompi+MapLibre). Fable planifica/audita · Opus implementa. 🏛️ Este operador = **escritor único del kernel ×4** (ADR §15). |
| **Build** | ✅ **MODO OBRA LIVE** `verificado-vivo: 2026-07-10` (curl+sentinela): mantenimiento (blanco/navy/oro, WhatsApp +57 300 243 9810, info@) + 65 stubs redirect→home + `.nojekyll` (L-13). Sitio viejo RETIRADO. GSC preservado. |
| **Cache version vigente** | `altorra-pwa-v5` (`service-worker.js` = **kill-switch** — modo obra 2026-07-10). |
| **Branch / Deploy** | `main`; GH Pages auto al push; **Claude pushea/mergea** (ADR §15.7) y ejecuta deploy Firebase (delegado 2026-07-11, coordinado con retiro legacy; `50-CONFIG-INFRA`). |
| **Portal (staging)** | 🔄 **OLA 1 EN RE-TRABAJO DE FIDELIDAD** (§32, TODO-27): las 7 páginas construidas y **13 ALTA corregidos** ✅, pero la re-auditoría adversarial (§32.24) dejó **35 MEDIA/BAJA pendientes** (ficha = 8, sin tocar, la más urgente). `verificado-vivo: 2026-07-12` en `altorra-portal.altorrainmobiliaria.workers.dev` (Astro+Workers, noindex). Método obligatorio: diff vs `.dc.html` + re-auditar (L-29). |
| **Skills visibilidad** | ✅ **Actualizadas 2026-07-18** con aprendizajes VERIFICADOS en prod bersaglio (ADR §33): Offer-sin-price INVÁLIDO · FAQPage sin rich result (may-2026) · aggregateRating solo on-site · "Solicitar indexación" = solo descubrimiento. Sincronizadas repo + `~/.claude/skills`. |

## ⚠️ Flags de riesgo activos
- ⚖️ **Matrícula de arrendador Y RNT: AMBOS OBTENIDOS** ✅ (Daniel confirma 2026-07-18); **los NÚMEROS los entrega al CIERRE DE OBRA** (decisión suya: la web debe estar lista y generar confianza antes de exhibirlos). Footer hoy `000000`. La pauta de arriendo exige el nº visible (Ley 820 art. 31) → **toda la pauta se enciende con la entrega, junto con la web**. Falta del dueño: dirección física.
- 🔥 **Firebase BLAZE activo** ✅ (restaurado 2026-07-12 tras aviso de Google; sin costo — portal usa datos DEMO en Cloudflare aún).
- 🔗 **Constancias de liderazgo ×3 pendientes** (payloads en `sinapsis-cerebros/references/`) + **skills visibilidad de cars/bersaglio (copias repo) desactualizadas** → las porta cada operador (el user-level ya quedó ✅ ×4).
- 📣 **Pauta LISTA-PARA-ENCENDER** (§33-§37): skill `pauta-captacion` construida sobre investigación oficial fechada (Leads+CTWA · CAPI-Worker $0 · 8 parches de vigencia a skills). Encendido converge con cierre de obra (números matrícula/RNT + privacidad publicada + píxel/GA4 + landing verificada). Lotes TikTok → backlog `compartido-marketing/`.

## 🧩 Sub-sistemas
mantenimiento LIVE ✅ · `admin.html` (consulta legacy) ✅ · 7 CF legacy censadas ✅ · sitio público viejo ⛔ RETIRADO · **modelo de datos v1** (§22 `[REVISAR-FABLE]`; E2E 21/21 emulador) · D1 sellado (§23, tokens.css = SSoT) · `gestion` (admin 3 roles, §31) · Pendiente: 35 fidelidad → MapLibre real → datos Firestore reales → wiring forms→`solicitudes`.
