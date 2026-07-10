# Capa de acceso a datos (FINA) — la ÚNICA frontera con Firestore

> Requisito DURO del stack sellado (ADR §16 / R5, riesgo R4 del juez): **todo** acceso a datos
> pasa por aquí. Las páginas, islas y endpoints NUNCA importan el SDK de Firestore directamente.
> Centralizar el acceso es lo que hace verificable la disciplina de free-tier.

## Contrato (invariantes de free-tier — `docs/20-MEMORIA-ESPACIAL.md §Blaze` es sagrado)

- `limit()` OBLIGATORIO en toda query. Default **9** (máx 20). Una query sin `limit()` es un bug.
- **CERO `onSnapshot`** desde superficies públicas — solo lectura puntual (`getDoc`/`getDocs`). Realtime solo en admin.
- Índices compuestos **declarados de antemano** (tope 200). Nada de queries que exijan índices ad-hoc.
- El SSR de ficha JAMÁS toca Firestore en el camino síncrono de render: sirve desde edge-cache; el
  cache-miss es la única lectura (adopción Gemini #1 → presupuesto TTFB p75 < 800 ms).
- Fuente de verdad = Firestore. Read-models a escala (Typesense Cloud / Neon+PostGIS) son **tripwire
  documentado, NO presente** (fallos Q3/Q4).

## Estructura (se implementa en Ola 0 ítem 7 — modelo de datos v1)

- `client.ts` — factory del cliente de datos (lazy, edge-safe). Skeleton por ahora.
- Repositorios por agregado (ítem 7): `propiedades`, `solicitudes`, `disponibilidad`, `config` +
  módulo GESTIÓN (`contratos`, `pagos`, `novedades`, `expedientes`).
