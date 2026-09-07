import { describe, expect, it } from 'vitest';
import { explicarProblemaContrato, problemasDeContrato, type Contrato } from './gestion';

// Invariantes del contrato (§113). El que importa no es de datos: es el gate del art. 16 de la Ley
// 820. El modelo lleva desde el día 1 prometiendo que «la CF valida garantía contra vertical» y hasta
// hoy no existía ni la función ni la Function.

function contrato(over: Partial<Contrato> = {}): Partial<Contrato> {
  return {
    expedienteId: 'EXP-1',
    tipo: 'arriendo',
    vertical: 'vivienda',
    estado: 'vigente',
    partes: { propietario: { nombre: 'Catalina Vega' } },
    canon: 2_500_000,
    diaPago: 5,
    vigenciaInicio: '2025-11-01',
    vigenciaFin: '2026-11-01',
    renovacionAutomatica: true,
    ...over,
  };
}

describe('🔴 el gate legal: depósito en VIVIENDA (art. 16 Ley 820)', () => {
  it('RECHAZA el depósito cuando la vertical es vivienda', () => {
    const p = problemasDeContrato(contrato({ garantia: { tipo: 'deposito_no_vivienda' } }));
    expect(p).toContain('deposito-en-vivienda');
  });

  it('lo ACEPTA en comercial, que es donde sí es válido', () => {
    const p = problemasDeContrato(contrato({ vertical: 'comercial', garantia: { tipo: 'deposito_no_vivienda' } }));
    expect(p).not.toContain('deposito-en-vivienda');
  });

  it('póliza y codeudor valen en vivienda', () => {
    for (const tipo of ['poliza', 'codeudor'] as const) {
      expect(problemasDeContrato(contrato({ garantia: { tipo } }))).toEqual([]);
    }
  });

  it('el mensaje CITA la norma y la consecuencia, y ofrece la salida', () => {
    const m = explicarProblemaContrato('deposito-en-vivienda');
    expect(m).toMatch(/Ley 820/);
    expect(m).toMatch(/16/);
    expect(m).toMatch(/póliza|poliza/i);
  });
});

describe('invariantes de datos', () => {
  it('un contrato completo no tiene problemas', () => {
    expect(problemasDeContrato(contrato())).toEqual([]);
  });

  it('exige expediente y al menos una parte con nombre', () => {
    expect(problemasDeContrato(contrato({ expedienteId: '  ' }))).toContain('sin-expediente');
    expect(problemasDeContrato(contrato({ partes: {} }))).toContain('sin-partes');
    expect(problemasDeContrato(contrato({ partes: { propietario: { nombre: '  ' } } }))).toContain('sin-partes');
  });

  it('exige vigencia, y que no vaya al revés', () => {
    expect(problemasDeContrato(contrato({ vigenciaFin: '' }))).toContain('sin-vigencia');
    expect(problemasDeContrato(contrato({ vigenciaInicio: '2026-11-01', vigenciaFin: '2025-11-01' })))
      .toContain('vigencia-invertida');
    // Mismo día tampoco: un contrato que empieza y acaba el mismo día no es un contrato.
    expect(problemasDeContrato(contrato({ vigenciaFin: '2025-11-01' }))).toContain('vigencia-invertida');
  });

  it('el arriendo necesita canon; la administración no', () => {
    expect(problemasDeContrato(contrato({ canon: 0 }))).toContain('sin-canon');
    expect(problemasDeContrato(contrato({ tipo: 'administracion', canon: undefined }))).not.toContain('sin-canon');
  });

  it('🎯 el día de pago se limita a 1..28 — para que exista en FEBRERO', () => {
    for (const d of [0, 29, 31, 5.5]) {
      expect(problemasDeContrato(contrato({ diaPago: d }))).toContain('dia-pago-invalido');
    }
    expect(problemasDeContrato(contrato({ diaPago: 28 }))).toEqual([]);
  });

  it('los honorarios son un porcentaje, no un monto', () => {
    expect(problemasDeContrato(contrato({ honorariosPct: 0 }))).toContain('honorarios-invalidos');
    expect(problemasDeContrato(contrato({ honorariosPct: 120 }))).toContain('honorarios-invalidos');
    expect(problemasDeContrato(contrato({ honorariosPct: 10 }))).toEqual([]);
  });

  it('los enseña TODOS de una vez', () => {
    const p = problemasDeContrato({ tipo: 'arriendo', vertical: 'vivienda', garantia: { tipo: 'deposito_no_vivienda' } });
    expect(p).toEqual(expect.arrayContaining(['sin-expediente', 'sin-partes', 'sin-vigencia', 'sin-canon', 'deposito-en-vivienda']));
  });

  it('todo problema tiene mensaje para una persona', () => {
    const todos = ['sin-expediente', 'sin-partes', 'sin-vigencia', 'vigencia-invertida', 'sin-canon', 'dia-pago-invalido', 'honorarios-invalidos', 'deposito-en-vivienda'] as const;
    for (const p of todos) {
      expect(explicarProblemaContrato(p).length).toBeGreaterThan(20);
      expect(explicarProblemaContrato(p)).not.toContain('undefined');
    }
  });
});
