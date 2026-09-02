#!/usr/bin/env node
/*
 * ===========================================================================================
 * 🧲 prompt-router — PILOTO de `UserPromptSubmit` (F3 · D8c) · NO ESTÁ CABLEADO
 * ===========================================================================================
 *
 * QUÉ ES. Un MATCHER, no un oráculo. Recibe el prompt del usuario, lo cruza con las filas
 * «síntoma» del índice del maestro (`brain-private/maestro/indice/*.md`, precompiladas en
 * `maestro/.indice-cache.json`) por SOLAPE DE PALABRAS-IMÁN, y propone hasta 3 filas. No
 * interpreta, no resume, no llama a nadie y no toca la red: cuenta términos comunes y pesa
 * cada uno por lo raro que es en el corpus.
 *
 * QUÉ NO ES, y por qué importa. No decide qué leer ni afirma que la fila aplique: el texto que
 * imprime dice «quizá» porque un matcher léxico no sabe de qué va tu tarea. La condición #2 del
 * PLAN §2 —≥70 % de propuestas útiles y 0 % dañinas medidas sobre prompts REALES— existe justo
 * porque una fila que desoriente cuesta el doble que el silencio. Mientras esa medida no la
 * juzgue Fable, esto vive APAGADO (`x-promptRouter.enabled: false`) y sin una línea en
 * `.claude/settings.json`.
 *
 * DÓNDE ESTÁN LOS INTERRUPTORES. En `docs/.brain-manifest.json`:
 *   · `x-promptRouter.enabled`  — apagador. En `false` el hook sale en silencio (código 0).
 *   · `x-promptRouter.maxChars` — tope duro de la salida. Lo que no cabe NO se imprime.
 * (Prefijo `x-` por el schema del kernel: config de un gate PROPIO de este repo, no del kernel
 * compartido por los cuatro. Se acepta también `promptRouter` a secas, que es como lo nombra
 * el PLAN §2, para que el nombre del plan no quede colgando.)
 *
 * DE DÓNDE SALE EL TOKENIZADOR. Del propio cache, no de aquí. El cache lo genera
 * `brain-private/scripts/indice-cache.mjs` y lleva dentro su versión, su longitud mínima y sus
 * stopwords: este fichero solo APLICA esos parámetros. Si la versión no es una que sepa leer,
 * calla — tokenizar distinto que el índice no da un matcher peor, da uno que no matchea.
 *
 * COSTO. Corre en cada prompt, así que: cero red, cero `git`, una sola lectura de fichero
 * (~82 KB de JSON) y un barrido lineal de 228 filas. Medido → ver el crudo del piloto en
 * `../brain-private/altorrainmobiliaria/research-archive/2026-09-02-f3-piloto-precision.md`.
 *
 * Uso:
 *   node hooks/prompt-router.mjs "mi gate paso en verde y no miro nada"
 *   echo '{"prompt":"…"}' | node hooks/prompt-router.mjs      (forma del hook del harness)
 *   echo 'texto suelto'   | node hooks/prompt-router.mjs
 * Y como módulo (lo usa el script de precisión):  import { rutear } from './prompt-router.mjs'
 * ===========================================================================================
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));   // raíz del repo
const MANIFEST = join(RAIZ, 'docs', '.brain-manifest.json');
const VERSION_TOKENIZADOR_SOPORTADA = 1;

// ── Umbrales del matcher. Los tres son la diferencia entre ayudar y desorientar ────────────
// `MIN_ESPECIFICOS` es la regla del PLAN §2 («≥2 términos no triviales»): NO basta con dos
// palabras compartidas si las dos son de las que aparecen en media bóveda. Un término cuenta
// como no-trivial si su frecuencia documental no pasa de `DF_TRIVIAL` (fracción de las filas).
// `MIN_PUNTOS` es el suelo de la suma de idf: mata el caso de dos términos medianos que casan
// por casualidad. Ambos se afinaron contra 60 prompts REALES (crudo del piloto), no a ojo.
const MIN_ESPECIFICOS = 2;
const DF_TRIVIAL = 0.12;
const MIN_PUNTOS = 6.0;
const MAX_FILAS = 3;

// ── El segundo punto de operación, MEDIDO, que NO elige este fichero ───────────────────────
// `x-promptRouter.exigirFrase` exige además un BIGRAMA compartido: dos palabras CONSECUTIVAS
// («segundo plano», «revisión adversarial»). Medido sobre 84 prompts reales del PC:
//   · sin frase (lo que pide el PLAN §2 literal): habla en 14/84, y menos de la mitad de las
//     propuestas son útiles — con casos claramente dañinos por homonimia (`out` de
//     «out-of-scope» casando con `out` de «fan-out»).
//   · con frase: habla en 3/84 y las 3 propuestas dan en el clavo.
// Precisión y cobertura tiran en direcciones opuestas y el umbral del plan (≥70 % útiles, 0 %
// dañinas) solo lo pasa el segundo. Cuál se cablea NO lo decide el piloto: los dos números
// están en el crudo y la elección es de quien dictamina. Default = la regla del plan.
const EXIGIR_FRASE_DEFECTO = false;

const leerJSON = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };

/** Config del piloto. `x-promptRouter` es el nombre canónico; `promptRouter` se acepta (PLAN §2). */
export function config() {
  const m = leerJSON(MANIFEST) || {};
  const c = m['x-promptRouter'] || m.promptRouter || {};
  // De dónde sale la bóveda: del `archiveDir` que YA declara el manifest, no de una segunda
  // copia de la misma ruta. `…/brain-private/<repo>/research-archive` → sube dos.
  let boveda = resolve(RAIZ, '..', 'brain-private');
  if (typeof m.archiveDir === 'string' && m.archiveDir.includes('research-archive')) {
    boveda = resolve(RAIZ, m.archiveDir, '..', '..');
  }
  return {
    enabled: c.enabled === true,
    maxChars: Number.isInteger(c.maxChars) && c.maxChars > 0 ? c.maxChars : 600,
    exigirFrase: typeof c.exigirFrase === 'boolean' ? c.exigirFrase : EXIGIR_FRASE_DEFECTO,
    cache: join(boveda, 'maestro', '.indice-cache.json'),
  };
}

