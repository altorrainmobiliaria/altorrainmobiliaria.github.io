/*
 * LA BÓVEDA DEL EXPEDIENTE — las puertas de escritura de `documentos` (gate B5, §142).
 *
 * POR QUÉ SON DOS FUNCIONES Y NO UNA. El archivo lo sube el NAVEGADOR directo a Storage (pasar 10 MB
 * por una Cloud Function costaría memoria y tiempo por cada subida, para nada), pero el REGISTRO no
 * puede depender de lo que el navegador diga que subió. Entonces:
 *
 *   1. `prepararDocumento` — el servidor acuña el id y la RUTA, y guarda el documento en estado
 *      `subiendo`. El navegador no elige dónde escribe: si eligiera, podría escribir en el expediente
 *      de otro, o poner el nombre de una persona en la ruta.
 *   2. …el navegador sube a ESA ruta exacta (las Storage Rules solo dejan a staff)…
 *   3. `confirmarDocumento` — el servidor MIRA EL OBJETO REAL y toma de ahí el tamaño y el tipo. Es
 *      la diferencia entre un registro y una declaración: un cliente que mienta diciendo «1 KB, PDF»
 *      sobre un vídeo de 300 MB no engaña a nadie, porque nadie le pregunta.
 *
 * ⚠️ EL HUECO QUE ESTO DEJA, dicho en voz alta: entre (1) y (3) puede quedar un documento en
 * `subiendo` para siempre si alguien cierra la pestaña. No es un archivo huérfano —la ruta está
 * reservada y el doc existe—, es un registro incompleto y VISIBLE como tal. Se limpia solo cuando se
 * reintenta, y se prefiere eso a un barrido programado: los 3 jobs de Cloud Scheduler ya tienen dueño
 * y un cron para esto sería gastar el último en la tarea menos urgente que hay.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';

import {
  claveStorage,
  explicarProblemaDocumento,
  extensionDe,
  problemasDeDocumento,
  TIPOS_DOCUMENTO,
  TIPOS_MIME,
  TOPE_BYTES,
  type Documento,
  type TipoDocumento,
} from '../../src/lib/domain/documentos';

const REGION = 'us-central1';

/** Roles que pueden escribir en la bóveda. Espeja `esEditorOMas()` del ruleset. */
const ROLES_ESCRITURA = new Set(['super_admin', 'editor']);

interface Identidad {
  uid: string;
  rol: string;
}

/** Misma puerta que en `gestion-escritura`: el permiso viaja en el token y no se relee. */
function exigirEditor(req: CallableRequest): Identidad {
  const token = req.auth?.token as { admin?: boolean; rol?: string } | undefined;
  if (!req.auth || token?.admin !== true) {
    throw new HttpsError('unauthenticated', 'Necesitas iniciar sesión con una cuenta del equipo.');
  }
  const rol = String(token.rol ?? '');
  if (!ROLES_ESCRITURA.has(rol)) {
    throw new HttpsError('permission-denied', 'Tu rol no puede guardar documentos.');
  }
  return { uid: req.auth.uid, rol };
}

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Mismo criterio de id que el resto de gestión (§108): contador mensual, transacción, tope de 4 dígitos. */
async function acunarId(db: Firestore, ahora: Date): Promise<string> {
  const clave = `DOC-${ahora.getUTCFullYear()}${String(ahora.getUTCMonth() + 1).padStart(2, '0')}`;
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

/**
 * Paso 1 — reserva el sitio y devuelve dónde escribir.
 *
 * Valida TODO lo que se puede validar antes de que el archivo viaje: es lo único amable que se puede
 * hacer con una subida de 10 MB por una conexión de Cartagena. Rechazarla después de subirla es
 * gastarle a alguien un minuto para decirle que el tipo de archivo no valía.
 */
export const prepararDocumento = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as Record<string, unknown>;

  const expedienteId = texto(d.expedienteId);
  const tipo = texto(d.tipo) as TipoDocumento;
  const nombreArchivo = texto(d.nombreArchivo);
  const contentType = texto(d.contentType);
  const finalidad = texto(d.finalidad);
  const bytes = typeof d.bytes === 'number' ? d.bytes : NaN;
  const vence = texto(d.vence) || undefined;

  if (!TIPOS_DOCUMENTO.includes(tipo)) {
    throw new HttpsError('invalid-argument', 'Falta decir qué es: contrato, cédula, acta…');
  }
  if (!TIPOS_MIME.includes(contentType as (typeof TIPOS_MIME)[number])) {
    throw new HttpsError('invalid-argument', explicarProblemaDocumento('tipo-no-admitido'));
  }
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > TOPE_BYTES) {
    throw new HttpsError('invalid-argument', explicarProblemaDocumento('demasiado-grande'));
  }

  // 🔴 El expediente tiene que EXISTIR. Sin esto se reservan rutas bajo expedientes inventados y el
  //    bucket acumula carpetas que ninguna vista sabe enseñar.
  const exp = await db.doc(`expedientes/${expedienteId}`).get();
  if (!exp.exists) throw new HttpsError('not-found', `El expediente ${expedienteId} no existe.`);

  const ahora = new Date();
  const iso = ahora.toISOString();
  const id = await acunarId(db, ahora);
  // La RUTA la pone el servidor. Es lo que impide que el navegador escriba en el expediente de otro.
  const clave = claveStorage(expedienteId, tipo, id, extensionDe(contentType));

  const borrador: Partial<Documento> = {
    id,
    expedienteId,
    tipo,
    nombreArchivo,
    claveStorage: clave,
    bytes,
    contentType,
    finalidad,
    ...(vence ? { vence } : {}),
    ...(typeof d.avisarDias === 'number' ? { avisarDias: d.avisarDias } : {}),
  };

  const problemas = problemasDeDocumento(borrador, iso);
  if (problemas.length) {
    throw new HttpsError('invalid-argument', 'El documento no se puede guardar todavía.', {
      problemas,
      mensajes: problemas.map(explicarProblemaDocumento),
    });
  }

  await db.doc(`documentos/${id}`).create({
    ...borrador,
    estado: 'subiendo',
    subidoPor: quien.uid,
    _version: 1,
    createdAt: iso,
    updatedAt: iso,
  });

  logger.info(`[documentos] ${id} reservado en ${expedienteId} por ${quien.uid}`);
  return { ok: true, id, claveStorage: clave };
});

