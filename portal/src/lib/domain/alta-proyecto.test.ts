import { describe, expect, it } from 'vitest';
import {
  claveContadorProyecto,
  construirProyecto,
  construirTipologia,
  slugProyecto,
  TOPE_TIPOLOGIAS,
  type EntradaProyecto,
} from './alta-proyecto';
import { codigoPropiedad } from './alta-propiedad';
import { problemasParaPublicarProyecto, puedePublicarseProyecto, rangoDePrecios } from './proyectos';
import { construirIndices } from './catalogo';

/*
 * Alta de obra nueva (§308). Tras §307 la vertical estaba completa y la colección VACÍA: no había
 * forma de crear un proyecto. Lo que se prueba aquí es el CONTRATO —lo que este módulo acepta
 * construir como publicado, el índice no lo puede omitir— y las tres decisiones que no son de
 * formulario: el «desde» que no puede ser 0, el % vendido que no viaja sin fuente, y el borrador
 * que SÍ se puede guardar incompleto.
 */

const AHORA = new Date('2026-08-22T10:00:00.000Z');
const CODIGO = 'PRY-202608-0007';

const tipologia = (over = {}) => ({
  nombre: 'Tipo A', tipo: 'apartamento', areaM2: '68', habitaciones: '2', banos: '2', desde: '450000000', ...over,
});

const entrada = (over: Partial<EntradaProyecto> = {}): EntradaProyecto => ({
  nombre: 'Torre Marea',
  constructora: 'Constructora Caribe S.A.S',
  licenciaConstruccion: 'LC-2026-0345',
  estadoObra: 'preventa',
  descripcion: 'Frente al mar, en Bocagrande.',
  barrio: 'Bocagrande',
  imagenes: ['pry/marea/1.webp'],
  estado: 'disponible',
  tipologias: [tipologia()],
  ...over,
});

const construir = (over: Partial<EntradaProyecto> = {}) => construirProyecto(entrada(over), { codigo: CODIGO, ahora: AHORA });

describe('el código y el slug de un proyecto viven en SU namespace', () => {
  it('el contador es `PRY-`, no `INM-`: dos namespaces, un solo generador', () => {
    expect(claveContadorProyecto(AHORA)).toBe('PRY-202608');
    expect(codigoPropiedad(claveContadorProyecto(AHORA), 7)).toEqual({ ok: true, codigo: CODIGO });
  });

  it('el slug lleva nombre, barrio y código — y se congela al crear (§111)', () => {
    expect(slugProyecto('Torre Marea', 'Bocagrande', CODIGO)).toBe('torre-marea-bocagrande-pry-202608-0007');
    const r = construir();
    expect(r.ok && r.proyecto.slug).toBe('torre-marea-bocagrande-pry-202608-0007');
  });
});

describe('construirTipologia — la fila vacía no es un error', () => {
  it('una fila TOTALMENTE vacía se ignora: pelearse con los huecos sobrantes es pelearse con el operador', () => {
    expect(construirTipologia({})).toEqual({ vacia: true });
  });

  it('una fila A MEDIAS sí es un error, y los dice TODOS', () => {
    const r = construirTipologia({ nombre: 'Tipo A' });
    expect('errores' in r).toBe(true);
    if (!('errores' in r)) return;
    expect(r.errores.length).toBeGreaterThan(3);
  });

  it('🔴 un «desde» en 0 se rechaza: publicaría «Desde $0» y nadie lo mira dos veces', () => {
    const r = construirTipologia(tipologia({ desde: '0' }));
    expect('errores' in r && r.errores.some((e) => e.campo === 'tipologia.desde')).toBe(true);
  });

  it('`disponibles` ausente NO es cero: son cosas distintas', () => {
    const r = construirTipologia(tipologia());
    expect('fila' in r && 'disponibles' in r.fila).toBe(false);
    const con = construirTipologia(tipologia({ disponibles: '4' }));
    expect('fila' in con && con.fila.disponibles).toBe(4);
  });

  it('el precio acepta separadores de miles tecleados por una persona', () => {
    const r = construirTipologia(tipologia({ desde: '450.000.000' }));
    expect('fila' in r && r.fila.desde).toBe(450_000_000);
  });
});