/** Carga el cache precompilado. `null` si no está o si su tokenizador no es el que sé aplicar. */
export function cargarCache(ruta) {
  if (!existsSync(ruta)) return null;
  const c = leerJSON(ruta);
  if (!c || !Array.isArray(c.rows) || !c.rows.length || !c.df) return null;
  if (!c.tokenizador || c.tokenizador.version !== VERSION_TOKENIZADOR_SOPORTADA) return null;
  return c;
}

// ── Tokenizador: los PARÁMETROS son del cache; aquí solo vive la mecánica ──────────────────
const sinAcentos = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const singular = (t) => {
  if (t.length >= 6 && t.endsWith('es')) return t.slice(0, -2);
  if (t.length >= 5 && t.endsWith('s')) return t.slice(0, -1);
  return t;
};
export function tokenizar(texto, tok) {
  const minLen = tok.minLen;
  const stop = new Set((tok.stopwords || []).map((w) => sinAcentos(w)));
  const limpio = sinAcentos(String(texto).toLowerCase())
    .replace(/\[\[[^\]]*\]\]/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ');
  const out = [];
  for (const bruto of limpio.split(/[^a-z0-9]+/)) {
    if (!bruto || bruto.length < minLen) continue;
    if (/^\d+$/.test(bruto)) continue;
    if (stop.has(bruto)) continue;
    const t = singular(bruto);
    if (t.length < minLen || stop.has(t)) continue;
    out.push(t);
  }
  return out;
}
/** Pares de tokens CONSECUTIVOS, en el mismo orden que los precalcula el generador del cache. */
const bigramas = (toks) => {
  const out = [];
  for (let i = 0; i + 1 < toks.length; i++) out.push(`${toks[i]}~${toks[i + 1]}`);
  return out;
};

/**
 * El matcher. Devuelve `{ filas, tokens }` — `filas` ya ordenadas y recortadas a MAX_FILAS.
 * Cada fila: `{ tema, sintoma, ids, puntos, especificos, comunes, frases }`.
 * `op` permite forzar los umbrales: existe SOLO para el banco de pruebas que los afinó contra
 * prompts reales — el hook corre siempre con las constantes de arriba y con lo que diga el
 * manifest.
 */
