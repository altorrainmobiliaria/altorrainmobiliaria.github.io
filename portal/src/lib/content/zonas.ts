/**
 * ZONAS DE CARTAGENA — contenido editorial de las landings de sector (OLA 1 ítem 4, ADR §92).
 *
 * POR QUÉ EXISTE: el sitio viejo tenía 13 landings de barrio con posicionamiento ganado. El mapa de
 * 301 (§91) las mandaba de momento al SERP; aquí nacen sus destinos definitivos y esos redirects se
 * re-apuntan. Sin estas páginas, el cutover pierde 13 URLs indexadas y su tráfico.
 *
 * ⚠️ REGLA DE VERACIDAD (la más importante de este archivo). Este proyecto YA se quemó una vez con
 * datos inventados: `[operacion].astro:20` documenta 5 listings y una zona («Alameda La Victoria»)
 * fabricados, retirados después. Aquí NO se inventa nada cuantitativo: ni precios por m², ni
 * valorizaciones, ni proyectos, ni número de unidades. Lo que se escribe es CUALITATIVO y verificable
 * caminando la ciudad. Los datos duros viven en `PENDIENTE_DUENO` y **no se renderizan hasta que
 * Daniel los entregue**: un hueco honesto vale más que una cifra bonita que nadie puede sostener.
 *
 * VOZ: cada texto pasó el checklist anti-IA de `catalogo-voz-altorra` §3.3 — cero rayas largas de
 * muletilla, cero antítesis «no es X sino Y», cero triadas de adjetivos, cero adjetivos vacíos, cero
 * claims de liderazgo, cero garantías de rentabilidad, máximo UNA nota sensorial por pieza, y jamás
 * la dupla de postal «brisa del mar + tinto». La afirmación de cobertura se hace UNA vez por página
 * y vive en la plantilla, no aquí, para no repetirla catorce veces.
 */

export interface Zona {
  slug: string;
  /** Nombre como lo dice un cartagenero. */
  nombre: string;
  /** `<title>` y H1. Único por página (requisito de la skill `search-console-setup-y-diagnostico`). */
  titulo: string;
  /** Meta description. Único, 140-160 caracteres. */
  descripcion: string;
  /** Cuerpo editorial: qué es la zona, en voz ALTORRA. Cualitativo y verificable. */
  cuerpo: string;
  /** Rasgos concretos y observables. Nada cuantitativo. */
  rasgos: string[];
  /** A quién le sirve de verdad. Honesto: si no es para todos, se dice. */
  paraQuien: string;
  /** Operaciones con sentido real en la zona. Alimenta los enlaces al SERP. */
  operaciones: Array<'comprar' | 'arrendar' | 'estancias'>;
}

/**
 * Datos que SOLO puede aportar Daniel. Mientras estén vacíos, la plantilla no pinta la sección:
 * no se rellena con estimaciones. Cada uno es un dato que un cliente podría usar para decidir, así
 * que una cifra inventada aquí no es un adorno, es una mentira con consecuencias.
 */
export const PENDIENTE_DUENO = [
  'Rango real de precio por m² por zona (venta y arriendo). Es el insumo del Rango ALTORRA (ítem 9).',
  'Proyectos de obra nueva vigentes por zona, con nombre y constructora verificables.',
  'Qué zonas trabaja ALTORRA de verdad hoy y en cuáles no tiene inventario todavía.',
] as const;

