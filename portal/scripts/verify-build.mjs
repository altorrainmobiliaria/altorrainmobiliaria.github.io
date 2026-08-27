#!/usr/bin/env node
// Verifica el CABLEADO HÍBRIDO del build — materializa la mitigación del riesgo
// sellado R2/R3 ("rendering mal cableado", specs/R5-STACK). Corre en CI tras
// `astro build` (job `build` de portal-ci.yml). Falla ruidosamente (exit 1).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const checks = [];
const check = (name, ok, detail = '') => checks.push({ name, ok, detail });

// 1. Página ESTÁTICA prerenderizada (el `export const prerender = true` funcionó).
check('index estático prerenderizado (dist/client/index.html)', existsSync(resolve(root, 'dist/client/index.html')));

// 2. Worker SSR construido (render on-demand en el edge).
check('worker SSR construido (dist/server/entry.mjs)', existsSync(resolve(root, 'dist/server/entry.mjs')));

// 3. /api/health es SSR: NO debe existir como asset estático prerenderizado.
const h = resolve(root, 'dist/client/api/health');
check('/api/health es SSR (no estático)', !existsSync(h) && !existsSync(`${h}.html`) && !existsSync(resolve(h, 'index.html')));

// 4. Config de deploy generada con main + assets binding + directory.
const wj = resolve(root, 'dist/server/wrangler.json');
let wOk = false, wDetail = 'no existe';
if (existsSync(wj)) {
  try {
    const cfg = JSON.parse(readFileSync(wj, 'utf8'));
    wOk = Boolean(cfg.main && cfg.assets?.binding && cfg.assets?.directory);
    wDetail = `main=${cfg.main} · assets.binding=${cfg.assets?.binding} · dir=${cfg.assets?.directory}`;
  } catch (e) {
    wDetail = `JSON inválido: ${e.message}`;
  }
}
check('wrangler.json generado (main + assets)', wOk, wDetail);

// 5. La config de DEPLOY real (portal/wrangler.jsonc, JSONC) declara el entrypoint unificado + bindings.
//    verify-build antes solo miraba el artefacto generado; esto cubre la config que de verdad despliega.
const wjc = resolve(root, 'wrangler.jsonc');
let dOk = false, dDetail = 'no existe';
if (existsSync(wjc)) {
  const txt = readFileSync(wjc, 'utf8');
  const hasMain = txt.includes('@astrojs/cloudflare/entrypoints/server');
  const hasAssets = /"binding":\s*"ASSETS"/.test(txt);
  const hasR2 = /"binding":\s*"R2_MEDIA"/.test(txt);
  /*
   * 🔴 `run_worker_first` con `/*.html` ES EL GATE DEL MAPA DE 301 (§145). Sin él, la capa de assets
   * de Cloudflare responde ANTES que el Worker y sirve `404.html`: el middleware —que resuelve el
   * redirect en su primera línea— no llega a ejecutarse nunca. Medido en staging: las 65 URLs del
   * sitio viejo devolvían 404, no 301. Se comprueba aquí porque quitar una línea de una config no
   * rompe nada visible; solo apaga, en silencio, la preservación de años de posicionamiento.
   */
  const hasWorkerFirst = /"run_worker_first"\s*:\s*\[[^\]]*"\/\*\.html"/.test(txt);
  /*
   * 🔴 `html_handling: drop-trailing-slash` — la MISMA clase de candado, y por la misma razón (§150).
   * Sin esta clave el valor por defecto es `auto-trailing-slash` y `/journal` responde 307 hacia
   * `/journal/`: los enlaces internos, el sitemap, el canonical y el destino de los 65 redirects
   * dicen una forma y el servidor prefiere la otra. Nadie lo nota —el navegador sigue el salto— y
   * el precio se paga en señales contradictorias y en cadenas de redirección.
   */
  const hasSinBarra = /"html_handling"\s*:\s*"drop-trailing-slash"/.test(txt);
  dOk = hasMain && hasAssets && hasR2 && hasWorkerFirst && hasSinBarra;
  dDetail = `main-entrypoint=${hasMain} · ASSETS=${hasAssets} · R2_MEDIA=${hasR2} · run_worker_first(/*.html)=${hasWorkerFirst} · html_handling(sin barra)=${hasSinBarra}`;
}
check('wrangler.jsonc de deploy (entrypoint + bindings + los 301 alcanzables)', dOk, dDetail);

// 6. INDEXABILIDAD — el candado que evita el fallo más caro y más silencioso del cutover.
//    Todo el portal se indexa SOLO si se compila con PUBLIC_SITE_ENV=production; por defecto sale
//    `noindex, nofollow`. Eso protege al staging, pero significa que un build de producción hecho
//    SIN la variable publica el sitio nuevo pidiéndole a Google que lo desindexe — y se ve perfecto
//    para un humano. La skill `search-console-setup-y-diagnostico` lo llama "el bug clásico".
//    En producción esto FALLA el build; fuera de producción AVISA, para que nadie despliegue a
//    ciegas al dominio real. (ADR §90 · MEGA-PLAN OLA 1 ítem 11.)
const ES_PROD = process.env.PUBLIC_SITE_ENV === 'production';
const home = resolve(root, 'dist/client/index.html');
const robots = resolve(root, 'dist/client/robots.txt');
const homeTxt = existsSync(home) ? readFileSync(home, 'utf8') : '';
const robotsTxt = existsSync(robots) ? readFileSync(robots, 'utf8') : '';
const tieneNoindex = /noindex/i.test(homeTxt);
const bloqueaTodo = /^\s*Disallow:\s*\/\s*$/im.test(robotsTxt);

