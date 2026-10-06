/*
 * SEÑALES DE ESTADÍA Y DE RNT — el DUEÑO ÚNICO de la pregunta «¿esta página anuncia alojamiento por
 * días, y cada anuncio lleva su RNT al lado?».
 *
 * POR QUÉ UN MÓDULO APARTE. Vivían dentro de `verify-build.mjs`, y la siguiente sonda que pregunte lo
 * mismo (sobre plantillas, no sobre HTML servido) las habría copiado: dos regex de «importe» con el
 * mismo nombre que divergen en silencio es la clase de §176/§178. ⚠️ `verify:simbolos` y
 * `verify:huerfanos` solo miran `src/`, así que aquí no hay gate que cace un gemelo: la regla es
 * IMPORTAR las funciones de este fichero, nunca reescribir la señal en el consumidor. Las regex NO se
 * exportan a propósito: `SENAL_DINERO` lleva `/g`, y un `.test()` ajeno sobre ella recuerda la última
 * posición y da `false` a la segunda llamada.
 *
 * Su autoprueba corre en cada build desde `verify-build.mjs` (vitest solo incluye `src/**`).
 */

/*
 * 🎯 QUÉ CUENTA COMO «ANUNCIAR UNA ESTADÍA» (§314).
 *
 * 🔴 La versión anterior era `/\$\s?\d[\d.,]*\s*(?:\/|por\s)\s*noche/i`: exigía que el dinero y la
 * palabra «noche» vinieran FUNDIDOS en una sola frase, «$850.000 / noche». Una página que anunciara
 * la misma estadía con un TOTAL —«Total $2.730.000 por 5 noches»—, con un «Desde $420.000», con una
 * tarifa semanal o con un desglose tipo carrito **no casaba**, el bucle hacía `continue` y la
 * comprobación del RNT, que va DESPUÉS, no llegaba a correr. En VERDE. Es una señal LÉXICA estrecha
 * para una pregunta SEMÁNTICA, y se evade reescribiendo la frase — la misma forma de fallo que §312
 * (ningún patrón de dinero) y §313 (leer el campo equivocado).
 *
 * 🎯 Y LA SOLUCIÓN NO ES «BUSCAR LAS DOS COSAS EN LA PÁGINA»: medido sobre el sitio servido, eso
 * marca `/comprar` y `/arrendar`, porque «Corta estancia» es un enlace del MENÚ y sale en las 45
 * páginas. Un gate que grita sobre lo correcto enseña a ignorarlo entero. Lo que distingue a una
 * página que ANUNCIA una estadía no es que las dos señales existan: es que estén **JUNTAS**.
 * De ahí la ventana de proximidad.
 */
const SENAL_DINERO = /\$\s?\d[\d.,]{2,}/g;
const SENAL_ESTANCIA = /\b(?:noches?|estad[ií]as?|hu[eé]sped(?:es)?|por\s+d[ií]as|check[-\s]?in)\b/i;
/** Caracteres a cada lado del importe. 80 ≈ una línea de desglose; más empieza a alcanzar el menú. */
const VENTANA_PRECIO = 80;
/*
 * ⛔ AQUI HABIA UNA SEGUNDA CONDICION Y ERA LEGALMENTE INCORRECTA (§316).
 *
 * `SENAL_RESERVA = /Solicitar estas fechas|Enviar solicitud|<form/i` exigia que la pagina ademas
 * ofreciera RESERVAR — y la Ley 300/1996 no dice eso: el RNT va en TODA publicidad de alojamiento
 * turistico, ofrezca o no un formulario. Ademas este negocio convierte por WhatsApp, no por `<form>`:
 * la ficha real remata con `<a href={whatsappLink}>Solicitar informacion</a>` («informacion», no
 * «estas fechas»), asi que el patron dominante del sitio no casaba ninguna de las tres alternativas.
 *
 * 📊 Medido sobre `portal/dist/client` antes de quitarla: con la condicion, 2 paginas juzgadas; sin
 * ella, las MISMAS 2. Cero cambio hoy — es red preventiva, igual que el ensanche de §314. Lo que se
 * retira no es cobertura, es una excusa para no mirar.
 */

/** Cada importe que tiene vocabulario de estadía PEGADO, con su posición en el texto. */
function importesDeEstadia(texto) {
  const out = [];
  for (const m of texto.matchAll(SENAL_DINERO)) {
    const fin = m.index + m[0].length;
    const ctx = texto.slice(Math.max(0, m.index - VENTANA_PRECIO), fin + VENTANA_PRECIO);
    if (SENAL_ESTANCIA.test(ctx)) out.push({ importe: m[0], inicio: m.index, fin });
  }
  return out;
}

/** ¿Hay al menos un importe con vocabulario de estadía PEGADO? */
export function anunciaEstadia(texto) {
  return importesDeEstadia(texto).length > 0;
}

