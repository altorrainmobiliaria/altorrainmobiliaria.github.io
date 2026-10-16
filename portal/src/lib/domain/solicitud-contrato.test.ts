import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contactoDe, solicitudDeDocumento } from './crm';
import { asuntoDeLead, contactabilidad, cuerpoDeLead } from './lead-aviso';

/*
 * CONTRATO ENTRE QUIEN ESCRIBE Y QUIEN LEE LOS LEADS.
 *
 * El aviso de lead no salía NUNCA: `/api/solicitud` guardaba el contacto suelto y el aviso buscaba
 * `contacto`. Las pruebas del aviso no lo vieron porque sembraban a mano un documento con la forma
 * del modelo, que el endpoint jamás escribe. Aquí el documento NO se copia: se llama al endpoint de
 * verdad (sin red) y se le pasa a los lectores lo que él mismo escribió.
 */
const escritos = vi.hoisted(() => [] as Record<string, unknown>[]);
vi.mock('../data/firestore-rest', () => ({
  createDoc: async (_coleccion: string, doc: Record<string, unknown>) => {
    escritos.push(doc);
    return { ok: true, id: 'SOL-CONTRATO' };
  },
}));

// Vive aquí y NO junto al endpoint: todo fichero dentro de `src/pages/` es una RUTA para Astro, y
// una prueba allí se publicaba como `/api/solicitud.test` con sus teléfonos de ejemplo dentro del
// Worker (lo cazó la sonda de contactos de `verify:build`).
const { POST } = await import('../../pages/api/solicitud');

/** Fecha `YYYY-MM-DD` a N días de hoy: las fechas de una estancia no pueden estar en el pasado. */
const dentroDe = (dias: number): string => new Date(Date.now() + dias * 864e5).toISOString().slice(0, 10);

async function enviar(cuerpo: Record<string, unknown>, locals?: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = new Request('https://altorrainmobiliaria.co/api/solicitud', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  // `unknown` en medio: con `locals` falso el objeto ya no «solapa» con `APIContext` y el chequeo de
  // tipos lo rechaza; el endpoint solo lee `request` y `locals.altorra`, que es lo que se le da.
  const res = await POST({ request, locals } as unknown as Parameters<typeof POST>[0]);
  expect(res.status).toBe(200);
  expect(escritos).toHaveLength(1);
  return escritos[0];
}

const PANEL = 'https://altorrainmobiliaria.co/gestion';

beforeEach(() => {
  escritos.length = 0;
});

describe('lo que escribe /api/solicitud lo entiende el aviso de lead', () => {
  it('una solicitud de estancia llega con contacto, origen, operación y fechas', async () => {
    const llegada = dentroDe(20);
    const salida = dentroDe(23);
    const doc = await enviar({
      formulario: 'reserva-estancia',
      nombre: 'Ana Restrepo',
      telefono: '300 123 4567',
      autorizacion: 'on',
      llegada,
      salida,
      huespedes: 2,
    });

    const s = solicitudDeDocumento('SOL-CONTRATO', doc);
    expect(s.contacto.nombre).toBe('Ana Restrepo');
    expect(s.contacto.telefono).toBe('300 123 4567');
    expect(s.origen).toBe('portal-estancias');
    expect(s.operacionInteres).toBe('alojamiento');
    expect(s.fechas).toEqual({ llegada, salida, huespedes: 2 });
    expect(s.mensaje).toBeTruthy();

    // Lo que antes salía como «sin nombre ⚠️ SIN CONTACTO» (y en realidad ni salía: `sin-datos`).
    expect(contactabilidad(s)).toBe('telefono');
    expect(asuntoDeLead(s)).toBe('Estancia · Ana Restrepo');
    const cuerpo = cuerpoDeLead(s, PANEL);
    expect(cuerpo).toContain('Teléfono: 300 123 4567');
    expect(cuerpo).toContain('Origen: portal-estancias');
    expect(cuerpo).not.toContain('NO dejó forma de contacto');
  });

  it('una solicitud de /publicar también, y sin fechas que no pidió', async () => {
    const doc = await enviar({ nombre: 'Luis Pérez', telefono: '3011234567', autorizacion: 'on' });

    const s = solicitudDeDocumento('SOL-CONTRATO', doc);
    expect(s.contacto.nombre).toBe('Luis Pérez');
    expect(s.origen).toBe('portal-publicar');
    expect(s.fechas).toBeUndefined();
    expect(contactabilidad(s)).toBe('telefono');
  });

  it('un teléfono escrito con puntos se acepta y se guarda tal cual lo tecleó (§330)', async () => {
    const doc = await enviar({ nombre: 'Luis Pérez', telefono: '300.123.4567', autorizacion: 'on' });
    expect(doc.telefono).toBe('300.123.4567');
  });

  it('lo que solo tiene la forma de un teléfono, sin sus dígitos, se rechaza con 422', async () => {
    const request = new Request('https://altorrainmobiliaria.co/api/solicitud', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ nombre: 'Luis Pérez', telefono: '(((((((', autorizacion: 'on' }),
    });
    const res = await POST({ request } as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ ok: false, reason: 'telefono' });
    expect(escritos).toHaveLength(0);
  });
});

