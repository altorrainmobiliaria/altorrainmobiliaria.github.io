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
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { asuntoDeLead, contactabilidad, cuerpoDeLead } from '../../src/lib/domain/lead-aviso';
import type { Solicitud } from '../../src/lib/domain/crm';
import { camposDe, puntuar, tipoDe, type CampoLead } from '../../src/lib/domain/lead-score';

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

/** Qué campos llegaron con contenido real. Solo cuentan los que su formulario ofrecía (§189). */
export function camposLlenosDe(s: Solicitud): CampoLead[] {
  const out: CampoLead[] = [];
  if (s.contacto?.nombre?.trim()) out.push('nombre');
  if (s.contacto?.telefono?.trim()) out.push('telefono');
  if (s.contacto?.email?.trim()) out.push('email');
  if (s.mensaje?.trim()) out.push('mensaje');
  if (s.propiedadId?.trim()) out.push('propiedad');
  return out;
}

/**
 * PUNTÚA, AVISA y ESCRIBE. Vive fuera del trigger para poder probarse contra el emulador — el trigger
 * en sí no es más que un `if` y una llamada, y lo que hay que demostrar es que las escrituras ocurren.
 *
 * 🔴 EL ORDEN Y LA CONDICIÓN IMPORTAN, y por eso están en una sola función: **el puntaje se escribe
 * SIEMPRE** —es del lead, no del aviso— y **la marca `avisoEnviadoEl` solo si el correo salió de
 * verdad**. Ponerla siempre sería repetir el accidente de los 16: una marca que dice «avisado» sin
 * que nadie recibiera nada es peor que no tener marca, porque cierra la pregunta.
 */
export async function procesarLeadNuevo(
  db: Firestore,
  id: string,
  s: Solicitud,
  opts: OpcionesAviso,
): Promise<ReporteAviso> {
  const puntaje = puntuar({
    tipo: (s as { tipo?: string }).tipo ?? tipoDe(s.source ?? ''),
    camposOfrecidos: camposDe(s.source ?? ''),
    camposLlenos: camposLlenosDe(s),
  });

  const r = await avisarLead(s, opts);

  await db.doc(`solicitudes/${id}`).set(
    {
      leadScore: puntaje.score,
      leadTier: puntaje.tier,
      ...(r.enviado ? { avisoEnviadoEl: new Date().toISOString() } : {}),
    },
    { merge: true },
  );
  return r;
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

      const r = await procesarLeadNuevo(getFirestore(), id, s, { apiKeyResend: clave() });
      for (const l of lineasAviso(id, r)) (r.enviado ? logger.info : logger.error)(l);
    },
  );
