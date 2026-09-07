/*
 * PERFIL DE INQUILINO — las puertas de escritura (Ola 2 · §152).
 *
 * AQUÍ HAY DOS INTERLOCUTORES DISTINTOS, y esa es la diferencia con todo lo demás del panel:
 *
 *  · **el TITULAR** —una persona corriente con cuenta, no del equipo— guarda su perfil, sube sus
 *    soportes y lo envía. Sobre SU perfil y ninguno más: el `uid` sale del token, jamás del cuerpo
 *    de la llamada. Si saliera del cuerpo, cualquiera podría escribir en el perfil de otro con
 *    cambiar un campo.
 *  · **el EQUIPO** revisa: verifica o devuelve con observaciones. No puede editar los datos ni los
 *    soportes de nadie — solo dictaminar. Un revisor que puede tocar lo que revisa no es un revisor.
 *
 * ⚖️ Y lo que estas funciones NO hacen, dicho para que quede constancia:
 *  · **no consultan a ninguna central de riesgo.** Sin contrato con DataCrédito o TransUnion eso no
 *    es caro, es ilegal (gate B-04). Este perfil verifica DOCUMENTOS, no solvencia.
 *  · **no cobran nada al aspirante** (art. 16 Ley 820 y la lectura dominante sobre el «estudio»).
 *
 * El archivo lo sube el navegador directo a Storage, a una ruta que ACUÑA el servidor y que lleva el
 * `uid` dentro — así las Storage Rules pueden acotar por persona. Mismo patrón de tres pasos de la
 * bóveda (§142), y por la misma razón: un registro que se cree lo que le cuenta el navegador no es
 * un registro.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';
import {
  claveSoporte,
  explicar,
  problemasAlCambiar,
  problemasParaEnviar,
  REQUISITOS,
  type EstadoPerfil,
  type PerfilInquilino,
  type Requisito,
  type SoportePerfil,
} from '../../src/lib/domain/perfil-inquilino';
import { TIPOS_MIME, TOPE_BYTES, extensionDe } from '../../src/lib/domain/documentos';

const REGION = 'us-central1';
const ROLES_REVISION = new Set(['super_admin', 'editor']);

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * El TITULAR. Basta con estar autenticado — no hace falta ser del equipo, al revés: este es el único
 * sitio del sistema donde escribe alguien de fuera. Lo que lo hace seguro no es el rol, es que el
 * `uid` venga del TOKEN.
 */
function exigirTitular(req: CallableRequest): string {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Inicia sesión para trabajar en tu perfil.');
  }
  return req.auth.uid;
}

/** Quien REVISA. Rol de equipo, leído del token (§99), cero lecturas. */
function exigirRevisor(req: CallableRequest): string {
  const token = req.auth?.token as { admin?: boolean; rol?: string } | undefined;
  if (!req.auth || token?.admin !== true) {
    throw new HttpsError('unauthenticated', 'Necesitas iniciar sesión con una cuenta del equipo.');
  }
  if (!ROLES_REVISION.has(String(token.rol ?? ''))) {
    throw new HttpsError('permission-denied', 'Tu rol no puede revisar perfiles.');
  }
  return req.auth.uid;
}

/** El id del perfil ES el uid: una persona, un perfil. Sin contador ni colisiones que resolver. */
const refPerfil = (db: Firestore, uid: string) => db.doc(`perfiles/${uid}`);

const rechazar = (problemas: string[], mensaje: string): never => {
  throw new HttpsError('invalid-argument', mensaje, {
    problemas,
    mensajes: problemas.map(explicar),
  });
};

/**
 * Guarda el borrador del titular. Crea el perfil si no existía.
 *
 * NO toca `estado`, `soportes` ni las fechas del proceso: eso lo mueven las otras puertas. Un
 * «guardar» que además pudiera cambiar el estado sería la vía para saltarse la revisión.
 */
