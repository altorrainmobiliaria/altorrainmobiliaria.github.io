/*
 * AVISO AL CLIENTE CUANDO CAMBIA EL ESTADO DE SU SOLICITUD (ADR §235).
 *
 * QUÉ REEMPLAZA. La legacy `onSolicitudStatusChanged` hace esto desde hace meses **con el Gmail
 * roto**: manda por SMTP con una contraseña de aplicación que caducó (`535-5.7.8`), captura el error
 * y lo escribe en un log que nadie abre. O sea que cada cambio de estado **falla en silencio** y
 * quien lo hizo cree que el cliente fue avisado. §188 ya decidió el destino —todo el correo por
 * Resend— y movió el aviso del lead NUEVO; éste se quedó atrás.
 *
 * POR QUÉ AQUÍ Y NO ARREGLANDO LA LEGACY. El codebase legacy no tiene tipos, ni pruebas, ni build
 * (`10`), así que un arreglo allí no lo protege nada. Aquí hereda las tres cosas y el mismo emisor
 * que ya funciona.
 *
 * 🔴 EL INVARIANTE, heredado de `lead-aviso.ts`: **no lanza**. El estado YA está guardado cuando esto
 * corre. Si el correo falla y la función lanza, Firestore reintenta el trigger y el cliente recibe
 * tres copias del mismo aviso — que es peor que no recibir ninguno.
 *
 * ⚠️ Y NO AVISA DE CUALQUIER CAMBIO. Solo de los estados que significan algo para quien espera al
 * otro lado. Un cambio interno de etiqueta no es una novedad para el cliente: es ruido que enseña a
 * ignorar nuestros correos, y el que de verdad importa llega el día que ya nadie los abre.
 */

import type { EstadoSolicitud, Solicitud } from '../../src/lib/domain/crm';

const REMITENTE = 'ALTORRA <no-responder@altorrainmobiliaria.co>';
const RESPONDER_A = 'info@altorrainmobiliaria.co';

/**
 * Qué se le dice al cliente en cada estado, y de cuáles NO se le dice nada.
 *
 * 🔒 Va tipado como `Partial<Record<EstadoSolicitud, …>>` a propósito: así **TypeScript rechaza un
 * estado inventado**. La primera versión de este archivo traía un `en_gestion` que no existe en
 * `ESTADOS_SOLICITUD` — escrito de memoria en vez de leído. Un mapa con claves `string` lo habría
 * aceptado y el aviso simplemente no habría salido nunca, sin que nada fallara.
 *
 * Un estado AUSENTE es una decisión, no un olvido:
 *   · `nuevo` — el cliente acaba de escribir; ya sabe que escribió.
 *   · `calificado`, `nurturing` — etiquetas internas: no son novedad para nadie de fuera.
 *   · `visita_realizada` — estuvo allí; contárselo por correo es ruido.
 *   · `oferta_presentada` — eso es una conversación, no un correo automático.
 *   · `descartado` — un correo automático no es forma de cerrarle la puerta a alguien.
 * Avisar de todo enseña a ignorar nuestros correos, y entonces el que importa llega el día que ya
 * nadie los abre.
 */
export const AVISO_POR_ESTADO: Partial<Record<EstadoSolicitud, { asunto: string; cuerpo: string }>> = {
  contactado: {
    asunto: 'Recibimos tu solicitud — ALTORRA Inmobiliaria',
    cuerpo:
      'Hola{nombre}:\n\nYa tenemos tu solicitud y uno de nosotros te va a escribir para entender ' +
      'bien qué buscas.\n\nSi prefieres adelantarlo, respóndenos a este correo o escríbenos por ' +
      'WhatsApp al +57 300 243 9810.\n\nALTORRA Inmobiliaria · Seguridad, Legalidad y Confianza',
  },
  visita_agendada: {
    asunto: 'Tu visita quedó agendada — ALTORRA Inmobiliaria',
    cuerpo:
      'Hola{nombre}:\n\nTu visita quedó agendada. Te confirmamos día, hora y punto de encuentro por ' +
      'WhatsApp; si algo te cambia, respóndenos a este correo y lo movemos sin problema.\n\n' +
      'ALTORRA Inmobiliaria · Seguridad, Legalidad y Confianza',
  },
  cerrado: {
    asunto: 'Cerramos tu solicitud — ALTORRA Inmobiliaria',
    cuerpo:
      'Hola{nombre}:\n\nDamos por cerrada tu solicitud. Si retomas la búsqueda —o si algo no quedó ' +
      'como esperabas— respóndenos a este correo: seguimos aquí.\n\nALTORRA Inmobiliaria · ' +
      'Seguridad, Legalidad y Confianza',
  },
};


export interface ReporteEstado {
  enviado: boolean;
  motivo?: 'sin-cambio' | 'estado-sin-aviso' | 'sin-email' | 'sin-clave' | 'fallo-envio';
  status?: number;
  asunto?: string;
}

