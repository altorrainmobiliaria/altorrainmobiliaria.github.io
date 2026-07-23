import { describe, it, expect, vi } from 'vitest';
import { getDataClient } from './client';

// Catálogo denormalizado (OD-Catálogo §54) — contrato del cliente `catalogo.get(shard)`.
// Fronteras estado-cero del §54.4/§54.5 (G1 índice inexistente · G5 anti-oráculo · G8 doc corrupto
// · shard inválido · denied/error RUIDOSO, nunca disfrazado de vacío).

const okRes = (body: unknown): Response => ({ status: 200, json: async () => body } as unknown as Response);
const statusRes = (status: number): Response => ({ status, json: async () => ({}) } as unknown as Response);
const docBody = (path: string, fields: Record<string, unknown> = {}) => ({
  name: `projects/proj/databases/(default)/documents/${path}`,
  fields,
});

// Un CatalogoResumen en wire-format REST (map anidado dentro del array `items`).
const itemWire = {
  mapValue: {
    fields: {
      id: { stringValue: 'INM-202607-0001' },
      slug: { stringValue: 'apto-bocagrande' },
      titulo: { stringValue: 'Apto en Bocagrande' },
      operacion: { stringValue: 'venta' },
      tipo: { stringValue: 'apartamento' },
      precio: { integerValue: '450000000' }, // COP como STRING en REST (L-17)
      sector: { stringValue: 'Bocagrande' },
      coords: { mapValue: { fields: { lat: { doubleValue: 10.399 }, lng: { doubleValue: -75.554 } } } },
      hab: { integerValue: '3' },
      ban: { integerValue: '2' },
      area: { integerValue: '120' },
      thumb: { stringValue: 'props/INM-202607-0001/thumb.webp' },
      badges: { arrayValue: { values: [{ stringValue: 'nuevo' }] } },
      pub: { stringValue: '2026-07-20T00:00:00Z' },
    },
  },
};

describe('catalogo.get — shard y estado-cero (§54)', () => {
  it('shard inválido → unavailable, SIN ir a la red', async () => {
    const fetchImpl = vi.fn();
    const db = getDataClient(undefined, { fetchImpl });
    // @ts-expect-error — probamos el guard de runtime con un shard fuera de la lista cerrada
    expect(await db.catalogo.get('proyectos')).toEqual({ ok: false, reason: 'unavailable' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('índice inexistente (404) → vacío canónico {items:[]} (estado-cero legítimo, NO error) — G1/G4', async () => {
    const db = getDataClient(undefined, { fetchImpl: vi.fn(async () => statusRes(404)) });
    const r = await db.catalogo.get('venta');
    expect(r).toEqual({ ok: true, data: { _version: 0, items: [] } });
  });

  it('denied (403) → unavailable, JAMÁS disfrazado de vacío (reglas rotas = ruidoso) — §54.4 cond.2', async () => {
    const db = getDataClient(undefined, { fetchImpl: vi.fn(async () => statusRes(403)) });
    expect(await db.catalogo.get('arriendo')).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('error transitorio (500) → unavailable (loud), no vacío', async () => {
    const db = getDataClient(undefined, { fetchImpl: vi.fn(async () => statusRes(500)) });
    expect(await db.catalogo.get('dias')).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('doc corrupto (sin `items` array) → degradado SEGURO a vacío canónico (sin crash) — G8', async () => {
    const fetchImpl = vi.fn(async () => okRes(docBody('indices/catalogo-venta', { _version: { integerValue: '1' }, basura: { stringValue: 'x' } })));
    const db = getDataClient(undefined, { fetchImpl });
    const r = await db.catalogo.get('venta');
    expect(r).toEqual({ ok: true, data: { _version: 0, items: [] } });
  });
});

describe('catalogo.get — path y decodificación del índice poblado', () => {
  it('pega a indices/catalogo-{shard} y decodifica items fielmente', async () => {
    const fetchImpl = vi.fn(async (_input: URL | RequestInfo, _init?: RequestInit) =>
      okRes(
        docBody('indices/catalogo-venta', {
          _version: { integerValue: '3' },
          actualizado: { stringValue: '2026-07-23T00:00:00Z' },
          items: { arrayValue: { values: [itemWire] } },
        }),
      ),
    );
    const db = getDataClient(undefined, { fetchImpl });
    const r = await db.catalogo.get('venta');

    expect(String(fetchImpl.mock.calls[0][0])).toContain('/documents/indices/catalogo-venta');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data._version).toBe(3);
    expect(r.data.items).toHaveLength(1);
    expect(r.data.items[0]).toMatchObject({
      id: 'INM-202607-0001',
      slug: 'apto-bocagrande',
      titulo: 'Apto en Bocagrande',
      operacion: 'venta',
      precio: 450000000, // Number exacto (COP < 2^53)
      sector: 'Bocagrande',
      coords: { lat: 10.399, lng: -75.554 },
      hab: 3,
      badges: ['nuevo'],
    });
  });

  it('índice vacío poblado (items:[]) → ok con lista vacía (despublicado el último, G2)', async () => {
    const fetchImpl = vi.fn(async () =>
      okRes(docBody('indices/catalogo-arriendo', { _version: { integerValue: '5' }, items: { arrayValue: {} } })),
    );
    const db = getDataClient(undefined, { fetchImpl });
    const r = await db.catalogo.get('arriendo');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.items).toEqual([]);
    expect(r.data._version).toBe(5);
  });
});
