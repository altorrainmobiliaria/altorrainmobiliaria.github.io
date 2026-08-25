/*
 * GATE — controles de la interfaz que NO HACEN NADA («botones fantasma»).
 *
 * EL DEFECTO QUE CAZA. Un `<button>` o un `<a href="#">` que nadie escucha. No falla, no avisa, no
 * ensucia la consola: se pulsa y no pasa nada. Desde fuera es indistinguible de un panel roto, y
 * quien lo pulsa concluye que el sistema está averiado — no que esa parte aún no existe.
 *
 * LO QUE COSTÓ. §126 («Sincronizar permisos del portal»: el runbook lo prometía y el botón no
 * existía) y, en una sola tarde, CUATRO más en el panel de gestión: tres entradas del menú lateral
 * (`leads`, `visitas`, `documentos`) que salían por un `return` mudo, y el «Ver todo →» de la tabla
 * de leads, que además saltaba al principio de la página. Ninguno de los cinco gates existentes los
 * veía, porque desde el punto de vista del código no hay nada roto: falta algo.
 *
 * DOS COSAS QUE ESTE GATE APRENDIÓ EN SU PRIMERA CORRIDA, y que son la diferencia entre servir y
 * gritar en falso:
 *
 *   1. **El CSS no es un manejador.** La primera versión leía el `.astro` entero, así que `.gx-link
 *      { … }` dentro del `<style>` hacía pasar por «escuchado» a un enlace que no escucha nadie.
 *      Ahora solo se mira el `<script>`.
 *   2. **Mencionar una clase no es escucharla.** `wa.className = 'gx-link'` es una ASIGNACIÓN, y
 *      contarla como oyente ocultó justamente el «Ver todo» muerto. Solo cuentan los contextos en
 *      los que una clase se USA para encontrar el elemento: `querySelector(.x)`, `closest`,
 *      `matches`, `getElementsByClassName`.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(RAIZ, 'src');

/**
 * La galería de componentes es un MUESTRARIO: sus botones son especímenes de estilo, no controles.
 * Se excluye por nombre y con su razón escrita, que es la única forma honesta de excluir algo.
 */
const NO_APLICA = new Set(['design-system.astro']);

function archivos(dir, ext, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) archivos(p, ext, acc);
    else if (p.endsWith(ext)) acc.push(p);
  }
  return acc;
}

/** Solo el JavaScript: de un `.astro` interesa su `<script>`, nunca su `<style>` ni su markup. */
function soloJs(f) {
  const t = readFileSync(f, 'utf8');
  if (!f.endsWith('.astro')) return t;
  return (t.match(/<script[\s\S]*?<\/script>/g) || []).join('\n');
}

const js = [
  ...archivos(join(SRC, 'scripts'), '.ts'),
  ...archivos(join(SRC, 'pages'), '.astro'),
  ...archivos(join(SRC, 'components'), '.astro'),
]
  .filter((f) => !f.endsWith('.test.ts'))
  .map(soloJs)
  .join('\n');

/**
 * ¿Alguien BUSCA el elemento por este id?
 *
 * ⚠️ Incluye `closest('#id')` y `matches('#id')`. Son el patrón de DELEGACIÓN —un solo oyente en el
 * documento que pregunta «¿el clic vino de este botón?»— y es como está cableado medio panel legacy.
 * Sin esta rama, el barrido acusaba a los tres botones «+ Nuevo» de un panel que los tiene
 * perfectamente vivos. Tercer falso positivo de esta familia; los tres, buscando al oyente donde no
 * mira nadie.
 */
const porId = (id) =>
  new RegExp(
    `getElementById\\(\\s*['"\`]${id}['"\`]|\\$\\(\\s*['"\`]#?${id}['"\`]|querySelector[All]*\\([^)]*#${id}\\b|closest\\(\\s*['"\`]#${id}['"\`]|matches\\(\\s*['"\`]#${id}['"\`]`,
  ).test(js);

/** ¿Alguien BUSCA elementos por esta clase? Mencionarla no cuenta: hay que estar seleccionando. */
const porClase = (c) =>
  new RegExp(
    `querySelector[All]*\\([^)]*\\.${c}\\b|closest\\(\\s*['"\`]\\.${c}\\b|matches\\(\\s*['"\`]\\.${c}\\b|getElementsByClassName\\(\\s*['"\`]${c}['"\`]`,
  ).test(js);

/**
 * ¿Alguien lee este `data-*`? En JavaScript se lee en camelCase (`data-mi-cosa` → `dataset.miCosa`)
 * o como selector de atributo.
 *
 * ⚠️ El selector puede llevar VALOR: `[data-map-zoom="in"]`. La primera versión exigía el corchete
 * de cierre pegado (`[data-map-zoom]`) y por eso acusó a los dos botones de zoom del mapa, que sí
 * están cableados. Segundo falso positivo de este gate en su primera corrida, y el segundo corregido
 * antes de cablearlo: un gate que acusa a un inocente se desactiva solo, en la cabeza de quien lo lee.
 */
const porDato = (d) => {
  const camel = d.replace(/-(\w)/g, (_, x) => x.toUpperCase());
  return new RegExp(`dataset\\.${camel}\\b|\\[data-${d}[\\]=]|['"\`]data-${d}['"\`]`).test(js);
};

function escuchado(attrs) {
  const id = attrs.match(/\bid="([\w-]+)"/)?.[1];
  const clases = [...attrs.matchAll(/class="([^"]*)"/g)].flatMap((c) => c[1].split(/\s+/)).filter(Boolean);
  const datos = [...attrs.matchAll(/\bdata-([\w-]+)=/g)].map((d) => d[1]);
  return (id && porId(id)) || clases.some(porClase) || datos.some(porDato);
}

const muertos = [];

for (const f of archivos(join(SRC, 'pages'), '.astro')) {
  if (NO_APLICA.has(basename(f))) continue;
  const src = readFileSync(f, 'utf8');
  const pagina = relative(RAIZ, f);
  const limpio = (t) => t.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 46);

  for (const m of src.matchAll(/<button\b([^>]*)>([\s\S]{0,120}?)<\/button>/g)) {
    // Un `type="submit"` lo recoge el `submit` de su formulario, no un `click` propio.
    if (/type="submit"/.test(m[1])) continue;
    if (!escuchado(m[1])) muertos.push({ pagina, tipo: 'button', texto: limpio(m[2]) });
  }

  // `href="#"` es la firma del enlace que en realidad quería ser un botón.
  for (const m of src.matchAll(/<a\b([^>]*href="#"[^>]*)>([\s\S]{0,120}?)<\/a>/g)) {
    if (!escuchado(m[1])) muertos.push({ pagina, tipo: 'a href="#"', texto: limpio(m[2]) });
  }
}

if (muertos.length) {
  console.error('❌ verify:controles — controles que NO HACEN NADA al pulsarlos:');
  console.error('');
  for (const d of muertos) console.error(`   ${d.pagina}  ${d.tipo.padEnd(11)} «${d.texto}»`);
  console.error('');
  console.error('   Un control que no responde no se distingue de un panel roto (§126). Tres salidas:');
  console.error('   cablearlo · quitarlo · o dejar que DIGA por qué todavía no puede hacer nada.');
  console.error('   Lo que no vale es el silencio.');
  process.exit(1);
}

console.log('✅ verify:controles — ningún botón ni enlace-ancla sin quien lo escuche.');
