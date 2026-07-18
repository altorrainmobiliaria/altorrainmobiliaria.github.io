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
> **FRENTE 2 — PAUTA: ✅ LISTA-PARA-ENCENDER** (§33-§37). SSoT = skill **`pauta-captacion`**
> (orquestadora: playbook 1ª campaña + setup en orden + gates + vigencia oficial fechada). Encendido converge
> con el CIERRE DE OBRA (números matrícula/RNT + privacidad publicada + píxel/GA4 + landing verificada →
> campaña EN PAUSA → "sí" de Daniel). Lotes TikTok → verificar → backlog `compartido-marketing/` → skills.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** (SSoT `tokens.css` + ADR §23-§23.9 + memorias): navy `#062743` · blanco ·
> oro `#D4AF37` · plata `#BFC3C9` · grises fríos; fondo blanco, ORO predomina, sin verde/rojo/negro; Cormorant +
> Hanken; neu+glass DUAL-MODE. Dev: `npm --prefix portal run dev` (4321). (La VOZ sí está EN FORJA — memoria.)
>
> **🚦 BLOQUEADORES (solo Daniel)**: **matrícula y RNT YA EXISTEN** ✅ (2026-07-18) — los NÚMEROS los entrega al
> CIERRE DE OBRA (web lista y confiable primero; hasta entonces footer `000000` y CERO pauta — Ley 820 art. 31
> exige el nº en publicidad de arriendo). Falta: dirección física. Contacto oficial ✅.
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo (§15.7) · (b) NUNCA UI sin mockup · (c) datos del
> portal = DEMO (`client.ts` listo) · (d) NUNCA dinero sin gate · JAMÁS el 323… personal · sin gráficas · ALTORRA
> MAYÚSCULA · (e) skills portables: editar AMBAS copias (repo + user) o se derivan (§33).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (gate T9) · deploy de rules (coordinado con retiro legacy, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-20** | Constancias liderazgo ×3: ✅ **bersaglio APLICADA+pusheada** (`486640f`) · ✅ **insema APLICADA+pusheada** (`a042494`, rama `cerebro/todo-32` — merge a main = dueño) · ⚠️ **cars: aplicada+45 archivos STAGED pero commit BLOQUEADO por su pre-commit** (su `10` excede cap PREEXISTENTE → su operador poda o Daniel autoriza `--no-verify`). Payload de lecciones cars→bersaglio (detached-HEAD + metas) espera su shard TODO-77 (instrucciones anotadas allá). §38. | 🟡 solo cars | |
| **TODO-21** | **Lote-dueño**: entrega de Nº matrícula + Nº RNT (ya existen ✅; Daniel los da al CIERRE DE OBRA) · dirección física · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-22** | **Auditoría Fable**: (a) ADR §22 `[REVISAR-FABLE]` (capa de datos); (b) decisión catálogo público SSG vs doc-índice (gatea datos reales). | 🔮 FABLE | |
| **TODO-23** | 🔧 **Kernel hardening** (owner=cars, single-writer): K-01/02/04/05/09 + nuevos §33: priorizar warns en el truncado de `--boot` · gate #7 debe ver GIT de la bóveda · romper circularidad del boot-budget. **9/10 K sin resolver; kernel intacto desde 06-27 → SLA vencido, escalar por sinapsis.** | 🔴 kernel | §33 G-09 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07, regex anclada) · re-apuntar cache/ssotFact al portal EN EL CUTOVER (K-10/G-12: el SW legacy AÚN se sirve — conservar hasta entonces). K-06 ✅ CERRADO §33 (espejo en bóveda). | 🟡 abierto | |
| **TODO-27** | 🎨 **REBUILD DE FIDELIDAD**: 13 ALTA ✅ · **35 MEDIA/BAJA pendientes** (ficha 8 = primero). Síntesis de bóveda ya AUTOCONTENIDA (§33). Método L-29: diff vs `.dc.html` + re-auditar adversarial. | 🔄 OPUS | Frente 1 |
| **TODO-28** | 🧠 **Endurecer el cerebro** (comité §33, crudo en bóveda; unánime "idea correcta, automatizar"): #1 hooks PreCompact/SessionEnd (mata M-01/M-02) · #2 candado del boot en pre-commit + one-in-one-out · #4 `brain:kernel-pull` · #5 índice `00` generado · #6 métrica costo-del-cerebro (>30% = bandera roja) · #7 sello de vencimiento en hechos (>90d = re-verificar). #3 (respaldo memoria) ✅ HECHO. Los kernel-side van vía sinapsis a cars. | 🟢 listo p/ejecutar | ~2-3 días, $0 |
| **TODO-29** | 📣 **PAUTA — skill `pauta-captacion` CONSTRUIDA** ✅ (§37: playbook 1ª campaña Leads+CTWA+Higher-Intent · setup en orden · CAPI-Worker $0 · 8 parches de vigencia · CPQL propia = benchmark). **Qué falta para ENCENDER** (converge con cierre de obra): números matrícula/RNT (Daniel) · política de privacidad publicada · WhatsApp Business↔página FB · píxel+GA4 en el portal · landing verificada → campaña EN PAUSA → "sí" de Daniel. Mientras: lotes TikTok al backlog + creativos con `ad-creative`+Brief. | 🟢 lista p/encender | gate=obra |

---

## 📝 Bitácora (efímera)

> **2026-07-18 (FABLE-5 — §33)**: skills SEO/AEO/GEO corregidas (→L-30) · 32 hallazgos de auditoría de skills
> curados · auditoría Nivel-2 #3 (retrieval 5/5; M-01 reincidió →M-02; bóveda respaldada; memoria espejada;
> GC pareado) · comité unánime pro-cerebro → TODO-28. Detalle COMPLETO → ADR §33 + bóveda `2026-07-18-*`.

> **2026-07-18 tarde/noche (FABLE-5 — §34-§38)**: §34 masterclass+Housing+principios · §35 minería (paid-ads
> v2.2 = base) · §36 BACKLOG ×proyectos · TODO-25 cerrado (bot revivió) · §37 skill `pauta-captacion` +
> investigación oficial + 8 parches vigencia · **§38 Meta Business ORDENADO EN VIVO** (cuenta ads reclamada al
> portafolio + píxel `1032884172712946` creado + inventario → `pauta-captacion/references/activos-meta.md`;
> pendientes-dueño: login IG · WhatsApp sync · saldo) + **cerebros alineados** (bersaglio+insema pushed; cars
> staged-bloqueado por su cap). Detalle → ADR §33-§38 + bóveda. **PRÓXIMO**: Frente 1 (ficha, Opus) · TODO-28.

> *(Bitácora 07-17 §32 podada — consolidada en ADR §32.14-.24 + L-29 + síntesis de bóveda. §G.4 GC.)*
