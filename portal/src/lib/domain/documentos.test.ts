/*
 * La bóveda del expediente: lo que la hace útil no es guardar, es SABER QUÉ FALTA.
 *
 * Casi todo lo de aquí prueba bordes de calendario y huecos, que es donde este dominio se equivoca de
 * verdad: un día de diferencia decide si una póliza sale «vence mañana» o «venció ayer», y un
 * documento retirado que siguiera cerrando un hueco haría que el sistema jurara tener algo que ya no
 * tiene — que es peor que no saberlo.
 */
import { describe, expect, it } from 'vitest';
import {
  AVISO_DIAS,
  claveStorage,
  explicarProblemaDocumento,
  extensionDe,
  faltantes,
  porVencer,
  problemasDeDocumento,
  TIPOS_DOCUMENTO,
  TOPE_BYTES,
  vigente,
  type Documento,
  type TipoDocumento,
} from './documentos';

const doc = (tipo: TipoDocumento, extra: Partial<Documento> = {}): Documento => ({
  id: `DOC-${tipo}`,
  expedienteId: 'EXP-202608-0001',
  tipo,
  nombreArchivo: 'escaneo.pdf',
  claveStorage: `expedientes/EXP-202608-0001/${tipo}/x.pdf`,
  bytes: 1024,
  contentType: 'application/pdf',
  finalidad: 'Administrar este inmueble',
  _version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...extra,
});

describe('faltantes — la pregunta que hoy nadie puede contestar', () => {
  it('un expediente vacío de administración debe TODO lo suyo', () => {
    expect(faltantes([], ['administracion'])).toEqual(['contrato-administracion', 'cedula-propietario']);
  });

  it('con los dos contratos, exige la UNIÓN y sin repetir', () => {
    const f = faltantes([], ['administracion', 'arriendo']);
    expect(f).toEqual([
      'contrato-administracion',
      'cedula-propietario',
      'contrato-arriendo',
      'cedula-arrendatario',
      'acta-entrega',
    ]);
    expect(new Set(f).size).toBe(f.length);
  });

  it('lo que ya está deja de faltar', () => {
    expect(faltantes([doc('contrato-administracion')], ['administracion'])).toEqual(['cedula-propietario']);
  });

  it('🔴 un documento RETIRADO no cierra el hueco', () => {
    // Si lo cerrara, el sistema juraría tener algo que ya no tiene — peor que no saberlo.
    const retirado = doc('contrato-administracion', { retiradoEn: '2026-03-01T00:00:00.000Z' });
    expect(faltantes([retirado], ['administracion'])).toContain('contrato-administracion');
    expect(vigente(retirado)).toBe(false);
  });

  it('un «otro» no cierra ningún hueco, por muchos que haya', () => {
    const otros = [doc('otro', { id: 'a' }), doc('otro', { id: 'b' })];
    expect(faltantes(otros, ['administracion'])).toHaveLength(2);
  });

  it('la póliza NO es obligatoria — en vivienda la garantía admite varias formas (art. 16 Ley 820)', () => {
    expect(faltantes([], ['arriendo'])).not.toContain('poliza-arrendamiento');
  });

  it('completo: no falta nada', () => {
    const todos = (['contrato-arriendo', 'cedula-arrendatario', 'acta-entrega'] as TipoDocumento[]).map((t) => doc(t));
    expect(faltantes(todos, ['arriendo'])).toEqual([]);
  });
});

describe('porVencer — el signo de los días ES la información', () => {
  const HOY = '2026-08-25T14:30:00.000Z';

  it('lo ya vencido sale con días NEGATIVOS y marcado', () => {
    const p = porVencer([doc('poliza-arrendamiento', { vence: '2026-03-14' })], HOY);
    expect(p).toHaveLength(1);
    expect(p[0].vencido).toBe(true);
    expect(p[0].dias).toBeLessThan(0);
  });

  it('lo que vence HOY sale con 0, no con -1 (se compara por día, no por hora)', () => {
    // Con horas de por medio el número cambiaría según a qué hora se mire el tablero.
    const p = porVencer([doc('poliza-arrendamiento', { vence: '2026-08-25' })], HOY);
    expect(p[0].dias).toBe(0);
    expect(p[0].vencido).toBe(false);
  });

  it('lo que vence mañana sale con 1', () => {
    expect(porVencer([doc('poliza-arrendamiento', { vence: '2026-08-26' })], HOY)[0].dias).toBe(1);
  });

  it(`justo en el umbral (${AVISO_DIAS} días) entra; un día más allá, no`, () => {
    const dentro = doc('poliza-arrendamiento', { id: 'dentro', vence: '2026-09-24' }); // +30
    const fuera = doc('poliza-arrendamiento', { id: 'fuera', vence: '2026-09-25' }); // +31
    const p = porVencer([dentro, fuera], HOY);
    expect(p.map((x) => x.documento.id)).toEqual(['dentro']);
  });

  it('respeta el aviso PROPIO del documento por encima del umbral general', () => {
    const largo = doc('contrato-administracion', { vence: '2026-10-20', avisarDias: 90 });
    expect(porVencer([largo], HOY)).toHaveLength(1);
  });

  it('sin fecha de vencimiento, no aparece', () => {
    expect(porVencer([doc('cedula-propietario')], HOY)).toEqual([]);
  });

  it('un retirado no avisa aunque esté vencido', () => {
    const r = doc('poliza-arrendamiento', { vence: '2026-01-01', retiradoEn: '2026-02-01T00:00:00.000Z' });
    expect(porVencer([r], HOY)).toEqual([]);
  });

  it('ordena por urgencia: lo más vencido primero', () => {
    const p = porVencer(
      [
        doc('poliza-arrendamiento', { id: 'pronto', vence: '2026-09-10' }),
        doc('contrato-arriendo', { id: 'muy-vencido', vence: '2026-01-05' }),
        doc('contrato-administracion', { id: 'vencido', vence: '2026-08-01' }),
      ],
      HOY,
    );
    expect(p.map((x) => x.documento.id)).toEqual(['muy-vencido', 'vencido', 'pronto']);
  });

  it('aguanta fechas basura sin reventar el tablero entero', () => {
    expect(porVencer([doc('poliza-arrendamiento', { vence: 'no-es-fecha' })], HOY)).toEqual([]);
    expect(porVencer([doc('poliza-arrendamiento', { vence: '2026-01-01' })], 'tampoco')).toEqual([]);
  });
});

