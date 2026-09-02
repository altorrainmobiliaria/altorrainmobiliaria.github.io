# 🪞 33 — LECCIONES META (M-NN) · el cerebro aprendiendo de sus propios fallos

> **Hoja hija de `30-LECCIONES`** (§G.5). El stub `### M-NN` con su título vive en `30` —el kernel los
> lee ahí—; el detalle vive aquí. Se llena cuando **el cerebro contribuyó a un error**
> (Reflejo de Autocrítica, §G.4): no es una bitácora de bugs, es el registro de dónde la memoria
> falló como memoria.
> ⚠️ **M-23 · M-27 · M-29..M-31 están MIGRADAS al maestro** (F2 lote 15) y aquí queda su stub anclado.
> Conservan cuerpo: **M-32 · M-34 · M-35**.

---

> 🧩 **Dos hermanas** (el stub del título siempre en `30`): `docs/37-META-FUNDACIONALES.md` por **ERA**
> —**M-01..M-10** + **M-33**, archivo CERRADO que no crece— y `docs/33a-LECCION-QUE-NO-DISPARA.md` por
> **TEMA** (§289) —**M-11 · M-24..M-26 · M-28**, la cadena de por qué una lección correcta no llega a
> tiempo—. En las dos el cuerpo está MIGRADO salvo M-33; lo que guardan es el ruteo y el stub.
> ➡️ **La válvula de `33` es `33a`, no `37`**: promover a un archivo cerrado no alivia nada.
> Aquí quedan las **vivas** que no son de esa cadena.

---

