import { describe, expect, it } from 'vitest';
import {
  accesosDe,
  aFecha,
  cuandoEs,
  hayMas,
  quienEs,
  TOPE_BITACORA,
  VERBO,
  type EntradaCruda,
} from './bitacora';

const marca = (iso: string) => ({ toDate: () => new Date(iso) });

const cruda = (extra: Partial<EntradaCruda> = {}): EntradaCruda => ({
  accion: 'documento-abierto',
  email: 'daniel@altorrainmobiliaria.co',
  rol: 'super_admin',
  objetivo: 'DOC-1',
  creadoEn: marca('2026-03-12T14:42:00Z'),
  ...extra,
});

describe('aFecha', () => {
  it('desenvuelve la marca de Firestore', () => {
    expect(aFecha(marca('2026-03-12T14:42:00Z'))?.toISOString()).toBe('2026-03-12T14:42:00.000Z');
  });

  it('acepta un Date tal cual', () => {
    const d = new Date('2026-03-12T14:42:00Z');
    expect(aFecha(d)).toBe(d);
  });

  it('un serverTimestamp aún sin resolver da null, no una fecha inventada', () => {
    expect(aFecha(null)).toBeNull();
    expect(aFecha(undefined)).toBeNull();
  });

  it('una marca rota no tumba la pantalla', () => {
    expect(aFecha({ toDate: () => { throw new Error('rota'); } })).toBeNull();
    expect(aFecha({ toDate: () => new Date('no es fecha') })).toBeNull();
    expect(aFecha(new Date('tampoco'))).toBeNull();
  });
});

describe('quienEs', () => {
  it('manda el correo y el rol va detrás', () => {
    expect(quienEs(cruda())).toBe('daniel@altorrainmobiliaria.co · Administrador');
  });

  it('traduce los tres roles a lo que se lee en pantalla', () => {
    expect(quienEs(cruda({ rol: 'editor' }))).toContain('Editor');
    expect(quienEs(cruda({ rol: 'viewer' }))).toContain('Solo consulta');
  });

  it('un rol desconocido se enseña tal cual en vez de desaparecer', () => {
    expect(quienEs(cruda({ rol: 'auditor_externo' }))).toBe(
      'daniel@altorrainmobiliaria.co · auditor_externo',
    );
  });

  it('sin correo NO deja el hueco: una fila sin autor da más miedo que una rara', () => {
    expect(quienEs(cruda({ email: null }))).toBe('Cuenta sin correo · Administrador');
    expect(quienEs(cruda({ email: '   ', rol: null }))).toBe('Cuenta sin correo');
  });
});

describe('accesosDe', () => {
  it('deja solo lo de ESTE documento, aunque la consulta traiga de más', () => {
    const r = accesosDe('DOC-1', [cruda(), cruda({ objetivo: 'DOC-2' })]);
    expect(r).toHaveLength(1);
  });

  it('descarta acciones que no son de la bóveda', () => {
    // `acceso` (entrar al panel) también vive en auditLog y no pinta nada aquí.
    expect(accesosDe('DOC-1', [cruda({ accion: 'acceso' })])).toEqual([]);
    expect(accesosDe('DOC-1', [cruda({ accion: undefined })])).toEqual([]);
  });

  it('reconoce abrir y retirar, que son dos hechos distintos', () => {
    const r = accesosDe('DOC-1', [cruda(), cruda({ accion: 'documento-retirado' })]);
    expect(r.map((a) => a.accion).sort()).toEqual(['documento-abierto', 'documento-retirado']);
  });

  it('ordena de lo más reciente a lo más viejo', () => {
    const r = accesosDe('DOC-1', [
      cruda({ creadoEn: marca('2026-01-01T10:00:00Z'), detalle: 'viejo' }),
      cruda({ creadoEn: marca('2026-03-12T10:00:00Z'), detalle: 'nuevo' }),
    ]);
    expect(r.map((a) => a.detalle)).toEqual(['nuevo', 'viejo']);
  });

  it('lo que aún no tiene fecha va al FINAL: es escritura en vuelo, no historia', () => {
    const r = accesosDe('DOC-1', [
      cruda({ creadoEn: null, detalle: 'en vuelo' }),
      cruda({ creadoEn: marca('2026-01-01T10:00:00Z'), detalle: 'con fecha' }),
    ]);
    expect(r.map((a) => a.detalle)).toEqual(['con fecha', 'en vuelo']);
  });

  it('el detalle vacío se normaliza a null, no a una cadena en blanco', () => {
    expect(accesosDe('DOC-1', [cruda({ detalle: '   ' })])[0].detalle).toBeNull();
  });

  it('una bitácora vacía es una lista vacía, no un fallo', () => {
    expect(accesosDe('DOC-1', [])).toEqual([]);
  });
});

describe('cuandoEs', () => {
  it('escribe la hora de COLOMBIA, no la del navegador de quien mira', () => {
    // 14:42 UTC son las 9:42 a. m. en Cartagena (UTC−5).
    expect(cuandoEs(new Date('2026-03-12T14:42:00Z'))).toBe('12 de marzo de 2026, 9:42 a. m.');
  });

  it('el mediodía es 12 p. m. y la medianoche 12 a. m.', () => {
    expect(cuandoEs(new Date('2026-03-12T17:00:00Z'))).toContain('12:00 p. m.');
    expect(cuandoEs(new Date('2026-03-12T05:00:00Z'))).toContain('12:00 a. m.');
  });

  it('cruza el día hacia atrás cuando toca', () => {
    // 02:00 UTC del 13 son las 9 p. m. del 12 en Cartagena.
    expect(cuandoEs(new Date('2026-03-13T02:00:00Z'))).toBe('12 de marzo de 2026, 9:00 p. m.');
  });

  it('sin fecha dice «hace un momento» en vez de mentir con una', () => {
    expect(cuandoEs(null)).toBe('hace un momento');
  });
});

describe('hayMas', () => {
  it('avisa cuando llegaron justo las que se pidieron', () => {
    expect(hayMas(TOPE_BITACORA)).toBe(true);
  });

  it('con menos de las pedidas, se acabaron de verdad', () => {
    expect(hayMas(TOPE_BITACORA - 1)).toBe(false);
    expect(hayMas(0)).toBe(false);
  });
});

describe('VERBO', () => {
  it('cada acción de la bóveda tiene su verbo', () => {
    expect(VERBO['documento-abierto']).toBe('Abrió');
    expect(VERBO['documento-retirado']).toBe('Retiró');
  });
});
