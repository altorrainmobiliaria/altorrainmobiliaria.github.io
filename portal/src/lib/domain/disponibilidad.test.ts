import { describe, it, expect } from 'vitest';
import { docIdDisponibilidad, explicarOcupadas, nochesDeEstancia, nochesOcupadas } from './disponibilidad';
import type { Disponibilidad } from './propiedades';

// Las noches que ocupa una estancia y quién las bloquea. Lo que se protege aquí es UN off-by-one con
// dos caras caras: contar la salida pierde reservas compatibles; no contar la llegada mete a dos
// personas en la misma cama. Por eso se ataca por los DOS extremos, no solo por el que se recuerda.

const mapa = (d: Record<string, Disponibilidad['estado']>) =>
  new Map(Object.entries(d).map(([f, estado]) => [f, { estado }]));

describe('nochesDeEstancia — el intervalo es [llegada, salida)', () => {
  it('🎯 la LLEGADA se ocupa y la SALIDA no', () => {
    expect(nochesDeEstancia('2026-07-10', '2026-07-13')).toEqual(['2026-07-10', '2026-07-11', '2026-07-12']);
  });

  it('🎯 dos estancias ADYACENTES no se pisan: quien se va el 13 libera esa noche', () => {
    const sale = nochesDeEstancia('2026-07-10', '2026-07-13');
    const llega = nochesDeEstancia('2026-07-13', '2026-07-15');
    expect(sale.filter((n) => llega.includes(n))).toEqual([]); // cero solape
    expect(llega).toEqual(['2026-07-13', '2026-07-14']);
  });

  it('🎯 dos estancias que SÍ se pisan comparten la noche exacta', () => {
    const a = nochesDeEstancia('2026-07-10', '2026-07-13');
    const b = nochesDeEstancia('2026-07-12', '2026-07-14');
    expect(a.filter((n) => b.includes(n))).toEqual(['2026-07-12']);
  });

  it('una noche suelta es UNA noche', () => {
    expect(nochesDeEstancia('2026-07-10', '2026-07-11')).toEqual(['2026-07-10']);
  });

  it('cruza el fin de mes y el fin de año sin saltarse un día', () => {
    expect(nochesDeEstancia('2026-01-30', '2026-02-02')).toEqual(['2026-01-30', '2026-01-31', '2026-02-01']);
    expect(nochesDeEstancia('2026-12-31', '2027-01-02')).toEqual(['2026-12-31', '2027-01-01']);
  });

  it('cuenta el 29 de febrero de un año bisiesto', () => {
    expect(nochesDeEstancia('2028-02-28', '2028-03-01')).toEqual(['2028-02-28', '2028-02-29']);
  });

  it('lo que no es una estancia devuelve [] en vez de reventar', () => {
    expect(nochesDeEstancia('2026-07-13', '2026-07-13')).toEqual([]); // cero noches
    expect(nochesDeEstancia('2026-07-13', '2026-07-10')).toEqual([]); // al revés
    expect(nochesDeEstancia('13/07/2026', '2026-07-15')).toEqual([]); // otro formato
    expect(nochesDeEstancia('', '')).toEqual([]);
  });

  it('una estancia larga da exactamente una noche por día', () => {
    expect(nochesDeEstancia('2026-07-01', '2026-09-29')).toHaveLength(90);
  });
});

describe('nochesOcupadas — la ausencia de documento es LIBRE, no «no sé»', () => {
  const noches = ['2026-07-10', '2026-07-11', '2026-07-12'];

  it('🎯 un calendario VACÍO deja reservar: es el estado-cero de un inmueble recién publicado', () => {
    expect(nochesOcupadas(noches, new Map())).toEqual([]);
  });

  it('`libre` explícito tampoco bloquea', () => {
    expect(nochesOcupadas(noches, mapa({ '2026-07-11': 'libre' }))).toEqual([]);
  });

  it('distingue lo VENDIDO de lo CERRADO por el anfitrión: no es el mismo mensaje', () => {
    const r = nochesOcupadas(noches, mapa({ '2026-07-11': 'reservado', '2026-07-12': 'bloqueado' }));
    expect(r).toEqual([
      { fecha: '2026-07-11', estado: 'reservado' },
      { fecha: '2026-07-12', estado: 'bloqueado' },
    ]);
  });

  it('solo mira las noches PEDIDAS: lo ocupado fuera del rango no es asunto suyo', () => {
    expect(nochesOcupadas(noches, mapa({ '2026-07-20': 'reservado' }))).toEqual([]);
  });

  it('devuelve TODAS las que chocan, no la primera: quien pregunta necesita el rango entero', () => {
    const r = nochesOcupadas(noches, mapa({ '2026-07-10': 'reservado', '2026-07-11': 'reservado', '2026-07-12': 'reservado' }));
    expect(r).toHaveLength(3);
  });
});

describe('docIdDisponibilidad / explicarOcupadas', () => {
  it('la clave la compone UN dueño (la escribe la Function y la lee el cliente REST)', () => {
    expect(docIdDisponibilidad('INM-202607-0001', '2026-07-15')).toBe('INM-202607-0001_2026-07-15');
  });

  it('el choque se cuenta en palabras, y separa vendido de cerrado', () => {
    const t = explicarOcupadas([
      { fecha: '2026-07-11', estado: 'reservado' },
      { fecha: '2026-07-12', estado: 'bloqueado' },
    ]);
    expect(t).toContain('2026-07-11');
    expect(t).toContain('anfitrión');
    expect(t).not.toContain('undefined');
  });

  it('sin choque no dice nada — una frase vacía no es una frase que sobra', () => {
    expect(explicarOcupadas([])).toBe('');
  });
});
