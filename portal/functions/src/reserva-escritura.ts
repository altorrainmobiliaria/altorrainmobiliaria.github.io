/*
 * RETENER LAS NOCHES DE UNA ESTANCIA — la Function que `firestore.rules` prometía y no existía.
 *
 * 🔴 EL HUECO. `disponibilidad` nació sellada en Ola 0 con su regla escrita al lado —*«la reserva se
 * hace SIEMPRE server-side dentro de una transacción que lee disponibilidad DENTRO de la
 * transacción (anti-overbooking)»*— y las Rules la cerraron a cal y canto (`allow write: if false`,
 * «la reserva es transaccional y vive en una Function»). Medido el 2026-09-11: **ninguna de las 24
 * Functions del portal escribía `disponibilidad`**. Un contrato sellado apuntando a un vacío: no
 * había forma, por ningún camino, de marcar una noche como ocupada. Y el rail de pago —ése sí
 * construido— podía completar un cobro sobre unas fechas que nunca se retuvieron.
 *
 * ══ POR QUÉ UNA TRANSACCIÓN, Y NO UN «MIRO Y LUEGO ESCRIBO» ════════════════════════════════════
 *
 * Comprobar la disponibilidad ANTES y escribir después es la definición de la ventana de doble
 * reserva: entre la lectura y la escritura cabe otra reserva entera. No es un riesgo teórico ni un
 * caso de laboratorio — es el minuto en que se publica una oferta y dos personas pulsan a la vez.
 *
 * La transacción de Firestore es de lectura-modificación-escritura con comprobación optimista: si
 * otro escribe uno de los documentos que ESTA transacción leyó, la nuestra se reintenta sola y en el
 * reintento ve la noche ya ocupada. Por eso las noches se leen **dentro** de `runTransaction` con un
 * `getAll`, y no antes. Un pre-chequeo fuera sería más rápido y no serviría para nada.
 *
 * 🎯 Y por eso mismo la regla de negocio vive en `domain/disponibilidad.ts` —puro, probado sin
 * servidor— y aquí solo está la CONCURRENCIA. La prueba de CARRERA de esta puerta es lo que el
 * MEGA-PLAN §4.5 llama «test anti-overbooking, gate de salida de Ola 2»: lanza reservas simultáneas
 * sobre las mismas noches y exige que gane exactamente UNA.
 *
 * ══ LO QUE ESTA PUERTA NO HACE, DICHO PARA QUE NADIE LO SUPONGA ════════════════════════════════
 *  · **No cobra.** Retener noches y mover dinero son dos cosas, y mezclarlas es cómo se acaba con
 *    fechas retenidas por pagos que nunca entraron. El rail de Wompi (`pagos-webhook`) es aparte y
 *    sigue esperando las cuentas del dueño.
 *  · **No libera sola.** Una retención que caduca necesita un reloj (Scheduler) y esa es otra
 *    decisión —cuánto dura, qué pasa con el dinero en custodia— que se toma con el rail de pago
 *    delante, no antes. Hoy libera `liberarNoches`, a mano y con rastro.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue, type Firestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import {
  docIdDisponibilidad,
  explicarOcupadas,
  nochesDeEstancia,
  nochesOcupadas,
  type NocheOcupada,
} from '../../src/lib/domain/disponibilidad';
import { problemasDeReserva, explicarProblemaReserva, NOCHES_MAX } from '../../src/lib/domain/reserva';
import type { Disponibilidad } from '../../src/lib/domain/propiedades';

const REGION = 'us-central1';

/** Roles que pueden retener noches. Espeja `esEditorOMas()` del ruleset. */
const ROLES_ESCRITURA = new Set(['super_admin', 'editor']);

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * Tope de noches por transacción. Firestore admite 500 documentos por transacción y una estancia de
 * 90 noches toca 90 + 1: sobra sitio. El tope real lo pone el NEGOCIO (`NOCHES_MAX`), no el motor —
 * por encima de 90 noches ya no es una estancia turística, es un arriendo, y es otro producto y otra
 * ley. Se comprueba aquí ADEMÁS de en el dominio porque una puerta que confía en que la llamen bien
 * no es una puerta.
 */
const TOPE_DOCS_TRANSACCION = 500;

