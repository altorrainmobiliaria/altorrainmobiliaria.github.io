import { describe, it, expect } from 'vitest';
import {
  amenidadesVisibles,
  avisoEstado,
  exhibeMatricula,
  publicable,
  descripcionSeo,
  fichaTecnica,
  frescuraTexto,
  historialPrecio,
  humanizarAmenidad,
  jsonLdInmueble,
  mensajeWhatsApp,
  migas,
  precioFicha,
  rutaFicha,
  similares,
  specsVisibles,
  ubicacionPublica,
  valorPrecio,
} from './ficha';
import type { Propiedad } from './propiedades';
import type { CatalogoResumen } from './catalogo';

// Modelo de VISTA de la ficha (ADR §60 → §97). Lo que se protege aquí es UNA regla: un bloque sin dato
// se OMITE y jamás hereda el valor del demo. Casi cada test comprueba una AUSENCIA, porque el fallo que
// importa no es que se vea feo: es que se vea bien y sea mentira.

function prop(over: Partial<Propiedad> = {}): Propiedad {
  return {
    _version: 1,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
    id: 'INM-202607-0001',
    operacion: 'venta',
    vertical: 'vivienda',
    tipo: 'apartamento',
    estado: 'disponible',
    titulo: 'Apartamento con vista a la bahía',
    descripcion: 'Apartamento en Castillogrande con vista frontal a la bahía y balcón corrido.',
    slug: 'apartamento-castillogrande-inm-202607-0001',
    geo: { ciudad: 'Cartagena de Indias', zona: 'Norte', barrio: 'Castillogrande', lat: 10.393, lng: -75.56 },
    specs: { habitaciones: 3, banos: 3, areaConstruidaM2: 142, parqueaderos: 2, estrato: 6 },
    amenidades: { piscina: true, gimnasio: false, vistaAlMar: true },
    precio: { moneda: 'COP', valorVenta: 1_450_000_000 },
    imagenes: ['props/a/1.webp', 'props/a/2.webp'],
    ...over,
  };
}

function res(over: Partial<CatalogoResumen> = {}): CatalogoResumen {
  return {
    id: 'INM-202607-0002',
    slug: 'otro',
    titulo: 'Otro inmueble',
    operacion: 'venta',
    tipo: 'apartamento',
    precio: 900_000_000,
    sector: 'Manga',
    coords: null,
    thumb: 'props/b/1.webp',
    pub: '2026-08-01T00:00:00.000Z',
    ...over,
  };
}

describe('precio', () => {
  it('venta: etiqueta correcta, sin sufijo y con $/m² calculado', () => {
    const r = precioFicha(prop())!;
    expect(r.etiqueta).toBe('Precio de venta');
    expect(r.valor).not.toContain('/ mes');
    expect(r.sub).toContain('/ m²');
  });

  it('arriendo: el canon SIEMPRE lleva "/ mes" (sin eso el número significa otra cosa)', () => {
    const r = precioFicha(prop({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 8_500_000 } }))!;
    expect(r.etiqueta).toBe('Canon mensual');
    expect(r.valor).toContain('/ mes');
  });

  it('arriendo: dice si la administración va incluida o aparte (doble-precio)', () => {
    const incl = precioFicha(prop({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 8_500_000, adminIncluidaEnCanon: true } }))!;
    expect(incl.sub).toContain('incluida');
    const aparte = precioFicha(prop({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 8_500_000, administracion: 1_200_000 } }))!;
    expect(aparte.sub).toContain('administración');
    expect(aparte.sub).toContain('1.200.000');
  });

  it('🔴 administracion NO incluida y sin cifra: se DICE (callarlo es drip pricing)', () => {
    // Ley 1480 art. 26: el precio total desde el principio. Si no decimos nada, el visitante asume
    // que esta incluida y descubre el sobrecosto al firmar.
    const r = precioFicha(prop({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 8_500_000 } }))!;
    expect(r.sub).toContain('Administración aparte');
  });

  it('NO calcula $/m² en arriendo (un canon por metro no significa nada)', () => {
    const r = precioFicha(prop({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 8_500_000 } }))!;
    expect(r.sub).not.toContain('/ m²');
  });

  it('sin precio devuelve null: la ficha se publica SIN el bloque, no con un cero', () => {
    expect(precioFicha(prop({ precio: { moneda: 'COP' } }))).toBeNull();
    expect(valorPrecio(prop({ precio: { moneda: 'COP' } }))).toBeNull();
  });

  it('no calcula $/m² si falta el área', () => {
    const r = precioFicha(prop({ specs: { habitaciones: 3 } }))!;
    expect(r.sub).toBe('');
  });
});