/*
 * 🎯 QUÉ CUENTA COMO «RNT A LA VISTA».
 *
 * 🔴 La aceptación anterior era `/\bRNT\b[^.]{0,40}\d/i`: «RNT», hasta 40 caracteres cualesquiera
 * sin punto y UN dígito. Daba por exhibido el número en frases que dicen justo lo contrario —
 * «RNT (Ley 300 de 1996)», «exige RNT y 3 revisiones»—, y una página que explica la obligación
 * pasaba por una que la cumple. Ahora la sigla («RNT», «R.N.T.» o el nombre entero) tiene que ir
 * seguida SOLO de lo que se escribe entre una sigla y su número —espacios, «:», «#», «.», «·»,
 * guion o raya, «No»/«Nro.»/«Núm.», «N.º»/«nº» (también con «°», que es como se teclea casi
 * siempre), «número», o el «)» de «(RNT)»— y luego un número de AL MENOS 4 cifras, sin espacios
 * dentro. El «-» va porque el propio dominio escribe así el número (`RNT-100001` en los fixtures de
 * `alta-propiedad`) y la ficha lo pinta tal cual tras la etiqueta «RNT»: sin él, la página que SÍ
 * cumple saldría en rojo. El campo del panel es texto libre (`alta-propiedad.ts` solo exige que no
 * venga vacío), y de ahí el abanico de prefijos.
 *
 * 🔴 Y lo que NO es un número de registro, aunque lo parezca:
 *   · cifras separadas por espacios — al quitar las etiquetas, una tarjeta se aplana en
 *     «RNT 3 2 85 m²» (habitaciones, baños, área): tres datos sueltos, no un número;
 *   · un AÑO de 4 cifras (19xx/20xx) — «Renovación del RNT 2026» habla del registro, no lo exhibe.
 *     Si algún RNT real fuese un número de 4 cifras en ese rango, saldría en rojo: error RUIDOSO y
 *     en la dirección segura, y este comentario dice dónde mirar;
 *   · solo ceros — «RNT-000000» es la plantilla del panel sin rellenar;
 *   · una cita de norma — «RNT - 1558 de 2012» nombra la ley, no el registro.
 *
 * ⚠️ Lo que no sabe: si el número existe en el registro. Comprueba la FORMA de una exhibición, no
 * su verdad — eso lo pide el gate de las rules al crear el alojamiento.
 */
const RNT_VALIDO = new RegExp(
  String.raw`(?:\bR\.?N\.?T\.?\)?|\bRegistro\s+Nacional\s+de\s+Turismo\b)` +
    String.raw`(?:[\s:#.·–—-]|N(?:o|ro|[úu]m)\.?|N\.?[º°]\.?|n[úu]mero)*` +
    String.raw`(?!(?:19|20)\d\d(?![.-]?\d))(?!0(?:[.-]?0)*(?![.-]?\d))` +
    String.raw`\d(?:[.-]?\d){3,}(?![.-]?\d)(?!\s*de\s+(?:19|20)\d\d)`,
  'i',
);
const RNT_VALIDO_G = new RegExp(RNT_VALIDO.source, `${RNT_VALIDO.flags}g`);

/** ¿El texto exhibe un RNT con su número, y no solo la sigla? */
export function muestraRnt(texto) {
  return RNT_VALIDO.test(texto);
}

/*
 * 🎯 QUÉ TEXTO SE JUZGA: el que LEE una persona, no el marcado ([[L-62]]). La primera versión buscaba
 * el patrón en el HTML crudo y se le escapaba `/estancias`, donde el precio y «/ noche» viven en
 * elementos distintos: cazaba la portada y NO la página que el brief señalaba.
 *
 * Fuera lo que nunca se pinta (`<template>`, `<script>`, `<style>`), y las entidades decodificadas:
 * «RNT&nbsp;100001» es «RNT 100001» para quien lo lee.
 *
 * 🔴 Y un RNT que el visitante NO VE no cuenta como exhibido: `<title>`, `<noscript>`, y todo lo que
 * va bajo `hidden`, `aria-hidden="true"` o la clase de solo-lectores (`alt-visually-hidden`). Esas
 * regiones se devuelven aparte (`ocultos`) en vez de borrarse, porque su IMPORTE sí se juzga: un paso
 * del formulario que hoy va `hidden` se muestra al interactuar, y entonces es publicidad. Un RNT
 * oculto solo cubre importes de SU MISMA región — lo que aparece a la vez que él.
 * ⚠️ LÍMITE: lo que se oculta por CSS (una clase cualquiera con `display:none`) no se ve desde aquí.
 */
const ABRE_OCULTO =
  /<([a-z][\w-]*)\b(?=[^>]*(?:\shidden(?=[\s=>/])|\saria-hidden=["']?true|\sclass=["'][^"']*\b(?:sr-only|visually-hidden)\b))[^>]*>|<(title|noscript)\b[^>]*>/gi;
