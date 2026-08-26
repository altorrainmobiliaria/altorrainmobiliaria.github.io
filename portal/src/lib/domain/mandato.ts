/*
 * MANDATO DE RECAUDO — la máquina de estados del dinero retenido (§170).
 *
 * Une lo que ya existe: el webhook dice qué pasó (§169), la liquidación dice cuánto le toca a cada
 * uno (§166), y esto decide **cuándo el dinero deja de estar retenido**. Es la pieza donde una
 * decisión mal tomada no se corrige con un `git revert`: se corrige llamando a alguien para pedirle
 * que devuelva una plata que ya recibió.
 *
 * 🔑 EL PRINCIPIO QUE LO GOBIERNA, y ya estaba escrito en `42-LEGAL` §11: **mientras el fondo está
 * RETENIDO, la reversión es trivial**. Después de liberar, deja de serlo — pasa a ser cobranza. Por
 * eso «liberar» es una decisión explícita con condiciones, y no el efecto automático de que un
 * webhook diga `APPROVED`.
 *
 * ⚖️ LA CONDICIÓN QUE MÁS SORPRENDE, y está verificada en `43-OPERACION`: **el retracto de 5 días
 * hábiles del art. 47 de la Ley 1480 SÍ aplica a las reservas a distancia**. Liberar antes de que
 * venza esa ventana es exponerse a devolver un dinero que ya se giró — legalmente el consumidor
 * puede retractarse y hay que reversarle, tenga uno el dinero o no. La ventana no es una cortesía:
 * es el plazo durante el cual la reversión sigue siendo barata.
 *
 * 🔴 Y EL CASO QUE NADIE MODELA: **reversar DESPUÉS de liberar**. Pasa (un contracargo llega tarde,
 * el art. 51 obliga a reversar) y el sistema tiene que poder decirlo en voz alta: no «reversado» a
 * secas, sino «reversado **con saldo en contra**, hay que recuperar X». Un estado que oculta una
 * deuda es peor que no tener el estado.
 *
 * Puro: `hoy` se inyecta, no se lee del reloj. Así el vencimiento del retracto se prueba de verdad.
 */

import type { COP } from './shared';

export const ESTADOS_MANDATO = ['esperando', 'retenido', 'liberado', 'reversado', 'fallido'] as const;
export type EstadoMandato = (typeof ESTADOS_MANDATO)[number];

/**
 * Retracto del art. 47 de la Ley 1480: **cinco días HÁBILES**. Se cuentan hábiles y no corridos
 * porque así lo dice la norma, y la diferencia es de hasta cuatro días reales en una semana con
 * festivo — justo el margen en el que alguien libera «ya pasó la semana» y se equivoca.
 */
export const DIAS_RETRACTO_HABILES = 5;

export interface Mandato {
  id: string;
  estado: EstadoMandato;
  /** Cuándo se aprobó el pago (ISO `YYYY-MM-DD`). Desde aquí corre el retracto. */
  aprobadoEl?: string;
  /** Cuánto se retuvo, en COP. */
  monto: COP;
  /** Lo ya girado al beneficiario. Con `liberado` es el monto; si no, 0. */
  giradoEl?: string;
}

export type Transicion =
  | 'aprobar'   // el webhook dijo APPROVED
  | 'liberar'   // DECISIÓN nuestra
  | 'reversar'  // VOIDED, contracargo o art. 51
  | 'fallar';   // DECLINED / ERROR

/** Qué transiciones acepta cada estado. `reversado` y `fallido` son terminales. */
const PERMITIDAS: Record<EstadoMandato, Transicion[]> = {
  esperando: ['aprobar', 'reversar', 'fallar'],
  // Desde retenido se puede ir a los dos sitios, y esa es toda la gracia del diseño.
  retenido: ['liberar', 'reversar'],
  // 🔴 Sí, desde `liberado` se puede reversar. Ocultarlo no evita el contracargo: solo evita verlo.
  liberado: ['reversar'],
  reversado: [],
  fallido: [],
};

