import { describe, expect, it } from 'vitest';
import { migaDe } from './breadcrumbs';

const BASE = 'https://altorrainmobiliaria.co';

describe('migaDe', () => {
  it('sin tramos no hay miga: una ruta de un solo nivel es ruido, no una ruta', () => {
    expect(migaDe(BASE, [])).toBeNull();
  });

  it('el primer elemento es siempre el inicio, apuntando al origen pelado', () => {
    const m = migaDe(BASE, [{ nombre: 'Aliados', ruta: '/aliados' }])!;
    expect(m['@type']).toBe('BreadcrumbList');
    expect(m.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: BASE,
    });
  });

  it('numera desde 1 y en orden, sin huecos', () => {
    const m = migaDe(BASE, [
      { nombre: 'Journal', ruta: '/journal' },
      { nombre: 'La matrícula', ruta: '/journal/matricula-de-arrendador' },
    ])!;
    expect(m.itemListElement.map((x) => x.position)).toEqual([1, 2, 3]);
    expect(m.itemListElement.map((x) => x.name)).toEqual(['Inicio', 'Journal', 'La matrícula']);
  });

  /*
   * El invariante que motivó el módulo: Google DESCARTA en silencio un `item` relativo, así que un
   * schema roto se ve idéntico a uno sano. Se comprueba en todas las variantes de entrada sucias.
   */
  it('TODOS los `item` son absolutos, venga la ruta como venga', () => {
    for (const base of [BASE, `${BASE}/`, `${BASE}///`]) {
      for (const ruta of ['/precios', 'precios']) {
        const m = migaDe(base, [{ nombre: 'Precios', ruta }])!;
        expect(m.itemListElement.every((x) => x.item.startsWith('https://'))).toBe(true);
        expect(m.itemListElement[1].item).toBe(`${BASE}/precios`);
      }
    }
  });

  it('no duplica la barra entre el origen y la ruta', () => {
    const m = migaDe(`${BASE}/`, [{ nombre: 'Aliados', ruta: '/aliados' }])!;
    expect(m.itemListElement[1].item).toBe(`${BASE}/aliados`);
    expect(m.itemListElement[1].item).not.toContain('//aliados');
  });

  it('respeta el texto tal cual: no lo recorta ni lo normaliza', () => {
    const nombre = 'Política de Tratamiento de Datos Personales';
    const m = migaDe(BASE, [{ nombre, ruta: '/legal/politica-tratamiento-datos' }])!;
    expect(m.itemListElement[1].name).toBe(nombre);
  });

  it('no muta los tramos que recibe', () => {
    const tramos = [{ nombre: 'Turismo', ruta: '/turismo' }];
    const copia = structuredClone(tramos);
    migaDe(BASE, tramos);
    expect(tramos).toEqual(copia);
  });

  it('reproduce EXACTAMENTE la forma que ya emitían las páginas escritas a mano', () => {
    // Baseline tomado de `invertir.astro` antes de migrar: si esto cambia, cambia el HTML servido.
    expect(migaDe(BASE, [{ nombre: 'Invertir en Cartagena', ruta: '/invertir' }])).toEqual({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Invertir en Cartagena', item: `${BASE}/invertir` },
      ],
    });
  });
});
