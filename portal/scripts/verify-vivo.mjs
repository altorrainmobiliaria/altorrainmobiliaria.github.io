#!/usr/bin/env node
/*
 * GATE POST-DEPLOY — ¿lo que acabamos de desplegar está SERVIDO, y a tiempo?
 *
 * EL HUECO QUE TAPA. Todos los demás gates de este repo miran el código o el BUILD: el árbol de
 * `dist/`, el HTML generado, los tipos, las pruebas. Ninguno mira el sitio **servido**. El CI
 * terminaba así: `build` en verde → `deploy-staging` sube el bundle a Workers → fin. Si el despliegue
 * aterriza roto —un binding que no existe en la cuenta, una variable que en local estaba y en el
 * Worker no, un bundle que no se subió entero— **el CI queda VERDE y el sitio caído**, y solo se
 * entera quien entre a mirar. Es la familia entera de `38-GATES-QUE-MIENTEN`: el ✅ no era falso,
 * es que su denominador no incluía el sitio.
 *
 * Hasta hoy esa comprobación la hacía una PERSONA con `curl` cada pocos días y la anotaba en el
 * cerebro con un sello (`verificado-vivo: …`). Un sello caduca solo; un gate, no.
 *
 * LAS CUATRO PREGUNTAS, y por qué esas.
 *
 *   1. ¿RESPONDE todo lo que acabo de construir?  Las rutas NO se escriben a mano aquí: se DERIVAN
 *      de `dist/client/**​/*.html`, o sea de lo que el build acaba de producir. Una lista pegada a
 *      mano envejece en silencio y se queda comprobando el sitio de hace tres meses ([[M-32]]); una
 *      lista derivada crece y mengua sola con el sitio.
 *
 *   2. ¿Corre el RENDER DINÁMICO?  `/api/health` es SSR (`prerender = false`): existe justamente para
 *      probar la 2ª frontera del scaffold. Que los ficheros estáticos se sirvan NO prueba que el
 *      Worker ejecute — y los fallos de despliegue caros (bindings, variables) viven ahí.
 *
 *   3. 🎯 ¿404 lo que no existe?  Sin esta pregunta las otras dos no valen nada: un enrutado que
 *      devolviera 200 a cualquier cosa las pondría a las dos en verde sin servir una sola página
 *      correcta. Es la sonda vigilándose a sí misma — la lección de §259, donde un 301 aterrizaba en
 *      un 404 y el gate seguía verde porque comprobaba que la regla existía, no a dónde llevaba.
 *
 *   4. ¿TTFB p75 < 800 ms?  Es un compromiso ESCRITO: `specs/MEGA-PLAN-INMOBILIARIA.md §4.5` lo da
 *      por «adenda Gemini INTEGRADA … presupuesto TTFB p75<800ms en CI de Ola 1». Se midió el
 *      2026-09-10 y NO EXISTÍA en ningún workflow, script ni `package.json`: el plan lo reportaba
 *      hecho. Es `39-ESCRITO-NO-ES-VIGENTE` en su forma más cara, la promesa que se da por cobrada.
 *
 * DECISIONES DE MEDICIÓN, dichas porque un número sin su método no se puede discutir:
 *  · **TTFB** = tiempo hasta que llegan las CABECERAS, que es cuando `fetch()` resuelve — el cuerpo se
 *    lee después y no cuenta. Es la definición que le importa al navegador y a Core Web Vitals.
 *  · **Percentil por rango más cercano** (nearest-rank, ceil(p·n)), no interpolado: con 12 muestras
 *    una interpolación inventa un valor que no se midió. p75 de 12 = la 9ª más lenta.
 *  · **El calentamiento NO cuenta y se dice.** La primera petición a un Worker frío paga el arranque;
 *    con 12 muestras dominaría la mediana y el gate mediría el arranque en vez del servicio. Se
 *    descarta UNA petición previa por ruta, y queda escrito aquí para que nadie descubra dentro de un
 *    año que el número era optimista sin saber por qué.
 *  · **Las muestras van EN SERIE.** En paralelo mediríamos nuestra propia congestión, no la del sitio.
 *    El humo (pregunta 1) sí va con concurrencia acotada: ahí se juzga el estado, no el tiempo.
 *
 * ⚠️ SIN URL, ESTE GATE FALLA — no se salta. Un gate que se auto-desactiva cuando le falta su
 * entrada es exactamente el que un día deja de mirar sin decirlo (`38a-ARMADO-DEL-GATE`). Por eso NO
 * está en `npm run verify` (que es la suite local, sin sitio al que apuntar): vive en el CI, después
 * del deploy, donde la URL siempre está.
 *
 * USO:  VERIFY_VIVO_URL=https://… node scripts/verify-vivo.mjs
 *       node scripts/verify-vivo.mjs --url https://…
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const RAIZ = resolve(import.meta.dirname, '..');
const DIST = join(RAIZ, 'dist', 'client');

/** El compromiso del MEGA-PLAN §4.5. Si alguien lo sube, que sea con un ADR, no con un commit suelto. */
const PRESUPUESTO_TTFB_MS = 800;
/** Muestras por ruta medida. 12 ⇒ p75 es la 9ª: tres lentas sueltas no tumban el gate, una tendencia sí. */
const MUESTRAS = 12;
/** Concurrencia del humo. Acotada para no medir nuestra propia cola contra el edge. */
const CONCURRENCIA = 6;
/** Rutas cuyo TTFB se mide: una ESTÁTICA y una DINÁMICA — las dos fronteras del stack híbrido. */
const RUTAS_MEDIDAS = ['/', '/api/health'];
/** Tiempo máximo por petición antes de darla por muerta (un cuelgue no puede colgar el CI). */
const TIMEOUT_MS = 15_000;