export interface EntradaRetener {
  propiedadId: string;
  llegada: string;
  salida: string;
  huespedes: number;
  /** A qué solicitud/lead pertenece, si viene de una. Traza la reserva con quien la pidió. */
  solicitudId?: string;
}

export interface ResultadoRetener {
  reservaId: string;
  noches: string[];
}

/** El rechazo por choque viaja con LAS noches, no con un «no se pudo»: quien pregunta va a reintentar. */
export interface DetalleChoque {
  ocupadas: NocheOcupada[];
}

function autorizar(req: CallableRequest): { uid: string; rol: string } {
  const uid = req.auth?.uid;
  const rol = String((req.auth?.token as Record<string, unknown> | undefined)?.rol ?? '');
  if (!uid) throw new HttpsError('unauthenticated', 'Hay que iniciar sesión.');
  if (!ROLES_ESCRITURA.has(rol)) {
    throw new HttpsError('permission-denied', 'Tu rol no puede retener fechas.');
  }
  return { uid, rol };
}

/**
 * Retiene las noches de una estancia, o no retiene NINGUNA.
 *
 * ⚠️ **Todo o nada, y eso es el producto, no un detalle de implementación.** Retener «las que
 * queden» dejaría a alguien con la primera mitad de sus vacaciones y un agujero en medio, habiendo
 * pagado por el rango entero. Si una sola noche del rango está tomada, no se toca ninguna y se
 * devuelve CUÁLES para que quien pidió pueda mover las fechas.
 */
export async function retenerNoches(
  db: Firestore,
  entrada: EntradaRetener,
  autor: { uid: string },
  ahora: Date = new Date(),
): Promise<ResultadoRetener> {
  const propiedadId = texto(entrada.propiedadId);
  if (!propiedadId) throw new HttpsError('invalid-argument', 'Falta el inmueble.');

  // Las MISMAS reglas que ve quien rellena el formulario — una regla, un dueño ([[L-45]]). Si el
  // servidor validara por su cuenta, aceptaría cosas que la pantalla rechaza (o al revés) y nadie
  // sabría cuál de los dos tiene razón.
  const hoy = ahora.toISOString().slice(0, 10);
  const malos = problemasDeReserva(
    { llegada: entrada.llegada, salida: entrada.salida, huespedes: entrada.huespedes },
    hoy,
  );
  if (malos.length) {
    throw new HttpsError('invalid-argument', malos.map(explicarProblemaReserva).join(' '), {
      problemas: malos,
    });
  }

  const noches = nochesDeEstancia(entrada.llegada, entrada.salida);
  if (!noches.length) throw new HttpsError('invalid-argument', 'Ese rango de fechas no es una estancia.');
  if (noches.length > NOCHES_MAX || noches.length + 1 > TOPE_DOCS_TRANSACCION) {
    throw new HttpsError('invalid-argument', `Una estancia no puede pasar de ${NOCHES_MAX} noches.`);
  }

  const reservaRef = db.collection('reservas').doc();
  const reservaId = reservaRef.id;
  const refs = noches.map((f) => db.doc(`disponibilidad/${docIdDisponibilidad(propiedadId, f)}`));

  const ocupadas = await db.runTransaction(async (tx) => {
    // 🔴 LA LECTURA VA AQUÍ DENTRO. Es toda la garantía: si otra transacción escribe cualquiera de
    // estos documentos entre este `getAll` y el commit, Firestore aborta la nuestra y la reintenta,
    // y en el reintento la noche ya aparece ocupada. Leerlos fuera sería exactamente el hueco.
    //
    // 🧪 MEDIDO, no razonado (2026-09-11): moviendo este `getAll` fuera de `runTransaction`, las
    // pruebas SECUENCIALES siguen todas en verde y la de CARRERA pasa de 1 ganadora a **6 de 6** —
    // seis personas con la misma cama las mismas noches. Ésa es la única línea que lo impide.
    const snaps = await tx.getAll(...refs);
    const leidos = new Map<string, Pick<Disponibilidad, 'estado'> | undefined>();
    snaps.forEach((s, i) => {
      leidos.set(noches[i], s.exists ? (s.data() as Disponibilidad) : undefined);
    });

    const choque = nochesOcupadas(noches, leidos);
    if (choque.length) return choque; // sin escribir NADA: todo o nada

    snaps.forEach((s, i) => {
      const doc: Disponibilidad = {
        _version: s.exists ? ((s.data() as Disponibilidad)._version ?? 0) + 1 : 1,
        propiedadId,
        fecha: noches[i],
        estado: 'reservado',
        reservaId,
      };
      // `set` SIN merge: el documento de una noche ES su estado completo, y un merge podría dejar
      // vivo el `reservaId` de una reserva anterior ya liberada — un puntero a algo que no existe.
      tx.set(refs[i], doc);
    });

    tx.set(reservaRef, {
      id: reservaId,
      propiedadId,
      llegada: entrada.llegada,
      salida: entrada.salida,
      noches: noches.length,
      huespedes: entrada.huespedes,
      ...(texto(entrada.solicitudId) ? { solicitudId: texto(entrada.solicitudId) } : {}),
      estado: 'retenida',
      _version: 1,
      creadaPor: autor.uid, // el uid del TOKEN, nunca el que venga en el cuerpo de la llamada
      createdAt: FieldValue.serverTimestamp(),
    });
    return [];
  });

  if (ocupadas.length) {
    throw new HttpsError('aborted', explicarOcupadas(ocupadas), { ocupadas } satisfies DetalleChoque);
  }

  logger.info(`[reserva] ${reservaId} retiene ${noches.length} noche(s) de ${propiedadId} (${entrada.llegada}→${entrada.salida})`);
  return { reservaId, noches };
}