describe('problemasDeDocumento', () => {
  const bueno = {
    expedienteId: 'EXP-1',
    tipo: 'contrato-arriendo' as TipoDocumento,
    nombreArchivo: 'contrato.pdf',
    claveStorage: 'expedientes/EXP-1/contrato-arriendo/x.pdf',
    bytes: 2048,
    contentType: 'application/pdf',
    finalidad: 'Administrar este inmueble',
  };

  it('uno válido no tiene problemas', () => {
    expect(problemasDeDocumento(bueno)).toEqual([]);
  });

  it('una finalidad de una palabra NO es una finalidad', () => {
    // «varios» es un hueco con texto: en dos años no le dice nada a nadie, y es lo que la ley pide.
    expect(problemasDeDocumento({ ...bueno, finalidad: 'varios' })).toContain('sin-finalidad');
  });

  it('rechaza lo que no sale de un escáner ni de un teléfono', () => {
    expect(problemasDeDocumento({ ...bueno, contentType: 'application/zip' })).toContain('tipo-no-admitido');
    expect(problemasDeDocumento({ ...bueno, contentType: 'video/mp4' })).toContain('tipo-no-admitido');
  });

  it('rechaza lo que pasa del tope', () => {
    expect(problemasDeDocumento({ ...bueno, bytes: TOPE_BYTES + 1 })).toContain('demasiado-grande');
    expect(problemasDeDocumento({ ...bueno, bytes: TOPE_BYTES })).not.toContain('demasiado-grande');
  });

  it('una caducidad en el pasado se rechaza al SUBIR', () => {
    expect(problemasDeDocumento({ ...bueno, vence: '2020-01-01' }, '2026-08-25')).toContain('vence-en-el-pasado');
    // Pero sin saber qué día es hoy, no se inventa: no se lee el reloj por dentro.
    expect(problemasDeDocumento({ ...bueno, vence: '2020-01-01' })).not.toContain('vence-en-el-pasado');
  });

  it('acumula TODOS los problemas, no solo el primero', () => {
    // Un formulario que corrige de uno en uno son tantos intentos como campos malos.
    const p = problemasDeDocumento({ finalidad: 'x' });
    expect(p).toEqual(expect.arrayContaining(['sin-expediente', 'sin-tipo', 'sin-archivo', 'sin-finalidad']));
  });

  it('cada problema tiene un mensaje accionable', () => {
    for (const p of [
      'sin-expediente', 'sin-tipo', 'sin-archivo', 'sin-finalidad',
      'tipo-no-admitido', 'demasiado-grande', 'vence-en-el-pasado',
    ] as const) {
      expect(explicarProblemaDocumento(p).length).toBeGreaterThan(15);
    }
  });
});

describe('claveStorage — el nombre del archivo NO entra en la ruta', () => {
  it('la ruta no contiene datos de ninguna persona', () => {
    // Un `Cédula Juan Pérez.pdf` en la ruta pone un nombre en logs y mensajes de error.
    const k = claveStorage('EXP-202608-0001', 'cedula-arrendatario', 'DOC-0007', 'pdf');
    expect(k).toBe('expedientes/EXP-202608-0001/cedula-arrendatario/DOC-0007.pdf');
    expect(k).not.toMatch(/juan|perez|cédula juan/i);
  });

  it('normaliza la extensión venga como venga', () => {
    expect(claveStorage('E', 'otro', 'D', '.PDF')).toMatch(/\.pdf$/);
    expect(claveStorage('E', 'otro', 'D', 'JPG')).toMatch(/\.jpg$/);
  });

  it('la extensión sale del contentType, no del nombre subido', () => {
    expect(extensionDe('application/pdf')).toBe('pdf');
    expect(extensionDe('image/jpeg')).toBe('jpg');
    // Lo desconocido no se adivina: `bin` es honesto y no ejecuta nada en ningún visor.
    expect(extensionDe('application/x-msdownload')).toBe('bin');
  });
});

describe('la lista de tipos es cerrada', () => {
  it('no hay duplicados', () => {
    expect(new Set(TIPOS_DOCUMENTO).size).toBe(TIPOS_DOCUMENTO.length);
  });
});
