/*
 * FIRESTORE DEL PANEL — una sola puerta (§330).
 *
 * Cada vista de `/gestion` tenía su propia copia de las mismas tres líneas («carga Auth, importa el
 * SDK, abre la base»): nueve copias y una décima en línea, y una de ellas (`gestion-liquidacion`)
 * inicializaba la app por su cuenta en vez de reusar la de Auth. Mientras las tres líneas fueron
 * iguales daba igual; el día que hizo falta algo más —conectar el emulador en desarrollo— tocaba
 * acordarse de diez sitios, y la primera vista que se olvidara habría leído PRODUCCIÓN.
 *
 * Vive aquí, y no en `auth.ts`, porque `auth.ts` lo cargan también páginas públicas (`/ingresar`) y
 * el gate `verify:data` prohíbe el SDK de Firestore fuera del panel — con razón: una página pública
 * no debe arrastrar ese peso ni esa tentación.
 */

import { cargarAuth, EMULADORES_PANEL } from './auth';

let conectado = false;

/** La base del panel, reusando la app que ya inicializó Auth (no se inicializa dos veces). */
export async function cargarFirestore() {
  const { app } = await cargarAuth();
  const mod = await import('firebase/firestore');
  const db = mod.getFirestore(app);
  // Solo en desarrollo y si se pidió (ver `auth.ts`). Se conecta en la PRIMERA apertura, antes de
  // que nadie haga una consulta: todas las vistas pasan por aquí.
  if (EMULADORES_PANEL && !conectado) {
    conectado = true;
    mod.connectFirestoreEmulator(db, EMULADORES_PANEL, 8080);
  }
  return { db, mod };
}
