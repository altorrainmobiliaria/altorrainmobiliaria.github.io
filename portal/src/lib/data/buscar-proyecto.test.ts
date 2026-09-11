import { describe, expect, it } from 'vitest';
import { buscarProyecto, ID_PROYECTO_RE } from './buscar-proyecto';
import type { DataClient } from './client';
import type { Proyecto } from '../domain/proyectos';
import type { CatalogoResumen } from '../domain/catalogo';

/*
 * La resolución de `/proyecto/<slug>` (§307). Lo que se protege aquí es lo que NO se ve fallar:
 * un borrador servido entero, un 404 cacheado nacido de un hipo de red, y el sondeo de qué proyectos
 * tenemos sin firmar.
 */

const PRY: Proyecto = {
  _version: 1,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-20T00:00:00Z',
  id: 'PRY-202608-0001',
  slug: 'torre-marea',
  nombre: 'Torre Marea',
  constructora: 'Constructora Caribe S.A.S',
  licenciaConstruccion: 'LC-2026-0345',
  estadoObra: 'preventa',
  descripcion: 'Frente al mar.',
  geo: { ciudad: 'Cartagena', barrio: 'Bocagrande' },
  tipologias: [{ nombre: 'Tipo A', tipo: 'apartamento', areaM2: 68, habitaciones: 2, banos: 2, desde: 450_000_000 }],
  imagenes: ['pry/marea/1.webp'],
  estado: 'disponible',
} as Proyecto;

const resumen = (over: Partial<CatalogoResumen> = {}): CatalogoResumen =>
  ({ id: 'PRY-202608-0001', slug: 'torre-marea', clase: 'proyecto', titulo: 'Torre Marea', operacion: 'venta',
     tipo: 'apartamento', precio: 450_000_000, sector: 'Bocagrande', coords: null, thumb: 'x', pub: '2026-08-20', ...over }) as CatalogoResumen;

/** Cliente de mentira: solo las dos puertas que esta función usa. */
function cliente(opts: {
  items?: CatalogoResumen[];
  indiceFalla?: boolean;
  doc?: Proyecto | null;
  docFalla?: boolean;
}): DataClient {
  return {
    catalogo: {
      get: async () =>
        opts.indiceFalla
          ? { ok: false as const, reason: 'error' as const }
          : { ok: true as const, data: { _version: 1, items: opts.items ?? [] } },
    },
    proyectos: {
      get: async () =>
        opts.docFalla
          ? { ok: false as const, reason: 'error' as const }
          : opts.doc
            ? { ok: true as const, data: opts.doc }
            : { ok: false as const, reason: 'unavailable' as const },
    },
  } as unknown as DataClient;
}

describe('buscarProyecto — resuelve por el índice, nunca por query (§307)', () => {
  it('encuentra por SLUG a través del shard de venta', async () => {
    const r = await buscarProyecto(cliente({ items: [resumen()], doc: PRY }), 'torre-marea');
    expect(r.estado).toBe('ok');
    expect(r.estado === 'ok' && r.p.nombre).toBe('Torre Marea');
  });

  it('encuentra por ID canónico sin tocar el índice, y acepta minúsculas', async () => {
    const r = await buscarProyecto(cliente({ indiceFalla: true, doc: PRY }), 'pry-202608-0001');
    expect(r.estado).toBe('ok'); // si hubiera consultado el índice, habría dado 'error'
  });

  it('🎯 un INMUEBLE con ese mismo slug NO se cuela por la ruta de proyectos', async () => {
    // El shard de venta mezcla las dos entidades desde §301: sin mirar `clase`, `/proyecto/<slug-de-
    // un-apartamento>` resolvería a un `INM-…` y pediría ese id a la colección equivocada.
    const r = await buscarProyecto(cliente({ items: [resumen({ id: 'INM-202607-0001', clase: undefined })] }), 'torre-marea');
    expect(r.estado).toBe('no-encontrada');
  });

  it('🔴 un proyecto SIN LICENCIA es «no encontrada», no una ficha con renders', async () => {
    const sinLicencia = { ...PRY, licenciaConstruccion: undefined } as Proyecto;
    const r = await buscarProyecto(cliente({ items: [resumen()], doc: sinLicencia }), 'torre-marea');
    expect(r.estado).toBe('no-encontrada');
  });

  it('🔴 un BORRADOR se ve igual que algo que no existe (anti-enumeración)', async () => {
    const borrador = { ...PRY, estado: 'borrador' } as Proyecto;
    const r = await buscarProyecto(cliente({ items: [resumen()], doc: borrador }), 'torre-marea');
    expect(r.estado).toBe('no-encontrada');
  });

  it('🔴 un fallo de red es ERROR, no un 404 — un 404 se cachea y esconde el proyecto', async () => {
    expect((await buscarProyecto(cliente({ indiceFalla: true }), 'torre-marea')).estado).toBe('error');
    expect((await buscarProyecto(cliente({ items: [resumen()], docFalla: true }), 'torre-marea')).estado).toBe('error');
  });

  it('un slug que no está en el índice es «no encontrada», sin pedir documento', async () => {
    expect((await buscarProyecto(cliente({ items: [] }), 'no-existe')).estado).toBe('no-encontrada');
  });

  it('el parámetro vacío no gasta ni una lectura', async () => {
    expect((await buscarProyecto(cliente({ indiceFalla: true }), '   ')).estado).toBe('no-encontrada');
  });

  it('el id canónico es `PRY-`, no `INM-`', () => {
    expect(ID_PROYECTO_RE.test('PRY-202608-0001')).toBe(true);
    expect(ID_PROYECTO_RE.test('INM-202608-0001')).toBe(false);
  });
});
