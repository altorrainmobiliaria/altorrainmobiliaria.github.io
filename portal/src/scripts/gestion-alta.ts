/*
 * ESCRITURA del alta de propiedades — la transacción que acuña el código y crea el documento (§108).
 *
 * Vive en `scripts/gestion-*` a propósito: es el único patrón con excepción declarada en el gate
 * `verify:data` para usar el SDK de Firestore, y solo porque el panel NO es superficie pública (lo
 * abren una o dos personas, tras sesión y claim). Aquí no hay listeners ni queries sin `limit()`.
 *
 * POR QUÉ UNA TRANSACCIÓN Y NO UN `setDoc` A SECAS — tres razones, y ninguna es teórica:
 *
 *   1. El código `INM-YYYYMM-NNNN` sale de un contador compartido. Dos altas a la vez sin transacción
 *      se llevan el mismo número y la segunda PISA a la primera. El cerebro ya pagó esta lección:
 *      [[M-04]] «un ID lo asigna quien escribe, y dos frentes escribiendo en paralelo colisionan en
 *      silencio».
 *   2. El contador tiene DOS escritores: este panel y el legacy. Leer-modificar-escribir fuera de una
 *      transacción es la receta exacta de la condición de carrera.
 *   3. **El `_version` de las Rules NO protege al super_admin.** La regla es
 *      `esSuperAdmin() || (esEditorOMas() && versionCreacionValida())`, así que Daniel —que es
 *      super_admin— crea saltándose la comprobación. O sea que el compare-and-set del servidor existe
 *      para los editores y NO para el usuario real del panel. La única defensa contra sobrescribir un
 *      inmueble existente es un `get` DENTRO de la misma transacción, y por eso está.
 */

import { cargarAuth } from './auth';
import { construirPropiedad, claveContador, codigoPropiedad, TOPE_SECUENCIA } from '../lib/domain/alta-propiedad';
import type { ContextoAlta, EntradaAlta, ErrorCampo } from '../lib/domain/alta-propiedad';
import type { Propiedad } from '../lib/domain/propiedades';

/** Doc de contadores atómicos (`config/counters`), contrato de `domain/config.ts`. */
const DOC_CONTADORES = ['config', 'counters'] as const;

export type FalloAlta =
  | { tipo: 'validacion'; errores: ErrorCampo[] }
  | { tipo: 'secuencia-agotada' }
  | { tipo: 'id-ocupado'; codigo: string }
  | { tipo: 'permiso' }
  | { tipo: 'red'; detalle: string };

export type ResultadoGuardado = { ok: true; propiedad: Propiedad } | { ok: false; fallo: FalloAlta };

/**
 * Siguiente número de la secuencia del mes, a partir del documento de contadores.
 *
 * PURA y exportada para poder probarla: es donde vive la decisión de qué pasa con un contador que
 * viene con basura. Un valor no numérico o negativo se trata como «no hay contador» y se empieza en 1
 * — asumir 0 y sumar produciría el mismo comportamiento, pero por accidente; esto lo dice.
 */
export function siguienteSecuencia(contadores: Record<string, unknown> | undefined, claveMes: string): number {
  const actual = contadores?.[claveMes];
  const n = typeof actual === 'number' && Number.isInteger(actual) && actual >= 0 ? actual : 0;
  return n + 1;
}

/** La cara de una transacción de Firestore que este módulo necesita. Abstracta para poder probarla. */
export interface TxAlta {
  get(ref: unknown): Promise<{ exists: () => boolean; data: () => Record<string, unknown> | undefined }>;
  set(ref: unknown, datos: unknown, opciones?: { merge?: boolean }): void;
}

export interface RefsAlta {
  contadores: unknown;
  /** Devuelve la referencia del documento de una propiedad por su código. */
  propiedad: (codigo: string) => unknown;
}

/**
 * El CUERPO de la transacción, separado del SDK para poder probarlo entero sin Firestore.
 *
 * Orden: leer contador → acuñar código → construir y VALIDAR el documento → comprobar que el código
 * está libre → escribir propiedad y contador. La validación va antes del `get` del documento para no
 * gastar una lectura en algo que ni siquiera es guardable.
 */
