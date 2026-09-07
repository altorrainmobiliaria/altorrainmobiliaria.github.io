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
 */

import { cargarAuth } from './auth';
import { aCsv, nombreExport, type Columna } from '../lib/domain/csv';
// `haceCuanto` se mudó al dominio (§279): la necesita también la portada, y una página pública no
// debe importar del panel. Se RE-EXPORTA porque su prueba y el resto del panel la piden de aquí.
export { haceCuanto } from '../lib/domain/tiempo';
import { haceCuanto } from '../lib/domain/tiempo';
import { descargarTexto } from './descargar';

/** Tope de la consulta. `limit()` es OBLIGATORIO en este proyecto: una query sin él es una cuota abierta. */
const TOPE = 50;

/** Lo último que se cargó. El export sale de AQUÍ y no de una segunda consulta. */
const cargados: Lead[] = [];

/**
 * ¿La última consulta tocó el tope? Lo necesita «Ver todo» para responder la verdad: con menos de
 * `TOPE` leads ya los estás viendo todos, y con el tope tocado hay más que esta tabla no trae.
 */
let tocoElTope = false;

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
}

/** Carga Firestore reusando la app que ya inicializó Auth (no se inicializa dos veces). */
async function cargarFirestore() {
  const { app } = await cargarAuth();
  const mod = await import('firebase/firestore');
  return { db: mod.getFirestore(app), mod };
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
  if (origen === 'web') return 'Web';
  return origen || '—';
}

/**
 * Estado del lead → color de la píldora. La paleta NO tiene rojo ni verde (disciplina de marca), así
 * que la jerarquía se hace con oro (requiere acción) y navy (en reposo).
 */
export function tonoEstado(estado: string): 'gold' | 'navy' {
  return estado === 'pendiente' || estado === '' ? 'gold' : 'navy';
}

export function normalizar(id: string, d: Record<string, unknown>): Lead {
  const extra = (d.datosExtra ?? {}) as Record<string, unknown>;
  const ts = d.createdAt as { toDate?: () => Date } | string | undefined;
  let fecha: Date | null = null;
  // `createdAt` llega como Timestamp (Admin SDK / SDK cliente) o como string ISO (lo escribe el
  // endpoint del portal por REST). Asumir una sola forma es [[L-17]] esperando a pasar otra vez.
  if (ts && typeof ts === 'object' && typeof ts.toDate === 'function') fecha = ts.toDate();
  else if (typeof ts === 'string' && Number.isFinite(Date.parse(ts))) fecha = new Date(ts);

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
    createdAt: fecha,
  };
}

