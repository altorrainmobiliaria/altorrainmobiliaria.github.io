/*
 * SEGUNDO FACTOR (TOTP) — dueño único de la lógica de doble verificación del portal.
 *
 * ⚠️ EL ORDEN IMPORTA, Y NO ES EL QUE PARECE. Se necesitan TRES pasos, no dos:
 *
 *   1. **RESOLVER** — que el login sepa terminar cuando Firebase pide el código.
 *   2. **INSCRIBIR** — que alguien pueda activar su segundo factor.
 *   3. **EXIGIR** — que las Rules lo pidan (`request.auth.token.firebase.sign_in_second_factor`).
 *
 * El cerebro tenía apuntados solo el 2 y el 3. Falta el 1 y es el que muerde primero: en cuanto una
 * persona se inscribe, su siguiente ingreso deja de resolverse con la contraseña — Firebase lanza
 * `auth/multi-factor-auth-required` y quien no sepa atrapar ese error muestra «credenciales
 * incorrectas» y **deja a esa persona fuera con la contraseña correcta en la mano**. Inscribir antes
 * de tener el resolver no es «adelantar trabajo»: es un autoencierro.
 *
 * POR QUÉ TOTP Y NO SMS: el SMS se cobra por mensaje (coste variable en un proyecto que se diseñó para
 * no costar) y es el factor más débil que existe — se intercepta cambiando la SIM. La aplicación de
 * autenticación no cuesta un peso por uso y no es susceptible a eso.
 *
 * ⚠️ ESTO NO ES LA FRONTERA. Igual que `auth.ts`: aquí solo se conduce la conversación con Firebase.
 * Quien decide de verdad es el servidor de Identity Platform (valida el código) y, más adelante, las
 * Security Rules. Un segundo factor que se declara cumplido en una variable del navegador es una
 * cortina, no una puerta — es exactamente el defecto que se documentó del panel hermano (§130).
 *
 * API verificada contra `node_modules/@firebase/auth/dist/auth-public.d.ts` de la versión 12.16.0
 * instalada en este repo, no de memoria.
 */

import { cargarAuth } from './auth';

import type {
  MultiFactorError,
  MultiFactorResolver,
  TotpSecret,
  User,
  UserCredential,
} from 'firebase/auth';

/** Un factor ya inscrito, en los términos en que la pantalla lo necesita mostrar. */
export interface FactorInscrito {
  /** El identificador que hay que pasarle a `assertionForSignIn`. Es el `uid` del factor. */
  id: string;
  nombre: string;
  /** Fecha de inscripción, ya legible en español. */
  desde: string;
}

/** Lo que hace falta para pintar el paso del código y terminar el ingreso. */
export interface RetoSegundoFactor {
  resolver: MultiFactorResolver;
  factores: FactorInscrito[];
}

