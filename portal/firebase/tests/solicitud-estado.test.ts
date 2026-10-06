/*
 * EL AVISO AL CLIENTE, probado (ADR §235).
 *
 * La legacy que esto reemplaza no tiene ni una prueba: manda por SMTP roto, captura el error y lo
 * escribe en un log. Estas comprueban las tres decisiones que de verdad importan — de qué NO se
 * avisa, que un fallo no tumbe nada, y que el motivo registrado sea el REAL.
 *
 * `fetch` va inyectado: no se habla con Resend para probar una decisión de producto.
 */
import { describe, expect, it } from 'vitest';
import {
  AVISO_POR_ESTADO,
  avisarCambioDeEstado,
  lineaDeEstado,
  saludo,
} from '../../functions/src/solicitud-estado';
import type { Solicitud } from '../../src/lib/domain/crm';
import { ESTADOS_SOLICITUD } from '../../src/lib/domain/crm';

const CLAVE = 're_clave_de_prueba';

/** Un `fetch` que anota lo que le piden y responde lo que se le diga. */
function espia(ok = true, status = 200) {
  const llamadas: Array<{ url: string; cuerpo: Record<string, unknown> }> = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    llamadas.push({ url: String(url), cuerpo: JSON.parse(String(init.body)) });
    return { ok, status } as Response;
  }) as unknown as typeof fetch;
  return { llamadas, fetchImpl };
}

const sol = (estado: string, extra: Record<string, unknown> = {}): Partial<Solicitud> =>
  ({
    estado,
    contacto: { nombre: 'Ana Restrepo', email: 'ana@example.com' },
    // Lo que guarda `/api/solicitud` de todo lead: sin esto no se le escribe a nadie.
    consentimiento: { autorizado: true },
    ...extra,
  }) as Partial<Solicitud>;

describe('de qué se avisa y de qué NO', () => {
  it('avisa cuando el estado pasa a `contactado`', async () => {
    const { llamadas, fetchImpl } = espia();
    const r = await avisarCambioDeEstado(sol('nuevo'), sol('contactado'), {
      apiKeyResend: CLAVE,
      fetchImpl,
    });
    expect(r.enviado).toBe(true);
    expect(llamadas).toHaveLength(1);
    expect(llamadas[0].cuerpo.to).toEqual(['ana@example.com']);
  });

  it('no avisa si el estado NO cambió, aunque cambie otra cosa', async () => {
    const { llamadas, fetchImpl } = espia();
    const r = await avisarCambioDeEstado(
      sol('contactado'),
      sol('contactado', { mensaje: 'editado' }),
      { apiKeyResend: CLAVE, fetchImpl },
    );
    expect(r.motivo).toBe('sin-cambio');
    expect(llamadas).toHaveLength(0);
  });

  it('🔕 los estados internos NO le llegan al cliente', async () => {
    for (const interno of ['calificado', 'nurturing', 'visita_realizada', 'oferta_presentada']) {
      const { llamadas, fetchImpl } = espia();
      const r = await avisarCambioDeEstado(sol('contactado'), sol(interno), {
        apiKeyResend: CLAVE,
        fetchImpl,
      });
      expect(r.motivo, interno).toBe('estado-sin-aviso');
      expect(llamadas, interno).toHaveLength(0);
    }
  });

  it('🔕 `descartado` tampoco: cerrarle la puerta a alguien no se hace por correo automático', async () => {
    const { llamadas, fetchImpl } = espia();
    const r = await avisarCambioDeEstado(sol('contactado'), sol('descartado'), {
      apiKeyResend: CLAVE,
      fetchImpl,
    });
    expect(r.motivo).toBe('estado-sin-aviso');
    expect(llamadas).toHaveLength(0);
  });

  it('todas las claves del mapa son estados REALES: el tipo lo exige y esto lo confirma en runtime', () => {
    for (const k of Object.keys(AVISO_POR_ESTADO)) {
      expect(ESTADOS_SOLICITUD as readonly string[]).toContain(k);
    }
  });
});

describe('nunca lanza, y el motivo que registra es el REAL', () => {
  it('sin correo en la solicitud: lo dice y no llama a Resend', async () => {
    const { llamadas, fetchImpl } = espia();
    const r = await avisarCambioDeEstado(
      sol('nuevo'),
      sol('contactado', { contacto: { nombre: 'Ana' } }),
      { apiKeyResend: CLAVE, fetchImpl },
    );
    expect(r.motivo).toBe('sin-email');
    expect(llamadas).toHaveLength(0);
  });

  it('sin clave de Resend (el centinela): no lanza, lo registra', async () => {
    const r = await avisarCambioDeEstado(sol('nuevo'), sol('contactado'), { apiKeyResend: '' });
    expect(r.enviado).toBe(false);
    expect(r.motivo).toBe('sin-clave');
  });

  it('🔴 si Resend responde error NO lanza: un aviso perdido no puede tumbar el cambio de estado', async () => {
    const { fetchImpl } = espia(false, 422);
    const r = await avisarCambioDeEstado(sol('nuevo'), sol('contactado'), {
      apiKeyResend: CLAVE,
      fetchImpl,
    });
    expect(r.enviado).toBe(false);
    expect(r.motivo).toBe('fallo-envio');
    expect(r.status).toBe(422);
  });

  it('el orden de las comprobaciones: un estado sin aviso Y sin clave reporta `estado-sin-aviso`', async () => {
    const r = await avisarCambioDeEstado(sol('contactado'), sol('calificado'), { apiKeyResend: '' });
    expect(r.motivo).toBe('estado-sin-aviso');
  });
});

