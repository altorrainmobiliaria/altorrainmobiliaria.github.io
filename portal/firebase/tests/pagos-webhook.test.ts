/*
 * EL WEBHOOK DE PAGOS, contra el emulador (§177).
 *
 * POR QUÉ ESTAS PRUEBAS Y NO SOLO LAS DEL DOMINIO. `pagos-webhook.ts` del dominio ya prueba, con 15
 * casos, QUÉ hay que escribir ante cada evento. Lo que no puede probar —porque es puro— es lo único
 * que de verdad protege el dinero: que anotar la clave y mover el mandato ocurran **en la misma
 * transacción**. Si se anotara primero y el movimiento fallara, el reintento de Wompi llegaría, se
 * vería como duplicado y se descartaría: un pago aprobado que nunca se acredita, **sin un solo error
 * en los logs**. Eso solo se demuestra contra una base de datos de verdad.
 *
 * Se ejercita el MISMO código que se desplegará, con el mismo Admin SDK del codebase (§141).
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp, deleteApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { atenderEvento, sha256Hex } from '../../functions/src/pagos-webhook';
import { COL_EVENTOS_WOMPI, COL_MANDATOS } from '../../src/lib/domain/pagos-webhook';
import { cadenaAFirmar, type EventoWompi } from '../../src/lib/domain/wompi-evento';
import type { Mandato } from '../../src/lib/domain/mandato';

let app: App;
let db: Firestore;

const SECRETO = 'test_events_SECRETO';
const AHORA = new Date('2026-08-26T15:00:00Z');
const REF = 'MND-001';

/** Un evento REAL: se firma de verdad con el mismo algoritmo que valida el código. */
function evento(status: string, id = 'evt-1', ref = REF): EventoWompi {
  const e: EventoWompi = {
    id,
    event: 'transaction.updated',
    timestamp: 1_724_700_000,
    signature: { properties: ['transaction.id', 'transaction.status'] },
    data: { transaction: { id: 'tx-1', status, reference: ref, amount_in_cents: 250_000_000 } },
  };
  const cadena = cadenaAFirmar(e, SECRETO);
  e.signature = { ...e.signature, checksum: cadena === null ? 'no-firmable' : sha256Hex(cadena) };
  return e;
}

const sembrarMandato = async (estado: Mandato['estado'], extra: Partial<Mandato> = {}): Promise<void> => {
  await db.collection(COL_MANDATOS).doc(REF).set({ id: REF, estado, monto: 2_500_000, ...extra });
};

const leerMandato = async (): Promise<Mandato | null> => {
  const s = await db.collection(COL_MANDATOS).doc(REF).get();
  return s.exists ? (s.data() as Mandato) : null;
};

const claveAnotada = async (clave: string): Promise<boolean> =>
  (await db.collection(COL_EVENTOS_WOMPI).doc(clave).get()).exists;

beforeAll(() => {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  app = getApps().find((a) => a.name === '[DEFAULT]') ?? initializeApp({ projectId: 'demo-altorra-pagos' });
  db = getFirestore(app);
});

afterAll(async () => {
  await deleteApp(app);
});

