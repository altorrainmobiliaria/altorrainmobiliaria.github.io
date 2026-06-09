# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> 🧠 **CEREBRO RECIÉN INSTALADO (2026-06-09)** — neurogénesis de Altorra Inmobiliaria como parte del
> macro-proyecto **Cerebro Multi-Proyecto** (ADR §170 del repo `altorracars`). Inmobiliaria era el
> **banco de pruebas** (sin cerebro neuronal; 376KB de monolitos en la raíz). Lo hecho:
> linter canónico `brain-check.mjs` (idéntico a cars/bersaglio) + `docs/.brain-manifest.json` + githooks +
> `.claude/settings.json` (boot `--boot`) + estructura neuronal `docs/00..99` + lóbulo `41-MERCADO`.
> Los 7 monolitos originales (CLAUDE viejo, AVANCES 3420 L, ALTORRACARSCLAUDE, MEGA-PLAN, PLAN-MEJORAS,
> DEPLOY-RUNBOOK, CONTENIDO-EDITORIAL) se preservaron **íntegros en `_legacy/`** (Fase A `git mv`,
> history intacta — **cero pérdida**). El §12 único de ALTORRACARSCLAUDE (smart-search) se rescató al `99`.
>
> **Pendiente de la instalación (Fase B, destilado on-demand)**: el `99`/`30`/`20` tienen las SEMILLAS
> esenciales; el detalle por-fase fino sigue en `_legacy/AVANCES.md` (leer por offset cuando se necesite,
> NUNCA entero). Si una sesión necesita un detalle histórico que no está en el nodo, está en `_legacy`.

> 🏗️ **Estado del PRODUCTO inmobiliaria** (al cierre de bitácora 2026-05-07, **no re-verificado**):
> Bloques A–I + Mega-Plan Fases 1–12 COMPLETADOS (auditoría 2026-05-04). Sitio live, dinámico,
> SEO fuerte. El backlog vivo = gaps **J1–J5** (ver pendientes). Detalle arquitectónico → `20-ESPACIAL`.

> **🚫 Callejones sin salida / cuidados (NO reintentar)**:
> (a) **NO confiar en `_legacy/PLAN-MEJORAS.md` para el "qué sigue"** — está fechado 2026-04-16 (anterior a
> AVANCES 2026-05-07) y tiene contradicción interna (§9.1 dice "Sprint 2 = Bloque G" pero §9.3 ya marca G/H
> como DONE). **AVANCES.md es la fuente de verdad del estado**, no PLAN-MEJORAS. El benchmark de competidores
> de MEGA-PLAN (→ `41-MERCADO`) SÍ es válido (inteligencia atemporal).
> (b) **NO asumir que los pendientes J/Eventarc siguen abiertos** — ~1 mes sin registrar; verificar contra
> git + Firebase reales (§3.3) antes de tratarlos como vivos.
> (c) **NO mezclar stacks**: inmobiliaria usa Firebase **modular v12.9.0**; cars usa **Compat v11.3.0**.
> Las colecciones/schema de los dos proyectos son distintas — no cruzar (línea roja INSTANCE).

---

## 📋 Pendientes abiertos (TODO-NN)

> Al cerrar uno: ✅ + link al ADR, y retirarlo en la próxima poda. **Verificar primero** que sigan abiertos
> (la bitácora tiene ~1 mes; pueden estar resueltos).

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-01** | **J2** — 4 páginas con `action` FormSubmit HTML residual (contacto/detalle/publicar/avaluo) → migrar a Firestore `solicitudes` (riesgo doble envío) | 🔮 verificar | Prioridad ALTA |
| **TODO-02** | **J3** — 3 páginas sin `firebase-config.js`/`components.js` (servicios-mant/servicios-mud/turismo-inm) | 🔮 verificar | Prioridad ALTA |
| **TODO-03** | **J5** — sin tests automatizados (solo `tests/MANUAL-meta-snapshot.md`) | 🔮 | Prioridad BAJA |
| **TODO-04** | **Re-deploy Cloud Functions** con triggers Eventarc (fallaron en deploy 0-C; receta IAM en `docs/50-CONFIG-INFRA.md` + `30 L-07`) | 🔮 verificar | Lo hace el dueño |
| **TODO-05** | **Secret CI** `GOOGLE_APPLICATION_CREDENTIALS_JSON` en GitHub Actions (habilita `og-publish.yml` SEO dinámico) | 🔮 verificar | |
| **TODO-06** | **Keys reales**: GMAPS_API_KEY (mapa) + VAPID_KEY (push FCM) en `js/firebase-config.js` | 🔮 | OPCIONAL |
| **TODO-07** | **Fase B destilado** — expandir semillas de `99`/`30` desde `_legacy/AVANCES.md` cuando se necesite (NO de un golpe) | 🔄 continuo | Cerebro |
| **TODO-08** | **smart-search A1b/A1c** — portar de cars: conteo por sugerencia + indicador `~` + ARIA completa (ver `99 §12`) | 🔮 verificar | Puede estar hecho |

---

## 📝 Bitácora (efímera)

> **2026-06-09 (instalación del cerebro)**: neurogénesis de inmobiliaria (PASO 2 del cerebro multi-proyecto).
> Tooling canónico + estructura neuronal + Fase A (`git mv` 7 monolitos → `_legacy`, history intacta).
> Extracción de esenciales vía workflow (6 agentes sobre los 376KB). Estado del producto destilado de
> AVANCES (no re-verificado). Próximo: completar destilado on-demand + verificar pendientes J contra git real.
>
> **Hitos del producto (de `_legacy/AVANCES.md`, hasta 2026-05-07)** — detalle por offset en `99`:
> Etapas 0–8 (migración Firebase) · catálogo 100% Firestore (commit `d28437e`) · Bloques A–I (features) ·
> SEO E1–E5 (JSON-LD/landings) · auditoría 2026-05-04 (gaps J1–J5) · Mega-Plan Fases 1–12 · FAQs masivas 2026-05-07.
