/*
 * El «Ordenar por» del SERP — el control que llevaba desde el principio sin hacer nada (§264).
 *
 * Se podía elegir «Precio: menor a mayor» y la lista se quedaba exactamente igual. Un control que
 * responde al clic y no cambia nada es peor que no tenerlo: le enseña al visitante que la web está
 * rota, y lo aprende en la página donde estaba comparando propiedades.
 *
 * Las cuatro cadenas que se prueban aquí son las LITERALES del `<option>` de `[operacion].astro`.
 * Si alguien reescribe una, esta prueba falla — que es justo lo que tiene que pasar: el criterio se
 * lee del texto porque el marcado aprobado no lleva `value`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ordenarCatalogo } from './serp-catalogo';

type Item = Parameters<typeof ordenarCatalogo>[0][number];

const item = (id: string, precio: number, pub: string): Item =>
  ({ id, slug: id, titulo: id, operacion: 'venta', tipo: 'apartamento', precio, sector: 'Manga',
     coords: null, thumb: '', pub }) as Item;

/* Deliberadamente desordenada: si la función no hace nada, casi ninguna prueba pasaría por azar. */
const LISTA: Item[] = [
  item('medio', 800_000_000, '2026-03-01'),
  item('caro', 2_100_000_000, '2026-01-15'),
  item('barato', 450_000_000, '2026-08-20'),
];

const ids = (xs: readonly Item[]) => xs.map((x) => x.id);

describe('ordenarCatalogo — las cuatro opciones REALES del select', () => {
  it('«Precio: menor a mayor»', () => {
    expect(ids(ordenarCatalogo(LISTA, 'Precio: menor a mayor'))).toEqual(['barato', 'medio', 'caro']);
  });

  it('«Precio: mayor a menor»', () => {
    expect(ids(ordenarCatalogo(LISTA, 'Precio: mayor a menor'))).toEqual(['caro', 'medio', 'barato']);
  });

  it('«Más recientes» ordena por fecha de publicación, no por precio', () => {
    expect(ids(ordenarCatalogo(LISTA, 'Más recientes'))).toEqual(['barato', 'medio', 'caro']);
  });

  it('«Relevancia» devuelve el orden que entregó el servidor', () => {
    expect(ids(ordenarCatalogo(LISTA, 'Relevancia'))).toEqual(['medio', 'caro', 'barato']);
  });
});

describe('lo que hace que no se rompa en silencio', () => {
  it('NUNCA muta la lista original: si la mutara, «Relevancia» no podría volver', () => {
    const antes = ids(LISTA);
    ordenarCatalogo(LISTA, 'Precio: mayor a menor');
    expect(ids(LISTA)).toEqual(antes);
  });

  it('una opción desconocida no reordena ni revienta: se queda como está', () => {
    expect(ids(ordenarCatalogo(LISTA, 'Ordenar por el color del portón'))).toEqual(ids(LISTA));
  });

  it('no depende de mayúsculas ni de la puntuación exacta', () => {
    expect(ids(ordenarCatalogo(LISTA, 'PRECIO — MENOR A MAYOR'))).toEqual(['barato', 'medio', 'caro']);
  });

  it('un `pub` ausente no tumba el orden por fecha', () => {
    const conHueco = [...LISTA, { ...item('sinFecha', 1, ''), pub: undefined } as unknown as Item];
    expect(() => ordenarCatalogo(conHueco, 'Más recientes')).not.toThrow();
    // Y el que no tiene fecha se va al final, no se cuela arriba.
    expect(ids(ordenarCatalogo(conHueco, 'Más recientes')).at(-1)).toBe('sinFecha');
  });
});

describe('🔗 el texto de las opciones es el CONTRATO, y vive en el .astro', () => {
  /*
   * El criterio se lee del texto porque el marcado aprobado no lleva `value`. Eso significa que
   * renombrar una opcion apaga su orden EN SILENCIO: no falla nada, simplemente deja de ordenar.
   * Esta prueba ata las dos mitades. Si alguien cambia una etiqueta, aqui se entera.
   */
  const astro = readFileSync(join(import.meta.dirname, '..', 'pages', '[operacion].astro'), 'utf8');
  const opciones = [...astro.matchAll(/<option>([^<]+)<\/option>/g)].map((m) => m[1].trim());

  it('las cuatro siguen escritas tal cual', () => {
    expect(opciones).toEqual(['Relevancia', 'Precio: menor a mayor', 'Precio: mayor a menor', 'Más recientes']);
  });

  it('y cada una que NO es «Relevancia» cambia de verdad el orden', () => {
    const base = LISTA.map((x) => x.id);
    for (const o of opciones.filter((x) => x !== 'Relevancia')) {
      expect(ordenarCatalogo(LISTA, o).map((x) => x.id), o).not.toEqual(base);
    }
  });
});
