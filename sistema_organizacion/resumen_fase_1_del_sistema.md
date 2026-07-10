# SIGA — Sistema de Gestión Administrativa
### Guía de presentación · Facultad de Matemáticas, UADY

> Este documento explica, en lenguaje sencillo, **qué problema resuelve el sistema, qué se puede ver hoy en el prototipo, y con qué está construido y por qué**. Está pensado para que cualquier persona lo entienda sin conocimientos técnicos y pueda revisarlo con calma.

---

## 1. El problema que resolvemos

Hoy la gestión administrativa de los proyectos de la Facultad —expedientes de participantes, contratos, facturas y pagos— vive **repartida entre correos, carpetas de OneDrive y la memoria de la persona que la lleva**. Nada avisa cuándo algo se atora, los documentos se archivan y renombran a mano, y verificar una factura o armar un contrato consume horas de trabajo repetitivo.

Esto genera tres riesgos constantes:

- **Cosas que se atrasan sin que nadie se dé cuenta** (un contrato sin respuesta, un cheque sin cobrar).
- **Errores costosos** (una factura con el monto equivocado que se paga de todos modos).
- **Todo depende de una sola persona** y de que se acuerde de cada pendiente.

---

## 2. Qué queremos lograr

Un sistema —**SIGA**— que **centralice toda esa operación en un solo lugar y que vigile los pendientes solo**, para que el trabajo administrativo sea:

- **Más rápido** — el sistema hace lo repetitivo (clasificar, verificar, recordar).
- **Más confiable** — nada se pierde ni se atrasa en silencio; todo queda registrado.
- **Más tranquilo** — la persona decide y aprueba; el sistema se encarga del resto.

### El principio que lo rige todo

> **El sistema propone, la persona confirma.**
>
> SIGA nunca envía un correo, paga una factura ni firma un contrato por su cuenta. Prepara el trabajo, lo deja listo, y **una persona da el clic final**. Cada acción queda registrada (quién, qué y cuándo), para total transparencia.

Esto es importante decírselo al cliente de entrada: el sistema **asiste**, no reemplaza el criterio de nadie.

---

## 3. Qué se puede ver hoy en el prototipo

Lo que se presenta es una **maqueta navegable**: pantallas reales, con datos de ejemplo, por las que se puede hacer clic y moverse. **Todavía no tiene la base de datos ni los correos reales conectados** —eso viene en la construcción—, pero sirve para ponernos de acuerdo en *cómo se verá y cómo fluirá el trabajo* antes de programarlo.

El prototipo tiene **dos vistas según el rol**:

### Vista de la Secretaría (la operación del día a día)

| Pantalla | Para qué sirve |
|---|---|
| **Panel de pendientes** | Lo primero que ve al entrar: qué necesita atención hoy, ordenado por urgencia (contratos atorados, cheques sin cobrar, documentos observados). Responde de un vistazo: *"¿qué tengo que hacer hoy?"* |
| **Asistente IA** | Un ayudante que busca archivos, responde preguntas sobre los expedientes y redacta correos —siempre con los permisos de quien lo usa, y sin enviar nada sin confirmación. |
| **Proyectos** | El presupuesto y los contratos de cada proyecto de la Facultad. (aqui enla parte de los proyecto se tomaron ciertas deciciones para hacer que el prototipo sea mas facil de mostrar, con en la parte del estado y la infomcaion del proyecto)|
| **Expedientes** | La lista de requisitos de cada participante: qué falta, qué está observado, qué está listo. Responde: *"¿ya se puede contratar a esta persona?"* (en este caso solo funciona totalemnte visual, al hacer clik en ver te tiene que mandar al drive que estara conectado, pero esto en la implementacion)| 
| **Contratos** | El avance de cada contrato paso a paso, incluyendo el **visto bueno del Director** antes de firmar. |
| **Pagos** | Seguimiento de facturas, comprobantes fiscales y complementos de pago. |
| **Automatizaciones** | El panel que muestra **todo lo que el sistema hace solo** y en qué paso interviene una persona (ver punto 4). |

### Vista del Director (supervisión, no operación)

El Director **no opera** expedientes ni pagos: ve el estado general y **decide dos cosas**.

| Pantalla | Para qué sirve |
|---|---|
| **Resumen ejecutivo** | El estado semanal de la unidad: presupuesto ejercido por proyecto, semáforo de la semana, indicadores clave. El mismo reporte que le llega al correo cada lunes. |
| **Vistos buenos pendientes** | Aprueba contratos y cierres de proyecto (obligatorio por los montos que manejan), o los devuelve con un comentario. Cada tarjeta trae lo necesario para decidir en segundos. |
| **Bandeja de escalados** | Solo llega aquí lo que la Secretaría escala explícitamente; el resto se resuelve en la operación. |

---

## 4. Lo que el sistema hace solo (automatizaciones)

Este es el corazón del valor del sistema. Más allá de recordatorios, SIGA automatiza los procesos **repetitivos** que hoy consumen horas:

