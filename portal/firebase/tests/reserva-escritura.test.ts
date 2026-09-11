/*
 * ANTI-OVERBOOKING, CONTRA EL EMULADOR — el gate de salida de Ola 2 (MEGA-PLAN §4.5, adenda Gemini).
 *
 * POR QUÉ ESTAS PRUEBAS Y NO SOLO LAS DEL DOMINIO. `domain/disponibilidad.ts` ya prueba qué noches
 * ocupa una estancia y cuáles bloquean, y lo hace sin servidor. Lo que NO puede probar —y es lo
 * único que de verdad impide que dos personas duerman la misma noche en la misma cama— es la
 * CONCURRENCIA: que dos reservas simultáneas sobre las mismas fechas no quepan las dos.
 *
 * 🎯 Y eso no se demuestra leyendo el código. Una transacción mal escrita —con la lectura FUERA de
 * `runTransaction`— pasa todas las pruebas secuenciales del mundo: mira, ve libre, escribe, y el
 * resultado es correcto siempre que nadie más esté mirando a la vez. El fallo solo existe cuando hay
 * dos a la vez, así que la prueba tiene que ponerlos a la vez. Por eso `Promise.all` y no un bucle.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp, deleteApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { retenerNoches, liberarNoches } from '../../functions/src/reserva-escritura';
import { docIdDisponibilidad } from '../../src/lib/domain/disponibilidad';

let app: App;
let db: Firestore;

const PROP = 'INM-202607-7001';
const AUTOR = { uid: 'daniel-uid' };
/** Fechas MUY en el futuro: si fueran relativas a hoy, esta prueba caducaría sola algún día. */
const LLEGADA = '2030-07-10';
const SALIDA = '2030-07-13'; // 3 noches: 10, 11 y 12
const NOCHES = ['2030-07-10', '2030-07-11', '2030-07-12'];

const estancia = (llegada = LLEGADA, salida = SALIDA) => ({
  propiedadId: PROP,
  llegada,
  salida,
  huespedes: 2,
});

/** El «hoy» que ve la validación. Fijo, para que la prueba no dependa del reloj de quien la corre. */
const AHORA = new Date('2030-01-01T00:00:00Z');

async function falla(fn: () => Promise<unknown>): Promise<{ code: string; message: string; details?: unknown }> {
  try {
    await fn();
  } catch (e) {
    const err = e as { code?: string; message?: string; details?: unknown };
    return { code: String(err.code), message: String(err.message), details: err.details };
  }
  throw new Error('se esperaba un fallo y no lo hubo');
}

const leerNoche = async (fecha: string) =>
  (await db.doc(`disponibilidad/${docIdDisponibilidad(PROP, fecha)}`).get()).data();

beforeAll(() => {
  process.env.GCLOUD_PROJECT ??= 'demo-altorra-reservas';
  app = getApps().length ? getApps()[0] : initializeApp({ projectId: 'demo-altorra-reservas' });
  db = getFirestore(app);
});

afterAll(async () => {
  await deleteApp(app).catch(() => {});
});

beforeEach(async () => {
  for (const f of [...NOCHES, '2030-07-13', '2030-07-14', '2030-07-09']) {
    await db.doc(`disponibilidad/${docIdDisponibilidad(PROP, f)}`).delete().catch(() => {});
  }
  const viejas = await db.collection('reservas').where('propiedadId', '==', PROP).get();
  await Promise.all(viejas.docs.map((d) => d.ref.delete()));
});

describe('retenerNoches — todo o nada', () => {
  it('retiene las noches de la estancia y deja la SALIDA libre', async () => {
    const r = await retenerNoches(db, estancia(), AUTOR, AHORA);
    expect(r.noches).toEqual(NOCHES);

    for (const f of NOCHES) expect((await leerNoche(f))?.estado).toBe('reservado');
    // El 13 es el día de salida: esa cama se puede vender otra vez esa misma noche.
    expect(await leerNoche('2030-07-13')).toBeUndefined();
  });

  it('la reserva guarda quién la creó DESDE EL TOKEN, no desde el cuerpo de la llamada', async () => {
    const r = await retenerNoches(db, estancia(), AUTOR, AHORA);
    const doc = (await db.doc(`reservas/${r.reservaId}`).get()).data();
    expect(doc?.creadaPor).toBe('daniel-uid');
    expect(doc?.estado).toBe('retenida');
    expect(doc?.noches).toBe(3);
  });

  it('🎯 si UNA sola noche está tomada, no se retiene NINGUNA', async () => {
    await retenerNoches(db, estancia('2030-07-11', '2030-07-12'), AUTOR, AHORA); // toma solo el 11

    const e = await falla(() => retenerNoches(db, estancia(), AUTOR, AHORA));
    expect(e.code).toContain('aborted');
    expect((e.details as { ocupadas: { fecha: string }[] }).ocupadas.map((o) => o.fecha)).toEqual(['2030-07-11']);

    // Y lo que importa: el 10 y el 12 siguen LIBRES. Una retención a medias habría dejado a alguien
    // con la primera mitad de sus vacaciones y un agujero en medio.
    expect(await leerNoche('2030-07-10')).toBeUndefined();
    expect(await leerNoche('2030-07-12')).toBeUndefined();
  });

  it('🎯 dos estancias ADYACENTES sí caben: la segunda llega el día que la primera se va', async () => {
    await retenerNoches(db, estancia(), AUTOR, AHORA); // 10 → 13
    const r = await retenerNoches(db, estancia('2030-07-13', '2030-07-15'), AUTOR, AHORA);
    expect(r.noches).toEqual(['2030-07-13', '2030-07-14']);
  });

  it('lo que el anfitrión CERRÓ tampoco se puede vender, y se dice distinto', async () => {
    await db.doc(`disponibilidad/${docIdDisponibilidad(PROP, '2030-07-11')}`).set({
      _version: 1, propiedadId: PROP, fecha: '2030-07-11', estado: 'bloqueado',
    });
    const e = await falla(() => retenerNoches(db, estancia(), AUTOR, AHORA));
    expect(e.message).toContain('anfitrión');
  });

  it('la puerta valida con las MISMAS reglas que ve el formulario (una regla, un dueño)', async () => {
    const e = await falla(() => retenerNoches(db, { ...estancia(), huespedes: 0 }, AUTOR, AHORA));
    expect(e.code).toContain('invalid-argument');
    const pasado = await falla(() => retenerNoches(db, estancia('2029-01-01', '2029-01-03'), AUTOR, AHORA));
    expect(pasado.code).toContain('invalid-argument');
  });
});

