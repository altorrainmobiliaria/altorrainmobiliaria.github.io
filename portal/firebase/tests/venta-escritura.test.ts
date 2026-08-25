/*
 * LA PUERTA DE LA VENTA, contra el emulador (§151).
 *
 * POR QUÉ ESTAS PRUEBAS Y NO SOLO LAS DEL DOMINIO. El dominio ya prueba que `moverEtapa` rechaza
 * saltarse el estudio de títulos. Lo que NO prueba —y es lo que de verdad protege— es que la puerta
 * llame a esa regla, que el historial lo escriba el SERVIDOR con el uid del token y no el cuerpo de
 * la llamada, y que el folio de matrícula se exija ANTES de mover. Una regla de dominio que la
 * puerta no invoca es una regla que no existe.
 *
 * Se ejercita el MISMO código que se despliega, con el `.run()` que la librería expone para esto.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp, deleteApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { crearVenta, moverVenta } from '../../functions/src/venta-escritura';
import type { Venta } from '../../src/lib/domain/venta';

let app: App;
let db: Firestore;

const DUENO = { uid: 'daniel-uid', token: { admin: true, rol: 'super_admin' } };
const EDITOR = { uid: 'editor-uid', token: { admin: true, rol: 'editor' } };
const MIRON = { uid: 'viewer-uid', token: { admin: true, rol: 'viewer' } };
/** `null`, NO `undefined`: `undefined` dispara el valor por defecto y colaría la sesión del dueño. */
const NADIE = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pedir = (data: unknown, auth: unknown = DUENO): any => ({ data, auth, rawRequest: {} });

async function falla(fn: () => Promise<unknown>): Promise<{ code: string; message: string; details?: unknown }> {
  try {
    await fn();
  } catch (e) {
    const err = e as { code?: string; message?: string; details?: unknown };
    return { code: String(err.code), message: String(err.message), details: err.details };
  }
  throw new Error('se esperaba un fallo y no lo hubo');
}

const VENTA_VALIDA = {
  expedienteId: 'EXP-1',
  propiedadId: 'INM-1',
  compradorNombre: 'Ana Restrepo',
  precioOfrecido: 480_000_000,
};

/** Abre una venta y la deja en la etapa pedida, moviéndola por el camino legal. */
async function ventaEn(etapa: string): Promise<Venta> {
  const { venta } = (await crearVenta.run(pedir(VENTA_VALIDA))) as { venta: Venta };
  const camino = ['oferta', 'estudio-titulos', 'promesa', 'credito', 'escritura', 'registro'];
  let actual = venta;
  for (const e of camino) {
    const datos: Record<string, unknown> = { id: actual.id, etapa: e, precioAcordado: 470_000_000 };
    if (e === 'registro') datos.folioMatricula = '060-123456';
    actual = ((await moverVenta.run(pedir(datos))) as { venta: Venta }).venta;
    if (e === etapa) break;
  }
  return actual;
}

beforeAll(() => {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  // App por DEFECTO: las Functions llaman a `getFirestore()` a secas (ver la nota de §140).
  app = getApps().find((a) => a.name === '[DEFAULT]') ?? initializeApp({ projectId: 'demo-altorra-gestion' });
  db = getFirestore(app);
});

afterAll(async () => {
  await deleteApp(app);
});

