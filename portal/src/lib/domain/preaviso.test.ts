import { describe, expect, it } from 'vitest';
import {
  TITULO_DEL_ARRENDADOR,
  efecto,
  explicarProblemaPreaviso,
  fechaLimite,
  problemasDePreaviso,
  type Preaviso,
} from './preaviso';
import { MESES_AVISO_RENOVACION, MESES_PREAVISO_LEY_820 } from './agenda';

const FIN = '2026-12-31';

/*
 * ⚠️ El fixture avisa como ARRENDATARIO a propósito (§263). Antes decía `arrendador`, y con eso
 * estas pruebas afirmaban que el aviso postal del propietario TERMINA el contrato — que es
 * justamente el error legal que costó el artículo del Journal y el texto del panel. Quien puede
 * terminar en el vencimiento con solo avisar es el inquilino (Ley 820 art. 24). La asimetría tiene
 * su propio bloque abajo.
 */
const preaviso = (over: Partial<Preaviso> = {}): Preaviso => ({
  contratoId: 'CTR-1',
  quien: 'arrendatario',
  redactadoEl: '2026-09-01',
  evidencia: { operador: '4-72', guia: 'YG123456789CO', impuestoEl: '2026-09-01' },
  ...over,
});

describe('🔴 el CANAL no es el DERECHO: arrendador y arrendatario no son simétricos (§263)', () => {
  /*
   * `efecto()` devolvía «termina» en cuanto la constancia postal estaba completa y a tiempo, para
   * CUALQUIERA de los dos. El dato para distinguirlos —`quien`— llevaba en el modelo desde el
   * principio y nadie lo miraba, así que el panel le confirmaba POR ESCRITO al propietario que su
   * contrato terminaba. Llegaba la fecha, el inquilino no se iba, y quien se lo había asegurado
   * era ALTORRA. Verificado en el texto oficial de la Ley 820 (Función Pública, gestor normativo).
   */
  const conEvidenciaPerfecta = (quien: 'arrendador' | 'arrendatario'): Preaviso => ({
    contratoId: 'CTR-1',
    quien,
    redactadoEl: '2026-09-01',
    evidencia: { operador: '4-72', guia: 'YG123456789CO', impuestoEl: '2026-09-01' },
  });

  it('el ARRENDATARIO sí termina en el vencimiento con solo avisar (art. 24)', () => {
    expect(efecto(conEvidenciaPerfecta('arrendatario'), FIN)).toBe('termina');
  });

  it('el ARRENDADOR no: le falta el título aunque el aviso sea impecable', () => {
    expect(efecto(conEvidenciaPerfecta('arrendador'), FIN)).toBe('falta-titulo-del-arrendador');
  });

  it('y NO se le dice «se prorroga»: el aviso no llegó tarde, le falta otra cosa', () => {
    expect(efecto(conEvidenciaPerfecta('arrendador'), FIN)).not.toBe('se-prorroga');
  });

  it('si el aviso del arrendador llega TARDE, manda el retraso: se prorroga', () => {
    const tarde = { ...conEvidenciaPerfecta('arrendador'), evidencia: { operador: '4-72', guia: 'X', impuestoEl: '2026-11-01' } };
    expect(efecto(tarde, FIN)).toBe('se-prorroga');
  });

  it('el texto que lo explica nombra las DOS salidas de la ley', () => {
    expect(TITULO_DEL_ARRENDADOR).toMatch(/tres meses de arriendo/i);
    expect(TITULO_DEL_ARRENDADOR).toMatch(/caución de seis meses/i);
  });
});

describe('fechaLimite — tres meses antes del vencimiento', () => {
  it('resta exactamente el plazo legal', () => {
    expect(fechaLimite(FIN)).toBe('2026-09-30');
  });

  it('acepta un timestamp completo y se queda con el día', () => {
    expect(fechaLimite('2026-12-31T18:00:00Z')).toBe('2026-09-30');
  });

  it('no desborda de mes: 31 de mayo menos 3 cae en el último día de febrero', () => {
    expect(fechaLimite('2026-05-31')).toBe('2026-02-28');
  });
});

