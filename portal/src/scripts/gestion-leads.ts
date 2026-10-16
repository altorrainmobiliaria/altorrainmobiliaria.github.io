/*
 * BANDEJA DE LEADS del panel de gestión — la primera pantalla del back-office que deja de ser maqueta.
 *
 * POR QUÉ ESTA Y NO OTRA: `/publicar` y el Rango ALTORRA capturan leads REALES desde §88 y §94, y el
 * aviso por correo lleva roto desde entonces (credenciales de Gmail). O sea que hoy los leads entran y
 * el dueño solo puede verlos abriendo la consola de Firebase. Esta pantalla cierra ese hueco sin
 * depender de que el correo vuelva.
 *
 * POR QUÉ AQUÍ SÍ SE USA EL SDK DE FIRESTORE, con el gate `verify:data` prohibiéndolo en el resto:
 * el gate protege las superficies PÚBLICAS, donde una lectura de más se multiplica por cada visitante
 * y se lleva el free-tier por delante. El panel no es público — lo abren una o dos personas del
 * equipo— y la propia doctrina del proyecto lo dice con todas las letras: «cero `onSnapshot` público
 * (solo admin)». Aun así este módulo NO usa `onSnapshot`: pide los datos una vez y ofrece recargar.
 * Un listener abierto en una pestaña olvidada toda la tarde es exactamente el patrón que arruina una
 * cuota, y aquí no compra nada: los leads no llegan cada segundo.
 *
 * ⚠️ LO QUE NUNCA HACE: dejar los datos de MUESTRA en pantalla cuando la lectura falla. Un panel que
 * enseña seis leads inventados a quien cree que son reales es peor que un panel vacío — llamaría a
 * gente que no existe. Si falla, lo dice; si no hay nada, lo dice.
 *
 * ⏱️ EL PLAZO DE 5 MINUTOS (§330). Cada lead lleva su reloj (`lead-sla.ts`: solo corre en el horario
 * legal de contacto), un botón «Marcar contactado» que sella la hora del servidor SIN cambiar el
 * estado (`gestion-leads-contacto.ts` explica por qué) y el panel se entera solo de los leads nuevos.
 * Lo que cuesta, en lecturas: el repintado del reloj, cero; el sondeo, una por minuto si no entra
 * nada. El cierre por inactividad (30 min) lo apaga todo: el panel no es una alarma, y lo dice.
 */

import { cargarAuth } from './auth';
import { cargarFirestore } from './gestion-firestore';
import { aCsv, nombreExport, type Columna } from '../lib/domain/csv';
// `haceCuanto` se mudó al dominio (§279): la necesita también la portada, y una página pública no
// debe importar del panel. Se RE-EXPORTA porque su prueba y el resto del panel la piden de aquí.
export { haceCuanto } from '../lib/domain/tiempo';
import { fechaDe, haceCuanto } from '../lib/domain/tiempo';
import { descargarTexto } from './descargar';
import { numeroWhatsApp } from '../lib/domain/telefono';
import { hoyEnCartagena } from '../lib/domain/reserva';
import { explicarNoContacto } from '../lib/domain/calendario-co';
import {
  aperturaSiguiente,
  cuandoColombia,
  ESTADOS_SIN_CONTACTO,
  fechaHoraColombia,
  horaColombia,
  MARGEN_FUTURO_MS,
  MINUTOS_SLA_LEAD,
  motivoFueraDeVentana,
  resumenSla,
  slaDeLead,
  textoCsvSla,
  textoDuracion,
  vistaSla,
  type ResumenSla,
} from '../lib/domain/lead-sla';
import { codigoDeError, marcarContactadoEn, type ResultadoContacto } from './gestion-leads-contacto';

/** Tope de la consulta. `limit()` es OBLIGATORIO en este proyecto: una query sin él es una cuota abierta. */
const TOPE = 50;

/** El reloj se repinta cada 30 s (sin lecturas) y se miran leads nuevos cada 60 s (1 lectura si no hay). */
const CADA_REPINTADO_MS = 30_000;
const CADA_SONDEO_MS = 60_000;
/** Cuánto espera el «Confirmar» del primer clic antes de volver a «Marcar contactado». */
const CONFIRMAR_MS = 6_000;

/** Lo último que se cargó. El export sale de AQUÍ y no de una segunda consulta. */
const cargados: Lead[] = [];

/**
 * ¿La última consulta tocó el tope? Lo necesita «Ver todo» para responder la verdad: con menos de
 * `TOPE` leads ya los estás viendo todos, y con el tope tocado hay más que esta tabla no trae.
 */
let tocoElTope = false;

/** ¿La última carga completa salió bien? Sin ella no hay tabla que ampliar ni cifras que dar. */
let tablaLista = false;
let relojId: number | undefined;
let sondeoId: number | undefined;
let sondeando = false;
let fallosSondeo = 0;
/** La última vez que se supo, de verdad, qué leads había. */
let ultimaLectura = 0;
let tituloBase: string | null = null;
/**
 * El `createdAt` CRUDO más reciente, tal como lo devolvió el SDK. Es el cursor del sondeo y NO se
 * reconstruye desde el `Date`: el servidor guarda microsegundos y un `Date` solo milisegundos, así
 * que «posterior a» un cursor redondeado devolvería el último lead una y otra vez.
 */
let cursor: import('firebase/firestore').Timestamp | null = null;
/** El mismo cursor sobre `updatedAt`: lo que cambió en leads que la tabla ya enseña. */
let cursorCambios: import('firebase/firestore').Timestamp | null = null;
/** El sondeo se paró por permisos o sesión: se dice en la nota, no se calla. */
let sondeoParado = false;

export interface Lead {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  origen: string;
  estado: string;
  zona: string;
  tipoInmueble: string;
  leadTier: string;
  createdAt: Date | null;
  /** Cuándo alguien del equipo lo marcó como contactado (hora del servidor). `null` = nadie. */
  contactadoAt: Date | null;
  /** La Function ya le puso puntaje: prueba de que el aviso por correo se INTENTÓ. */
  puntuado: boolean;
  /** El aviso por correo salió de verdad (`avisoEnviadoEl`, que solo se escribe si salió). */
  avisado: boolean;
}


