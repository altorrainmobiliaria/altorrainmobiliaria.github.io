# Capa de acceso a datos (FINA) — la ÚNICA frontera con Firestore en RUNTIME

> Requisito DURO del stack sellado (ADR §16 / R5, riesgo R4 del juez): **todo** acceso a datos en
> el EDGE/SSR pasa por aquí. Las páginas, islas y endpoints NUNCA importan el SDK de Firestore ni
> arman REST a mano. Centralizar el acceso es lo que hace verificable la disciplina de free-tier.
>
> **Matiz "única frontera" (comité OD1):** es única en RUNTIME/SSR. El catálogo puede prerenderizarse
> por **SSG a build-time vía Admin SDK** (Node, entorno de build) — esa es una frontera DISTINTA y
> sancionada, no una violación: no corre en el edge y cuesta CERO lecturas en runtime.

## Estado

Implementada en **Ola 0.7 (modelo de datos v1)**, endurecida por comité adversarial ×3 (Decisión Fuerte
OD1, ADR §22 `[REVISAR-FABLE]`). Read-only PÚBLICO. Verificada: `tsc` estricto + 26 tests (`npm test`) +
`astro build` + gate `npm run verify:data`.

- `firestore-rest.ts` — cliente REST de bajo nivel (edge-safe: solo `fetch`/`URL`). Decodifica el formato
  REST tipado de Firestore → objetos JS. `getDoc()` nunca lanza (mapea status; captura red/abort/JSON).
- `client.ts` — `getDataClient(env?)` → repos `propiedades.get(id)`, `config.get(doc)`/`getGeneral()`,
  `disponibilidad.get(propiedadId, fecha)`. Guardas: validación de forma del id (anti-traversal), `config`
  como deny-list espejando la RULE, colapso `denied`+`not-found` → `unavailable` (no filtra existencia),
  memo POR-REQUEST.
- `cache.ts` — helpers de `Cache-Tag` + constantes de `Cache-Control` para los CALLERS (no cachea él mismo).

## Contrato (invariantes de free-tier — `docs/20-MEMORIA-ESPACIAL.md §Blaze` es sagrado)

- **Solo GET puntual por id.** NO hay método de lista/query público (las Rules niegan `list` anónimo).
  La regla "toda query con `limit()`" se honra por AUSENCIA de queries. **Gate:** `npm run verify:data`
  (prohíbe SDK de Firestore, `onSnapshot`, `:runQuery`/`:listDocuments` en `src/`).
- **CERO `onSnapshot`** desde superficies públicas. Realtime solo en admin (fuera del portal).
- El SSR de ficha JAMÁS toca Firestore en el camino síncrono de render: sirve desde **Workers Caching**
  (T8; el cache-miss es la única lectura). Ver `cache.ts` para la doctrina de TTL/purga.
- Fuente de verdad = Firestore. Read-models a escala (Typesense/Neon+PostGIS) = tripwire documentado, NO
  presente (fallos Q3/Q4).

## Reglas de consumo (comité OD1 — capturar la decisión, no re-descubrir la tormenta)

1. **Instancia POR-REQUEST.** El middleware cablea `Astro.locals.altorra` (1 por request). NUNCA instanciar
   `getDataClient()` a nivel de módulo: en Workers el estado de módulo persiste entre requests del isolate
   → caché fantasma + fuga de memoria.
2. **Las islas reciben la data como PROPS del render SSR, NO re-fetchean.** Una lectura de la ficha sirve a
   galería/mapa/calendario. Endpoints JSON SOLO para islas genuinamente dinámicas, cada uno con su
   `Cache-Control` + `Cache-Tag` (evita la tormenta 1+N de lecturas del mismo doc).
3. **Catálogo (grillas comprar/arrendar/alojamientos) = Ola 1.** NO se sirve por `list` de Firestore.
   Vía sancionada: (a) SSG a build-time (Admin SDK, cero lecturas runtime) — preferida; o (b) doc-índice
   denormalizado `indices/catalogo-{operacion}` (1 GET) mantenido por Cloud Function `onWrite`.
4. **`config` casi-estático** (footer/matrícula): preferir inline a build-time; si runtime, TTL largo + tag.

## Pendiente de Ola 0.7 / seguimiento

- **T6 — tests de Rules contra el emulador** (`firebase/` + `@firebase/rules-unit-testing`): verifican que
  `propiedades` inexistente/borrador → denegado, `config` niega `gestion/counters`, `disponibilidad` get
  público, `list`/`write` denegados. Deploy de Rules = del dueño, COORDINADO con el retiro legacy.
- **Hardening futuro:** validación runtime del shape decodificado (zod) antes del cast a los tipos del dominio.
- **Lecturas privilegiadas (SA-JWT en edge)** = post-MVP; el param `env?` de `getDataClient` es el hook forward.
