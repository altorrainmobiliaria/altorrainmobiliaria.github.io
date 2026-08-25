/*
 * LAS CINCO PUERTAS DE ESCRITURA DE GESTIÓN, contra el emulador (§140).
 *
 * POR QUÉ EXISTEN ESTAS PRUEBAS, Y POR QUÉ AHORA. El runbook del cutover (paso 1.6) le pide al dueño
 * estrenar `crearExpediente`, `crearNovedad` y `actualizarNovedad` — «tres Cloud Functions que nunca
 * han corrido». Que su primera ejecución en la vida sea con él delante, en producción y con datos
 * reales, es pagar la prueba con su tiempo y su confianza. Aquí corren antes, y de verdad: Admin SDK
 * contra Firestore emulado, el MISMO código que se desplegó, invocado por el `.run()` que la propia
 * librería expone para esto.
 *
 * LO QUE SÍ SE PRUEBA: la puerta de permisos, el acuñado transaccional del código, la escritura real
 * y —sobre todo— **los RECHAZOS**. El paso 1.6 pide expresamente provocar uno (cerrar una novedad sin
 * escribir qué se hizo) porque *un gate que nunca se ha visto negar algo tampoco está probado*.
 *
 * LO QUE NO SE PRUEBA, y se dice: el transporte del callable (cabeceras, CORS, verificación real del
 * token). Eso lo pone Google y solo se ejerce con una sesión de verdad — es exactamente lo que sigue
 * siendo trabajo del paso 1.6, ahora con el camino de datos ya despejado.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp, deleteApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import {
  actualizarNovedad,
  crearExpediente,
  crearNovedad,
} from '../../functions/src/gestion-escritura';

let app: App;
let db: Firestore;

/** Quien llama. El permiso viaja en el token, igual que en producción (§99). */
const DUENO = { uid: 'daniel-uid', token: { admin: true, rol: 'super_admin' } };
const EDITOR = { uid: 'editor-uid', token: { admin: true, rol: 'editor' } };
const MIRON = { uid: 'viewer-uid', token: { admin: true, rol: 'viewer' } };
/*
 * `null`, NO `undefined`. `pedir()` tiene un parámetro por defecto, y en JavaScript pasar `undefined`
 * DISPARA ese valor por defecto — así que `pedir(datos, undefined)` colaba la sesión del dueño y la
 * prueba de «sin sesión» pasaba… porque sí había sesión. La prueba falló y descubrió mi error, que es
 * exactamente para lo que sirve escribirla antes de darla por buena.
 */
const NADIE = null;

/** Arma el `CallableRequest` mínimo que `.run()` necesita. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pedir = (data: unknown, auth: unknown = DUENO): any => ({ data, auth, rawRequest: {} });

/** Ejecuta y devuelve el error en vez de lanzarlo, para poder afirmar sobre su código. */
async function falla(fn: () => Promise<unknown>): Promise<{ code: string; message: string; details?: unknown }> {
  try {
    await fn();
  } catch (e) {
    const err = e as { code?: string; message?: string; details?: unknown };
    return { code: String(err.code), message: String(err.message), details: err.details };
  }
  throw new Error('se esperaba un fallo y no lo hubo');
}

const EXPEDIENTE_VALIDO = { estado: 'activo', codigoLegacy: 'ALT-AR-0042' };

beforeAll(() => {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  /*
   * ⚠️ LA APP POR DEFECTO, sin nombre — y eso NO es un detalle de estilo. Las Functions llaman a
   * `getFirestore()` a secas, que es la app por defecto; con una app con nombre (como hacen las otras
   * pruebas de esta carpeta, que sí reciben su `db` por parámetro) fallan todas con `app/no-app`.
   * Se descubrió aquí y no en producción porque aquí se ejecutan.
   *
   * Los demás archivos usan apps CON nombre, así que no hay colisión; aun así se comprueba antes de
   * inicializar, porque vitest puede compartir proceso entre archivos.
   */
  app = getApps().find((a) => a.name === '[DEFAULT]') ?? initializeApp({ projectId: 'demo-altorra-gestion' });
  db = getFirestore(app);
});

afterAll(async () => {
  await deleteApp(app);
});