const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Iniciales para el avatar de la fila. Dos letras como mucho, y nunca vacío. */
export function iniciales(nombre: string): string {
  const partes = nombre.split(/\s+/).filter(Boolean);
  if (!partes.length) return '·';
  const a = partes[0][0] ?? '';
  const b = partes.length > 1 ? partes[partes.length - 1][0] ?? '' : '';
  return (a + b).toUpperCase() || '·';
}


/** Etiqueta legible del origen. Lo que guarda el endpoint es una clave, no algo que se enseñe. */
export function etiquetaOrigen(origen: string): string {
  if (origen === 'portal-publicar') return 'Publicar';
  if (origen === 'portal-rango') return 'Rango';
  if (origen === 'portal-estancias') return 'Estancias';
  if (origen === 'web') return 'Web';
  return origen || '—';
}

/**
 * Estado del lead → color de la píldora. La paleta NO tiene rojo ni verde (disciplina de marca), así
 * que la jerarquía se hace con oro (requiere acción) y navy (en reposo).
 */
export function tonoEstado(estado: string): 'gold' | 'navy' {
  return ESTADOS_SIN_CONTACTO.includes(estado) ? 'gold' : 'navy';
}

/** Un lead marcado como contactado ya no pide acción, aunque su estado siga siendo «pendiente». */
const tonoDeLead = (l: Pick<Lead, 'estado' | 'contactadoAt'>): 'gold' | 'navy' =>
  l.contactadoAt ? 'navy' : tonoEstado(l.estado);

/**
 * Lo que se ENSEÑA del estado. El documento guarda una clave —y dos vocabularios: el del panel viejo
 * (`en_gestion`, `visita`) y el del modelo (`contactado`, `visita_agendada`…)—, y esa clave no es algo
 * que se le enseñe a nadie. El mapeo vive en la capa de lectura, como pide `crm.ts`: sin migrar datos.
 */
const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente: 'Nuevo',
  nuevo: 'Nuevo',
  en_gestion: 'Contactado',
  contactado: 'Contactado',
  calificado: 'Calificado',
  visita: 'Visita',
  visita_agendada: 'Visita agendada',
  visita_realizada: 'Visita hecha',
  oferta_presentada: 'Oferta',
  cerrado: 'Cerrado',
  nurturing: 'En seguimiento',
  descartado: 'Descartado',
};

export function etiquetaEstado(l: Pick<Lead, 'estado' | 'contactadoAt'>): string {
  // `contactadoAt` sin tocar el estado es justo lo que escribe «Marcar contactado» (§330).
  if (l.contactadoAt && ESTADOS_SIN_CONTACTO.includes(l.estado)) return 'Contactado';
  // `Object.hasOwn`: un estado `constructor` no es un estado.
  return Object.hasOwn(ETIQUETA_ESTADO, l.estado) ? ETIQUETA_ESTADO[l.estado] : l.estado || 'Nuevo';
}

export function normalizar(id: string, d: Record<string, unknown>): Lead {
  const extra = (d.datosExtra ?? {}) as Record<string, unknown>;
  return {
    id,
    nombre: texto(d.nombre) || 'Sin nombre',
    telefono: texto(d.telefono),
    email: texto(d.email),
    origen: texto(d.origen),
    estado: texto(d.estado) || 'pendiente',
    zona: texto(extra.zona) || texto(extra.ciudad),
    tipoInmueble: texto(extra.tipoInmueble),
    leadTier: texto(d.leadTier),
    // `createdAt` llega como Timestamp (Admin SDK / SDK cliente) o como string ISO (lo escribía el
    // endpoint del portal por REST). Asumir una sola forma es [[L-17]] esperando a pasar otra vez.
    createdAt: fechaDe(d.createdAt),
    contactadoAt: fechaDe(d.contactadoAt),
    puntuado: typeof d.leadScore === 'number',
    avisado: Boolean(d.avisoEnviadoEl),
  };
}

/**
 * ¿Los avisos por correo están saliendo? Se mira el lead más reciente que la Function ya puntuó: si
 * lo puntuó y no lo avisó, el correo no salió. Sin ningún lead puntuado no se afirma nada. Cero
 * lecturas: es lo que la tabla ya trajo.
 */
export function correoMudo(leads: readonly Pick<Lead, 'puntuado' | 'avisado'>[]): boolean {
  const ultimo = leads.find((l) => l.puntuado);
  return Boolean(ultimo && !ultimo.avisado);
}

/* ── La fila ──────────────────────────────────────────────────────────────────────────────── */

const temporizadores = new WeakMap<HTMLButtonElement, number>();

/** Vuelve el botón a su primer paso (si no está guardando). */
function desarmar(b: HTMLButtonElement): void {
  if (b.disabled) return;
  window.clearTimeout(temporizadores.get(b));
  delete b.dataset.paso;
  b.textContent = 'Marcar contactado';
  // El nombre accesible EMPIEZA por el texto visible (WCAG 2.5.3): quien dicta «Marcar contactado»
  // tiene que acertarle al botón.
  b.setAttribute('aria-label', `Marcar contactado: ${b.dataset.nombre ?? 'este lead'}`);
}

/** Por debajo de esto, el segundo clic es el mismo doble clic que armó el botón: no confirma. */
const DOBLE_CLIC_MS = 500;

/**
 * Primer paso: el botón pide confirmación. Con `conPlazo` vuelve solo a los 6 s (un clic suelto no
 * deja nada armado); sin él se queda esperando — es lo que pasa al pulsar el WhatsApp de ese lead:
 * quien vuelve a la pestaña tras escribirle tiene el «ya le escribí» a un clic, y la hora que se
 * registra se acerca a la del mensaje.
 */
