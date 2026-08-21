/*
 * Config PÚBLICA de Firebase — dueño ÚNICO de estos tres valores.
 *
 * La `apiKey` de Firebase es pública POR DISEÑO (identifica el proyecto, no autoriza nada: quien
 * autoriza son las Security Rules). Lo que no es sano es tenerla escrita en dos sitios: hasta hoy
 * vivía en `lib/data/client.ts` (para las lecturas REST) y OTRA VEZ, a mano, dentro del `<script>` de
 * `/ingresar` (para Auth) — con un `authDomain` que solo existía en la segunda copia. Dos copias de
 * una constante no fallan el día que se escriben; fallan el día que una de las dos cambia.
 *
 * ⚠️ Esto es el FALLBACK. La cascada de resolución (env de runtime → build-time → esta constante)
 * sigue viviendo en `client.ts`, que es quien la necesita; aquí solo está el valor por defecto.
 */
export const FIREBASE_PUBLICO = {
  apiKey: 'AIzaSyCLxOwj3837m6p9QFDBWzVTuNUFhBkCg_I',
  projectId: 'altorra-inmobiliaria-345c6',
  /** Solo lo usa Auth (el popup de Google y el manejo de sesión). El cliente REST no lo necesita. */
  authDomain: 'altorra-inmobiliaria-345c6.firebaseapp.com',
} as const;
