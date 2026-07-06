# RNF_06 — Escalabilidad modular

## por qué existe este requisito en este sistema

Este requisito no es aspiracional ni genérico. Es una restricción concreta del proyecto. El cliente indicó explícitamente que el sistema que se construye ahora (módulo de honorarios en FMAT) es solo el primero de varios módulos que se expandirán a toda la UADY.

Los módulos futuros identificados son: becas, educación continua, viáticos, y cierre presupuestal. Las facultades futuras son el resto de las unidades académicas de la universidad. Si la arquitectura del primer módulo no contempla desde el inicio que más módulos y más facultades se agregarán después, el costo de escalar será tan alto que equivaldrá a reescribir el sistema desde cero.

Hay dos dimensiones de escalabilidad en este sistema:

**escalabilidad de módulos de negocio**: agregar un nuevo módulo (becas, viáticos) no debe requerir modificar el código de los módulos existentes (honorarios). Cada módulo crece de forma independiente.

**escalabilidad de unidades (multi-tenancy)**: cuando el sistema se extienda a otra facultad, esa facultad tiene sus propios proyectos, participantes, configuraciones y usuarios, pero comparte la misma infraestructura y código base. Agregar una nueva facultad no debe requerir desplegar una instancia nueva del sistema.

---

## descripción del requisito

La arquitectura del sistema debe ser modular desde el primer módulo, de forma que:

1. Agregar un módulo de negocio nuevo significa crear código en un directorio nuevo sin modificar los módulos existentes.
2. Agregar una nueva unidad académica (facultad) significa crear un registro de configuración, no desplegar nueva infraestructura.
3. Los módulos comparten infraestructura común (autenticación, auditoría, almacenamiento, notificaciones, agente de IA) sin duplicarla.
4. El sistema puede manejar el volumen de datos de múltiples facultades en una sola instancia de base de datos sin degradación de rendimiento.

---

## cómo se mide este requisito

**independencia de módulos**
Al agregar el módulo de becas, se verifica que no se modificó ningún archivo del módulo de honorarios. El grafo de dependencias del proyecto no tiene dependencias circulares entre módulos de negocio. Esto se verifica con una herramienta de análisis de dependencias (por ejemplo, `madge` para TypeScript).

**tiempo para agregar una nueva facultad**
Agregar una segunda facultad al sistema (con su configuración, sus usuarios, y sus permisos) debe ser realizable en menos de 2 horas, siguiendo el proceso documentado. Ese proceso no requiere cambios de código, solo cambios de configuración.

**tamaño del núcleo compartido vs. módulos**
El código del núcleo compartido (auth, audit, storage, notifications) no crece proporcionalmente cuando se agregan módulos nuevos. Los módulos nuevos agregan código solo en su directorio.

**consultas con filtro de unidad**
Todas las consultas que retornan datos del sistema incluyen un filtro por `unidad_id`. Una consulta sin ese filtro no puede retornar datos de múltiples unidades mezclados.

---

## cómo se traduce en el sistema

### en la arquitectura de NestJS

El backend se organiza en dos tipos de módulos:

**módulos del núcleo compartido** (en `src/shared/`):
- `AuthModule`: autenticación con Entra ID, guards, contexto del usuario
- `AuditModule`: servicio de trazabilidad (RNF_01)
- `StorageModule`: integración con SharePoint/OneDrive via Graph API
- `NotificationsModule`: envío de correos y alertas via Graph API o SMTP
- `AiModule`: motor del agente de IA con Vercel AI SDK

**módulos de negocio** (en `src/modules/`):
- `HonorariosModule`: contratos, participantes de tipo honorarios, pagos de honorarios
- `BecasModule` (futuro): participantes tipo becario, constancias, pagos de becas
- `ViaticosModule` (futuro): facturas de viáticos, reembolsos
- `CierrePresupuestalModule` (futuro): formatos de ingreso, cuentas finales

Los módulos de negocio importan del núcleo compartido. Los módulos de negocio nunca se importan entre sí (no hay dependencias cruzadas entre módulos de negocio).

