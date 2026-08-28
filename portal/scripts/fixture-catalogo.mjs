#!/usr/bin/env node
/**
 * ENCIENDE EL MODO `live` EN DESARROLLO, con un catálogo de mentira pero CON FORMA REAL (§265).
 *
 * 🔴 POR QUÉ EXISTE. `bootCatalogo()` empieza con `if (FUENTE !== 'live') return;`, y la fuente por
 * defecto es `demo`. O sea: en el servidor de desarrollo, **toda la isla del catálogo está apagada**.
 * Se pueden escribir pruebas unitarias del filtro, del orden y del pintado, verlas pasar en verde, y
 * no haber ejecutado ni una vez el código en la página — porque en la página no corre.
 *
 * Eso ya pasó: el filtro de la búsqueda tenía 26 pruebas verdes y el camino que las usa no se había
 * ejercitado nunca. La prueba pasaba; la función no se llamaba. Un ✅ cuyo denominador excluye el
 * sitio donde vive el problema.
 *
 * QUÉ HACE. Escribe `portal/.env.development.local` (gitignored) con la fuente en `live` y un
 * catálogo de 4 inmuebles servido como URL `data:` — sin fichero en `public/`, así que no hay nada
 * que se pueda colar al build ni que haya que acordarse de borrar.
 *
 * USO:  node scripts/fixture-catalogo.mjs          → enciende live con el fixture
 *       node scripts/fixture-catalogo.mjs --off    → vuelve a demo (borra el fichero)
 * Hay que REINICIAR el servidor de desarrollo: Vite lee el `.env` al arrancar, no en caliente.
 *
 * ⚠️ Solo desarrollo. `astro build` corre en modo producción y NO lee `.env.development.local`, así
 * que esto no puede contaminar un build. Y si alguien lo intentara, `verify:build` ya bloquea un
 * build de producción con la fuente en `demo` — las dos direcciones están cubiertas.
 */
import { writeFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = join(RAIZ, '.env.development.local');

if (process.argv.includes('--off')) {
  if (existsSync(DESTINO)) {
    rmSync(DESTINO);
    console.log('🔌 fixture APAGADO — vuelve el modo demo. Reinicia el servidor de desarrollo.');
  } else {
    console.log('ℹ️  no había fixture que apagar.');
  }
  process.exit(0);
}

/** Cuatro inmuebles en cuatro sectores y tres tipos: suficiente para que un filtro pueda FALLAR. */
const inmueble = (id, titulo, tipo, sector, precio, lat, lng, pub) => ({
  id, slug: id, titulo, operacion: 'venta', tipo, precio, sector,
  coords: { lat, lng }, hab: 3, ban: 2, area: 120,
  thumb: '/assets/villa-pool.webp', badges: ['En venta'], pub,
});

const cuerpo = {
  ok: true,
  items: [
    inmueble('bg1', 'Penthouse frente al mar', 'apartamento', 'Bocagrande', 2_100_000_000, 10.4, -75.55, '2026-01-15'),
    inmueble('mg1', 'Casa republicana restaurada', 'casa', 'Manga', 980_000_000, 10.41, -75.53, '2026-03-01'),
    inmueble('ch1', 'Local en el Centro', 'local', 'Centro Histórico', 640_000_000, 10.42, -75.55, '2026-05-10'),
    inmueble('cr1', 'Casa familiar cerca del mar', 'casa', 'Crespo', 760_000_000, 10.44, -75.51, '2026-08-20'),
  ],
};

const url = `data:application/json,${encodeURIComponent(JSON.stringify(cuerpo))}`;
writeFileSync(DESTINO, `PUBLIC_CATALOGO_SOURCE=live\nPUBLIC_CATALOGO_URL="${url}"\n`, 'utf-8');

console.log(`✅ fixture ENCENDIDO — ${cuerpo.items.length} inmuebles en modo live.`);
console.log('   Reinicia el servidor de desarrollo y prueba, por ejemplo:');
console.log('     /comprar                      → los 4');
console.log('     /comprar?zona=Bocagrande      → 1, y el titular en singular');
console.log('     /comprar?tipo=casa            → 2 (Manga y Crespo)');
console.log('     /comprar?zona=Manga&tipo=local → 0, con el mensaje de «esa búsqueda», no el de «sin inventario»');
console.log('   Para volver a demo:  node scripts/fixture-catalogo.mjs --off');
