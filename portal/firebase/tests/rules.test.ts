import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { marcarContactadoEn } from '../../src/scripts/gestion-leads-contacto';

/*
 * El endpoint `/api/solicitud` escribe por REST con `createDoc`. Aquí se envuelve el REAL para que
 * vaya SIEMPRE al emulador (proyecto `demo-altorra`): sin esto, una prueba podría escribir un lead en
 * PRODUCCIÓN. Sin `FIRESTORE_EMULATOR_HOST` (fuera de `emulators:exec`) la escritura se niega a salir.
 */
const escritosEmulador = vi.hoisted(() => [] as string[]);
vi.mock('../../src/lib/data/firestore-rest', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../src/lib/data/firestore-rest')>();
  return {
    ...real,
    createDoc: async (coleccion: string, data: Record<string, unknown>, opts: Parameters<typeof real.createDoc>[2]) => {
      const host = process.env.FIRESTORE_EMULATOR_HOST;
      if (!host) throw new Error('sin FIRESTORE_EMULATOR_HOST: esta prueba no escribe fuera del emulador');
      const r = await real.createDoc(coleccion, data, { ...opts, projectId: 'demo-altorra', baseUrl: `http://${host}/v1` });
      if (r.ok) escritosEmulador.push(r.id);
      return r;
    },
  };
});

// T6 (plan endurecido): verifica las Rules del portal (parte 2) contra el emulador. Owner-free (Java local).
// projectId `demo-*` → rules-unit-testing NUNCA toca el backend real.
let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-altorra',
    firestore: { rules: readFileSync(resolve(import.meta.dirname, '../firestore.rules'), 'utf8') },
  });
});
afterAll(async () => env?.cleanup());
beforeEach(async () => env.clearFirestore());

// Siembra saltándose las reglas (Admin).
async function seed() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'propiedades/INM-1'), { estado: 'disponible', titulo: 'Pub' });
    await setDoc(doc(db, 'propiedades/INM-2'), { estado: 'borrador', titulo: 'Oculta' });
    await setDoc(doc(db, 'proyectos/PRY-1'), { estado: 'disponible', nombre: 'Torre Pub', licenciaConstruccion: 'LC-1' });
    await setDoc(doc(db, 'proyectos/PRY-2'), { estado: 'borrador', nombre: 'Torre Oculta' });
    await setDoc(doc(db, 'config/general'), { razonSocial: 'ALTORRA COMPANY S.A.S.' });
    await setDoc(doc(db, 'config/gestion'), { moraDias: [5, 10] });
    await setDoc(doc(db, 'disponibilidad/INM-1_2026-07-15'), { estado: 'libre' });
    await setDoc(doc(db, 'captaciones/INM-1'), { propietario: { nombre: 'X' } });
    // Índice de catálogo (OD-Catálogo §54): solo lo escribe la Function; contiene resúmenes de PUBLICADAS.
    await setDoc(doc(db, 'indices/catalogo-venta'), { _version: 1, items: [{ id: 'INM-1', titulo: 'Pub' }] });
  });
}

const anon = () => env.unauthenticatedContext().firestore();
/** Staff genérico (viewer). El claim `admin` es el que exige `esStaff()`; el `rol` afina. */
const staff = () => env.authenticatedContext('viewer-uid', { admin: true, rol: 'viewer' }).firestore();
const editor = () => env.authenticatedContext('editor-uid', { admin: true, rol: 'editor' }).firestore();
const superAdmin = () => env.authenticatedContext('super-uid', { admin: true, rol: 'super_admin' }).firestore();
/**
 * 🔴 EL ADVERSARIO QUE IMPORTA: alguien AUTENTICADO y SIN permisos. No es un caso raro — `/ingresar`
 * deja entrar a cualquiera con un Gmail, así que este es el visitante por defecto del portal con
 * sesión iniciada. Casi todos los tests nuevos comprueban que a este NO se le abre nada.
 */
const cliente = () => env.authenticatedContext('cliente-uid', {}).firestore();

describe('propiedades — get whitelisteado por estado; list/write denegados', () => {
  beforeEach(seed);
  it('anónimo GET de publicada (disponible) → OK', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'propiedades/INM-1')));
  });
  it('anónimo GET de BORRADOR → DENEGADO', async () => {
    await assertFails(getDoc(doc(anon(), 'propiedades/INM-2')));
  });
  it('anónimo GET de INEXISTENTE → DENEGADO (confirma supuesto del comité: no-existe ⇒ 403, no 404)', async () => {
    await assertFails(getDoc(doc(anon(), 'propiedades/NO-EXISTE')));
  });
  it('anónimo LIST → DENEGADO (SERP se sirve de JSON cacheado, no de query)', async () => {
    await assertFails(getDocs(collection(anon(), 'propiedades')));
  });
  it('anónimo WRITE → DENEGADO (escrituras = Cloud Functions)', async () => {
    await assertFails(setDoc(doc(anon(), 'propiedades/INM-3'), { estado: 'disponible' }));
  });
});

