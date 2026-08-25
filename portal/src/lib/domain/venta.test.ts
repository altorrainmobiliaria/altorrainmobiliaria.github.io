import { describe, expect, it } from 'vitest';
import {
  avance,
  avisosDe,
  ETAPAS,
  explicarProblema,
  moverEtapa,
  NOMBRE_ETAPA,
  posicion,
  problemasAlMover,
  problemasDeVenta,
  QUE_ES,
  SALTABLES,
  soportesFaltantes,
  textoDeAviso,
  vendida,
  type Etapa,
  type Venta,
} from './venta';
import { NOMBRE_DOCUMENTO, type TipoDocumento } from './documentos';

const doc = (tipo: TipoDocumento) => ({ tipo });

const venta = (extra: Partial<Venta> = {}): Venta => ({
  id: 'VTA-1',
  expedienteId: 'EXP-1',
  propiedadId: 'INM-1',
  compradorNombre: 'Comprador de prueba',
  etapa: 'interes',
  historial: [],
  _version: 1,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  ...extra,
});

describe('las siete etapas', () => {
  it('son siete y en el orden real del proceso', () => {
    expect(ETAPAS).toHaveLength(7);
    expect(ETAPAS[0]).toBe('interes');
    expect(ETAPAS[ETAPAS.length - 1]).toBe('registro');
  });

  it('el estudio de títulos va ANTES de la promesa', () => {
    // Firmar la promesa crea obligaciones: descubrir después una hipoteca cuesta las arras.
    expect(posicion('estudio-titulos')).toBeLessThan(posicion('promesa'));
  });

  it('cada etapa tiene nombre y explicación', () => {
    for (const e of ETAPAS) {
      expect(NOMBRE_ETAPA[e]).toBeTruthy();
      expect(QUE_ES[e]).toBeTruthy();
    }
  });
});

describe('vendida', () => {
  it('🔴 la escritura NO es la venta: solo el registro lo es', () => {
    // Art. 756 C.C.: la tradición de inmuebles se efectúa por la inscripción en la ORIP.
    expect(vendida({ etapa: 'escritura' })).toBe(false);
    expect(vendida({ etapa: 'registro' })).toBe(true);
  });

  it('ninguna etapa anterior cuenta como vendida', () => {
    for (const e of ETAPAS.filter((x) => x !== 'registro')) {
      expect(vendida({ etapa: e })).toBe(false);
    }
  });
});

describe('problemasAlMover', () => {
  it('avanzar un escalón siempre vale', () => {
    expect(problemasAlMover('interes', 'oferta')).toEqual([]);
    expect(problemasAlMover('escritura', 'registro')).toEqual([]);
  });

  it('se puede saltar la promesa: no siempre hay plazo que asegurar', () => {
    expect(problemasAlMover('estudio-titulos', 'credito')).toEqual([]);
  });

  it('se puede saltar el crédito: hay compras de contado', () => {
    expect(problemasAlMover('promesa', 'escritura')).toEqual([]);
  });

  it('se pueden saltar los DOS saltables a la vez', () => {
    expect(problemasAlMover('estudio-titulos', 'escritura')).toEqual([]);
  });

  it('🔴 NO se puede saltar el estudio de títulos', () => {
    expect(problemasAlMover('oferta', 'promesa')).toEqual([
      'no-se-puede-saltar:estudio-titulos',
    ]);
  });

  it('🔴 NO se puede saltar el registro: es lo único que transfiere la propiedad', () => {
    expect(problemasAlMover('promesa', 'registro')).toContain('no-se-puede-saltar:escritura');
  });

  it('retroceder sin motivo se rechaza', () => {
    expect(problemasAlMover('promesa', 'oferta')).toEqual(['retroceso-sin-motivo']);
  });

  it('retroceder CON motivo se permite: una venta que se cae es información', () => {
    expect(problemasAlMover('promesa', 'oferta', { motivo: 'El banco negó el crédito.' })).toEqual([]);
  });

  it('un motivo en blanco no es un motivo', () => {
    expect(problemasAlMover('promesa', 'oferta', { motivo: '   ' })).toEqual(['retroceso-sin-motivo']);
  });

  it('desde registro no se mueve nada: deshacer eso es otra escritura', () => {
    expect(problemasAlMover('registro', 'escritura', { motivo: 'error' })).toContain('registro-es-final');
  });

  it('quedarse donde está no es un movimiento', () => {
    expect(problemasAlMover('oferta', 'oferta')).toEqual(['sin-cambio']);
  });

  it('una etapa inventada se rechaza sin más', () => {
    expect(problemasAlMover('oferta', 'firmado' as Etapa)).toEqual(['etapa-desconocida']);
  });

  it('SALTABLES son exactamente las dos que pueden no aplicar', () => {
    expect([...SALTABLES].sort()).toEqual(['credito', 'promesa']);
  });
});