```
src/
├── shared/
│   ├── auth/
│   ├── audit/
│   ├── storage/
│   ├── notifications/
│   └── ai/
└── modules/
    ├── honorarios/
    │   ├── honorarios.module.ts
    │   ├── contracts/
    │   ├── participants/
    │   └── payments/
    └── becas/           ← módulo futuro, no toca honorarios
        ├── becas.module.ts
        ├── scholars/
        └── scholarships/
```

### en la base de datos (multi-tenancy con PostgreSQL)

Se implementa un modelo de multi-tenancy por columna de discriminador. Cada tabla principal del sistema tiene una columna `unidad_id` que indica a qué facultad pertenece el registro.

La tabla `unidades` almacena la configuración de cada facultad:

```
id            UUID        primary key
nombre        TEXT        "FMAT", "FING", "FMED"...
codigo        TEXT        código corto de la facultad
configuracion JSONB       configuración específica de la unidad (módulos activos, reglas)
activa        BOOLEAN
```

El contexto de usuario autenticado siempre incluye la `unidad_id` del usuario. Todos los servicios de NestJS reciben ese contexto y aplican el filtro automáticamente en todas las consultas.

Para prevenir que datos de una facultad sean accesibles desde otra, el `AuthorizationGuard` verifica que el `unidad_id` del recurso solicitado coincida con el `unidad_id` del usuario autenticado.

### en el modelo de configuración por módulo

Cada unidad puede tener módulos activos o inactivos. La tabla `configuracion` en `unidades` tiene un campo `modulos_activos: string[]` que lista qué módulos están habilitados para esa facultad.

Cuando FMAT solo tiene el módulo de honorarios, `modulos_activos: ["honorarios"]`. Cuando FING tenga además el módulo de becas, `modulos_activos: ["honorarios", "becas"]`. La interfaz de usuario muestra solo los módulos activos para la unidad del usuario autenticado.

### en el frontend (Next.js)

El sistema de rutas del frontend es dinámico por módulo. Si un módulo no está activo para la unidad del usuario, esa sección del menú lateral no aparece y la ruta devuelve una redirección.

La selección de unidad activa se maneja en el contexto de autenticación global. Si un usuario pertenece a múltiples unidades (un administrador central de UADY, por ejemplo), puede cambiar de unidad activa desde la interfaz sin hacer logout.

---

## cómo se evidencia que se cumple

- Al agregar el módulo de becas en el futuro, se puede verificar que los únicos archivos nuevos o modificados son los del directorio `src/modules/becas/` y el registro de configuración de unidad. Ningún archivo de `src/modules/honorarios/` fue tocado.
- Al crear una segunda facultad en el sistema, la operación consiste en insertar un registro en la tabla `unidades` con su configuración. No se ejecuta ningún comando de despliegue ni se copia ningún código.
- Una consulta que busca contratos sin incluir el filtro de `unidad_id` es rechazada o retorna error a nivel de servicio. No existe ninguna consulta en el sistema que retorne datos mezclados de múltiples facultades.
- Un usuario de FMAT autenticado que intenta acceder a la URL de un contrato de FING (con un ID válido pero de otra unidad) recibe un 404 o 403, no los datos del contrato de FING.
- El análisis de dependencias con `madge` muestra que no existe ninguna dependencia entre módulos de negocio.

---

## cómo se representa en el diseño

**en el diagrama de arquitectura**
El diagrama de arquitectura tiene dos capas diferenciadas: el núcleo compartido y los módulos de negocio. Las flechas de dependencia van de los módulos de negocio hacia el núcleo, nunca entre módulos de negocio.

**en el diagrama de base de datos**
Todas las tablas principales muestran la columna `unidad_id` con su FK a la tabla `unidades`. El diagrama tiene una nota que explica el modelo de multi-tenancy por columna.

**en el documento de incorporación de nuevas unidades**
Existe un documento (`ONBOARDING_UNIDAD.md` en el repositorio) que describe el proceso paso a paso para agregar una nueva facultad al sistema: qué registros crear, qué configuraciones definir, cómo crear los usuarios iniciales. Ese proceso no debe requerir cambios de código.

**en el contrato de API de módulos**
Existe una convención documentada sobre qué debe implementar un módulo nuevo para integrarse con el núcleo compartido: qué métodos de `AuditService` debe llamar, cómo debe usar `StorageModule` para archivos, cómo registra sus endpoints en la especificación OpenAPI.