/** Fila de la tabla, con el MISMO markup que el resto del panel (clases `gx-*` del diseño sellado). */
function pintarFila(lead: Lead): HTMLElement {
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
  // `appendChild` y no `append`: colisión de tipos de Workers ([[L-36]]).
  cli.appendChild(ini);
  cli.appendChild(nom);

  // Contacto: enlace directo a WhatsApp con el nombre dentro. El asesor no debería tener que copiar
  // un número a mano — ese roce es la diferencia entre llamar en 5 minutos o en 5 horas.
  const contacto = document.createElement('span');
  contacto.className = 'gx-muted gx-ell';
  if (lead.telefono) {
    const wa = document.createElement('a');
    wa.className = 'gx-link';
    wa.href = `https://wa.me/${lead.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
      `Hola ${lead.nombre.split(/\s+/)[0]}, te escribo de ALTORRA Inmobiliaria.`,
    )}`;
    wa.rel = 'noopener';
    wa.target = '_blank';
    wa.textContent = lead.telefono;
    contacto.appendChild(wa);
  } else {
    contacto.textContent = lead.email || '—';
  }

  const zona = document.createElement('span');
  zona.className = 'gx-muted';
  zona.textContent = lead.zona || '—';

  const estado = document.createElement('span');
  const pill = document.createElement('span');
  pill.className = `gx-pill gx-pill--${tonoEstado(lead.estado)}`;
  pill.textContent = lead.leadTier ? `${lead.estado} · ${lead.leadTier}` : lead.estado;
  estado.appendChild(pill);

  const cuando = document.createElement('span');
  cuando.className = 'gx-val gx-r';
  cuando.textContent = haceCuanto(lead.createdAt);
  cuando.title = etiquetaOrigen(lead.origen);

  for (const n of [cli, contacto, zona, estado, cuando]) fila.appendChild(n);
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

/**
 * Monta la bandeja. La llama el panel DESPUÉS de confirmar que quien mira es del equipo — no antes:
 * pedir datos que las Rules van a denegar solo sirve para ensuciar la consola.
 */
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
 */
const COLUMNAS_LEAD: Columna<Lead>[] = [
  { titulo: 'Lead', valor: (l) => l.id },
  { titulo: 'Nombre', valor: (l) => l.nombre },
  { titulo: 'Teléfono', valor: (l) => l.telefono },
  { titulo: 'Email', valor: (l) => l.email },
  { titulo: 'Origen', valor: (l) => etiquetaOrigen(l.origen) },
  { titulo: 'Estado', valor: (l) => l.estado },
  { titulo: 'Zona', valor: (l) => l.zona },
  { titulo: 'Tipo', valor: (l) => l.tipoInmueble },
  { titulo: 'Calidad', valor: (l) => l.leadTier },
  { titulo: 'Entró el', valor: (l) => l.createdAt?.toISOString().slice(0, 10) },
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
    punto.className = `gx-dot gx-dot--${tonoEstado(lead.estado)}`;
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

export async function montarLeads(): Promise<void> {
  const conjunto = document.querySelector<HTMLElement>('.gx-row-set[data-set="admin"]');
  const cabecera = document.querySelector<HTMLElement>('.gx-tr--head');
  const titulo = document.getElementById('gx-table-title');
  if (!conjunto) return;

  // La cabecera del mockup habla de inmuebles; esta tabla habla de leads.
  if (cabecera) {
    const celdas = ['Cliente', 'Contacto', 'Zona', 'Estado', 'Recibido'];
    cabecera.querySelectorAll('span').forEach((s, i) => {
      if (celdas[i]) s.textContent = celdas[i];
    });
  }
  if (titulo) titulo.textContent = 'Leads recibidos';

  conjunto.replaceChildren(pintarMensaje('Cargando leads…'));

  try {
    const { db, mod } = await cargarFirestore();
    // ⚠️ Un `orderBy` EXCLUYE los documentos que no tengan ese campo — no falla, simplemente no
    // aparecen. Si algún día un lead entra sin `createdAt`, sería invisible aquí y nadie lo sabría.
    // Hoy los dos caminos que escriben leads lo ponen siempre (`api/solicitud.ts` y el legacy); si eso
    // cambia, esta consulta es el sitio donde se pierde.
    const q = mod.query(
      mod.collection(db, 'solicitudes'),
      mod.orderBy('createdAt', 'desc'),
      mod.limit(TOPE),
    );
    const snap = await mod.getDocs(q);

    if (snap.empty) {
      cargados.length = 0;
      conjunto.replaceChildren(
        pintarMensaje('Todavía no ha entrado ningún lead. Cuando alguien deje sus datos en el portal, aparece aquí.'),
      );
      tocoElTope = false;
      actualizarKpi(0, false);
      montarActividad([]);
      montarZonas([]);
      return;
    }

    const leads = snap.docs.map((d) => normalizar(d.id, d.data() as Record<string, unknown>));
    cargados.length = 0;
    cargados.push(...leads);
    conjunto.replaceChildren(...leads.map(pintarFila));
    tocoElTope = snap.size >= TOPE;
    actualizarKpi(leads.filter((l) => l.estado === 'pendiente').length, tocoElTope);
    montarActividad(leads);
    montarZonas(leads);
  } catch (e) {
    // FALLA RUIDOSO y, sobre todo, BORRA lo que hubiera: dejar los leads de muestra a la vista sería
    // que alguien llamara a personas que no existen.
    conjunto.replaceChildren(
      pintarMensaje('No pudimos cargar los leads. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.'),
    );
    // Los dos paneles derivados cuelgan de estos leads: si no llegaron, tampoco pueden decir nada.
    // Se vacian con su mensaje en vez de dejarlos girando — un «Cargando…» eterno se lee como que
    // el dato viene, y aqui ya sabemos que no.
    montarActividad([]);
    montarZonas([]);
    console.error('[gestion] leads:', e);
  }
}

/**
 * KPI de leads pendientes. Si se tocó el tope de la consulta se muestra «50+», porque un número
 * redondo exacto que en realidad está recortado es una cifra falsa con aspecto de dato.
 */
function actualizarKpi(pendientes: number, tocoTope: boolean): void {
  const kpis = document.querySelectorAll<HTMLElement>('.gx-kpi');
  for (const k of kpis) {
    const etiqueta = k.querySelector('.gx-kpi__lbl')?.textContent ?? '';
    if (!/leads/i.test(etiqueta)) continue;
    const valor = k.querySelector<HTMLElement>('.gx-kpi__val');
    if (valor) valor.textContent = tocoTope ? `${TOPE}+` : String(pendientes);
    // La tendencia del mockup («+18%») es inventada y aquí no hay con qué calcularla.
    k.querySelector('.gx-kpi__trend')?.remove();
    const l = k.querySelector('.gx-kpi__lbl');
    if (l) l.textContent = 'Leads sin contactar';
  }
}
