import { describe, expect, it } from 'vitest';
import {
  aTrozoUrl,
  claveContador,
  CODIGO_PROVISIONAL,
  codigoPropiedad,
  construirPropiedad,
  revisarAlta,
  slugPropiedad,
  TOPE_SECUENCIA,
  verticalSugerida,
  type EntradaAlta,
} from './alta-propiedad';
import { construirIndices, problemasParaPublicar } from './catalogo';

// Alta de propiedad (§108). Lo que se prueba aquí es la frontera donde un formulario se convierte en
// un documento del modelo sellado — y sobre todo el CONTRATO: lo que este módulo acepta construir como
// publicado, el índice del catálogo no lo puede omitir. Es la defensa contra §103.

const AHORA = new Date('2026-08-22T10:00:00.000Z');
const CODIGO = 'INM-202608-0007';

function entrada(over: Partial<EntradaAlta> = {}): EntradaAlta {
  return {
    operacion: 'venta',
    tipo: 'apartamento',
    estado: 'disponible',
    titulo: 'Apartamento con vista al mar',
    descripcion: 'Tres alcobas, dos baños.',
    ciudad: 'Cartagena de Indias',
    barrio: 'Bocagrande',
    valorVenta: '450000000',
    habitaciones: '3',
    banos: '2',
    imagenes: ['props/INM-202608-0007/1.webp'],
    ...over,
  };
}

const construir = (over: Partial<EntradaAlta> = {}) =>
  construirPropiedad(entrada(over), { codigo: CODIGO, ahora: AHORA });

describe('claveContador — el contador es MENSUAL, como el código', () => {
  it('deriva la clave del año-mes en UTC', () => {
    expect(claveContador(new Date('2026-08-22T10:00:00Z'))).toBe('INM-202608');
    expect(claveContador(new Date('2026-01-01T00:00:00Z'))).toBe('INM-202601');
    expect(claveContador(new Date('2026-12-31T23:59:59Z'))).toBe('INM-202612');
  });
});

describe('codigoPropiedad', () => {
  it('rellena a cuatro dígitos', () => {
    expect(codigoPropiedad('INM-202608', 7)).toEqual({ ok: true, codigo: 'INM-202608-0007' });
    expect(codigoPropiedad('INM-202608', 1234)).toEqual({ ok: true, codigo: 'INM-202608-1234' });
  });

  it('🔴 al agotarse la secuencia PARA, en vez de emitir un id que la ficha no sabe leer', () => {
    // `INM-202608-10000` no casa con ID_PROPIEDAD_RE ⇒ la ficha daría 404 para un inmueble que existe.
    expect(codigoPropiedad('INM-202608', TOPE_SECUENCIA + 1)).toEqual({ ok: false, motivo: 'secuencia-agotada' });
    expect(codigoPropiedad('INM-202608', 0)).toEqual({ ok: false, motivo: 'secuencia-agotada' });
    expect(codigoPropiedad('INM-202608', 1.5)).toEqual({ ok: false, motivo: 'secuencia-agotada' });
    expect(codigoPropiedad('INM-202608', TOPE_SECUENCIA).ok).toBe(true);
  });
});

describe('aTrozoUrl — el bug que trae el generador de semilla', () => {
  it('🔴 conserva los dígitos (la versión de la semilla los BORRA)', () => {
    expect(aTrozoUrl('Villa 7')).toBe('villa-7');
    expect(aTrozoUrl('Manzana 12 Etapa 3')).toBe('manzana-12-etapa-3');
  });

  it('🔴 quita la tilde en vez de convertirla en guion', () => {
    expect(aTrozoUrl('Centro Histórico')).toBe('centro-historico');
    expect(aTrozoUrl('La Boquilla · Cartagena')).toBe('la-boquilla-cartagena');
    expect(aTrozoUrl('Ñ áéíóú ü')).toBe('n-aeiou-u');
  });

  it('no deja guiones colgando en los extremos', () => {
    expect(aTrozoUrl('  ¡Bocagrande!  ')).toBe('bocagrande');
    expect(aTrozoUrl('---')).toBe('');
  });
});

