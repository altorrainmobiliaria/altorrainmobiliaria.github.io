/*
 * LAS PUERTAS DEL PERFIL DE INQUILINO, contra el emulador (§152).
 *
 * LO QUE DE VERDAD SE PRUEBA AQUÍ, y que ninguna prueba de dominio puede probar: que el `uid` sale
 * del TOKEN y no del cuerpo de la llamada. Es el único sitio del sistema donde escribe alguien de
 * FUERA del equipo, así que la pregunta que importa no es «¿valida el checklist?» —eso ya lo
 * prueba el dominio— sino «¿puede alguien escribir en el perfil de otro?».
 *
 * Se ejercita el MISMO código que se despliega, con el `.run()` que la librería expone.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp, deleteApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { enviarPerfil, guardarPerfil, revisarPerfil } from '../../functions/src/perfil-escritura';
import type { PerfilInquilino, Requisito } from '../../src/lib/domain/perfil-inquilino';

let app: App;
let db: Firestore;

/** Una persona corriente con cuenta: SIN el claim `admin`. Es el usuario por defecto del portal. */
const ANA = { uid: 'ana-uid', token: { email: 'ana@correo.com' } };
const OTRO = { uid: 'otro-uid', token: { email: 'otro@correo.com' } };
const REVISOR = { uid: 'editor-uid', token: { admin: true, rol: 'editor' } };
const MIRON = { uid: 'viewer-uid', token: { admin: true, rol: 'viewer' } };
const NADIE = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pedir = (data: unknown, auth: unknown = ANA): any => ({ data, auth, rawRequest: {} });

async function falla(fn: () => Promise<unknown>): Promise<{ code: string; message: string; details?: unknown }> {
  try {
    await fn();
  } catch (e) {
    const err = e as { code?: string; message?: string; details?: unknown };
    return { code: String(err.code), message: String(err.message), details: err.details };
  }
  throw new Error('se esperaba un fallo y no lo hubo');
}

const DATOS = { nombre: 'Ana Restrepo', email: 'ana@correo.com', autorizaTratamiento: true };

/** Siembra los soportes saltándose las puertas: aquí se prueba el ciclo, no la subida. */
async function conSoportes(uid: string, requisitos: Requisito[]): Promise<void> {
  await db.doc(`perfiles/${uid}`).update({
    soportes: requisitos.map((r) => ({
      requisito: r,
      claveStorage: `perfiles/${uid}/${r}/x.pdf`,
      nombreArchivo: 'x.pdf',
      subidoEn: '2026-08-01T00:00:00.000Z',
    })),
  });
}

beforeAll(() => {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  app = getApps().find((a) => a.name === '[DEFAULT]') ?? initializeApp({ projectId: 'demo-altorra-gestion' });
  db = getFirestore(app);
});

afterAll(async () => {
  await deleteApp(app);
});

beforeEach(async () => {
  const snap = await db.collection('perfiles').get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
});

describe('quién puede tocar qué', () => {
  it('sin sesión no se guarda nada', async () => {
    const e = await falla(() => guardarPerfil.run(pedir(DATOS, NADIE)));
    expect(e.code).toContain('unauthenticated');
    expect((await db.collection('perfiles').get()).empty).toBe(true);
  });

  it('una persona corriente SÍ puede: es el único sitio donde escribe alguien de fuera', async () => {
    const r = (await guardarPerfil.run(pedir(DATOS, ANA))) as { ok: boolean; perfil: PerfilInquilino };
    expect(r.ok).toBe(true);
    expect(r.perfil.uid).toBe('ana-uid');
  });

  it('🔴 el uid sale del TOKEN: mandarlo en el cuerpo no escribe en el perfil de otro', async () => {
    await guardarPerfil.run(pedir({ ...DATOS, uid: 'ana-uid', id: 'ana-uid' }, OTRO));
    const deAna = await db.doc('perfiles/ana-uid').get();
    const deOtro = await db.doc('perfiles/otro-uid').get();
    expect(deAna.exists).toBe(false);
    expect(deOtro.exists).toBe(true);
  });

  it('quien solo consulta NO puede dictaminar', async () => {
    await guardarPerfil.run(pedir(DATOS, ANA));
    const e = await falla(() => revisarPerfil.run(pedir({ uid: 'ana-uid', estado: 'verificado' }, MIRON)));
    expect(e.code).toContain('permission-denied');
  });

  it('🔴 un titular NO puede verificarse a sí mismo', async () => {
    await guardarPerfil.run(pedir(DATOS, ANA));
    const e = await falla(() => revisarPerfil.run(pedir({ uid: 'ana-uid', estado: 'verificado' }, ANA)));
    expect(e.code).toContain('unauthenticated');
  });
});