describe('🔴 un preaviso SIN evidencia postal no es un preaviso (§185)', () => {
  it('sin evidencia, el contrato se prorroga', () => {
    const p = preaviso({ evidencia: undefined });
    expect(problemasDePreaviso(p, FIN)).toEqual(['sin-evidencia-postal']);
    expect(efecto(p, FIN)).toBe('se-prorroga');
  });

  it('y el mensaje dice la CONSECUENCIA, no solo que falta un campo', () => {
    const m = explicarProblemaPreaviso('sin-evidencia-postal');
    expect(m).toMatch(/prorroga/i);
    expect(m).toMatch(/intenci/i);
  });

  it('una guía o un operador en blanco tampoco valen (fail-closed)', () => {
    const sinGuia = preaviso({ evidencia: { operador: '4-72', guia: '   ', impuestoEl: '2026-09-01' } });
    expect(problemasDePreaviso(sinGuia, FIN)).toContain('sin-guia');
    const sinOp = preaviso({ evidencia: { operador: '', guia: 'YG1', impuestoEl: '2026-09-01' } });
    expect(problemasDePreaviso(sinOp, FIN)).toContain('sin-operador');
  });
});

describe('⏱️ manda la fecha de IMPOSICIÓN, no la de redacción', () => {
  it('redactado a tiempo pero impuesto tarde: NO termina', () => {
    // El error de bolsillo del negocio: «si ya lo tenía escrito el 1 de septiembre».
    const p = preaviso({ redactadoEl: '2026-09-01', evidencia: { operador: '4-72', guia: 'YG1', impuestoEl: '2026-10-05' } });
    expect(problemasDePreaviso(p, FIN)).toEqual(['impuesto-tarde']);
    expect(efecto(p, FIN)).toBe('se-prorroga');
  });

  it('redactado tarde pero impuesto a tiempo: SÍ termina', () => {
    const p = preaviso({ redactadoEl: '2026-09-30', evidencia: { operador: '4-72', guia: 'YG1', impuestoEl: '2026-09-30' } });
    expect(efecto(p, FIN)).toBe('termina');
  });

  it('el último día del plazo cuenta como dentro', () => {
    const p = preaviso({ evidencia: { operador: '4-72', guia: 'YG1', impuestoEl: fechaLimite(FIN) } });
    expect(efecto(p, FIN)).toBe('termina');
  });

  it('un día después, no', () => {
    const p = preaviso({ evidencia: { operador: '4-72', guia: 'YG1', impuestoEl: '2026-10-01' } });
    expect(efecto(p, FIN)).toBe('se-prorroga');
  });

  it('la fecha de ENTREGA no mueve el plazo: refuerza la prueba, no la sustituye', () => {
    const p = preaviso({
      evidencia: { operador: '4-72', guia: 'YG1', impuestoEl: '2026-09-30', entregadoEl: '2026-10-08' },
    });
    expect(efecto(p, FIN)).toBe('termina');
  });
});

describe('🔗 la alerta de la agenda DERIVA del plazo legal (§187)', () => {
  it('el aviso interno va un mes por delante del plazo de la ley', () => {
    // Si alguien cambia el plazo legal, esto sigue cuadrando solo. Un 4 copiado a mano no.
    expect(MESES_AVISO_RENOVACION).toBe(MESES_PREAVISO_LEY_820 + 1);
  });

  it('y esa holgura es real: la alerta cae ANTES del límite para imponer', () => {
    expect(fechaLimite(FIN) > '2026-08-31').toBe(true);
  });
});

describe('el camino feliz', () => {
  it('con operador, guía y fecha dentro del plazo, el contrato termina', () => {
    expect(problemasDePreaviso(preaviso(), FIN)).toEqual([]);
    expect(efecto(preaviso(), FIN)).toBe('termina');
  });

  it('cada problema tiene un texto para una persona', () => {
    for (const m of ['sin-evidencia-postal', 'sin-operador', 'sin-guia', 'sin-fecha-de-imposicion', 'impuesto-tarde'] as const) {
      expect(explicarProblemaPreaviso(m).length).toBeGreaterThan(30);
    }
  });
});
