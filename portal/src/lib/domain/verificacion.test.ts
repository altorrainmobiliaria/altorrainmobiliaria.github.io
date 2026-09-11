import { describe, expect, it } from 'vitest';
import {
  colaDeConfirmacion,
  colaDeVerificacion,
  confirmacionDeVigencia,
  diasSinConfirmar,
  DIAS_PARA_RECONFIRMAR,
  esperaSello,
  explicarReparo,
  MINIMO_FOTOS_SELLO,
  necesitaConfirmacion,
  reparosParaSellar,
  selloDeVerificacion,
} from './verificacion';
import type { Propiedad } from './propiedades';

/** Una propiedad que SÍ se puede sellar. Cada test rompe justo una cosa. */
const lista = (p: Partial<Propiedad> = {}): Propiedad =>
  ({
    id: 'INM-202608-0001',
    slug: 'apto-bocagrande-inm-202608-0001',
    titulo: 'Apartamento en Bocagrande',
    // 'disponible', no 'publicado': ESTADOS_PUBLICADOS son disponible/reservado/cerrado.
    estado: 'disponible',
    operacion: 'venta',
    vertical: 'vivienda',
    tipo: 'apartamento',
    precio: { moneda: 'COP', valorVenta: 450_000_000 },
    specs: { areaConstruidaM2: 96 },
    imagenes: ['a.webp', 'b.webp', 'c.webp'],
    imagenPortada: 'a.webp',
    geo: { ciudad: 'Cartagena' },
    _version: 3,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...p,
  }) as Propiedad;

describe('reparosParaSellar', () => {
  it('una propiedad completa no tiene reparos', () => {
    expect(reparosParaSellar(lista())).toEqual([]);
  });

  it('«no-publicable» ABSORBE el resto: arregla lo de arriba y vuelve', () => {
    // Sin precio no se publica; además le faltan fotos y área. Solo debe decir lo primero.
    const rota = lista({ precio: undefined as never, imagenes: [], specs: {} });
    expect(reparosParaSellar(rota)).toEqual(['no-publicable']);
  });

  it(`pide al menos ${MINIMO_FOTOS_SELLO} fotos`, () => {
    const r = reparosParaSellar(lista({ imagenes: ['a.webp', 'b.webp'], imagenPortada: 'a.webp' }));
    expect(r).toContain('sin-fotos-suficientes');
  });

  it('acepta el área construida O la privada — cualquiera de las dos', () => {
    expect(reparosParaSellar(lista({ specs: { areaPrivadaM2: 80 } }))).toEqual([]);
    expect(reparosParaSellar(lista({ specs: {} }))).toEqual(['sin-area']);
  });

  it('cada reparo se explica en cristiano', () => {
    for (const r of reparosParaSellar(lista({ specs: {}, imagenes: ['a.webp'], imagenPortada: 'a.webp' }))) {
      expect(explicarReparo(r).length).toBeGreaterThan(20);
    }
  });
});

describe('esperaSello', () => {
  it('la que ya lo tiene no espera nada', () => {
    expect(esperaSello(lista({ verificadoAltorra: true }))).toBe(false);
  });

  it('la que no lo tiene y está lista, sí', () => {
    expect(esperaSello(lista())).toBe(true);
  });

  it('la que no lo tiene pero le falta algo, no', () => {
    expect(esperaSello(lista({ specs: {} }))).toBe(false);
  });
});

describe('colaDeVerificacion', () => {
  it('deja fuera las ya selladas y pone delante las que se pueden sellar YA', () => {
    const cola = colaDeVerificacion([
      lista({ id: 'SELLADA', verificadoAltorra: true }),
      lista({ id: 'CON-REPAROS', specs: {} }),
      lista({ id: 'LISTA' }),
    ]);
    expect(cola.map((p) => p.id)).toEqual(['LISTA', 'CON-REPAROS']);
  });
});

