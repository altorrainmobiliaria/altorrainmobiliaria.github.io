# _legacy/ — Cuarentena de documentación legacy (NUNCA borrar)

> Patrón de preservación del cerebro neuronal (límite de guardián, `CLAUDE.md §G.4`).
> Aquí viven artefactos **cuarentenados, no borrados**: su conocimiento se preservó
> (destilado a las neuronas vivas y/o conservado íntegro aquí). **Cero pérdida de conocimiento.**
>
> Restaurar un archivo: `git mv _legacy/<archivo> <ruta-original>` (la history está intacta).

## Contexto

`altorrainmobiliaria` no tenía cerebro neuronal: toda su memoria vivía en ~376KB de
documentos monolíticos en la raíz. Con la instalación del cerebro multi-proyecto
(ADR §170 del repo cars), esos monolitos se **destilan** a la estructura neuronal
(`docs/00..99` + lóbulos) y los originales se **mueven aquí íntegros** (Fase A:
`git mv`, byte-idéntico, history preservada). La distilación a nodos es Fase B
(aprobada pieza por pieza por el guardián).

## Inventario de cuarentena

> Se completa al mover cada monolito (Fase A). Los identificadores de infra irremplazables
> (`DEPLOY-RUNBOOK`: Project ID + IAM) NO se cuarentenan: se promueven a un nodo config.

| Archivo | KB | Por qué se cuarentenó | Su conocimiento vive ahora en |
|---|---|---|---|
| `CLAUDE.md` | 61.6 | Constitución monolítica reemplazada por el nuevo `CLAUDE.md` router lean | `CLAUDE.md` (§1/§3) + `docs/20-MEMORIA-ESPACIAL` (schema) + `docs/50-CONFIG-INFRA` |
| `AVANCES.md` | 161.7 | Bitácora append-only (3420 L) — destilada en semillas | `docs/99-HISTORIAL` (ADRs §01-§09) + `docs/30-LECCIONES` + `docs/10`. Detalle fino por offset AQUÍ. |
| `ALTORRACARSCLAUDE.md` | 49.7 | ~95% copia del KB viejo de Altorra CARS (no de inmobiliaria) | El §12 único (smart-search) → `docs/99 §10`. El resto = ref a cars → consultar el cerebro de cars. |
| `MEGA-PLAN.md` | 37.4 | Estrategia/benchmark — destilada | `docs/41-MERCADO` (benchmark competidores + matriz + estrategia) |
| `PLAN-MEJORAS.md` | 21.3 | Roadmap fechado 2026-04-16 (anterior a AVANCES; desync interno) | `docs/10` (gaps J1-J5, fuente de verdad = AVANCES). ⚠️ NO usar su "qué sigue". |
| `DEPLOY-RUNBOOK.md` | 10.0 | Runbook de deploy/infra | `docs/50-CONFIG-INFRA` (Project ID/IAM público; secrets nombrados, no copiados) |
| `CONTENIDO-EDITORIAL.md` | 8.1 | Guía editorial del blog | `docs/20-MEMORIA-ESPACIAL §Blog` (schema colección `blog` + flujos) |

> **Verificación de cero-pérdida**: los 7 archivos están aquí ÍNTEGROS (git los movió como renames `R`, history intacta
> — `git log --follow _legacy/<archivo>`). Las semillas destiladas a los nodos son un RESUMEN; el detalle completo vive aquí.
> `tests/MANUAL-meta-snapshot.md` NO se movió (sigue en `tests/`, referenciado desde `docs/30 L-06`).
