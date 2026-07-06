# RNF_04 — Integridad y consistencia de datos

## por qué existe este requisito en este sistema

El sistema opera sobre dos fuentes de verdad que deben mantenerse sincronizadas: la base de datos PostgreSQL (que contiene estados, metadatos, historial, y relaciones entre entidades) y SharePoint/OneDrive de Microsoft (que contiene los archivos físicos: contratos, facturas, evidencias, complementos de pago).

Si un participante aparece como "documentación completa" en el sistema pero el archivo de su contrato no existe en SharePoint, hay una inconsistencia. Si un contrato está en estado "firmado" en la base de datos pero el estado en la tabla de proyectos dice que el proyecto no ha iniciado, hay una contradicción. Si el sistema registra que se subió una factura con importe X pero el archivo real tiene importe Y, hay una falsedad en el registro.

Estos problemas ya ocurren hoy con el sistema informal. El cliente describió que a veces los proyectos "se pierden", que no saben en qué estado está un contrato, y que hay información fragmentada. Si el sistema nuevo reproduce esos mismos problemas, no resuelve nada, solo los digitaliza.

La integridad de datos es lo que garantiza que cuando la secretaría abre el expediente de un participante, lo que ve es verdadero, completo, y coherente con lo que existe en los archivos reales.


---

## descripción del requisito

El sistema debe garantizar que los datos almacenados son correctos, completos, y coherentes en todo momento:

**integridad estructural**: las relaciones entre entidades son válidas. No puede existir un contrato sin proyecto asociado. No puede existir un pago sin participante y sin contrato. No puede existir un documento sin la referencia al archivo en SharePoint.

**integridad de estado**: los estados de las entidades siguen transiciones válidas definidas por las reglas del negocio. Un contrato no puede pasar de "borrador" directamente a "firmado" sin pasar por "enviado" y "en revisión". Un pago no puede registrarse si el contrato no está en estado "vigente".

**integridad de archivo**: cuando el sistema registra que un documento existe, el archivo físico en SharePoint debe existir y ser el mismo que se registró (mismo contenido, no reemplazado sin trazabilidad).

**consistencia transaccional**: cuando una operación modifica múltiples entidades relacionadas (por ejemplo, registrar un pago que actualiza el estado del contrato y crea un evento en el historial), todas esas modificaciones ocurren o ninguna ocurre. No puede quedar la operación a medias.

es la forma de garantizar que los datos que estan en el sistema esten comeltos y sean los correctos, esto es importante a la hora de presentar los archvos en el sistema.

---

## cómo se mide este requisito

**cero registros huérfanos**
Una consulta que busca contratos sin proyecto asociado, participantes sin contrato en proyectos activos, o documentos sin referencia de archivo en SharePoint debe retornar cero resultados. Esto se verifica mensualmente con un script de validación de consistencia.

**cero transiciones de estado inválidas**
El log de auditoría no debe contener ningún registro donde una entidad saltó a un estado sin haber pasado por los estados previos requeridos. Esto se verifica revisando que todas las transiciones en `audit_log` siguen el grafo de estados definido.

**checksums de documentos**
Al momento de registrar un documento, el sistema guarda el hash SHA-256 del archivo. Una verificación periódica compara ese hash con el hash actual del archivo en SharePoint. Si hay diferencia, se genera una alerta de integridad.

**cobertura de transacciones**
Las operaciones de negocio que modifican más de una entidad están implementadas dentro de una transacción de base de datos. Se verifica revisando que en el código de los servicios de NestJS, las operaciones multi-entidad usan `prisma.$transaction()`.

---

## cómo se traduce en el sistema

### en la base de datos (PostgreSQL + Prisma)

**foreign keys con restricciones**
Todas las relaciones entre tablas usan foreign keys con restricciones de integridad referencial. Por ejemplo, la tabla `contratos` tiene una columna `proyecto_id` con FK a la tabla `proyectos`, con la restricción `ON DELETE RESTRICT` (no se puede eliminar un proyecto si tiene contratos asociados).

