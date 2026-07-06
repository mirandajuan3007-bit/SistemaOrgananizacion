# RNF_05 — Usabilidad para usuarios administrativos no técnicos

## por qué existe este requisito en este sistema

El usuario primario del sistema es la secretaría de la facultad, identificada durante el levantamiento del cliente como Elda. Ella es quien hoy gestiona manualmente todos los procesos: solicita documentos por correo, hace seguimiento de contratos en Excel, organiza carpetas en OneDrive, y es quien tiene en la cabeza el estado de cada expediente.

Si el sistema nuevo es difícil de usar, Elda volverá a los correos y al Excel. No porque sea resistente al cambio, sino porque una herramienta que requiere más esfuerzo que el proceso que reemplaza no tiene valor práctico. La adopción del sistema depende completamente de que sea más fácil de operar que el método actual.

El director también es usuario del sistema, pero su uso es más ocasional: revisar dashboards, consultar estados de proyectos, ver reportes. Su perfil es similar en términos de expectativas de simplicidad.

Los investigadores y participantes del proyecto usarán el sistema de forma aún más esporádica: solo para consultar su expediente, saber qué documentos les faltan, o ver el estado de su contrato. Para ellos, el sistema debe ser autoexplicativo.

Este requisito no es sobre hacer la interfaz "bonita". Es sobre garantizar que el sistema sea operativo para personas que no tienen formación técnica y que tienen carga de trabajo alta.

---

## descripción del requisito

El sistema debe poder ser operado por un usuario administrativo sin capacitación técnica previa, sin necesidad de consultar un manual durante el uso cotidiano, y sin que los errores comunes del sistema sean confusos o irrecuperables.

**operaciones core sin fricción**
Las tareas que la secretaría realiza todos los días deben completarse en el menor número de pasos posible: registrar un nuevo participante, actualizar el estado de un contrato, cargar un documento, ver qué le falta a un expediente, enviar un recordatorio. Cada una de estas tareas debe completarse en menos de 5 pasos desde cualquier punto de entrada del sistema.

**mensajes de error comprensibles**
Cuando el sistema detecta un error o una condición inválida, el mensaje que ve el usuario debe ser en español, debe explicar qué pasó en términos operativos, y debe indicar qué hacer para resolverlo. Los usuarios nunca ven códigos de error técnicos, stack traces, ni mensajes en inglés.

**acciones destructivas con confirmación**
Cualquier acción que no se puede deshacer fácilmente (eliminar un participante, rechazar un documento, cerrar un expediente) debe mostrar una pantalla de confirmación que describa claramente qué está a punto de ocurrir.

**estado siempre visible**
El usuario nunca debe quedar en duda sobre si una acción se completó. El sistema siempre confirma visualmente cuando una operación fue exitosa (guardar, enviar, cargar). Mientras una operación está en proceso, el sistema muestra indicadores de carga que previenen clics duplicados.

**navegación contextual**
La interfaz no depende de que el usuario sepa rutas o URLs. Desde cualquier pantalla, el usuario puede llegar a las acciones más frecuentes en uno o dos pasos. La barra lateral o el menú de navegación refleja los módulos y secciones del sistema de forma jerárquica y comprensible.

---

## cómo se mide este requisito

**tasa de completación de tareas**
Se define un conjunto de 5 tareas representativas del uso cotidiano. Un usuario que no ha usado el sistema antes debe poder completar el 100% de esas tareas en un máximo de 10 minutos en total sin recibir ayuda externa. Las tareas son:

1. Registrar un nuevo participante en un proyecto existente
2. Cargar un documento en el expediente de ese participante
3. Cambiar el estado de un contrato a "observado" y escribir la observación
4. Consultar qué documentos le faltan a ese participante
5. Ver el historial de eventos de ese contrato

**tiempo por tarea**
Cada tarea individual debe completarse en menos de 3 minutos para un usuario que ya conoce el sistema (usuario habitual). Para un usuario nuevo, el tope es 5 minutos por tarea.

**tasa de errores del usuario**
Durante la prueba de usabilidad, se registra cuántas veces el usuario intenta una acción incorrecta o navega a una sección equivocada antes de completar la tarea. El objetivo es menos de 2 errores de navegación por tarea para un usuario nuevo.

**comprensión de mensajes de error**
Al presentar 3 mensajes de error distintos del sistema, el usuario debe poder explicar correctamente qué significa cada uno y qué debe hacer para resolverlo. Si no puede, el mensaje de error debe reescribirse.

---

## cómo se traduce en el sistema

### en la interfaz (Next.js + shadcn/ui)