if (ES_PROD) {
  check(
    'indexable en PRODUCCIÓN (sin noindex residual, robots abierto)',
    !tieneNoindex && !bloqueaTodo && /Sitemap:/i.test(robotsTxt),
    `noindex-en-home=${tieneNoindex} · robots-Disallow-total=${bloqueaTodo} · sitemap-declarado=${/Sitemap:/i.test(robotsTxt)}`,
  );
} else {
  check('staging correctamente NO indexable', tieneNoindex && bloqueaTodo, `noindex=${tieneNoindex} · Disallow=${bloqueaTodo}`);
  console.log(
    '\n⚠️  Este build es NO INDEXABLE (PUBLIC_SITE_ENV != production).\n' +
    '   Correcto para staging. Si esto va al dominio REAL, Google desindexa el sitio:\n' +
    '   el cutover se construye con  PUBLIC_SITE_ENV=production  (checklist en docs/50-CONFIG-INFRA).\n',
  );
}

/*
 * ── SONDA: NO SE PUBLICA UN CATÁLOGO INVENTADO (§163) ──────────────────────────────────────────
 *
 * QUÉ CAZA. Un build de PRODUCCIÓN con `PUBLIC_CATALOGO_SOURCE` en `demo`. Hoy las tarjetas de la
 * home, del SERP y la ficha pintan un inmueble que **no existe** —con su precio, su barrio y sus
 * fotos— porque el catálogo real llega con el inventario (fase 4 del runbook). Mientras el sitio es
 * staging y va `noindex`, eso es un andamio legítimo. El día del cutover deja de serlo: son 38
 * enlaces desde la home, `/comprar` y `/arrendar` hacia una propiedad inventada, publicados por una
 * inmobiliaria cuyo eslogan es «Seguridad, Legalidad y Confianza».
 *
 * POR QUÉ HACE FALTA UN GATE Y NO BASTA EL RUNBOOK. Es hermano exacto del candado #6 (indexabilidad)
 * y falla igual: **un build de producción hecho sin la variable se ve PERFECTO para un humano**. Las
 * tarjetas salen bonitas, la ficha abre, nada da error. El runbook ordena fase 4 (catálogo real)
 * antes de fase 5 (DNS), pero un orden escrito en un documento no es un orden que alguien tenga que
 * cumplir — [[M-23]]: un paso que nadie ha ejecutado es una hipótesis. Esto lo vuelve mecánico.
 *
 * FUERA DE PRODUCCIÓN no falla: informa. El staging con datos de muestra es el estado normal de hoy.
 */
const FUENTE_CATALOGO = process.env.PUBLIC_CATALOGO_SOURCE ?? 'demo';
if (ES_PROD) {
  check(
    'catálogo REAL en producción (no el de muestra)',
    FUENTE_CATALOGO === 'live',
    FUENTE_CATALOGO === 'live'
      ? 'PUBLIC_CATALOGO_SOURCE=live'
      : `PUBLIC_CATALOGO_SOURCE=${FUENTE_CATALOGO} — publicarías inmuebles que NO EXISTEN, con precio y barrio. ` +
        'Fase 4 del runbook (catálogo real) va ANTES de la fase 5 (DNS).',
  );
} else if (FUENTE_CATALOGO !== 'live') {
  console.log(
    '\nℹ️  Catálogo de MUESTRA (PUBLIC_CATALOGO_SOURCE=demo). Correcto en staging: las tarjetas y la\n' +
    '   ficha pintan un inmueble que no existe, y por eso van `noindex`. En el cutover se construye\n' +
    '   con  PUBLIC_CATALOGO_SOURCE=live  o este chequeo pone el build en rojo.\n',
  );
}

/*
 * ── META-GATE: ¿algún `verify:*` se quedó sin cablear al CI? (§142) ──────────────────────────────
 *
 * `verify:data` existía desde Ola 0 y NO LO CORRÍA NADIE — ni el CI ni la rutina. Vigila el free-tier
 * (cero SDK de Firestore en el portal, cero `onSnapshot`, cero lista sin acotar) y llevaba meses
 * siendo decorativo; lo puse en rojo yo mismo dos veces en un día sin enterarme.
 *
 * Es exactamente el chequeo #25 del linter del cerebro —«un gate que nadie invoca no protege nada»—
 * y el portal no lo tenía. Vive aquí, en el gate del CABLEADO, porque de eso trata: de que la
 * plomería esté conectada.
 */
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const ciPath = resolve(root, '..', '.github/workflows/portal-ci.yml');
const ci = existsSync(ciPath) ? readFileSync(ciPath, 'utf8') : '';
const gates = Object.keys(pkg.scripts ?? {}).filter((k) => k.startsWith('verify:'));
const sueltos = gates.filter((g) => !ci.includes(`npm run ${g}`));
check(
  `los ${gates.length} gates verify:* están cableados al CI`,
  ci !== '' && sueltos.length === 0,
  sueltos.length ? `sin cablear: ${sueltos.join(', ')} — un gate que nadie invoca no protege nada` : '',
);

/*
 * Y que `npm run verify` los corra TODOS (§157).
 *
 * Por qué existe este segundo candado: el de arriba comprueba que el CI los invoque, y eso llega
 * TARDE — el CI corre después de empujar. En local hay que acordarse de siete nombres, y el día que
 * uno se olvida se empuja creyendo que está todo verde. Pasó: se corrieron cinco de siete y `verify:css`
 * salió rojo en el CI, con el commit ya escrito diciendo «los 7 en verde».
 * El atajo `npm run verify` arregla eso, pero solo si NO se queda atrás — así que se comprueba que
 * nombre a nombre los contenga. *Un atajo que envejece es peor que no tenerlo: se confía en él.*
 */
const agregado = pkg.scripts?.verify ?? '';
const fuera = gates.filter((g) => !agregado.includes(`npm run ${g}`));
check(
  '`npm run verify` corre TODOS los gates',
  agregado !== '' && fuera.length === 0,
  fuera.length
    ? `fuera del atajo: ${fuera.join(', ')} — en local nadie recuerda ${gates.length} nombres`
    : `${gates.length} gates en un solo comando`,
);

