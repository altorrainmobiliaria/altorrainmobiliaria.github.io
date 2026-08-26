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
> **Y crecen rápido**: tres de las seis nacieron en dos días. Por eso salen de `30` antes de que lo
> revienten, no después.

### L-25 — En `pipeline()` de Workflow las etapas ≥2 reciben `(prevResult, originalItem, index)`: NO captures el ítem por closure *(ADR §32.9, auditoría de fidelidad de la home)*
**Disparador**: la 2ª etapa de un `pipeline()` usaba el ítem por closure → `s is not defined`; tumbó 4 de 14 y **no 4 cualesquiera**: justo los del veredicto caro. **Causa**: en `pipeline(items, s1, s2)` el callback de s1 es `(item)=>…` pero el de s2 es **`(prevResult, originalItem, index)=>…`**. **Reglas**: (1) en etapas ≥2 el ítem sale del **2º parámetro**, nunca del closure; (2) **lee el bloque `<failures>`** — un workflow dice "completed" aunque haya perdido ítems; (3) 🎯 **un bug que vive en UNA rama sesga el resultado**: sobrevivió el 100 % de lo barato y murió el 100 % de lo caro, y un «10/14 ✅» habría sido una conclusión falsa y tranquilizadora. Detalle → §32.9.

### L-27 — Un `grep` te da la HOJA, no la RAMA: nunca asumas la forma del dato sin leer el padre *(ADR §32.14; §3.3 incumplida por mí mismo)*
**Disparador**: `grep "whatsapp" site.ts` devolvió `whatsapp:` y `whatsappLink:`; escribí `SITE.contacto.whatsappLink` → **página caída**. La clave real es **`contact`** (inglés). **Causa**: el grep muestra la línea, **NO su ANIDAMIENTO** — vi las hojas y aluciné la rama por inercia del idioma en un repo bilingüe. **Reglas**: (1) para LEER basta el grep; para ESCRIBIR una ruta (`a.b.c`), **lee la estructura**; (2) 🎯 **quién caza el bug importa**: aquí fue el BUILD, no el barrido visual. Cada capa ve un fallo distinto: build → estructura → estilos calculados → comportamiento. En ese orden, que es de más barato a más caro. Detalle → §32.14.

