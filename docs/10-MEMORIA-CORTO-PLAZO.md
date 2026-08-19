# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (re-sellado 2026-08-19)

> **🏗️ FRENTE ACTIVO = LA PÁGINA** (portal). Qué sigue y en qué estado está → bloque de ARRANQUE EN FRÍO
> de la bitácora. TODO-27 ✅ · TODO-30 mapa ✅ (falta la vista foreground) · catálogo §56-§59 ✅ hasta la
> FRONTERA pre-cutover (§60) · **§88 leads** ✅ · **§89 las 8 pantallas** ✅. Fidelidad → L-29/L-24/L-28;
> mockups en `portal/design/mockups/` (9). Dev: `npm --prefix portal run dev` (4321).
>
> **⏸️ EN PAUSA por decisión de Daniel (19-ago)**: FRENTE 0 fundación operativa (TODO-34, kit legal) y el
> mantenimiento del cerebro. **FRENTE PAUTA**: lista para encender, gateada por el CIERRE DE OBRA (§33-§37,
> SSoT = skill `pauta-captacion`).
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
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (T9) · deploy de rules (en el cutover, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | gate=CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº matrícula + Nº RNT (existen ✅; Daniel los da al CIERRE DE OBRA) · dirección física · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-CEREBRO** | 🧠 ⏸️ **Mantenimiento del cerebro, TODO en pausa (19-ago)** — se retoma cuando la página respire. **TODO-23** kernel hardening restante (K-01/02/04/05/09 §30.4; flujo: editar CANÓNICO → bump `VERSION` → `brain:pull` ×4; `brain-kit` sigue SIN git) · **TODO-24** ssotFact de paleta + re-apuntar cache al portal en el CUTOVER · **TODO-28** #7 sello de vencimiento >90d · **TODO-32(b)** llevar [[M-09]] a los hermanos (insema al 98,5%, sin podar a propósito §87) y el banner de costo, que **solo baja con commits de PRODUCTO**. | ⏸️ pausa | §84·§87·§195 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada y fontanería §4b OK (estado → flag 📣 de `05`). Resta **calibrar la campaña REAL**, gateada por el cierre de obra. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30** | 🗺️ **MapLibre ✅ COMPLETO (§55)** — falta SOLO la vista en foreground (rAF congelado en pestañas automatizadas, L-34 → la confirma Daniel). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-22** | **CATÁLOGO — completo hasta la FRONTERA pre-cutover (§56-§60)**. Para datos reales: (1) deploy COORDINADO en el cutover (rules + `functions:portal`) · (2) `PUBLIC_CATALOGO_SOURCE=live` · (3) sembrar propiedades. Lo demás BLOQUEADO por causas reales (§60.4); insumos legales de la ficha → TODO-33. | 🟢 cutover | §60 |
| **TODO-33** | 🧾 **FICHA dinámica — 4 decisiones ANTES de construir (§60.3)**: dirección exacta · financiación · asesor · POIs. Regla: **bloque sin dato se OMITE** (jamás heredar el demo). | 🔵 decisión | §60 |
| **TODO-34** | ⭐ ⏸️ **FUNDACIÓN OPERATIVA — en pausa (19-ago)**. Kit 00-22 emitido y auditado; críticos y altos aplicados (§70·§71). De los leves van **28/92** (§86-§87): 18 aplicados · 6 moot · 4 ya resueltos · **2 remedios refutados**. ⚠️ sin escéptico ⇒ **uno por uno, NUNCA en lote** (§70.6). No bloquea nada: el kit no se firma hasta el cierre de obra. Ledger reanudable → bóveda `2026-08-03-leves-b03-LEDGER.md`. | ⏸️ 28/92 | §87 · `43` |

---

## 📝 Bitácora (efímera)

> ### 🏗️ ARRANQUE EN FRÍO — lee esto y ya sabes dónde estás (2026-08-19)
>
> **Frente activo: CONSTRUIR LA PÁGINA.** Daniel congeló cerebro y kit el 19-ago (el 72% del trabajo del
> mes era mantenimiento y la web no avanzaba). **Opus 5 para TODO**, esfuerzo Max, **sin ultracode** —
> nada de agentes ni workflows por reflejo; si algo pide comité, se le pide a él primero.
>
> **Las 8 pantallas del portal EXISTEN**: el header ya no tiene un solo enlace roto (§89). Y el portal
> **ya captura**: `/publicar` crea leads reales en `solicitudes` (§88).
>
> **Lo siguiente, en orden:**
> 1. **Formularios de contacto de la ficha y el home** → misma tubería de `/api/solicitud` que ya está
>    probada. Es por donde entra el COMPRADOR, y hoy tampoco captura.
> 2. **TODO-30**: falta solo la vista del mapa en foreground (la confirma Daniel, L-34).
> 3. **Optimizar imágenes del portal** a WebP <150KB (`public/assets` sigue con JPG pesados; §3.1 → `34`).
>
> ⚠️ **Antes de tocar código, lee `34-DOCTRINA-CODIGO`** (trigger 🖥️) y, si el síntoma te suena, `30`:
> [[L-33]] (`locals.runtime.env` removido en Astro v6) YA cobró dos veces, la última el 19-ago.

> **🔴 ABIERTO Y CARO — el aviso de leads está ROTO en producción.** `onNewSolicitud` dispara y falla con
> `535-5.7.8 Username and Password not accepted`: las credenciales de Gmail (`EMAIL_USER`/`EMAIL_PASS`)
> no sirven. **Hoy ningún lead le avisa a nadie — tampoco los del sitio viejo**; quedan en Firestore hasta
> que alguien abra el panel. Además el documento no recibe `leadScore`/`nurturing` aunque el código del
> repo los escribe antes del envío, lo que **sugiere (sin verificar)** que la Function desplegada no es la
> del repo. → **pelota de Daniel**: rotar la contraseña de aplicación. Capturar mejor no sirve sin esto.

> **▶ 🔥 PAUTA BERSAGLIO — ⏰ LA FECHA DE PARADA PASÓ HACE 9 DÍAS** (era el 10-ago). `120251090001200439`,
> $8.000/día. S1 cerró con **0 ventas de 33 chats** y la regla escrita era: sin 1 venta ni 3 visitas al
> 10-ago, **NO recargar**. **Nadie verificó ni cortó.** Daniel dijo el 19-ago: *dejarlo quieto por ahora*.
> Detalle → bóveda `2026-07-31-pauta-bersaglio-escala-SINTESIS.md` · skill `meta-ads-diagnostico`.

> **⏭️ PELOTAS DE DANIEL** (no las puedo cerrar yo):
> **(1)** rotar la **contraseña de aplicación de Gmail** — sin eso los leads no avisan (arriba).
> **(2) publicar la Política de Datos V2** en `/legal/politica-tratamiento-datos`. Es despliegue, no
> decisión, y ahora **bloquea dos cosas**: los 24 docs la fijan en **V2 · 28-07-2026** (§71.3) y **sin ella
> no se puede abrir "Crear cuenta"** en el portal (Ley 1581 art. 9, §89.6).
> **(3) B-04** — sin contrato con DataCrédito/TransUnion **NO se puede consultar a nadie** aunque el
> arrendatario firme, y el doc 04 ya se lo anuncia: ¿afiliarse, o apoyarse solo en la aseguradora?
> **(4)** verificar los **recovery codes** (último resto del SPOF, §72).
> **(5)** Nº de **matrícula y RNT** (al cierre de obra) + vetar/ajustar los 6 estándares del `02 §2`.
> **(6)** ¿**Google** como proveedor de acceso está habilitado en Firebase? Sin evidencia de que lo esté;
> el botón ya avisa en cristiano si no lo está, pero es un interruptor de su consola.
> **(7)** decidir la **tasa de mora del doc 03** (B-05: 1,5×IBC vs 6%) — un párrafo, y las 5 remisiones
> lo heredan solas.
> **(8)** el form de `/publicar` **no pide correo** (fiel al mockup) y eso hace que un propietario real
> llegue etiquetado `[COLD]`: o se añade el campo al mockup, o se re-pesa el scoring.

> **▶ CONSOLIDADO — el relato completo vive en sus ADRs**: §81/§82 (candado de boot al kernel · 6 gates
> del kit) · **§83** auditoría Nivel-2 #6 · **§84** poda del router ([[M-09]]) · **§85** TODO-37 cerrado +
> kernel ×4 ([[M-07]] forma 2) · **§86-§87** leves del kit 28/92 + **B-05** · **§88** leads cableados ·
> **§89** `/ingresar` y `/favoritos`.

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: los **64 leves** restantes del kit (ledger en bóveda,
> `2026-08-03-leves-b03-LEDGER.md`) · [[M-09]] a los 3 hermanos (TODO-32b) · backlog **B-01..B-05**.
> 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los 12 planificadores — está todo pagado y en la
> bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **LOS ESTATUTOS MANDAN sobre el kit** (V5, art. 8º/13º/24º) → §70.2. [[LD-05]]: abre el documento
> madre ANTES de auditar; entra al contexto pero es **gitignored** (cédulas de los 3 socios).
> ⛔ **Docs 13 y 23 RETIRADOS**; sus riesgos asumidos están enumerados en el banner del 13 (4 desde §87).
> ⚠️ **Ni los Word ni el manual maestro se editan a mano**: se GENERAN (`generar-documentos.ps1` ·
> `ensamblar-manual.ps1`, §68). Editar el maestro directo fue lo que duplicó y desincronizó el capítulo 2.
