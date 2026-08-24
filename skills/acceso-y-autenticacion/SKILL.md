---
name: acceso-y-autenticacion
description: Diseñar o auditar el sistema de ingreso de una aplicación — puerta única, segundo factor, sesión, alta y baja de usuarios, bitácora, recuperación. Úsala ANTES de escribir una pantalla de login, cuando alguien dice que el acceso «es muy básico», o cuando haya que decidir entre roles, MFA, passkeys o proveedores sociales. Incluye las trampas que solo se ven probando el sistema, no leyéndolo.
---

# 🚪 Acceso y autenticación

> **Qué es**: las reglas que valen en CUALQUIER proyecto para que una puerta de ingreso sea seria.
> No es una guía de Firebase — los ejemplos vienen de ahí porque de ahí salieron las cicatrices, pero
> cada regla se sostiene sola.
>
> **La idea que ordena todo lo demás**: un sistema de acceso no se audita leyéndolo, se audita
> **usándolo**. Cuatro de las reglas de abajo son invisibles en el código y solo aparecen cuando
> alguien intenta entrar de verdad.

---

## A. Antes de dibujar nada

### A-1 · Pregunta primero QUIÉN, después la prueba (identifier-first)
El paso 1 pide solo el identificador (correo/usuario). Con él el sistema decide qué exigir en el paso 2:
al cliente, poco; al operador interno, mucho. **El paso 1 se ve idéntico para todos** — un formulario que
muestra «usuario + contraseña» de golpe le dice a quien pase qué clase de cuenta encontró y le deja probar
combinaciones sin coste. Además evita mantener dos pantallas de login con dos comportamientos que se
desincronizan (siempre se desincronizan).

### A-2 · Una puerta, varios niveles de exigencia — no varias puertas
Cada puerta extra es un juego de mensajes, límites y recuperaciones que hay que mantener en paralelo.
Diferencia el RIGOR (factores, duración de sesión, canales de recuperación), no la URL.

### A-3 · El canal de recuperación no puede ser también el de ingreso, para cuentas privilegiadas
«Entrar con un enlace al correo» es excelente para un cliente: le ahorra una contraseña que olvidará.
Es inaceptable para quien administra, porque convierte su bandeja de correo en la llave maestra del sistema.
Regla: **magic link sí para el público, nunca para el personal interno.**

### A-4 · Distingue «autenticado» de «autorizado para QUÉ»
Un panel que solo comprueba *«¿eres del equipo?»* le entrega al rol de consulta exactamente lo mismo que
al dueño. Si el modelo de datos ya tiene roles, la interfaz tiene que gastarlos; si no, los roles son
decoración. Comprueba SIEMPRE los dos niveles, y que la frontera real (reglas del servidor) coincida con
lo que la interfaz insinúa.

---

## B. Las trampas que solo se ven probando

### B-1 · ⚠️ Un límite de intentos que vive donde escribe el atacante no es un límite: es un arma
El patrón «contador de intentos fallidos en la base de datos, con el identificador como clave» es común y
está **doblemente roto** cuando el cliente puede escribirlo:
1. **No protege** — quien prueba contraseñas pone su contador en cero antes de cada intento.
2. **Ataca** — cualquiera puede bloquear la cuenta de otro escribiendo `bloqueado: true`, indefinidamente.
   Si la clave del documento es un hash del correo, ese hash lo calcula cualquiera: no es un secreto.

**Y es peor de lo que parece**: convierte una medida de seguridad en una negación de servicio dirigida
contra la persona más importante del sistema, que es la que todo el mundo sabe cómo se llama.
**Qué hacer**: llévalo al servidor, o quítalo y apóyate en el límite de la plataforma (que sí es
inmanipulable). Un candado que solo el atacante puede abrir y solo la víctima sufre, es peor que ninguno.

