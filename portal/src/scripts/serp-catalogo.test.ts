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
import { busquedaDeUrl, coincideBusqueda, filtrarCatalogo, hayCriterio, ordenarCatalogo } from './serp-catalogo';
import type { Busqueda } from './serp-catalogo';

type Item = Parameters<typeof ordenarCatalogo>[0][number];

// Fabrica de `Busqueda`: los criterios numericos de §273 nacen vacios salvo que la prueba diga otra cosa.
const busq = (over: Partial<Busqueda> = {}): Busqueda =>
  ({ zona: '', tipo: '', precioMin: null, precioMax: null, habMin: null, banMin: null, areaMin: null, ...over });

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
    expect(busquedaDeUrl('?zona=%20Bocagrande%20&tipo=casa')).toEqual(busq({ zona: 'Bocagrande', tipo: 'casa' }));
  });

  it('sin parámetros no inventa criterio (y entonces no se filtra nada)', () => {
    expect(busquedaDeUrl('')).toEqual(busq({ zona: '', tipo: '' }));
    expect(filtrarCatalogo(CIUDAD, busquedaDeUrl(''))).toHaveLength(3);
  });
});

describe('coincideBusqueda — las dos trampas del cero silencioso', () => {
  it('🔴 TRAMPA 1 · el tipo llega como lo manda el formulario, no como lo guarda el catálogo', () => {
    // El <select> mandaba «Casa» con mayúscula. Comparar crudo daría CERO y parecería «no hay casas».
    expect(coincideBusqueda({ sector: 'Manga', tipo: 'casa' }, busq({ zona: '', tipo: 'Casa' }))).toBe(true);
    expect(coincideBusqueda({ sector: 'Manga', tipo: 'casa' }, busq({ zona: '', tipo: 'Penthouse' }))).toBe(false);
  });

  it('🔴 TRAMPA 2 · «Penthouse» no existe en el dominio: se ensancha a apartamento', () => {
    expect(coincideBusqueda({ sector: 'Bocagrande', tipo: 'apartamento' }, busq({ zona: '', tipo: 'Penthouse' }))).toBe(true);
  });

  it('la zona es texto libre: casa en las dos direcciones', () => {
    const it = { sector: 'Bocagrande', tipo: 'apartamento' };
    expect(coincideBusqueda(it, busq({ zona: 'bocagrande', tipo: '' }))).toBe(true);   // exacto, sin mayúsculas
    expect(coincideBusqueda(it, busq({ zona: 'boca', tipo: '' }))).toBe(true);          // el sector CONTIENE
    expect(coincideBusqueda(it, busq({ zona: 'casa en Bocagrande', tipo: '' }))).toBe(true); // la frase CONTIENE
    expect(coincideBusqueda(it, busq({ zona: 'Manga', tipo: '' }))).toBe(false);
  });

  it('las tildes no deciden: «Centro Historico» encuentra «Centro Histórico»', () => {
    expect(coincideBusqueda({ sector: 'Centro Histórico', tipo: 'local' }, busq({ zona: 'centro historico', tipo: '' }))).toBe(true);
  });

  it('una letra suelta no empareja con todo (el lado corto exige 3 caracteres)', () => {
    expect(coincideBusqueda({ sector: 'Manga', tipo: 'casa' }, busq({ zona: 'a', tipo: '' }))).toBe(false);
  });

  it('los dos criterios se exigen A LA VEZ, no uno u otro', () => {
    expect(filtrarCatalogo(CIUDAD, busq({ zona: 'Manga', tipo: 'casa' })).map((x) => x.id)).toEqual(['casona']);
    expect(filtrarCatalogo(CIUDAD, busq({ zona: 'Manga', tipo: 'local' }))).toEqual([]);
  });
});

