import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import FichaInmueble from './FichaInmueble.astro';
import type { Propiedad } from '../lib/domain/propiedades';
import type { CatalogoResumen } from '../lib/domain/catalogo';
import { juzgarEstadias, muestraRnt, textoVisible } from '../../scripts/lib/senales-estadia.mjs';

/*
 * LA FICHA DE UN ALOJAMIENTO, RENDERIZADA (§329). El dominio ya prueba que sin RNT no hay panel de
 * precio (`ficha-estancia.test.ts`), pero la plantilla puede pintar un precio por noche FUERA del
 * panel y nada se ponía en rojo: la revisión adversarial lo encontró en el «Historial de precio», que
 * todo alta real trae. Y la sonda del gate no basta —su ventana de 400 caracteres alcanzaba el RNT de
 * la ficha técnica y daba ese historial por bueno (control negativo de §329)—, así que aquí se mira la
 * ESTRUCTURA: cada importe por noche vive en un bloque que lleva SU número, y fuera no hay ninguno.
 */

const HOY_ISO = '2026-10-10T12:00:00.000Z';

function aloj(over: Partial<Propiedad> = {}): Propiedad {
  return {
    _version: 1,
    createdAt: HOY_ISO,
    updatedAt: HOY_ISO,
    id: 'INM-202610-0001',
    slug: 'casa-prueba',
    operacion: 'alojamiento',
    vertical: 'turistico',
    tipo: 'casa',
    estado: 'disponible',
    titulo: 'Casa con piscina en el Centro',
    descripcion: 'Casa colonial restaurada.\n\nTres alcobas y una terraza.',
    geo: { ciudad: 'Cartagena de Indias', zona: 'Centro', barrio: 'Centro Histórico', lat: 10.42, lng: -75.55 },
    specs: { habitaciones: 4, banos: 3 },
    // El vocabulario del PANEL (`/gestion` guarda la etiqueta), que es el de producción.
    amenidades: { Piscina: true, 'Portería 24h': true },
    precio: { moneda: 'COP', precioNoche: 850_000, precioAseo: 180_000 },
    // Lo que abre TODO alta (`alta-propiedad.ts`): el historial que se colaba sin RNT.
    priceHistory: [{ fecha: HOY_ISO, valor: 850_000 }],
    rnt: '100001',
    autorizacionPH: { situacion: 'no-aplica', declaradaEn: HOY_ISO },
    imagenes: ['/assets/villa-pool.webp', '/assets/villa-modern.webp'],
    imagenPortada: '/assets/villa-pool.webp',
    verificadoAltorra: true,
    resenas: { promedio: 4.8, n: 12, actualizado: HOY_ISO },
    ...over,
  } as Propiedad;
}

const SIMILAR: CatalogoResumen = {
  id: 'INM-202610-0002',
  slug: 'otra-casa',
  titulo: 'Otra casa en el Centro',
  operacion: 'alojamiento',
  tipo: 'casa',
  precio: 650_000,
  sector: 'Centro Histórico',
  coords: null,
  thumb: '/assets/chalet-dusk.webp',
  pub: HOY_ISO,
  rnt: '100002',
};

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

const render = (p: Propiedad, similares: CatalogoResumen[] = []) =>
  container.renderToString(FichaInmueble, { props: { p, similares, canonical: 'https://altorrainmobiliaria.co/inmueble/x' } });

/**
 * Los bloques `<tag …class="clase…">…</tag>` del HTML, contando aperturas y cierres del MISMO tag (la
 * plantilla anida `div` dentro de `div`). Devuelve cada bloque y el HTML sin ellos.
 */
function recortar(html: string, tag: string, clase: string): { bloques: string[]; resto: string } {
  const abre = new RegExp(`<${tag}\\b[^>]*\\bclass="${clase}[\\s"]`, 'g');
  const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  const bloques: string[] = [];
  let resto = '';
  let hecho = 0;
  for (const m of html.matchAll(abre)) {
    if (m.index < hecho) continue;
    tagRe.lastIndex = m.index;
    let abiertos = 0;
    let fin = html.length;
    for (let t = tagRe.exec(html); t; t = tagRe.exec(html)) {
      abiertos += t[1] ? -1 : 1;
      if (!abiertos) { fin = t.index + t[0].length; break; }
    }
    bloques.push(html.slice(m.index, fin));
    resto += html.slice(hecho, m.index);
    hecho = fin;
  }
  return { bloques, resto: resto + html.slice(hecho) };
}

const juicio = (html: string) => {
  const { texto, ocultos } = textoVisible(html);
  return { texto, ...juzgarEstadias(texto, ocultos) };
};

describe('ficha de un alojamiento renderizada — ningún precio por noche sin SU RNT', () => {
  it('cada importe vive en la tarjeta de precio o en una similar que lleva su número; fuera, ninguno', async () => {
    const html = await render(aloj(), [SIMILAR]);

    const panel = recortar(html, 'div', 'fe-book');
    expect(panel.bloques).toHaveLength(1);
    const tarjeta = juicio(panel.bloques[0]);
    expect(tarjeta.importes).toBeGreaterThan(0); // por noche, desglose y total
    expect(muestraRnt(tarjeta.texto)).toBe(true);
    expect(tarjeta.texto).toContain('RNT 100001');

    const similares = recortar(panel.resto, 'article', 'alt-pcard');
    expect(similares.bloques).toHaveLength(1);
    for (const b of similares.bloques) {
      const j = juicio(b);
      expect(j.importes).toBeGreaterThan(0);
      expect(j.texto).toContain('RNT 100002');
    }

    // Lo que queda —cabecera, galería, «Lo que ofrece», ficha técnica, ubicación— no anuncia precio
    // por noche. El historial de precio era justo esto.
    expect(juicio(similares.resto).importes).toBe(0);
    expect(html).not.toContain('Historial de precio');
  });

  it('reservado: avisa, no pide fechas, y el precio sigue con su RNT', async () => {
    const html = await render(aloj({ estado: 'reservado' }));
    const { bloques, resto } = recortar(html, 'div', 'fe-book');
    expect(bloques[0]).toContain('Reservado.');
    expect(bloques[0]).not.toContain('id="fe-pedir"');
    expect(juicio(bloques[0]).texto).toContain('RNT 100001');
    expect(juicio(resto).importes).toBe(0);
  });

  it('sin RNT exhibible no hay ficha de alojamiento: tampoco hay precio por noche en ninguna parte', async () => {
    const html = await render(aloj({ rnt: 'pendiente' }));
    expect(html).not.toContain('fe-book');
    expect(juicio(html).importes).toBe(0);
  });

  it('el panel abre con la autorización de datos SIN marcar y el código del inmueble a la vista', async () => {
    const html = await render(aloj());
    expect(html).toMatch(/<input[^>]*id="fe-auth"[^>]*>/);
    expect(html.match(/<input[^>]*id="fe-auth"[^>]*>/)![0]).not.toMatch(/\bchecked\b/);
    expect(juicio(html).texto).toContain('Código INM-202610-0001');
  });
});

describe('venta y arriendo siguen con su ficha de siempre', () => {
  it('una venta conserva su historial de precio y no pinta el panel de estancia', async () => {
    const html = await render(
      aloj({ operacion: 'venta', vertical: 'vivienda', precio: { moneda: 'COP', valorVenta: 900_000_000 }, priceHistory: [{ fecha: HOY_ISO, valor: 900_000_000 }] }),
    );
    expect(html).toContain('Historial de precio');
    expect(html).not.toContain('fe-book');
  });
});
