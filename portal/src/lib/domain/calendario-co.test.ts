import { describe, expect, it } from 'vitest';
import {
  diasHabiles,
  esFestivo,
  esHabil,
  explicarNoContacto,
  festivos,
  motivoNoContacto,
  pascua,
  puedeContactar,
} from './calendario-co';

const dow = (f: string) => new Date(`${f}T00:00:00Z`).getUTCDay();

describe('pascua — aritmética exacta, no una tabla', () => {
  it('acierta domingos de Pascua conocidos', () => {
    expect(pascua(2024).toISOString().slice(0, 10)).toBe('2024-03-31');
    expect(pascua(2025).toISOString().slice(0, 10)).toBe('2025-04-20');
    expect(pascua(2026).toISOString().slice(0, 10)).toBe('2026-04-05');
    expect(pascua(2027).toISOString().slice(0, 10)).toBe('2027-03-28');
  });

  it('la Pascua SIEMPRE cae en domingo, en cualquier año', () => {
    for (let a = 2020; a <= 2060; a++) {
      expect(pascua(a).getUTCDay(), String(a)).toBe(0);
    }
  });
});

describe('🔒 EL INVARIANTE: los festivos emilianistas SIEMPRE caen en lunes', () => {
  /*
   * Es la prueba que valida el algoritmo entero sin necesitar una lista externa. Si un emilianista
   * cae en martes, el desplazamiento al lunes está mal calculado — y no habría forma de notarlo
   * mirando una fecha suelta.
   */
  const FIJOS_NO_MOVIBLES = ['-01-01', '-05-01', '-07-20', '-08-07', '-12-08', '-12-25'];

  for (let a = 2024; a <= 2040; a++) {
    it(`${a}: cada festivo es o fijo, o de Semana Santa, o LUNES`, () => {
      const p = pascua(a).toISOString().slice(0, 10);
      const jueves = new Date(pascua(a).getTime() - 3 * 86_400_000).toISOString().slice(0, 10);
      const viernes = new Date(pascua(a).getTime() - 2 * 86_400_000).toISOString().slice(0, 10);
      for (const f of festivos(a)) {
        const esFijo = FIJOS_NO_MOVIBLES.some((s) => f.endsWith(s));
        const esSemanaSanta = f === jueves || f === viernes;
        if (!esFijo && !esSemanaSanta) {
          expect(dow(f), `${f} (Pascua ${p})`).toBe(1);
        }
      }
    });
  }
});

describe('festivos — la lista de un año', () => {
  it('🔴 son 18 CELEBRACIONES, pero no siempre 18 FECHAS', () => {
    // Lo destapó esta misma prueba, que al principio exigía 18 clavados y 2025 daba 17.
    for (let a = 2024; a <= 2035; a++) {
      expect(festivos(a).length, String(a)).toBeGreaterThanOrEqual(17);
      expect(festivos(a).length, String(a)).toBeLessThanOrEqual(18);
    }
  });

  it('🎯 2025: San Pedro (domingo 29-jun) se corre al lunes 30 y CHOCA con el Sagrado Corazón', () => {
    expect(dow('2025-06-29')).toBe(0); // domingo ⇒ Emiliani lo mueve al 30
    const f = festivos(2025);
    expect(f).toContain('2025-06-30');
    expect(f).not.toContain('2025-06-29');
    expect(f.length).toBe(17); // dos celebraciones, UNA fecha
  });

  it('2025 coincide con el calendario oficial, día por día', () => {
    expect(festivos(2025)).toEqual([
      '2025-01-01', '2025-01-06', '2025-03-24', '2025-04-17', '2025-04-18', '2025-05-01',
      '2025-06-02', '2025-06-23', '2025-06-30', '2025-07-20', '2025-08-07', '2025-08-18',
      '2025-10-13', '2025-11-03', '2025-11-17', '2025-12-08', '2025-12-25',
    ]);
  });

  it('vienen ordenados y sin repetidos', () => {
    const f = festivos(2026);
    expect([...f].sort()).toEqual(f);
    expect(new Set(f).size).toBe(f.length);
  });

  it('2026: los de Semana Santa y los movibles caen donde deben', () => {
    const f = festivos(2026);
    expect(f).toContain('2026-04-02'); // Jueves Santo
    expect(f).toContain('2026-04-03'); // Viernes Santo
    expect(f).toContain('2026-01-01');
    expect(f).toContain('2026-12-25');
    // Reyes: el 6 de enero de 2026 es martes ⇒ se corre al lunes 12.
    expect(dow('2026-01-06')).toBe(2);
    expect(f).toContain('2026-01-12');
    expect(f).not.toContain('2026-01-06');
  });

  it('cuando un emilianista YA cae en lunes, no se mueve', () => {
    // 2027-11-01 (Todos los Santos) es lunes: debe quedarse.
    expect(dow('2027-11-01')).toBe(1);
    expect(festivos(2027)).toContain('2027-11-01');
  });
});

