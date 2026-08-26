/*
 * CALENDARIO COLOMBIANO — festivos, días hábiles y la ventana legal de contacto (§172).
 *
 * Nace por dos deudas que se pagan de una:
 *   1. §170 dejó el vencimiento del retracto con **un día de margen** porque no había forma de saber
 *      si en medio caía un festivo. El margen estaba declarado y era honesto, pero era un parche.
 *   2. La **Ley 2300 de 2023** prohíbe el contacto comercial en domingos y **festivos** — y sin
 *      calendario, «no contactar en festivo» es una frase, no una comprobación.
 *
 * ⚖️ POR QUÉ SE CALCULA Y NO SE COPIA UNA LISTA. Una lista de fechas caduca cada 31 de diciembre y
 * falla en silencio: el 1 de enero siguiente el sistema cree que no hay festivos. Los festivos
 * colombianos son deterministas —fechas fijas, la **Ley Emiliani** que corre siete de ellos al lunes
 * siguiente, y cuatro que penden de la Pascua— así que se calculan para cualquier año.
 *
 * 🔒 EL INVARIANTE QUE VALIDA TODO EL ALGORITMO sin necesidad de una lista externa: **los festivos
 * emilianistas SIEMPRE caen en lunes**. Si uno cae en martes, el cálculo está mal. Es la prueba que
 * convierte «creo que las fechas están bien» en «las fechas están bien».
 */

/** ISO `YYYY-MM-DD`. Todo se maneja en UTC a propósito: sin husos no hay bugs de huso. */
type ISO = string;

const iso = (d: Date): ISO => d.toISOString().slice(0, 10);
const dia = (a: number, m: number, d: number): Date => new Date(Date.UTC(a, m - 1, d));
const mas = (d: Date, n: number): Date => new Date(d.getTime() + n * 86_400_000);

/** Corre una fecha al LUNES siguiente (Ley Emiliani). Si ya es lunes, se queda. */
function alLunes(d: Date): Date {
  const dow = d.getUTCDay(); // 0 = domingo, 1 = lunes
  return dow === 1 ? d : mas(d, (8 - dow) % 7);
}

/**
 * Domingo de Pascua por el algoritmo gregoriano anónimo (Meeus/Jones/Butcher). Es aritmética pura y
 * exacta para cualquier año del calendario gregoriano.
 */
export function pascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const diaDelMes = ((h + l - 7 * m + 114) % 31) + 1;
  return dia(anio, mes, diaDelMes);
}

/**
 * Los festivos colombianos de un año, en ISO, ordenados y **sin repetir**.
 *
 * ⚠️ **NO siempre son 18 fechas, y esto lo destapó una prueba.** Son 18 *celebraciones*, pero dos
 * pueden caer el mismo día: en **2025**, San Pedro y San Pablo (29-jun, domingo) se corre al lunes
 * **30 de junio**… donde ya estaba el Sagrado Corazón (Pascua + 71). Resultado: **17 fechas
 * festivas**. Para `esFestivo` da igual —un día es festivo o no lo es— pero cualquiera que CUENTE
 * festivos con un 18 fijo se equivoca ese año. *Una constante que «siempre» vale 18 es una constante
 * que un día vale 17.*
 */
export function festivos(anio: number): ISO[] {
  const p = pascua(anio);
  const fechas: Date[] = [
    // Fijos, no se mueven.
    dia(anio, 1, 1), // Año Nuevo
    dia(anio, 5, 1), // Día del Trabajo
    dia(anio, 7, 20), // Independencia
    dia(anio, 8, 7), // Batalla de Boyacá
    dia(anio, 12, 8), // Inmaculada Concepción
    dia(anio, 12, 25), // Navidad
    // De Pascua, y NO se mueven: son los dos de Semana Santa.
    mas(p, -3), // Jueves Santo
    mas(p, -2), // Viernes Santo
    // Emilianistas de fecha fija: al lunes siguiente.
    alLunes(dia(anio, 1, 6)), // Reyes Magos
    alLunes(dia(anio, 3, 19)), // San José
    alLunes(dia(anio, 6, 29)), // San Pedro y San Pablo
    alLunes(dia(anio, 8, 15)), // Asunción
    alLunes(dia(anio, 10, 12)), // Día de la Raza
    alLunes(dia(anio, 11, 1)), // Todos los Santos
    alLunes(dia(anio, 11, 11)), // Independencia de Cartagena
    // Emilianistas ligados a la Pascua: el desplazamiento al lunes ya va en el offset.
    mas(p, 43), // Ascensión (39 + al lunes)
    mas(p, 64), // Corpus Christi (60 + al lunes)
    mas(p, 71), // Sagrado Corazón (68 + al lunes)
  ];
  return [...new Set(fechas.map(iso))].sort();
}