function armar(b: HTMLButtonElement, conPlazo: boolean): void {
  if (b.disabled) return;
  window.clearTimeout(temporizadores.get(b));
  b.dataset.paso = 'confirmar';
  b.dataset.armadoEn = String(Date.now());
  b.textContent = 'Confirmar: ya le escribí';
  b.setAttribute('aria-label', `Confirmar: ya le escribí a ${b.dataset.nombre ?? 'este lead'}`);
  if (conPlazo) temporizadores.set(b, window.setTimeout(() => desarmar(b), CONFIRMAR_MS));
}

function botonContacto(lead: Lead): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'gx-link gx-link--btn';
  b.dataset.nombre = lead.nombre;
  desarmar(b);
  // Dos clics, y no uno: la marca es de una sola escritura (no se «desmarca»), así que un clic de
  // más sobre la fila equivocada no puede registrar un contacto que no ocurrió.
  // Y un DOBLE clic no son dos decisiones: el segundo llega a los pocos milisegundos y se ignora.
  b.addEventListener('click', () => {
    if (b.dataset.paso !== 'confirmar') armar(b, true);
    else if (Date.now() - Number(b.dataset.armadoEn ?? 0) >= DOBLE_CLIC_MS) void confirmarContacto(lead, b);
  });
  return b;
}

/** La celda del plazo. Se repinta sola cada 30 s; lleva `data-plazo` para encontrarla. */
function celdaPlazo(lead: Lead, ahora: number): HTMLElement {
  const s = slaDeLead(lead, ahora);
  const v = vistaSla(s, ahora, lead.contactadoAt);
  const entro = lead.createdAt
    ? `Entró ${haceCuanto(lead.createdAt)}${lead.origen ? ` por ${etiquetaOrigen(lead.origen)}` : ''}.`
    : 'No consta cuándo entró.';
  const celda = document.createElement('span');
  celda.dataset.plazo = '';
  celda.title = `${entro} ${v.titulo}`;
  if (v.texto === null) {
    // Sin veredicto: la celda dice lo de siempre, «hace 9 días». Con una hora que no vale (una fecha
    // futura), un guion: «ahora» sería afirmar una hora que nadie puso.
    celda.className = 'gx-val gx-r';
    celda.textContent = s.fase === 'sin-medir' && s.porque === 'sin-hora' ? '—' : haceCuanto(lead.createdAt);
    return celda;
  }
  celda.className = 'gx-cli gx-cli--apilada gx-r';
  const pill = document.createElement('span');
  pill.className = `gx-pill gx-pill--${v.tono}`;
  pill.textContent = v.texto;
  const hace = document.createElement('span');
  hace.className = 'gx-muted';
  hace.textContent = haceCuanto(lead.createdAt);
  celda.appendChild(pill);
  celda.appendChild(hace);
  return celda;
}

/** Fila de la tabla, con el MISMO markup que el resto del panel (clases `gx-*` del diseño sellado). */
function pintarFila(lead: Lead, ahora = Date.now()): HTMLElement {
  const fila = document.createElement('div');
  fila.className = 'gx-tr';
  fila.dataset.leadId = lead.id;

  const cli = document.createElement('div');
  cli.className = 'gx-cli';
  const ini = document.createElement('span');
  ini.className = 'gx-cli__ini';
  ini.textContent = iniciales(lead.nombre);
  const nom = document.createElement('span');
  nom.className = 'gx-cli__name';
  nom.textContent = lead.nombre;
  // La columna recorta los nombres largos con «…»: el completo, al pasar el ratón.
  nom.title = lead.nombre;
  // `appendChild` y no `append`: colisión de tipos de Workers ([[L-36]]).
  cli.appendChild(ini);
  cli.appendChild(nom);

  // El botón existe solo para quien puede escribir (las Rules se lo niegan al resto igual) y solo
  // mientras nadie lo ha marcado. Se crea antes que el enlace de WhatsApp porque éste lo arma.
  const boton =
    slaDeLead(lead, ahora).abierto && document.body.dataset.puedeEditar === 'true' ? botonContacto(lead) : null;

  // Contacto: enlace directo a WhatsApp con el nombre dentro. El asesor no debería tener que copiar
  // un número a mano — ese roce es la diferencia entre llamar en 5 minutos o en 5 horas.
  const contacto = document.createElement('span');
  contacto.className = 'gx-muted gx-ell';
  // El número internacional sale del dominio (`telefono.ts`): con los dígitos tal cual, un móvil de
  // 10 dígitos salía sin el 57 delante, y WhatsApp no abría el chat de nadie.
  const numero = lead.telefono ? numeroWhatsApp(lead.telefono) : null;
  if (lead.telefono && !numero) {
    // Sin país reconocible no se adivina: se enseña el número para llamarlo, sin un enlace que
    // abriría el chat de un desconocido.
    contacto.textContent = lead.telefono;
    contacto.title = 'No se pudo armar el enlace de WhatsApp: el número no dice de qué país es.';
  } else if (numero) {
    const wa = document.createElement('a');
    wa.className = 'gx-link';
    wa.href = `https://wa.me/${numero}?text=${encodeURIComponent(
      `Hola ${lead.nombre.split(/\s+/)[0]}, te escribo de ALTORRA Inmobiliaria.`,
    )}`;
    wa.rel = 'noopener';
    wa.target = '_blank';
    wa.textContent = lead.telefono;
    if (boton) wa.addEventListener('click', () => armar(boton, false));
    contacto.appendChild(wa);
  } else {
    contacto.textContent = lead.email || '—';
  }

  const zona = document.createElement('span');
  zona.className = 'gx-muted';
  zona.textContent = lead.zona || '—';

  const estado = document.createElement('span');
  estado.className = 'gx-cli gx-cli--apilada';
  const pill = document.createElement('span');
  pill.className = `gx-pill gx-pill--${tonoDeLead(lead)}`;
  pill.textContent = lead.leadTier ? `${etiquetaEstado(lead)} · ${lead.leadTier}` : etiquetaEstado(lead);
  estado.appendChild(pill);
  if (boton) estado.appendChild(boton);

  for (const n of [cli, contacto, zona, estado, celdaPlazo(lead, ahora)]) fila.appendChild(n);
  return fila;
}

