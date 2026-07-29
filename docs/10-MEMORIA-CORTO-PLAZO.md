# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (re-sellado 2026-07-24 · pivote de misión §61)

> **⭐ FRENTE 0 — FUNDACIÓN OPERATIVA = TODO-34 (mandato Daniel 24-jul)**: armar la inmobiliaria COMPLETA con datos
> reales (procesos, legal, docs, capacitaciones); Claude = abogado + todos los empleados a la vez. Plan en TODO-34.
>
> **FRENTE 1 — portal**: TODO-27 ✅ · TODO-30 mapa ✅ (falta vista foreground) · catálogo §56-§59 ✅ hasta la
> FRONTERA pre-cutover (§60). Fidelidad → L-29/L-24/L-28; mockups en `portal/design/mockups/`.
>
> **FRENTE 2 — PAUTA ✅ LISTA-PARA-ENCENDER** (§33-§37; SSoT = skill `pauta-captacion`). El encendido REAL
> converge con el CIERRE DE OBRA → "sí" de Daniel.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** → `CLAUDE.md §1` + `portal/src/styles/tokens.css` + ADR §23-§23.9.
> Dev: `npm --prefix portal run dev` (4321). **🚦 BLOQUEADORES (solo Daniel)** → flag ⚖️ de `05` + TODO-21.
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo (§15.7) · (b) NUNCA UI sin mockup (única exención:
> el mapa de TODO-30) · (c) datos del portal = DEMO · (d) NUNCA dinero sin gate · JAMÁS el 323… personal · sin
> gráficas · ALTORRA MAYÚSCULA · (e) skills portables: editar AMBAS copias (repo + user) o se derivan (§33).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (gate T9) · deploy de rules (coordinado con retiro legacy, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº matrícula + Nº RNT (existen ✅; Daniel los da al CIERRE DE OBRA) · dirección física · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-23** | 🔧 **Kernel hardening RESTANTE** (owner=INMOBILIARIA): K-01/02/04/05/09 (§30.4) · priorizar warns en truncado `--boot` · circularidad boot-budget. Flujo obligatorio: editar CANÓNICO → bump `VERSION` → `brain:pull` ×4. | 🟡 K restantes | §50 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07) · re-apuntar cache/ssotFact al portal EN EL CUTOVER (K-10/G-12: el SW legacy aún se sirve). | 🟡 abierto | |
| **TODO-28** | 🧠 **Endurecer el cerebro**: #1-#3 ✅ (§40-§41) · **#4 ✅ `brain:pull` (F1 §51)** · #5 filas del índice auto vía `brain:archive` ✅ (§52; generador completo = opcional) · **#6 ✅ AUTOMATIZADA en el heartbeat** (§52: % por paths en cada boot — hoy **52% 🔴, mes 1 de medición**; >30% dos meses → PODAR doctrina) · #7 sello de vencimiento >90d (candidato a resonancia) · **#8 SHARD de `30`** (rebasó el tope; venía al 96% — extraer familia a hermana, no recortar más). | 🟡 #7 #8 | $0 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada y fontanería §4b OK (estado → flag 📣 de `05`). Resta **calibrar la campaña REAL**, gateada por el cierre de obra. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30** | 🗺️ **MapLibre real ✅ CÓDIGO COMPLETO (§55)** — tiles por Worker+Range, verificado E2E. **Falta SOLO la vista en foreground** (rAF congelado en pestañas automatizadas, L-34 → la confirma Daniel en su Chrome). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-22** | **CATÁLOGO — completo hasta la FRONTERA pre-cutover (§56-§60)**. Para datos reales: (1) deploy COORDINADO en el cutover (rules + `functions:portal`) · (2) `PUBLIC_CATALOGO_SOURCE=live` · (3) sembrar propiedades. Lo demás BLOQUEADO por causas reales (§60.4); insumos legales de la ficha → TODO-33. | 🟢 cutover | §60 |
| **TODO-33** | 🧾 **FICHA dinámica — decisiones ANTES de construir (§60.3)**: dirección exacta = OMITIR (PII) · financiación = disclaimer legal o se omite la cifra · asesor = `asesorId` vs bloque genérico · POIs fuera en v1. Regla: bloque sin dato se OMITE (jamás heredar el demo). | 🔵 decisión | §60 |
| **TODO-34** | ⭐ **FUNDACIÓN OPERATIVA (§61-§66)**. Kit 00-23 + membrete (`43 §Doc. corporativos`). Póliza **DECIDIDA ✅** · **FE-DIAN ⏸️** · contratos 03/04 → §66 (pagaré retirado · nombre propio · dictámenes propios). ⚠️ **Los otros 22 docs NUNCA auditados** y el kit arrastra ~570 marcas de trabajo → backlog **B-01..B-03** en `_notas/BACKLOG-REVISION-KIT.md`; método fijado por Daniel: **1 documento a la vez**. | 🔄 EN CURSO | §66 · `43` |
| **TODO-32** | 🧠 **CEREBRO v2 ×4 — 🏁 NÚCLEO COMPLETO ✅** (F0 §50 · F1 §51 · F2 §52 · F3 §53; kernel **v1.6.0** ×4; SSoT de la propuesta en bóveda). **Restos vivos**: (a) cablear hook SessionStart en los 3 hermanos (carril de cada repo; instrucción en la skill) · (b) **PODA REAL de doctrina** cuando el banner marque >30% dos meses (hoy 52% 🔴, mes 1) · (c) TODO-31: solo falta la verificación de Daniel (recovery codes). Mantenimiento mensual: el banner avisa → Daniel pide "haz el mantenimiento mensual" → skill `mantenimiento-general`. | 🟡 restos a/b/c | §53 · bóveda |