// ─────────────────────────────────────────────────────────────────────────────

function argUrl() {
  const i = process.argv.indexOf('--url');
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return process.env.VERIFY_VIVO_URL ?? '';
}

const base = argUrl().trim().replace(/\/+$/, '');
if (!base || !/^https?:\/\//.test(base)) {
  console.error('');
  console.error('❌ verify:vivo — no me diste la URL del sitio desplegado.');
  console.error('');
  console.error('   Este gate mide el sitio SERVIDO, así que sin URL no puede mirar nada — y un gate');
  console.error('   que se salta solo cuando le falta su entrada es el que un día deja de mirar sin');
  console.error('   decirlo. Por eso falla en vez de pasar de largo.');
  console.error('');
  console.error('   VERIFY_VIVO_URL=https://mi-worker.workers.dev node scripts/verify-vivo.mjs');
  console.error('');
  process.exit(1);
}

/** Rutas DERIVADAS del build: `dist/client/x/index.html` → `/x`; `dist/client/y.html` → `/y.html`. */
function rutasDelBuild(dir, acc = []) {
  for (const nombre of readdirSync(dir)) {
    const p = join(dir, nombre);
    if (statSync(p).isDirectory()) {
      rutasDelBuild(p, acc);
      continue;
    }
    if (!nombre.endsWith('.html')) continue;
    // La página de error NO es una ruta: es lo que se sirve cuando no hay ninguna.
    if (nombre === '404.html') continue;
    const rel = relative(DIST, p).split(sep).join('/');
    acc.push('/' + (rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel).replace(/\/$/, ''));
  }
  return acc;
}

/**
 * Una petición, con su TTFB.
 *
 * ⚠️ **EL CUERPO SE DRENA SIEMPRE, aunque solo estemos midiendo.** La primera versión se lo saltaba
 * —«para qué leerlo si solo quiero el tiempo»— y dejaba 26 respuestas a medio consumir: el socket se
 * queda ocupado, y al llamar a `process.exit()` con esos manejadores vivos Node reventaba en Windows
 * con `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` **saliendo con 127 en vez del 1 que el
 * gate ordenaba**. Detectaba la avería, la imprimía entera… y devolvía un código que no era el suyo.
 * Se vio solo al comprobar el CÓDIGO DE SALIDA en vez de fiarse del ❌ impreso — que es justo lo que
 * un CI mira y una persona no.
 *
 * Drenar no contamina la medida: el TTFB ya está tomado en la línea de arriba, cuando llegaron las
 * cabeceras. Y además es lo que hace un cliente de verdad.
 */