/** Mensaje de una sola fila (vacío o error). Ocupa el ancho de la tabla y no se confunde con un dato. */
function pintarMensaje(txt: string): HTMLElement {
  const fila = document.createElement('div');
  fila.className = 'gx-tr gx-tr--msg';
  const span = document.createElement('span');
  span.className = 'gx-muted';
  span.textContent = txt;
  fila.appendChild(span);
  return fila;
}

/* ── Marcar contactado ────────────────────────────────────────────────────────────────────── */

const FALLO_CONTACTO: Record<'no-existe' | 'permiso' | 'red' | 'sesion', string> = {
  'no-existe': 'Ese lead ya no existe. Recarga la página.',
  permiso: 'Tu usuario no puede marcar leads. Si te acaban de dar permisos, cierra sesión y vuelve a entrar.',
  red: 'No se pudo guardar. Revisa la conexión y vuelve a intentarlo.',
  sesion: 'Tu sesión caducó. Recarga la página y vuelve a entrar.',
};

/** Una frase en la nota de la tabla (la misma que usa «Ver todo»): `role="status"`, se lee sola. */
function avisar(txt: string): void {
  const nota = document.getElementById('gx-leads-nota');
  if (!nota) return;
  nota.textContent = txt;
  nota.hidden = false;
}

async function marcarContactado(id: string): Promise<{ r: ResultadoContacto; uid: string }> {
  try {
    const { auth } = await cargarAuth();
    const uid = auth.currentUser?.uid ?? '';
    const { db, mod } = await cargarFirestore();
    return { r: await marcarContactadoEn(mod, db, id, uid), uid };
  } catch {
    return { r: { ok: false, motivo: 'red' }, uid: '' };
  }
}

/** `quien` = el uid que ya lo había marcado (solo con «ya»); `yo` = el de quien mira. */
function mensajeContacto(lead: Lead, ya: boolean, quien: string | null = null, yo = ''): string {
  if (ya) {
    const cuando = lead.contactadoAt ? ` (${fechaHoraColombia(lead.contactadoAt.getTime())})` : '';
    // Solo se dice «otra persona» cuando consta que no fue quien mira.
    if (quien && yo && quien === yo) return `Ya habías marcado a ${lead.nombre} como contactado${cuando}.`;
    if (quien && yo) return `${lead.nombre} ya estaba marcado como contactado por otra persona del equipo${cuando}.`;
    return `${lead.nombre} ya estaba marcado como contactado${cuando}.`;
  }
  const s = slaDeLead(lead, Date.now());
  if (s.fase !== 'contactado') return `${lead.nombre}: marcado como contactado.`;
  return s.aTiempo
    ? `${lead.nombre}: contactado a tiempo.`
    : `${lead.nombre}: contactado ${textoDuracion(s.retrasoMs)} después del plazo de ${MINUTOS_SLA_LEAD} minutos.`;
}

async function confirmarContacto(lead: Lead, b: HTMLButtonElement): Promise<void> {
  window.clearTimeout(temporizadores.get(b));
  b.disabled = true;
  b.textContent = 'Guardando…';
  b.setAttribute('aria-label', `Guardando: ${lead.nombre}`);
  const { r, uid } = await marcarContactado(lead.id);
  if (r.ok || r.motivo === 'ya') {
    if (!r.contactadoAt) {
      // Se guardó, pero no se pudo leer la hora del servidor: se recarga antes que suponerla.
      avisar(`${lead.nombre}: guardado. Recargo la bandeja para ver la hora.`);
      void montarLeads();
      return;
    }
    lead.contactadoAt = r.contactadoAt;
    b.closest<HTMLElement>('[data-lead-id]')?.replaceWith(pintarFila(lead));
    avisar(r.ok ? mensajeContacto(lead, false) : mensajeContacto(lead, true, r.contactadoPor, uid));
    refrescarTablero();
    return;
  }
  b.disabled = false;
  desarmar(b);
  avisar(FALLO_CONTACTO[r.motivo]);
}

/**
 * Columnas del export de leads.
 *
 * ⚠️ Este archivo lleva DATOS PERSONALES de gente real: nombre, teléfono y correo de quien escribió
 * al portal. Sale del navegador del equipo a su disco y no pasa por ningún sitio más — pero una vez
 * descargado ya es responsabilidad de quien lo tenga (Habeas Data, Ley 1581). Por eso el nombre del
 * archivo dice qué es: nadie debería encontrárselo en Descargas y no saber que son personas.
 *
 * El escapado anti-fórmula de `campoCsv` importa aquí MÁS que en inmuebles: estos campos los teclea
 * un desconocido en un formulario público.
 *
 * Las fechas van en hora de COLOMBIA: en UTC, un lead de las 8 de la noche salía con el día siguiente.
 */
const COLUMNAS_LEAD: Columna<Lead>[] = [
  { titulo: 'Lead', valor: (l) => l.id },
  { titulo: 'Nombre', valor: (l) => l.nombre },
  { titulo: 'Teléfono', valor: (l) => l.telefono },
  { titulo: 'Email', valor: (l) => l.email },
  { titulo: 'Origen', valor: (l) => etiquetaOrigen(l.origen) },
  { titulo: 'Estado', valor: (l) => etiquetaEstado(l) },
  { titulo: 'Zona', valor: (l) => l.zona },
  { titulo: 'Tipo', valor: (l) => l.tipoInmueble },
  { titulo: 'Calidad', valor: (l) => l.leadTier },
  { titulo: 'Entró el', valor: (l) => (l.createdAt ? hoyEnCartagena(l.createdAt) : undefined) },
  {
    titulo: 'Contactado el',
    valor: (l) => (l.contactadoAt ? `${hoyEnCartagena(l.contactadoAt)} ${horaColombia(l.contactadoAt.getTime())}` : undefined),
  },
  { titulo: `Plazo de ${MINUTOS_SLA_LEAD} min`, valor: (l) => textoCsvSla(slaDeLead(l, Date.now())) },
];

