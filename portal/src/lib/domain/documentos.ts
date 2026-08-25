/*
 * DOCUMENTOS DEL EXPEDIENTE — la bóveda privada (gate B5, mockup `ALTORRA Documentos`).
 *
 * ⚠️ ESTO NO ES «SUBIR ARCHIVOS». La parte que cambia algo es esta: la LISTA CANÓNICA de lo que cada
 * expediente debe tener, y la cuenta de lo que falta y lo que caduca. Sin ella, la bóveda es un cajón
 * más bonito que el WhatsApp donde hoy viven los soportes — y el dueño ya tiene ese cajón. Con ella,
 * el sistema contesta sin abrir nada la pregunta cara: *«¿qué me falta, y qué venció?»*.
 *
 * Es un módulo PURO a propósito: sin Firestore, sin Storage, sin fechas implícitas. Todo lo que
 * decide entra por parámetro —incluido `hoy`—, porque una función que lee el reloj por su cuenta no
 * se puede probar en el borde, y el borde es justo donde vive el error: el día exacto en que una
 * póliza vence.
 *
 * ⚖️ Ley 1581. Aquí hay datos de TERCEROS (cédulas de propietarios e inquilinos). Cada documento nace
 * con su `finalidad` escrita y, cuando aplica, su fecha de caducidad. Un archivo sin fecha de retiro
 * se queda para siempre, y guardar de más es exactamente lo que la ley llama tratar sin necesidad.
 */

import type { Auditable, ISODate, Versioned } from './shared';
import type { TipoContrato } from './gestion';

/** Qué clase de documento es. La lista es CERRADA: «otro» existe, pero no vale para cerrar un hueco. */
export const TIPOS_DOCUMENTO = [
  'contrato-administracion',
  'contrato-arriendo',
  'cedula-propietario',
  'cedula-arrendatario',
  'acta-entrega',
  'poliza-arrendamiento',
  'paz-y-salvo',
  'soporte-pago',
  // --- Compraventa (§151). Son documentos de la MISMA bóveda: la lista canónica es una sola,
  //     porque un expediente no tiene un cajón para arriendo y otro para venta.
  'cedula-comprador',
  'certificado-tradicion',
  'estudio-titulos',
  'promesa-compraventa',
  'escritura-publica',
  'otro',
] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

/** Cómo se llama cada tipo cuando hay que decírselo a una persona. */
export const NOMBRE_DOCUMENTO: Record<TipoDocumento, string> = {
  'contrato-administracion': 'Contrato de administración',
  'contrato-arriendo': 'Contrato de arriendo firmado',
  'cedula-propietario': 'Cédula del propietario',
  'cedula-arrendatario': 'Cédula del arrendatario',
  'acta-entrega': 'Acta de entrega',
  'poliza-arrendamiento': 'Póliza de arrendamiento',
  'paz-y-salvo': 'Paz y salvo',
  'soporte-pago': 'Soporte de pago',
  'cedula-comprador': 'Cédula del comprador',
  'certificado-tradicion': 'Certificado de tradición y libertad',
  'estudio-titulos': 'Estudio de títulos',
  'promesa-compraventa': 'Promesa de compraventa',
  'escritura-publica': 'Escritura pública',
  otro: 'Otro documento',
};

export interface Documento extends Versioned, Auditable {
  id: string;
  expedienteId: string;
  tipo: TipoDocumento;
  /** Nombre con el que se subió. Se enseña; NO se usa para construir la ruta (§B5.2). */
  nombreArchivo: string;
  /** Ruta en el bucket privado. La pone el servidor, nunca el formulario. */
  claveStorage: string;
  bytes: number;
  contentType: string;
  /** Para qué se guarda. Obligatorio: Ley 1581 art. 9 pide finalidad, no «por si acaso». */
  finalidad: string;
  /** Caducidad, si la tiene. Es lo que hace posible avisar ANTES. */
  vence?: ISODate;
  /** Cuántos días antes avisar. Por defecto `AVISO_DIAS`. */
  avisarDias?: number;
  /** Retirado ≠ borrado: deja de estar a la vista y queda constancia (§C-2 de la skill de acceso). */
  retiradoEn?: ISODate;
  retiradoPor?: string;
}