describe('el correo que le llega a una persona', () => {
  it('🔴 lee el contacto SUELTO, que es como lo guarda /api/solicitud', async () => {
    // Antes solo miraba `contacto.email`: a un lead del portal con correo nunca le habría llegado
    // el aviso, y además con un saludo sin nombre.
    const plano = {
      estado: 'contactado',
      nombre: 'Luis Pérez',
      telefono: '3011234567',
      email: 'luis@example.com',
      consentimiento: { autorizado: true },
    };
    const { llamadas, fetchImpl } = espia();
    const r = await avisarCambioDeEstado(
      // `pendiente` es el estado que escribe el portal, aunque el modelo aún no lo nombre.
      { estado: 'pendiente' } as unknown as Partial<Solicitud>,
      plano as Partial<Solicitud>,
      {
        apiKeyResend: CLAVE,
        fetchImpl,
      },
    );
    expect(r.enviado).toBe(true);
    expect(llamadas[0].cuerpo.to).toEqual(['luis@example.com']);
    expect(String(llamadas[0].cuerpo.text)).toContain('Hola Luis');
  });

  it('🔴 sin la autorización GUARDADA no se escribe (los leads del sitio viejo no la tienen)', async () => {
    const { llamadas, fetchImpl } = espia();
    const viejo = { estado: 'cerrado', nombre: 'Marta', email: 'marta@example.com' } as Partial<Solicitud>;
    const r = await avisarCambioDeEstado(sol('nuevo'), viejo, { apiKeyResend: CLAVE, fetchImpl });
    expect(r).toMatchObject({ enviado: false, motivo: 'sin-consentimiento' });
    expect(llamadas).toHaveLength(0);
    expect(lineaDeEstado('S1', r)).toContain('autorización de datos');
  });

  it('un corte de red NO lanza: queda como fallo de envío', async () => {
    const roto = (async () => {
      throw new Error('ECONNRESET');
    }) as unknown as typeof fetch;
    const r = await avisarCambioDeEstado(sol('nuevo'), sol('contactado'), { apiKeyResend: CLAVE, fetchImpl: roto });
    expect(r).toMatchObject({ enviado: false, motivo: 'fallo-envio' });
    expect(lineaDeEstado('S1', r)).toContain('no se pudo conectar');
  });

  it('el saludo solo lleva algo que parezca un nombre (nunca un enlace)', () => {
    expect(saludo('https://phish.example/x')).toBe('');
    expect(saludo('María-José')).toBe(' María-José');
    expect(saludo("D'Angelo Ruiz")).toBe(" D'Angelo");
  });

  it('saluda por el nombre de pila, no por el nombre completo', () => {
    expect(saludo('Ana María Restrepo')).toBe(' Ana');
    expect(saludo('  ')).toBe('');
    expect(saludo(undefined)).toBe('');
  });

  it('sin nombre no deja un «Hola :» delatando al robot', async () => {
    const { llamadas, fetchImpl } = espia();
    await avisarCambioDeEstado(
      sol('nuevo'),
      sol('contactado', { contacto: { nombre: '', email: 'x@y.co' } }),
      { apiKeyResend: CLAVE, fetchImpl },
    );
    expect(String(llamadas[0].cuerpo.text)).toContain('Hola:');
  });

  it('responder va a un buzón REAL, no al no-responder', async () => {
    const { llamadas, fetchImpl } = espia();
    await avisarCambioDeEstado(sol('nuevo'), sol('contactado'), { apiKeyResend: CLAVE, fetchImpl });
    expect(llamadas[0].cuerpo.reply_to).toBe('info@altorrainmobiliaria.co');
    expect(String(llamadas[0].cuerpo.from)).toContain('no-responder@');
  });

  it('la línea del log dice POR QUÉ, no un código', () => {
    expect(lineaDeEstado('SOL-1', { enviado: false, motivo: 'sin-clave' })).toContain('Resend');
    expect(lineaDeEstado('SOL-1', { enviado: true, asunto: 'X' })).toContain('avisado al cliente');
  });
});