/** Días HÁBILES entre dos fechas ISO (excluye sábados y domingos; los festivos, ver la nota). */
export function diasHabiles(desde: string, hasta: string): number {
  const a = new Date(`${desde}T00:00:00Z`);
  const b = new Date(`${hasta}T00:00:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
  let n = 0;
  const cur = new Date(a);
  while (cur < b) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    const d = cur.getUTCDay();
    if (d !== 0 && d !== 6) n += 1;
  }
  return n;
}

/**
 * ¿Venció ya el retracto?
 *
 * ⚠️ **No descuenta los festivos colombianos, y eso hace que la cuenta sea CONSERVADORA por el lado
 * equivocado**: con un festivo dentro, el plazo real es más largo que el calculado, así que esta
 * función podría decir «ya venció» un día antes de tiempo. Por eso `problemasParaLiberar` exige el
 * vencimiento **más un día de margen**: mientras no haya un calendario de festivos, el margen sale
 * más barato que una reversión después de girar. Cuando exista el calendario, se quita el margen.
 */
export function retractoVencido(aprobadoEl: string, hoy: string): boolean {
  return diasHabiles(aprobadoEl, hoy) >= DIAS_RETRACTO_HABILES + 1;
}

/** Lo que impide liberar. Vacío = se puede. No lanza: devuelve razones. */
export function problemasParaLiberar(m: Mandato, hoy: string): string[] {
  const p: string[] = [];
  if (m.estado !== 'retenido') p.push('no-esta-retenido');
  if (!m.aprobadoEl) p.push('sin-fecha-de-aprobacion');
  else if (!retractoVencido(m.aprobadoEl, hoy)) p.push('retracto-vigente');
  if (!(m.monto > 0)) p.push('monto-invalido');
  return p;
}

export interface Resultado {
  ok: boolean;
  mandato: Mandato;
  problemas: string[];
}

/**
 * Aplica una transición. **No muta**: devuelve un mandato nuevo, como `moverEtapa` en el pipeline de
 * venta (§151). Un objeto de dinero que se modifica en sitio es un objeto del que nadie puede decir
 * cómo llegó a estar así.
 */
export function mover(m: Mandato, t: Transicion, hoy: string): Resultado {
  if (!PERMITIDAS[m.estado].includes(t)) {
    return { ok: false, mandato: m, problemas: [`transicion-invalida:${m.estado}->${t}`] };
  }

  if (t === 'liberar') {
    const problemas = problemasParaLiberar(m, hoy);
    if (problemas.length) return { ok: false, mandato: m, problemas };
    return { ok: true, mandato: { ...m, estado: 'liberado', giradoEl: hoy }, problemas: [] };
  }

  if (t === 'aprobar') {
    return { ok: true, mandato: { ...m, estado: 'retenido', aprobadoEl: hoy }, problemas: [] };
  }

  if (t === 'fallar') return { ok: true, mandato: { ...m, estado: 'fallido' }, problemas: [] };

  // reversar: se acepta SIEMPRE que el estado lo permita, incluso desde `liberado`. La deuda que eso
  // deja no se evita rechazando la transición — se evita viéndola (`saldoEnContra`).
  return { ok: true, mandato: { ...m, estado: 'reversado' }, problemas: [] };
}

/**
 * Cuánto hay que RECUPERAR si esto se reversó después de haber girado. Cero en el caso normal.
 *
 * Es la función que justifica que `liberado → reversado` exista: sin ella, el sistema tendría un
 * mandato en `reversado` idéntico al que se reversó a tiempo, y **nadie sabría que hay plata fuera**.
 */
export function saldoEnContra(m: Mandato): COP {
  return m.estado === 'reversado' && m.giradoEl ? m.monto : 0;
}

/** ¿Este mandato necesita que alguien haga algo HOY? Lo que ordena la bandeja de trabajo. */
export function urgencia(m: Mandato, hoy: string): number {
  if (saldoEnContra(m) > 0) return 100; // plata fuera: lo primero, siempre
  if (m.estado === 'retenido' && m.aprobadoEl && retractoVencido(m.aprobadoEl, hoy)) return 50;
  if (m.estado === 'retenido') return 20;
  if (m.estado === 'esperando') return 10;
  return 0;
}

/** Explica un problema o una transición inválida, en castellano. */
export function explicarProblemaMandato(codigo: string): string {
  if (codigo.startsWith('transicion-invalida:')) {
    const [, ruta] = codigo.split(':');
    return `Desde «${ruta.split('->')[0]}» no se puede hacer eso. Revisa en qué estado está el pago.`;
  }
  switch (codigo) {
    case 'no-esta-retenido':
      return 'Solo se libera lo que está retenido.';
    case 'sin-fecha-de-aprobacion':
      return 'No hay fecha de aprobación, así que no se puede saber si venció el retracto.';
    case 'retracto-vigente':
      return `Todavía corre el plazo de retracto (${DIAS_RETRACTO_HABILES} días hábiles, art. 47 Ley 1480). Si giras ahora y el cliente se retracta, hay que recuperar el dinero.`;
    case 'monto-invalido':
      return 'El monto retenido no es válido.';
    default:
      return 'Hay algo que impide mover este pago.';
  }
}