/**
 * Suelta las noches de una reserva.
 *
 * ⚠️ Solo suelta las noches que siguen apuntando a ESTA reserva. Sin esa comprobación, liberar una
 * reserva vieja borraría la retención de la que ocupa hoy esas fechas — y el rastro de que pasó se
 * perdería en el mismo movimiento. También va en transacción: liberar y volver a reservar la misma
 * noche es justo el momento en que dos escrituras se cruzan.
 */
export async function liberarNoches(db: Firestore, reservaId: string, autor: { uid: string }): Promise<{ liberadas: number }> {
  const id = texto(reservaId);
  if (!id) throw new HttpsError('invalid-argument', 'Falta la reserva.');

  const reservaRef = db.doc(`reservas/${id}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(reservaRef);
    if (!snap.exists) throw new HttpsError('not-found', `La reserva ${id} no existe.`);
    const r = snap.data() as { propiedadId: string; llegada: string; salida: string; _version?: number };

    const noches = nochesDeEstancia(r.llegada, r.salida);
    const refs = noches.map((f) => db.doc(`disponibilidad/${docIdDisponibilidad(r.propiedadId, f)}`));
    const snaps = refs.length ? await tx.getAll(...refs) : [];

    let liberadas = 0;
    snaps.forEach((s, i) => {
      if (!s.exists) return;
      const d = s.data() as Disponibilidad;
      if (d.reservaId !== id) return; // esa noche ya es de otra reserva: no se toca
      tx.set(refs[i], {
        _version: (d._version ?? 0) + 1,
        propiedadId: r.propiedadId,
        fecha: noches[i],
        estado: 'libre',
      } satisfies Disponibilidad);
      liberadas++;
    });

    tx.set(
      reservaRef,
      { estado: 'liberada', _version: (r._version ?? 0) + 1, liberadaPor: autor.uid, liberadaEn: FieldValue.serverTimestamp() },
      { merge: true },
    );
    return { liberadas };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LAS PUERTAS. La lógica vive arriba, exportada, para poder probarla contra el emulador sin
// registrar Cloud Functions reales — el mismo reparto que `venta-escritura` (§151).
// ─────────────────────────────────────────────────────────────────────────────

export const retenerFechas = onCall({ region: REGION }, async (req) => {
  const autor = autorizar(req);
  const d = (req.data ?? {}) as Record<string, unknown>;
  return retenerNoches(
    getFirestore(),
    {
      propiedadId: texto(d.propiedadId),
      llegada: texto(d.llegada),
      salida: texto(d.salida),
      huespedes: Number(d.huespedes),
      solicitudId: texto(d.solicitudId),
    },
    autor,
  );
});

export const liberarFechas = onCall({ region: REGION }, async (req) => {
  const autor = autorizar(req);
  const d = (req.data ?? {}) as Record<string, unknown>;
  return liberarNoches(getFirestore(), texto(d.reservaId), autor);
});
