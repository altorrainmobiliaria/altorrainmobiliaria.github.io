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
