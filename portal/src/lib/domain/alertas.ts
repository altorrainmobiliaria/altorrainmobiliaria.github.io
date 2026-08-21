/*
 * ALERTAS GUARDADAS + DIGEST DIARIO — ítem 8 de OLA 1 (MEGA-PLAN).
 *
 * QUÉ ES: un visitante que hoy no encuentra lo que busca deja su correo con los criterios de su
 * búsqueda; una vez al día le llega UN correo con lo que entró al catálogo desde la última vez.
 * Solo-email por decisión del plan (nada de SMS ni push: cero costo variable, cero permisos).
 *
 * POR QUÉ ESTE ARCHIVO EXISTE (y por qué la lógica no vive en la Function):
 * lo usan LOS DOS lados —`pages/api/alerta.ts` para crear y validar, y la Cloud Function
 * `alertasDigest` para decidir qué se envía—. Si el matching viviera en la Function, la web podría
 * aceptar criterios que el digest nunca sabría interpretar, y ese desajuste no da error: da silencio.
 * Es el mismo patrón que `catalogo.ts` (§57): lógica PURA aquí, plomería allá.
 *
 * COSTO (free-tier, §3.2): el digest NO barre `propiedades`. Lee los 3 shards de `indices/catalogo-*`
 * (3 lecturas, pase lo que pase) y empareja en memoria contra las alertas activas. El costo crece con
 * las alertas, no con el catálogo, y una alerta son ~0.3 KB.
 */

import type { COP, ISODate, Operacion, TipoInmueble } from './shared';
import { OPERACIONES, TIPOS_INMUEBLE } from './shared';
import type { CatalogoResumen } from './catalogo';
import type { PruebaConsentimiento } from '../config/legal';

// ─────────────────────────────────────────────────────────────────────────────
// CONTRATO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Criterios de una alerta. Vocabulario DELIBERADAMENTE igual al de la SERP: la alerta nace del botón
 * «Guardar búsqueda» de `/comprar` y `/arrendar`, así que lo que el visitante ve filtrado es
 * exactamente lo que queda guardado. Un vocabulario paralelo habría hecho que la alerta prometiera
 * una búsqueda distinta de la que estaba mirando.
 *
 * Listas VACÍAS significan «todo», no «nada». Es la lectura natural de un filtro sin marcar; la
 * contraria dejaría alertas que jamás disparan sin que nadie se entere.
 */
export interface CriteriosAlerta {
  operacion: Operacion;
  tipos: TipoInmueble[];
  zonas: string[];
  precioMin: COP | null;
  precioMax: COP | null;
  habMin: number | null;
}

/** Estado de una alerta. `baja` es DEFINITIVO: el documento se conserva como prueba de la revocación. */
export type EstadoAlerta = 'activa' | 'baja';

/**
 * Documento de la colección `alertas`.
 *
 * `token` es el secreto de la baja: viaja SOLO en el enlace del correo y jamás se expone en una
 * lectura pública (las Rules deniegan `get` y `list` a quien no sea staff). Sin él, conocer el id
 * bastaría para dar de baja a otra persona.
 */
export interface Alerta {
  email: string;
  criterios: CriteriosAlerta;
  estado: EstadoAlerta;
  token: string;
  consentimiento: PruebaConsentimiento;
  /** Frontera de novedad: solo se envía lo publicado DESPUÉS de esta marca. Al crear = fecha de alta. */
  ultimoEnvio: ISODate;
  /** Cuántos correos se han enviado. Sirve para detectar una alerta que nunca dispara. */
  enviados: number;
  createdAt: ISODate;
  updatedAt: ISODate;
  _version: number;
}

/**
 * Petición de BAJA (colección `bajasAlertas`), append-only.
 *
 * POR QUÉ UNA COLECCIÓN Y NO UN UPDATE: la postura del portal es que toda escritura de estado pasa
 * por Cloud Functions (`firebase/README`), y una regla que dejara al público editar `alertas` tendría
 * que permitir un update sobre un documento que ese mismo público no puede leer para comprobar el
 * token. Un append con validación estricta es el permiso MÁS PEQUEÑO que resuelve el caso, y de paso
 * deja rastro de la revocación, que es justo lo que la Ley 1581 art. 8 espera poder demostrar.
 *
 * Efecto: la baja se aplica en la siguiente corrida del digest, o sea ANTES del próximo correo. Para
 * el titular el resultado es el prometido: no vuelve a recibir nada.
 */
