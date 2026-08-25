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
**Disparador**: workflow de 14 secciones; la 2ª etapa (verificador adversarial) usaba `s.desde`/`s.hasta` (el ítem original) dentro del prompt → `s is not defined`. Tumbó 4 de 14… y **no 4 cualesquiera**: justo los NO-AUSENTE, los del veredicto caro. Los AUSENTE sobrevivieron porque su rama hace `return` ANTES de tocar `s`. **Causa**: en `pipeline(items, stage1, stage2)` el callback de stage1 es `(item)=>…` pero el de stage2 es **`(prevResult, originalItem, index)=>…`**; escribí `(spec)=>{…}` y usé la `s` del `map`, que no existe en ese scope. **Fix**: firmar `(spec, s)=>{…}`. **Recuperación BARATA**: `Workflow({scriptPath, resumeFromRunId})` → los agentes con `(prompt, opts)` sin cambios replayan desde caché; solo corrieron en vivo los 4 verificadores (no se re-pagaron los 14 specs). **Reglas portátiles**: (1) en etapas ≥2 tomar el ítem del **2º parámetro**, nunca del closure; (2) **leer SIEMPRE el bloque `<failures>`** de la notificación — un workflow dice "completed" aunque haya perdido ítems (aquí: `resumen.devueltas 10/14`, el fallo solo aparecía en `<failures>`); (3) 🎯 **un bug que vive en UNA rama sesga el resultado**: aquí sobrevivió el 100% de lo barato (AUSENTE, early-return) y murió el 100% de lo caro (los que necesitaban verificación). Un "10/14 ✅" habría sido una conclusión falsa y tranquilizadora.

### L-27 — Un `grep` te da la HOJA, no la RAMA: nunca asumas la forma del dato sin leer el padre *(ADR §32.14; §3.3 incumplida por mí mismo)*
**Disparador**: necesitaba el WhatsApp oficial. `grep -n "whatsapp" site.ts` devolvió `19: whatsapp: '+57 300 243 9810'` / `20: whatsappLink: 'https://wa.me/...'`. Escribí `SITE.contacto.whatsappLink` → **página caída**: `Cannot read properties of undefined (reading 'whatsappLink')`. La clave real es **`contact`** (en inglés); mi `contacto` (español) no existe. **Causa**: el grep muestra la línea que coincide, **NO su ANIDAMIENTO**. Vi las hojas (`whatsappLink`) y ALUCINÉ la rama (`contacto`) por inercia del idioma del repo — que mezcla español (dominio) con inglés (código). **Fix**: `Read` del archivo (12 líneas) antes de usar la ruta. **Reglas**: (1) para **leer un valor**, grep basta; para **escribir una ruta de acceso** (`a.b.c`), LEE la estructura — el grep no muestra el padre; (2) sospecha de tu propia inercia lingüística en repos bilingües (`contact`/`contacto`, `date`/`fecha`); (3) 🎯 **quién cazó el bug importa**: NO fue el barrido de paleta ni los computed styles — fue el **build**. Cada capa ve un fallo distinto y ninguna sustituye a las otras: build (existe/compila) → estructura (está) → computed styles (se aplica) → comportamiento (funciona). Ordénalas así; la primera es la más barata.

### L-37 — 🎨 Los enlaces de Claude Design CADUCAN al re-guardar: el mockup se trae por MCP, no por URL *(2026-08-19, ADR §89)*

**Disparador**: Daniel comparte el enlace de una pantalla recién diseñada («el enlace caduca en 10 min») y al abrirlo responde **`file not found`** — por `curl` y por navegador con sesión, o sea no es permisos. **Causa**: la URL apunta a un **bundle** (`/serve/.bundles/<uuid>.html`) y Claude Design **genera un uuid nuevo en cada guardado**. El enlace no expira por tiempo: muere en cuanto el diseño se vuelve a guardar, aunque hayan pasado segundos. Perseguir un enlace nuevo es una carrera que se pierde sola. **Receta**: traerlo por el **MCP de Claude Design** (herramienta `DesignSync`), que direcciona por `projectId` y no depende del bundle: 1. `list_files` con el `projectId` (sale de la URL `claude.ai/design/p/<projectId>`) → los paths reales. 2. `get_file` con el path del `.dc.html` → el contenido íntegro. 3. Guardarlo en `portal/design/mockups/ALTORRA <Pantalla>.dc.html`, que es donde viven los demás y donde `20 §Portal` los declara como SSoT visual. **Corolario**: el mockup **se archiva en el repo**, no se consume desde un enlace. Un diseño que solo existe en una URL no es fuente de verdad de nada — la siguiente sesión no lo alcanza.

## §Meta — meta-aprendizajes del propio cerebro
> Se llena cuando el cerebro contribuye a un error — Reflejo de Autocrítica §G.4.
> 🧩 **Todas viven COMPLETAS en `33-LECCIONES-META.md`**; aquí queda el titular.

