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

import type { COP, ISODate } from './shared';
import { IVA } from './dinero';
import type { Contrato, EstadoPago, Novedad, Pago, TipoPago } from './gestion';
/*
 * 🔴 La cuenta del mes tiene UN dueño, y es `liquidarPeriodo` (§263). Este fichero tenía su
 * propia fórmula y daba OTRO número para lo mismo: con canon 2.000.000 y cuota de PH 300.000 al
 * 10 %, la Cloud Function guardaba $1.762.000 como esperado y la pantalla de liquidación mostraba
 * $1.726.300. Alguien iba a girar uno y a discutir el otro cada mes, y en diciembre el certificado
 * anual habría acusado al propietario de haber recibido lo que no recibió.
 *
 * Las dos diferencias, y las dos a favor de `liquidacion.ts`: (1) la base de los honorarios es el
 * **cargo mensual integral** —canon + cuota cuando se cobra aparte— y no el canon solo, que es lo
 * que dice la tarifa sellada; (2) el giro descuenta la cuota de la copropiedad, que no es del
 * propietario. `agenda.ts` no hacía ninguna de las dos.
 *
 * ⚠️ `honorariosPct` se guarda como PORCENTAJE (10) y `liquidarPeriodo` lo quiere como FRACCIÓN
 * (0.1). La conversión va aquí, una sola vez — es la misma trampa que imprimía «1000 %».
 */
import { liquidarPeriodo } from './liquidacion';

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

export type TipoHito = 'canon' | 'payout' | 'preaviso' | 'renovacion' | 'ipc' | 'novedad';

export type Urgencia = 'vencido' | 'hoy' | 'semana' | 'mes' | 'despues';

export interface Hito {
  tipo: TipoHito;
  fecha: ISODate;
  /** Ausente en los hitos de novedad: esas cuelgan del EXPEDIENTE, no de un contrato (§118). */
  contratoId?: string;
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
/**
 * Preaviso LEGAL de la Ley 820 para vivienda urbana. Vive aquí, con el resto de las reglas de tiempo
 * del contrato, y es el **dueño único** del número: `preaviso.ts` lo importa en vez de re-escribirlo.
 */
export const MESES_PREAVISO_LEY_820 = 3;

/*
 * 🔗 Y la alerta DERIVA del plazo legal en vez de ser un 4 escrito a mano (§187): si algún día ese
 * plazo cambia, esto lo sigue solo. Un número copiado se habría quedado atrás en silencio, que es
 * exactamente cómo nacen los gemelos que se separan (§178).
 */
export const MESES_AVISO_RENOVACION = MESES_PREAVISO_LEY_820 + 1;

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
  /*
   * ⚠️ PARA QUIEN VENGA A CONSTRUIR EL ENVÍO DEL PREAVISO: **no puede ser 100 % digital** (§185).
   *
   * Los arts. 22 num. 7 y 24 de la Ley 820 piden **DOS** cosas, no una: que el aviso sea *escrito* **y**
   * que vaya *«a través del servicio postal autorizado»*. La Ley 527 da equivalente funcional del
   * ESCRITO y de la FIRMA — **no de un CANAL de entrega designado por la ley**, que no existe en esa
   * norma. Y el art. 12 de la 820 refuerza la lógica postal: el contrato debe decir la DIRECCIÓN donde
   * se reciben las notificaciones judiciales y extrajudiciales.
   *
   * 🔴 Lo que se juega: un preaviso mandado SOLO por correo o WhatsApp puede declararse ineficaz, y
   * entonces el contrato **se prorroga otro año** — el arrendador pierde doce meses por un ahorro de
   * sello. Por eso el correo/WhatsApp es COPIA DE CORTESÍA y jamás el acto que produce el efecto.
   *
   * Lo que sí le toca al producto: **generar** el documento con las fechas ya calculadas aquí,
   * **recordar** el plazo, y **guardar la evidencia del envío postal** (guía, fecha de imposición,
   * constancia de entrega). Regular el CÓMO es donde está el valor — ver [[LD-09]].
   */
  if (c.vigenciaFin) {
    /*
     * 🔴 LA AGENDA MIRA SI YA SE AVISÓ (§239). Hasta que el preaviso se pudo registrar (§233), estos
     * dos hitos salían SOLO de `vigenciaFin` — y entonces un contrato con preaviso válido seguía
     * diciéndole al dueño «Decidir renovación» y, peor, «Se renueva automáticamente»: exactamente lo
     * contrario de lo que iba a pasar. Dos verdades sobre el mismo contrato, y la que se lee a diario
     * era la falsa.
     *
     * El veredicto se lee del preaviso ARCHIVADO, no se recalcula: lo congeló el servidor al
     * registrarlo, y un acto ya ocurrido no cambia porque hoy se corrija una fecha.
     */
    const preaviso = c.preaviso;
    const termina = preaviso?.efecto === 'termina';
    const seProrroga = preaviso?.efecto === 'se-prorroga';
    /*
     * El aviso del ARRENDADOR está bien puesto pero no basta por sí solo (§263). No se puede tratar
     * como «termina» —sería la mentira que se está arreglando— ni como «se prorroga» —el aviso NO
     * llegó tarde, y decirle que vuelva a avisar sería mandarlo a repetir lo que ya hizo bien—.
     * Lo que le falta es el título, y eso es lo que la agenda tiene que recordarle.
     */
    const faltaTitulo = preaviso?.efecto === 'falta-titulo-del-arrendador';

    const aviso = sumarMeses(c.vigenciaFin, -MESES_AVISO_RENOVACION);
    // Si ya se decidió y el aviso surtió efecto, recordar «decide» es ruido sobre algo hecho.
    if (!termina) out.push(hito({
      ...comun,
      tipo: 'preaviso',
      fecha: aviso,
      titulo: faltaTitulo
        ? 'Preaviso puesto: falta la indemnización o la causal para poder restituir'
        : seProrroga
          ? 'Volver a avisar: el preaviso llegó tarde'
          : 'Decidir renovación',
      detalle: `El preaviso legal es de 3 meses (Ley 820) y el contrato termina el ${c.vigenciaFin.slice(0, 10)}. Este aviso llega con un mes de margen.`,
    }, hoy));
    out.push(hito({
      ...comun,
      tipo: 'renovacion',
      fecha: c.vigenciaFin.slice(0, 10),
      titulo: termina
        ? 'Termina el contrato: hay preaviso'
        : c.renovacionAutomatica
          ? 'Se renueva automáticamente'
          : 'Termina el contrato',
      detalle: termina
        ? `Se impuso el preaviso el ${preaviso!.impuestoEl} por ${preaviso!.operador} (guía ${preaviso!.guia}), a tiempo. El contrato NO se renueva.`
        : seProrroga
          ? `Se renueva igual: el preaviso se impuso el ${preaviso!.impuestoEl}, después del límite, así que no surtió efecto (Ley 820).`
          : c.renovacionAutomatica
            ? 'Salvo que alguna de las partes avise a tiempo.'
            : 'No tiene renovación automática: si no se firma otro, termina.',
    }, hoy));
  }

