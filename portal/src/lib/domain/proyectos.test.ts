/*
 * El modelo de obra nueva (§284). Cada prueba defiende una decisión, no una línea.
 */
import { describe, expect, it } from 'vitest';
import {
  explicarProblemaProyecto,
  problemasParaPublicarProyecto,
  puedePublicarseProyecto,
  jsonLdProyecto,
  rangoDePrecios,
  PROBLEMAS_PROYECTO,
  type Proyecto,
  type Tipologia,
} from './proyectos';

const tipo = (nombre: string, desde: number, over: Partial<Tipologia> = {}): Tipologia => ({
  nombre, tipo: 'apartamento', areaM2: 62, habitaciones: 2, banos: 2, desde, ...over,
});

const proyecto = (over: Partial<Proyecto> = {}): Proyecto => ({
  _version: 1,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
  id: 'PRY-202608-0001',
  slug: 'torre-ejemplo',
  nombre: 'Torre Ejemplo',
  constructora: 'Constructora Ejemplo S.A.S.',
  licenciaConstruccion: 'LC-2026-0001',
  curaduria: 'Curaduría Urbana No. 1 de Cartagena',
  estadoObra: 'preventa',
  descripcion: 'Proyecto de ejemplo.',
  geo: { ciudad: 'Cartagena', barrio: 'Manga' },
  tipologias: [tipo('1 alcoba', 320_000_000), tipo('2 alcobas', 450_000_000), tipo('3 alcobas', 610_000_000)],
  imagenes: ['pry/a/portada.webp'],
  estado: 'disponible',
  ...over,
});

describe('rangoDePrecios — el precio del proyecto se DERIVA, no se teclea', () => {
  it('sale del mínimo y el máximo de sus tipologías', () => {
    expect(rangoDePrecios(proyecto().tipologias)).toEqual({ desde: 320_000_000, hasta: 610_000_000 });
  });

  it('con una sola tipología, desde y hasta coinciden — y eso es correcto', () => {
    expect(rangoDePrecios([tipo('única', 500_000_000)])).toEqual({ desde: 500_000_000, hasta: 500_000_000 });
  });

  it('🔴 un precio corrupto NO arrastra el «Desde» a cero', () => {
    // Un 0 colado pondría «Desde $0» en el listado, que es justo la cifra que se publica y nadie
    // mira dos veces. Se descarta la tipología, no se hunde el rango.
    const r = rangoDePrecios([tipo('mala', 0), tipo('buena', 450_000_000), tipo('peor', Number.NaN)]);
    expect(r).toEqual({ desde: 450_000_000, hasta: 450_000_000 });
  });

  it('sin ninguna tipología con precio devuelve null — que NO es un rango de cero', () => {
    expect(rangoDePrecios([])).toBeNull();
    expect(rangoDePrecios([tipo('mala', 0)])).toBeNull();
  });
});

describe('problemasParaPublicarProyecto — dice QUÉ falta, no «no se puede»', () => {
  it('un proyecto completo se publica', () => {
    expect(problemasParaPublicarProyecto(proyecto())).toEqual([]);
    expect(puedePublicarseProyecto(proyecto())).toBe(true);
  });

  it('🔴 sin LICENCIA no se publica: es lo que hace comprobable que el proyecto existe', () => {
    // La diferencia entre «este desarrollo existe» y «alguien nos mandó unos renders» (§270 encontró
    // seis proyectos inventados servidos, uno rozando el nombre de un desarrollo real).
    expect(problemasParaPublicarProyecto(proyecto({ licenciaConstruccion: undefined }))).toContain('sin-licencia');
    expect(problemasParaPublicarProyecto(proyecto({ licenciaConstruccion: '   ' }))).toContain('sin-licencia');
  });

  it('🔴 sin CONSTRUCTORA tampoco: en obra nueva quien vende es ella', () => {
    expect(problemasParaPublicarProyecto(proyecto({ constructora: '' }))).toContain('sin-constructora');
  });

  it('sin tipologías da «sin-tipologias» y NO además «sin-precio» — un motivo por causa', () => {
    const p = problemasParaPublicarProyecto(proyecto({ tipologias: [] }));
    expect(p).toContain('sin-tipologias');
    expect(p).not.toContain('sin-precio');
  });

  it('con tipologías pero ninguna con precio, el motivo es «sin-precio»', () => {
    expect(problemasParaPublicarProyecto(proyecto({ tipologias: [tipo('x', 0)] }))).toContain('sin-precio');
  });

  it('🔴 un «% vendido» sin quién lo dijo BLOQUEA la publicación', () => {
    // «70% vendido» es una afirmación de urgencia —de las que persigue la Ley 1480— y no la mide
    // ALTORRA. O viene con su fuente, o no sale.
    const sinFuente = proyecto({ porcentajeVendido: { valor: 70, fuente: '', fecha: '2026-08-01' } });
    expect(problemasParaPublicarProyecto(sinFuente)).toContain('vendido-sin-fuente');
    const conFuente = proyecto({ porcentajeVendido: { valor: 70, fuente: 'Constructora Ejemplo', fecha: '2026-08-01' } });
    expect(problemasParaPublicarProyecto(conFuente)).toEqual([]);
  });

  it('un borrador no sale, aunque esté completo', () => {
    expect(problemasParaPublicarProyecto(proyecto({ estado: 'borrador' }))).toEqual(['estado-no-publicado']);
  });

  it('«agotado» SÍ sale: un proyecto vendido sigue siendo una página que Google conoce', () => {
    expect(problemasParaPublicarProyecto(proyecto({ estado: 'agotado' }))).toEqual([]);
  });
});

