#!/usr/bin/env node
/*
 * HUÉRFANOS — módulos de `src/lib` que NADIE importa, salvo su propia prueba (§222).
 *
 * QUÉ CAZA. `preaviso.ts` y `certificacion.ts`: 283 líneas de dominio, tipadas, con 284 líneas de
 * pruebas que pasan… y **cero consumidores**. Cada uno materializa una obligación legal con
 * consecuencia real —la del preaviso prorroga el contrato un año si falta la fecha de imposición—,
 * así que el código no era deuda técnica: era **una obligación que la empresa cree cumplida porque
 * «está programada»**.
 *
 * POR QUÉ NINGÚN OTRO GATE LO VE. `tsc` compila un módulo que nadie usa. `test` pasa: la prueba lo
 * importa. `verify:simbolos` lo cuenta entre los exportados. 🎯 **Lo que mantiene vivo al módulo es
 * su propio test** — la suite lo valida CONTRA SÍ MISMO, y el ✅ resultante es idéntico al de un
 * módulo que el producto usa cada día. La pregunta «¿quién lo importa, aparte de su test?» no la
 * hace ningún gate por defecto.
 *
 * CÓMO RESUELVE, y por qué así. Los imports se **resuelven a RUTA**, no se comparan por nombre. Al
 * medir esto a mano, dos veces seguidas, comparar por nombre dio resultados falsos: primero porque
 * `functions/src/pagos-webhook.ts` —que sí importa el módulo de dominio homónimo— se descartaba «por
 * ser el módulo mismo»; y antes porque saltar «cualquier carpeta llamada lib» (para esquivar el
 * compilado) se llevó por delante `src/lib` entera. Es la misma clase de fallo que el chequeo #27
 * del kernel tenía y que §221 corrigió: **coincidencia por NOMBRE donde hacía falta RUTA**.
 *
 * DEUDA CONGELADA, igual que los gemelos de `verify:simbolos`: los huérfanos de hoy están declarados
 * abajo CON su motivo y su plan. El gate falla si aparece uno NUEVO. Congelar no es perdonar: es
 * impedir que la lista crezca mientras se paga.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');

/**
 * Huérfanos ACEPTADOS hoy, con motivo y salida. Si uno deja de serlo, el gate lo dice para podarlo.
 * ⚠️ Añadir aquí es una decisión que se explica, no un trámite para que el CI calle.
 */
const ACEPTADOS = new Map([
  [
    'src/lib/domain/preaviso.ts',
    'Ley 820 arts. 22.7 y 24: falta la pantalla que registre operador, guía y fecha de IMPOSICIÓN. ' +
      'Mockup YA ESCRITO (design/mockups/ALTORRA Preaviso.dc.html, 26-ago); espera la aprobación ' +
      'de Daniel para construirse — nunca UI sin mockup aprobado (§222).',
  ],
  [
    'src/lib/domain/certificacion.ts',
    'D.1625/2016 art. 1.2.4.11: DECIDIDO que es pantalla imprimible de /gestion, no una tubería de ' +
      'PDF. Mockup YA ESCRITO (ALTORRA Certificacion.dc.html, 26-ago); espera aprobación (§222).',
  ],
]);

/** Fuentes que pueden ser CONSUMIDORAS. `functions/lib` es el compilado: no cuenta como uso. */
const BASES = ['src', 'functions/src', 'scripts'];
const EXCLUIR = ['functions/lib'];
const EXT_FUENTE = ['.ts', '.astro', '.mjs', '.js'];

function ficheros(dir, filtro) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (e.startsWith('.') || e === 'node_modules') continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...ficheros(p, filtro));
    else if (filtro(e)) out.push(p);
  }
  return out;
}

const rel = (p) => relative(raiz, p).replace(/\\/g, '/');

const fuentes = BASES.flatMap((b) => ficheros(join(raiz, b), (e) => EXT_FUENTE.some((x) => e.endsWith(x))))
  .filter((p) => !EXCLUIR.some((x) => rel(p).startsWith(x)));

const modulos = ficheros(join(raiz, 'src', 'lib'), (e) => e.endsWith('.ts') && !e.endsWith('.test.ts'));

/** Resuelve un especificador relativo a la ruta real del fichero, como hace el bundler. */
function resolverImport(desde, spec) {
  if (!spec.startsWith('.')) return null;              // paquete de node_modules: no es asunto nuestro
  const base = resolve(dirname(desde), spec);
  for (const cand of [base, `${base}.ts`, join(base, 'index.ts')]) {
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  }
  return null;
}

const consumidoresDe = new Map(modulos.map((m) => [m, new Set()]));
const ESPEC = /(?:from|import)\s+['"]([^'"]+)['"]/g;

for (const f of fuentes) {
  const texto = readFileSync(f, 'utf8');
  for (const m of texto.matchAll(ESPEC)) {
    const destino = resolverImport(f, m[1]);
    if (!destino || !consumidoresDe.has(destino)) continue;
    // el propio módulo y su prueba NO cuentan como uso: es lo que hace que un muerto parezca vivo
    const propioTest = `${destino.slice(0, -3)}.test.ts`;
    if (f === destino || f === propioTest) continue;
    consumidoresDe.get(destino).add(rel(f));
  }
}

const huerfanos = modulos.filter((m) => consumidoresDe.get(m).size === 0).map(rel).sort();
const nuevos = huerfanos.filter((h) => !ACEPTADOS.has(h));
const resueltos = [...ACEPTADOS.keys()].filter((h) => !huerfanos.includes(h));

if (nuevos.length) {
  console.error('❌ verify:huerfanos — módulo(s) de `src/lib` que NADIE importa (su prueba no cuenta):\n');
  for (const h of nuevos) console.error(`   ${h}`);
  console.error('\n   Un módulo con prueba propia y cero consumidores pasa `typecheck`, `test` y `verify:simbolos`:');
  console.error('   la suite lo valida contra sí mismo y el ✅ es idéntico al de un módulo vivo (§222).');
  console.error('   Cabléalo a su pantalla o flujo, retíralo, o decláralo abajo en ACEPTADOS CON su motivo y su salida.');
  process.exit(1);
}

/*
 * Un ACEPTADO deja de ser huérfano por DOS caminos —ganó consumidor, o el fichero ya no está— y
 * decir «ya tiene consumidor» sobre uno borrado es una afirmación falsa dicha por un ✅. Se
 * distinguen mirando el disco, que es la única fuente que sabe cuál de los dos fue.
 */
for (const h of resueltos) {
  const sigue = existsSync(join(raiz, h));
  console.log(
    sigue
      ? `ℹ️  verify:huerfanos — «${h}» ya tiene consumidor: quítalo de ACEPTADOS (la deuda declarada también se poda).`
      : `ℹ️  verify:huerfanos — «${h}» ya NO existe: quítalo de ACEPTADOS. No ganó consumidor, se retiró.`,
  );
}

console.log(
  `✅ verify:huerfanos — ${modulos.length} módulo(s) de \`src/lib\` contra ${fuentes.length} fichero(s) fuente; ` +
    `${modulos.length - huerfanos.length} con consumidor real, ${huerfanos.length} huérfano(s) declarado(s) con su motivo.`,
);
