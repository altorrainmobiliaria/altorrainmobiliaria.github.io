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
  explicarProblemaExpediente,
  explicarProblemaNovedad,
  problemasDeContrato,
  problemasDeExpediente,
  problemasDeNovedad,
  type Contrato,
  type Expediente,
  type Novedad,
  type Pago,
  type TipoPago,
} from '../../src/lib/domain/gestion';
import { cifrasDePago, estadoDePago, idPago, vencimientoSla } from '../../src/lib/domain/agenda';

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

/**
 * Registra un pago RECIBIDO. La otra mitad de «se pierden los contratos, se olvidan fechas».
 *
 * LO QUE SE TECLEA ES SOLO LO QUE PASÓ: cuánto entró y cuándo. El monto esperado, la fecha de
 * vencimiento y el estado de mora los DERIVA la Function del contrato y del calendario
 * (`cifrasDePago` + `estadoDePago`, los mismos que usa el panel). Si el operador escribiera el monto
 * esperado, un dedo torcido convertiría un canon de 2.500.000 en 250.000 y la mora se calcularía
 * contra una cifra inventada — sin que nada fallara.
 *
 * El id es DETERMINISTA (`contrato_periodo_tipo`, OD6): registrar dos veces el canon de agosto
 * reescribe el MISMO documento en vez de crear un segundo cobro fantasma que descuadre la cartera.
 */
export const registrarPago = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as {
    contratoId?: string;
    periodo?: string;
    tipo?: TipoPago;
    montoRecibido?: number;
    fechaPago?: string;
    montoEsperado?: number;
  };

  const contratoId = texto(d.contratoId);
  const periodo = texto(d.periodo);
  const tipo = (d.tipo ?? 'canon_inquilino') as TipoPago;
  if (!contratoId || !/^\d{4}-\d{2}$/.test(periodo)) {
    throw new HttpsError('invalid-argument', 'Falta el contrato o el periodo (AAAA-MM).');
  }

  const snapC = await db.doc(`contratos/${contratoId}`).get();
  if (!snapC.exists) throw new HttpsError('not-found', `El contrato ${contratoId} no existe.`);
  const contrato = { ...(snapC.data() as object), id: snapC.id } as Contrato;

  // Los servicios públicos no salen del contrato (los trae la factura): ahí sí se acepta el monto.
  const cifras = cifrasDePago(contrato, periodo, tipo);
  const montoEsperado = cifras?.montoEsperado ?? Number(d.montoEsperado ?? 0);
  const fechaVencimiento = cifras?.fechaVencimiento ?? `${periodo}-${String(contrato.diaPago ?? 1).padStart(2, '0')}`;
  if (!montoEsperado || montoEsperado <= 0) {
    throw new HttpsError('invalid-argument', 'No se pudo determinar el monto esperado. Para servicios públicos, indícalo.');
  }

  const ahora = new Date();
  const hoy = ahora.toISOString().slice(0, 10);
  const fechaPago = texto(d.fechaPago) || undefined;
  const montoRecibido = Number(d.montoRecibido ?? 0) || undefined;

  const derivado = estadoDePago({ fechaVencimiento, fechaPago, montoEsperado, montoRecibido }, hoy);
  const id = idPago(contratoId, periodo, tipo);

  const doc: Pago = {
    id,
    expedienteId: contrato.expedienteId,
    contratoId,
    periodo,
    tipo,
    montoEsperado,
    ...(montoRecibido ? { montoRecibido } : {}),
    fechaVencimiento,
    ...(fechaPago ? { fechaPago } : {}),
    estado: derivado.estado,
    diasMora: derivado.diasMora,
    moraTier: derivado.moraTier,
    _version: 1,
    createdAt: ahora.toISOString(),
    updatedAt: ahora.toISOString(),
  };

  // `merge` a propósito: corregir un pago mal registrado tiene que poder hacerse sin borrar el
  // documento. El id determinista hace que la corrección caiga sobre el mismo sitio.
  await db.doc(`pagos/${id}`).set(doc, { merge: true });
  logger.info(`[gestion] pago ${id} (${derivado.estado}) por ${quien.uid}`);
  return { ok: true, id, pago: doc };
});

/**
 * Crea el EXPEDIENTE: el agregado raíz del que cuelgan contratos, pagos y novedades por FK.
 *
 * Hasta hoy `crearContrato` exigía un `expedienteId` que no había forma de acuñar — la puerta pedía
 * una llave que no fabricaba nadie. Esto la fabrica.
 */
export const crearExpediente = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const entrada = (req.data ?? {}) as Partial<Expediente>;

  const problemas = problemasDeExpediente(entrada);
  if (problemas.length) {
    throw new HttpsError('invalid-argument', 'El expediente no se puede abrir todavía.', {
      problemas,
      mensajes: problemas.map(explicarProblemaExpediente),
    });
  }

  const ahora = new Date();
  const iso = ahora.toISOString();
  const id = await acunarId(db, 'EXP', ahora);
  const doc: Expediente = { ...(entrada as Expediente), id, _version: 1, createdAt: iso, updatedAt: iso };

  try {
    await db.doc(`expedientes/${id}`).create(doc);
  } catch {
    throw new HttpsError('aborted', `El código ${id} ya estaba ocupado. No se guardó nada; reintenta.`);
  }
  logger.info(`[gestion] expediente ${id} abierto por ${quien.uid}`);
  return { ok: true, id, expediente: doc };
});

