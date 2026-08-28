/*
 * LA PUERTA DEL PREAVISO, contra el emulador (§187 · ADR §233).
 *
 * POR QUÉ ESTAS PRUEBAS Y NO SOLO LAS DEL DOMINIO. `domain/preaviso.ts` ya prueba que un preaviso
 * impuesto tarde devuelve `se-prorroga`. Lo que NO prueba —y es lo único que protege al dueño— es
 * qué hace la PUERTA con ese veredicto:
 *
 *   · que `estado: 'preaviso'` lo ponga el SERVIDOR y solo cuando el aviso surte efecto, porque un
 *     contrato marcado «preaviso» que en realidad se prorrogó es una casilla que miente justo en el
 *     dato del que depende disponer del inmueble;
 *   · que un preaviso TARDÍO se archive igual —pasó, y la evidencia es lo que explicará por qué el
 *     contrato sigue vivo— en vez de rechazarse como si fuera un formulario mal llenado;
 *   · que `vigenciaFin` salga del CONTRATO y no del cuerpo de la llamada, que es como uno se
 *     regalaría tres meses tecleando otra fecha.
 *
 * Se ejercita el MISMO código que se despliega, con el `.run()` que la librería expone para esto.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp, deleteApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { registrarPreaviso } from '../../functions/src/preaviso-escritura';
import type { Contrato } from '../../src/lib/domain/gestion';

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

const CONTRATO_ID = 'CTO-202608-0001';
/** Vence el 30-sep-2027 ⇒ el límite para imponer es el 30-jun-2027 (vencimiento − 3 meses). */
const VIGENCIA_FIN = '2027-09-30';

async function sembrarContrato(extra: Partial<Contrato> = {}): Promise<void> {
  await db.doc(`contratos/${CONTRATO_ID}`).set({
    id: CONTRATO_ID,
    expedienteId: 'EXP-1',
    tipo: 'arriendo',
    vertical: 'vivienda',
    estado: 'vigente',
    partes: {},
    vigenciaInicio: '2026-10-01',
    vigenciaFin: VIGENCIA_FIN,
    renovacionAutomatica: true,
    _version: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...extra,
  });
}

/*
 * ⚠️ Avisa el ARRENDATARIO a propósito (§263). Antes decía `arrendador`, y con eso estas pruebas
 * afirmaban contra el emulador que un aviso postal del propietario TERMINA el contrato — el mismo
 * error legal que tenía el artículo del Journal. La Ley 820 solo le da esa puerta al inquilino
 * (art. 24); el arrendador necesita además la indemnización del art. 22 num. 7 o la causal con
 * caución del num. 8. El caso del arrendador tiene su propio bloque al final.
 */
const EVIDENCIA_A_TIEMPO = {
  contratoId: CONTRATO_ID,
  quien: 'arrendatario',
  redactadoEl: '2027-06-14',
  operador: 'Servientrega',
  guia: '1099887766',
  impuestoEl: '2027-06-18',
};

beforeAll(() => {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  app = getApps().find((a) => a.name === '[DEFAULT]') ?? initializeApp({ projectId: 'demo-altorra-gestion' });
  db = getFirestore(app);
});

afterAll(async () => {
  await deleteApp(app);
});

beforeEach(async () => {
  const snap = await db.collection('contratos').get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
});

describe('la puerta de permisos', () => {
  it('sin sesión: rechaza y NO escribe', async () => {
    await sembrarContrato();
    const e = await falla(() => registrarPreaviso.run(pedir(EVIDENCIA_A_TIEMPO, NADIE)));
    expect(e.code).toContain('unauthenticated');
    const doc = (await db.doc(`contratos/${CONTRATO_ID}`).get()).data() as Contrato;
    expect(doc.preaviso).toBeUndefined();
    expect(doc.estado).toBe('vigente');
  });

  it('un rol de solo lectura no puede registrar un preaviso', async () => {
    await sembrarContrato();
    const e = await falla(() => registrarPreaviso.run(pedir(EVIDENCIA_A_TIEMPO, MIRON)));
    expect(e.code).toContain('permission-denied');
  });

  it('un editor sí puede: son los mismos que escriben en la bóveda', async () => {
    await sembrarContrato();
    const r = (await registrarPreaviso.run(pedir(EVIDENCIA_A_TIEMPO, EDITOR))) as { efecto: string };
    expect(r.efecto).toBe('termina');
  });
});

describe('el estado del contrato se DERIVA del veredicto, no se teclea', () => {
  it('a tiempo: archiva la evidencia Y mueve el contrato a `preaviso`', async () => {
    await sembrarContrato();
    const r = (await registrarPreaviso.run(pedir(EVIDENCIA_A_TIEMPO))) as {
      efecto: string;
      estadoContrato: string;
      vigenciaFin: string;
    };

    expect(r.efecto).toBe('termina');
    expect(r.estadoContrato).toBe('preaviso');
    expect(r.vigenciaFin).toBe(VIGENCIA_FIN);

    const doc = (await db.doc(`contratos/${CONTRATO_ID}`).get()).data() as Contrato;
    expect(doc.estado).toBe('preaviso');
    expect(doc.preaviso?.efecto).toBe('termina');
    expect(doc.preaviso?.impuestoEl).toBe('2027-06-18');
    expect(doc.preaviso?.guia).toBe('1099887766');
  });

  it('🔴 TARDE: guarda la evidencia y el contrato NO cambia de estado — se prorroga', async () => {
    await sembrarContrato();
    // El límite era el 30-jun-2027. Doce días tarde.
    const r = (await registrarPreaviso.run(
      pedir({ ...EVIDENCIA_A_TIEMPO, impuestoEl: '2027-07-12' }),
    )) as { efecto: string; estadoContrato: string; motivo?: string };

    expect(r.efecto).toBe('se-prorroga');
    expect(r.estadoContrato).toBe('vigente');
    expect(r.motivo).toContain('se prorroga');

    const doc = (await db.doc(`contratos/${CONTRATO_ID}`).get()).data() as Contrato;
    // El hecho queda archivado: borrarlo dejaría el contrato prorrogándose sin que conste por qué.
    expect(doc.preaviso?.efecto).toBe('se-prorroga');
    expect(doc.preaviso?.impuestoEl).toBe('2027-07-12');
    expect(doc.estado).toBe('vigente');
  });

  it('el veredicto se CONGELA: corregir la vigencia después no reescribe un acto ya ocurrido', async () => {
    await sembrarContrato();
    await registrarPreaviso.run(pedir(EVIDENCIA_A_TIEMPO));

    // Alguien corrige la vigencia a una fecha que habría dejado el preaviso tarde.
    await db.doc(`contratos/${CONTRATO_ID}`).set({ vigenciaFin: '2027-07-01' }, { merge: true });

    const doc = (await db.doc(`contratos/${CONTRATO_ID}`).get()).data() as Contrato;
    expect(doc.preaviso?.efecto).toBe('termina');
  });
});

