/*
 * PRECIO ⇒ RNT AL LADO — la StayCard no sale sin su número (Ley 300/1996).
 *
 * `datosStayCard` decide, sin DOM, qué pinta la tarjeta de alojamiento de la portada y de /estancias.
 * Lo que se fija aquí es la mitad que importa: si hay precio por noche, hay «RNT <número>» en el mismo
 * anuncio; y si no hay número exhibible, no hay tarjeta. La otra mitad —que el pintor DOM respete
 * esto y no pinte sin el hueco `[data-rnt]`— es una línea de `pintarStay`.
 */
import { describe, expect, it } from 'vitest';
import { datosStayCard, masRecientePrimero, type CatalogoItem } from './catalogo-card';
import { juzgarEstadias, muestraRnt } from '../../scripts/lib/senales-estadia.mjs';

const alojamiento = (over: Partial<CatalogoItem> = {}): CatalogoItem => ({
  id: 'tb1',
  slug: 'tb1',
  titulo: 'Cabaña frente al mar',
  operacion: 'alojamiento',
  tipo: 'cabana',
  precio: 680_000,
  sector: 'Tierrabomba',
  coords: null,
  thumb: '',
  pub: '2026-08-28',
  rnt: '100001',
  ...over,
});

describe('datosStayCard — con RNT válido', () => {
  it('pinta el precio y, al lado, «RNT 100001»', () => {
    expect(datosStayCard(alojamiento())).toEqual({
      titulo: 'Cabaña frente al mar',
      meta: 'Tierrabomba · Cabaña',
      precio: '$680.000',
      rnt: 'RNT 100001',
    });
  });

  it('exhibe el número normalizado por el dominio, no lo que se tecleó', () => {
    expect(datosStayCard(alojamiento({ rnt: 'RNT No. 12.345' }))?.rnt).toBe('RNT 12345');
  });

  it('lo que exhibe la tarjeta lo reconoce la sonda del build, y cubre su precio', () => {
    const d = datosStayCard(alojamiento());
    expect(d).not.toBeNull();
    if (!d) return;
    expect(muestraRnt(d.rnt)).toBe(true);
    // La tarjeta tal como se LEE: título, zona, precio con su unidad y el RNT debajo.
    const leido = `${d.titulo} ${d.meta} ${d.precio} COP noche ${d.rnt}`;
    const juicio = juzgarEstadias(leido);
    expect(juicio.importes).toBe(1);
    expect(juicio.sinRnt).toEqual([]);
  });
});

describe('datosStayCard — sin número exhibible NO hay tarjeta', () => {
  it.each([
    ['sin rnt', undefined],
    ['vacío', ''],
    ['«pendiente»', 'pendiente'],
    ['«123», menos de 4 cifras', '123'],
    ['la plantilla del panel sin rellenar', 'RNT-000000'],
    ['un año suelto', 'RNT 2026'],
  ])('%s → null', (_caso, rnt) => {
    expect(datosStayCard(alojamiento({ rnt }))).toBeNull();
  });
});

describe('datosStayCard — venta y arriendo no son de esta tarjeta', () => {
  it.each(['venta', 'arriendo'] as const)('%s → null, aunque traiga un rnt', (operacion) => {
    // «COP noche» bajo un precio de venta sería un dato falso con aspecto de anuncio.
    expect(datosStayCard(alojamiento({ operacion }))).toBeNull();
    expect(datosStayCard(alojamiento({ operacion, rnt: undefined }))).toBeNull();
  });

  it('un ítem que ni es un objeto se cae él, no la página', () => {
    expect(datosStayCard(null as unknown as CatalogoItem)).toBeNull();
  });
});

describe('masRecientePrimero — un `pub` raro no tumba el orden', () => {
  it('lo más reciente primero, y lo que no trae fecha de texto al final, sin lanzar', () => {
    const viejo = alojamiento({ id: 'viejo', pub: '2026-08-01' });
    const nuevo = alojamiento({ id: 'nuevo', pub: '2026-09-15' });
    const roto = alojamiento({ id: 'roto', pub: 20260901 as unknown as string });
    const sinFecha = alojamiento({ id: 'sin', pub: undefined });
    const orden = [roto, viejo, sinFecha, nuevo].sort(masRecientePrimero).map((it) => it.id);
    expect(orden.slice(0, 2)).toEqual(['nuevo', 'viejo']);
    expect(orden.slice(2).sort()).toEqual(['roto', 'sin']);
  });
});
