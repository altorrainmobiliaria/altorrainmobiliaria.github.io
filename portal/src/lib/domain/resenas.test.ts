/*
 * Las cuatro reglas de §281, cada una con la prueba que la haría fallar si alguien la relaja.
 *
 * La regla 1 (nadie puede teclear la nota) no se prueba aquí: vive en las Rules de Firestore y tiene
 * su prueba contra el emulador. Lo que se prueba aquí es lo que decide qué SE ENSEÑA.
 */
import { describe, expect, it } from 'vitest';
import { MINIMO_RESENAS, notaVisible, recalcular, textoNota } from './resenas';

const agg = (promedio: number, n: number) => ({ promedio, n, actualizado: '2026-08-31T00:00:00Z' });

describe('notaVisible — o hay nota CON su recuento, o no hay nota', () => {
  it('🔴 por debajo del mínimo NO hay nota: un promedio de una reseña es una anécdota con decimales', () => {
    expect(notaVisible(agg(5, 1))).toBeNull();
    expect(notaVisible(agg(5, MINIMO_RESENAS - 1))).toBeNull();
    expect(notaVisible(agg(4.8, MINIMO_RESENAS))).toEqual({ promedio: 4.8, n: MINIMO_RESENAS });
  });

  it('sin agregado no se inventa uno', () => {
    expect(notaVisible(undefined)).toBeNull();
    expect(notaVisible(null)).toBeNull();
  });

  it('🔴 un dato corrupto NO se pinta — el que falta se ve, el corrupto no', () => {
    expect(notaVisible(agg(Number.NaN, 10))).toBeNull();
    expect(notaVisible(agg(9, 10))).toBeNull();      // fuera de escala por arriba
    expect(notaVisible(agg(0, 10))).toBeNull();      // y por abajo
    expect(notaVisible(agg(4.5, 2.5))).toBeNull();   // un recuento con decimales no es un recuento
  });

  it('la nota SIEMPRE sale acompañada de su recuento (regla 3)', () => {
    const v = notaVisible(agg(4.9, 12));
    expect(v).not.toBeNull();
    // 🎯 Si alguien añadiera un camino que devuelve solo el promedio, esta prueba no lo vería — por
    // eso la regla se sostiene en que el módulo NO exporta ninguno, y no en esta comprobación.
    expect(Object.keys(v ?? {}).sort()).toEqual(['n', 'promedio']);
  });
});

describe('textoNota — se lee en español, y no finge precisión', () => {
  it('un decimal, coma decimal, y el plural concuerda', () => {
    expect(textoNota({ promedio: 4.833, n: 12 })).toBe('4,8 · 12 reseñas');
    expect(textoNota({ promedio: 5, n: 1 })).toBe('5,0 · 1 reseña');
  });
});

describe('recalcular — el promedio nace de sumandos, no de un teclado', () => {
  it('promedia lo válido y cuenta lo que promedió', () => {
    const r = recalcular([5, 4, 3], '2026-08-31T00:00:00Z');
    expect(r).toEqual({ promedio: 4, n: 3, actualizado: '2026-08-31T00:00:00Z' });
  });

  it('🔴 una reseña corrupta no mueve el promedio de las buenas: se DESCARTA', () => {
    const r = recalcular([5, 4, 3, 99, Number.NaN], '2026-08-31T00:00:00Z');
    expect(r).toEqual({ promedio: 4, n: 3, actualizado: '2026-08-31T00:00:00Z' });
  });

  it('sin notas válidas devuelve null — que NO es lo mismo que un promedio de cero', () => {
    expect(recalcular([], 'x')).toBeNull();
    expect(recalcular([0, 99], 'x')).toBeNull();
  });

  it('lo que recalcular produce con pocas reseñas, notaVisible lo sigue ocultando', () => {
    // Las dos reglas son independientes a propósito: el servidor guarda lo que hay, y quien pinta
    // decide si alcanza. Si se fundieran, subir el mínimo obligaría a recalcular toda la base.
    const r = recalcular([5, 5], '2026-08-31T00:00:00Z');
    expect(r?.n).toBe(2);
    expect(notaVisible(r)).toBeNull();
  });
});
