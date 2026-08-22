/*
 * Invariantes de expediente y novedad + el reloj del SLA (§118).
 *
 * Lo que se prueba aquí son las decisiones que cuestan dinero o confianza si salen mal: que no se
 * pueda abrir una carpeta sobre nada, que no se pueda cerrar un ticket sin decir qué se hizo, y que
 * el reloj de una PQRS diga la verdad sobre el tiempo que lleva esperando un inquilino.
 */

import { describe, expect, it } from 'vitest';
import {
  explicarProblemaExpediente,
  explicarProblemaNovedad,
  problemasDeExpediente,
  problemasDeNovedad,
  type Expediente,
  type Novedad,
} from './gestion';
import {
  accionDeSla,
  agenda,
  estadoDeSla,
  hitosDeNovedad,
  horasEntre,
  HORAS_SLA_PQRS,
  vencimientoSla,
} from './agenda';

const novedad = (p: Partial<Novedad> = {}): Novedad => ({
  id: 'NOV-202608-0001',
  expedienteId: 'EXP-202601-0007',
  reportadoPor: 'inquilino',
  tipo: 'reparación',
  descripcion: 'Fuga en el lavaplatos de la cocina.',
  estado: 'PENDIENTE',
  _version: 1,
  createdAt: '2026-08-20T09:00:00.000Z',
  updatedAt: '2026-08-20T09:00:00.000Z',
  ...p,
});

describe('problemasDeExpediente', () => {
  it('exige estado y alguna referencia al inmueble', () => {
    expect(problemasDeExpediente({})).toEqual(['sin-estado', 'sin-referencia']);
  });

  it('acepta la referencia por catálogo O por código legacy — cualquiera de las dos basta', () => {
    const base = { estado: 'activo' } as Partial<Expediente>;
    expect(problemasDeExpediente({ ...base, propiedadId: 'INM-202608-0003' })).toEqual([]);
    expect(problemasDeExpediente({ ...base, codigoLegacy: 'ALT-AR-014' })).toEqual([]);
  });

  it('no acepta un estado inventado: la lista de estados es cerrada', () => {
    expect(problemasDeExpediente({ estado: 'archivado' as never, codigoLegacy: 'ALT-AR-014' })).toEqual([
      'sin-estado',
    ]);
  });

  it('los espacios en blanco no cuentan como referencia', () => {
    expect(problemasDeExpediente({ estado: 'activo', codigoLegacy: '   ' })).toEqual(['sin-referencia']);
  });

  it('cada problema se explica en cristiano', () => {
    for (const p of problemasDeExpediente({})) {
      expect(explicarProblemaExpediente(p).length).toBeGreaterThan(20);
    }
  });
});

describe('problemasDeNovedad', () => {
  it('una novedad completa no tiene problemas', () => {
    expect(problemasDeNovedad(novedad())).toEqual([]);
  });

  it('exige expediente, tipo y descripción', () => {
    expect(problemasDeNovedad({})).toEqual(['sin-expediente', 'sin-tipo', 'sin-descripcion']);
  });

  it('NO deja cerrar sin escribir qué se hizo — ni en HECHO ni en CERRADO', () => {
    for (const estado of ['HECHO', 'CERRADO'] as const) {
      expect(problemasDeNovedad(novedad({ estado }))).toEqual(['cerrada-sin-resolucion']);
      expect(problemasDeNovedad(novedad({ estado, resolucion: 'Se cambió el sifón.' }))).toEqual([]);
    }
  });

  it('mientras sigue abierta no pide resolución', () => {
    for (const estado of ['PENDIENTE', 'EN CURSO'] as const) {
      expect(problemasDeNovedad(novedad({ estado }))).toEqual([]);
    }
  });
});