**sistema de componentes consistente**
Se usa shadcn/ui como librería de componentes base. Todos los formularios, botones, tablas, modales, y etiquetas de estado siguen el mismo sistema visual. El usuario aprende una vez cómo interactuar con un componente y esa lógica aplica en todo el sistema.

**etiquetas de estado con color y texto**
Los estados de contratos, documentos y expedientes se representan con etiquetas de color consistentes en todo el sistema:
- gris: borrador / pendiente
- amarillo: en proceso / enviado
- naranja: observado / requiere acción
- verde: aprobado / completado
- rojo: rechazado / vencido

Un usuario no necesita leer el texto del estado si ya aprendió el código de color.

**formularios con validación en tiempo real**
Los formularios muestran validaciones mientras el usuario escribe, no solo al enviarlo. Si un campo es requerido y está vacío, se indica antes de intentar guardar. Si el formato de un RFC no es válido, se indica inmediatamente con un mensaje explicativo.

**indicadores de progreso de expediente**
La vista de un expediente muestra visualmente qué porcentaje de los documentos requeridos han sido entregados. Una barra de progreso o checklist hace evidente de un vistazo qué falta y qué ya está.

**feedback de acciones completadas**
Después de cualquier operación exitosa (guardar, cargar, actualizar), aparece una notificación toast en la esquina de la pantalla que confirma la acción: "Documento cargado correctamente" o "Estado del contrato actualizado". Desaparece sola en 3-4 segundos.

### en el sistema de errores (NestJS → Next.js)

Se implementa un sistema de traducción de errores en el frontend. Los errores del API llegan con un código interno, y el frontend los traduce a mensajes en español comprensibles:

- `DOCUMENT_FORMAT_INVALID` → "El archivo que intentas cargar no es un PDF. Solo se aceptan documentos PDF."
- `CONTRACT_INVALID_TRANSITION` → "No es posible marcar este contrato como firmado porque todavía no ha sido aprobado."
- `PARTICIPANT_DUPLICATE_RFC` → "Ya existe un participante registrado con este RFC en el sistema."

Ningún mensaje de error muestra la excepción técnica del servidor al usuario.

### en la estructura de navegación

La barra lateral organiza el sistema por módulos (Proyectos, Contratos, Participantes, Documentos, Pagos). Dentro de cada sección, las acciones más frecuentes están en los primeros niveles de la jerarquía, no enterradas en submenús. Las acciones destructivas o avanzadas están en niveles más profundos.

La página de inicio del sistema muestra un resumen operativo: contratos con acción pendiente, documentos que llevan más de 48 horas sin respuesta, expedientes incompletos. Esto hace que la secretaría aterrice en lo más urgente sin necesidad de navegar.

---

## cómo se evidencia que se cumple

- Se realiza una sesión de prueba de usabilidad con la secretaría (Elda) u otro usuario administrativo antes de poner el sistema en producción. Los resultados documentan tiempos por tarea, errores de navegación, y preguntas del usuario.
- Ningún error que aparezca en el sistema durante la prueba de usabilidad contiene texto técnico en inglés, códigos de error, o referencias a la base de datos.
- Al pedir a un usuario nuevo que complete las 5 tareas definidas sin guía, las completa todas correctamente en menos de 10 minutos en total.
- Los mensajes de confirmación de acciones (toasts) aparecen en el 100% de las operaciones exitosas, sin excepción.
- Al preguntar a la secretaría "qué documentos le faltan al participante X del proyecto Y", puede llegar a esa información en menos de 3 clics desde la página de inicio.

---

## cómo se representa en el diseño

**en los wireframes o mockups**
Antes de implementar cada pantalla, existe un wireframe o prototipo que muestra el flujo de navegación de la tarea principal para esa pantalla. Los wireframes tienen anotados los mensajes de confirmación, los estados de carga, y los mensajes de error posibles.

**en el mapa de navegación**
Existe un diagrama de navegación del sistema que muestra todas las pantallas y cómo se conectan entre sí. Ese diagrama permite verificar que ninguna tarea frecuente requiere más de 3-4 pasos de navegación.

**en el catálogo de mensajes del sistema**
Se mantiene un documento con todos los mensajes que el sistema puede mostrar al usuario: errores, confirmaciones, estados vacíos, tooltips. Cada mensaje está escrito en español claro, sin tecnicismos, y ha sido revisado pensando en el perfil del usuario administrativo.

**en el sistema de diseño**
Las etiquetas de color para estados, los íconos usados en la interfaz, y los patrones de formulario están documentados en el sistema de diseño del proyecto. Esto garantiza consistencia cuando se agregan nuevas pantallas en el futuro.
