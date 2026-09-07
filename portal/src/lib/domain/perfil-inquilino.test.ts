import { describe, expect, it } from 'vitest';
import {
  claveSoporte,
  diasDeVigencia,
  diasEsperando,
  ESTADOS,
  explicar,
  faltantes,
  NOMBRE_ESTADO,
  NOMBRE_REQUISITO,
  OBLIGATORIOS,
  problemasAlCambiar,
  problemasParaEnviar,
  QUE_SIRVE,
  REQUISITOS,
  slaVencido,
  TRANSICIONES,
  vigente,
  type EstadoPerfil,
  type PerfilInquilino,
  type Requisito,
} from './perfil-inquilino';

const sop = (requisito: Requisito) => ({
  requisito,
  claveStorage: `perfiles/U1/${requisito}.pdf`,
  nombreArchivo: `${requisito}.pdf`,
  subidoEn: '2026-08-01T00:00:00.000Z',
});

const perfil = (extra: Partial<PerfilInquilino> = {}): PerfilInquilino => ({
  id: 'PIQ-1',
  uid: 'U1',
  nombre: 'Ana Restrepo',
  email: 'ana@correo.com',
  soportes: [sop('cedula'), sop('ingresos'), sop('laboral'), sop('referencia')],
  estado: 'borrador',
  autorizaTratamiento: true,
  _version: 1,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  ...extra,
});

describe('los requisitos', () => {
  it('son cuatro y cortos a propósito: cada papel de más es una persona menos que termina', () => {
    expect(REQUISITOS).toHaveLength(4);
  });

  it('cada uno dice su nombre y QUÉ sirve, antes de que suba lo que no era', () => {
    for (const r of REQUISITOS) {
      expect(NOMBRE_REQUISITO[r]).toBeTruthy();
      expect(QUE_SIRVE[r]).toBeTruthy();
    }
  });

  it('🔴 la referencia de arriendo NO es obligatoria: exigirla cierra la puerta por ser joven', () => {
    expect([...OBLIGATORIOS].sort()).toEqual(['cedula', 'ingresos', 'laboral']);
    expect(OBLIGATORIOS).not.toContain('referencia');
  });
});

describe('faltantes', () => {
  it('un perfil completo no debe nada', () => {
    expect(faltantes(perfil())).toEqual([]);
  });

  it('cuenta lo que falta, en el orden en que se pide', () => {
    expect(faltantes({ soportes: [sop('cedula')] })).toEqual(['ingresos', 'laboral', 'referencia']);
  });

  it('quien arrienda por primera vez no debe la referencia', () => {
    expect(
      faltantes({ soportes: [sop('cedula'), sop('ingresos'), sop('laboral')], primerArriendo: true }),
    ).toEqual([]);
  });

  it('pero sí debe los tres obligatorios, aunque sea su primer arriendo', () => {
    expect(faltantes({ soportes: [sop('cedula')], primerArriendo: true })).toEqual(['ingresos', 'laboral']);
  });
});

describe('claveSoporte', () => {
  it('mete el uid DENTRO de la ruta: es lo que deja a las Rules acotar por persona', () => {
    expect(claveSoporte('U1', 'cedula', 'S-9', 'pdf')).toBe('perfiles/U1/cedula/S-9.pdf');
  });

  it('el nombre del archivo NO entra: podría traer la cédula de alguien, o una barra', () => {
    expect(claveSoporte('U1', 'ingresos', 'S-9', 'pdf')).not.toContain('nomina');
  });

  it('la extensión se limpia: nada de rutas coladas por ahí', () => {
    expect(claveSoporte('U1', 'cedula', 'S-9', '../../png')).toBe('perfiles/U1/cedula/S-9.png');
    expect(claveSoporte('U1', 'cedula', 'S-9', '')).toBe('perfiles/U1/cedula/S-9.bin');
  });
});

describe('problemasParaEnviar', () => {
  it('un perfil completo y autorizado se puede enviar', () => {
    expect(problemasParaEnviar(perfil())).toEqual([]);
  });

  it('🔴 sin autorización de tratamiento NO se envía (Ley 1581 art. 9)', () => {
    expect(problemasParaEnviar(perfil({ autorizaTratamiento: false }))).toContain('sin-autorizacion');
    expect(problemasParaEnviar(perfil({ autorizaTratamiento: undefined }))).toContain('sin-autorizacion');
  });

  it('exige nombre y correo: el correo es por donde llega el resultado', () => {
    expect(problemasParaEnviar(perfil({ nombre: '  ', email: '' })).sort()).toEqual([
      'sin-email',
      'sin-nombre',
    ]);
  });

  it('los soportes que faltan salen con su lista dentro', () => {
    expect(problemasParaEnviar(perfil({ soportes: [sop('cedula')] }))).toContain(
      'faltan:ingresos,laboral,referencia',
    );
  });

  it('un perfil vacío no revienta: devuelve todo lo que falta', () => {
    const p = problemasParaEnviar({});
    expect(p).toContain('sin-nombre');
    expect(p).toContain('sin-autorizacion');
    expect(p.some((x) => x.startsWith('faltan:'))).toBe(true);
  });
});

