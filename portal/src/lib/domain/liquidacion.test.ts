import { describe, expect, it } from 'vitest';
import {
  HONORARIOS_ADMIN_VIVIENDA,
  IVA,
  RETEFUENTE_ARRENDAMIENTO,
  RETEFUENTE_HONORARIOS_PJ,
  explicarProblema,
  liquidarPeriodo,
  problemasDeLiquidacion,
} from './liquidacion';

describe('liquidarPeriodo — el caso normal de este negocio', () => {
  /* Vivienda, arrendatario persona natural, cuota de PH cobrada aparte. */
  const base = { canon: 2_000_000, administracionPH: 300_000 };

  it('le cobra al arrendatario el canon más la cuota, separados', () => {
    expect(liquidarPeriodo(base).cobroAlArrendatario).toBe(2_300_000);
  });

  it('cobra el 10 % sobre el cargo mensual integral, no solo sobre el canon', () => {
    const l = liquidarPeriodo(base);
    expect(l.baseHonorarios).toBe(2_300_000);
    expect(l.honorarios).toBe(230_000);
    expect(l.ivaHonorarios).toBe(43_700);
  });

  it('NO retiene el 3,5 % cuando el arrendatario no es agente de retención', () => {
    expect(liquidarPeriodo(base).retencionCanon).toBe(0);
  });

  it('gira la cuota completa a la copropiedad', () => {
    expect(liquidarPeriodo(base).giroAPH).toBe(300_000);
  });

  it('le deja al propietario el canon menos honorarios e IVA', () => {
    expect(liquidarPeriodo(base).giroAlPropietario).toBe(2_000_000 - 230_000 - 43_700);
  });
});

describe('la retención del canon es una BANDERA, no una constante', () => {
  it('se practica solo si el arrendatario es agente de retención', () => {
    const sin = liquidarPeriodo({ canon: 2_000_000 });
    const con = liquidarPeriodo({ canon: 2_000_000, arrendatarioEsAgenteRetencion: true });
    expect(sin.retencionCanon).toBe(0);
    expect(con.retencionCanon).toBe(70_000); // 3,5 %
    expect(con.giroAlPropietario).toBe(sin.giroAlPropietario - 70_000);
  });

  it('se calcula sobre el CANON, nunca sobre la cuota de administración', () => {
    const l = liquidarPeriodo({
      canon: 2_000_000,
      administracionPH: 500_000,
      arrendatarioEsAgenteRetencion: true,
    });
    expect(l.retencionCanon).toBe(70_000);
  });
});

describe('la administración incluida en el canon', () => {
  const incluida = { canon: 2_300_000, administracionPH: 300_000, adminIncluidaEnCanon: true };

  it('no se le suma otra vez al arrendatario', () => {
    expect(liquidarPeriodo(incluida).cobroAlArrendatario).toBe(2_300_000);
  });

  it('no cobra honorarios dos veces sobre la misma cuota', () => {
    expect(liquidarPeriodo(incluida).baseHonorarios).toBe(2_300_000);
  });

  it('🔴 IGUAL le gira la cuota a la copropiedad: no la paga el propietario por su cuenta', () => {
    expect(liquidarPeriodo(incluida).giroAPH).toBe(300_000);
  });

  it('deja al propietario lo mismo que si se cobrara aparte', () => {
    const aparte = liquidarPeriodo({ canon: 2_000_000, administracionPH: 300_000 });
    expect(liquidarPeriodo(incluida).giroAlPropietario).toBe(aparte.giroAlPropietario);
  });
});

describe('retención sobre la comisión (propietario persona jurídica)', () => {
  it('sale del bolsillo de ALTORRA, no del giro al propietario', () => {
    const l = liquidarPeriodo({ canon: 1_000_000, propietarioEsAgenteRetencion: true });
    const sin = liquidarPeriodo({ canon: 1_000_000 });
    expect(l.retencionHonorarios).toBe(Math.round(100_000 * RETEFUENTE_HONORARIOS_PJ));
    expect(l.netoAltorra).toBe(l.honorarios - l.retencionHonorarios);
    expect(l.giroAlPropietario).toBe(sin.giroAlPropietario); // al propietario no le cambia nada
  });
});