describe('soportesFaltantes', () => {
  it('el interés no exige papeles: todavía no hay nada que sostener', () => {
    expect(soportesFaltantes('interes', [])).toEqual([]);
  });

  it('el estudio de títulos exige la tradición y el estudio', () => {
    expect(soportesFaltantes('estudio-titulos', [])).toEqual([
      'certificado-tradicion',
      'estudio-titulos',
    ]);
  });

  it('con el soporte cargado deja de faltar', () => {
    expect(soportesFaltantes('promesa', [doc('promesa-compraventa')])).toEqual([]);
  });

  it('cuenta solo lo que falta, no lo que sobra', () => {
    expect(
      soportesFaltantes('escritura', [doc('escritura-publica'), doc('soporte-pago')]),
    ).toEqual(['paz-y-salvo']);
  });
});

describe('avisosDe', () => {
  it('🔴 grita justo donde todo PARECE terminado y no lo está', () => {
    const v = venta({ etapa: 'escritura', precioAcordado: 500_000_000 });
    const avisos = avisosDe(v, [doc('escritura-publica'), doc('paz-y-salvo')]);
    expect(avisos).toContain('escriturada-sin-registrar');
  });

  it('en registro ya no grita eso', () => {
    const v = venta({ etapa: 'registro', precioAcordado: 1, folioMatricula: '060-12345' });
    expect(avisosDe(v, [doc('certificado-tradicion')])).toEqual([]);
  });

  it('avisa de los soportes que faltan, con sus tipos dentro', () => {
    const v = venta({ etapa: 'promesa', precioAcordado: 1 });
    expect(avisosDe(v, [])).toContain('faltan-soportes:promesa-compraventa');
  });

  it('de promesa en adelante, sin precio acordado es un aviso', () => {
    const v = venta({ etapa: 'promesa' });
    expect(avisosDe(v, [doc('promesa-compraventa')])).toContain('sin-precio-acordado');
  });

  it('antes de la promesa, no tener precio acordado es normal', () => {
    const v = venta({ etapa: 'oferta', precioOfrecido: 400_000_000 });
    expect(avisosDe(v, [doc('cedula-comprador')])).toEqual([]);
  });

  it('registrada sin folio de matrícula se avisa', () => {
    const v = venta({ etapa: 'registro', precioAcordado: 1 });
    expect(avisosDe(v, [doc('certificado-tradicion')])).toContain('registrada-sin-folio');
  });
});

describe('textoDeAviso', () => {
  it('convierte la lista de soportes en algo que se lee', () => {
    const txt = textoDeAviso(
      'faltan-soportes:certificado-tradicion,estudio-titulos',
      (t) => NOMBRE_DOCUMENTO[t],
    );
    expect(txt).toContain('Certificado de tradición y libertad');
    expect(txt).toContain('Estudio de títulos');
  });

  it('los avisos simples tienen su frase', () => {
    expect(textoDeAviso('escriturada-sin-registrar', (t) => t)).toContain('SIN registrar');
  });

  it('un aviso desconocido se devuelve tal cual en vez de desaparecer', () => {
    expect(textoDeAviso('algo-nuevo', (t) => t)).toBe('algo-nuevo');
  });
});

describe('avance', () => {
  it('empieza en 0 y termina en 1', () => {
    expect(avance('interes')).toBe(0);
    expect(avance('registro')).toBe(1);
  });

  it('se mide por POSICIÓN: saltarse el crédito no te deja atrás', () => {
    // Una compra de contado en escritura va tan avanzada como una financiada en escritura.
    expect(avance('escritura')).toBeCloseTo(5 / 6);
  });
});

