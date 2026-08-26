import { describe, expect, it } from 'vitest';
import { liquidarPeriodo } from './liquidacion';
import {
  certificar,
  explicarProblemaCertificacion,
  mesesFaltantes,
  problemasDeCertificacion,
  type MesCertificado,
} from './certificacion';

const ALTORRA = { nombre: 'ALTORRA COMPANY S.A.S.', documento: '902063965-4' };
const DUENO = { nombre: 'María Restrepo', documento: '43.123.456' };

/** Doce meses iguales, que es el caso normal de un contrato de un año. */
const anio = (canon: number, ph = 0, extra: Record<string, unknown> = {}): MesCertificado[] =>
  Array.from({ length: 12 }, (_, i) => ({
    periodo: `2026-${String(i + 1).padStart(2, '0')}`,
    liquidacion: liquidarPeriodo({ canon, administracionPH: ph, ...extra }),
  }));

describe('certificar — el año completo', () => {
  const c = certificar(ALTORRA, DUENO, anio(2_000_000, 300_000));

  it('acota el período por el primero y el último mes', () => {
    expect(c.desde).toBe('2026-01');
    expect(c.hasta).toBe('2026-12');
    expect(c.meses).toBe(12);
  });

  it('🔴 el ingreso del propietario NO incluye la cuota de la copropiedad', () => {
    // Ese dinero nunca fue suyo: pasó camino de la PH. Incluirlo le inflaría el ingreso declarado.
    expect(c.ingresosRecibidos).toBe(2_000_000 * 12);
    expect(c.detallePagos.cuotaCopropiedad).toBe(300_000 * 12);
  });

  it('desglosa los pagos hechos por su cuenta, no solo el total', () => {
    const mes = liquidarPeriodo({ canon: 2_000_000, administracionPH: 300_000 });
    expect(c.detallePagos.honorarios).toBe(mes.honorarios * 12);
    expect(c.detallePagos.ivaHonorarios).toBe(mes.ivaHonorarios * 12);
    expect(c.pagosPorSuCuenta).toBe(
      c.detallePagos.cuotaCopropiedad + c.detallePagos.honorarios + c.detallePagos.ivaHonorarios,
    );
  });

  it('el neto girado es la suma exacta de los doce giros', () => {
    const mes = liquidarPeriodo({ canon: 2_000_000, administracionPH: 300_000 });
    expect(c.netoGirado).toBe(mes.giroAlPropietario * 12);
  });
});