const VACIO = /^(?:area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
const ENTIDADES = { nbsp: ' ', ordm: 'º', deg: '°', middot: '·', ndash: '–', mdash: '—', quot: '"', apos: "'", lt: '<', gt: '>', amp: '&' };

/** Dónde se cierra el elemento abierto en `desde`. Basta contar las etiquetas de SU nombre: un `<div>`
 *  oculto con `<div>` dentro no acaba en el primer `</div>`. Sin cierre, hasta el final (más rojo, no menos). */
function finDeElemento(html, desde, nombre) {
  const re = new RegExp(`<(/?)${nombre}\\b[^>]*>`, 'gi');
  re.lastIndex = desde;
  let abiertos = 1;
  for (let m; (m = re.exec(html)); ) {
    abiertos += m[1] ? -1 : m[0].endsWith('/>') ? 0 : 1;
    if (!abiertos) return m.index + m[0].length;
  }
  return html.length;
}

/** El texto que lee una persona y, aparte, los tramos `[inicio, fin)` de ese texto que NO ve al cargar. */
export function textoVisible(html) {
  const sinCodigo = html
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  // Las regiones ocultas se marcan con dos centinelas que sobreviven a quitar etiquetas; una región
  // dentro de otra ya marcada no abre otra (quedaría una centinela suelta).
  let marcado = '';
  let hecho = 0;
  for (const m of sinCodigo.matchAll(ABRE_OCULTO)) {
    const nombre = m[1] ?? m[2];
    if (m.index < hecho || VACIO.test(nombre) || m[0].endsWith('/>')) continue;
    const fin = finDeElemento(sinCodigo, m.index + m[0].length, nombre);
    marcado += `${sinCodigo.slice(hecho, m.index)}\u0001${sinCodigo.slice(m.index, fin)}\u0002`;
    hecho = fin;
  }
  marcado += sinCodigo.slice(hecho);
  const plano = marcado
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi, (e, dec, hex, nombre) => {
      const n = dec ? +dec : hex ? parseInt(hex, 16) : NaN;
      // Un código fuera de Unicode haría saltar `fromCodePoint` y tumbaría el gate: se deja tal cual.
      return n <= 0x10ffff ? String.fromCodePoint(n) : (ENTIDADES[nombre?.toLowerCase()] ?? e);
    })
    .replace(/\s+/g, ' ');
  const ocultos = [];
  let quitadas = 0;
  const texto = plano.replace(/\u0001([^\u0002]*)\u0002/g, (_, dentro, pos) => {
    const inicio = pos - quitadas;
    ocultos.push([inicio, inicio + dentro.length]);
    quitadas += 2;
    return dentro;
  });
  return { texto, ocultos };
}

/**
 * Distancia máxima, en caracteres de TEXTO, entre un importe de estadía y su RNT (antes o después).
 * 400 ≈ cinco ventanas de precio: alcanza el RNT impreso en el mismo bloque que el importe —título,
 * zona, rasgos, desglose— y deja fuera el que solo vive en el pie de página o en otra sección, que
 * es lo que la aceptación anterior («cualquier RNT en la página») daba por bueno.
 * ⚠️ LÍMITE: NO garantiza un RNT por tarjeta. En una rejilla, entre precio y precio hay ~70
 * caracteres (medido en /comprar), así que el RNT de UNA tarjeta cubre a unas cinco vecinas a cada
 * lado. Eso lo resuelve una sonda ESTRUCTURAL sobre las plantillas, no una distancia en texto plano.
 */
export const VENTANA_RNT = 400;

/**
 * Juzga cada importe de estadía: cuántos hay (`importes`) y cuáles NO tienen un RNT visible a
 * ≤ `VENTANA_RNT` caracteres (`sinRnt`). `ocultos` son los tramos que da `textoVisible`.
 */
export function juzgarEstadias(texto, ocultos = []) {
  const region = (pos) => ocultos.findIndex(([ini, fin]) => pos >= ini && pos < fin);
  const importes = importesDeEstadia(texto).map((a) => ({ ...a, region: region(a.inicio) }));
  const rnts = [...texto.matchAll(RNT_VALIDO_G)].map((m) => {
    const fin = m.index + m[0].length;
    // Sigla a la vista y número oculto (o al revés) no es un RNT exhibido: no cubre nada (-2).
    const [a, b] = [region(m.index), region(fin - 1)];
    return { inicio: m.index, fin, region: a === b ? a : -2 };
  });
  const cubre = (r, a) =>
    (r.region === -1 || r.region === a.region) && Math.max(0, r.inicio - a.fin, a.inicio - r.fin) <= VENTANA_RNT;
  return { importes: importes.length, sinRnt: importes.filter((a) => !rnts.some((r) => cubre(r, a))) };
}
