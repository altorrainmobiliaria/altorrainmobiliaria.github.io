#!/usr/bin/env node
/**
 * sonda-callables — ¿cada Function «callable» desplegada RESPONDE desde el navegador?
 *
 * POR QUÉ EXISTE (ADR §336, 24-nov-2026). `firebase deploy` dio «Successful update operation» para las
 * 32 Functions y, sin embargo, 6 callables (crearExpediente, crearNovedad, actualizarNovedad,
 * crearContrato, registrarPago y deleteManagedUserV2) eran PRIVADAS en Cloud Run desde que se crearon:
 * sin `allUsers → roles/run.invoker`, Google contesta su propia página «403 Forbidden» y nuestro código
 * ni se entera. Desde el panel, crear un expediente o registrar un pago fallaba sin remedio. La CLI solo
 * pone ese permiso al CREAR la función, nunca al actualizarla ([[BERS:L-56]]), así que ningún deploy
 * posterior lo arreglaba ni lo decía. Un «Successful» de la CLI no prueba que la función se pueda llamar.
 *
 * QUÉ HACE. Lee la salida de `firebase functions:list --json` y, para cada callable, hace un POST
 * ANÓNIMO con `{"data":{}}`. Clasifica la respuesta:
 *   ✅ JSON con UNAUTHENTICATED / PERMISSION_DENIED / INVALID_ARGUMENT / FAILED_PRECONDITION
 *      → la puerta es NUESTRO código (lo que se quiere: la seguridad vive dentro, `exigirEditor`…).
 *   ❌ 403 en HTML → Cloud Run la bloquea: falta el invoker público. Arreglo (lo que la CLI hace al crear):
 *      gcloud run services add-iam-policy-binding <servicio> --region=us-central1 \
 *        --member=allUsers --role=roles/run.invoker --project=altorra-inmobiliaria-345c6
 *   ❌ 200 → respondió SIN sesión. Hoy ninguna callable lo hace; si una lo hace, hay que leerla: la sonda
 *      la ejecutó con datos vacíos.
 *   ❌ cualquier otra cosa → se dice tal cual.
 * Sale con 1 si hay algún ❌.
 *
 * ⚠️ LÍMITE: solo es inocua contra callables cuya PRIMERA instrucción exige sesión (todas, medido el
 * 24-nov). Una callable nueva sin esa puerta se EJECUTARÍA con `{}`: antes de añadirla, léela.
 *
 * USO (desde portal/, después de cada despliegue de Functions):
 *   npx firebase functions:list --project altorra-inmobiliaria-345c6 --json > ../functions.json
 *   node scripts/sonda-callables.mjs ../functions.json
 */
import { readFileSync } from 'node:fs';

const fichero = process.argv[2];
if (!fichero) {
  console.error('uso: node scripts/sonda-callables.mjs <salida de `firebase functions:list --json`>');
  process.exit(2);
}

const lista = JSON.parse(readFileSync(fichero, 'utf8'));
const funciones = Array.isArray(lista) ? lista : lista.result ?? [];
const callables = funciones.filter((f) => f.callableTrigger && f.uri);
if (callables.length === 0) {
  console.error(`❌ ${fichero}: no trae ninguna callable con uri — ¿es la salida de functions:list --json?`);
  process.exit(1);
}

const PUERTAS = new Set(['UNAUTHENTICATED', 'PERMISSION_DENIED', 'INVALID_ARGUMENT', 'FAILED_PRECONDITION']);

async function sondear(f) {
  const nombre = `${f.codebase ?? '?'}:${f.id}`;
  try {
    const res = await fetch(f.uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"data":{}}',
      signal: AbortSignal.timeout(20_000),
    });
    const tipo = res.headers.get('content-type') ?? '';
    const cuerpo = await res.text();
    if (res.status === 403 && tipo.includes('text/html')) {
      return { ok: false, nombre, que: `403 HTML de Google: PRIVADA en Cloud Run (servicio ${f.runServiceId ?? f.id.toLowerCase()})` };
    }
    if (res.status === 200) {
      return { ok: false, nombre, que: `200: respondió SIN sesión — léela (la sonda la ejecutó con {})` };
    }
    let estado = '';
    try { estado = JSON.parse(cuerpo)?.error?.status ?? ''; } catch { /* no era JSON */ }
    if (PUERTAS.has(estado)) return { ok: true, nombre, que: `${res.status} ${estado}` };
    return { ok: false, nombre, que: `${res.status} inesperado: ${cuerpo.slice(0, 120).replace(/\s+/g, ' ')}` };
  } catch (e) {
    return { ok: false, nombre, que: `sin respuesta: ${e?.message ?? e}` };
  }
}

const resultados = await Promise.all(callables.map(sondear));
for (const r of resultados.sort((a, b) => a.nombre.localeCompare(b.nombre))) {
  console.log(`${r.ok ? '✅' : '❌'} ${r.nombre} → ${r.que}`);
}
const malas = resultados.filter((r) => !r.ok);
console.log(
  malas.length === 0
    ? `\n✅ sonda-callables — ${resultados.length} callable(s): todas responden desde fuera y la puerta es nuestro código.`
    : `\n❌ sonda-callables — ${malas.length} de ${resultados.length} callable(s) NO responden como deben (arriba).`,
);
process.exit(malas.length === 0 ? 0 : 1);