/** Días de aviso por defecto antes de que algo caduque. */
export const AVISO_DIAS = 30;

/** Tope de subida. Un escaneo de contrato cabe de sobra; un vídeo, no. */
export const TOPE_BYTES = 10 * 1024 * 1024;

/** Lo que el navegador puede mandar. PDF e imagen: es lo que sale de un escáner o de un teléfono. */
export const TIPOS_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * LA LISTA CANÓNICA — qué exige cada clase de expediente
 * ─────────────────────────────────────────────────────────────────────────────
 * Sale de la operación real del dueño (destilado R4) pasada por el filtro profesional que manda el
 * MEGA-PLAN §3b: no se digitaliza el olvido. Un expediente de ADMINISTRACIÓN sin el contrato de
 * administración escaneado es un cobro de honorarios sin título; uno de ARRIENDO sin acta de entrega
 * es una discusión garantizada el día que se devuelve el inmueble.
 *
 * La póliza NO está en los obligatorios: en vivienda urbana la garantía admite varias formas y el
 * depósito en dinero está PROHIBIDO (art. 16, Ley 820 · OD9). Exigir una póliza a todos convertiría
 * una opción legítima en un requisito inventado. Cuando existe, se vigila su caducidad — eso sí.
 */
export const EXIGIDOS: Record<TipoContrato, readonly TipoDocumento[]> = {
  administracion: ['contrato-administracion', 'cedula-propietario'],
  arriendo: ['contrato-arriendo', 'cedula-arrendatario', 'acta-entrega'],
};

/** Un documento cuenta si existe y NO está retirado. Un retirado no cierra un hueco. */
export const vigente = (d: Documento): boolean => !d.retiradoEn;

/**
 * Qué falta en un expediente, dados los contratos que tiene.
 *
 * Se pasan los TIPOS de contrato y no el expediente entero porque un mismo expediente puede tener los
 * dos (administración y arriendo del mismo inmueble) y entonces exige la unión de ambos. Devolver la
 * lista en el orden de `EXIGIDOS` no es casual: la pantalla los enseña así y un orden que cambia entre
 * cargas se lee como un error.
 */
export function faltantes(docs: readonly Documento[], contratos: readonly TipoContrato[]): TipoDocumento[] {
  const hay = new Set(docs.filter(vigente).map((d) => d.tipo));
  const pedidos: TipoDocumento[] = [];
  for (const c of contratos) {
    for (const t of EXIGIDOS[c]) if (!pedidos.includes(t)) pedidos.push(t);
  }
  return pedidos.filter((t) => !hay.has(t));
}

export interface Caducidad {
  documento: Documento;
  /** Días que faltan. NEGATIVO si ya venció — el signo es la información. */
  dias: number;
  vencido: boolean;
}

/**
 * Lo que caduca pronto o ya caducó.
 *
 * ⚠️ Se compara por DÍA CALENDARIO, no por instante. Con horas de por medio, una póliza que vence
 * «hoy» sale a veces con 0 días y a veces con -1 según la hora a la que se mire el tablero, y un
 * número que cambia solo destruye la confianza en la pantalla entera.
 */
export function porVencer(docs: readonly Documento[], hoy: ISODate, dentroDeDias = AVISO_DIAS): Caducidad[] {
  const hoyDia = Date.parse(hoy.slice(0, 10));
  if (!Number.isFinite(hoyDia)) return [];

  const out: Caducidad[] = [];
  for (const d of docs) {
    if (!vigente(d) || !d.vence) continue;
    const vence = Date.parse(d.vence.slice(0, 10));
    if (!Number.isFinite(vence)) continue;
    const dias = Math.round((vence - hoyDia) / 86_400_000);
    const umbral = d.avisarDias ?? dentroDeDias;
    if (dias <= umbral) out.push({ documento: d, dias, vencido: dias < 0 });
  }
  // Lo más urgente primero: lo ya vencido arriba, y dentro de eso lo que lleva más tiempo vencido.
  return out.sort((a, b) => a.dias - b.dias);
}

