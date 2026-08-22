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
import { ZONAS as ZONAS_LANDING } from '../../lib/content/zonas';
import { explicarProblemaReserva, problemasDeReserva, resumenReserva } from '../../lib/domain/reserva';

/** Tope de bytes del cuerpo: un lead legítimo son ~300 bytes. Corta payloads de abuso antes de parsear. */
const MAX_BODY = 4096;

/**
 * Zonas aceptadas. Allow-list: lo que no esté aquí NO se guarda, y ese descarte es silencioso.
 *
 * Son la UNIÓN de dos conjuntos, y por eso se compone en vez de escribirse a mano: las 6 del
 * `<select>` de `/publicar` (que vienen del mockup) y las 13 de las landings de zona (`zonas.ts`,
 * ADR §92), que ofrece el formulario del Rango. Cuando se añada una zona en `zonas.ts` entrará aquí
 * sola; escribir la lista a mano habría hecho que la zona nueva se perdiera sin un solo error.
 */
const ZONAS_PUBLICAR = ['Castillogrande', 'Bocagrande', 'Manga', 'Crespo', 'Centro Histórico', 'La Boquilla'];
const ZONAS = [...new Set([...ZONAS_PUBLICAR, ...ZONAS_LANDING.map((z) => z.nombre)])];
const TIPOS_INMUEBLE = ['Apartamento', 'Casa', 'Lote', 'Oficina', 'Local'];

/**
 * FORMULARIOS que pueden escribir aquí, y el `origen` con el que queda el lead (ADR §94).
 *
 * Lista BLANCA a propósito. El `origen` es lo que permite triar los leads y decidir a cuál llamar
 * primero; dejar que el cliente mande una cadena libre lo dejaría a merced de un bot. El censo de
 * `docs/43 §LEADS` se hizo mapeando cada `origen` a su formulario: si todos los leads dijeran lo
 * mismo, ese censo habría sido imposible.
 */
const FORMULARIOS: Record<string, { origen: string; operacion: string; tipoLead?: string; volverA?: string }> = {
  'publicar-propiedad': { origen: 'portal-publicar', operacion: 'avaluo', volverA: '/publicar' },
  'rango-altorra': { origen: 'portal-rango', operacion: 'rango', volverA: '/publicar' },
  // §122 — `tipoLead: 'contacto_propiedad'` y no un tipo nuevo A PROPÓSITO: quien manda el correo es
  // `onNewSolicitud`, del codebase LEGACY, que NO se puede desplegar hasta el cutover. Un tipo que no
  // conoce cae en `typeScores[...] || 5` y en `tipoLabel[...] || tipo`: el lead valdría 5 puntos en vez
  // de 25 y el asunto del correo diría «reserva_estancia» en crudo. `contacto_propiedad` ya existe, ya
  // puntúa alto y ya tiene secuencia. Cuando el portal se lleve los correos, tendrá tipo propio.
  'reserva-estancia': {
    origen: 'portal-estancias',
    operacion: 'alojamiento',
    tipoLead: 'contacto_propiedad',
    volverA: '/estancias',
  },
};
const FORMULARIO_POR_DEFECTO = 'publicar-propiedad';

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

  // 2c) Formulario de procedencia. Lo que no esté en la lista blanca se trata como el de siempre,
  //     que es el comportamiento que ya existía: un valor raro no puede inventarse un origen nuevo.
  const formIn = limpiar(campos.formulario, 40);
  const formulario = FORMULARIOS[formIn] ? formIn : FORMULARIO_POR_DEFECTO;
  const { origen, operacion, tipoLead, volverA } = FORMULARIOS[formulario];

  // 2d) SOLICITUD DE ESTANCIA (§122). Las fechas se validan AQUÍ además de en la página: la página
  //     avisa para no hacer perder el viaje, pero el servidor es el que decide — un POST se fabrica
  //     desde la consola en diez segundos, y una solicitud para llegar «ayer» es una llamada
  //     desperdiciada de alguien del equipo.
  let estancia: { llegada: string; salida: string; huespedes: number } | null = null;
  if (formulario === 'reserva-estancia') {
    const cand = {
      llegada: limpiar(campos.llegada, 10),
      salida: limpiar(campos.salida, 10),
      huespedes: Number(campos.huespedes),
    };
    const malos = problemasDeReserva(cand, new Date().toISOString().slice(0, 10));
    if (malos.length) {
      return json({ ok: false, reason: 'estancia', mensajes: malos.map(explicarProblemaReserva) }, 422);
    }
    estancia = cand;
  }

  // 3) Documento. `tipo` es el tipo de LEAD (taxonomía de `onNewSolicitud`), NO el tipo de inmueble:
  //    el `<select name="tipo">` del form es el del inmueble y viaja en `datosExtra.tipoInmueble`.
  //    `ciudad` lleva la zona porque el correo al admin renderiza «{tipoInmueble} en {ciudad}»; sin
  //    esto el lead le llegaría a Daniel sin saber de qué barrio es.
  const ahora = new Date();
  const doc = {
    nombre,
    telefono,
    email: '', // el mockup no pide correo — ver §88: cuesta 10 puntos de lead score
    tipo: tipoLead ?? 'solicitud_avaluo',
    origen,
    datosExtra: {
      zona,
      ciudad: zona ? `${zona}, Cartagena` : 'Cartagena',
      // El correo al admin renderiza «{tipoInmueble} en {ciudad}». Para una estancia eso tiene que
      // leerse como lo que es, no quedarse vacío.
      tipoInmueble: estancia ? 'Corta estancia' : tipoInmueble,
      operacion,
      precioAproximado: null,
      // La descripción es lo único del correo que puede llevar las fechas: la plantilla vive en una
      // Function del legacy que no se puede tocar hasta el cutover, así que lo que no venga escrito
      // en el documento no aparece en el correo.
      descripcion: estancia ? resumenReserva(estancia) : '',
      ...(estancia
        ? {
            llegada: estancia.llegada,
            salida: estancia.salida,
            huespedes: estancia.huespedes,
            // Se dice en el propio dato: el catálogo de estancias todavía es un EJEMPLO (TODO-22).
            // Sin esta línea, quien atienda el lead creería que hay un alojamiento concreto reservado.
            sobre: 'consulta general de corta estancia — sin inventario publicado todavía',
          }
        : {}),
    },
    // Prueba de consentimiento conservable (kit `08` §2.2 «Registro de prueba»): sin esto la
    // autorización no es demostrable ante la SIC, y una autorización que no se puede probar
    // equivale a no tenerla.
    consentimiento: {
      autorizado: true,
      textoVersion: LEGAL.formatoAutorizacion,
      politicaVersion: `${LEGAL.politicaDatos.version} · ${LEGAL.politicaDatos.vigencia}`,
      formulario,
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
  // El destino sin JS sale del formulario: antes estaba fijo a `/publicar`, así que una solicitud
  // desde estancias habría devuelto al visitante a otra página con un «ok» sobre algo que no pidió.
  const vuelta = volverA ?? '/publicar';
  const ancla = vuelta === '/publicar' ? '#empezar' : '#reservar';
  if (!r.ok) {
    if (quiereJson) return json({ ok: false, reason: r.reason }, r.reason === 'denied' ? 403 : 502);
    return Response.redirect(new URL(`${vuelta}?error=1${ancla}`, request.url), 303);
  }
  if (quiereJson) return json({ ok: true }, 200);
  return Response.redirect(new URL(`${vuelta}?ok=1${ancla}`, request.url), 303);
};
