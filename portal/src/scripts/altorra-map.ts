// Mapa REAL del portal — MapLibre GL + Protomaps (.pmtiles) — TODO-30 / ADR §16.1.
// Cliente ÚNICO compartido por la ficha y el SERP. Se ejecuta SOLO en el navegador (isla).
//
// DISEÑO (degradación limpia):
//  · El basemap vive en un `.pmtiles` de Cartagena (~3.3 MB, generado con go-pmtiles) EMPACADO como asset
//    estático en `public/basemap/` → se despliega con el sitio (cero APIs de pago, cero credenciales R2).
//    Refinamiento del sello "pmtiles en R2" (§3.7, ADR §55.8): para UN basemap chico e inmutable, el asset
//    estático es más simple que R2 (que sigue siendo el hogar de las FOTOS: muchas, grandes, de usuario).
//  · La URL es CONFIGURABLE (`PUBLIC_PMTILES_URL`); default = el asset estático. La ruta Worker R2
//    `/tiles/[file]` queda como alternativa para tiles futuros/grandes. Si el archivo faltara, el mapa NO
//    pinta y el ESQUEMÁTICO SELLADO permanece visible (fallback).
//  · Al pintar el basemap real, el contenedor recibe `.is-live` → se oculta el esquemático y aparecen
//    los pines-precio como marcadores MapLibre (se mueven con el mapa). El emparejamiento card↔pin
//    (hover) sigue funcionando: los marcadores llevan `data-pin-idx` igual que los pines esquemáticos.
//  · Paleta: basemap claro Protomaps + chrome del panel (zoom/nota) y pines en navy/oro (sello §32).
//
// glyphs/sprites de Protomaps = GitHub Pages estático (gratuito, no es API de pago). El .pmtiles y los
// datos de propiedades son propios. Rotación deshabilitada (mapa urbano plano, sin gestos accidentales).

// maplibre-gl v6 = ESM con named exports (ya no hay default export).
import { Map as MapLibreMap, Marker, LngLatBounds, addProtocol, type ErrorEvent } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { layers, namedFlavor } from '@protomaps/basemaps';
import 'maplibre-gl/dist/maplibre-gl.css';
import './altorra-map.css';

interface PinData {
  i: number; // índice para emparejar con su card (data-pin-idx)
  lat: number;
  lng: number;
  label?: string; // precio corto, p.ej. "$980M"
  active?: boolean; // pin resaltado por defecto (mockup: card 2 "is-on")
}

// URL del basemap. Default = asset estático empacado con el sitio. Override por env para apuntar a la
// ruta R2 (`/tiles/cartagena.pmtiles`) o a un `.pmtiles` remoto (p.ej. build.protomaps.com) en pruebas.
const PMTILES_URL = (import.meta.env.PUBLIC_PMTILES_URL as string | undefined) || '/basemap/cartagena.pmtiles';

let protocolReady = false;
let booted = false;

function initOne(el: HTMLElement): void {
  const canvas = el.querySelector<HTMLElement>('[data-map-canvas]');
  if (!canvas) return;

  let pins: PinData[] = [];
  try {
    pins = JSON.parse(el.dataset.markers || '[]');
  } catch {
    pins = [];
  }

  const zoom = Number(el.dataset.zoom || '13');
  const centerAttr = el.dataset.center; // "lng,lat"
  const center: [number, number] = centerAttr
    ? (centerAttr.split(',').map(Number) as [number, number])
    : [-75.535, 10.41]; // Cartagena de Indias (fallback razonable)
  const fit = el.dataset.fit === 'true';
  const pinClass = el.dataset.pinClass || 'alt-mappin';

  if (!protocolReady) {
    addProtocol('pmtiles', new Protocol().tile);
    protocolReady = true;
  }

  let map: MapLibreMap;
  try {
    map = new MapLibreMap({
      container: canvas,
      center,
      zoom,
      minZoom: 9,
      maxZoom: 18,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
      style: {
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
        sources: {
          protomaps: {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`,
            attribution:
              '<a href="https://protomaps.com" target="_blank" rel="noopener">Protomaps</a> © <a href="https://openstreetmap.org" target="_blank" rel="noopener">OpenStreetMap</a>',
          },
        },
        layers: layers('protomaps', namedFlavor('light'), { lang: 'es' }),
      },
    });
  } catch {
    // WebGL no disponible → queda el esquemático sellado. Nunca una caja rota.
    return;
  }

  // Sin rotación (mapa urbano plano).
  map.touchZoomRotate.disableRotation();

  // Botones de zoom SELLADOS del panel (navy/oro), no los controles por defecto de MapLibre.
  el.querySelector('[data-map-zoom="in"]')?.addEventListener('click', () => map.zoomIn());
  el.querySelector('[data-map-zoom="out"]')?.addEventListener('click', () => map.zoomOut());

  // Pines-precio como marcadores (se mueven con el mapa). Reusan el look sellado por la clase.
  for (const p of pins) {
    if (typeof p.lat !== 'number' || typeof p.lng !== 'number') continue;
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = pinClass;
    if (p.active) pin.classList.add('is-on');
    pin.dataset.pinIdx = String(p.i);
    pin.textContent = p.label ?? '';
    pin.setAttribute('aria-label', p.label ? `Propiedad · ${p.label}` : 'Propiedad');
    new Marker({ element: pin, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).addTo(map);
  }

  // Encuadrar a los pines cuando hay varios (SERP); la ficha usa center+zoom fijos.
  if (fit && pins.length > 1) {
    const b = new LngLatBounds();
    for (const p of pins) b.extend([p.lng, p.lat]);
    map.fitBounds(b, { padding: 70, maxZoom: 15, duration: 0 });
  }

  // Subir la cortina del esquemático SOLO cuando la FUENTE pmtiles cargó de verdad (no en `load`:
  // el estilo carga aunque el .pmtiles falle → `load` mostraría un mapa EN BLANCO). `isSourceLoaded`
  // solo es true si los tiles del viewport llegaron. Sin .pmtiles → nunca va a vivo → esquemático se queda.
  let wentLive = false;
  map.on('sourcedata', (e) => {
    if (!wentLive && e.sourceId === 'protomaps' && e.isSourceLoaded) {
      wentLive = true;
      el.classList.add('is-live');
    }
  });

  // Fallo de fuente/tiles (aún no hay .pmtiles, red caída): no hacemos nada — el default ES el
  // esquemático sellado (no añadimos `is-live` hasta confirmar carga). Silenciamos para no ensuciar consola.
  map.on('error', (_e: ErrorEvent) => {
    /* degradación silenciosa: permanecer en el esquemático */
  });
}

/** Inicializa todos los mapas de la página. Idempotente. */
export function bootMaps(): void {
  if (booted) return;
  booted = true;
  const run = () => document.querySelectorAll<HTMLElement>('[data-alt-map]').forEach(initOne);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}
