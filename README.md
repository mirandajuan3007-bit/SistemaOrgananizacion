# SIGA — Sistema de Gestión Administrativa · FMAT UADY

Sistema para centralizar y automatizar la gestión administrativa de la **Facultad de Matemáticas de la UADY**: expedientes de participantes, contratos, facturas y pagos de honorarios que hoy viven repartidos entre correos, carpetas de OneDrive y la memoria de quien lleva la operación.

> **Principio que rige todo el sistema:** _el sistema **propone**, la persona **confirma**._
> SIGA nunca envía un correo, paga una factura ni firma un contrato por su cuenta. Prepara el trabajo, lo deja listo, y una persona da el clic final. Cada acción queda registrada (quién, qué y cuándo).

Este repositorio contiene **dos cosas**: la **documentación de diseño** del sistema y un **prototipo navegable** (maqueta de las pantallas, con datos ficticios y sin backend).

---

## 🔗 Prototipo en vivo

**https://mirandajuan3007-bit.github.io/SistemaOrgananizacion/**

Maqueta navegable con datos de ejemplo. Sirve para acordar *cómo se verá y cómo fluirá el trabajo* antes de programarlo. Se despliega solo con cada cambio (ver [Despliegue](#-despliegue)).

---

## 📖 Por dónde empezar

| Si eres… | Lee primero |
|---|---|
| **Cliente / no técnico** | [`guia_presentacion.md`](sistema_organizacion/guia_presentacion.md) — explica en lenguaje sencillo el problema, qué se ve en el prototipo y con qué se construye. |
| **Quieres ver el sistema funcionando** | El [prototipo en vivo](https://mirandajuan3007-bit.github.io/SistemaOrgananizacion/). |
| **Perfil técnico / diseño** | La carpeta [`diseño/`](sistema_organizacion/diseño/) — casos de uso, requisitos, diagramas y modelo de datos. |

---

## 🗂️ Estructura del repositorio

```
SistemaOrgananizacion/
├── README.md                      ← este archivo
├── .github/workflows/             ← automatización de publicación en GitHub Pages
└── sistema_organizacion/
    ├── guia_presentacion.md       ← 📄 documento maestro para presentar al cliente
    ├── prototipo/                 ← 🖥️ maqueta navegable (HTML/CSS/JS, sin backend)
    ├── diseño/                    ← 📐 la documentación técnica del sistema
    │   ├── casos_de_uso/          ← qué hace el sistema, paso a paso, por dominio
    │   ├── requeriments/          ← requisitos funcionales (RF) y no funcionales (RNF)
    │   ├── diagramas/             ← casos de uso, máquinas de estado, arquitectura
    │   ├── modelo_de_datos.md     ← estructura de la base de datos (PostgreSQL)
    │   └── limitaciones.md        ← restricciones del entorno (burocráticas, técnicas)
    └── ideas/                     ← notas de trabajo, análisis y transcripciones (borradores)
```

---

## 🖥️ El prototipo

Ubicado en [`sistema_organizacion/prototipo/`](sistema_organizacion/prototipo/). Son **8 páginas HTML** con rutas relativas, estilos en `css/styles.css` e interacciones simuladas en `js/app.js`. Tiene **dos vistas según el rol**:

### Vista de la Secretaría (operación diaria)

| Página | Para qué sirve |
|---|---|
| [`index.html`](sistema_organizacion/prototipo/index.html) — **Panel de pendientes** | Lo primero al entrar: qué necesita atención hoy, ordenado por urgencia. |
| `asistente.html` — **Asistente IA** | Busca archivos, responde sobre expedientes y redacta correos (con permisos, sin enviar sin confirmar). |
| `proyectos.html` — **Proyectos** | Presupuesto y contratos de cada proyecto. |
| `expediente.html` — **Expedientes** | Checklist de requisitos por participante: qué falta, qué está observado, qué está listo. |
| `contrato.html` — **Contratos** | Avance de cada contrato paso a paso, incluido el visto bueno del Director. |
| `pagos.html` — **Pagos** | Seguimiento de facturas, comprobantes fiscales y complementos. |
| `automatizaciones.html` — **Automatizaciones** | Muestra todo lo que el sistema hace solo y en qué paso interviene una persona. |

### Vista del Director (supervisión)

[`director.html`](sistema_organizacion/prototipo/director.html) — resumen ejecutivo semanal, bandeja de **vistos buenos** pendientes (aprobar/devolver contratos y cierres) y bandeja de escalados.

> Los datos del prototipo son **ficticios**. No hay base de datos ni correos conectados: eso corresponde a la fase de construcción.

---

## 📐 La documentación de diseño (`diseño/`)

Es el "plano" del sistema: define **qué debe hacer**, **cómo se comporta** y **cómo se guardan los datos**, de forma agnóstica al código.

### Casos de uso — [`diseño/casos_de_uso/`](sistema_organizacion/diseño/casos_de_uso/)

Describen cada función del sistema paso a paso (actor, precondiciones, flujo principal, alternativos, reglas de negocio). Están organizados en **7 dominios verticales por fase del proceso**. Cada dominio es una carpeta con su propio índice. Empieza por el [`README` de casos de uso](sistema_organizacion/diseño/casos_de_uso/README.md).

| Código | Dominio | Qué agrupa |
|---|---|---|
| **ACC** | Acceso | Autenticación con cuenta institucional (Entra ID) |
| **PRY** | Proyectos | Alta/cierre de proyectos y su presupuesto por rubro |
| **EXP** | Expediente | Participante, checklist documental, carga y recepción de documentos |
| **CTR** | Contratos | Ciclo de vida del contrato, observaciones, folio y visto bueno |
| **PAG** | Pagos | Registro de pagos de honorarios y cierre presupuestal |
| **CNS** | Consulta | Búsqueda, dashboards, historial y asistente de IA |
| **CTL** | Control | Alertas, bandeja de pendientes y administración |

**Total: 21 casos de uso.** Se identifican con la forma **`CU-DOM-NNN`** (p. ej. `CU-CTR-005` = el 5.º caso de uso del dominio Contratos).

> **Nota:** el dominio Consulta usa el código **`CNS`** (no `CON`) porque `CON` es un nombre de dispositivo reservado en Windows y rompe el control de versiones en ese sistema.

### Requisitos — [`diseño/requeriments/`](sistema_organizacion/diseño/requeriments/)

Un archivo por requisito, la fuente de verdad de lo que el sistema debe cumplir:

- **`requisitos_funcionales/`** — **16 requisitos (RF_01–RF_16):** lo que el sistema *hace* (gestionar contratos, validar facturas, recepción híbrida de documentos, visto bueno del Director, etc.).
- **`requisitos_no_funcionales/`** — **11 requisitos (RNF_01–RNF_11):** cómo debe *comportarse* (auditoría, control de acceso por roles, multi-tenancy, mecanismos automáticos M1–M6, etc.).

### Diagramas — [`diseño/diagramas/`](sistema_organizacion/diseño/diagramas/)

Diagramas en **Mermaid** (se renderizan solos en GitHub):

- [`01_casos_de_uso.md`](sistema_organizacion/diseño/diagramas/01_casos_de_uso.md) — actores y el mapa general de casos de uso.
- [`02_maquinas_de_estado.md`](sistema_organizacion/diseño/diagramas/02_maquinas_de_estado.md) — transiciones válidas de cada entidad (la de **Contrato** es la más crítica: `BORRADOR → ENVIADO → EN_REVISION → … → VIGENTE → CERRADO`).
- [`03_arquitectura_logica.md`](sistema_organizacion/diseño/diagramas/03_arquitectura_logica.md) — las capas del sistema (cliente, backend, núcleo compartido, integraciones).

### Modelo de datos y limitaciones

- [`modelo_de_datos.md`](sistema_organizacion/diseño/modelo_de_datos.md) — tablas, relaciones y decisiones de modelado sobre **PostgreSQL** (multi-tenant por `unidad_id`, claves `UUID`, soft delete, `audit_log`).
- [`limitaciones.md`](sistema_organizacion/diseño/limitaciones.md) — restricciones reales del entorno (burocráticas y técnicas).

---

## 🧩 Cómo encajan las piezas (trazabilidad)

La documentación está **entrelazada**, para poder rastrear cualquier decisión de punta a punta:

```
Requisito (RF/RNF)  →  Caso de uso (CU-DOM-NNN)  →  Diagrama / Máquina de estado  →  Modelo de datos  →  Pantalla del prototipo
```

Cada caso de uso cita los requisitos que cumple y sus reglas de negocio (`RN-DOM-NN`); cada máquina de estado referencia el requisito que la origina; el prototipo materializa visualmente esos flujos.

---

## 🛠️ Stack previsto

 el sistema se construirá con: **NestJS/TypeScript** (backend), **Next.js** (interfaz), **PostgreSQL + pgvector** (datos y búsqueda por significado), **n8n** (orquestador de automatizaciones), **BullMQ** (tareas en segundo plano), un **microservicio OCR** (lectura de documentos) e integración con **Microsoft 365** (Entra ID, Outlook, OneDrive). El asistente usa **modelos de IA de Claude sonnet**.

> Parte de la documentación de diseño (`modelo_de_datos.md`, `03_arquitectura_logica.md`) se escribió de forma **agnóstica al stack** y marca algunas piezas como *"por decidir"*; la guía de presentación refleja las decisiones ya tomadas.

---

## 🚀 Despliegue

El prototipo se publica automáticamente en **GitHub Pages** mediante el workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml):

- Se ejecuta en cada `push` a `main` que toque `sistema_organizacion/prototipo/` o los workflows.
- Publica **solo** la carpeta `sistema_organizacion/prototipo/` como raíz del sitio.
- **Fuente de Pages:** GitHub Actions.

No hay que hacer nada manual: al hacer push, el sitio se actualiza en ~20 segundos.

### Ver el prototipo en local

Al ser HTML estático, basta con abrir [`sistema_organizacion/prototipo/index.html`](sistema_organizacion/prototipo/index.html) en el navegador. Para que todo funcione igual que en producción, puedes servirlo con un servidor estático:

```bash
cd sistema_organizacion/prototipo
python -m http.server 8000
# abre http://localhost:8000
```

---

*Proyecto en fase de diseño y prototipado. Los datos mostrados son ficticios e ilustran únicamente el funcionamiento previsto.*
