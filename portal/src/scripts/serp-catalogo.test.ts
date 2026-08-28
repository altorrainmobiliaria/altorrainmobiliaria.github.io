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
import { busquedaDeUrl, coincideBusqueda, filtrarCatalogo, ordenarCatalogo } from './serp-catalogo';

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

/*
 * LA BÚSQUEDA DEL HERO — la intención que se tiraba a la basura (§265).
 *
 * El formulario del hero manda `zona` y `tipo` por GET a `/comprar` desde que la página existe, y
 * no había una sola línea que los leyera. Estas pruebas fijan las DOS trampas que lo harían fallar
 * en silencio, que es la forma peligrosa: un filtro roto no da error, da cero resultados — y cero
 * resultados no se distingue de «no hay nada en esa zona».
 */
const enZona = (id: string, sector: string, tipo: string): Item =>
  ({ ...item(id, 500_000_000, '2026-01-01'), sector, tipo }) as Item;

const CIUDAD: Item[] = [
  enZona('penth', 'Bocagrande', 'apartamento'),
  enZona('casona', 'Manga', 'casa'),
  enZona('local', 'Centro Histórico', 'local'),
];

describe('busquedaDeUrl — lo que el hero manda', () => {
  it('lee zona y tipo, y limpia los espacios que trae una URL', () => {
    expect(busquedaDeUrl('?zona=%20Bocagrande%20&tipo=casa')).toEqual({ zona: 'Bocagrande', tipo: 'casa' });
  });

  it('sin parámetros no inventa criterio (y entonces no se filtra nada)', () => {
    expect(busquedaDeUrl('')).toEqual({ zona: '', tipo: '' });
    expect(filtrarCatalogo(CIUDAD, busquedaDeUrl(''))).toHaveLength(3);
  });
});

describe('coincideBusqueda — las dos trampas del cero silencioso', () => {
  it('🔴 TRAMPA 1 · el tipo llega como lo manda el formulario, no como lo guarda el catálogo', () => {
    // El <select> mandaba «Casa» con mayúscula. Comparar crudo daría CERO y parecería «no hay casas».
    expect(coincideBusqueda({ sector: 'Manga', tipo: 'casa' }, { zona: '', tipo: 'Casa' })).toBe(true);
    expect(coincideBusqueda({ sector: 'Manga', tipo: 'casa' }, { zona: '', tipo: 'Penthouse' })).toBe(false);
  });

  it('🔴 TRAMPA 2 · «Penthouse» no existe en el dominio: se ensancha a apartamento', () => {
    expect(coincideBusqueda({ sector: 'Bocagrande', tipo: 'apartamento' }, { zona: '', tipo: 'Penthouse' })).toBe(true);
  });

  it('la zona es texto libre: casa en las dos direcciones', () => {
    const it = { sector: 'Bocagrande', tipo: 'apartamento' };
    expect(coincideBusqueda(it, { zona: 'bocagrande', tipo: '' })).toBe(true);   // exacto, sin mayúsculas
    expect(coincideBusqueda(it, { zona: 'boca', tipo: '' })).toBe(true);          // el sector CONTIENE
    expect(coincideBusqueda(it, { zona: 'casa en Bocagrande', tipo: '' })).toBe(true); // la frase CONTIENE
    expect(coincideBusqueda(it, { zona: 'Manga', tipo: '' })).toBe(false);
  });

  it('las tildes no deciden: «Centro Historico» encuentra «Centro Histórico»', () => {
    expect(coincideBusqueda({ sector: 'Centro Histórico', tipo: 'local' }, { zona: 'centro historico', tipo: '' })).toBe(true);
  });

  it('una letra suelta no empareja con todo (el lado corto exige 3 caracteres)', () => {
    expect(coincideBusqueda({ sector: 'Manga', tipo: 'casa' }, { zona: 'a', tipo: '' })).toBe(false);
  });

  it('los dos criterios se exigen A LA VEZ, no uno u otro', () => {
    expect(filtrarCatalogo(CIUDAD, { zona: 'Manga', tipo: 'casa' }).map((x) => x.id)).toEqual(['casona']);
    expect(filtrarCatalogo(CIUDAD, { zona: 'Manga', tipo: 'local' })).toEqual([]);
  });
});

describe('filtrarCatalogo — no muta, porque «Relevancia» tiene que poder volver', () => {
  it('devuelve una lista nueva y deja la original intacta', () => {
    const copia = [...CIUDAD];
    const r = filtrarCatalogo(CIUDAD, { zona: 'Manga', tipo: '' });
    expect(r).not.toBe(CIUDAD);
    expect(CIUDAD).toEqual(copia);
  });
});
