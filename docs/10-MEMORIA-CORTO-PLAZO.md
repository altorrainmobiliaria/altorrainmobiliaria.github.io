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
| **TODO-CEREBRO** | 🧠 **Mantenimiento** (sin pausa desde 20-ago). **TODO-23** kernel: K-01/02/04/05/09 + de §143: el #27 debe resolver el nombre contra la CARPETA del nodo (hoy perdona 92 basename) y los umbrales del #16 ir en COMMITS. **K-10 (§152)**: dos lecciones con el MISMO `L-NN` en nodos distintos no las caza nadie. **TODO-24** ssotFact de paleta + cache EN EL CUTOVER · **TODO-28** #7 sello >90d · **TODO-32(b)** [[M-09]] a los hermanos. 🔴 **BOOT crónico: la receta estaba MAL APUNTADA** (§164). No era «shard del `10`»: el router es el **59% del boot** y su techo no disparaba, así que podaba la pizarra. Cap del router → 19k. | 🔄 | §84·§143·§146 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada (estado → flag 📣 de `05`). Resta calibrar la campaña REAL. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30 · 22** | 🗺️ **MapLibre COMPLETO (§55)** — falta solo la vista en foreground, la confirma Daniel ([[L-39]]) · 🏠 **CATÁLOGO con ficha (§97)**: datos reales = fases 3-4 del runbook, luego fichas al sitemap. | 🟢 | §55.9 · §102 |
| **TODO-46** | 📅 **GESTIÓN v1 (ítem 13) — COMPLETA en código**, puertas desplegadas y probadas; bóveda de documentos legible con su índice en producción → §112-§118, §140-§142, §148. ⏭️ Falta **aprobar el mockup** y **ESTRENARLA con datos reales** (runbook 1.5-1.6): es lo único que puede verificar el render en vivo. | 🟢 | §148 |
| **TODO-47** | 🚪 **ACCESO — el 2FA ya se puede USAR** → §129-§138. ⏭️ **Daniel**: inscribir su 2FA (clave manual; el QR se aplazó, §137.5) · verificar su correo. ⏭️ **Mío, DESPUÉS de que él se inscriba**: exigirlo en las Rules —antes NO, expulsa a todos— · el QR verificable · **puerta única** (mockup APROBADO) ⚠️ con la desviación obligada del paso 2, que enumeraría cuentas de staff (§137.6). 🚫 anti-bot aplazado (§132.5). | 🟢 Daniel | §137 |
| **TODO-48** | 📰 **JOURNAL — PUBLICADO (§147).** 5 artículos con la norma .gov.co citada; «Guías de zona» estrenada con un HUB que enlaza las 13 landings. Mockup **APROBADO**. ⏭️ Falta: «Mercado» sigue vacía (sin dato verificado que citar) · RE-ENVIAR el sitemap en GSC. | 🟢 | §147 |
| **TODO-49** | 🏷️ **OLA 2**. Compraventa + perfil de inquilino → §151-§153, §155. **RAIL DE PAGO: dominio COMPLETO** (§166-§170, §176) — liquidación, certificación, mandato y el webhook (plan + ejecutor). ⏭️ Falta NO-código: el endpoint no se registra hasta que exista `WOMPI_EVENTS_SECRET` (§140) = cuentas de Daniel. Mío: prueba de la TRANSACCIÓN en emulador. | 🔵 mío | §176·§165 |
| **TODO-34** | ⭐ ⏸️ **FUNDACIÓN OPERATIVA — en pausa**. Kit auditado; van **28/92** leves. ⚠️ sin escéptico ⇒ uno por uno, NUNCA en lote (§70.6). No bloquea: el kit no se firma hasta el cierre de obra. Ledger → bóveda. | ⏸️ 28/92 | §87 · `43` |

---

## 📝 Bitácora (efímera)