/** Lo que hace falta para pintar la pantalla de inscripción. */
export interface InscripcionEnCurso {
  /** El secreto vivo. Hay que conservarlo: `assertionForEnrollment` lo exige al confirmar. */
  secreto: TotpSecret;
  /** `otpauth://…` — se convierte en QR para escanear. */
  urlQr: string;
  /** El mismo secreto en texto, para quien no puede escanear (teclearlo a mano es equivalente). */
  claveManual: string;
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function fechaLegible(iso: string): string {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? FORMATO_FECHA.format(new Date(t)) : '—';
}

/**
 * ¿Este error es «falta el segundo factor»?
 *
 * Se comprueba por el CÓDIGO, no por el texto del mensaje: el texto cambia entre versiones y traduce
 * distinto según el idioma del navegador, y una comparación de texto se rompe en silencio.
 */
export function pideSegundoFactor(err: unknown): err is MultiFactorError {
  return (err as { code?: string } | null)?.code === 'auth/multi-factor-auth-required';
}

/**
 * Convierte el error en el reto que hay que resolver.
 *
 * Sirve igual para un ingreso y para una RE-autenticación: la firma del SDK dice literalmente que el
 * error puede venir «during a sign-in, or reauthentication operation». Eso importa porque quien ya
 * tiene segundo factor y va a retirarlo también tendrá que pasar por aquí.
 */
export async function leerReto(err: MultiFactorError): Promise<RetoSegundoFactor> {
  const { auth, mod } = await cargarAuth();
  const resolver = mod.getMultiFactorResolver(auth, err);
  return {
    resolver,
    factores: resolver.hints
      // Solo se ofrecen los TOTP: es el único tipo que este portal inscribe, y ofrecer un método que
      // no se sabe completar es peor que no ofrecerlo.
      .filter((h) => h.factorId === 'totp')
      .map((h) => ({
        id: h.uid,
        nombre: h.displayName || 'Aplicación de autenticación',
        desde: fechaLegible(h.enrollmentTime),
      })),
  };
}

/** Termina el ingreso con el código de seis dígitos. Devuelve la credencial ya válida. */
export async function completarConCodigo(
  resolver: MultiFactorResolver,
  idFactor: string,
  codigo: string,
): Promise<UserCredential> {
  const { mod } = await cargarAuth();
  const assertion = mod.TotpMultiFactorGenerator.assertionForSignIn(idFactor, limpiarCodigo(codigo));
  return resolver.resolveSignIn(assertion);
}

/** Los factores que esta persona ya tiene activos. */
export async function factoresDe(usuario: User): Promise<FactorInscrito[]> {
  const { mod } = await cargarAuth();
  return mod
    .multiFactor(usuario)
    .enrolledFactors.filter((f) => f.factorId === 'totp')
    .map((f) => ({
      id: f.uid,
      nombre: f.displayName || 'Aplicación de autenticación',
      desde: fechaLegible(f.enrollmentTime),
    }));
}

/**
 * Arranca una inscripción: pide el secreto al servidor y lo devuelve en las dos formas en que una
 * persona puede meterlo en su aplicación (QR y texto).
 *
 * `accountName` es lo que se verá en la aplicación de autenticación. Se pasa el correo a propósito:
 * quien administra dos cuentas necesita distinguirlas de un vistazo, y el valor por defecto del SDK
 * es el nombre de la app de Firebase, que aquí sería el mismo para todas.
 */
export async function empezarInscripcion(usuario: User): Promise<InscripcionEnCurso> {
  const { mod } = await cargarAuth();
  const sesion = await mod.multiFactor(usuario).getSession();
  const secreto = await mod.TotpMultiFactorGenerator.generateSecret(sesion);
  return {
    secreto,
    urlQr: secreto.generateQrCodeUrl(usuario.email || 'ALTORRA', 'ALTORRA Inmobiliaria'),
    claveManual: secreto.secretKey,
  };
}

/**
 * Confirma la inscripción con el primer código que genera la aplicación.
 *
 * ⚠️ DOS EFECTOS QUE HAY QUE CONTARLE A QUIEN LO ACTIVA, porque el SDK los documenta y sorprenden:
 *   · exige **autenticación reciente** — si la sesión lleva rato abierta lanza `auth/requires-recent-login`;
 *   · al terminar **revoca las demás sesiones** (los refresh tokens), así que quien tuviera el panel
 *     abierto en otro dispositivo tendrá que volver a entrar.
 * Callarlo convierte una consecuencia normal en un susto.
 */
export async function confirmarInscripcion(
  secreto: TotpSecret,
  codigo: string,
  usuario: User,
  nombre = 'Aplicación de autenticación',
): Promise<void> {
  const { mod } = await cargarAuth();
  const assertion = mod.TotpMultiFactorGenerator.assertionForEnrollment(
    secreto,
    limpiarCodigo(codigo),
  );
  await mod.multiFactor(usuario).enroll(assertion, nombre);
}

/** Retira un factor. No revoca sesiones (lo dice el SDK) — retirar no es expulsar. */
export async function retirarFactor(usuario: User, idFactor: string): Promise<void> {
  const { mod } = await cargarAuth();
  await mod.multiFactor(usuario).unenroll(idFactor);
}

/**
 * Vuelve a probar la contraseña de quien ya está dentro.
 *
 * Hace falta antes de tocar la seguridad de la cuenta: sin esto, un computador desatendido con la
 * sesión abierta basta para cambiar el segundo factor de otra persona.
 *
 * Devuelve el reto si la cuenta YA tiene segundo factor —re-autenticar también lo pide— para que la
 * pantalla pueda pedir el código en vez de quedarse sin salida.
 */
export async function reautenticar(
  usuario: User,
  clave: string,
): Promise<{ ok: true } | { ok: false; reto: RetoSegundoFactor }> {
  const { mod } = await cargarAuth();
  const credencial = mod.EmailAuthProvider.credential(usuario.email || '', clave);
  try {
    await mod.reauthenticateWithCredential(usuario, credencial);
    return { ok: true };
  } catch (err) {
    if (pideSegundoFactor(err)) return { ok: false, reto: await leerReto(err) };
    throw err;
  }
}

/**
 * Normaliza lo que la persona escribió.
 *
 * Los gestores de contraseñas pegan el código con un espacio en medio («492 118») y algunas
 * aplicaciones lo muestran así. Sin esta limpieza el código correcto se rechaza y la culpa parece
 * suya. Es una línea que evita un rato de desconcierto.
 */
export function limpiarCodigo(codigo: string): string {
  return codigo.replace(/\D/g, '').slice(0, 6);
}

/**
 * Traduce los códigos del SDK a algo accionable.
 *
 * La regla que se sigue: cada mensaje dice QUÉ pasó y QUÉ hacer ahora. «Error inesperado» no es un
 * mensaje, es el silencio con otro nombre — y ya costó dos diagnósticos a ciegas en el panel legacy.
 */
export function explicarSegundoFactor(code: string): [string, string] {
  switch (code) {
    case 'auth/invalid-verification-code':
    case 'auth/invalid-verification-id':
      return [
        'Ese código no sirvió',
        'Los códigos cambian cada 30 segundos. Mira el que aparece AHORA en tu aplicación y escríbelo completo.',
      ];
    case 'auth/code-expired':
      return ['El código ya venció', 'Escribe el que muestra tu aplicación en este momento.'];
    case 'auth/totp-challenge-timeout':
      return ['Se acabó el tiempo', 'Vuelve a escribir tu contraseña y empezamos de nuevo.'];
    case 'auth/requires-recent-login':
      return [
        'Confirma tu contraseña',
        'Por seguridad, para cambiar tu segundo factor necesitamos que vuelvas a escribir tu contraseña.',
      ];
    case 'auth/unsupported-first-factor':
    case 'auth/operation-not-allowed':
      return [
        'Este método no está habilitado',
        'Escríbenos por WhatsApp al +57 300 243 9810 y lo revisamos.',
      ];
    case 'auth/second-factor-already-in-use':
      return [
        'Esa aplicación ya está registrada',
        'Ya tienes ese segundo factor activo. Si querías cambiar de teléfono, retira el anterior primero.',
      ];
    case 'auth/maximum-second-factor-count-exceeded':
      return [
        'Ya tienes demasiados métodos',
        'Retira uno de los que tienes activos antes de agregar otro.',
      ];
    case 'auth/network-request-failed':
      return ['Sin conexión', 'No pudimos contactar el servidor. Revisa tu internet e inténtalo otra vez.'];
    case 'auth/too-many-requests':
      return [
        'Demasiados intentos',
        'Por seguridad hay que esperar unos minutos antes de volver a intentarlo.',
      ];
    default:
      return [
        'No pudimos verificar el código',
        'Revisa que la hora de tu teléfono esté en automático: si va adelantada o atrasada, los códigos no coinciden.',
      ];
  }
}