describe('lo que falta se rechaza; lo que llegó tarde no', () => {
  it('sin guía ni operador: no hay acto que archivar', async () => {
    await sembrarContrato();
    const e = await falla(() =>
      registrarPreaviso.run(pedir({ ...EVIDENCIA_A_TIEMPO, operador: '', guia: '' })),
    );
    expect(e.code).toContain('invalid-argument');
    const problemas = (e.details as { problemas: string[] }).problemas;
    expect(problemas).toContain('sin-operador');
    expect(problemas).toContain('sin-guia');

    const doc = (await db.doc(`contratos/${CONTRATO_ID}`).get()).data() as Contrato;
    expect(doc.preaviso).toBeUndefined();
  });

  it('sin fecha de imposición: es una intención, no un preaviso', async () => {
    await sembrarContrato();
    const e = await falla(() => registrarPreaviso.run(pedir({ ...EVIDENCIA_A_TIEMPO, impuestoEl: '' })));
    expect(e.code).toContain('invalid-argument');
    expect((e.details as { problemas: string[] }).problemas).toContain('sin-fecha-de-imposicion');
  });

  it('sin decir quién avisa: rechaza', async () => {
    await sembrarContrato();
    const e = await falla(() => registrarPreaviso.run(pedir({ ...EVIDENCIA_A_TIEMPO, quien: 'portero' })));
    expect(e.code).toContain('invalid-argument');
  });
});

describe('\U0001F534 el aviso del ARRENDADOR no mueve el contrato (§263)', () => {
  /*
   * El servidor deriva el estado del veredicto: `if (veredicto === 'termina') estado = 'preaviso'`.
   * Con el aviso del arrendador el veredicto ya no es `termina`, así que el contrato NO se marca —
   * y eso es lo correcto: la restitución no procede solo con la carta. Se comprueba contra el
   * emulador porque es el único sitio donde se ve lo que queda ESCRITO en Firestore.
   */
  it('registra la evidencia pero NO marca el contrato como terminado', async () => {
    await sembrarContrato();
    const r = (await registrarPreaviso.run(
      pedir({ ...EVIDENCIA_A_TIEMPO, quien: 'arrendador' }, EDITOR),
    )) as { efecto: string; estadoContrato: string };

    expect(r.efecto).toBe('falta-titulo-del-arrendador');

    const doc = (await db.doc(`contratos/${CONTRATO_ID}`).get()).data() as Contrato;
    // La constancia SÍ queda archivada: el acto ocurrió y su prueba es lo que importa guardar.
    expect(doc.preaviso?.guia).toBe('1099887766');
    expect(doc.preaviso?.efecto).toBe('falta-titulo-del-arrendador');
    // Pero el contrato sigue como estaba.
    expect(doc.estado).not.toBe('preaviso');
  });
});

describe('el plazo sale del CONTRATO, no de quien llama', () => {
  it('mandar otra `vigenciaFin` en el cuerpo no regala tres meses', async () => {
    await sembrarContrato();
    // Impuesto tarde de verdad; el cuerpo intenta colar un vencimiento más lejano.
    const r = (await registrarPreaviso.run(
      pedir({ ...EVIDENCIA_A_TIEMPO, impuestoEl: '2027-07-12', vigenciaFin: '2028-12-31' }),
    )) as { efecto: string };
    expect(r.efecto).toBe('se-prorroga');
  });

  it('un contrato sin fecha de vencimiento se para en vez de guardar algo injuzgable', async () => {
    await sembrarContrato({ vigenciaFin: '' as Contrato['vigenciaFin'] });
    const e = await falla(() => registrarPreaviso.run(pedir(EVIDENCIA_A_TIEMPO)));
    expect(e.code).toContain('failed-precondition');
    expect(e.message).toContain('vencimiento');
  });

  it('un contrato ya terminado no admite preaviso', async () => {
    await sembrarContrato({ estado: 'terminado' });
    const e = await falla(() => registrarPreaviso.run(pedir(EVIDENCIA_A_TIEMPO)));
    expect(e.code).toContain('failed-precondition');
  });

  it('un contrato que no existe: lo dice con su id', async () => {
    const e = await falla(() =>
      registrarPreaviso.run(pedir({ ...EVIDENCIA_A_TIEMPO, contratoId: 'CTO-NO-EXISTE' })),
    );
    expect(e.code).toContain('not-found');
    expect(e.message).toContain('CTO-NO-EXISTE');
  });
});
