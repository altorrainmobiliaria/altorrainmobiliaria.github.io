# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (re-sellado 2026-08-19)

> **🏗️ FRENTE ACTIVO = LA PÁGINA** (portal). Qué sigue y en qué estado está → bloque de ARRANQUE EN FRÍO
> de la bitácora. TODO-27 ✅ · TODO-30 mapa ✅ (falta la vista foreground) · catálogo §56-§59 ✅ hasta la
> FRONTERA pre-cutover (§60) · **§88 leads** ✅ · **§89 header sin 404s** ✅. Fidelidad → L-29/L-24/L-28;
> mockups en `portal/design/mockups/` (9). Dev: `npm --prefix portal run dev` (4321).
>
> **⏸️ EN PAUSA (19-ago)**: FRENTE 0 fundación (TODO-34, kit legal). **FRENTE PAUTA**: lista, gateada
> por el CIERRE DE OBRA (§33-§37, SSoT = skill `pauta-captacion`).
>
> **🎨 DISEÑO SELLADO — NO re-litigar** → `CLAUDE.md §1` + `portal/src/styles/tokens.css` + ADR §23-§23.9.
> **🚦 BLOQUEADORES (solo Daniel)** → flag ⚖️ de `05` + TODO-21 + las pelotas de la bitácora.
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo (§15.7) · (b) NUNCA UI sin mockup (única exención:
> el mapa de TODO-30) · (c) datos del portal = DEMO · (d) NUNCA dinero sin gate · JAMÁS el 323… personal · sin
> gráficas · ALTORRA MAYÚSCULA · (e) skills portables: editar AMBAS copias (repo + user) o se derivan (§33).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (T9) · deploy de rules (en el cutover) · 0.4 obra AEO (0.6 legal ✅ §90). | 🔄 OPUS | gate=CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº **RNT** (la matrícula ya está PUBLICADA, `05`) · dirección física y COMERCIAL · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-CEREBRO** | 🧠 **Mantenimiento del cerebro** (ya NO en pausa: 20-ago Daniel levantó el límite de capacidad). **TODO-23** kernel hardening K-01/02/04/05/09 (§30.4; editar CANÓNICO → bump `VERSION` → `brain:pull` ×4) · **TODO-24** ssotFact de paleta + cache al portal en el CUTOVER · **TODO-28** #7 sello >90d · **TODO-38** (§90) gates a medias: #27 sin `creas` · #5 existencia≠corrección · `§NN` sueltos sin gate · `30`/`33`/`00`/`20` en ↗ · pelotas sin ID · **TODO-32(b)** [[M-09]] a los hermanos + banner de costo (solo baja con commits de PRODUCTO). | 🔄 | §84·§87·§90 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada y fontanería §4b OK (estado → flag 📣 de `05`). Resta **calibrar la campaña REAL**, gateada por el cierre de obra. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30** | 🗺️ **MapLibre ✅ COMPLETO (§55)** — falta SOLO la vista en foreground (rAF congelado en pestañas automatizadas, [[L-39]] → la confirma Daniel). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-39** | 🌊 **OLA 1: falta 1 de 13** (✅ §91 SEO · §92 zonas · §93 precios · §94 Rango · §95 JSON-LD del negocio). Resta **alertas**, con DOS gates reales: clave de Resend + catálogo real. ⚠️ **Tuya (§94.6)**: «Avalúo» sale en `Header`/`Footer` y B13 lo PROHÍBE (Ley 1673); la skill de voz sí lo usa. | 🟢 | MEGA-PLAN |
| **TODO-22** | **CATÁLOGO — completo hasta la FRONTERA pre-cutover (§56-§60)**. Para datos reales: (1) deploy COORDINADO en el cutover (rules + `functions:portal`) · (2) `PUBLIC_CATALOGO_SOURCE=live` · (3) sembrar propiedades. Lo demás BLOQUEADO por causas reales (§60.4); insumos legales de la ficha → TODO-33. | 🟢 cutover | §60 |
| **TODO-33** | 🧾 **FICHA dinámica — 4 decisiones ANTES de construir (§60.3)**: dirección exacta · financiación · asesor · POIs. Regla: **bloque sin dato se OMITE** (jamás heredar el demo). | 🔵 decisión | §60 |
| **TODO-34** | ⭐ ⏸️ **FUNDACIÓN OPERATIVA — en pausa (19-ago)**. Kit 00-22 emitido y auditado; críticos y altos aplicados (§70·§71). Leves **28/92** (§86-§87). ⚠️ sin escéptico ⇒ uno por uno, NUNCA en lote (§70.6). No bloquea: el kit no se firma hasta el cierre de obra. Ledger reanudable → bóveda `2026-08-03-leves-b03-LEDGER.md`. | ⏸️ 28/92 | §87 · `43` |

---

## 📝 Bitácora (efímera)

