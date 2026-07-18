# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (cierre 2026-07-18, sesión Fable §33)

> **Dos frentes abiertos, en este orden:**
>
> **FRENTE 1 — TODO-27: cerrar los 35 hallazgos MEDIA/BAJA de fidelidad del portal** (§32.24).
> La síntesis de bóveda `2026-07-17-reauditoria-fidelidad-sintesis.md` es AUTOCONTENIDA (§33 la parcheó): lista 1:1
> + tabla página→mockup→impl + bloque **"Qué NO corregir (intencional)"** — leerla ANTES de tocar. Por página:
> **ficha 8 (LA MÁS URGENTE, sin tocar)** · turismo 8 · estancias 8 · serp 7 · home 2 · publicar 2.
> **MÉTODO (L-29/L-24)**: bloque del `.dc.html` → corregir TEXTUAL → re-auditar adversarial ANTES de decir "fiel".
> NUNCA inventar. Capas: build → estructura → computed (miente con `transition`, L-28) → screenshot Chrome → diff
> vs fuente. Reusar piezas hechas (`.alt-rail`, `.alt-btn-sweep`, 6 cards NO intercambiables — ver síntesis).
>
> **FRENTE 2 — TODO-29: skills de PAUTA (Meta + Google Ads)** — mandato Daniel 2026-07-18. Base =
> `meta-ads-diagnostico` + gap-analysis hecho (§33): faltan targeting/audiencias (**crítico: resolver Special Ad
> Category Housing** — hoy [A VERIFICAR] en `catalogo-voz-altorra §6.3`) · estructura CBO/ABO/Advantage+ · píxel/
> CAPI paso a paso · presupuestos · creativos · Google Ads casi entero. Insumos del dueño: `Brief_Diseño_Piezas_
> Captacion.docx` + huérfana `.agents/` (TODO-30). ⚠️ RNT real = prerequisito de pauta de alojamientos.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** (SSoT `portal/src/styles/tokens.css` + ADR §23-§23.9 + memorias de marca):
> paleta navy `#062743` · blanco · dorado `#D4AF37` · plata `#BFC3C9` · grises `#E6EDF2`/`#F2F6F9` · disciplina
> ESTRICTA (fondo blanco, DORADO predomina, SIN verde/rojo/negro; estados navy+oro+ÍCONO) · **Cormorant Garamond** +
> **Hanken Grotesk** · neu protagonista + glass sutil, DUAL-MODE. Dev: `npm --prefix portal run dev` (puerto 4321).
>
> **🚦 BLOQUEADORES DE PRODUCCIÓN (solo Daniel)**: Nº matrícula real (footer `000000`) · dirección física · RNT.
> Contacto oficial cableado ✅ (+57 300 243 9810 / info@altorrainmobiliaria.co).
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo como base (ADR §15.7) · (b) NUNCA UI sin mockup
> aprobado · (c) datos del portal = DEMO estáticos (`client.ts` listo para cablear) · (d) NUNCA dinero sin gate ·
> JAMÁS el nº personal del dueño (323…) · sin gráficas (regla Daniel) · ALTORRA siempre MAYÚSCULA · (e) skills
> portables: editar AMBAS copias (repo + `~/.claude/skills`) o se derivan (§33).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (gate T9) · deploy de rules (coordinado con retiro legacy, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-20** | Constancias liderazgo ×3 + import bersaglio: payloads en `sinapsis-cerebros/references/` — **verificado §33: SIGUEN sin aplicar** por los operadores destino. | ⏸️ externo | escalar en próxima sesión de cada repo |
| **TODO-21** | **Lote-dueño**: matrícula real · dirección física · RNT · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño | pedir por LOTES |
| **TODO-22** | **Auditoría Fable**: (a) ADR §22 `[REVISAR-FABLE]` (capa de datos); (b) decisión catálogo público SSG vs doc-índice (gatea datos reales). | 🔮 FABLE | |
| **TODO-23** | 🔧 **Kernel hardening** (owner=cars, single-writer): K-01/02/04/05/09 + nuevos §33: priorizar warns en el truncado de `--boot` · gate #7 debe ver GIT de la bóveda · romper circularidad del boot-budget. **9/10 K sin resolver; kernel intacto desde 06-27 → SLA vencido, escalar por sinapsis.** | 🔴 kernel | §33 G-09 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07, regex anclada) · re-apuntar cache/ssotFact al portal EN EL CUTOVER (K-10/G-12: el SW legacy AÚN se sirve — conservar hasta entonces). K-06 ✅ CERRADO §33 (espejo en bóveda). | 🟡 abierto | |
| **TODO-25** | 📟 **deploy-info.json congelado** (F-03 §30): verificar runs GH Actions + reconciliar claim CLAUDE.md §1. Legacy → baja urgencia. | 🟡 abierto | sin `gh` |
| **TODO-27** | 🎨 **REBUILD DE FIDELIDAD**: 13 ALTA ✅ · **35 MEDIA/BAJA pendientes** (ficha 8 = primero). Síntesis de bóveda ya AUTOCONTENIDA (§33). Método L-29: diff vs `.dc.html` + re-auditar adversarial. | 🔄 OPUS | Frente 1 |
| **TODO-28** | 🧠 **Endurecer el cerebro** (comité §33, crudo en bóveda; unánime "idea correcta, automatizar"): #1 hooks PreCompact/SessionEnd (mata M-01/M-02) · #2 candado del boot en pre-commit + one-in-one-out · #4 `brain:kernel-pull` · #5 índice `00` generado · #6 métrica costo-del-cerebro (>30% = bandera roja) · #7 sello de vencimiento en hechos (>90d = re-verificar). #3 (respaldo memoria) ✅ HECHO. Los kernel-side van vía sinapsis a cars. | 🟢 listo p/ejecutar | ~2-3 días, $0 |
| **TODO-29** | 📣 **Skills de PAUTA Meta + Google Ads** (mandato Daniel 2026-07-18): construir hermanas de CONSTRUCCIÓN de `meta-ads-diagnostico` — gap-analysis listo en §33. Tarea previa #1: resolver Meta **Housing/Special Ad Category** para Colombia (doc oficial). RNT = prerequisito de pauta de alojamientos. | 🔜 próximo | Frente 2 |
| **TODO-30** | 🕳️ **Decisión del dueño**: (a) skill huérfana `.agents/skills/marketing-psicologico-conversion/` (¿adoptar a `skills/` con filtro de voz ALTORRA, o cuarentenar en `_legacy/`?) · (b) `Brief_Diseño_Piezas_Captacion.docx` en la raíz (¿lo leemos juntos para TODO-29? ¿se trackea?). NO borrar (límite de guardián). | ⏸️ dueño | insumos de pauta |

---

## 📝 Bitácora (efímera)

> **2026-07-18 (FABLE-5 — §33)**: encargo Daniel ejecutado COMPLETO. (1) Aprendizajes SEO/AEO/GEO de bersaglio
> portados a las 4 skills de visibilidad (correcciones EDITADAS, ❓=hipótesis) + `seo-auditor` + `tenant-config` +
> nota en `schema-markup` → L-30. (2) Auditoría de ~30 skills: 32 hallazgos, ALTA/MEDIA curados (Wompi unificado,
> voz-altorra, proceso, validacion, ga4…), 5 gemelas re-sincronizadas, inventario reescrito. (3) Auditoría Nivel-2
> #3: retrieval 5/5 · reincidencia M-01 → M-02 · bóveda ENTERA respaldada (estaba sin commit, `8398213`) · memoria
> harness espejada · settings.json versionado · síntesis 07-17 parcheada · GC pareado (05+10). (4) Comité ×3
> unánime: el cerebro de Daniel es la arquitectura correcta a $0; 7 mejoras → TODO-28. Crudos en bóveda
> `2026-07-18-*`. **PRÓXIMO**: Frente 1 (ficha 8) con Opus, o TODO-28/29 según priorice Daniel.

> *(Bitácora 07-17 §32 podada — consolidada en ADR §32.14-.24 + L-29 + síntesis de bóveda. §G.4 GC.)*
