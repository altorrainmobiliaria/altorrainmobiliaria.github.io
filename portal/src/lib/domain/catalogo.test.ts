import { describe, it, expect } from 'vitest';
import { construirIndices, propiedadAResumen, precioDisplay, esPublicada } from './catalogo';
import type { Propiedad } from './propiedades';

// Construcción del índice de catálogo (camino de ESCRITURA, §54.4). Lógica PURA → sin emulador.
// Cubre: filtro de publicadas (anti-oráculo) · sharding · precio por operación · coords nullable ·
// omisiones REPORTADAS (no silenciosas) · DETERMINISMO (idempotencia del rebuild total, cond.1).

function prop(over: Partial<Propiedad> = {}): Propiedad {
  return {
    _version: 1,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-10T00:00:00Z',
    id: 'INM-202607-0001',
    operacion: 'venta',
    vertical: 'vivienda',
    tipo: 'apartamento',
    estado: 'disponible',
    titulo: 'Apto en Bocagrande',
    descripcion: 'desc',
    geo: { ciudad: 'Cartagena', barrio: 'Bocagrande', lat: 10.399, lng: -75.554 },
    specs: { habitaciones: 3, banos: 2, areaConstruidaM2: 120 },
    amenidades: {},
    precio: { moneda: 'COP', valorVenta: 450_000_000 },
    imagenes: ['props/a/thumb.webp'],
    ...over,
  } as Propiedad;
}

describe('esPublicada / precioDisplay', () => {
  it('solo disponible/reservado/cerrado son públicas (espeja las Rules)', () => {
    expect(['disponible', 'reservado', 'cerrado'].every((e) => esPublicada({ estado: e as never }))).toBe(true);
    expect(['borrador', 'en_verificacion', 'inactivo'].some((e) => esPublicada({ estado: e as never }))).toBe(false);
  });

  it('precio de display según operación (arriendo = canon, no administración)', () => {
    expect(precioDisplay({ operacion: 'venta', precio: { moneda: 'COP', valorVenta: 100 } })).toBe(100);
    expect(precioDisplay({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 20, administracion: 5 } })).toBe(20);
    expect(precioDisplay({ operacion: 'alojamiento', precio: { moneda: 'COP', precioNoche: 7 } })).toBe(7);
    expect(precioDisplay({ operacion: 'venta', precio: { moneda: 'COP' } })).toBeNull();
  });
});

describe('propiedadAResumen — card honesta o se OMITE con motivo (nunca inventar, L-29)', () => {
  it('mapea los campos del contrato (titulo/slug obligatorios, coords, thumb, badges reales)', () => {
    const r = propiedadAResumen(prop({ slug: 'apto-bocagrande', verificadoAltorra: true, featured: true }));
    expect('resumen' in r).toBe(true);
    if (!('resumen' in r)) return;
    expect(r.resumen).toMatchObject({
      id: 'INM-202607-0001',
      slug: 'apto-bocagrande',
      titulo: 'Apto en Bocagrande',
      operacion: 'venta',
      precio: 450_000_000,
      sector: 'Bocagrande',
      coords: { lat: 10.399, lng: -75.554 },
      hab: 3,
      ban: 2,
      area: 120,
      thumb: 'props/a/thumb.webp',
      badges: ['verificado', 'destacado'],
      pub: '2026-07-10T00:00:00Z',
    });
  });

  it('sin slug → usa el id; sin coords → null (card SÍ, pin NO)', () => {
    const r = propiedadAResumen(prop({ geo: { ciudad: 'Cartagena', barrio: 'Manga' } }));
    if (!('resumen' in r)) throw new Error('debía mapear');
    expect(r.resumen.slug).toBe('INM-202607-0001');
    expect(r.resumen.coords).toBeNull();
  });

  it('omite CON MOTIVO si no puede pintar card (sin precio / sin imagen / sin título)', () => {
    expect(propiedadAResumen(prop({ precio: { moneda: 'COP' } }))).toEqual({ omitida: { id: 'INM-202607-0001', motivo: 'sin-precio' } });
    expect(propiedadAResumen(prop({ imagenes: [], imagenPortada: undefined }))).toEqual({ omitida: { id: 'INM-202607-0001', motivo: 'sin-imagen' } });
    expect(propiedadAResumen(prop({ titulo: '' }))).toEqual({ omitida: { id: 'INM-202607-0001', motivo: 'sin-titulo' } });
  });
});

describe('construirIndices — rebuild TOTAL idempotente (§54.4 cond.1)', () => {
  it('catálogo VACÍO → los 3 shards existen con items:[] (estado-cero, no borrar)', () => {
    const { indices, omitidas } = construirIndices([], '2026-07-23T00:00:00Z');
    expect(Object.keys(indices).sort()).toEqual(['arriendo', 'dias', 'venta']);
    expect(indices.venta.items).toEqual([]);
    expect(indices.arriendo.items).toEqual([]);
    expect(indices.dias.items).toEqual([]);
    expect(omitidas).toEqual([]);
  });

  it('BORRADOR jamás entra (anti-oráculo) y cada operación va a SU shard', () => {
    const { indices } = construirIndices(
      [
        prop({ id: 'V1', operacion: 'venta' }),
        prop({ id: 'A1', operacion: 'arriendo', precio: { moneda: 'COP', canon: 3_000_000 } }),
        prop({ id: 'D1', operacion: 'alojamiento', precio: { moneda: 'COP', precioNoche: 400_000 } }),
        prop({ id: 'OCULTA', estado: 'borrador' }),
        prop({ id: 'INACTIVA', estado: 'inactivo' }),
      ],
      '2026-07-23T00:00:00Z',
    );
    expect(indices.venta.items.map((i) => i.id)).toEqual(['V1']);
    expect(indices.arriendo.items.map((i) => i.id)).toEqual(['A1']);
    expect(indices.dias.items.map((i) => i.id)).toEqual(['D1']);
    const todos = [...indices.venta.items, ...indices.arriendo.items, ...indices.dias.items].map((i) => i.id);
    expect(todos).not.toContain('OCULTA');
    expect(todos).not.toContain('INACTIVA');
  });

  it('las publicadas que no pintan card se REPORTAN (no desaparecen en silencio)', () => {
    const { indices, omitidas } = construirIndices(
      [prop({ id: 'OK' }), prop({ id: 'NOPRECIO', precio: { moneda: 'COP' } })],
      '2026-07-23T00:00:00Z',
    );
    expect(indices.venta.items.map((i) => i.id)).toEqual(['OK']);
    expect(omitidas).toEqual([{ id: 'NOPRECIO', motivo: 'sin-precio' }]);
  });

  it('DETERMINISTA: el orden de entrada no cambia el resultado (dos rebuilds concurrentes convergen)', () => {
    const a = prop({ id: 'A', updatedAt: '2026-07-01T00:00:00Z' });
    const b = prop({ id: 'B', updatedAt: '2026-07-20T00:00:00Z' });
    const c = prop({ id: 'C', updatedAt: '2026-07-01T00:00:00Z' }); // empata con A → desempata por id
    const r1 = construirIndices([a, b, c], 'T');
    const r2 = construirIndices([c, b, a], 'T'); // MISMO conjunto, otro orden
    expect(r1.indices.venta.items.map((i) => i.id)).toEqual(['B', 'A', 'C']); // pub desc, id asc
    expect(JSON.stringify(r2)).toBe(JSON.stringify(r1)); // byte-idéntico
  });
});
