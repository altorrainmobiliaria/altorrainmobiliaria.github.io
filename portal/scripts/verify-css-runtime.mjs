/*
 * GATE — CSS acotado que nunca alcanza a los nodos que crea el JS (§117).
 *
 * EL DEFECTO QUE CAZA. Astro acota el CSS de un `<style>` añadiendo `data-astro-cid-XXXX` a los
 * elementos DE LA PLANTILLA y repitiendo ese atributo en cada selector: `.serp-msg` compila a
 * `.serp-msg[data-astro-cid-XXXX]`. Un nodo que el navegador crea en tiempo de ejecución
 * (`document.createElement`) NO lleva el atributo, así que la regla no le aplica jamás.
 *
 * POR QUÉ MERECE UN GATE Y NO UNA LECCIÓN. No rompe el build, no ensucia la consola, no falla
 * ningún test: la pantalla simplemente sale despintada. Se descubrió con el mensaje de «no
 * encontramos inmuebles» del catálogo público —sin tarjeta, sin centrar, 53px de alto en vez de
 * 157— y con las CINCO tablas del panel de gestión renderizando filas sin rejilla. Vivió cuatro
 * ADRs sin que nadie lo viera porque hasta entonces solo se había mirado el markup ESTÁTICO.
 *
 * QUÉ MIRA. Clases que un script asigna con `className = '...'` o escribe en un `class="..."` de
 * plantilla, y que además estén definidas en un `<style>` SIN `is:global` de una página que carga
 * ese script. `classList.add/toggle` NO cuenta: esas suelen ser banderas de estado sobre elementos
 * que ya venían en la plantilla —y por tanto ya llevan el atributo—, como `.gx-nav__item.is-on`.
 *
 * CÓMO SE ARREGLA UN HALLAZGO. O se marca la regla `:global(.clase)`, o —si la página tiene un
 * namespace propio y casi todo su DOM es de runtime— se globaliza el bloque entero y se documenta
 * por qué, que es lo que hace `gestion.astro`.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(RAIZ, 'src');

function archivos(dir, ext, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) archivos(p, ext, acc);
    else if (p.endsWith(ext)) acc.push(p);
  }
  return acc;
}

/** Clases que un script ASIGNA a nodos nuevos. Deliberadamente NO incluye `classList.add`. */
function clasesDeRuntime(codigo) {
  const out = new Set();
  for (const m of codigo.matchAll(/className\s*=\s*[`'"]([^`'"$]+)/g)) {
    for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  }
  // `class="..."` dentro de plantillas de string (innerHTML). Se ignora lo interpolado (`${…}`).
  for (const m of codigo.matchAll(/class=\\?["'`]([a-zA-Z][\w\- ]*)["'`\\]/g)) {
    for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  }
  /*
   * 🔴 CLASES QUE VAN POR HELPER — `el('div', 'mi-clase')`. Este gate NO las veía, y el módulo que lo
   * destapó aportaba CERO clases visibles y DIECISÉIS invisibles (§167). No es un caso raro: es lo que
   * sale de prohibir `innerHTML` (§31). Sin plantillas de string, el nombre de la clase deja de
   * aparecer en un `class="…"` y pasa a ser un ARGUMENTO — o sea que **la buena práctica volvía ciego
   * al gate**, que es la peor forma de quedarse ciego.
   * El patrón exige que el 1.er argumento sea un nombre de etiqueta en minúsculas, para no tragarse
   * cualquier par de cadenas de cualquier llamada.
   */
  for (const m of codigo.matchAll(/\(\s*[`'"][a-z][a-z0-9]*[`'"]\s*,\s*[`'"]([a-zA-Z][\w\- ]*)[`'"$]/g)) {
    for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  }
  return out;
}

/** Clases definidas en los `<style>` de una página que NO llevan `is:global`. */
function clasesAcotadas(pagina) {
  const out = new Set();
  for (const m of pagina.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
    if (/\bis:global\b/.test(m[1])) continue;
    // Fuera comentarios: `.gx-tr` citado en una explicación no es una regla.
    const css = m[2].replace(/\/\*[\s\S]*?\*\//g, '');
    for (const s of css.matchAll(/\.([a-zA-Z][\w-]+)/g)) {
      // Lo que ya está marcado a mano queda cubierto.
      if (!new RegExp(`:global\\([^)]*\\.${s[1]}\\b`).test(css)) out.add(s[1]);
    }
  }
  return out;
}

const scripts = new Map();
const fuentes = new Map();
const importa = new Map();
for (const f of archivos(join(SRC, 'scripts'), '.ts')) {
  if (f.endsWith('.test.ts')) continue;
  const codigo = readFileSync(f, 'utf8');
  const nombre = basename(f, '.ts');
  scripts.set(nombre, clasesDeRuntime(codigo));
  fuentes.set(nombre, codigo);
  importa.set(nombre, [...codigo.matchAll(/from\s+'\.\/([\w-]+)'/g)].map((m) => m[1]));
}

/**
 * Scripts que una página carga, INCLUIDOS los que llegan por import.
 *
 * La primera versión solo miraba las menciones literales de la página y se le escaparon dos de los
 * cuatro módulos de gestión: la página importa `gestion-alta-ui`, y es ÉSE quien importa la lista de
 * inmuebles y la de contratos. Un gate que solo mira la superficie aprueba lo que no comparó.
 */
function alcanzables(pagina) {
  const pend = [...scripts.keys()].filter((n) => pagina.includes(`scripts/${n}`));
  const vistos = new Set(pend);
  while (pend.length) {
    for (const hijo of importa.get(pend.pop()) ?? []) {
      if (scripts.has(hijo) && !vistos.has(hijo)) {
        vistos.add(hijo);
        pend.push(hijo);
      }
    }
  }
  return vistos;
}

const hallazgos = [];
for (const f of archivos(join(SRC, 'pages'), '.astro')) {
  const pagina = readFileSync(f, 'utf8');
  const acotadas = clasesAcotadas(pagina);
  if (!acotadas.size) continue;
  // Solo los scripts que ESTA página carga: una colisión de nombres entre páginas es otro problema.
  for (const nombre of alcanzables(pagina)) {
    const rotas = [...scripts.get(nombre)].filter((c) => acotadas.has(c)).sort();
    if (rotas.length) hallazgos.push({ pagina: relative(RAIZ, f), script: nombre, rotas });
  }
}

if (hallazgos.length) {
  console.error('❌ verify:css — CSS acotado que no alcanza a los nodos creados por JS:\n');
  for (const h of hallazgos) {
    console.error(`   ${h.pagina}  ←  src/scripts/${h.script}.ts`);
    console.error(`     ${h.rotas.length} clase(s): ${h.rotas.join(', ')}`);
  }
  console.error('\n   Astro compila `.x` a `.x[data-astro-cid-…]` y los nodos de runtime no llevan ese');
  console.error('   atributo. Marca la regla `:global(.x)` o globaliza el bloque y documenta por qué.');
  process.exit(1);
}

// ── Sonda 2: `:global()` dentro de un bloque que YA es global (§130) ────────────────────────────
//
// Por qué existe: `:global()` es una función de COMPILACIÓN, no un selector que el navegador
// entienda. Astro la resuelve en los `<style>` acotados… y la IGNORA en los `<style is:global>`,
// donde la deja escrita tal cual. El resultado es un selector inválido, y un selector inválido no
// falla: el navegador **descarta la regla entera, en silencio**.
//
// Lo pagó §130: una regla que ocultaba los formularios de escritura a quien solo tiene permiso de
// consulta quedó muerta. Compiló limpio, y los cuatro gates —este incluido— dijeron ✅. La sonda de
// arriba mira lo contrario (CSS acotado que no alcanza al JS); esta mira el exceso de globalidad.
const redundantes = [];
for (const f of archivos(join(SRC, 'pages'), '.astro').concat(archivos(join(SRC, 'components'), '.astro'))) {
  const texto = readFileSync(f, 'utf8');
  // Recorre cada bloque <style…> y solo acusa a los que se declaran globales.
  for (const m of texto.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
    if (!/\bis:global\b/.test(m[1])) continue;
    // Los COMENTARIOS se quitan antes de mirar: esta regla se explica a sí misma escribiendo
    // `:global()` en prosa, y un gate que se acusa por su propia documentación es un gate que se apaga.
    const css = m[2].replace(/\/\*[\s\S]*?\*\//g, ' ');
    const dentro = [...css.matchAll(/:global\s*\(/g)];
    if (dentro.length) redundantes.push({ archivo: relative(RAIZ, f), veces: dentro.length });
  }
}

if (redundantes.length) {
  console.error('❌ verify:css — `:global()` dentro de un `<style is:global>`:\n');
  for (const r of redundantes) console.error(`   ${r.archivo}  →  ${r.veces} vez/veces`);
  console.error('\n   Ahí Astro NO la resuelve: sale literal al CSS, el navegador no la entiende y');
  console.error('   DESCARTA LA REGLA ENTERA sin avisar. El bloque ya es global — quita el `:global()`.');
  process.exit(1);
}

// ── Sonda 3: un `id` que el script BUSCA y el markup no declara (§138) ─────────────────────────
//
// Por qué existe: `document.getElementById('x')` con un id que no está en la página devuelve `null`,
// y el estilo defensivo de este proyecto —`$('x')?.addEventListener(...)`— convierte eso en **nada**.
// No hay excepción, no hay aviso en consola: el control simplemente no hace nada. Renombrar un id en
// el markup y olvidar el script es de los descuidos más fáciles de cometer y más difíciles de ver.
//
// Es la familia de [[L-52]]: el fallo no rompe, **falla ABIERTO**. Se mira DENTRO de cada página,
// que es donde ocurre — el `<script>` y su markup viven en el mismo archivo.
const idsHuerfanos = [];
for (const f of archivos(join(SRC, 'pages'), '.astro')) {
  const src = readFileSync(f, 'utf8');
  const bloques = src.match(/<script[\s\S]*?<\/script>/g);
  if (!bloques) continue;
  const bloque = bloques.join('\n');
  const declarados = new Set([...src.matchAll(/\bid="([\w-]+)"/g)].map((m) => m[1]));

  /*
   * ⚠️ Y LOS MÓDULOS QUE LA PÁGINA CARGA, no solo su `<script>` inline. Esa era la mitad que
   * faltaba: el panel de gestión busca **63 ids** desde `src/scripts/gestion-*.ts`, y la primera
   * versión de esta sonda no miraba ni uno. Renombrar un id en el markup y olvidar el módulo habría
   * pasado en verde — que es justo el fallo que la sonda existe para cazar (§143).
   */
  const codigoDeModulos = [...alcanzables(src)].map((n) => fuentes.get(n) ?? '').join('\n');
  const todoElCodigo = `${bloque}\n${codigoDeModulos}`;

  const buscados = new Set([
    ...[...todoElCodigo.matchAll(/getElementById\(\s*'([\w-]+)'\s*\)/g)].map((m) => m[1]),
    // El atajo `const $ = (id) => …` lo definen la página y varios módulos. Se admite la forma con
    // genérico (`$<HTMLInputElement>('id')`), que es como lo escriben los módulos del panel.
    ...(/const \$ = [^\n]*\bid\b/.test(todoElCodigo)
      ? [...todoElCodigo.matchAll(/\$(?:<[^>]*>)?\(\s*'([\w-]+)'\s*\)/g)].map((m) => m[1])
      : []),
  ]);
  for (const id of buscados) {
    // Un id que el propio script ASIGNA en tiempo de ejecución no está en el markup, y es correcto.
    const loCrea = new RegExp(`\\.id = '${id}'`).test(todoElCodigo);
    if (!declarados.has(id) && !loCrea) idsHuerfanos.push({ archivo: relative(RAIZ, f), id });
  }
}
if (idsHuerfanos.length) {
  console.error('❌ verify:css — el script busca ids que la página NO declara:');
  console.error('');
  for (const h of idsHuerfanos) console.error(`   ${h.archivo}  →  getElementById('${h.id}')`);
  console.error('');
  console.error('   Devuelve `null`, el `?.` se lo traga, y el control queda MUERTO sin un solo aviso.');
  console.error('   Mira si el id se renombró en el markup, o si ese nodo todavía no existe.');
  process.exit(1);
}

const n = [...scripts.values()].reduce((a, s) => a + s.size, 0);
console.log(`✅ verify:css — ${scripts.size} script(s) y ${n} clase(s) de runtime: todas alcanzables.`);
console.log('✅ verify:css — sin `:global()` redundante en bloques ya globales.');
console.log(`✅ verify:css — todos los \`getElementById\` de las páginas tienen su nodo.`);
