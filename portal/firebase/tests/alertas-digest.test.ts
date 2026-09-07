import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeApp, deleteApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { correrDigest, aplicarBajas, leerCatalogo } from '../../functions/src/alertas-digest';
import { refShard } from '../../functions/src/catalogo-rebuild';

// Gates del DIGEST de alertas (ADR §96) contra el EMULADOR REAL con el Admin SDK — el MISMO código
// que correrá en la Cloud Function. Lo que se protege aquí es lo que solo se ve en producción y con
// gente de verdad: que una baja se aplique ANTES de enviar, que la frontera `ultimoEnvio` no se mueva
// si el envío falló, y que sin clave de Resend no se mande nada pero las bajas sí se procesen.
//
// La red NUNCA se toca: `fetchImpl` se inyecta. Un test que mande correo de verdad no es un test.
//
// ⚠️ projectId PROPIO ([[L-21]]): `rules.test.ts` hace clearFirestore() en cada test y arrasaría esta
// semilla si compartieran proyecto.
const PROJECT_ID = 'demo-altorra-alertas';

let app: App;
let db: Firestore;

beforeAll(() => {
  app = initializeApp({ projectId: PROJECT_ID }, 'alertas-tests');
  db = getFirestore(app);
});
afterAll(async () => {
  await deleteApp(app);
});

async function limpiar(): Promise<void> {
  for (const col of ['alertas', 'bajasAlertas', 'indices']) {
    const snap = await db.collection(col).get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
}
beforeEach(limpiar);

const TOKEN = '5f1c0f6e-1c2f-4b0a-9c1d-4a2b6f0e7d31';
const AYER = '2026-08-20T00:00:00.000Z';
const HOY = new Date('2026-08-21T12:00:00.000Z');

function alerta(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    email: 'persona@correo.com',
    criterios: { operacion: 'venta', tipos: [], zonas: [], precioMin: null, precioMax: null, habMin: null },
    estado: 'activa',
    token: TOKEN,
    consentimiento: { autorizado: true },
    ultimoEnvio: AYER,
    enviados: 0,
    createdAt: AYER,
    updatedAt: AYER,
    _version: 1,
    ...over,
  };
}

/** Un resumen de catálogo publicado HOY, o sea posterior al `ultimoEnvio` de la alerta base. */
function resumen(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'INM-1',
    slug: 'apto-bocagrande',
    titulo: 'Apartamento en Bocagrande',
    operacion: 'venta',
    tipo: 'apartamento',
    precio: 450_000_000,
    sector: 'Bocagrande',
    coords: { lat: 10.399, lng: -75.554 },
    hab: 3,
    ban: 2,
    area: 120,
    thumb: 'props/x/thumb.webp',
    pub: '2026-08-21T09:00:00.000Z',
    ...over,
  };
}

const sembrarCatalogo = (items: Record<string, unknown>[]) =>
  db.doc(refShard('venta')).set({ _version: 1, items, actualizado: '2026-08-21T09:05:00.000Z' });

/** `fetch` de mentira que cuenta llamadas y guarda el cuerpo, sin salir a la red. */
function fetchFalso(ok = true) {
  const llamadas: Array<Record<string, unknown>[]> = [];
  const impl = (async (_url: string, init: RequestInit) => {
    llamadas.push(JSON.parse(String(init.body)) as Record<string, unknown>[]);
    return new Response(ok ? '{"data":[]}' : 'error', { status: ok ? 200 : 500 });
  }) as unknown as typeof fetch;
  return { impl, llamadas };
}

describe('correrDigest — sin clave de Resend', () => {
  it('no envía nada, pero SÍ aplica las bajas (revocar no puede depender del envío)', async () => {
    await db.doc('alertas/a1').set(alerta());
    await db.collection('bajasAlertas').add({ alertaId: 'a1', token: TOKEN, createdAt: AYER, aplicada: false });

    const r = await correrDigest(db, { apiKeyResend: '', ahora: HOY });

    expect(r.omitido).toBe('sin-clave-resend');
    expect(r.bajasAplicadas).toBe(1);
    expect((await db.doc('alertas/a1').get()).data()?.estado).toBe('baja');
  });
});

describe('aplicarBajas — el token es lo único que autoriza', () => {
  it('token correcto → la alerta pasa a baja y la petición queda resuelta', async () => {
    await db.doc('alertas/a1').set(alerta());
    const ref = await db.collection('bajasAlertas').add({ alertaId: 'a1', token: TOKEN, createdAt: AYER, aplicada: false });

    const r = await aplicarBajas(db, HOY.toISOString());

    expect(r).toEqual({ aplicadas: 1, ignoradas: 0 });
    expect((await db.doc('alertas/a1').get()).data()?.estado).toBe('baja');
    expect((await ref.get()).data()?.aplicada).toBe(true);
  });

  it('token que no coincide → la alerta NO se toca y la petición se cierra igual (no se reintenta eternamente)', async () => {
    await db.doc('alertas/a1').set(alerta());
    const ref = await db.collection('bajasAlertas').add({ alertaId: 'a1', token: 'otro', createdAt: AYER, aplicada: false });

    const r = await aplicarBajas(db, HOY.toISOString());

    expect(r).toEqual({ aplicadas: 0, ignoradas: 1 });
    expect((await db.doc('alertas/a1').get()).data()?.estado).toBe('activa');
    const baja = (await ref.get()).data();
    expect(baja?.aplicada).toBe(true);
    expect(baja?.motivo).toBe('token-no-coincide');
  });

  it('alerta inexistente → se cierra la petición sin reventar', async () => {
    await db.collection('bajasAlertas').add({ alertaId: 'fantasma', token: TOKEN, createdAt: AYER, aplicada: false });
    expect(await aplicarBajas(db, HOY.toISOString())).toEqual({ aplicadas: 0, ignoradas: 1 });
  });
});

