import { describe, it, expect } from 'vitest';
import {
  claseDe,
  construirIndices,
  esPublicada,
  explicarProblema,
  precioDisplay,
  problemasParaPublicar,
  propiedadAResumen,
  proyectoAResumen,
  rutaDeResumen,
} from './catalogo';
import type { ProblemaPublicacion } from './catalogo';
import type { Propiedad } from './propiedades';
import type { Proyecto } from './proyectos';
import { esClaveThumb } from '../media-subida';

// Construcción del índice de catálogo (camino de ESCRITURA, §54.4). Lógica PURA → sin emulador.
// Cubre: filtro de publicadas (anti-oráculo) · sharding · precio por operación · coords nullable ·
// omisiones REPORTADAS (no silenciosas) · DETERMINISMO (idempotencia del rebuild total, cond.1).

function prop(over: Partial<Propiedad> = {}): Propiedad {
  return {
    _version: 1,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-10T00:00:00Z',
    id: 'INM-202607-0001',
    operacion: 'venta',
    vertical: 'vivienda',
    tipo: 'apartamento',
    estado: 'disponible',
    titulo: 'Apto en Bocagrande',
    descripcion: 'desc',
    geo: { ciudad: 'Cartagena', barrio: 'Bocagrande', lat: 10.399, lng: -75.554 },
    specs: { habitaciones: 3, banos: 2, areaConstruidaM2: 120 },
    amenidades: {},
    precio: { moneda: 'COP', valorVenta: 450_000_000 },
    imagenes: ['props/a/thumb.webp'],
    ...over,
  } as Propiedad;
}

describe('esPublicada / precioDisplay', () => {
  it('solo disponible/reservado/cerrado son públicas (espeja las Rules)', () => {
    expect(['disponible', 'reservado', 'cerrado'].every((e) => esPublicada({ estado: e as never }))).toBe(true);
    expect(['borrador', 'en_verificacion', 'inactivo'].some((e) => esPublicada({ estado: e as never }))).toBe(false);
  });

  it('precio de display según operación (arriendo = canon, no administración)', () => {
    expect(precioDisplay({ operacion: 'venta', precio: { moneda: 'COP', valorVenta: 100 } })).toBe(100);
    expect(precioDisplay({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 20, administracion: 5 } })).toBe(20);
    expect(precioDisplay({ operacion: 'alojamiento', precio: { moneda: 'COP', precioNoche: 7 } })).toBe(7);
    expect(precioDisplay({ operacion: 'venta', precio: { moneda: 'COP' } })).toBeNull();
  });
});

describe('propiedadAResumen — card honesta o se OMITE con motivo (nunca inventar, L-29)', () => {
  it('mapea los campos del contrato (titulo/slug obligatorios, coords, thumb, badges reales)', () => {
    const r = propiedadAResumen(prop({ slug: 'apto-bocagrande', verificadoAltorra: true, featured: true }));
    expect('resumen' in r).toBe(true);
    if (!('resumen' in r)) return;
    expect(r.resumen).toMatchObject({
      id: 'INM-202607-0001',
      slug: 'apto-bocagrande',
      titulo: 'Apto en Bocagrande',
      operacion: 'venta',
      precio: 450_000_000,
      sector: 'Bocagrande',
      coords: { lat: 10.399, lng: -75.554 },
      hab: 3,
      ban: 2,
      area: 120,
      thumb: 'props/a/thumb.webp',
      badges: ['verificado', 'destacado'],
      pub: '2026-07-10T00:00:00Z',
    });
  });

  it('sin slug → usa el id; sin coords → null (card SÍ, pin NO)', () => {
    const r = propiedadAResumen(prop({ geo: { ciudad: 'Cartagena', barrio: 'Manga' } }));
    if (!('resumen' in r)) throw new Error('debía mapear');
    expect(r.resumen.slug).toBe('INM-202607-0001');
    expect(r.resumen.coords).toBeNull();
  });

  it('omite CON MOTIVO si no puede pintar card (sin precio / sin imagen / sin título)', () => {
    expect(propiedadAResumen(prop({ precio: { moneda: 'COP' } }))).toEqual({ omitida: { id: 'INM-202607-0001', motivo: 'sin-precio' } });
    expect(propiedadAResumen(prop({ imagenes: [], imagenPortada: undefined }))).toEqual({ omitida: { id: 'INM-202607-0001', motivo: 'sin-imagen' } });
    expect(propiedadAResumen(prop({ titulo: '' }))).toEqual({ omitida: { id: 'INM-202607-0001', motivo: 'sin-titulo' } });
  });
});