describe('slugPropiedad — el código va al final por una razón', () => {
  it('compone tipo-barrio-código', () => {
    expect(slugPropiedad('apartamento', 'Bocagrande', CODIGO)).toBe('apartamento-bocagrande-inm-202608-0007');
  });

  it('el código hace el slug único POR CONSTRUCCIÓN', () => {
    // Dos altas idénticas el mismo día no pueden comprobar la unicidad la una contra la otra: el
    // índice lo escribe una Function con retardo. El sufijo es lo que impide el choque silencioso.
    const a = slugPropiedad('casa', 'Manga', 'INM-202608-0001');
    const b = slugPropiedad('casa', 'Manga', 'INM-202608-0002');
    expect(a).not.toBe(b);
  });

  it('sobrevive a un barrio con tildes y números', () => {
    expect(slugPropiedad('casa', 'Centro Histórico', CODIGO)).toBe('casa-centro-historico-inm-202608-0007');
  });
});

describe('verticalSugerida — se falla del lado que PROTEGE', () => {
  it('alojamiento manda sobre el tipo: es turístico', () => {
    expect(verticalSugerida('alojamiento', 'apartamento')).toBe('turistico');
    expect(verticalSugerida('alojamiento', 'casa')).toBe('turistico');
  });

  it('los tipos comerciales son comerciales', () => {
    for (const t of ['local', 'oficina', 'bodega', 'consultorio', 'edificio'] as const) {
      expect(verticalSugerida('arriendo', t)).toBe('comercial');
    }
  });

  it('ante la duda, VIVIENDA: equivocarse ahí solo prohíbe de más', () => {
    // Al revés —clasificar una vivienda como comercial— permitiría cobrar un depósito PROHIBIDO por
    // el art. 16 de la Ley 820. Por eso el default es el lado protector, no el cómodo.
    for (const t of ['apartamento', 'casa', 'apartaestudio', 'lote', 'finca', 'casa_lote', 'otro'] as const) {
      expect(verticalSugerida('arriendo', t)).toBe('vivienda');
    }
  });
});

describe('construirPropiedad — el camino bueno', () => {
  it('produce un documento completo del modelo sellado', () => {
    const r = construir();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const p = r.propiedad;
    expect(p.id).toBe(CODIGO);
    expect(p._version).toBe(1);
    expect(p.createdAt).toBe('2026-08-22T10:00:00.000Z');
    expect(p.updatedAt).toBe(p.createdAt);
    expect(p.slug).toBe('apartamento-bocagrande-inm-202608-0007');
    expect(p.vertical).toBe('vivienda');
    expect(p.precio).toEqual({ moneda: 'COP', valorVenta: 450_000_000 });
    expect(p.geo).toEqual({ ciudad: 'Cartagena de Indias', barrio: 'Bocagrande' });
    expect(p.specs).toEqual({ habitaciones: 3, banos: 2 });
    expect(p.imagenPortada).toBe('props/INM-202608-0007/1.webp');
  });

  it('el estado por defecto es BORRADOR: nada se publica por accidente', () => {
    const r = construirPropiedad({ ...entrada(), estado: undefined }, { codigo: CODIGO, ahora: AHORA });
    expect(r.ok && r.propiedad.estado).toBe('borrador');
  });

  it('la vertical que ELIGE el operador manda sobre la sugerencia', () => {
    const r = construir({ tipo: 'casa', vertical: 'comercial' });
    expect(r.ok && r.propiedad.vertical).toBe('comercial');
  });

  it('las coordenadas van en pareja o no van', () => {
    expect((construir({ lat: '10.4' }) as never as { propiedad: { geo: object } }).propiedad.geo).toEqual({
      ciudad: 'Cartagena de Indias',
      barrio: 'Bocagrande',
    });
    const conAmbas = construir({ lat: '10.4', lng: '-75.55' });
    expect(conAmbas.ok && conAmbas.propiedad.geo.lat).toBe(10.4);
    expect(conAmbas.ok && conAmbas.propiedad.geo.lng).toBe(-75.55);
  });

  it('un campo numérico vacío NO se guarda como 0: eso sería inventarse el dato', () => {
    const r = construir({ habitaciones: '', banos: '', estrato: '' });
    expect(r.ok && r.propiedad.specs).toEqual({});
  });

  it('el arriendo guarda canon y administración POR SEPARADO', () => {
    const r = construir({ operacion: 'arriendo', valorVenta: '', canon: '4500000', administracion: '380000' });
    expect(r.ok && r.propiedad.precio).toEqual({ moneda: 'COP', canon: 4_500_000, administracion: 380_000 });
  });

  it('acepta el precio escrito como lo escribe una persona', () => {
    const r = construir({ valorVenta: '$ 450.000.000' });
    expect(r.ok && r.propiedad.precio.valorVenta).toBe(450_000_000);
  });
});