/** Cablea el export de leads. */
export function montarExportLeads(): void {
  document.getElementById('gx-leads-export')?.addEventListener('click', () => {
    if (!cargados.length) return;
    descargarTexto(nombreExport('leads-datos-personales'), aCsv(cargados, COLUMNAS_LEAD));
  });
}

/**
 * «Ver todo» — antes era un `<a href="#">` que NADIE escuchaba: pulsarlo no hacía nada y encima
 * saltaba al principio de la página.
 *
 * No se convierte en paginación porque no la hay (ni mockup para diseñarla), y la consulta está
 * topada a 50 a propósito: `limit()` es obligatorio en este proyecto y una tabla sin tope es una
 * cuota abierta. Lo que sí se puede hacer es DECIR la verdad, que depende de si el tope se tocó.
 * Un control que explica por qué no puede hacer más es honesto; uno que no responde, no.
 */
export function montarVerTodoLeads(): void {
  const nota = document.getElementById('gx-leads-nota');
  document.getElementById('gx-leads-vertodo')?.addEventListener('click', () => {
    if (!nota) return;
    nota.textContent = !cargados.length
      ? 'Todavía no hay leads que mostrar.'
      : tocoElTope
        ? `Esta tabla trae los ${TOPE} más recientes, y hay más. Para verlos todos usa «Exportar CSV»: sale el mismo listado, completo y con los datos de contacto.`
        : `Ya los estás viendo todos: son ${cargados.length}. Cuando pasen de ${TOPE}, esta tabla mostrará solo los más recientes y te lo dirá aquí.`;
    nota.hidden = false;
  });
}

/* ══ LO QUE SE DERIVA DE LOS MISMOS LEADS (§275) ═══════════════════════════════════════════════
 *
 * «Actividad reciente» y «Zonas más pedidas» servían datos INVENTADOS del mockup —«Cierre
 * confirmado · Casa Crespo por $760M», «Bocagrande 92%»— en el panel de administración. Una cifra
 * falsa aquí es peor que en el portal público: aquí alguien DECIDE con ella.
 *
 * 🎯 Y se calculan sobre `cargados`, el snapshot que la tabla ya trajo, no con consultas nuevas.
 * El free-tier de este proyecto es una restricción de diseño, no una preferencia: dos paneles más
 * son dos consultas más EN CADA CARGA del panel, todos los días, para responder algo que ya está
 * en memoria. Lo barato y lo correcto coinciden aquí.
 */

export interface ZonaConteo {
  zona: string;
  n: number;
}

/**
 * Cuántos leads ha traído cada zona, de mayor a menor.
 *
 * Los que llegan sin zona **se agrupan y se dicen** en vez de descartarse: si el formulario deja de
 * capturarla, el panel tiene que enseñar ese agujero, no esconderlo bajo un reparto que parece
 * completo. El desempate por nombre hace el orden determinista — sin él, dos zonas empatadas
 * cambiarían de sitio entre cargas y la prueba no podría afirmar nada.
 */
export function zonasDeLeads(leads: readonly Lead[], tope = 4): ZonaConteo[] {
  const cuenta = new Map<string, number>();
  for (const l of leads) {
    const z = (l.zona || '').trim() || 'Sin zona';
    cuenta.set(z, (cuenta.get(z) ?? 0) + 1);
  }
  return [...cuenta.entries()]
    .map(([zona, n]) => ({ zona, n }))
    .sort((a, b) => b.n - a.n || a.zona.localeCompare(b.zona, 'es'))
    .slice(0, tope);
}

/** Un párrafo de estado, con la clase que ya usa el panel para lo vacío. */
function parrafo(texto: string): HTMLParagraphElement {
  const p = document.createElement('p');
  p.className = 'gx-vacio';
  p.textContent = texto;
  return p;
}

/**
 * «Actividad reciente» = los leads más recientes, contados como lo que son.
 *
 * ⚠️ Solo se toca el juego del ADMIN. Los otros dos roles llevan, desde el build, un mensaje que
 * dice que no están conectados — y borrarlo para dejarlos en blanco cambiaría una explicación por
 * un silencio. (§266 obligaba a barrer TODOS los juegos porque el build servía ficción en los tres;
 * arreglado el build, esa barrida ya no hace falta: la regla era «que no quede ficción», no «que
 * el script toque todo».)
 */
export function montarActividad(leads: readonly Lead[]): void {
  const set = document.querySelector<HTMLElement>('.gx-act-set[data-set="admin"]');
  if (!set) return;
  if (!leads.length) {
    set.replaceChildren(parrafo('Todavía no hay actividad que mostrar.'));
    return;
  }
  const frag = document.createDocumentFragment();
  for (const lead of leads.slice(0, 5)) {
    const fila = document.createElement('div');
    fila.className = 'gx-act';
    const punto = document.createElement('span');
    punto.className = `gx-dot gx-dot--${tonoDeLead(lead)}`;
    const cuerpo = document.createElement('div');
    const txt = document.createElement('div');
    txt.className = 'gx-act__txt';
    // Se dice el HECHO que consta —llegó un lead— y no una interpretación de su estado. El origen
    // va porque es lo que decide a quién se le responde primero y cómo.
    txt.textContent = `${etiquetaOrigen(lead.origen)} · ${lead.nombre}${lead.zona ? ` · ${lead.zona}` : ''}`;
    const hora = document.createElement('div');
    hora.className = 'gx-act__time';
    hora.textContent = haceCuanto(lead.createdAt);
    cuerpo.appendChild(txt);
    cuerpo.appendChild(hora);
    fila.appendChild(punto);
    fila.appendChild(cuerpo);
    frag.appendChild(fila);
  }
  set.replaceChildren(frag);
}

