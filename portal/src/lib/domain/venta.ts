/*
 * PIPELINE DE VENTA — las 7 etapas de una compraventa de inmueble (Ola 2 · GESTIÓN v2).
 *
 * ⚖️ LA REGLA QUE GOBIERNA TODO ESTE ARCHIVO, y la razón de que exista:
 * **en Colombia la venta NO se perfecciona con la escritura, sino con el REGISTRO.** El artículo 756
 * del Código Civil dice que la tradición del dominio de los bienes raíces se efectúa por la
 * INSCRIPCIÓN del título en la Oficina de Registro de Instrumentos Públicos. Entre firmar en notaría
 * y quedar inscrito hay días —a veces semanas— en los que el vendedor sigue siendo el dueño de
 * registro: puede caer un embargo, puede registrarse otro título antes. Un tablero que pinte
 * «VENDIDO» el día de la notaría le está diciendo al equipo que suelte una operación que todavía
 * puede torcerse. Aquí `vendida()` es cierto SOLO en `registro`, y ninguna otra parte del sistema
 * puede opinar distinto.
 *
 * OTRAS DOS DECISIONES QUE NO SON DE ORDEN, SINO DE FONDO:
 *
 * · **El estudio de títulos va ANTES de la promesa, no después.** Firmar la promesa crea
 *   obligaciones y suele traer arras; descubrir después que hay una hipoteca, una limitación de
 *   dominio o una sucesión sin liquidar convierte un hallazgo barato en una pérdida cara. Por eso el
 *   estudio no se puede saltar, aunque la promesa sí.
 *
 * · **Retroceder se puede, pero deja rastro y exige motivo.** Un pipeline donde una operación
 *   retrocede en silencio esconde justo lo que hay que ver: qué se cayó y por qué. El motivo no es
 *   burocracia — es lo único que explica, seis meses después, por qué esa venta tardó el doble.
 *
 * Módulo PURO: sin Firestore, sin relojes implícitos. Todo lo que decide entra por parámetro.
 */

import type { Auditable, ISODate, Versioned } from './shared';
import type { TipoDocumento } from './documentos';

/**
 * LAS SIETE ETAPAS, en el orden real de una compraventa colombiana. El orden del arreglo ES el orden
 * del proceso: se usa para comparar avance, así que no se reordena sin pensar qué se rompe.
 */
export const ETAPAS = [
  'interes',
  'oferta',
  'estudio-titulos',
  'promesa',
  'credito',
  'escritura',
  'registro',
] as const;
export type Etapa = (typeof ETAPAS)[number];

/** Cómo se llama cada etapa en pantalla. */
export const NOMBRE_ETAPA: Record<Etapa, string> = {
  interes: 'Interés',
  oferta: 'Oferta',
  'estudio-titulos': 'Estudio de títulos',
  promesa: 'Promesa de compraventa',
  credito: 'Crédito o recursos',
  escritura: 'Escritura pública',
  registro: 'Registro en la ORIP',
};

/**
 * Qué significa cada etapa, en una frase que sirva para decidir. Se enseña bajo el nombre: un
 * tablero cuyas columnas hay que preguntar qué quieren decir no es un tablero, es un examen.
 */
export const QUE_ES: Record<Etapa, string> = {
  interes: 'Hay un comprador interesado. Todavía no hay cifra sobre la mesa.',
  oferta: 'Hay una oferta formal con precio. Puede aceptarse, contraofertarse o caerse.',
  'estudio-titulos': 'Se está revisando la tradición del inmueble antes de comprometer a nadie.',
  promesa: 'Promesa de compraventa firmada, con plazos y arras.',
  credito: 'El comprador está gestionando el desembolso o reuniendo los recursos.',
  escritura: 'Escritura pública firmada en notaría. ⚠️ Todavía NO es dueño.',
  registro: 'Inscrita en la ORIP. Aquí, y solo aquí, la venta está hecha.',
};

