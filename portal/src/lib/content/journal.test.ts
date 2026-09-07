import { describe, expect, it } from 'vitest';
import {
  conteoPorCategoria,
  destacadoYResto,
  ETIQUETA,
  fechaISO,
  fechaLarga,
  minutosDeLectura,
  palabras,
  porFecha,
  relacionados,
  tiempoDeLectura,
  type Categoria,
  CATEGORIAS,
} from './journal';

const art = (id: string, fecha: string, categoria: Categoria, destacado = false) => ({
  id,
  data: { fecha: new Date(fecha), destacado, categoria },
});

describe('palabras', () => {
  it('cuenta prosa normal', () => {
    expect(palabras('El arriendo de vivienda urbana en Colombia')).toBe(7);
  });

  it('no cuenta la sintaxis de los títulos', () => {
    expect(palabras('## Quién está obligado')).toBe(3);
  });

  it('cuenta el texto visible del enlace, no la URL', () => {
    // Si contara la URL, un enlace largo valdría por media docena de palabras.
    expect(palabras('Ver la [Ley 820](https://www.funcionpublica.gov.co/eva/norma.php?i=8738)')).toBe(4);
  });

  it('no cuenta las imágenes: no se leen', () => {
    expect(palabras('![Fachada de un edificio en Bocagrande](/assets/estate-golden.webp) Texto')).toBe(1);
  });

  it('ignora los bloques de código enteros', () => {
    expect(palabras('Antes\n```\nesto no se lee en voz alta\n```\ndespués')).toBe(2);
  });

  it('no cuenta guiones ni barras sueltas como palabras', () => {
    expect(palabras('uno - dos | tres')).toBe(3);
  });

  it('el vacío son cero palabras', () => {
    expect(palabras('   \n\n  ')).toBe(0);
  });
});

describe('minutosDeLectura', () => {
  it('200 palabras es un minuto', () => {
    expect(minutosDeLectura(Array(200).fill('palabra').join(' '))).toBe(1);
  });

  it('redondea hacia arriba: sobrar molesta menos que faltar', () => {
    expect(minutosDeLectura(Array(201).fill('palabra').join(' '))).toBe(2);
  });

  it('nunca promete cero minutos', () => {
    expect(minutosDeLectura('')).toBe(1);
    expect(minutosDeLectura('Hola')).toBe(1);
  });

  it('1200 palabras son seis minutos', () => {
    expect(minutosDeLectura(Array(1200).fill('palabra').join(' '))).toBe(6);
  });

  it('la frase completa se arma sola', () => {
    expect(tiempoDeLectura(Array(600).fill('palabra').join(' '))).toBe('3 min de lectura');
  });
});

describe('fechas', () => {
  it('escribe la fecha larga en español', () => {
    expect(fechaLarga(new Date('2026-08-25T00:00:00Z'))).toBe('25 de agosto de 2026');
  });

  it('el 1 de enero no se rompe', () => {
    expect(fechaLarga(new Date('2027-01-01T00:00:00Z'))).toBe('1 de enero de 2027');
  });

  it('usa UTC: el mismo build da la misma fecha en cualquier máquina', () => {
    // 23:30 en Bogotá (UTC-5) del día 25 es el 26 en UTC. Se elige UTC y se dice.
    expect(fechaLarga(new Date('2026-08-26T04:30:00Z'))).toBe('26 de agosto de 2026');
  });

  it('la ISO es la del atributo datetime', () => {
    expect(fechaISO(new Date('2026-08-25T00:00:00Z'))).toBe('2026-08-25');
  });
});

describe('porFecha', () => {
  it('ordena del más reciente al más viejo', () => {
    const orden = porFecha([
      art('viejo', '2026-01-01', 'mercado'),
      art('nuevo', '2026-08-25', 'mercado'),
      art('medio', '2026-05-10', 'mercado'),
    ]);
    expect(orden.map((a) => a.id)).toEqual(['nuevo', 'medio', 'viejo']);
  });

  it('no muta el arreglo que recibe', () => {
    const original = [art('a', '2026-01-01', 'mercado'), art('b', '2026-08-25', 'mercado')];
    porFecha(original);
    expect(original.map((a) => a.id)).toEqual(['a', 'b']);
  });

  it('en el mismo día gana el destacado', () => {
    const orden = porFecha([
      art('normal', '2026-08-25', 'mercado'),
      art('destacado', '2026-08-25', 'mercado', true),
    ]);
    expect(orden[0].id).toBe('destacado');
  });
});