### B-2 · La configuración de la plataforma es parte del sistema, y NO está en el repositorio
Dominios autorizados, proveedores habilitados, políticas de contraseña, protección contra enumeración:
todo eso vive en una consola web. **Ningún gate, linter o revisión de código puede verlo**, y por eso
produce la clase de fallo más cara: el código es correcto, el botón existe, y no funciona.
Caso real: un botón de «Continuar con Google» impecable en el código, muerto en producción porque el
dominio no estaba autorizado — el error caía en el `default` del traductor de errores y mostraba un
mensaje genérico. **Sonda obligatoria**: consulta la configuración pública por API y púlsalo en vivo.

### B-3 · Verifica el comportamiento de la plataforma antes de codificarlo a mano
Antes de escribir defensas contra la enumeración de cuentas, **comprueba si la plataforma ya la hace**:
pide un enlace de recuperación para una dirección inventada y mira la respuesta. Si responde éxito, la
protección está activa y tu código defensivo es redundante (inofensivo, pero es deuda que confunde).
Si responde «no existe», tienes un oráculo abierto y hay que taparlo en los dos sitios, no en uno.
Vale para todo: **la conducta real de la plataforma es un hecho comprobable, no una suposición.**

### B-4 · Al migrar de sistema, censa lo que el viejo hacía y el nuevo no
Las mudanzas pierden funciones silenciosamente, y las de seguridad son las que menos se echan de menos
porque nadie las usa a diario. Caso real: el panel viejo cerraba la sesión a los 30 minutos de
inactividad; el nuevo no cierra nunca, y nadie lo notó en meses. **Haz la lista del viejo antes de
apagarlo**, no después.

### B-5 · Una bitácora declarada no es una bitácora
Que la colección exista, tenga permisos y esté protegida contra modificación no significa que alguien
escriba en ella. **Busca los puntos de escritura antes de creer que hay registro.** Si no aparecen, no
hay auditoría — hay la ilusión de auditoría, que es peor porque nadie va a buscar más.

---

## C. Alta, baja y sesión

### C-1 · Nadie inventa la contraseña de nadie
Si el alta de un usuario recibe un campo `password` que teclea otra persona, el diseño está mal: esa
contraseña viaja por un chat, queda ahí para siempre y dos personas la conocen. **Invitación con
caducidad**: se genera una credencial aleatoria que nadie ve, y se envía un enlace de un solo uso para
que la persona elija la suya. Es además lo que exige OWASP ASVS 6.4.1.

### C-2 · Suspender ≠ eliminar, y casi siempre quieres suspender
Si la única salida es «Eliminar» y eso borra la cuenta, el operador se enfrenta a una decisión
irreversible para resolver una situación reversible (unas vacaciones, una sospecha, una salida que
podría revertirse). **Suspender** corta el acceso al instante y conserva el rastro de lo que esa persona
hizo. Eliminar se reserva para cuando de verdad toca.

### C-3 · Quitar el permiso no quita la sesión
Cuando los permisos viajan **dentro** del token (claims, JWT), revocar el permiso en la base de datos no
hace nada hasta que el token expira — típicamente una hora. Hay que **revocar explícitamente** las
sesiones. Y si el proceso de revocación tiene un corte por idempotencia («si nada cambió, salgo»),
la revocación va **antes** de ese corte: si en un intento anterior el permiso se escribió pero la
revocación falló, el reintento saldría por el corte y no revocaría nunca.

### C-4 · Sesión: corta por inactividad, tope absoluto, y revalidación en lo sensible
Tres relojes distintos y los tres hacen falta. El de inactividad protege el equipo desatendido; el tope
absoluto limita el daño de una sesión robada; la revalidación (pedir el token fresco antes de una acción
sensible) es lo que hace que C-3 muerda en segundos en vez de en una hora.

### C-5 · Deja que la persona vea y corte sus propias sesiones
«¿Dónde tengo la sesión abierta?» con un botón para cerrar cada una. Es lo que convierte una duda
—*¿habrá quedado abierto en algún teléfono?*— en una acción. Sin esto, cerrar el acceso de alguien que se
va es un acto de fe.

---

## D. Factores y contraseñas

