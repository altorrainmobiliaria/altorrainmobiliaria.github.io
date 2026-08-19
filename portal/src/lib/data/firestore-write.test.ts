import { describe, it, expect, vi } from 'vitest';
import { encodeValue, createDoc } from './firestore-rest';

// Tests de la ESCRITURA (§88). El camino de lectura ya tiene los suyos en `firestore-rest.test.ts`;
// esto cubre solo lo añadido: `encodeValue` (inverso de `decodeValue`) y `createDoc`.
// Mismo contrato que las lecturas: `createDoc` NO LANZA NUNCA.

const OPTS = { apiKey: 'K', projectId: 'P' };
const resOk = (name = 'projects/P/databases/(default)/documents/solicitudes/ABC123') =>
  ({ status: 200, json: async () => ({ name }) }) as unknown as Response;

describe('encodeValue', () => {
  it('manda los ENTEROS como string (integerValue), no como double', () => {
    // Si un entero viajara como doubleValue, `_version` y los precios dejarian de comparar
    // igual que los que escribe el legacy con el SDK.
    expect(encodeValue(3)).toEqual({ integerValue: '3' });
    expect(encodeValue(0)).toEqual({ integerValue: '0' });
    expect(encodeValue(-7)).toEqual({ integerValue: '-7' });
  });

  it('distingue double de entero', () => {
    expect(encodeValue(1.5)).toEqual({ doubleValue: 1.5 });
  });

  it('no corrompe `false` ni `null` (el espejo del hallazgo del comite OD1 en decodeValue)', () => {
    expect(encodeValue(false)).toEqual({ booleanValue: false });
    expect(encodeValue(null)).toEqual({ nullValue: null });
    expect(encodeValue(undefined)).toEqual({ nullValue: null });
  });

  it('convierte Date en timestampValue ISO (asi Firestore lo guarda como Timestamp REAL)', () => {
    expect(encodeValue(new Date('2026-08-19T18:11:04.338Z'))).toEqual({
      timestampValue: '2026-08-19T18:11:04.338Z',
    });
  });

  it('anida mapas y arrays', () => {
    expect(encodeValue({ a: 'x', b: [1, true] })).toEqual({
      mapValue: {
        fields: {
          a: { stringValue: 'x' },
          b: { arrayValue: { values: [{ integerValue: '1' }, { booleanValue: true }] } },
        },
      },
    });
  });

  it('ida y vuelta: lo que codifico, el decodificador lo devuelve igual', async () => {
    const { decodeValue } = await import('./firestore-rest');
    for (const v of ['hola', 42, 1.25, true, false, null]) {
      expect(decodeValue(encodeValue(v))).toEqual(v);
    }
  });
});

describe('createDoc', () => {
  it('POSTea a la coleccion con la apiKey y devuelve el id del `name`', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(resOk());
    const r = await createDoc('solicitudes', { nombre: 'Ana' }, { ...OPTS, fetchImpl });
    expect(r).toEqual({ ok: true, id: 'ABC123' });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain('/documents/solicitudes?key=K');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ fields: { nombre: { stringValue: 'Ana' } } });
  });

  it('escapa el nombre de la coleccion (mismo anti-traversal que getDoc)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(resOk());
    await createDoc('../usuarios', {}, { ...OPTS, fetchImpl });
    // Lo importante: el `..` no queda como segmento de ruta navegable.
    expect(fetchImpl.mock.calls[0][0]).not.toContain('/documents/../usuarios');
  });

  it('403 de las Rules => denied (no lanza)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 403 } as Response);
    expect(await createDoc('x', {}, { ...OPTS, fetchImpl })).toEqual({
      ok: false, reason: 'denied', status: 403,
    });
  });

  it('un fallo de red NO propaga la excepcion', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
    expect(await createDoc('x', {}, { ...OPTS, fetchImpl })).toEqual({ ok: false, reason: 'error' });
  });

  it('200 con un `name` raro no rompe: devuelve id vacio en vez de lanzar', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 200, json: async () => ({}) } as unknown as Response);
    expect(await createDoc('x', {}, { ...OPTS, fetchImpl })).toEqual({ ok: true, id: '' });
  });
});
