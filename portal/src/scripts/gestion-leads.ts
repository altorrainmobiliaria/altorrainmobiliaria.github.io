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
import { descargarTexto } from './descargar';

/** Tope de la consulta. `limit()` es OBLIGATORIO en este proyecto: una query sin él es una cuota abierta. */
const TOPE = 50;

/** Lo último que se cargó. El export sale de AQUÍ y no de una segunda consulta. */
const cargados: Lead[] = [];

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

/** «hace 12 min» · «hace 3 h» · «hace 2 días». Una fecha ISO en un panel no la lee nadie. */
export function haceCuanto(d: Date | null): string {
  if (!d) return '—';
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.floor(h / 24);
  return dias === 1 ? 'ayer' : `hace ${dias} días`;
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
      actualizarKpi(0, false);
      return;
    }

    const leads = snap.docs.map((d) => normalizar(d.id, d.data() as Record<string, unknown>));
    cargados.length = 0;
    cargados.push(...leads);
    conjunto.replaceChildren(...leads.map(pintarFila));
    actualizarKpi(leads.filter((l) => l.estado === 'pendiente').length, snap.size >= TOPE);
  } catch (e) {
    // FALLA RUIDOSO y, sobre todo, BORRA lo que hubiera: dejar los leads de muestra a la vista sería
    // que alguien llamara a personas que no existen.
    conjunto.replaceChildren(
      pintarMensaje('No pudimos cargar los leads. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.'),
    );
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