export type ProblemaDocumento =
  | 'sin-expediente'
  | 'sin-tipo'
  | 'sin-archivo'
  | 'sin-finalidad'
  | 'tipo-no-admitido'
  | 'demasiado-grande'
  | 'vence-en-el-pasado';

/**
 * Lo que hace inválido un documento. Se valida el DOCUMENTO RESULTANTE, no el formulario: es la misma
 * trampa de §118 — juzgar el parche deja pasar lo que no trae nada.
 */
export function problemasDeDocumento(d: Partial<Documento>, hoy?: ISODate): ProblemaDocumento[] {
  const out: ProblemaDocumento[] = [];
  if (!d.expedienteId?.trim()) out.push('sin-expediente');
  if (!d.tipo || !TIPOS_DOCUMENTO.includes(d.tipo)) out.push('sin-tipo');
  if (!d.nombreArchivo?.trim() || !d.claveStorage?.trim()) out.push('sin-archivo');
  // La finalidad no admite una palabra suelta: «varios» no es una finalidad, es un hueco con texto.
  if ((d.finalidad?.trim().length ?? 0) < 8) out.push('sin-finalidad');
  if (d.contentType && !TIPOS_MIME.includes(d.contentType as (typeof TIPOS_MIME)[number])) {
    out.push('tipo-no-admitido');
  }
  if (typeof d.bytes === 'number' && d.bytes > TOPE_BYTES) out.push('demasiado-grande');
  if (d.vence && hoy && Date.parse(d.vence.slice(0, 10)) < Date.parse(hoy.slice(0, 10))) {
    out.push('vence-en-el-pasado');
  }
  return out;
}

/** Cada problema, dicho como se lo diría una persona a otra. */
export function explicarProblemaDocumento(p: ProblemaDocumento): string {
  const t: Record<ProblemaDocumento, string> = {
    'sin-expediente': 'Falta decir a qué expediente pertenece.',
    'sin-tipo': 'Falta decir qué es: contrato, cédula, acta…',
    'sin-archivo': 'No llegó el archivo.',
    'sin-finalidad': 'Escribe para qué se guarda. Es lo que exige la ley de datos, y en dos años nadie lo va a recordar.',
    'tipo-no-admitido': 'Solo se admiten PDF, JPG, PNG o WebP: es lo que sale de un escáner o de un teléfono.',
    'demasiado-grande': `El archivo pasa de ${Math.round(TOPE_BYTES / 1024 / 1024)} MB. Si es un escaneo, bájale la resolución.`,
    'vence-en-el-pasado': 'La fecha de vencimiento ya pasó. Si el documento está vencido, sube el nuevo.',
  };
  return t[p];
}

/**
 * La ruta dentro del bucket privado.
 *
 * ⚠️ **NO se usa el nombre del archivo.** Un `Cédula Juan Pérez.pdf` en la ruta pone el nombre de una
 * persona en un identificador que aparece en logs, en mensajes de error y en cualquier listado — datos
 * personales filtrándose por la puerta de atrás. Se construye con el expediente, el tipo y el id, que
 * no dicen nada de nadie. El nombre original se guarda como CAMPO, para poder enseñarlo.
 */
export const claveStorage = (expedienteId: string, tipo: TipoDocumento, id: string, ext: string): string =>
  `expedientes/${expedienteId}/${tipo}/${id}.${ext.replace(/^\./, '').toLowerCase()}`;

/** Extensión que le corresponde a cada tipo admitido. No se confía en la del nombre subido. */
export const extensionDe = (contentType: string): string =>
  ({ 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' })[contentType] ?? 'bin';
