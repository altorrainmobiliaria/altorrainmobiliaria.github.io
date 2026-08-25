/*
 * PERFIL DE INQUILINO REUTILIZABLE 1→N — Fase 0 (Ola 2 · MEGA-PLAN item 3, §152).
 *
 * QUÉ RESUELVE, en una frase: **hoy un arrendatario entrega la misma carpeta de papeles en cada
 * inmueble al que aspira**, y en cada uno le vuelven a pedir lo mismo, le vuelven a pedir un
 * codeudor y le vuelven a cobrar un «estudio». Aquí sube sus documentos UNA vez, y decide a qué
 * postulaciones se muestran.
 *
 * ⚖️ TRES LÍMITES LEGALES QUE DAN FORMA AL MODELO, y no son detalles:
 *
 * 1. **NO se consulta a ninguna central de riesgo.** No por pudor: sin contrato con DataCrédito o
 *    TransUnion, consultar a una persona no es una opción cara — es ilegal (gate B-04, `42-LEGAL`).
 *    Por eso este perfil NO tiene puntaje crediticio y no lo tendrá hasta que ese contrato exista.
 *    Lo que hay es verificación DOCUMENTAL con revisión humana, que es otra cosa y se dice como es.
 *
 * 2. **Al aspirante no se le cobra NADA.** El art. 16 de la Ley 820 prohíbe depósitos y cauciones al
 *    arrendatario de vivienda, incluso «bajo denominaciones diferentes», y la lectura dominante mete
 *    ahí el mal llamado «estudio de documentos». El modelo de ingresos vive del lado del propietario
 *    ([[§147]] lo explica en público). Si algún día alguien quiere cobrar aquí, tendrá que cambiar
 *    esta línea a propósito.
 *
 * 3. **Son SUS datos, no los de un tercero.** A diferencia de la bóveda del expediente (§142), aquí
 *    el titular es quien sube: el consentimiento es directo. Pero la Ley 1581 sigue pidiendo
 *    finalidad y caducidad — un perfil que se queda para siempre es tratar sin necesidad. Por eso
 *    caduca, y la caducidad se calcula, no se recuerda.
 *
 * Módulo PURO: sin Firestore, sin relojes implícitos. `hoy` entra por parámetro.
 */

import type { Auditable, ISODate, Versioned } from './shared';

/**
 * DOCUMENTOS QUE PIDE EL PERFIL. Lista cerrada y CORTA a propósito: cada papel que se añade es una
 * persona menos que termina. Lo que se pide es lo que de verdad se mira.
 */
export const REQUISITOS = ['cedula', 'ingresos', 'laboral', 'referencia'] as const;
export type Requisito = (typeof REQUISITOS)[number];

export const NOMBRE_REQUISITO: Record<Requisito, string> = {
  cedula: 'Documento de identidad',
  ingresos: 'Soporte de ingresos',
  laboral: 'Certificación laboral o de actividad',
  referencia: 'Referencia de arriendo anterior',
};

/** Qué vale como soporte de cada uno, dicho antes de que la persona suba lo que no era. */
export const QUE_SIRVE: Record<Requisito, string> = {
  cedula: 'Cédula por ambas caras, o el documento de identidad vigente si es extranjero.',
  ingresos: 'Últimos tres desprendibles de nómina, o extractos bancarios de tres meses si es independiente.',
  laboral: 'Certificación laboral con cargo y antigüedad, o el RUT y la declaración si trabaja por su cuenta.',
  referencia: 'Datos del arrendador anterior. Si es su primer arriendo, se dice y no pasa nada.',
};

/**
 * NO todos son obligatorios. La referencia de arriendo anterior no lo es —quien arrienda por primera
 * vez no puede tenerla, y exigírsela sería cerrarle la puerta por ser joven—.
 */
export const OBLIGATORIOS: readonly Requisito[] = ['cedula', 'ingresos', 'laboral'];

