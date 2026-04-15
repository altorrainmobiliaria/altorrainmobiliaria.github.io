# Prueba manual — `system/meta.lastModified` → invalidación en tiempo real

**Propósito:** Verificar que cuando un admin guarda/edita/borra una propiedad,
las pestañas públicas abiertas reflejan el cambio en < 5 segundos sin recargar.

**Fecha última verificación:** _pendiente_

---

## Pre-requisitos

- Usuario admin autenticado en `admin.html` (rol `super_admin` o `editor`).
- Al menos una propiedad existente en Firestore con `disponible: true`.
- Navegador con DevTools (Chrome/Firefox/Edge).

---

## Cadena que se está validando

```
admin-properties.js:touchSystemMeta()       (tras crear/editar/borrar/cambiar estado)
        │
        │  setDoc('system/meta', { lastModified: serverTimestamp() })
        ▼
Firestore: system/meta document updated
        │
        │  onSnapshot dispara en TODAS las pestañas abiertas
        ▼
cache-manager.js:startMetaListener()
        │
        │  detecta cambio de timestamp → invalidate()
        ▼
cache-manager.js:invalidate()
        │  memClear + lsClear + idbClear
        │  propertyDB.refresh()   (recarga desde Firestore)
        │  dispatchEvent('altorra:cache-invalidated')
        ▼
listado-propiedades.js / scripts.js
        │  reaccionan al evento → re-renderizan tarjetas
        ▼
[Usuario ve la propiedad actualizada sin recargar]
```

---

## Procedimiento — caso feliz

1. **Tab A** (pública): abrir `propiedades-comprar.html` en `http://localhost:XXXX`
   o en producción.
   - Abrir DevTools → Consola. Dejar filtro por `AltorraCache`.
   - Verificar que en el arranque aparece alguna de estas líneas:
     - `[AltorraCache] Caché invalidada ✅` (primera carga)
     - o simplemente sin errores de `onSnapshot system/meta`.

2. **Tab B** (admin): abrir `admin.html`, loguearse.
   - Abrir DevTools → Consola. Filtrar por `AdminProps`.

3. **Editar** cualquier propiedad desde Tab B:
   - Cambiar un campo visible (ej. precio o título).
   - Click "Guardar".
   - Tab B debe mostrar:
     ```
     [AdminProps] system/meta.lastModified actualizado → cache invalidado
     ```

4. **Tab A** debe mostrar en < 5s:
   ```
   [AltorraCache] Cambio en Firestore detectado → invalidando caché
   [AltorraCache] Caché invalidada ✅
   ```
   Y la tarjeta de esa propiedad debe actualizarse visualmente sin recarga.

5. **Repetir** el paso 3 para cada tipo de operación:
   - ✅ Crear propiedad nueva
   - ✅ Editar propiedad existente
   - ✅ Cambiar estado (disponible → reservado)
   - ✅ Eliminar propiedad (solo super_admin)

---

## Procedimiento — caso de fallo

Si la invalidación no ocurre, verificar en **Tab B** (admin):

| Log en consola | Diagnóstico |
|---|---|
| `Falló touchSystemMeta (los tabs públicos no se refrescarán automáticamente): permission-denied` | Las reglas Firestore bloquearon el write. Verificar `firestore.rules:84-88` (regla `system/{docId}`) y que el usuario tenga rol `editor` o `super_admin` en `usuarios/{uid}`. |
| `Falló touchSystemMeta: unavailable` o `deadline-exceeded` | Problema de red. Reintentar. |
| Ningún log de `[AdminProps]` | El guardado en sí falló antes de llegar a `touchSystemMeta()`. Revisar log `[AdminProps] Error guardando:`. |

Si en **Tab A** no aparece el log de invalidación pero sí se actualizó
`system/meta` en Firestore Console:

| Síntoma | Diagnóstico |
|---|---|
| Error `[AltorraCache] onSnapshot system/meta: permission-denied` | La regla read de `system` está mal. Debe ser `allow read: if true`. |
| No hay ningún log de `AltorraCache` en Tab A | `cache-manager.js` no se cargó. Verificar que el HTML lo incluya (`<script src="js/cache-manager.js" defer>`). |
| Se ve el log pero no se actualiza la UI | Los listeners `altorra:cache-invalidated` en `listado-propiedades.js` / `scripts.js` no están registrados. Verificar `bindRefreshListener()`. |

---

## Verificación rápida desde la consola

Ejecutar en cualquier pestaña pública (una sola vez):

```js
// ¿cache-manager está activo y el listener conectado?
window.AltorraCache?.info()
// → { deploy: '...', meta: '1712345678901', memEntries: N }
// Si 'meta' === 'sin escuchar', el onSnapshot no arrancó.

// Forzar invalidación manualmente (simula el flujo):
window.AltorraCache?.invalidate()
```

Ejecutar en la pestaña del admin:

```js
// Forzar un touch manual de system/meta (sin editar propiedad):
(async () => {
  const { doc, setDoc, serverTimestamp } =
    await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
  await setDoc(doc(window.db, 'system', 'meta'),
    { lastModified: serverTimestamp() }, { merge: true });
  console.log('touch manual OK');
})();
```

Las pestañas públicas abiertas deberían reaccionar en < 5s.

---

## Registro de ejecuciones

| Fecha | Quién | Resultado | Notas |
|---|---|---|---|
| _pendiente_ | | | |
