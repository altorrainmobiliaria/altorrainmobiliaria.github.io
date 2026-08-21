// Endpoint de ALTA de alertas guardadas (OLA 1 ítem 8). Recibe el formulario de `/alertas` y crea el
// documento en la colección `alertas`.
//
// Mismo patrón que `api/solicitud.ts` (§88): el navegador hace un POST NATIVO y sin JavaScript la cosa
// funciona igual (POST-Redirect-GET), la validación vive en el servidor y no entra ni un byte del SDK
// de Firebase en el cliente. Lo que cambia es la colección y, sobre todo, el gate legal: aquí el
// consentimiento no es solo para «atender la solicitud», es para MANDAR CORREOS periódicos, así que la
// casilla de habeas data es obligatoria igual y además el correo lleva siempre salida (baja).
//
// ⚠️ Este endpoint escribe SOLO en `alertas`. Las Rules son la frontera real: mientras el ruleset del
//    portal no se despliegue (cutover, TODO-17), Firestore responderá 403 y la página lo dirá EN VOZ
//    ALTA. Un «gracias» sobre un fallo sería peor que el fallo: la persona esperaría correos que nunca
//    van a llegar.

export const prerender = false;

import type { APIRoute } from 'astro';
import { createDoc } from '../../lib/data/firestore-rest';
import { getPublicFirebaseConfig } from '../../lib/data/client';
import { LEGAL } from '../../lib/config/legal';
import { criteriosAQuery, normalizarCriterios } from '../../lib/domain/alertas';
import type { Alerta } from '../../lib/domain/alertas';

/** Tope de bytes del cuerpo: una alerta legítima son ~250 bytes. Corta payloads de abuso al entrar. */
const MAX_BODY = 4096;

/**
 * Validación de correo deliberadamente PERMISIVA. La única prueba que vale de que un correo existe es
 * que llegue el primer digest; una expresión estricta rechaza direcciones válidas raras y no detiene
 * ni una falsa. Se exige lo estructural: algo, arroba, dominio con punto, sin espacios.
 */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/**
 * Quita caracteres de CONTROL. Misma intención que `api/solicitud.ts`, escrito con la clase Unicode
 * `\p{Cc}` en vez de un rango a mano: dice lo que hace y no se puede teclear mal. La forma «corta»
 * `[ -]` que aquel archivo advierte es un rango espacio..guion que borraría los espacios.
 */
const limpiar = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(/\p{Cc}/gu, '').trim().slice(0, max) : '';

export const POST: APIRoute = async ({ request }) => {
  // 1) Cuerpo: POST nativo del form (urlencoded) o fetch de la isla (JSON).
  const ct = request.headers.get('content-type') || '';
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ ok: false, reason: 'too-large' }, 413);

  let campos: Record<string, unknown>;
  try {
    campos = ct.includes('application/json')
      ? (JSON.parse(raw) as Record<string, unknown>)
      : Object.fromEntries(new URLSearchParams(raw));
  } catch {
    return json({ ok: false, reason: 'bad-request' }, 400);
  }

  const quiereJson = (request.headers.get('accept') || '').includes('application/json');
  const criterios = normalizarCriterios(campos);
  // La vuelta al formulario conserva la búsqueda: quien se equivocó en el correo no tiene que volver
  // a elegir zona, tipo y precio. Perder los criterios en el error es perder la alerta.
  const volver = (params: string) =>
    Response.redirect(new URL(`/alertas?${criteriosAQuery(criterios)}&${params}#alerta`, request.url), 303);

  // 2) Correo. Es el ÚNICO dato personal que se pide: sin nombre, sin teléfono. Cuanto menos se pide,
  //    menos hay que custodiar (minimización, Ley 1581 art. 4 lit. c).
  const email = limpiar(campos.email, 120).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return quiereJson ? json({ ok: false, reason: 'email' }, 422) : volver('error=email');
  }

  // 3) GATE DE HABEAS DATA (Ley 1581/2012 art. 9 · D.1377/2013 art. 7 · kit `08` §2.2). Un checkbox
  //    sin marcar NO viaja en el POST, así que su AUSENCIA es exactamente el caso a rechazar.
  const autorizacion = String(campos.autorizacion ?? '').trim().toLowerCase();
  if (!['on', 'true', '1'].includes(autorizacion)) {
    return quiereJson ? json({ ok: false, reason: 'autorizacion' }, 422) : volver('error=autorizacion');
  }

  // 4) Documento. `ultimoEnvio` nace con la fecha de alta a propósito: una alerta promete lo que
  //    ENTRE desde ahora. Si naciera vacía, el primer correo sería un volcado del catálogo entero, que
  //    no es lo que nadie pide al escribir su correo en «avísame cuando aparezca algo».
  const ahora = new Date();
  const iso = ahora.toISOString();
  const doc: Alerta = {
    email,
    criterios,
    estado: 'activa',
    // Secreto de la baja. `crypto.randomUUID` existe en Workers y en Node 20; es aleatorio de verdad,
    // no derivado del correo (derivarlo dejaría que cualquiera calculara el token de otra persona).
    token: crypto.randomUUID(),
    consentimiento: {
      autorizado: true,
      textoVersion: LEGAL.formatoAutorizacion,
      politicaVersion: `${LEGAL.politicaDatos.version} · ${LEGAL.politicaDatos.vigencia}`,
      formulario: 'alerta-busqueda',
      // El envío del digest ES la finalidad de esta alerta, no un extra opcional: quien la crea pide
      // que le escribamos. La casilla de marketing general sigue siendo otra cosa y aquí no se pide.
      marketing: false,
      aceptadoEn: iso,
      ip: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '',
      userAgent: (request.headers.get('user-agent') || '').slice(0, 200),
    },
    ultimoEnvio: iso,
    enviados: 0,
    createdAt: iso,
    updatedAt: iso,
    _version: 1,
  };

  // Sin argumento a propósito: `Astro.locals.runtime.env` fue REMOVIDO en Astro v6 ([[L-33]]).
  const cfg = getPublicFirebaseConfig();
  const r = await createDoc('alertas', doc as unknown as Record<string, unknown>, {
    apiKey: cfg.apiKey,
    projectId: cfg.projectId,
  });

  if (!r.ok) {
    if (quiereJson) return json({ ok: false, reason: r.reason }, r.reason === 'denied' ? 403 : 502);
    return volver('error=guardar');
  }
  if (quiereJson) return json({ ok: true }, 200);
  return Response.redirect(new URL(`/alertas?${criteriosAQuery(criterios)}&ok=1#alerta`, request.url), 303);
};