/**
 * Los estados del perfil, en orden. `observaciones` NO es un rechazo: es la vuelta a la persona con
 * lo que falta. Un sistema que solo sabe decir «no» obliga a empezar de cero por una foto borrosa.
 */
export const ESTADOS = ['borrador', 'enviado', 'revisando', 'observaciones', 'verificado'] as const;
export type EstadoPerfil = (typeof ESTADOS)[number];

export const NOMBRE_ESTADO: Record<EstadoPerfil, string> = {
  borrador: 'En preparación',
  enviado: 'Enviado a revisión',
  revisando: 'En revisión',
  observaciones: 'Con observaciones',
  verificado: 'Verificado',
};

/** Días de SLA de la revisión humana. La promesa pública es 24 horas hábiles (MEGA-PLAN Ola 2.3). */
export const SLA_HORAS = 24;

/**
 * Cuánto dura un perfil verificado antes de pedir refresco. Seis meses: un soporte de ingresos de
 * hace un año no dice nada del presente, y guardarlo indefinidamente es tratar sin necesidad
 * (Ley 1581, minimización).
 */
export const VIGENCIA_DIAS = 180;

export interface SoportePerfil {
  requisito: Requisito;
  /** Ruta en el bucket privado. La pone el servidor, nunca el formulario (mismo criterio que §142). */
  claveStorage: string;
  nombreArchivo: string;
  subidoEn: ISODate;
}

export interface PerfilInquilino extends Versioned, Auditable {
  id: string;
  /** uid del titular. El perfil es SUYO: nadie del equipo lo crea por él. */
  uid: string;
  nombre: string;
  email: string;
  telefono?: string;
  /** Si es su primer arriendo, la referencia deja de esperarse. Lo declara la persona. */
  primerArriendo?: boolean;
  soportes: SoportePerfil[];
  estado: EstadoPerfil;
  enviadoEn?: ISODate;
  verificadoEn?: ISODate;
  /** Lo que le falta, escrito por quien revisó. Va de vuelta a la persona, no a un archivo. */
  observaciones?: string;
  /** Consentimiento del titular (Ley 1581 art. 9). Sin esto el perfil no se envía. */
  autorizaTratamiento?: boolean;
}

/** Qué requisitos le faltan al perfil, contando que la referencia puede no aplicar. */
export function faltantes(p: Pick<PerfilInquilino, 'soportes' | 'primerArriendo'>): Requisito[] {
  const hay = new Set(p.soportes.map((s) => s.requisito));
  const exigidos = p.primerArriendo ? OBLIGATORIOS : [...OBLIGATORIOS, 'referencia' as Requisito];
  return exigidos.filter((r) => !hay.has(r));
}

/**
 * Problemas que impiden ENVIAR el perfil a revisión. Vacío = se puede enviar.
 *
 * Vive en el dominio y no en el formulario ni en la Function porque las tres cosas tienen que
 * decidir lo mismo ([[L-45]]).
 */
export function problemasParaEnviar(p: Partial<PerfilInquilino>): string[] {
  const problemas: string[] = [];
  if (!p.nombre?.trim()) problemas.push('sin-nombre');
  if (!p.email?.trim()) problemas.push('sin-email');
  if (!p.autorizaTratamiento) problemas.push('sin-autorizacion');
  const faltan = faltantes({ soportes: p.soportes ?? [], primerArriendo: p.primerArriendo });
  if (faltan.length) problemas.push(`faltan:${faltan.join(',')}`);
  return problemas;
}

export const EXPLICA: Record<string, string> = {
  'sin-nombre': 'Falta tu nombre completo.',
  'sin-email': 'Falta tu correo: es por donde te avisamos del resultado.',
  'sin-autorizacion': 'Falta tu autorización para tratar tus datos (Ley 1581, art. 9).',
  'no-es-tuyo': 'Un perfil solo lo puede enviar su titular.',
  'ya-enviado': 'Este perfil ya está en revisión.',
  'sin-observaciones': 'Para devolver un perfil hay que escribir qué falta.',
  'estado-desconocido': 'Ese estado no existe.',
};

