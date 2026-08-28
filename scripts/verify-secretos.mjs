#!/usr/bin/env node
/*
 * GATE — secretos en un repositorio PÚBLICO (§262).
 *
 * EL DEFECTO QUE CAZA. Una credencial commiteada. En un repo privado sería un susto; aquí es una
 * publicación: `altorrainmobiliaria.github.io` sirve el árbol entero y GitHub lo indexa, así que una
 * clave subida está cosechada antes de que nadie la note. Y no basta con borrarla después — queda en
 * el historial de git para siempre; lo único que sirve es que no entre.
 *
 * POR QUÉ EXISTE AHORA. «NUNCA commitear secrets» es doctrina desde el principio y **nada la hacía
 * cumplir**: una promesa sin mecanismo, que es la familia que este cerebro ha aprendido a cerrar
 * convirtiéndola en gate. Lo que había era un escáner dentro de `tests/validate-site.mjs` con TRES
 * patrones sobre HTML y `js/` — y ese archivo llevaba roto en Windows el tiempo que llevara ahí
 * (`URL.pathname` da `/C:/…` y `join()` lo vuelve `C:\C:\…`), sin que nadie lo notara porque su
 * `npm test` no lo invoca ningún CI ni ningún hook. Un guion roto, además no llamado.
 *
 * LO QUE MIRA, y por qué esos. Wompi y Resend entran en Ola 2 con credenciales de verdad, y el
 * despliegue usa cuentas de servicio de Google: los patrones cubren lo que este proyecto va a tener
 * en las manos, no una lista genérica copiada de internet.
 *
 * ⚠️ LO QUE NO MIRA, A PROPÓSITO: la `apiKey` de Firebase (`AIza…`) es **PÚBLICA por diseño** —viaja
 * en el HTML de cualquier app web y quien protege los datos son las Rules, no ella—. Buscarla daría
 * un rojo permanente contra algo correcto, y un gate que grita por lo correcto se desactiva solo en
 * la cabeza de quien lo lee.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/\/$/, '');

/** Carpetas fuera del barrido, cada una con su razón. */
const FUERA = new Set([
  'node_modules', // dependencias: no son nuestras y su volumen ahogaría la señal
  '.git',         // el historial se revisa con otras herramientas, no leyendo objetos
  'dist',         // artefacto: si algo entró, entró por el fuente, que sí se mira
  '.astro',
  '.wrangler',
  'backups',      // exportaciones locales de datos reales; gitignored a propósito
  '_legacy',      // cuarentena: código retirado que no se sirve ni se despliega
]);

/** Ficheros exentos, con su motivo — la única forma honesta de excluir algo. */
const EXENTOS = new Map([
  ['scripts/verify-secretos.mjs', 'este archivo: sus propios patrones se citan literalmente aquí'],
]);

/**
 * Patrones de secreto REAL. Cada uno nombra lo que es, porque el mensaje tiene que decirle a quien
 * lo lea QUÉ se le coló — no un número de línea y suerte.
 */
const PATRONES = [
  ['clave privada PEM',         /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['cuenta de servicio Google', /"type"\s*:\s*"service_account"/],
  ['token de GitHub',           /\b(?:ghp|gho|ghu|ghs|ghr)_[0-9A-Za-z]{36}\b|\bgithub_pat_[0-9A-Za-z_]{22,}/],
  ['clave de Resend',           /\bre_[0-9A-Za-z]{20,}\b/],
  ['llave PRIVADA de Wompi',    /\bprv_(?:prod|test)_[0-9A-Za-z]{20,}\b/],
  ['clave de OpenAI',           /\bsk-(?:proj-)?[0-9A-Za-z_-]{40,}\b/],
  ['clave de Anthropic',        /\bsk-ant-[0-9A-Za-z_-]{40,}\b/],
  ['clave viva de Stripe',      /\bsk_live_[0-9A-Za-z]{20,}\b/],
  ['token de Slack',            /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/],
  ['AWS access key',            /\bAKIA[0-9A-Z]{16}\b/],
];

const TEXTO = /\.(js|mjs|cjs|ts|tsx|astro|json|jsonc|html|md|yml|yaml|txt|env|sh|py|rules)$/i;

function archivos(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    if (FUERA.has(n) || n.startsWith('.')) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) archivos(p, acc);
    else if (TEXTO.test(n)) acc.push(p);
  }
  return acc;
}

const fallos = [];
let mirados = 0;

for (const p of archivos(RAIZ)) {
  const rel = relative(RAIZ, p).replace(/\\/g, '/');
  if (EXENTOS.has(rel)) continue;
  mirados++;
  let src;
  try {
    src = readFileSync(p, 'utf8');
  } catch {
    continue;
  }
  for (const [nombre, pat] of PATRONES) {
    const m = src.match(pat);
    if (!m) continue;
    const linea = src.slice(0, m.index).split('\n').length;
    fallos.push({ rel, linea, nombre });
  }
}

/*
 * ANTI-VACÍO. Un ✅ sobre cero ficheros es la forma de mentir que más veces ha cazado este cerebro:
 * si el barrido deja de encontrar el árbol —una ruta mal resuelta, un `FUERA` de más— el gate pasa
 * en verde precisamente cuando ha dejado de mirar. El umbral es holgado a propósito: no vigila un
 * número exacto, vigila que el barrido SIGA OCURRIENDO.
 */
if (mirados < 200) {
  console.error('');
  console.error(`❌ verify:secretos — solo ${mirados} fichero(s) barridos: el escaneo dejó de ver el árbol.`);
  console.error('   Con tan pocos, un ✅ no significaría «limpio» sino «no miré». Arregla la ruta o');
  console.error('   la lista de exclusiones ANTES de creerte el verde.');
  process.exit(1);
}

if (fallos.length) {
  console.error('');
  console.error('🚨 verify:secretos — CREDENCIAL en un repositorio PÚBLICO:');
  console.error('');
  for (const f of fallos) console.error(`   ${f.rel}:${f.linea}  →  ${f.nombre}`);
  console.error('');
  console.error('   El dominio sirve este árbol y GitHub lo indexa: dala por cosechada.');
  console.error('   1) ROTA la credencial primero — borrarla del archivo no la invalida, y el');
  console.error('      historial de git la conserva para siempre.');
  console.error('   2) Luego sácala del repo: a una variable de entorno o a `firebase secrets:set`.');
  console.error('   Si es un caso legítimo, decláralo en `EXENTOS` CON SU MOTIVO escrito.');
  process.exit(1);
}

console.log(`✅ verify:secretos — ${mirados} fichero(s) de texto, ${PATRONES.length} patrones: ninguna credencial en el repo público.`);
