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

function porExtension(dir, ext, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) porExtension(p, ext, acc);
    else if (p.endsWith(ext)) acc.push(p);
  }
  return acc;
}
const astro = (dir, acc = []) => porExtension(dir, '.astro', acc);

/**
 * §195 — El gate corría en verde sobre el sitio donde MÁS afirmaciones hay.
 *
 * Solo recogía `.astro`, así que los artículos del journal —markdown en `src/content`— no los abría
 * NUNCA. Y el journal es justo la parte del portal cuya premisa impresa es «cada afirmación, con su
 * norma citada»: prosa larga, persuasiva, publicada en el mismo sitio y compartible. Si una frase de
 * prueba social fabricada («líderes del mercado», «4,9 en reseñas») iba a colarse en algún sitio, era
 * ahí, no en un componente. Familia de [[L-52]]: un gate verde sobre archivos que nunca abre.
 */
const contenido = (acc = []) => porExtension(join(SRC, 'content'), '.md', acc);

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
  /*
   * Añadido tras encontrar en la HOME cuatro artículos del Journal con titular, categoría, fecha
   * («12 feb 2026») y tiempo de lectura («8 min de lectura») — y los cuatro enlazando a una página
   * de «próximamente». Ninguno de los cinco patrones de arriba lo veía: no es una cifra de negocio,
   * es una firma EDITORIAL, y engaña igual. El tiempo de lectura es la señal limpia: solo aparece
   * pegado a un artículo que alguien escribió y midió.
   */
  { id: 'editorial', re: /\b\d{1,3}\s*min(?:utos)?\s+de\s+lectura\b/gi,
    que: 'un tiempo de lectura afirma que ese artículo existe y está escrito' },
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
const ESCANEADOS = [...astro(join(SRC, 'pages')), ...astro(join(SRC, 'components')), ...contenido()];
for (const f of ESCANEADOS) {
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

// El número de archivos NO es decoración: es lo único que distingue «lo revisé» de «no hice nada»
// (§195 — este gate estuvo verde sin abrir el journal, y el ✅ se veía idéntico).
console.log(
  `✅ verify:claims — ${ESCANEADOS.length} archivo(s) leídos (páginas, componentes y contenido): ` +
    `ninguna cifra sin respaldo (${APROBADAS.size} declarada(s) como verificada).`,
);
/*
 * ── SONDA 2: LA PALABRA PROHIBIDA, RECLAMADA COMO NUESTRA (§173) ───────────────────────────────
 *
 * QUÉ CAZA. Llamar **«avalúo»** a nuestra estimación. En Colombia el avalúo es actividad REGULADA:
 * lo firma quien está inscrito en el Registro Abierto de Avaluadores (Ley 1673 de 2013), y usar la
 * palabra sin serlo no es una imprecisión de marketing — es atribuirse una calidad que no se tiene.
 * Por eso §105 retiró «Avalúos» del menú y nuestro producto se llama **Rango ALTORRA**.
 *
 * 🔴 POR QUÉ HACE FALTA LA SONDA, si la regla ya estaba escrita. Estaba en CUATRO sitios —el gate B13
 * de `42-LEGAL`, `redirects.ts`, `/nosotros` y `/publicar`— y el panel decía igualmente *«Tu avalúo
 * fue actualizado»* en sus avisos. Nadie lo vigilaba. Es el mismo patrón de §162, §163 y §172, cuatro
 * veces en un solo día: **una regla escrita da la sensación de estar aplicada**.
 *
 * ⚠️ NO PROHÍBE LA PALABRA, y esa distinción es todo el diseño. Hablar del avalúo —explicar qué es,
 * citar el art. 18 de la Ley 820, o decir que nosotros NO lo hacemos— es correcto y necesario: el
 * Journal tiene un artículo entero dedicado a eso. Lo que se caza es **reclamarlo como propio**: «tu
 * avalúo», «nuestro avalúo», «avalúo ALTORRA», «avalúo gratis». Un gate que prohibiera la palabra
 * obligaría a borrar precisamente el artículo que explica por qué no la usamos.
 */
const RECLAMO_AVALUO = /(?:\b(?:tu|su|nuestro|nuestra|mi)\s+aval[uú]os?\b|\baval[uú]os?\s+(?:ALTORRA|gratis)\b)/gi;

const reclamos = [];
for (const f of [...astro(join(SRC, 'pages')), ...astro(join(SRC, 'components'))]) {
  const texto = soloTextoVisible(readFileSync(f, 'utf8'));
  for (const m of texto.matchAll(RECLAMO_AVALUO)) {
    const antes = texto.slice(Math.max(0, m.index - 80), m.index);
    // Entre « » se está CITANDO lo que no se debe decir, para criticarlo.
    if (/«[^»]*$/.test(antes)) continue;
    reclamos.push({
      f: relative(RAIZ, f),
      linea: texto.slice(0, m.index).split('\n').length,
      frase: m[0].replace(/\s+/g, ' ').trim(),
    });
  }
}

if (reclamos.length) {
  console.error('❌ verify:claims — «avalúo» reclamado como servicio PROPIO (Ley 1673, gate B13):\n');
  for (const r of reclamos) console.error(`   ${r.f}:${r.linea}  «${r.frase}»`);
  console.error('\n   El avalúo lo firma quien está inscrito en el RAA. Lo nuestro se llama Rango ALTORRA.');
  console.error('   Hablar DEL avalúo está bien; reclamarlo como propio, no (§173).');
  process.exit(1);
}
console.log('✅ verify:claims — nadie reclama un «avalúo» como servicio propio (Ley 1673).');
