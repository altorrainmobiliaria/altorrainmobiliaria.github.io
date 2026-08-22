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

export type ResultadoCodigoAcunado =
  | { ok: true; codigo: string }
  | { ok: false; fallo: FalloAlta };

/** Cuántas veces se salta un código ya ocupado antes de rendirse. Un contador sano no salta ninguna. */
const MAX_SALTOS = 20;

/**
 * ACUÑA el código, y nada más. Transacción propia, ANTES de que la persona escriba nada.
 *
 * POR QUÉ SEPARADO DEL GUARDADO, que era como estaba al principio: las fotos se suben a R2 con la
 * clave `props/<CÓDIGO>/N.webp`, y se suben MIENTRAS se rellena el formulario. Si el código se acuñara
 * al guardar, las fotos habrían ido a parar a una carpeta provisional y las claves guardadas en
 * `imagenes[]` apuntarían para siempre a un sitio que no es el del inmueble. No falla en el momento
 * —la foto se ve, porque la clave existe— y por eso es de los errores que se descubren tarde.
 *
 * El precio de acuñar antes es que un formulario abandonado quema un número. Un hueco en la secuencia
 * no le hace daño a nadie; una galería colgando de la carpeta equivocada, sí.
 *
 * Salta los códigos ocupados en vez de fallar: si el contador se desincronizó (el panel viejo escribe
 * la MISMA colección) lo sano es avanzar hasta el primero libre, no bloquear el alta.
 */
export async function cuerpoDeAcunar(tx: TxAlta, refs: RefsAlta, ahora: Date): Promise<ResultadoCodigoAcunado> {
  const claveMes = claveContador(ahora);
  const snap = await tx.get(refs.contadores);
  let secuencia = siguienteSecuencia(snap.data(), claveMes);

  for (let salto = 0; salto < MAX_SALTOS; salto++) {
    const codigo = codigoPropiedad(claveMes, secuencia);
    if (!codigo.ok) return { ok: false, fallo: { tipo: 'secuencia-agotada' } };
    const ocupado = (await tx.get(refs.propiedad(codigo.codigo))).exists();
    if (!ocupado) {
      // Merge: este documento lo comparten TODAS las secuencias del proyecto —los otros meses y las
      // del panel viejo—, y escribirlo entero las borraría.
      tx.set(refs.contadores, { [claveMes]: secuencia }, { merge: true });
      return { ok: true, codigo: codigo.codigo };
    }
    secuencia++;
  }
  return { ok: false, fallo: { tipo: 'id-ocupado', codigo: `${claveMes}-*` } };
}

/**
 * El CUERPO del GUARDADO, separado del SDK para poder probarlo entero sin Firestore.
 *
 * Recibe el código ya acuñado. Orden: construir y VALIDAR → comprobar que sigue libre → escribir. La
 * validación va antes del `get` para no gastar una lectura en algo que ni siquiera es guardable.
 */
export async function cuerpoDeAlta(
  tx: TxAlta,
  refs: RefsAlta,
  entrada: EntradaAlta,
  codigo: string,
  ahora: Date,
): Promise<ResultadoGuardado> {
  const ctx: ContextoAlta = { codigo, ahora };
  const construida = construirPropiedad(entrada, ctx);
  if (!construida.ok) return { ok: false, fallo: { tipo: 'validacion', errores: construida.errores } };

  // 🔴 La red que las Rules NO ponen para el super_admin. La regla es
  // `esSuperAdmin() || (esEditorOMas() && versionCreacionValida())`, así que quien usa este panel crea
  // saltándose el compare-and-set del servidor. Sin este `get` DENTRO de la transacción, escribir
  // sobre un código ya ocupado BORRARÍA el inmueble que hubiera ahí.
  const yaExiste = await tx.get(refs.propiedad(codigo));
  if (yaExiste.exists()) return { ok: false, fallo: { tipo: 'id-ocupado', codigo } };

  // ENTERA, sin merge (L-09: `set` sin merge para crear, `update` para editar).
  tx.set(refs.propiedad(codigo), construida.propiedad);
  return { ok: true, propiedad: construida.propiedad };
}

/** Carga Firestore reusando la app que ya inicializó Auth (no se inicializa dos veces). */
async function cargarFirestore() {
  const { app } = await cargarAuth();
  const mod = await import('firebase/firestore');
  return { db: mod.getFirestore(app), mod };
}

/** Envuelve una transacción de Firestore con la cara abstracta que usan los cuerpos. */
async function enTransaccion<T>(
  corre: (tx: TxAlta, refs: RefsAlta) => Promise<T>,
  siFalla: (fallo: FalloAlta) => T,
): Promise<T> {
  let db: Awaited<ReturnType<typeof cargarFirestore>>['db'];
  let mod: Awaited<ReturnType<typeof cargarFirestore>>['mod'];
  try {
    ({ db, mod } = await cargarFirestore());
  } catch (e) {
    return siFalla({ tipo: 'red', detalle: String(e) });
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
      return corre(adaptada, refs);
    });
  } catch (e) {
    const msg = String(e);
    // Las Rules deniegan con `permission-denied`. Se distingue porque la acción del operador es
    // distinta: si es permiso, cerrar sesión y volver a entrar; si es red, reintentar.
    if (/permission|PERMISSION_DENIED/i.test(msg)) return siFalla({ tipo: 'permiso' });
    return siFalla({ tipo: 'red', detalle: msg });
  }
}

/** Acuña el código del inmueble. Se llama al ABRIR el formulario, porque las fotos lo necesitan. */
export function acunarCodigo(ahora: Date = new Date()): Promise<ResultadoCodigoAcunado> {
  return enTransaccion(
    (tx, refs) => cuerpoDeAcunar(tx, refs, ahora),
    (fallo) => ({ ok: false, fallo }) as ResultadoCodigoAcunado,
  );
}

/**
 * Guarda la propiedad con el código ya acuñado. Devuelve el fallo con su tipo, no un booleano: el
 * formulario tiene que poder pintar los errores JUNTO A SU CAMPO, y «no se pudo guardar» a secas no le
 * sirve a nadie.
 */
export function guardarPropiedadNueva(
  entrada: EntradaAlta,
  codigo: string,
  ahora: Date = new Date(),
): Promise<ResultadoGuardado> {
  return enTransaccion(
    (tx, refs) => cuerpoDeAlta(tx, refs, entrada, codigo, ahora),
    (fallo) => ({ ok: false, fallo }) as ResultadoGuardado,
  );
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
