# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> ⚡ **RELEVO A OPUS 4.8 — construir la OLA 0 del MEGA-PLAN** (`specs/MEGA-PLAN-INMOBILIARIA.md` = SSoT
> del roadmap; protocolo de arranque en su §4). La planificación COMPLETA (R0-R5, ADR §15-§18) terminó
> 2026-07-10: stack sellado (§16, W-11 completo con Gemini integrado), plan por olas (§17) con módulo
> GESTIÓN (§3b) y regla visión-PRO. Reglas permanentes: Fable planifica/audita · Opus implementa (tag
> por commit) · dueño decide dinero/legal/go-no-go · español · autonomía total. Fable audita al cierre
> de cada ola (cuota vuelve ~jueves).
>
> **🚫 Callejones / cuidados (NO reintentar)**:
> (a) ⛔ **NADA del sitio/código/diseño viejo como base** — regla innegociable del dueño (solo lectura de referencia; sus TODO/gaps están obsoletos, ADR §15.7).
> (b) **Writes cross-repo BLOQUEADOS** (sinapsis regla 5) → payloads en `references/` de la skill.
> (c) **Los docs internos del dueño tienen ERRORES** (él lo advierte): verdad del dominio, NO estándar — visión PRO obligatoria (MEGA-PLAN §3b; ej.: listan depósitos prohibidos por Ley 820 art. 16).
> (d) **NUNCA UI sin mockup aprobado** (carril D) · **NUNCA dinero sin gate B2/B9** · **NUNCA pedir reindexación** antes del contenido sustantivo (regla AEO) · **JAMÁS el nº personal del dueño** (323…) en la web.

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **⚡ ARRANQUE OPUS — Ola 0 ítem 1** (scaffold `portal/`): protocolo MEGA-PLAN §4. El dueño dirá **"Arranca la Ola 0 del MEGA-PLAN"**. En la MISMA sesión: **guiar al dueño paso a paso para crear su cuenta Cloudflare** (Ola 0.2 — protocolo Fincaraíz: él teclea credenciales en SU navegador, Claude jamás crea cuentas ni maneja contraseñas; email del negocio, no el personal). Insumos Ola 0.7: 2ª pasada .xlsx FTI-01 + piloto `ALTORRA-PILOTO-main` (crítico R4) | 🔮 OPUS | abogado = gate Ola 2 |
| **TODO-18** | **Carril D — Diseño D0-D4**: direcciones de marca comparativas (dueño elige) → design system → DesignSync a claude.ai → mockup por pantalla → gate fidelidad. Insumo: bóveda `ui-referentes/` | 🔮 OPUS (D0 en Ola 0.3) | paleta SIN negro |
| **TODO-19** | **Potenciar cerebro** (kickoff §7.3): auditoría Nivel-2 (vence ~2026-07-15, staleDays) + destilar `_legacy/AVANCES.md` Fase B + evaluar lecciones candidatas C-01..C-39 (R0) contra `30` | 🔄 | |
| **TODO-20** | **Constancias liderazgo ×3**: payloads listos en la skill; los aplican los operadores cars/bersaglio/insema en su próxima sesión | ⏸️ externo | |
| **TODO-21** | **Checklist del DUEÑO** (kickoff §8): cuenta Cloudflare + NS Hostinger→CF (al cutover) · acceso GSC · permiso Claude Design (1er DesignSync) · abogado (Ola 2) · certificado de matrícula (al final) | ⏸️ dueño | pedirle solo lo que toque por ola |
| **TODO-22** | **Auditoría Fable de la Ola 0** (protocolo cars §300) al volver su cuota | 🔮 FABLE | |

---

## 📝 Bitácora (efímera)

> **2026-07-10 (SESIÓN DE PLANIFICACIÓN FABLE — cerrada, ADR §15-§18)**: en un día: obra live verificada
> (+ caza del bug Jekyll L-13) → R0-R4 completas (~74 agentes, 6 workflows, 3 lentes live con protocolo
> de login del dueño) → stack sellado con W-11 completo (comité ×3 + juez + fallos Q1-Q7 + Gemini
> integrado: 4 adopciones, veto-Firestore refutado) → MEGA-PLAN por olas + módulo GESTIÓN + visión-PRO.
> Decisiones del dueño incorporadas: razón social ALTORRA COMPANY SAS (vieja a liquidación, ver `50`) ·
> tarifas v1 delegadas · GBP existe→reclamar · propiedades viejas descartadas · matrícula obtenida.
> Detalle → ADRs §15-§18 + specs R0-R5 + MEGA-PLAN. **Siguiente sesión = OPUS 4.8: "arranca la Ola 0"**.
