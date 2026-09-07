import { describe, expect, it } from 'vitest';
import {
  explicarProblemaReserva,
  HUESPEDES_MAX,
  noches,
  NOCHES_MAX,
  problemasDeReserva,
  resumenReserva,
} from './reserva';

const HOY = '2026-08-22';
const ok = { llegada: '2026-09-01', salida: '2026-09-04', huespedes: 2 };

describe('noches', () => {
  it('cuenta los días entre llegada y salida', () => {
    expect(noches('2026-09-01', '2026-09-04')).toBe(3);
  });

  it('el mismo día son CERO noches, no una', () => {
    expect(noches('2026-09-01', '2026-09-01')).toBe(0);
  });

  it('cruza el cambio de mes y el de año sin inventarse días', () => {
    expect(noches('2026-08-30', '2026-09-02')).toBe(3);
    expect(noches('2026-12-30', '2027-01-02')).toBe(3);
  });

  it('una fecha ilegible da 0 y NUNCA NaN — un NaN se propaga hasta el total', () => {
    expect(noches('mañana', '2026-09-04')).toBe(0);
    expect(noches('', '')).toBe(0);
    expect(Number.isNaN(noches('2026-13-45', '2026-09-04'))).toBe(false);
  });
});

describe('problemasDeReserva', () => {
  it('una solicitud correcta no tiene problemas', () => {
    expect(problemasDeReserva(ok, HOY)).toEqual([]);
  });

  it('pide las dos fechas', () => {
    expect(problemasDeReserva({ huespedes: 2 }, HOY)).toEqual(['sin-llegada', 'sin-salida']);
  });

  it('rechaza llegar en el pasado', () => {
    expect(problemasDeReserva({ ...ok, llegada: '2026-08-01', salida: '2026-08-05' }, HOY)).toContain(
      'llegada-en-pasado',
    );
  });

  it('llegar HOY vale: alguien puede buscar alojamiento para esta noche', () => {
    expect(problemasDeReserva({ llegada: HOY, salida: '2026-08-23', huespedes: 2 }, HOY)).toEqual([]);
  });

  it('rechaza salir antes de llegar — y el MISMO día también', () => {
    expect(problemasDeReserva({ ...ok, salida: '2026-08-30' }, HOY)).toContain('salida-antes-de-llegada');
    expect(problemasDeReserva({ ...ok, salida: ok.llegada }, HOY)).toContain('salida-antes-de-llegada');
  });

  it(`por encima de ${NOCHES_MAX} noches ya es arriendo, que es otro producto`, () => {
    expect(problemasDeReserva({ llegada: '2026-09-01', salida: '2027-09-01', huespedes: 2 }, HOY)).toContain(
      'demasiadas-noches',
    );
  });

  it('valida los huéspedes: ni cero, ni fracción, ni una multitud', () => {
    for (const h of [0, -1, 2.5, HUESPEDES_MAX + 1, undefined]) {
      expect(problemasDeReserva({ ...ok, huespedes: h as number }, HOY)).toContain('huespedes-invalidos');
    }
    expect(problemasDeReserva({ ...ok, huespedes: 1 }, HOY)).toEqual([]);
    expect(problemasDeReserva({ ...ok, huespedes: HUESPEDES_MAX }, HOY)).toEqual([]);
  });

  it('cada problema se explica en cristiano', () => {
    const todos = problemasDeReserva({ llegada: '2026-08-01', salida: '2026-07-01', huespedes: 0 }, HOY);
    expect(todos.length).toBeGreaterThan(1);
    for (const p of todos) expect(explicarProblemaReserva(p).length).toBeGreaterThan(15);
  });
});

describe('resumenReserva', () => {
  it('escribe la frase que leerá quien reciba el lead', () => {
    expect(resumenReserva(ok)).toBe('Corta estancia · 2026-09-01 → 2026-09-04 (3 noches) · 2 huéspedes');
  });

  it('concuerda el singular: una noche, un huésped', () => {
    expect(resumenReserva({ llegada: '2026-09-01', salida: '2026-09-02', huespedes: 1 })).toBe(
      'Corta estancia · 2026-09-01 → 2026-09-02 (1 noche) · 1 huésped',
    );
  });
});