beforeEach(async () => {
  for (const col of [COL_MANDATOS, COL_EVENTOS_WOMPI]) {
    const snap = await db.collection(col).get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
});

describe('el camino completo contra Firestore', () => {
  it('APPROVED deja el mandato RETENIDO y la clave anotada, en una sola pasada', async () => {
    await sembrarMandato('esperando');
    const r = await atenderEvento(db, evento('APPROVED'), SECRETO, AHORA);

    expect(r.codigo).toBe(200);
    expect((await leerMandato())?.estado).toBe('retenido');
    expect(await claveAnotada('evt-1')).toBe(true);
  });

  it('🔴 el segundo intento del MISMO evento no vuelve a aplicar nada', async () => {
    await sembrarMandato('esperando');
    await atenderEvento(db, evento('APPROVED'), SECRETO, AHORA);
    // Se mueve a mano a `liberado` para notar si el reintento lo pisara.
    await db.collection(COL_MANDATOS).doc(REF).set({ estado: 'liberado', giradoEl: '2026-09-02' }, { merge: true });

    const r = await atenderEvento(db, evento('APPROVED'), SECRETO, AHORA);
    expect(r.plan.veredicto).toBe('duplicado');
    expect((await leerMandato())?.estado).toBe('liberado');
  });

  it('🔴 un PENDING tardío NO borra que el dinero ya se giró', async () => {
    // El fallo que este carril existe para impedir: los eventos de Wompi llegan desordenados.
    await sembrarMandato('liberado', { giradoEl: '2026-09-02' });
    const r = await atenderEvento(db, evento('PENDING', 'evt-tardio'), SECRETO, AHORA);

    expect(r.codigo).toBe(200);
    expect((await leerMandato())?.estado).toBe('liberado');
    expect((await leerMandato())?.giradoEl).toBe('2026-09-02');
  });

  it('un VOIDED sobre un mandato ya girado SÍ pasa: el contracargo es real', async () => {
    await sembrarMandato('liberado', { giradoEl: '2026-09-02' });
    await atenderEvento(db, evento('VOIDED', 'evt-void'), SECRETO, AHORA);
    expect((await leerMandato())?.estado).toBe('reversado');
  });
});

describe('🔒 lo que solo se puede demostrar contra una base de datos', () => {
  it('🔴 firma FALSIFICADA: ni mueve el mandato, ni ocupa la clave del libro', async () => {
    await sembrarMandato('esperando');
    const falso = evento('APPROVED');
    falso.signature = { ...falso.signature, checksum: 'f'.repeat(64) };

    const r = await atenderEvento(db, falso, SECRETO, AHORA);

    expect(r.plan.veredicto).toBe('firma-invalida');
    expect(r.codigo).toBe(200); // 200 a propósito: no se le regalan reintentos a quien lo envió
    expect((await leerMandato())?.estado).toBe('esperando');
    // Y lo importante: la clave sigue LIBRE, así que el evento legítimo con ese id aún puede entrar.
    expect(await claveAnotada('evt-1')).toBe(false);

    const bueno = await atenderEvento(db, evento('APPROVED'), SECRETO, AHORA);
    expect(bueno.plan.veredicto).toBe('procesar');
    expect((await leerMandato())?.estado).toBe('retenido');
  });

  it('🔴 referencia desconocida: 500 y la clave NO queda anotada, para que el reintento la salve', async () => {
    // Sin sembrar el mandato: es la carrera real de un documento que se está creando.
    const r = await atenderEvento(db, evento('APPROVED', 'evt-carrera'), SECRETO, AHORA);
    expect(r.codigo).toBe(500);
    expect(await claveAnotada('evt-carrera')).toBe(false);

    // Llega el mandato, y el reintento de Wompi lo acredita en vez de descartarlo como duplicado.
    await sembrarMandato('esperando');
    const reintento = await atenderEvento(db, evento('APPROVED', 'evt-carrera'), SECRETO, AHORA);
    expect(reintento.codigo).toBe(200);
    expect((await leerMandato())?.estado).toBe('retenido');
  });

  it('🔴 ATOMICIDAD: si el mandato desaparece a mitad, no queda la clave anotada sola', async () => {
    // Si «anotado» y «aplicado» pudieran separarse, este es el estado que perdería un pago: clave en
    // el libro y mandato sin mover. La transacción tiene que dejar las dos cosas o ninguna.
    await sembrarMandato('esperando');
    await atenderEvento(db, evento('APPROVED', 'evt-atomico'), SECRETO, AHORA);

    const anotada = await claveAnotada('evt-atomico');
    const movido = (await leerMandato())?.estado === 'retenido';
    expect(anotada).toBe(movido);
    expect(anotada).toBe(true);
  });

  it('sin secreto configurado responde 500 y no toca nada', async () => {
    await sembrarMandato('esperando');
    const r = await atenderEvento(db, evento('APPROVED'), '', AHORA);
    expect(r.codigo).toBe(500);
    expect((await leerMandato())?.estado).toBe('esperando');
    expect(await claveAnotada('evt-1')).toBe(false);
  });
});