describe('propiedades · calificación de huéspedes — SERVER-ONLY, tampoco el staff (§281)', () => {
  beforeEach(seed);

  // 🎯 Esta es la prueba que sostiene el diseño entero. Si un editor puede escribir `resenas`, la
  // nota vuelve a ser un número que alguien teclea, que es justo lo que Daniel señaló al decidirlo.
  it('🔴 editor NO puede crear una propiedad con calificación puesta', async () => {
    await assertFails(
      setDoc(doc(editor(), 'propiedades/INM-9'), {
        _version: 1, estado: 'borrador', titulo: 'Con nota',
        resenas: { promedio: 5, n: 99, actualizado: '2026-08-31T00:00:00Z' },
      }),
    );
  });

  it('🔴 editor NO puede AÑADIR la calificación a una propiedad existente', async () => {
    await assertFails(
      updateDoc(doc(editor(), 'propiedades/INM-1'), {
        _version: 2,
        resenas: { promedio: 4.9, n: 40, actualizado: '2026-08-31T00:00:00Z' },
      }),
    );
  });

  it('un update legítimo SIGUE pasando: la guarda nueva no cierra la puerta entera', async () => {
    // 🎯 El control POSITIVO, que es el que distingue «la regla deniega lo correcto» de «la regla
    // deniega todo». Sin él, haber roto el update entero se vería igual de verde que haberlo hecho
    // bien, y las dos denegaciones de arriba pasarían exactamente igual.
    //
    // ⚠️ Va con super_admin y no con editor por una razón que NO es de esta regla: el documento
    // sembrado no trae `_version`, y `versionValida()` lo LEE — en las Rules, leer un campo ausente
    // tumba la condición entera (lo advierte `gateAlojamiento()` unas líneas más arriba). Así que un
    // editor no puede actualizar los documentos de esta siembra, y eso es anterior a §281.
    await assertSucceeds(updateDoc(doc(superAdmin(), 'propiedades/INM-1'), { titulo: 'Otro título' }));
  });
});

describe('proyectos (obra nueva) — publicado se ve, borrador no, y sin LICENCIA no se publica (§286)', () => {
  beforeEach(seed);

  it('anónimo GET de proyecto publicado → OK', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'proyectos/PRY-1')));
  });

  it('anónimo GET de BORRADOR → DENEGADO (lleva precios y notas internas)', async () => {
    await assertFails(getDoc(doc(anon(), 'proyectos/PRY-2')));
  });

  it('anónimo LIST → DENEGADO (los listados salen del índice, no de queries)', async () => {
    await assertFails(getDocs(collection(anon(), 'proyectos')));
  });

  it('anónimo WRITE → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'proyectos/PRY-9'), { estado: 'disponible' }));
  });

  // 🎯 El gate que importa: la licencia es lo que hace comprobable que el desarrollo existe, y §270
  // encontró SEIS proyectos inventados servidos en la portada. El dominio ya lo exige; esto lo hace
  // cumplir SIEMPRE, también para quien escriba por otro camino.
  it('🔴 editor NO puede crear un proyecto DISPONIBLE sin licencia de construcción', async () => {
    await assertFails(
      setDoc(doc(editor(), 'proyectos/PRY-9'), { _version: 1, estado: 'disponible', nombre: 'Fantasma' }),
    );
  });

  it('editor SÍ puede crearlo como BORRADOR sin licencia — el gate es para publicar', async () => {
    await assertSucceeds(
      setDoc(doc(editor(), 'proyectos/PRY-9'), { _version: 1, estado: 'borrador', nombre: 'En captura' }),
    );
  });

  it('editor SÍ puede crearlo disponible CON licencia', async () => {
    await assertSucceeds(
      setDoc(doc(editor(), 'proyectos/PRY-9'), {
        _version: 1, estado: 'disponible', nombre: 'Torre Real', licenciaConstruccion: 'LC-2026-0009',
      }),
    );
  });

  // La puerta de atrás obvia: crearlo como borrador y luego pasarlo a disponible.
  it('🔴 y NO puede PUBLICARLO después quitándole/omitiendo la licencia', async () => {
    await assertFails(
      updateDoc(doc(superAdmin(), 'proyectos/PRY-2'), { estado: 'disponible' }),
    );
  });
});

describe('config — get público salvo gestion/counters; list solo staff', () => {
  beforeEach(seed);
  it('anónimo GET config/general → OK', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'config/general')));
  });
  it('anónimo GET config/gestion → DENEGADO', async () => {
    await assertFails(getDoc(doc(anon(), 'config/gestion')));
  });
  it('staff GET config/gestion → OK', async () => {
    await assertSucceeds(getDoc(doc(staff(), 'config/gestion')));
  });
  it('anónimo LIST config → DENEGADO', async () => {
    await assertFails(getDocs(collection(anon(), 'config')));
  });
});

describe('disponibilidad — get público; list/write denegados', () => {
  beforeEach(seed);
  it('anónimo GET disponibilidad → OK', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'disponibilidad/INM-1_2026-07-15')));
  });
  it('anónimo LIST disponibilidad → DENEGADO', async () => {
    await assertFails(getDocs(collection(anon(), 'disponibilidad')));
  });
  it('anónimo WRITE disponibilidad → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'disponibilidad/x'), { estado: 'libre' }));
  });
});

describe('indices/catalogo — get público de shards conocidos; list/write denegados (anti-oráculo §54)', () => {
  beforeEach(seed);
  it('anónimo GET indices/catalogo-venta → OK (solo contiene publicadas, no filtra borradores)', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'indices/catalogo-venta')));
  });
  it('anónimo GET indices/catalogo-DESCONOCIDO (fuera de la allow-list) → DENEGADO', async () => {
    await assertFails(getDoc(doc(anon(), 'indices/catalogo-secreto')));
  });
  it('anónimo LIST indices → DENEGADO (el índice se sirve por edge/JSON cacheado, no por query)', async () => {
    await assertFails(getDocs(collection(anon(), 'indices')));
  });
  it('anónimo WRITE indices → DENEGADO (solo la Cloud Function escribe)', async () => {
    await assertFails(setDoc(doc(anon(), 'indices/catalogo-venta'), { _version: 2, items: [] }));
  });
  it('el BORRADOR sigue oculto aunque exista el índice (no hay fuga por la nueva colección)', async () => {
    await assertFails(getDoc(doc(anon(), 'propiedades/INM-2')));
  });
});