describe('🔒 EL INVARIANTE: el certificado cuadra con las liquidaciones que lo componen', () => {
  const casos: Array<[string, MesCertificado[]]> = [
    ['canon redondo', anio(2_000_000, 300_000)],
    ['cifras feas', anio(1_333_333, 77_777)],
    ['sin cuota de PH', anio(987_654)],
    ['administración incluida', anio(2_300_000, 300_000, { adminIncluidaEnCanon: true })],
    ['con retención del arrendatario', anio(2_000_000, 300_000, { arrendatarioEsAgenteRetencion: true })],
    ['honorarios pactados al 7,5 %', anio(1_777_777, 123_456, { honorariosPct: 0.075 })],
  ];

  for (const [nombre, meses] of casos) {
    it(`cuadra con ${nombre}`, () => {
      const c = certificar(ALTORRA, DUENO, meses);
      // Todo lo cobrado en el año tiene que estar en alguna de las cuatro bolsas del certificado.
      const cobrado = meses.reduce((t, m) => t + m.liquidacion.cobroAlArrendatario, 0);
      expect(c.netoGirado + c.pagosPorSuCuenta + c.retencionesPracticadas).toBe(cobrado);
      // Y el ingreso del propietario es lo cobrado menos lo que era de la copropiedad.
      expect(c.ingresosRecibidos).toBe(cobrado - c.detallePagos.cuotaCopropiedad);
    });
  }

  it('todas las cifras son enteros', () => {
    const c = certificar(ALTORRA, DUENO, anio(1_333_333, 77_777));
    for (const v of [c.ingresosRecibidos, c.pagosPorSuCuenta, c.retencionesPracticadas, c.netoGirado]) {
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});

describe('🎯 no confía en el orden de entrada', () => {
  it('ordena los períodos aunque lleguen al revés', () => {
    const desordenado = [...anio(1_000_000)].reverse();
    const c = certificar(ALTORRA, DUENO, desordenado);
    expect(c.desde).toBe('2026-01');
    expect(c.hasta).toBe('2026-12');
    expect(c.periodos[0]).toBe('2026-01');
  });

  it('los totales no dependen del orden', () => {
    const a = certificar(ALTORRA, DUENO, anio(1_333_333, 55_555));
    const b = certificar(ALTORRA, DUENO, [...anio(1_333_333, 55_555)].reverse());
    expect(b.netoGirado).toBe(a.netoGirado);
    expect(b.ingresosRecibidos).toBe(a.ingresosRecibidos);
  });
});

describe('problemasDeCertificacion', () => {
  const sano = certificar(ALTORRA, DUENO, anio(1_500_000));

  it('acepta un certificado sano', () => {
    expect(problemasDeCertificacion(sano)).toEqual([]);
  });

  it('🔴 caza el mes REPETIDO, que es el que hace daño en silencio', () => {
    const meses = anio(1_000_000);
    meses.push(meses[3]); // marzo dos veces
    const c = certificar(ALTORRA, DUENO, meses);
    expect(problemasDeCertificacion(c)).toContain('periodos-repetidos');
  });

  it('exige el documento de las dos partes', () => {
    expect(
      problemasDeCertificacion(certificar(ALTORRA, { nombre: 'X', documento: '  ' }, anio(1_000_000))),
    ).toContain('mandante-sin-documento');
    expect(
      problemasDeCertificacion(certificar({ nombre: 'A', documento: '' }, DUENO, anio(1_000_000))),
    ).toContain('mandatario-sin-documento');
  });

  it('caza un período con forma inválida, incluido el mes 13', () => {
    for (const malo of ['2026-13', '2026-00', '202601', '2026-1']) {
      const c = certificar(ALTORRA, DUENO, [
        { periodo: malo, liquidacion: liquidarPeriodo({ canon: 1_000_000 }) },
      ]);
      expect(problemasDeCertificacion(c), malo).toContain('periodo-invalido');
    }
  });

  it('caza el certificado vacío', () => {
    expect(problemasDeCertificacion(certificar(ALTORRA, DUENO, []))).toContain('sin-periodos');
  });

  it('cada problema se explica en castellano', () => {
    for (const c of [
      'sin-periodos',
      'mandante-sin-documento',
      'mandatario-sin-documento',
      'periodo-invalido',
      'periodos-repetidos',
      'neto-negativo',
    ]) {
      expect(explicarProblemaCertificacion(c).length).toBeGreaterThan(25);
      expect(explicarProblemaCertificacion(c)).not.toContain(c);
    }
    expect(explicarProblemaCertificacion('vaya-usted-a-saber').length).toBeGreaterThan(10);
  });
});

describe('mesesFaltantes — un año con huecos tiene que DECIRLO', () => {
  it('un año completo no tiene huecos', () => {
    expect(mesesFaltantes(certificar(ALTORRA, DUENO, anio(1_000_000)))).toEqual([]);
  });

  it('nombra los meses ausentes, en orden', () => {
    const meses = anio(1_000_000).filter((m) => !['2026-04', '2026-07'].includes(m.periodo));
    expect(mesesFaltantes(certificar(ALTORRA, DUENO, meses))).toEqual(['2026-04', '2026-07']);
  });

  it('cruza el cambio de año sin perderse', () => {
    const meses: MesCertificado[] = [
      { periodo: '2025-11', liquidacion: liquidarPeriodo({ canon: 1_000_000 }) },
      { periodo: '2026-02', liquidacion: liquidarPeriodo({ canon: 1_000_000 }) },
    ];
    expect(mesesFaltantes(certificar(ALTORRA, DUENO, meses))).toEqual(['2025-12', '2026-01']);
  });

  it('con un solo mes no inventa huecos', () => {
    const c = certificar(ALTORRA, DUENO, [
      { periodo: '2026-05', liquidacion: liquidarPeriodo({ canon: 1_000_000 }) },
    ]);
    expect(mesesFaltantes(c)).toEqual([]);
  });
});
