import { describe, expect, it } from 'vitest';
import { digitosDe, numeroWhatsApp, telefonoValido } from './telefono';

describe('telefonoValido — cómo escribe la gente un número', () => {
  it('acepta las formas habituales, puntos incluidos (§330)', () => {
    for (const t of [
      '300 123 4567',
      '300.123.4567',
      '3001234567',
      '+57 300 123 4567',
      '+57 300-123-4567',
      '(+57) 300 1234567',
      '605 660 1234',
      '660 1234',
      '+1 (305) 555-0100',
      '  300 123 4567  ',
    ]) {
      expect(telefonoValido(t), t).toBe(true);
    }
  });

  it('rechaza lo que no es un número aunque tenga la forma', () => {
    for (const t of ['', '(((((((', '+------', '30012', 'abc 123 4567', '300 123 4567 ext 2', '1234567890123456', 'https://x.co']) {
      expect(telefonoValido(t), t).toBe(false);
    }
  });

  it('cuenta los dígitos, no los caracteres', () => {
    expect(digitosDe('+57 (300) 123.45-67')).toBe('573001234567');
  });
});

describe('numeroWhatsApp — el número que entiende wa.me', () => {
  it('un móvil colombiano sin prefijo recibe el 57 (era el enlace roto del panel)', () => {
    expect(numeroWhatsApp('300 123 4567')).toBe('573001234567');
    expect(numeroWhatsApp('300.123.4567')).toBe('573001234567');
  });

  it('un fijo con el 60 de la marcación nueva también es colombiano', () => {
    expect(numeroWhatsApp('605 660 1234')).toBe('576056601234');
  });

  it('si ya trae el país, no se le duplica', () => {
    expect(numeroWhatsApp('+57 300 123 4567')).toBe('573001234567');
    expect(numeroWhatsApp('573001234567')).toBe('573001234567');
    expect(numeroWhatsApp('(+57) 300 1234567')).toBe('573001234567');
    expect(numeroWhatsApp('0057 300 123 4567')).toBe('573001234567');
  });

  it('un número extranjero con «+» se respeta tal cual', () => {
    expect(numeroWhatsApp('+1 (305) 555-0100')).toBe('13055550100');
  });

  it('no adivina el país: un fijo viejo de 7 dígitos o un número raro no da enlace', () => {
    expect(numeroWhatsApp('660 1234')).toBeNull();
    expect(numeroWhatsApp('12345678')).toBeNull();
    expect(numeroWhatsApp('57123')).toBeNull();
    expect(numeroWhatsApp('')).toBeNull();
  });
});