describe('captaciones (PII) — solo staff; write siempre denegado', () => {
  beforeEach(seed);
  it('anónimo READ captaciones → DENEGADO (PII propietario/dirección/matrícula)', async () => {
    await assertFails(getDoc(doc(anon(), 'captaciones/INM-1')));
  });
  it('staff READ captaciones → OK', async () => {
    await assertSucceeds(getDoc(doc(staff(), 'captaciones/INM-1')));
  });
  it('staff WRITE captaciones → DENEGADO (solo Cloud Functions escriben)', async () => {
    await assertFails(setDoc(doc(staff(), 'captaciones/INM-9'), { propietario: { nombre: 'Y' } }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ALTA PÚBLICA ACOTADA (ADR §96). Son las DOS únicas colecciones donde un anónimo puede CREAR.
// Se prueba a conciencia porque aquí se amplió un permiso: lo que hay que demostrar no es que el
// camino feliz funcione, sino que todo lo demás (leer, editar, borrar, colar campos) sigue cerrado.
// ─────────────────────────────────────────────────────────────────────────────

/*
 * `createdAt` como TIMESTAMP, que es lo que llega de verdad: el endpoint manda un `Date` (→
 * `timestampValue`) y el legacy `serverTimestamp()`. Desde §331 las Rules lo exigen; un fixture sin
 * él probaba un lead que ningún formulario escribe.
 */
const LEAD_OK = {
  nombre: 'Daniela Restrepo',
  telefono: '3002439810',
  estado: 'pendiente',
  emailSent: false,
  consentimiento: { autorizado: true },
  createdAt: Timestamp.now(),
};

const ALERTA_OK = {
  email: 'persona@correo.com',
  criterios: { operacion: 'venta', tipos: ['casa'], zonas: ['Manga'], precioMin: null, precioMax: null, habMin: null },
  estado: 'activa',
  token: '5f1c0f6e-1c2f-4b0a-9c1d-4a2b6f0e7d31',
  consentimiento: { autorizado: true },
  ultimoEnvio: '2026-08-21T12:00:00.000Z',
  enviados: 0,
  createdAt: '2026-08-21T12:00:00.000Z',
  updatedAt: '2026-08-21T12:00:00.000Z',
  _version: 1,
};

describe('solicitudes — alta pública acotada (el endpoint del portal escribe aquí)', () => {
  beforeEach(seed);
  it('anónimo CREATE de un lead válido → OK (si esto falla, /publicar y el Rango dejan de captar)', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'solicitudes/lead-1'), LEAD_OK));
  });
  it('anónimo CREATE SIN autorización de habeas data → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-2'), { ...LEAD_OK, consentimiento: { autorizado: false } }));
  });
  it('anónimo CREATE con estado adelantado (contactado) → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-3'), { ...LEAD_OK, estado: 'contactado' }));
  });
  it('anónimo CREATE marcando el correo como ya enviado → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-4'), { ...LEAD_OK, emailSent: true }));
  });
  it('anónimo READ de un lead → DENEGADO (son datos de otra persona)', async () => {
    await assertFails(getDoc(doc(anon(), 'solicitudes/lead-1')));
  });

  // ── §331: la hora de entrada es la que mide el plazo de 5 minutos ──
  it('el lead del legacy (`serverTimestamp()`) sigue entrando', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'solicitudes/lead-5'), { ...LEAD_OK, createdAt: serverTimestamp() }));
  });
  it('un reloj adelantado unos minutos (4) se tolera; 6 ya no', async () => {
    const enMin = (m: number) => Timestamp.fromMillis(Date.now() + m * 60_000);
    await assertSucceeds(setDoc(doc(anon(), 'solicitudes/lead-6'), { ...LEAD_OK, createdAt: enMin(4) }));
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-7'), { ...LEAD_OK, createdAt: enMin(6) }));
  });
  it('🔒 `createdAt` fechado en 2099 → DENEGADO (no tendría plazo nunca y cegaría el sondeo del panel)', async () => {
    const futuro = Timestamp.fromDate(new Date('2099-01-01T15:00:00.000Z'));
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-8'), { ...LEAD_OK, createdAt: futuro }));
  });
  it('🔒 `createdAt` como TEXTO o ausente → DENEGADO (no se puede ordenar ni medir)', async () => {
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-9'), { ...LEAD_OK, createdAt: '2026-10-16T15:00:00.000Z' }));
    const { createdAt: _sinFecha, ...sinFecha } = LEAD_OK;
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-10'), sinFecha));
  });
  it('🔒 nadie NACE contactado: `contactadoAt` o `contactadoPor` al crear → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-11'), { ...LEAD_OK, contactadoAt: serverTimestamp() }));
    await assertFails(setDoc(doc(anon(), 'solicitudes/lead-12'), { ...LEAD_OK, contactadoPor: 'editor-uid' }));
  });

  /*
   * 🐤 EL CANARIO DE LA CAPTACIÓN: el lead lo escribe el ENDPOINT REAL (`POST /api/solicitud`) con su
   * codificador REST real, anónimo como en producción — y contra el EMULADOR, nunca contra
   * producción: el `createDoc` del módulo se envuelve para forzar el proyecto `demo-altorra` y la URL
   * del emulador. Un documento tecleado en la prueba confirmaría lo que la prueba cree; este confirma
   * lo que el formulario manda ([[L-88]] (a)).
   */
  it('🐤 el formulario de /publicar, por el endpoint real, entra con `createdAt` Timestamp', async () => {
    const { POST } = await import('../../src/pages/api/solicitud');
    escritosEmulador.length = 0;
    const request = new Request('https://altorrainmobiliaria.co/api/solicitud', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ formulario: 'publicar-propiedad', nombre: 'Daniela Restrepo', telefono: '300 123 4567', autorizacion: 'on' }),
    });
    const res = await POST({ request, locals: {} } as unknown as Parameters<typeof POST>[0]);
    expect(await res.json()).toEqual({ ok: true });
    expect(escritosEmulador).toHaveLength(1);
    let d: Record<string, unknown> = {};
    await env.withSecurityRulesDisabled(async (ctx) => {
      d = (await getDoc(doc(ctx.firestore(), `solicitudes/${escritosEmulador[0]}`))).data() ?? {};
    });
    expect(d.createdAt).toBeInstanceOf(Timestamp);
    expect(d.origen).toBe('portal-publicar');
  });
});