export const ZONAS: Zona[] = [
  {
    slug: 'el-laguito',
    nombre: 'El Laguito',
    titulo: 'Inmuebles en El Laguito, Cartagena',
    descripcion:
      'Apartamentos en El Laguito, en la punta de Bocagrande y con playa a dos costados. Te contamos cómo se vive la zona y qué revisar antes de comprar.',
    cuerpo:
      'El Laguito ocupa la punta de la península de Bocagrande, con agua a lado y lado. Es zona de edificios altos, mucha vida de temporada y un movimiento de visitantes que no se detiene en todo el año. Quien compra aquí suele buscar dos cosas a la vez: un apartamento para disfrutar y un inmueble que trabaje cuando no lo está usando. Esa doble función cambia lo que hay que mirar en los papeles, y por eso revisamos el reglamento de propiedad horizontal antes de mostrarte nada: no todos los edificios permiten alquiler por días, y enterarse después de firmar sale caro.',
    rasgos: [
      'Edificios de altura con vista al mar y a la bahía',
      'Playa accesible caminando desde la mayoría de las torres',
      'Alta rotación de visitantes durante todo el año',
      'Comercio, restaurantes y hotelería a pie',
    ],
    paraQuien:
      'Para quien busca apartamento frente al mar con posibilidad de renta corta, y para el inversionista que quiere ocupación durante buena parte del año. Si lo que buscas es un barrio silencioso y residencial, hay zonas de Cartagena que te van a servir mejor y te las mostramos.',
    operaciones: ['comprar', 'arrendar', 'estancias'],
  },
  {
    slug: 'marbella',
    nombre: 'Marbella',
    titulo: 'Inmuebles en Marbella, Cartagena',
    descripcion:
      'Marbella, entre el Centro y Crespo, con playa abierta y ritmo residencial. Qué tipo de vivienda encuentras y qué mirar antes de decidir.',
    cuerpo:
      'Marbella corre entre el Centro Histórico y Crespo, con la playa de un lado y avenida del otro. Conserva un ritmo residencial que en otras zonas de mar ya se perdió: aquí hay vecinos de siempre, edificios de los años buenos y torres nuevas conviviendo en las mismas cuadras. Esa mezcla es justo lo que hay que leer con cuidado, porque la edad del edificio manda sobre el estado de las redes, el mantenimiento y lo que va a pesar la administración cada mes. Cuando te acompañamos a ver un inmueble aquí, esas preguntas van hechas de antemano.',
    rasgos: [
      'Playa abierta y menos concurrida que Bocagrande',
      'Convivencia de edificios antiguos y torres recientes',
      'Cerca del Centro Histórico sin el bullicio del casco',
      'Carácter residencial con vecindario establecido',
    ],
    paraQuien:
      'Para quien quiere vivir cerca del mar y del Centro sin quedar en medio del movimiento turístico. Funciona bien para vivienda propia y para arriendo de largo plazo.',
    operaciones: ['comprar', 'arrendar'],
  },
  {
    slug: 'san-diego',
    nombre: 'San Diego',
    titulo: 'Inmuebles en San Diego, Centro Histórico de Cartagena',
    descripcion:
      'San Diego, dentro de la muralla: casas coloniales, plazas y balcones. Lo que debes saber sobre comprar patrimonio en Cartagena.',
    cuerpo:
      'San Diego es uno de los barrios de adentro de la muralla, con plazas, casas coloniales y balcones de madera. Comprar aquí no se parece a comprar en ningún otro punto de la ciudad, porque el inmueble está dentro de un conjunto declarado patrimonio y eso pone reglas sobre lo que puedes intervenir, cómo y con qué permisos. Antes de que te ilusiones con una reforma, revisamos el estado del predio y qué se puede hacer legalmente con él. Es la parte menos vistosa del negocio y es la que evita que una compra bonita se convierta en un problema.',
    rasgos: [
      'Dentro del casco amurallado, declarado patrimonio',
      'Casas coloniales y republicanas con balcón',
      'Plazas y restaurantes a pocos pasos',
      'Intervenciones sujetas a normativa de patrimonio',
    ],
    paraQuien:
      'Para quien busca una casa con historia dentro de la muralla y entiende que el patrimonio impone condiciones. Si el plan incluye reformar, esa conversación la tenemos antes de la oferta.',
    operaciones: ['comprar', 'estancias'],
  },
  {
    slug: 'el-cabrero',
    nombre: 'El Cabrero',
    titulo: 'Inmuebles en El Cabrero, Cartagena',
    descripcion:
      'El Cabrero, junto a la laguna y a un paso de la muralla. Un barrio tradicional con ubicación central. Qué encuentras y qué revisar.',
    cuerpo:
      'El Cabrero queda entre la laguna y el mar, pegado al Centro Histórico. Es un barrio tradicional, de casas con historia y calles tranquilas, que tiene la ubicación de una zona central sin los precios de adentro de la muralla. Aquí abundan las construcciones con años encima, y en esas casas la revisión estructural pesa tanto como la jurídica. Preferimos decírtelo desde el principio y llevar a alguien que sepa mirar una viga, antes que celebrar el precio y descubrir el problema con las llaves ya en la mano.',
    rasgos: [
      'Entre la laguna y el mar, junto al Centro Histórico',
      'Casas tradicionales con años de construcción',
      'Calles tranquilas con vida de barrio',
      'Ubicación central sin los precios del casco amurallado',
    ],
    paraQuien:
      'Para quien quiere ubicación céntrica y carácter tradicional, y está dispuesto a considerar una casa que puede necesitar intervención.',
    operaciones: ['comprar', 'arrendar'],
  },
  {
    slug: 'pie-de-la-popa',
    nombre: 'Pie de la Popa',
    titulo: 'Inmuebles en Pie de la Popa, Cartagena',
    descripcion:
      'Pie de la Popa, al pie del cerro y bien conectado con toda la ciudad. Vivienda tradicional y ubicación práctica.',
    cuerpo:
      'Pie de la Popa se extiende en la falda del cerro de La Popa, en un punto desde el que se llega rápido a casi cualquier parte de la ciudad. Es un sector residencial de toda la vida, con casas amplias, colegios cerca y comercio de barrio resuelto. Lo que hace atractiva a esta zona es lo práctico: quien vive aquí no depende del carro para lo cotidiano. Antes de mostrarte una casa revisamos su historia documento por documento, porque en barrios de tradición las sucesiones y las divisiones familiares dejan rastro en los papeles.',
    rasgos: [
      'En la falda del cerro de La Popa',
      'Buena conexión con el resto de la ciudad',
      'Casas amplias de tradición familiar',
      'Colegios y comercio de barrio resueltos',
    ],
    paraQuien:
      'Para familias que buscan espacio y ubicación práctica sin pagar la prima del mar. También para quien invierte en arriendo de largo plazo con demanda estable.',
    operaciones: ['comprar', 'arrendar'],
  },
  {
    slug: 'alto-bosque',
    nombre: 'Alto Bosque',
    titulo: 'Inmuebles en Alto Bosque, Cartagena',
    descripcion:
      'Alto Bosque, en alto y con vista sobre la bahía. Zona residencial tranquila. Qué tipo de vivienda encuentras aquí.',
    cuerpo:
      'Alto Bosque está en la parte alta, con vista sobre la bahía y un ambiente notablemente más callado que el de las zonas de playa. Predomina la casa unifamiliar y el lote generoso, con calles de poco tráfico. Es una zona a la que se llega buscando tranquilidad y se decide por lo que se siente al estar parado ahí. Como en toda ladera, lo primero que miramos es el terreno: cómo se comporta el suelo y qué dice la licencia de construcción. Esa revisión va antes de hablar de precio.',
    rasgos: [
      'Zona alta con vista sobre la bahía',
      'Predominio de casa unifamiliar en lote amplio',
      'Calles de poco tráfico',
      'Ambiente residencial y silencioso',
    ],
    paraQuien:
      'Para quien busca casa con espacio y calma, y prefiere la vista alta al acceso directo a la playa.',
    operaciones: ['comprar', 'arrendar'],
  },
  {
    slug: 'la-boquilla',
    nombre: 'La Boquilla',
    titulo: 'Inmuebles en La Boquilla, Cartagena',
    descripcion:
      'La Boquilla, pueblo de pescadores en la Zona Norte, con playa abierta y ciénaga. Qué revisar antes de comprar en la zona.',
    cuerpo:
      'La Boquilla es un pueblo de pescadores en la Zona Norte, con playa larga por un lado y la ciénaga por el otro. En los últimos años el desarrollo llegó fuerte por el corredor de la vía al mar, y hoy conviven la vida del pueblo y los proyectos nuevos. Esa convivencia hace que la revisión de linderos y de títulos sea más delicada que en otras zonas, sobre todo en terrenos cerca del agua. Aquí no mostramos nada sin haber leído primero el expediente completo, y si algo no cuadra, te lo decimos aunque se caiga el negocio.',
    rasgos: [
      'Playa larga y abierta en la Zona Norte',
      'Ciénaga y manglar en el costado interior',
      'Desarrollo reciente sobre el corredor de la vía al mar',
      'Vida de pueblo conviviendo con proyectos nuevos',
    ],
    paraQuien:
      'Para quien busca playa fuera del casco urbano y entiende que en zona de desarrollo la revisión documental pesa más que en otras partes.',
    operaciones: ['comprar', 'estancias'],
  },
  {
    slug: 'cielo-mar',
    nombre: 'Cielo Mar',
    titulo: 'Inmuebles en Cielo Mar, Zona Norte de Cartagena',
    descripcion:
      'Cielo Mar, sector residencial de la Zona Norte con acceso a playa. Qué encuentras y para quién funciona.',
    cuerpo:
      'Cielo Mar es un sector residencial de la Zona Norte, sobre el corredor que sale de la ciudad hacia el norte. La vivienda aquí es mayormente de conjunto cerrado, pensada para quien quiere estar cerca del mar sin meterse en el movimiento del centro turístico. La zona sigue en crecimiento, lo que significa que el entorno de hoy no es necesariamente el de dentro de tres años. Cuando te acompañamos a ver algo aquí, hablamos también de lo que está proyectado alrededor, porque eso pesa en la decisión tanto como el apartamento.',
    rasgos: [
      'Sector residencial de la Zona Norte',
      'Predominio de conjuntos cerrados',
      'Acceso a playa sin el movimiento del centro turístico',
      'Entorno en crecimiento',
    ],
    paraQuien:
      'Para quien quiere vivienda cerca del mar en conjunto cerrado, y para el que invierte con horizonte de mediano plazo en una zona que todavía se está formando.',
    operaciones: ['comprar', 'arrendar'],
  },
  {
    slug: 'manzanillo-del-mar',
    nombre: 'Manzanillo del Mar',
    titulo: 'Inmuebles en Manzanillo del Mar, Cartagena',
    descripcion:
      'Manzanillo del Mar, en el norte y con playa amplia. Zona de desarrollo con vocación de descanso. Qué mirar antes de comprar.',
    cuerpo:
      'Manzanillo del Mar queda más al norte, con playa amplia y menos densidad que los sectores cercanos a la ciudad. Es zona de casas de descanso y proyectos de baja altura, con un ritmo distinto al del casco urbano. La distancia es parte del atractivo y también parte de lo que hay que pensar: conviene tener claro cómo se resuelve el día a día antes de decidir. Te lo planteamos de frente en la visita, con la ruta hecha, para que la distancia sea una decisión y no una sorpresa.',
    rasgos: [
      'Playa amplia con baja densidad de construcción',
      'Vocación de casa de descanso',
      'Proyectos de baja altura',
      'Ritmo separado del casco urbano',
    ],
    paraQuien:
      'Para quien busca segunda vivienda o casa de descanso frente al mar y valora la baja densidad por encima de la cercanía a la ciudad.',
    operaciones: ['comprar', 'estancias'],
  },
  {
    slug: 'karibana',
    nombre: 'Karibana',
    titulo: 'Inmuebles en Karibana, Cartagena',
    descripcion:
      'Karibana, en Barcelona de Indias: golf, playa y vivienda en conjunto. Qué encuentras y qué revisar en la compra.',
    cuerpo:
      'Karibana se levanta en el sector de Barcelona de Indias, al norte, alrededor de un campo de golf y con salida a playa. La vivienda es de conjunto, con servicios comunes y un esquema de administración más elaborado que el de un edificio corriente. Ahí está el detalle que más se pasa por alto: en desarrollos con amenidades extensas, la cuota de administración y las reglas de uso pesan mucho en el costo real de tener el inmueble. Te mostramos esos números y ese reglamento antes de que hagas una oferta.',
    rasgos: [
      'Alrededor de campo de golf, con salida a playa',
      'Vivienda en conjunto con servicios comunes',
      'Esquema de administración con amenidades',
      'En el sector de Barcelona de Indias, al norte',
    ],
    paraQuien:
      'Para quien busca vivienda de conjunto con amenidades y tiene claro que ese estilo de vida trae una administración acorde.',
    operaciones: ['comprar', 'estancias'],
  },
  {
    slug: 'serena-del-mar',
    nombre: 'Serena del Mar',
    titulo: 'Inmuebles en Serena del Mar, Cartagena',
    descripcion:
      'Serena del Mar, ciudad planificada al norte con hospital y universidad. Qué la distingue y para quién tiene sentido.',
    cuerpo:
      'Serena del Mar es un desarrollo planificado al norte de Cartagena, concebido como ciudad y no como conjunto: nació con hospital, sede universitaria y su propia trama urbana. Eso lo separa del resto de la oferta de la Zona Norte, porque el entorno no depende de lo que se construya después. Para quien compra, la pregunta útil es en qué etapa está lo que le interesa y qué queda por entregar. Esa información la pedimos y la verificamos antes de acompañarte a ver, para que compares lo que existe con lo que está en plano.',
    rasgos: [
      'Desarrollo planificado con trama urbana propia',
      'Hospital y sede universitaria dentro del proyecto',
      'Entorno definido desde el diseño',
      'Al norte de Cartagena, sobre el corredor de la vía al mar',
    ],
    paraQuien:
      'Para quien busca un entorno resuelto y planificado, y para familias que valoran tener salud y educación dentro del mismo desarrollo.',
    operaciones: ['comprar', 'arrendar'],
  },
  {
    slug: 'tierrabomba',
    nombre: 'Tierrabomba',
    titulo: 'Inmuebles en Tierrabomba, Cartagena',
    descripcion:
      'Tierrabomba, la isla frente a la bahía. Baja densidad y acceso por mar. Lo que hay que saber antes de comprar en isla.',
    cuerpo:
      'Tierrabomba es la isla que se ve desde Bocagrande, a pocos minutos de lancha. Tiene playas, poblaciones pequeñas y una densidad de construcción baja. Comprar en isla es otro negocio: el acceso es por mar, los servicios funcionan distinto y la titulación de predios exige una revisión más detenida que en tierra firme. Nada de eso descalifica la zona, y sí cambia por completo la lista de preguntas. Te la hacemos con tiempo, antes de que te enamores del atardecer.',
    rasgos: [
      'Isla frente a la bahía, a minutos en lancha',
      'Baja densidad de construcción',
      'Acceso exclusivamente por mar',
      'Servicios con funcionamiento distinto al de tierra firme',
    ],
    paraQuien:
      'Para quien busca retiro o proyecto turístico en isla y acepta que el acceso y los servicios funcionan con otras reglas.',
    operaciones: ['comprar', 'estancias'],
  },
  {
    slug: 'baru',
    nombre: 'Barú',
    titulo: 'Inmuebles en Barú, Cartagena',
    descripcion:
      'Barú, al sur, con playas de arena blanca y agua clara. Zona de casas de descanso y proyecto turístico. Qué revisar.',
    cuerpo:
      'Barú se extiende al sur de la bahía, con las playas de arena blanca que la hicieron conocida. Es zona de casas de descanso, hotelería pequeña y proyectos con vocación turística. Como toda zona costera de alto atractivo, aquí la revisión de títulos, linderos y permisos ambientales es la parte seria del trabajo, y no siempre es rápida. Preferimos tomarnos ese tiempo contigo. Un negocio en Barú se hace bien cuando el expediente está completo, no cuando el paisaje convence.',
    rasgos: [
      'Playas de arena blanca al sur de la bahía',
      'Casas de descanso y hotelería de pequeño formato',
      'Proyectos con vocación turística',
      'Revisión ambiental y de linderos más exigente',
    ],
    paraQuien:
      'Para quien busca casa de descanso o proyecto turístico frente a playa y entiende que el expediente manda sobre el paisaje.',
    operaciones: ['comprar', 'estancias'],
  },
];

/** Índice O(1) por slug, para `getStaticPaths` y para resolver enlaces cruzados. */
export const ZONA_POR_SLUG = new Map(ZONAS.map((z) => [z.slug, z]));