/*
 * Y LOS DOS QUE NO SE LLAMAN `verify:*` (§174).
 *
 * Los dos candados de arriba filtran por el prefijo `verify:`, así que `typecheck` y `test` les eran
 * INVISIBLES — la mitad no cubierta de un gate que se leía como cobertura total ([[M-10]]). El precio
 * fue doble: `npm run verify` daba verde con 26 errores de tipos en `main`, y las 855 pruebas
 * unitarias —donde viven el gate del RNT, la prohibición del depósito en vivienda y la ventana de la
 * Ley 2300— no las corría NADIE en el CI. La red más grande del proyecto no estaba enchufada.
 *
 * Se comprueban las DOS puntas (CI y atajo local) porque fallaron por puntas distintas: `typecheck`
 * sí estaba en el CI y faltaba en el atajo; `test` faltaba en los dos.
 */
/*
 * ── SONDA: el CHECKER de tipos existe en el LOCKFILE (§175) ────────────────────────────────────
 *
 * QUÉ CAZA. Que `npm run typecheck` sea **decorativo**. `astro check` sin `@astrojs/check` instalado
 * NO falla: imprime «npm i @astrojs/check typescript — Continue?» y espera respuesta. En un CI sin
 * terminal esa pregunta se queda sin contestar y el proceso termina con **código 0**. El paso sale
 * ✅ y no ha mirado ni un archivo.
 *
 * 🔴 POR QUÉ HACE FALTA. Pasó: `@astrojs/check` estaba en el `node_modules` de la RAÍZ del repo —no
 * en el de `portal/`— así que en local Node lo encontraba subiendo un nivel y el gate funcionaba de
 * verdad; en el CI, que instala solo dentro de `portal/`, no existía. Cuatro corridas en verde sobre
 * un archivo con 26 errores de tipos, y el deploy salió. Medido en un worktree con `npm ci` limpio:
 * antes exit 0 sin mirar; después exit 1 con los 26. **Una dependencia que solo existe por la
 * disposición de carpetas del que programa no existe.**
 *
 * ⚠️ El `typescript` del lockfile tiene que estar dentro del peer de `@astrojs/check` (hoy ^5||^6;
 * Astro 7 pinea ^6.0.3). Si no, el checker LANZA — ruidoso, y eso está bien: lo que no se puede
 * tolerar es el silencio.
 */
const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));
const enLock = (n) => Boolean(lock.packages?.[`node_modules/${n}`]);
/*
 * `firebase-tools` está en la misma lista y por el mismo motivo (§177): `npm run test:rules` lo
 * invoca, y tampoco estaba declarado — funcionaba en local porque vive instalado a lo global en la
 * máquina de quien programa. Tercera vez en un día que un PRERREQUISITO DE UN GATE no está declarado;
 * a la tercera deja de ser mala suerte y pasa a ser una propiedad del repo que hay que vigilar.
 */
const faltan = ['@astrojs/check', 'typescript', 'firebase-tools'].filter((n) => !enLock(n));
check(
  'los prerrequisitos de los gates están en el LOCKFILE (si no, se apagan en silencio)',
  faltan.length === 0,
  faltan.length
    ? `ausente(s) del lockfile: ${faltan.join(', ')} — \`npm ci\` no los instala y el gate se apaga EN SILENCIO`
    : '',
);

for (const s of ['typecheck', 'typecheck:functions', 'test', 'test:rules']) {
  check(
    `\`npm run ${s}\` corre en el CI y en \`npm run verify\``,
    ci.includes(`npm run ${s}`) && agregado.includes(`npm run ${s}`),
    !ci.includes(`npm run ${s}`)
      ? `no está en portal-ci.yml — lo que no corre en CI no bloquea un despliegue`
      : !agregado.includes(`npm run ${s}`)
        ? `no está en \`npm run verify\` — el atajo diría «verde» sin haberlo mirado`
        : '',
  );
}


/*
 * ── SONDA: o dices `noindex`, o estás en el SITEMAP (§162) ─────────────────────────────────────
 *
 * QUÉ CAZA. Una página pública que nadie metió al sitemap. No rompe nada, no sale en ninguna
 * consola: simplemente Google tarda semanas en descubrirla, o no la descubre. `/nosotros` nació el
 * 26-ago, se enlazó desde el header y el pie de las 74 páginas… y quedó fuera del sitemap.
 *
 * 🔴 LO QUE HACE ESTE FALLO ESPECIALMENTE CRUEL: `sitemap.xml.ts` **predijo su propia avería**. Su
 * comentario dice, textualmente, que las zonas y los artículos se DERIVAN «porque el olvido más
 * común al añadir contenido es no meterlo al sitemap». La lista de páginas fijas siguió siendo
 * manual, y el olvido llegó por ahí. *Un comentario que nombra el riesgo no lo mitiga: lo documenta.*
 *
 * LA REGLA, y es una equivalencia en los DOS sentidos:
 *   · una página que NO declara `noindex` DEBE estar en el sitemap;
 *   · una página que SÍ lo declara NO puede estar.
 * Sin la segunda mitad, la primera se cumple metiéndolo todo — incluido el panel interno.
 *
 * ⚠️ SE MIRA EL FUENTE PARA `noindex`, no el HTML construido, y es deliberado: en un build de
 * staging TODAS las páginas llevan `noindex` (es lo que protege al staging, §90), así que el
 * artefacto no puede distinguir «interna» de «pública» y el gate pasaría siempre. Es el caso raro en
 * el que el fuente dice la verdad y el artefacto no.
 */
const PAGES_DIR = resolve(root, 'src/pages');
const sitemapPath = resolve(root, 'dist/client/sitemap.xml');

/**
 * Excepciones, cada una con su razón — que es la única forma honesta de excluir algo:
 * · `/404`   la página de error no se anuncia; se sirve con estado 404 y ya declara `noindex`.
 * · rutas con comodín (`[slug]`): sus URLs reales las derivan `ZONAS` y la colección del Journal,
 *   y eso ya se comprueba abajo contando las que SÍ salieron.
 */
const SIN_SITEMAP = new Set(['/404']);

function astroPages(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    const p = resolve(dir, n);
    if (statSync(p).isDirectory()) astroPages(p, acc);
    else if (n.endsWith('.astro')) acc.push(p);
  }
  return acc;
}