/*
 * 🔒 ALARMA (§330): «Marcar contactado» de /gestion escribe con el `allow update: if esEditorOMas()`
 * de `solicitudes`, el mismo que usa el panel viejo para cambiar el estado. Si el cutover cierra ese
 * `update`, el botón muere en silencio — y estas pruebas se ponen en rojo en el CI. La salida es
 * mover la marca a una callable ANTES de cerrarlo.
 *
 * Se ejecuta la función REAL del panel (`marcarContactadoEn`), no una copia de su escritura: si la
 * transacción cambia, la prueba prueba lo que cambió.
 */
describe('🔒 solicitudes — /gestion marca el contacto con el `update` de editores (§330)', () => {
  const ENTRO = Timestamp.fromDate(new Date('2026-10-16T15:00:00.000Z'));
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'solicitudes/lead-sla'), { ...LEAD_OK, email: 'ana@example.com', createdAt: ENTRO });
    });
  });
  const leer = async (): Promise<Record<string, unknown>> => {
    let d: Record<string, unknown> = {};
    await env.withSecurityRulesDisabled(async (ctx) => {
      d = (await getDoc(doc(ctx.firestore(), 'solicitudes/lead-sla'))).data() ?? {};
    });
    return d;
  };
  const marcar = async (db: unknown, uid: string, id = 'lead-sla') =>
    marcarContactadoEn(await import('firebase/firestore'), db as Firestore, id, uid);

  it('el editor marca: hora del SERVIDOR, su uid, y el estado NO cambia (no despierta ningún correo)', async () => {
    const r = await marcar(editor(), 'editor-uid');
    const d = await leer();
    expect(r.ok).toBe(true);
    expect(d.estado).toBe('pendiente');
    expect(d.contactadoAt).toBeInstanceOf(Timestamp);
    expect(d.contactadoPor).toBe('editor-uid');
    expect(r.ok && r.contactadoAt?.getTime()).toBe((d.contactadoAt as Timestamp).toMillis());
  });

  it('una segunda marca no mueve la hora: devuelve «ya» con la PRIMERA', async () => {
    await marcar(editor(), 'editor-uid');
    const primera = (await leer()).contactadoAt as Timestamp;
    const r = await marcar(superAdmin(), 'super-uid');
    const d = await leer();
    // Y dice QUIÉN lo marcó: el aviso no puede afirmar «otra persona» si fue quien mira.
    expect(r).toMatchObject({ ok: false, motivo: 'ya', contactadoPor: 'editor-uid' });
    expect((d.contactadoAt as Timestamp).isEqual(primera)).toBe(true);
    expect(d.contactadoPor).toBe('editor-uid');
  });

  it('el super_admin también puede marcar', async () => {
    expect((await marcar(superAdmin(), 'super-uid')).ok).toBe(true);
  });

  it('el de solo consulta NO: «permiso», y el documento queda intacto', async () => {
    const r = await marcar(staff(), 'viewer-uid');
    const d = await leer();
    expect(r).toEqual({ ok: false, motivo: 'permiso' });
    expect(d.contactadoAt).toBeUndefined();
  });

  it('sin sesión no hay marca (y no se intenta escribir)', async () => {
    expect(await marcar(editor(), '')).toEqual({ ok: false, motivo: 'sesion' });
    await assertFails(updateDoc(doc(anon(), 'solicitudes/lead-sla'), { contactadoAt: serverTimestamp() }));
  });

  it('un lead que ya no existe → «no-existe», sin crear nada', async () => {
    expect(await marcar(editor(), 'editor-uid', 'no-existe')).toEqual({ ok: false, motivo: 'no-existe' });
  });

  it('🐤 canario: la escritura LITERAL del panel viejo (js/admin-leads.js) sigue pasando para el editor, no para el viewer', async () => {
    await assertSucceeds(updateDoc(doc(editor(), 'solicitudes/lead-sla'), { estado: 'en_gestion', updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(staff(), 'solicitudes/lead-sla'), { estado: 'cerrado', updatedAt: serverTimestamp() }));
  });

  // ── §331: la marca la sella el SERVIDOR, no la transacción del panel ──
  // Lo que un editor con la consola abierta podía escribir hasta hoy, sin pasar por `marcarContactadoEn`.
  const ref = () => doc(editor(), 'solicitudes/lead-sla');
  const OTRA_HORA = Timestamp.fromDate(new Date('2026-10-16T15:01:00.000Z'));

  it('🔒 marcar con OTRA hora que la del servidor → DENEGADO (un «a tiempo» que no fue)', async () => {
    await assertFails(updateDoc(ref(), { contactadoAt: OTRA_HORA, contactadoPor: 'editor-uid' }));
  });
  it('🔒 marcar en nombre de OTRO → DENEGADO; y la firma sola, sin hora, tampoco', async () => {
    await assertFails(updateDoc(ref(), { contactadoAt: serverTimestamp(), contactadoPor: 'super-uid' }));
    await assertFails(updateDoc(ref(), { contactadoPor: 'editor-uid' }));
  });
  it('🔒 una marca puesta NO se reescribe, no cambia de dueño y no se borra', async () => {
    expect((await marcar(editor(), 'editor-uid')).ok).toBe(true);
    await assertFails(updateDoc(ref(), { contactadoAt: serverTimestamp(), contactadoPor: 'editor-uid' }));
    await assertFails(updateDoc(doc(superAdmin(), 'solicitudes/lead-sla'), { contactadoPor: 'super-uid' }));
    await assertFails(updateDoc(ref(), { contactadoAt: deleteField(), contactadoPor: deleteField() }));
    // …y el lead marcado se sigue gestionando con el panel viejo: el cambio de estado no toca la marca.
    await assertSucceeds(updateDoc(ref(), { estado: 'en_gestion', updatedAt: serverTimestamp() }));
  });
  it('🔒 `createdAt` no se edita después: si no, la cota del alta se esquivaría por el update', async () => {
    await assertFails(updateDoc(ref(), { createdAt: Timestamp.fromDate(new Date('2099-01-01T15:00:00.000Z')) }));
    await assertFails(updateDoc(ref(), { createdAt: serverTimestamp() }));
  });
});