describe('specs y ficha técnica', () => {
  it('solo salen las specs con dato, en orden', () => {
    const r = specsVisibles(prop({ specs: { habitaciones: 2, areaConstruidaM2: 80 } }));
    expect(r.map((s) => s.icono)).toEqual(['hab', 'area']);
  });

  it('singular y plural segun el numero', () => {
    expect(specsVisibles(prop({ specs: { habitaciones: 1, banos: 1 } })).map((s) => s.etiqueta)).toEqual([
      'Habitación',
      'Baño',
    ]);
  });

  it('una propiedad sin specs no pinta ni una casilla', () => {
    expect(specsVisibles(prop({ specs: {} }))).toEqual([]);
  });

  it('la ficha técnica omite las filas sin dato', () => {
    const filas = fichaTecnica(prop({ specs: {}, precio: { moneda: 'COP', valorVenta: 1 } }));
    const claves = filas.map(([k]) => k);
    expect(claves).toEqual(['Tipo']);
  });

  it('el RNT sale en alojamiento cuando existe, y NO se inventa cuando falta', () => {
    const con = fichaTecnica(prop({ operacion: 'alojamiento', rnt: 'RNT-100001', precio: { moneda: 'COP', precioNoche: 400_000 } }));
    expect(con.some(([k, v]) => k === 'RNT' && v === 'RNT-100001')).toBe(true);
    const sin = fichaTecnica(prop({ operacion: 'alojamiento', precio: { moneda: 'COP', precioNoche: 400_000 } }));
    expect(sin.some(([k]) => k === 'RNT')).toBe(false);
  });
});

describe('amenidades', () => {
  it('solo las marcadas true; `false` significa que NO la tiene', () => {
    expect(amenidadesVisibles(prop())).toEqual(['Piscina', 'Vista al mar']);
  });

  it('una clave desconocida se humaniza en vez de descartarse', () => {
    expect(humanizarAmenidad('zonaDeCoworking')).toBe('Zona de coworking');
    expect(amenidadesVisibles(prop({ amenidades: { zonaDeCoworking: true } }))).toEqual(['Zona de coworking']);
  });

  it('suma otrasAmenidades sin duplicar', () => {
    const r = amenidadesVisibles(prop({ amenidades: { piscina: true }, otrasAmenidades: ['Domótica', 'Piscina'] }));
    expect(r).toEqual(['Piscina', 'Domótica']);
  });

  it('sin amenidades, lista vacia (la seccion no se pinta)', () => {
    expect(amenidadesVisibles(prop({ amenidades: {}, otrasAmenidades: [] }))).toEqual([]);
  });
});

describe('confianza', () => {
  const ahora = new Date('2026-08-21T12:00:00.000Z');

  it('traduce la ultima confirmacion a lenguaje humano', () => {
    expect(frescuraTexto(prop({ ultimaConfirmacion: '2026-08-21T08:00:00.000Z' }), ahora)).toBe('Confirmada hoy');
    expect(frescuraTexto(prop({ ultimaConfirmacion: '2026-08-18T12:00:00.000Z' }), ahora)).toBe('Confirmada hace 3 días');
    expect(frescuraTexto(prop({ ultimaConfirmacion: '2026-06-21T12:00:00.000Z' }), ahora)).toBe('Confirmada hace 2 meses');
  });

  it('sin confirmacion NO cae a la fecha de creacion (responderia otra pregunta)', () => {
    expect(frescuraTexto(prop(), ahora)).toBeNull();
  });

  it('el historial marca la direccion del cambio y viene del mas reciente', () => {
    const h = historialPrecio(
      prop({
        priceHistory: [
          { fecha: '2026-05-01', valor: 1_600_000_000 },
          { fecha: '2026-07-01', valor: 1_450_000_000 },
        ],
      }),
    );
    expect(h).toHaveLength(2);
    expect(h[0].direccion).toBe('baja');
    expect(h[1].direccion).toBeNull();
  });

  it('sin historial, lista vacia', () => {
    expect(historialPrecio(prop())).toEqual([]);
    expect(historialPrecio(prop({ priceHistory: [] }))).toEqual([]);
  });
});

