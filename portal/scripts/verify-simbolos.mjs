#!/usr/bin/env node
/*
 * GEMELOS — símbolos EXPORTADOS con el mismo nombre desde módulos distintos (§178).
 *
 * QUÉ CAZA. La clase de §176: `ESTADOS_MANDATO` declarado en `mandato.ts` y en `wompi-evento.ts`,
 * con miembros DISTINTOS, exportados con el mismo nombre desde la misma carpeta. Nadie los consumía
 * todavía y por eso nada fallaba — pero el primer consumidor iba a importar de los dos.
 *
 * POR QUÉ NINGÚN OTRO GATE PUEDE VERLO. Cada declaración es **legítima por separado**: no hay ruta
 * rota, ni tipo incompatible, ni prueba que falle. El único indicio es que dos cosas se llamen igual,
 * y eso solo se ve mirando el conjunto. `tsc` no se queja porque no hay conflicto: hay dos módulos.
 *
 * LO QUE HACE PELIGROSO A UN GEMELO, en orden:
 *   1. Mismo nombre, MISMO tipo, valor distinto → importar el equivocado **compila** y cambia el
 *      comportamiento en silencio (el caso de `TOPE_BYTES`: 10 MB y 3 MB).
 *   2. Mismo nombre, mismo tipo, salida distinta → texto «casi bien» (era `etiquetaTipo`: singular en
 *      la ficha, plural en las alertas. «Tipo: Apartamentos» se lee casi bien, que es lo peor).
 *   3. Mismo nombre, tipos distintos → el compilador lo caza; molesto, no peligroso.
 *
 * DEUDA CONGELADA, como el linter del cerebro con las filas del índice: los gemelos que hoy son
 * legítimos están declarados abajo con su motivo. El gate falla si aparece uno NUEVO. Declarar una
 * excepción con su porqué es la tercera salida de [[M-25]] — no un gate, no un silencio: un [HONOR]
 * explícito que además se cuenta.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const SRC = join(raiz, 'src');

/**
 * Gemelos ACEPTADOS, con el motivo. Si uno deja de existir, este gate lo dice para que se pode.
 * ⚠️ Añadir aquí es una decisión, no un trámite: el motivo tiene que explicar por qué importar el
 * equivocado NO puede hacer daño en silencio.
 */
const ACEPTADOS = new Map([
  ['prerender', 'Convención de rutas de Astro: cada página declara la suya.'],
  ['GET', 'Convención de rutas de Astro: un handler por endpoint.'],
  ['POST', 'Convención de rutas de Astro: un handler por endpoint.'],
  ['explicarProblema', 'Tres enums de problemas distintos; importar el equivocado NO compila.'],
  ['urgencia', 'Entidades distintas (mandato · perfiles · ventas) con firmas distintas.'],
  ['vigente', 'Documento de expediente vs. soporte de perfil: tipos distintos, el compilador los separa.'],
  ['faltantes', 'Documento de expediente vs. soporte de perfil: tipos distintos.'],
  [
    'TOPE_BYTES',
    '⚠️ RIESGO DECLARADO, no resuelto: 10 MB (escaneo de expediente) vs 3 MB (imagen de inmueble). ' +
      'Mismo tipo y valor distinto — la clase 1. Se deja porque tiene ~10 consumidores y cada uno ' +
      'importa por ruta explícita; si algún día se toca esa zona, renombrarlos a ' +
      '`TOPE_BYTES_DOCUMENTO` / `TOPE_BYTES_IMAGEN` es el arreglo.',
  ],
]);

const PATRON =
  /^export\s+(?:declare\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm;

function ficheros(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...ficheros(p));
    else if (e.endsWith('.ts') && !e.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

const porNombre = new Map();
for (const f of ficheros(SRC)) {
  const texto = readFileSync(f, 'utf8');
  for (const m of texto.matchAll(PATRON)) {
    const nombre = m[1];
    if (!porNombre.has(nombre)) porNombre.set(nombre, new Set());
    porNombre.get(nombre).add(relative(raiz, f).replace(/\\/g, '/'));
  }
}

const colisiones = [...porNombre.entries()]
  .filter(([, mods]) => mods.size > 1)
  .map(([nombre, mods]) => ({ nombre, mods: [...mods].sort() }));

const nuevos = colisiones.filter((c) => !ACEPTADOS.has(c.nombre));
const desaparecidos = [...ACEPTADOS.keys()].filter((n) => !colisiones.some((c) => c.nombre === n));

if (nuevos.length) {
  console.error('❌ verify:simbolos — GEMELOS nuevos: el mismo nombre exportado desde módulos distintos:\n');
  for (const c of nuevos) {
    console.error(`   ${c.nombre}`);
    for (const m of c.mods) console.error(`        ${m}`);
  }
  console.error(
    '\n   Ningún otro gate ve esto: las dos declaraciones son legítimas por separado (§176, §178).',
  );
  console.error('   Arréglalo dándole UN dueño y derivando el otro, o renómbralos para que digan en qué se diferencian.');
  console.error('   Si de verdad es inofensivo, decláralo en ACEPTADOS de este archivo CON su motivo.');
  process.exit(1);
}

for (const n of desaparecidos) {
  console.log(`ℹ️  verify:simbolos — «${n}» ya no colisiona: quítalo de ACEPTADOS (la deuda declarada también se poda).`);
}

console.log(
  `✅ verify:simbolos — ${porNombre.size} símbolos exportados; ${colisiones.length} gemelo(s), todos declarados con su motivo.`,
);