describe('destacadoYResto', () => {
  it('respeta el marcado a mano aunque no sea el más reciente', () => {
    const { destacado, resto } = destacadoYResto([
      art('reciente', '2026-08-25', 'mercado'),
      art('elegido', '2026-02-01', 'mercado', true),
    ]);
    expect(destacado?.id).toBe('elegido');
    expect(resto.map((a) => a.id)).toEqual(['reciente']);
  });

  it('sin nadie marcado, manda el más reciente', () => {
    const { destacado, resto } = destacadoYResto([
      art('viejo', '2026-01-01', 'mercado'),
      art('nuevo', '2026-08-25', 'mercado'),
    ]);
    expect(destacado?.id).toBe('nuevo');
    expect(resto.map((a) => a.id)).toEqual(['viejo']);
  });

  it('el destacado NO se repite en el resto', () => {
    const { destacado, resto } = destacadoYResto([
      art('a', '2026-08-25', 'mercado', true),
      art('b', '2026-08-24', 'mercado'),
    ]);
    expect(resto.some((r) => r.id === destacado?.id)).toBe(false);
  });

  it('sin artículos no hay portada, y no se cae', () => {
    expect(destacadoYResto([])).toEqual({ destacado: null, resto: [] });
  });

  it('con uno solo, ese es la portada y el resto queda vacío', () => {
    const { destacado, resto } = destacadoYResto([art('unico', '2026-08-25', 'mercado')]);
    expect(destacado?.id).toBe('unico');
    expect(resto).toEqual([]);
  });
});

describe('conteoPorCategoria', () => {
  it('cuenta cada cajón, y los vacíos valen cero', () => {
    const conteo = conteoPorCategoria([
      art('a', '2026-08-25', 'ley-y-contratos'),
      art('b', '2026-08-24', 'ley-y-contratos'),
      art('c', '2026-08-23', 'corta-estancia'),
    ]);
    expect(conteo).toEqual({
      'ley-y-contratos': 2,
      'corta-estancia': 1,
      mercado: 0,
      'guias-de-zona': 0,
    });
  });

  it('sin artículos, las cuatro categorías siguen existiendo en cero', () => {
    expect(Object.values(conteoPorCategoria([])).every((n) => n === 0)).toBe(true);
    expect(Object.keys(conteoPorCategoria([])).sort()).toEqual([...CATEGORIAS].sort());
  });
});

describe('relacionados', () => {
  const todos = [
    art('ley-1', '2026-08-25', 'ley-y-contratos'),
    art('ley-2', '2026-08-20', 'ley-y-contratos'),
    art('estancia', '2026-08-22', 'corta-estancia'),
  ];

  it('nunca se recomienda a sí mismo', () => {
    expect(relacionados(todos[0], todos).some((r) => r.id === 'ley-1')).toBe(false);
  });

  it('prefiere la misma categoría, aunque sea más vieja', () => {
    // `estancia` es más reciente que `ley-2`, pero el lector de un artículo de ley quiere ley.
    expect(relacionados(todos[0], todos)[0].id).toBe('ley-2');
  });

  it('completa con otras categorías cuando no alcanza', () => {
    expect(relacionados(todos[0], todos).map((r) => r.id)).toEqual(['ley-2', 'estancia']);
  });

  it('respeta el tope pedido', () => {
    expect(relacionados(todos[0], todos, 1)).toHaveLength(1);
  });

  it('un artículo solo en el mundo no tiene relacionados', () => {
    expect(relacionados(todos[0], [todos[0]])).toEqual([]);
  });
});

describe('ETIQUETA', () => {
  it('las cuatro categorías del esquema tienen etiqueta visible', () => {
    // Si se añade un cajón al enum y se olvida la etiqueta, esto lo caza antes que el navegador.
    for (const c of CATEGORIAS) {
      expect(ETIQUETA[c]).toBeTruthy();
    }
    expect(Object.keys(ETIQUETA).sort()).toEqual([...CATEGORIAS].sort());
  });
});