---

## 📝 Bitácora (efímera)

> **▶ 🔥 PAUTA BERSAGLIO semana1 EN VIVO (27-jul→3-ago)**: campaña `120250983749280439` · adset
> `120250983973160439` · **$13.000/día** · 3 anuncios OK. ⛔ NO editar días 1-7. Plan+umbrales → bóveda
> `2026-07-27-plan-pauta-semana1-SINTESIS.md`. **Pelota Daniel**: guion WhatsApp al equipo + precios amatista/dúo.
>
> **▶ ⚖️ KIT FUNDACIONAL CONSOLIDADO → ADR §66 + §67 (28-jul). 24/24 documentos generan; los 11 de FIRMA pasan
> el GATE DE EMISIÓN en verde.** Figura sellada: **ALTORRA arrienda EN NOMBRE PROPIO** (C.Co. 1262). Pagaré
> retirado. Comité ×6 + consejo ×2 (§66) → comité R3 de 121 agentes + consejo externo R3 (§67).
>
> **🛑 NO RELANZAR el comité R3** (18,8M tok ya pagados). Crudos, síntesis, dictamen del consejo y registro de
> cambios → bóveda `research-archive/2026-07-28-comite-r3-contratos/` (empezar por `00-LEEME.md`).
>
> **⏭️ PELOTAS DE DANIEL** (nada de esto lo puedo cerrar yo):
> 1. **B-04** — ALTORRA **no tiene contrato de usuario con DataCrédito/TransUnion**: sin él NO se puede consultar
>    a nadie, aunque el arrendatario firme. Y el doc 04 ya le anuncia que se le consultará. ¿Afiliarse, o apoyarse
>    solo en el estudio de la aseguradora?
> 2. **Publicar la Política de Datos** en `altorrainmobiliaria.co/legal/politica-tratamiento-datos` — los 24 docs
>    ya la declaran ahí. Ya no es decisión, es despliegue.
> 3. Nº de **matrícula de arrendador** y **RNT** (al cierre de obra) · vetar/ajustar los 6 estándares del `02 §2`
>    sellados bajo delegación.
>
> **⏭️ LO QUE SIGO YO** → backlog **B-01..B-04** en bóveda `_notas/BACKLOG-REVISION-KIT.md` (B-01/B-02 ✅):
> 257 marcas en docs INTERNOS (manual 194 · pagaré 60), **una por una, sin script** (L-33) · verificar el
> **art. 1096 C.Co.** (única cita del kit escrita sin leer la fuente) · copiar el kit a `…\KIT ALTORRA`.
>
> ⚠️ **No editar los Word a mano** — se generan. **Maestro y fragmentos del manual se mantienen a mano por
> duplicado, sin generador**: por eso la misma cifra mala vivía en 3 sitios.
