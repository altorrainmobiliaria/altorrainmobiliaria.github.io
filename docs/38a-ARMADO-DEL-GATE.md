# 🚦 38a — EL ARMADO DEL GATE: ¿llega siquiera a mirar? (hoja hermana de `38`)

> **Por qué existe esta hoja.** `38-GATES-QUE-MIENTEN` cataloga el gate cuyo VEREDICTO engaña: corrió,
> miró, y su respuesta no significa lo que parece. Aquí vive **la capa de abajo** —la que §288 nombró al
> encontrarla—: la maquinaria que decide **si el gate llega a opinar y sobre qué**. Cuando esa falla no
> hay veredicto que auditar, porque no hubo veredicto.
>
> 🎯 **La regla que las une**: *la cobertura de un gate no es lo que comprueba, sino lo que comprueba POR
> lo que su ARMADO deja llegar* — y todo el instrumental del repo mide lo primero. Cinco formas de estar
> desarmado, y ninguna se ve en el ✅:
> 1. **Nadie lo invoca** ([[L-56]]) — existe en `package.json` y no lo corre ni el CI.
> 2. **Exento por ENTORNO** ([[L-65]]) — `if (ES_PROD)`: verde que nadie ha visto fallar jamás.
> 3. **Excluido por su PREDICADO** ([[L-70]]) — `paths:`, un bloque `js/`, un flag: 55 de 100 commits.
> 4. **Su ANCLA desapareció** ([[L-71]]) — el gate se auto-omite y su omisión no baja el veredicto.
> 5. **Su SALIDA se descarta** ([[L-73]]) — corrió, emitió… y el harness tiró el objeto entero: 0/15 en 44 días.
>
> 🔀 **La frontera con `38`**: aquí el fallo es **anterior** a cualquier respuesta; allí el gate SÍ
> respondió y la respuesta miente (en verde o en rojo). Si dudas: pregunta si llegó a abrir un archivo.
>
> 🧰 **Prueba de bolsillo del armado**: no preguntes «¿pasa el gate?» sino **«¿bajo qué condición corre,
> y cuántas veces se cumplió esa condición en los últimos 100 commits?»**. El chequeo #25 del kernel
> pregunta *¿está conectado?*; la que falta es *¿bajo qué condición?* — y las dos dan verde por separado.
>
> El stub `### L-NN` con su título vive en `30`, que es donde se busca y donde el kernel resuelve las
> refs (chequeo #5). L-56 y L-65 llegaron **verbatim** desde `38` (§289): nada se resumió.
> ⚠️ **Las CINCO están MIGRADAS al maestro** (F2 lote 14): aquí queda la lista de las cinco formas de
> estar desarmado —que es el ruteo— y un stub anclado por lección, no el texto.

---
### L-56 — 🧰 Un gate puede existir y NO CORRERLO NADIE — ni el CI ni tú *(§142 · §157 · §174)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-56]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-65 — 🌗 Un gate con **exención de entorno** da un verde que nadie ha visto fallar JAMÁS *(§240)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-65]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-70 — 🚦 El predicado que decide si un gate LLEGA A CORRER es parte del gate *(§288.1 · 2ª cara §265)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-70]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-71 — 🚦 Un ANCLA que se borra DESARMA su gate en silencio, y nadie mide el armado del conjunto *(§287 N18-09 · reincidencia de §69.7-bis)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-71]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-73 — 🕳️ Un hook que emite **JSON** firma un CONTRATO con el esquema del harness, y violarlo falla en SILENCIO *(§291 · medición D8a)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-73]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
