import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { generarPropiedades } from '../seed/generar-propiedades.mjs';
import { getDataClient } from '../../src/lib/data/client';
import { buscarProyecto } from '../../src/lib/data/buscar-proyecto';
import { jsonLdProyecto, rangoDePrecios } from '../../src/lib/domain/proyectos';

// E2E de la capa de datos: siembra propiedades SEMILLA en el emulador (via Admin/rules-disabled) y las
// lee con el CLIENTE REST REAL (`baseUrl` → emulador). Ejercita el camino completo contra el wire format
// REAL de Firestore (no stubs): cliente → REST → Security Rules → decode → objeto de dominio.
// Corre bajo `firebase emulators:exec` (mismo runner que rules.test.ts).
//
// ⚠️ projectId PROPIO (`demo-altorra-e2e`) — NO compartir con `rules.test.ts` (`demo-altorra`): ese
// archivo hace `beforeEach(clearFirestore)` y, como vitest paraleliza archivos contra el MISMO emulador,
// borraría esta semilla a mitad de camino. El emulador aísla datos por projectId → sin colisión.
const PROJECT = 'demo-altorra-e2e';
const EMU = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const BASE = `http://${EMU}/v1`;
const BORRADOR_ID = 'INM-202607-9001';

let env: RulesTestEnvironment;
const props = generarPropiedades(12, 42);
const disponible = props.find((p) => p.estado === 'disponible')!;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: readFileSync(resolve(import.meta.dirname, '../firestore.rules'), 'utf8') },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const p of props) await setDoc(doc(db, 'propiedades', p.id), p);
    await setDoc(doc(db, 'propiedades', BORRADOR_ID), { ...disponible, id: BORRADOR_ID, estado: 'borrador' });
    await setDoc(doc(db, 'config', 'general'), {
      razonSocial: 'ALTORRA COMPANY S.A.S.', nit: '902063965-4', matriculaArrendador: 'AMC-OFI-0074376-2026',
    });
    await setDoc(doc(db, 'disponibilidad', `${disponible.id}_2026-07-20`), {
      propiedadId: disponible.id, fecha: '2026-07-20', estado: 'libre', _version: 1,
    });
  });
});
afterAll(async () => env?.cleanup());

const client = () => getDataClient({ PUBLIC_FIREBASE_PROJECT_ID: PROJECT, PUBLIC_FIREBASE_API_KEY: 'demo' }, { baseUrl: BASE });

