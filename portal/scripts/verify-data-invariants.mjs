#!/usr/bin/env node
// GATE de invariantes de datos (free-tier sagrado). Convierte de HONOR a LINTER las reglas que el
// comité OD1 marcó como "removibles en un PR silencioso": el portal NUNCA usa el SDK de Firestore ni
// `onSnapshot`, y NUNCA hace lecturas de LISTA/QUERY no acotadas (`:runQuery`/`:listDocuments`). Toda
// lectura pública pasa por la capa `src/lib/data` (GET puntual REST). Falla ruidosamente (exit 1).
//
// El catálogo público (grillas comprar/arrendar/alojamientos) NO se sirve por list de Firestore: se
// resuelve por SSG a build-time (Admin SDK, cero lecturas runtime) o por doc-índice denormalizado
// (1 GET) mantenido por Cloud Function — decisión de Ola 1 (ver src/lib/data/README.md).
import { readdirSync, readFileSync, statSync } from 'node:fs';
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
    archivo: /scripts[\\/]gestion-documentos\.ts$/,
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
