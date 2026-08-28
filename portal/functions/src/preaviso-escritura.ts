/*
 * REGISTRAR EL PREAVISO — la puerta que le faltaba a `domain/preaviso.ts` (§187 · §222 · ADR §233).
 *
 * QUÉ SE JUEGA. Los arts. 22 num. 7 y 24 de la Ley 820 piden DOS cosas para que un aviso de
 * terminación surta efecto: que sea escrito **y** que viaje por servicio postal autorizado. §185
 * dictaminó que la Ley 527 da equivalente funcional del escrito y de la firma, **no de un canal de
 * entrega**: el producto no ENVÍA el preaviso, lo INSTRUMENTA. Si no surte efecto, el contrato se
 * prorroga **un año entero** y nadie se entera hasta que el propietario quiere disponer del inmueble.
 *
 * 🔴 LA DECISIÓN QUE JUSTIFICA QUE ESTO SEA SERVIDOR Y NO FORMULARIO:
 *
 * 1. **El estado NO se teclea, se DERIVA.** `estado: 'preaviso'` lo pone este servidor y solo cuando
 *    `efecto() === 'termina'`. Un contrato marcado «preaviso» sin constancia detrás —o con una
 *    impuesta tarde— es exactamente el fallo que el módulo existe para impedir, y sería invisible:
 *    la casilla diría que el contrato acaba y la ley diría que se renovó. *Lo derivado sobrevive; lo
 *    declarado se desincroniza.*
 *
 * 2. **Un preaviso tardío SE GUARDA IGUAL.** No es un error de validación que haya que rechazar:
 *    pasó, y la evidencia de que pasó es justamente lo que hará falta el día que alguien pregunte
 *    por qué el contrato sigue vivo. Se archiva con su veredicto `se-prorroga` y el contrato NO
 *    cambia de estado. Rechazarlo borraría el hecho.
 *
 * 3. **El veredicto se CONGELA al registrar.** `efecto` se guarda calculado, no se recalcula al
 *    leer: `fechaLimite()` depende de `vigenciaFin`, y si mañana alguien corrige esa fecha el
 *    veredicto de un acto ya ocurrido no puede cambiar retroactivamente.
 *
 * 4. **`vigenciaFin` sale del CONTRATO, nunca del cuerpo de la llamada.** Es el dato del que depende
 *    todo el cálculo; aceptarlo del navegador permitiría regalarse tres meses tecleando otra fecha.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import {
  efecto,
  explicarProblemaPreaviso,
  problemasDePreaviso,
  QUIENES_PREAVISAN,
  type Preaviso,
  type QuienPreavisa,
} from '../../src/lib/domain/preaviso';
import type { Contrato, PreavisoRegistrado } from '../../src/lib/domain/gestion';

const REGION = 'us-central1';

/** Espeja `esEditorOMas()` del ruleset: los mismos que escriben en la bóveda (§222). */
const ROLES_ESCRITURA = new Set(['super_admin', 'editor']);

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const fecha = (v: unknown): string => texto(v).slice(0, 10);

function exigirEditor(req: CallableRequest): { uid: string; rol: string } {
  const token = req.auth?.token as { admin?: boolean; rol?: string } | undefined;
  if (!req.auth || token?.admin !== true) {
    throw new HttpsError('unauthenticated', 'Necesitas iniciar sesión con una cuenta del equipo.');
  }
  const rol = String(token.rol ?? '');
  if (!ROLES_ESCRITURA.has(rol)) {
    throw new HttpsError('permission-denied', 'Tu rol no puede registrar un preaviso.');
  }
  return { uid: req.auth.uid, rol };
}

/**
 * Archiva la evidencia postal de un preaviso y, SOLO si surte efecto, mueve el contrato.
 *
 * Devuelve el veredicto con todas las letras para que la pantalla pueda decirlo — el dominio
 * distingue `termina` de `se-prorroga` en vez de devolver un booleano precisamente para eso.
 */