describe('E2E capa de datos — cliente REST real vs emulador Firestore (seed realista Cartagena)', () => {
  it('lee una propiedad publicada y la DECODIFICA fiel (mapas/arrays anidados, doubles, integers, booleanos)', async () => {
    const r = await client().propiedades.get(disponible.id);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const p = r.data;
    expect(p.id).toBe(disponible.id);
    expect(p.titulo).toBe(disponible.titulo);
    expect(p.geo.barrio).toBe(disponible.geo.barrio); // mapa anidado
    expect(typeof p.geo.lat).toBe('number'); // double
    expect(Array.isArray(p.imagenes)).toBe(true);
    expect(p.imagenes.length).toBe(disponible.imagenes.length); // array de strings
    expect(p.imagenes[0]).toContain('picsum.photos');
    expect(p._version).toBe(1); // integerValue (string en REST) → number
    expect(typeof p.amenidades).toBe('object'); // Record<string,boolean>
    // una amenidad `false` debe decodificar como false (no undefined) — el fix del despacho por-clave, EN VIVO
    if (Object.values(disponible.amenidades).includes(false)) {
      expect(Object.values(p.amenidades)).toContain(false);
    }
  });

  it('un BORRADOR se colapsa a `unavailable` (la rule lo niega vía REST — no filtra existencia)', async () => {
    expect(await client().propiedades.get(BORRADOR_ID)).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('una propiedad INEXISTENTE también es `unavailable` (indistinguible del borrador → 403)', async () => {
    expect(await client().propiedades.get('INM-202607-0000')).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('config.getGeneral() trae razón social + matrícula de arrendador (footer legal)', async () => {
    const r = await client().config.getGeneral();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.razonSocial).toBe('ALTORRA COMPANY S.A.S.');
      expect(r.data.matriculaArrendador).toBe('AMC-OFI-0074376-2026');
    }
  });

  it('config.get("gestion") se niega en el cliente sin tocar el emulador (deny-list = rule)', async () => {
    expect(await client().config.get('gestion')).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('disponibilidad.get() lee el doc {propiedadId}_{fecha}', async () => {
    const r = await client().disponibilidad.get(disponible.id, '2026-07-20');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.estado).toBe('libre');
  });
});

/*
 * ═══ §307 — LA VERTICAL DE OBRA NUEVA, DE PUNTA A PUNTA CONTRA EL EMULADOR ═══════════════════════
 *
 * POR QUÉ AQUÍ Y NO EN UNA PRUEBA CON DOBLES. `buscar-proyecto.test.ts` ya prueba la lógica con un
 * cliente de mentira, y eso cubre las DECISIONES. Lo que no puede cubrir es el wire format real: que
 * `tipologias` —un ARRAY DE MAPAS, la forma más rara del modelo— sobreviva al ida y vuelta por REST,
 * y que el índice que escribe el rebuild sea el mismo que lee la resolución del slug. Las dos cosas
 * fallarían en silencio y solo en producción.
 *
 * Es la misma razón por la que existe el resto de este fichero: el cast `as Proyecto` compila sobre
 * cualquier cosa, así que la forma hay que verla llegar.
 */
describe('E2E obra nueva — el slug resuelve por el índice y el documento decodifica (§307)', () => {
  const PRY_ID = 'PRY-202608-0001';
  const PRY = {
    _version: 1,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z',
    id: PRY_ID,
    slug: 'torre-marea',
    nombre: 'Torre Marea',
    constructora: 'Constructora Caribe S.A.S',
    licenciaConstruccion: 'LC-2026-0345',
    curaduria: 'Curaduría Urbana No. 1 de Cartagena',
    estadoObra: 'preventa',
    descripcion: 'Frente al mar, en Bocagrande.',
    geo: { ciudad: 'Cartagena', barrio: 'Bocagrande', lat: 10.403, lng: -75.552 },
    tipologias: [
      { nombre: 'Tipo A', tipo: 'apartamento', areaM2: 68, habitaciones: 2, banos: 2, desde: 450_000_000 },
      { nombre: 'Tipo B', tipo: 'apartamento', areaM2: 96, habitaciones: 3, banos: 2, desde: 720_000_000 },
    ],
    imagenes: ['pry/marea/1.webp'],
    estado: 'disponible',
  };

  beforeAll(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'proyectos', PRY_ID), PRY);
      await setDoc(doc(db, 'proyectos', 'PRY-202608-0002'), { ...PRY, id: 'PRY-202608-0002', slug: 'sin-licencia', licenciaConstruccion: '' });
      // El índice, tal y como lo escribe `construirIndices` desde §301: el proyecto vive en el shard
      // de VENTA, con su `clase`, junto a los inmuebles.
      await setDoc(doc(db, 'indices', 'catalogo-venta'), {
        _version: 1,
        actualizado: '2026-08-20T00:00:00Z',
        items: [
          { id: disponible.id, slug: 'apto-cualquiera', titulo: 'Apto', operacion: 'venta', tipo: 'apartamento', precio: 1, sector: 'Manga', coords: null, thumb: 'x', pub: '2026-08-20' },
          { id: PRY_ID, slug: 'torre-marea', clase: 'proyecto', titulo: 'Torre Marea', operacion: 'venta', tipo: 'apartamento', precio: 450_000_000, precioHasta: 720_000_000, sector: 'Bocagrande', coords: null, thumb: 'x', pub: '2026-08-20' },
          { id: 'PRY-202608-0002', slug: 'sin-licencia', clase: 'proyecto', titulo: 'Sin licencia', operacion: 'venta', tipo: 'apartamento', precio: 1, sector: 'Manga', coords: null, thumb: 'x', pub: '2026-08-20' },
        ],
      });
    });
  });

  it('🎯 `/proyecto/torre-marea` resuelve por el ÍNDICE y trae el proyecto entero', async () => {
    const r = await buscarProyecto(client(), 'torre-marea');
    expect(r.estado).toBe('ok');
    if (r.estado !== 'ok') return;
    expect(r.p.id).toBe(PRY_ID);
    expect(r.p.constructora).toBe('Constructora Caribe S.A.S');
  });

  it('🔬 las TIPOLOGÍAS sobreviven al wire format: array de MAPAS, con sus números', async () => {
    const r = await buscarProyecto(client(), 'torre-marea');
    if (r.estado !== 'ok') throw new Error('debía encontrarla');
    expect(r.p.tipologias).toHaveLength(2);
    expect(r.p.tipologias[0].nombre).toBe('Tipo A');
    expect(typeof r.p.tipologias[0].desde).toBe('number'); // integerValue viaja como STRING en REST
    expect(r.p.tipologias[1].areaM2).toBe(96);
    // Y el rango que pinta la ficha sale de AHÍ, no de un campo tecleado (§284.3).
    expect(rangoDePrecios(r.p.tipologias)).toEqual({ desde: 450_000_000, hasta: 720_000_000 });
  });

  it('el id canónico también entra, y en minúsculas', async () => {
    expect((await buscarProyecto(client(), 'pry-202608-0001')).estado).toBe('ok');
  });

  it('🔴 el que está en el índice pero NO tiene licencia se niega igual que uno inexistente', async () => {
    expect((await buscarProyecto(client(), 'sin-licencia')).estado).toBe('no-encontrada');
    expect((await buscarProyecto(client(), 'no-existe-nada')).estado).toBe('no-encontrada');
  });

  it('🔴 el slug de un INMUEBLE no abre una ficha de proyecto aunque comparta shard', async () => {
    expect((await buscarProyecto(client(), 'apto-cualquiera')).estado).toBe('no-encontrada');
  });

  it('y el JSON-LD de lo que SÍ se publica lleva un Offer por tipología', async () => {
    const r = await buscarProyecto(client(), 'torre-marea');
    if (r.estado !== 'ok') throw new Error('debía encontrarla');
    const doc = jsonLdProyecto(r.p, 'https://altorrainmobiliaria.co/proyecto/torre-marea');
    expect(doc).not.toBeNull();
    expect((doc as Record<string, unknown>).offers).toHaveLength(2);
  });
});
