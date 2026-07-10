---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/consulta
  - tema/auditoria
fecha: 2026-07-08
id: CU-CNS-002
modulo: Consulta
actor_principal: Secretaría
requisitos_relacionados:
  - RF_14
  - RNF_01
  - RNF_02
dependencias:
  - CU-CTR-001
  - CU-EXP-002
---

# CU-CNS-002 Consultar historial de cambios

## Descripción

Desde la pantalla de detalle de un contrato, expediente, documento o pago, el usuario consulta
la secuencia de cambios de esa entidad —qué cambió, cuándo, quién y desde qué estado— sin tener
que reconstruirla desde correos y memoria. Se apoya en el `audit_log` (RNF_01) pero se presenta
como una función de lectura para el usuario.

## Actores

- **Actor principal:** Secretaría · Administrador
- **Actores secundarios:** Director *(con alcance acotado a las entidades que puede ver)*

## Precondiciones

- Existe la entidad sobre la cual se consulta el historial.
- El usuario tiene permiso para consultar esa entidad y su historial (RNF_02).
- Existen registros de auditoría generados por la operación previa.

## Disparador

El usuario abre la sección de historial en el detalle de una entidad.

## Flujo principal

1. El usuario abre el detalle de una entidad (contrato, expediente, documento o pago).
2. Entra a la sección de historial.
3. El sistema consulta los eventos de esa entidad en el `audit_log` (por `entity_type` y `entity_id`).
4. Muestra la línea de tiempo cronológica: fecha, usuario u origen (`WEB`/`AI_AGENT`/`N8N_FLOW`/`SYSTEM`), tipo de cambio, estado anterior → nuevo y contexto [RN-CNS-03].
5. El usuario revisa los cambios sin poder modificar los registros [RN-CNS-04]. El caso de uso termina.

## Flujos alternativos

### A1. Historial sin eventos visibles

1. La entidad aún no tiene cambios más allá de su creación.
2. El sistema muestra el mensaje correspondiente, sin error.

### A2. Historial extenso

1. La entidad acumuló muchos eventos.
2. El sistema pagina o agrupa el historial para mantenerlo legible.

### A3. El Director consulta el historial

1. El Director abre el historial de una entidad dentro de su acceso (contrato, proyecto, cierre).
2. El sistema lo muestra acotado: no expone el `audit_log` global ni datos bancarios [RN-CNS-05].

## Excepciones

### E1. Acceso sin permisos suficientes

1. Un usuario intenta abrir el historial de una entidad fuera de su alcance.
2. El sistema bloquea la consulta o restringe el detalle según la política de acceso [RN-CNS-05].

## Postcondiciones

- **Éxito:** el usuario entiende la secuencia de cambios de la entidad desde su creación.
- **Fallo:** el acceso se restringe según permisos, sin exponer información sensible.

## Reglas de negocio relacionadas

- **RN-CNS-03** (RF_14 / RNF_01): el historial se apoya en el `audit_log` y muestra el origen de cada acción y la transición de estado cuando la hubo.
- **RN-CNS-04** (RF_14): la consulta del historial es de solo lectura; no permite modificar los registros mostrados.
- **RN-CNS-05** (RNF_02): el Director consulta el historial acotado a las entidades que puede leer; el `audit_log` global es de Secretaría/Admin y no incluye datos bancarios.
