# RNF_09 — Rendimiento en consultas, búsqueda y agente de IA

## por qué existe este requisito en este sistema

El rendimiento en este sistema no es un objetivo de lujo. Está directamente ligado a la adopción del sistema por parte del usuario principal (la secretaría) y al valor percibido del agente de IA.

Si abrir la lista de contratos de un proyecto tarda 5 segundos, la secretaría prefiere seguir con su Excel. Si el agente de IA responde preguntas sobre expedientes en 8-10 segundos sin indicar progreso, el usuario lo cerrará antes de recibir la respuesta. Si el dashboard de estado de proyectos tarda en cargar, el director dejará de consultarlo.

El rendimiento necesario no es el de una red social con millones de usuarios concurrentes. Es el de una aplicación interna con un máximo de 50-100 usuarios concurrentes, la mayoría en horario laboral. Los datos del sistema son relativamente pequeños: probablemente no más de 10,000 contratos, 50,000 documentos, y 5,000 participantes en el horizonte de 5 años. No se necesita infraestructura de alta escala, pero sí un diseño que no sea descuidado.

Hay tres áreas de rendimiento críticas para este sistema:

1. **Consultas relacionales**: listas de contratos, expedientes, estados, filtros por proyecto o participante.
2. **Búsqueda semántica con pgvector**: el agente de IA hace búsquedas vectoriales para responder preguntas sobre documentos y expedientes.
3. **Respuesta del agente de IA**: el tiempo desde que el usuario hace una pregunta hasta que ve la primera parte de la respuesta.

---

## descripción del requisito

El sistema debe responder a las operaciones más frecuentes dentro de umbrales de tiempo que hagan la experiencia de uso fluida y sin interrupciones perceptibles.

**umbrales de rendimiento objetivo:**

| operación | umbral p95 | contexto |
|---|---|---|
| cargar lista de contratos con filtros | < 800ms | hasta 1,000 contratos en la unidad |
| cargar detalle de un expediente completo | < 600ms | incluye contrato, participante, documentos, historial |
| búsqueda de texto en contratos/participantes | < 500ms | búsqueda por nombre, folio o RFC |
| búsqueda semántica con pgvector | < 1,200ms | sobre hasta 100,000 fragmentos vectorizados |
| primer token del agente de IA (con streaming) | < 2,500ms | desde enviar pregunta hasta ver primera respuesta |
| cargar dashboard ejecutivo | < 1,000ms | agregados de todos los proyectos activos |
| carga inicial de la aplicación (First Contentful Paint) | < 2,000ms | en conexión institucional normal |

p95 significa que el 95% de las peticiones debe cumplir ese tiempo. El 5% restante puede tardar más, pero no de forma regular.

---

## cómo se mide este requisito

**medición en desarrollo**
Se usan las herramientas de red del navegador para medir los tiempos de respuesta de las consultas más frecuentes durante el desarrollo. Las consultas SQL lentas se identifican con `EXPLAIN ANALYZE` en PostgreSQL.

**medición en producción**
El backend de NestJS tiene un middleware de logging de tiempos de respuesta que registra la duración de cada petición. Las peticiones que superan los umbrales definidos se marcan como "lentas" en el log y generan una alerta si ocurren más de 10 veces en una hora.

**prueba de carga antes de producción**
Antes del despliegue inicial, se ejecuta una prueba de carga básica con k6 o Artillery que simula 20 usuarios concurrentes realizando las operaciones más frecuentes durante 5 minutos. Los resultados deben mostrar que los umbrales de rendimiento se cumplen bajo carga.

---

## cómo se traduce en el sistema

### en la base de datos (PostgreSQL + Prisma)

**índices en campos de búsqueda frecuente**

Se crean índices en todos los campos que aparecen en cláusulas `WHERE` o `ORDER BY` de las consultas más frecuentes del sistema:

```sql
-- índices en la tabla contratos
CREATE INDEX idx_contratos_proyecto_id ON contratos(proyecto_id);
CREATE INDEX idx_contratos_estado ON contratos(estado);
CREATE INDEX idx_contratos_folio ON contratos(folio);
CREATE INDEX idx_contratos_unidad_id ON contratos(unidad_id);
CREATE INDEX idx_contratos_participante_id ON contratos(participante_id);

-- índices en la tabla participantes
CREATE INDEX idx_participantes_nombre_trgm ON participantes USING gin(nombre gin_trgm_ops);
CREATE INDEX idx_participantes_unidad_id ON participantes(unidad_id);

-- índice compuesto para el caso más frecuente
CREATE INDEX idx_contratos_unidad_estado ON contratos(unidad_id, estado);
```

El índice de trigrama (`gin_trgm_ops`) sobre nombres de participantes habilita búsqueda de texto parcial eficiente sin necesidad de `LIKE '%texto%'` que no usa índices convencionales.

**índice HNSW para pgvector**

Para la búsqueda semántica, se crea un índice de tipo HNSW (Hierarchical Navigable Small World) sobre la columna de vectores en la tabla de embeddings. Este tipo de índice es el más eficiente de pgvector para búsquedas de similitud en colecciones de más de 10,000 vectores:

```sql
CREATE INDEX idx_embeddings_vector ON document_embeddings 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

**consultas eficientes en Prisma**

Las consultas del sistema usan `select` explícito en Prisma para traer solo los campos necesarios, en lugar de traer todos los campos de una entidad. Esto reduce el volumen de datos transferidos entre base de datos y aplicación.

```typescript
// en lugar de this.prisma.contrato.findMany()
// que trae todos los campos incluyendo los poco usados

const contratos = await this.prisma.contrato.findMany({
  where: { unidadId, estado },
  select: {
    id: true,
    folio: true,
    estado: true,
    fechaCreacion: true,
    participante: {
      select: { id: true, nombre: true }
    }
  },
  orderBy: { fechaCreacion: 'desc' },
  take: 50,
  skip: offset,
});
```

### en el backend (NestJS)

**paginación obligatoria en listas**

Ningún endpoint que retorna listas retorna todos los registros sin límite. Todos los endpoints de listas reciben parámetros de paginación (`page`, `limit`) y la respuesta incluye el total de registros para que el frontend pueda mostrar controles de paginación.

**caché en memoria para datos de referencia**

Los datos que cambian poco y se consultan frecuentemente (lista de proyectos activos, configuración de unidad, lista de tipos de documento) se almacenan en caché en memoria del proceso NestJS usando `@nestjs/cache-manager`. El caché se invalida cuando esos datos son modificados.

**streaming de respuestas del agente**

El agente de IA usa streaming de tokens para enviar la respuesta al frontend progresivamente. Esto significa que el usuario ve texto aparecer casi inmediatamente (en los primeros 2-3 segundos), aunque la respuesta completa tarde más. La percepción del usuario es de una respuesta rápida incluso si la latencia total es mayor.

### en el frontend (Next.js)

**TanStack Query como caché del cliente**

TanStack Query almacena en caché las respuestas del API en el cliente. Si la secretaría abre el expediente del participante X, navega a otra pantalla, y vuelve al expediente de X, los datos se muestran instantáneamente desde el caché mientras se verifica en segundo plano si hay cambios. Esto hace la experiencia de navegación subjetivamente muy rápida.

**carga diferida de secciones secundarias**

La vista de detalle de un expediente carga primero los datos principales (estado del contrato, participante, documentos pendientes) y luego carga en segundo plano las secciones menos críticas (historial completo de eventos, notas). El usuario puede empezar a trabajar con el expediente antes de que todo haya cargado.

**virtualización de listas largas**

Si una lista tiene más de 100 elementos visibles simultáneamente, se usa un componente de virtualización de lista (como `@tanstack/react-virtual`) que solo renderiza los elementos visibles en pantalla. Esto previene la degradación del rendimiento del DOM cuando hay muchos registros.

---

## cómo se evidencia que se cumple

- Al abrir la lista de contratos de un proyecto con 500 contratos, la tabla se muestra completamente en menos de 800ms medidos en las herramientas de red del navegador.
- Al hacer una búsqueda de participante por nombre parcial ("Garc" para encontrar "García"), los resultados aparecen en menos de 500ms.
- Al enviar una pregunta al agente de IA ("¿qué documentos le faltan a los participantes del proyecto X?"), el primer token de respuesta aparece en pantalla en menos de 2.5 segundos.
- La prueba de carga con 20 usuarios concurrentes muestra que los umbrales de rendimiento se cumplen y no hay errores de timeout durante los 5 minutos de prueba.
- Al ejecutar `EXPLAIN ANALYZE` sobre las consultas más frecuentes en PostgreSQL, el plan de ejecución muestra que se usan los índices definidos (no hay "Sequential Scan" en tablas con más de 1,000 registros).
- El log de peticiones lentas (que superan el umbral) tiene menos de 1% del total de peticiones marcadas como lentas durante una semana de operación normal.

---

## cómo se representa en el diseño

**en el esquema de base de datos**
Los índices están definidos explícitamente en el schema de Prisma (con `@@index`) y aparecen en el diagrama de base de datos junto a las tablas. No son una decisión de último momento sino parte del diseño desde el inicio.

**en la especificación del API**
Todos los endpoints de listas en la especificación OpenAPI documentan los parámetros de paginación como requeridos y los límites máximos permitidos. Ningún endpoint puede retornar más de 200 registros en una sola llamada sin paginación explícita.

**en la arquitectura del agente de IA**
El diagrama de arquitectura del agente muestra explícitamente el flujo de streaming: desde el LLM hasta el frontend. Se documenta que el streaming es obligatorio, no opcional, precisamente por el impacto en la experiencia del usuario.

**en el plan de pruebas**
El plan de pruebas incluye una sección de pruebas de rendimiento con los casos específicos a medir, los umbrales objetivo, y las herramientas a usar (k6, Artillery, herramientas de red del navegador, `EXPLAIN ANALYZE`).