async function pedir(ruta) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const arranque = performance.now();
  try {
    // `fetch` resuelve con las CABECERAS; el cuerpo llega después. Ese instante ES el TTFB.
    const res = await fetch(base + ruta, {
      signal: ctrl.signal,
      redirect: 'manual',
      headers: { 'user-agent': 'altorra-verify-vivo' },
    });
    const ttfb = performance.now() - arranque;
    const cuerpo = await res.text().catch(() => '');
    return { ok: true, status: res.status, ttfb, cuerpo };
  } catch (e) {
    return { ok: false, status: 0, ttfb: performance.now() - arranque, error: String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

/** Percentil por RANGO MÁS CERCANO — sin interpolar: solo devuelve valores que se midieron. */
const percentil = (xs, p) => {
  const o = [...xs].sort((a, b) => a - b);
  return o[Math.min(o.length - 1, Math.max(0, Math.ceil(p * o.length) - 1))];
};
const ms = (n) => `${Math.round(n)} ms`;

async function enLotes(items, n, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += n) {
    out.push(...(await Promise.all(items.slice(i, i + n).map(fn))));
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────

if (!existsSync(DIST)) {
  console.error('');
  console.error(`❌ verify:vivo — no encuentro el build en ${relative(RAIZ, DIST)}.`);
  console.error('   Las rutas se DERIVAN del build (no hay lista a mano), así que sin él no hay nada');
  console.error('   que comprobar. Corre `npm run build` antes.');
  console.error('');
  process.exit(1);
}

const rutas = [...new Set(rutasDelBuild(DIST))].sort();
console.log(`🔎 verify:vivo — ${base}`);
console.log(`   ${rutas.length} ruta(s) DERIVADA(S) del build + /api/health (SSR) + una inventada que debe dar 404.`);

/*
 * ESPERA DE PROPAGACIÓN. Un deploy a Workers no es instantáneo, y medir un sitio que todavía no ha
 * terminado de aterrizar produce un rojo que no es del código: es del reloj. La espera se hace
 * sondeando `/api/health` hasta que responda, NO durmiendo un número fijo de segundos — un `sleep 20`
 * es a la vez demasiado (siempre lo paga) y demasiado poco (el día que tarde 25).
 *
 * ⚠️ Y tiene TOPE: si nunca responde, se sigue adelante y los chequeos fallan como deben. Una espera
 * sin límite convertiría «el sitio está caído» en «el CI se quedó colgado», que es el mismo problema
 * disfrazado de otro.
 */
const ESPERA_MAX_MS = 45_000;
const arranqueEspera = performance.now();
let intentos = 0;
while (performance.now() - arranqueEspera < ESPERA_MAX_MS) {
  intentos++;
  const r = await pedir('/api/health');
  if (r.ok && r.status === 200) break;
  await new Promise((res) => setTimeout(res, 3000));
}
if (intentos > 1) {
  console.log(`   ⏳ el sitio tardó ${Math.round((performance.now() - arranqueEspera) / 1000)}s en responder (${intentos} sondeo[s]) — propagación del deploy.`);
}

const fallos = [];

// 1 · ¿RESPONDE lo que acabo de construir?
const humo = await enLotes(rutas, CONCURRENCIA, async (r) => ({ ruta: r, ...(await pedir(r)) }));
for (const h of humo) {
  if (!h.ok) fallos.push(`${h.ruta} — sin respuesta (${h.error})`);
  else if (h.status !== 200) fallos.push(`${h.ruta} — ${h.status} (se esperaba 200)`);
}

// 2 · ¿Corre el render DINÁMICO? Que se sirvan ficheros no prueba que el Worker ejecute.
const salud = await pedir('/api/health');
if (!salud.ok) fallos.push(`/api/health — sin respuesta (${salud.error})`);
else if (salud.status !== 200) fallos.push(`/api/health — ${salud.status} (se esperaba 200): el SSR del Worker NO está corriendo`);
else if (!/"ok"\s*:\s*true/.test(salud.cuerpo)) fallos.push('/api/health — responde 200 pero su cuerpo no dice `ok: true`');

// 3 · 🎯 La sonda que se vigila a sí misma: sin esto, las dos de arriba valen cero.
const inventada = `/no-existe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const cuatroCuatro = await pedir(inventada);
if (!cuatroCuatro.ok) {
  fallos.push(`${inventada} — sin respuesta (${cuatroCuatro.error})`);
} else if (cuatroCuatro.status !== 404) {
  fallos.push(
    `${inventada} — ${cuatroCuatro.status} (se esperaba 404). El enrutado responde a lo que NO existe, ` +
      'así que los 200 de arriba no prueban que se esté sirviendo la página correcta.',
  );
}

// 4 · Presupuesto de TTFB (MEGA-PLAN §4.5).
const medidas = [];
for (const ruta of RUTAS_MEDIDAS) {
  await pedir(ruta); // calentamiento: NO cuenta (ver cabecera)
  const xs = [];
  for (let i = 0; i < MUESTRAS; i++) {
    const r = await pedir(ruta);
    if (r.ok) xs.push(r.ttfb);
  }
  if (xs.length < Math.ceil(MUESTRAS / 2)) {
    fallos.push(`${ruta} — solo ${xs.length}/${MUESTRAS} muestras válidas: no hay con qué calcular un p75 honesto`);
    continue;
  }
  medidas.push({ ruta, n: xs.length, p50: percentil(xs, 0.5), p75: percentil(xs, 0.75), max: Math.max(...xs) });
}

console.log('');
console.log(`   ⏱️  TTFB (hasta las cabeceras · ${MUESTRAS} muestras en serie · calentamiento descartado · p75 nearest-rank):`);
for (const m of medidas) {
  const veredicto = m.p75 <= PRESUPUESTO_TTFB_MS ? '✅' : '❌';
  console.log(`      ${veredicto} ${m.ruta.padEnd(14)} p50 ${ms(m.p50).padStart(8)} · p75 ${ms(m.p75).padStart(8)} · máx ${ms(m.max).padStart(8)}  (presupuesto p75 ≤ ${PRESUPUESTO_TTFB_MS} ms)`);
  if (m.p75 > PRESUPUESTO_TTFB_MS) {
    fallos.push(`${m.ruta} — p75 ${ms(m.p75)} supera el presupuesto de ${PRESUPUESTO_TTFB_MS} ms (MEGA-PLAN §4.5)`);
  }
}
console.log('');

if (fallos.length) {
  console.error(`❌ verify:vivo — ${fallos.length} problema(s) en el sitio SERVIDO:`);
  console.error('');
  for (const f of fallos) console.error(`   · ${f}`);
  console.error('');
  console.error('   Esto NO lo puede ver ningún otro gate: los demás miran el código o el build, y el');
  console.error('   build puede estar impecable mientras lo desplegado no responde.');
  console.error('');
  // `exitCode` y NO `process.exit()`: aquí ya se hicieron decenas de peticiones, y matar el proceso
  // con sockets todavía cerrándose es lo que hacía salir 127 en vez de 1 (ver `pedir`). Dejando que
  // Node termine solo, el código de salida es el que este gate decidió.
  process.exitCode = 1;
}

if (!fallos.length) {
  console.log(
    `✅ verify:vivo — ${humo.length} ruta(s) del build responden 200 · el SSR corre (/api/health) · ` +
      `lo inventado da 404 · TTFB p75 dentro del presupuesto (${PRESUPUESTO_TTFB_MS} ms) en ${medidas.length} ruta(s).`,
  );
}
