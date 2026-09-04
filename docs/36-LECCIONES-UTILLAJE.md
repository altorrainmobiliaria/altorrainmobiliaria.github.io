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

> 📊 <!--CIFRA-CEREBRO--> **Chequeos del linter del cerebro: 21** en `scripts/brain-check.mjs` — cifra comparada por el gate #29 (el propio #29 es uno de ellos). Si el kernel gana o pierde un chequeo y este número no se mueve, el commit se para: es la cura de «la herramienta dice N y hay M».

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

### L-86 — 🔌 La herramienta se rompió al ACTUALIZARSE, y el número obvio era el culpable equivocado *(incidente 2026-09-03)*

Claude Desktop dejó de arrancar con `spawn ENAMETOOLONG` y todo apuntaba al número de plugins: pasaba **253** por la línea de comandos y Windows la corta en **32.767** caracteres. Parecía cerrado. **Lo mató la ACTUALIZACIÓN, no el número**: `Version changed since last launch: 1.40609.1 -> 1.44121.4` (CLI 2.1.255 → 2.1.258), y el **primer** arranque del build nuevo reventó con **los mismos 253** que funcionaban 13 h antes. La prueba dura, y la razón de escribir esto: **254 FUNCIONÓ** (21 y 24-ago) y **253 FALLÓ** ⇒ el conteo que revienta es MENOR que uno que funcionó, **no hay umbral de plugins**. Documentar «falla con 253» habría mandado a la siguiente sesión a perseguir el número equivocado.

**El primer arreglo duró 3 min 33 s**, y por la misma razón: mover `~/.claude/plugins/` a un backup es un **no-op que el producto revierte solo** (`15:47:55` «Found 0 enabled local plugins» → `15:51:24` los 188 reinstalados con un `installedAt` idéntico al milisegundo). 🎯 *Si mueves un artefacto DERIVADO, el que lo deriva vuelve a escribirlo.* El punto de control persistente es `enabledPlugins` de `~/.claude/settings.json`, de donde se deriva el árbol.

**La aritmética, para no volver a adivinar** (medida sobre el proceso VIVO): `(Get-CimInstance Win32_Process -Filter "ProcessId=<CLAUDE_PID>").CommandLine.Length` da la línea real. Los plugins del **Desktop** (sincronizados desde la cuenta, bajo `local-agent-mode-sessions/…/rpm/`) costaban 17.355c con 74; los del **CLI** (`~/.claude/plugins/cache/`, los que gobierna `enabledPlugins`) 18.219c con 188. Proyección del siguiente arranque completo: **35.574c contra 32.767 ⇒ reventaba por 2.807**. Podados a 21, la parte del CLI baja a ~2.000c. **Son dos palancas y hacen falta las dos**: una se toca en el fichero, la otra SOLO desde Claude Desktop o claude.ai.

**El peaje que nadie mira**: 33 de los plugins habilitados traen **hooks** que corren en CADA llamada de herramienta aunque no uses ese plugin. Medido sobre los agentes de un workflow ese día: **mediana de 39,9 a 116,0 s por llamada**, máximos de 162-349 s, un `mkdir` de **77,5 s**. Un agente del fan-out se colgó a los 5 min y **el reloj de la interfaz siguió corriendo**, mostrando «2 h 42 min midiendo» sobre un proceso muerto — de ahí salió el segundo dato falso del incidente. *Un contador que sube no prueba que algo esté vivo.* Tres escribían en el repo o sobre el flujo git: `semgrep` (dejó `.semgrep/guardian.yml` con un id de telemetría, **sin gitignore**), `remember` (`PostToolUse` sin matcher, roto en Windows, demonio guardando cada 2 min y fallando) y `security-guidance` (venv de 286 MB y `asyncRewake` sobre `git commit`/`git push`).

**Dónde está la segunda palanca, verificado en la cuenta (4-sep)**: los 73 del Desktop no viven en el PC — el log dice `[RemotePluginManager] … Failed to fetch enabled state; defaulting to all-enabled`: su estado se lee de la CUENTA y, si no lo consigue, los enciende todos. Se gestionan en **claude.ai → Personalizar → pestaña Plugins → filtro «Tuyos»** (`claude.ai/customize/plugins`): cada tarjeta tiene «Más acciones» con **una sola opción, «Eliminar»**. Reversible: «Descubrir» → «+». Cada uno que sale son ~187c menos de línea de comandos.

**La red que faltaba**: tras podar hay que correr `sync-claude-user.mjs` y commitear el espejo, porque `brain-private/scripts/restaurar.mjs` lleva `settings.json` en su lista BLANCA — restaurar devolvería los 190 y con ellos la avería. *Un arreglo que tu propio procedimiento de restauración deshace no es un arreglo.*

### L-66 — 🪤 Dos herramientas con el MISMO nombre no miden ni apuntan a lo mismo *(§242 · §251)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-66]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