describe('similares', () => {
  it('nunca se incluye a si misma', () => {
    const yo = res({ id: 'INM-202607-0001' });
    expect(similares([yo, res()], prop()).map((r) => r.id)).toEqual(['INM-202607-0002']);
  });

  it('prioriza el mismo sector', () => {
    const items = [res({ id: 'a', sector: 'Manga' }), res({ id: 'b', sector: 'Castillogrande' })];
    expect(similares(items, prop()).map((r) => r.id)).toEqual(['b', 'a']);
  });

  it('a igual sector, ordena por precio parecido', () => {
    const items = [
      res({ id: 'lejos', sector: 'Castillogrande', precio: 200_000_000 }),
      res({ id: 'cerca', sector: 'Castillogrande', precio: 1_400_000_000 }),
    ];
    expect(similares(items, prop()).map((r) => r.id)).toEqual(['cerca', 'lejos']);
  });

  it('respeta el tope', () => {
    const items = Array.from({ length: 9 }, (_, i) => res({ id: `i${i}` }));
    expect(similares(items, prop(), 3)).toHaveLength(3);
  });
});

describe('texto publico', () => {
  it('la ubicacion publica es barrio y ciudad, NUNCA una direccion', () => {
    expect(ubicacionPublica(prop())).toBe('Castillogrande, Cartagena de Indias');
    expect(ubicacionPublica(prop({ geo: { ciudad: 'Cartagena de Indias', barrio: '' } }))).toBe('Cartagena de Indias');
  });

  it('el mensaje de WhatsApp identifica el inmueble por codigo', () => {
    const m = mensajeWhatsApp(prop(), 'visita');
    expect(m).toContain('INM-202607-0001');
    expect(m).toContain('agendar una visita');
  });

  it('la meta description se recorta y nunca supera el limite util', () => {
    const larga = descripcionSeo(prop({ descripcion: 'x'.repeat(400) }));
    expect(larga.length).toBeLessThanOrEqual(158);
    expect(larga.endsWith('…')).toBe(true);
  });

  it('una descripcion corta se completa con HECHOS, no con adjetivos', () => {
    const d = descripcionSeo(prop({ descripcion: 'Bonito.' }));
    expect(d).toContain('Apartamento');
    expect(d).toContain('Castillogrande');
  });

  it('la miga del barrio lleva a SU landing cuando existe, y al SERP cuando no', () => {
    const conZona = migas(prop(), 'marbella');
    expect(conZona[2].href).toBe('/zona/marbella');
    const sinZona = migas(prop());
    expect(sinZona[2].href).toBe('/comprar');
  });

  it('las migas terminan en la pagina actual, sin enlace', () => {
    const m = migas(prop());
    expect(m[0].nombre).toBe('Inicio');
    expect(m[m.length - 1].href).toBeNull();
  });

  it('la ruta canonica usa el slug, y cae al id si no hay slug', () => {
    expect(rutaFicha(prop())).toBe('/inmueble/apartamento-castillogrande-inm-202607-0001');
    expect(rutaFicha({ id: 'INM-1', slug: undefined })).toBe('/inmueble/INM-1');
  });
});

describe('jsonLdInmueble', () => {
  const url = 'https://altorrainmobiliaria.co/inmueble/apartamento-castillogrande-inm-202607-0001';

  it('declara el tipo correcto y la oferta de VENTA', () => {
    const d = jsonLdInmueble(prop(), url, ['https://cdn/x.webp']) as any;
    expect(d['@type']).toBe('RealEstateListing');
    expect(d.about['@type']).toBe('Apartment');
    expect(d.offers.price).toBe(1_450_000_000);
    expect(d.offers.businessFunction).toContain('#Sell');
  });

  it('en arriendo NO usa `price` a secas: usa UnitPriceSpecification por MES', () => {
    const d = jsonLdInmueble(prop({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 8_500_000 } }), url, []) as any;
    expect(d.offers.price).toBeUndefined();
    expect(d.offers.priceSpecification.unitText).toBe('MES');
    expect(d.offers.businessFunction).toContain('#LeaseOut');
  });

  it('NUNCA declara streetAddress (la direccion exacta esta prohibida)', () => {
    const d = jsonLdInmueble(prop(), url, []) as any;
    expect(d.about.address.streetAddress).toBeUndefined();
    expect(JSON.stringify(d)).not.toContain('streetAddress');
  });

  it('addressLocality es la CIUDAD, no el barrio (si no, borra la ciudad del address)', () => {
    const d = jsonLdInmueble(prop(), url, []) as any;
    expect(d.about.address.addressLocality).toBe('Cartagena de Indias');
    expect(d.about.address.addressLocality).not.toBe('Castillogrande');
  });

  it('NUNCA declara `geo`: lat/lng es el centroide del BARRIO, no la posicion del inmueble', () => {
    const d = jsonLdInmueble(prop(), url, []) as any;
    expect(d.about.geo).toBeUndefined();
    expect(JSON.stringify(d)).not.toContain('GeoCoordinates');
  });

  it('NUNCA declara reseñas ni calificaciones', () => {
    const s = JSON.stringify(jsonLdInmueble(prop(), url, []));
    expect(s).not.toContain('aggregateRating');
    expect(s).not.toContain('"review"');
  });

  it('omite los campos sin dato en vez de declararlos vacios', () => {
    const d = jsonLdInmueble(prop({ specs: {}, geo: { ciudad: 'Cartagena de Indias', barrio: 'Manga' }, amenidades: {} }), url, []) as any;
    expect(d.about.numberOfRooms).toBeUndefined();
    expect(d.about.floorSize).toBeUndefined();
    expect(d.about.geo).toBeUndefined();
    expect(d.about.amenityFeature).toBeUndefined();
    expect(d.image).toBeUndefined();
  });

  it('una propiedad comercial no se declara como vivienda', () => {
    const d = jsonLdInmueble(prop({ tipo: 'local' }), url, []) as any;
    expect(d.about['@type']).toBe('Place');
  });
});

