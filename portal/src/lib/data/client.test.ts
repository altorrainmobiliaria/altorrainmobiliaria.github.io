import { describe, it, expect, vi } from 'vitest';
import { getDataClient } from './client';

const okRes = (body: unknown): Response => ({ status: 200, json: async () => body } as unknown as Response);
const statusRes = (status: number): Response => ({ status, json: async () => ({}) } as unknown as Response);
const docBody = (path: string, fields: Record<string, unknown> = {}) => ({
  name: `projects/proj/databases/(default)/documents/${path}`,
  fields,
});

describe('client — guardas de seguridad (rechazan SIN ir a la red)', () => {
  it('propiedades.get con id inválido (traversal) → unavailable, sin fetch', async () => {
    const fetchImpl = vi.fn();
    const db = getDataClient(undefined, { fetchImpl });
    for (const bad of ['../config/gestion', 'a/b', '..', 'a.b', '', 'x'.repeat(300)]) {
      expect(await db.propiedades.get(bad)).toEqual({ ok: false, reason: 'unavailable' });
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('config.get de docs sensibles (gestion/counters) → unavailable, sin fetch (espeja la RULE)', async () => {
    const fetchImpl = vi.fn();
    const db = getDataClient(undefined, { fetchImpl });
    expect(await db.config.get('gestion')).toEqual({ ok: false, reason: 'unavailable' });
    expect(await db.config.get('counters')).toEqual({ ok: false, reason: 'unavailable' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('disponibilidad.get con fecha malformada → unavailable, sin fetch', async () => {
    const fetchImpl = vi.fn();
    const db = getDataClient(undefined, { fetchImpl });
    expect(await db.disponibilidad.get('INM-202607-0001', '11-07-2026')).toEqual({ ok: false, reason: 'unavailable' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('client — construcción de path y colapso de resultado', () => {
  it('config.getGeneral pega a config/general y tipa el doc', async () => {
    const fetchImpl = vi.fn(async (_input: URL | RequestInfo, _init?: RequestInit) =>
      okRes(docBody('config/general', { razonSocial: { stringValue: 'ALTORRA COMPANY S.A.S.' } })),
    );
    const db = getDataClient(undefined, { fetchImpl });
    const r = await db.config.getGeneral();
    expect(r).toEqual({ ok: true, data: { id: 'general', razonSocial: 'ALTORRA COMPANY S.A.S.' } });
    expect(String(fetchImpl.mock.calls[0][0])).toContain('/documents/config/general');
  });

  it('disponibilidad compone docId {propiedadId}_{fecha} top-level', async () => {
    const fetchImpl = vi.fn(async (_input: URL | RequestInfo, _init?: RequestInit) =>
      okRes(docBody('disponibilidad/INM-202607-0001_2026-07-15', { estado: { stringValue: 'libre' } })),
    );
    const db = getDataClient(undefined, { fetchImpl });
    const r = await db.disponibilidad.get('INM-202607-0001', '2026-07-15');
    expect(r.ok).toBe(true);
    expect(String(fetchImpl.mock.calls[0][0])).toContain('/documents/disponibilidad/INM-202607-0001_2026-07-15');
  });

  it('override por env (wrangler [vars]) manda sobre el default (hook forward SA-JWT)', async () => {
    const fetchImpl = vi.fn(async (_input: URL | RequestInfo, _init?: RequestInit) =>
      okRes(docBody('propiedades/INM-202607-0001')),
    );
    const db = getDataClient({ PUBLIC_FIREBASE_PROJECT_ID: 'otro-proj', PUBLIC_FIREBASE_API_KEY: 'K2' }, { fetchImpl });
    await db.propiedades.get('INM-202607-0001');
    const url = String(fetchImpl.mock.calls[0][0]);
    expect(url).toContain('/projects/otro-proj/');
    expect(url).toContain('key=K2');
  });

  it('denied(403) y not-found(404) COLAPSAN a unavailable (no filtran existencia)', async () => {
    const db403 = getDataClient(undefined, { fetchImpl: vi.fn(async () => statusRes(403)) });
    const db404 = getDataClient(undefined, { fetchImpl: vi.fn(async () => statusRes(404)) });
    expect(await db403.propiedades.get('INM-202607-0001')).toEqual({ ok: false, reason: 'unavailable' });
    expect(await db404.propiedades.get('INM-202607-0001')).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('error(500) se propaga como error (transitorio, no unavailable)', async () => {
    const db = getDataClient(undefined, { fetchImpl: vi.fn(async () => statusRes(500)) });
    expect(await db.propiedades.get('INM-202607-0001')).toEqual({ ok: false, reason: 'error' });
  });
});

describe('client — memo POR-REQUEST', () => {
  it('dos lecturas del mismo doc en la misma instancia = 1 fetch; instancia nueva = fetch de nuevo', async () => {
    const fetchImpl = vi.fn(async () => okRes(docBody('propiedades/INM-202607-0001', { titulo: { stringValue: 'T' } })));
    const db = getDataClient(undefined, { fetchImpl });
    await db.propiedades.get('INM-202607-0001');
    await db.propiedades.get('INM-202607-0001');
    expect(fetchImpl).toHaveBeenCalledTimes(1); // memo dedupe

    await db.propiedades.get('INM-202607-0002'); // otro id → nueva lectura
    expect(fetchImpl).toHaveBeenCalledTimes(2);

    const db2 = getDataClient(undefined, { fetchImpl }); // nueva instancia (nuevo request) → no comparte memo
    await db2.propiedades.get('INM-202607-0001');
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
});