describe('esFestivo / esHabil', () => {
  it('reconoce un festivo y un día normal', () => {
    expect(esFestivo('2026-01-01')).toBe(true);
    expect(esFestivo('2026-01-02')).toBe(false);
  });

  it('un festivo NO es hábil, aunque caiga entre semana', () => {
    expect(dow('2026-01-01')).toBe(4); // jueves
    expect(esHabil('2026-01-01')).toBe(false);
  });

  it('sábado y domingo no son hábiles', () => {
    expect(esHabil('2026-08-29')).toBe(false); // sábado
    expect(esHabil('2026-08-30')).toBe(false); // domingo
    expect(esHabil('2026-08-28')).toBe(true); // viernes
  });

  it('no explota con basura', () => {
    expect(esHabil('no-es-fecha')).toBe(false);
    expect(esFestivo('')).toBe(false);
  });
});

describe('🎯 diasHabiles — ahora SÍ descuenta festivos', () => {
  it('la semana de Semana Santa 2026 pierde dos días', () => {
    // Lunes 2026-03-30 → lunes 2026-04-06. Sin festivos serían 5 hábiles; con jueves y viernes
    // santos, 3. Es exactamente el error que obligaba a poner un día de margen en §170.
    expect(diasHabiles('2026-03-30', '2026-04-06')).toBe(3);
  });

  it('una semana normal da 5', () => {
    expect(diasHabiles('2026-08-24', '2026-08-31')).toBe(5);
  });

  it('mismo día o hacia atrás es cero', () => {
    expect(diasHabiles('2026-08-24', '2026-08-24')).toBe(0);
    expect(diasHabiles('2026-08-24', '2026-08-20')).toBe(0);
  });
});

describe('🔴 Ley 2300 — la ventana de contacto comercial', () => {
  it('un martes a las 10 se puede', () => {
    expect(puedeContactar('2026-08-25', 10)).toBe(true);
  });

  it('DOMINGO no, a ninguna hora', () => {
    for (const h of [8, 12, 18]) {
      expect(motivoNoContacto('2026-08-30', h)).toBe('domingo');
    }
  });

  it('FESTIVO no, aunque sea martes por la mañana', () => {
    expect(motivoNoContacto('2026-01-12', 10)).toBe('festivo'); // Reyes corrido al lunes… 12-ene
  });

  it('entre semana: 7:00 sí, 6:59 no, 19:00 no', () => {
    expect(puedeContactar('2026-08-25', 7)).toBe(true);
    expect(motivoNoContacto('2026-08-25', 6)).toBe('fuera-de-horario');
    expect(motivoNoContacto('2026-08-25', 19)).toBe('fuera-de-horario');
    expect(puedeContactar('2026-08-25', 18)).toBe(true);
  });

  it('sábado: la ventana es más corta — 8:00 a 15:00', () => {
    expect(motivoNoContacto('2026-08-29', 7)).toBe('fuera-de-horario');
    expect(puedeContactar('2026-08-29', 8)).toBe(true);
    expect(puedeContactar('2026-08-29', 14)).toBe(true);
    expect(motivoNoContacto('2026-08-29', 15)).toBe('fuera-de-horario');
  });

  it('🚨 la 1 de la madrugada NUNCA — que es cuando dispararía un `every 6 hours`', () => {
    expect(motivoNoContacto('2026-08-25', 1)).toBe('fuera-de-horario');
    expect(motivoNoContacto('2026-08-26', 1)).toBe('fuera-de-horario');
  });

  it('cada motivo se explica citando la ley', () => {
    for (const m of ['domingo', 'festivo', 'fuera-de-horario'] as const) {
      expect(explicarNoContacto(m)).toContain('2300');
      expect(explicarNoContacto(m).length).toBeGreaterThan(40);
    }
  });
});