describe('gates de publicacion', () => {
  it('un alojamiento SIN RNT no se publica (la ley no lo deja, aunque el tipo si)', () => {
    const sinRnt = prop({ operacion: 'alojamiento', precio: { moneda: 'COP', precioNoche: 400_000 } });
    expect(publicable(sinRnt)).toBe(false);
    expect(publicable(prop({ ...sinRnt, rnt: 'RNT-100001' }))).toBe(true);
  });

  it('venta y arriendo no dependen del RNT', () => {
    expect(publicable(prop())).toBe(true);
    expect(publicable(prop({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 1 } }))).toBe(true);
  });

  it('un RNT en blanco no cuenta como RNT', () => {
    expect(publicable(prop({ operacion: 'alojamiento', rnt: '   ', precio: { moneda: 'COP', precioNoche: 1 } }))).toBe(false);
  });

  it('la matricula solo se exhibe en ARRIENDO y solo en Cartagena (la habilitacion es municipal)', () => {
    const arr = prop({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 1 } });
    expect(exhibeMatricula(arr)).toBe(true);
    expect(exhibeMatricula(prop())).toBe(false); // venta
    expect(exhibeMatricula({ ...arr, geo: { ciudad: 'Barranquilla', barrio: 'Alto Prado' } })).toBe(false);
  });

  it('acepta la ciudad escrita de varias formas', () => {
    const base = { operacion: 'arriendo' as const, precio: { moneda: 'COP' as const, canon: 1 } };
    for (const ciudad of ['Cartagena', 'Cartagena de Indias', 'CARTAGENA DE INDIAS', 'cartagena']) {
      expect(exhibeMatricula(prop({ ...base, geo: { ciudad, barrio: 'Manga' } }))).toBe(true);
    }
  });
});

describe('avisoEstado', () => {
  it('una propiedad disponible no lleva aviso', () => {
    expect(avisoEstado(prop())).toBeNull();
  });

  it('reservado y cerrado avisan, y NINGUNO admite visita', () => {
    const res = avisoEstado(prop({ estado: 'reservado' }))!;
    expect(res.titulo).toBe('Reservado');
    expect(res.admiteVisita).toBe(false);
    const cer = avisoEstado(prop({ estado: 'cerrado' }))!;
    expect(cer.titulo).toBe('Vendido');
    expect(cer.admiteVisita).toBe(false);
  });

  it('en arriendo, cerrado dice "Ya arrendado", no "Vendido"', () => {
    const a = avisoEstado(prop({ estado: 'cerrado', operacion: 'arriendo', precio: { moneda: 'COP', canon: 1 } }))!;
    expect(a.titulo).toBe('Ya arrendado');
  });
});

describe('area: el rotulo sigue al campo', () => {
  it('solo area privada => se rotula Privados, NUNCA Construidos', () => {
    const r = specsVisibles(prop({ specs: { areaPrivadaM2: 90 } }));
    expect(r[0].etiqueta).toBe('Privados');
  });
  it('con area construida manda esa', () => {
    const r = specsVisibles(prop({ specs: { areaConstruidaM2: 142, areaPrivadaM2: 120 } }));
    expect(r[0].etiqueta).toBe('Construidos');
    expect(r[0].valor).toBe('142 m²');
  });
});