describe('🔴 construirPropiedad — lo que NO deja guardar', () => {
  const errores = (over: Partial<EntradaAlta>) => {
    const r = construir(over);
    return r.ok ? [] : r.errores.map((e) => e.campo);
  };

  it('sin título, sin ciudad, sin barrio o sin foto', () => {
    expect(errores({ titulo: '  ' })).toContain('titulo');
    expect(errores({ ciudad: '' })).toContain('ciudad');
    expect(errores({ barrio: '' })).toContain('barrio');
    expect(errores({ imagenes: [] })).toContain('imagenes');
  });

  it('un alojamiento SIN RNT no se guarda: es obligación legal, no un dato de más', () => {
    expect(errores({ operacion: 'alojamiento', valorVenta: '', precioNoche: '350000' })).toContain('rnt');
    const conRnt = construir({ operacion: 'alojamiento', valorVenta: '', precioNoche: '350000', rnt: 'RNT-100001' });
    expect(conRnt.ok).toBe(true);
  });

  it('exige el precio QUE CORRESPONDE a la operación', () => {
    expect(errores({ valorVenta: '' })).toContain('valorVenta');
    expect(errores({ operacion: 'arriendo', valorVenta: '450000000', canon: '' })).toContain('canon');
    expect(errores({ operacion: 'alojamiento', rnt: 'RNT-1', valorVenta: '1', precioNoche: '' })).toContain('precioNoche');
  });

  it('🔴 rechaza imágenes que no son claves nuestras (URLs de terceros)', () => {
    expect(errores({ imagenes: ['https://picsum.photos/seed/x/800/600'] })).toContain('imagenes');
    expect(errores({ imagenes: ['/assets/demo.webp'] })).toContain('imagenes');
  });

  it('los enseña TODOS de una vez, no de uno en uno', () => {
    const campos = errores({ titulo: '', ciudad: '', valorVenta: '', imagenes: [] });
    expect(campos).toEqual(expect.arrayContaining(['titulo', 'ciudad', 'valorVenta', 'imagenes']));
  });

  it('cada error trae un mensaje para una persona', () => {
    const r = construir({ titulo: '', ciudad: '' });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    for (const e of r.errores) expect(e.mensaje.length).toBeGreaterThan(15);
  });
});

