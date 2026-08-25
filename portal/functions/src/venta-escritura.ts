/*
 * ESCRITURAS DE VENTA — la única puerta a `ventas` (Ola 2 · GESTIÓN v2, §151).
 *
 * MISMA POSTURA QUE §113: la colección nace con `allow write: if false` y todo cambio de estado pasa
 * por aquí. No es una limitación que haya que rodear — es la decisión. Aquí se mueve una operación
 * de cientos de millones entre etapas con consecuencias legales, y el orden de esas etapas no puede
 * depender de que el formulario se acuerde de aplicarlo.
 *
 * LO QUE ESTE SERVIDOR IMPONE Y EL NAVEGADOR NO PUEDE SALTARSE:
 *
 * 1. ⚖️ **El ORDEN legal del proceso.** No se salta el estudio de títulos (lo que evita comprometerse
 *    con un inmueble con hipoteca o sucesión sin liquidar) ni el registro (lo único que transfiere la
 *    propiedad, art. 756 C.C.). El predicado es el MISMO que usa el formulario —vive en el dominio—,
 *    porque dos copias de una regla se separan el día que alguien arregla una sola ([[L-45]]).
 *
 * 2. 🔴 **No se marca REGISTRADA sin número de matrícula inmobiliaria.** Ese número ES el registro:
 *    sin él, «registrada» es una casilla marcada, y la casilla que dice que una venta terminó es
 *    exactamente la que no puede mentir. Es la ÚNICA condición de documento que bloquea; el resto de
 *    soportes avisan en el tablero pero no impiden trabajar, porque en la vida real se mueve la
 *    operación y se escanea el papel después.
 *
 * 3. 👤 **Quién movió qué, y por qué.** El historial lo escribe el servidor con el uid del token, no
 *    con el que diga el cuerpo de la llamada. Un historial que el interesado puede redactar no es un
 *    historial.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import {
  explicarProblema,
  moverEtapa,
  problemasDeVenta,
  type Etapa,
  type Venta,
} from '../../src/lib/domain/venta';

const REGION = 'us-central1';

/** Roles que pueden mover una venta. Espeja `esEditorOMas()` del ruleset. */
const ROLES_ESCRITURA = new Set(['super_admin', 'editor']);

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Quién llama, leyendo el TOKEN y nada más: el permiso viaja firmado desde §99, cero lecturas. */
function exigirEditor(req: CallableRequest): { uid: string; rol: string } {
  const token = req.auth?.token as { admin?: boolean; rol?: string } | undefined;
  if (!req.auth || token?.admin !== true) {
    throw new HttpsError('unauthenticated', 'Necesitas iniciar sesión con una cuenta del equipo.');
  }
  const rol = String(token.rol ?? '');
  if (!ROLES_ESCRITURA.has(rol)) {
    throw new HttpsError('permission-denied', 'Tu rol no puede mover ventas.');
  }
  return { uid: req.auth.uid, rol };
}

/**
 * Acuña `VTA-YYYYMM-NNNN` con contador mensual transaccional, igual que los demás documentos de
 * gestión (§108): se PARA al agotar los 4 dígitos en vez de emitir un id con una forma que nadie
 * sabe leer.
 */
async function acunarId(db: Firestore, ahora: Date): Promise<string> {
  const clave = `VTA-${ahora.getUTCFullYear()}${String(ahora.getUTCMonth() + 1).padStart(2, '0')}`;
  return db.runTransaction(async (tx) => {
    const ref = db.doc('config/counters');
    const snap = await tx.get(ref);
    const actual = snap.exists ? (snap.data() as Record<string, unknown>)[clave] : undefined;
    const n = typeof actual === 'number' && Number.isInteger(actual) && actual >= 0 ? actual : 0;
    const siguiente = n + 1;
    if (siguiente > 9999) {
      throw new HttpsError('resource-exhausted', `Se agotaron los códigos ${clave} de este mes.`);
    }
    tx.set(ref, { [clave]: siguiente }, { merge: true });
    return `${clave}-${String(siguiente).padStart(4, '0')}`;
  });
}

const rechazar = (problemas: string[], mensaje: string): never => {
  throw new HttpsError('invalid-argument', mensaje, {
    problemas,
    mensajes: problemas.map(explicarProblema),
  });
};