describe('selloDeVerificacion', () => {
  it('sella con fecha y sube la versión', () => {
    const s = selloDeVerificacion(lista(), new Date('2026-08-22T15:00:00Z'));
    expect(s).toEqual({
      verificadoAltorra: true,
      verificadoEn: '2026-08-22T15:00:00.000Z',
      _version: 4,
      updatedAt: '2026-08-22T15:00:00.000Z',
    });
  });

  it('devuelve null si NO se lo ha ganado — esto es lo que para el doble clic', () => {
    expect(selloDeVerificacion(lista({ specs: {} }))).toBeNull();
  });

  it('devuelve null si ya estaba sellada: no se re-sella ni se pisa la fecha original', () => {
    expect(selloDeVerificacion(lista({ verificadoAltorra: true }))).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// §306 — VIGENCIA. `frescuraTexto()` leía `ultimaConfirmacion` y la ficha la pintaba… y NADIE
// escribía ese campo: «frescura verificada» —uno de los ocho diferenciales declarados— era una
// línea que no aparecía nunca. [[L-87]] por sexta vez.
// ═══════════════════════════════════════════════════════════════════════════════════════════════

describe('vigencia — «Confirmada hace N días» (§306)', () => {
  const HOY = new Date('2026-09-11T12:00:00.000Z');
  const haceDias = (n: number) => new Date(HOY.getTime() - n * 86_400_000).toISOString();

  it('cuenta los días, y «nunca confirmada» es null — NO «hace mucho»', () => {
    expect(diasSinConfirmar({ ultimaConfirmacion: haceDias(5) }, HOY)).toBe(5);
    expect(diasSinConfirmar({ ultimaConfirmacion: undefined }, HOY)).toBeNull();
    expect(diasSinConfirmar({ ultimaConfirmacion: 'mañana por la tarde' }, HOY)).toBeNull();
  });

  it('🎯 NUNCA confirmada ⇒ hay que confirmarla: es la que hay que llamar, no la que se salta la cola', () => {
    expect(necesitaConfirmacion({ ultimaConfirmacion: undefined }, HOY)).toBe(true);
    expect(necesitaConfirmacion({ ultimaConfirmacion: haceDias(0) }, HOY)).toBe(false);
    expect(necesitaConfirmacion({ ultimaConfirmacion: haceDias(DIAS_PARA_RECONFIRMAR - 1) }, HOY)).toBe(false);
    expect(necesitaConfirmacion({ ultimaConfirmacion: haceDias(DIAS_PARA_RECONFIRMAR) }, HOY)).toBe(true);
  });

  it('la cola pone primero a las más viejas, y las que nunca se confirmaron van arriba del todo', () => {
    const props = [
      lista({ id: 'A', ultimaConfirmacion: haceDias(31) }),
      lista({ id: 'B', ultimaConfirmacion: haceDias(2) }), // al día: fuera de la cola
      lista({ id: 'C', ultimaConfirmacion: undefined }),
      lista({ id: 'D', ultimaConfirmacion: haceDias(90) }),
    ];
    expect(colaDeConfirmacion(props, HOY).map((p) => p.id)).toEqual(['C', 'D', 'A']);
  });

  it('el parche estampa la fecha y sube `_version`', () => {
    const parche = confirmacionDeVigencia({ ultimaConfirmacion: haceDias(40), _version: 3 }, HOY);
    expect(parche).toEqual({
      ultimaConfirmacion: HOY.toISOString(),
      _version: 4,
      updatedAt: HOY.toISOString(),
    });
  });

  it('confirmar dos veces el mismo día no escribe: no dice nada nuevo y gasta un `_version`', () => {
    expect(confirmacionDeVigencia({ ultimaConfirmacion: haceDias(0), _version: 3 }, HOY)).toBeNull();
  });

  it('🔴 y el sello y la vigencia son cosas DISTINTAS: confirmar no sella ni al revés', () => {
    // `verificadoEn` = «alguien revisó que este aviso es legítimo»; `ultimaConfirmacion` = «sigue
    // disponible y a este precio». Fundirlos obligaría a re-verificar el inmueble entero cada mes.
    const parche = confirmacionDeVigencia({ _version: 1 }, HOY);
    expect(parche && 'verificadoAltorra' in parche).toBe(false);
    const sello = selloDeVerificacion(lista(), HOY);
    expect(sello && 'ultimaConfirmacion' in sello).toBe(false);
  });
});
