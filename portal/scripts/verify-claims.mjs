/*
 * GATE — cifras que se leen como MEDICIÓN en páginas públicas (§123).
 *
 * EL DEFECTO QUE CAZA. Las réplicas de mockup llegan con reseñas, notas, conteos de inventario y
 * distinciones de relleno. En cuanto la página es alcanzable —enlazada desde un menú, compartible—
 * dejan de ser *placeholder*: un «4.97 · 128 reseñas» afirma que 128 personas puntuaron algo, y un
 * «42 propiedades en Bocagrande» afirma un inventario. Fabricarlas es publicidad engañosa (Ley 1480,
 * arts. 29-30) y contradice la regla cero-demo del proyecto ([[L-29]]).
 *
 * POR QUÉ UN GATE Y NO UNA LECCIÓN. No rompe nada: compila, renderiza y se ve bien. Se descubrió a
 * mano y costó dos barridos completos encontrarlo todo — en `estancias` (anfitrión y dos reseñas
 * firmadas) y en la HOME (nueve notas, cinco conteos de reseñas, once conteos de inventario y un
 * «+7% de valorización» sin fuente). Volverá con la próxima réplica de mockup.
 *
 * CÓMO SE APRUEBA UNA CIFRA. Declarándola en `x-claimsVerificados` del manifest, con la fuente que la
 * respalda. Eso es el gate entero: no prohíbe cifras, obliga a decir de dónde salen. Una cifra que
 * nadie quiere firmar es exactamente la que no debería estar publicada.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(RAIZ, 'src');

function astro(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) astro(p, acc);
    else if (p.endsWith('.astro')) acc.push(p);
  }
  return acc;
}

/**
 * Deja solo lo que un visitante puede LEER.
 *
 * Sin esto el gate es inservible: la primera versión marcó decenas de «4.5» y «5.2» que eran
 * coordenadas de un `<path d="…">` de una estrella. Un gate que grita en cada corrida se apaga en
 * una semana, y entonces no protege de nada.
 */
function soloTextoVisible(src) {
  return src
    .replace(/---[\s\S]*?---/, (m) => m) // el frontmatter SÍ importa: ahí viven los arrays de datos
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<style>[\s\S]*?<\/style>/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    // Comentarios `//` de cualquier posición, no solo al principio de línea: los tipos de los
    // componentes documentan su formato con ejemplos (`rating?: string;  // "4.99"`) y el gate los
    // leía como afirmaciones. Se exige espacio o inicio de línea antes de `//` para no destrozar
    // una URL, donde las barras van pegadas a los dos puntos del protocolo.
    .replace(/(^|\s)\/\/[^\n]*/g, ' ');
}

const PATRONES = [
  { id: 'reseñas', re: /\b\d[\d.,]*\s*(?:reseñas|resenas|opiniones|valoraciones|testimonios)\b/gi,
    que: 'un conteo de reseñas afirma que ese número de personas opinó' },
  { id: 'nota', re: /\b(?:rating|nota|puntuacion|puntuación)\s*[:=]\s*['"`]?[0-5][.,]\d/gi,
    que: 'una nota media afirma que existen calificaciones detrás' },
  { id: 'inventario', re: /\b\d{2,}\+?\s*(?:propiedades|inmuebles|clientes|familias|operaciones|aliados)\b/gi,
    que: 'un conteo de inventario o de clientes es comprobable — y hoy no cuadra' },
  { id: 'rendimiento', re: /[+-]\s?\d{1,2}(?:[.,]\d)?\s?%\s*(?:de\s+)?(?:valorizaci|rentabilid|retorno|roi)/gi,
    que: 'una cifra de mercado sin fuente pasa a ser NUESTRA afirmación' },
  { id: 'distinción', re: /\b(?:superanfitri[oó]n|favorito entre hu[eé]spedes|l[ií]der del mercado|n[uú]mero 1)\b/gi,
    que: 'una distinción que nadie ha otorgado' },
];

let manifest = {};
const mp = join(RAIZ, '..', 'docs', '.brain-manifest.json');
if (existsSync(mp)) {
  try {
    manifest = JSON.parse(readFileSync(mp, 'utf8'));
  } catch {
    /* el schema del manifest lo valida su propio gate */
  }
}
// `x-`: prefijo del kernel v1.14.0 para la config de gates propios de un repo. Sin él, el gate
// #15 del manifest marca la clave como desconocida — y tiene razón: no es suya.
const APROBADAS = new Set((manifest['x-claimsVerificados'] || []).map((c) => (typeof c === 'string' ? c : c.cifra)));

const hallazgos = [];
for (const f of [...astro(join(SRC, 'pages')), ...astro(join(SRC, 'components'))]) {
  const texto = soloTextoVisible(readFileSync(f, 'utf8'));
  for (const p of PATRONES) {
    for (const m of texto.matchAll(p.re)) {
      const cifra = m[0].replace(/\s+/g, ' ').trim();
      if (APROBADAS.has(cifra)) continue;
      const linea = texto.slice(0, m.index).split('\n').length;
      hallazgos.push({ f: relative(RAIZ, f), linea, cifra, tipo: p.id, que: p.que });
    }
  }
}

if (hallazgos.length) {
  console.error('❌ verify:claims — cifras que se leen como MEDICIÓN y nadie ha respaldado:\n');
  for (const h of hallazgos) {
    console.error(`   ${h.f}:${h.linea}  «${h.cifra}»  [${h.tipo}]`);
    console.error(`     ${h.que}`);
  }
  console.error('\n   O la cifra es real y se declara en `x-claimsVerificados` del manifest CON SU FUENTE,');
  console.error('   o se quita. Si viene de un mockup y aún no hay datos: haz la sección dependiente de');
  console.error('   datos y pásale una lista vacía — el diseño se conserva y la afirmación desaparece.');
  process.exit(1);
}

console.log(`✅ verify:claims — ninguna cifra sin respaldo en las páginas públicas (${APROBADAS.size} declarada(s) como verificada).`);
