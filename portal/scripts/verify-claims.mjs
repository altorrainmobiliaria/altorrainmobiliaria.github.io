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
  { id: 'inventario', re: /\b[1-9]\d+\+?\s*(?:propiedades|inmuebles|arriendos|arrendamientos|estancias|alojamientos|clientes|familias|operaciones|aliados)\b/gi,
    que: 'un conteo de inventario o de clientes es comprobable — y hoy no cuadra' },
  /*
   * ⚠️ EL MISMO CONTEO, ESCRITO AL REVÉS (§263). El patrón de arriba exige el número ANTES del
   * sustantivo («128 propiedades»), y la home lo escribe después: «Ver arriendos <b>83</b>». Ese 83
   * llevaba ahí sin que nadie lo congelara ni lo viera, al lado de dos hermanos que SÍ están en la
   * lista congelada — o sea que el gate daba por cubierta una familia que cubría a medias.
   * 🎯 Un patrón que solo conoce UNA de las formas en que algo se escribe cuenta de menos, y lo
   * que no ve es justo lo que nadie revisa a mano.
   */
  /*
   * 📏 `[1-9]\d+` y no `\d{2,}`: el segundo casaba «04 Estancias» —el rótulo del paso 4 del
   * «cómo funciona»— como si fuera un inventario. Un conteo no se escribe con cero a la izquierda;
   * un ordinal maquetado, casi siempre sí. Sin esta distinción el gate gritaba sobre algo correcto,
   * y un gate que grita sobre lo correcto enseña a ignorarlo entero.
   */
  { id: 'inventario-invertido',
    re: /\b(?:propiedades|inmuebles|arriendos|arrendamientos|estancias|alojamientos|aliados)\s+[1-9]\d+\+?\b/gi,
    que: 'un conteo de inventario escrito DESPUÉS del sustantivo afirma exactamente lo mismo' },
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
  /*
   * ⚠️ `superficie: 'fuente'` — y el motivo es que este patrón ya GANÓ. Nació (§147) cuando la home
   * mostraba cuatro tarjetas con tiempo de lectura que enlazaban a un «próximamente»; hoy el journal
   * está publicado y esos artículos existen, así que en el HTML servido un «5 min de lectura» es una
   * afirmación VERDADERA: 15 de sus 24 coincidencias eran artículos reales. Se queda vigilando la
   * fuente —donde vive el dato de las tarjetas— y se retira del barrido de lo servido. Un patrón que
   * grita sobre lo que ya se arregló enseña a ignorar al gate entero.
   */
  { id: 'editorial', superficie: 'fuente', re: /\b\d{1,3}\s*min(?:utos)?\s+de\s+lectura\b/gi,
    que: 'un tiempo de lectura afirma que ese artículo existe y está escrito' },
  /*
   * §215 encontró en el HERO de la home «8–11% ROI en USD» y en `/publicar` «98% clientes
   * satisfechos» y «38 días promedio de venta». Ninguno de los patrones de arriba los veía, y no por
   * falta de imaginación: el de `rendimiento` exige un signo y UN número («+12%»), así que un RANGO
   * («8–11%») se le escapa; y el de `inventario` exige el número pegado al sustantivo, así que un
   * porcentaje en medio («98% clientes») lo rompe. Tres formas más, medidas sobre el sitio real.
   */
  { id: 'rango-rendimiento', re: /\b\d{1,2}\s*[-–—a]\s*\d{1,2}\s?%\s*(?:de\s+)?(?:valorizaci|rentabilid|retorno|roi)/gi,
    que: 'un RANGO de rentabilidad es una medición de mercado, y sin fuente pasa a ser nuestra' },
  { id: 'porcentaje-negocio', re: /\b\d{1,3}(?:[.,]\d)?\s?%\s*(?:de\s+)?(?:clientes|propietarios|inquilinos|usuarios)\s+(?:satisfech|content|recomend)/gi,
    que: 'un porcentaje de satisfacción afirma que existe una medición detrás' },
  { id: 'promedio', re: /\b\d{1,4}\s*(?:d[ií]as?|horas?|meses?|semanas?)\s+(?:de\s+)?promedio|promedio\s+(?:de\s+\w+\s+)?(?:en\s+)?\d{1,4}\s*(?:d[ií]as?|horas?|meses?)/gi,
    que: 'un promedio afirma que se midieron muchos casos — o es una promesa disfrazada de dato' },
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
/*
 * DEUDA CONGELADA, con el contrato de siempre: solo puede BAJAR y una cifra NUEVA rompe el CI.
 * Estas cuatro las encontró §215 a mano en el sitio construido y **no se pueden quitar desde aquí**:
 * salen de un mockup aprobado, y retirarlas cambia el diseño de dos pantallas. La decisión es de
 * Daniel (citar la fuente, o sustituirlas por lo verificable) y está en su brief. Congelarlas es lo
 * que permite que el gate exista HOY en vez de esperar al arreglo: sin esto, añadir los patrones
 * dejaba el repositorio en rojo con una salida que exige mockup.
 */