/*
 * DESDE LA FICHA DE UN ALOJAMIENTO (§329): el lead llega diciendo CUÁL, y con el total calculado por
 * el servidor con el precio del documento. El cliente de datos es falso (sin red), pero el endpoint, el
 * lector y el aviso son los de verdad.
 */
describe('una solicitud desde la ficha de un alojamiento lleva su propiedadId', () => {
  const ALOJ = {
    _version: 1,
    id: 'INM-202610-0001',
    operacion: 'alojamiento',
    vertical: 'turistico',
    tipo: 'casa',
    estado: 'disponible',
    titulo: 'Casa con piscina en el Centro',
    descripcion: '',
    geo: { ciudad: 'Cartagena de Indias', barrio: 'Centro Histórico' },
    specs: {},
    amenidades: {},
    precio: { moneda: 'COP', precioNoche: 850_000, precioAseo: 180_000 },
    rnt: 'RNT 100001',
    autorizacionPH: { situacion: 'no-aplica', declaradaEn: '2026-09-01T00:00:00.000Z' },
    imagenes: [],
  };
  const cliente = (r: unknown) => ({ altorra: { propiedades: { get: vi.fn(async () => r) } } });

  const base = () => ({
    formulario: 'reserva-estancia',
    nombre: 'Ana Restrepo',
    telefono: '300 123 4567',
    autorizacion: 'on',
    llegada: dentroDe(20),
    salida: dentroDe(23),
    huespedes: 2,
  });

  it('comprobado: el id va arriba, el correo dice cuál es y el total sale del DOCUMENTO', async () => {
    const locals = cliente({ ok: true, data: ALOJ });
    // Un total escrito por el navegador NO se cree: el endpoint ni lo lee.
    const doc = await enviar({ ...base(), propiedadId: 'inm-202610-0001', total: 1 }, locals);
    expect(locals.altorra.propiedades.get).toHaveBeenCalledWith('INM-202610-0001');
    expect(doc.propiedadId).toBe('INM-202610-0001');
    const extra = doc.datosExtra as Record<string, unknown>;
    expect(extra.sobre).toBe('alojamiento elegido: Casa con piscina en el Centro (INM-202610-0001)');
    expect(extra.descripcion).toContain('Casa con piscina en el Centro');
    expect(extra.descripcion).toContain('total $2.730.000 ($850.000 × 3 noches + limpieza $180.000)');

    const s = solicitudDeDocumento('SOL-CONTRATO', doc);
    expect(s.propiedadId).toBe('INM-202610-0001');
    expect(cuerpoDeLead(s, PANEL)).toContain('Inmueble: INM-202610-0001');
    expect(cuerpoDeLead(s, PANEL)).toContain('total $2.730.000');
  });

  it('ya no publicado (o no es un alojamiento): consulta general que DICE qué pidió, sin id', async () => {
    for (const r of [
      { ok: false, reason: 'unavailable' },
      { ok: true, data: { ...ALOJ, estado: 'borrador' } },
      { ok: true, data: { ...ALOJ, operacion: 'venta', precio: { moneda: 'COP', valorVenta: 1 } } },
      { ok: true, data: { ...ALOJ, rnt: 'pendiente' } },
    ]) {
      escritos.length = 0;
      const doc = await enviar({ ...base(), propiedadId: 'INM-202610-0001' }, cliente(r));
      expect(doc.propiedadId).toBeUndefined();
      expect((doc.datosExtra as Record<string, unknown>).sobre).toBe(
        'consulta general — pidió el alojamiento INM-202610-0001, que ya no está publicado',
      );
      expect((doc.datosExtra as Record<string, unknown>).descripcion).not.toContain('total');
      // Y el equipo se ENTERA de cuál pidió: la descripción es lo único que llega al correo (§329).
      expect((doc.datosExtra as Record<string, unknown>).descripcion).toContain('pidió el alojamiento INM-202610-0001');
    }
  });

  it('reservado o cerrado: la ficha no admite solicitud, así que ni se da por elegido ni lleva total', async () => {
    for (const [estado, motivo] of [['reservado', 'Reservado'], ['cerrado', 'Ya arrendado']] as const) {
      escritos.length = 0;
      const doc = await enviar({ ...base(), propiedadId: 'INM-202610-0001' }, cliente({ ok: true, data: { ...ALOJ, estado } }));
      expect(doc.propiedadId).toBeUndefined();
      const extra = doc.datosExtra as Record<string, unknown>;
      const sobre = `consulta general — pidió el alojamiento INM-202610-0001, que figura como «${motivo}»`;
      expect(extra.sobre).toBe(sobre);
      expect(extra.descripcion).toContain(sobre);
      expect(extra.descripcion).not.toContain('total');
      expect(cuerpoDeLead(solicitudDeDocumento('SOL-CONTRATO', doc), PANEL)).toContain(sobre);
    }
  });

  it('la base no responde: el lead NO se pierde; va el id, marcado como sin comprobar', async () => {
    const doc = await enviar({ ...base(), propiedadId: 'INM-202610-0001' }, cliente({ ok: false, reason: 'error' }));
    expect(doc.propiedadId).toBe('INM-202610-0001');
    expect((doc.datosExtra as Record<string, unknown>).sobre).toBe(
      'alojamiento elegido: INM-202610-0001 — no se pudo comprobar al recibir la solicitud',
    );
    expect((doc.datosExtra as Record<string, unknown>).descripcion).toContain('INM-202610-0001 — no se pudo comprobar');
  });

  it('un id sin forma canónica es basura, no una elección: ni se consulta ni se guarda', async () => {
    const locals = cliente({ ok: true, data: ALOJ });
    const doc = await enviar({ ...base(), propiedadId: '../config/gestion' }, locals);
    expect(locals.altorra.propiedades.get).not.toHaveBeenCalled();
    expect(doc.propiedadId).toBeUndefined();
    expect((doc.datosExtra as Record<string, unknown>).sobre).toBe('consulta general de corta estancia — sin alojamiento elegido');
  });

  it('desde /estancias (sin id) sigue siendo la consulta general de siempre', async () => {
    const doc = await enviar(base());
    expect(doc.propiedadId).toBeUndefined();
    expect((doc.datosExtra as Record<string, unknown>).sobre).toBe('consulta general de corta estancia — sin alojamiento elegido');
  });

  it('un propiedadId en un formulario que no es de estancia no se mira', async () => {
    const locals = cliente({ ok: true, data: ALOJ });
    const doc = await enviar({ nombre: 'Luis Pérez', telefono: '3011234567', autorizacion: 'on', propiedadId: 'INM-202610-0001' }, locals);
    expect(locals.altorra.propiedades.get).not.toHaveBeenCalled();
    expect(doc.propiedadId).toBeUndefined();
  });
});

