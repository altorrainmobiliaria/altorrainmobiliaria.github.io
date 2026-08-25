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
**Disparador**: generas un archivo con heredoc (`python - <<'PY'`) y el contenido llega CORRUPTO sin que nada falle. **Casos, en orden de crueldad**: (a) los `\n` se vuelven salto REAL dentro de una cadena JS → `SyntaxError`; el caso amable, porque se ve. (b) 🔴 **`\b` se vuelve un BYTE de retroceso (0x08), invisible**: `/\bis:global\b/` quedó `/‹0x08›is:global‹0x08›/` — **válida, y capaz de no casar NUNCA**. Pasó `node --check` y el gate dijo ✅ *sobre el mismo bug para el que fue escrito* (§130); encima la edición por coincidencia exacta fallaba «sin motivo», porque el disco no decía lo que se veía. (c) el shell se traga dólares, backticks y comillas dobles antes de que el intérprete los vea. (d) **y el mismo mecanismo mutila un `git commit -m "…"`** *(§112)*: bash sustituye comandos DENTRO de comillas dobles, así que un identificador entre backticks intenta EJECUTARSE, falla, y se sustituye por **cadena vacía** — el commit sale con ÉXITO y el mensaje queda con un hueco donde estaba la palabra.
**Reglas**: (1) contenido con escapes de regex → **escríbelo con la herramienta de ficheros, NO por heredoc**; el heredoc vale para texto plano, y en cuanto hay `\b`/`\s`/`\d`/`\n` sobra una capa que los reinterpreta. (2) Si no hay remedio: **cadena RAW** (`r'''…'''`) y delimitador entrecomillado (`<<'PY'`, nunca `<<PY`). (3) **Mira los BYTES** al terminar (`cat -A`) — `node --check` valida sintaxis, no intención. (4) ⚠️ En `String.replace`, la CADENA de reemplazo interpreta `$&` y `` $` `` (= «todo lo anterior al match»): usa **función** de reemplazo y el texto entra literal. (5) 🎯 **Prueba que el gate MUERDA**: reintroduce el defecto, comprueba que falla, restaura. Un gate recién escrito que pasa en verde no está probado, está *sin* probar — y esa es la diferencia entre un gate y un adorno ([[M-06]], 4ª forma).

### L-51 — Un "Deploy complete!" puede no desplegar NADA: si la CLI no nombra el archivo, no hubo archivo *(§134)*
**Disparador**: `firebase deploy --only firestore:indexes` responde ✅ y `firebase firestore:indexes` devuelve **0**, con 14 escritos en el archivo. **Causa**: la clave (`firestore.indexes`) no estaba en el `firebase.json` **que usa el deploy** — había otro anidado que sí la tenía, y ése no manda. Sin clave no hay nada que desplegar, y la CLI lo llama éxito. **La señal**: el mensaje CAMBIA — sin la clave, `deploying indexes...` y calla; con ella, `deployed indexes in <archivo> successfully`. **Sin nombre de archivo, no se desplegó nada.** **Regla portable**: tras un deploy declarativo, **consulta el estado REAL** (`firestore:indexes`, `functions:list`, un GET) — la salida de una CLI es una promesa, no una verificación ([[L-49]]). **Corolarios del mismo caso**: (a) con `Promise.all` UNA consulta rota tumba a todas → `allSettled` y degradar por pieza; (b) un `catch` que solo hace `console.error` convierte «roto» en «vacío» a ojos del usuario, y son cosas distintas de arreglar; (c) toda clase que CREA el JS se estila en el MISMO cambio, o es un mensaje invisible (§133).

### L-50 — Astro: `:global()` dentro de un `<style is:global>` NO se resuelve — sale literal y el navegador DESCARTA la regla *(§130)*
**Disparador**: escribes `:global(body[data-x]) .clase {…}` por costumbre defensiva; compila sin una queja y la regla no aplica. **Causa**: `:global()` es una función de COMPILACIÓN. Astro la resuelve en los `<style>` **acotados**; en los `is:global` la deja **escrita tal cual** en el CSS servido, el navegador no la entiende, y un selector inválido no avisa: **descarta la regla entera, en silencio**. **Cómo se cazó**: ni el build, ni los 4 gates, ni la consola dijeron nada — solo **abrir el `.css` de `dist/` y buscar `:global(`**. Familia de §117: el CSS que no llega no rompe, deja sin pintar. **Gate**: sonda 2 de `verify:css` (ignora comentarios, o la propia explicación se acusaría). **Regla portable**: si el mecanismo es de COMPILACIÓN, verifica el **artefacto servido**, no el fuente.

### L-47 — 🐍 `open(p,'w').write(open(p).read()+X)` **borra el archivo** *(relato completo → §118)*
Python trunca con `'w'` **antes** de evaluar la lectura: queda un archivo con solo `X`, sin error y con
el script diciendo «hecho» (así se perdió `99` entero). **Regla portable**: al reescribir un archivo,
**lee a una variable primero** y **afirma sobre ella** (`assert prev.length > N`) antes de abrir en
`'w'`. Ese `assert` es lo único que distingue «añadir» de «reemplazarlo todo».
**Hermana, en Windows**: insertar con `'
'` en un archivo **CRLF** deja dos filas pegadas en una sola línea; el siguiente script que divida por `
` las ve como UNA y al reescribirla **borra la otra** (pasó con una fila del índice, y lo cazó `brain:check` #5). Detecta el fin de línea del archivo y ÚSALO para unir, no el del lenguaje.
**Y la TERCERA, que se acumula sola** *(§147)*: `open(p,"w",encoding="utf-8")` sin `newline=""` **traduce** el salto de línea al del sistema. Si el script ADEMÁS lo escribe a mano —porque detectó CRLF—, cada pasada añade otro retorno de carro: uno, dos, tres. Nada falla y el contenido se lee bien; el daño sale por dos sitios raros: `git diff` marca el ARCHIVO ENTERO aunque tocaras una línea, y el contador del linter **sube** mientras recortas texto (podé cinco líneas de `21` peleando contra 440 chars que eran CR invisibles). **Regla**: escribir SIEMPRE con `newline=""`, y ante un diff de archivo entero **contar los bytes de control** antes de creérselo.

### L-56 — 🧰 Un gate puede existir y NO CORRERLO NADIE — ni el CI ni tú *(§142)*
`verify:data` llevaba meses en `package.json` sin estar en el CI ni en ninguna rutina. Vigila algo caro (el free-tier) y era **decorativo**. Lo descubrí porque **lo puse en rojo yo mismo dos veces el mismo día** sin enterarme. **Cómo se caza, y es barato**: un meta-gate que compare la lista de scripts `verify:*` contra lo que el CI invoca de verdad — el linter del cerebro ya lo tenía (#25) y el proyecto no. **Regla portable**: escribir el gate es la mitad; **cablearlo es la otra mitad**, y la que se olvida. Prima de [[L-52]]: allí el gate corría sin mirar el archivo; aquí ni siquiera corría.

### L-52 — 🧰 Un gate puede correr en VERDE sobre archivos que **nunca abre** *(§138)*
**Disparador**: `npm run typecheck` pasa y crees que el proyecto está chequeado. **Causa**: `tsc` **no
lee los `.astro`**. Como casi toda la lógica de navegador vive en los `<script>` de las páginas, el gate
revisaba solo `src/lib` y `src/scripts` creyéndose completo; al cambiarlo por `astro check` aparecieron
**15 errores reales**, uno de ellos un componente ENTERO sin chequear porque una regex en línea rompe su
parser aunque Astro la compile bien. **Cómo se caza**: mete una sonda deliberada (`const x: number =
'texto'`) en un archivo del tipo que dudas; si el gate no la ve, no cubre ese tipo. **Prima hermana en
CSS**: `var(--x)` con una variable que nadie declaró **no es un error** — el navegador descarta la
propiedad y sigue; así el emblema del login estuvo meses sin relieve en una página declarada «réplica
fiel» (gate: `verify:tokens`). **Regla portable**: no preguntes «¿pasa mi gate?» sino **«¿qué ARCHIVOS
abre, y qué vería si el fallo estuviera delante?»**. Un gate que falla ABIERTO —descarta lo que no
entiende— es indistinguible de uno que funciona ([[M-06]]).

### L-48 — 🧪 Un prerrequisito GENERADO y gitignored hace que el gate pase en local y falle en CI *(§125)*
`worker-configuration.d.ts` lo produce `wrangler types` y está en `.gitignore`. En la máquina de quien
escribió el gate existía; en el checkout limpio del CI, no. Resultado: `typecheck` verde en local y
**8 corridas rojas seguidas en CI**, con el job de deploy saltándose en silencio por `needs: build`.
Dos días sin desplegar nada, y el sitio vivo contradiciendo al repo.
- **Regla**: si un comando necesita un archivo **generado** que no está commiteado, **generarlo es
  parte del comando**, no del entorno: `"typecheck": "wrangler types && tsc --noEmit"`. Un script que
  se prepara a sí mismo no puede divergir entre local y CI.
- **NO lo cures commiteando el archivo generado**: quita el síntoma y abre drift contra su fuente.
- **Reproduce antes de arreglar.** La primera hipótesis aquí (`.astro/` ausente) era FALSA — sin
  `.astro` el typecheck pasa igual. El diagnóstico salió de clonar en limpio, `npm ci` y correr la
  secuencia del CI entera. Arreglar sobre una hipótesis no verificada deja el CI rojo y a ti tranquilo.
- **Al añadir un paso al CI, míralo correr EN CI antes de dar la tarea por cerrada** — es la cuarta
  forma de [[M-06]]: un ❌ verdadero que nadie lee para la tubería igual que un ✅ falso la deja pasar.
