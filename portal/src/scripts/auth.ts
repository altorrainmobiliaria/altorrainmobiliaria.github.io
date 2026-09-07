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
  /** La app ya inicializada. La expone para que otros módulos (p. ej. el panel) no la re-inicialicen. */
  app: import('firebase/app').FirebaseApp;
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
      return { auth: mod.getAuth(app), mod, app };
    })();
  }
  return promesa;
}

/**
 * Los tres roles del equipo. Viven en el claim `rol`, que pone `claimsStaffSync` leyendo
 * `usuarios/{uid}` — el mismo que consultan las Rules (`esSuperAdmin()`, `esEditorOMas()`).
 */
export type Rol = 'super_admin' | 'editor' | 'viewer';

/** Estado de acceso de quien mira la página. */
export type EstadoAcceso =
  | { estado: 'anonimo' }
  | { estado: 'sin-permiso'; email: string | null }
  | { estado: 'staff'; email: string | null; rol: Rol; puedeEditar: boolean; esDueno: boolean };

/**
 * Traduce el claim a los dos permisos que la interfaz necesita de verdad. Se derivan AQUÍ, en un
 * sitio único, porque el error clásico es que cada pantalla invente su propia comparación de strings
 * y una se olvide de un rol.
 *
 * ⚠️ Esto decide qué se DIBUJA, no qué se puede hacer: quien manda es la Rule. La interfaz que
 * ofrece un botón que la base va a rechazar no es más segura ni menos — es simplemente mentirosa.
 */
function permisosDe(rol: Rol) {
  return {
    puedeEditar: rol === 'super_admin' || rol === 'editor',
    esDueno: rol === 'super_admin',
  };
}

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
export async function estadoAcceso(forzarRefresco = false): Promise<EstadoAcceso> {
  const { auth, mod } = await cargarAuth();
  const usuario = await new Promise<import('firebase/auth').User | null>((resolve) => {
    const off = mod.onAuthStateChanged(auth, (u) => {
      off();
      resolve(u);
    });
  });
  if (!usuario) return { estado: 'anonimo' };

  // Sin `forzarRefresco` se usa el token en CACHÉ: es lo correcto por defecto, porque forzar una
  // llamada de red en cada carga del panel encarece el caso normal para servir a uno que pasa una vez.
  //
  // El caso que pasa una vez: a alguien le acaban de dar el permiso y su token todavía no lo lleva —
  // los claims viajan DENTRO del token y este se renueva cada hora. Vería «no tienes permiso» y
  // pensaría que falló. Por eso el estado de «sin permiso» ofrece volver a comprobar, y esa comprobación
  // sí fuerza el refresco: es el único momento en que la llamada extra se gana su coste.
  const token = await usuario.getIdTokenResult(forzarRefresco);
  if (token.claims.admin !== true) return { estado: 'sin-permiso', email: usuario.email };

  // El rol viaja en el mismo token que el permiso. Si falta —claim viejo, sincronización a medias—
  // se asume el MÍNIMO (`viewer`), nunca el máximo: un claim ausente no es una promoción. (§130)
  const crudo = token.claims.rol;
  const rol: Rol =
    crudo === 'super_admin' || crudo === 'editor' || crudo === 'viewer' ? crudo : 'viewer';

  return { estado: 'staff', email: usuario.email, rol, ...permisosDe(rol) };
}

/** Cierra la sesión y devuelve a la home. */
export async function salir(): Promise<void> {
  const { auth, mod } = await cargarAuth();
  await mod.signOut(auth);
  window.location.href = '/';
}
