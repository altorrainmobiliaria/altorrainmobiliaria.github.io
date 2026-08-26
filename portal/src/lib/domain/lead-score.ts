/*
 * LEAD SCORING — cuánto promete un lead, medido sin castigarlo por lo que nunca le preguntamos (§189).
 *
 * 🔴 EL DEFECTO QUE ESTE MÓDULO EXISTE PARA ARREGLAR. El scorer legacy sumaba `+10 si hay email`. El
 * formulario de `/publicar` **no pide correo** —es fiel a su mockup— así que ningún propietario podía
 * ganar esos 10 puntos **jamás**. Con el techo real de ese formulario, un propietario impecable
 * aterrizaba en `cold`. El número no estaba midiendo al lead: estaba midiendo al FORMULARIO, y
 * después alguien leía «cold» y lo trataba como si el interesado fuera tibio.
 * *Penalizar por un campo que nunca se ofreció no es medir: es descontar por una pregunta que no
 * hicimos.*
 *
 * 🔧 LA SALIDA: el formulario declara **qué PODÍA pedir** (`camposOfrecidos`) y el puntaje son **dos
 * mitades explícitas** — cuánto QUIERE (la intención de su tipo) y cuánto CONTÓ (de lo que se le
 * preguntó, no de una lista ideal). Así dos formularios distintos son comparables y ninguno arranca
 * con una penalización estructural.
 *
 * ⏱️ Y EL SEGUNDO DEFECTO, que no venía en el encargo: el legacy sumaba **+5 si el lead entra en
 * horario de oficina**. Eso no mide intención, mide NUESTRO horario — y peor, hace el puntaje
 * **irreproducible**: el mismo lead re-puntuado otro día da otro número, así que ningún recálculo ni
 * backfill cuadra jamás. Aquí no está. Cuándo llegó es un dato de operación (a quién despertar), no
 * de calidad del interesado.
 *
 * Puro y determinista: mismos datos, mismo puntaje, hoy y dentro de un año.
 */

import type { LeadTier } from './crm';

/** Lo que un formulario puede llegar a preguntar. Si no está aquí, no se descuenta por faltar. */
export const CAMPOS_LEAD = ['nombre', 'email', 'telefono', 'mensaje', 'propiedad', 'presupuesto', 'cita'] as const;
export type CampoLead = (typeof CAMPOS_LEAD)[number];

/** Cuánto vale cada campo cuando SÍ se ofreció y el interesado lo llenó. */
const PESO: Record<CampoLead, number> = {
  nombre: 5,
  // Un canal de contacto vale lo mismo sea cual sea: lo que importa es poder alcanzarle.
  email: 10,
  telefono: 10,
  mensaje: 5,
  // Señales de intención: mirar UN inmueble concreto dice más que un formulario genérico.
  propiedad: 10,
  presupuesto: 10,
  cita: 10,
};

/** Intención declarada por el tipo de formulario. Es la mitad del puntaje que no depende del relleno. */
export const INTENCION: Record<string, number> = {
  agenda_visita: 30,
  contacto_propiedad: 25,
  reserva_estancia: 25,
  solicitud_credito: 20,
  publicar_propiedad: 15,
  solicitud_avaluo: 15,
  rango_altorra: 15,
  otro: 5,
};
const INTENCION_MAXIMA = 30;

/**
 * Qué campos ofrece REALMENTE cada formulario del portal, leído de `/api/solicitud.ts` y no supuesto.
 *
 * 🔴 Y el dato incómodo que salió al medirlo: el intake solo acepta **nombre y teléfono** (más las
 * fechas en estancias). Ni correo, ni mensaje, ni presupuesto, ni id de propiedad. El scorer legacy
 * repartía puntos por los cinco — así que **ningún lead del portal podía acercarse al techo**, hiciera
 * lo que hiciera el interesado. No era un formulario flojo: era una regla midiendo otra cosa.
 *
 * ⚠️ Si un formulario empieza a pedir un campo nuevo, **se añade aquí en el mismo cambio**. Un
 * formulario que pide algo que esta tabla no conoce vuelve a puntuar mal por la puerta de atrás.
 */
export const CAMPOS_POR_ORIGEN: Record<string, readonly CampoLead[]> = {
  'portal-publicar': ['nombre', 'telefono'],
  'portal-rango': ['nombre', 'telefono'],
  // Llegada y salida son fechas concretas: quien las pone ya decidió cuándo, y eso es intención dura.
  'portal-estancias': ['nombre', 'telefono', 'cita'],
};