describe('alertas — alta pública; nadie las lee ni las edita salvo la Function', () => {
  beforeEach(seed);
  it('anónimo CREATE de alerta válida → OK', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'alertas/a-1'), ALERTA_OK));
  });
  it('anónimo CREATE naciendo con envíos hechos → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'alertas/a-2'), { ...ALERTA_OK, enviados: 7 }));
  });
  it('anónimo CREATE con operación inventada → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'alertas/a-3'), { ...ALERTA_OK, criterios: { ...ALERTA_OK.criterios, operacion: 'permuta' } }));
  });
  it('anónimo CREATE colando un campo extra → DENEGADO (hasOnly)', async () => {
    await assertFails(setDoc(doc(anon(), 'alertas/a-4'), { ...ALERTA_OK, admin: true }));
  });
  it('anónimo READ de una alerta → DENEGADO (dentro va el token de la baja)', async () => {
    await assertFails(getDoc(doc(anon(), 'alertas/a-1')));
  });
  it('staff READ de una alerta → OK', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => setDoc(doc(ctx.firestore(), 'alertas/a-9'), ALERTA_OK));
    await assertSucceeds(getDoc(doc(staff(), 'alertas/a-9')));
  });
});

describe('bajasAlertas — append-only, la salida del correo', () => {
  beforeEach(seed);
  const BAJA_OK = {
    alertaId: 'a-1',
    token: '5f1c0f6e-1c2f-4b0a-9c1d-4a2b6f0e7d31',
    createdAt: '2026-08-21T13:00:00.000Z',
    aplicada: false,
  };
  it('anónimo CREATE de una baja → OK (revocar tiene que ser tan fácil como autorizar)', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'bajasAlertas/b-1'), BAJA_OK));
  });
  it('anónimo CREATE marcándola como ya aplicada → DENEGADO', async () => {
    await assertFails(setDoc(doc(anon(), 'bajasAlertas/b-2'), { ...BAJA_OK, aplicada: true }));
  });
  it('anónimo READ de las bajas → DENEGADO', async () => {
    await assertFails(getDoc(doc(anon(), 'bajasAlertas/b-1')));
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// RULESET FUSIONADO (ADR §100) — lo que hay que demostrar es que el legacy SIGUE VIVO y que el
// adversario que importa —alguien autenticado y sin permisos— no consigue nada.
// ═════════════════════════════════════════════════════════════════════════════════════════════

async function seedFusion() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'resenas/r-1'), { texto: 'Excelente', _version: 1 });
    await setDoc(doc(db, 'blog/post-1'), { titulo: 'Guía de arriendo', _version: 1 });
    await setDoc(doc(db, 'system/meta'), { cacheVersion: 5 });
    await setDoc(doc(db, 'auditLog/a-1'), { accion: 'crear' });
    await setDoc(doc(db, 'newsletter/n-1'), { email: 'persona@correo.com', activo: true });
    await setDoc(doc(db, 'usuarios/viewer-uid'), { rol: 'viewer', activo: true });
    await setDoc(doc(db, 'usuarios/cliente-uid'), { rol: 'viewer', activo: true });
    await setDoc(doc(db, 'loginAttempts/hash-1'), { intentos: 1 });
    await setDoc(doc(db, 'drafts_activos/editor-uid'), { propId: 'INM-1' });
    await setDoc(doc(db, 'ventas/VTA-1'), { etapa: 'oferta', compradorNombre: 'Ana' });
    await setDoc(doc(db, 'perfiles/cliente-uid'), { uid: 'cliente-uid', estado: 'enviado' });
    await setDoc(doc(db, 'alertas/a-1'), { email: 'x@y.co', token: 'secreto-largo-de-sobra' });
    await setDoc(doc(db, 'contratos/c-1'), { estado: 'vigente' });
    await setDoc(doc(db, 'pagos/p-1'), { estado: 'pendiente' });
    await setDoc(doc(db, 'solicitudes/lead-x'), { nombre: 'Ana', estado: 'pendiente' });
  });
}