export const registrarPreaviso = onCall({ region: REGION }, async (req) => {
  const quienLlama = exigirEditor(req);
  const db = getFirestore();
  const d = (req.data ?? {}) as Record<string, unknown>;

  const contratoId = texto(d.contratoId);
  if (!contratoId) {
    throw new HttpsError('invalid-argument', 'Falta el contrato al que pertenece el preaviso.');
  }

  const ref = db.doc(`contratos/${contratoId}`);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError('not-found', `No existe el contrato ${contratoId}.`);
  }
  const contrato = snap.data() as Contrato;

  if (contrato.estado === 'terminado') {
    throw new HttpsError(
      'failed-precondition',
      'Este contrato ya está terminado: no hay nada que preavisar.',
    );
  }

  const vigenciaFin = fecha(contrato.vigenciaFin);
  if (!vigenciaFin) {
    // Sin fecha de vencimiento no hay límite que calcular, y un preaviso sin límite no es
    // verificable. Se para aquí en vez de guardar algo cuyo efecto nadie puede juzgar.
    throw new HttpsError(
      'failed-precondition',
      `El contrato ${contratoId} no tiene fecha de vencimiento, así que no se puede calcular el ` +
        'plazo de los tres meses. Corrige la vigencia antes de registrar el preaviso.',
    );
  }

  /*
   * 🔴 UNA EVIDENCIA ARCHIVADA NO SE PISA (§263). Esto escribía `preaviso: registrado` con
   * `merge: true` — que fusiona al nivel de arriba, o sea REEMPLAZA el objeto entero— y sin mirar si
   * ya había uno. El segundo registro se llevaba por delante el operador, la guía, la fecha de
   * imposición y el veredicto CONGELADO del primero, sin dejar historial.
   *
   * Y no era un caso raro: la pantalla INVITABA a repetirlo. Tras el éxito no refrescaba nada
   * visible, así que el operador dudaba de si se había guardado y volvía a pulsar. Lo que se
   * destruía es la constancia postal — la ÚNICA prueba de que el aviso viajó por servicio autorizado
   * (Ley 820 arts. 22.7 y 24), y el dato del que depende todo el cálculo del plazo.
   *
   * Se rechaza en vez de versionar: guardar dos evidencias exigiría decidir cuál manda, y esa
   * decisión no es del servidor. Si de verdad hay que corregirla, que sea un acto explícito.
   */
  const yaHay = (contrato as { preaviso?: { operador?: string; guia?: string; impuestoEl?: string } }).preaviso;
  if (yaHay) {
    throw new HttpsError(
      'failed-precondition',
      `Este contrato YA tiene un preaviso archivado (${yaHay.operador ?? 'operador sin registrar'}, ` +
        `guía ${yaHay.guia ?? 'sin registrar'}, impuesto el ${yaHay.impuestoEl ?? 'sin fecha'}). ` +
        'No se sobrescribe: esa constancia es la prueba de que el aviso viajó, y borrarla dejaría el ' +
        'contrato sin nada que la sustituya.',
      { operador: yaHay.operador, guia: yaHay.guia, impuestoEl: yaHay.impuestoEl },
    );
  }

  const quien = texto(d.quien) as QuienPreavisa;
  if (!QUIENES_PREAVISAN.includes(quien)) {
    throw new HttpsError('invalid-argument', 'Hay que decir quién da el preaviso: arrendador o arrendatario.');
  }

  const entregadoEl = fecha(d.entregadoEl);
  const preaviso: Preaviso = {
    contratoId,
    quien,
    redactadoEl: fecha(d.redactadoEl),
    evidencia: {
      operador: texto(d.operador),
      guia: texto(d.guia),
      impuestoEl: fecha(d.impuestoEl),
      ...(entregadoEl ? { entregadoEl } : {}),
    },
  };

  const problemas = problemasDePreaviso(preaviso, vigenciaFin);
  const veredicto = efecto(preaviso, vigenciaFin);

  /*
   * Lo que FALTA se rechaza; lo que llegó TARDE se guarda. La diferencia no es de severidad: un
   * preaviso sin operador ni guía no es un acto, es un formulario a medias — no hay nada que
   * archivar. Uno impuesto tarde SÍ ocurrió, y borrarlo dejaría al contrato prorrogándose sin que
   * conste por qué.
   */
  const incompleto = problemas.filter((p) => p !== 'impuesto-tarde');
  if (incompleto.length) {
    throw new HttpsError('invalid-argument', 'Falta evidencia postal para registrar el preaviso.', {
      problemas: incompleto,
      mensajes: incompleto.map(explicarProblemaPreaviso),
    });
  }

  const ahora = new Date().toISOString();
  const registrado: PreavisoRegistrado = {
    quien,
    redactadoEl: preaviso.redactadoEl,
    operador: preaviso.evidencia!.operador,
    guia: preaviso.evidencia!.guia,
    impuestoEl: preaviso.evidencia!.impuestoEl,
    ...(entregadoEl ? { entregadoEl } : {}),
    efecto: veredicto,
    ...(texto(d.constanciaDocId) ? { constanciaDocId: texto(d.constanciaDocId) } : {}),
    registradoEn: ahora,
    registradoPor: quienLlama.uid,
  };

  // El estado se DERIVA del veredicto. Si se prorroga, el contrato sigue como estaba.
  const cambios: Record<string, unknown> = { preaviso: registrado, updatedAt: ahora };
  if (veredicto === 'termina') cambios.estado = 'preaviso';

  await ref.set(cambios, { merge: true });

  logger.info('preaviso registrado', {
    contratoId,
    quien,
    impuestoEl: registrado.impuestoEl,
    efecto: veredicto,
    porUid: quienLlama.uid,
  });

  return {
    contratoId,
    efecto: veredicto,
    vigenciaFin,
    estadoContrato: veredicto === 'termina' ? 'preaviso' : contrato.estado,
    /** Presente solo cuando llegó tarde: es lo que la pantalla tiene que poder decir entero. */
    ...(veredicto === 'se-prorroga'
      ? { motivo: explicarProblemaPreaviso('impuesto-tarde') }
      : {}),
  };
});
