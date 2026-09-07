/*
 * Lo PURO de la pantalla del preaviso (ADR §233). El efecto legal lo prueba el dominio y la puerta
 * lo prueba `firebase/tests/preaviso-escritura.test.ts` contra el emulador; aquí van las tres
 * decisiones de PRESENTACIÓN que pueden equivocarse solas.
 */
import { describe, expect, it } from 'vitest';
import { enLetras, preavisables, textoLimite } from './gestion-preaviso';
import type { Contrato } from '../lib/domain/gestion';

const base = (extra: Partial<Contrato> = {}): Contrato =>
  ({
    id: 'CTO-1',
    expedienteId: 'EXP-1',
    tipo: 'arriendo',
    vertical: 'vivienda',
    estado: 'vigente',
    partes: {},
    vigenciaInicio: '2026-10-01',
    vigenciaFin: '2027-09-30',
    renovacionAutomatica: true,
    _version: 1,
    createdAt: '',
    updatedAt: '',
    ...extra,
  }) as Contrato;

describe('enLetras', () => {
  it('escribe la fecha como la diría una persona', () => {
    expect(enLetras('2027-06-30')).toBe('30 de junio de 2027');
    expect(enLetras('2027-01-01')).toBe('1 de enero de 2027');
  });

  it('acepta un ISO con hora y se queda con el día', () => {
    expect(enLetras('2027-12-05T18:30:00.000Z')).toBe('5 de diciembre de 2027');
  });

  it('no inventa una fecha cuando no la hay', () => {
    expect(enLetras('')).toBe('—');
    expect(enLetras('mañana')).toBe('—');
    // Un mes 13 no existe: mejor un guion que «undefined de 2027».
    expect(enLetras('2027-13-01')).toBe('—');
  });
});

describe('preavisables', () => {
  it('deja fuera los terminados: no hay nada que preavisar', () => {
    const cs = [base({ id: 'A' }), base({ id: 'B', estado: 'terminado' })];
    expect(preavisables(cs).map((c) => c.id)).toEqual(['A']);
  });

  it('deja fuera los que no tienen vencimiento: su plazo no se puede calcular', () => {
    const cs = [base({ id: 'A' }), base({ id: 'B', vigenciaFin: '' as Contrato['vigenciaFin'] })];
    expect(preavisables(cs).map((c) => c.id)).toEqual(['A']);
  });

  it('incluye los que ya están en preaviso: se puede corregir la evidencia', () => {
    expect(preavisables([base({ estado: 'preaviso' })])).toHaveLength(1);
  });
});

describe('textoLimite — lo primero que se lee', () => {
  it('dice el vencimiento Y el último día para imponer, que es el que evita el daño', () => {
    const t = textoLimite(base());
    expect(t).toContain('30 de septiembre de 2027');
    expect(t).toContain('30 de junio de 2027');
  });

  it('si ya tiene preaviso con efecto, lo dice en vez de ofrecer un plazo pasado', () => {
    const c = base({
      preaviso: {
        quien: 'arrendador',
        redactadoEl: '2027-06-14',
        operador: 'Servientrega',
        guia: '1',
        impuestoEl: '2027-06-18',
        efecto: 'termina',
        registradoEn: '',
        registradoPor: '',
      },
    });
    expect(textoLimite(c)).toContain('Ya tiene preaviso');
  });

  it('si el preaviso llegó tarde lo dice ENTERO: se prorroga', () => {
    const c = base({
      preaviso: {
        quien: 'arrendador',
        redactadoEl: '2027-06-14',
        operador: 'Servientrega',
        guia: '1',
        impuestoEl: '2027-07-12',
        efecto: 'se-prorroga',
        registradoEn: '',
        registradoPor: '',
      },
    });
    expect(textoLimite(c)).toContain('se prorroga');
  });

  it('sin contrato elegido no dice nada, en vez de un plazo inventado', () => {
    expect(textoLimite(undefined)).toBe('');
  });
});