describe('legacy VIVO — admin.html no se puede quedar sin sus colecciones', () => {
  beforeEach(async () => {
    await seed();
    await seedFusion();
  });

  it('🔒 loginAttempts está CERRADO: nadie puede bloquear la cuenta de otro (§130)', async () => {
    // Este test decía lo CONTRARIO —«sigue abierto», y lo daba por bueno—. La regla permitía
    // `create/update` a cualquiera porque el contador se escribe antes de tener sesión; lo que nadie
    // había visto es que el id del documento es el SHA-256 del correo, y un hash no es un secreto:
    // se podía calcular el del dueño y escribirle `bloqueado:true` en bucle.
    //
    // El ataque, escrito como test para que no vuelva:
    await assertFails(setDoc(doc(anon(), 'loginAttempts/hash-1'), { bloqueado: true }));
    // Y tampoco se puede leer el estado de bloqueo ajeno (era un oráculo de qué correos existen):
    await assertFails(getDoc(doc(anon(), 'loginAttempts/hash-1')));
    // Ni siquiera desde dentro: la colección está muerta a propósito.
    await assertFails(setDoc(doc(editor(), 'loginAttempts/hash-2'), { intentos: 0 }));
  });

  it('reseñas y blog siguen siendo de lectura pública', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'resenas/r-1')));
    await assertSucceeds(getDoc(doc(anon(), 'blog/post-1')));
  });

  it('un editor sigue pudiendo escribir reseñas, blog y system/meta', async () => {
    await assertSucceeds(setDoc(doc(editor(), 'resenas/r-2'), { texto: 'Buena' }));
    await assertSucceeds(setDoc(doc(editor(), 'blog/post-2'), { titulo: 'Nueva', _version: 1 }));
    await assertSucceeds(setDoc(doc(editor(), 'system/meta'), { cacheVersion: 6 }));
  });

  it('drafts_activos: cada editor escribe SOLO el suyo', async () => {
    await assertSucceeds(setDoc(doc(editor(), 'drafts_activos/editor-uid'), { propId: 'INM-2' }));
    await assertFails(setDoc(doc(editor(), 'drafts_activos/otro-uid'), { propId: 'INM-3' }));
  });

  it('el auditLog es INMUTABLE incluso para el super_admin', async () => {
    await assertFails(setDoc(doc(superAdmin(), 'auditLog/a-1'), { accion: 'editado' }));
  });

  it('🔒 la bitácora la escribe el SERVIDOR: nadie la redacta desde el navegador (§130)', async () => {
    // Antes era `create: if esEditorOMas()`, o sea que el vigilado redactaba su propia bitácora:
    // podía inventarse entradas ajenas, o simplemente no escribir la que le incomodara.
    await assertFails(setDoc(doc(editor(), 'auditLog/falsa-1'), { accion: 'acceso', uid: 'otro' }));
    await assertFails(setDoc(doc(superAdmin(), 'auditLog/falsa-2'), { accion: 'acceso' }));
    // La escribe `registrarEvento`, que al ser Admin SDK bypassa estas reglas y pone el uid del token.
  });

  it('🔒 la bitácora solo la LEE el super_admin: lleva IP y hábitos de terceros (§130)', async () => {
    await assertSucceeds(getDoc(doc(superAdmin(), 'auditLog/a-1')));
    await assertFails(getDoc(doc(editor(), 'auditLog/a-1')));
    await assertFails(getDoc(doc(anon(), 'auditLog/a-1')));
  });

  /*
   * La CONSULTA de la bóveda, no un `get` suelto (§148). Importa probarla aparte porque en Firestore
   * `get` y `list` son permisos DISTINTOS: una regla puede dejar leer un documento por su id y negar
   * la búsqueda, y es justo la búsqueda lo que hace el panel al abrir «Quién lo abrió».
   */
  it('🔒 la CONSULTA de la bitácora de un documento sigue la misma frontera que el `get`', async () => {
    const consulta = (db: ReturnType<typeof superAdmin>) =>
      query(
        collection(db, 'auditLog'),
        where('objetivo', '==', 'DOC-1'),
        orderBy('creadoEn', 'desc'),
        limit(25),
      );
    await assertSucceeds(getDocs(consulta(superAdmin())));
    await assertFails(getDocs(consulta(editor())));
    await assertFails(getDocs(consulta(cliente())));
  });

  it('🔒 las ventas las LEE el staff y no las escribe NADIE desde el cliente', async () => {
    // Lleva nombre del comprador y cifras del negocio: no es dato público. Y la escritura es
    // server-only porque el ORDEN de las etapas tiene consecuencias legales (§151).
    await assertSucceeds(getDoc(doc(staff(), 'ventas/VTA-1')));
    await assertFails(getDoc(doc(cliente(), 'ventas/VTA-1')));
    await assertFails(getDoc(doc(anon(), 'ventas/VTA-1')));
    await assertFails(setDoc(doc(superAdmin(), 'ventas/VTA-2'), { etapa: 'registro' }));
    await assertFails(setDoc(doc(editor(), 'ventas/VTA-1'), { etapa: 'registro' }));
  });

  it('🔒 el perfil de inquilino: lo lee SU titular y el staff; no lo escribe nadie', async () => {
    // Es el unico documento del sistema con datos de alguien de FUERA del equipo que esa persona
    // misma alimenta. Su titular lo ve porque es suyo; el staff porque tiene que revisarlo; y el
    // estado del proceso solo lo mueve el servidor — no quien tiene interes en el resultado (§152).
    await assertSucceeds(getDoc(doc(cliente(), 'perfiles/cliente-uid')));
    await assertSucceeds(getDoc(doc(staff(), 'perfiles/cliente-uid')));
    await assertFails(getDoc(doc(anon(), 'perfiles/cliente-uid')));
    await assertFails(setDoc(doc(cliente(), 'perfiles/cliente-uid'), { estado: 'verificado' }));
    await assertFails(setDoc(doc(superAdmin(), 'perfiles/cliente-uid'), { estado: 'verificado' }));
    // Y NADIE de fuera lista la coleccion: seria un censo de quien busca arriendo en la ciudad.
    await assertFails(getDocs(collection(cliente(), 'perfiles')));
  });

  it('el borrador de un usuario es suyo y de nadie más', async () => {
    await assertSucceeds(getDoc(doc(cliente(), 'usuarios/cliente-uid/drafts/d-1')));
    await assertFails(getDoc(doc(cliente(), 'usuarios/viewer-uid/drafts/d-1')));
  });
});

