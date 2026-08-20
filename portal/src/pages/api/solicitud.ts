// Endpoint de LEADS del portal (§88). Recibe el formulario público de `/publicar` ("Solicita tu avalúo
// gratis") y crea el documento en `solicitudes` — la MISMA colección y el MISMO contrato que escribe el
// legacy (`js/contact-forms.js`), para que la Cloud Function ya desplegada `onNewSolicitud` lo recoja sin
// tocar nada: correo al admin + lead scoring + arranque de nurturing.
//
// Por qué un endpoint y no el SDK en el navegador:
//   · CERO peso extra en el cliente (el SDK modular de Firestore son ~100KB; aquí no entra ninguno).
//   · El formulario funciona SIN JavaScript (POST nativo → 303 a la misma página con ?ok=1).
//   · La validación vive en el servidor, donde no se puede saltar desde la consola.
// Las Security Rules siguen siendo la frontera real: `solicitudes` tiene `allow create: if true`
// (verificado contra las reglas VIVAS de producción el 2026-08-19, no contra el archivo del repo).
//
// ⚠️ NO escribe nada más que `solicitudes`. Cualquier otra colección exige repensar las Rules.

export const prerender = false;

import type { APIRoute } from 'astro';
import { createDoc } from '../../lib/data/firestore-rest';
import { getPublicFirebaseConfig } from '../../lib/data/client';
import { LEGAL } from '../../lib/config/legal';

/** Tope de bytes del cuerpo: un lead legítimo son ~300 bytes. Corta payloads de abuso antes de parsear. */
const MAX_BODY = 4096;

/** Valores que el `<select>` de `/publicar` puede emitir. Allow-list: lo que no esté aquí no se guarda. */
const ZONAS = ['Castillogrande', 'Bocagrande', 'Manga', 'Crespo', 'Centro Histórico', 'La Boquilla'];
const TIPOS_INMUEBLE = ['Apartamento', 'Casa', 'Lote', 'Oficina', 'Local'];

// Quita caracteres de CONTROL (no imprimibles). Escrito como \u0000-\u001f a proposito: la forma
// "corta" [ -] es un RANGO espacio..guion que borraria los espacios de un nombre compuesto.
const limpiar = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max) : '';

/** Teléfono colombiano tolerante: dígitos, espacios, +, guiones y paréntesis; 7-20 caracteres útiles. */
const TEL_RE = /^[+()\d][\d\s()+-]{6,19}$/;

/** Un nombre con URL dentro es spam de bot, no un propietario. */
const SPAM_RE = /(https?:\/\/|www\.|\[url|<a\s)/i;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  // 1) Cuerpo: acepta el POST nativo del form (urlencoded) y el fetch de la isla (JSON).
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

  // 2) Validación. Nombre y teléfono son los ÚNICOS obligatorios — es lo que pide el mockup.
  const nombre = limpiar(campos.nombre, 80);
  const telefono = limpiar(campos.telefono, 25);
  if (nombre.length < 2 || SPAM_RE.test(nombre)) return json({ ok: false, reason: 'nombre' }, 422);
  if (!TEL_RE.test(telefono)) return json({ ok: false, reason: 'telefono' }, 422);

  // 2b) GATE DE HABEAS DATA (Ley 1581/2012 art. 9 · D.1377/2013 art. 7 · kit `08` §2.2).
  //     «El backend nunca envía el dato a la base si la casilla principal no está marcada» y
  //     «el silencio jamás equivale a autorización». Un checkbox HTML sin marcar NO viaja en el
  //     POST, así que su AUSENCIA es exactamente el caso a rechazar — por eso se exige presencia
  //     explícita en vez de comprobar un valor negativo.
  const autorizacion = String(campos.autorizacion ?? '').trim().toLowerCase();
  const autorizo = autorizacion === 'on' || autorizacion === 'true' || autorizacion === '1';
  if (!autorizo) return json({ ok: false, reason: 'autorizacion' }, 422);
  const marketing = ['on', 'true', '1'].includes(String(campos.marketing ?? '').trim().toLowerCase());

  const zonaIn = limpiar(campos.zona, 40);
  const tipoIn = limpiar(campos.tipo, 40);
  const zona = ZONAS.includes(zonaIn) ? zonaIn : '';
  const tipoInmueble = TIPOS_INMUEBLE.includes(tipoIn) ? tipoIn : '';

  // 3) Documento. `tipo` es el tipo de LEAD (taxonomía de `onNewSolicitud`), NO el tipo de inmueble:
  //    el `<select name="tipo">` del form es el del inmueble y viaja en `datosExtra.tipoInmueble`.
  //    `ciudad` lleva la zona porque el correo al admin renderiza «{tipoInmueble} en {ciudad}»; sin
  //    esto el lead le llegaría a Daniel sin saber de qué barrio es.
  const ahora = new Date();
  const doc = {
    nombre,
    telefono,
    email: '', // el mockup no pide correo — ver §88: cuesta 10 puntos de lead score
    tipo: 'solicitud_avaluo',
    origen: 'portal-publicar',
    datosExtra: {
      zona,
      ciudad: zona ? `${zona}, Cartagena` : 'Cartagena',
      tipoInmueble,
      operacion: 'avaluo',
      precioAproximado: null,
      descripcion: '',
    },
    // Prueba de consentimiento conservable (kit `08` §2.2 «Registro de prueba»): sin esto la
    // autorización no es demostrable ante la SIC, y una autorización que no se puede probar
    // equivale a no tenerla.
    consentimiento: {
      autorizado: true,
      textoVersion: LEGAL.formatoAutorizacion,
      politicaVersion: `${LEGAL.politicaDatos.version} · ${LEGAL.politicaDatos.vigencia}`,
      formulario: 'publicar-propiedad',
      marketing,
      aceptadoEn: ahora.toISOString(),
      ip: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '',
      userAgent: (request.headers.get('user-agent') || '').slice(0, 200),
    },
    estado: 'pendiente',
    createdAt: ahora,
    updatedAt: ahora,
    emailSent: false,
    requiereCita: false,
  };

  // Sin argumento A PROPOSITO: `Astro.locals.runtime.env` fue REMOVIDO en Astro v6 (L-33, cazado en
  // vivo otra vez aqui) y el override por env de runtime es hook post-MVP — `client.ts` ya resuelve
  // build-time -> constante. Es lo mismo que hace `middleware.ts` con el cliente de lectura.
  const cfg = getPublicFirebaseConfig();
  const r = await createDoc('solicitudes', doc, { apiKey: cfg.apiKey, projectId: cfg.projectId });

  // 4) Respuesta. Sin JS el navegador siguió un POST normal → 303 de vuelta a la página (patrón
  //    POST-Redirect-GET, así un F5 no reenvía el lead). Con JS la isla lee el JSON.
  const quiereJson = (request.headers.get('accept') || '').includes('application/json');
  if (!r.ok) {
    if (quiereJson) return json({ ok: false, reason: r.reason }, r.reason === 'denied' ? 403 : 502);
    return Response.redirect(new URL('/publicar?error=1#empezar', request.url), 303);
  }
  if (quiereJson) return json({ ok: true }, 200);
  return Response.redirect(new URL('/publicar?ok=1#empezar', request.url), 303);
};
