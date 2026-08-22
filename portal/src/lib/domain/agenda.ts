/*
 * AGENDA OPERATIVA — qué vence, cuándo avisar y quién está en mora (§112).
 *
 * Es la respuesta a lo que el dueño describió como su problema real: *«llevamos todo en la mente y por
 * WhatsApp… se pierden los contratos, se olvidan fechas»*. El módulo GESTIÓN tenía desde el día 1 el
 * MODELO (`gestion.ts`: expedientes, contratos, pagos, novedades) y ni una línea que derivara nada de
 * él. Un esquema sin lógica no recuerda fechas: solo las guarda.
 *
 * Todo aquí es PURO y con `hoy` inyectado. Dos razones y las dos importan: se puede probar el día 4 de
 * mora sin esperar cuatro días, y la misma función sirve para pintar el panel y —el día que exista—
 * para que una Cloud Function mande el recordatorio, sin que las dos puedan discrepar sobre qué vence.
 */

import type { ISODate } from './shared';
import type { Contrato, EstadoPago, Pago } from './gestion';

// ─────────────────────────────────────────────────────────────────────────────
// FECHAS — aritmética en UTC, sin librerías
// ─────────────────────────────────────────────────────────────────────────────

/** `YYYY-MM-DD` de una fecha, en UTC. La hora no pinta nada en una agenda de vencimientos. */
export function aDia(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** `YYYY-MM-DD` → Date a medianoche UTC. Tolera un ISO completo. */
function deDia(iso: string): Date {
  return new Date(`${(iso ?? '').slice(0, 10)}T00:00:00.000Z`);
}

/** Días enteros de `desde` a `hasta`. Negativo = ya pasó. */
export function diasEntre(desde: string, hasta: string): number {
  const a = deDia(desde).getTime();
  const b = deDia(hasta).getTime();
  return Math.round((b - a) / 86_400_000);
}

/**
 * Suma meses conservando el día, y si el mes destino no lo tiene se queda en el ÚLTIMO día.
 *
 * `new Date(2026, 0, 31)` + 1 mes en JavaScript da **3 de marzo**, no 28 de febrero: el desbordamiento
 * silencioso de `setMonth`. En una agenda de contratos eso mueve un vencimiento a otro mes sin avisar.
 */
export function sumarMeses(iso: string, meses: number): string {
  const d = deDia(iso);
  const dia = d.getUTCDate();
  const destino = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + meses, 1));
  const ultimo = new Date(Date.UTC(destino.getUTCFullYear(), destino.getUTCMonth() + 1, 0)).getUTCDate();
  destino.setUTCDate(Math.min(dia, ultimo));
  return aDia(destino);
}

/**
 * La PRÓXIMA vez que cae el día `diaPago` a partir de `hoy` (incluido hoy).
 *
 * El modelo limita `diaPago` a 1..28 justamente para que este cálculo no tenga casos raros en febrero;
 * aun así se recorta, porque un dato que viene de un formulario puede traer cualquier cosa.
 */
export function proximoDiaDePago(hoy: string, diaPago: number): string {
  const dia = Math.min(Math.max(Math.trunc(diaPago), 1), 28);
  const h = deDia(hoy);
  const esteMes = new Date(Date.UTC(h.getUTCFullYear(), h.getUTCMonth(), dia));
  if (aDia(esteMes) >= hoy) return aDia(esteMes);
  return aDia(new Date(Date.UTC(h.getUTCFullYear(), h.getUTCMonth() + 1, dia)));
}

// ─────────────────────────────────────────────────────────────────────────────
// HITOS — lo que hay que hacer, y cuándo
// ─────────────────────────────────────────────────────────────────────────────

export type TipoHito = 'canon' | 'payout' | 'preaviso' | 'renovacion' | 'ipc';

export type Urgencia = 'vencido' | 'hoy' | 'semana' | 'mes' | 'despues';

export interface Hito {
  tipo: TipoHito;
  fecha: ISODate;
  contratoId: string;
  expedienteId: string;
  /** Para una persona, sin jerga. */
  titulo: string;
  detalle: string;
  /** Negativo = ya pasó. */
  dias: number;
  urgencia: Urgencia;
}