> ### 🏗️ ARRANQUE EN FRÍO — lee esto y ya sabes dónde estás (2026-08-21)
>
> **Frente activo: TERMINAR EL MEGA-PLAN** (web + sistema). Daniel el 21-ago: *«las campañas al final,
> nos interesa terminar la página web y el sistema, todo el mega plan»*. **Opus 5 para TODO**, esfuerzo
> Max, agentes y workflows LIBRES bajo tu juicio (levantó ese límite el 20-ago).
>
> **OLA 1 va 12 de 13** (TODO-39). La noche del 20→21-ago cerró: §91 SEO técnico · §92 las 13 landings
> de zona · §93 `/precios` · §94 Rango ALTORRA · §95 JSON-LD del negocio. **23 páginas** (censo → `20`);
> `/publicar` y el Rango captan leads REALES en `solicitudes` (§88, §94).
>
> **Lo siguiente, en orden**: (1) **TODO-30**, la vista del mapa en foreground — solo la confirma Daniel
> con la ventana al frente ([[L-39]]) · (2) **TODO-22/33**, el catálogo REAL, gate del cutover y de casi
> todo lo que queda · (3) **OLA 2** (`MEGA-PLAN`). El 13º (alertas) espera clave de Resend Y catálogo
> real: una alerta sin catálogo no tiene contra qué dispararse.
>
> ⚠️ **Antes de tocar código, lee `34-DOCTRINA-CODIGO`** (trigger 🖥️) y, si el síntoma te suena, `30`:
> [[L-33]] (`locals.runtime.env` removido en Astro v6) YA cobró dos veces.


> **🔴 SIGUE ROTO — el aviso de leads.** `onNewSolicitud` falla con `535-5.7.8` (credenciales de Gmail).
> Los 16 del sitio viejo se BORRARON el 20-ago (exportados antes, `43`), pero **es la misma Function que
> avisará los del portal nuevo**: lanzar sin rotar la contraseña = perderlos igual, y sin evidencia.

> **▶ ✅ PAUTA BERSAGLIO CERRADA 20-ago** (0 ventas/63 conv ⇒ Meta no es el canal a ese precio; 6 zombies ✅verificado 20-ago (0 activas en todo el histórico)
> apagadas). Detalle → `../bersagliojewelry.github.io/docs/44-PAUTA-META.md`; doctrina → `meta-ads-diagnostico`.
> ⏭️ **VIVO**: **26 conversaciones sin leer** (9+ días) en el WhatsApp de Bersaglio · avisarle a **Kary**.

> **⏭️ PELOTAS DE DANIEL** (no las puedo cerrar yo):
> **(1)** rotar la **contraseña de aplicación de Gmail** — sin eso los leads no avisan (arriba).
> **(2)** ✅ Política V2 **PUBLICADA y LIVE** (20-ago, `curl` 200). Queda TU visto bueno para **abrir
> "Crear cuenta"**: el código de `/ingresar` aún la bloquea citando una política que YA existe (§90).
> **(3) B-04** — sin contrato con DataCrédito/TransUnion **NO se puede consultar a nadie** aunque el
> arrendatario firme, y el doc 04 ya se lo anuncia: ¿afiliarse, o apoyarse solo en la aseguradora?
> **(4)** verificar los **recovery codes** (último resto del SPOF, §72).
> **(5)** Nº de **RNT** (la matrícula `6636` YA está publicada) + vetar los 6 estándares del `02 §2`.
> **(6)** ¿**Google** como proveedor de acceso está habilitado en Firebase? Sin evidencia de que lo esté;
> el botón ya avisa en cristiano si no lo está, pero es un interruptor de su consola.
> **(7)** decidir la **tasa de mora del doc 03** (B-05: 1,5×IBC vs 6%) — un párrafo, y las 5 remisiones
> lo heredan solas.
> **(8)** el form de `/publicar` **no pide correo** (fiel al mockup) y eso hace que un propietario real
> llegue etiquetado `[COLD]`: o se añade el campo al mockup, o se re-pesa el scoring.
> **(9) 📣 PAUTA — al final por decisión tuya (21-ago), y es seguro aplazarla CON UNA CONDICIÓN:** la
> campaña de humo puede seguir ACTIVA (playbook §4b) y **solo muerde el día que recargues saldo**
> ([[D-15]]). Mientras no recargues, no gasta. **Antes de recargar un peso**, compruébala con tu sesión
> de Meta (la de Bersaglio no ve Altorra, [[D-16c]]): filtro SOLO `Entrega=Activo` + rango Máximo, que
> el botón «Anuncios activos» ESCONDE los zombies ([[D-15b]]).

> **▶ CONSOLIDADO** — §81-§95 ya son ADRs; el relato y el ruteo viven en `00-INDICE` → `99` (SSoT).

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: 64 leves del kit (ledger en bóveda) · [[M-09]] a los
> 3 hermanos (TODO-32b) · backlog B-01..B-05. 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los
> 12 planificadores: está pagado y en la bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **Kit (⏸️ pausa)**: los **ESTATUTOS MANDAN** (V5, art. 8º/13º/24º, §70.2) y se abren ANTES de auditar
> ([[LD-05]]; gitignored, cédulas). ⛔ Docs **13 y 23 RETIRADOS** (§87). ⚠️ **Word y manual NUNCA a mano**:
> se GENERAN (§68 · detalle en `43`) — editar el maestro directo desincronizó el capítulo 2.
