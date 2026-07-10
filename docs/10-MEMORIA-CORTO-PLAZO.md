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
| **TODO-11** | **R0 · Inventario de COSECHA**: ✅ censo 63 URLs · ✅ destilado `_legacy` · ✅ censo Firestore/CFs · ✅ propiedades DESCARTADAS (dueño) · ✅ matrícula OBTENIDA (dueño) · ⏳ conteo `solicitudes` (MCP stale) · ⏳ Storage · ⏳ auditoría docs maestros (→ R2/R3/R4) | 🔄 casi cerrado | artefacto: `specs/R0-INVENTARIO-COSECHA.md` |
| **TODO-12** | **R1 · Competencia**: ✅ lentes (a)+(b) ×11 portales (`specs/R1-COMPETENCIA-2026-07.md` + `41-MERCADO` v2) · ✅ lente (c) tanda 1-2: 6/16 misiones (precios Ciencuadras+Proppit 💎, Airbnb Cartagena 💎) · ⏳ misiones tras LOGIN — **protocolo del dueño 2026-07-10: él se registra/loguea EN SU Chrome (1 min de aviso) y Claude navega la sesión; Claude JAMÁS maneja credenciales ni ejecuta pagos** (frenar antes de todo checkout) | 🔄 lente c | siguiente cuenta: Fincaraíz |
| **TODO-13** | ✅ **R2 · Referentes mundo** (2026-07-10): 8 referentes × 17 agentes verificados → `specs/R2-REFERENTES-MUNDO-2026-07.md` (59 features · top-10 MVP · QuintoAndar 3 fases CO · 13 SEO · 15 gates→R3) + esencia en `41-MERCADO` | ✅ → consolidar a 99 en la próxima poda | |
| **TODO-14** | ✅ **R3 · Legal CO** (2026-07-10, 17 agentes, 62 normas, 57 claims verificados) → lóbulo `docs/42-LEGAL.md` (NEUROGÉNESIS) + `specs/R3-LEGAL-COLOMBIA-2026-07.md` (17 gates B1-B17 + agenda abogado). **DECISIÓN (Claude, delegada por el dueño 2026-07-10): NO presentar comentarios a la consulta RNT** (verificada real, cierra 2026-07-11 — mincit.gov.co): sin abogado no se firman documentos formales ante ministerios; el borrador nos FAVORECE (exhibir RNT por anuncio + reportes a DIAN = exactamente los gates B2/B3 que ya diseñamos — sube el listón contra informales); incidencia marginal ≈ 0. EN SU LUGAR: monitorear el decreto FINAL (el que obliga) → agenda abogado | ✅ → consolidar a 99 en próxima poda | gate abogado SIEMPRE |
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
>
> **2026-07-10 (R1 lentes a+b COMPLETAS)**: workflow `wf_b2026a2b` 23/23 agentes, 0 errores →
> `specs/R1-COMPETENCIA-2026-07.md` (14 oportunidades por ola · 8 patrones SEO · 11 fichas con 59 claims
> verificados · 16 misiones lente c) + `41-MERCADO` v2 + crudo en bóveda. Hallazgo #1: la corta estancia
> con booking real NO existe en ningún portal CO (y Properati tiene fraude documentado) → diferencial
> fundacional Altorra. Siguiente: lente (c) live P1-P6 → luego R2/R3.
