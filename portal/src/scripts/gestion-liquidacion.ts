/*
 * PANTALLA DE LIQUIDACIÓN — el mes, peso por peso (§167).
 * Mockup: `design/mockups/ALTORRA Liquidacion.dc.html`.
 *
 * `liquidacion.ts` ya sabía calcular (§166); lo que faltaba era que alguien pudiera VERLO. Un número
 * sin desglose es un número que hay que creerse, y «créeme» es lo contrario de lo que vende la marca.
 *
 * 🔍 LA DECISIÓN QUE MÁS SE NOTA: **cada línea dice A QUIÉN va el dinero, no solo cuánto se resta.**
 * «Cuota de administración −$300.000» es un descuento; «→ a la copropiedad» es una explicación. Es el
 * mismo peso y media conversación menos al mes.
 *
 * 🔊 Y LA QUE MENOS SE ESPERA: **la retención que NO aplica también se pinta.** El silencio sobre una
 * retención es como nace una duda — quien oyó que «a los arriendos les retienen» y no ve la línea no
 * concluye «no aplica», concluye «me falta algo».
 *
 * 🚫 NO hay botón de pagar. Esta pantalla calcula y muestra; el giro depende de la cuenta de comercio
 * y de las tres condiciones del dictamen (§165). Un botón que parece pagar y no paga es peor que no
 * tenerlo: quien lo pulsa cree que ya está.
 *
 * ⚠️ CERO `innerHTML`, que es doctrina del panel (§31) y no una preferencia: aquí se pintan datos que
 * vienen de Firestore —nombres de personas, códigos— y construir markup con ellos es exactamente por
 * donde entra un XSS en un back-office. Los `<strong>` y las flechas se arman con nodos de verdad.
 *
 * Solo LECTURA de `contratos`: no escribe nada, así que no hay puerta que atravesar.
 */

import { cargarAuth } from './auth';
import type { Contrato } from '../lib/domain/gestion';
import {
  explicarProblema,
  liquidarPeriodo,
  pesos,
  problemasDeLiquidacion,
  type EntradaLiquidacion,
  type Liquidacion,
} from '../lib/domain/liquidacion';

const TOPE = 50;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const el = (tag: string, clase?: string, texto?: string): HTMLElement => {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
};

/**
 * Cuelga nodos de un padre. `appendChild` y **NO** `append`.
 *
 * Los tipos de Cloudflare Workers fusionan su `Element.append(string)` (el del HTMLRewriter) con el
 * `Element` del DOM, y al hacerlo la sobrecarga que acepta nodos DEJA DE EXISTIR: `p.append(unNodo)`
 * no compila y el error habla de `Response | ReadableStream`, que no se parece en nada a la causa
 * ([[L-36]]). Ya estaba documentado en `gestion-inmuebles` y en `serp-catalogo` — en un comentario
 * junto a cada llamada, que es justo donde no lo lee quien escribe un archivo NUEVO. Aquí se
 * centraliza en una función para que la siguiente pantalla no lo vuelva a descubrir.
 */
const mete = (padre: Node, ...hijos: Node[]): void => {
  for (const h of hijos) padre.appendChild(h);
};

const aviso = (t: string): HTMLElement => el('p', 'gx-liq__msg', t);

/** Texto con una parte en negrita, sin tocar `innerHTML`. */
const conNegrita = (clase: string, fuerte: string, resto: string): HTMLElement => {
  const p = el('span', clase);
  mete(p, el('strong', undefined, fuerte), document.createTextNode(resto));
  return p;
};

/** El SDK entra por import dinámico, como en el resto del panel: no lo carga quien no abre la vista. */
async function cargarFirestore() {
  const [{ getApps, initializeApp }, mod] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
  ]);
  const { FIREBASE_PUBLICO } = await import('../lib/config/firebase-publico');
  const app = getApps()[0] ?? initializeApp(FIREBASE_PUBLICO);
  return { db: mod.getFirestore(app), mod };
}

/** Contratos cargados, para no volver a la red al cambiar de contrato en el desplegable. */
let cargados: Contrato[] = [];

/**
 * De un contrato a la entrada del cálculo. Aquí se decide qué banderas van, y la más delicada es la
 * retención: **el contrato NO trae hoy si el arrendatario es agente de retención**, así que el default
 * es `false` — el caso de vivienda. Ponerlo a `true` «por si acaso» le restaría a cada propietario un
 * 3,5 % que nadie le practicó (§166.1). Cuando el dato exista en el contrato se leerá de ahí; mientras
 * tanto, la casilla lo deja explícito y quien la marca sabe por qué.
 */