beforeEach(async () => {
  for (const col of ['ventas', 'config']) {
    const snap = await db.collection(col).get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
});

describe('la puerta de permisos', () => {
  it('sin sesión: rechaza y NO escribe', async () => {
    const e = await falla(() => crearVenta.run(pedir(VENTA_VALIDA, NADIE)));
    expect(e.code).toContain('unauthenticated');
    expect((await db.collection('ventas').get()).empty).toBe(true);
  });

  it('quien solo consulta NO puede abrir una venta', async () => {
    const e = await falla(() => crearVenta.run(pedir(VENTA_VALIDA, MIRON)));
    expect(e.code).toContain('permission-denied');
  });

  it('el editor sí puede', async () => {
    const r = (await crearVenta.run(pedir(VENTA_VALIDA, EDITOR))) as { ok: boolean };
    expect(r.ok).toBe(true);
  });

  it('quien solo consulta tampoco puede MOVER', async () => {
    const { id } = (await crearVenta.run(pedir(VENTA_VALIDA))) as { id: string };
    const e = await falla(() => moverVenta.run(pedir({ id, etapa: 'oferta' }, MIRON)));
    expect(e.code).toContain('permission-denied');
  });
});

describe('crearVenta', () => {
  it('acuña el código con el mes y arranca en `interes`', async () => {
    const { id, venta } = (await crearVenta.run(pedir(VENTA_VALIDA))) as { id: string; venta: Venta };
    expect(id).toMatch(/^VTA-\d{6}-\d{4}$/);
    expect(venta.etapa).toBe('interes');
    expect(venta._version).toBe(1);
  });

  it('el primer renglón del historial viene DE nada y lo firma el servidor', async () => {
    const { venta } = (await crearVenta.run(pedir(VENTA_VALIDA))) as { venta: Venta };
    expect(venta.historial).toHaveLength(1);
    expect(venta.historial[0]).toMatchObject({ de: null, a: 'interes', porUid: 'daniel-uid' });
  });

  it('una venta sin comprador se rechaza CON el porqué, no con «datos inválidos»', async () => {
    const e = await falla(() => crearVenta.run(pedir({ ...VENTA_VALIDA, compradorNombre: '  ' })));
    expect(e.code).toContain('invalid-argument');
    expect((e.details as { problemas: string[] }).problemas).toContain('sin-comprador');
    expect((e.details as { mensajes: string[] }).mensajes.join(' ')).toContain('comprador');
  });

  it('🔴 una venta inválida NO quema un código del contador', async () => {
    await falla(() => crearVenta.run(pedir({ compradorNombre: 'Solo el nombre' })));
    const { id } = (await crearVenta.run(pedir(VENTA_VALIDA))) as { id: string };
    expect(id.endsWith('-0001')).toBe(true);
  });

  it('un precio ofrecido en cero se rechaza: es error de captura', async () => {
    const e = await falla(() => crearVenta.run(pedir({ ...VENTA_VALIDA, precioOfrecido: 0 })));
    expect((e.details as { problemas: string[] }).problemas).toContain('precioOfrecido-invalido');
  });
});

describe('moverVenta — el orden legal', () => {
  it('avanza un escalón y deja el rastro firmado por el servidor', async () => {
    const { id } = (await crearVenta.run(pedir(VENTA_VALIDA))) as { id: string };
    const { venta } = (await moverVenta.run(pedir({ id, etapa: 'oferta' }, EDITOR))) as { venta: Venta };
    expect(venta.etapa).toBe('oferta');
    expect(venta.historial.at(-1)).toMatchObject({ de: 'interes', a: 'oferta', porUid: 'editor-uid' });
    expect(venta._version).toBe(2);
  });

  it('🔴 NO deja saltarse el estudio de títulos', async () => {
    const { id } = (await crearVenta.run(pedir(VENTA_VALIDA))) as { id: string };
    await moverVenta.run(pedir({ id, etapa: 'oferta' }));
    const e = await falla(() => moverVenta.run(pedir({ id, etapa: 'promesa' })));
    expect((e.details as { problemas: string[] }).problemas).toContain('no-se-puede-saltar:estudio-titulos');
    // Y la venta se quedó donde estaba: un rechazo que deja el estado a medias es peor que no tenerlo.
    const snap = await db.doc(`ventas/${id}`).get();
    expect((snap.data() as Venta).etapa).toBe('oferta');
  });

  it('retroceder sin motivo se rechaza; con motivo, queda escrito', async () => {
    const v = await ventaEn('promesa');
    const e = await falla(() => moverVenta.run(pedir({ id: v.id, etapa: 'oferta' })));
    expect((e.details as { problemas: string[] }).problemas).toContain('retroceso-sin-motivo');

    const { venta } = (await moverVenta.run(
      pedir({ id: v.id, etapa: 'oferta', motivo: 'El banco negó el crédito.' }),
    )) as { venta: Venta };
    expect(venta.etapa).toBe('oferta');
    expect(venta.historial.at(-1)?.motivo).toBe('El banco negó el crédito.');
  });

  it('🔴 NO se marca REGISTRADA sin número de matrícula inmobiliaria', async () => {
    const v = await ventaEn('escritura');
    const e = await falla(() => moverVenta.run(pedir({ id: v.id, etapa: 'registro' })));
    expect((e.details as { problemas: string[] }).problemas).toContain('registro-sin-folio');
    const snap = await db.doc(`ventas/${v.id}`).get();
    expect((snap.data() as Venta).etapa).toBe('escritura');
  });

  it('con folio sí registra, y estampa la fecha de cierre', async () => {
    const v = await ventaEn('escritura');
    const { venta } = (await moverVenta.run(
      pedir({ id: v.id, etapa: 'registro', folioMatricula: '060-987654' }),
    )) as { venta: Venta };
    expect(venta.etapa).toBe('registro');
    expect(venta.folioMatricula).toBe('060-987654');
    expect(venta.cerradaEn).toBeTruthy();
  });

  it('desde registro no se mueve nada', async () => {
    const v = await ventaEn('registro');
    const e = await falla(() =>
      moverVenta.run(pedir({ id: v.id, etapa: 'escritura', motivo: 'me equivoqué' })),
    );
    expect((e.details as { problemas: string[] }).problemas).toContain('registro-es-final');
  });

  it('una venta que no existe no se puede mover', async () => {
    const e = await falla(() => moverVenta.run(pedir({ id: 'VTA-000000-9999', etapa: 'oferta' })));
    expect(e.code).toContain('not-found');
  });

  it('la concurrencia optimista corta el paso al segundo que llega', async () => {
    const { id, venta } = (await crearVenta.run(pedir(VENTA_VALIDA))) as { id: string; venta: Venta };
    await moverVenta.run(pedir({ id, etapa: 'oferta' }));
    const e = await falla(() =>
      moverVenta.run(pedir({ id, etapa: 'estudio-titulos', _version: venta._version })),
    );
    expect(e.code).toContain('aborted');
  });

  it('un precio acordado inválido NO se cuela de acompañante en un movimiento válido', async () => {
    const { id } = (await crearVenta.run(pedir(VENTA_VALIDA))) as { id: string };
    const e = await falla(() => moverVenta.run(pedir({ id, etapa: 'oferta', precioAcordado: -1 })));
    expect((e.details as { problemas: string[] }).problemas).toContain('precioAcordado-invalido');
    const snap = await db.doc(`ventas/${id}`).get();
    expect((snap.data() as Venta).etapa).toBe('interes');
  });
});
