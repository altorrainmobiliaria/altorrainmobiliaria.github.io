// BAJA de una alerta guardada — la salida que todo correo periódico debe tener (Ley 1581 art. 8 lit. e:
// el titular puede revocar la autorización en cualquier momento, y revocar tiene que ser tan fácil como
// autorizar).
//
// POR QUÉ ES UN **POST** Y NO UN ENLACE QUE YA DA DE BAJA:
// los escáneres de correo (Gmail, Outlook, antivirus corporativos) VISITAN los enlaces de un mensaje
// para comprobar que no son maliciosos. Si la baja ocurriera en el GET, esos robots darían de baja a
// gente que ni abrió el correo, y nadie entendería por qué dejan de llegar las alertas. Por eso el
// enlace del correo abre `/alertas/baja`, que enseña un botón, y la baja ocurre al pulsarlo.
// El mismo endpoint acepta el POST directo de la cabecera `List-Unsubscribe-Post` (RFC 8058), que es
// el botón «Cancelar suscripción» que pinta el propio Gmail: ahí el POST lo hace una persona.
//
// QUÉ ESCRIBE: un documento en `bajasAlertas` (append-only). NO edita `alertas`, porque el público no
// puede leer esa colección para comprobar el token y una regla que permitiera editarla a ciegas sería
// un permiso mucho más grande que el problema. La Cloud Function del digest aplica las bajas
// pendientes ANTES de enviar nada, así que la revocación surte efecto antes del siguiente correo.

export const prerender = false;

import type { APIRoute } from 'astro';
import { createDoc } from '../../../lib/data/firestore-rest';
import { getPublicFirebaseConfig } from '../../../lib/data/client';
import type { BajaAlerta } from '../../../lib/domain/alertas';

const MAX_BODY = 2048;

/** Id de documento de Firestore: alfanumérico, 1-64. Filtra basura antes de gastar una escritura. */
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
/** El token lo emite `crypto.randomUUID()` en el alta. Se valida su FORMA, no su valor (eso lo hace la Function). */
const TOKEN_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const POST: APIRoute = async ({ request, url }) => {
  const ct = request.headers.get('content-type') || '';
  const raw = await request.text();
  if (raw.length > MAX_BODY) return new Response('too large', { status: 413 });

  let campos: Record<string, unknown> = {};
  try {
    if (ct.includes('application/json')) campos = JSON.parse(raw) as Record<string, unknown>;
    else if (raw) campos = Object.fromEntries(new URLSearchParams(raw));
  } catch {
    campos = {};
  }
  // El one-click de RFC 8058 manda `List-Unsubscribe=One-Click` como cuerpo y NADA más: los datos
  // viajan en la URL. Por eso la query es el respaldo y no al revés.
  const id = String(campos.id ?? url.searchParams.get('id') ?? '').trim();
  const token = String(campos.t ?? url.searchParams.get('t') ?? '').trim();

  const destino = (params: string) => new URL(`/alertas/baja?${params}`, request.url);
  const unClick = raw.includes('List-Unsubscribe');

  if (!ID_RE.test(id) || !TOKEN_RE.test(token)) {
    // Al cliente de correo se le responde 200 igual: un 4xx en el one-click marca el remitente como
    // roto en sus métricas, y aquí el enlace malformado no es culpa de quien lo pulsó.
    if (unClick) return new Response('ok', { status: 200 });
    return Response.redirect(destino('error=enlace'), 303);
  }

  const doc: BajaAlerta = {
    alertaId: id,
    token,
    createdAt: new Date().toISOString(),
    aplicada: false,
  };

  const cfg = getPublicFirebaseConfig();
  const r = await createDoc('bajasAlertas', doc as unknown as Record<string, unknown>, {
    apiKey: cfg.apiKey,
    projectId: cfg.projectId,
  });

  if (unClick) return new Response(r.ok ? 'ok' : 'error', { status: r.ok ? 200 : 502 });
  // Sin JavaScript esto es un POST nativo → 303 de vuelta a la página, que dice qué pasó. Un fallo se
  // cuenta: si alguien quiso salirse y no pudo, decirle «listo» es exactamente la mentira que no toca.
  return Response.redirect(destino(r.ok ? 'ok=1' : 'error=guardar'), 303);
};
