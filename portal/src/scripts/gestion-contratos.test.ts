import { describe, expect, it } from 'vitest';
import { hoyISO, textoPlazo, tonoDeUrgencia } from './gestion-contratos';

// Pantalla de contratos (§114). Se prueba lo PURO: cómo se lee un plazo y qué pide atención. Lo
// primero importa porque «hace 3 días» y «en 3 días» son cosas distintas y la lista tiene que notarlo.

describe('textoPlazo — el pasado y el futuro no se leen igual', () => {
  it('distingue vencido de próximo', () => {
    expect(textoPlazo(-5)).toBe('hace 5 días');
    expect(textoPlazo(-1)).toBe('ayer');
    expect(textoPlazo(0)).toBe('hoy');
    expect(textoPlazo(1)).toBe('mañana');
    expect(textoPlazo(9)).toBe('en 9 días');
  });

  it('pasa a meses cuando los días dejan de decir algo', () => {
    expect(textoPlazo(60)).toBe('en 2 meses');
    expect(textoPlazo(31)).toBe('en 31 días');
    expect(textoPlazo(35)).toBe('en 1 mes');
  });

  it('nunca sale «undefined» ni una cadena vacía', () => {
    for (const d of [-400, -2, 0, 2, 120, 400]) {
      expect(textoPlazo(d).length).toBeGreaterThan(2);
      expect(textoPlazo(d)).not.toContain('undefined');
    }
  });
});

describe('tonoDeUrgencia — oro pide acción, navy está en reposo', () => {
  it('lo vencido, lo de hoy y lo de esta semana piden acción', () => {
    for (const u of ['vencido', 'hoy', 'semana'] as const) expect(tonoDeUrgencia(u)).toBe('gold');
  });

  it('lo lejano no grita', () => {
    for (const u of ['mes', 'despues'] as const) expect(tonoDeUrgencia(u)).toBe('navy');
  });

  it('🎨 nunca hay rojo ni verde: no están en la paleta', () => {
    const tonos = new Set((['vencido', 'hoy', 'semana', 'mes', 'despues'] as const).map(tonoDeUrgencia));
    expect([...tonos].sort()).toEqual(['gold', 'navy']);
  });
});

describe('hoyISO', () => {
  it('da la fecha en UTC, el mismo huso que usa la agenda', () => {
    expect(hoyISO(new Date('2026-08-22T23:30:00.000Z'))).toBe('2026-08-22');
    expect(hoyISO(new Date('2026-01-01T00:00:00.000Z'))).toBe('2026-01-01');
  });
});