**soft delete en lugar de hard delete**
Las entidades del sistema nunca se eliminan físicamente de la base de datos. En su lugar, tienen un campo `deleted_at` que se rellena con el timestamp de cuando fue "eliminado". Las consultas normales filtran los registros con `deleted_at IS NOT NULL`. Esto preserva la integridad referencial y el historial de auditoría.

**validación de estado en la base de datos**
Las columnas de estado usan tipos enumerados de PostgreSQL (`ENUM`) con los valores válidos definidos. Intentar insertar un valor de estado que no existe en el enum genera un error a nivel de base de datos, no solo a nivel de aplicación.

**transacciones para operaciones multi-entidad**
Cualquier operación que modifica más de una tabla se ejecuta dentro de una transacción de Prisma:

```typescript
// ejemplo conceptual de transacción en NestJS/Prisma
await this.prisma.$transaction(async (tx) => {
  const pago = await tx.pago.create({ data: pagoData });
  await tx.contrato.update({
    where: { id: contratoId },
    data: { estado: EstadoContrato.PAGO_REGISTRADO },
  });
  await tx.auditLog.create({ data: auditEntry });
});
// si cualquiera de las tres falla, ninguna se aplica
```

### en la lógica de negocio (NestJS)

**máquina de estados para contratos**
El módulo de contratos implementa una máquina de estados explícita que define cuáles transiciones son válidas:

```
borrador → enviado → en_revision → (observado | aprobado)
observado → enviado (luego de corrección)
aprobado → firmado → vigente → cerrado
```

Intentar hacer una transición inválida desde el servicio lanza una excepción de negocio antes de llegar a la base de datos.

**hash de documentos al registrar**
Cuando se registra un documento en el sistema (su referencia, no el archivo en sí), el servicio descarga temporalmente el archivo desde SharePoint, calcula su hash SHA-256, y lo guarda junto a la referencia. Esto crea una firma de integridad del archivo en el momento del registro.

### en la integración con SharePoint (Graph API)

Cuando el sistema necesita mostrar un documento al usuario, primero verifica que el archivo aún existe en SharePoint usando el `driveItem.id` almacenado. Si el archivo fue eliminado o movido en SharePoint de forma externa (fuera del sistema), el sistema lo detecta y marca el documento como "referencia rota" en lugar de mostrar un error genérico.

---

## cómo se evidencia que se cumple

- Al intentar registrar un pago sobre un contrato que no está en estado "vigente", el sistema rechaza la operación con un mensaje de error claro que explica por qué no es posible. El pago no se crea.
- Al ejecutar el script de validación de consistencia, retorna cero registros con referencias rotas, cero registros huérfanos, y cero transiciones inválidas.
- Al simular un error de red en mitad de una operación que actualiza contrato + genera evento de auditoría + actualiza estado del participante, el sistema revierte todas las modificaciones y la base de datos queda en su estado anterior.
- Al verificar los hashes de documentos almacenados contra los archivos en SharePoint, todos coinciden para los documentos que no han sido modificados fuera del sistema.
- Al buscar proyectos sin contratos, participantes sin expediente, o documentos sin archivo referenciado, los resultados de esas consultas de validación son vacíos.

---

## cómo se representa en el diseño

**en el diagrama entidad-relación**
Todas las FK están marcadas con su tipo de restricción (`RESTRICT`, `CASCADE`, `SET NULL`). Los campos `deleted_at` aparecen en todas las entidades principales. Los campos `estado` están anotados con el tipo enum correspondiente.

**en el diagrama de estados**
Existe un diagrama de máquina de estados para la entidad `Contrato` (y eventualmente para `Proyecto` y `Pago`) que muestra todos los estados posibles y cuáles transiciones son válidas entre ellos. Ese diagrama es la fuente de verdad para implementar la lógica de validación en el servicio.

**en el esquema de Prisma**
Las relaciones en el schema de Prisma tienen anotadas las políticas de eliminación y actualización. El campo `hash_sha256` aparece en la tabla de documentos junto a `sharepoint_item_id` y `sharepoint_drive_id`.

**en los tests**
Los tests de integración del backend incluyen casos que verifican que las transiciones inválidas de estado son rechazadas, y que las transacciones fallidas no dejan datos a medias.