describe('guardarPerfil', () => {
  it('el perfil nace en borrador y su id es el uid: una persona, un perfil', async () => {
    const { perfil } = (await guardarPerfil.run(pedir(DATOS))) as { perfil: PerfilInquilino };
    expect(perfil.id).toBe('ana-uid');
    expect(perfil.estado).toBe('borrador');
    expect(perfil._version).toBe(1);
  });

  it('guardar otra vez actualiza y sube la versión, no duplica', async () => {
    await guardarPerfil.run(pedir(DATOS));
    const { perfil } = (await guardarPerfil.run(pedir({ ...DATOS, telefono: '3002439810' }))) as {
      perfil: PerfilInquilino;
    };
    expect(perfil.telefono).toBe('3002439810');
    expect(perfil._version).toBe(2);
    expect((await db.collection('perfiles').get()).size).toBe(1);
  });

  it('🔴 en revisión NO se edita: cambiar los datos mientras alguien los mira los vuelve una foto vieja', async () => {
    await guardarPerfil.run(pedir(DATOS));
    await conSoportes('ana-uid', ['cedula', 'ingresos', 'laboral', 'referencia']);
    await enviarPerfil.run(pedir({}, ANA));
    const e = await falla(() => guardarPerfil.run(pedir({ ...DATOS, nombre: 'Otro nombre' })));
    expect(e.code).toContain('failed-precondition');
  });
});

describe('enviarPerfil', () => {
  it('con todo completo pasa a enviado y estampa la fecha', async () => {
    await guardarPerfil.run(pedir(DATOS));
    await conSoportes('ana-uid', ['cedula', 'ingresos', 'laboral', 'referencia']);
    const { perfil } = (await enviarPerfil.run(pedir({}))) as { perfil: PerfilInquilino };
    expect(perfil.estado).toBe('enviado');
    expect(perfil.enviadoEn).toBeTruthy();
  });

  it('sin soportes se rechaza CON la lista de lo que falta', async () => {
    await guardarPerfil.run(pedir(DATOS));
    const e = await falla(() => enviarPerfil.run(pedir({})));
    const p = (e.details as { problemas: string[] }).problemas;
    expect(p.some((x) => x.startsWith('faltan:'))).toBe(true);
    expect((e.details as { mensajes: string[] }).mensajes.join(' ')).toContain('Documento de identidad');
  });

  it('🔴 sin autorización de tratamiento NO se envía (Ley 1581 art. 9)', async () => {
    await guardarPerfil.run(pedir({ ...DATOS, autorizaTratamiento: false }));
    await conSoportes('ana-uid', ['cedula', 'ingresos', 'laboral', 'referencia']);
    const e = await falla(() => enviarPerfil.run(pedir({})));
    expect((e.details as { problemas: string[] }).problemas).toContain('sin-autorizacion');
  });

  it('quien arrienda por primera vez no debe la referencia', async () => {
    await guardarPerfil.run(pedir({ ...DATOS, primerArriendo: true }));
    await conSoportes('ana-uid', ['cedula', 'ingresos', 'laboral']);
    const { perfil } = (await enviarPerfil.run(pedir({}))) as { perfil: PerfilInquilino };
    expect(perfil.estado).toBe('enviado');
  });

  it('sin perfil no hay nada que enviar', async () => {
    const e = await falla(() => enviarPerfil.run(pedir({})));
    expect(e.code).toContain('not-found');
  });
});

describe('revisarPerfil', () => {
  async function enRevision(): Promise<void> {
    await guardarPerfil.run(pedir(DATOS));
    await conSoportes('ana-uid', ['cedula', 'ingresos', 'laboral', 'referencia']);
    await enviarPerfil.run(pedir({}));
  }

  it('verificar estampa la fecha, que es de donde sale la vigencia', async () => {
    await enRevision();
    const { perfil } = (await revisarPerfil.run(
      pedir({ uid: 'ana-uid', estado: 'verificado' }, REVISOR),
    )) as { perfil: PerfilInquilino };
    expect(perfil.estado).toBe('verificado');
    expect(perfil.verificadoEn).toBeTruthy();
  });

  it('🔴 devolver SIN escribir qué falta se rechaza', async () => {
    await enRevision();
    const e = await falla(() => revisarPerfil.run(pedir({ uid: 'ana-uid', estado: 'observaciones' }, REVISOR)));
    expect((e.details as { problemas: string[] }).problemas).toContain('sin-observaciones');
  });

  it('con observaciones sí, y quedan escritas para la persona', async () => {
    await enRevision();
    const { perfil } = (await revisarPerfil.run(
      pedir({ uid: 'ana-uid', estado: 'observaciones', observaciones: 'La cédula está borrosa.' }, REVISOR),
    )) as { perfil: PerfilInquilino };
    expect(perfil.observaciones).toBe('La cédula está borrosa.');
  });

  it('desde observaciones se reenvía, y las viejas se van: no se ve para siempre lo ya corregido', async () => {
    await enRevision();
    await revisarPerfil.run(pedir({ uid: 'ana-uid', estado: 'observaciones', observaciones: 'Borrosa.' }, REVISOR));
    const { perfil } = (await enviarPerfil.run(pedir({}))) as { perfil: PerfilInquilino };
    expect(perfil.estado).toBe('enviado');
    expect(perfil.observaciones).toBeUndefined();
  });

  it('un salto que el dominio no permite se rechaza también aquí', async () => {
    await guardarPerfil.run(pedir(DATOS));
    const e = await falla(() => revisarPerfil.run(pedir({ uid: 'ana-uid', estado: 'verificado' }, REVISOR)));
    expect((e.details as { problemas: string[] }).problemas).toContain('no-se-puede:borrador->verificado');
  });

  it('un perfil que no existe no se puede revisar', async () => {
    const e = await falla(() => revisarPerfil.run(pedir({ uid: 'fantasma', estado: 'verificado' }, REVISOR)));
    expect(e.code).toContain('not-found');
  });
});