const DEUDA_DECLARADA = [
  // — Las dos del HERO de la home (§215.1). Sin fuente citable; quitarlas cambia el diseño de la
  //   primera pantalla, así que la decisión (citar o sustituir) es del dueño y está en su brief.
  ['+12% valorizaci', 'hero de la home: medición de mercado sin fuente — §215.1, decide el dueño'],
  ['8–11% ROI', 'hero de la home: rango de rentabilidad sin fuente — §215.1, decide el dueño'],
  // — Las tres de `/publicar` (§215.2), en la página donde un propietario decide confiarnos su
  //   inmueble. ALTORRA no ha cerrado 1.200 inmuebles ni tiene medición de satisfacción.
  ['200 inmuebles', '/publicar: «+1.200 inmuebles cerrados», estadística inventada — §215.2'],
  ['38 días promedio', '/publicar: promedio de venta sin medición detrás — §215.2'],
  ['98% clientes satisfech', '/publicar: satisfacción inventada — §215.2, y /nosotros promete lo contrario'],
  // — Datos de MUESTRA del catálogo vacío. No son afirmaciones fabricadas a mano: son el relleno
  //   que el paso 5.3 del cutover retira cuando entre el inventario real (§213-§214, callejón «los
  //   datos del portal son DEMO»). Se congelan aquí para que el gate pueda existir antes del cutover.
  ['128 propiedades', 'home: conteo de muestra; el catálogo está vacío — sale en el cutover'],
  ['312 inmuebles', 'home (mapa): conteo de muestra — sale en el cutover'],
  // El tercero de la familia, y el que el patrón no veía por estar escrito al revés (§263).
  ['arriendos 83', 'home: conteo de muestra del enlace a /arrendar — sale en el cutover, con sus dos hermanos'],
  ['48 Inmuebles', '/gestion: panel tras autenticación con datos de muestra — sale en el cutover'],
];
const DEUDA = new Map(DEUDA_DECLARADA);

const APROBADAS = new Set((manifest['x-claimsVerificados'] || []).map((c) => (typeof c === 'string' ? c : c.cifra)));

/*
 * ── LA SUPERFICIE SERVIDA, no solo la fuente (§224) ────────────────────────────────────────────
 *
 * §215 encontró a mano, en el sitio construido, cuatro cifras que ESTE gate daba por limpias. La
 * causa no era el patrón: era la superficie. En la fuente, una cifra y su etiqueta viven en campos
 * DISTINTOS de un objeto —`{ n: '+1.200', l: 'inmuebles cerrados' }`— así que ningún patrón que
 * exija el número pegado al sustantivo puede verlas. En el HTML servido están juntas, porque es
 * justo así como las lee el visitante.
 *
 * 🎯 Un gate sobre la fuente comprueba lo que escribimos; el daño lo hace lo que se SIRVE. Se barren
 * las dos: la fuente caza lo que aún no se ha construido, el HTML caza lo que el build compone.
 * Si no hay build, se dice en voz alta — un barrido que no ocurre no puede pasar en silencio.
 */
function htmlServido(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) htmlServido(p, acc);
    else if (p.endsWith('.html')) acc.push(p);
  }
  return acc;
}
const DIST = join(RAIZ, 'dist', 'client');
const SERVIDOS = htmlServido(DIST);

