import { describe, it, expect } from 'vitest';
import { buscarFicha, resolverSlug, ID_PROPIEDAD_RE } from './buscar-ficha';
import type { DataClient } from './client';
import type { CatalogoResumen } from '../domain/catalogo';
import type { Propiedad } from '../domain/propiedades';

// Resolución de la ficha (ADR §97). Este archivo decide DOS cosas caras: cuántas lecturas de Firestore
// cuesta cada visita, y si un fallo de red se convierte en un 404 — que además se CACHEA, o sea que el
// inmueble desaparece del portal mucho después de que la red se recupere.
// El cliente se inyecta entero: sin red, sin emulador, y contando cada lectura.

function resumen(over: Partial<CatalogoResumen> = {}): CatalogoResumen {
  return {
    id: 'INM-202607-0001',
    slug: 'apto-castillogrande',
    titulo: 'Apartamento',
    operacion: 'venta',
    tipo: 'apartamento',
    precio: 1_000_000_000,
    sector: 'Castillogrande',
    coords: null,
    thumb: 'x.webp',
    pub: '2026-08-01T00:00:00.000Z',
    ...over,
  };
}

function propiedad(over: Partial<Propiedad> = {}): Propiedad {
  return {
    _version: 1,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    id: 'INM-202607-0001',
    operacion: 'venta',
    vertical: 'vivienda',
    tipo: 'apartamento',
    estado: 'disponible',
    titulo: 'Apartamento',
    descripcion: 'd',
    geo: { ciudad: 'Cartagena de Indias', barrio: 'Castillogrande' },
    specs: {},
    amenidades: {},
    precio: { moneda: 'COP', valorVenta: 1_000_000_000 },
    imagenes: [],
    ...over,
  };
}

interface Guion {
  shards?: Partial<Record<'venta' | 'arriendo' | 'dias', CatalogoResumen[] | 'error'>>;
  props?: Record<string, Propiedad | 'error'>;
}

/** Cliente de mentira que además CUENTA las lecturas, que es la mitad de lo que se prueba aquí. */
function clienteFalso(g: Guion) {
  const lecturas: string[] = [];
  const cliente = {
    propiedades: {
      async get(id: string) {
        lecturas.push(`prop:${id}`);
        const v = g.props?.[id];
        if (v === 'error') return { ok: false as const, reason: 'error' as const };
        if (!v) return { ok: false as const, reason: 'unavailable' as const };
        return { ok: true as const, data: v };
      },
    },
    catalogo: {
      async get(shard: 'venta' | 'arriendo' | 'dias') {
        lecturas.push(`shard:${shard}`);
        const v = g.shards?.[shard];
        if (v === 'error') return { ok: false as const, reason: 'unavailable' as const };
        return { ok: true as const, data: { _version: 1, items: v ?? [] } };
      },
    },
  } as unknown as DataClient;
  return { cliente, lecturas };
}

describe('ID_PROPIEDAD_RE', () => {
  it('acepta el id canónico en cualquier caja y rechaza lo demás', () => {
    expect(ID_PROPIEDAD_RE.test('INM-202607-0001')).toBe(true);
    expect(ID_PROPIEDAD_RE.test('inm-202607-0001')).toBe(true);
    expect(ID_PROPIEDAD_RE.test('apto-castillogrande')).toBe(false);
    expect(ID_PROPIEDAD_RE.test('INM-2026-0001')).toBe(false);
  });
});