describe('🔒 EL INVARIANTE: lo que entra es exactamente lo que sale', () => {
  /*
   * Es la prueba que hace confiable una liquidación. Un peso perdido al redondear es un peso que
   * alguien tiene que explicarle a un propietario, y se pierde justo en las cifras feas.
   */
  const feos = [1, 7, 999, 1_000_001, 1_333_333, 2_777_777, 987_654_321];
  for (const canon of feos) {
    for (const ph of [0, 1, 333, 199_999]) {
      for (const incluida of [false, true]) {
        for (const retiene of [false, true]) {
          it(`cuadra con canon=${canon} ph=${ph} incluida=${incluida} retiene=${retiene}`, () => {
            const l = liquidarPeriodo({
              canon,
              administracionPH: ph,
              adminIncluidaEnCanon: incluida && ph > 0,
              arrendatarioEsAgenteRetencion: retiene,
            });
            const salidas =
              l.giroAlPropietario + l.giroAPH + l.honorarios + l.ivaHonorarios + l.retencionCanon;
            expect(salidas).toBe(l.cobroAlArrendatario);
          });
        }
      }
    }
  }

  it('todas las cifras son enteros: en COP no hay centavos', () => {
    const l = liquidarPeriodo({ canon: 1_333_333, administracionPH: 77_777, honorariosPct: 0.075 });
    for (const [k, v] of Object.entries(l)) {
      expect(Number.isInteger(v), `${k} = ${v}`).toBe(true);
    }
  });
});

describe('las tarifas son parámetros con fuente, no números mágicos', () => {
  it('la de administración de vivienda es la sellada del tarifario', () => {
    expect(HONORARIOS_ADMIN_VIVIENDA).toBe(0.1);
  });
  it('el contrato manda sobre el default cuando pacta otra', () => {
    expect(liquidarPeriodo({ canon: 1_000_000, honorariosPct: 0.08 }).honorarios).toBe(80_000);
  });
  it('IVA y retenciones son los vigentes 2026', () => {
    expect(IVA).toBe(0.19);
    expect(RETEFUENTE_ARRENDAMIENTO).toBe(0.035);
    expect(RETEFUENTE_HONORARIOS_PJ).toBe(0.11);
  });
  it('se puede pactar sin IVA sobre honorarios', () => {
    expect(liquidarPeriodo({ canon: 1_000_000, ivaSobreHonorarios: false }).ivaHonorarios).toBe(0);
  });
});

describe('problemasDeLiquidacion — dice qué está mal, no lanza', () => {
  it('acepta un contrato sano', () => {
    expect(problemasDeLiquidacion({ canon: 1_500_000, administracionPH: 200_000 })).toEqual([]);
  });

  it('caza el canon en cero o negativo', () => {
    expect(problemasDeLiquidacion({ canon: 0 })).toContain('canon-invalido');
    expect(problemasDeLiquidacion({ canon: -1 })).toContain('canon-invalido');
    expect(problemasDeLiquidacion({ canon: NaN })).toContain('canon-invalido');
  });

  it('🎯 caza el 10 escrito donde iba 0.1 — el error de dedo más caro', () => {
    expect(problemasDeLiquidacion({ canon: 1_000_000, honorariosPct: 10 })).toContain(
      'honorarios-fuera-de-rango',
    );
    expect(problemasDeLiquidacion({ canon: 1_000_000, honorariosPct: 0.1 })).toEqual([]);
  });

  it('caza «incluida en el canon» sin cuota registrada', () => {
    expect(problemasDeLiquidacion({ canon: 1_000_000, adminIncluidaEnCanon: true })).toContain(
      'admin-incluida-sin-cuota',
    );
  });

  it('caza una cuota negativa', () => {
    expect(problemasDeLiquidacion({ canon: 1_000_000, administracionPH: -5 })).toContain(
      'administracion-invalida',
    );
  });

  it('cada problema tiene una explicación en castellano, y el desconocido también', () => {
    for (const c of [
      'canon-invalido',
      'administracion-invalida',
      'honorarios-fuera-de-rango',
      'admin-incluida-sin-cuota',
    ]) {
      expect(explicarProblema(c).length).toBeGreaterThan(20);
      expect(explicarProblema(c)).not.toContain(c);
    }
    expect(explicarProblema('lo-que-sea').length).toBeGreaterThan(10);
  });
});
