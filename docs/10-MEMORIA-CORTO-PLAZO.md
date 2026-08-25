# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> **🏗️ FRENTE ACTIVO = LA PÁGINA** (portal). Qué sigue → el **ARRANQUE EN FRÍO** de la bitácora.
> Dev: `npm --prefix portal run dev` (4321); mockups en `portal/design/mockups/`; fidelidad →
> [[L-29]]/[[L-24]]/[[L-28]]. **⏸️ EN PAUSA**: fundación (TODO-34) y pauta (TODO-29 → `pauta-captacion`).
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
| **TODO-17 · 21** | **Ola 0 restos** (E2E "tras cache" · obra AEO) · **lote-dueño**: RNT, dirección COMERCIAL, abogado (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ | gate=obra/cutover |
| **TODO-CEREBRO** | 🧠 **Mantenimiento** (sin pausa desde 20-ago). Abiertos: **TODO-23** kernel K-01/02/04/05/09 · **TODO-24** ssotFact de paleta + cache al portal EN EL CUTOVER · **TODO-28** #7 sello >90d · **TODO-32(b)** [[M-09]] a los hermanos. Capacidad y gates a medias → **TODO-45**. 🔬 auditoría Nivel-2 VENCIDA. ⚠️ El banner de costo solo baja con commits de PRODUCTO. | 🔄 | §84·§87·§96 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada (estado → flag 📣 de `05`). Resta calibrar la campaña REAL. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30** | 🗺️ **MapLibre ✅ COMPLETO (§55)** — falta SOLO la vista en foreground (rAF congelado en pestañas automatizadas, [[L-39]] → la confirma Daniel). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-22** | **CATÁLOGO completo, ficha incluida (§97)**. Datos reales = fases 3-4 del runbook; luego fichas al sitemap. | 🟢 cutover | §102 |
| **TODO-45** | 🔬 **Deuda de la auditoría #8** — lo cerrado está en §120. Resta: **(d)** umbrales en DÍAS en un repo que corre en COMMITS · **(g)** las 98 rutas que el #27 perdona por basename (rutas completas en los nodos, o estrechar su ámbito). | 🟡 | §120 |
| **TODO-46** | 📅 **GESTIÓN v1 (ítem 13) — hecha** (§112-§118) y sus **5 puertas de escritura YA DESPLEGADAS** (§140). Resta: adjuntos privados (B5) y ESTRENARLA con datos reales (runbook 1.5-1.6, ya posible). | 🟢 | §140 |
| **TODO-47** | 🚪 **ACCESO — el 2FA ya se puede USAR. Detalle → §129-§138.** Identity Platform ACTIVO · reglas fase 2 EN VIVO · bitácora REAL · **resolver del código en las DOS puertas** (portal y legacy) · **`/seguridad` para inscribirlo** · `cerrarMisSesiones` y `retirarSegundoFactorDe` DESPLEGADAS y verificadas. ⏭️ **Daniel**: inscribir su 2FA en `/seguridad` (con clave manual; el QR se aplazó a propósito, §137.5) · verificar su correo. ⏭️ **Mío, DESPUÉS de que él se inscriba**: exigirlo en las Rules (`sign_in_second_factor`) — antes NO, expulsa a todos · el QR verificable · puerta única (mockup **SIN aprobar**). 🚫 anti-bot aplazado (§132.5). | 🟢 Daniel | §137 |
| **TODO-48** | 📰 **JOURNAL — hoy es un «próximamente» y la home lo anunciaba con 4 artículos INVENTADOS** (retirados, §138.3). Está en la VISIÓN §5 como motor de autoridad SEO/AEO. Falta: mockup (gate «nunca UI sin mockup») + contenido REAL — hay materia prima verificada en `specs/R1-COMPETENCIA` y `R3-LEGAL`. La sección de la home vuelve sola en cuanto haya artículos. | 🔵 mío | §138 |
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
> **🌊 OLA 1 = 13/13 EN CÓDIGO**, re-medido el 25-ago (§138: el MEGA-PLAN llevaba 5 días diciendo que
> faltaban 5). Censo → `21`. **Pero «13/13» NO es «cerrada»**: ninguno de esos caminos ha escrito aún en
> Firestore real y la base está VACÍA (medido). Y sigue habiendo construcción propia — ver TODO-48.
> El cutover NO se improvisa → **`specs/CUTOVER-RUNBOOK.md`** manda (§102). Suelto: «Avalúo» (§94.6).
> **En orden**: (1) **estrenar los caminos** (runbook 1.4-1.8, **corregido en §140**: el 1.6 era
> IMPOSIBLE y no lo decía, y el 1.4 estaba asignado a quien no puede hacerlo) ·
> (2) **inventario** (TODO-22) · (3) **Resend** · (4) **DNS/cutover**. Aparte: **TODO-45**, **TODO-48**
> (míos) y **TODO-30** (lo confirma Daniel, [[L-39]]). **OLA 2**: el abogado gatea el RAIL DE PAGO,
> **no toda la ola** ([[L-40]] ya cobró 3 veces, [[M-11]]).
>
> 🔻 **El panel LEGACY no tiene NINGUNA red** —ni tipos, ni tests, ni build— y se le cazaron 4 fallos que
> solo destapó la CONSOLA DEL DUEÑO (§133-§136). Pesa a favor de retirarlo pronto en el cutover.
> 🛡️ **Y el portal tampoco la tenía entera**: `tsc` no leía los `.astro` (§138). Hoy son **7 gates**
> (+ `tokens`, `controles`, `enlaces`) y el portal está **barrido en vivo**: 27 rutas 200, 763 enlaces
> que resuelven, cero recursos fallidos (§139.8). Si un gate pasa, pregúntate **qué archivos abre**
> ([[L-52]]) — tres de los de esta semana pasaron en verde con el fallo delante.
>
> ⚠️ **Antes de tocar código, lee `34-DOCTRINA-CODIGO`** (trigger 🖥️) y, si el síntoma te suena, `30`:
> [[L-33]] (`locals.runtime.env` removido en Astro v6) YA cobró dos veces, y [[L-41]] (cabeceras
> inmutables en los redirect) explica por qué un endpoint puede dar 500 SOLO en staging.



> **▶ BERSAGLIO** (dueño → `../bersagliojewelry.github.io/docs/44-PAUTA-META.md`; doctrina →
> `meta-ads-diagnostico`). ⏭️ **VIVO**: 26 conversaciones sin leer (9+ días) · avisarle a **Kary**.

> **⏭️ PELOTAS DE DANIEL** (no las puedo cerrar yo):
> **(1) 🔴 rotar la contraseña de aplicación de Gmail**: `onNewSolicitud` falla con `535-5.7.8` y es la MISMA Function que avisará los leads del portal nuevo. Lanzar sin rotarla = perderlos sin evidencia, igual que se perdieron los 16 del sitio viejo (exportados antes, `43`).
> **(2)** Política V2 ✅ live. Queda TU visto bueno para abrir **«Crear cuenta»** en `/ingresar` (§90).
> **(3) B-04** — sin contrato con DataCrédito/TransUnion **NO se puede consultar a nadie**: ¿afiliarse, o solo aseguradora?
> **(4-5)** verificar los **recovery codes** (§72) · Nº de **RNT** + vetar los 6 estándares del `02 §2`.
> **(7)** **tasa de mora del doc 03** (B-05: 1,5×IBC vs 6%) — un párrafo, y las 5 remisiones lo heredan.
> **(8)** `/publicar` **no pide correo** (fiel al mockup) ⇒ el propietario llega `[COLD]`: ¿campo o re-pesar?
> **(10) 📧 RESEND** — dominio verificado + clave (runbook fase 0.2). Sin eso el digest no falla, solo no
> envía. Gratis, y **no depende del Gmail roto**. ⚠️ El secreto ya existe con centinela (§140).
> **(11) ⚖️ ¿avaluador inscrito en el RAA?** Solo de eso depende si se quedan «Avalúos» (menú Gestión) y
> «Avalúo y fotografía profesional» (Premium). Si no: se quitan esas dos y listo (§105).
> **(9) 📣 PAUTA — al final por decisión tuya; aplazarla es SEGURO**: la campaña de humo solo muerde el
> día que recargues saldo ([[D-15]]). **Antes de recargar**: sesión de Meta de Altorra ([[D-16c]]) +
> filtro `Entrega=Activo` con rango Máximo ([[D-15b]] — «Anuncios activos» esconde los zombies).

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: 64 leves del kit (ledger en bóveda) · [[M-09]] a los
> 3 hermanos (TODO-32b) · backlog B-01..B-05. 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los
> 12 planificadores: está pagado y en la bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **Kit (⏸️ pausa · dueño → `43`)**: los ESTATUTOS MANDAN y se abren ANTES de auditar ([[LD-05]]) ·
> docs 13 y 23 RETIRADOS · ⚠️ Word y manual **NUNCA a mano**: se GENERAN (§68).