if (existsSync(sitemapPath)) {
  const xml = readFileSync(sitemapPath, 'utf8');
  const enSitemap = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/'),
  );

  const faltan = [];
  const sobran = [];
  for (const f of astroPages(PAGES_DIR)) {
    const rel = relative(PAGES_DIR, f).replace(/\\/g, '/').replace(/\.astro$/, '');
    if (rel.includes('[')) continue; // dinámicas: sus URLs se derivan, no se declaran
    const ruta = rel === 'index' ? '/' : `/${rel}`;
    if (SIN_SITEMAP.has(ruta)) continue;
    const src = readFileSync(f, 'utf8');
    const interna = /\bnoindex\b/.test(src);
    if (!interna && !enSitemap.has(ruta)) faltan.push(ruta);
    if (interna && enSitemap.has(ruta)) sobran.push(ruta);
  }

  const detalle = [
    faltan.length ? `PÚBLICAS y fuera del sitemap: ${faltan.join(', ')} → o entran en \`RUTAS\` de \`src/pages/sitemap.xml.ts\`, o llevan \`noindex\`` : '',
    sobran.length ? `\`noindex\` y ANUNCIADAS (le pides que indexe lo que le prohíbes): ${sobran.join(', ')}` : '',
  ].filter(Boolean).join(' · ');

  check(
    `sitemap ⇄ páginas: o \`noindex\`, o anunciada (${enSitemap.size} URLs)`,
    !faltan.length && !sobran.length,
    detalle,
  );
} else {
  console.log('ℹ️  sin `dist/client/sitemap.xml`: la sonda del sitemap no corre (el CI siempre lo tiene).');
}

/*
 * ── SONDA: NO SE ANUNCIA ALOJAMIENTO SIN RNT (§234) ─────────────────────────────────
 *
 * QUÉ CAZA. Un build de PRODUCCIÓN en el que una página anuncia hospedaje por días —precio y
 * formulario de reserva— sin el número de RNT a la vista. La Ley 300/1996 y su reglamento exigen
 * ese número en TODA publicidad de alojamiento turístico; sin él, la publicidad es irregular por
 * mucho que el inmueble exista y el precio sea correcto.
 *
 * POR QUÉ UN GATE Y NO UNA NOTA EN EL RUNBOOK. Hoy `/estancias` publica «$850.000 / noche» con su
 * formulario y sin RNT, y lo único que lo protege es que staging va `noindex`. Eso está escrito en
 * el brief del dueño como una pelota suya… y una pelota es una promesa, no un mecanismo: el día del
 * cutover la página se ve **perfecta** para un humano. Hermana exacta de las sondas #6
 * (indexabilidad) y del catálogo demo: las tres fallan igual, en silencio y con buen aspecto.
 *
 * 🎯 Y ES EL COMPLEMENTO DEL GATE DE LAS RULES (§234): allí se impide CREAR un alojamiento sin RNT;
 * aquí se impide PUBLICARLO. Un inmueble creado antes del gate, o una página escrita a mano, no
 * pasan por aquella puerta — pero sí por ésta, que mira el artefacto SERVIDO.
 *
 * NO muerde en staging, y es deliberado: mientras el sitio no es público la página con precio es un
 * andamio legítimo, igual que el catálogo demo. El día que se compile con `PUBLIC_SITE_ENV=production`
 * hay que tener el RNT o retirar el anuncio, que es exactamente la decisión que el gate fuerza.
 */
const SENAL_PRECIO = /\$\s?\d[\d.,]*\s*(?:\/|por\s)\s*noche/i;
const SENAL_RESERVA = /Solicitar estas fechas|Enviar solicitud|<form/i;

/** Recorre el HTML SERVIDO. No existia un helper para esto: `astroPages` mira el fuente. */
function htmlServido(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    const p = resolve(dir, n);
    if (statSync(p).isDirectory()) htmlServido(p, acc);
    else if (n.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const sinRnt = [];
if (ES_PROD) {
  for (const f of htmlServido(resolve(root, 'dist/client'))) {
    const html = readFileSync(f, 'utf8');
    /*
     * Se compara sobre el TEXTO, no sobre el marcado. La primera version buscaba el patron en el
     * HTML crudo y se le escapaba `/estancias`, donde el precio y «/ noche» viven en elementos
     * distintos: cazaba la portada y NO la pagina que el brief senalaba. Medir el marcado cuando
     * lo que importa es lo que LEE una persona ([[L-62]]).
     */
    const cuerpo = html
      .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, '')
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
    const texto = cuerpo.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    if (!SENAL_PRECIO.test(texto) || !SENAL_RESERVA.test(cuerpo)) continue;
    // El RNT puede escribirse de varias formas; se acepta cualquiera con su número al lado.
    if (/\bRNT\b[^.]{0,40}\d/i.test(texto)) continue;
    sinRnt.push(relative(resolve(root, 'dist/client'), f).replace(/\\/g, '/'));
  }
}
checks.push({
  name: ES_PROD
    ? 'ninguna pagina anuncia alojamiento por dias sin su RNT (Ley 300/1996)'
    : 'RNT en publicidad de alojamiento — no se juzga en staging (build no indexable)',
  ok: sinRnt.length === 0,
  detail: sinRnt.length
    ? `${sinRnt.length} pagina(s) con precio por noche y formulario, sin RNT: ${sinRnt.join(', ')}`
    : ES_PROD
      ? 'comprobado sobre el HTML servido'
      : 'se activa con PUBLIC_SITE_ENV=production',
});

/*
 * ── SONDA: NINGUNA IMAGEN PESADA EN LA RUTA CRÍTICA (§238) ──────────────────────────
 *
 * QUÉ CAZA. Una imagen de más de 20 KB que el navegador descarga ANTES del primer pintado sin ser
 * la que el visitante está esperando: sin `loading`, sin `srcset` que le deje elegir una variante
 * pequeña, y sin declararse como la LCP.
 *
 * POR QUÉ. La portada arrastraba dos miniaturas DECORATIVAS del mapa —329 KB y 109 KB, con `alt=""`
 * las dos y muy por debajo del pliegue— en la ruta crítica. No rompe nada y no sale en ninguna
 * consola: simplemente el sitio tarda más en un móvil con datos, que es como lo abre media
 * Cartagena. 438 KB para dos recuadros de adorno.
 *
 * LAS TRES EXCEPCIONES son las tres formas legítimas de estar ahí, y cada una dice algo distinto:
 *   · `fetchpriority="high"` — ES la LCP y la queremos cuanto antes (bajarla a perezosa EMPEORA).
 *   · `srcset` — el navegador elige una variante pequeña; el `src` grande es solo el respaldo.
 *     ⚠️ Sin esta excepción el gate reportaba **87 falsos**, incluido el logo en cada página.
 *   · `loading` — ya está fuera de la ruta crítica por decisión explícita.
 *
 * Se mira el HTML SERVIDO y no el fuente: lo que cuenta es lo que recibe el navegador.
 */
const TOPE_KB = 20;
const pesadas = [];
for (const f of htmlServido(resolve(root, 'dist/client'))) {
  const html = readFileSync(f, 'utf8').replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, '');
  for (const etiqueta of html.match(/<img[^>]*>/g) ?? []) {
    if (/loading=|srcset=|fetchpriority="high"/.test(etiqueta)) continue;
    const src = etiqueta.match(/src="(\/[^"]+)"/);
    if (!src) continue;
    const asset = resolve(root, 'dist/client', src[1].slice(1));
    if (!existsSync(asset)) continue;
    const kb = statSync(asset).size / 1024;
    if (kb > TOPE_KB) {
      pesadas.push(
        `${relative(resolve(root, 'dist/client'), f).replace(/\\/g, '/')} → ${Math.round(kb)} KB ${src[1]}`,
      );
    }
  }
}
checks.push({
  name: `ninguna imagen >${TOPE_KB} KB en la ruta critica (sin loading, sin srcset, sin ser la LCP)`,
  ok: pesadas.length === 0,
  detail: pesadas.length
    ? `${pesadas.length}: ${pesadas.slice(0, 4).join(' · ')}`
    : 'comprobado sobre el HTML servido de todas las paginas',
});