export const guardarPerfil = onCall({ region: REGION }, async (req) => {
  const uid = exigirTitular(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as Record<string, unknown>;
  const ahora = new Date().toISOString();
  const ref = refPerfil(db, uid);

  const parche = {
    nombre: texto(d.nombre),
    email: texto(d.email) || req.auth?.token?.email || '',
    ...(texto(d.telefono) ? { telefono: texto(d.telefono) } : {}),
    primerArriendo: d.primerArriendo === true,
    autorizaTratamiento: d.autorizaTratamiento === true,
    updatedAt: ahora,
  };

  const perfil = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      const nuevo: PerfilInquilino = {
        id: uid,
        uid,
        nombre: parche.nombre,
        email: parche.email,
        ...(parche.telefono ? { telefono: parche.telefono } : {}),
        primerArriendo: parche.primerArriendo,
        autorizaTratamiento: parche.autorizaTratamiento,
        soportes: [],
        estado: 'borrador',
        _version: 1,
        createdAt: ahora,
        updatedAt: ahora,
      };
      tx.set(ref, nuevo);
      return nuevo;
    }
    const actual = snap.data() as PerfilInquilino;
    // En revisión NO se edita: cambiar los datos mientras alguien los mira convierte la revisión en
    // una foto de algo que ya no existe.
    if (actual.estado === 'enviado' || actual.estado === 'revisando') {
      throw new HttpsError('failed-precondition', explicar('ya-enviado'));
    }
    const fusionado: PerfilInquilino = { ...actual, ...parche, _version: (actual._version ?? 1) + 1 };
    tx.set(ref, fusionado);
    return fusionado;
  });

  return { ok: true, perfil };
});

/**
 * Paso 1 de un soporte: el servidor acuña la RUTA. El navegador no elige dónde escribe — si
 * eligiera, «cada uno solo bajo su carpeta» no significaría nada.
 */
export const prepararSoporte = onCall({ region: REGION }, async (req) => {
  const uid = exigirTitular(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as Record<string, unknown>;

  const requisito = texto(d.requisito) as Requisito;
  const contentType = texto(d.contentType);
  const bytes = typeof d.bytes === 'number' ? d.bytes : NaN;

  if (!REQUISITOS.includes(requisito)) {
    throw new HttpsError('invalid-argument', 'Falta decir qué documento es.');
  }
  if (!TIPOS_MIME.includes(contentType as (typeof TIPOS_MIME)[number])) {
    throw new HttpsError('invalid-argument', 'Ese tipo de archivo no se admite.');
  }
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > TOPE_BYTES) {
    throw new HttpsError('invalid-argument', 'El archivo pesa más de lo admitido.');
  }

  const snap = await refPerfil(db, uid).get();
  if (!snap.exists) throw new HttpsError('failed-precondition', 'Guarda tus datos antes de subir.');
  const perfil = snap.data() as PerfilInquilino;
  if (perfil.estado === 'enviado' || perfil.estado === 'revisando') {
    throw new HttpsError('failed-precondition', explicar('ya-enviado'));
  }

  const id = `${requisito}-${Date.now().toString(36)}`;
  const clave = claveSoporte(uid, requisito, id, extensionDe(contentType));
  return { ok: true, id, claveStorage: clave };
});

/**
 * Paso 3: el servidor MIRA el objeto real antes de darlo por bueno, y solo entonces lo apunta en el
 * perfil. Si el archivo no está donde se dijo, no hay soporte — por mucho que el navegador insista.
 *
 * Un requisito SUSTITUYE al anterior: se sube otra vez porque la primera salió borrosa, y quedarse
 * con las dos obliga a la persona a explicar cuál vale.
 */
export const confirmarSoporte = onCall({ region: REGION }, async (req) => {
  const uid = exigirTitular(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as Record<string, unknown>;

  const requisito = texto(d.requisito) as Requisito;
  const clave = texto(d.claveStorage);
  const nombreArchivo = texto(d.nombreArchivo) || 'documento';
  if (!REQUISITOS.includes(requisito) || !clave) {
    throw new HttpsError('invalid-argument', 'Faltan datos del soporte.');
  }
  // 🔴 La ruta tiene que caer bajo la carpeta de QUIEN LLAMA. Sin esto, alguien podría confirmar como
  //    suyo un archivo de otra persona con solo copiar la clave.
  if (!clave.startsWith(`perfiles/${uid}/`)) {
    throw new HttpsError('permission-denied', 'Esa ruta no es tuya.');
  }

  const [existe] = await getStorage().bucket().file(clave).exists();
  if (!existe) throw new HttpsError('not-found', 'No encontramos el archivo. Vuelve a subirlo.');

  const ahora = new Date().toISOString();
  const ref = refPerfil(db, uid);
  const perfil = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('failed-precondition', 'Guarda tus datos antes de subir.');
    const actual = snap.data() as PerfilInquilino;
    if (actual.estado === 'enviado' || actual.estado === 'revisando') {
      throw new HttpsError('failed-precondition', explicar('ya-enviado'));
    }
    const soporte: SoportePerfil = { requisito, claveStorage: clave, nombreArchivo, subidoEn: ahora };
    const soportes = [...(actual.soportes ?? []).filter((s) => s.requisito !== requisito), soporte];
    const fusionado: PerfilInquilino = {
      ...actual,
      soportes,
      updatedAt: ahora,
      _version: (actual._version ?? 1) + 1,
    };
    tx.set(ref, fusionado);
    return fusionado;
  });

  logger.info(`[perfil] ${uid} subió ${requisito}`);
  return { ok: true, perfil };
});