describe('🏁 CARRERA — el gate de salida de Ola 2 (MEGA-PLAN §4.5)', () => {
  it('🎯 seis reservas SIMULTÁNEAS sobre las mismas noches: gana exactamente UNA', async () => {
    const intentos = await Promise.allSettled(
      Array.from({ length: 6 }, () => retenerNoches(db, estancia(), AUTOR, AHORA)),
    );

    const ganadas = intentos.filter((r) => r.status === 'fulfilled');
    expect(ganadas).toHaveLength(1);
    // Las otras cinco no fallan de cualquier manera: fallan DICIENDO que las noches están tomadas.
    for (const r of intentos.filter((x) => x.status === 'rejected')) {
      expect(String((r as PromiseRejectedResult).reason?.code)).toContain('aborted');
    }

    // Y el calendario queda coherente: las tres noches con el MISMO id de reserva, la ganadora.
    const ganadora = (ganadas[0] as PromiseFulfilledResult<{ reservaId: string }>).value.reservaId;
    for (const f of NOCHES) {
      const d = await leerNoche(f);
      expect(d?.estado).toBe('reservado');
      expect(d?.reservaId).toBe(ganadora);
    }
  });

  it('🎯 rangos que SE SOLAPAN parcialmente tampoco caben los dos', async () => {
    // 10→13 y 12→15 comparten solo la noche del 12. Una sola noche compartida basta para excluir.
    const [a, b] = await Promise.allSettled([
      retenerNoches(db, estancia('2030-07-10', '2030-07-13'), AUTOR, AHORA),
      retenerNoches(db, estancia('2030-07-12', '2030-07-15'), AUTOR, AHORA),
    ]);
    expect([a.status, b.status].filter((s) => s === 'fulfilled')).toHaveLength(1);
  });

  it('rangos DISJUNTOS sí caben los dos a la vez (el candado no puede ser un cerrojo global)', async () => {
    const [a, b] = await Promise.allSettled([
      retenerNoches(db, estancia('2030-07-10', '2030-07-12'), AUTOR, AHORA),
      retenerNoches(db, estancia('2030-07-13', '2030-07-15'), AUTOR, AHORA),
    ]);
    expect([a.status, b.status]).toEqual(['fulfilled', 'fulfilled']);
  });
});

describe('liberarNoches — suelta lo suyo y solo lo suyo', () => {
  it('libera las noches de la reserva y la deja marcada', async () => {
    const r = await retenerNoches(db, estancia(), AUTOR, AHORA);
    const out = await liberarNoches(db, r.reservaId, AUTOR);

    expect(out.liberadas).toBe(3);
    for (const f of NOCHES) expect((await leerNoche(f))?.estado).toBe('libre');
    expect((await db.doc(`reservas/${r.reservaId}`).get()).data()?.estado).toBe('liberada');
  });

  it('🎯 liberar una reserva VIEJA no toca las noches que ya son de otra', async () => {
    const primera = await retenerNoches(db, estancia(), AUTOR, AHORA);
    await liberarNoches(db, primera.reservaId, AUTOR);
    const segunda = await retenerNoches(db, estancia(), AUTOR, AHORA); // vuelve a tomar las mismas

    // Liberar OTRA VEZ la primera no puede desbloquear las noches de la segunda.
    const out = await liberarNoches(db, primera.reservaId, AUTOR);
    expect(out.liberadas).toBe(0);
    for (const f of NOCHES) {
      const d = await leerNoche(f);
      expect(d?.estado).toBe('reservado');
      expect(d?.reservaId).toBe(segunda.reservaId);
    }
  });

  it('una reserva que no existe se dice, no se inventa', async () => {
    const e = await falla(() => liberarNoches(db, 'no-existe', AUTOR));
    expect(e.code).toContain('not-found');
  });
});