describe('problemasDeVenta', () => {
  const minima = { expedienteId: 'EXP-1', propiedadId: 'INM-1', compradorNombre: 'Ana' };

  it('con lo mínimo, se puede guardar', () => {
    expect(problemasDeVenta(minima)).toEqual([]);
  });

  it('exige expediente, inmueble y comprador', () => {
    expect(problemasDeVenta({}).sort()).toEqual(['sin-comprador', 'sin-expediente', 'sin-propiedad']);
  });

  it('los espacios en blanco no cuentan como nombre', () => {
    expect(problemasDeVenta({ ...minima, compradorNombre: '   ' })).toEqual(['sin-comprador']);
  });

  it('puede nacer SIN precio: en `interes` todavía no hay cifra', () => {
    expect(problemasDeVenta({ ...minima, etapa: 'interes' })).toEqual([]);
  });

  it('pero un precio de cero o negativo es error de captura, no un dato', () => {
    expect(problemasDeVenta({ ...minima, precioOfrecido: 0 })).toEqual(['precioOfrecido-invalido']);
    expect(problemasDeVenta({ ...minima, precioAcordado: -5 })).toEqual(['precioAcordado-invalido']);
  });

  it('un precio que no es número tampoco pasa', () => {
    expect(problemasDeVenta({ ...minima, precioOfrecido: '400000' as unknown as number })).toEqual([
      'precioOfrecido-invalido',
    ]);
    expect(problemasDeVenta({ ...minima, precioOfrecido: Number.NaN })).toEqual(['precioOfrecido-invalido']);
  });

  it('una etapa inventada se rechaza al crear', () => {
    expect(problemasDeVenta({ ...minima, etapa: 'firmado' as Etapa })).toEqual(['etapa-desconocida']);
  });
});

describe('explicarProblema', () => {
  it('traduce los códigos simples', () => {
    expect(explicarProblema('sin-comprador')).toContain('comprador');
    expect(explicarProblema('registro-sin-folio')).toContain('matrícula');
  });

  it('resuelve la lista de etapas que no se pueden saltar', () => {
    expect(explicarProblema('no-se-puede-saltar:estudio-titulos,escritura')).toBe(
      'No se puede saltar: Estudio de títulos y Escritura pública.',
    );
  });

  it('un código desconocido se devuelve tal cual en vez de desaparecer', () => {
    expect(explicarProblema('algo-nuevo')).toBe('algo-nuevo');
  });
});

describe('moverEtapa', () => {
  it('avanza, deja el cambio en el historial y sube la versión', () => {
    const r = moverEtapa(venta(), 'oferta', {
      cuando: '2026-08-25T10:00:00.000Z',
      porUid: 'daniel-uid',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.venta.etapa).toBe('oferta');
    expect(r.venta.historial).toHaveLength(1);
    expect(r.venta.historial[0]).toMatchObject({ de: 'interes', a: 'oferta', porUid: 'daniel-uid' });
    expect(r.venta._version).toBe(2);
  });

  it('NO muta la venta que recibe', () => {
    const original = venta();
    moverEtapa(original, 'oferta', { cuando: '2026-08-25T10:00:00.000Z', porUid: 'x' });
    expect(original.etapa).toBe('interes');
    expect(original.historial).toHaveLength(0);
  });

  it('al llegar a registro estampa la fecha de cierre', () => {
    const r = moverEtapa(venta({ etapa: 'escritura' }), 'registro', {
      cuando: '2026-09-01T15:00:00.000Z',
      porUid: 'x',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.venta.cerradaEn).toBe('2026-09-01T15:00:00.000Z');
    expect(vendida(r.venta)).toBe(true);
  });

  it('la escritura NO estampa cierre: todavía no está vendida', () => {
    const r = moverEtapa(venta({ etapa: 'credito' }), 'escritura', {
      cuando: '2026-09-01T15:00:00.000Z',
      porUid: 'x',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.venta.cerradaEn).toBeUndefined();
  });

  it('el motivo del retroceso queda escrito', () => {
    const r = moverEtapa(venta({ etapa: 'promesa' }), 'oferta', {
      cuando: '2026-08-25T10:00:00.000Z',
      porUid: 'x',
      motivo: '  El banco negó el crédito.  ',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.venta.historial[0].motivo).toBe('El banco negó el crédito.');
  });

  it('un movimiento inválido devuelve los problemas y no toca nada', () => {
    const r = moverEtapa(venta({ etapa: 'oferta' }), 'promesa', {
      cuando: '2026-08-25T10:00:00.000Z',
      porUid: 'x',
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.problemas).toContain('no-se-puede-saltar:estudio-titulos');
  });
});
