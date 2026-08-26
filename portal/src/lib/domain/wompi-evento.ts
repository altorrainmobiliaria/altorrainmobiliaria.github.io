/*
 * EVENTO DE WOMPI — decidir qué hacer con lo que llega, antes de tocar un peso (§169).
 *
 * Es la pieza de MÁS RIESGO de todo el carril de pago: un webhook mal tratado no da un error, da un
 * cobro doble o un pago que nunca se acredita. Por eso se construye ahora, entera y probada, aunque
 * la cuenta de comercio no exista todavía — el dominio no necesita cuenta, y el día que la haya lo
 * último que se quiere es estar escribiendo esto con dinero de verdad corriendo por delante.
 *
 * TRES TRAMPAS QUE ESTE MÓDULO ENCIERRA, las tres de la skill `wompi-webhooks-validator`:
 *
 *   1. 🔑 **La firma NO lleva un conjunto FIJO de campos.** El evento trae `signature.properties`, un
 *      array de rutas, y hay que resolverlas EN ORDEN contra el JSON. Hardcodear
 *      `id + status + amount_in_cents` funciona hasta el primer evento con otro `properties`, y
 *      entonces la validación empieza a rechazar eventos legítimos — o peor, alguien la desactiva
 *      «porque da problemas». Es SHA-256 simple, **no HMAC**, y el secreto va como SUFIJO.
 *
 *   2. 🔁 **La clave idempotente NO es `transaction.id`.** Una misma transacción emite VARIOS eventos
 *      en su ciclo (PSE y Nequi mandan `PENDING` y después `APPROVED`). Con la transacción como
 *      clave, el segundo evento —el que de verdad confirma el pago— se descarta por «duplicado» y el
 *      cobro queda eternamente pendiente. Se usa el `id` del EVENTO, y si no viene, `transaction.id`
 *      + el estado.
 *
 *   3. 🚦 **Firma inválida ⇒ responder 200 igualmente.** Suena al revés, y no lo es: Wompi reintenta
 *      lo que no es 200 hasta 3 veces en 24 h, así que devolver error a un evento FALSIFICADO gasta
 *      ese presupuesto de reintentos en un atacante. El no-200 se reserva para fallos transitorios
 *      NUESTROS, que son los que sí conviene que se reintenten.
 *
 * ⚠️ ESTE MÓDULO NO HACE EL HASH: es puro y síncrono a propósito, para poder probarlo sin criptografía
 * ni servidor. Produce la CADENA que hay que firmar; quien tenga `crypto.subtle` la hashea y compara.
 * La comparación en tiempo constante también vive aquí, porque es lógica y no criptografía.
 */

/** Estados de transacción que emite Wompi. */
export const ESTADOS_WOMPI = ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'] as const;
export type EstadoWompi = (typeof ESTADOS_WOMPI)[number];

/** Lo que el evento significa para el mandato (diseño (a) del ADR §16). */
export const ESTADOS_MANDATO = ['esperando', 'retenido', 'reversado', 'fallido'] as const;
export type EstadoMandato = (typeof ESTADOS_MANDATO)[number];

export interface EventoWompi {
  /** `id` del EVENTO. Es la clave idempotente buena; puede faltar en payloads viejos. */
  id?: string;
  event?: string;
  /** Entero UNIX de NIVEL SUPERIOR. Entra en la firma después de las propiedades. */
  timestamp?: number;
  signature?: { properties?: string[]; checksum?: string };
  data?: { transaction?: Record<string, unknown> };
  [k: string]: unknown;
}

/** Qué hacer con un evento. `procesar` es el único que toca datos. */
export type Veredicto =
  | 'procesar'
  | 'duplicado'
  | 'firma-invalida'
  | 'sin-firma'
  | 'malformado';

/**
 * Resuelve una ruta con puntos contra el objeto del evento (`transaction.amount_in_cents`).
 * Devuelve `undefined` si el camino se rompe — y eso importa: una ruta que no resuelve NO puede
 * tratarse como cadena vacía, porque produciría una firma «válida» distinta de la que Wompi calculó.
 */
export function valorEnRuta(evento: EventoWompi, ruta: string): unknown {
  const partes = ruta.split('.');
  let actual: unknown = evento.data ?? evento;
  for (const p of partes) {
    if (actual === null || actual === undefined || typeof actual !== 'object') return undefined;
    actual = (actual as Record<string, unknown>)[p];
  }
  return actual;
}

/**
 * La CADENA que hay que hashear con SHA-256: los valores de `signature.properties` EN ORDEN, luego el
 * `timestamp` de nivel superior, y por último el secreto de eventos como sufijo.
 *
 * Devuelve `null` si falta el `properties`, el `timestamp`, o **si alguna ruta no resuelve**: sin uno
 * de esos datos no se puede afirmar nada sobre la autenticidad, y devolver una cadena a medias sería
 * fabricar una respuesta.
 */
