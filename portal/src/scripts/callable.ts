/*
 * LLAMAR A UNA CLOUD FUNCTION callable — por HTTP plano, sin `firebase/functions`.
 *
 * POR QUÉ EXISTE ESTE MÓDULO. La misma función estaba copiada en `gestion-novedades` y en
 * `gestion-contratos`, y al escribir la tercera y la cuarta copia (`gestion-documentos` y
 * `/seguridad`) quedó claro que el patrón es del proyecto, no de una pantalla. Cuatro copias de un
 * contrato de red es cómo se arregla un fallo en tres sitios y se olvida el cuarto.
 *
 * POR QUÉ NO SE USA `firebase/functions`. `verify:data` lo prohíbe en el portal: cada SDK cliente que
 * entra son kilobytes y una superficie más que mantener, y el protocolo callable es tan simple que no
 * se gana la excepción — `POST {data: …}` con el token en la cabecera, respuesta `{result: …}` o
 * `{error: {message, details}}`.
 *
 * ⚠️ Los módulos `gestion-novedades` y `gestion-contratos` siguen con su copia propia: funcionan y
 * migrarlos hoy sería riesgo sin ganancia. Cuando se toquen, se traen aquí.
 */

import { cargarAuth } from './auth';
import { FIREBASE_PUBLICO } from '../lib/config/firebase-publico';

const REGION = 'us-central1';

export type Respuesta =
  | { ok: true; result: Record<string, unknown> }
  | { ok: false; mensaje: string };

/**
 * Llama a `nombre` con `datos`.
 *
 * Los `mensajes` del detalle son la parte útil de un error de validación: sin ellos hay que adivinar
 * cuál de los campos estaba mal, y en un formulario de doce campos eso son doce intentos.
 */
export async function llamarCallable(nombre: string, datos: unknown): Promise<Respuesta> {
  let token: string | null = null;
  try {
    const { auth } = await cargarAuth();
    token = (await auth.currentUser?.getIdToken()) ?? null;
  } catch {
    token = null;
  }
  if (!token) return { ok: false, mensaje: 'Tu sesión caducó. Recarga la página y vuelve a entrar.' };

  try {
    const resp = await fetch(`https://${REGION}-${FIREBASE_PUBLICO.projectId}.cloudfunctions.net/${nombre}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: datos }),
    });
    const cuerpo = (await resp.json().catch(() => null)) as
      | { result?: Record<string, unknown>; error?: { message?: string; details?: { mensajes?: string[] } } }
      | null;
    if (resp.ok && cuerpo?.result) return { ok: true, result: cuerpo.result };
    const detalle = cuerpo?.error?.details?.mensajes;
    return {
      ok: false,
      mensaje: detalle?.length ? detalle.join(' ') : (cuerpo?.error?.message ?? 'No se pudo completar la operación.'),
    };
  } catch {
    return { ok: false, mensaje: 'No se pudo conectar. Revisa la conexión.' };
  }
}