/** Abre una venta. Nace en `interes`: todavía no hay nada firmado ni prometido. */
export const crearVenta = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as Partial<Venta>;

  const entrada: Partial<Venta> = {
    expedienteId: texto(d.expedienteId),
    propiedadId: texto(d.propiedadId),
    compradorNombre: texto(d.compradorNombre),
    ...(d.precioOfrecido !== undefined ? { precioOfrecido: d.precioOfrecido } : {}),
  };

  // 🔴 Validar ANTES de tocar el contador: una venta inválida no debe quemar un código.
  const problemas = problemasDeVenta(entrada);
  if (problemas.length) rechazar(problemas, 'La venta no se puede abrir todavía.');

  const ahora = new Date();
  const id = await acunarId(db, ahora);
  const iso = ahora.toISOString();

  const venta: Venta = {
    id,
    expedienteId: entrada.expedienteId!,
    propiedadId: entrada.propiedadId!,
    compradorNombre: entrada.compradorNombre!,
    ...(entrada.precioOfrecido !== undefined ? { precioOfrecido: entrada.precioOfrecido } : {}),
    etapa: 'interes',
    // El primer renglón del historial lleva `de: null`: no venía de ninguna etapa, empezó aquí.
    historial: [{ de: null, a: 'interes', cuando: iso, porUid: quien.uid }],
    _version: 1,
    createdAt: iso,
    updatedAt: iso,
  };

  await db.doc(`ventas/${id}`).set(venta);
  logger.info(`[venta] ${id} abierta por ${quien.uid}`);
  return { ok: true, id, venta };
});

/**
 * Mueve una venta de etapa. Es la operación que de verdad importa, y la que más se puede hacer mal:
 * por eso valida el orden, exige motivo al retroceder y no deja marcar registro sin folio.
 */
export const moverVenta = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as {
    id?: string;
    etapa?: Etapa;
    motivo?: string;
    folioMatricula?: string;
    notaria?: string;
    precioAcordado?: number;
    _version?: number;
  };

  const id = texto(d.id);
  if (!id) throw new HttpsError('invalid-argument', 'Falta el identificador de la venta.');
  const destino = d.etapa as Etapa | undefined;
  if (!destino) throw new HttpsError('invalid-argument', 'Falta la etapa de destino.');

  const ref = db.doc(`ventas/${id}`);
  const { venta, problemas } = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', `La venta ${id} no existe.`);
    const actual = snap.data() as Venta;

    if (typeof d._version === 'number' && d._version !== actual._version) {
      throw new HttpsError(
        'aborted',
        'Alguien más movió esta venta mientras la mirabas. Recarga para ver dónde quedó.',
      );
    }

    /*
     * 🔴 EL FOLIO, ANTES DE MOVER. Si el destino es `registro`, el número de matrícula tiene que
     * existir ya o venir en esta misma llamada. Comprobarlo aquí y no después evita el estado que
     * nadie quiere explicar: una venta marcada como registrada sin nada que lo respalde.
     */
    const folio = texto(d.folioMatricula) || texto(actual.folioMatricula);
    if (destino === 'registro' && !folio) {
      return { venta: actual, problemas: ['registro-sin-folio'] };
    }

    const ahora = new Date().toISOString();
    const r = moverEtapa(actual, destino, { cuando: ahora, porUid: quien.uid, motivo: d.motivo });
    if (!r.ok) return { venta: actual, problemas: r.problemas };

    const guardada: Venta = {
      ...r.venta,
      ...(folio ? { folioMatricula: folio } : {}),
      ...(texto(d.notaria) ? { notaria: texto(d.notaria) } : {}),
      ...(typeof d.precioAcordado === 'number' ? { precioAcordado: d.precioAcordado } : {}),
      updatedAt: ahora,
    };

    // Se revalida lo FUSIONADO, no lo que llegó: un precio acordado inválido no puede colarse por
    // venir de acompañante en un cambio de etapa que sí era válido.
    const malos = problemasDeVenta(guardada);
    if (malos.length) return { venta: actual, problemas: malos };

    tx.set(ref, guardada);
    return { venta: guardada, problemas: [] as string[] };
  });

  if (problemas.length) rechazar(problemas, 'La venta no se puede mover así.');

  logger.info(`[venta] ${id} → ${venta.etapa} por ${quien.uid}`);
  return { ok: true, id, venta };
});
