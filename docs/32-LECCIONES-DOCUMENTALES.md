# 🧾 32 — LECCIONES DOCUMENTALES Y LEGALES (hoja hija de `30`)

> Trigger de Experiencia (§G.2), rama **documental**: ANTES de redactar, corregir, renumerar o retirar un
> entregable legal/operativo (contratos, manual, formatos, tarifario) — o de mandar una auditoría sobre él.
> Las lecciones **técnicas** (Firebase, Cloudflare, Astro, UI, pauta) siguen en `30-LECCIONES.md`.
>
> 🏷️ **Namespace propio `LD-NN`.** Nacieron como `L-31..L-34` dentro de `30` y **colisionaron** con las
> L-31..L-34 técnicas: dos lecciones distintas por número, y citas en `10`, `99 §55`/`§66`/`§67`, `00`, `20`,
> `31` y en dos skills apuntando a sentidos contrarios. Se renombraron el 2026-07-28 (ADR §68). El mapa de
> equivalencia vive abajo, y es también la lección [[M-04]] del propio cerebro.

| Antes (en `30`) | Ahora | Lección |
|---|---|---|
| `L-31` (kit) | **LD-01** | Los defectos nuevos nacen DE las correcciones |
| `L-32` (kit) | **LD-02** | Confirmar el MECANISMO antes de construir el instrumento |
| `L-33` (kit) | **LD-03** | Una nota "para retirar" suele ser el inventario de lo que falta |
| `L-34` (kit) | **LD-04** | Renumerar rompe las remisiones de los demás |

> ⚠️ Las `L-31`..`L-34` **que siguen en `30`** son otras cosas (pieza de humo · Ads Manager multi-marca ·
> `cloudflare:workers` · Range en Workers Static Assets). Si un ADR viejo dice "L-33" y habla del kit, quiere
> decir **LD-03**.

---

## Lecciones (LD-NN)

### LD-04 — 🔗 Renumerar un documento ROMPE las remisiones de los demás: al renumerar, busca quién te cita *(kit ALTORRA, 2026-07-28)*
**Disparador**: al consolidar el tarifario a V2 fusioné y reordené sus filas. El manual seguía citando "filas 2/2b/2c" y "fila 2c" —que dejaron de existir— y ACM, venta y alojamientos se corrieron de lugar: **37 remisiones en 8 archivos** apuntaban al servicio equivocado, así que un asesor cotizando por el manual leía otra tarifa. **Regla**: renumerar es un cambio de INTERFAZ, no de contenido — antes de cerrarlo, grep de quién cita el número, y al reparar **añade el nombre junto al número** ("fila 7 — ACM") para que el próximo cambio falle ruidoso y no en silencio. Aplica a cláusulas, parágrafos, anexos, filas y numerales. Hermana de [[LD-01]]. **Reincidió sobre el propio cerebro** el 2026-07-28 (los IDs de lección de esta hoja) → [[M-04]].

### LD-03 — 🗑️ Una nota "para retirar" suele ser el INVENTARIO de lo que falta: léela antes de borrarla *(kit ALTORRA, 2026-07-28)*
**Disparador**: el kit tenía ~570 marcas de trabajo y 131 líneas de "NOTA PARA DANIEL" que se imprimían en el papel que firma un tercero. La reacción obvia —pasarles un script— habría sido un error: al inspeccionarlas, **muchas no eran comentarios de redacción sino pelotas abiertas**. Una escondía que ALTORRA **no tiene contrato con DataCrédito/TransUnion**, sin el cual no se puede consultar a nadie aunque el arrendatario firme la autorización — y el contrato ya le anuncia que se le consultará. Borrarla habría eliminado el hallazgo, no el problema. **Regla**: automatiza el **gate** (que no salgan a papel), nunca el **borrado**. Clasifica cada marca en *decisión* (→ notas), *pelota abierta* (→ backlog) o *dato por diligenciar* (→ espacio en blanco); solo la tercera es mecánica.

### LD-02 — 🧭 Confirmar que el MECANISMO sigue vigente ANTES de construir el instrumento *(pagaré doc 23, 2026-07-27: 2 auditorías y ~1,7M tokens sobre algo que el negocio no usa)*
**Disparador**: el manual heredado del corpus viejo exigía "pagaré con carta de instrucciones en TODO arriendo", así que redacté el formato, lo pasé por una auditoría ×3 (reprobado, 28 hallazgos), lo corregí, lo pasé por una ×4 (reprobado, 26 más), lo corregí otra vez… y al final Daniel dijo *"no usaremos pagarés, todo será con la aseguradora"*. La decisión de negocio existía; nadie se la había preguntado. **Regla**: antes de construir un entregable caro que viene de un **corpus heredado** —no de una petición explícita del dueño—, gastar UNA pregunta: *"¿esto lo vas a usar?"*. El corpus documenta lo que se hacía, no lo que se decidió hacer. **Señales de que toca preguntar**: el requisito viene de un manual viejo · nadie lo ha ejecutado nunca en la operación real · existe una alternativa comercial que el dueño ya contrató (aquí: la póliza, decidida ese mismo día). **Lo que SÍ se rescata** (y por eso no se borra nada, §G.4): del pagaré sobrevivieron 3 de 4 dictámenes legales, las 6 reglas de instrumentos de cobro de `42`, el hallazgo del poder del art. 74 CGP y una cláusula de póliza que el contrato **no tenía**. Un entregable retirado que deja doctrina reutilizable no fue tiempo perdido, pero sí fue tiempo caro. Pariente de [[LD-01]]: allá el parche introduce defectos; aquí el trabajo entero puede no tener destinatario.

### LD-01 — 🔁 Los defectos nuevos nacen DE las correcciones: toda pasada de corrección exige una lente de REGRESIÓN que verifique hallazgo por hallazgo *(doc 23 pagaré, 2 auditorías el 2026-07-27; crudos en `research-archive/2026-07-27-pagare-doc23-*`)*
**Disparador**: un instrumento legal reprobado por 3 auditores (28 hallazgos); apliqué los 28 con su texto exacto; la 2ª pasada volvió a reprobarlo con **26 correcciones más — casi todas nacidas DE las correcciones anteriores** (sacar los intereses del valor de cara descuadró la base de la fórmula; subir la caducidad a 3 años metió una "suspensión" que la ley no permite y habría costado el título entero; imprimir el beneficiario destapó que el **contrato madre nombraba a otro acreedor**, contradicción con semanas de antigüedad). **Reglas**: (1) aplicar ≠ cerrar → **re-auditar**: el parche es tan sospechoso como el original; (2) la pasada 2 lleva **lente de REGRESIÓN** que recorre los hallazgos de la 1ª **uno por uno** (no muestrea) y contrasta el doc contra su fuente madre — la que más rindió y la única que caza contradicciones ENTRE documentos; (3) cada hallazgo pasa por un **verificador que intenta REFUTARLO citando el texto real**: de 56 brutos murieron 14 y se desinflaron 33 — sin ese filtro se "corrigen" defectos inexistentes; (4) **anotar las propuestas RECHAZADAS con su porqué** en el documento: 6 pedían revertir correcciones previas y sin registro la pasada 3 las repite; (5) corolario: **un anexo nunca autoriza más que su contrato madre** (→ `42 §Instrumentos de cobro`). Pariente de `30 L-29`: allá el que construye no puede auditarse; aquí, **el que corrige tampoco**.
