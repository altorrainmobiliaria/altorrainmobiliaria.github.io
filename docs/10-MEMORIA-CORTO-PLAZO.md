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
> **FRENTE 2 — TODO-29: skills de PAUTA (Meta + Google Ads)** — mandato Daniel 2026-07-18. ✅ Ya listo (§34):
> Housing/Special Ad Category VERIFICADO en doc oficial (NO aplica a pauta→Colombia; SÍ si pautamos a EE.UU./
> Canadá — ver `catalogo-voz-altorra §6.3`) · masterclass del dueño ADOPTADA (`marketing-psicologico-conversion`
> +§10 guardarraíles) · Brief leído/respaldado (bóveda `pauta/`). **Esperando: material TikTok que
> Daniel enviará (revisarlo CRÍTICAMENTE — puede ser básico/vacío) + skills que descargue.** Luego: investigación
> seria (docs oficiales Meta/Google + los grandes del marketing) → proceso de pauta 100% funcional. Gap-analysis
> en §33 (falta: audiencias/CBO/Advantage+/píxel-CAPI/presupuestos/Google Ads). ⚠️ RNT = prerequisito de pauta de
> alojamientos.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** (SSoT `tokens.css` + ADR §23-§23.9 + memorias): navy `#062743` · blanco ·
> oro `#D4AF37` · plata `#BFC3C9` · grises fríos; fondo blanco, ORO predomina, sin verde/rojo/negro; Cormorant +
> Hanken; neu+glass DUAL-MODE. Dev: `npm --prefix portal run dev` (4321). (La VOZ sí está EN FORJA — memoria.)
>
> **🚦 BLOQUEADORES (solo Daniel)**: matrícula real (footer `000000`) · dirección física · RNT. Contacto oficial ✅.
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo (§15.7) · (b) NUNCA UI sin mockup · (c) datos del
> portal = DEMO (`client.ts` listo) · (d) NUNCA dinero sin gate · JAMÁS el 323… personal · sin gráficas · ALTORRA
> MAYÚSCULA · (e) skills portables: editar AMBAS copias (repo + user) o se derivan (§33).

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
| **TODO-29** | 📣 **PAUTA Meta + Google Ads — fase CONSTRUCCIÓN**: base COMPLETA (§34-§35: Housing ✅ · masterclass+ganchos+cronograma ✅ · `paid-ads` v2.2 con meta-decision-system TCPL + google-search-playbook · `ad-creative` v2.8 · video/offers/marketing-loops/image adoptadas · Brief ✅). Siguiente: investigación seria (docs oficiales Meta/Google + grandes del marketing) → skill de pauta ALTORRA-específica sobre esa base + más material TikTok de Daniel según llegue. RNT = gate de alojamientos. | 🔄 activo | Frente 2 |

---

## 📝 Bitácora (efímera)

> **2026-07-18 (FABLE-5 — §33)**: skills SEO/AEO/GEO corregidas (→L-30) · 32 hallazgos de auditoría de skills
> curados · auditoría Nivel-2 #3 (retrieval 5/5; M-01 reincidió →M-02; bóveda respaldada; memoria espejada;
> GC pareado) · comité unánime pro-cerebro → TODO-28. Detalle COMPLETO → ADR §33 + bóveda `2026-07-18-*`.

> **2026-07-18 tarde (FABLE-5 — §34+§35)**: §34 = masterclass adoptada · Housing resuelto (fuente primaria) ·
> memorias con los 2 principios de Daniel (libre albedrío / voz EN FORJA). §35 = material TikTok procesado
> (ganchos §9b · cronograma §9c · feed/reels+horarios❓ §9d · pre-pauta+Ads-Library → meta-ads) + humo tumbado
> (claim "Karpathy" refutado) + **minería marketingskills: 9 adopciones curadas** (paid-ads v2.2 = base de
> pauta · ad-creative v2.8 · video/offers/marketing-loops/image · 3 de referencia · tools descartado, APIs
> muertas). Detalle → ADR §35 + bóveda. **PRÓXIMO**: TODO-29 construcción. Frente 1 (ficha) sigue para Opus.

> *(Bitácora 07-17 §32 podada — consolidada en ADR §32.14-.24 + L-29 + síntesis de bóveda. §G.4 GC.)*
