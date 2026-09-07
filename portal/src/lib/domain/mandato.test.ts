import { describe, expect, it } from 'vitest';
import { diasHabiles } from './calendario-co';
import {
  DIAS_RETRACTO_HABILES,
  explicarProblemaMandato,
  mover,
  problemasParaLiberar,
  retractoVencido,
  saldoEnContra,
  urgencia,
  type EstadoMandato,
  type Mandato,
  type Transicion,
} from './mandato';

const m = (estado: EstadoMandato, extra: Partial<Mandato> = {}): Mandato => ({
  id: 'MDT-001',
  estado,
  monto: 2_300_000,
  ...extra,
});

describe('diasHabiles — el dueño es `calendario-co`, aquí solo se comprueba el enganche', () => {
  it('🎯 ahora DESCUENTA festivos: la Semana Santa de 2026 quita dos días', () => {
    // Antes de §172 esta cuenta daba 5 y por eso `retractoVencido` sumaba un día de margen.
    expect(diasHabiles('2026-03-30', '2026-04-06')).toBe(3);
  });
});

describe('retractoVencido — SIN margen, porque ya hay calendario (§172)', () => {
  it('🎯 a los 5 hábiles VENCE: ni un día más, que sería retener dinero sin causa', () => {
    // lunes 2026-08-24 + 5 hábiles = lunes 2026-08-31, y no hay festivo en medio.
    expect(diasHabiles('2026-08-24', '2026-08-31')).toBe(DIAS_RETRACTO_HABILES);
    expect(retractoVencido('2026-08-24', '2026-08-31')).toBe(true);
  });

  it('al cuarto hábil todavía NO vence', () => {
    expect(retractoVencido('2026-08-24', '2026-08-28')).toBe(false);
  });

  it('🔴 con un festivo en medio, el plazo se ESTIRA — que es justo lo que el margen tapaba', () => {
    // Del jueves 2026-12-03 al jueves 2026-12-10 hay 5 días de semana, pero el 8 es festivo:
    // solo 4 hábiles, así que el retracto sigue corriendo.
    expect(diasHabiles('2026-12-03', '2026-12-10')).toBe(4);
    expect(retractoVencido('2026-12-03', '2026-12-10')).toBe(false);
    expect(retractoVencido('2026-12-03', '2026-12-11')).toBe(true);
  });

  it('el día siguiente a la aprobación nunca vence', () => {
    expect(retractoVencido('2026-08-24', '2026-08-25')).toBe(false);
  });
});

describe('🔑 liberar es una DECISIÓN, no el efecto de un webhook', () => {
  it('no se libera lo que no está retenido', () => {
    for (const e of ['esperando', 'liberado', 'reversado', 'fallido'] as const) {
      expect(problemasParaLiberar(m(e, { aprobadoEl: '2026-08-01' }), '2026-09-01')).toContain(
        'no-esta-retenido',
      );
    }
  });

  it('🔴 NO se libera mientras corre el retracto, aunque el pago esté aprobado', () => {
    const p = problemasParaLiberar(m('retenido', { aprobadoEl: '2026-08-24' }), '2026-08-26');
    expect(p).toContain('retracto-vigente');
    expect(mover(m('retenido', { aprobadoEl: '2026-08-24' }), 'liberar', '2026-08-26').ok).toBe(false);
  });

  it('se libera cuando ya venció', () => {
    const r = mover(m('retenido', { aprobadoEl: '2026-08-24' }), 'liberar', '2026-09-01');
    expect(r.ok).toBe(true);
    expect(r.mandato.estado).toBe('liberado');
    expect(r.mandato.giradoEl).toBe('2026-09-01');
  });

  it('sin fecha de aprobación no se puede saber, así que no se libera', () => {
    expect(problemasParaLiberar(m('retenido'), '2026-09-01')).toContain('sin-fecha-de-aprobacion');
  });

  it('no libera un monto inválido', () => {
    const malo = m('retenido', { aprobadoEl: '2026-08-01', monto: 0 });
    expect(problemasParaLiberar(malo, '2026-09-01')).toContain('monto-invalido');
  });
});

describe('la máquina de estados', () => {
  const casos: Array<[EstadoMandato, Transicion, boolean]> = [
    ['esperando', 'aprobar', true],
    ['esperando', 'fallar', true],
    ['esperando', 'reversar', true],
    ['esperando', 'liberar', false],
    ['retenido', 'reversar', true],
    ['retenido', 'aprobar', false],
    ['retenido', 'fallar', false],
    ['liberado', 'reversar', true], // 🔴 el caso que nadie modela
    ['liberado', 'liberar', false],
    ['reversado', 'reversar', false],
    ['reversado', 'liberar', false],
    ['fallido', 'aprobar', false],
  ];

  for (const [estado, t, permitida] of casos) {
    it(`${estado} --${t}--> ${permitida ? 'se permite' : 'se rechaza'}`, () => {
      const r = mover(m(estado, { aprobadoEl: '2026-08-01' }), t, '2026-09-01');
      expect(r.ok).toBe(permitida);
      if (!permitida && t !== 'liberar') {
        expect(r.problemas[0]).toContain('transicion-invalida');
      }
    });
  }

  it('NO muta el mandato que recibe', () => {
    const antes = m('esperando');
    const copia = structuredClone(antes);
    mover(antes, 'aprobar', '2026-09-01');
    expect(antes).toEqual(copia);
  });

  it('aprobar sella la fecha desde la que corre el retracto', () => {
    const r = mover(m('esperando'), 'aprobar', '2026-08-24');
    expect(r.mandato.estado).toBe('retenido');
    expect(r.mandato.aprobadoEl).toBe('2026-08-24');
  });
});