function entradaDe(c: Contrato, retiene: boolean): EntradaLiquidacion {
  return {
    canon: c.canon ?? 0,
    administracionPH: c.administracion,
    adminIncluidaEnCanon: c.adminIncluidaEnCanon,
    honorariosPct: c.honorariosPct,
    ivaSobreHonorarios: c.ivaSobreHonorarios,
    arrendatarioEsAgenteRetencion: retiene,
  };
}

/** Una fila del comprobante: concepto, a dónde va, y cuánto. */
function fila(concepto: string, destino: HTMLElement, monto: number, apagada = false): HTMLElement {
  const f = el('div', `gx-liq__fila${apagada ? ' gx-liq__fila--nula' : ''}`);
  const izq = el('div');
  mete(izq, el('span', 'gx-liq__concepto', concepto), destino);
  mete(f, izq, el('span', 'gx-liq__monto', pesos(monto)));
  return f;
}

/** El destino de una fila normal: «→ a quien sea. Explicación.» */
const destino = (texto: string): HTMLElement => el('span', 'gx-liq__destino', `→ ${texto}`);

function pintarComprobante(c: Contrato, l: Liquidacion, retiene: boolean): DocumentFragment {
  const frag = document.createDocumentFragment();

  const top = el('div', 'gx-liq__top');
  const ti = el('div');
  mete(ti, el('p', 'gx-liq__top-t', 'Se le cobra al arrendatario'));
  const detalle = c.adminIncluidaEnCanon
    ? `Canon ${pesos(c.canon ?? 0)}, con la cuota de administración incluida`
    : `Canon ${pesos(c.canon ?? 0)}${c.administracion ? ` + administración ${pesos(c.administracion)}` : ''}`;
  mete(ti, el('p', 'gx-liq__top-d', detalle));
  mete(top, ti, el('p', 'gx-liq__top-n', pesos(l.cobroAlArrendatario)));
  mete(frag, top);

  mete(frag, el('p', 'gx-liq__eyebrow', 'A DÓNDE VA'));

  if (l.giroAPH > 0) {
    mete(frag, 
      fila(
        'Cuota de administración',
        destino('a la copropiedad. No es ingreso de ALTORRA ni del propietario.'),
        l.giroAPH,
      ),
    );
  }

  const pct = Math.round((c.honorariosPct ?? 0.1) * 1000) / 10;
  mete(frag, 
    fila(
      `Honorarios de administración · ${pct} %`,
      destino(`a ALTORRA. Sobre el cargo mensual integral (${pesos(l.baseHonorarios)}).`),
      l.honorarios,
    ),
  );

  if (l.ivaHonorarios > 0) {
    mete(frag, 
      fila('IVA sobre los honorarios · 19 %', destino('a la DIAN. Lo factura ALTORRA y lo declara.'), l.ivaHonorarios),
    );
  }

  // 🔊 La línea que no se calla, aplique o no.
  if (retiene) {
    const d = el('span', 'gx-liq__destino');
    mete(d, 
      document.createTextNode('→ a la DIAN, '),
      el('strong', undefined, 'por cuenta del propietario'),
      document.createTextNode('. Se le entrega su certificado.'),
    );
    mete(frag, fila('Retención en la fuente sobre el canon · 3,5 %', d, l.retencionCanon));
  } else {
    mete(frag, 
      fila(
        'Retención en la fuente sobre el canon · 3,5 %',
        conNegrita(
          'gx-liq__destino',
          'No aplica en este contrato',
          ': la practica quien paga, y el arrendatario no es agente de retención.',
        ),
        0,
        true,
      ),
    );
  }

  const giro = el('div', 'gx-liq__giro');
  const gi = el('div');
  mete(gi, el('p', 'gx-liq__giro-t', 'Se le gira al propietario'));
  mete(gi, el('p', 'gx-liq__giro-d', c.partes?.propietario?.nombre ?? 'Propietario del contrato'));
  mete(giro, gi, el('p', 'gx-liq__giro-n', pesos(l.giroAlPropietario)));
  mete(frag, giro);

  /*
   * 🧮 EL CUADRE, A LA VISTA. El dominio lo garantiza calculando el giro por diferencia (§166.3), pero
   * garantizarlo en un test es para nosotros; enseñarlo es para quien recibe el dinero. Y si algún día
   * NO cuadrara, se vería aquí en vez de en un log que nadie abre.
   */
  const suma = l.giroAlPropietario + l.giroAPH + l.honorarios + l.ivaHonorarios + l.retencionCanon;
  const ok = suma === l.cobroAlArrendatario;
  const cuadre = el('p', `gx-liq__cuadre${ok ? '' : ' gx-liq__cuadre--mal'}`);
  mete(cuadre, 
    ok
      ? conNegrita(
          '',
          'Cuadra: ',
          `las salidas suman ${pesos(suma)}, exactamente lo cobrado. Ni un peso sin destino.`,
        )
      : conNegrita(
          '',
          'NO cuadra: ',
          `las salidas suman ${pesos(suma)} y lo cobrado es ${pesos(l.cobroAlArrendatario)}. No gires hasta revisarlo.`,
        ),
  );
  mete(frag, cuadre);

  return frag;
}