describe('🎯 EL CONTRATO con el lector — la defensa contra §103', () => {
  it('lo que el alta construye como DISPONIBLE, el índice NO lo omite', () => {
    const r = construir({ estado: 'disponible' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(problemasParaPublicar(r.propiedad)).toEqual([]);
    const { indices, omitidas } = construirIndices([r.propiedad], AHORA.toISOString());
    expect(omitidas).toEqual([]);
    expect(indices.venta.items).toHaveLength(1);
    expect(indices.venta.items[0].id).toBe(CODIGO);
  });

  it('y lo cumple en las TRES operaciones', () => {
    const casos: Array<[Partial<EntradaAlta>, 'venta' | 'arriendo' | 'dias']> = [
      [{}, 'venta'],
      [{ operacion: 'arriendo', valorVenta: '', canon: '4500000' }, 'arriendo'],
      [{ operacion: 'alojamiento', valorVenta: '', precioNoche: '350000', rnt: 'RNT-100001' }, 'dias'],
    ];
    for (const [over, shard] of casos) {
      const r = construir({ ...over, estado: 'disponible' });
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      expect(problemasParaPublicar(r.propiedad)).toEqual([]);
      expect(construirIndices([r.propiedad], AHORA.toISOString()).indices[shard].items).toHaveLength(1);
    }
  });

  it('un borrador se construye bien, pero el contrato dice que no se ve', () => {
    const r = construir({ estado: 'borrador' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(problemasParaPublicar(r.propiedad)).toEqual(['estado-no-publicado']);
    expect(construirIndices([r.propiedad], AHORA.toISOString()).indices.venta.items).toHaveLength(0);
  });
});

describe('🔴 dinero colombiano vs decimal de máquina: DOS parsers, no uno listo', () => {
  const precio = (v: string) => {
    const r = construir({ valorVenta: v });
    return r.ok ? r.propiedad.precio.valorVenta : null;
  };
  const coord = (lat: string, lng: string) => {
    const r = construir({ lat, lng });
    return r.ok ? [r.propiedad.geo.lat, r.propiedad.geo.lng] : null;
  };

  it('el punto en un PRECIO separa miles', () => {
    expect(precio('450.000.000')).toBe(450_000_000);
    expect(precio('$ 450.000.000')).toBe(450_000_000);
    expect(precio('1.500')).toBe(1500);
    expect(precio('450000000')).toBe(450_000_000);
  });

  it('la coma en un precio es el decimal, como la escribe la gente', () => {
    expect(precio('1.500,50')).toBe(1500.5);
    expect(precio('1500,50')).toBe(1500.5);
  });

  it('🎯 el MISMO punto en una COORDENADA es el decimal', () => {
    // Si un solo parser «listo» decidiera que `10.399` son miles, el inmueble aparecería en la
    // latitud 10399 — en mitad del Ártico y sin un solo error.
    expect(coord('10.399', '-75.554')).toEqual([10.399, -75.554]);
  });

  it('un precio ilegible no se guarda como 0', () => {
    expect(construir({ valorVenta: 'como unos 450 palos' }).ok).toBe(true); // «450» sí se lee
    const r = construir({ valorVenta: 'no sé' });
    expect(r.ok).toBe(false);
  });
});

describe('revisarAlta — el aviso de «¿se vería?» mientras se escribe', () => {
  const revisar = (over: Partial<EntradaAlta> = {}) => revisarAlta(entrada(over), AHORA);

  it('un formulario completo y disponible SE VERÍA', () => {
    const r = revisar({ estado: 'disponible' });
    expect(r).toEqual({ errores: [], problemas: [], seVeria: true });
  });

  it('un borrador completo NO se vería, y dice exactamente por qué', () => {
    const r = revisar({ estado: 'borrador' });
    expect(r.errores).toEqual([]);
    expect(r.problemas).toEqual(['estado-no-publicado']);
    expect(r.seVeria).toBe(false);
  });

  it('a medio llenar devuelve los campos que faltan, no un «no se puede»', () => {
    const r = revisar({ titulo: '', imagenes: [] });
    expect(r.seVeria).toBe(false);
    expect(r.errores.map((e) => e.campo)).toEqual(expect.arrayContaining(['titulo', 'imagenes']));
  });

  it('el código provisional NUNCA se confunde con uno real', () => {
    // Es un código con forma válida para poder evaluar, pero imposible como fecha: mes 00, año 0000.
    expect(CODIGO_PROVISIONAL).toBe('INM-000000-0000');
    expect(claveContador(AHORA)).not.toBe('INM-000000');
  });
});