/**
 * «Zonas más pedidas» — la barra es proporcional a la zona LÍDER y la etiqueta lleva el número
 * absoluto.
 *
 * 🎯 Esto no es un porcentaje a propósito. El mockup dibujaba «Bocagrande 92%», que se lee como una
 * cuota de mercado que ALTORRA no puede medir. Lo que sí consta es cuántos leads propios ha traído
 * cada zona; con el número al lado, el largo de la barra dice exactamente lo que parece decir.
 * Y se publica el DENOMINADOR: un reparto sin decir sobre cuántos se calcula deja creer que es
 * sobre todo el histórico cuando son los últimos que cupieron en la consulta.
 */
export function montarZonas(leads: readonly Lead[]): void {
  const caja = document.getElementById('gx-zonas');
  const base = document.getElementById('gx-zonas-base');
  if (!caja) return;
  const zonas = zonasDeLeads(leads);
  if (!zonas.length) {
    caja.replaceChildren(parrafo('Todavía no hay leads de los que sacar zonas.'));
    if (base) base.textContent = 'Se calcula con los leads recibidos.';
    return;
  }
  if (base) {
    base.textContent = `De los ${leads.length} lead${leads.length === 1 ? '' : 's'} más recientes.`;
  }
  const max = zonas[0].n;
  const frag = document.createDocumentFragment();
  for (const z of zonas) {
    const fila = document.createElement('div');
    fila.className = 'gx-dem__row';
    const lbl = document.createElement('div');
    lbl.className = 'gx-dem__lbl';
    const nombre = document.createElement('span');
    nombre.textContent = z.zona;
    const n = document.createElement('span');
    n.textContent = `${z.n}`;
    lbl.appendChild(nombre);
    lbl.appendChild(n);
    const pista = document.createElement('div');
    pista.className = 'gx-dem__track';
    const relleno = document.createElement('span');
    relleno.className = 'gx-dem__fill';
    relleno.style.width = `${Math.round((z.n / max) * 100)}%`;
    pista.appendChild(relleno);
    fila.appendChild(lbl);
    fila.appendChild(pista);
    frag.appendChild(fila);
  }
  caja.replaceChildren(frag);
}

/* ── Carga, reloj y sondeo ────────────────────────────────────────────────────────────────── */

const conjuntoAdmin = (): HTMLElement | null => document.querySelector<HTMLElement>('.gx-row-set[data-set="admin"]');

/**
 * ⚠️ Un `orderBy` EXCLUYE los documentos que no tengan ese campo — no falla, simplemente no aparecen.
 * Si algún día un lead entra sin `createdAt`, sería invisible aquí y nadie lo sabría. Hoy los dos
 * caminos que escriben leads lo ponen siempre (`api/solicitud.ts` y el legacy); si eso cambia, esta
 * consulta es el sitio donde se pierde.
 */
function consultaInicial(mod: typeof import('firebase/firestore'), db: import('firebase/firestore').Firestore) {
  return mod.query(mod.collection(db, 'solicitudes'), mod.orderBy('createdAt', 'desc'), mod.limit(TOPE));
}

type Ts = import('firebase/firestore').Timestamp;
type Docs = readonly import('firebase/firestore').QueryDocumentSnapshot[];

/**
 * El valor crudo más reciente de `campo` entre estos documentos y el cursor `actual` (solo
 * Timestamps). Lo que va más de 10 minutos por delante del reloj NO cuenta: el `create` de las Rules
 * es anónimo y no mira la fecha, y un solo lead fechado en 2099 dejaría el sondeo ciego para siempre
 * —sin error, así que ni la nota de alerta lo diría—, también tras recargar.
 */
function masReciente(docs: Docs, campo: 'createdAt' | 'updatedAt', actual: Ts | null, mod: typeof import('firebase/firestore')): Ts | null {
  const tope = Date.now() + MARGEN_FUTURO_MS;
  let r = actual;
  for (const d of docs) {
    const v: unknown = d.get(campo);
    if (!(v instanceof mod.Timestamp) || v.toMillis() > tope) continue;
    if (!r || v.seconds > r.seconds || (v.seconds === r.seconds && v.nanoseconds > r.nanoseconds)) r = v;
  }
  return r;
}

/**
 * Aplica lo que cambió en leads que la tabla YA enseña —otra persona lo marcó, o el panel viejo le
 * cambió el estado— y repinta solo esas filas. Sin esto, el lead que atendió un compañero seguía
 * «Vencido» en las demás pantallas abiertas, invitando a escribirle dos veces.
 */
function aplicarCambios(docs: Docs): void {
  const conjunto = conjuntoAdmin();
  if (!conjunto) return;
  let hubo = false;
  for (const d of docs) {
    const i = cargados.findIndex((l) => l.id === d.id);
    if (i < 0) continue;
    const nuevo = normalizar(d.id, d.data() as Record<string, unknown>);
    const viejo = cargados[i];
    if (nuevo.estado === viejo.estado && nuevo.contactadoAt?.getTime() === viejo.contactadoAt?.getTime()) continue;
    cargados[i] = nuevo;
    conjunto.querySelector(`[data-lead-id="${CSS.escape(d.id)}"]`)?.replaceWith(pintarFila(nuevo));
    hubo = true;
  }
  if (hubo) {
    montarActividad(cargados);
    refrescarTablero();
  }
}

/** Pinta la tabla entera desde una carga completa. */
function pintarTodo(leads: Lead[], toco: boolean): void {
  const conjunto = conjuntoAdmin();
  if (!conjunto) return;
  cargados.length = 0;
  cargados.push(...leads);
  tocoElTope = toco;
  tablaLista = true;
  ultimaLectura = Date.now();
  if (!leads.length) {
    conjunto.replaceChildren(
      pintarMensaje('Todavía no ha entrado ningún lead. Cuando alguien deje sus datos en el portal, aparece aquí.'),
    );
  } else {
    const ahora = Date.now();
    conjunto.replaceChildren(...leads.map((l) => pintarFila(l, ahora)));
  }
  montarActividad(leads);
  montarZonas(leads);
  refrescarTablero();
}