function textoDeHtml(src) {
  return src
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

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

/*
 * ⚠️ UN `dist/` RANCIO ES PEOR QUE NO TENERLO. `verify:build` no construye: inspecciona. Así que en
 * la cadena local este barrido podía correr sobre HTML de hace tres commits y dar VERDE — un ✅ sobre
 * una superficie que ya no existe, que es exactamente la clase de mentira que este gate persigue.
 * Se compara la fecha del fuente más nuevo contra la del HTML más nuevo: si el fuente va por delante,
 * se ROMPE en vez de tranquilizar. En CI no salta nunca, porque allí el build va justo antes.
 */
const masNuevo = (fs) => fs.reduce((max, f) => Math.max(max, statSync(f).mtimeMs), 0);
if (SERVIDOS.length) {
  const fuenteMs = masNuevo(ESCANEADOS);
  const servidoMs = masNuevo(SERVIDOS);
  if (fuenteMs > servidoMs) {
    const horas = ((fuenteMs - servidoMs) / 3.6e6).toFixed(1);
    console.error(`❌ verify:claims — el HTML de \`dist/\` es más VIEJO que la fuente (${horas} h de desfase).`);
    console.error('   Barrer un build rancio da un ✅ sobre una superficie que ya no existe.');
    console.error('   Corre `npm run build` y repite. (En CI no pasa: el build va justo antes.)');
    process.exit(1);
  }
}

for (const f of SERVIDOS) {
  const texto = textoDeHtml(readFileSync(f, 'utf8'));
  for (const p of PATRONES.filter((x) => x.superficie !== 'fuente')) {
    for (const m of texto.matchAll(p.re)) {
      const cifra = m[0].replace(/\s+/g, ' ').trim();
      if (APROBADAS.has(cifra) || DEUDA.has(cifra)) continue;
      hallazgos.push({ f: relative(RAIZ, f), linea: 0, cifra, tipo: p.id, que: p.que });
    }
  }
}

/*
 * 🚨 PROYECTOS DE OBRA NUEVA SERVIDOS SIN RESPALDO (§270) — el hueco que este gate no veía.
 *
 * Los patrones de arriba buscan CIFRAS, y un proyecto inventado no lleva ninguna: lleva un NOMBRE y
 * una DIRECCIÓN. La portada servía seis —MAREA, SERENA, CLAUSTRO 1620, ALTAMAR, BAHÍA NORTE y
 * MURALLA LOFT—, dos con badge «Preventa», bajo el titular «Obra nueva firmada ALTORRA». Este gate
 * pasaba en verde porque no había un solo dígito que casar.
 *
 * 🎯 Un nombre de proyecto + una dirección + «Preventa» es una OFERTA, y afirma MÁS que cualquier
 * conteo: que ese desarrollo existe y que es nuestro. Y uno de los seis rozaba el nombre de un
 * desarrollo REAL de Cartagena — además de engañoso (Ley 1480, arts. 29-30), riesgo de marca.
 *
 * CÓMO SE APRUEBA: igual que una cifra — declarando el proyecto en `x-proyectosVerificados` del
 * manifest con su fuente. No prohíbe publicar obra nueva; obliga a decir de dónde salió.
 */
const PROYECTOS_OK = new Set(
  (manifest['x-proyectosVerificados'] || []).map((p) => (typeof p === 'string' ? p : p.nombre)),
);
for (const f of SERVIDOS) {
  const html = readFileSync(f, 'utf8');
  const tarjetas = (html.match(/class="alt-projcard"/g) || []).length;
  if (!tarjetas) continue;
  const nombres = [...html.matchAll(/class="alt-projcard__name"[^>]*>([^<]{1,60})</g)].map((m) => m[1].trim());
  const sinRespaldo = nombres.filter((n) => !PROYECTOS_OK.has(n));
  // Tarjetas que se sirven pero cuyo nombre no se puede leer cuentan como sin respaldo: un gate que
  // no puede LEER lo que juzga no debe aprobarlo.
  if (sinRespaldo.length || !nombres.length) {
    hallazgos.push({
      f: relative(RAIZ, f),
      linea: 0,
      cifra: sinRespaldo.length ? sinRespaldo.join(' · ') : `${tarjetas} tarjeta(s) de proyecto sin nombre legible`,
      tipo: 'proyecto-sin-respaldo',
      que: 'una ficha de obra nueva afirma que ese desarrollo existe y es nuestro',
    });
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
  `✅ verify:claims — ${ESCANEADOS.length} archivo(s) de fuente + ${SERVIDOS.length} de HTML SERVIDO: ` +
    `ninguna cifra nueva sin respaldo (${APROBADAS.size} verificada(s), ${DEUDA.size} congelada(s) con motivo).` +
    (SERVIDOS.length ? '' : ' ⚠️ SIN build: el barrido de lo servido NO corrió (corre `verify:build` antes).'),
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

/*
 * ── SONDA: NINGUNA FUENTE DEL JOURNAL SIN VERIFICAR (§236) ──────────────────────────
 *
 * QUÉ CAZA. Una URL de norma en el frontmatter `fuentes:` que nadie ha comprobado que exista.
 *
 * POR QUÉ HACE FALTA. El 27-ago se escribió un artículo citando «Ley 1369 de 2009» con el
 * identificador `norma.php?i=38337` — **inventado**. La página responde «la norma puede que ya no
 * esté disponible o se ha utilizado un enlace erróneo». Nada lo habría detectado: el build pasa, el
 * esquema solo exige que sea una URL bien formada, y el artículo se ve impecable. Publicar una
 * fuente rota en un texto legal, en un sitio cuyo eslogan es «Seguridad, Legalidad y Confianza», es
 * el peor sitio posible para este descuido. Es [[M-30]] —el identificador escrito de memoria— en su
 * forma más cara.
 *
 * POR QUÉ UNA LISTA Y NO UNA PETICIÓN DE RED. Un gate que llama a `.gov.co` falla el día que el CI
 * no tiene salida, o que el portal del Estado está caído — y un gate que falla por motivos ajenos
 * enseña a ignorarlo. La lista convierte «lo comprobé una vez» en algo que el repo RECUERDA: para
 * añadir una fuente hay que abrirla, y añadirla aquí es la constancia de haberlo hecho.
 */
const VERIFICADAS = new Map([
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=8738', 'Ley 820 de 2003 — arrendamiento de vivienda urbana'],
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4276', 'Ley 527 de 1999 — mensajes de datos y firma digital'],
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=11254', 'Decreto 51 de 2004 — reglamenta la Ley 820 (matrícula e intermediación)'],
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=77216', 'Decreto 1077 de 2015 — DUR del sector Vivienda, Ciudad y Territorio'],
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=10482', 'Decreto 3130 de 2003 — reglamenta el art. 15 de la Ley 820 (garantías)'],
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=6968', 'Ley 223 de 1995 — racionalización tributaria; impuesto de registro'],
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49731', 'Ley 1579 de 2012 — Estatuto de Registro de Instrumentos Públicos'],
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=53881', 'Ley 1673 de 2013 — actividad del avaluador y el RAA'],
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=172558', 'Ley 2068 de 2020 — modifica la Ley General de Turismo'],
  ['https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=175266', 'Decreto 1836 de 2021 — RNT y plataformas de servicios turísticos'],
  [
    'https://www.corteconstitucional.gov.co/relatoria/2015/c-385-15.htm',
    'Sentencia C-385/15 — actividad avaluadora y reserva de ley estatutaria',
  ],
  [
    'https://normograma.dian.gov.co/dian/compilacion/docs/ley_0300_1996.htm',
    'Ley 300 de 1996 — Ley General de Turismo',
  ],
  [
    'https://www.bolivar.gov.co/web/seccion/normatividad/',
    'Normatividad de la Gobernación de Bolívar — donde vive la ordenanza tributaria vigente',
  ],
]);

/*
 * Lo que NO se pudo comprobar, dicho en voz alta. Una fuente aquí NO bloquea —el enlace puede estar
 * perfecto y el problema ser del otro lado— pero tampoco hereda el ✅ de las demás: el gate imprime
 * cuántas hay. Es la regla 1 de [[L-59]]: si un lado no se puede LEER, ese par no es verificable, y
 * callarlo es lo que convierte un ✅ en una afirmación falsa.
 */
const NO_COMPROBABLES = new Map([
  [
    'https://www.secretariasenado.gov.co/senado/basedoc/codigo_comercio_pr041.html',
    'el host rechazó la conexión (ECONNREFUSED) el 2026-08-27; reintentar',
  ],
]);

const sinVerificar = [];
const pendientes = [];
let fuentesVistas = 0;
for (const f of contenido()) {
  const texto = readFileSync(f, 'utf8');
  const fm = texto.split('---')[1] ?? '';
  for (const m of fm.matchAll(/^\s*url:\s*'([^']+)'/gm)) {
    fuentesVistas += 1;
    if (VERIFICADAS.has(m[1])) continue;
    if (NO_COMPROBABLES.has(m[1])) {
      pendientes.push(`${m[1]} — ${NO_COMPROBABLES.get(m[1])}`);
      continue;
    }
    sinVerificar.push(`${relative(RAIZ, f)} → ${m[1]}`);
  }
}

if (sinVerificar.length) {
  console.error('');
  console.error('❌ verify:claims — fuente(s) del Journal que nadie ha comprobado que existan:');
  console.error('');
  for (const x of sinVerificar) console.error(`   ${x}`);
  console.error('');
  console.error('   Ábrela. Si la norma es la que dices, añádela a VERIFICADAS con su nombre; si no,');
  console.error('   corrige el enlace o retira la fuente. Un identificador de norma escrito de');
  console.error('   memoria es un identificador inventado (M-30), y aquí se publica como fuente.');
  process.exit(1);
}

console.log(
  `✅ verify:claims — ${fuentesVistas} fuente(s) citadas en ${contenido().length} artículo(s), ` +
    `contra ${VERIFICADAS.size} URL(s) abiertas y confirmadas una por una.`,
);
for (const p of new Set(pendientes)) {
  console.log(`ℹ️  verify:claims — fuente NO comprobada: ${p}`);
}
