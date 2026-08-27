#!/usr/bin/env node
// GATE de invariantes de datos (free-tier sagrado). Convierte de HONOR a LINTER las reglas que el
// comité OD1 marcó como "removibles en un PR silencioso": el portal NUNCA usa el SDK de Firestore ni
// `onSnapshot`, y NUNCA hace lecturas de LISTA/QUERY no acotadas (`:runQuery`/`:listDocuments`). Toda
// lectura pública pasa por la capa `src/lib/data` (GET puntual REST). Falla ruidosamente (exit 1).
//
// El catálogo público (grillas comprar/arrendar/alojamientos) NO se sirve por list de Firestore: se
// resuelve por SSG a build-time (Admin SDK, cero lecturas runtime) o por doc-índice denormalizado
// (1 GET) mantenido por Cloud Function — decisión de Ola 1 (ver src/lib/data/README.md).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const srcDir = resolve(root, 'src');

// Patrón → por qué está prohibido.
const FORBIDDEN = [
  { re: /\bimport\b[^\n]*['"]firebase-admin/, why: "SDK 'firebase-admin' (no corre en Workers; escrituras = Cloud Functions)" },
  // `import type` NO cuenta: se borra al compilar y no embarca un solo byte de SDK. Marcarlo era un
  // falso positivo del propio gate y obligaba a pedir una excepción para algo que no puede hacer daño
  // — que es como se llena de excepciones un gate hasta que deja de significar nada (§142).
  { re: /\bimport\b(?!\s+type\b)[^\n]*['"]firebase\/(firestore|app|auth|functions|storage|database|analytics)/, why: 'SDK cliente de Firebase (la capa de datos usa REST, no el SDK)' },
  { re: /\.onSnapshot\s*\(/, why: 'onSnapshot (listener realtime — prohibido en superficies públicas, free-tier)' },
  { re: /[:/](runQuery|listDocuments)\b/, why: 'endpoint REST de lista/query (lectura no acotada — usar GET puntual o doc-índice)' },
];

/**
 * EXCEPCIONES — estrechas, con nombre y motivo (ADR §96).
 *
 * Por qué existen: `/ingresar` (§89/§90) necesita el SDK de Auth de verdad. El inicio de sesión con
 * Google es un flujo de ventana emergente con intercambio de tokens; no hay REST que lo sustituya, y
 * el SDK se carga con `import()` dinámico, así que ni siquiera entra en el bundle de las demás rutas.
 *
 * Por qué se añaden AHORA: el gate llevaba en rojo desde que existe esa página, y un gate que siempre
 * falla deja de avisar de nada. Un candado que suena todo el rato se ignora igual que uno apagado.
 *
 * La excepción es por ARCHIVO y por PATRÓN: `firebase/firestore` sigue prohibido en `/ingresar` igual
 * que en el resto. Ampliar esta lista sin escribir el motivo es exactamente cómo muere un gate.
 */
const EXCEPCIONES = [
  {
    // La excepción apunta al MÓDULO que carga Auth, no a cada página que necesita sesión. Antes era
    // para `pages/ingresar.astro`; al extraer el cargador a `scripts/auth.ts` se mudó con él, así el
    // permiso vive donde vive la responsabilidad y no se multiplica.
    archivo: /scripts[\\/]auth\.ts$/,
    // Cubre el `import()` dinámico Y las posiciones de TIPO (`import('firebase/auth').User`), que no
    // generan código pero el patrón de este gate también las ve.
    re: /['"]firebase\/(app|auth)['"]/,
    motivo: 'Auth con Google exige el SDK (no hay REST equivalente); carga dinámica en un solo módulo',
  },
  {
    // El PANEL no es superficie pública: lo abren una o dos personas del equipo, detrás de sesión y
    // del claim de staff. El gate existe para que una lectura de más no se multiplique por cada
    // visitante — aquí no hay visitantes. La doctrina del proyecto ya lo contempla al decir «cero
    // onSnapshot PÚBLICO (solo admin)». Aun así el módulo no usa listeners: pide una vez, con limit().
    archivo: /scripts[\\/]gestion-.*\.ts$/,
    re: /['"]firebase\/(app|auth|firestore)['"]/,
    motivo: 'Panel interno tras sesión + claim de staff; consulta acotada con limit() y sin listeners',
  },
  {
    // LA BÓVEDA (gate B5, §142). Aquí no hay alternativa REST razonable: subir por REST significa
    // implementar a mano el protocolo de subida reanudable de Google, y descargar significa pedir una
    // URL firmada… que es justo lo que NO queremos (ver abajo). El SDK se carga con `import()`
    // dinámico y solo en este módulo, que vive detrás de sesión + claim de staff.
    //
    // 🔴 Y la razón de fondo por la que este permiso vale la pena: con el SDK se puede usar `getBlob`,
    // que descarga CON la sesión y pasa por las Storage Rules. La alternativa —`getDownloadURL`—
    // emite una URL con token que abre CUALQUIERA que la tenga, sin sesión. Para la cédula de un
    // arrendatario eso es una fuga esperando un reenvío. La excepción compra la opción segura.
    // Se amplía a `gestion-perfiles.ts` (§153) por la MISMA razón, no por comodidad: ahí se abren
    // cédulas y nóminas de aspirantes a inquilino —personas de FUERA del equipo— y `getBlob` es lo
    // que permite descargarlas con la sesión en vez de emitir un enlace que abre cualquiera. La
    // excepción sigue siendo por ARCHIVO y por PATRÓN: `firebase/firestore` no entra por aquí.
    archivo: /scripts[\\/]gestion-(documentos|perfiles)\.ts$/,
    re: /['"]firebase\/storage['"]/,
    motivo: 'Bóveda privada: `getBlob` respeta las Rules; `getDownloadURL` emitiría un enlace público',
  },
];

const exceptuado = (file, code) =>
  EXCEPCIONES.some((e) => e.archivo.test(file) && e.re.test(code));

const SKIP_FILE = /\.test\.ts$/;
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const ext = extname(p);
    if ((ext === '.ts' || ext === '.astro' || ext === '.tsx' || ext === '.mjs') && !SKIP_FILE.test(p)) files.push(p);
  }
})(srcDir);

const violations = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const rel = relative(root, file);
    for (const { re, why } of FORBIDDEN) {
      if (re.test(line) && !exceptuado(rel, line.trim())) {
        violations.push({ file: rel, line: i + 1, why, code: line.trim() });
      }
    }
  });
}

if (violations.length) {
  console.error(`❌ verify:data — ${violations.length} violación(es) de invariantes de datos (free-tier):\n`);
  for (const v of violations) console.error(`  ${v.file}:${v.line} — ${v.why}\n    > ${v.code}`);
  console.error('\nToda lectura pública pasa por src/lib/data (GET puntual REST). Ver src/lib/data/README.md.');
  process.exit(1);
}
console.log(`✅ verify:data — ${files.length} archivos escaneados: sin SDK de Firestore, sin onSnapshot, sin lista/query no acotada.`);

/*
 * ── SONDA: LOS ESPEJOS DE `firestore.rules` (§179) ──────────────────────────────────────────────
 *
 * QUÉ CAZA. Que una lista escrita DOS veces —una en las Rules, otra en TypeScript— deje de coincidir.
 * El código dice «espeja las Rules» en tres sitios y **nadie lo comprobaba**: hay una prueba llamada
 * *«los roles espejan a las Rules»* que no abre el archivo de Rules ni una vez — afirma que las
 * funciones de TS hacen lo que la propia prueba espera. Es el patrón de §178, el comentario que
 * promete unicidad: aquí es un NOMBRE que promete una verificación que no ocurre.
 *
 * POR QUÉ IMPORTA que coincidan. Las Rules son la frontera REAL y el TS es quien decide qué se pinta.
 * Si divergen: o el índice publica fichas que las Rules niegan (tarjetas que llevan a un 404), o hay
 * inmuebles publicables que nadie indexa (inventario invisible). Ninguna de las dos avisa.
 *
 * 🔒 FALLA SI NO PUEDE LEER. Si un patrón deja de encontrar su lista, esta sonda se pone ROJA en vez
 * de pasar: un comparador que no encuentra nada que comparar y dice «✅» es exactamente el gate que
 * miente ([[L-52]]). Aquí eso importa más que de costumbre — lo que compara son permisos.
 */
const rulesPath = resolve(root, 'firebase/firestore.rules');
const rules = existsSync(rulesPath) ? readFileSync(rulesPath, 'utf8') : '';
const espejos = [];

/** Saca los literales de una lista `['a', 'b']` del primer trozo que case. */
const listaDe = (texto, re) => {
  const m = texto.match(re);
  if (!m) return null;
  const items = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  return items.length ? items.sort() : null;
};

const compara = (nombre, enRules, enCodigo, pista) => {
  if (!enRules || !enCodigo) {
    espejos.push({ nombre, error: `no se pudo LEER ${!enRules ? 'las Rules' : 'el código'} (${pista})` });
    return;
  }
  if (JSON.stringify(enRules) !== JSON.stringify(enCodigo)) {
    espejos.push({ nombre, error: `rules=[${enRules}] vs código=[${enCodigo}]` });
  }
};

const catalogoTs = readFileSync(resolve(srcDir, 'lib/domain/catalogo.ts'), 'utf8');
const tokenTs = readFileSync(resolve(srcDir, 'lib/auth/verificar-id-token.ts'), 'utf8');

// 1. Estados que salen al catálogo público.
compara(
  'estados publicados',
  listaDe(rules, /resource\.data\.estado in \(?(\[[^\]]+\])/),
  listaDe(catalogoTs, /ESTADOS_PUBLICADOS[^=]*=\s*(\[[^\]]+\])/),
  'estado in [...] / ESTADOS_PUBLICADOS',
);

// 2. Quién puede escribir contenido. En el TS son dos comparaciones `===`, no una lista.
const rolesTs = [...(tokenTs.match(/function esEditorOMas[\s\S]{0,240}?\n}/) ?? [''])[0]
  .matchAll(/rol === '([^']+)'/g)].map((m) => m[1]).sort();
