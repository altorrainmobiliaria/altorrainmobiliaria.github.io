/*
 * ESCRITURAS DE GESTIÓN — la única puerta a `expedientes`, `contratos`, `pagos` y `novedades` (§113).
 *
 * POR QUÉ UNA FUNCTION Y NO EL CLIENTE. El ruleset lo dejó escrito al fusionarse (§100): *«el destino
 * es que toda escritura de estado pase por Cloud Functions… lo que ya nace cerrado nace cerrado»*, y
 * estas cuatro colecciones nacieron con `allow write: if false`. No es una limitación que haya que
 * rodear: es la decisión. Aquí van datos con PII de las partes, cifras de canon y honorarios, y un
 * gate legal que no puede depender de que el formulario se acuerde de aplicarlo.
 *
 * LO QUE ESTA FUNCTION IMPONE Y EL CLIENTE NO PUEDE SALTARSE:
 *   · el **gate del art. 16 de la Ley 820** — depósito en dinero PROHIBIDO en arriendo de vivienda.
 *     El modelo lo promete desde el día 1 («la CF valida `garantia` contra `vertical`») y hasta hoy no
 *     existía. Cobrarlo son hasta 100 SMLMV de multa y un riesgo para la matrícula de arrendador.
 *   · los invariantes de datos, con los MISMOS predicados que usará el formulario
 *     (`problemasDeContrato` vive en el dominio, no aquí): una regla, un dueño ([[L-45]]).
 *   · el rol: solo editor o super_admin. El claim viaja en el token (§99), cero lecturas.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import {
  explicarProblemaContrato,
  problemasDeContrato,
  type Contrato,
} from '../../src/lib/domain/gestion';

const REGION = 'us-central1';

/** Roles que pueden escribir estado de gestión. Espeja `esEditorOMas()` del ruleset. */
const ROLES_ESCRITURA = new Set(['super_admin', 'editor']);

interface Identidad {
  uid: string;
  rol: string;
}

/**
 * Comprueba quién llama, leyendo el TOKEN y nada más.
 *
 * Ni una lectura a `usuarios`: el permiso viaja dentro del token desde §99, y consultarlo aquí sería
 * pagar una lectura por escritura para saber algo que ya venía firmado.
 */
function exigirEditor(req: CallableRequest): Identidad {
  const token = req.auth?.token as { admin?: boolean; rol?: string } | undefined;
  if (!req.auth || token?.admin !== true) {
    throw new HttpsError('unauthenticated', 'Necesitas iniciar sesión con una cuenta del equipo.');
  }
  const rol = String(token.rol ?? '');
  if (!ROLES_ESCRITURA.has(rol)) {
    throw new HttpsError('permission-denied', 'Tu rol no puede crear ni modificar contratos.');
  }
  return { uid: req.auth.uid, rol };
}

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * Acuña el id de un documento de gestión: `CTR-YYYYMM-NNNN`, `EXP-…`, etc.
 *
 * Mismo criterio que el código de inmueble (§108): contador MENSUAL en `config/counters`, transacción,
 * y se PARA al agotar los 4 dígitos en vez de emitir un id con una forma que nadie sabe leer.
 */
async function acunarId(db: Firestore, prefijo: string, ahora: Date): Promise<string> {
  const clave = `${prefijo}-${ahora.getUTCFullYear()}${String(ahora.getUTCMonth() + 1).padStart(2, '0')}`;
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
 * Crea un contrato. **El único camino** para que exista uno.
 *
 * Devuelve los problemas AGRUPADOS y con su texto: un `invalid-argument` que solo dice «datos
 * inválidos» obliga a adivinar cuál, y en un formulario de doce campos eso son doce intentos.
 */
export const crearContrato = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const entrada = (req.data ?? {}) as Partial<Contrato>;

  // 🔴 La validación va ANTES de tocar el contador: un contrato inválido no debe quemar un código.
  const problemas = problemasDeContrato(entrada);
  if (problemas.length) {
    throw new HttpsError('invalid-argument', 'El contrato no se puede guardar todavía.', {
      problemas,
      mensajes: problemas.map(explicarProblemaContrato),
    });
  }

  const ahora = new Date();
  const iso = ahora.toISOString();
  const id = await acunarId(db, 'CTR', ahora);

  const doc: Contrato = {
    ...(entrada as Contrato),
    id,
    expedienteId: texto(entrada.expedienteId),
    _version: 1,
    createdAt: iso,
    updatedAt: iso,
  };

  // `create` y no `set`: si el contador se desincronizó y el id ya existe, esto FALLA en vez de
  // sobrescribir un contrato vivo. Es la misma red que el `tx.get` del alta de inmuebles (§108).
  try {
    await db.doc(`contratos/${id}`).create(doc);
  } catch {
    throw new HttpsError('aborted', `El código ${id} ya estaba ocupado. No se guardó nada; reintenta.`);
  }

  logger.info(`[gestion] contrato ${id} creado por ${quien.uid} (${quien.rol})`);
  return { ok: true, id, contrato: doc };
});