beforeEach(async () => {
  for (const col of ['expedientes', 'novedades', 'config']) {
    const snap = await db.collection(col).get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
});

describe('la puerta de permisos (`exigirEditor`)', () => {
  it('sin sesión: rechaza y NO escribe', async () => {
    const e = await falla(() => crearExpediente.run(pedir(EXPEDIENTE_VALIDO, NADIE)));
    expect(e.code).toContain('unauthenticated');
    expect((await db.collection('expedientes').get()).size).toBe(0);
  });

  it('con sesión pero SIN el claim `admin`: rechaza', async () => {
    const e = await falla(() =>
      crearExpediente.run(pedir(EXPEDIENTE_VALIDO, { uid: 'x', token: { rol: 'super_admin' } })),
    );
    // El claim manda, no el rol: un `rol` sin `admin` es un token a medio sincronizar.
    expect(e.code).toContain('unauthenticated');
  });

  it('quien solo consulta: rechaza con permiso denegado, no con «no has entrado»', async () => {
    // La distinción importa: al `viewer` hay que decirle que SÍ entró y que su rol no alcanza.
    const e = await falla(() => crearExpediente.run(pedir(EXPEDIENTE_VALIDO, MIRON)));
    expect(e.code).toContain('permission-denied');
  });

  it('editor: SÍ puede', async () => {
    const r = (await crearExpediente.run(pedir(EXPEDIENTE_VALIDO, EDITOR))) as { ok: boolean };
    expect(r.ok).toBe(true);
  });
});

describe('crearExpediente', () => {
  it('acuña el código, lo escribe, y devuelve el documento completo', async () => {
    const r = (await crearExpediente.run(pedir(EXPEDIENTE_VALIDO))) as {
      ok: boolean;
      id: string;
      expediente: Record<string, unknown>;
    };
    expect(r.ok).toBe(true);
    expect(r.id).toMatch(/^EXP-\d{6}-0001$/);

    const guardado = await db.doc(`expedientes/${r.id}`).get();
    expect(guardado.exists).toBe(true);
    expect(guardado.data()?.codigoLegacy).toBe('ALT-AR-0042');
    // Sellos de auditoría: sin ellos no se puede reconstruir quién tocó qué ni cuándo.
    expect(guardado.data()?._version).toBe(1);
    expect(typeof guardado.data()?.createdAt).toBe('string');
  });

  it('el contador es MENSUAL y consecutivo — dos altas seguidas no chocan', async () => {
    const a = (await crearExpediente.run(pedir(EXPEDIENTE_VALIDO))) as { id: string };
    const b = (await crearExpediente.run(pedir(EXPEDIENTE_VALIDO))) as { id: string };
    expect(a.id.endsWith('-0001')).toBe(true);
    expect(b.id.endsWith('-0002')).toBe(true);
  });

  it('sin decir de qué inmueble es: rechaza y EXPLICA cuál es el problema', async () => {
    const e = await falla(() => crearExpediente.run(pedir({ estado: 'activo' })));
    expect(e.code).toContain('invalid-argument');
    // El detalle viaja a propósito: «datos inválidos» a secas obliga a adivinar cuál de doce campos.
    const d = e.details as { problemas: string[]; mensajes: string[] };
    expect(d.problemas).toContain('sin-referencia');
    expect(d.mensajes.join(' ')).toMatch(/inmueble/i);
  });

  it('con un estado que no existe: rechaza', async () => {
    const e = await falla(() =>
      crearExpediente.run(pedir({ estado: 'inventado', codigoLegacy: 'ALT-AR-1' })),
    );
    expect((e.details as { problemas: string[] }).problemas).toContain('sin-estado');
  });
});

describe('crearNovedad', () => {
  async function conExpediente(): Promise<string> {
    const r = (await crearExpediente.run(pedir(EXPEDIENTE_VALIDO))) as { id: string };
    return r.id;
  }

  const NOVEDAD = (expedienteId: string) => ({
    expedienteId,
    reportadoPor: 'inquilino',
    tipo: 'reparación',
    descripcion: 'Gotea la llave del lavaplatos.',
  });

  it('la abre, le pone el SLA desde el SERVIDOR y la deja PENDIENTE', async () => {
    const exp = await conExpediente();
    const r = (await crearNovedad.run(pedir(NOVEDAD(exp)))) as { id: string; novedad: Record<string, unknown> };
    expect(r.id).toMatch(/^NOV-\d{6}-0001$/);
    expect(r.novedad.estado).toBe('PENDIENTE');
    // El plazo NO lo manda el formulario: si lo mandara, un reloj mal puesto falsearía el tablero.
    expect(typeof r.novedad.slaVencimiento).toBe('string');
    expect(Date.parse(String(r.novedad.slaVencimiento))).toBeGreaterThan(Date.parse(String(r.novedad.createdAt)));
  });

  it('🔴 con un expediente que NO existe: rechaza', async () => {
    // Sin esto se crean tickets colgando de una referencia inventada: no fallan al escribir y
    // desaparecen de toda vista que agrupe por expediente.
    const e = await falla(() => crearNovedad.run(pedir(NOVEDAD('EXP-000000-9999'))));
    expect(e.code).toContain('not-found');
    expect((await db.collection('novedades').get()).size).toBe(0);
  });

  it('sin contar qué pasó: rechaza', async () => {
    const exp = await conExpediente();
    const e = await falla(() => crearNovedad.run(pedir({ ...NOVEDAD(exp), descripcion: '   ' })));
    expect((e.details as { problemas: string[] }).problemas).toContain('sin-descripcion');
  });

  it('naciendo ya CERRADA sin decir qué se hizo: rechaza', async () => {
    const exp = await conExpediente();
    const e = await falla(() => crearNovedad.run(pedir({ ...NOVEDAD(exp), estado: 'CERRADO' })));
    expect((e.details as { problemas: string[] }).problemas).toContain('cerrada-sin-resolucion');
  });
});

describe('actualizarNovedad — el rechazo que el runbook manda provocar (paso 1.6)', () => {
  async function conNovedad(): Promise<string> {
    const exp = (await crearExpediente.run(pedir(EXPEDIENTE_VALIDO))) as { id: string };
    const nov = (await crearNovedad.run(
      pedir({
        expedienteId: exp.id,
        reportadoPor: 'inquilino',
        tipo: 'reparación',
        descripcion: 'Gotea la llave del lavaplatos.',
      }),
    )) as { id: string };
    return nov.id;
  }

  it('🔴 cerrarla SIN escribir qué se hizo: rechaza, y la deja como estaba', async () => {
    const id = await conNovedad();
    const e = await falla(() => actualizarNovedad.run(pedir({ id, estado: 'HECHO' })));
    expect(e.code).toContain('invalid-argument');
    expect((e.details as { problemas: string[] }).problemas).toContain('cerrada-sin-resolucion');

    // Y lo que de verdad importa: el documento NO se movió.
    const despues = await db.doc(`novedades/${id}`).get();
    expect(despues.data()?.estado).toBe('PENDIENTE');
  });

  it('cerrarla CON la resolución escrita: pasa y queda registrada', async () => {
    const id = await conNovedad();
    const r = (await actualizarNovedad.run(
      pedir({ id, estado: 'HECHO', resolucion: 'Se cambió el empaque de la llave.' }),
    )) as { ok: boolean };
    expect(r.ok).toBe(true);

    const despues = await db.doc(`novedades/${id}`).get();
    expect(despues.data()?.estado).toBe('HECHO');
    expect(despues.data()?.resolucion).toMatch(/empaque/);
    // La versión sube: es lo que hace detectable una escritura concurrente.
    expect(despues.data()?._version).toBe(2);
  });

  it('sobre una novedad que no existe: rechaza sin crear nada', async () => {
    const e = await falla(() => actualizarNovedad.run(pedir({ id: 'NOV-000000-9999', estado: 'HECHO', resolucion: 'x' })));
    expect(e.code).toContain('not-found');
    expect((await db.collection('novedades').get()).size).toBe(0);
  });

  it('quien solo consulta no puede moverla', async () => {
    const id = await conNovedad();
    const e = await falla(() =>
      actualizarNovedad.run(pedir({ id, estado: 'HECHO', resolucion: 'x' }, MIRON)),
    );
    expect(e.code).toContain('permission-denied');
  });
});
