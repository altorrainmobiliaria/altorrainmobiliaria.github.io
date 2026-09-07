import { describe, expect, it } from 'vitest';
import {
  colaDeVerificacion,
  esperaSello,
  explicarReparo,
  MINIMO_FOTOS_SELLO,
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
