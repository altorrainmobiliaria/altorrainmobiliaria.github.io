/*
 * GATE — variables CSS que no existen.
 *
 * EL DEFECTO QUE CAZA. `box-shadow: var(--alt-neu-out)` con una variable que nadie declaró no es un
 * error: el navegador descarta la propiedad y sigue. La página se ve, el build pasa, los cuatro gates
 * pasan, y el elemento simplemente NO tiene sombra. Nadie se entera nunca.
 *
 * LO QUE COSTÓ. `/ingresar` se escribió como réplica fiel de su mockup (§89) usando `--alt-neu-out`,
 * `--alt-neu-in` y `--alt-line` — tres nombres INVENTADOS: los reales son `--alt-nm-up`, `--alt-nm-in`
 * y `--alt-hairline`. Resultado: el emblema «A» del login llevaba desde entonces sin relieve y los
 * separadores («o con tu correo») sin línea. La página se declaraba fiel al diseño y no lo era, y se
 * descubrió midiendo la sombra en el navegador, no leyendo el código.
 *
 * POR QUÉ CON FALLO EXPLÍCITO. `var(--x, algo)` SÍ es legítimo: el segundo argumento es el valor si
 * la variable no existe. Solo se marca `var(--x)` a secas, que es la forma que falla en silencio.
 *
 * ALCANCE HONESTO. Comprueba que la variable esté DECLARADA en alguna parte de `src/`, no que la
 * cascada la alcance en ese nodo concreto. Es el 90% del problema por el 10% del esfuerzo: el caso
 * real fue siempre «este nombre no existe en ningún sitio», no «existe pero no llega».
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(RAIZ, 'src');

/** Recorre `src/` y devuelve los archivos donde puede haber CSS. */
function archivos(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...archivos(ruta));
    else if (/\.(astro|css)$/.test(nombre)) salida.push(ruta);
  }
  return salida;
}

const lista = archivos(SRC);

// ── 1. Todo lo que está DECLARADO ────────────────────────────────────────────────────────────────
// Una declaración es `--nombre:` al principio de una propiedad. Se descarta lo que aparezca dentro de
// un `var(...)`, que es un USO, no una declaración.
const declaradas = new Set();
for (const ruta of lista) {
  const texto = readFileSync(ruta, 'utf8');
  for (const m of texto.matchAll(/(^|[;{\s])(--[\w-]+)\s*:/g)) declaradas.add(m[2]);
}

/**
 * Vacía los comentarios conservando los saltos de línea, para que los números de línea sigan
 * siendo los del archivo.
 *
 * Sin esto el gate señalaba `var(--surface)` escrito dentro de un comentario que EXPLICA lo que hace
 * el mockup — dos falsos positivos en su primera corrida. Y un gate que se equivoca es un gate que se
 * aprende a ignorar, que es peor que no tenerlo: la próxima vez que grite de verdad, nadie mira.
 */
function sinComentarios(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, (bloque) => bloque.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (linea, antes) => antes + ' '.repeat(linea.length - antes.length));
}

// ── 2. Todo lo que se USA sin valor de respaldo ───────────────────────────────────────────────────
const fallos = [];
for (const ruta of lista) {
  const lineas = sinComentarios(readFileSync(ruta, 'utf8')).split('\n');
  lineas.forEach((linea, i) => {
    // `var(--x)` sin coma. Con coma hay respaldo y no falla en silencio.
    for (const m of linea.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      if (!declaradas.has(m[1])) {
        fallos.push({ archivo: relative(RAIZ, ruta), linea: i + 1, nombre: m[1] });
      }
    }
  });
}

if (fallos.length) {
  console.error('❌ verify:tokens — variables CSS usadas y NUNCA declaradas:\n');
  for (const f of fallos) {
    console.error(`   ${f.archivo}:${f.linea}  →  var(${f.nombre})`);
  }
  console.error('\n   El navegador DESCARTA esa propiedad sin avisar: el estilo simplemente no se');
  console.error('   aplica y la pantalla se ve «casi bien». Comprueba el nombre real en');
  console.error('   `src/styles/tokens.css` (los neumórficos son `--alt-nm-*`, los bordes');
  console.error('   `--alt-hairline*`), o dale un respaldo explícito: `var(--x, #fff)`.');
  process.exit(1);
}

console.log(
  `✅ verify:tokens — ${declaradas.size} variable(s) declarada(s); ninguna usada sin declarar en ${lista.length} archivo(s).`,
);