| Automatización | Qué hace | El ahorro |
|---|---|---|
| **Clasificación de documentos** | Cada correo con adjuntos se liga solo al expediente correcto y sugiere qué requisito cubre cada archivo. | ~10 min por documento → **1 clic** |
| **Validación de facturas** | Al llegar una factura, verifica el sello fiscal y coteja RFC, monto y rubro contra el contrato, **antes** de que alguien la revise. | ~25 min → **~2 min** por factura |
| **Barrido de alertas** | Cada mañana revisa plazos, contratos atorados y cheques sin cobrar, y genera las alertas del día. | Reemplaza revisar el correo hilo por hilo |
| **Recordatorios** | Cuando detecta un faltante, redacta el correo con los datos del folio; la persona solo revisa y confirma. | Cero correos escritos desde cero |
| **Vigilancia presupuestal** | Con cada pago recalcula lo gastado por rubro y avisa si algo se sobregira. | Detecta desviaciones al instante |

En el prototipo, la pantalla de **Automatizaciones** muestra cada uno de estos flujos como una cadena de pasos, marcando claramente cuáles son **automáticos** y en cuál **interviene una persona**. Así el cliente *ve* la automatización, no solo se la imaginamos.

---

## 5. Con qué está construido y por qué

El sistema se construye con **herramientas modernas, probadas y usadas por empresas grandes en todo el mundo**. Aquí está, en lenguaje sencillo, qué aporta cada una y por qué la elegimos:

| Pieza | Qué es, en simple | Por qué la usamos |
|---|---|---|
| **El motor del sistema** (NestJS / TypeScript) | El "cerebro" que procesa toda la lógica: reglas de negocio, permisos, validaciones. | Es un lenguaje moderno y **seguro** que atrapa muchos errores antes de que ocurran; está muy soportado, así que el sistema es fácil de mantener y hacer crecer a futuro. |
| **La interfaz** (Next.js) | Las pantallas que ven y usan las personas. | Rápida, moderna y cómoda de usar; funciona bien en computadora y se ve profesional. |
| **La base de datos** (PostgreSQL) | Donde se guarda todo de forma ordenada y segura: expedientes, contratos, pagos. | Es de las bases de datos **más confiables y robustas** que existen, gratuita y estándar en la industria. Los datos quedan protegidos y siempre disponibles. |
| **La búsqueda inteligente** (pgvector) | Permite que el asistente encuentre información **por significado**, no solo por palabra exacta. | Es lo que hace que el asistente entienda preguntas en lenguaje natural y encuentre el documento correcto aunque no se escriba el nombre exacto. |
| **El orquestador de automatizaciones** (n8n) | El "director de orquesta" que conecta los pasos automáticos (recibir correo → clasificar → avisar). | Permite **ver y ajustar las automatizaciones de forma visual**, sin reprogramar. Si un proceso cambia, se adapta fácil. |
| **La fila de tareas** (BullMQ) | Hace que los procesos pesados (leer una factura, un barrido) corran **en segundo plano** sin trabar el sistema. | La persona nunca se queda esperando; el sistema sigue ágil aunque esté trabajando por detrás. |
| **La lectura de documentos** (microservicio OCR) | Lee el texto de documentos escaneados (una constancia, un comprobante en PDF). | Es lo que permite clasificar y validar documentos automáticamente en lugar de leerlos a mano. |
| **El asistente inteligente** (modelos de IA de Claude) | El "ayudante" que responde preguntas, busca archivos y redacta borradores. | Se puede **elegir el modelo según la tarea** (uno económico para lo simple, uno potente para lo complejo), lo que mantiene el **costo mensual bajo y controlado**. |

**La idea de fondo:** ninguna de estas herramientas se eligió por moda. Cada una resuelve una necesidad concreta del proyecto, son **estándar en la industria** (no tecnología rara que solo una persona pueda mantener), y en su mayoría son de **código abierto** —sin licencias costosas—, lo que abarata y da independencia a largo plazo.

---

## 6. ¿Cuánto cuesta operar el asistente?

El costo del asistente de IA es **sorprendentemente bajo** para una unidad como la Facultad, porque el volumen es acotado (una secretaría, un director). Estimamos entre **$20 y $60 USD al mes** de uso, gracias a dos cosas: se usa un modelo económico para tareas simples y uno potente solo cuando hace falta, y el sistema reutiliza contexto para no repetir trabajo. Es un gasto comparable a una suscripción de software, no a contratar personal. *(La infraestructura —servidores, hosting— se presupuesta aparte.)*

---

## 7. Qué sigue después de esta presentación

El prototipo es para **recoger validación y decisiones**, no es el sistema terminado. Después de mostrarlo:

1. **Confirmar que el flujo refleja la realidad** de la Facultad (roles, pasos, vistos buenos).
2. **Decidir qué automatizaciones sí y cuáles no** —cada una se presenta como propuesta a validar.
3. **Cerrar los pendientes abiertos**: cómo manejar las transferencias entre rubros de presupuesto y dónde se alojará el sistema.
4. **Comenzar la construcción** usando el prototipo como guía visual de lo que se programa.

---

*Documento de presentación · Prototipo SIGA FMAT · Versión de trabajo.*
*Los datos mostrados en el prototipo son ficticios y sirven solo para ilustrar el funcionamiento.*
