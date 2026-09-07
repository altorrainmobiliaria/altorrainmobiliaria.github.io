import { describe, it, expect, vi } from 'vitest';
import { decodeValue, decodeDocument, getDoc, type FsDocument, type FsValue } from './firestore-rest';

// Helper: respuesta mínima con lo único que getDoc consume (status + json()).
const res = (status: number, body?: unknown): Response =>
  ({ status, json: async () => body }) as unknown as Response;

describe('decodeValue — despacho por presencia de clave', () => {
  it('string / boolean(false) / null se decodifican por CLAVE, no por truthiness', () => {
    expect(decodeValue({ stringValue: 'hola' })).toBe('hola');
    expect(decodeValue({ booleanValue: false })).toBe(false); // NO undefined
    expect(decodeValue({ nullValue: null })).toBe(null); // NO undefined
    expect(decodeValue({ booleanValue: true })).toBe(true);
  });

  it('integerValue llega como STRING → number exacto (COP grande)', () => {
    expect(decodeValue({ integerValue: '0' })).toBe(0);
    expect(decodeValue({ integerValue: '1' })).toBe(1);
    expect(decodeValue({ integerValue: '1250000000' })).toBe(1_250_000_000);
  });

  it('doubleValue como number o como string ("NaN"/"Infinity")', () => {
    expect(decodeValue({ doubleValue: 3.5 })).toBe(3.5);
    expect(decodeValue({ doubleValue: 'Infinity' })).toBe(Infinity);
    expect(Number.isNaN(decodeValue({ doubleValue: 'NaN' }) as number)).toBe(true);
  });

  it('timestampValue se conserva como ISO string', () => {
    expect(decodeValue({ timestampValue: '2026-07-11T00:00:00Z' })).toBe('2026-07-11T00:00:00Z');
  });

  it('geoPointValue → {lat,lng}', () => {
    expect(decodeValue({ geoPointValue: { latitude: 10.4, longitude: -75.5 } })).toEqual({ lat: 10.4, lng: -75.5 });
  });

  it('BLOCKER: mapa VACÍO llega sin `fields` → {}', () => {
    expect(decodeValue({ mapValue: {} } as FsValue)).toEqual({});
  });

  it('BLOCKER: array VACÍO llega sin `values` → []', () => {
    expect(decodeValue({ arrayValue: {} } as FsValue)).toEqual([]);
  });

  it('mapa anidado y array-de-mapas (precio / priceHistory)', () => {
    const precio: FsValue = {
      mapValue: {
        fields: {
          moneda: { stringValue: 'COP' },
          canon: { integerValue: '2500000' },
          adminIncluidaEnCanon: { booleanValue: false },
        },
      },
    };
    expect(decodeValue(precio)).toEqual({ moneda: 'COP', canon: 2_500_000, adminIncluidaEnCanon: false });

    const priceHistory: FsValue = {
      arrayValue: {
        values: [
          { mapValue: { fields: { fecha: { stringValue: '2026-06-01' }, valor: { integerValue: '2400000' } } } },
          { mapValue: { fields: { fecha: { stringValue: '2026-07-01' }, valor: { integerValue: '2500000' } } } },
        ],
      },
    };
    expect(decodeValue(priceHistory)).toEqual([
      { fecha: '2026-06-01', valor: 2_400_000 },
      { fecha: '2026-07-01', valor: 2_500_000 },
    ]);
  });

  it('tipo desconocido → undefined + warn (no lanza)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(decodeValue({ raroValue: 1 } as unknown as FsValue)).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('decodeDocument', () => {
  it('deriva id del name y usa create/updateTime como fallback', () => {
    const doc: FsDocument = {
      name: 'projects/p/databases/(default)/documents/propiedades/INM-202607-0001',
      fields: { titulo: { stringValue: 'Apto en Bocagrande' }, amenidades: { mapValue: {} } },
      createTime: '2026-07-01T00:00:00Z',
      updateTime: '2026-07-10T00:00:00Z',
    };
    expect(decodeDocument(doc)).toEqual({
      id: 'INM-202607-0001',
      titulo: 'Apto en Bocagrande',
      amenidades: {},
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-10T00:00:00Z',
    });
  });

  it('respeta el id/createdAt propios del doc si vienen en fields', () => {
    const doc: FsDocument = {
      name: 'projects/p/databases/(default)/documents/config/general',
      fields: { id: { stringValue: 'general' }, createdAt: { stringValue: '2026-01-01T00:00:00Z' } },
      createTime: '2025-01-01T00:00:00Z',
    };
    const out = decodeDocument(doc);
    expect(out.id).toBe('general');
    expect(out.createdAt).toBe('2026-01-01T00:00:00Z'); // el del field, no el createTime REST
  });

  it('documento sin fields → objeto solo con id derivado', () => {
    expect(decodeDocument({ name: 'projects/p/databases/(default)/documents/config/promo' })).toEqual({
      id: 'promo',
    });
  });
});

describe('getDoc — mapeo de status y contrato "nunca lanza"', () => {
  const opts = { apiKey: 'k', projectId: 'proj' };

  it('200 → ok con doc decodificado', async () => {
    const fetchImpl = vi.fn(async () =>
      res(200, { name: 'projects/proj/databases/(default)/documents/propiedades/X', fields: { titulo: { stringValue: 'T' } } }),
    );
    const r = await getDoc(['propiedades', 'X'], { ...opts, fetchImpl });
    expect(r).toEqual({ ok: true, data: { id: 'X', titulo: 'T' } });
  });

  it('la URL incluye projectId, path y ?key', async () => {
    const fetchImpl = vi.fn(async (_input: URL | RequestInfo, _init?: RequestInit) =>
      res(200, { name: 'documents/propiedades/X' }),
    );
    await getDoc(['propiedades', 'X'], { ...opts, fetchImpl });
    const url = String(fetchImpl.mock.calls[0][0]);
    expect(url).toContain('/projects/proj/databases/(default)/documents/propiedades/X');
    expect(url).toContain('key=k');
  });

  it('404 → not-found, 403 → denied, 500 → error(status)', async () => {
    expect(await getDoc(['c', 'x'], { ...opts, fetchImpl: vi.fn(async () => res(404)) })).toEqual({
      ok: false, reason: 'not-found', status: 404,
    });
    expect(await getDoc(['c', 'x'], { ...opts, fetchImpl: vi.fn(async () => res(403)) })).toEqual({
      ok: false, reason: 'denied', status: 403,
    });
    expect(await getDoc(['c', 'x'], { ...opts, fetchImpl: vi.fn(async () => res(500)) })).toEqual({
      ok: false, reason: 'error', status: 500,
    });
  });

  it('fetch que RECHAZA (red/abort) → error, no lanza', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network');
    });
    await expect(getDoc(['c', 'x'], { ...opts, fetchImpl })).resolves.toEqual({ ok: false, reason: 'error' });
  });

  it('body no-JSON → error, no lanza', async () => {
    const fetchImpl = vi.fn(async () =>
      ({ status: 200, json: async () => { throw new SyntaxError('bad json'); } }) as unknown as Response,
    );
    await expect(getDoc(['c', 'x'], { ...opts, fetchImpl })).resolves.toEqual({ ok: false, reason: 'error' });
  });
});
