/*
 * `registrarEvento` — la bitácora que el sistema ya creía tener (§263).
 *
 * 🔴 LO QUE ESTABA PASANDO. Cinco sitios del portal llamaban a `registrarEvento` y esta función NO
 * EXISTÍA. Y las cinco llamadas van con `void llamarCallable(...)`, que no lanza y devuelve
 * `{ok:false}`: el fallo era completamente MUDO. La pantalla decía que todo salió bien, la cuenta se
 * creaba, el documento se abría — y no quedaba rastro de nada.
 *
 * ⚖️ EL QUE MÁS PESA: al crear una cuenta, la persona marca la casilla de habeas data y el sistema
 * mandaba la prueba de ese acto —correo, fecha, navegador— aquí. La Ley 1581 art. 9 exige poder
 * demostrar que la autorización se otorgó. El día que alguien la pida —o la pida la SIC— la
 * respuesta honesta era «no la tenemos», sobre un tratamiento que sí estaba ocurriendo.
 *
 * Y no era un descuido silencioso del todo: **el propio ruleset lo daba por hecho**. La regla de
 * `auditLog` dice, textualmente, que esa colección «ahora la escribe SOLO `registrarEvento` (Cloud
 * Function), que bypassa estas reglas y pone el uid VERIFICADO del token». Estaba diseñado,
 * documentado y sin escribir: una promesa cuyo mecanismo nunca llegó.
 *
 * POR QUÉ EN EL SERVIDOR Y NO DESDE EL NAVEGADOR. `auditLog` nace `allow create: if false` a
 * propósito. Una bitácora que el cliente puede escribir no prueba nada: el uid, la acción y la fecha
 * los pondría el mismo navegador cuyo comportamiento se quiere registrar. Aquí el uid sale del token
 * VERIFICADO y la fecha del reloj del servidor.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

const REGION = 'us-central1';

/**
 * Acciones admitidas. Es una LISTA CERRADA a propósito: una bitácora que acepta cualquier cadena se
 * convierte en un cajón donde nadie encuentra nada, y deja al navegador decidir cómo se llama lo que
 * hizo. Añadir una acción es una decisión, no un trámite.
 */
const ACCIONES = new Set([
  'cuenta-creada',        // prueba del consentimiento de habeas data (Ley 1581 art. 9)
  'documento-abierto',    // quién abrió qué de la bóveda (§142)
  'documento-retirado',
  'soporte-abierto',      // soportes del perfil de arrendatario
  'perfil-revisado',
]);

const texto = (v: unknown, max = 400): string =>
  (typeof v === 'string' ? v.trim() : '').slice(0, max);

/**
 * Quién llama. A diferencia de sus hermanas de escritura, esta NO exige rol de editor: el evento más
 * importante que registra —el consentimiento— lo produce una persona que acaba de crear su cuenta y
 * todavía no es nadie en el equipo. Lo que sí se exige es estar autenticado: un evento anónimo no
 * prueba nada de nadie.
 */
function exigirSesion(req: CallableRequest): { uid: string; email: string } {
  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'Hay que iniciar sesión para dejar constancia de esto.');
  }
  const token = req.auth.token as { email?: string } | undefined;
  return { uid: req.auth.uid, email: texto(token?.email, 200) };
}

export const registrarEvento = onCall({ region: REGION }, async (req) => {
  const quien = exigirSesion(req);
  const d = (req.data ?? {}) as Record<string, unknown>;

  const accion = texto(d.accion, 60);
  if (!ACCIONES.has(accion)) {
    /*
     * Se RECHAZA en vez de guardar lo que llegue. Una acción desconocida casi siempre significa que
     * alguien renombró algo en el portal y la bitácora dejó de entenderlo — y guardarla igual haría
     * que el error se descubriera meses después, buscando un registro que existe con otro nombre.
     */
    throw new HttpsError('invalid-argument', `Acción no reconocida por la bitácora: "${accion}".`, {
      admitidas: [...ACCIONES],
    });
  }

  const entrada = {
    accion,
    origen: texto(d.origen, 60),
    objetivo: texto(d.objetivo, 200),
    detalle: texto(d.detalle),
    // El uid y el correo salen del TOKEN, nunca del cuerpo: es lo único que hace de esto una prueba.
    uid: quien.uid,
    email: quien.email,
    // Y la fecha, del reloj del servidor por el mismo motivo.
    creadoEn: FieldValue.serverTimestamp(),
  };

  const ref = await getFirestore().collection('auditLog').add(entrada);
  logger.info('evento registrado', { id: ref.id, accion, uid: quien.uid });
  return { ok: true, id: ref.id };
});
