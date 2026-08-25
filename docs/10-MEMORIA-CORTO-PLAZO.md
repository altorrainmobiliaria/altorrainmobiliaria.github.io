# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> **🏗️ FRENTE ACTIVO = LA PÁGINA** (portal). **Qué sigue y en qué estado está → el bloque de ARRANQUE EN
> FRÍO de la bitácora** (no se repite aquí). Dev: `npm --prefix portal run dev` (4321); mockups en
> `portal/design/mockups/` (10); fidelidad → [[L-29]]/[[L-24]]/[[L-28]].
> **⏸️ EN PAUSA**: fundación (TODO-34) y pauta (TODO-29, SSoT = skill `pauta-captacion`).
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
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" · obra AEO. | 🔄 | gate=CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº **RNT** · dirección física y COMERCIAL · abogado (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño | gate=obra |
| **TODO-CEREBRO** | 🧠 **Mantenimiento del cerebro** (ya NO en pausa: 20-ago Daniel levantó el límite de capacidad). **TODO-23** kernel hardening K-01/02/04/05/09 (§30.4) · **TODO-24** ssotFact de paleta + cache al portal en el CUTOVER · **TODO-28** #7 sello >90d · **TODO-32(b)** [[M-09]] a los hermanos + banner de costo (solo baja con commits de PRODUCTO). Capacidad y gates a medias → **TODO-45**. | 🔄 | §84·§87·§90·§96 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada (estado → flag 📣 de `05`). Resta calibrar la campaña REAL. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30** | 🗺️ **MapLibre ✅ COMPLETO (§55)** — falta SOLO la vista en foreground (rAF congelado en pestañas automatizadas, [[L-39]] → la confirma Daniel). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-22** | **CATÁLOGO completo, ficha incluida (§97)**. Datos reales = fases 3-4 del runbook; luego fichas al sitemap. | 🟢 cutover | §102 |
| **TODO-45** | 🔬 **Deuda de la auditoría #8** (§109). ✅ (a) capa semántica · (b) `degrade()` en #8/#16/#27 · (c) trinquete del índice · (e)(f) los 22 caps recalibrados y `33`/`50` podados — todo en §120. Resta: **(d)** umbrales en DÍAS en un repo que corre en COMMITS; **(g)** las 98 rutas que el #27 perdona por basename (o rutas completas en los nodos, o estrechar su ámbito). | 🟡 | §120 |
| **TODO-46** | 📅 **GESTIÓN v1** (ítem 13). ✅ agenda · contratos · pagos y cartera · expedientes y novedades con SLA (§112-§118). Resta adjuntos privados (B5) y estrenarlo con datos reales (runbook 1.5). | 🟢 | §118 |
| **TODO-47** | 🚪 **ACCESO — Identity Platform ACTIVO, fase 2 EN VIVO, legacy SANEADO. Detalle → §129-§136.** Candado retirado · bitácora REAL (4 accesos con IP) · rol en `/gestion` · inactividad · invitación · suspender · 2FA TOTP disponible · clave 6→12 · dominio autorizado · 14 índices desplegados · consola del panel LIMPIA (25-ago). ⏭️ **Mío**: pantalla de INSCRIPCIÓN del 2FA — **inscribir ANTES de exigirlo** en las Rules, o expulsa a todos · puerta única (mockup `ALTORRA Acceso.dc.html`, **SIN aprobar**). ⏭️ **Daniel**: inscribir su 2FA · verificar su correo. 🚫 anti-bot aplazado (§132.5). | 🟢 mío | §136 |
| **TODO-34** | ⭐ ⏸️ **FUNDACIÓN OPERATIVA — en pausa**. Kit auditado; van **28/92** leves. ⚠️ sin escéptico ⇒ uno por uno, NUNCA en lote (§70.6). No bloquea: el kit no se firma hasta el cierre de obra. Ledger → bóveda. | ⏸️ 28/92 | §87 · `43` |

---

## 📝 Bitácora (efímera)