/** El saludo con nombre solo si lo tenemos. «Hola :» delata un correo automático mal hecho. */
export function saludo(nombre?: string): string {
  const n = (nombre ?? '').trim().split(/\s+/)[0];
  return n ? ` ${n}` : '';
}

/**
 * Decide y manda. **No lanza** — devuelve por qué no se envió.
 *
 * El orden de las comprobaciones no es casual: primero lo que hace que NO haya nada que avisar
 * (mismo estado, estado sin aviso), después lo que impide avisar (sin correo, sin clave). Así el
 * motivo que se registra es el REAL y no «sin-clave» para un cambio que ni siquiera había que avisar.
 */
export async function avisarCambioDeEstado(
  antes: Partial<Solicitud>,
  despues: Partial<Solicitud>,
  opts: { apiKeyResend: string; fetchImpl?: typeof fetch },
): Promise<ReporteEstado> {
  const estado = String(despues?.estado ?? '');
  if (String(antes?.estado ?? '') === estado) return { enviado: false, motivo: 'sin-cambio' };

  /*
   * La DECLARACIÓN del mapa va constreñida a `EstadoSolicitud` —ahí es donde se caza un estado
   * inventado— pero la BÚSQUEDA acepta un `string`: lo que llega de Firestore en tiempo de
   * ejecución no lo garantiza ningún tipo, y un documento viejo puede traer un estado que ya no
   * existe. Separar las dos mitades da lo mejor de cada una: el compilador vigila lo que
   * escribimos nosotros y el código sobrevive a lo que hay guardado.
   */
  const plantilla = (AVISO_POR_ESTADO as Partial<Record<string, { asunto: string; cuerpo: string }>>)[
    estado
  ];
  if (!plantilla) return { enviado: false, motivo: 'estado-sin-aviso' };

  const email = (despues?.contacto?.email ?? '').trim();
  if (!email) return { enviado: false, motivo: 'sin-email' };
  if (!opts.apiKeyResend) return { enviado: false, motivo: 'sin-clave', asunto: plantilla.asunto };

  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const res = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${opts.apiKeyResend}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: REMITENTE,
      to: [email],
      subject: plantilla.asunto,
      text: plantilla.cuerpo.replace('{nombre}', saludo(despues?.contacto?.nombre)),
      // Responder va al buzón REAL: un «no-responder» que además ignora respuestas es una puerta
      // cerrada con un cartel que dice «pase».
      reply_to: RESPONDER_A,
    }),
  });

  return res.ok
    ? { enviado: true, status: res.status, asunto: plantilla.asunto }
    : { enviado: false, motivo: 'fallo-envio', status: res.status, asunto: plantilla.asunto };
}

/** Qué se escribe en el log, en una línea que se pueda leer sin abrir el código. */
export function lineaDeEstado(id: string, r: ReporteEstado): string {
  if (r.enviado) return `solicitud ${id}: avisado al cliente («${r.asunto}»)`;
  const porque: Record<string, string> = {
    'sin-cambio': 'el estado no cambió',
    'estado-sin-aviso': 'ese estado no se le avisa al cliente, a propósito',
    'sin-email': 'la solicitud no trae correo',
    'sin-clave': 'falta la clave de Resend (el secreto sigue con su centinela)',
    'fallo-envio': `Resend respondió ${r.status}`,
  };
  return `solicitud ${id}: NO se avisó — ${porque[r.motivo ?? ''] ?? 'motivo desconocido'}`;
}

/**
 * El disparador. Se construye desde `index.ts` para que la región y el secreto vivan en un solo
 * sitio, igual que el del lead nuevo.
 *
 * `retry: false` es deliberado y es la misma decisión que allí: si Firestore reintentara, el cliente
 * recibiría el mismo aviso tres veces. Un aviso perdido se puede recuperar con una llamada; tres
 * copias del mismo correo no se pueden deshacer.
 */
export const construirTriggerEstado = (
  region: string,
  secrets: unknown[],
  clave: () => string,
  onDocumentUpdated: typeof import('firebase-functions/v2/firestore').onDocumentUpdated,
  logger: { info: (m: string) => void; error: (m: string) => void },
) =>
  onDocumentUpdated(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { document: 'solicitudes/{solId}', region, secrets: secrets as any, retry: false },
    async (event) => {
      const antes = event.data?.before?.data() as Partial<Solicitud> | undefined;
      const despues = event.data?.after?.data() as Partial<Solicitud> | undefined;
      if (!antes || !despues) return;

      const id = String(event.params.solId);
      const r = await avisarCambioDeEstado(antes, despues, { apiKeyResend: clave() });

      // Los motivos que NO son un fallo (no había nada que avisar) van a `info`; lo que sí impide
      // avisar va a `error`, para que no se confundan en el mismo cubo.
      const esperado = r.enviado || r.motivo === 'sin-cambio' || r.motivo === 'estado-sin-aviso';
      (esperado ? logger.info : logger.error)(lineaDeEstado(id, r));
    },
  );