export function rutear(prompt, cache, op = {}) {
  const minEspecificos = op.minEspecificos ?? MIN_ESPECIFICOS;
  const minPuntos = op.minPuntos ?? MIN_PUNTOS;
  const maxFilas = op.maxFilas ?? MAX_FILAS;
  const exigirFrase = op.exigirFrase ?? EXIGIR_FRASE_DEFECTO;
  const N = cache.rows.length;
  const brutos = tokenizar(prompt, cache.tokenizador);
  const tokens = [...new Set(brutos)];
  if (tokens.length < minEspecificos) return { filas: [], tokens };
  const enPrompt = new Set(tokens);
  const frasesPrompt = exigirFrase ? new Set(bigramas(brutos)) : null;
  const topeTrivial = Math.max(2, Math.round(N * (op.dfTrivial ?? DF_TRIVIAL)));

  const candidatas = [];
  for (const fila of cache.rows) {
    let puntos = 0;
    let especificos = 0;
    const comunes = [];
    const frases = [];
    if (frasesPrompt) {
      // Modo FRASE: sin bigrama compartido la fila ni se puntúa. Es un filtro, no un bonus:
      // lo que sube la precisión es lo que DESCARTA.
      for (const b of fila.b || []) if (frasesPrompt.has(b)) frases.push(b);
      if (!frases.length) continue;
      for (const b of frases) puntos += Math.log(N / (cache.dfB?.[b] || 1));
    }
    for (const k of fila.k) {
      if (!enPrompt.has(k)) continue;
      const df = cache.df[k] || 1;
      puntos += Math.log(N / df);
      if (df <= topeTrivial) especificos++;
      comunes.push(k);
    }
    if (especificos < minEspecificos || puntos < minPuntos) continue;
    candidatas.push({ tema: fila.t, sintoma: fila.s, ids: fila.id, puntos, especificos, comunes, frases });
  }
  candidatas.sort((a, b) => b.puntos - a.puntos || b.especificos - a.especificos);
  return { filas: candidatas.slice(0, maxFilas), tokens };
}

// ── Presentación ──────────────────────────────────────────────────────────────────────────
const CABECERA = '🧠 maestro — filas que QUIZÁ apliquen (matcher léxico, sin verificar):';
const limpiarMd = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();
const recortar = (s, n) => {
  if (s.length <= n) return s;
  const corte = s.slice(0, n - 1);
  const esp = corte.lastIndexOf(' ');
  return `${(esp > n * 0.6 ? corte.slice(0, esp) : corte).trimEnd()}…`;
};

/** Texto final, garantizado ≤ maxChars. Lo que no cabe NO se imprime (no se corta a medias). */
export function formatear(filas, maxChars) {
  if (!filas.length) return '';
  const lineas = [];
  let usado = CABECERA.length;
  // Presupuesto por línea repartido entre las filas que de verdad van a salir.
  const porLinea = Math.floor((maxChars - CABECERA.length - filas.length) / filas.length);
  for (const f of filas) {
    const cola = ` → ${f.ids}`;
    const cabida = porLinea - cola.length - f.tema.length - 6;
    if (cabida < 24) break;                       // sin sitio para un síntoma legible: mejor nada
    const linea = `• ${f.tema} · ${recortar(limpiarMd(f.sintoma), cabida)}${cola}`;
    if (usado + 1 + linea.length > maxChars) break;
    lineas.push(linea);
    usado += 1 + linea.length;
  }
  return lineas.length ? [CABECERA, ...lineas].join('\n') : '';
}

// ── CLI / hook ────────────────────────────────────────────────────────────────────────────
const leerEntrada = () => {
  const arg = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ').trim();
  if (arg) return arg;
  let crudo = '';
  try { crudo = readFileSync(0, 'utf8'); } catch { return ''; }
  crudo = crudo.trim();
  if (!crudo) return '';
  if (crudo.startsWith('{')) {
    try {
      const j = JSON.parse(crudo);
      if (typeof j.prompt === 'string') return j.prompt;
    } catch { /* no era JSON del harness: se usa tal cual */ }
  }
  return crudo;
};

const esCLI = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (esCLI) {
  const cfg = config();
  const forzado = process.argv.includes('--force');   // para medir sin encender el piloto
  if (!cfg.enabled && !forzado) process.exit(0);      // apagado = silencio, no un error
  const cache = cargarCache(cfg.cache);
  if (!cache) {
    // Falla en SILENCIO por stdout (esto se inyecta en un prompt) y RUIDOSO por stderr.
    console.error(`[prompt-router] sin índice utilizable en ${cfg.cache} — regenera: node ../brain-private/scripts/indice-cache.mjs`);
    process.exit(0);
  }
  if (cfg.exigirFrase && !cache.dfB) {
    // Falla CERRADO: pedido el modo frase y el cache no trae frases, callar es lo correcto —
    // caer al modo laxo sería servir el punto de operación que NO se pidió, y en silencio.
    console.error('[prompt-router] `exigirFrase` pedido y el cache no trae bigramas — regenera el cache con la versión que los emite.');
    process.exit(0);
  }
  const prompt = leerEntrada();
  if (!prompt) process.exit(0);
  const { filas } = rutear(prompt, cache, { exigirFrase: cfg.exigirFrase });
  const texto = formatear(filas, cfg.maxChars);
  if (texto) console.log(texto);
  process.exit(0);
}