describe('filtros numéricos del SERP (§273) — rangos, mínimos, y el dato que NO está', () => {
  const casa = { sector: 'Manga', tipo: 'casa', precio: 450_000_000, hab: 3, ban: 2, area: 120 };
  const sinDatos = { sector: 'Manga', tipo: 'casa', precio: 450_000_000 };

  it('el precio es un RANGO y se exige por los dos lados', () => {
    expect(coincideBusqueda(casa, busq({ precioMax: 500_000_000 }))).toBe(true);
    expect(coincideBusqueda(casa, busq({ precioMax: 400_000_000 }))).toBe(false);
    expect(coincideBusqueda(casa, busq({ precioMin: 400_000_000 }))).toBe(true);
    expect(coincideBusqueda(casa, busq({ precioMin: 500_000_000 }))).toBe(false);
    expect(coincideBusqueda(casa, busq({ precioMin: 400_000_000, precioMax: 500_000_000 }))).toBe(true);
  });

  it('«3 habitaciones» significa 3 O MÁS, que es lo que se pide al buscar casa', () => {
    expect(coincideBusqueda(casa, busq({ habMin: 3 }))).toBe(true);
    expect(coincideBusqueda(casa, busq({ habMin: 2 }))).toBe(true);
    expect(coincideBusqueda(casa, busq({ habMin: 4 }))).toBe(false);
  });

  it('🔴 una ficha SIN el dato no pasa el filtro — un dato que no está no es un sí', () => {
    // La decisión documentada en `alMenos`: dejar pasar lo desconocido le enseñaría, a quien pide
    // 3 habitaciones, inmuebles de los que no sabemos cuántas tienen. El portal vende «Verificado».
    expect(coincideBusqueda(sinDatos, busq({ habMin: 1 }))).toBe(false);
    expect(coincideBusqueda(sinDatos, busq({ banMin: 1 }))).toBe(false);
    expect(coincideBusqueda(sinDatos, busq({ areaMin: 1 }))).toBe(false);
    // …y sin filtro numérico sigue apareciendo: la exclusión es del filtro, no de la ficha.
    expect(coincideBusqueda(sinDatos, busq({ tipo: 'casa' }))).toBe(true);
  });

  it('🔴 una URL con basura NO se convierte en un filtro imposible', () => {
    // `Number('abc')` es NaN y toda comparación con NaN es falsa: el visitante habría visto CERO
    // resultados por una URL mal copiada, y cero no se distingue de «no hay nada en esa zona».
    const b = busquedaDeUrl('?precioMax=abc&hab=-2&area=');
    expect([b.precioMax, b.habMin, b.areaMin]).toEqual([null, null, null]);
    expect(hayCriterio(b)).toBe(false);
  });

it('🔴 la CIUDAD no es un sector: escribirla no deja cero resultados', () => {
    // Cazado en el navegador: la caja traía «Cartagena de Indias» escrita en el HTML, así que todo
    // envío mandaba esa zona — y ningún sector se llama así. Se elegía «4+ hab», la URL llevaba
    // `hab=4` bien, el chip se encendía, y salían CERO. El filtro funcionaba; sobraba la zona.
    expect(busquedaDeUrl('?zona=Cartagena+de+Indias').zona).toBe('');
    expect(busquedaDeUrl('?zona=cartagena').zona).toBe('');
    expect(hayCriterio(busquedaDeUrl('?zona=Cartagena+de+Indias'))).toBe(false);
    // …y un sector de verdad sigue filtrando.
    expect(busquedaDeUrl('?zona=Bocagrande').zona).toBe('Bocagrande');
  });

  it('los separadores de miles de un pegado no rompen el número', () => {
    expect(busquedaDeUrl('?precioMax=500.000.000').precioMax).toBe(500_000_000);
  });

  it('hayCriterio ve TODOS los criterios — y esta prueba caza al que añada uno y olvide la lista', () => {
    const muestras = [
      busq({ zona: 'Manga' }), busq({ tipo: 'casa' }), busq({ precioMin: 1 }), busq({ precioMax: 1 }),
      busq({ habMin: 1 }), busq({ banMin: 1 }), busq({ areaMin: 1 }),
    ];
    expect(muestras.every(hayCriterio)).toBe(true);
    expect(hayCriterio(busq())).toBe(false);
    // 🎯 El guardián de verdad: si `Busqueda` gana un campo y nadie lo añade aquí, esta cuenta deja
    // de cuadrar. Sin esto, el campo nuevo se quedaría fuera de `hayCriterio` y el mensaje de cero
    // resultados diría «no hay inventario» a quien SÍ había filtrado (el gemelo de §271).
    expect(Object.keys(busq())).toHaveLength(muestras.length);
  });
});

describe('filtrarCatalogo — no muta, porque «Relevancia» tiene que poder volver', () => {
  it('devuelve una lista nueva y deja la original intacta', () => {
    const copia = [...CIUDAD];
    const r = filtrarCatalogo(CIUDAD, busq({ zona: 'Manga', tipo: '' }));
    expect(r).not.toBe(CIUDAD);
    expect(CIUDAD).toEqual(copia);
  });
});
