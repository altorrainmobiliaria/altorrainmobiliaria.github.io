/*
 * AVISO DE LEAD — el ejecutor (§188). El QUÉ se dice vive en `src/lib/domain/lead-aviso.ts`, puro y
 * con 9 pruebas que corren en CI; aquí solo está hablar con Resend.
 *
 * 🔴 POR QUÉ SE MUEVE AQUÍ. El aviso lo mandaba la Function LEGACY `onNewSolicitud` por SMTP de Gmail,
 * con una contraseña de aplicación rota (`535-5.7.8`). Así se perdieron los 16 leads del sitio viejo:
 * ninguno tenía `emailSent` y nadie se enteró en 126 días. Estrenar el portal sobre ese mismo camino
 * era repetir el accidente con leads nuevos.
 *
 * 💡 Y el efecto secundario que más vale: **le quita una pelota al dueño.** Antes necesitaba rotar la
 * credencial de Gmail Y configurar Resend; ahora solo Resend, que es gratis, no está roto y ya tiene
 * su secreto creado con centinela (§140) — así que registrar esta Function **no bloquea el despliegue
 * del codebase**, que es el error que §140 documenta.
 *
 * ⚠️ CONVIVENCIA CON LA LEGACY: `onNewSolicitud` sigue existiendo y escucha la MISMA colección. Hoy no
 * duplica nada porque no puede enviar (su SMTP falla), pero si alguien arregla esa contraseña sin leer
 * esto, saldrían DOS correos por lead. Al retirar el legacy en el cutover, esta se queda sola. Está
 * escrito aquí y no solo en un ADR porque el que arregle la contraseña abrirá este archivo, no el ADR.
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import { asuntoDeLead, contactabilidad, cuerpoDeLead } from '../../src/lib/domain/lead-aviso';
import type { Solicitud } from '../../src/lib/domain/crm';

/** A dónde llega el aviso. Es el buzón del negocio, nunca el personal del dueño. */
const DESTINO = 'info@altorrainmobiliaria.co';
const REMITENTE = 'ALTORRA <no-responder@altorrainmobiliaria.co>';
const PANEL = 'https://altorrainmobiliaria.co/gestion';

export interface OpcionesAviso {
  apiKeyResend: string;
  fetchImpl?: typeof fetch;
}

export interface ReporteAviso {
  enviado: boolean;
  motivo?: 'sin-clave' | 'sin-datos' | 'fallo-envio';
  status?: number;
  asunto?: string;
}

/**
 * Manda el aviso. **No lanza**: devuelve por qué no se envió, para que el trigger lo registre y siga.
 *
 * Un lead ya está guardado cuando esto corre — que el correo falle no puede tumbar la escritura ni
 * hacer que Firestore reintente el trigger y mande tres copias.
 */
export async function avisarLead(s: Solicitud, opts: OpcionesAviso): Promise<ReporteAviso> {
  if (!opts.apiKeyResend) return { enviado: false, motivo: 'sin-clave' };
  if (!s?.contacto) return { enviado: false, motivo: 'sin-datos' };

  const asunto = asuntoDeLead(s);
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const res = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${opts.apiKeyResend}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: REMITENTE,
      to: [DESTINO],
      subject: asunto,
      text: cuerpoDeLead(s, `${PANEL}?lead=${encodeURIComponent(s.id ?? '')}`),
      // Responder al correo va al INTERESADO, no a nosotros: ahorra copiar y pegar la dirección.
      ...(s.contacto.email?.trim() ? { reply_to: s.contacto.email.trim() } : {}),
    }),
  });

  return res.ok
    ? { enviado: true, status: res.status, asunto }
    : { enviado: false, motivo: 'fallo-envio', status: res.status, asunto };
}

/** Lo que se registra. Un aviso que no salió tiene que dejar rastro: así se perdieron los 16. */
export function lineasAviso(id: string, r: ReporteAviso): string[] {
  if (r.enviado) return [`[lead] ${id} avisado · «${r.asunto}»`];
  return [
    `[lead] ${id} NO avisado (${r.motivo}${r.status ? ` HTTP ${r.status}` : ''}). El lead está guardado; lo que falló es el aviso.`,
  ];
}

/**
 * Trigger de creación. `retry: false` a propósito, al revés que el rebuild del catálogo: reintentar un
 * envío de correo no es idempotente y duplicaría el aviso.
 */
export const construirTriggerLead = (region: string, secrets: unknown[], clave: () => string) =>
  onDocumentCreated(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { document: 'solicitudes/{solId}', region, secrets: secrets as any, retry: false },
    async (event) => {
      const datos = event.data?.data() as Solicitud | undefined;
      if (!datos) return;
      const id = event.params.solId;
      const s = { ...datos, id } as Solicitud;

      if (contactabilidad(s) === 'NINGUNO') {
        // Se avisa IGUAL: un lead sin contacto es una señal de que el formulario está mal, y
        // enterarse hoy vale más que un buzón limpio.
        logger.warn(`[lead] ${id} llegó SIN forma de contacto — revisar el formulario de origen`);
      }

      const r = await avisarLead(s, { apiKeyResend: clave() });
      for (const l of lineasAviso(id, r)) (r.enviado ? logger.info : logger.error)(l);
      if (r.enviado) {
        // Marca de que el aviso SALIÓ. Los 16 leads perdidos no tenían esta marca, y por eso nadie
        // pudo saber que no se habían enviado hasta que fue tarde.
        await getFirestore().doc(`solicitudes/${id}`).set({ avisoEnviadoEl: new Date().toISOString() }, { merge: true });
      }
    },
  );