describe('explicarProblemaProyecto — hay texto para TODOS, y lo prueba el tipo', () => {
  it('ningún motivo se queda sin explicación', () => {
    // 🎯 Si alguien añade un motivo a `PROBLEMAS_PROYECTO` y no su texto, el `switch` exhaustivo lo
    // caza en compilación; esta prueba caza además el texto vacío, que compila igual de bien.
    for (const m of PROBLEMAS_PROYECTO) {
      expect(explicarProblemaProyecto(m).length).toBeGreaterThan(20);
    }
  });
});

describe('jsonLdProyecto — un Offer por tipología, y el bug de La Haus cortado en la puerta', () => {
  const URL = 'https://altorrainmobiliaria.co/proyecto/torre-ejemplo';

  it('emite un Offer por cada tipología con precio, con su Accommodation dentro', () => {
    const doc = jsonLdProyecto(proyecto(), URL, ['a.webp']);
    expect(doc).not.toBeNull();
    const ofertas = (doc as Record<string, unknown>).offers as Array<Record<string, unknown>>;
    expect(ofertas).toHaveLength(3);
    expect(ofertas[0]).toMatchObject({
      '@type': 'Offer',
      priceCurrency: 'COP',
      price: 320_000_000,
      businessFunction: 'http://purl.org/goodrelations/v1#Sell',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Constructora Ejemplo S.A.S.' },
    });
    expect(ofertas[0].itemOffered).toMatchObject({
      '@type': 'Accommodation',
      name: '1 alcoba',
      numberOfRooms: 2,
      numberOfBathroomsTotal: 2,
      floorSize: { '@type': 'QuantitativeValue', value: 62, unitCode: 'MTK' },
    });
  });

  it('🔴 NO emite AggregateOffer — su definición es «un producto, varios vendedores», no la nuestra', () => {
    const json = JSON.stringify(jsonLdProyecto(proyecto(), URL));
    expect(json).not.toContain('AggregateOffer');
    // Y tampoco lo que §95.3 prohíbe en el resto del portal:
    expect(json).not.toContain('streetAddress');
    expect(json).not.toContain('aggregateRating');
    expect(json).not.toContain('priceValidUntil');
  });

  it('🐛 el bug de La Haus: una URL sin resolver NO se emite', () => {
    // Su ficha sirve "url":"undefined/pd/medellin/vitral". Un JSON-LD roto no falla: se indexa.
    expect(jsonLdProyecto(proyecto(), 'undefined/proyecto/torre-ejemplo')).toBeNull();
    expect(jsonLdProyecto(proyecto(), '/proyecto/torre-ejemplo')).toBeNull();
    expect(jsonLdProyecto(proyecto(), 'https://x.co/undefined/torre')).toBeNull();
  });

  it('🔴 un proyecto que NO se puede publicar tampoco se AFIRMA en JSON-LD', () => {
    // Un dato estructurado es una afirmación legible por máquina. No vamos a decir en JSON lo que la
    // página se niega a mostrar.
    expect(jsonLdProyecto(proyecto({ licenciaConstruccion: undefined }), URL)).toBeNull();
    expect(jsonLdProyecto(proyecto({ estado: 'borrador' }), URL)).toBeNull();
  });

  it('un proyecto agotado se declara SoldOut, no desaparece', () => {
    const doc = jsonLdProyecto(proyecto({ estado: 'agotado' }), URL);
    const ofertas = (doc as Record<string, unknown>).offers as Array<Record<string, unknown>>;
    expect(ofertas[0].availability).toBe('https://schema.org/SoldOut');
  });

  it('una tipología sin precio no genera una oferta de cero', () => {
    const doc = jsonLdProyecto(proyecto({ tipologias: [tipo('a', 300_000_000), tipo('mala', 0)] }), URL);
    const ofertas = (doc as Record<string, unknown>).offers as Array<Record<string, unknown>>;
    expect(ofertas).toHaveLength(1);
  });
});
