# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> 🏗️ **MISIÓN GREENFIELD (2026-07-10, ADR §15)** — construir el MEJOR portal inmobiliario
> (`altorrainmobiliaria.co`) DESDE CERO ABSOLUTO. SSoT = `specs/2026-07-10-INMOBILIARIA-KICKOFF-fable5.md`
> (+ mandato verbatim al lado). Reglas permanentes: **Fable 5 planifica/investiga/audita · Opus 4.8
> implementa (tag por commit) · dueño solo decide dinero/legal/go-no-go · español SIEMPRE · autonomía total**.
> Cars EN PAUSA; este operador = escritor único del kernel ×4.
>
> **Programa** (kickoff §5-§7): R0 cosecha → R1 competencia CO (3 lentes: fuentes+código+Chrome live)
> → R2 referentes mundo → R3 legal CO → R4 operación/marketing → R5 MEGA-PLAN + sellar stack (W-11
> COMPLETO sobre candidato §6: CF Pages+Astro+Firebase+R2+Wompi+MapLibre) · carril DISEÑO D0-D4
> (Claude Design vía DesignSync, mockup ANTES de código, gate de fidelidad visual).

> **🚫 Callejones / cuidados (NO reintentar)**:
> (a) ⛔ **NADA del sitio/código/diseño viejo como base** — regla innegociable del dueño; solo lectura
> de referencia. Los TODO/gaps del sitio viejo (J1-J5, Eventarc, smart-search…) están OBSOLETOS (ADR §15.7).
> (b) **Writes cross-repo = BLOQUEADOS por el harness** (sinapsis regla 5) → propagar por payload en
> `references/` de la skill, nunca intentar Edit directo en repo hermano.
> (c) **No mezclar stacks legacy**: el viejo usaba Firebase modular v12.9.0; el schema nuevo se diseña
> en R5 — no arrastrar colecciones viejas sin decisión de migración (R0 las censa).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-11** | **R0 · Inventario de COSECHA**: ✅ censo 63 URLs · ✅ destilado `_legacy` · ✅ censo Firestore/CFs (propiedades VACÍA — 5 fichas rescatadas del git; 7 CFs; config OK) · ⏳ conteo `solicitudes` (MCP stale) · ⏳ Storage · ⏳ auditoría docs maestros · ⏳ matrícula (dueño) · ❓ dueño: ¿las 5 propiedades siguen vigentes? ¿quién vació la colección? | 🔄 EN CURSO | artefacto: `specs/R0-INVENTARIO-COSECHA.md` |
| **TODO-12** | **R1 · Competencia CO** (ciencuadras · metrocuadrado · fincaraiz · coninsa · araujoysegovia · arenasinmobiliaria + Habi/La Haus/Properati) — TRES lentes c/u; partir de `41-MERCADO` (PR #79), actualizar no repetir | 🔮 | artefacto → `41-MERCADO` v2 |
| **TODO-13** | **R2 · Referentes mundo** (Zillow/Redfin/Idealista/Rightmove/QuintoAndar/Airbnb) — 3 lentes; catálogo features adopt/adapt/discard | 🔮 | |
| **TODO-14** | **R3 · Legal CO** (Ley 820+matrícula, corretaje, avalúos RAA/1673, Habeas Data 1581, corta estancia RNT/2068/PH, SIC, firma electrónica 527, SARLAFT/UIAF) | 🔮 | skill `legal-colombia`; artefacto: lóbulo `42-LEGAL` |
| **TODO-15** | **R4 · Operación+marketing**: destilar docs maestros (protocolo leads, scripts WA) + SEO local Cartagena + GBP | 🔮 | |
| **TODO-16** | **R5 · MEGA-PLAN por olas** + **sellar stack vía W-11 COMPLETO** (comité + Gemini + verificación de claims) | 🔮 | artefacto: `specs/MEGA-PLAN-INMOBILIARIA.md` |
| **TODO-17** | **Diseño D0-D4**: direcciones de marca comparativas (dueño elige) → design system → DesignSync a claude.ai → mockup por pantalla → gate fidelidad | 🔮 | tras R1/R2 (D0 se nutre de sus hallazgos UX) |
| **TODO-18** | **Potenciar cerebro** (kickoff §7.3): auditoría Nivel-2 (vence ~2026-07-15, staleDays) + destilar `_legacy/AVANCES.md` Fase B + adoptar de cars gobernanza faltante (W-11 ya citado en 00 — verificar catálogo 60 completo) | 🔄 | |
| **TODO-19** | **Constancias liderazgo ×3**: payloads listos en la skill; los aplican los operadores cars/bersaglio/insema en su próxima sesión | ⏸️ externo | |
| **TODO-20** | **Checklist del DUEÑO** (kickoff §8): Cloudflare cuenta+NS, acceso registrador .co, plan Firebase (Spark/Blaze), acceso GSC, GBP, estado matrícula, permiso Claude Design (1er DesignSync) | ⏸️ dueño | pedirle solo lo que falte |

---

## 📝 Bitácora (efímera)

> **2026-07-10 (ARRANQUE FABLE 5 — ADR §15)**: specs madre copiados · payload sinapsis L-08..L-12
> aplicado · liderazgo kernel ×4 asumido (skill actualizada + payloads constancia ×3) · MODO OBRA
> construido y commiteado (`72879f0`: mantenimiento + 65 redirects + SW v5 kill-switch + og-publish
> neutralizado) · 05/10 re-escritos a la realidad greenfield. Siguiente: merge a main + push (deploy)
> → validación live → R0.
>
> **2026-07-10 (corrección del dueño — ADR §15 actualización)**: contacto público = +57 300 243 9810 +
> info@altorrainmobiliaria.co (el 323… era su personal, RETIRADO de la web) · marca SIN negro →
> página re-diseñada blanco/navy/oro (verificada en preview: href/JSON-LD/colores) · delegación git
> total re-confirmada (CLAUDE.md §2).
>
> **2026-07-10 (DEPLOY LIVE + caza del bug de producción)**: push a main OK · Pages FALLABA con Jekyll
> desde ~mayo (producción congelada en silencio; evidencia API Actions) → fix `.nojekyll` (L-13) →
> **mantenimiento LIVE VERIFICADO** (SW v5 + booleanos curl) · destilado `_legacy` integrado
> (`R0-DESTILADO-LEGACY.md`: 52 features · 21 activos · 39 lecciones candidatas; crudo en bóveda) ·
> hallazgo: CLI Firebase en cuenta equivocada (solo ve cars) → censo R0 espera al dueño.
> **Siguiente**: R1 competencia (3 lentes) + auditoría docs maestros + evaluar C-01..C-39 → `30`.
