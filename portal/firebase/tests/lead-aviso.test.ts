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
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeApp, deleteApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { alCrearSolicitud, procesarLeadNuevo } from '../../functions/src/lead-aviso';
import type { Solicitud } from '../../src/lib/domain/crm';

/*
 * El documento del portal NO se escribe a mano aquí: lo produce el endpoint de verdad (sin red). Las
 * pruebas de abajo sembraban la forma del MODELO (`contacto`, `source`), que `/api/solicitud` nunca
 * escribe — y por eso pasaban mientras el aviso real salía siempre por `sin-datos` ([[L-88]]).
 */
const escritos = vi.hoisted(() => [] as Record<string, unknown>[]);
vi.mock('../../src/lib/data/firestore-rest', () => ({
  createDoc: async (_coleccion: string, doc: Record<string, unknown>) => {
    escritos.push(doc);
    return { ok: true, id: 'SOL-EMU-PORTAL' };
  },
}));
const { POST } = await import('../../src/pages/api/solicitud');

/** Lo que `/api/solicitud` guarda para este cuerpo, tal cual. */
async function docDelPortal(cuerpo: Record<string, unknown>): Promise<Record<string, unknown>> {
  escritos.length = 0;
  const request = new Request('https://altorrainmobiliaria.co/api/solicitud', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  const res = await POST({ request } as Parameters<typeof POST>[0]);
  if (res.status !== 200 || escritos.length !== 1) throw new Error(`el endpoint no escribió (${res.status})`);
  return escritos[0];
}

const dentroDe = (dias: number): string => new Date(Date.now() + dias * 864e5).toISOString().slice(0, 10);

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

describe('🔴 el lead REAL del portal: el que escribe /api/solicitud', () => {
  const estancia = {
    formulario: 'reserva-estancia',
    nombre: 'Ana Restrepo',
    telefono: '300 123 4567',
    autorizacion: 'on',
    llegada: dentroDe(20),
    salida: dentroDe(23),
    huespedes: 2,
  };

  it('una solicitud de estancia SE AVISA (antes salía siempre por «sin-datos»)', async () => {
    const plano = await docDelPortal(estancia);
    await db.doc(`solicitudes/${ID}`).set(plano);
    // `alCrearSolicitud` es la línea EXACTA del trigger: documento crudo → traducción → proceso.
    const r = await alCrearSolicitud(db, ID, plano, { apiKeyResend: CLAVE, fetchImpl: fetchQue(true) });

    const d = await leer();
    expect(r.enviado).toBe(true);
    // El asunto lleva el tier RECIÉN calculado, el mismo que se guarda.
    expect(r.asunto).toBe(`[${d.leadTier}] Estancia · Ana Restrepo`);
    expect(typeof d.avisoEnviadoEl).toBe('string');
  });

  it('las fechas puntúan: son la `cita` que ese formulario ofrece', async () => {
    const conFechas = await docDelPortal(estancia);
    await db.doc(`solicitudes/${ID}`).set(conFechas);
    await alCrearSolicitud(db, ID, conFechas, { apiKeyResend: '' });
    const conCita = (await leer()).leadScore as number;

    // El mismo lead sin fechas legibles: lo único que cambia es la `cita`. El endpoint no deja
    // pasar una estancia sin fechas; esto prueba la regla del puntaje, no un caso del formulario.
    const extra = conFechas.datosExtra as Record<string, unknown>;
    const sinFechas = { ...conFechas, datosExtra: { ...extra, llegada: '', salida: '' } };
    await db.doc(`solicitudes/${ID}`).set(sinFechas);
    await alCrearSolicitud(db, ID, sinFechas, { apiKeyResend: '' });
    const sinCita = (await leer()).leadScore as number;

    expect(conCita).toBeGreaterThan(sinCita);
  });
});

describe('lo que un documento forzado por REST ya no consigue', () => {
  it('un `leadTier` falsificado no llega al asunto: manda el calculado', async () => {
    const base = await docDelPortal({ nombre: 'Luis Pérez', telefono: '3011234567', autorizacion: 'on' });
    const plano = { ...base, leadTier: 'A', leadScore: 100 };
    await db.doc(`solicitudes/${ID}`).set(plano);
    const r = await alCrearSolicitud(db, ID, plano, { apiKeyResend: CLAVE, fetchImpl: fetchQue(true) });
    const d = await leer();
    expect(r.asunto?.startsWith(`[${d.leadTier}] `)).toBe(true);
    expect(d.leadScore).not.toBe(100);
  });

  it('campos que no son texto no tumban el trigger', async () => {
    const raro = { nombre: 'Ana', telefono: '3001234567', origen: 'constructor', mensaje: 1, propiedadId: 2 };
    await db.doc(`solicitudes/${ID}`).set(raro);
    const r = await alCrearSolicitud(db, ID, raro, { apiKeyResend: CLAVE, fetchImpl: fetchQue(true) });
    expect(r.enviado).toBe(true);
    expect(Number.isFinite((await leer()).leadScore)).toBe(true);
  });

  it('un corte de red con Resend no pierde el puntaje', async () => {
    const roto = (async () => {
      throw new Error('ECONNRESET');
    }) as unknown as typeof fetch;
    const plano = await docDelPortal({ nombre: 'Luis Pérez', telefono: '3011234567', autorizacion: 'on' });
    await db.doc(`solicitudes/${ID}`).set(plano);
    const r = await alCrearSolicitud(db, ID, plano, { apiKeyResend: CLAVE, fetchImpl: roto });
    const d = await leer();
    expect(r).toMatchObject({ enviado: false, motivo: 'fallo-envio' });
    expect(typeof d.leadScore).toBe('number');
    expect(d.avisoEnviadoEl).toBeUndefined();
  });
});
