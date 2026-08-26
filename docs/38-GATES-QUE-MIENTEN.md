# 🎭 38 — GATES QUE MIENTEN (hoja hija de `36-LECCIONES-UTILLAJE`)

> **Por qué existe esta hoja.** Un gate roto AVISA; un gate que miente no. Esta familia nació
> dispersa y creció tres veces en un solo día (2026-08-26), así que se le da casa propia: son las
> lecciones de cuando el ✅ **no significa lo que parece**. El stub con el título sigue en `36`,
> que es donde se busca; el detalle completo vive aquí.
>
> **La escalera, de menos a más grave** — y cada peldaño se detecta distinto:
> 1. **No hay gate.** Al menos nadie se confía.
> 2. **Lo hay y nadie lo invoca** ([[L-56]]) — existe en `package.json` y no lo corre ni el CI.
> 3. **Corre, pero no abre el archivo** ([[L-52]]) — verde sobre lo que jamás miró.
> 4. **Corre en un sitio y no en otro** ([[L-48]]) — prerrequisito generado y gitignored.
> 5. **Afirma haber pasado sin mirar nada** ([[L-57]]) — le falta su prerrequisito y en vez de
>    fallar PREGUNTA; sin terminal, no contestar sale con código 0.
>
> **Prueba de bolsillo para cualquier gate**: *que imprima CUÁNTO miró* (archivos, enlaces,
> pruebas). Un número es lo único que distingue «revisado» de «no hice nada». Y **estrénalo
> rompiéndolo a propósito EN EL ENTORNO DONDE VA A CORRER**, no solo en tu máquina.

---

### L-57 — 🎭 Una herramienta a la que le falta su prerrequisito puede **PREGUNTAR en vez de fallar** — y sin terminal, «no contestar» sale con código 0 *(§175)*
**Disparador (condición mínima)**: una CLI que *puede autoinstalarse algo* corre en CI. Basta con que tenga modo interactivo — no hace falta que falle nada para sospechar.
**Caso**: `astro check` sin `@astrojs/check` pregunta «Continue?» y espera; sin TTY nadie responde y sale **exit 0**. «Tipos ✅» sin abrir un archivo, 4 corridas verdes sobre 26 errores, con deploy. **Por qué en local sí**: el paquete estaba en el `node_modules` de la RAÍZ, no en el del subproyecto — Node sube un nivel, el CI instala dentro. *Una dependencia que solo existe por la disposición de carpetas de quien programa no existe.* Familia de [[L-48]] por la cara que no se mira: verde en CI **porque el gate se apagó**. Detalle → §175.
**Cómo se caza**: (a) exige el checker **en el LOCKFILE**, no en `node_modules` — el lockfile es lo que reinstala el CI y `node_modules` es lo que engaña; (b) **estrena cada gate rompiéndolo a propósito EN EL ENTORNO DONDE CORRE**: un worktree con `npm ci` limpio sobre un commit malo conocido da el antes/después en dos comandos; (c) desconfía de un ✅ que no dice **cuántos archivos** miró.
**Regla portable**: *no tener gate < tener uno que nadie invoca ([[L-56]]) < tener uno que **afirma haber pasado***. Una corrida en verde **no prueba que el gate mirara**.

### L-56 — 🧰 Un gate puede existir y NO CORRERLO NADIE — ni el CI ni tú *(§142)*
`verify:data` llevaba meses en `package.json` sin estar en el CI ni en ninguna rutina: vigila algo caro (el free-tier) y era **decorativo**. Lo descubrí porque **lo puse en rojo yo mismo dos veces el mismo día** sin enterarme. **Cómo se caza, barato**: un meta-gate que compare los scripts `verify:*` contra lo que el CI invoca de verdad — el linter del cerebro ya lo tenía (#25) y el proyecto no. **Regla portable**: escribir el gate es la mitad; **cablearlo es la otra**, y la que se olvida. Prima de [[L-52]]: allí el gate corría sin mirar el archivo; aquí ni siquiera corría. **REINCIDIÓ del otro lado** *(§157)*: los 7 gates estaban cableados al CI, pero en LOCAL hay que acordarse de siete nombres — corrí cinco y escribí en el commit «los 7 en verde». El CI puso rojo `verify:css` y tenía razón. El candado de arriba llega TARDE (el CI corre después de empujar), así que hace falta el hermano: un comando que los corra TODOS y un gate que compruebe, nombre a nombre, que el atajo no se quede atrás. *Un atajo que envejece es peor que no tenerlo: se confía en él.*
**TERCERA REINCIDENCIA, y la peor** *(§174)*: el meta-gate que vigila el cableado **enumeraba por PREFIJO** — `Object.keys(scripts).filter(k => k.startsWith('verify:'))` — así que `typecheck` y `test`, que no lo llevan, le eran INVISIBLES. Resultado: `npm run verify` daba verde con **26 errores de tipos en `main`**, y **las 855 pruebas unitarias no las corría el CI**: el gate del RNT, la prohibición del depósito en vivienda y la ventana de la Ley 2300 no bloqueaban ningún despliegue. **Regla afilada**: un meta-gate que enumera por convención de nombre solo protege a quien la respeta, y el que la incumple es justo el que hay que vigilar. Enumera contra la lista de lo que **el CI ejecuta de verdad**, o nombra explícitamente los que no encajan en el patrón — y comprueba **las dos puntas** (CI y atajo local), porque estos dos fallaron por puntas distintas.

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
`worker-configuration.d.ts` lo produce `wrangler types` y está en `.gitignore`: en la máquina de quien escribió el gate existía; en el checkout limpio del CI, no. Resultado: `typecheck` verde en local y **8 corridas rojas seguidas en CI**, con el deploy saltándose en silencio por `needs: build`. Dos días sin desplegar, y el sitio vivo contradiciendo al repo.
- **Regla**: si un comando necesita un archivo **generado** que no está commiteado, **generarlo es
  parte del comando**, no del entorno: `"typecheck": "wrangler types && tsc --noEmit"`. Un script que
  se prepara a sí mismo no puede divergir entre local y CI.
- **NO lo cures commiteando el archivo generado**: quita el síntoma y abre drift contra su fuente.
- **Reproduce antes de arreglar.** La 1.ª hipótesis (`.astro/` ausente) era FALSA: sin `.astro` el typecheck pasa igual. El diagnóstico salió de clonar en limpio, `npm ci` y correr la secuencia del CI entera. Arreglar sobre una hipótesis no verificada deja el CI rojo y a ti tranquilo.
- **Al añadir un paso al CI, míralo correr EN CI antes de dar la tarea por cerrada** — es la cuarta
  forma de [[M-06]]: un ❌ verdadero que nadie lee para la tubería igual que un ✅ falso la deja pasar.