export function explicar(codigo: string): string {
  if (codigo.startsWith('faltan:')) {
    const rs = codigo.slice('faltan:'.length).split(',') as Requisito[];
    return `Falta subir: ${rs.map((r) => NOMBRE_REQUISITO[r] ?? r).join(', ')}.`;
  }
  return EXPLICA[codigo] ?? codigo;
}

const DIA = 86_400_000;
const dia = (iso: string) => Date.parse(iso.slice(0, 10) + 'T00:00:00.000Z');

/**
 * Días que lleva esperando una revisión, contados por DÍA y no por instante: la promesa se cuenta
 * como la cuenta la persona que espera. Devuelve 0 si todavía no se ha enviado.
 */
export function diasEsperando(p: Pick<PerfilInquilino, 'estado' | 'enviadoEn'>, hoy: ISODate): number {
  if (!p.enviadoEn || (p.estado !== 'enviado' && p.estado !== 'revisando')) return 0;
  return Math.max(0, Math.round((dia(hoy) - dia(p.enviadoEn)) / DIA));
}

/** ¿Se pasó el SLA de revisión? Se compara en días porque el SLA se promete en horas hábiles. */
export const slaVencido = (p: Pick<PerfilInquilino, 'estado' | 'enviadoEn'>, hoy: ISODate): boolean =>
  diasEsperando(p, hoy) >= Math.ceil(SLA_HORAS / 24) + 1;

/**
 * ¿Sigue vigente un perfil verificado? Un soporte de ingresos de hace un año no dice nada del
 * presente, y conservarlo sin necesidad es lo que la ley llama tratar de más.
 */
export function vigente(p: Pick<PerfilInquilino, 'estado' | 'verificadoEn'>, hoy: ISODate): boolean {
  if (p.estado !== 'verificado' || !p.verificadoEn) return false;
  return (dia(hoy) - dia(p.verificadoEn)) / DIA < VIGENCIA_DIAS;
}

/** Cuántos días le quedan de vigencia. Negativo = ya caducó. */
export const diasDeVigencia = (p: Pick<PerfilInquilino, 'verificadoEn'>, hoy: ISODate): number =>
  p.verificadoEn ? VIGENCIA_DIAS - Math.round((dia(hoy) - dia(p.verificadoEn)) / DIA) : 0;

/**
 * Transiciones permitidas. Es un mapa y no una cadena de `if` porque quién puede pasar a qué es la
 * regla entera: leerla de un vistazo es el punto.
 *
 * `verificado → borrador` existe a propósito: cuando el perfil caduca, vuelve a manos de su dueño
 * para que lo refresque. No se borra ni se queda «verificado» mintiendo.
 */
export const TRANSICIONES: Record<EstadoPerfil, readonly EstadoPerfil[]> = {
  borrador: ['enviado'],
  enviado: ['revisando', 'observaciones', 'verificado'],
  revisando: ['observaciones', 'verificado'],
  observaciones: ['enviado'],
  verificado: ['borrador'],
};

/** ¿Puede pasar de `de` a `a`? Devuelve los problemas; vacío = sí. */
export function problemasAlCambiar(
  de: EstadoPerfil,
  a: EstadoPerfil,
  opciones: { observaciones?: string } = {},
): string[] {
  if (!ESTADOS.includes(de) || !ESTADOS.includes(a)) return ['estado-desconocido'];
  if (!TRANSICIONES[de].includes(a)) return [`no-se-puede:${de}->${a}`];
  // Devolver sin decir qué falta convierte la revisión en un «no» sin salida.
  if (a === 'observaciones' && !opciones.observaciones?.trim()) return ['sin-observaciones'];
  return [];
}