describe('🎯 EL CONTRATO (§108): lo que el escritor acepta, el lector NO lo omite', () => {
  it('un proyecto sin problemas entra al índice de venta', () => {
    const r = construir();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(problemasParaPublicarProyecto(r.proyecto)).toEqual([]);
    const { indices, omitidas } = construirIndices([], AHORA.toISOString(), [r.proyecto]);
    expect(omitidas).toEqual([]);
    expect(indices.venta.items).toHaveLength(1);
  });

  it('🎯 Y AL REVÉS: si el lector lo omite, el escritor lo había avisado o lo dejó en borrador', () => {
    // Sin licencia el alta DEJA construir (es un borrador legítimo), pero el lector lo omite — y el
    // predicado que el formulario enseña es el MISMO que usa el índice.
    const r = construir({ licenciaConstruccion: '' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(problemasParaPublicarProyecto(r.proyecto)).toContain('sin-licencia');
    const { omitidas } = construirIndices([], AHORA.toISOString(), [r.proyecto]);
    expect(omitidas[0].motivo).toBe('sin-licencia');
  });

  it('el precio del índice SALE de las tipologías, no de un campo tecleado (§284.3)', () => {
    const r = construir({ tipologias: [tipologia(), tipologia({ nombre: 'Tipo B', areaM2: '96', desde: '720000000' })] });
    if (!r.ok) throw new Error('debia construir');
    expect(rangoDePrecios(r.proyecto.tipologias)).toEqual({ desde: 450_000_000, hasta: 720_000_000 });
  });
});

describe('las decisiones que no son de formulario', () => {
  it('🔴 un «% vendido» SIN fuente no se guarda: se pide la fuente', () => {
    const r = construir({ vendidoPct: '70' });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errores.some((e) => e.campo === 'vendidoFuente')).toBe(true);
  });

  it('con fuente sí, y queda fechado para que se pueda no creer', () => {
    const r = construir({ vendidoPct: '70', vendidoFuente: 'Constructora Caribe' });
    if (!r.ok) throw new Error('debia construir');
    expect(r.proyecto.porcentajeVendido).toEqual({ valor: 70, fuente: 'Constructora Caribe', fecha: AHORA.toISOString() });
  });

  it('un BORRADOR se puede guardar incompleto — un proyecto se captura en varias sesiones', () => {
    const r = construirProyecto(
      { nombre: 'Aún sin nombre comercial', constructora: 'X', descripcion: 'y', barrio: 'Manga', estadoObra: 'preventa', estado: 'borrador' },
      { codigo: CODIGO, ahora: AHORA },
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(puedePublicarseProyecto(r.proyecto)).toBe(false); // se guarda, pero NO sale
    expect(r.proyecto.publicadoEn).toBeUndefined();
  });

  it('falla con TODOS los errores, no con el primero: un formulario largo no se arregla de uno en uno', () => {
    const r = construirProyecto({ estado: 'disponible' }, { codigo: CODIGO, ahora: AHORA });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    for (const campo of ['nombre', 'constructora', 'descripcion', 'barrio', 'estadoObra']) {
      expect(r.errores.some((e) => e.campo === campo)).toBe(true);
    }
  });

  it('la portada es la primera imagen, y sin imágenes no se inventa ninguna', () => {
    expect(construir().ok && (construir() as { proyecto: { imagenPortada?: string } }).proyecto.imagenPortada).toBe('pry/marea/1.webp');
    const sin = construir({ imagenes: [] });
    expect(sin.ok && sin.proyecto.imagenPortada).toBeUndefined();
  });

  it('la entrega se normaliza a ISO, y una fecha basura no se guarda', () => {
    const r = construir({ entregaEstimada: '2027-03-15' });
    expect(r.ok && r.proyecto.entregaEstimada).toContain('2027-03-15');
    const mala = construir({ entregaEstimada: 'cuando salga' });
    expect(mala.ok && mala.proyecto.entregaEstimada).toBeUndefined();
  });

  it('no se pasa del tope de tipologías', () => {
    const muchas = Array.from({ length: TOPE_TIPOLOGIAS + 1 }, (_, i) => tipologia({ nombre: `T${i}` }));
    const r = construir({ tipologias: muchas });
    expect(r.ok).toBe(false);
  });
});