describe('resolverSlug — coste y honestidad', () => {
  it('para en el PRIMER shard que acierta: una propiedad en venta cuesta UNA lectura', async () => {
    const { cliente, lecturas } = clienteFalso({ shards: { venta: [resumen()] } });
    const r = await resolverSlug(cliente, 'apto-castillogrande');
    expect(r).toEqual({ estado: 'ok', id: 'INM-202607-0001', shard: 'venta' });
    expect(lecturas).toEqual(['shard:venta']);
  });

  it('si está en el último shard, recorre los tres (y no más)', async () => {
    const { cliente, lecturas } = clienteFalso({ shards: { dias: [resumen({ operacion: 'alojamiento' })] } });
    const r = await resolverSlug(cliente, 'apto-castillogrande');
    expect(r.estado).toBe('ok');
    expect(lecturas).toEqual(['shard:venta', 'shard:arriendo', 'shard:dias']);
  });

  it('un slug que no está en ningún shard es «no encontrada», no un error', async () => {
    const { cliente } = clienteFalso({ shards: { venta: [resumen()] } });
    expect(await resolverSlug(cliente, 'no-existe')).toEqual({ estado: 'no-encontrada' });
  });

  it('🔴 si un shard FALLA y no hubo acierto, es ERROR — jamás «no encontrada»', async () => {
    // Este es el test que importa: con lista vacía por fallo, la ficha daría 404 y ese 404 se cachea.
    const { cliente } = clienteFalso({ shards: { venta: 'error', arriendo: [], dias: [] } });
    expect(await resolverSlug(cliente, 'apto-castillogrande')).toEqual({ estado: 'error' });
  });

  it('un shard que falla NO impide encontrarla en otro', async () => {
    const { cliente } = clienteFalso({ shards: { venta: 'error', arriendo: [resumen({ operacion: 'arriendo' })] } });
    expect((await resolverSlug(cliente, 'apto-castillogrande')).estado).toBe('ok');
  });

  it('un slug vacío no gasta ni una lectura', async () => {
    const { cliente, lecturas } = clienteFalso({});
    expect(await resolverSlug(cliente, '   ')).toEqual({ estado: 'no-encontrada' });
    expect(lecturas).toEqual([]);
  });
});

describe('buscarFicha', () => {
  it('con id canónico va DIRECTO al documento, sin tocar los índices para resolver', async () => {
    const { cliente, lecturas } = clienteFalso({
      props: { 'INM-202607-0001': propiedad() },
      shards: { venta: [resumen()] },
    });
    const r = await buscarFicha(cliente, 'INM-202607-0001');
    expect(r.estado).toBe('ok');
    // 2 lecturas: el documento y el shard de sus similares. Ni una más.
    expect(lecturas).toEqual(['prop:INM-202607-0001', 'shard:venta']);
  });

  it('normaliza la caja del id (Firestore SÍ distingue mayúsculas)', async () => {
    const { cliente, lecturas } = clienteFalso({ props: { 'INM-202607-0001': propiedad() } });
    expect((await buscarFicha(cliente, 'inm-202607-0001')).estado).toBe('ok');
    expect(lecturas[0]).toBe('prop:INM-202607-0001');
  });

  it('por slug: resuelve y luego lee el documento', async () => {
    const { cliente, lecturas } = clienteFalso({
      shards: { venta: [resumen()] },
      props: { 'INM-202607-0001': propiedad() },
    });
    expect((await buscarFicha(cliente, 'apto-castillogrande')).estado).toBe('ok');
    expect(lecturas).toEqual(['shard:venta', 'prop:INM-202607-0001', 'shard:venta']);
  });

  it('un documento que no existe (o no está publicado) es «no encontrada»', async () => {
    const { cliente } = clienteFalso({ props: {} });
    expect(await buscarFicha(cliente, 'INM-202607-0001')).toEqual({ estado: 'no-encontrada' });
  });

  it('🔴 un fallo de red al leer el documento NO se disfraza de 404', async () => {
    const { cliente } = clienteFalso({ props: { 'INM-202607-0001': 'error' } });
    expect(await buscarFicha(cliente, 'INM-202607-0001')).toEqual({ estado: 'error' });
  });

  it('si falla el shard de SIMILARES, la ficha se publica igual (sin similares)', async () => {
    const { cliente } = clienteFalso({
      props: { 'INM-202607-0001': propiedad() },
      shards: { venta: 'error' },
    });
    const r = await buscarFicha(cliente, 'INM-202607-0001');
    expect(r.estado).toBe('ok');
    if (r.estado === 'ok') expect(r.similares).toEqual([]);
  });

  it('un parámetro vacío no gasta lecturas', async () => {
    const { cliente, lecturas } = clienteFalso({});
    expect(await buscarFicha(cliente, '')).toEqual({ estado: 'no-encontrada' });
    expect(lecturas).toEqual([]);
  });
});