/*
 * ── SONDA: NINGUN CONTACTO QUE NO SEA EL DEL NEGOCIO (§241) ──────────────────────────────────
 *
 * EL DEFECTO QUE CAZA. El cerebro lleva escrito desde el principio que el movil PERSONAL del dueno
 * (un 323...) no se publica JAMAS, y que el publico es uno solo. Hasta hoy eso lo protegia el
 * cuidado de quien editaba: nada lo comprobaba. Y un numero personal en una web inmobiliaria no se
 * "corrige luego" — lo copian los agregadores, queda en la cache de Google y acaba llegando por
 * WhatsApp a desconocidos. Es la familia "promesa sin mecanismo", cerrada aqui de la unica forma
 * que ha funcionado en este proyecto: convirtiendo la promesa en un gate que bloquea.
 *
 * DE DONDE SALE LO PERMITIDO. De `src/lib/config/site.ts`, que es su dueno — NO se copia aqui. Si
 * manana cambia el numero del negocio, el gate lo sigue solo. Y si no consigue leerlo **revienta**
 * en vez de pasar: un gate que se queda sin referencia da el mismo verde que uno que no encuentra
 * nada, y ese es justo el fallo que [[L-64]] enumera.
 *
 * POR QUE NO GRITA EN FALSO. Se ignoran los `placeholder`, que son ejemplos DENTRO de un campo
 * vacio y nadie lee como contacto — hay cinco en el sitio y los cinco son legitimos. Medido ANTES
 * de cablearlo: 45 paginas, CERO fugas. La deuda arranca en cero, asi que este trinquete solo
 * puede proteger hacia adelante.
 */
const sitio = readFileSync(resolve(root, 'src/lib/config/site.ts'), 'utf8');
const waDeclarado = sitio.match(/whatsapp:\s*'([^']+)'/);
const mailDeclarado = sitio.match(/email:\s*'([^']+)'/);
if (!waDeclarado || !mailDeclarado) {
  console.error('\n❌ verify:build — no pude leer el contacto en src/lib/config/site.ts.');
  console.error('   Sin esa referencia la sonda de contacto pasaria en VERDE sin comparar con nada,');
  console.error('   que es exactamente lo que un gate no debe hacer. Arregla el fichero o la lectura.');
  process.exit(1);
}
const diezDigitos = (t) => t.replace(/[^0-9]/g, '').slice(-10);
const TEL_DEL_NEGOCIO = new Set([diezDigitos(waDeclarado[1])]);
const MAIL_DEL_NEGOCIO = mailDeclarado[1].toLowerCase();
const MOVIL_CO = /(?:\+?57)?[\s.-]?3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/g;
const CORREO_CUALQUIERA = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const fugas = [];
for (const f of htmlServido(resolve(root, 'dist/client'))) {
  const html = readFileSync(f, 'utf8');
  const limpio = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/placeholder="[^"]*"/gi, ' ');
  const pagina = relative(resolve(root, 'dist/client'), f).split(sep).join('/');
  for (const m of limpio.matchAll(MOVIL_CO)) {
    if (!TEL_DEL_NEGOCIO.has(diezDigitos(m[0]))) fugas.push(`${pagina} → tel ${diezDigitos(m[0])}`);
  }
  for (const m of limpio.matchAll(CORREO_CUALQUIERA)) {
    const c = m[0].toLowerCase();
    if (c !== MAIL_DEL_NEGOCIO && !c.endsWith('@altorrainmobiliaria.co')) fugas.push(`${pagina} → ${c}`);
  }
}
const fugasUnicas = [...new Set(fugas)];
checks.push({
  name: 'ningun telefono ni correo publicado que no sea el del negocio',
  ok: fugasUnicas.length === 0,
  detail: fugasUnicas.length
    ? `${fugasUnicas.length}: ${fugasUnicas.slice(0, 5).join(' · ')} — el movil PERSONAL del dueno no se publica JAMAS`
    : `contra ${waDeclarado[1]} y ${MAIL_DEL_NEGOCIO}, leidos de site.ts; los placeholder no cuentan`,
});