/** El titular manda su perfil a revisión. Aquí se aplica el checklist completo. */
export const enviarPerfil = onCall({ region: REGION }, async (req) => {
  const uid = exigirTitular(req);
  const db = getFirestore();
  const ref = refPerfil(db, uid);
  const ahora = new Date().toISOString();

  const { perfil, problemas } = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Todavía no has empezado tu perfil.');
    const actual = snap.data() as PerfilInquilino;

    const deEstado = problemasAlCambiar(actual.estado, 'enviado');
    if (deEstado.length) return { perfil: actual, problemas: deEstado };

    const malos = problemasParaEnviar(actual);
    if (malos.length) return { perfil: actual, problemas: malos };

    /*
     * Las observaciones anteriores SE VAN al reenviar: si siguieran ahí, la persona vería para
     * siempre lo que ya corrigió.
     *
     * ⚠️ Y se quitan SACANDO LA CLAVE, no poniéndola a `undefined`. En JavaScript las dos cosas se
     * leen igual —«no hay valor»— pero Firestore rechaza `undefined` con un error de validación, así
     * que `{...actual, observaciones: undefined}` parece que limpia y en realidad revienta la
     * escritura entera. Como aquí se hace un `set()` completo, omitir la clave sí la borra.
     */
    const { observaciones: _ya, ...sinObservaciones } = actual;
    const enviado: PerfilInquilino = {
      ...sinObservaciones,
      estado: 'enviado',
      enviadoEn: ahora,
      updatedAt: ahora,
      _version: (actual._version ?? 1) + 1,
    };
    tx.set(ref, enviado);
    return { perfil: enviado, problemas: [] as string[] };
  });

  if (problemas.length) rechazar(problemas, 'Tu perfil todavía no se puede enviar.');
  logger.info(`[perfil] ${uid} enviado a revisión`);
  return { ok: true, perfil };
});

/**
 * El EQUIPO dictamina. Solo cambia el estado y, si devuelve, escribe qué falta — no toca los datos
 * ni los soportes de nadie.
 */
export const revisarPerfil = onCall({ region: REGION }, async (req) => {
  const quien = exigirRevisor(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as { uid?: string; estado?: EstadoPerfil; observaciones?: string };

  const titular = texto(d.uid);
  const destino = d.estado as EstadoPerfil | undefined;
  if (!titular || !destino) throw new HttpsError('invalid-argument', 'Falta el perfil o el destino.');

  const ref = refPerfil(db, titular);
  const ahora = new Date().toISOString();

  const { perfil, problemas } = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', `El perfil ${titular} no existe.`);
    const actual = snap.data() as PerfilInquilino;

    const malos = problemasAlCambiar(actual.estado, destino, { observaciones: d.observaciones });
    if (malos.length) return { perfil: actual, problemas: malos };

    const dictaminado: PerfilInquilino = {
      ...actual,
      estado: destino,
      ...(destino === 'verificado' ? { verificadoEn: ahora } : {}),
      ...(destino === 'observaciones' ? { observaciones: texto(d.observaciones) } : {}),
      updatedAt: ahora,
      _version: (actual._version ?? 1) + 1,
    };
    tx.set(ref, dictaminado);
    return { perfil: dictaminado, problemas: [] as string[] };
  });

  if (problemas.length) rechazar(problemas, 'El perfil no se puede dejar así.');
  logger.info(`[perfil] ${titular} → ${perfil.estado} por ${quien}`);
  return { ok: true, perfil };
});