describe('construirIndices — rebuild TOTAL idempotente (§54.4 cond.1)', () => {
  it('catálogo VACÍO → los 3 shards existen con items:[] (estado-cero, no borrar)', () => {
    const { indices, omitidas } = construirIndices([], '2026-07-23T00:00:00Z');
    expect(Object.keys(indices).sort()).toEqual(['arriendo', 'dias', 'venta']);
    expect(indices.venta.items).toEqual([]);
    expect(indices.arriendo.items).toEqual([]);
    expect(indices.dias.items).toEqual([]);
    expect(omitidas).toEqual([]);
  });

  it('BORRADOR jamás entra (anti-oráculo) y cada operación va a SU shard', () => {
    const { indices } = construirIndices(
      [
        prop({ id: 'V1', operacion: 'venta' }),
        prop({ id: 'A1', operacion: 'arriendo', precio: { moneda: 'COP', canon: 3_000_000 } }),
        // `rnt` no es adorno: desde §104 un alojamiento sin él NO entra al índice (gate B3). Este
        // fixture lo daba por bueno, o sea que la prueba de sharding modelaba un anuncio ilegal.
        prop({
          id: 'D1',
          operacion: 'alojamiento',
          rnt: 'RNT-100001',
          autorizacionPH: { situacion: 'autoriza-expreso' as const, declaradaEn: '2026-08-26T00:00:00Z' },
          precio: { moneda: 'COP', precioNoche: 400_000 },
        }),
        prop({ id: 'OCULTA', estado: 'borrador' }),
        prop({ id: 'INACTIVA', estado: 'inactivo' }),
      ],
      '2026-07-23T00:00:00Z',
    );
    expect(indices.venta.items.map((i) => i.id)).toEqual(['V1']);
    expect(indices.arriendo.items.map((i) => i.id)).toEqual(['A1']);
    expect(indices.dias.items.map((i) => i.id)).toEqual(['D1']);
    const todos = [...indices.venta.items, ...indices.arriendo.items, ...indices.dias.items].map((i) => i.id);
    expect(todos).not.toContain('OCULTA');
    expect(todos).not.toContain('INACTIVA');
  });

  it('las publicadas que no pintan card se REPORTAN (no desaparecen en silencio)', () => {
    const { indices, omitidas } = construirIndices(
      [prop({ id: 'OK' }), prop({ id: 'NOPRECIO', precio: { moneda: 'COP' } })],
      '2026-07-23T00:00:00Z',
    );
    expect(indices.venta.items.map((i) => i.id)).toEqual(['OK']);
    expect(omitidas).toEqual([{ id: 'NOPRECIO', motivo: 'sin-precio' }]);
  });

  it('DETERMINISTA: el orden de entrada no cambia el resultado (dos rebuilds concurrentes convergen)', () => {
    const a = prop({ id: 'A', updatedAt: '2026-07-01T00:00:00Z' });
    const b = prop({ id: 'B', updatedAt: '2026-07-20T00:00:00Z' });
    const c = prop({ id: 'C', updatedAt: '2026-07-01T00:00:00Z' }); // empata con A → desempata por id
    const r1 = construirIndices([a, b, c], 'T');
    const r2 = construirIndices([c, b, a], 'T'); // MISMO conjunto, otro orden
    expect(r1.indices.venta.items.map((i) => i.id)).toEqual(['B', 'A', 'C']); // pub desc, id asc
    expect(JSON.stringify(r2)).toBe(JSON.stringify(r1)); // byte-idéntico
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 🔴 EL OTRO ESCRITOR (§103). `admin.html` y el portal escriben la MISMA colección `propiedades`
// con modelos INCOMPATIBLES, y hoy el panel legacy es el ÚNICO CRUD que existe. La carga de abajo
// no es inventada: son los campos EXACTOS que arma `js/admin-properties.js` al guardar.
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/** Documento tal cual lo deja `admin.html` (plano, `operacion` de la ruta vieja, precio entero). */
function propLegacy(over: Record<string, unknown> = {}): Propiedad {
  return {
    id: 'ALT-045',
    titulo: 'Apartamento en Bocagrande',
    tipo: 'apartamento',
    operacion: 'comprar',            // el select legacy: comprar | arrendar | dias
    estado: 'disponible',            // ✅ SÍ pasa el filtro de publicadas
    ciudad: 'Cartagena',
    barrio: 'Bocagrande',            // plano — el portal lo espera en `geo.barrio`
    precio: 450_000_000,             // entero — el portal espera { valorVenta | canon | precioNoche }
    habitaciones: 3,                 // planos — el portal los espera en `specs`
    banos: 2,
    sqm: 120,
    coords: { lat: 10.399, lng: -75.554 }, // plano — el portal los espera en `geo`
    imagenes: ['https://x/1.webp'],
    imagen: 'https://x/1.webp',
    _version: 1,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-10T00:00:00Z',
    ...over,
  } as unknown as Propiedad;
}

describe('🔴 documentos del panel LEGACY en la misma colección', () => {
  it('pasan el filtro de publicadas: el catálogo SÍ los lee', () => {
    expect(esPublicada(propLegacy())).toBe(true);
  });

  it('se omiten con motivo `esquema-legacy`, NO con un motivo que despista', () => {
    // Antes de §103 esto salía `sin-precio`, que manda a buscar un precio que SÍ está ahí —
    // solo que en otra forma. Un diagnóstico equivocado cuesta horas el día del cutover.
    const r = propiedadAResumen(propLegacy());
    expect('omitida' in r && r.omitida.motivo).toBe('esquema-legacy');
  });

  it('lo detecta por la OPERACIÓN aunque el precio ya venga migrado', () => {
    const r = propiedadAResumen(propLegacy({ precio: { moneda: 'COP', valorVenta: 450_000_000 } }));
    expect('omitida' in r && r.omitida.motivo).toBe('esquema-legacy');
  });

  it('lo detecta por el PRECIO aunque la operación ya venga migrada', () => {
    const r = propiedadAResumen(propLegacy({ operacion: 'venta' }));
    expect('omitida' in r && r.omitida.motivo).toBe('esquema-legacy');
  });

  it('una propiedad del modelo NUEVO no se marca nunca como legacy', () => {
    const r = propiedadAResumen(prop());
    expect('resumen' in r).toBe(true);
  });

  it('el índice sale VACÍO con un catálogo entero del panel viejo — y lo REPORTA', () => {
    // Este es el fallo real: 5 propiedades vivas en Firestore, SERP sin resultados, cero errores.
    const { indices, omitidas } = construirIndices(
      [propLegacy({ id: 'ALT-1' }), propLegacy({ id: 'ALT-2', operacion: 'arrendar' })],
      '2026-08-21T00:00:00Z',
    );
    expect(indices.venta.items).toHaveLength(0);
    expect(indices.arriendo.items).toHaveLength(0);
    expect(omitidas.map((o) => o.motivo)).toEqual(['esquema-legacy', 'esquema-legacy']);
  });
});

describe('🔴 gate LEGAL del RNT en el LISTADO, no solo en la ficha (§104)', () => {
  const aloj = (over: Partial<Propiedad> = {}) =>
    prop({ operacion: 'alojamiento', precio: { moneda: 'COP', precioNoche: 350_000 }, ...over });

  it('un alojamiento SIN RNT no entra al índice — la card ya sería publicidad ilegal', () => {
    const r = propiedadAResumen(aloj());
    expect('omitida' in r && r.omitida.motivo).toBe('sin-rnt');
  });

  it('con RNT y con el reglamento de PH en regla, entra con normalidad', () => {
    expect('resumen' in propiedadAResumen(aloj({ rnt: 'RNT-100001', autorizacionPH: { situacion: 'autoriza-expreso' as const, declaradaEn: '2026-08-26T00:00:00Z' } }))).toBe(true);
  });

  it('🔴 con RNT pero SIN declarar la PH tampoco entra, y el motivo lo dice (§174)', () => {
    // El motivo importa tanto como el bloqueo: cuando los dos gates compartian el codigo
    // `sin-rnt`, a quien le faltaba el permiso de la copropiedad se le mandaba a buscar el RNT
    // que ya tenia.
    const r = propiedadAResumen(aloj({ rnt: 'RNT-100001' }));
    expect('omitida' in r && r.omitida.motivo).toBe('sin-autorizacion-ph');
  });

  it('🔴 el reglamento que CALLA se trata como el que prohibe', () => {
    const silente = aloj({
      rnt: 'RNT-100001',
      autorizacionPH: { situacion: 'sin-autorizacion' as const, declaradaEn: '2026-08-26T00:00:00Z' },
    });
    const r = propiedadAResumen(silente);
    expect('omitida' in r && r.omitida.motivo).toBe('sin-autorizacion-ph');
  });

  it('fuera de propiedad horizontal no hay nada que autorizar', () => {
    const casa = aloj({
      rnt: 'RNT-100001',
      autorizacionPH: { situacion: 'no-aplica' as const, declaradaEn: '2026-08-26T00:00:00Z' },
    });
    expect('resumen' in propiedadAResumen(casa)).toBe(true);
  });

  it('un RNT en blanco NO cuenta como RNT (fail-closed)', () => {
    const r = propiedadAResumen(aloj({ rnt: '   ' }));
    expect('omitida' in r && r.omitida.motivo).toBe('sin-rnt');
  });

  it('venta y arriendo no piden RNT: el gate es solo del turístico', () => {
    expect('resumen' in propiedadAResumen(prop())).toBe(true);
    expect('resumen' in propiedadAResumen(prop({ operacion: 'arriendo', precio: { moneda: 'COP', canon: 4_500_000 } }))).toBe(true);
  });

  it('listado y ficha NO pueden discrepar: lo que el índice omite, la ficha tampoco publica', () => {
    const { indices, omitidas } = construirIndices([aloj({ id: 'INM-202608-0001' })], '2026-08-21T00:00:00Z');
    expect(indices.dias.items).toHaveLength(0);
    expect(omitidas[0].motivo).toBe('sin-rnt');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// §108 — EL CONTRATO DEL ESCRITOR. La respuesta a §103: el formulario NO puede dejar guardar algo
// que el índice descarte en silencio, y la única forma de garantizarlo es que llame a los predicados
// del lector en vez de copiar sus condiciones. Este bloque ES ese contrato.
// ═══════════════════════════════════════════════════════════════════════════════════════════════

describe('problemasParaPublicar — el escritor pregunta con las reglas del lector', () => {
  it('🎯 EL CONTRATO: lo que no tiene problemas, el índice NO lo omite', () => {
    const p = prop();
    expect(problemasParaPublicar(p)).toEqual([]);
    expect(construirIndices([p], '2026-08-22T00:00:00Z').omitidas).toEqual([]);
  });

  it('🎯 Y AL REVÉS: si el índice lo omite, el escritor tenía que haberlo dicho', () => {
    // Recorre todas las formas de romper una propiedad y comprueba las dos direcciones a la vez.
    const rotas: Propiedad[] = [
      prop({ titulo: '' }),
      prop({ precio: { moneda: 'COP' } }),
      prop({ imagenes: [], imagenPortada: '' }),
      prop({ operacion: 'alojamiento', precio: { moneda: 'COP', precioNoche: 1 } }), // sin RNT
      propLegacy() as Propiedad,
    ];
    for (const r of rotas) {
      const problemas = problemasParaPublicar(r);
      const { omitidas } = construirIndices([r], '2026-08-22T00:00:00Z');
      expect(problemas.length).toBeGreaterThan(0);
      // El motivo que reporta el índice SIEMPRE está entre los que el escritor vio venir.
      expect(problemas).toContain(omitidas[0].motivo);
    }
  });

  it('los enseña TODOS de una vez, no de uno en uno', () => {
    // Un formulario que solo dice el primer fallo obliga a guardar cuatro veces para enterarse de todo.
    const p = prop({ titulo: '', precio: { moneda: 'COP' }, imagenes: [], imagenPortada: '' });
    const problemas = problemasParaPublicar(p);
    expect(problemas).toContain('sin-titulo');
    expect(problemas).toContain('sin-precio');
    expect(problemas).toContain('sin-imagen');
  });

  it('un borrador se avisa, pero no como si estuviera roto', () => {
    const p = prop({ estado: 'borrador' });
    expect(problemasParaPublicar(p)).toEqual(['estado-no-publicado']);
  });

  it('`cerrado` y `reservado` SÍ salen publicados: no son un problema', () => {
    // Contraintuitivo a propósito (decisión de SEO): marcar «cerrado» NO retira el inmueble, solo
    // cambia el aviso. Quien quiera retirarlo de verdad usa `inactivo`.
    expect(problemasParaPublicar(prop({ estado: 'cerrado' }))).toEqual([]);
    expect(problemasParaPublicar(prop({ estado: 'reservado' }))).toEqual([]);
    expect(problemasParaPublicar(prop({ estado: 'inactivo' }))).toEqual(['estado-no-publicado']);
  });

  it('todo problema tiene un texto para una persona', () => {
    const todos: ProblemaPublicacion[] = [
      'estado-no-publicado', 'sin-titulo', 'esquema-legacy', 'sin-rnt', 'sin-precio', 'sin-imagen',
    ];
    for (const m of todos) {
      expect(explicarProblema(m).length).toBeGreaterThan(20);
      expect(explicarProblema(m)).not.toContain('undefined');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// §284.5 — OBRA NUEVA EN EL ÍNDICE. Ésta era LA pieza que bloqueaba la vertical entera: el índice
// guardaba `precio` como un entero y un proyecto tiene RANGO. Lo que se fija aquí no es que
// «funcione», es que el rango sea DERIVADO (imposible de desviar de sus tipologías), que la card no
// se contradiga consigo misma, y que un inmueble corriente siga saliendo BYTE A BYTE igual que antes.
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function pry(over: Partial<Proyecto> = {}): Proyecto {
  return {
    _version: 1,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z',
    id: 'PRY-202608-0001',
    slug: 'torre-marea',
    nombre: 'Torre Marea',
    constructora: 'Constructora Caribe S.A.S',
    licenciaConstruccion: 'LC-2026-0345',
    curaduria: 'Curaduria Urbana No. 1 de Cartagena',
    estadoObra: 'preventa',
    descripcion: 'Proyecto frente al mar.',
    geo: { ciudad: 'Cartagena', barrio: 'Bocagrande', lat: 10.399, lng: -75.554 },
    tipologias: [
      { nombre: 'Tipo B', tipo: 'apartamento', areaM2: 96, habitaciones: 3, banos: 2, desde: 720_000_000 },
      { nombre: 'Tipo A', tipo: 'apartamento', areaM2: 68, habitaciones: 2, banos: 2, desde: 450_000_000 },
    ],
    imagenes: ['pry/marea/portada.webp'],
    estado: 'disponible',
    ...over,
  } as Proyecto;
}

describe('proyectoAResumen — el precio es DERIVADO, no un campo que alguien teclea (§284.3)', () => {
  it('el «desde» sale de la tipología más barata y el «hasta» de la más cara', () => {
    const r = proyectoAResumen(pry());
    expect('resumen' in r).toBe(true);
    if (!('resumen' in r)) return;
    expect(r.resumen.precio).toBe(450_000_000);
    expect(r.resumen.precioHasta).toBe(720_000_000);
  });

  it('🎯 la card NO se contradice: tipo/hab/área son los de la tipología que pone el «Desde»', () => {
    // El orden del array es el que alguien tecleó: la de entrada es «Tipo A», la SEGUNDA.
    const r = proyectoAResumen(pry());
    if (!('resumen' in r)) throw new Error('debia entrar');
    expect(r.resumen.precio).toBe(450_000_000);
    expect(r.resumen.hab).toBe(2);
    expect(r.resumen.ban).toBe(2);
    expect(r.resumen.area).toBe(68);
  });

  it('una sola tipología NO es un rango: `precioHasta` ni siquiera viaja', () => {
    const r = proyectoAResumen(pry({ tipologias: [pry().tipologias[1]] }));
    if (!('resumen' in r)) throw new Error('debia entrar');
    expect(r.resumen.precioHasta).toBeUndefined();
    expect(r.resumen.precio).toBe(450_000_000);
  });

  it('un 0 colado NO pone «Desde $0»: se descarta la tipología, no se arrastra', () => {
    const conCero = pry({
      tipologias: [
        { nombre: 'Fantasma', tipo: 'apartamento', areaM2: 50, habitaciones: 1, banos: 1, desde: 0 },
        ...pry().tipologias,
      ],
    });
    const r = proyectoAResumen(conCero);
    if (!('resumen' in r)) throw new Error('debia entrar');
    expect(r.resumen.precio).toBe(450_000_000);
  });

  it('va al shard de VENTA, con su clase y el estado de obra como CLAVE (no como etiqueta)', () => {
    const { indices } = construirIndices([], '2026-08-22T00:00:00Z', [pry()]);
    expect(indices.venta.items).toHaveLength(1);
    expect(indices.arriendo.items).toHaveLength(0);
    expect(indices.dias.items).toHaveLength(0);
    expect(indices.venta.items[0]).toMatchObject({
      id: 'PRY-202608-0001',
      operacion: 'venta',
      clase: 'proyecto',
      badges: ['preventa'],
      sector: 'Bocagrande',
    });
  });

  it('🧾 sin LICENCIA no entra — el mismo criterio que las Rules (§286), en el dato', () => {
    const { indices, omitidas } = construirIndices([], '2026-08-22T00:00:00Z', [
      pry({ licenciaConstruccion: undefined }),
    ]);
    expect(indices.venta.items).toHaveLength(0);
    expect(omitidas).toEqual([{ id: 'PRY-202608-0001', motivo: 'sin-licencia' }]);
  });

  it('un «70% vendido» sin quién lo dijo bloquea la publicación (Ley 1480)', () => {
    const { omitidas } = construirIndices([], '2026-08-22T00:00:00Z', [
      pry({ porcentajeVendido: { valor: 70, fuente: '  ', fecha: '2026-08-01T00:00:00Z' } }),
    ]);
    expect(omitidas[0].motivo).toBe('vendido-sin-fuente');
  });

  it('un BORRADOR no se omite: no se mira (§54.4 cond.4, igual que una propiedad)', () => {
    const { indices, omitidas } = construirIndices([], '2026-08-22T00:00:00Z', [pry({ estado: 'borrador' })]);
    expect(indices.venta.items).toHaveLength(0);
    expect(omitidas).toEqual([]); // ni siquiera se reporta: nunca fue candidato
  });

  it('`agotado` SÍ sale — una ficha vendida sigue siendo una ficha legítima', () => {
    const { indices } = construirIndices([], '2026-08-22T00:00:00Z', [pry({ estado: 'agotado' })]);
    expect(indices.venta.items).toHaveLength(1);
  });

  it('el rebuild sigue siendo DETERMINISTA con las dos colecciones mezcladas (§54.4 cond.1)', () => {
    const props = [prop({ id: 'INM-202607-0001' }), prop({ id: 'INM-202607-0002' })];
    const pryes = [pry(), pry({ id: 'PRY-202608-0002', slug: 'claustro-1620' })];
    const a = construirIndices(props, '2026-08-22T00:00:00Z', pryes);
    const b = construirIndices([...props].reverse(), '2026-08-22T00:00:00Z', [...pryes].reverse());
    expect(JSON.stringify(a.indices)).toBe(JSON.stringify(b.indices));
  });
});

describe('rutaDeResumen / claseDe — a dónde lleva la card (§284.5)', () => {
  it('🔴 un proyecto NO enlaza a /inmueble: ahí vive un 404 con aspecto de card correcta', () => {
    const { indices } = construirIndices([], '2026-08-22T00:00:00Z', [pry()]);
    expect(rutaDeResumen(indices.venta.items[0])).toBe('/proyecto/torre-marea');
  });

  it('sin `clase` es un inmueble — el default vive en UN sitio', () => {
    const r = propiedadAResumen(prop({ slug: 'apto-bocagrande' }));
    if (!('resumen' in r)) throw new Error('debia entrar');
    expect(r.resumen.clase).toBeUndefined();
    expect(claseDe(r.resumen)).toBe('inmueble');
    expect(rutaDeResumen(r.resumen)).toBe('/inmueble/apto-bocagrande');
  });

  it('sin slug cae al id, que siempre existe', () => {
    expect(rutaDeResumen({ id: 'PRY-1', slug: '', clase: 'proyecto' })).toBe('/proyecto/PRY-1');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// §304 — EL ÍNDICE LLEVA EL THUMB, NO LA FOTO. El contrato de `CatalogoResumen.thumb` decía
// «<150KB» mientras se le escribía la imagen de 1600 px: nueve tarjetas, hasta 27 MB. Esta prueba
// es lo que impide que vuelva, y vale para las DOS entidades del shard de venta.
// ═══════════════════════════════════════════════════════════════════════════════════════════════

describe('thumb del catálogo — la miniatura, nunca la foto (§304)', () => {
  it('🎯 una propiedad con foto de R2 entra al índice con la clave del THUMB', () => {
    const r = propiedadAResumen(prop({ imagenes: ['props/INM-202607-0001/1.webp'], imagenPortada: undefined }));
    if (!('resumen' in r)) throw new Error('debia entrar');
    expect(r.resumen.thumb).toBe('props/INM-202607-0001/1-thumb.webp');
    expect(esClaveThumb(r.resumen.thumb)).toBe(true);
  });

  it('🎯 y un PROYECTO de obra nueva también: el mismo shard, la misma regla', () => {
    const { indices } = construirIndices([], '2026-08-22T00:00:00Z', [
      pry({ imagenes: ['props/INM-202608-0009/1.webp'], imagenPortada: undefined }),
    ]);
    expect(indices.venta.items[0].thumb).toBe('props/INM-202608-0009/1-thumb.webp');
  });

  it('respeta `imagenPortada` cuando la hay, y le saca SU thumb', () => {
    const r = propiedadAResumen(prop({ imagenPortada: 'props/INM-202607-0001/7.webp' }));
    if (!('resumen' in r)) throw new Error('debia entrar');
    expect(r.resumen.thumb).toBe('props/INM-202607-0001/7-thumb.webp');
  });

  it('🔴 los datos DEMO salen intactos: no se les inventa una miniatura que nadie subió', () => {
    const r = propiedadAResumen(prop({ imagenes: ['/assets/villa-pool.webp'], imagenPortada: undefined }));
    if (!('resumen' in r)) throw new Error('debia entrar');
    expect(r.resumen.thumb).toBe('/assets/villa-pool.webp');
  });

  it('sin imagen sigue omitiéndose por `sin-imagen`, no entrando con un thumb vacío', () => {
    const r = propiedadAResumen(prop({ imagenes: [], imagenPortada: undefined }));
    expect(r).toEqual({ omitida: { id: 'INM-202607-0001', motivo: 'sin-imagen' } });
  });
});

describe('NO-REGRESIÓN — un inmueble sale exactamente igual que antes de la vertical', () => {
  it('la proyección de una propiedad no ganó ni un campo', () => {
    const r = propiedadAResumen(prop({ slug: 'apto-bocagrande' }));
    if (!('resumen' in r)) throw new Error('debia entrar');
    expect(r.resumen.precioHasta).toBeUndefined();
    expect(r.resumen.clase).toBeUndefined();
  });

  it('`construirIndices` sin proyectos da el MISMO byte que con el tercer argumento vacío', () => {
    const props = [
      prop(),
      prop({ id: 'INM-202607-0002', operacion: 'arriendo', precio: { moneda: 'COP', canon: 4_000_000 } }),
    ];
    const sin = construirIndices(props, '2026-08-22T00:00:00Z');
    const con = construirIndices(props, '2026-08-22T00:00:00Z', []);
    expect(JSON.stringify(sin)).toBe(JSON.stringify(con));
  });
});
