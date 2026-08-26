/*
 * EL AVISO DE LEAD, contra el emulador (§191).
 *
 * POR QUÉ ESTAS PRUEBAS Y NO SOLO LAS DEL DOMINIO. El dominio ya prueba qué DICE el correo (9 casos) y
 * cómo se PUNTÚA (14). Lo que ninguna de esas puede demostrar es lo único que importa el día que se
 * pierda un lead: **que las escrituras ocurren, y cuáles**. En concreto la asimetría que este carril
 * existe para sostener — el puntaje se guarda SIEMPRE, la marca de aviso SOLO si el correo salió.
 *
 * Es la lección de §177 aplicada en el momento correcto: escribir la prueba de emulador el mismo día
 * que la Function, no meses después de que algo se rompa.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp, deleteApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { procesarLeadNuevo } from '../../functions/src/lead-aviso';
import type { Solicitud } from '../../src/lib/domain/crm';

let app: App;
let db: Firestore;

const ID = 'SOL-EMU-1';
const CLAVE = 'test_resend_key';

const lead = (over: Partial<Solicitud> = {}): Solicitud =>
  ({
    id: ID,
    estado: 'nuevo',
    contacto: { nombre: 'Ana Restrepo', telefono: '3001234567' },
    source: 'portal-publicar',
    ...over,
  }) as Solicitud;

/** Un Resend que responde lo que le digamos, sin salir a la red. */
const fetchQue = (ok: boolean): typeof fetch =>
  (async () => ({ ok, status: ok ? 200 : 422 })) as unknown as typeof fetch;

const leer = async () => (await db.doc(`solicitudes/${ID}`).get()).data() ?? {};

beforeAll(() => {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  app = getApps().find((a) => a.name === '[DEFAULT]') ?? initializeApp({ projectId: 'demo-altorra-leads' });
  db = getFirestore(app);
});

afterAll(async () => {
  await deleteApp(app);
});

beforeEach(async () => {
  await db.doc(`solicitudes/${ID}`).delete();
});

describe('lo que se ESCRIBE, que es lo que el dominio no puede probar', () => {
  it('con el correo enviado: puntaje, tier y marca de aviso', async () => {
    await db.doc(`solicitudes/${ID}`).set({ ...lead() });
    const r = await procesarLeadNuevo(db, ID, lead(), { apiKeyResend: CLAVE, fetchImpl: fetchQue(true) });

    expect(r.enviado).toBe(true);
    const d = await leer();
    expect(typeof d.leadScore).toBe('number');
    expect(['A', 'B', 'C', 'D']).toContain(d.leadTier);
    expect(typeof d.avisoEnviadoEl).toBe('string');
  });

  it('🔴 sin clave de Resend: el puntaje SE GUARDA IGUAL y la marca de aviso NO aparece', async () => {
    // Es el estado real de hoy (el secreto está con centinela). El lead tiene que quedar puntuado
    // aunque nadie reciba el correo: el puntaje es del lead, no del aviso.
    await db.doc(`solicitudes/${ID}`).set({ ...lead() });
    const r = await procesarLeadNuevo(db, ID, lead(), { apiKeyResend: '', fetchImpl: fetchQue(true) });

    expect(r.enviado).toBe(false);
    expect(r.motivo).toBe('sin-clave');
    const d = await leer();
    expect(typeof d.leadScore).toBe('number');
    expect(d.avisoEnviadoEl).toBeUndefined();
  });

  it('🔴 si Resend RECHAZA, tampoco se marca como avisado', async () => {
    // La marca que dice «avisado» sin que nadie recibiera nada es peor que no tener marca: cierra la
    // pregunta. Así se perdieron los 16 sin que nadie lo supiera.
    await db.doc(`solicitudes/${ID}`).set({ ...lead() });
    const r = await procesarLeadNuevo(db, ID, lead(), { apiKeyResend: CLAVE, fetchImpl: fetchQue(false) });

    expect(r.enviado).toBe(false);
    expect(r.status).toBe(422);
    expect((await leer()).avisoEnviadoEl).toBeUndefined();
  });

  it('no pisa lo que el lead ya traía: escribe con merge', async () => {
    await db.doc(`solicitudes/${ID}`).set({ ...lead(), mensaje: 'no me borres' });
    await procesarLeadNuevo(db, ID, lead(), { apiKeyResend: CLAVE, fetchImpl: fetchQue(true) });
    expect((await leer()).mensaje).toBe('no me borres');
  });
});

describe('el puntaje que se guarda es el del portal, no el del legacy', () => {
  it('un propietario que llenó todo lo que /publicar pide NO queda en el suelo', async () => {
    // El scorer legacy lo dejaba cerca del mínimo por campos que ese formulario nunca muestra (§189).
    await db.doc(`solicitudes/${ID}`).set({ ...lead() });
    await procesarLeadNuevo(db, ID, lead(), { apiKeyResend: CLAVE, fetchImpl: fetchQue(true) });

    const d = await leer();
    expect(d.leadTier).toBe('B');
    expect(d.leadScore as number).toBeGreaterThanOrEqual(60);
  });

  it('y uno sin teléfono ni nombre cae, porque eso SÍ lo decidió el interesado', async () => {
    const pobre = lead({ contacto: { nombre: '' } });
    await db.doc(`solicitudes/${ID}`).set({ ...pobre });
    await procesarLeadNuevo(db, ID, pobre, { apiKeyResend: CLAVE, fetchImpl: fetchQue(true) });

    expect((await leer()).leadTier).toBe('D');
  });
});
