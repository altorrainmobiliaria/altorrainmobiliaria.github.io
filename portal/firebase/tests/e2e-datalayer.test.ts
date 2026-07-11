import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { generarPropiedades } from '../seed/generar-propiedades.mjs';
import { getDataClient } from '../../src/lib/data/client';

// E2E de la capa de datos: siembra propiedades SEMILLA en el emulador (via Admin/rules-disabled) y las
// lee con el CLIENTE REST REAL (`baseUrl` → emulador). Ejercita el camino completo contra el wire format
// REAL de Firestore (no stubs): cliente → REST → Security Rules → decode → objeto de dominio.
// Corre bajo `firebase emulators:exec` (mismo runner que rules.test.ts).
//
// ⚠️ projectId PROPIO (`demo-altorra-e2e`) — NO compartir con `rules.test.ts` (`demo-altorra`): ese
// archivo hace `beforeEach(clearFirestore)` y, como vitest paraleliza archivos contra el MISMO emulador,
// borraría esta semilla a mitad de camino. El emulador aísla datos por projectId → sin colisión.
const PROJECT = 'demo-altorra-e2e';
const EMU = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const BASE = `http://${EMU}/v1`;
const BORRADOR_ID = 'INM-202607-9001';

let env: RulesTestEnvironment;
const props = generarPropiedades(12, 42);
const disponible = props.find((p) => p.estado === 'disponible')!;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: readFileSync(resolve(import.meta.dirname, '../firestore.rules'), 'utf8') },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const p of props) await setDoc(doc(db, 'propiedades', p.id), p);
    await setDoc(doc(db, 'propiedades', BORRADOR_ID), { ...disponible, id: BORRADOR_ID, estado: 'borrador' });
    await setDoc(doc(db, 'config', 'general'), {
      razonSocial: 'ALTORRA COMPANY S.A.S.', nit: '902063965-4', matriculaArrendador: 'AMC-OFI-0074376-2026',
    });
    await setDoc(doc(db, 'disponibilidad', `${disponible.id}_2026-07-20`), {
      propiedadId: disponible.id, fecha: '2026-07-20', estado: 'libre', _version: 1,
    });
  });
});
afterAll(async () => env?.cleanup());

const client = () => getDataClient({ PUBLIC_FIREBASE_PROJECT_ID: PROJECT, PUBLIC_FIREBASE_API_KEY: 'demo' }, { baseUrl: BASE });

describe('E2E capa de datos — cliente REST real vs emulador Firestore (seed realista Cartagena)', () => {
  it('lee una propiedad publicada y la DECODIFICA fiel (mapas/arrays anidados, doubles, integers, booleanos)', async () => {
    const r = await client().propiedades.get(disponible.id);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const p = r.data;
    expect(p.id).toBe(disponible.id);
    expect(p.titulo).toBe(disponible.titulo);
    expect(p.geo.barrio).toBe(disponible.geo.barrio); // mapa anidado
    expect(typeof p.geo.lat).toBe('number'); // double
    expect(Array.isArray(p.imagenes)).toBe(true);
    expect(p.imagenes.length).toBe(disponible.imagenes.length); // array de strings
    expect(p.imagenes[0]).toContain('picsum.photos');
    expect(p._version).toBe(1); // integerValue (string en REST) → number
    expect(typeof p.amenidades).toBe('object'); // Record<string,boolean>
    // una amenidad `false` debe decodificar como false (no undefined) — el fix del despacho por-clave, EN VIVO
    if (Object.values(disponible.amenidades).includes(false)) {
      expect(Object.values(p.amenidades)).toContain(false);
    }
  });

  it('un BORRADOR se colapsa a `unavailable` (la rule lo niega vía REST — no filtra existencia)', async () => {
    expect(await client().propiedades.get(BORRADOR_ID)).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('una propiedad INEXISTENTE también es `unavailable` (indistinguible del borrador → 403)', async () => {
    expect(await client().propiedades.get('INM-202607-0000')).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('config.getGeneral() trae razón social + matrícula de arrendador (footer legal)', async () => {
    const r = await client().config.getGeneral();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.razonSocial).toBe('ALTORRA COMPANY S.A.S.');
      expect(r.data.matriculaArrendador).toBe('AMC-OFI-0074376-2026');
    }
  });

  it('config.get("gestion") se niega en el cliente sin tocar el emulador (deny-list = rule)', async () => {
    expect(await client().config.get('gestion')).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('disponibilidad.get() lee el doc {propiedadId}_{fecha}', async () => {
    const r = await client().disponibilidad.get(disponible.id, '2026-07-20');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.estado).toBe('libre');
  });
});