/**
 * Registra una NOVEDAD (PQRS del inquilino o del propietario).
 *
 * El plazo lo pone el SERVIDOR, no el formulario: es lo único que hace comparable el SLA entre
 * tickets, y si lo mandara el cliente bastaría un reloj mal puesto —o mala fe— para que una novedad
 * llevara tres días abierta y el tablero la enseñara en verde. Solo se respeta un `slaVencimiento`
 * explícito cuando el plazo se PACTÓ (una reparación acordada con el propietario), y aun así queda
 * escrito quién lo puso.
 */
export const crearNovedad = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const entrada = (req.data ?? {}) as Partial<Novedad>;

  const estado = entrada.estado ?? 'PENDIENTE';
  const problemas = problemasDeNovedad({ ...entrada, estado });
  if (problemas.length) {
    throw new HttpsError('invalid-argument', 'La novedad no se puede guardar todavía.', {
      problemas,
      mensajes: problemas.map(explicarProblemaNovedad),
    });
  }

  // 🔴 El expediente tiene que EXISTIR. Sin esto se crean tickets colgando de una FK inventada, que
  // no fallan al escribir y desaparecen de toda vista que agrupe por expediente.
  const exp = await db.doc(`expedientes/${String(entrada.expedienteId)}`).get();
  if (!exp.exists) throw new HttpsError('not-found', `El expediente ${entrada.expedienteId} no existe.`);

  const ahora = new Date();
  const iso = ahora.toISOString();
  const id = await acunarId(db, 'NOV', ahora);
  const doc: Novedad = {
    ...(entrada as Novedad),
    id,
    estado,
    slaVencimiento: vencimientoSla({ createdAt: iso, slaVencimiento: entrada.slaVencimiento }),
    _version: 1,
    createdAt: iso,
    updatedAt: iso,
  };

  try {
    await db.doc(`novedades/${id}`).create(doc);
  } catch {
    throw new HttpsError('aborted', `El código ${id} ya estaba ocupado. No se guardó nada; reintenta.`);
  }
  logger.info(`[gestion] novedad ${id} (${doc.tipo}) abierta por ${quien.uid}`);
  return { ok: true, id, novedad: doc };
});

/**
 * Mueve una novedad de estado. **La única forma de cerrarla.**
 *
 * VALIDA EL DOCUMENTO RESULTANTE, NO EL PARCHE. Es la trampa entera de este endpoint: mandar
 * `{estado:'CERRADO'}` a secas pasaría cualquier validación hecha sobre la entrada —«no trae
 * resolución, pero es que no trae nada»— y cerraría el ticket sin decir qué se hizo, que es
 * exactamente lo que el invariante existe para impedir. Se fusiona primero y se juzga después.
 *
 * Y va en TRANSACCIÓN con `_version`: dos personas atendiendo la misma queja es el caso NORMAL de
 * una inmobiliaria pequeña, no el raro, y sin esto la segunda pisa la resolución de la primera sin
 * que ninguna se entere.
 */
export const actualizarNovedad = onCall({ region: REGION }, async (req) => {
  const quien = exigirEditor(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as { id?: string; _version?: number } & Partial<Novedad>;

  const id = texto(d.id);
  if (!id) throw new HttpsError('invalid-argument', 'Falta el identificador de la novedad.');

  const ref = db.doc(`novedades/${id}`);
  const { doc, problemas } = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', `La novedad ${id} no existe.`);
    const actual = snap.data() as Novedad;

    if (typeof d._version === 'number' && d._version !== actual._version) {
      throw new HttpsError(
        'aborted',
        'Alguien más actualizó esta novedad mientras la editabas. Recarga para ver lo que quedó.',
      );
    }

    const { id: _i, _version: _v, createdAt: _c, ...parche } = d;
    const fusionado: Novedad = { ...actual, ...parche, id, createdAt: actual.createdAt };
    const malos = problemasDeNovedad(fusionado);
    if (malos.length) return { doc: fusionado, problemas: malos };

    fusionado._version = (actual._version ?? 1) + 1;
    fusionado.updatedAt = new Date().toISOString();
    tx.set(ref, fusionado);
    return { doc: fusionado, problemas: [] as ReturnType<typeof problemasDeNovedad> };
  });

  if (problemas.length) {
    throw new HttpsError('invalid-argument', 'La novedad no se puede dejar así.', {
      problemas,
      mensajes: problemas.map(explicarProblemaNovedad),
    });
  }
  logger.info(`[gestion] novedad ${id} → ${doc.estado} por ${quien.uid}`);
  return { ok: true, id, novedad: doc };
});