/**
 * Meses de antelación del aviso de renovación.
 *
 * El preaviso LEGAL de terminación en arriendo de vivienda urbana es de **3 meses** (Ley 820). Avisar
 * a los 3 sería avisar el día del plazo: no deja tiempo para decidir, hablar con el propietario y
 * mandar la comunicación. Se avisa a **4** para que quede un mes de margen sobre una fecha que no
 * admite retraso.
 */
export const MESES_AVISO_RENOVACION = 4;

/**
 * Día tope para pagarle al propietario. Sale del proceso A1-A5 del propio dueño: el canon entra a
 * principio de mes y el giro sale antes del 10.
 */
export const DIA_TOPE_PAYOUT = 10;

function urgenciaDe(dias: number): Urgencia {
  if (dias < 0) return 'vencido';
  if (dias === 0) return 'hoy';
  if (dias <= 7) return 'semana';
  if (dias <= 31) return 'mes';
  return 'despues';
}

function hito(base: Omit<Hito, 'dias' | 'urgencia'>, hoy: string): Hito {
  const dias = diasEntre(hoy, base.fecha);
  return { ...base, dias, urgencia: urgenciaDe(dias) };
}

/**
 * Los hitos que genera UN contrato.
 *
 * Solo los contratos **vigentes o en preaviso** generan agenda: uno terminado no tiene nada que
 * recordar, y meterlo llenaría la lista de ruido que esconde lo urgente.
 */
export function hitosDeContrato(c: Contrato, hoy: string): Hito[] {
  if (c.estado === 'terminado') return [];
  const out: Hito[] = [];
  const comun = { contratoId: c.id, expedienteId: c.expedienteId };

  // 1. El canon del mes.
  if (c.tipo === 'arriendo' && c.diaPago) {
    const fecha = proximoDiaDePago(hoy, c.diaPago);
    out.push(hito({ ...comun, tipo: 'canon', fecha, titulo: 'Cobro del canon', detalle: `Vence el día ${c.diaPago} de cada mes.` }, hoy));
  }

  // 2. El giro al propietario, antes del día 10 (proceso del dueño).
  if (c.tipo === 'arriendo' && c.canon) {
    const fecha = proximoDiaDePago(hoy, DIA_TOPE_PAYOUT);
    out.push(hito({ ...comun, tipo: 'payout', fecha, titulo: 'Pagar al propietario', detalle: `Antes del día ${DIA_TOPE_PAYOUT}, descontando honorarios.` }, hoy));
  }

  // 3. El aviso de renovación, y la renovación en sí.
  if (c.vigenciaFin) {
    const aviso = sumarMeses(c.vigenciaFin, -MESES_AVISO_RENOVACION);
    out.push(hito({
      ...comun,
      tipo: 'preaviso',
      fecha: aviso,
      titulo: 'Decidir renovación',
      detalle: `El preaviso legal es de 3 meses (Ley 820) y el contrato termina el ${c.vigenciaFin.slice(0, 10)}. Este aviso llega con un mes de margen.`,
    }, hoy));
    out.push(hito({
      ...comun,
      tipo: 'renovacion',
      fecha: c.vigenciaFin.slice(0, 10),
      titulo: c.renovacionAutomatica ? 'Se renueva automáticamente' : 'Termina el contrato',
      detalle: c.renovacionAutomatica
        ? 'Salvo que alguna de las partes avise a tiempo.'
        : 'No tiene renovación automática: si no se firma otro, termina.',
    }, hoy));
  }

  // 4. El incremento anual, en el aniversario del inicio.
  if (c.incrementoIPC && c.vigenciaInicio) {
    const inicio = c.vigenciaInicio.slice(0, 10);
    let aniversario = sumarMeses(inicio, 12);
    // Contratos renovados varias veces: se avanza hasta el primer aniversario que no haya pasado.
    let vueltas = 0;
    while (aniversario < hoy && vueltas < 40) {
      aniversario = sumarMeses(aniversario, 12);
      vueltas++;
    }
    out.push(hito({ ...comun, tipo: 'ipc', fecha: aniversario, titulo: 'Incremento anual (IPC)', detalle: 'Aniversario del contrato: toca actualizar el canon.' }, hoy));
  }

  return out;
}

