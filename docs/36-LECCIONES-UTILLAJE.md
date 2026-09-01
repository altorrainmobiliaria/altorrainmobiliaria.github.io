# 🧰 36 — LECCIONES DE UTILLAJE (cuando la herramienta miente, no el código)

> **Hoja hija de `30-LECCIONES`** (ADR §125). Aquí viven las lecciones en las que **el fallo no está
> en el producto sino en la herramienta con la que se construye**: el shell, el intérprete, `grep`,
> el CI, el orquestador, el editor de mockups.
>
> **Por qué merecen nodo propio.** Comparten un rasgo que las hace especialmente caras: **el daño no
> lo reporta quien lo causa**. El shell se come una palabra y el commit sale igual; el `open(…,'w')`
> trunca y el script imprime «hecho»; el gate del CI se pone rojo donde nadie mira y la tubería se
> para en silencio. Siempre las delata algo AGUAS ABAJO — o nadie.
>
> **Y crecen rápido.** Por eso salen de `30` antes de que lo revienten, no después.

### L-67 — 🎭 Bumpear una constante que **no lee nadie**, y anotarlo como protección *(§256)*

La doctrina *always-on* ordenó durante meses: «bumpea `CACHE_NAME` al cambiar el shell». **Medido el 28-ago: esa constante se declara en `service-worker.js:9` y no la lee NADIE** — ni el propio SW, cuyo `activate` enumera `caches.keys()` y las borra TODAS. Sus únicos consumidores son el gate #4, que la imprime, y `scripts/fix-i18n-macro.mjs`, que la incrementa. **Por eso no se borra la constante**: quitarla rompe a los dos.

El navegador reinstala un SW comparando **los bytes del fichero entero**, no una constante concreta. Así que el bump que hice ese día (v5→v6) no protegió nada que el resto del diff no hiciera ya, y sin embargo lo registré como si sí. 🎯 *Un ritual que no puedes ver fallar se siente exactamente igual que uno que funciona* — es la familia de `38-GATES-QUE-MIENTEN`, esta vez ejecutándola yo.

Lo que SÍ sigue vivo, y por lo que el fichero no se toca: ese SW es un **kill-switch de un solo tiro** — borra todos los cachés, `unregister()` y recarga las pestañas— para el visitante que registró el SW viejo antes del 10-jul-2026 y aún no ha vuelto. Dispara con cualquier cambio de bytes y **solo una vez por navegador**: después se ha desregistrado y no vuelve. Ninguna página servida registra ya el SW (`scripts.js:524` lo hace, pero **ningún HTML carga `scripts.js`** — comprobado).

### L-25 — Un bug que vive en UNA rama del fan-out SESGA el resultado, y el parcial tranquiliza *(ADR §32.9)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-25]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.
### L-27 — Un `grep` te da la HOJA, no la RAMA: nunca asumas la forma del dato sin leer el padre *(ADR §32.14; §3.3 incumplida por mí mismo)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-27]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-37 — 🎨 Los enlaces de Claude Design CADUCAN al re-guardar *(§89)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-37]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.
### L-46 — El shell (y el lenguaje que lo llama) SE COMEN texto y nada falla: comillas simples o por ARCHIVO *(§112 · §130)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-46]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-59 — 📋 Enumera los pares «DECLARADO ↔ DESPLEGADO» y compáralos uno a uno; lo que no se puede LEER no es un par *(§197-§198)*
**Disparador**: una cifra compuesta que no cuadra consigo misma («20 en código / 17 desplegadas», y faltaban 3). **La forma**: lista lo que el repo DECLARA y producción EJECUTA —funciones, índices, reglas, secretos, dominios— y compara cada par **contra su API**; un comando por par. En una pasada salieron una función construida, probada y que **no corría**, y un archivo con nombre y sitio CANÓNICOS que **no despliega nadie** — único hogar de un índice sin el cual otra función habría fallado con `FAILED_PRECONDITION` al encenderla. *Un huérfano que se llama como el bueno es peor que no tenerlo.*
**Reglas**: (1) 🎯 **si no hay forma de LEER el lado desplegado, ese par NO es verificable**: márcalo como sello y **dilo** — callarlo le hace heredar el ✅ del par vecino (hay `firestore:indexes`; no hay `firestore:rules`). (2) un huérfano **se cuarentena con inventario**, no se borra: puede ser prerrequisito de algo apagado. (3) **no despliegues «por si acaso»** lo que cuesta en cada escritura; decláralo como prerrequisito de ENCENDIDO. (4) ⚠️ **sospecha de tu sonda antes que del proyecto**: si reporta ~100 % de discrepancia, te equivocaste de comparación — la mía metía en la firma el `__name__` que Firestore **añade** al desplegar. Generaliza [[L-51]] hacia ANTES del deploy.

