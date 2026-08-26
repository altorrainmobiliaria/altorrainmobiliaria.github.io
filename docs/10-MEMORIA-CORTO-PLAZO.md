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
| **TODO-CEREBRO** | 🧠 **Mantenimiento** (sin pausa desde 20-ago). **TODO-23** kernel: K-01/02/04/05/09 + de §143: el #27 debe resolver el nombre contra la CARPETA del nodo (hoy perdona 92 basename) y los umbrales del #16 ir en COMMITS. **K-10 (§152)**: dos lecciones con el MISMO `L-NN` en nodos distintos no las caza nadie. **TODO-24** ssotFact de paleta + cache EN EL CUTOVER · **TODO-28** #7 sello >90d · **TODO-32(b)** [[M-09]] a los hermanos. | 🔄 | §84·§143·§146 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada (estado → flag 📣 de `05`). Resta calibrar la campaña REAL. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30 · 22** | 🗺️ **MapLibre COMPLETO (§55)** — falta solo la vista en foreground, la confirma Daniel ([[L-39]]) · 🏠 **CATÁLOGO con ficha (§97)**: datos reales = fases 3-4 del runbook, luego fichas al sitemap. | 🟢 | §55.9 · §102 |
| **TODO-46** | 📅 **GESTIÓN v1 (ítem 13) — COMPLETA en código**, puertas desplegadas y probadas; bóveda de documentos legible con su índice en producción → §112-§118, §140-§142, §148. ⏭️ Falta **aprobar el mockup** y **ESTRENARLA con datos reales** (runbook 1.5-1.6): es lo único que puede verificar el render en vivo. | 🟢 | §148 |
| **TODO-47** | 🚪 **ACCESO — el 2FA ya se puede USAR** → §129-§138. ⏭️ **Daniel**: inscribir su 2FA (clave manual; el QR se aplazó, §137.5) · verificar su correo. ⏭️ **Mío, DESPUÉS de que él se inscriba**: exigirlo en las Rules —antes NO, expulsa a todos— · el QR verificable · **puerta única** (mockup APROBADO) ⚠️ con la desviación obligada del paso 2, que enumeraría cuentas de staff (§137.6). 🚫 anti-bot aplazado (§132.5). | 🟢 Daniel | §137 |
| **TODO-48** | 📰 **JOURNAL — PUBLICADO (§147).** 5 artículos con la norma .gov.co citada; «Guías de zona» estrenada con un HUB que enlaza las 13 landings. Mockup **APROBADO**. ⏭️ Falta: «Mercado» sigue vacía (sin dato verificado que citar) · RE-ENVIAR el sitemap en GSC. | 🟢 | §147 |
| **TODO-49** | 🏷️ **OLA 2**. Compraventa + perfil de inquilino → §151-§153, §155. **RAIL DE PAGO COMPLETO y probado contra el emulador** (§166-§170, §176-§177, §185-§187): liquidación, certificación, mandato, preaviso y el webhook. ⏭️ Lo que falta NO es código: el endpoint espera a `WOMPI_EVENTS_SECRET` (§140) = cuentas de Daniel. | 🟢 Daniel | §176·§165 |
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
> **🌊 OLA 1 = 13/13 EN CÓDIGO** (§138; censo → `21`) **pero NO cerrada**: ningún camino ha escrito
> aún en Firestore real y la base está VACÍA (medido). Manda **`specs/CUTOVER-RUNBOOK.md`** (§102,
> §140): estrenar los caminos (1.4-1.8) → inventario → cutover. El resto, en PELOTAS.
> **OLA 2**: el «gate del abogado» NO EXISTE — el abogado soy yo (Daniel, 26-ago) → TODO-49, §165. **Agenda legal a CERO** (§194).
>
> 🎭 **UN ✅ NO PRUEBA QUE MIRARA** (§174-§177): el CI no corría `test`, su `typecheck` salía verde
> **sin checker**, `functions/` no se chequeaba y 141 pruebas de emulador estaban fuera. Los cuatro
> cableados, con sonda del **lockfile** — los prerrequisitos de los gates no se declaraban (3 veces en
> un día). **El CI nunca estuvo rojo**: lo afirmé sin mirar (§3.3). Ahora: 8 gates, ~1065 pruebas.
>
> 🧹 **BARRIDOS que valieron** (§178-§179): gemelos (mismo nombre, 2 módulos) → `verify:simbolos` con
> deuda congelada · espejos de `firestore.rules` → sonda en `verify:data` **que falla si no puede
> LEER**. Y **alojamiento lleva DOS gates**: RNT + PH que autorice EXPRESAMENTE.
>
> 💸 **OLA 2 — el carril de pago está COMPLETO en dominio** (§176-§177, §185-§187): webhook (plan +
> ejecutor + atomicidad probada), mandato, liquidación, certificación y **preaviso** (un preaviso sin
> evidencia postal NO es un preaviso: manda la fecha de IMPOSICIÓN). Falta solo `WOMPI_EVENTS_SECRET`.
>
> 📬 **LEADS — el camino roto está sustituido** (§188-§192): el aviso sale por **Resend** desde el
> portal, no por el Gmail caído; el puntaje ya **no castiga por campos que el formulario nunca pide**;
> y está probado contra el emulador que **el puntaje se guarda siempre y la marca «avisado» solo si el
> correo salió**. ⏭️ El nurturing sigue apagado: 3 bloqueos revisados en §192 (uno cayó, uno nuevo —
> sus plantillas enlazan al sitio retirado).
>
> ⏭️ **Sin mockup, y por eso sin hacer**: el control de PH en el alta, la pantalla de evidencia postal.
>
> 🔻 **El panel LEGACY no tiene NINGUNA red** —ni tipos, ni tests, ni build— y se le cazaron 4 fallos
> que solo vio la consola del dueño (§133-§136): pesa a favor de retirarlo pronto. Si un gate pasa,
> pregúntate **qué archivos abre** ([[L-52]]); y córrelos con **`npm run verify`**, no de memoria.


