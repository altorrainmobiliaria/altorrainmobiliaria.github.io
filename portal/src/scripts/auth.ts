/*
 * AUTENTICACIÓN del portal — dueño único de CÓMO se carga Firebase Auth en el navegador.
 *
 * ⚠️ LO PRIMERO, PORQUE ES LO QUE MÁS SE MALENTIENDE: **esto NO es una frontera de seguridad.**
 * Todo lo que hay aquí corre en el navegador de quien visita, y cualquiera puede saltárselo con la
 * consola abierta. La frontera REAL son las Security Rules de Firestore (`isStaff()`), que deciden qué
 * documentos se dejan leer sin importar lo que haga la página. Lo que este módulo aporta es que la
 * interfaz de administración **no se le presente a quien no ha entrado**, y que quien entra sin
 * permisos vea un mensaje claro en vez de un panel vacío que parece roto.
 *
 * POR QUÉ SE CARGA CON `import()` DINÁMICO: el SDK de Auth pesa. Una página pública no debe pagar ese
 * peso por existir; solo lo paga quien de verdad va a autenticarse.
 *
 * Lo usan `/ingresar` (entrar) y `/gestion` (comprobar que quien mira es del equipo).
 */

import { FIREBASE_PUBLICO } from '../lib/config/firebase-publico';

/** Lo que devuelve la carga: la instancia de Auth y el módulo, para no re-importarlo en cada llamada. */
export interface AuthCargado {
  auth: import('firebase/auth').Auth;
  mod: typeof import('firebase/auth');
}

let promesa: Promise<AuthCargado> | null = null;

/** Carga (una sola vez por página) Firebase App + Auth con la config pública del portal. */
export function cargarAuth(): Promise<AuthCargado> {
  if (!promesa) {
    promesa = (async () => {
      const [{ initializeApp, getApps }, mod] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
      ]);
      const app = getApps().length ? getApps()[0] : initializeApp({ ...FIREBASE_PUBLICO });
      return { auth: mod.getAuth(app), mod };
    })();
  }
  return promesa;
}

/** Estado de acceso de quien mira la página. */
export type EstadoAcceso =
  | { estado: 'anonimo' }
  | { estado: 'sin-permiso'; email: string | null }
  | { estado: 'staff'; email: string | null };

/**
 * Resuelve el estado de acceso una vez, esperando a que Firebase restaure la sesión.
 *
 * `onAuthStateChanged` dispara SIEMPRE al menos una vez —con el usuario o con `null`— y esa primera
 * llamada es la que dice si había sesión guardada. Leer `auth.currentUser` sin esperarla devuelve
 * `null` en la primera pintura aunque la persona SÍ esté dentro, y el panel la echaría al login cada
 * vez que recarga. Es el error clásico de esta API.
 *
 * El permiso se lee del **custom claim `admin`**, que es el mismo que exige `isStaff()` en las Rules:
 * si aquí se usara otro criterio (un correo en una lista, por ejemplo), la interfaz diría que sí y la
 * base diría que no, y el panel se vería vacío sin explicación.
 */
export async function estadoAcceso(): Promise<EstadoAcceso> {
  const { auth, mod } = await cargarAuth();
  const usuario = await new Promise<import('firebase/auth').User | null>((resolve) => {
    const off = mod.onAuthStateChanged(auth, (u) => {
      off();
      resolve(u);
    });
  });
  if (!usuario) return { estado: 'anonimo' };

  // `getIdTokenResult()` sin forzar refresco usa el token en caché: si a alguien le acaban de dar el
  // claim, lo verá al renovar (una hora como mucho, o cerrando y abriendo sesión). Forzar refresco en
  // cada carga del panel sería una llamada de red por visita para un caso que pasa una vez.
  const token = await usuario.getIdTokenResult();
  const esStaff = token.claims.admin === true;
  return esStaff
    ? { estado: 'staff', email: usuario.email }
    : { estado: 'sin-permiso', email: usuario.email };
}

/** Cierra la sesión y devuelve a la home. */
export async function salir(): Promise<void> {
  const { auth, mod } = await cargarAuth();
  await mod.signOut(auth);
  window.location.href = '/';
}