export async function cuerpoDeAlta(
  tx: TxAlta,
  refs: RefsAlta,
  entrada: EntradaAlta,
  ahora: Date,
): Promise<ResultadoGuardado> {
  const claveMes = claveContador(ahora);
  const snapContadores = await tx.get(refs.contadores);
  const secuencia = siguienteSecuencia(snapContadores.data(), claveMes);

  const codigo = codigoPropiedad(claveMes, secuencia);
  if (!codigo.ok) return { ok: false, fallo: { tipo: 'secuencia-agotada' } };

  const ctx: ContextoAlta = { codigo: codigo.codigo, ahora };
  const construida = construirPropiedad(entrada, ctx);
  if (!construida.ok) return { ok: false, fallo: { tipo: 'validacion', errores: construida.errores } };

  // 🔴 La red que las Rules NO ponen para el super_admin. Si el contador se desincronizó —porque el
  // panel viejo escribió, porque alguien lo editó a mano— el código podría estar ocupado, y un `set`
  // sin esta comprobación BORRARÍA el inmueble que hay ahí. Es preferible fallar y que alguien mire.
  const yaExiste = await tx.get(refs.propiedad(codigo.codigo));
  if (yaExiste.exists()) return { ok: false, fallo: { tipo: 'id-ocupado', codigo: codigo.codigo } };

  // La propiedad se crea ENTERA, sin merge (L-09: `set` sin merge para crear, `update` para editar).
  tx.set(refs.propiedad(codigo.codigo), construida.propiedad);
  // El contador SÍ con merge: ese documento lo comparten TODAS las secuencias del proyecto —los otros
  // meses y las del panel viejo—, y escribirlo entero las borraría.
  tx.set(refs.contadores, { [claveMes]: secuencia }, { merge: true });
  return { ok: true, propiedad: construida.propiedad };
}

/** Carga Firestore reusando la app que ya inicializó Auth (no se inicializa dos veces). */
async function cargarFirestore() {
  const { app } = await cargarAuth();
  const mod = await import('firebase/firestore');
  return { db: mod.getFirestore(app), mod };
}

/**
 * Crea la propiedad. Devuelve el fallo con su tipo, no un booleano: el formulario tiene que poder
 * pintar los errores JUNTO A SU CAMPO, y «no se pudo guardar» a secas no le sirve a nadie.
 */
export async function guardarPropiedadNueva(
  entrada: EntradaAlta,
  ahora: Date = new Date(),
): Promise<ResultadoGuardado> {
  let db: Awaited<ReturnType<typeof cargarFirestore>>['db'];
  let mod: Awaited<ReturnType<typeof cargarFirestore>>['mod'];
  try {
    ({ db, mod } = await cargarFirestore());
  } catch (e) {
    return { ok: false, fallo: { tipo: 'red', detalle: String(e) } };
  }

  const refs: RefsAlta = {
    contadores: mod.doc(db, DOC_CONTADORES[0], DOC_CONTADORES[1]),
    propiedad: (codigo: string) => mod.doc(db, 'propiedades', codigo),
  };

  try {
    return await mod.runTransaction(db, async (tx) => {
      const adaptada: TxAlta = {
        get: (ref) => tx.get(ref as never) as never,
        set: (ref, datos, opciones) => {
          if (opciones?.merge) tx.set(ref as never, datos as never, { merge: true });
          else tx.set(ref as never, datos as never);
        },
      };
      return cuerpoDeAlta(adaptada, refs, entrada, ahora);
    });
  } catch (e) {
    const msg = String(e);
    // Las Rules deniegan con `permission-denied`. Se distingue porque la acción del operador es
    // distinta: si es permiso, cerrar sesión y volver a entrar; si es red, reintentar.
    if (/permission|PERMISSION_DENIED/i.test(msg)) return { ok: false, fallo: { tipo: 'permiso' } };
    return { ok: false, fallo: { tipo: 'red', detalle: msg } };
  }
}

/** El fallo, dicho para quien está delante del formulario. */
export function explicarFallo(f: FalloAlta): string {
  switch (f.tipo) {
    case 'validacion':
      return 'Revisa los campos marcados.';
    case 'secuencia-agotada':
      return `Se agotaron los ${TOPE_SECUENCIA} códigos de este mes. Avísale a quien lleve el sistema.`;
    case 'id-ocupado':
      return `El código ${f.codigo} ya está ocupado. El contador se desincronizó: no se guardó nada, avisa antes de reintentar.`;
    case 'permiso':
      return 'Tu sesión no tiene permiso para crear inmuebles. Cierra sesión y vuelve a entrar; si sigue igual, pide que te lo asignen.';
    case 'red':
      return 'No se pudo guardar. Revisa la conexión y vuelve a intentarlo — no se creó nada a medias.';
  }
}
