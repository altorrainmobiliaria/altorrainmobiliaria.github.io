import { describe, it, expect } from 'vitest';
import {
  clave,
  coincide,
  criteriosAQuery,
  normalizarCriterios,
  operacionARuta,
  resumenCriterios,
  rutaAOperacion,
  seleccionarNovedades,
  TOPE_FACETAS,
  TOPE_ITEMS_POR_CORREO,
} from './alertas';
import type { CriteriosAlerta } from './alertas';
import type { CatalogoResumen } from './catalogo';

// Alertas guardadas (OLA 1 ítem 8). Lógica PURA → sin emulador y sin red.
// Lo que se protege aquí es lo que rompe EN SILENCIO: un criterio que se descarta sin avisar, una
// lista vacía interpretada como «nada», un inmueble sin fecha reenviado cada día, o un «y N más»
// que miente.

function res(over: Partial<CatalogoResumen> = {}): CatalogoResumen {
  return {
    id: 'INM-202608-0001',
    slug: 'apto-bocagrande',
    titulo: 'Apartamento en Bocagrande',
    operacion: 'venta',
    tipo: 'apartamento',
    precio: 450_000_000,
    sector: 'Bocagrande',
    coords: { lat: 10.399, lng: -75.554 },
    hab: 3,
    ban: 2,
    area: 120,
    thumb: 'props/a/thumb.webp',
    pub: '2026-08-20T12:00:00.000Z',
    ...over,
  };
}

const criterios = (over: Partial<CriteriosAlerta> = {}): CriteriosAlerta => ({
  operacion: 'venta',
  tipos: [],
  zonas: [],
  precioMin: null,
  precioMax: null,
  habMin: null,
  ...over,
});

describe('normalizarCriterios', () => {
  it('lee la operación tanto del dominio como de la RUTA pública', () => {
    expect(normalizarCriterios({ operacion: 'arriendo' }).operacion).toBe('arriendo');
    expect(normalizarCriterios({ operacion: 'arrendar' }).operacion).toBe('arriendo');
    expect(normalizarCriterios({ operacion: '/comprar' }).operacion).toBe('venta');
    expect(normalizarCriterios({ operacion: 'estancias' }).operacion).toBe('alojamiento');
  });

  it('cae en venta cuando la operación no se reconoce, en vez de rechazar la alerta', () => {
    expect(normalizarCriterios({}).operacion).toBe('venta');
    expect(normalizarCriterios({ operacion: 'trueque' }).operacion).toBe('venta');
  });

  it('descarta tipos desconocidos sin tumbar los válidos', () => {
    expect(normalizarCriterios({ tipos: 'apartamento,castillo,casa' }).tipos).toEqual(['apartamento', 'casa']);
  });

  it('acepta precios como los escribe la gente (separadores de miles incluidos)', () => {
    const c = normalizarCriterios({ precioMin: '300.000.000', precioMax: '1 450 000 000' });
    expect(c.precioMin).toBe(300_000_000);
    expect(c.precioMax).toBe(1_450_000_000);
  });

  it('endereza un rango invertido en vez de devolver error', () => {
    const c = normalizarCriterios({ precioMin: '500000000', precioMax: '300000000' });
    expect([c.precioMin, c.precioMax]).toEqual([300_000_000, 500_000_000]);
  });

  it('acota las facetas y deduplica zonas', () => {
    const muchas = Array.from({ length: 20 }, (_, i) => `Zona ${i}`).join(',');
    expect(normalizarCriterios({ zonas: muchas }).zonas).toHaveLength(TOPE_FACETAS);
    expect(normalizarCriterios({ zonas: 'Manga,Manga' }).zonas).toEqual(['Manga']);
  });

  it('ignora un habMin sin sentido y topa el máximo', () => {
    expect(normalizarCriterios({ habMin: '0' }).habMin).toBeNull();
    expect(normalizarCriterios({ habMin: 'tres' }).habMin).toBeNull();
    expect(normalizarCriterios({ habMin: '99' }).habMin).toBe(10);
  });

  it('sobrevive a un ida y vuelta por query string', () => {
    const c = normalizarCriterios({
      operacion: 'arriendo',
      tipos: 'casa',
      zonas: 'Manga,Crespo',
      precioMin: '2000000',
      precioMax: '9000000',
      habMin: '2',
    });
    const ida = Object.fromEntries(new URLSearchParams(criteriosAQuery(c)));
    expect(normalizarCriterios(ida)).toEqual(c);
  });
});