### D-1 · Aplicación de autenticación, no SMS
El SMS se cobra por mensaje **y** es el factor más débil que existe: se intercepta duplicando la SIM.
Los códigos de aplicación (TOTP) no cuestan por uso y son más seguros. Es de los pocos casos donde lo
barato y lo correcto coinciden — no lo desperdicies.
Entrega los **códigos de respaldo una sola vez**, al activar, y di claramente que son la única salida si
se pierde el teléfono.

### D-2 · Longitud, no complejidad (NIST SP 800-63B-4, agosto 2025)
- Mínimo 8 exigible, **15 recomendado**; soportar hasta 64.
- **Sin** reglas de composición (mayúscula + número + símbolo). Solo producen `Marca2026!`.
- **Sin caducidad por calendario.** Se cambia ante indicio de filtración, no cada 90 días.
- Compara contra listas de contraseñas ya filtradas — eso sí sirve.
- Permite pegar desde el gestor de contraseñas. Bloquear el pegado empeora la seguridad.

### D-3 · El mismo mensaje exista o no la cuenta
En login y en recuperación. «Ese correo no está registrado» convierte el formulario en un detector de
qué direcciones tienen acceso. Trata el error de «no existe» como éxito. Ver también B-3.

### D-4 · Recuperar la contraseña no puede saltarse el segundo factor
Si el enlace de recuperación entrega la sesión directamente, el segundo factor es decorativo: basta con
tener el correo. (OWASP ASVS 6.4.3.)

### D-5 · Avisa a la persona de lo que le pasa a su cuenta
Ingreso desde un dispositivo nuevo, cambio de contraseña, cambio de correo, segundo factor desactivado.
El usuario es el único detector de intrusiones que conoce su propia rutina. (ASVS 6.3.5 y 6.3.7.)

---

## E. Decisiones caras, y cómo presentarlas

### E-1 · Separa lo gratis de lo irreversible
Una función puede ser gratuita **y** de una sola vía. Al proponerla, di las dos cosas por separado: el
coste no es el riesgo. Y si no tiene vuelta atrás, **no la tomes tú** — llévala al dueño con el número
concreto («gratis hasta N usuarios») y la frase concreta («no hay botón para regresar»).

### E-2 · Escribe lo que decidiste NO construir, y por qué
Si investigaste passkeys/WebAuthn y la plataforma aún no las soporta, esa investigación es un activo:
sin ella alguien repetirá la búsqueda en seis meses. **Anota la conclusión con fecha**, porque caduca.

### E-3 · Un botón que no puede funcionar es peor que no tenerlo
Antes de dejar un proveedor social en la pantalla, comprueba que esté habilitado **y** que el dominio
esté autorizado. Si no lo está: se arregla o se quita. Dejarlo enseña a la gente que el sistema falla.

### E-4 · Y traduce los códigos de error a algo que un humano entienda
Un traductor de errores con un `default` genérico es correcto — pero ese `default` es donde van a morir
los fallos de configuración (B-2), y ahí nadie los ve. Cuando caiga en el `default`, **regístralo**.

---

## Checklist rápido de auditoría

Sobre cualquier sistema de acceso, en este orden:

1. ¿El límite de intentos lo puede escribir el cliente? → **B-1**, es un arma.
2. ¿Alguien escribe en la bitácora, o solo está declarada? → **B-5**.
3. ¿El alta recibe una contraseña tecleada por otro? → **C-1**.
4. ¿Existe «suspender», o solo «eliminar»? → **C-2**.
5. ¿Revocar el permiso revoca la sesión? → **C-3**.
6. ¿Hay corte por inactividad en TODOS los paneles, o se perdió en una mudanza? → **B-4**, **C-4**.
7. ¿La interfaz distingue roles, o solo «entró / no entró»? → **A-4**.
8. ¿Los proveedores sociales de la pantalla funcionan en el dominio real? → **B-2**, **E-3**.
9. ¿El mensaje cambia según si la cuenta existe? Pruébalo, no lo leas. → **B-3**, **D-3**.
10. ¿Hay segundo factor donde hay datos personales de terceros? → **D-1**.
