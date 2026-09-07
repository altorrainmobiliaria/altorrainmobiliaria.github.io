/**
 * TARIFAS PÚBLICAS — insumo de `/precios` (OLA 1 ítem 7, ADR §93).
 *
 * ⚠️ PROCEDENCIA, y aquí importa más que en ningún otro archivo del portal. Estas cifras salen del
 * **tarifario OFICIAL sellado por Daniel el 2026-07-25** (`docs/43-OPERACION §Tarifario y umbrales
 * OFICIALES`), que en su propio encabezado dice que **deroga toda cifra previa**.
 *
 * 🔴 NO copiar las del MEGA-PLAN. El plan (OLA 1 ítem 7) trae «venta 2-3%» y «captación arriendo
 * 50-100% del primer canon». Ambas están SUPERADAS por el sellado posterior: la venta es **3%** y la
 * colocación va por **duración del contrato** (1, 2 o 3 cánones), no por porcentaje. Publicar las del
 * plan habría puesto precios equivocados en la cara del cliente.
 *
 * Regla de esta página (voz §6.1): **prohibido «precios desde»**. Si hay rango real se dice el rango
 * real, y si algo no está decidido se dice que no está decidido. Un hueco honesto no pierde clientes;
 * una cifra que después hay que corregir sí.
 */

export interface Tarifa {
  id: string;
  servicio: string;
  /** La cifra tal cual se le dice al cliente. `null` = todavía no está decidida y se dice. */
  cifra: string | null;
  /** Sobre qué se calcula. Sin esto un porcentaje no significa nada. */
  base: string;
  /** Quién paga. En vivienda SIEMPRE el propietario (Ley 820 prohíbe cobrarle al inquilino). */
  paga: string;
  nota?: string;
}

export const TARIFAS: Tarifa[] = [
  {
    id: 'venta',
    servicio: 'Venta de tu inmueble',
    cifra: '3%',
    base: 'sobre el valor final de la venta',
    paga: 'El propietario, y solo cuando la venta queda registrada.',
    nota: 'La comisión se factura con IVA. Se causa al registro, no a la firma de la promesa.',
  },
  {
    id: 'administracion',
    servicio: 'Administración de arriendo de vivienda',
    cifra: '10% + IVA',
    base: 'sobre el cargo mensual integral (canon más cuota de administración cuando aplique)',
    paga: 'El propietario, descontado de cada giro mensual.',
    nota: 'Incluye recaudo, giro al propietario, atención de novedades y seguimiento de la mora.',
  },
  {
    id: 'colocacion',
    servicio: 'Solo colocación de arrendatario',
    cifra: '1, 2 o 3 cánones',
    base: 'según la duración del contrato: 1 canon si es menor a 3 años, 2 entre 3 y 9, 3 desde 10',
    paga: 'El propietario, una sola vez al firmar.',
    nota: 'Para quien administra por su cuenta y solo necesita que le consigamos el arrendatario.',
  },
  {
    id: 'comercial',
    servicio: 'Locales y oficinas',
    cifra: null,
    base: 'la estamos definiendo',
    paga: 'El propietario.',
    nota: 'Todavía no tenemos una tarifa cerrada para inmueble comercial. Cuando nos escribas te damos el número que aplique a tu caso, antes de que decidas nada.',
  },
  {
    id: 'alojamiento',
    servicio: 'Alojamiento por días',
    cifra: null,
    base: 'depende de la temporada y del inmueble',
    paga: 'El propietario del alojamiento.',
    nota: 'Esta línea se cotiza con su propio tarifario por temporada. Escríbenos y te lo pasamos completo.',
  },
];

/**
 * Lo que el ARRENDATARIO paga a ALTORRA: nada. No es un gesto comercial, es la ley (Ley 820/2003
 * arts. 15, 16 y 18 prohíben depósitos y cauciones al inquilino de vivienda, directas, indirectas o
 * con otro nombre → `docs/42-LEGAL`). Se dice de frente porque en el mercado se cobra igual, y quien
 * lo ha vivido reconoce la diferencia sin que haya que explicársela.
 */
export const NADA_AL_ARRENDATARIO = {
  titulo: 'Si vas a arrendar para vivir, con nosotros no pagas comisión.',
  cuerpo:
    'La ley prohíbe cobrarle depósitos o cauciones al arrendatario de vivienda, y nosotros no los cobramos con ningún otro nombre. Nuestros honorarios los paga el propietario. Lo que tú pagas es el canon y la administración del edificio, cada uno por su lado y a la vista desde el primer día.',
} as const;

/** Cerrar la puerta a la letra pequeña es parte del producto, no un aviso legal escondido. */
export const SIN_LETRA_PEQUENA = [
  'Publicar tu inmueble con nosotros no cuesta nada y no tiene fecha de vencimiento.',
  'La comisión de venta se causa cuando la venta queda registrada.',
  'En arriendo, el canon y la cuota de administración van siempre separados y a la vista.',
  'Facturamos electrónicamente, con IVA donde la ley lo exige.',
] as const;