> ### 🏗️ ARRANQUE EN FRÍO — lee esto y ya sabes dónde estás (2026-08-21, 2ª foto del día)
>
> **Frente activo: TERMINAR EL MEGA-PLAN** (web + sistema). Daniel el 21-ago: *«las campañas al final,
> nos interesa terminar la página web y el sistema, todo el mega plan»*; **Meta ads y el Gmail roto van
> al FINAL, por decisión suya**. **Opus 5 para TODO**, esfuerzo Max, agentes y workflows LIBRES bajo tu
> juicio (levantó ese límite el 20-ago).
>
> **🌊 OLA 1 = 13/13, verificado ARCHIVO POR ARCHIVO el 22-ago (§123), no de memoria.** El portal público
> está COMPLETO (censo → `21`; detalle en §88-§98). La construcción terminó: lo que queda son **gates del
> DUEÑO**, y por eso no se avanza construyendo más. Sueltos de OLA 1: la contradicción de «Avalúo» (§94.6).
> El cutover NO se improvisa → **`specs/CUTOVER-RUNBOOK.md`** manda (§102).
> **En orden** (el paso 1 se CERRÓ el 25-ago y desbloqueó al resto, §132): ~~claim de staff~~ ✅ ·
> (1) **estrenar los caminos** (runbook 1.4-1.8: R2, alta, gestión, sello, estancia) — nunca han
> escrito en Firestore real · (2) **inventario** (TODO-22; la base está VACÍA de verdad, medido) ·
> (3) **Resend** · (4) **DNS/cutover**. Aparte: **TODO-45** (deuda de auditoría, mío) y **TODO-30**
> (mapa, lo confirma Daniel, [[L-39]]). **OLA 2**: el abogado gatea el RAIL DE PAGO, **no toda la**
> ola — reléela antes de darla por bloqueada ([[L-40]] ya cobró 3 veces, [[M-11]]).
>
> 🔻 **El panel LEGACY no tiene NINGUNA red** —ni tipos, ni tests, ni build— y en dos días se le
> cazaron 4 fallos que solo destapó la CONSOLA DEL DUEÑO (§133-§136). Pesa a favor de retirarlo
> cuanto antes en el cutover; mientras viva, cada cambio suyo se apoya en la atención.
>
> ⚠️ **Antes de tocar código, lee `34-DOCTRINA-CODIGO`** (trigger 🖥️) y, si el síntoma te suena, `30`:
> [[L-33]] (`locals.runtime.env` removido en Astro v6) YA cobró dos veces, y [[L-41]] (cabeceras
> inmutables en los redirect) explica por qué un endpoint puede dar 500 SOLO en staging.



> **▶ BERSAGLIO** (dueño → `../bersagliojewelry.github.io/docs/44-PAUTA-META.md`; doctrina →
> `meta-ads-diagnostico`): pauta CERRADA y 6 zombies apagados ✅20-ago. ⏭️ **VIVO**: 26 conversaciones
> sin leer (9+ días) en su WhatsApp · avisarle a **Kary**.

> **⏭️ PELOTAS DE DANIEL** (no las puedo cerrar yo):
> **(1) 🔴 rotar la contraseña de aplicación de Gmail**: `onNewSolicitud` falla con `535-5.7.8` y es la MISMA Function que avisará los leads del portal nuevo. Lanzar sin rotarla = perderlos sin evidencia, igual que se perdieron los 16 del sitio viejo (exportados antes, `43`).
> **(2)** Política V2 ✅ live. Queda TU visto bueno para abrir **«Crear cuenta»** en `/ingresar` (§90).
> **(3) B-04** — sin contrato con DataCrédito/TransUnion **NO se puede consultar a nadie**: ¿afiliarse, o solo aseguradora?
> **(4)** verificar los **recovery codes** (§72).
> **(5)** Nº de **RNT** + vetar los 6 estándares del `02 §2`.
> **(7)** decidir la **tasa de mora del doc 03** (B-05: 1,5×IBC vs 6%) — un párrafo, y las 5 remisiones
> lo heredan solas.
> **(8)** `/publicar` **no pide correo** (fiel al mockup) ⇒ el propietario llega `[COLD]`: ¿campo nuevo o re-pesar?
> **(10) 📧 RESEND — el último gate de las alertas (§96)**: dominio verificado + clave = **fase 0.2 del
> runbook** (detalle allá). Sin eso el digest NO falla, solo no envía. Gratis y **no depende del Gmail
> roto**, que es otro asunto y va al final por decisión tuya.
> **(11) ⚖️ ¿ALTORRA contrata un avaluador inscrito en el RAA?** De eso, y solo de eso, depende si se
> quedan «Avalúos» (menú Gestión) y «Avalúo y fotografía profesional» (plan Premium). Todo lo demás ya
> dejó de llamarse avalúo (§105). Si la respuesta es no, se quitan esas dos y listo.
> **(9) 📣 PAUTA — al final por decisión tuya (21-ago); aplazarla es seguro** porque la campaña de humo
> **solo muerde el día que recargues saldo** ([[D-15]]). **Antes de recargar un peso**: sesión de Meta
> de Altorra ([[D-16c]]), filtro SOLO `Entrega=Activo` + rango Máximo ([[D-15b]] — «Anuncios activos»
> esconde los zombies).

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: 64 leves del kit (ledger en bóveda) · [[M-09]] a los
> 3 hermanos (TODO-32b) · backlog B-01..B-05. 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los
> 12 planificadores: está pagado y en la bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **Kit (⏸️ pausa · dueño → `43`)**: los ESTATUTOS MANDAN y se abren ANTES de auditar ([[LD-05]]) ·
> docs 13 y 23 RETIRADOS · ⚠️ Word y manual **NUNCA a mano**: se GENERAN (§68).