/**
 * Paso 3 — el servidor mira el objeto REAL y cierra el registro.
 *
 * El tamaño y el tipo se toman de Storage, NO de lo que mande el navegador. Un registro que se cree lo
 * que le cuentan no es un registro: es una declaración jurada de la parte interesada.
 */
export const confirmarDocumento = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const id = texto((req.data as Record<string, unknown>)?.id);
  if (!id) throw new HttpsError('invalid-argument', 'Falta el identificador del documento.');

  const ref = db.doc(`documentos/${id}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', `El documento ${id} no existe.`);
  const doc = snap.data() as Documento & { estado?: string };

  const objeto = getStorage().bucket().file(doc.claveStorage);
  const [existe] = await objeto.exists();
  if (!existe) {
    throw new HttpsError('failed-precondition', 'El archivo no llegó al servidor. Vuelve a intentarlo.');
  }
  const [meta] = await objeto.getMetadata();

  // Lo que de verdad hay, no lo que dijeron que habría.
  const bytesReales = Number(meta.size ?? 0);
  const tipoReal = String(meta.contentType ?? '');

  if (bytesReales > TOPE_BYTES) {
    // Se borra: dejarlo sería aceptar por la puerta de atrás lo que se rechazó por la de delante.
    await objeto.delete().catch(() => undefined);
    await ref.delete().catch(() => undefined);
    throw new HttpsError('invalid-argument', explicarProblemaDocumento('demasiado-grande'));
  }
  if (!TIPOS_MIME.includes(tipoReal as (typeof TIPOS_MIME)[number])) {
    await objeto.delete().catch(() => undefined);
    await ref.delete().catch(() => undefined);
    throw new HttpsError('invalid-argument', explicarProblemaDocumento('tipo-no-admitido'));
  }

  const iso = new Date().toISOString();
  await ref.update({
    estado: 'guardado',
    bytes: bytesReales,
    contentType: tipoReal,
    _version: (doc._version ?? 1) + 1,
    updatedAt: iso,
    confirmadoPor: quien.uid,
  });

  logger.info(`[documentos] ${id} confirmado (${bytesReales} bytes) por ${quien.uid}`);
  return { ok: true, id, bytes: bytesReales, contentType: tipoReal };
});

/**
 * Retirar ≠ eliminar.
 *
 * El archivo deja de estar a la vista y queda constancia de quién lo retiró. Borrar de verdad un
 * soporte de un contrato vivo es la clase de acción que no se puede deshacer y que un día hace falta
 * en un juzgado. El objeto de Storage se CONSERVA a propósito; si algún día hay que destruirlo de
 * verdad (una solicitud de supresión del titular, Ley 1581 art. 8), será una acción distinta, con su
 * propio nombre y su propia constancia.
 */
export const retirarDocumento = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as Record<string, unknown>;
  const id = texto(d.id);
  const motivo = texto(d.motivo);
  if (!id) throw new HttpsError('invalid-argument', 'Falta el identificador del documento.');
  if (motivo.length < 5) {
    throw new HttpsError('invalid-argument', 'Escribe por qué lo retiras. En seis meses nadie lo va a recordar.');
  }

  const ref = db.doc(`documentos/${id}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', `El documento ${id} no existe.`);
  const doc = snap.data() as Documento;
  if (doc.retiradoEn) throw new HttpsError('failed-precondition', 'Ese documento ya estaba retirado.');

  const iso = new Date().toISOString();
  await ref.update({
    retiradoEn: iso,
    retiradoPor: quien.uid,
    motivoRetiro: motivo,
    _version: (doc._version ?? 1) + 1,
    updatedAt: iso,
  });

  logger.info(`[documentos] ${id} retirado por ${quien.uid}`);
  return { ok: true, id };
});
