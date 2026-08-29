/*
 * PANTALLA DEL PREAVISO — la puerta que le faltaba a `domain/preaviso.ts` (§187 · §222 · ADR §233).
 *
 * LO QUE HACE Y LO QUE NO. **No envía nada.** Los arts. 22.7 y 24 de la Ley 820 piden que el aviso
 * viaje por servicio postal autorizado, y §185 dictaminó que la Ley 527 da equivalente funcional del
 * escrito y de la firma, **no de un canal de entrega**: el envío ocurre en la oficina del operador.
 * Aquí se archiva la prueba de que ocurrió y se dice si llegó a tiempo.
 *
 * 📅 LA FECHA LÍMITE SE PINTA AL ELEGIR EL CONTRATO, antes de tocar el formulario. Es la única parte
 * de esta pantalla que puede EVITAR el daño; todo lo demás solo lo constata. Si el plazo ya se
 * perdió, saberlo aquí sigue sirviendo —hay que avisar al propietario hoy— pero ya no lo evita.
 *
 * 🗣️ EL VEREDICTO SE DICE ENTERO Y NO SE PINTA DE ROJO. La callable devuelve `termina` o
 * `se-prorroga`, y el segundo NO es un error del usuario ni un fallo del sistema: es una consecuencia
 * legal, y el contrato sigue vivo. Pintarlo como error invitaría a «arreglarlo» cambiando una fecha,
 * que es exactamente lo que no puede pasar.
 *
 * ⚠️ La escritura NO pasa por aquí: `contratos` nace con `allow write: if false` (§100) y la única
 * puerta es la callable `registrarPreaviso`, que además DERIVA el estado del contrato del veredicto.
 * Este módulo la LLAMA; no escribe Firestore ni decide el efecto.
 */

import { fechaLimite } from '../lib/domain/preaviso';
import { fechaEnLetras } from '../lib/domain/meses-es';
import type { Contrato } from '../lib/domain/gestion';
import { llamarCallable } from './callable';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const val = (id: string) => ($(id) as HTMLInputElement | null)?.value.trim() ?? '';

/** Los contratos que la vista de contratos ya cargó. Se guardan para leer su `vigenciaFin`. */
let CONTRATOS: Contrato[] = [];


/** `2027-06-30` → «30 de junio de 2027». El formato vive en `domain/meses-es.ts`, su dueño único. */
export const enLetras = fechaEnLetras;

/**
 * Qué contratos admiten preaviso. Uno `terminado` no: no hay nada que preavisar, y ofrecerlo sería
 * un camino que la puerta va a rechazar — un formulario que deja intentar lo imposible enseña a
 * desconfiar del resto.
 */
export function preavisables(contratos: Contrato[]): Contrato[] {
  return contratos.filter((c) => c.estado !== 'terminado' && !!(c.vigenciaFin ?? '').slice(0, 10));
}

/** El texto del plazo, que es lo primero que se lee. */
export function textoLimite(c: Contrato | undefined): string {
  if (!c) return '';
  const fin = (c.vigenciaFin ?? '').slice(0, 10);
  if (!fin) return '';
  if (c.preaviso) {
    if (c.preaviso.efecto === 'termina') return `Ya tiene preaviso: termina el ${enLetras(fin)}.`;
    /*
     * 🔴 Esto le decía «termina el X» al propietario con solo la constancia postal (§263). Llegaba
     * la fecha, el inquilino no se iba, y quien se lo había asegurado POR ESCRITO era ALTORRA.
     */
    if (c.preaviso.efecto === 'falta-titulo-del-arrendador') {
      return `Preaviso puesto y a tiempo, pero NO basta para restituir el ${enLetras(fin)}: falta pagar ` +
        'los tres meses (art. 22 num. 7, durante prórrogas) o invocar la causal con caución de seis (num. 8).';
    }
    return 'Ya tiene un preaviso que llegó tarde: el contrato se prorroga.';
  }
  return `Vence el ${enLetras(fin)} · último día para imponer: ${enLetras(fechaLimite(fin))}`;
}

function pintarLimite(): void {
  const sel = $('gx-pv-contrato') as HTMLSelectElement | null;
  const caja = $('gx-pv-limite');
  if (!sel || !caja) return;
  caja.textContent = textoLimite(CONTRATOS.find((c) => c.id === sel.value));
}

function decir(texto: string, detalle = ''): void {
  const caja = $('gx-pv-veredicto');
  if (!caja) return;
  caja.textContent = '';
  const t = document.createElement('strong');
  t.textContent = texto;
  caja.appendChild(t);
  if (detalle) {
    const p = document.createElement('p');
    p.textContent = detalle;
    caja.appendChild(p);
  }
  caja.hidden = false;
}