  // 4. El incremento anual, doce meses después del ÚLTIMO CAMBIO DE CANON (§267).
  //
  // Ley 820 art. 20: el canon se reajusta una vez cada doce meses. Ese reloj arranca en el último
  // cambio de precio, no en la firma — y son la misma fecha solo mientras el canon suba únicamente
  // en el aniversario. Con una renegociación a mitad de vigencia dejan de serlo, y el aviso llegaría
  // con meses de error sobre un plazo legal.
  if (c.incrementoIPC && c.vigenciaInicio) {
    const desde = (c.canonDesde ?? c.vigenciaInicio).slice(0, 10);
    let aniversario = sumarMeses(desde, 12);
    // Contratos renovados varias veces: se avanza hasta el primer aniversario que no haya pasado.
    let vueltas = 0;
    while (aniversario < hoy && vueltas < 40) {
      aniversario = sumarMeses(aniversario, 12);
      vueltas++;
    }
    // El detalle NOMBRA su ancla: si el aviso sorprende, el operador ve de qué fecha cuelga sin
    // tener que abrir el contrato — y si el ancla está mal, se ve que está mal.
    const detalle = c.canonDesde
      ? `Doce meses desde el último cambio de canon (${desde}): toca actualizar.`
      : 'Aniversario del contrato: toca actualizar el canon.';
    out.push(hito({ ...comun, tipo: 'ipc', fecha: aniversario, titulo: 'Incremento anual (IPC)', detalle }, hoy));
  }

  return out;
}

/**
 * La agenda: todos los hitos que caen dentro de la ventana, ordenados por fecha.
 *
 * Lo VENCIDO entra siempre, aunque quede fuera de la ventana hacia atrás: una fecha que se pasó no
 * deja de importar porque el calendario avance — al contrario, es lo primero que hay que ver.
 */
