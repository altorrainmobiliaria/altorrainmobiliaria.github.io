# 🚪 ENCARGO — Las dos puertas que faltan (§222)

> **Qué es esto.** Dos módulos de dominio del portal están **completos, tipados y con pruebas**, y
> **nadie los llama**: no existe pantalla, formulario ni flujo que permita usarlos. Cada uno
> materializa una **obligación legal** con una consecuencia concreta y cara. Este documento es el
> **encargo escrito** para que puedan mockearse y construirse — no es una propuesta de diseño ni un
> permiso para tocar UI (rige *nunca UI sin mockup aprobado*).
>
> Medido el 2026-08-26: **28 módulos de dominio · 25 con consumidor real · 3 sin ninguno**
> (`preaviso`, `certificacion` y el barrel `index`). Detalle y método → ADR §222.

---

## 1️⃣ EVIDENCIA POSTAL DEL PREAVISO — `portal/src/lib/domain/preaviso.ts`

### Por qué importa (y cuánto cuesta no tenerlo)
Los arts. 22 num. 7 y 24 de la **Ley 820 de 2003** piden **dos** cosas para que un preaviso de
terminación surta efecto: que sea **escrito** *y* que viaje **«a través del servicio postal
autorizado»**. §185 dictaminó que la Ley 527 da equivalente funcional del escrito y de la firma,
**no de un canal de entrega** — así que el producto **no debe ENVIAR el preaviso: debe
INSTRUMENTARLO**.

🔴 **La consecuencia de fallar no es un error de formulario: el contrato se PRORROGA un año entero**,
y nadie se entera hasta que el propietario quiere disponer del inmueble y no puede.

⏱️ **Y la trampa que decide todo**: cuenta la fecha de **IMPOSICIÓN** (cuándo se entregó al
operador), **no** la de redacción ni la de entrega al destinatario. Lo que se firma un lunes y se
lleva al operador el viernes, para la ley se avisó **el viernes**.

### Qué tiene que capturar la pantalla
| Campo | Tipo | Por qué |
|---|---|---|
| `quien` | arrendador \| arrendatario | Cambia quién debe probar |
| `redactadoEl` | fecha | Registro. **NO** es la fecha que cuenta |
| `operador` | texto | Postal **HABILITADO** (4-72, Servientrega…), no un mensajero: lo que aporta el canal es que un tercero autorizado certifique |
| `guia` | texto | Lo que permite rastrear y, el día del pleito, probar |
| **`impuestoEl`** | fecha | 🔴 **La que decide.** Sin ella no hay preaviso, hay intención |
| `entregadoEl` | fecha, opcional | No mueve el plazo; refuerza la prueba |

### Qué tiene que MOSTRAR (no basta con guardar)
1. **Antes**: la fecha límite para imponer, que ya calcula `fechaLimite(vigenciaFin)` (vencimiento
   menos 3 meses). Es la que evita el daño.
2. **Después**: el veredicto de `efecto()`, **con todas las letras** y en dos formas distintas —
   *«termina el <fecha>»* o **«NO termina: se prorroga un año»**. El módulo devuelve deliberadamente
   esas dos cadenas, y no un booleano, para que la segunda **se pueda decir**.
3. **Lo que falta**, si falta: `problemasDePreaviso()` ya devuelve los cinco casos
   (`sin-evidencia-postal`, `sin-operador`, `sin-guia`, `sin-fecha-de-imposicion`,
   `impuesto-tarde`) y `explicarProblemaPreaviso()` ya trae el texto en castellano llano.

### Lo que además hay que cambiar (va CON la pantalla, no antes)
- **Falta el tipo de documento.** `TIPOS_DOCUMENTO` (bóveda del expediente) tiene 14 tipos y
  **ninguno es la constancia postal**: el escaneo tendría que ir como `otro` y perder su identidad.
  Hay que añadir **`constancia-postal`** — pero *con* la pantalla, para no sumar más código sin
  consumidor, que es justo el defecto que este encargo documenta.

### ❓ Lo que decide Daniel
1. **¿Dónde vive?** Propuesta: dentro del expediente en `/gestion`, junto a los documentos — es donde
   ya está el contrato y su vigencia. Alternativa: paso propio en el ciclo `activo → preaviso →
   finalizado`, que ya existe como estado.
2. **¿Quién puede registrarla?** Los mismos roles que escriben en la bóveda, o solo `super_admin`.

---

## 2️⃣ CERTIFICACIÓN AL PROPIETARIO — `portal/src/lib/domain/certificacion.ts`

### Por qué importa
Es la **tercera de las cuatro formalidades** del esquema canon-neto bajo mandato, y la obligación
está en el **D.1625/2016 art. 1.2.4.11**, leído del texto: el mandante declara esos ingresos
**«según la información que le suministre el mandatario»**. O sea: **entregársela es obligación de
ALTORRA**, y hoy el producto no tiene por dónde.

Sin ella, el propietario **no puede declarar bien** lo que ALTORRA recibió y retuvo por su cuenta.

### Qué existe ya
`certificar(mandatario, mandante, meses)` produce la certificación; `problemasDeCertificacion()` y
`mesesFaltantes()` dicen qué le falta — incluido **qué meses del año no están**, que es el error
típico y el que invalida el documento.

### ❓ Lo que decide Daniel
1. **¿Es una pantalla o un PDF descargable?** El mockup **`ALTORRA Liquidacion.dc.html`** existe y
   está aprobado, pero cubre la liquidación **MENSUAL** (canon, honorarios, IVA, retención): no
   menciona la certificación **anual**. Son dos cosas distintas y hoy solo una tiene diseño.
2. **¿Cuándo se emite?** Una vez al año (para la declaración) o a demanda del propietario.
3. ⚠️ La página `/liquidacion` **no existe todavía** aunque su mockup sí. Si se construye, este
   encargo debería ir en el mismo lote: comparten datos y destinatario.

---

## 3️⃣ El barrel muerto — `portal/src/lib/domain/index.ts`

Ocho líneas que dicen *«Importar desde `~/lib/domain`»* y **nadie importa así**: los 25 módulos vivos
se citan por su ruta completa. O se adopta la convención o se retira el fichero; mantener una
instrucción que nadie sigue es peor que no tenerla, porque el siguiente que la lea creerá que hay una
regla.

---

## 📌 Cierre

**Nada de esto es urgente en el sentido de que algo esté roto hoy** — no hay contratos reales en la
base todavía. Es urgente en el sentido de que **el día que entre el primer contrato real, las dos
obligaciones ya estarán corriendo**, y la del preaviso tiene un reloj de tres meses que empieza sin
avisar.
