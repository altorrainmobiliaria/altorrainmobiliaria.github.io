// Generador de propiedades SEMILLA (dev/implementación) — datos realistas de Cartagena para desbloquear
// el E2E de la capa de datos mientras no hay inventario real. Determinista por `seed` (reproducible).
//
// ⚠️ IMÁGENES = placeholders libres de regalías (Lorem Picsum, por URL). NO son de terceros con derechos
//    (nada de Google Images — L-O10). En producción las fotos van por el pipeline R2 (WebP derivados);
//    aquí son URLs externas SOLO para semilla. Cámbialas cuando entre inventario real.
//
// Uso: `import { generarPropiedades } from './generar-propiedades.mjs'` → array de objetos con la forma
// del tipo `Propiedad` del dominio (portal/src/lib/domain/propiedades.ts).

/** PRNG determinista (mulberry32) — para semilla reproducible sin Math.random. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Barrios de Cartagena con centroide APROXIMADO (nunca dirección exacta — OD3/FTI-01).
const BARRIOS = [
  { barrio: 'Bocagrande', zona: 'Turística', lat: 10.399, lng: -75.554 },
  { barrio: 'Castillogrande', zona: 'Turística', lat: 10.393, lng: -75.560 },
  { barrio: 'El Laguito', zona: 'Turística', lat: 10.389, lng: -75.565 },
  { barrio: 'Manga', zona: 'Centro', lat: 10.410, lng: -75.535 },
  { barrio: 'Getsemaní', zona: 'Centro Histórico', lat: 10.421, lng: -75.545 },
  { barrio: 'Centro Histórico', zona: 'Centro Histórico', lat: 10.424, lng: -75.551 },
  { barrio: 'Crespo', zona: 'Norte', lat: 10.446, lng: -75.514 },
  { barrio: 'La Boquilla', zona: 'Norte', lat: 10.470, lng: -75.505 },
  { barrio: 'Pie de la Popa', zona: 'Centro', lat: 10.417, lng: -75.528 },
  { barrio: 'Marbella', zona: 'Norte', lat: 10.435, lng: -75.535 },
];

const TIPOS = ['apartamento', 'casa', 'apartaestudio', 'local', 'oficina', 'penthouse'];
const TIPO_DOMINIO = { penthouse: 'apartamento' }; // 'penthouse' es marketing → tipo canónico apartamento
const AMENIDADES_POOL = [
  'piscina', 'gimnasio', 'ascensor', 'porteria24h', 'balcon', 'aireAcondicionado',
  'vistaAlMar', 'cocinaIntegral', 'zonaBBQ', 'jacuzzi', 'terraza', 'parqueaderoVisitantes',
];
// Distribución realista de estado (con cola de borradores para probar el fail-closed de las rules).
const ESTADOS = [
  ...Array(13).fill('disponible'), ...Array(3).fill('reservado'),
  ...Array(2).fill('cerrado'), 'inactivo', 'borrador',
];

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const int = (rnd, min, max) => Math.floor(rnd() * (max - min + 1)) + min;
const redondear = (n, paso) => Math.round(n / paso) * paso;

function verticalDe(operacion, tipo) {
  if (operacion === 'alojamiento') return 'turistico';
  if (['local', 'oficina', 'bodega', 'consultorio', 'edificio'].includes(tipo)) return 'comercial';
  return 'vivienda';
}

function precioDe(rnd, operacion) {
  if (operacion === 'venta') return { moneda: 'COP', valorVenta: redondear(int(rnd, 180, 1800) * 1_000_000, 1_000_000) };
  if (operacion === 'arriendo') {
    return {
      moneda: 'COP',
      canon: redondear(int(rnd, 1_200_000, 7_000_000), 50_000),
      administracion: redondear(int(rnd, 200_000, 900_000), 10_000),
      adminIncluidaEnCanon: rnd() < 0.2,
    };
  }
  return { moneda: 'COP', precioNoche: redondear(int(rnd, 150_000, 750_000), 10_000), precioAseo: redondear(int(rnd, 40_000, 120_000), 5_000) };
}

/**
 * @param {number} n     cuántas propiedades generar
 * @param {number} seed  semilla (reproducible); default 42
 * @returns {object[]}   array con la forma de `Propiedad` del dominio
 */