const cache = new Map<number, Set<ISO>>();
function delAnio(anio: number): Set<ISO> {
  let s = cache.get(anio);
  if (!s) {
    s = new Set(festivos(anio));
    cache.set(anio, s);
  }
  return s;
}

export function esFestivo(fecha: ISO): boolean {
  const anio = Number(fecha.slice(0, 4));
  return Number.isFinite(anio) && delAnio(anio).has(fecha);
}

/** Hábil = ni sábado, ni domingo, ni festivo. */
export function esHabil(fecha: ISO): boolean {
  const d = new Date(`${fecha}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const dow = d.getUTCDay();
  return dow !== 0 && dow !== 6 && !esFestivo(fecha);
}

/** Días HÁBILES entre dos fechas, sin contar la de partida y **descontando festivos**. */
export function diasHabiles(desde: ISO, hasta: ISO): number {
  const a = new Date(`${desde}T00:00:00Z`);
  const b = new Date(`${hasta}T00:00:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b <= a) return 0;
  let n = 0;
  for (let cur = mas(a, 1); cur <= b; cur = mas(cur, 1)) {
    if (esHabil(iso(cur))) n += 1;
  }
  return n;
}

/*
 * ── VENTANA LEGAL DE CONTACTO COMERCIAL — Ley 2300 de 2023 ──────────────────────────────────────
 *
 * 🔴 SÍ NOS APLICA, y no por la vía que uno esperaría. La ley regula la cobranza, pero su artículo de
 * ofertas comerciales extiende **las mismas reglas** «a las relaciones comerciales entre los
 * productores y proveedores de bienes y servicios […] y el consumidor comercial frente al envío de
 * mensajes publicitarios a través de SMS, mensajería por aplicaciones o web, correos electrónicos y
 * llamadas telefónicas de carácter comercial o publicitario». Un WhatsApp de prospección de una
 * inmobiliaria es exactamente eso.
 */
export const VENTANA_CONTACTO = {
  /** Lunes a viernes. */
  semana: { desde: 7, hasta: 19 },
  /** Sábados. */
  sabado: { desde: 8, hasta: 15 },
} as const;

export type MotivoNoContacto = 'domingo' | 'festivo' | 'fuera-de-horario';

/**
 * ¿Se puede enviar un mensaje comercial en esta fecha y hora (de Colombia)?
 * Devuelve `null` si SÍ, o el motivo por el que no.
 *
 * ⚠️ La hora es la de COLOMBIA (UTC−5), no la del servidor. Un `onSchedule` de Firebase corre en UTC:
 * «cada 6 horas» dispara a la **1 de la madrugada** hora colombiana, que es justo lo que esta ley
 * existe para impedir.
 */
export function motivoNoContacto(fecha: ISO, hora: number): MotivoNoContacto | null {
  const d = new Date(`${fecha}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return 'fuera-de-horario';
  const dow = d.getUTCDay();
  if (dow === 0) return 'domingo';
  if (esFestivo(fecha)) return 'festivo';
  const v = dow === 6 ? VENTANA_CONTACTO.sabado : VENTANA_CONTACTO.semana;
  return hora >= v.desde && hora < v.hasta ? null : 'fuera-de-horario';
}

export const puedeContactar = (fecha: ISO, hora: number): boolean =>
  motivoNoContacto(fecha, hora) === null;

export function explicarNoContacto(m: MotivoNoContacto): string {
  switch (m) {
    case 'domingo':
      return 'Los domingos no se puede enviar comunicación comercial (Ley 2300 de 2023).';
    case 'festivo':
      return 'Es festivo en Colombia: no se puede enviar comunicación comercial (Ley 2300 de 2023).';
    default:
      return 'Fuera del horario permitido: lunes a viernes de 7:00 a 19:00 y sábados de 8:00 a 15:00 (Ley 2300 de 2023).';
  }
}