### L-51 — Un "Deploy complete!" puede no desplegar NADA: si la CLI no nombra el archivo, no hubo archivo *(§134)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-51]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-50 — Astro: `:global()` dentro de un `<style is:global>` NO se resuelve — sale literal y el navegador DESCARTA la regla *(§130)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-50]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-47 — 🐍 `open(p,'w')` **vacía el archivo al ABRIR**, falle lo que falle después *(§118 · §216.8)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-47]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.


> 🎭 **Los gates que MIENTEN — [[L-48]] · [[L-52]] · [[L-57]] · [[L-58]] — viven COMPLETOS en
> `38-GATES-QUE-MIENTEN.md`** (shard del 26-ago: la familia creció 3× en un día), y los que **no llegan
> a mirar** —[[L-56]] · [[L-65]] · [[L-70]] · [[L-71]]— en `38a-ARMADO-DEL-GATE.md` (§289). Sus
> titulares NO se repiten aquí: `30` ya los lleva, y mejores (§242).

### L-66 — 🪤 Dos herramientas con el MISMO nombre no miden ni apuntan a lo mismo *(§242 · §251)*
**Disparador**: respaldo hecho con `cp … /tmp/x.bak` desde el shell y restaurado desde Python con un `copy` condicionado a `os.path.exists('/tmp/x.bak')`. El Python NATIVO lee `/tmp` como `C:/tmp`: el `exists` dio **falso en silencio**, el restaurado no ocurrió y el bloque de prueba anterior se quedó debajo del bueno — dos guardias donde iba una.
**Reglas**: (1) 🎯 Temporal que escribe UNA herramienta y lee OTRA → **scratchpad de la sesión**, nunca `/tmp`. (2) Un `if exists(): restaurar()` **sin rama que grite** vuelve una ruta mala un no-op MUDO: o hay `assert`, o no hay comprobación. (3) Lo cacé porque el `assert` del ancla habla; con un `sed` mudo me habría creído un ✅ que no probaba nada ([[L-64]]). **(4) 🎯 Y el segundo caso, que duele más porque el gate SÍ estaba** *(§251)*: mis `assert` cortaban las filas del índice a **≤260** medidas en Python, y el linter las mide en **JS leyendo con CRLF**, así que cada línea vale **uno más** por su `\r`. Una fila de 260 se volvía 261 y **cruzaba el trinquete** después de que mi comprobación dijera que iba bien. ✅ **ARREGLADO EN LA RAIZ el 28-ago (§259, kernel v1.25.0)**: el lector del linter normaliza CRLF, así que ya NO cuenta el `\r`. El gate #1 hacía ese mismo `replace` desde hacía versiones **en su línea y solo en la suya**, dejando los otros 55 usos midiendo retornos como si fueran conocimiento — y el presupuesto de arranque llegó a ordenar PODAR con 267 chars fantasma. 🎯 *Un arreglo puesto donde dolió, en vez de en el instrumento, deja el fallo vivo en todos los demás.* La regla de abajo sigue valiendo entera para todo lo demás: **mide con el instrumento del GATE, no con uno equivalente**: la unidad (UTF-16 vs puntos de código), el conjunto (¿lee también los shards?) y el fin de línea son parte de la medida. Si el gate y tú dais números distintos, manda el suyo — y esa diferencia es un hallazgo, no un redondeo.