/** Rellena el selector con los contratos que admiten preaviso y cablea el botón. */
export function montarPreaviso(contratos: Contrato[]): void {
  CONTRATOS = contratos;
  const sel = $('gx-pv-contrato') as HTMLSelectElement | null;
  if (!sel) return;

  sel.textContent = '';
  const abiertos = preavisables(contratos);
  const boton = $('gx-pv-guardar') as HTMLButtonElement | null;
  if (!abiertos.length) {
    const o = document.createElement('option');
    o.textContent = 'No hay contratos a los que preavisar';
    o.value = '';
    sel.appendChild(o);
    sel.disabled = true;
    /*
     * 🔴 Aquí se volvía dejando el botón vivo y sin escucha (§266): el desplegable decía la verdad y
     * el botón de al lado invitaba a pulsarlo para nada. Un control que responde al clic y no hace
     * nada enseña que el sistema está roto — la misma familia que el «Ordenar por» de §264.
     */
    if (boton) boton.disabled = true;
    return;
  }
  sel.disabled = false;
  if (boton) boton.disabled = false;
  for (const c of abiertos) {
    const o = document.createElement('option');
    o.value = c.id;
    const quien = c.partes?.arrendatario?.nombre || c.partes?.propietario?.nombre || 'sin partes';
    o.textContent = `${c.id} · ${quien}`;
    sel.appendChild(o);
  }
  sel.addEventListener('change', pintarLimite);
  pintarLimite();

  $('gx-pv-guardar')?.addEventListener('click', registrar);
}

async function registrar(): Promise<void> {
  const boton = $('gx-pv-guardar') as HTMLButtonElement | null;
  const contratoId = val('gx-pv-contrato');
  if (!contratoId) return;

  if (boton) {
    boton.disabled = true;
    boton.textContent = 'Registrando…';
  }
  try {
    /*
     * `llamarCallable` NO lanza: devuelve una unión con `ok`. Y ya funde los `mensajes` del detalle
     * en `mensaje`, que es la parte útil de un error de validación — decir «falta la guía» ahorra
     * los seis intentos de adivinar cuál de los campos estaba mal.
     */
    const r = await llamarCallable('registrarPreaviso', {
      contratoId,
      quien: val('gx-pv-quien'),
      redactadoEl: val('gx-pv-redactado'),
      operador: val('gx-pv-operador'),
      guia: val('gx-pv-guia'),
      impuestoEl: val('gx-pv-impuesto'),
      entregadoEl: val('gx-pv-entregado'),
    });

    if (!r.ok) {
      decir('No se pudo registrar todavía.', r.mensaje);
      return;
    }

    const datos = r.result as { efecto?: string; vigenciaFin?: string; motivo?: string };
    if (datos.efecto === 'termina') {
      decir(
        `El contrato termina el ${enLetras(datos.vigenciaFin ?? '')}.`,
        'La constancia queda archivada y el contrato pasa a «preaviso» por sí solo: ese estado es ' +
          'consecuencia de esta evidencia, no una casilla aparte.',
      );
    } else if (datos.efecto === 'falta-titulo-del-arrendador') {
      /*
       * 🔴 Este caso caía antes en el «se prorroga un año» de abajo, y eso es FALSO: el aviso está
       * bien puesto y a tiempo, el plazo corrió. Lo que falta es el título con el que el arrendador
       * puede exigir la restitución. Decirle «se prorroga» lo mandaría a volver a avisar —a repetir
       * lo único que hizo bien— en vez de a hacer lo que le falta.
       */
      decir(
        'La constancia queda archivada, pero esto todavía NO recupera el inmueble.',
        'Avisar bien es la mitad: cuando quien avisa es el arrendador, la Ley 820 pide además pagar ' +
          'tres meses de arriendo si se termina durante las prórrogas (art. 22 num. 7), o invocar una ' +
          'causal —ocuparlo, demolerlo o entregarlo vendido— y constituir caución de seis meses para ' +
          'terminar al vencimiento (num. 8). El arrendatario, en cambio, sí termina solo con el aviso.',
      );
    } else {
      // Se dice ENTERO. No es un error que se arregle cambiando una fecha: es lo que pasó.
      decir(
        'El contrato no termina: se prorroga un año.',
        `${datos.motivo ?? ''} La evidencia queda archivada igual, que es lo que explicará por qué ` +
          'el contrato sigue vivo. Avisa al propietario hoy, no el día que quiera disponer del inmueble.',
      );
    }
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = 'Registrar evidencia';
    }
  }
}