describe('solicitudDeDocumento — las dos formas que hay guardadas', () => {
  it('respeta un documento que ya trae `contacto` y `source` (la forma del modelo)', () => {
    const s = solicitudDeDocumento('SOL-1', {
      contacto: { nombre: 'Ana', email: 'ana@example.com' },
      source: 'portal-publicar',
      estado: 'nuevo',
    });
    expect(s.contacto).toEqual({ nombre: 'Ana', telefono: '', email: 'ana@example.com' });
    expect(s.origen).toBe('portal-publicar');
    expect(s.estado).toBe('nuevo');
  });

  it('un documento vacío no inventa nada: queda sin contacto y lo dice', () => {
    const s = solicitudDeDocumento('SOL-2', { datosExtra: { operacion: 'trueque' } });
    expect(contactabilidad(s)).toBe('NINGUNO');
    expect(s.operacionInteres).toBeUndefined();
    expect(s.fechas).toBeUndefined();
    expect(s.origen).toBeUndefined();
  });

  it('lo que no es texto se anula en vez de llegar a un `.trim()`', () => {
    const s = solicitudDeDocumento('SOL-3', { nombre: 'Ana', mensaje: 1, propiedadId: 2 });
    expect(s.mensaje).toBeUndefined();
    expect(s.propiedadId).toBeUndefined();
  });

  it('contactoDe lee el correo suelto, que es el que usa el aviso al cliente', () => {
    expect(contactoDe({ nombre: ' Ana ', email: 'ana@example.com' })).toEqual({
      nombre: 'Ana',
      telefono: '',
      email: 'ana@example.com',
    });
    expect(contactoDe(undefined)).toEqual({ nombre: '', telefono: '', email: '' });
  });
});

describe('el «hoy» del servidor es el de Cartagena (§329)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  const pedir = (llegada: string, salida: string) =>
    POST({
      request: new Request('https://altorrainmobiliaria.co/api/solicitud', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ formulario: 'reserva-estancia', nombre: 'Ana Restrepo', telefono: '300 123 4567', autorizacion: 'on', llegada, salida, huespedes: 2 }),
      }),
      locals: {},
    } as unknown as Parameters<typeof POST>[0]);

  it('a las 10 de la noche en Cartagena —ya «mañana» en UTC— una llegada HOY se acepta', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-17T03:00:00Z')); // viernes 16-oct, 22:00 en Cartagena
    const res = await pedir('2026-10-16', '2026-10-18');
    expect(res.status).toBe(200);
    expect((escritos[0].datosExtra as Record<string, unknown>).llegada).toBe('2026-10-16');
  });

  it('y el día anterior de Cartagena sigue siendo pasado', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-17T03:00:00Z'));
    const res = await pedir('2026-10-15', '2026-10-18');
    expect(res.status).toBe(422);
    expect(escritos).toHaveLength(0);
  });
});
