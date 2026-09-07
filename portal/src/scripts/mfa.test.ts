/*
 * Pruebas de la parte PURA del segundo factor.
 *
 * Lo que se puede probar sin Firebase es poco pero es justo lo que se rompe en silencio: reconocer el
 * error que pide el código, y limpiar lo que la persona escribe. Lo demás —generar el secreto,
 * validar el código— lo decide el servidor de Identity Platform y probarlo aquí sería probar un
 * simulacro, que es la clase de prueba que pasa siempre y no protege de nada.
 */
import { describe, expect, it } from 'vitest';
import { explicarSegundoFactor, limpiarCodigo, pideSegundoFactor } from './mfa';

describe('pideSegundoFactor', () => {
  it('reconoce el error que Firebase lanza cuando falta el código', () => {
    expect(pideSegundoFactor({ code: 'auth/multi-factor-auth-required' })).toBe(true);
  });

  it('NO confunde una contraseña mala con un segundo factor pendiente', () => {
    // Es la distinción que importa: tratar uno como el otro fue lo que dejó al dueño fuera del
    // panel con la contraseña correcta escrita (§136).
    expect(pideSegundoFactor({ code: 'auth/invalid-credential' })).toBe(false);
    expect(pideSegundoFactor({ code: 'auth/too-many-requests' })).toBe(false);
  });

  it('aguanta lo que no es un error de Firebase', () => {
    expect(pideSegundoFactor(null)).toBe(false);
    expect(pideSegundoFactor(undefined)).toBe(false);
    expect(pideSegundoFactor('auth/multi-factor-auth-required')).toBe(false);
    expect(pideSegundoFactor(new Error('boom'))).toBe(false);
  });

  it('no se fía del MENSAJE, solo del código', () => {
    // El texto cambia entre versiones y traduce distinto según el idioma del navegador. Una
    // comparación por texto se rompería sin que nadie se entere.
    expect(pideSegundoFactor({ message: 'multi-factor auth required' })).toBe(false);
  });
});

describe('limpiarCodigo', () => {
  it('deja pasar un código normal', () => {
    expect(limpiarCodigo('492118')).toBe('492118');
  });

  it('quita el espacio con que los gestores de contraseñas parten el código', () => {
    // Sin esto, un código CORRECTO se rechaza y la culpa parece de quien lo escribió.
    expect(limpiarCodigo('492 118')).toBe('492118');
    expect(limpiarCodigo('492-118')).toBe('492118');
    expect(limpiarCodigo('  492118  ')).toBe('492118');
  });

  it('corta a seis y descarta lo que no sean dígitos', () => {
    expect(limpiarCodigo('4921189999')).toBe('492118');
    expect(limpiarCodigo('abc492118')).toBe('492118');
  });

  it('con un código incompleto devuelve lo que hay, sin inventar', () => {
    expect(limpiarCodigo('492')).toBe('492');
    expect(limpiarCodigo('')).toBe('');
    expect(limpiarCodigo('----')).toBe('');
  });
});

describe('explicarSegundoFactor', () => {
  it('distingue «código equivocado» de «código vencido»', () => {
    const [malo] = explicarSegundoFactor('auth/invalid-verification-code');
    const [viejo] = explicarSegundoFactor('auth/code-expired');
    expect(malo).not.toBe(viejo);
  });

  it('el caso desconocido apunta al culpable REAL más frecuente: la hora del teléfono', () => {
    // Un TOTP que falla «sin motivo» casi siempre es un reloj desincronizado. Decir «error
    // inesperado» manda a buscar el problema donde no está.
    const [, detalle] = explicarSegundoFactor('auth/algo-que-no-existe');
    expect(detalle).toMatch(/hora/i);
  });

  it('cada mensaje dice qué hacer, no solo qué pasó', () => {
    const codigos = [
      'auth/invalid-verification-code',
      'auth/code-expired',
      'auth/totp-challenge-timeout',
      'auth/requires-recent-login',
      'auth/second-factor-already-in-use',
      'auth/maximum-second-factor-count-exceeded',
      'auth/network-request-failed',
      'auth/too-many-requests',
      'auth/operation-not-allowed',
      '',
    ];
    for (const c of codigos) {
      const [titulo, detalle] = explicarSegundoFactor(c);
      expect(titulo.length, `título vacío para ${c}`).toBeGreaterThan(3);
      expect(detalle.length, `detalle vacío para ${c}`).toBeGreaterThan(20);
      expect(detalle, `${c} no es accionable`).not.toMatch(/error inesperado/i);
    }
  });
});
