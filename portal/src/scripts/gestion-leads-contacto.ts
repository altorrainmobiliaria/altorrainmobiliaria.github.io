/*
 * «MARCAR CONTACTADO» — la única escritura de la bandeja de leads (§330).
 *
 * Vive aparte del resto de `gestion-leads.ts` por una razón: la prueba del emulador
 * (`firebase/tests/rules.test.ts`) tiene que ejecutar ESTA misma función contra las Rules reales, y el
 * resto del panel arrastra el DOM y la carga de Auth. Recibe el módulo y la base como parámetros
 * (solo se importan sus TIPOS), así que la prueba le pasa los suyos y producción los del navegador.
 *
 * 🔴 QUÉ ESCRIBE, y sobre todo QUÉ NO: sella `contactadoAt` (hora del SERVIDOR) y `contactadoPor` (el
 * uid), y **no toca `estado`**. Hay dos disparadores que escriben al CLIENTE cuando cambia el estado:
 *   · `onSolicitudStatusChanged` (legacy, DESPLEGADO) manda correo en CUALQUIER cambio de estado, sin
 *     mirar la autorización de datos (`functions/index.js`). Con un lead del sitio viejo —traen correo
 *     y no traen consentimiento— cambiar a «contactado» habría intentado escribirle.
 *   · `avisoEstadoSolicitud` (portal, sin desplegar) diría «uno de nosotros te va a escribir» justo
 *     después de haberle escrito.
 * Los dos salen por «el estado no cambió». El pipeline de estados es otra decisión, y no se adelanta.
 *
 * Una sola escritura por lead: la transacción comprueba que nadie lo marcó antes, así que un doble
 * clic o dos personas a la vez no mueven la hora. Si otra persona ya lo marcó, se devuelve SU hora.
 *
 * ⚠️ LO QUE HOY GARANTIZA EL CLIENTE, NO EL SERVIDOR: que la hora sea la del servidor y que la marca
 * sea de una sola escritura lo asegura ESTA transacción. Las Rules dejan a un editor escribir
 * cualquier campo de `solicitudes` (lo necesita el panel viejo), así que un editor con la consola
 * abierta podría poner otra hora. Sellarlo en las Rules (`contactadoAt == request.time`, inmutable
 * una vez puesto) pide desplegarlas con su canario: queda como paso aparte (§330).
 *
 * ⚠️ Depende de `allow update: if esEditorOMas()` en `solicitudes` (firestore.rules), que existe porque
 * el panel viejo cambia el estado desde el navegador. Si el cutover lo cierra, este botón muere: la
 * prueba de alarma del emulador lo dice en el CI, y la salida es una callable.
 */

import { fechaDe } from '../lib/domain/tiempo';

type Fs = typeof import('firebase/firestore');
type Db = import('firebase/firestore').Firestore;

export type ResultadoContacto =
  | { ok: true; contactadoAt: Date | null }
  | { ok: false; motivo: 'ya'; contactadoAt: Date | null; contactadoPor: string | null }
  | { ok: false; motivo: 'no-existe' | 'permiso' | 'red' | 'sesion' };

/** El código de un error de Firebase (`permission-denied`…), o `''` si no trae ninguno. */
export const codigoDeError = (e: unknown): string =>
  e && typeof e === 'object' && typeof (e as { code?: unknown }).code === 'string' ? (e as { code: string }).code : '';

export async function marcarContactadoEn(mod: Fs, db: Db, id: string, uid: string): Promise<ResultadoContacto> {
  if (!uid) return { ok: false, motivo: 'sesion' };
  const ref = mod.doc(db, 'solicitudes', id);
  try {
    const paso = await mod.runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return 'no-existe' as const;
      if (snap.get('contactadoAt') != null) return 'ya' as const;
      tx.update(ref, { contactadoAt: mod.serverTimestamp(), contactadoPor: uid, updatedAt: mod.serverTimestamp() });
      return 'ok' as const;
    });
    if (paso === 'no-existe') return { ok: false, motivo: 'no-existe' };
    // La hora REAL la pone el servidor: se relee en vez de suponerla con el reloj del PC. Si la
    // relectura falla, `null` — quien llama recarga la bandeja antes que inventar una hora.
    let contactadoAt: Date | null = null;
    let contactadoPor: string | null = null;
    try {
      const leido = await mod.getDoc(ref);
      contactadoAt = fechaDe(leido.get('contactadoAt'));
      const por: unknown = leido.get('contactadoPor');
      contactadoPor = typeof por === 'string' && por ? por : null;
    } catch {
      contactadoAt = null;
    }
    // Con «ya» se dice QUIÉN: el aviso no puede afirmar «otra persona» si fue quien mira.
    return paso === 'ok' ? { ok: true, contactadoAt } : { ok: false, motivo: 'ya', contactadoAt, contactadoPor };
  } catch (e) {
    const c = codigoDeError(e);
    if (c === 'permission-denied') return { ok: false, motivo: 'permiso' };
    if (c === 'unauthenticated') return { ok: false, motivo: 'sesion' };
    return { ok: false, motivo: 'red' };
  }
}