export function cadenaAFirmar(evento: EventoWompi, secreto: string): string | null {
  const props = evento.signature?.properties;
  if (!Array.isArray(props) || props.length === 0) return null;
  if (typeof evento.timestamp !== 'number' || !Number.isFinite(evento.timestamp)) return null;

  let cadena = '';
  for (const ruta of props) {
    const v = valorEnRuta(evento, ruta);
    if (v === undefined || v === null) return null;
    cadena += String(v);
  }
  return `${cadena}${evento.timestamp}${secreto}`;
}

/**
 * Comparación en TIEMPO CONSTANTE. No es paranoia de manual: comparar checksums con `===` filtra,
 * por el tiempo de respuesta, cuántos caracteres iniciales acertó quien lo intenta.
 */
export function igualEnTiempoConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}

/**
 * La clave idempotente. **Nunca `transaction.id` a secas** — ver la trampa 2 de la cabecera.
 * Orden de preferencia: el `id` del evento; si no viene, `transaction.id` + estado.
 */
export function claveIdempotente(evento: EventoWompi): string | null {
  if (typeof evento.id === 'string' && evento.id.trim()) return evento.id.trim();
  const tx = evento.data?.transaction;
  const txId = tx?.['id'];
  const estado = tx?.['status'];
  if (typeof txId === 'string' && txId.trim() && typeof estado === 'string' && estado.trim()) {
    return `${txId.trim()}:${estado.trim()}`;
  }
  return null;
}

/**
 * Qué significa un estado de Wompi para el mandato.
 *
 * ⚠️ `APPROVED` es **`retenido`, NO «liberado»**. Que el pago se aprobara solo dice que el dinero
 * salió del arrendatario; liberarlo al propietario es una decisión NUESTRA con sus condiciones (§165)
 * y no la consecuencia automática de un webhook. Confundir las dos cosas es cómo se gira dinero que
 * después hay que devolver.
 */
export function estadoDelMandato(estado: string): EstadoMandato {
  switch (estado) {
    case 'APPROVED':
      return 'retenido';
    case 'PENDING':
      return 'esperando';
    case 'VOIDED':
      return 'reversado';
    case 'DECLINED':
    case 'ERROR':
      return 'fallido';
    default:
      return 'esperando';
  }
}

/**
 * Decide qué hacer, sin tocar nada. `yaVistas` son las claves ya procesadas.
 *
 * ⚠️ El orden importa: **primero la firma, después la idempotencia**. Al revés, un atacante podría
 * ocupar la clave de un evento legítimo con basura y hacer que el de verdad se descartara como
 * duplicado. Un guardia que apunta en la lista antes de comprobar el carnet no es un guardia.
 */
export function decidir(
  evento: EventoWompi,
  checksumRecibido: string | null,
  checksumCalculado: string | null,
  yaVistas: ReadonlySet<string>,
): Veredicto {
  if (!evento.signature?.properties || typeof evento.timestamp !== 'number') return 'malformado';
  if (!checksumRecibido) return 'sin-firma';
  if (!checksumCalculado || !igualEnTiempoConstante(checksumRecibido, checksumCalculado)) {
    return 'firma-invalida';
  }
  const clave = claveIdempotente(evento);
  if (!clave) return 'malformado';
  if (yaVistas.has(clave)) return 'duplicado';
  return 'procesar';
}

/**
 * El código HTTP que se le responde a Wompi.
 *
 * 🚦 **TODOS los veredictos devuelven 200 — incluida la firma inválida.** El 500 se reserva para
 * `fallo-interno`: una caída NUESTRA, que es justo lo que sí conviene que Wompi reintente. Al revés
 * —error para lo falsificado, 200 para lo nuestro— se gastan los 3 reintentos de 24 h en el atacante
 * y se pierde el evento legítimo que falló porque nuestra base estaba caída.
 *
 * Por eso esta función existe aunque hoy solo tenga dos salidas: el día que alguien añada un
 * veredicto nuevo, la pregunta «¿y este qué código devuelve?» se la hace el compilador aquí, y no un
 * incidente en producción.
 */
export function codigoDeRespuesta(v: Veredicto | 'fallo-interno'): 200 | 500 {
  return v === 'fallo-interno' ? 500 : 200;
}

/** Lo que se registra de cada veredicto. Un rechazo silencioso es un rechazo que nadie audita. */
export function explicarVeredicto(v: Veredicto): string {
  switch (v) {
    case 'procesar':
      return 'Evento auténtico y nuevo: se procesa.';
    case 'duplicado':
      return 'Ya se había procesado este evento. No se vuelve a aplicar.';
    case 'firma-invalida':
      return 'La firma no coincide. NO se procesa, y se responde 200 para no regalarle reintentos a quien lo envió.';
    case 'sin-firma':
      return 'Llegó sin checksum. NO se procesa.';
    case 'malformado':
      return 'Al evento le faltan datos para poder juzgarlo (firma, timestamp o identificador).';
    default:
      return 'Veredicto desconocido: no se procesa.';
  }
}