describe('🔴 el adversario: autenticado y SIN permisos (cualquiera con un Gmail)', () => {
  beforeEach(async () => {
    await seed();
    await seedFusion();
  });

  it('no lee leads, ni captaciones, ni contratos, ni pagos', async () => {
    for (const ruta of ['solicitudes/lead-x', 'captaciones/INM-1', 'contratos/c-1', 'pagos/p-1']) {
      await assertFails(getDoc(doc(cliente(), ruta)));
    }
  });

  it('no lee las alertas (dentro va el token de la baja)', async () => {
    await assertFails(getDoc(doc(cliente(), 'alertas/a-1')));
  });

  it('no LISTA propiedades (eso destaparía los borradores)', async () => {
    await assertFails(getDocs(collection(cliente(), 'propiedades')));
  });

  it('no lee un BORRADOR aunque sepa su id', async () => {
    await assertFails(getDoc(doc(cliente(), 'propiedades/INM-2')));
  });

  it('no escribe propiedades ni se asciende a sí mismo', async () => {
    await assertFails(setDoc(doc(cliente(), 'propiedades/INM-9'), { estado: 'disponible', _version: 1 }));
    // El que de verdad importa: si pudiera escribir su propio `rol`, el trigger de claims se lo
    // convertiría en permisos REALES. Esta es la puerta que sostiene todo el modelo (§99).
    await assertFails(setDoc(doc(cliente(), 'usuarios/cliente-uid'), { rol: 'super_admin', activo: true }));
  });

  it('no lista el equipo (eso es solo del super_admin)', async () => {
    await assertFails(getDocs(collection(cliente(), 'usuarios')));
  });

  it('sí lee su propio perfil, que es lo único suyo', async () => {
    await assertSucceeds(getDoc(doc(cliente(), 'usuarios/cliente-uid')));
  });
});

describe('roles: viewer, editor y super_admin no son lo mismo', () => {
  beforeEach(async () => {
    await seed();
    await seedFusion();
  });

  it('un viewer LEE el panel pero no escribe contenido', async () => {
    await assertSucceeds(getDoc(doc(staff(), 'captaciones/INM-1')));
    await assertFails(setDoc(doc(staff(), 'resenas/r-9'), { texto: 'no' }));
    await assertFails(setDoc(doc(staff(), 'propiedades/INM-9'), { estado: 'disponible', _version: 1 }));
  });

  it('solo el super_admin lista el equipo', async () => {
    await assertSucceeds(getDocs(collection(superAdmin(), 'usuarios')));
    await assertFails(getDocs(collection(editor(), 'usuarios')));
  });

  it('solo el super_admin borra una propiedad', async () => {
    await assertFails(deleteDoc(doc(editor(), 'propiedades/INM-1')));
    await assertSucceeds(deleteDoc(doc(superAdmin(), 'propiedades/INM-1')));
  });

  it('un editor crea con _version 1 y no puede saltarse la concurrencia', async () => {
    await assertSucceeds(setDoc(doc(editor(), 'propiedades/INM-7'), { estado: 'disponible', _version: 1 }));
    await assertFails(setDoc(doc(editor(), 'propiedades/INM-8'), { estado: 'disponible', _version: 5 }));
  });
});

describe('🔧 los dos agujeros que se cerraron', () => {
  beforeEach(async () => {
    await seed();
    await seedFusion();
  });

  it('un ANÓNIMO ya NO puede crear documentos en `system`', async () => {
    // Antes: `allow write: if isEditorOrAbove() || !exists(...)`. Esa segunda mitad era la puerta.
    await assertFails(setDoc(doc(anon(), 'system/inventado'), { lo: 'que sea' }));
  });

  it('un ANÓNIMO ya NO puede reescribir la suscripción de otro', async () => {
    // El alta pública se conserva; modificarla ya es cosa de editores.
    await assertSucceeds(setDoc(doc(anon(), 'newsletter/n-2'), { email: 'nueva@correo.com', activo: true }));
    await assertFails(setDoc(doc(anon(), 'newsletter/n-1'), { email: 'secuestrada@x.com', activo: true }));
  });
});

describe('el staff conserva sus propias fichas (el escape que evita perder el catálogo)', () => {
  beforeEach(async () => {
    await seed();
    await seedFusion();
  });

  it('el staff SÍ lee un borrador; el público no', async () => {
    await assertSucceeds(getDoc(doc(staff(), 'propiedades/INM-2')));
    await assertFails(getDoc(doc(anon(), 'propiedades/INM-2')));
  });

  it('el staff LISTA propiedades; el público no', async () => {
    await assertSucceeds(getDocs(collection(staff(), 'propiedades')));
    await assertFails(getDocs(collection(anon(), 'propiedades')));
  });
});

/*
 * EL GATE LEGAL DEL ALOJAMIENTO, en la FRONTERA (§233).
 *
 * `alta-propiedad.ts` ya exigía el RNT y la situación de PH, pero `propiedades` se escribe DIRECTO
 * desde el navegador y las Rules solo miraban rol y `_version`: la obligación legal la sostenía
 * únicamente un formulario. Un gate legal que vive en el formulario deja de existir el día que
 * alguien cambia el formulario — y aquí lo que se juega es anunciar por días un inmueble que no
 * puede, o sin el RNT que la ley exige en toda publicidad de alojamiento.
 *
 * Estas pruebas son del PAR, no de ninguno de los dos lados: comprueban que la frontera aplique la
 * misma regla que el dominio, que es exactamente la prueba que faltaba en el caso de
 * `honorariosPct` ([[L-63]]).
 */
