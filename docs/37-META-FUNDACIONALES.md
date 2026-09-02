# 🏛️ 37 — META FUNDACIONALES (M-01..M-10) · hoja hermana de `33`

> **Tercer shard de la familia de lecciones**, y nace por la misma razón que los del índice: `33` rozó
> su tope y la respuesta correcta a un nodo lleno de historia CERRADA no es comprimir, es mudar
> (§164). Aquí viven las meta-lecciones **fundacionales** —julio y principios de agosto de 2026—, las
> que establecieron cómo se opera este cerebro. Las **vivas** (hoy, de la M-23 en adelante) siguen en `33`.
>
> **El stub `### M-NN` con su título sigue viviendo en `30`**, que es el único sitio donde buscar: el
> kernel los lee ahí y el gate #5 valida contra ese archivo. Mover el detalle no las saca del cerebro.
>
> ⚠️ **Las DIEZ (M-01..M-10) están MIGRADAS al maestro** (F2 lote 15): aquí queda un stub anclado por
> lección y la familia que las agrupa —que es el ruteo—, no el texto. **M-33 sigue entera aquí.**
>
> **Por qué se citan igual de a menudo aunque sean viejas**: M-05, M-06 y M-07 son la familia de «cómo
> miente un gate», y esa se invoca cada vez que se escribe uno. Estar aquí no es estar jubilada.
>
> ➡️ **M-11 ya no está aquí**: se mudó a `33a-LECCION-QUE-NO-DISPARA.md` (§289), donde su idea —el
> pendiente que no se re-etiqueta— es un eslabón de una cadena, y no una fundacional suelta.

---

### M-33 — 🎭 Un hallazgo abierto que **invoca una regla del cerebro sin abrir el gate que la ejecuta** es una opinión *(§256)*
Re-verifiqué los 13 hallazgos abiertos de la auditoría #16 antes de tocarlos, y **tres eran FALSOS**: no «ya arreglados», sino **nunca ciertos**. Los tres fallaban por lo MISMO — apelaban a una regla del cerebro (SSoT, formato canónico de ADR, ruteo) sin abrir el linter ni el manifest que la implementa:
- El del teléfono «triplicado contra su propia regla de SSoT»: el único mecanismo SSoT es el gate #8, que solo vigila los hechos declarados en `ssotFacts`, y el teléfono no está entre ellos. Además la cifra fallaba por **28×** (87 ocurrencias en 47 ficheros, no 3) y citaba mal el ADR que invocaba. «Arreglarlo» habría puesto `brain:check` en rojo permanente contra cuatro políticas legales que por Ley 1581 **deben** llevar el contacto.
- El del «formato ADR abandonado desde el 192»: enfrentaba dos cosas que no son excluyentes — el router prescribe siete ROLES y nunca fijó nivel de encabezado.
- El del ruteo: era falso **el día que se escribió**; el dato vivía ya en cinco ficheros, uno de ellos auto-cargado en el arranque.

🎯 **Un hallazgo abierto es una afirmación sin sello como cualquier otra, y cuantas más auditorías sobreviva, más cierto parece y menos lo es.** Suena a disciplina, se apoya en un ADR real y su cifra pequeña parece cuidadosa — por eso nadie lo abre. Y un falso se **RETIRA, no se cierra**: cerrar afirma que hubo algo que arreglar.
Regla que hereda la skill de auditoría: *todo hallazgo que apele a una regla del cerebro debe citar la línea del linter o del manifest que la ejecuta; si no existe esa línea, el hallazgo es una opinión.* Emparejada con [[M-31]] (deriva la lista de una medición, no de la memoria).

### M-01 — El tablero `05` se rezaga si el CIERRE no lo re-fresca en el MISMO commit *(auditoría §30, reincidencia de §12)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-01]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-02 — La disciplina de cierre NO sobrevive a la saturación de contexto: la consolidación se AUTOMATIZA, no se promete *(auditoría §33, 2ª reincidencia de M-01)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-02]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-03 — Un recurso COMPARTIDO ×4 no se protege con rituales por-operador: el gate vive EN EL RECURSO *(auditoría §49)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-03]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-04 — Un ID lo asigna quien escribe, y dos frentes en paralelo colisionan en SILENCIO *(2026-07-28, ADR §68)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-04]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-05 — Un techo que se mueve para alcanzarlo no es un techo *(2026-08-01, ADR §74-§75)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-05]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-06 — Un gate solo existe si lo has visto DISPARAR: tres formas de que mienta, y las tres dan ✅ *(2026-08-01, ADR §75-§77)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-06]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-07 — Un gate del kernel solo protege donde su DISPARADOR está cableado *(2026-08-01, ADR §81)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-07]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-08 — El trabajo caro no puede depender de que el proceso sobreviva: escribe el resultado en cuanto llega *(auditoría #6, 2026-08-01/02, ADR §83)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-08]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-09 — El always-on se ganó por importancia y nunca se perdió por desuso: el criterio es frecuencia × costo de omisión *(2026-08-03, ADR §84)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-09]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-10 — Un gate cubre UNA DIRECCIÓN; la doctrina promete las DOS — y el ✅ se lee como cobertura total *(auditoría #7, 2026-08-20, ADR §90)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-10]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