/*
 * ── SONDA: EL STYLEGUIDE DE DESARROLLO NO VIAJA A PRODUCCION (§242) ──────────────────────────
 *
 * `design-system.astro` redirige a la home cuando PUBLIC_SITE_ENV=production, asi que su HTML
 * queda en un redirect de ~284 bytes. Esta sonda es el RESPALDO de ese mecanismo: si manana
 * alguien renombra la variable, mueve la ruta o quita la guardia, el styleguide volveria a
 * emitirse entero y nadie se enteraria — un mecanismo que deja de funcionar en silencio es lo
 * mismo que no tenerlo. Se mide por CONTENIDO (¿siguen ahi las muestras de color?) y no por
 * tamano, porque un umbral de KB se ajusta solo cuando molesta.
 *
 * Como la guardia depende del entorno, esto solo se juzga en produccion — y su nombre lo dice,
 * para que el verde de staging no se lea como «comprobado» ([[L-65]]).
 */
const styleguideEnProd = [];
if (ES_PROD) {
  const f = resolve(root, 'dist/client/design-system/index.html');
  if (existsSync(f)) {
    const html = readFileSync(f, 'utf8');
    // El redirect legitimo no menciona los tokens; el styleguide los enumera uno por uno.
    if (/--alt-navy|Design System D1/.test(html)) styleguideEnProd.push(`${html.length} bytes`);
  }
}
checks.push({
  name: ES_PROD
    ? 'el styleguide de desarrollo NO viaja a produccion'
    : 'styleguide fuera de produccion — no se juzga en staging (ahi debe estar)',
  ok: styleguideEnProd.length === 0,
  detail: styleguideEnProd.length
    ? `/design-system se emitio ENTERO (${styleguideEnProd[0]}): la guardia de design-system.astro dejo de funcionar`
    : ES_PROD
      ? 'comprobado sobre el HTML servido'
      : 'se activa con PUBLIC_SITE_ENV=production',
});

/*
 * ── SONDA: NINGUN ENLACE INTERNO APUNTA A UNA RUTA QUE NO EXISTE (§243) ──────────────────────
 *
 * EL DEFECTO QUE CAZA. `verify:enlaces` comprueba las ANCLAS (`#id`) y este comprueba las RUTAS,
 * que es otra cosa: un `href="/ficha"` cuyo destino se renombra no rompe nada al construir —el
 * build pasa, la pagina se pinta, el enlace se ve igual— y empieza a dar 404 a los visitantes.
 * En un sitio estatico no hay ningun momento en que eso falle solo. Medido hoy: **38** enlaces
 * apuntan a `/ficha`, o sea que si esa ruta se mueve muere el boton principal del sitio.
 *
 * COMO EVITA EL FALSO POSITIVO. Las paginas SSR no viven en `dist/client` —las compone el worker—
 * asi que se veian como rotas. La lista de rutas SSR NO se escribe aqui: se DERIVA leyendo que
 * `.astro` de `src/pages` declara `prerender = false`. Si manana una pagina pasa a SSR, el gate se
 * entera solo; y si la lectura no encuentra ninguna, **revienta** en vez de dar verde, porque una
 * lista vacia haria que todo enlace SSR se marcara roto o —peor— que un cambio en el formato la
 * dejara sin excluir nada sin que nadie lo note ([[L-65]] regla 5).
 *
 * Medido antes de cablearlo: 45 paginas, 2 rutas sin resolver y las 2 SSR legitimas → deuda CERO.
 */
const paginasFuente = readdirSync(resolve(root, 'src/pages'), { withFileTypes: true })
  .filter((d) => d.isFile() && d.name.endsWith('.astro'))
  .map((d) => d.name);
if (!paginasFuente.length) {
  console.error('\n❌ verify:build — no encontre paginas en src/pages: la sonda de enlaces internos');
  console.error('   se quedaria sin saber cuales son SSR y marcaria rotas las que si existen.');
  process.exit(1);
}
const RUTAS_SSR = new Set(
  paginasFuente
    .filter((n) => /export const prerender = false/.test(readFileSync(resolve(root, 'src/pages', n), 'utf8')))
    .map((n) => '/' + n.replace(/\.astro$/, '').replace(/^index$/, '')),
);

/*
 * ⚠️ TODO lo servido, no solo el HTML. La primera version construyo este conjunto con
 * `htmlServido()` y marco roto `/favicon.svg`, que existe: un enlace puede apuntar a un SVG, un
 * PDF o una imagen igual que a una pagina. Un gate que nace gritando en falso se ignora en una
 * semana, asi que el falso positivo se arregla ANTES de cablearlo, no despues (§238).
 */
function todoServido(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    const p = resolve(dir, n);
    if (statSync(p).isDirectory()) todoServido(p, acc);
    else acc.push(p);
  }
  return acc;
}
const servidas = new Set();
for (const f of todoServido(resolve(root, 'dist/client'))) {
  const rel = '/' + relative(resolve(root, 'dist/client'), f).split(sep).join('/');
  servidas.add(rel);
  if (rel.endsWith('/index.html')) {
    const dir = rel.slice(0, -'index.html'.length);
    servidas.add(dir);
    servidas.add(dir.replace(/\/$/, '') || '/');
  }
}
const rutasRotas = new Map();
for (const f of htmlServido(resolve(root, 'dist/client'))) {
  const html = readFileSync(f, 'utf8');
  const origen = relative(resolve(root, 'dist/client'), f).split(sep).join('/');
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const ruta = m[1];
    if (ruta.startsWith('/_astro/') || ruta.startsWith('/_blob') || RUTAS_SSR.has(ruta)) continue;
    const candidatas = [ruta, ruta + '/', ruta.replace(/\/$/, ''), ruta.replace(/\/$/, '') + '/index.html'];
    if (candidatas.some((c) => servidas.has(c))) continue;
    if (!rutasRotas.has(ruta)) rutasRotas.set(ruta, new Set());
    rutasRotas.get(ruta).add(origen);
  }
}
checks.push({
  name: 'ningun enlace interno apunta a una ruta que no existe',
  ok: rutasRotas.size === 0,
  detail: rutasRotas.size
    ? [...rutasRotas].slice(0, 4).map(([r, d]) => `${r} (desde ${[...d][0]})`).join(' · ')
    : `${servidas.size} destino(s) servidos + ${RUTAS_SSR.size} ruta(s) SSR derivadas de prerender=false`,
});