/** Lo que ofrece un origen desconocido: lo mínimo, para no premiar ni castigar de más. */
export function camposDe(origen: string): readonly CampoLead[] {
  return CAMPOS_POR_ORIGEN[origen] ?? ['nombre', 'telefono'];
}

export interface EntradaScore {
  tipo: string;
  /** 🔴 Qué campos OFRECÍA el formulario. Sin esto se puntúa el formulario, no al lead. */
  camposOfrecidos: readonly CampoLead[];
  /** Cuáles de esos campos llegaron con contenido real. */
  camposLlenos: readonly CampoLead[];
  /** Presupuesto declarado, si el formulario lo pedía. Escala el peso de `presupuesto`. */
  presupuesto?: number;
}

export interface ResultadoScore {
  /** 0-100. Es la proporción en porcentaje: legible en un panel sin explicar la escala. */
  score: number;
  /** Cuánto QUIERE, por el tipo de formulario. 0-1. */
  intencion: number;
  /** Cuánto CONTÓ, de lo que se le preguntó. 0-1. */
  relleno: number;
  tier: LeadTier;
}

/**
 * Puntúa como **dos mitades explícitas**: cuánto quiere (intención) y cuánto contó (relleno).
 *
 * 🎯 POR QUÉ DOS MITADES Y NO UNA SUMA. La primera versión sumaba todo a un solo bote y dividía por
 * el máximo — y una prueba la tumbó: **el techo se movía con el número de campos**. Al meterlo todo
 * en el mismo denominador, la penalización por baja intención se DILUÍA cuanto más largo fuera el
 * formulario, así que pedir un campo más subía el techo del lead. Absurdo: cuántas casillas tenga un
 * formulario no puede cambiar lo caliente que puede llegar a estar quien lo llena.
 * Separadas, cada mitad responde a lo suyo y el techo queda donde debe: *lo fija la intención, y los
 * campos solo dicen cuánto de esa intención llegó a demostrarse.*
 */
export function puntuar(e: EntradaScore): ResultadoScore {
  const ofrecidos = new Set(e.camposOfrecidos);
  const llenos = new Set(e.camposLlenos.filter((c) => ofrecidos.has(c)));

  let ganado = 0;
  let posible = 0;
  for (const campo of ofrecidos) {
    const peso = PESO[campo];
    posible += peso;
    if (!llenos.has(campo)) continue;
    if (campo === 'presupuesto') {
      // Un presupuesto alto es señal más fuerte; uno bajo sigue valiendo algo por haberlo dicho.
      const p = e.presupuesto ?? 0;
      ganado += peso * (p > 1_000_000_000 ? 1 : p > 500_000_000 ? 0.5 : 0.2);
    } else {
      ganado += peso;
    }
  }

  const intencion = (INTENCION[e.tipo] ?? INTENCION.otro) / INTENCION_MAXIMA;
  // Un formulario que no pide NADA no puede demostrar nada: el relleno es 0, no 1 por vacuidad.
  const relleno = posible > 0 ? ganado / posible : 0;
  const proporcion = 0.5 * intencion + 0.5 * relleno;

  return {
    score: Math.round(proporcion * 100),
    intencion: Math.round(intencion * 100) / 100,
    relleno: Math.round(relleno * 100) / 100,
    tier: tierDe(proporcion),
  };
}

/**
 * De proporción a tier. Los cortes son de NEGOCIO, no matemáticos: `A` es «llámalo hoy», `D` es
 * «probablemente ni contesta».
 */
export function tierDe(proporcion: number): LeadTier {
  if (proporcion >= 0.8) return 'A';
  if (proporcion >= 0.6) return 'B';
  if (proporcion >= 0.4) return 'C';
  return 'D';
}

/**
 * El TECHO de un formulario: qué tier saca alguien que llena todo lo que se le pide.
 *
 * 🎯 Su propiedad útil —y la que fija una prueba— es que **NO cambia si el formulario ofrece más o
 * menos campos**: el techo lo pone la intención del tipo, y los campos solo dicen cuánto de ella se
 * llegó a demostrar. Existe para que el defecto de §189 no vuelva en silencio: si algún día añadir o
 * quitar una casilla mueve este número, la regla volvió a medir el formulario en vez del lead.
 */
export function techoAlcanzable(tipo: string, camposOfrecidos: readonly CampoLead[]): LeadTier {
  return puntuar({ tipo, camposOfrecidos, camposLlenos: camposOfrecidos, presupuesto: 2_000_000_000 }).tier;
}