describe('leerCatalogo — estado-cero', () => {
  it('shards que aún no existen devuelven lista vacía, no error (§54.4)', async () => {
    const mapa = await leerCatalogo(db);
    expect(mapa.get('venta')).toEqual([]);
    expect(mapa.get('arriendo')).toEqual([]);
    expect(mapa.get('dias')).toEqual([]);
  });
});

describe('correrDigest — envío', () => {
  it('con novedades: manda UNA petición con el lote y avanza la frontera', async () => {
    await db.doc('alertas/a1').set(alerta());
    await sembrarCatalogo([resumen()]);
    const f = fetchFalso();

    const r = await correrDigest(db, { apiKeyResend: 'k', fetchImpl: f.impl, ahora: HOY });

    expect(r.enviados).toBe(1);
    expect(f.llamadas).toHaveLength(1);
    expect(f.llamadas[0][0].to).toEqual(['persona@correo.com']);

    const despues = (await db.doc('alertas/a1').get()).data()!;
    expect(despues.ultimoEnvio).toBe(HOY.toISOString());
    expect(despues.enviados).toBe(1);
    expect(despues._version).toBe(2);
  });

  it('el correo lleva la salida: enlace de baja con token y cabeceras RFC 8058', async () => {
    await db.doc('alertas/a1').set(alerta());
    await sembrarCatalogo([resumen()]);
    const f = fetchFalso();

    await correrDigest(db, { apiKeyResend: 'k', fetchImpl: f.impl, ahora: HOY });

    const msg = f.llamadas[0][0] as { html: string; text: string; headers: Record<string, string> };
    // En el HTML el `&` va ESCAPADO (`&amp;`), que es lo correcto dentro de un atributo href; en la
    // versión de texto plano va crudo. Se comprueban las dos porque son dos contratos distintos.
    expect(msg.html).toContain(`/alertas/baja?id=a1&amp;t=${TOKEN}`);
    expect(msg.text).toContain(`/alertas/baja?id=a1&t=${TOKEN}`);
    expect(msg.headers['List-Unsubscribe']).toBe(`<https://altorrainmobiliaria.co/alertas/baja?id=a1&t=${TOKEN}>`);
    expect(msg.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });

  it('si el envío falla, la frontera NO se mueve (mañana se reintenta)', async () => {
    await db.doc('alertas/a1').set(alerta());
    await sembrarCatalogo([resumen()]);
    const f = fetchFalso(false);

    const r = await correrDigest(db, { apiKeyResend: 'k', fetchImpl: f.impl, ahora: HOY });

    expect(r.enviados).toBe(0);
    expect(r.fallidos).toBe(1);
    expect((await db.doc('alertas/a1').get()).data()?.ultimoEnvio).toBe(AYER);
  });

  it('nada publicado después del último envío → no se manda correo', async () => {
    await db.doc('alertas/a1').set(alerta());
    await sembrarCatalogo([resumen({ pub: '2026-08-19T00:00:00.000Z' })]);
    const f = fetchFalso();

    const r = await correrDigest(db, { apiKeyResend: 'k', fetchImpl: f.impl, ahora: HOY });

    expect(r.omitido).toBe('sin-novedades');
    expect(f.llamadas).toHaveLength(0);
  });

  it('una alerta dada de baja no recibe nada aunque haya novedades', async () => {
    await db.doc('alertas/a1').set(alerta({ estado: 'baja' }));
    await sembrarCatalogo([resumen()]);
    const f = fetchFalso();

    const r = await correrDigest(db, { apiKeyResend: 'k', fetchImpl: f.impl, ahora: HOY });

    expect(r.omitido).toBe('sin-alertas');
    expect(f.llamadas).toHaveLength(0);
  });

  it('los criterios filtran de verdad: una alerta de Manga no recibe un inmueble de Bocagrande', async () => {
    await db.doc('alertas/a1').set(
      alerta({ criterios: { operacion: 'venta', tipos: [], zonas: ['Manga'], precioMin: null, precioMax: null, habMin: null } }),
    );
    await sembrarCatalogo([resumen()]);
    const f = fetchFalso();

    expect((await correrDigest(db, { apiKeyResend: 'k', fetchImpl: f.impl, ahora: HOY })).omitido).toBe('sin-novedades');
  });

  it('la baja pendiente se aplica ANTES de enviar: quien se dio de baja hoy no recibe el correo de hoy', async () => {
    await db.doc('alertas/a1').set(alerta());
    await db.collection('bajasAlertas').add({ alertaId: 'a1', token: TOKEN, createdAt: AYER, aplicada: false });
    await sembrarCatalogo([resumen()]);
    const f = fetchFalso();

    const r = await correrDigest(db, { apiKeyResend: 'k', fetchImpl: f.impl, ahora: HOY });

    expect(r.bajasAplicadas).toBe(1);
    expect(f.llamadas).toHaveLength(0);
  });
});