describe('horasEntre', () => {
  it('cuenta horas y devuelve negativo cuando el segundo instante ya pasó', () => {
    expect(horasEntre('2026-08-20T09:00:00.000Z', '2026-08-21T09:00:00.000Z')).toBe(24);
    expect(horasEntre('2026-08-21T09:00:00.000Z', '2026-08-20T09:00:00.000Z')).toBe(-24);
  });

  it('una fecha ilegible da 0 en vez de NaN — un NaN se propaga y envenena la urgencia', () => {
    expect(horasEntre('mañana', '2026-08-21T09:00:00.000Z')).toBe(0);
  });
});

describe('vencimientoSla', () => {
  it('cuenta 48h desde que ENTRA la novedad, no desde que alguien la mira', () => {
    expect(vencimientoSla(novedad())).toBe('2026-08-22T09:00:00.000Z');
    expect(HORAS_SLA_PQRS).toBe(48);
  });

  it('un plazo pactado explícito manda sobre el calculado', () => {
    const n = novedad({ slaVencimiento: '2026-09-01T00:00:00.000Z' });
    expect(vencimientoSla(n)).toBe('2026-09-01T00:00:00.000Z');
  });
});

describe('estadoDeSla', () => {
  it('marca vencida cuando se pasó el plazo', () => {
    const e = estadoDeSla(novedad(), '2026-08-23T09:00:00.000Z');
    expect(e.vencida).toBe(true);
    expect(e.horasRestantes).toBe(-24);
    expect(e.urgencia).toBe('vencido');
  });

  it('una novedad resuelta NO vence: su reloj se paró al resolverse', () => {
    const e = estadoDeSla(novedad({ estado: 'HECHO' }), '2026-09-30T09:00:00.000Z');
    expect(e.cerrada).toBe(true);
    expect(e.vencida).toBe(false);
    expect(e.urgencia).toBe('despues');
  });

  it('sube a urgencia «hoy» en las últimas 12 horas', () => {
    expect(estadoDeSla(novedad(), '2026-08-21T22:00:00.000Z').urgencia).toBe('hoy');
    expect(estadoDeSla(novedad(), '2026-08-21T20:00:00.000Z').urgencia).toBe('semana');
  });
});

describe('accionDeSla', () => {
  it('dice cuántas horas lleva fuera de plazo, no solo que lo está', () => {
    const e = estadoDeSla(novedad(), '2026-08-23T09:00:00.000Z');
    expect(accionDeSla(e)).toContain('24 h');
    expect(accionDeSla(e)).toContain('HOY');
  });

  it('una resuelta no pide nada', () => {
    expect(accionDeSla(estadoDeSla(novedad({ estado: 'CERRADO' }), '2026-08-23T09:00:00.000Z'))).toBe('Resuelta.');
  });
});

describe('hitosDeNovedad', () => {
  it('una novedad abierta pide sitio en la agenda, con su expediente', () => {
    const [h] = hitosDeNovedad(novedad(), '2026-08-23');
    expect(h.tipo).toBe('novedad');
    expect(h.expedienteId).toBe('EXP-202601-0007');
    expect(h.contratoId).toBeUndefined();
    expect(h.urgencia).toBe('vencido');
    expect(h.titulo).toContain('reparación');
  });

  it('una resuelta no aparece: el tablero es de lo que falta', () => {
    expect(hitosDeNovedad(novedad({ estado: 'HECHO', resolucion: 'ok' }), '2026-08-23')).toEqual([]);
  });
});

describe('agenda con novedades', () => {
  it('las mezcla con los hitos de contrato y las ordena por fecha', () => {
    const hitos = agenda([], '2026-08-23', 120, [
      novedad({ id: 'A', createdAt: '2026-08-22T09:00:00.000Z' }),
      novedad({ id: 'B', createdAt: '2026-08-20T09:00:00.000Z' }),
    ]);
    expect(hitos.map((h) => h.fecha)).toEqual(['2026-08-22', '2026-08-24']);
  });

  it('quien ya llamaba a `agenda` sin novedades sigue funcionando igual', () => {
    expect(agenda([], '2026-08-23')).toEqual([]);
  });
});