> **▶ BERSAGLIO** — estado vivo en su nodo dueño: `../bersagliojewelry.github.io/docs/44-PAUTA-META.md`.

> **⏭️ PELOTAS DE DANIEL — ordenadas por lo que DESBLOQUEAN** (§188; antes era una lista plana de 13).
>
> **🅰️ Sin esto no se lanza**
> **(10) 📧 RESEND: dominio + clave** — gratis, ~30 min, **no depende del Gmail roto**, y el secreto ya
> existe con centinela (§140). Desbloquea el digest de alertas **y, con el cambio de abajo, el aviso de
> cada lead**. Si solo haces UNA cosa, es ésta.
> **(1) 🔻 Gmail — YA NO ES TUYA (baja de A a nada)**: los leads del portal dependían de la Function
> legacy con SMTP roto (`535-5.7.8`). Moverlos a Resend lo mata, y eso lo hago yo (§188). *Dos pelotas
> se funden en una credencial.* Solo vuelve a ser tuya si quieres conservar el correo legacy.
>
> **🅱️ Desbloquean una función concreta (una respuesta corta cada una)**
> **(4b) Nº de RNT** — sin él NO se puede publicar ni un alojamiento por días: el gate lo bloquea.
> **(13) 🛡️ Carta de autorización de CADA aseguradora** — gratis, la expide ella. Sin ella gestionar
> pólizas es intermediación irregular aunque el resto esté impecable (§171 · Ley 510/99 art. 101).
> **(11) ⚖️ ¿tienes avaluador inscrito en el RAA?** Sí/no. De eso depende si se quedan «Avalúos» y
> «Avalúo y fotografía profesional» o se retiran (§105).
> **(12) 💳 ¿«Crédito de Vivienda» y «Pagos en Línea» son servicios REALES?** Los retiré del menú
> (§159.4). Una frase basta; el segundo es el carril de Wompi y espera TU cuenta igual.
> **(8) `/publicar` no pide correo** (fiel al mockup) ⇒ el propietario llega `[COLD]`: ¿campo o re-pesar?
> **(47) 🚪 inscribe tu 2FA** — hasta que lo hagas no puedo exigirlo en las Rules (antes expulsaría a todos).
>
> **🅲 No bloquean nada hoy**
> **(3) B-04 DataCrédito** (solo si quieres screening propio) · **(4a) recovery codes** (§72, higiene,
> 5 min) · **(9) 📣 PAUTA** — aplazada por ti y **aplazarla es SEGURO**: solo muerde el día que recargues
> saldo ([[D-15]]); antes de eso, sesión de Meta ([[D-16c]]) + filtro `Entrega=Activo` ([[D-15b]]).
> ~~(7) tasa de mora~~ **cerrada, no era tuya** (§181) · ~~(2)(5)(6)~~ cerradas antes.

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: 64 leves del kit (ledger en bóveda) · [[M-09]] a los
> 3 hermanos (TODO-32b) · backlog B-01..B-05. 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los
> 12 planificadores: está pagado y en la bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **Kit (⏸️ pausa · dueño → `43`)**: reglas vivas en [[LD-05]] y §68.