### L-46 — El shell (y el lenguaje que lo llama) SE COMEN texto y nada falla: comillas simples o por ARCHIVO
**Disparador**: generas un archivo con heredoc (`python - <<'PY'`) y el contenido llega CORRUPTO sin que nada falle. **Casos, en orden de crueldad**: (a) los `\n` se vuelven salto de línea REAL dentro de una cadena JS → `SyntaxError`; el caso amable, porque revienta y se ve. (b) 🔴 **`\b` se vuelve un BYTE de retroceso (0x08), invisible**: Python lo lee como carácter de control, no como el `\b` de una regex. `/\bis:global\b/` quedó `/‹0x08›is:global‹0x08›/` — **válida, y capaz de no casar NUNCA**. Pasó `node --check`, el gate corrió y dijo ✅ *sobre el mismo bug para el que fue escrito* (§130); encima la edición por coincidencia exacta fallaba «sin motivo», porque el texto en disco no era el que se veía. (c) el shell se traga los signos de dólar, los backticks y las comillas dobles antes de que el intérprete los vea.
**Reglas**: (1) contenido con escapes de regex → **escríbelo con la herramienta de ficheros, NO por heredoc**; el heredoc vale para texto plano, y en cuanto hay `\b`/`\s`/`\d`/`\n` sobra una capa que los reinterpreta. (2) Si no hay remedio: **cadena RAW** (`r'''…'''`) y delimitador entrecomillado (`<<'PY'`, nunca `<<PY`). (3) **Mira los BYTES** al terminar (`cat -A`) — `node --check` valida sintaxis, no intención. (4) ⚠️ En `String.replace`, la CADENA de reemplazo interpreta `$&` y `` $` `` (= «todo lo anterior al match»): usa **función** de reemplazo y el texto entra literal. (5) 🎯 **Prueba que el gate MUERDA**: reintroduce el defecto, comprueba que falla, restaura. Un gate recién escrito que pasa en verde no está probado, está *sin* probar — y esa es la diferencia entre un gate y un adorno ([[M-06]], 4ª forma).

### L-50 — Astro: `:global()` dentro de un `<style is:global>` NO se resuelve — sale literal y el navegador DESCARTA la regla *(§130)*
**Disparador**: escribes `:global(body[data-x]) .clase {…}` por costumbre defensiva; compila sin una queja y la regla no aplica. **Causa**: `:global()` es una función de COMPILACIÓN. Astro la resuelve en los `<style>` **acotados**; en los `is:global` la deja **escrita tal cual** en el CSS servido, el navegador no la entiende, y un selector inválido no avisa: **descarta la regla entera, en silencio**. **Cómo se cazó**: ni el build, ni los 4 gates, ni la consola dijeron nada — solo **abrir el `.css` de `dist/` y buscar `:global(`**. Familia de §117: el CSS que no llega no rompe, deja sin pintar. **Gate**: sonda 2 de `verify:css` (ignora comentarios, o la propia explicación se acusaría). **Regla portable**: si el mecanismo es de COMPILACIÓN, verifica el **artefacto servido**, no el fuente.

### L-47 — 🐍 `open(p,'w').write(open(p).read()+X)` **borra el archivo**: el truncado ocurre antes de la lectura *(§118)*
Python evalúa el objeto sobre el que se llama al método ANTES que sus argumentos. En
`io.open(p,'w').write(io.open(p).read() + X)` el `'w'` **trunca el archivo a cero** y solo después se
evalúa la lectura — que devuelve cadena vacía. El resultado es un archivo con SOLO `X`. No hay error,
no hay excepción, el script imprime «hecho»: así me cargué `99-HISTORIAL-ADR.md` entero (3909 líneas,
117 ADRs → 55 líneas) y lo delató un `brain:check` que dijo «1 ADRs indexados».
- **Regla**: en un script que reescribe un archivo, **LEE A UNA VARIABLE primero** y afirma sobre ella
  (`assert prev.count('
## ') >= 100`) antes de abrir en `'w'`. Un `assert` sobre el contenido viejo
  es lo único que distingue «append» de «reemplazo total».
- **Lo que salvó el día fue el commit**, no la pericia: el archivo estaba en git sin modificar, y
  `git checkout --` lo devolvió intacto. Corolario operativo: **commitea el cerebro antes de correr
  scripts que lo reescriban**, que es justo lo que §G.4 pide por otras razones.
- Misma familia que [[L-46]]: utillaje propio que corrompe en SILENCIO. El patrón común es que el
  daño no lo reporta quien lo causa — lo reporta un gate más abajo, si existe.
- **Reincidencia (mismo día, §121)**: volví a hacerlo **una hora después de escribir esta lección**, en un
  `python -c` de una línea, sobre el `05`. La regla decía «en un **script** que reescribe un archivo…» y yo
  no conté un one-liner como script. **Una regla con un “salvo los casos pequeños” implícito se rompe justo
  en los pequeños**, que además son los que se escriben sin pensar. Redacción corregida: *cualquier* forma
  de reescribir un archivo —script, one-liner, comando— lee a variable y afirma primero. Y otra vez lo
  salvó el commit, no la pericia.

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