describe('alojamiento — el RNT y el reglamento de PH se exigen en las REGLAS, no solo en el formulario', () => {
  beforeEach(seed);

  /*
   * ⚠️ ESCRIBE LA FORMA DEL MODELO, NO LA DE LA REGLA (§313). Este helper mandaba un `situacionPH`
   * de primer nivel porque era lo que la regla leía — y ningún documento real lo tiene: el modelo
   * guarda `autorizacionPH: { situacion, declaradaEn }` (§174). Con eso, las pruebas confirmaban la
   * creencia de la regla en vez de contrastarla contra el escritor, y tapaban que el gate denegaba
   * TODO alojamiento legítimo. Una prueba que le pregunta al código lo que el código ya cree no es
   * una prueba (§179).
   */
  const alojamiento = ({ situacionPH, ...extra }: Record<string, unknown>) => ({
    _version: 1,
    estado: 'borrador',
    titulo: 'Casa con piscina',
    operacion: 'alojamiento',
    ...(situacionPH === undefined
      ? {}
      : { autorizacionPH: { situacion: situacionPH, declaradaEn: '2026-09-11T00:00:00Z' } }),
    ...extra,
  });

  it('🔴 editor crea alojamiento SIN RNT → DENEGADO', async () => {
    await assertFails(
      setDoc(doc(editor(), 'propiedades/INM-ALO-1'), alojamiento({ situacionPH: 'autoriza-expreso' })),
    );
  });

  it('🔴 ni siquiera el super_admin puede: la ley no distingue por rol', async () => {
    await assertFails(
      setDoc(doc(superAdmin(), 'propiedades/INM-ALO-2'), alojamiento({ situacionPH: 'autoriza-expreso' })),
    );
  });

  it('🔴 con RNT pero con el reglamento SIN AUTORIZAR → DENEGADO', async () => {
    await assertFails(
      setDoc(
        doc(editor(), 'propiedades/INM-ALO-3'),
        alojamiento({ rnt: '12345', situacionPH: 'sin-autorizacion' }),
      ),
    );
  });

  it('🔴 con RNT pero sin decir NADA del reglamento → DENEGADO (el silencio no es un sí)', async () => {
    await assertFails(setDoc(doc(editor(), 'propiedades/INM-ALO-4'), alojamiento({ rnt: '12345' })));
  });

  it('✅ con RNT y reglamento que autoriza → permitido', async () => {
    await assertSucceeds(
      setDoc(
        doc(editor(), 'propiedades/INM-ALO-5'),
        alojamiento({ rnt: '12345', situacionPH: 'autoriza-expreso' }),
      ),
    );
  });

  it('✅ una VENTA no necesita RNT: exigírselo sería un requisito inventado', async () => {
    await assertSucceeds(
      setDoc(doc(editor(), 'propiedades/INM-VTA-1'), {
        _version: 1,
        estado: 'borrador',
        titulo: 'Apto en venta',
        operacion: 'venta',
      }),
    );
  });

  it('🔴 la puerta de atrás: pasar a alojamiento en un UPDATE tampoco cuela', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'propiedades/INM-VTA-2'), {
        _version: 1,
        estado: 'borrador',
        titulo: 'Apto en venta',
        operacion: 'venta',
      });
    });
    await assertFails(
      setDoc(doc(editor(), 'propiedades/INM-VTA-2'), {
        _version: 2,
        estado: 'borrador',
        titulo: 'Apto en venta',
        operacion: 'alojamiento',
      }),
    );
  });
});


/*
 * 🔒 LA COMISIÓN Y LA PII NO PUEDEN ENTRAR AL DOCUMENTO PÚBLICO (§313).
 *
 * `propiedades` es la única colección de negocio con lectura pública. El modelo lo decía desde Ola 0
 * —«⛔ JAMÁS incluir PII de propietario, dirección exacta, matrícula inmobiliaria ni comisión»— y era
 * un COMENTARIO: las Rules no validaban la lista de campos, así que un editor podía escribir el
 * porcentaje pactado o el teléfono del dueño y quedaba legible por cualquiera al publicar.
 *
 * Daniel lo decidió explícitamente el 2026-09-11: «la comisión no se le muestra al huésped». Estas
 * pruebas son lo que convierte esa frase en algo que el sistema impide, no algo que hay que recordar.
 */
describe('propiedades · lista blanca de campos — lo interno NO entra (§313)', () => {
  beforeEach(seed);

  it('🔴 editor NO puede crear una propiedad con `comisionPct`', async () => {
    await assertFails(
      setDoc(doc(editor(), 'propiedades/INM-10'), {
        _version: 1, estado: 'borrador', titulo: 'Con comision', comisionPct: 12,
      }),
    );
  });

  it('🔴 editor NO puede AÑADIR `comisionPct` a una propiedad existente', async () => {
    await assertFails(updateDoc(doc(editor(), 'propiedades/INM-1'), { _version: 2, comisionPct: 12 }));
  });

  it('🔴 TAMPOCO el super_admin: la lista blanca va fuera del `||` de rol', async () => {
    // No es un detalle de redaccion. Si la guarda colgara de la rama de editor, el rol mas alto seria
    // justo el que puede publicar el dato interno — y es el rol que usa quien administra de verdad.
    await assertFails(updateDoc(doc(superAdmin(), 'propiedades/INM-1'), { comisionPct: 12 }));
  });

  it('🔴 ni la PII del propietario, ni la direccion exacta, ni la matricula', async () => {
    await assertFails(
      updateDoc(doc(superAdmin(), 'propiedades/INM-1'), { propietario: { nombre: 'Catalina', telefono: '300' } }),
    );
    await assertFails(updateDoc(doc(superAdmin(), 'propiedades/INM-1'), { direccionExacta: 'Cra 1 #2-3' }));
    await assertFails(updateDoc(doc(superAdmin(), 'propiedades/INM-1'), { matriculaInmobiliaria: '060-12345' }));
  });

  it('un alta LEGITIMA con campos del modelo sigue pasando', async () => {
    // 🎯 El control POSITIVO. Sin el, haber cerrado la coleccion entera se veria tan verde como
    // haberla cerrado bien: las cuatro denegaciones de arriba pasarian exactamente igual.
    await assertSucceeds(
      setDoc(doc(editor(), 'propiedades/INM-11'), {
        _version: 1, id: 'INM-11', operacion: 'venta', vertical: 'vivienda', tipo: 'apartamento',
        estado: 'borrador', titulo: 'Legitima', descripcion: 'x', slug: 'legitima-inm-11',
        geo: { ciudad: 'Cartagena de Indias', barrio: 'Bocagrande' }, specs: { habitaciones: 3 },
        amenidades: {}, precio: { moneda: 'COP', valorVenta: 450000000 },
        imagenes: ['props/INM-11/1.webp'], imagenPortada: 'props/INM-11/1.webp',
        createdAt: '2026-09-11T00:00:00Z', updatedAt: '2026-09-11T00:00:00Z',
      }),
    );
  });
});
