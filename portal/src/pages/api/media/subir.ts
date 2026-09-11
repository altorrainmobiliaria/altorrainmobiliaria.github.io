/*
 * SUBIDA DE FOTOS A R2 — el eslabón que faltaba para que el portal pueda publicar un inmueble (§107).
 *
 * POR QUÉ ESTE ENDPOINT Y NO OTRA COSA. El recon de §106 lo dejó claro: `R2_MEDIA` llevaba desde Ola 0
 * declarado en `wrangler.jsonc` y con bucket creado, pero **sin una sola línea de código que subiera
 * nada**. Y sin portada no hay card en el catálogo (`propiedadAResumen` omite con motivo `sin-imagen`),
 * así que el formulario de alta no podía producir una propiedad publicable. Copiar el flujo del panel
 * viejo tampoco valía: sube a Firebase Storage, y `verify:data` prohíbe `firebase/storage` en TODO
 * `portal/src` — el bucket privado es para cédulas y expedientes, no para fotos públicas.
 *
 * QUÉ HACE Y QUÉ NO. Recibe UN derivado WebP ya convertido por el navegador y lo pone en el bucket con
 * una clave predecible. NO convierte, NO redimensiona y NO genera miniaturas: eso costaría CPU del
 * Worker en cada subida y una dependencia de imagen dentro del edge, cuando el navegador ya tiene un
 * canvas y lo hace gratis. El endpoint devuelve la CLAVE, nunca la URL — es el contrato de `media.ts`,
 * y devolver una URL sería invitar a guardarla en `imagenes[]`, que es justo el defecto que tiene la
 * semilla del proyecto.
 *
 * 🖼️ DOS VARIANTES DESDE §304 (`?v=full|thumb`). El navegador manda las dos derivadas y cada una trae
 * SU tope: 3 MB la foto, 150 KB la miniatura. La diferencia importa: sin ella, «subir el thumb» y
 * «subir la foto otra vez» son lo mismo para el servidor, y el día que el cliente se equivoque de blob
 * el bucket guardaría una imagen de 1600 px bajo el nombre del thumb — sirviéndose perfectamente, solo
 * que veinte veces más pesada. Hasta §304 solo existía la foto, y el índice la usaba como tarjeta.
 *
 * LA PUERTA. A R2 no llegan las Security Rules de Firebase, así que este es el ÚNICO sitio donde se
 * puede decidir quién escribe. Se exige un ID token de Firebase verificado con WebCrypto y el claim
 * `admin` — el MISMO que leen las Rules (§99), para que las dos puertas no puedan discrepar.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { esEditorOMas, tokenDeCabecera, verificarIdToken } from '../../../lib/auth/verificar-id-token';
import { FIREBASE_PUBLICO } from '../../../lib/config/firebase-publico';
import {
  claveImagen,
  explicarRechazo,
  topeDe,
  validarCuerpo,
  VARIANTES,
  type VarianteImagen,
} from '../../../lib/media-subida';

interface BucketR2 {
  put(clave: string, valor: ArrayBuffer, opciones?: { httpMetadata?: { contentType?: string; cacheControl?: string } }): Promise<unknown>;
}

function json(cuerpo: unknown, status: number): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/**
 * Las fotos son INMUTABLES por clave-y-contenido en la práctica: subir la posición 3 otra vez la
 * reemplaza, y el visitante ve la nueva en cuanto caduque el TTL. Un año de caché con `immutable` sería
 * mentira mientras se pueda reemplazar; una semana es el punto honesto entre coste y frescura.
 */
const CACHE_MEDIA = 'public, max-age=604800';

export const POST: APIRoute = async ({ request, url }) => {
  // ── 1. ¿Quién eres? ANTES de leer el cuerpo: si no tienes permiso, ni siquiera gastamos memoria en
  //    tu archivo. Un endpoint que primero carga 3 MB y luego dice «no autorizado» es un amplificador.
  const r = await verificarIdToken(tokenDeCabecera(request.headers.get('authorization')), {
    projectId: FIREBASE_PUBLICO.projectId,
  });
  if (!r.ok) {
    // El motivo VIAJA a propósito. No filtra nada útil a un atacante (ya sabe si su token está
    // caducado) y le ahorra una tarde a quien tenga el reloj desfasado o la sesión vieja.
    const status = r.motivo === 'jwk-no-disponible' ? 503 : 401;
    return json({ ok: false, motivo: r.motivo }, status);
  }
  if (!esEditorOMas(r.token)) return json({ ok: false, motivo: 'sin-permiso' }, 403);

  // ── 2. ¿Qué clave? Se compone en el servidor a partir de parámetros validados; el cliente NUNCA
  //    propone la ruta. Dejar que la elija es cómo se acaba escribiendo fuera de `props/`.
  //    La variante también se VALIDA contra la lista cerrada: un `?v=` cualquiera cae en `full`, que
  //    es el lado conservador (tope grande, nombre sin sufijo), nunca en un nombre inventado.
  const pedida = (url.searchParams.get('v') ?? 'full').toLowerCase();
  const variante: VarianteImagen = (VARIANTES as readonly string[]).includes(pedida)
    ? (pedida as VarianteImagen)
    : 'full';
  const clave = claveImagen(url.searchParams.get('propiedad') ?? '', Number(url.searchParams.get('n')), variante);
  if (!clave.ok) return json({ ok: false, motivo: clave.motivo, mensaje: explicarRechazo(clave.motivo, variante) }, 400);

  // ── 3. ¿Qué archivo? El `content-length` se comprueba primero para poder rechazar SIN leer, y el
  //    tamaño real se vuelve a comprobar después porque esa cabecera la escribe el cliente.
  const declarado = Number(request.headers.get('content-length') ?? '0');
  if (declarado > topeDe(variante)) {
    return json({ ok: false, motivo: 'demasiado-grande', mensaje: explicarRechazo('demasiado-grande', variante) }, 413);
  }

  let bytes: ArrayBuffer;
  try {
    bytes = await request.arrayBuffer();
  } catch {
    return json({ ok: false, motivo: 'cuerpo-ilegible' }, 400);
  }

  const v = validarCuerpo(request.headers.get('content-type'), bytes.byteLength, variante);
  if (!v.ok) {
    return json(
      { ok: false, motivo: v.motivo, mensaje: explicarRechazo(v.motivo, variante) },
      v.motivo === 'demasiado-grande' ? 413 : 400,
    );
  }

  // ── 4. Al bucket.
  const bucket = (env as { R2_MEDIA?: BucketR2 }).R2_MEDIA;
  if (!bucket) {
    // Pasa en `astro dev`, donde no hay bindings. Se dice con todas las letras en vez de fingir que
    // se guardó: un panel que confirma una subida que no ocurrió es peor que uno que falla.
    return json({ ok: false, motivo: 'bucket-no-disponible' }, 503);
  }

  try {
    await bucket.put(clave.clave, bytes, {
      httpMetadata: { contentType: 'image/webp', cacheControl: CACHE_MEDIA },
    });
  } catch {
    return json({ ok: false, motivo: 'fallo-al-guardar' }, 502);
  }

  // Se devuelve la CLAVE, no la URL: es lo que va en `Propiedad.imagenes[]` (contrato de `media.ts`).
  return json({ ok: true, clave: clave.clave, bytes: bytes.byteLength }, 201);
};