### L-37 — 🎨 Los enlaces de Claude Design CADUCAN al re-guardar *(§89)*
El mockup se trae por MCP, nunca por URL guardada: la URL apunta a una versión que deja de existir.
### L-46 — El shell (y el lenguaje que lo llama) SE COMEN texto y nada falla: comillas simples o por ARCHIVO *(§112 · §130)*
**Disparador**: generas un archivo con heredoc (`python - <<'PY'`) y el contenido llega CORRUPTO sin que nada falle. **Casos, en orden de crueldad**: (a) los `\n` se vuelven salto REAL en una cadena JS → `SyntaxError`; el caso amable: se ve. (b) 🔴 **`\b` se vuelve un BYTE de retroceso (0x08), invisible**: `/\bis:global\b/` quedó `/‹0x08›is:global‹0x08›/` — **válida, y capaz de no casar NUNCA**. Pasó `node --check` y el gate dijo ✅ *sobre el mismo bug para el que fue escrito* (§130); y la edición por coincidencia exacta fallaba «sin motivo», porque el disco no decía lo que se veía. (c) el shell se traga dólares, backticks y comillas dobles antes de que el intérprete los vea. (d) **el mismo mecanismo mutila un `git commit -m "…"`** *(§112)*: bash sustituye comandos dentro de comillas dobles, así que un identificador entre backticks intenta EJECUTARSE, falla y se sustituye por **cadena vacía** — el commit sale con ÉXITO y con un hueco donde iba la palabra.
**Reglas**: (1) 🎯 **el disparador es UN `\` O UN `` ` `` EN LA CARGA, no «voy a generar un archivo»**: el 26-ago reincidió ×2 por backslash y ×3 por backtick dentro de `python3 -c "…"` (bash lo ejecuta y deja el hueco VACÍO — caso d). Archivada bajo «generar» no dispara en un parche de una línea ([[M-24]]). Con `\` o `` ` `` → **herramienta de ficheros**; si no, comillas simples en el `-c`. (2) Si no hay remedio: **cadena RAW** (`r'''…'''`) y delimitador entrecomillado (`<<'PY'`, nunca `<<PY`). (3) **Mira los BYTES** al terminar (`cat -A`) — `node --check` valida sintaxis, no intención. (4) ⚠️ En `String.replace`, la CADENA de reemplazo interpreta `$&` y `` $` `` (= «todo lo anterior al match»): usa **función** de reemplazo y el texto entra literal. (6) 🔁 **OCHO reincidencias, todas el 26-ago, y el relato ya no aporta: aporta el patrón.** Las ocho estuvieron correlacionadas al **100 %** con una sola cosa — pasar el texto como ARGUMENTO (`-m`, `-c`) en vez de por fichero. Tres intentos de afilar la regla fallaron por la misma razón: cada uno enumeraba casos («generar un archivo», «insertar en un ancla») y siempre había uno fuera. Y la 6.ª enseñó que el daño no es cosmético — bash **ejecutó un `.md` como script** y dejó basura en el repo: *un nombre entre acentos graves dentro de comillas dobles es una orden de ejecutarlo.* 🔒 **Ningún gate puede cazarlo**: la corrupción ocurre en la llamada, antes de que el hook vea nada. Es [HONOR] irreducible, y por eso se declara en vez de fingir que la próxima redacción lo resolverá. Lo único que funciona siempre: **redactar a un fichero y pasarlo por referencia, sin excepciones y sin juzgar si el texto «es corto»** — el juicio es justo lo que falla. *Si un criterio mecánico enumera casos, fallará en el que no enumeraste.*
**Regla, ahora sin ramas que enumerar**: 🎯 **el texto NUNCA viaja como argumento de shell.** A un archivo, con la herramienta de edición; a un comando, por REFERENCIA a un archivo (`git commit -F fichero`, nunca `-m`). El intérprete solo para iterar, nunca para introducir texto nuevo. (5) 🎯 **Prueba que el gate MUERDA**: reintroduce el defecto, comprueba que falla, restaura. Un gate recién escrito que pasa en verde no está probado, está *sin* probar — y esa es la diferencia entre un gate y un adorno ([[M-06]], 4ª forma).

### L-51 — Un "Deploy complete!" puede no desplegar NADA: si la CLI no nombra el archivo, no hubo archivo *(§134)*
**Disparador**: `firebase deploy --only firestore:indexes` responde ✅ y `firestore:indexes` devuelve **0**, con 14 en el archivo. **Causa**: la clave no estaba en el `firebase.json` que usa el deploy. Sin clave no hay nada que desplegar, y la CLI lo llama éxito. **La señal**: el mensaje CAMBIA — sin la clave, `deploying indexes...` y calla; con ella, `deployed indexes in <archivo> successfully`. **Sin nombre de archivo, no se desplegó nada.** **Regla portable**: tras un deploy declarativo, **consulta el estado REAL** (`firestore:indexes`, `functions:list`, un GET) — la salida de una CLI es una promesa, no una verificación ([[L-49]]). **Corolarios** (§133-§134): `allSettled` en vez de `Promise.all`; un `catch` que solo loguea convierte «roto» en «vacío»; y toda clase que CREA el JS se estila en el MISMO cambio.

### L-50 — Astro: `:global()` dentro de un `<style is:global>` NO se resuelve — sale literal y el navegador DESCARTA la regla *(§130)*
**Causa**: `:global()` es una función de COMPILACIÓN. Astro la resuelve en los `<style>` **acotados**; en los `is:global` la deja **escrita tal cual**, el navegador no la entiende, y un selector inválido **descarta la regla entera, en silencio**. No lo vio ni el build, ni los gates, ni la consola — solo abrir el `.css` de `dist/`. Familia de §117: el CSS que no llega no rompe, deja sin pintar. Hoy lo caza la sonda 2 de `verify:css`. **Regla portable**: si el mecanismo es de COMPILACIÓN, verifica el **artefacto servido**, no el fuente.

### L-47 — 🐍 `open(p,'w').write(open(p).read()+X)` **borra el archivo** *(relato completo → §118)*
Python trunca con `'w'` **antes** de evaluar la lectura: queda un archivo con solo `X`, sin error y con el script diciendo «hecho» (así se perdió `99` entero). **Regla portable**: al reescribir, **lee a una variable primero** y **afirma sobre ella** (`assert prev.length > N`) antes de abrir en `'w'`. Ese `assert` es lo único que distingue «añadir» de «reemplazarlo todo».
**Hermana, en Windows**: insertar con `'
'` en un archivo **CRLF** deja dos filas pegadas en una sola línea; el siguiente script que divida por `
` las ve como UNA y al reescribirla **borra la otra** (pasó con una fila del índice, y lo cazó `brain:check` #5). Detecta el fin de línea del archivo y ÚSALO para unir, no el del lenguaje.
**Y la TERCERA, que se acumula sola** *(§147)*: `open(p,"w",encoding="utf-8")` sin `newline=""` **traduce** el salto al del sistema; si el script ADEMÁS lo escribe a mano —porque detectó CRLF—, cada pasada añade otro retorno de carro. Nada falla y el texto se lee bien; el daño sale por dos sitios raros: `git diff` marca el ARCHIVO ENTERO aunque tocaras una línea, y el contador del linter **sube** mientras recortas (podé 5 líneas de `21` peleando contra 440 chars que eran CR invisibles). **Regla**: escribir SIEMPRE con `newline=""`, y ante un diff de archivo entero **contar los bytes de control** antes de creérselo.


> 🎭 **Los gates que MIENTEN — [[L-48]] · [[L-52]] · [[L-56]] · [[L-57]] — viven COMPLETOS en
> `38-GATES-QUE-MIENTEN.md`** (shard del 26-ago: la familia creció 3× en un día). Aquí quedan los
> titulares, que es lo que hace falta para reconocer el síntoma.

### L-57 — 🎭 Una herramienta a la que le falta su prerrequisito puede **PREGUNTAR en vez de fallar** — y sin terminal, «no contestar» sale con código 0 *(§175)*
### L-56 — 🧰 Un gate puede existir y NO CORRERLO NADIE — ni el CI ni tú *(§142)*
### L-52 — 🧰 Un gate puede correr en VERDE sobre archivos que **nunca abre** *(§138)*
### L-48 — 🧪 Un prerrequisito GENERADO y gitignored hace que el gate pase en local y falle en CI *(§125)*
