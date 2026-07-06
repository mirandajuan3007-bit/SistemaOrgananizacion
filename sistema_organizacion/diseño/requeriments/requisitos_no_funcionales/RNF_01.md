# RNF_01 — Auditabilidad y trazabilidad de operaciones

## por qué existe este requisito en este sistema

El cliente describió con claridad que el problema central no es que los documentos no existan, sino que nadie sabe qué pasó con ellos: quién mandó qué, cuándo llegó, quién lo revisó, qué observación se hizo, quién lo rechazó, y en qué momento cambió el estado de un contrato. Todo eso hoy vive disperso entre correos, comentarios en Word y memoria de las personas.

Cuando llega una auditoría a la facultad, no hay forma de reconstruir el historial de un expediente sin revisar manualmente todos los correos de meses anteriores. Cuando hay un error en un pago, no hay forma de saber en qué punto del proceso ocurrió. Cuando hay un reclamo de un investigador sobre su contrato, no hay evidencia de cuándo se solicitó cada documento. Eso vuelve frágil la operación y hace muy difícil demostrar qué pasó realmente en cada caso.

La trazabilidad no es una característica de calidad abstracta en este sistema. Es la solución directa a uno de los problemas principales del cliente.

---

## descripción del requisito

Toda operación que modifique datos o estados relevantes del sistema debe quedar registrada de forma permanente, íntegra e inmutable. El objetivo de este requisito no es ofrecer una pantalla al usuario, sino garantizar que el sistema conserve evidencia confiable de lo que ocurrió en sus procesos críticos.

Cada registro de auditoría debe contener como mínimo:

- quién realizó la acción
- cuándo ocurrió
- qué entidad fue afectada
- qué tipo de acción se realizó
- cuál era el estado anterior relevante
- cuál es el estado nuevo relevante
- desde qué origen se produjo la acción cuando aplique

Las entidades que requieren trazabilidad completa son:

- contratos: cada cambio de estado (borrador, enviado, en revisión, observado, firmado, vigente, cerrado)
- documentos: cada carga, actualización, rechazo y aprobación
- participantes: cada modificación a sus datos o su estado dentro de un proyecto
- proyectos: apertura, cambios de etapa, cierre presupuestal
- pagos: cada registro de factura, complemento de pago y cheque
- expedientes: cualquier acción que altere el expediente completo

Las operaciones de solo lectura (consultas) no necesitan ser registradas en el log de auditoría principal, pero sí deben registrarse los accesos a datos sensibles como RFC, CURP y datos bancarios.

---

## cómo se mide este requisito

El cumplimiento del requisito se mide de las siguientes formas:

**cobertura del log de auditoría**
El 100% de las operaciones de escritura (insert, update, delete) sobre las entidades listadas debe generar un registro en la tabla `audit_log`. Esto se verifica revisando que el interceptor de auditoría en NestJS está activo para todos los endpoints de escritura relevantes.

**consistencia del log**
Dada cualquier entidad crítica del sistema, debe ser posible reconstruir la secuencia de cambios relevante leyendo el registro de auditoría sin depender de fuentes externas como correos o archivos manuales.

**inmutabilidad**
Los registros de auditoría no pueden ser eliminados ni modificados por ningún usuario, incluido el administrador del sistema. Esto se verifica con la ausencia de endpoints DELETE o UPDATE sobre la tabla `audit_log`.

**granularidad de tiempo**
Cada registro debe tener un timestamp en UTC con precisión de milisegundos. Esto permite ordenar eventos sin ambigüedad incluso dentro del mismo segundo.

---

## cómo se traduce en el sistema

### en la base de datos (PostgreSQL + Prisma)

Se crea una tabla `audit_log` con las siguientes columnas:

```
id          UUID        primary key, generado automáticamente
entity_type TEXT        nombre de la entidad (Contrato, Documento, Participante...)
entity_id   UUID        id del registro afectado
action      TEXT        tipo de acción (CREATED, UPDATED, STATE_CHANGED, DELETED)
user_id     UUID        id del usuario que realizó la acción (nullable para acciones de sistema)
source      TEXT        origen de la acción (WEB, AI_AGENT, N8N_FLOW, SYSTEM)
previous    JSONB       estado anterior del campo o campos relevantes
next        JSONB       estado nuevo del campo o campos relevantes
metadata    JSONB       contexto adicional (ip de origen, nombre del flujo de n8n, etc.)
created_at  TIMESTAMPTZ timestamp en UTC, generado automáticamente
```

La tabla `audit_log` no tiene operaciones de modificación ni eliminación disponibles para usuarios de negocio. Su diseño existe para preservar evidencia, no para ser editada manualmente.

### en el backend (NestJS)

Se implementa un `AuditInterceptor` a nivel global que intercepta todas las respuestas exitosas de los endpoints de escritura. El interceptor lee el usuario autenticado del request, el tipo de entidad afectada, el ID del registro, y genera el entry correspondiente en `audit_log` de forma asíncrona para no bloquear la respuesta al cliente.

Para las transiciones de estado (especialmente en contratos), se implementa un servicio `AuditService` que los servicios de negocio llaman explícitamente cuando registran un cambio de estado. Esto garantiza que los campos `previous` y `next` del log contengan información útil y no solo un diff genérico.

```typescript
// ejemplo conceptual de llamada al servicio de auditoría
await this.auditService.log({
  entityType: 'Contrato',
  entityId: contrato.id,
  action: 'STATE_CHANGED',
  userId: currentUser.id,
  source: 'WEB',
  previous: { estado: 'enviado' },
  next: { estado: 'observado', observacion: 'Falta CURP actualizado' },
});
```

nota: (para evitar confusion) de lo que hablamos de base de datos no es una descripcion pura del requisito si no que componentes que nos ayudan en el diseño tecnico de la representacion del requisito en el sistema.
---

## cómo se evidencia que se cumple

- Al rechazar un documento por observación, el log registra el estado anterior (en revisión), el estado nuevo (observado), el texto de la observación, el usuario que rechazó y el timestamp.
- Si un flujo de n8n cambia el estado de un contrato automáticamente (por ejemplo, al detectar inactividad de 72 horas), el log registra `source: N8N_FLOW` con el nombre del flujo que lo disparó.
- No existe ninguna operación de negocio que permita eliminar o modificar registros de `audit_log` una vez creados.
- Al revisar el historial interno de cambios de una entidad crítica, la secuencia registrada coincide con las acciones efectivamente realizadas en el sistema.

---

## cómo se representa en el diseño

**en el esquema de base de datos**
La tabla `audit_log` aparece en el diagrama entidad-relación con relaciones de referencia (no FK dura) hacia las entidades principales. No tiene FK forzada porque los registros de log deben persistir incluso si la entidad original fuera borrada (soft delete).

**en la arquitectura de NestJS**
El módulo `audit` es un módulo compartido (shared module) que puede ser importado por cualquier módulo de negocio. El `AuditInterceptor` se registra en el `AppModule` como interceptor global.

**en los flujos de n8n**
Cada flujo de automatización que modifica datos del sistema incluye un nodo final que llama al endpoint de auditoría del backend para registrar que fue n8n quien realizó la acción y qué flujo fue.

**en los criterios de calidad**
Este requisito debe tratarse como una capacidad transversal obligatoria del sistema. No depende de un módulo específico, porque aplica por igual a contratos, documentos, participantes, pagos y expedientes.