/**
 * Mete arriba los leads que entraron con el panel abierto, sin repintar la tabla: el botón que
 * alguien tenía armado en otra fila sigue armado. Si se pasa del tope, sale el más viejo.
 */
function incorporar(nuevos: Lead[], desbordo: boolean): void {
  const conjunto = conjuntoAdmin();
  if (!conjunto) return;
  if (!cargados.length) conjunto.replaceChildren(); // quita el «todavía no ha entrado ningún lead»
  const ahora = Date.now();
  const primero = conjunto.firstChild;
  for (const l of nuevos) conjunto.insertBefore(pintarFila(l, ahora), primero);
  cargados.unshift(...nuevos);
  if (desbordo || cargados.length > TOPE) {
    tocoElTope = true;
    for (const fuera of cargados.splice(TOPE)) {
      conjunto.querySelector(`[data-lead-id="${CSS.escape(fuera.id)}"]`)?.remove();
    }
  }
  montarActividad(cargados);
  montarZonas(cargados);
  refrescarTablero(ahora);
}

/** Repinta SOLO la celda del plazo de cada fila: no pierde el foco ni un botón armado. 0 lecturas. */
function refrescarPlazos(): void {
  const conjunto = conjuntoAdmin();
  if (!conjunto) return;
  const ahora = Date.now();
  const porId = new Map(cargados.map((l) => [l.id, l]));
  for (const fila of conjunto.querySelectorAll<HTMLElement>('[data-lead-id]')) {
    const lead = porId.get(fila.dataset.leadId ?? '');
    const celda = fila.querySelector('[data-plazo]');
    if (lead && celda) celda.replaceWith(celdaPlazo(lead, ahora));
  }
  refrescarTablero(ahora);
}

/**
 * Mira si entraron leads nuevos y si cambió alguno de los que ya se ven. Con la tabla cargada pide
 * SOLO lo posterior a cada cursor (una lectura por consulta si no hay nada); si la carga había
 * fallado, repite la consulta completa, que es la forma de recuperarse sin que nadie pulse nada.
 *
 * `getDocsFromServer` y no `getDocs`: sin red, `getDocs` responde con la caché —vacía— como si no
 * hubiera nada nuevo, y el panel diría que vigila cuando no puede.
 */
async function buscarNuevos(): Promise<void> {
  if (sondeando || sondeoId === undefined) return;
  // Con leads en la tabla pero ninguno con Timestamp no hay cursor fiable: repetir la consulta
  // completa costaría 50 lecturas por minuto. Se deja de sondear antes que pagar eso.
  if (tablaLista && !cursor && cargados.length) return;
  sondeando = true;
  try {
    const { db, mod } = await cargarFirestore();
    const col = mod.collection(db, 'solicitudes');
    if (!tablaLista || !cursor) {
      const snap = await mod.getDocsFromServer(consultaInicial(mod, db));
      cursor = masReciente(snap.docs, 'createdAt', cursor, mod);
      cursorCambios = masReciente(snap.docs, 'updatedAt', cursorCambios, mod);
      if (!tablaLista || snap.size) {
        pintarTodo(snap.docs.map((d) => normalizar(d.id, d.data() as Record<string, unknown>)), snap.size >= TOPE);
      }
    } else {
      const snap = await mod.getDocsFromServer(
        mod.query(col, mod.where('createdAt', '>', cursor), mod.orderBy('createdAt', 'desc'), mod.limit(TOPE)),
      );
      cursor = masReciente(snap.docs, 'createdAt', cursor, mod);
      const conocidos = new Set(cargados.map((l) => l.id));
      const nuevos = snap.docs
        .filter((d) => !conocidos.has(d.id))
        .map((d) => normalizar(d.id, d.data() as Record<string, unknown>));
      if (nuevos.length) incorporar(nuevos, snap.size >= TOPE);
      // Lo que cambió en los que ya se ven. Todo el que toca un lead escribe `updatedAt` (este panel,
      // el viejo y el endpoint al crearlo); sin cursor de cambios, esta parte se omite.
      if (cursorCambios) {
        const cambios = await mod.getDocsFromServer(
          mod.query(col, mod.where('updatedAt', '>', cursorCambios), mod.orderBy('updatedAt', 'desc'), mod.limit(TOPE)),
        );
        cursorCambios = masReciente(cambios.docs, 'updatedAt', cursorCambios, mod);
        aplicarCambios(cambios.docs);
      }
    }
    fallosSondeo = 0;
    ultimaLectura = Date.now();
  } catch (e) {
    // Sin permisos (o sin sesión) no tiene sentido insistir cada minuto: se para — y SE DICE, o el
    // título «(N)» y las pastillas seguirían corriendo como si el panel vigilara.
    const c = codigoDeError(e);
    if (c === 'permission-denied' || c === 'unauthenticated') {
      window.clearInterval(sondeoId);
      sondeoId = undefined;
      sondeoParado = true;
    } else {
      fallosSondeo += 1;
    }
    console.warn('[gestion] sondeo de leads:', e);
  } finally {
    sondeando = false;
    pintarAlerta();
  }
}

/** Enciende el reloj y el sondeo, UNA vez por página. */
function iniciarReloj(): void {
  if (relojId !== undefined) return;
  relojId = window.setInterval(refrescarPlazos, CADA_REPINTADO_MS);
  sondeoId = window.setInterval(() => void buscarNuevos(), CADA_SONDEO_MS);
  // Al volver a la pestaña el reloj se pone al día enseguida (en segundo plano el navegador espacia
  // los temporizadores). No es un `pointermove` ni un observador: un evento por cambio de pestaña.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    refrescarPlazos();
    if (Date.now() - ultimaLectura > CADA_SONDEO_MS / 2) void buscarNuevos();
  });
}

/* ── Tablero: KPI, título de la pestaña y la nota de alerta ───────────────────────────────── */

function refrescarTablero(ahora = Date.now()): void {
  const r = tablaLista ? resumenSla(cargados, ahora) : null;
  actualizarKpi(r, tocoElTope);
  actualizarTitulo(r);
  pintarAlerta(ahora);
}