export function agenda(
  contratos: Contrato[],
  hoy: string,
  diasVentana = 120,
  // 4º y opcional a propósito: las novedades llegaron después (§118) y quien ya llamaba a `agenda`
  // no tiene por qué enterarse. Aditivo, como manda §3.2.
  novedades: Novedad[] = [],
): Hito[] {
  return [...contratos.flatMap((c) => hitosDeContrato(c, hoy)), ...novedades.flatMap((n) => hitosDeNovedad(n, hoy))]
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

// ─────────────────────────────────────────────────────────────────────────────
// LO QUE SE ESPERA COBRAR Y PAGAR (§115) — las cifras salen del CONTRATO, no del teclado
// ─────────────────────────────────────────────────────────────────────────────


/**
 * El id de un pago es DETERMINISTA: `<contrato>_<periodo>_<tipo>` (OD6).
 *
 * No es una comodidad, es la defensa contra el duplicado: registrar dos veces el canon de agosto
 * escribe el MISMO documento en vez de crear un segundo cobro fantasma que descuadra la cartera. Con
 * un id aleatorio, «¿ya registré este pago?» solo se puede contestar mirando, y se mira mal.
 */
export function idPago(contratoId: string, periodo: string, tipo: TipoPago): string {
  return `${contratoId}_${periodo}_${tipo}`;
}

/** `YYYY-MM` del periodo al que pertenece una fecha. */
export function periodoDe(iso: string): string {
  return (iso ?? '').slice(0, 7);
}

export interface CifrasPago {
  montoEsperado: COP;
  fechaVencimiento: ISODate;
}

/** Redondeo al peso. En COP los céntimos no existen en la práctica y arrastrarlos descuadra sumas. */
const alPeso = (n: number): number => Math.round(n);

/**
 * Los honorarios de administración de un periodo, con su IVA si aplica.
 *
 * El IVA se calcula SOBRE los honorarios, nunca sobre el canon: el servicio gravado es la
 * administración, no el arriendo de vivienda (que está excluido). Confundirlos multiplica por cinco lo
 * que se le cobra al propietario.
 */
export function honorariosDe(c: Pick<Contrato, 'canon' | 'honorariosPct' | 'ivaSobreHonorarios'>): COP {
  if (!c.canon || !c.honorariosPct) return 0;
  const base = (c.canon * c.honorariosPct) / 100;
  return alPeso(c.ivaSobreHonorarios ? base * (1 + IVA) : base);
}

/**
 * La liquidación del mes de un contrato, calculada por su dueño único (§263).
 *
 * Devuelve `null` si el contrato todavía no tiene canon: sin él no hay cuenta que hacer, y lo que
 * corresponde es no prometer una cifra, no inventar un cero.
 */
function liquidacionDe(c: Contrato) {
  if (!c.canon) return null;
  return liquidarPeriodo({
    canon: c.canon,
    administracionPH: c.administracion ?? 0,
    ...(c.adminIncluidaEnCanon ? { adminIncluidaEnCanon: true } : {}),
    // PORCENTAJE → FRACCIÓN. Sin esta división, un contrato al 10 % cobraría diez veces.
    ...(c.honorariosPct != null ? { honorariosPct: c.honorariosPct / 100 } : {}),
    ...(c.ivaSobreHonorarios != null ? { ivaSobreHonorarios: c.ivaSobreHonorarios } : {}),
  });
}

/**
 * Qué se espera de un pago concreto, derivado del contrato.
 *
 * Se DERIVA a propósito: si el operador tecleara el monto esperado, un dedo torcido convertiría un
 * canon de 2.500.000 en uno de 250.000 y la mora se calcularía contra una cifra inventada. Lo único
 * que se teclea es lo que de verdad pasó — cuánto entró y cuándo.
 *
 * `null` cuando el contrato no sostiene ese tipo de pago (p. ej. honorarios sin porcentaje pactado).
 */
export function cifrasDePago(c: Contrato, periodo: string, tipo: TipoPago): CifrasPago | null {
  const dia = Math.min(Math.max(Math.trunc(c.diaPago ?? 1), 1), 28);
  const fechaVencimiento = `${periodo}-${String(dia).padStart(2, '0')}`;
  const canon = c.canon ?? 0;

  if (tipo === 'canon_inquilino') {
    if (!canon) return null;
    // Lo que debe el arrendatario incluye la administración SALVO que ya vaya dentro del canon. Se
    // guardan por separado (doctrina de la casa: nada de cuotas escondidas), pero se cobran juntos.
    const admin = c.adminIncluidaEnCanon ? 0 : (c.administracion ?? 0);
    return { montoEsperado: alPeso(canon + admin), fechaVencimiento };
  }

  if (tipo === 'honorarios') {
    // Misma fuente que el payout: honorarios + su IVA, sobre el cargo mensual integral.
    const l = liquidacionDe(c);
    if (!l) return null;
    const h = alPeso(l.honorarios + l.ivaHonorarios);
    return h ? { montoEsperado: h, fechaVencimiento } : null;
  }

  if (tipo === 'payout_propietario') {
    const l = liquidacionDe(c);
    if (!l) return null;
    /*
     * Se lee de `liquidarPeriodo` y NO se recalcula aquí: es exactamente la cifra que el propietario
     * ve en su comprobante. La cuota de la copropiedad ya sale descontada ahí —no es suya— y el giro
     * va antes del día 10, no el día en que paga el arrendatario.
     */
    return {
      montoEsperado: alPeso(Math.max(0, l.giroAlPropietario)),
      fechaVencimiento: `${periodo}-${String(DIA_TOPE_PAYOUT).padStart(2, '0')}`,
    };
  }

  // `servicios_publicos`: el monto lo trae la factura, no el contrato. Se registra a mano.
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SLA DE LAS NOVEDADES (§118) — la misma familia que la mora: un reloj que corre solo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tope de respuesta de una PQRS. Vive aquí, con la mora, y no en el módulo de novedades, porque es
 * la MISMA pregunta —«¿qué se me está pasando y qué hago?»— y partirla en dos dueños es como se
 * llega a que dos pantallas den cuentas distintas del mismo retraso ([[L-45]]).
 */
export const HORAS_SLA_PQRS = 48;

/** Horas entre dos instantes ISO. Negativo = el segundo ya pasó. */
export function horasEntre(desde: string, hasta: string): number {
  const a = Date.parse(desde);
  const b = Date.parse(hasta);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.round(((b - a) / 3_600_000) * 100) / 100;
}

/**
 * Cuándo vence el SLA de una novedad.
 *
 * Se cuenta desde que ENTRA, no desde que alguien la mira: el inquilino empezó a esperar cuando la
 * reportó. Si el documento trae `slaVencimiento` explícito, manda ése — hay casos (una reparación
 * pactada con el propietario) en que el plazo se acuerda y no se calcula.
 */
export function vencimientoSla(n: Pick<Novedad, 'createdAt' | 'slaVencimiento'>, horas = HORAS_SLA_PQRS): ISODate {
  if (n.slaVencimiento) return n.slaVencimiento;
  const t = Date.parse(n.createdAt);
  return Number.isFinite(t) ? new Date(t + horas * 3_600_000).toISOString() : n.createdAt;
}

export interface EstadoSla {
  vencimiento: ISODate;
  /** Negativo = ya se pasó el plazo. */
  horasRestantes: number;
  vencida: boolean;
  /** `true` cuando ya no corre el reloj: la novedad está resuelta. */
  cerrada: boolean;
  urgencia: Urgencia;
}

/**
 * Estado del reloj de una novedad AHORA.
 *
 * Una novedad HECHA o CERRADA no vence: su reloj se paró al resolverse. Enseñarla en rojo tres
 * semanas después solo entrena al operador a ignorar el color, que es como muere un tablero.
 */
export function estadoDeSla(
  n: Pick<Novedad, 'createdAt' | 'slaVencimiento' | 'estado'>,
  ahora: string,
): EstadoSla {
  const vencimiento = vencimientoSla(n);
  const cerrada = n.estado === 'HECHO' || n.estado === 'CERRADO';
  const horasRestantes = horasEntre(ahora, vencimiento);
  const urgencia: Urgencia = cerrada
    ? 'despues'
    : horasRestantes < 0
      ? 'vencido'
      : horasRestantes <= 12
        ? 'hoy'
        : horasRestantes <= HORAS_SLA_PQRS
          ? 'semana'
          : 'mes';
  return { vencimiento, horasRestantes, vencida: !cerrada && horasRestantes < 0, cerrada, urgencia };
}

/** Qué hacer con una novedad según lo que marque su reloj. Espeja `accionDeMora`. */
export function accionDeSla(e: EstadoSla): string {
  if (e.cerrada) return 'Resuelta.';
  if (e.vencida) return `Fuera de plazo por ${Math.abs(Math.round(e.horasRestantes))} h. Responder HOY y explicar la demora.`;
  if (e.horasRestantes <= 12) return `Quedan ${Math.round(e.horasRestantes)} h. Responder antes de que venza.`;
  return `Quedan ${Math.round(e.horasRestantes)} h de las ${HORAS_SLA_PQRS} de plazo.`;
}

/** Hitos de agenda de una novedad abierta: la única que pide sitio en el tablero. */
export function hitosDeNovedad(n: Novedad, hoy: string): Hito[] {
  const e = estadoDeSla(n, `${hoy}T00:00:00.000Z`);
  if (e.cerrada) return [];
  const fecha = e.vencimiento.slice(0, 10);
  return [
    {
      tipo: 'novedad',
      fecha,
      expedienteId: n.expedienteId,
      titulo: `Novedad: ${n.tipo}`,
      detalle: `${n.descripcion.slice(0, 120)} — ${accionDeSla(e)}`,
      dias: diasEntre(hoy, fecha),
      urgencia: e.urgencia,
    },
  ];
}
