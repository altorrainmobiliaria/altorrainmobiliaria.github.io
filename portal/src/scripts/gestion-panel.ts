/*
 * EL TABLERO DEL PANEL — que las cifras del mockup dejen de afirmar un negocio que no existe (§264).
 *
 * 🔴 LO QUE PASABA. El panel del dueño abre con cuatro KPIs, un pipeline de seis clientes con nombre
 * y un feed de actividad con hora («hace 12 min · Cierre confirmado · Casa Crespo por $760M»). Todo
 * eso es la réplica del mockup, y **nada de ello se sustituía con datos reales** salvo el KPI de
 * leads. El día uno, con la base vacía, el dueño abre su panel y lee **«Ventas del mes: $4.850M»**.
 *
 * Una cifra de dinero es la que más engaña: el nombre «Thomas Shelby» en la tabla se reconoce como
 * relleno de un vistazo, pero $4.850M parece un dato. Y el problema no es solo el día uno — es que
 * mientras convivan cifras reales y cifras inventadas en la MISMA fila de tarjetas, ninguna se puede
 * creer sin comprobarla aparte, que es justo lo que un tablero existe para evitar.
 *
 * QUÉ HACE, y el criterio: **lo que se puede contar se cuenta; lo que no, se dice**. No se inventa
 * un cero —«0 ventas» afirmaría que se midió— sino que la tarjeta declara que ese dato todavía no se
 * mide. Es exactamente el trato que `gestion-leads.ts` ya le daba a la tendencia inventada («+18 %»)
 * del mismo mockup: si no hay con qué calcularla, se retira. Aquí solo se aplica al resto.
 *
 * ⚠️ NO toca la maquetación: no añade, mueve ni quita tarjetas. Escribe dentro de las que ya existen,
 * que es la diferencia entre corregir un dato falso y rediseñar una pantalla (esto último va con
 * mockup del dueño).
 */

import { cargarAuth } from './auth';

/** Tope de las consultas. Obligatorio en este proyecto: sin `limit()` es una cuota abierta. */
const TOPE = 200;

/** Lo que una tarjeta dice cuando su dato todavía no se mide. */
const SIN_MEDIR = '—';

type Kpi = { el: HTMLElement; etiqueta: string };

function kpisDelPanelVisible(): Kpi[] {
  /*
   * Solo el juego de tarjetas del rol ACTIVO: los otros dos están `hidden`, y escribirles cifras
   * reales dejaría datos del negocio en un nodo que otro rol puede llegar a ver al cambiar de vista.
   */
  const set = document.querySelector<HTMLElement>('.gx-kpi-set:not([hidden])');
  if (!set) return [];
  return [...set.querySelectorAll<HTMLElement>('.gx-kpi')].map((el) => ({
    el,
    etiqueta: (el.querySelector('.gx-kpi__lbl')?.textContent ?? '').toLowerCase(),
  }));
}

/** Escribe un valor real y retira la tendencia, que en el mockup es inventada. */
function ponerValor(k: Kpi, valor: string, etiqueta?: string): void {
  const v = k.el.querySelector<HTMLElement>('.gx-kpi__val');
  if (v) v.textContent = valor;
  k.el.querySelector('.gx-kpi__trend')?.remove();
  if (etiqueta) {
    const l = k.el.querySelector('.gx-kpi__lbl');
    if (l) l.textContent = etiqueta;
  }
}

/**
 * Pone las cifras del tablero a lo que se puede contar de verdad.
 *
 * No lanza nunca: si Firestore falla, es preferible dejar la tarjeta en «—» que dejar en pantalla la
 * cifra del mockup. Un guion se lee como «no lo sé»; `$4.850M` se lee como un dato.
 */
export async function montarTablero(): Promise<void> {
  const kpis = kpisDelPanelVisible();
  if (!kpis.length) return;

  const buscar = (re: RegExp) => kpis.find((k) => re.test(k.etiqueta));

  /*
   * Se neutralizan ANTES de consultar: si la red tarda o falla, lo que queda en pantalla es «—» y no
   * el número del mockup. El orden importa — al revés, un fallo dejaría la mentira intacta.
   */
  const inmuebles = buscar(/inmueble/);
  const visitas = buscar(/visita/);
  const ventas = buscar(/venta/);
  if (inmuebles) ponerValor(inmuebles, SIN_MEDIR);
  if (visitas) ponerValor(visitas, SIN_MEDIR, 'Visitas · aún no se registran');
  if (ventas) ponerValor(ventas, SIN_MEDIR);

  try {
    const { app } = await cargarAuth();
    const mod = await import('firebase/firestore');
    const db = mod.getFirestore(app);

    if (inmuebles) {
      /*
       * «Activos» = lo que el visitante puede ver. Se cuenta con `getCountFromServer`, que NO trae
       * los documentos: en el free-tier esto vale una lectura, no doscientas.
       */
      const q = mod.query(mod.collection(db, 'propiedades'), mod.where('estado', '==', 'disponible'));
      const n = await mod.getCountFromServer(q);
      ponerValor(inmuebles, String(n.data().count), 'Inmuebles publicados');
    }

    if (ventas) {
      /*
       * Campos LEIDOS del modelo, no supuestos: la venta cerrada es la que llego a la etapa
       * `registro` —no existe ningún `estado: 'cerrada'`— y el importe es `precioAcordado`.
       * El mes en curso, por el identificador del periodo (`AAAA-MM`), que es como el resto del
       * dominio ordena el tiempo. Sin ventas cerradas se queda en «—» y no en «$0»: cero afirmaría
       * que se midió y no se vendió nada, y eso solo es cierto cuando la operación ya arrancó.
       */
      const mes = new Date().toISOString().slice(0, 7);
      const snap = await mod.getDocs(
        mod.query(mod.collection(db, 'ventas'), mod.where('etapa', '==', 'registro'), mod.limit(TOPE)),
      );
      const delMes = snap.docs
        .map((d) => d.data() as { cerradaEn?: string; precioAcordado?: number })
        .filter((v) => (v.cerradaEn ?? '').startsWith(mes));
      if (delMes.length) {
        const total = delMes.reduce((t, v) => t + (v.precioAcordado ?? 0), 0);
        const { pesos } = await import('../lib/domain/dinero');
        ponerValor(ventas, pesos(total), `Ventas de ${mes}`);
      } else {
        ponerValor(ventas, SIN_MEDIR, 'Ventas del mes · ninguna cerrada aún');
      }
    }
  } catch {
    /*
     * Silencio DELIBERADO, y es la única vez que se justifica: las tarjetas ya quedaron en «—» antes
     * de intentar la consulta. No hay nada que avisar porque no hay nada falso en pantalla.
     */
  }
}