/**
 * KPI de leads sin contactar, SOLO en el juego del admin (el «Mis leads» del aliado, oculto, no es
 * esta cifra). Con el tope tocado se dice sobre cuántos se cuenta, en vez del «50+» de antes —que
 * salía aunque hubiera 3 sin contactar—. La pastilla dice lo urgente: vencidos, o en plazo.
 * Se reescribe en cada repintado porque el tablero general la retira al montarse.
 */
function actualizarKpi(r: ResumenSla | null, tope: boolean): void {
  for (const k of document.querySelectorAll<HTMLElement>('.gx-kpi-set[data-set="admin"] .gx-kpi')) {
    const lbl = k.querySelector<HTMLElement>('.gx-kpi__lbl');
    if (!/leads/i.test(lbl?.textContent ?? '')) continue;
    const valor = k.querySelector<HTMLElement>('.gx-kpi__val');
    if (valor) valor.textContent = r ? String(r.sinContactar) : '—';
    if (lbl) lbl.textContent = tope ? `Leads sin contactar · de los ${TOPE} más recientes` : 'Leads sin contactar';
    k.querySelector('.gx-kpi__trend')?.remove();
    const txt = !r
      ? ''
      : r.vencidos
        ? `${r.vencidos} vencido${r.vencidos === 1 ? '' : 's'}`
        : r.enPlazo
          ? `${r.enPlazo} en plazo`
          : '';
    if (txt) {
      const p = document.createElement('span');
      p.className = 'gx-kpi__trend';
      p.textContent = txt;
      k.querySelector('.gx-kpi__top')?.appendChild(p);
    }
  }
}

/** «(2) Gestión…»: los leads que corren o vencieron, para verlos con la pestaña en segundo plano. */
function actualizarTitulo(r: ResumenSla | null): void {
  if (tituloBase === null) tituloBase = document.title;
  const n = r ? r.enPlazo + r.vencidos : 0;
  document.title = n ? `(${n}) ${tituloBase}` : tituloBase;
}

/**
 * Lo que hay que saber para cumplir el plazo y no se ve en la tabla: si ahora se puede escribir, si
 * los correos de aviso están saliendo y si el panel ha perdido la pista de los leads nuevos.
 */
function pintarAlerta(ahora = Date.now()): void {
  const p = document.getElementById('gx-leads-alerta');
  if (!p) return;
  const frases: string[] = [];
  const m = motivoFueraDeVentana(ahora);
  if (m) {
    frases.push(
      `${explicarNoContacto(m)} El plazo de ${MINUTOS_SLA_LEAD} minutos queda en pausa y sigue ${cuandoColombia(aperturaSiguiente(ahora), ahora)}.`,
    );
  }
  if (correoMudo(cargados)) {
    frases.push(
      `Los avisos de leads nuevos por correo no están saliendo: mientras tanto, el plazo de ${MINUTOS_SLA_LEAD} minutos depende de tener este panel abierto.`,
    );
  }
  if (sondeoParado) {
    frases.push('Dejé de comprobar si entran leads nuevos: tu sesión se cerró o cambió tu permiso. Recarga la página.');
  } else if (fallosSondeo >= 3) {
    // Sin ninguna lectura buena no hay «desde las…» que decir: poner la hora actual sería inventarla.
    frases.push(
      ultimaLectura
        ? `No pude comprobar si entraron leads nuevos desde las ${horaColombia(ultimaLectura)}. Si sigue así, recarga la página.`
        : 'No he podido comprobar los leads desde que abriste el panel. Recarga la página.',
    );
  }
  // Se reescribe solo si cambió: es `role="status"`, y repetir la misma frase cada 30 s es ruido
  // para quien usa lector de pantalla.
  const texto = frases.join(' ');
  if (p.textContent !== texto) p.textContent = texto;
  p.hidden = !frases.length;
}

/**
 * Monta la bandeja. La llama el panel DESPUÉS de confirmar que quien mira es del equipo — no antes:
 * pedir datos que las Rules van a denegar solo sirve para ensuciar la consola.
 */
export async function montarLeads(): Promise<void> {
  const conjunto = conjuntoAdmin();
  const cabecera = document.querySelector<HTMLElement>('.gx-tr--head');
  const titulo = document.getElementById('gx-table-title');
  if (!conjunto) return;

  // La cabecera del mockup habla de inmuebles; esta tabla habla de leads.
  if (cabecera) {
    const celdas = ['Cliente', 'Contacto', 'Zona', 'Estado', 'Recibido · plazo'];
    cabecera.querySelectorAll('span').forEach((s, i) => {
      if (celdas[i]) s.textContent = celdas[i];
    });
  }
  if (titulo) titulo.textContent = 'Leads recibidos';

  conjunto.replaceChildren(pintarMensaje('Cargando leads…'));

  try {
    const { db, mod } = await cargarFirestore();
    const snap = await mod.getDocs(consultaInicial(mod, db));
    cursor = masReciente(snap.docs, 'createdAt', null, mod);
    cursorCambios = masReciente(snap.docs, 'updatedAt', null, mod);
    pintarTodo(snap.docs.map((d) => normalizar(d.id, d.data() as Record<string, unknown>)), snap.size >= TOPE);
  } catch (e) {
    // FALLA RUIDOSO y, sobre todo, BORRA lo que hubiera: dejar los leads de muestra a la vista sería
    // que alguien llamara a personas que no existen.
    tablaLista = false;
    cargados.length = 0;
    conjunto.replaceChildren(
      pintarMensaje('No pudimos cargar los leads. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.'),
    );
    // Los dos paneles derivados cuelgan de estos leads: si no llegaron, tampoco pueden decir nada.
    // Se vacian con su mensaje en vez de dejarlos girando — un «Cargando…» eterno se lee como que
    // el dato viene, y aqui ya sabemos que no.
    montarActividad([]);
    montarZonas([]);
    refrescarTablero();
    console.error('[gestion] leads:', e);
  }
  iniciarReloj();
}
