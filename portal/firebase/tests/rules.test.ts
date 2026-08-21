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
    // Índice de catálogo (OD-Catálogo §54): solo lo escribe la Function; contiene resúmenes de PUBLICADAS.
    await setDoc(doc(db, 'indices/catalogo-venta'), { _version: 1, items: [{ id: 'INM-1', titulo: 'Pub' }] });
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

describe('indices/catalogo — get público de shards conocidos; list/write denegados (anti-oráculo §54)', () => {
  beforeEach(seed);
  it('anónimo GET indices/catalogo-venta → OK (solo contiene publicadas, no filtra borradores)', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'indices/catalogo-venta')));
  });
  it('anónimo GET indices/catalogo-DESCONOCIDO (fuera de la allow-list) → DENEGADO', async () => {
    await assertFails(getDoc(doc(anon(), 'indices/catalogo-secreto')));
  });
  it('anónimo LIST indices → DENEGADO (el índice se sirve por edge/JSON cacheado, no por query)', async () => {
    await assertFails(getDocs(collection(anon(), 'indices')));
  });
  it('anónimo WRITE indices → DENEGADO (solo la Cloud Function escribe)', async () => {
    await assertFails(setDoc(doc(anon(), 'indices/catalogo-venta'), { _version: 2, items: [] }));
  });
  it('el BORRADOR sigue oculto aunque exista el índice (no hay fuga por la nueva colección)', async () => {
    await assertFails(getDoc(doc(anon(), 'propiedades/INM-2')));
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

// ─────────────────────────────────────────────────────────────────────────────
// ALTA PÚBLICA ACOTADA (ADR §96). Son las DOS únicas colecciones donde un anónimo puede CREAR.
// Se prueba a conciencia porque aquí se amplió un permiso: lo que hay que demostrar no es que el
// camino feliz funcione, sino que todo lo demás (leer, editar, borrar, colar campos) sigue cerrado.
// ─────────────────────────────────────────────────────────────────────────────

const LEAD_OK = {
  nombre: 'Daniela Restrepo',
  telefono: '3002439810',
  estado: 'pendiente',
  emailSent: false,
  consentimiento: { autorizado: true },
};

const ALERTA_OK = {
  email: 'persona@correo.com',
  criterios: { operacion: 'venta', tipos: ['casa'], zonas: ['Manga'], precioMin: null, precioMax: null, habMin: null },
  estado: 'activa',
  token: '5f1c0f6e-1c2f-4b0a-9c1d-4a2b6f0e7d31',
  consentimiento: { autorizado: true },
  ultimoEnvio: '2026-08-21T12:00:00.000Z',
  enviados: 0,
  createdAt: '2026-08-21T12:00:00.000Z',
  updatedAt: '2026-08-21T12:00:00.000Z',
  _version: 1,
};

describe('solicitudes — alta pública acotada (el endpoint del portal escribe aquí)', () => {
  beforeEach(seed);
  it('anónimo CREATE de un lead válido → OK (si esto falla, /publicar y el Rango dejan de captar)', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'solicitudes/lead-1'), LEAD_OK));
  });
  it('anónimo CREATE SIN autorización de habeas data → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-2'), { ...LEAD_OK, consentimiento: { autorizado: false } }));
  });
  it('anónimo CREATE con estado adelantado (contactado) → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-3'), { ...LEAD_OK, estado: 'contactado' }));
  });
  it('anónimo CREATE marcando el correo como ya enviado → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-4'), { ...LEAD_OK, emailSent: true }));
  });
  it('anónimo READ de un lead → DENEGADO (son datos de otra persona)', async () => {
    await assertFails(getDoc(doc(anon(), 'solicitudes/lead-1')));
  });
});

describe('alertas — alta pública; nadie las lee ni las edita salvo la Function', () => {
  beforeEach(seed);
  it('anónimo CREATE de alerta válida → OK', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'alertas/a-1'), ALERTA_OK));
  });
  it('anónimo CREATE naciendo con envíos hechos → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'alertas/a-2'), { ...ALERTA_OK, enviados: 7 }));
  });
  it('anónimo CREATE con operación inventada → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'alertas/a-3'), { ...ALERTA_OK, criterios: { ...ALERTA_OK.criterios, operacion: 'permuta' } }));
  });
  it('anónimo CREATE colando un campo extra → DENEGADO (hasOnly)', async () => {
    await assertFails(setDoc(doc(anon(), 'alertas/a-4'), { ...ALERTA_OK, admin: true }));
  });
  it('anónimo READ de una alerta → DENEGADO (dentro va el token de la baja)', async () => {
    await assertFails(getDoc(doc(anon(), 'alertas/a-1')));
  });
  it('staff READ de una alerta → OK', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => setDoc(doc(ctx.firestore(), 'alertas/a-9'), ALERTA_OK));
    await assertSucceeds(getDoc(doc(staff(), 'alertas/a-9')));
  });
});

describe('bajasAlertas — append-only, la salida del correo', () => {
  beforeEach(seed);
  const BAJA_OK = {
    alertaId: 'a-1',
    token: '5f1c0f6e-1c2f-4b0a-9c1d-4a2b6f0e7d31',
    createdAt: '2026-08-21T13:00:00.000Z',
    aplicada: false,
  };
  it('anónimo CREATE de una baja → OK (revocar tiene que ser tan fácil como autorizar)', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'bajasAlertas/b-1'), BAJA_OK));
  });
  it('anónimo CREATE marcándola como ya aplicada → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'bajasAlertas/b-2'), { ...BAJA_OK, aplicada: true }));
  });
  it('anónimo READ de las bajas → DENEGADO', async () => {
    await assertFails(getDoc(doc(anon(), 'bajasAlertas/b-1')));
  });
});
