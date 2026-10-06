import { beforeEach, describe, expect, it, vi } from 'vitest';
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

async function enviar(cuerpo: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = new Request('https://altorrainmobiliaria.co/api/solicitud', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  const res = await POST({ request } as Parameters<typeof POST>[0]);
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