export function generarPropiedades(n = 12, seed = 42) {
  const rnd = mulberry32(seed);
  const props = [];
  for (let i = 0; i < n; i++) {
    const g = pick(rnd, BARRIOS);
    const operacion = pick(rnd, [...Array(4).fill('venta'), ...Array(4).fill('arriendo'), ...Array(2).fill('alojamiento')]);
    const tipoRaw = pick(rnd, TIPOS);
    const tipo = TIPO_DOMINIO[tipoRaw] ?? tipoRaw;
    const estado = ESTADOS[i % ESTADOS.length];
    const id = `INM-202607-${String(i + 1).padStart(4, '0')}`;
    const amenidades = Object.fromEntries(AMENIDADES_POOL.map((a) => [a, rnd() < 0.5])); // MIX true/false (prueba decode por-clave)
    const habitaciones = tipoRaw === 'apartaestudio' ? 1 : int(rnd, 1, 5);
    const nImgs = int(rnd, 3, 5);
    const imagenes = Array.from({ length: nImgs }, (_, k) => `https://picsum.photos/seed/${id}-${k}/800/600`);
    const nombreBonito = `${tipoRaw[0].toUpperCase()}${tipoRaw.slice(1)} en ${g.barrio}`;

    props.push({
      id,
      codigoLegacy: `ALT-${operacion === 'arriendo' ? 'AR-' : ''}${1000 + i}`,
      operacion,
      vertical: verticalDe(operacion, tipo),
      tipo,
      estado,
      titulo: `${nombreBonito} · ${habitaciones} hab`,
      descripcion: `${nombreBonito} con excelente ubicación en ${g.barrio}, Cartagena. ${operacion === 'alojamiento' ? 'Ideal para estancias cortas.' : 'Listo para estrenar.'} (Datos SEMILLA de implementación.)`,
      slug: `${tipoRaw}-${g.barrio.toLowerCase().replace(/[^a-z]+/g, '-')}-${id.toLowerCase()}`,
      geo: { ciudad: 'Cartagena de Indias', zona: g.zona, barrio: g.barrio, lat: g.lat, lng: g.lng },
      specs: {
        habitaciones,
        banos: int(rnd, 1, 4),
        areaConstruidaM2: int(rnd, 45, 350),
        estrato: int(rnd, 3, 6),
        parqueaderos: int(rnd, 0, 3),
        piso: int(rnd, 1, 25),
        antiguedadAnios: int(rnd, 0, 30),
      },
      amenidades,
      otrasAmenidades: rnd() < 0.4 ? ['Domótica', 'Cuarto de servicio'] : [],
      precio: precioDe(rnd, operacion),
      priceHistory: operacion === 'venta'
        ? [{ fecha: '2026-05-01', valor: redondear(int(rnd, 180, 1800) * 1_000_000, 1_000_000) }]
        : [],
      ...(operacion === 'alojamiento' ? { rnt: `RNT-${100000 + i}` } : {}),
      imagenes,
      imagenPortada: imagenes[0],
      featured: rnd() < 0.25,
      verificadoAltorra: rnd() < 0.6,
      _version: 1,
      createdAt: '2026-07-11T00:00:00.000Z',
      updatedAt: '2026-07-11T00:00:00.000Z',
    });
  }
  return props;
}

// CLI: `node firebase/seed/generar-propiedades.mjs --print` imprime 2 muestras (inerte al importar).
if (process.argv[1] && process.argv[1].endsWith('generar-propiedades.mjs')) {
  const muestra = generarPropiedades(8, 42);
  console.log(JSON.stringify(muestra.slice(0, 2), null, 2));
  console.log(`\n(${muestra.length} generadas · estados: ${muestra.map((p) => p.estado).join(', ')})`);
}
