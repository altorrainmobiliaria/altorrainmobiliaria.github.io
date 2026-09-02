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
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-25]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
### L-27 — Un `grep` te da la HOJA, no la RAMA: nunca asumas la forma del dato sin leer el padre *(ADR §32.14; §3.3 incumplida por mí mismo)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-27]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-37 — 🎨 Los enlaces de Claude Design CADUCAN al re-guardar *(§89)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-37]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
### L-46 — El shell (y el lenguaje que lo llama) SE COMEN texto y nada falla: comillas simples o por ARCHIVO *(§112 · §130)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-46]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-59 — 📋 Enumera los pares «DECLARADO ↔ DESPLEGADO» y compáralos uno a uno; lo que no se puede LEER no es un par *(§197-§198)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-59]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-51 — Un "Deploy complete!" puede no desplegar NADA: si la CLI no nombra el archivo, no hubo archivo *(§134)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-51]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-50 — Astro: `:global()` dentro de un `<style is:global>` NO se resuelve — sale literal y el navegador DESCARTA la regla *(§130)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-50]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-47 — 🐍 `open(p,'w')` **vacía el archivo al ABRIR**, falle lo que falle después *(§118 · §216.8)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-47]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).


> 🎭 **Los gates que MIENTEN — [[L-48]] · [[L-52]] · [[L-57]] · [[L-58]] — viven COMPLETOS en
> `38-GATES-QUE-MIENTEN.md`** (shard del 26-ago: la familia creció 3× en un día), y los que **no llegan
> a mirar** —[[L-56]] · [[L-65]] · [[L-70]] · [[L-71]] · [[L-73]]— en `38a-ARMADO-DEL-GATE.md` (§289).
> ⚠️ Desde el lote 14 de F2 esas dos hojas guardan su ESCALERA y un stub anclado: **el cuerpo de las
> trece está en el maestro**. Sus titulares NO se repiten aquí: `30` ya los lleva, y mejores (§242).

### L-66 — 🪤 Dos herramientas con el MISMO nombre no miden ni apuntan a lo mismo *(§242 · §251)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-66]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