describe('coincide', () => {
  it('exige la misma operación', () => {
    expect(coincide(criterios({ operacion: 'arriendo' }), res({ operacion: 'venta' }))).toBe(false);
  });

  it('trata las listas vacías como «todo», no como «nada»', () => {
    expect(coincide(criterios(), res())).toBe(true);
  });

  it('empareja zonas sin importar tildes ni mayúsculas', () => {
    const c = criterios({ zonas: ['centro historico'] });
    expect(coincide(c, res({ sector: 'Centro Histórico' }))).toBe(true);
  });

  it('respeta los topes de precio en los bordes', () => {
    const c = criterios({ precioMin: 400_000_000, precioMax: 450_000_000 });
    expect(coincide(c, res({ precio: 450_000_000 }))).toBe(true);
    expect(coincide(c, res({ precio: 450_000_001 }))).toBe(false);
    expect(coincide(c, res({ precio: 399_999_999 }))).toBe(false);
  });

  it('NO cuela un inmueble sin dato de habitaciones en una alerta que pide un mínimo', () => {
    const c = criterios({ habMin: 3 });
    expect(coincide(c, res({ hab: undefined }))).toBe(false);
    expect(coincide(c, res({ hab: 3 }))).toBe(true);
  });

  it('aguanta un sector vacío sin reventar', () => {
    expect(coincide(criterios({ zonas: ['Manga'] }), res({ sector: '' }))).toBe(false);
    expect(coincide(criterios(), res({ sector: '' }))).toBe(true);
  });
});

describe('seleccionarNovedades', () => {
  const desde = '2026-08-19T00:00:00.000Z';

  it('solo devuelve lo publicado DESPUÉS del corte', () => {
    const items = [
      res({ id: 'nuevo', pub: '2026-08-20T00:00:00.000Z' }),
      res({ id: 'viejo', pub: '2026-08-18T00:00:00.000Z' }),
    ];
    const r = seleccionarNovedades(criterios(), items, desde);
    expect(r.items.map((i) => i.id)).toEqual(['nuevo']);
  });

  it('descarta lo que no tiene fecha utilizable (si no, se reenviaría cada día)', () => {
    const items = [res({ id: 'sinfecha', pub: '' }), res({ id: 'basura', pub: 'ayer' })];
    expect(seleccionarNovedades(criterios(), items, desde).total).toBe(0);
  });

  it('ordena lo más nuevo primero', () => {
    const items = [
      res({ id: 'b', pub: '2026-08-20T00:00:00.000Z' }),
      res({ id: 'a', pub: '2026-08-21T00:00:00.000Z' }),
    ];
    expect(seleccionarNovedades(criterios(), items, desde).items.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('recorta al tope del correo pero el TOTAL sigue siendo cierto', () => {
    const items = Array.from({ length: TOPE_ITEMS_POR_CORREO + 4 }, (_, i) =>
      res({ id: `i${i}`, pub: `2026-08-2${(i % 5) + 0}T00:00:00.000Z` }),
    );
    const r = seleccionarNovedades(criterios(), items, desde);
    expect(r.items).toHaveLength(TOPE_ITEMS_POR_CORREO);
    expect(r.total).toBe(TOPE_ITEMS_POR_CORREO + 4);
  });

  it('con un corte inválido no inventa novedades', () => {
    expect(seleccionarNovedades(criterios(), [res()], 'nunca').total).toBe(0);
  });
});

describe('texto para personas', () => {
  it('resume unos criterios vacíos sin sonar a formulario en blanco', () => {
    expect(resumenCriterios(criterios())).toBe('Inmuebles en venta en Cartagena');
  });

  it('resume unos criterios completos', () => {
    const c = criterios({ tipos: ['casa'], zonas: ['Manga'], precioMin: 300_000_000, precioMax: 900_000_000, habMin: 3 });
    const t = resumenCriterios(c);
    expect(t).toContain('Casas en venta en Manga');
    expect(t).toContain('desde 3 habitaciones');
  });

  it('mantiene ida y vuelta entre ruta y operación', () => {
    for (const ruta of ['/comprar', '/arrendar', '/estancias']) {
      const op = rutaAOperacion(ruta);
      expect(op).not.toBeNull();
      expect(operacionARuta(op!)).toBe(ruta);
    }
  });

  it('clave() deja comparables los nombres que la gente escribe distinto', () => {
    expect(clave('  Centro  HISTÓRICO ')).toBe('centro historico');
  });
});
