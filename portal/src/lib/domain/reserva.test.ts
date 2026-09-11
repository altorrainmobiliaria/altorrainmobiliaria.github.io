import { describe, expect, it } from 'vitest';
import {
  desgloseEstadia,
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

/*
 * 🧾 EL TOTAL DE LA ESTADÍA (§312). `precioAseo` prometía en su comentario un total que no existía en
 * ningún sitio del repo: aquí se contaban las noches y nunca se multiplicaban. La única cuenta viva
 * estaba en literales de la página demo — y llevaba dentro un cargo del 10% que nadie había decidido.
 *
 * Se prueba el DESGLOSE, no solo la suma: un total que cuadra por casualidad (aseo cobrado por noche
 * en una estadía de una noche, por ejemplo) pasaría una prueba que solo mirase el total.
 */
describe('🧾 desgloseEstadia — el total que la ficha prometía (§312)', () => {
  const PRECIO = { precioNoche: 350_000, precioAseo: 90_000 };

  it('suma las noches y añade el aseo UNA vez', () => {
    const d = desgloseEstadia(PRECIO, '2026-09-01', '2026-09-06');
    expect(d).not.toBeNull();
    expect(d).toEqual({
      noches: 5,
      precioNoche: 350_000,
      alojamiento: 1_750_000,
      aseo: 90_000,
      total: 1_840_000,
    });
  });

  it('el aseo NO se multiplica por noches — se ve en que 2 noches y 4 pagan el mismo aseo', () => {
    expect(desgloseEstadia(PRECIO, '2026-09-01', '2026-09-03')?.aseo).toBe(90_000);
    expect(desgloseEstadia(PRECIO, '2026-09-01', '2026-09-05')?.aseo).toBe(90_000);
  });

  it('sin aseo el total es el alojamiento, y el aseo es 0 — nunca undefined en una cuenta', () => {
    const d = desgloseEstadia({ precioNoche: 350_000 }, '2026-09-01', '2026-09-03');
    expect(d?.aseo).toBe(0);
    expect(d?.total).toBe(700_000);
  });

  it('NO existe cargo por servicio: el total es exactamente alojamiento + aseo', () => {
    const d = desgloseEstadia(PRECIO, '2026-09-01', '2026-09-04');
    // Con el 10% retirado esto es una identidad; con él era falso por $105.000. La prueba existe para
    // que reintroducir un porcentaje al huésped tenga que romper algo antes de llegar a producción.
    expect(d!.total).toBe(d!.alojamiento + d!.aseo);
  });

  it('sin precio por noche devuelve null, no un cero: un cero afirmaría que es gratis', () => {
    expect(desgloseEstadia({}, '2026-09-01', '2026-09-04')).toBeNull();
    expect(desgloseEstadia({ precioNoche: 0 }, '2026-09-01', '2026-09-04')).toBeNull();
    expect(desgloseEstadia(undefined, '2026-09-01', '2026-09-04')).toBeNull();
  });

  it('fechas que no son una estadía devuelven null', () => {
    expect(desgloseEstadia(PRECIO, '2026-09-04', '2026-09-01')).toBeNull(); // salida antes
    expect(desgloseEstadia(PRECIO, '2026-09-01', '2026-09-01')).toBeNull(); // cero noches
    expect(desgloseEstadia(PRECIO, '', '')).toBeNull();
    expect(desgloseEstadia(PRECIO, 'mañana', 'pasado')).toBeNull();
  });

  it('el tope de noches se cotiza, y una más ya no: es otro producto y otra ley', () => {
    // La frontera exacta, en las dos direcciones. `problemasDeReserva` rechaza por encima de
    // NOCHES_MAX, así que cotizar una estadía que el endpoint va a rechazar sería enseñar un precio
    // por algo que no se puede pedir.
    expect(desgloseEstadia(PRECIO, '2026-09-01', '2026-11-30')?.noches).toBe(NOCHES_MAX); // 90 justas
    expect(desgloseEstadia(PRECIO, '2026-09-01', '2026-12-01')).toBeNull(); // 91
  });

  it('un aseo corrupto se ignora, NUNCA se resta del total', () => {
    // Un cargo que BAJA el total publicaría una cifra menor que la que se va a cobrar.
    expect(desgloseEstadia({ precioNoche: 350_000, precioAseo: -50_000 }, '2026-09-01', '2026-09-03')?.total).toBe(700_000);
    expect(desgloseEstadia({ precioNoche: 350_000, precioAseo: NaN }, '2026-09-01', '2026-09-03')?.total).toBe(700_000);
  });
});