export interface BajaAlerta {
  alertaId: string;
  token: string;
  createdAt: ISODate;
  aplicada?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPES (los números que protegen el free-tier y la reputación de envío)
// ─────────────────────────────────────────────────────────────────────────────

/** Alertas que lee una corrida. `limit()` es obligatorio (§3.2); si se toca el tope, el digest lo REPORTA. */
export const TOPE_ALERTAS_POR_CORRIDA = 500;
/**
 * Correos por corrida. Resend regala 100 al día (verificado, ADR §16) y se deja margen para lo
 * transaccional del mismo día. Lo que no entra NO se pierde: conserva su `ultimoEnvio` y sale mañana.
 */
export const TOPE_CORREOS_POR_CORRIDA = 90;
/** Inmuebles por correo. Más que esto nadie lo lee: el resto va como enlace a la búsqueda. */
export const TOPE_ITEMS_POR_CORREO = 6;
/** Zonas y tipos por alerta. Cota dura contra un POST que intente inflar el documento. */
export const TOPE_FACETAS = 8;

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZACIÓN — la ÚNICA puerta de entrada de criterios (form y query comparten esta función)
// ─────────────────────────────────────────────────────────────────────────────

function num(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  // Acepta «1.450.000.000», «1450000000» y «1 450 000». Los separadores de miles son lo que la gente
  // escribe de verdad; rechazarlos habría convertido un precio válido en «sin límite» sin avisar.
  const limpio = v.replace(/[^\d]/g, '');
  if (!limpio) return null;
  const n = Number(limpio);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Normaliza para COMPARAR, no para mostrar: sin tildes, sin mayúsculas, sin espacios de sobra. */
export function clave(s: string): string {
  return s
    .normalize('NFD')
    // `\p{Mn}` (marcas sin espaciado) en vez de un rango de code points escrito a mano: NFD separa
    // «á» en «a» + tilde combinante, y esta clase se lleva la tilde sin listar rangos ilegibles.
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** Ruta pública (/comprar · /arrendar · /estancias) a operación del dominio. */
export function rutaAOperacion(ruta: string): Operacion | null {
  const r = clave(ruta).replace(/^\//, '');
  if (r === 'comprar' || r === 'venta') return 'venta';
  if (r === 'arrendar' || r === 'arriendo') return 'arriendo';
  if (r === 'estancias' || r === 'alojamiento' || r === 'dias') return 'alojamiento';
  return null;
}

/** Operación a ruta pública. Es la inversa de `rutaAOperacion` y alimenta el enlace «ver todo». */
export function operacionARuta(op: Operacion): string {
  return op === 'venta' ? '/comprar' : op === 'arriendo' ? '/arrendar' : '/estancias';
}

/** Etiqueta de la operación para el asunto y el cuerpo del correo. */
export function etiquetaOperacion(op: Operacion): string {
  return op === 'venta' ? 'en venta' : op === 'arriendo' ? 'en arriendo' : 'por días';
}

/** Tipo del dominio a cómo lo dice una persona. */
export function etiquetaTipo(t: TipoInmueble): string {
  const m: Record<TipoInmueble, string> = {
    apartamento: 'Apartamentos',
    casa: 'Casas',
    apartaestudio: 'Apartaestudios',
    local: 'Locales',
    oficina: 'Oficinas',
    bodega: 'Bodegas',
    lote: 'Lotes',
    finca: 'Fincas',
    casa_lote: 'Casas lote',
    consultorio: 'Consultorios',
    edificio: 'Edificios',
    otro: 'Inmuebles',
  };
  return m[t] ?? 'Inmuebles';
}

/**
 * Convierte campos crudos (query string de la SERP o `<form>`) en criterios válidos.
 *
 * Lo que no reconoce se DESCARTA en vez de rechazarse: un criterio raro en la URL no puede impedir
 * que alguien deje su alerta. Lo único que no se puede descartar es la operación, porque sin ella la
 * alerta no sabe contra qué shard mirar; ahí el valor por defecto es `venta`, que es la ruta de la
 * que llega la mayoría.
 */
export function normalizarCriterios(campos: Record<string, unknown>): CriteriosAlerta {
  const opRaw = typeof campos.operacion === 'string' ? campos.operacion : '';
  const opClave = clave(opRaw);
  const operacion: Operacion = (OPERACIONES as readonly string[]).includes(opClave)
    ? (opClave as Operacion)
    : rutaAOperacion(opRaw) ?? 'venta';

  const lista = (v: unknown): string[] =>
    (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [])
      .map((x) => String(x).trim())
      .filter(Boolean)
      .slice(0, TOPE_FACETAS);

  const tipos = lista(campos.tipos ?? campos.tipo)
    .map((t) => clave(t))
    .filter((t): t is TipoInmueble => (TIPOS_INMUEBLE as readonly string[]).includes(t));

  // Las zonas NO se validan contra una allow-list a propósito: el censo de barrios de Cartagena es
  // más grande que las 13 landings de `zonas.ts`, y una alerta de un barrio que todavía no tiene
  // landing es legítima. Lo que sí se hace es acotar longitud y limpiar, que es el riesgo real.
  const zonas = [...new Set(lista(campos.zonas ?? campos.zona).map((z) => z.slice(0, 40)))];

  let precioMin = num(campos.precioMin);
  let precioMax = num(campos.precioMax);
  // Rango invertido: se corrige en vez de rechazarse. Quien escribe 500 en «desde» y 300 en «hasta»
  // quiere el rango 300 a 500, y devolverle un error por eso es perder la alerta.
  if (precioMin != null && precioMax != null && precioMin > precioMax) {
    const t = precioMin;
    precioMin = precioMax;
    precioMax = t;
  }

  const hab = num(campos.habMin);
  const habMin = hab != null && hab > 0 ? Math.min(Math.round(hab), 10) : null;

  return { operacion, tipos, zonas, precioMin, precioMax, habMin };
}

/** Criterios a query string, para reconstruir la búsqueda desde el correo o el enlace de la SERP. */
export function criteriosAQuery(c: CriteriosAlerta): string {
  const p = new URLSearchParams();
  p.set('operacion', c.operacion);
  if (c.tipos.length) p.set('tipos', c.tipos.join(','));
  if (c.zonas.length) p.set('zonas', c.zonas.join(','));
  if (c.precioMin != null) p.set('precioMin', String(c.precioMin));
  if (c.precioMax != null) p.set('precioMax', String(c.precioMax));
  if (c.habMin != null) p.set('habMin', String(c.habMin));
  return p.toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// MATCHING — lógica pura: la parte que decide si un inmueble le interesa a alguien
// ─────────────────────────────────────────────────────────────────────────────

/** ¿Este resumen del catálogo cumple los criterios? Listas vacías = sin restricción. */
export function coincide(c: CriteriosAlerta, r: CatalogoResumen): boolean {
  if (r.operacion !== c.operacion) return false;
  if (c.tipos.length && !c.tipos.includes(r.tipo)) return false;
  if (c.zonas.length && !c.zonas.some((z) => clave(z) === clave(r.sector ?? ''))) return false;
  if (c.precioMin != null && r.precio < c.precioMin) return false;
  if (c.precioMax != null && r.precio > c.precioMax) return false;
  // `hab` es opcional en el resumen. Un inmueble SIN el dato no se cuela en una alerta que pide un
  // mínimo: prometer 3 habitaciones y mandar algo que no sabemos si las tiene es peor que no mandar.
  if (c.habMin != null && (r.hab == null || r.hab < c.habMin)) return false;
  return true;
}

/**
 * Novedades para UNA alerta: lo que coincide y además entró al catálogo después de `desde`.
 *
 * Ordena por publicación descendente (lo más nuevo arriba) y recorta al tope del correo. Devuelve
 * también el TOTAL sin recortar, porque el correo dice «y N más» y ese número tiene que ser cierto.
 */
export function seleccionarNovedades(
  c: CriteriosAlerta,
  items: readonly CatalogoResumen[],
  desde: ISODate,
): { items: CatalogoResumen[]; total: number } {
  const corte = Date.parse(desde);
  if (!Number.isFinite(corte)) return { items: [], total: 0 };

  const nuevas = items
    .filter((r) => coincide(c, r))
    .filter((r) => {
      const t = Date.parse(r.pub ?? '');
      // Sin fecha utilizable NO cuenta como novedad: sin corte fiable, cada corrida lo reenviaría.
      return Number.isFinite(t) && t > corte;
    })
    .sort((a, b) => Date.parse(b.pub) - Date.parse(a.pub));

  return { items: nuevas.slice(0, TOPE_ITEMS_POR_CORREO), total: nuevas.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTO — lo que ve una persona (voz ALTORRA: directo, sin adornos, sin promesas)
// ─────────────────────────────────────────────────────────────────────────────

const COP_FMT = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatoPrecio(v: COP, op: Operacion): string {
  const base = COP_FMT.format(v);
  if (op === 'arriendo') return `${base} al mes`;
  if (op === 'alojamiento') return `${base} por noche`;
  return base;
}

/** Resumen legible de los criterios. Se muestra al confirmar y encabeza cada correo. */
export function resumenCriterios(c: CriteriosAlerta): string {
  const partes: string[] = [];
  partes.push(c.tipos.length ? c.tipos.map(etiquetaTipo).join(', ') : 'Inmuebles');
  partes.push(etiquetaOperacion(c.operacion));
  partes.push(c.zonas.length ? `en ${c.zonas.join(', ')}` : 'en Cartagena');
  if (c.habMin != null) partes.push(`desde ${c.habMin} habitaciones`);
  if (c.precioMin != null && c.precioMax != null) {
    partes.push(`entre ${COP_FMT.format(c.precioMin)} y ${COP_FMT.format(c.precioMax)}`);
  } else if (c.precioMax != null) {
    partes.push(`hasta ${COP_FMT.format(c.precioMax)}`);
  } else if (c.precioMin != null) {
    partes.push(`desde ${COP_FMT.format(c.precioMin)}`);
  }
  return partes.join(' ');
}