### M-23 — Un paso de procedimiento que nadie ha ejecutado no es documentación: es una HIPÓTESIS *(auditoría #10, 2026-08-25, ADR §140 · §145 · reincidencia ×3 de N9-02)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-23]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-27 — Escribí tres sondas de censo sin que ninguna dijera QUÉ había mirado, el mismo día que arreglé un gate por exactamente eso *(§202)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-27]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-29 — Un gate de un repo hermano infería una causa de una correlación, y quien rompió la premisa fui yo *(§216.9)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-29]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-30 — Me inventé un identificador CUATRO veces en una noche, y las cuatro por escribir de memoria en vez de leer *(§235)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-30]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-31 — 🎯 Un hallazgo que escribí YO apuntaba al nodo que acababa de tocar, no al que peor estaba *(§240)*
⇒ **Migrada al maestro** (F2 lote 15): [[INMO:M-31]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### M-32 — ⚙️ Un hecho que ya BLOQUEA un gate no pertenece a un nodo always-on *(§244)*
**Disparador**: el `05` afirmaba «cero «próximamente»», «`noindex`», «sin el 307» y «cero cifras inventadas» — los **cuatro** los bloquea ya un gate (`verify:claims`, `verify:build`), comprobado abriéndolos, no de memoria. Un nodo always-on paga su peso **en cada arranque**, y esas frases eran una promesa de segunda mano sobre algo que el CI no deja pasar. Retiradas: **−113c** del presupuesto más escaso, sin perder un hecho.
**Reglas**: (1) 🎯 **Cuando conviertas una promesa en gate, RETÍRALA del nodo que la afirmaba** — si no, pagas el hecho dos veces y la copia del nodo es la que envejece. (2) Deja en su lugar **un puntero corto**, no la lista: sin él alguien las vuelve a añadir de buena fe. (3) ⚠️ **Aplica la regla, no la narres**: mi primer intento cambió las cuatro frases por las mismas *más* el porqué de que sobraran — el nodo **creció 53c**. Explicar una poda es lo contrario de podar. (4) Verifica el gate ANTES de retirar: quitar una afirmación que nadie vigila no es GC, es perder un hecho ([[M-30]]). (5) 🎯 **Un número que describe una relación MUTABLE tampoco cabe: escribe el mecanismo** *(§245)*. Puse «dev +10» en el tablero de un repo hermano y mergeé esos diez **diez minutos después**: mi propia frase caducó en el mismo turno. Un tablero guarda lo que seguirá siendo cierto mañana.

### M-34 — 🎯 Normalizar dentro del INSTRUMENTO no protege las mediciones que haces A MANO junto a él *(§287)*
**Disparador**: para medir el GC pareado de la auditoría #18 comparé `git show` (LF) contra el disco (CRLF) y obtuve **+140c de crecimiento inexistente**; el delta real era **−10c**. De haberlo creído habría podado conocimiento real para compensar **retornos de carro**.
**El patrón**: el kernel había arreglado ESTE MISMO fallo tres días antes (§259), y lo arregló **bien** — en su lector `read()`, no en la línea donde dolió. Quedó inmune. Pero la corrección protege **lo que pasa por el instrumento**, y una medición ad-hoc en mitad de una sesión **no pasa por él**. El cerebro tenía la lección escrita, aplicada y verificada, y aun así la repetí: *el sitio donde la apliqué no es el sitio donde volví a medir.*
**Reglas**: (1) toda medición de tamaño o contenido sobre ficheros del repo se hace **con el lector del kernel** o normalizando `\r\n` explícitamente — nunca comparando `git show` contra disco. (2) 🎯 **Cuando arregles un fallo de medición DENTRO de una herramienta, pregúntate quién más mide lo mismo FUERA de ella**: el arreglo no viaja solo, y la herramienta arreglada te da confianza que su entorno no merece. (3) Una cifra que **ORDENA podar conocimiento** se re-mide antes de obedecerla.
**Numerada el 2026-08-31** (§289): nació **sin `M-NN`** porque `33` tenía 3c de margen, y reservar un ID que no se escribe es la colisión de [[M-04]]. Su nodo ya tiene sitio.

### M-35 — 🧱 Ocho neuronas al 100 %: el cerebro no engordaba, se había quedado SIN SITIO — y el reflejo que manda capturar no tenía dónde *(§287 N18-03 · reincidencia de N17-04b)*
**Disparador**: empecé anotando que `00-INDICE` cruzó el 90 %. Al medir **el conjunto** en vez del nodo que tenía delante, eran **ocho al 100 %**: `50` (29c de margen) · `34` (43c **y 70/70 líneas**) · `33` (3c) · `31` (5c) · `35` (11c) · `38` (12c) · `44` (46c) · `05` (19c), con el boot a **4c**.
**El denominador, que es lo que lo vuelve diagnóstico**: en **10 revisiones del manifest se subió UN solo tope de 31**. Los techos son fijos y el contenido creció hasta ellos ⇒ **capacidad AGOTADA, no engorde**. Sin ese denominador la misma tabla se lee como «hay que podar», que es la conclusión contraria.
🎯 **Por qué es META y no una tarea de limpieza**: §G.4 ordena capturar en la neurona ANTES de cerrar, y ese día **ocho neuronas habrían rechazado la escritura**. Se demostró solo, dos veces, dentro de la propia auditoría: su meta-lección obligatoria no cupo en `33` ([[M-34]]), y **la válvula de diseño tampoco** — `37` con 863c libres y **3 LÍNEAS**. *Un depósito que recupera bien pero rechaza el siguiente ingreso deja de ser memoria en el momento exacto en que aparece la próxima lección.*
**Reglas**: (1) 🎯 **mide el CONJUNTO, no el nodo que acabas de tocar** ([[M-31]]), y **publica el denominador que elige el remedio**: «lleno» y «engordado» piden lo contrario. (2) La presión se alivia **por TEMA**; promover a un archivo que se declara CERRADO no es una válvula: se llena igual y sin avisar (§289). (3) 🎯 **Un reflejo de escritura vale lo que el sitio libre que tenga**: antes de prometer «capturo antes de cerrar», mide si cabe. (4) Subir el techo sigue prohibido ([[M-05]]): lo que se abre es **sitio**, no cupo.