/**
 * La agenda: todos los hitos que caen dentro de la ventana, ordenados por fecha.
 *
 * Lo VENCIDO entra siempre, aunque quede fuera de la ventana hacia atrás: una fecha que se pasó no
 * deja de importar porque el calendario avance — al contrario, es lo primero que hay que ver.
 */
export function agenda(contratos: Contrato[], hoy: string, diasVentana = 120): Hito[] {
  return contratos
    .flatMap((c) => hitosDeContrato(c, hoy))
    .filter((h) => h.dias <= diasVentana)
    .sort((a, b) => (a.fecha === b.fecha ? a.tipo.localeCompare(b.tipo) : a.fecha < b.fecha ? -1 : 1));
}

// ─────────────────────────────────────────────────────────────────────────────
// MORA — el protocolo del dueño, hecho ejecutable
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escalones de cobranza, en días de retraso. Son los del dueño (default PRO del `config/gestion`).
 * Cada escalón es un paso distinto de gestión, no un adorno: recordatorio, llamada, carta, etc.
 */
export const ESCALONES_MORA = [5, 10, 15, 30, 45] as const;

/** Días de retraso de un pago. 0 si aún no vence o si ya está pagado. */
export function diasDeMora(p: Pick<Pago, 'fechaVencimiento' | 'fechaPago'>, hoy: string): number {
  if (!p.fechaVencimiento) return 0;
  // Si se pagó, la mora es la que hubo al pagar, no la que habría hoy: el retraso ya no crece.
  const corte = p.fechaPago ? p.fechaPago.slice(0, 10) : hoy;
  return Math.max(0, diasEntre(p.fechaVencimiento.slice(0, 10), corte));
}

/**
 * En qué escalón cae. 0 = todavía no toca hacer nada; 5 = el último escalón (45+ días).
 *
 * Se compara con `>=` a propósito: el día 5 exacto YA es el escalón 1. El protocolo dice «al día 5»,
 * no «pasado el día 5», y redondear a favor del moroso es cómo una cobranza se retrasa sola.
 */
export function tierDeMora(dias: number, escalones: readonly number[] = ESCALONES_MORA): number {
  let tier = 0;
  for (const e of escalones) if (dias >= e) tier++;
  return tier;
}

export interface EstadoDePago {
  estado: EstadoPago;
  diasMora: number;
  moraTier: number;
}

/**
 * El estado REAL de un pago hoy, derivado y no almacenado.
 *
 * Guardar «mora» en el documento y confiar en él es garantizar que un día se quede viejo: el estado
 * cambia con el CALENDARIO, no con una escritura. El campo `estado` del modelo sirve para consultar,
 * pero quien decide es esta función.
 *
 * `parcial` gana a `al_dia` aunque haya llegado dinero: recibir la mitad no es estar al día, y
 * enseñarlo como saldado es cómo se pierde la otra mitad.
 */
export function estadoDePago(
  p: Pick<Pago, 'fechaVencimiento' | 'fechaPago' | 'montoEsperado' | 'montoRecibido'>,
  hoy: string,
  escalones: readonly number[] = ESCALONES_MORA,
): EstadoDePago {
  const dias = diasDeMora(p, hoy);
  const recibido = p.montoRecibido ?? 0;
  const esperado = p.montoEsperado ?? 0;

  if (esperado > 0 && recibido >= esperado) return { estado: 'al_dia', diasMora: dias, moraTier: 0 };
  if (recibido > 0) return { estado: 'parcial', diasMora: dias, moraTier: tierDeMora(dias, escalones) };
  if (dias > 0) return { estado: 'mora', diasMora: dias, moraTier: tierDeMora(dias, escalones) };
  return { estado: 'pendiente', diasMora: 0, moraTier: 0 };
}

/** Qué toca hacer en cada escalón, dicho para quien va a hacerlo. */
export function accionDeMora(tier: number): string {
  switch (tier) {
    case 0:
      return 'Sin retraso.';
    case 1:
      return 'Recordatorio amable por WhatsApp.';
    case 2:
      return 'Llamada al arrendatario.';
    case 3:
      return 'Comunicación escrita, con constancia.';
    case 4:
      return 'Avisar al propietario y evaluar la garantía.';
    default:
      return 'Escalar: cobro jurídico. Reunir soportes antes.';
  }
}