/*
 * ── SONDA: UN SOLO <h1> POR PAGINA ANUNCIADA, Y SIN SALTOS DE NIVEL (§247) ───────────────────
 *
 * EL DEFECTO QUE CAZA. La PORTADA tenia **cuatro** `<h1>`, todos visibles: no es un carrusel, son
 * cuatro banners a pantalla completa apilados —uno por linea de negocio— y cada uno traia el suyo.
 * Google veia cuatro titulos principales en la pagina mas importante del sitio, y un lector de
 * pantalla anunciaba cuatro niveles 1. No rompe nada, no sale en consola, y se ve perfecto.
 *
 * POR QUE SOLO LAS ANUNCIADAS. `/gestion` tiene NUEVE `<h1>` y `/ingresar` dos, y los dos estan
 * BIEN: son paneles que se muestran de uno en uno, asi que en cada momento hay exactamente uno
 * visible. Un gate que contara `<h1>` a secas los marcaria en falso — y modelar visibilidad de
 * ancestros es justo donde estas sondas se equivocan. La regla limpia sale sola: se juzgan las
 * paginas que el SITEMAP anuncia, que son las publicas e indexables, donde ese patron no existe.
 *
 * Medido antes de cablearlo: 38 paginas anunciadas con HTML, **cero** problemas tras arreglar la
 * portada (4 h1 → 1 h1 + 3 h2; el CSS es todo por clase, asi que el cambio es invisible).
 */
const smPath = ['sitemap.xml', 'sitemap-index.xml', 'sitemap-0.xml']
  .map((n) => resolve(root, 'dist/client', n))
  .find((p) => existsSync(p));
if (!smPath) {
  console.error('\n❌ verify:build — no encontre el sitemap en dist/client.');
  console.error('   La sonda de encabezados saca de ahi que paginas son publicas; sin el juzgaria');
  console.error('   CERO paginas y saldria en verde sin mirar nada.');
  process.exit(1);
}
const rutasSitemap = [...readFileSync(smPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''));

const encabezadosMal = [];
let juzgadas = 0;
for (const ruta of rutasSitemap) {
  const limpia = ruta.replace(/^\/+|\/+$/g, '');
  const f = resolve(root, 'dist/client', limpia ? `${limpia}/index.html` : 'index.html');
  if (!existsSync(f)) continue; // SSR: la compone el worker, no hay HTML que abrir
  juzgadas += 1;
  const html = readFileSync(f, 'utf8')
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const niveles = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const unos = niveles.filter((n) => n === 1).length;
  const salto = niveles.slice(1).find((n, i) => n > niveles[i] + 1);
  if (unos !== 1) encabezadosMal.push(`${ruta} tiene ${unos} <h1>`);
  else if (salto) encabezadosMal.push(`${ruta} salta a h${salto}`);
}
checks.push({
  name: 'un solo <h1> por pagina anunciada, y sin saltos de nivel',
  ok: encabezadosMal.length === 0,
  detail: encabezadosMal.length
    ? `${encabezadosMal.length}: ${encabezadosMal.slice(0, 4).join(' · ')}`
    : `${juzgadas} pagina(s) del sitemap con HTML (de ${rutasSitemap.length} anunciadas; el resto es SSR)`,
});

/*
 * ── SONDA: TODA IMAGEN CON `alt`, TODO CAMPO CON NOMBRE ACCESIBLE (§248) ─────────────────────
 *
 * EL DEFECTO QUE CAZA. Una tarjeta nueva sin `alt` o un campo nuevo sin etiqueta no rompen nada:
 * el build pasa, la pagina se pinta igual, y lo unico que ocurre es que quien navega con lector de
 * pantalla deja de saber que hay ahi. Es la clase de regresion que entra con cada formulario nuevo
 * y que nadie ve, porque quien la introduce no usa lector de pantalla.
 *
 * 🔴 LOS TRES FALSOS POSITIVOS QUE HUBO QUE QUITAR ANTES DE CABLEARLO (§248.2). Mi primera version
 * reporto 3 imagenes sin `alt` y 25 campos sin etiqueta. Los 28 eran MIOS:
 *   (a) las 3 imagenes viven dentro de un `<template>`: son marcadores que rellena el JS, con
 *       `src` y `alt` SIN valor a proposito. El navegador no pinta eso.
 *   (b) 24 campos van ENVUELTOS en su `<label>` — asociacion implicita, valida y que los lectores
 *       de pantalla entienden. Buscar solo `for="id"` los marcaba a todos.
 *   (c) el que quedaba es un `<input type="file" hidden>` que dispara un boton visible: al estar
 *       oculto no entra en el arbol de accesibilidad y su nombre lo pone el boton.
 * *Una sonda que no modela la estructura real de la pagina mide otra cosa y lo dice con aplomo.*
 *
 * Medido tras corregirla: **303 imagenes pintadas y 124 campos**, CERO sin nombre. Deuda cero.
 */
