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
  leadScore?: number; // server-side
  leadTier?: LeadTier; // server-side
  nurturing?: { nextEmailAt?: ISODate; secuencia?: string };
  slaVencimiento?: ISODate; // proceso SLA del dueño (R4)
  responsable?: string;
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