compara(
  'roles que escriben (esEditorOMas)',
  listaDe(rules, /function esEditorOMas\(\)[^\n]*rol\(\) in (\[[^\]]+\])/),
  rolesTs.length ? rolesTs : null,
  'esEditorOMas',
);

/*
 * 3. El gate legal del alojamiento (§233). Las Rules listan las situaciones de PH que PERMITEN
 *    anunciar por días; el dominio lista TODAS las posibles y rechaza `sin-autorizacion`. Así que
 *    no se comparan tal cual: se compara el conjunto de las Rules contra el del dominio MENOS la
 *    que el dominio rechaza. Si mañana alguien añade una situación nueva al dominio y no la decide
 *    en las Rules, esto se pone rojo — que es justo el día en que hay que decidirla.
 */
const altaTs = readFileSync(resolve(srcDir, 'lib/domain/shared.ts'), 'utf8');
const todasPH = listaDe(altaTs, /SITUACIONES_PH[^=]*=\s*(\[[^\]]+\])/);
compara(
  'situaciones de PH que permiten alojamiento',
  listaDe(rules, /get\('situacionPH', ''\) in (\[[^\]]+\])/),
  todasPH ? todasPH.filter((x) => x !== 'sin-autorizacion') : null,
  "situacionPH in [...] / SITUACIONES_PH menos 'sin-autorizacion'",
);

if (espejos.length) {
  console.error('❌ verify:data — ESPEJOS de `firestore.rules` que no cuadran:\n');
  for (const e of espejos) console.error(`   ${e.nombre}: ${e.error}`);
  console.error('\n   Las Rules son la frontera REAL; el TS decide qué se pinta. Si divergen, o se');
  console.error('   publican fichas que las Rules niegan, o hay inventario que nadie indexa (§179).');
  process.exit(1);
}
console.log('✅ verify:data — los 3 espejos de `firestore.rules` (estados públicos · roles · PH del alojamiento) cuadran con el código.');