const sinAlt = [];
const sinNombreAccesible = [];
let imagenesVistas = 0;
let camposVistos = 0;
for (const f of htmlServido(resolve(root, 'dist/client'))) {
  const pagina = relative(resolve(root, 'dist/client'), f).split(sep).join('/');
  const pintado = readFileSync(f, 'utf8')
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  for (const m of pintado.matchAll(/<img\b([^>]*)>/gi)) {
    imagenesVistas += 1;
    if (!/\balt\s*=/i.test(m[1])) sinAlt.push(`${pagina}: <img ${m[1].trim().slice(0, 40)}>`);
  }
  const envolturas = [...pintado.matchAll(/<label\b[\s\S]*?<\/label>/gi)].map((m) => [m.index, m.index + m[0].length]);
  for (const m of pintado.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const attrs = m[2];
    // `hidden` y los botones no piden un dato ni entran en el arbol de accesibilidad.
    if (/\bhidden\b/i.test(attrs) || /type\s*=\s*["']?(hidden|submit|button|image|reset)/i.test(attrs)) continue;
    camposVistos += 1;
    if (/aria-label\s*=|aria-labelledby\s*=/i.test(attrs)) continue;
    if (envolturas.some(([a, b]) => m.index >= a && m.index < b)) continue;
    const id = attrs.match(/\bid\s*=\s*["']([^"']+)/i);
    if (id && pintado.includes(`for="${id[1]}"`)) continue;
    sinNombreAccesible.push(`${pagina}: <${m[1]} ${attrs.trim().slice(0, 40)}>`);
  }
}
const faltas = [...sinAlt, ...sinNombreAccesible];
checks.push({
  name: 'toda imagen con alt y todo campo con nombre accesible',
  ok: faltas.length === 0,
  detail: faltas.length
    ? `${faltas.length}: ${faltas.slice(0, 3).join(' · ')}`
    : `${imagenesVistas} imagen(es) y ${camposVistos} campo(s) PINTADOS (fuera: <template>, y los input hidden, que no entran al arbol)`,
});

/*
 * ── SONDA: LA VISTA PREVIA AL COMPARTIR EXISTE Y ES HORIZONTAL (§249) ────────────────────────
 *
 * POR QUE IMPORTA EN ESTE NEGOCIO. Los clientes de ALTORRA llegan por WhatsApp. Un enlace cuya
 * `og:image` no existe no muestra tarjeta, y uno con imagen VERTICAL sale recortado: la tarjeta de
 * enlace es horizontal. Meta lo documenta —minimo 200x200, "at least 1200 x 630 pixels for the best
 * display", maximo 8 MB— y esas cifras se leyeron de su pagina de webmasters, no de memoria.
 *
 * ⚠️ LO QUE ESTA SONDA **NO** SABE: si WhatsApp renderiza `.webp` en la tarjeta. Las 7 imagenes del
 * sitio son webp y la documentacion de Meta **no dice nada de formatos**, asi que aqui no se afirma
 * ni una cosa ni la otra — se deja escrito que esta SIN COMPROBAR, que es lo honesto (§3.3).
 *
 * DEUDA CONGELADA. Seis articulos del journal usan como `og:image` su PORTADA, que es vertical
 * (896x1200). Cambiarlas es una decision de contenido —las unicas horizontales son los tres heroes,
 * asi que todos los articulos compartirian vista previa— y por eso NO se toca aqui: se congelan con
 * su motivo y **una nueva bloquea**. El trinquete impide que crezca sin decidir por el dueno.
 */
const OG_VERTICAL_CONGELADAS = new Set([
  'journal/comprar-para-rentar-cartagena/index.html',
  'journal/costos-de-cerrar-compraventa-cartagena/index.html',
  'journal/cuanto-puede-subir-el-arriendo/index.html',
  'journal/firmar-no-es-registrar/index.html',
  'journal/matricula-de-arrendador/index.html',
  'journal/por-que-no-decimos-avaluo/index.html',
]);

/** Ancho y alto de un `.webp` leyendo su cabecera; null si no se puede. */
function dimensionesWebp(p) {
  const b = readFileSync(p).subarray(0, 64);
  if (b.subarray(0, 4).toString('latin1') !== 'RIFF') return null;
  const fmt = b.subarray(12, 16).toString('latin1');
  if (fmt === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  if (fmt === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (fmt === 'VP8L') {
    const v = b.readUInt32LE(21);
    return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1];
  }
  return null;
}

const ogMal = [];
let ogVistas = 0;
for (const f of htmlServido(resolve(root, 'dist/client'))) {
  const html = readFileSync(f, 'utf8');
  const m = html.match(/property=["']og:image["']\s+content=["']([^"']+)/i);
  if (!m) continue;
  const pagina = relative(resolve(root, 'dist/client'), f).split(sep).join('/');
  ogVistas += 1;
  const ruta = m[1].replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '');
  const local = resolve(root, 'dist/client', ruta);
  if (!existsSync(local)) {
    ogMal.push(`${pagina}: og:image NO EXISTE (${m[1]})`);
    continue;
  }
  const d = ruta.endsWith('.webp') ? dimensionesWebp(local) : null;
  if (!d) continue; // otro formato: no se juzga aqui en vez de inventar la medida
  const [w, h] = d;
  if (w < 200 || h < 200) ogMal.push(`${pagina}: ${w}x${h}, bajo el minimo 200x200 de Meta`);
  else if (w < h && !OG_VERTICAL_CONGELADAS.has(pagina)) {
    ogMal.push(`${pagina}: ${w}x${h} es VERTICAL y la tarjeta de enlace es horizontal`);
  }
}
checks.push({
  name: 'la vista previa al compartir existe y es horizontal',
  ok: ogMal.length === 0,
  detail: ogMal.length
    ? `${ogMal.length}: ${ogMal.slice(0, 3).join(' · ')}`
    : `${ogVistas} pagina(s) con og:image; ${OG_VERTICAL_CONGELADAS.size} vertical(es) CONGELADAS (journal, decision del dueno) — una nueva bloquea`,
});

let failed = 0;
for (const c of checks) {
  console.log(`${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
  if (!c.ok) failed++;
}
if (failed) {
  console.error(`\n❌ verify:build — ${failed} verificación(es) fallaron: cableado híbrido roto (R2/R3).`);
  process.exit(1);
}
console.log('\n✅ verify:build — cableado híbrido correcto (estática + SSR).');