> ### 🏗️ ARRANQUE EN FRÍO — lee esto y ya sabes dónde estás (21-ago)
>
> **Frente activo: TERMINAR EL MEGA-PLAN** (web + sistema). Daniel el 21-ago: *«las campañas al final,
> nos interesa terminar la página web y el sistema, todo el mega plan»*; **Meta ads y el Gmail roto van
> al FINAL, por decisión suya**. **Opus 5 para TODO**, esfuerzo Max, agentes y workflows LIBRES bajo tu
> juicio (levantó ese límite el 20-ago).
>
> **🌊 OLA 1 = 13/13 EN CÓDIGO** (§138). Censo → `21`. **Pero «13/13» NO es «cerrada»**: ninguno de
> esos caminos ha escrito aún en Firestore real y la base está VACÍA (medido). El cutover NO se
> improvisa → **`specs/CUTOVER-RUNBOOK.md`** manda (§102), ya corregido (§140).
> **En orden**: (1) **estrenar los caminos** (runbook 1.4-1.8) · (2) **inventario** (TODO-22) ·
> (3) **Resend** · (4) **DNS/cutover**. Aparte: **TODO-30**, que lo confirma Daniel ([[L-39]]).
> **OLA 2**: el «gate del abogado» NO EXISTE — el abogado soy yo (Daniel, 26-ago). Detalle en TODO-49
> y §165 ([[L-40]] ya cobró 3 veces, [[M-11]]).
>
> 🏁 **La web pública ya no tiene ni un «próximamente»** (26-ago, §158-§159; el menú muerto y sus 468
> enlaces los caza ya la sonda 3 de `verify:enlaces`). Verifícalo con un grep, no con esta línea.
>
> 🎭 **UN ✅ NO PRUEBA QUE MIRARA** (§174-§175): el CI no corría `test` y su `typecheck` salía verde
> **sin checker** (`astro check` sin el suyo PREGUNTA, y sin terminal eso es exit 0). Ya
> arreglado, con sonda. **El CI nunca estuvo rojo**: lo afirmé sin mirar (§3.3).
> Y **alojamiento lleva DOS gates**: RNT + reglamento de PH que autorice EXPRESAMENTE (el silencio no
> vale). ⏭️ El control nuevo del alta **no tiene mockup**: al repaso de Daniel.
>
> 🔻 **El panel LEGACY no tiene NINGUNA red** —ni tipos, ni tests, ni build— y se le cazaron 4 fallos
> que solo vio la consola del dueño (§133-§136): pesa a favor de retirarlo pronto en el cutover. El
> portal sí: **7 gates** (1043 enlaces, 341 anclas y los 65 redirects) + [[L-33]] y [[L-41]] entre los
> gotchas que YA cobraron. Si un gate pasa, pregúntate **qué archivos abre** ([[L-52]]); y córrelos con
> **`npm run verify`**, no de memoria (§157).



> **▶ BERSAGLIO** — estado vivo en su nodo dueño: `../bersagliojewelry.github.io/docs/44-PAUTA-META.md`.

> **⏭️ PELOTAS DE DANIEL** (no las puedo cerrar yo):
> **(1) 🔴 rotar la contraseña de aplicación de Gmail**: `onNewSolicitud` falla con `535-5.7.8` y es la MISMA Function que avisará los leads del portal nuevo. Lanzar sin rotarla = perderlos sin evidencia, igual que se perdieron los 16 del sitio viejo (exportados antes, `43`).
> **(3) B-04** — sin contrato con DataCrédito/TransUnion **NO se puede consultar a nadie**: ¿afiliarse, o solo aseguradora?
> **(4-5)** verificar los **recovery codes** (§72) · Nº de **RNT** + vetar los 6 estándares del `02 §2`.
> **(7)** **tasa de mora del doc 03** (B-05: 1,5×IBC vs 6%) — un párrafo, y las 5 remisiones lo heredan.
> **(8)** `/publicar` **no pide correo** (fiel al mockup) ⇒ el propietario llega `[COLD]`: ¿campo o re-pesar?
> **(10) 📧 RESEND** — dominio verificado + clave (runbook fase 0.2). Sin eso el digest no falla, solo no
> envía. Gratis, y **no depende del Gmail roto**. ⚠️ El secreto ya existe con centinela (§140).
> **(11) ⚖️ ¿avaluador inscrito en el RAA?** Solo de eso depende si se quedan «Avalúos» (menú Gestión) y
> «Avalúo y fotografía profesional» (Premium). Si no: se quitan esas dos y listo (§105).
> **(12) 💳 ¿«Crédito de Vivienda» y «Pagos en Línea» son servicios REALES?** Estaban en el menú
> apuntando a un ancla que no existe, y las retiré (§159.4): del primero no hay página ni servicio
> verificable, y el segundo es el carril de Wompi, que espera TU cuenta (§165). Si alguno sí, dilo.
> **(13) 🛡️ CARTA DE AUTORIZACIÓN de la aseguradora** — pídesela a cada aseguradora con la que
> trabajes. Es gratis y la expide ella. Sin ella, gestionar pólizas de arriendo es intermediación
> irregular aunque todo lo demás esté bien (§171 · Ley 510/99 art. 101).
> **(9) 📣 PAUTA — al final por decisión tuya; aplazarla es SEGURO**: la campaña de humo solo muerde el
> día que recargues saldo ([[D-15]]). **Antes de recargar**: sesión de Meta de Altorra ([[D-16c]]) +
> filtro `Entrega=Activo` con rango Máximo ([[D-15b]] — «Anuncios activos» esconde los zombies).

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: 64 leves del kit (ledger en bóveda) · [[M-09]] a los
> 3 hermanos (TODO-32b) · backlog B-01..B-05. 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los
> 12 planificadores: está pagado y en la bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **Kit (⏸️ pausa · dueño → `43`)**: reglas vivas en [[LD-05]] y §68.
