import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp, deleteApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { rebuildCatalogo, refShard, DOC_CONTROL } from '../../functions/src/catalogo-rebuild';

// Gates del camino de ESCRITURA del catálogo (§54.5: GATE-CRASH idempotencia · GATE-CARRERA concurrencia ·
// estado-cero · anti-oráculo) contra el EMULADOR REAL con el Admin SDK — el MISMO código que correrá en la
// Cloud Function (no un doble). Se ejecuta con `npm run test:rules` (emulators:exec ya exporta el host).
//
// ⚠️ projectId PROPIO (L-21): `rules.test.ts` hace clearFirestore() en cada test y ARRASARÍA esta semilla
// si compartieran proyecto. El emulador aísla por projectId aunque los archivos corran en paralelo.
const PROJECT_ID = 'demo-altorra-catalogo';

let app: App;
let db: Firestore;

beforeAll(() => {
  app = initializeApp({ projectId: PROJECT_ID }, 'catalogo-tests');
  db = getFirestore(app);
});
afterAll(async () => {
  await deleteApp(app);
});

async function limpiar(): Promise<void> {
  for (const col of ['propiedades', 'indices']) {
    const snap = await db.collection(col).get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
}
beforeEach(limpiar);

function propiedad(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    _version: 1,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-10T00:00:00.000Z',
    operacion: 'venta',
    vertical: 'vivienda',
    tipo: 'apartamento',
    estado: 'disponible',
    titulo: 'Apto en Bocagrande',
    descripcion: 'd',
    geo: { ciudad: 'Cartagena', barrio: 'Bocagrande', lat: 10.399, lng: -75.554 },
    specs: { habitaciones: 3, banos: 2, areaConstruidaM2: 120 },
    amenidades: {},
    precio: { moneda: 'COP', valorVenta: 450_000_000 },
    imagenes: ['props/x/thumb.webp'],
    ...over,
  };
}
const sembrar = (id: string, over: Record<string, unknown> = {}) =>
  db.doc(`propiedades/${id}`).set({ id, ...propiedad(over) });

const leerShard = async (shard: 'venta' | 'arriendo' | 'dias') => (await db.doc(refShard(shard)).get()).data();

describe('rebuildCatalogo — contra el emulador (Admin SDK, mismo código que la Function)', () => {
  it('estado-cero: sin propiedades, los 3 shards EXISTEN con items:[] (no se borra el doc)', async () => {
    await rebuildCatalogo(db, 'test');
    for (const s of ['venta', 'arriendo', 'dias'] as const) {
      const d = await leerShard(s);
      expect(d, `shard ${s} debe existir`).toBeDefined();
      expect(d?.items).toEqual([]);
      expect(d?._version).toBe(1);
    }
  });

  it('anti-oráculo: BORRADOR/inactivo nunca entran; cada operación va a SU shard', async () => {
    await sembrar('V1');
    await sembrar('A1', { operacion: 'arriendo', precio: { moneda: 'COP', canon: 3_000_000 } });
    // Un alojamiento necesita DOS cosas para entrar al índice, y las dos son legales: el `rnt` (§104)
    // y la autorización del reglamento de PH (§174). ⚠️ ESTE FIXTURE SE HA QUEDADO ATRÁS DOS VECES,
    // las dos por lo mismo: su gemelo de la suite unitaria se actualiza —porque corre en cada
    // `npm run verify`— y éste no, porque hasta §177 no lo corría NADIE. No es descuido: es lo que
    // pasa siempre con la copia que ningún gate abre.
    await sembrar('D1', {
      operacion: 'alojamiento',
      rnt: 'RNT-100001',
      autorizacionPH: { situacion: 'autoriza-expreso', declaradaEn: '2026-08-26T00:00:00Z' },
      precio: { moneda: 'COP', precioNoche: 400_000 },
    });
    await sembrar('OCULTA', { estado: 'borrador' });
    await sembrar('INACTIVA', { estado: 'inactivo' });

    const r = await rebuildCatalogo(db, 'test');
    expect(r.leidas).toBe(3); // la query ni siquiera trae las no publicadas

    const venta = await leerShard('venta');
    expect((venta?.items as { id: string }[]).map((i) => i.id)).toEqual(['V1']);
    expect((await leerShard('arriendo'))?.items).toHaveLength(1);
    expect((await leerShard('dias'))?.items).toHaveLength(1);
    const todos = JSON.stringify([venta, await leerShard('arriendo'), await leerShard('dias')]);
    expect(todos).not.toContain('OCULTA');
    expect(todos).not.toContain('INACTIVA');
  });

  it('publicada que no puede pintar card se OMITE y se REPORTA (no desaparece en silencio)', async () => {
    await sembrar('OK');
    await sembrar('SINPRECIO', { precio: { moneda: 'COP' } });
    const r = await rebuildCatalogo(db, 'test');
    expect((await leerShard('venta'))?.items).toHaveLength(1);
    expect(r.omitidas).toEqual([{ id: 'SINPRECIO', motivo: 'sin-precio' }]);
  });

  it('GATE-CRASH (idempotencia): 2 rebuilds seguidos → MISMO contenido, _version sube (retry seguro)', async () => {
    await sembrar('V1');
    await rebuildCatalogo(db, 'test-1');
    const primera = await leerShard('venta');
    await rebuildCatalogo(db, 'test-2');
    const segunda = await leerShard('venta');

    expect(JSON.stringify(segunda?.items)).toBe(JSON.stringify(primera?.items)); // converge
    expect(segunda?._version).toBe((primera?._version as number) + 1);
  });

  it('GATE-CARRERA: un rebuild VIEJO no pisa el resultado de uno más nuevo (guarda anti-adelantamiento)', async () => {
    await sembrar('V1');
    // Simula que un rebuild MÁS NUEVO ya aterrizó (actualizado en el futuro).
    const futuro = new Date(Date.now() + 60_000).toISOString();
    await db.doc(refShard('venta')).set({ _version: 9, items: [{ id: 'NUEVO' }], actualizado: futuro });

    const r = await rebuildCatalogo(db, 'test-viejo');
    const d = await leerShard('venta');
    expect((d?.items as { id: string }[])[0].id).toBe('NUEVO'); // NO fue pisado
    expect(d?._version).toBe(9);
    expect(r.porShard.venta.escrito).toBe(false); // y el reporte lo dice
  });

  it('despublicar el ÚLTIMO deja items:[] (colapso limpio) y actualiza el doc de control', async () => {
    await sembrar('V1');
    await rebuildCatalogo(db, 'test');
    expect((await leerShard('venta'))?.items).toHaveLength(1);

    await db.doc('propiedades/V1').update({ estado: 'inactivo' });
    await rebuildCatalogo(db, 'test-unpublish');

    expect((await leerShard('venta'))?.items).toEqual([]);
    const ctl = (await db.doc(DOC_CONTROL).get()).data();
    expect(ctl?.pending).toBe(false);
    expect(ctl?.motivo).toBe('test-unpublish');
  });

  it('normaliza Timestamp de Firestore a ISO (el Admin SDK escribe Timestamp, el seed escribe string)', async () => {
    await sembrar('V1', { updatedAt: new Date('2026-07-15T00:00:00.000Z') }); // → Timestamp en Firestore
    await rebuildCatalogo(db, 'test');
    const items = (await leerShard('venta'))?.items as { pub: string }[];
    expect(items[0].pub).toBe('2026-07-15T00:00:00.000Z');
  });
});