/**
 * Etapas que se pueden SALTAR, y por qué solo estas dos:
 * · `promesa` — se puede ir directo a escritura cuando no hay plazo que asegurar.
 * · `credito` — no aplica si la compra es de contado.
 * `estudio-titulos` y `registro` NO son saltables: el primero es lo que evita comprar un problema,
 * y el segundo es lo único que transfiere la propiedad.
 */
export const SALTABLES: readonly Etapa[] = ['promesa', 'credito'];

/**
 * DOCUMENTOS QUE SOSTIENEN CADA ETAPA. Una etapa sin su soporte es una casilla marcada, no un hecho:
 * es exactamente la diferencia entre un tablero que informa y uno que tranquiliza.
 */
export const SOPORTES: Record<Etapa, readonly TipoDocumento[]> = {
  interes: [],
  oferta: ['cedula-comprador'],
  'estudio-titulos': ['certificado-tradicion', 'estudio-titulos'],
  promesa: ['promesa-compraventa'],
  credito: [],
  escritura: ['escritura-publica', 'paz-y-salvo'],
  registro: ['certificado-tradicion'],
};

export interface CambioDeEtapa {
  de: Etapa | null;
  a: Etapa;
  cuando: ISODate;
  /** Quién la movió. Lo pone el servidor con el uid del token, nunca el formulario. */
  porUid: string;
  /** Obligatorio al RETROCEDER. Es lo único que explica después por qué se cayó. */
  motivo?: string;
}

export interface Venta extends Versioned, Auditable {
  id: string;
  expedienteId: string;
  propiedadId: string;
  compradorNombre: string;
  /** En pesos. Es un DATO que se registra, no un cobro: el rail de dinero es otra cosa (Ola 2.1). */
  precioOfrecido?: number;
  precioAcordado?: number;
  etapa: Etapa;
  historial: CambioDeEtapa[];
  notaria?: string;
  /** Matrícula inmobiliaria del folio en la ORIP. */
  folioMatricula?: string;
  cerradaEn?: ISODate;
}

/** Posición de una etapa en el proceso. −1 si no es una etapa conocida. */
export const posicion = (e: Etapa): number => ETAPAS.indexOf(e);

/**
 * ¿Está VENDIDA? Solo en `registro`. Es la función que cualquier otra parte del sistema debe
 * preguntar en vez de comparar contra `'escritura'` por su cuenta — un solo sitio que lo sepa.
 */
export const vendida = (v: Pick<Venta, 'etapa'>): boolean => v.etapa === 'registro';

/**
 * ¿Se puede mover de `de` a `a`? Devuelve la lista de problemas; vacía = sí.
 *
 * Reglas, en orden de dureza:
 * 1. Avanzar más de un escalón solo vale si TODOS los que se saltan son saltables.
 * 2. Retroceder exige motivo escrito.
 * 3. Desde `registro` no se mueve nada: la propiedad ya cambió de manos, y deshacer eso no es un
 *    cambio de estado en un tablero — es otra escritura.
 */
export function problemasAlMover(
  de: Etapa,
  a: Etapa,
  opciones: { motivo?: string } = {},
): string[] {
  const problemas: string[] = [];
  const pd = posicion(de);
  const pa = posicion(a);

  if (pd < 0 || pa < 0) return ['etapa-desconocida'];
  if (pd === pa) return ['sin-cambio'];

  if (de === 'registro') problemas.push('registro-es-final');

  if (pa > pd) {
    const saltadas = ETAPAS.slice(pd + 1, pa);
    const noSaltables = saltadas.filter((e) => !SALTABLES.includes(e));
    if (noSaltables.length > 0) problemas.push(`no-se-puede-saltar:${noSaltables.join(',')}`);
  } else if (!opciones.motivo?.trim()) {
    problemas.push('retroceso-sin-motivo');
  }

  return problemas;
}