describe('explicar', () => {
  it('traduce los códigos simples', () => {
    expect(explicar('sin-autorizacion')).toContain('1581');
    expect(explicar('sin-observaciones')).toContain('qué falta');
  });

  it('resuelve la lista de requisitos que faltan', () => {
    expect(explicar('faltan:cedula,ingresos')).toBe(
      'Falta subir: Documento de identidad, Soporte de ingresos.',
    );
  });

  it('un código desconocido se devuelve tal cual', () => {
    expect(explicar('algo-nuevo')).toBe('algo-nuevo');
  });
});

describe('diasEsperando y el SLA', () => {
  it('cuenta desde que se envió, por DÍA', () => {
    const p = perfil({ estado: 'enviado', enviadoEn: '2026-08-20T18:00:00.000Z' });
    expect(diasEsperando(p, '2026-08-22T02:00:00.000Z')).toBe(2);
  });

  it('un borrador no espera nada: todavía no ha pedido nada', () => {
    expect(diasEsperando(perfil({ estado: 'borrador', enviadoEn: '2026-08-01T00:00:00.000Z' }), '2026-08-25')).toBe(0);
  });

  it('sigue contando mientras está EN revisión', () => {
    const p = perfil({ estado: 'revisando', enviadoEn: '2026-08-24T00:00:00.000Z' });
    expect(diasEsperando(p, '2026-08-25')).toBe(1);
  });

  it('el SLA no se pasa el mismo día', () => {
    const p = perfil({ estado: 'enviado', enviadoEn: '2026-08-25T00:00:00.000Z' });
    expect(slaVencido(p, '2026-08-25')).toBe(false);
  });

  it('a los dos días sí se pasó: la promesa son 24 horas hábiles', () => {
    const p = perfil({ estado: 'enviado', enviadoEn: '2026-08-23T00:00:00.000Z' });
    expect(slaVencido(p, '2026-08-25')).toBe(true);
  });
});

describe('vigencia', () => {
  it('un perfil recién verificado está vigente', () => {
    const p = perfil({ estado: 'verificado', verificadoEn: '2026-08-01T00:00:00.000Z' });
    expect(vigente(p, '2026-08-25')).toBe(true);
  });

  it('🔴 a los seis meses deja de estarlo: un soporte de hace un año no dice nada del presente', () => {
    const p = perfil({ estado: 'verificado', verificadoEn: '2026-01-01T00:00:00.000Z' });
    expect(vigente(p, '2026-08-25')).toBe(false);
  });

  it('lo que no está verificado no está vigente, por reciente que sea', () => {
    expect(vigente(perfil({ estado: 'enviado', verificadoEn: '2026-08-24' }), '2026-08-25')).toBe(false);
  });

  it('los días que quedan se cuentan hacia abajo y pueden ser negativos', () => {
    expect(diasDeVigencia({ verificadoEn: '2026-08-25' }, '2026-08-25')).toBe(180);
    expect(diasDeVigencia({ verificadoEn: '2026-01-01' }, '2026-08-25')).toBeLessThan(0);
  });

  it('sin fecha de verificación no hay días que contar', () => {
    expect(diasDeVigencia({}, '2026-08-25')).toBe(0);
  });
});

describe('las transiciones', () => {
  it('cada estado tiene nombre visible', () => {
    for (const e of ESTADOS) expect(NOMBRE_ESTADO[e]).toBeTruthy();
  });

  it('de borrador solo se puede enviar', () => {
    expect(TRANSICIONES.borrador).toEqual(['enviado']);
    expect(problemasAlCambiar('borrador', 'verificado')).toEqual(['no-se-puede:borrador->verificado']);
  });

  it('🔴 devolver con observaciones EXIGE escribir cuáles', () => {
    expect(problemasAlCambiar('revisando', 'observaciones')).toEqual(['sin-observaciones']);
    expect(problemasAlCambiar('revisando', 'observaciones', { observaciones: 'La cédula está borrosa.' })).toEqual([]);
  });

  it('unas observaciones en blanco no son observaciones', () => {
    expect(problemasAlCambiar('revisando', 'observaciones', { observaciones: '  ' })).toEqual([
      'sin-observaciones',
    ]);
  });

  it('desde observaciones se vuelve a enviar: no hay que empezar de cero por una foto borrosa', () => {
    expect(problemasAlCambiar('observaciones', 'enviado')).toEqual([]);
  });

  it('un perfil caducado vuelve a manos de su dueño, no se borra ni miente', () => {
    expect(problemasAlCambiar('verificado', 'borrador')).toEqual([]);
  });

  it('desde verificado NO se salta a revisión', () => {
    expect(problemasAlCambiar('verificado', 'revisando')).toEqual(['no-se-puede:verificado->revisando']);
  });

  it('un estado inventado se rechaza', () => {
    expect(problemasAlCambiar('borrador', 'aprobado' as EstadoPerfil)).toEqual(['estado-desconocido']);
  });
});