describe('🔴 saldoEnContra — la razón de que `liberado → reversado` exista', () => {
  it('reversar ANTES de girar no deja deuda: es el caso barato', () => {
    const r = mover(m('retenido', { aprobadoEl: '2026-08-24' }), 'reversar', '2026-08-26');
    expect(r.ok).toBe(true);
    expect(saldoEnContra(r.mandato)).toBe(0);
  });

  it('reversar DESPUÉS de girar deja el monto entero por recuperar', () => {
    const liberado = mover(m('retenido', { aprobadoEl: '2026-08-24' }), 'liberar', '2026-09-01').mandato;
    const reversado = mover(liberado, 'reversar', '2026-09-10').mandato;
    expect(reversado.estado).toBe('reversado');
    expect(saldoEnContra(reversado)).toBe(2_300_000);
  });

  it('los dos «reversado» NO son iguales, y por eso hace falta la función', () => {
    const aTiempo = mover(m('retenido', { aprobadoEl: '2026-08-24' }), 'reversar', '2026-08-26').mandato;
    const tarde = mover(
      mover(m('retenido', { aprobadoEl: '2026-08-24' }), 'liberar', '2026-09-01').mandato,
      'reversar',
      '2026-09-10',
    ).mandato;
    expect(aTiempo.estado).toBe(tarde.estado); // el estado no los distingue…
    expect(saldoEnContra(aTiempo)).not.toBe(saldoEnContra(tarde)); // …el saldo sí
  });
});

describe('urgencia — qué mirar primero', () => {
  it('la plata fuera va SIEMPRE primero', () => {
    const conDeuda = mover(
      mover(m('retenido', { aprobadoEl: '2026-08-24' }), 'liberar', '2026-09-01').mandato,
      'reversar',
      '2026-09-10',
    ).mandato;
    expect(urgencia(conDeuda, '2026-09-11')).toBe(100);
  });

  it('lo retenido con el retracto ya vencido pesa más que lo retenido fresco', () => {
    const vencido = urgencia(m('retenido', { aprobadoEl: '2026-08-24' }), '2026-09-01');
    const fresco = urgencia(m('retenido', { aprobadoEl: '2026-08-24' }), '2026-08-25');
    expect(vencido).toBeGreaterThan(fresco);
  });

  it('lo terminal no pide nada', () => {
    expect(urgencia(m('fallido'), '2026-09-01')).toBe(0);
    expect(urgencia(m('liberado', { giradoEl: '2026-09-01' }), '2026-09-02')).toBe(0);
  });

  it('ordena una bandeja de trabajo de mayor a menor', () => {
    const conDeuda = mover(
      mover(m('retenido', { aprobadoEl: '2026-08-24' }), 'liberar', '2026-09-01').mandato,
      'reversar',
      '2026-09-10',
    ).mandato;
    const lista = [
      m('esperando'),
      m('retenido', { aprobadoEl: '2026-08-24' }),
      conDeuda,
      m('fallido'),
    ];
    const orden = [...lista].sort((a, b) => urgencia(b, '2026-09-11') - urgencia(a, '2026-09-11'));
    expect(saldoEnContra(orden[0])).toBeGreaterThan(0);
    expect(orden[orden.length - 1].estado).toBe('fallido');
  });
});

describe('explicarProblemaMandato', () => {
  it('el retracto se explica con su plazo y su consecuencia', () => {
    const t = explicarProblemaMandato('retracto-vigente');
    expect(t).toContain(String(DIAS_RETRACTO_HABILES));
    expect(t).toContain('1480');
  });

  it('una transición inválida dice desde dónde se intentó', () => {
    expect(explicarProblemaMandato('transicion-invalida:liberado->liberar')).toContain('liberado');
  });

  it('todos los códigos tienen texto, y el desconocido también', () => {
    for (const c of ['no-esta-retenido', 'sin-fecha-de-aprobacion', 'monto-invalido']) {
      expect(explicarProblemaMandato(c).length).toBeGreaterThan(20);
    }
    expect(explicarProblemaMandato('vaya-usted-a-saber').length).toBeGreaterThan(10);
  });
});