/** Los tipos de documento que le faltan a una venta para sostener la etapa en la que está. */
export function soportesFaltantes(
  etapa: Etapa,
  documentos: readonly { tipo: TipoDocumento }[],
): TipoDocumento[] {
  const hay = new Set(documentos.map((d) => d.tipo));
  return SOPORTES[etapa].filter((t) => !hay.has(t));
}

/**
 * Lo que el tablero tiene que gritar de una venta. Vacío = va bien.
 *
 * El aviso de `escritura` no es un adorno: es el único momento del proceso en que TODO parece
 * terminado y no lo está. Si el sistema calla justo ahí, calla en el peor sitio.
 */
export function avisosDe(
  v: Pick<Venta, 'etapa' | 'precioAcordado' | 'folioMatricula'>,
  documentos: readonly { tipo: TipoDocumento }[],
): string[] {
  const avisos: string[] = [];

  const faltan = soportesFaltantes(v.etapa, documentos);
  if (faltan.length > 0) avisos.push(`faltan-soportes:${faltan.join(',')}`);

  if (v.etapa === 'escritura') avisos.push('escriturada-sin-registrar');
  if (posicion(v.etapa) >= posicion('promesa') && !v.precioAcordado) {
    avisos.push('sin-precio-acordado');
  }
  if (v.etapa === 'registro' && !v.folioMatricula) avisos.push('registrada-sin-folio');

  return avisos;
}

/** Frases de los avisos, para no repetirlas en cada plantilla. */
export const TEXTO_AVISO: Record<string, string> = {
  'escriturada-sin-registrar':
    'Firmada en notaría pero SIN registrar: la propiedad todavía no ha cambiado de dueño.',
  'sin-precio-acordado': 'Va por promesa o más adelante y no tiene precio acordado escrito.',
  'registrada-sin-folio': 'Registrada sin número de matrícula inmobiliaria.',
};

/** Texto de un aviso, con los que llevan lista dentro resueltos a algo legible. */
export function textoDeAviso(aviso: string, nombreDocumento: (t: TipoDocumento) => string): string {
  if (aviso.startsWith('faltan-soportes:')) {
    const tipos = aviso.slice('faltan-soportes:'.length).split(',') as TipoDocumento[];
    return `Falta el soporte de esta etapa: ${tipos.map(nombreDocumento).join(' y ')}.`;
  }
  return TEXTO_AVISO[aviso] ?? aviso;
}

/**
 * Cuánto ha avanzado, de 0 a 1. Se calcula sobre la POSICIÓN, no sobre las etapas cumplidas: una
 * venta de contado que se saltó el crédito no está «menos avanzada» por haberse saltado un paso que
 * no le tocaba.
 */
export const avance = (etapa: Etapa): number => posicion(etapa) / (ETAPAS.length - 1);

/**
 * Registra el cambio de etapa. Devuelve la venta nueva; NO muta la que recibe — el llamador decide
 * si la guarda, y una función que muta lo que le prestan hace imposible probar el rechazo.
 */
export function moverEtapa(
  v: Venta,
  a: Etapa,
  ctx: { cuando: ISODate; porUid: string; motivo?: string },
): { ok: true; venta: Venta } | { ok: false; problemas: string[] } {
  const problemas = problemasAlMover(v.etapa, a, { motivo: ctx.motivo });
  if (problemas.length > 0) return { ok: false, problemas };

  const cambio: CambioDeEtapa = {
    de: v.etapa,
    a,
    cuando: ctx.cuando,
    porUid: ctx.porUid,
    ...(ctx.motivo?.trim() ? { motivo: ctx.motivo.trim() } : {}),
  };

  return {
    ok: true,
    venta: {
      ...v,
      etapa: a,
      historial: [...v.historial, cambio],
      ...(a === 'registro' ? { cerradaEn: ctx.cuando } : {}),
      _version: v._version + 1,
    },
  };
}