/** Recalcula y repinta con lo que hay seleccionado. Sin red: los contratos ya están en memoria. */
function recalcular(): void {
  // `HTMLSelectElement` NO satisface el `HTMLElement` fusionado con los tipos de Workers: su
  // `remove()` devuelve `void` y el del `Element` del HTMLRewriter devuelve `Element`, así que la
  // restricción genérica los declara incompatibles ([[L-36]] otra vez, por otra puerta). Los demás
  // paneles no lo pisaron porque solo usan `HTMLInputElement`, que sí encaja.
  const sel = $('gx-liq-contrato') as unknown as HTMLSelectElement | null;
  const cuerpo = $('gx-liq-cuerpo');
  const chk = $<HTMLInputElement>('gx-liq-retiene');
  if (!sel || !cuerpo) return;

  const c = cargados.find((x) => x.id === sel.value);
  if (!c) {
    cuerpo.replaceChildren(aviso('Elige un contrato.'));
    return;
  }

  const entrada = entradaDe(c, chk?.checked ?? false);
  const problemas = problemasDeLiquidacion(entrada);
  if (problemas.length) {
    // Se dice QUÉ falta, no «error»: un contrato sin canon no es un fallo del sistema.
    const caja = el('div', 'gx-liq__problemas');
    mete(caja, el('p', 'gx-liq__problemas-t', 'Este contrato todavía no se puede liquidar'));
    for (const p of problemas) mete(caja, el('p', 'gx-liq__problemas-d', explicarProblema(p)));
    cuerpo.replaceChildren(caja);
    return;
  }

  cuerpo.replaceChildren(pintarComprobante(c, liquidarPeriodo(entrada), chk?.checked ?? false));
}

/** Monta la vista: carga los contratos y deja el primero calculado. */
export async function montarLiquidacion(): Promise<void> {
  // `HTMLSelectElement` NO satisface el `HTMLElement` fusionado con los tipos de Workers: su
  // `remove()` devuelve `void` y el del `Element` del HTMLRewriter devuelve `Element`, así que la
  // restricción genérica los declara incompatibles ([[L-36]] otra vez, por otra puerta). Los demás
  // paneles no lo pisaron porque solo usan `HTMLInputElement`, que sí encaja.
  const sel = $('gx-liq-contrato') as unknown as HTMLSelectElement | null;
  const cuerpo = $('gx-liq-cuerpo');
  if (!sel || !cuerpo) return;

  if (cargados.length) {
    recalcular();
    return;
  }

  cuerpo.replaceChildren(aviso('Cargando contratos…'));
  try {
    const { auth } = await cargarAuth();
    if (!auth.currentUser) {
      cuerpo.replaceChildren(aviso('Tu sesión caducó. Recarga la página y vuelve a entrar.'));
      return;
    }
    const { db, mod } = await cargarFirestore();
    const q = mod.query(mod.collection(db, 'contratos'), mod.limit(TOPE));
    const snap = await mod.getDocs(q);
    cargados = snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as Contrato);

    if (!cargados.length) {
      cuerpo.replaceChildren(
        aviso('Todavía no hay contratos. Cuando registres el primero, aquí sale su liquidación.'),
      );
      return;
    }

    sel.replaceChildren(
      ...cargados.map((c) => {
        const o = document.createElement('option');
        o.value = c.id;
        o.textContent = `${c.id}${c.canon ? ` · ${pesos(c.canon)}` : ''}`;
        return o;
      }),
    );
    sel.addEventListener('change', recalcular);
    $('gx-liq-retiene')?.addEventListener('change', recalcular);
    recalcular();
  } catch (e) {
    cuerpo.replaceChildren(aviso('No pudimos cargar los contratos.'));
    console.error('[gestion] liquidacion:', e);
  }
}
