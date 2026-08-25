/*
 * LA BITÁCORA DE UN DOCUMENTO — qué se puede enseñar, a quién, y cómo se dice (§148, mockup 4a).
 *
 * La bóveda ya ESCRIBE quién abre cada documento (§142): el servidor lo registra en `auditLog` con
 * el uid del token verificado. Lo que faltaba es LEERLA — porque una bitácora que nadie puede
 * consultar es exactamente igual de útil que no tenerla.
 *
 * TRES DECISIONES QUE NO SON DE PINTAR:
 *
 * 1. 🔒 **NO LA VE TODO EL EQUIPO.** `auditLog` guarda IP, navegador y patrón de acceso de OTRAS
 *    personas del equipo — dato personal de terceros. Las Rules ya la reservan al super_admin
 *    (§130), y esa decisión se respeta aquí en vez de pelearla: el resto del staff ve la sección,
 *    pero con la explicación de por qué no ve las filas. *Un panel que esconde algo sin decirlo se
 *    lee como un error; uno que lo dice, como una política.*
 *
 * 2. 🌐 **NI IP NI CIUDAD, aunque estén guardadas.** El mockup dibuja una columna «Cartagena». No se
 *    construye: deducir ciudad de una IP exige un servicio de terceros al que habría que mandarle la
 *    IP de nuestra propia gente, y para la pregunta que esta pantalla contesta —«¿quién abrió la
 *    cédula del inquilino?»— la ciudad no aporta nada. En su lugar va QUÉ hizo (abrir o retirar),
 *    que sí distingue dos hechos muy distintos.
 *
 * 3. ⏳ **LA BITÁCORA SE CORTA, y se dice dónde.** Se piden como mucho `TOPE` entradas. Si llegan
 *    justo `TOPE`, es que probablemente hay más, y la pantalla lo advierte en vez de fingir que eso
 *    es todo — un listado truncado en silencio es peor que uno corto, porque se lee como completo.
 */

/** Acciones de `auditLog` que tienen que ver con un documento de la bóveda. */
export const ACCIONES_DOCUMENTO = ['documento-abierto', 'documento-retirado'] as const;
export type AccionDocumento = (typeof ACCIONES_DOCUMENTO)[number];

/** Cuántas entradas se piden. `limit()` es obligatorio en este proyecto: sin él es cuota abierta. */
export const TOPE_BITACORA = 25;

/**
 * Una entrada tal como sale de Firestore. Todo opcional a propósito: son documentos escritos por el
 * servidor a lo largo del tiempo, y una versión vieja puede no traer un campo que hoy sí ponemos.
 */
export interface EntradaCruda {
  accion?: string;
  email?: string | null;
  rol?: string | null;
  objetivo?: string | null;
  detalle?: string | null;
  /** Marca de tiempo de Firestore, o cualquier cosa con `toDate()`. Puede faltar (escritura en vuelo). */
  creadoEn?: { toDate?: () => Date } | Date | null;
}

/** Lo que la pantalla necesita, ya limpio. */
export interface Acceso {
  quien: string;
  cuando: Date | null;
  accion: AccionDocumento;
  detalle: string | null;
}

const ROL_VISIBLE: Record<string, string> = {
  super_admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Solo consulta',
};

const esAccionDeDocumento = (a: unknown): a is AccionDocumento =>
  typeof a === 'string' && (ACCIONES_DOCUMENTO as readonly string[]).includes(a);

/**
 * Convierte la marca de tiempo de Firestore en `Date`. Devuelve `null` si aún no ha aterrizado:
 * `serverTimestamp()` deja el campo vacío hasta que el servidor lo resuelve, así que una entrada
 * recién escrita puede llegar sin fecha. Es un estado normal, no un error.
 */
export function aFecha(valor: EntradaCruda['creadoEn']): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor;
  if (typeof valor.toDate === 'function') {
    try {
      const d = valor.toDate();
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Quién, en una línea legible. El correo es el identificador REAL —el rol cambia con el tiempo— así
 * que manda el correo y el rol va detrás como contexto. Sin correo se dice «cuenta sin correo» en
 * vez de dejar el hueco: una fila de bitácora sin autor da más miedo que una con un autor raro.
 */
export function quienEs(e: EntradaCruda): string {
  const correo = (e.email ?? '').trim();
  const rol = ROL_VISIBLE[e.rol ?? ''] ?? (e.rol ?? '').trim();
  if (!correo) return rol ? `Cuenta sin correo · ${rol}` : 'Cuenta sin correo';
  return rol ? `${correo} · ${rol}` : correo;
}

/**
 * Limpia lo que vino de Firestore y descarta lo que no es de este documento. El filtro por `objetivo`
 * se repite aquí aunque la consulta ya lo pida: la consulta puede cambiar, y una bitácora que enseñe
 * el acceso a OTRO documento no es un fallo cosmético.
 */
export function accesosDe(documentoId: string, crudas: readonly EntradaCruda[]): Acceso[] {
  const limpias: Acceso[] = [];
  for (const e of crudas) {
    if (e.objetivo !== documentoId) continue;
    if (!esAccionDeDocumento(e.accion)) continue;
    limpias.push({
      quien: quienEs(e),
      cuando: aFecha(e.creadoEn),
      accion: e.accion,
      detalle: e.detalle?.trim() || null,
    });
  }
  // Más reciente primero. Las que no tienen fecha van al final: son escrituras en vuelo, no historia.
  return limpias.sort((a, b) => (b.cuando?.getTime() ?? -1) - (a.cuando?.getTime() ?? -1));
}

/** «Abrió» / «Retiró» — el verbo, que es lo que se lee en la fila. */
export const VERBO: Record<AccionDocumento, string> = {
  'documento-abierto': 'Abrió',
  'documento-retirado': 'Retiró',
};

/**
 * «12 de marzo de 2026, 9:42 a. m.» — a mano y en la zona horaria de Colombia (UTC−5, sin horario
 * de verano). `toLocaleString` dependería de los datos de idioma del navegador de cada quien, y una
 * bitácora que dice horas distintas según el equipo desde el que se mira no sirve para lo que sirve
 * una bitácora.
 */
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const DESFASE_COLOMBIA_MIN = -5 * 60;

export function cuandoEs(fecha: Date | null): string {
  if (!fecha) return 'hace un momento';
  const local = new Date(fecha.getTime() + DESFASE_COLOMBIA_MIN * 60_000);
  const h24 = local.getUTCHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(local.getUTCMinutes()).padStart(2, '0');
  const meridiano = h24 < 12 ? 'a. m.' : 'p. m.';
  return `${local.getUTCDate()} de ${MESES[local.getUTCMonth()]} de ${local.getUTCFullYear()}, ${h12}:${mm} ${meridiano}`;
}

/**
 * ¿Hay que avisar de que la lista está cortada? Solo cuando llegaron EXACTAMENTE las que se pidieron:
 * con menos, se acabaron de verdad. No distingue el caso límite —justo `TOPE` en total— y avisa de
 * más; pasarse avisando es el error barato.
 */
export const hayMas = (recibidas: number, tope = TOPE_BITACORA): boolean => recibidas >= tope;
