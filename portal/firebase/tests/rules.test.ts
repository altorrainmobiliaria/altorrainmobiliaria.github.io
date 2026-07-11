import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';

// T6 (plan endurecido): verifica las Rules del portal (parte 2) contra el emulador. Owner-free (Java local).
// projectId `demo-*` → rules-unit-testing NUNCA toca el backend real.
let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-altorra',
    firestore: { rules: readFileSync(resolve(import.meta.dirname, '../firestore.rules'), 'utf8') },
  });
});
afterAll(async () => env?.cleanup());
beforeEach(async () => env.clearFirestore());

// Siembra saltándose las reglas (Admin).
async function seed() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'propiedades/INM-1'), { estado: 'disponible', titulo: 'Pub' });
    await setDoc(doc(db, 'propiedades/INM-2'), { estado: 'borrador', titulo: 'Oculta' });
    await setDoc(doc(db, 'config/general'), { razonSocial: 'ALTORRA COMPANY S.A.S.' });
    await setDoc(doc(db, 'config/gestion'), { moraDias: [5, 10] });
    await setDoc(doc(db, 'disponibilidad/INM-1_2026-07-15'), { estado: 'libre' });
    await setDoc(doc(db, 'captaciones/INM-1'), { propietario: { nombre: 'X' } });
  });
}

const anon = () => env.unauthenticatedContext().firestore();
const staff = () => env.authenticatedContext('admin-uid', { admin: true }).firestore();

describe('propiedades — get whitelisteado por estado; list/write denegados', () => {
  beforeEach(seed);
  it('anónimo GET de publicada (disponible) → OK', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'propiedades/INM-1')));
  });
  it('anónimo GET de BORRADOR → DENEGADO', async () => {
    await assertFails(getDoc(doc(anon(), 'propiedades/INM-2')));
  });
  it('anónimo GET de INEXISTENTE → DENEGADO (confirma supuesto del comité: no-existe ⇒ 403, no 404)', async () => {
    await assertFails(getDoc(doc(anon(), 'propiedades/NO-EXISTE')));
  });
  it('anónimo LIST → DENEGADO (SERP se sirve de JSON cacheado, no de query)', async () => {
    await assertFails(getDocs(collection(anon(), 'propiedades')));
  });
  it('anónimo WRITE → DENEGADO (escrituras = Cloud Functions)', async () => {
    await assertFails(setDoc(doc(anon(), 'propiedades/INM-3'), { estado: 'disponible' }));
  });
});

describe('config — get público salvo gestion/counters; list solo staff', () => {
  beforeEach(seed);
  it('anónimo GET config/general → OK', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'config/general')));
  });
  it('anónimo GET config/gestion → DENEGADO', async () => {
    await assertFails(getDoc(doc(anon(), 'config/gestion')));
  });
  it('staff GET config/gestion → OK', async () => {
    await assertSucceeds(getDoc(doc(staff(), 'config/gestion')));
  });
  it('anónimo LIST config → DENEGADO', async () => {
    await assertFails(getDocs(collection(anon(), 'config')));
  });
});

describe('disponibilidad — get público; list/write denegados', () => {
  beforeEach(seed);
  it('anónimo GET disponibilidad → OK', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'disponibilidad/INM-1_2026-07-15')));
  });
  it('anónimo LIST disponibilidad → DENEGADO', async () => {
    await assertFails(getDocs(collection(anon(), 'disponibilidad')));
  });
  it('anónimo WRITE disponibilidad → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'disponibilidad/x'), { estado: 'libre' }));
  });
});

describe('captaciones (PII) — solo staff; write siempre denegado', () => {
  beforeEach(seed);
  it('anónimo READ captaciones → DENEGADO (PII propietario/dirección/matrícula)', async () => {
    await assertFails(getDoc(doc(anon(), 'captaciones/INM-1')));
  });
  it('staff READ captaciones → OK', async () => {
    await assertSucceeds(getDoc(doc(staff(), 'captaciones/INM-1')));
  });
  it('staff WRITE captaciones → DENEGADO (solo Cloud Functions escriben)', async () => {
    await assertFails(setDoc(doc(staff(), 'captaciones/INM-9'), { propietario: { nombre: 'Y' } }));
  });
});
