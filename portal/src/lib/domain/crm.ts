import { OPERACIONES } from './shared';
import type { ISODate, Versioned, Auditable, Operacion } from './shared';

/**
 * Pipeline PRO de 9 estados (OD4) — enum canónico de `solicitudes.estado`. Diseñado para crecer;
 * los 4 estados legacy de R0 se mapean en la CAPA DE LECTURA (cero escrituras masivas, lección C-14).
 */
export const ESTADOS_SOLICITUD = [
  'nuevo', 'contactado', 'calificado', 'visita_agendada', 'visita_realizada',
  'oferta_presentada', 'cerrado', 'nurturing', 'descartado',
] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

/** Fuente del lead (first-touch). Confirmar valores exactos contra el Excel del dueño. */
export const FUENTES_LEAD = [
  'whatsapp', 'formulario_web', 'llamada', 'referido', 'portal', 'redes', 'presencial', 'otro',
] as const;
export type FuenteLead = (typeof FUENTES_LEAD)[number];

export type LeadTier = 'A' | 'B' | 'C' | 'D';

/**
 * `solicitudes` — leads. El alta la crea un GET/POST público controlado; el `leadScore`/`leadTier`
 * es server-side (Function). ⛔ NUNCA `onSnapshot` público; toda query paginada con `limit()`.
 */
export interface Solicitud extends Versioned, Auditable {
  id: string;
  estado: EstadoSolicitud;
  operacionInteres?: Operacion;
  propiedadId?: string; // si el lead nace de una ficha
  contacto: {
    nombre: string;
    telefono?: string;
    email?: string;
  };
  mensaje?: string;
  source: FuenteLead;
  /**
   * La CLAVE del formulario que creó el lead (`portal-estancias`, `portal-publicar`…): es lo que
   * escribe `/api/solicitud` y lo que indexan `CAMPOS_POR_ORIGEN` y `TIPO_POR_ORIGEN`. No es lo mismo
   * que `source`, que es la fuente de marketing del modelo.
   */
  origen?: string;
  /** Las fechas que pidió quien solicita una estancia. Cuentan como el campo `cita` del puntaje. */
  fechas?: { llegada: string; salida: string; huespedes?: number };
  leadScore?: number; // server-side
  leadTier?: LeadTier; // server-side
  nurturing?: { nextEmailAt?: ISODate; secuencia?: string };
  slaVencimiento?: ISODate; // proceso SLA del dueño (R4)
  responsable?: string;
}

const textoDe = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * El contacto de un documento de `solicitudes`, venga en la forma que venga.
 *
 * 🔴 POR QUÉ EXISTE. `/api/solicitud` —el único que escribe leads desde el portal— guarda `nombre`,
 * `telefono` y `email` SUELTOS (es la forma que lee `/gestion`), pero los lectores de las Functions
 * esperaban el `contacto` de esta interfaz. Resultado: el aviso de lead salía siempre por
 * `sin-datos` y ningún lead del portal habría llegado al buzón. Las pruebas no lo veían porque
 * sembraban un `contacto` que el endpoint real nunca escribe ([[L-88]]: de qué CAMPO lee).
 * Se arregla en la LECTURA: lo que ya está guardado se lee bien sin migrar nada.
 */
export function contactoDe(d: Record<string, unknown> | null | undefined): Solicitud['contacto'] {
  const c = (d?.contacto && typeof d.contacto === 'object' ? d.contacto : {}) as Record<string, unknown>;
  return {
    nombre: textoDe(c.nombre) || textoDe(d?.nombre),
    telefono: textoDe(c.telefono) || textoDe(d?.telefono),
    email: textoDe(c.email) || textoDe(d?.email),
  };
}

/**
 * Documento crudo de `solicitudes` → `Solicitud`. Conserva todo lo que trae y RELLENA lo que el
 * modelo espera desde la forma plana del portal: contacto, origen, operación, propiedad, fechas y el
 * resumen de la estancia como mensaje (es lo único que lleva las fechas legibles en el correo).
 */
export function solicitudDeDocumento(id: string, d: Record<string, unknown>): Solicitud {
  const extra = (d.datosExtra && typeof d.datosExtra === 'object' ? d.datosExtra : {}) as Record<string, unknown>;
  const op = textoDe(d.operacionInteres) || textoDe(extra.operacion);
  const llegada = textoDe(extra.llegada);
  const salida = textoDe(extra.salida);
  const huespedes = Number(extra.huespedes);
  const propiedadId = textoDe(d.propiedadId) || textoDe(extra.propiedadId);
  const mensaje = textoDe(d.mensaje) || textoDe(extra.descripcion);
  const origen = textoDe(d.origen) || textoDe(d.source);
  return {
    ...d,
    id,
    // El documento entero se conserva, pero estos campos los LEEN los avisos con `.trim()`: si no
    // son texto (un alta forzada por REST con `mensaje: 1`) se anulan aquí en vez de tumbar el
    // trigger. Lo que sí son texto se rellena justo debajo.
    mensaje: undefined,
    propiedadId: undefined,
    contacto: contactoDe(d),
    ...(origen ? { origen } : {}),
    ...((OPERACIONES as readonly string[]).includes(op) ? { operacionInteres: op as Operacion } : {}),
    ...(propiedadId ? { propiedadId } : {}),
    ...(mensaje ? { mensaje } : {}),
    ...(llegada && salida
      ? { fechas: { llegada, salida, ...(Number.isInteger(huespedes) && huespedes > 0 ? { huespedes } : {}) } }
      : {}),
  } as Solicitud;
}

/**
 * `actividades` — colección top-level POLIMÓRFICA (OD5): motor de seguimiento CRM + calendario de
 * GESTIÓN. Un scheduled CF barre `proximoPaso`/vencimientos y dispara recordatorios email/WhatsApp al admin.
 */
export const TIPOS_ACTIVIDAD = ['LLAMADA', 'WHATSAPP', 'EMAIL', 'VISITA', 'MUESTRA', 'RECORDATORIO'] as const;
export type TipoActividad = (typeof TIPOS_ACTIVIDAD)[number];

export const ESTADOS_ACTIVIDAD = ['PENDIENTE', 'EN CURSO', 'HECHO', 'CERRADO'] as const;
export type EstadoActividad = (typeof ESTADOS_ACTIVIDAD)[number];

export type Prioridad = 'baja' | 'media' | 'alta';
export type RefActividad = 'lead' | 'expediente' | 'contrato' | 'propiedad';

export interface Actividad extends Versioned, Auditable {
  id: string;
  refType: RefActividad;
  refId: string;
  tipo: TipoActividad;
  estado: EstadoActividad;
  prioridad: Prioridad;
  resultado?: string;
  proximoPaso?: ISODate; // el scheduled CF barre esto
  responsable?: string;
  nota?: string;
}
