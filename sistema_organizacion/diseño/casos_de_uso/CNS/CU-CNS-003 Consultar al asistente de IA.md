---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/consulta
  - tema/ia
fecha: 2026-07-08
id: CU-CNS-003
modulo: Consulta
actor_principal: Secretaría
requisitos_relacionados:
  - RF_13
  - RNF_02
dependencias:
  - CU-EXP-002
  - CU-CNS-001
---

# CU-CNS-003 Consultar al asistente de IA

## Descripción

El asistente de IA responde en lenguaje natural sobre el estado real del sistema —qué falta, en
qué estado está algo, qué pasó antes, qué sigue— y ayuda a redactar correos o resúmenes con
contexto del expediente. Consulta solo lo que el usuario tiene permiso de ver, no inventa datos
y **propone** acciones sin ejecutarlas: el patrón de siempre, el sistema propone y la persona
decide.

## Actores

- **Actor principal:** Secretaría · Director *(también Administrador)*
- **Actores secundarios:** Sistema/IA (tools internas de consulta, control de permisos)

## Precondiciones

- El usuario inició sesión y tiene permiso para usar el asistente (RNF_02).
- Existen datos y documentos indexados para consulta cuando aplique (pgvector).

## Disparador

El usuario abre el panel del asistente y escribe una pregunta.

## Flujo principal

1. El usuario abre el panel y escribe una pregunta en lenguaje natural.
2. El asistente interpreta la intención.
3. Consulta las tools internas necesarias, respetando los permisos del usuario [RN-CNS-07].
4. Recupera datos estructurados (PostgreSQL) o fragmentos documentales (pgvector).
5. Construye y presenta la respuesta con streaming y enlaza al expediente, contrato o documento relacionado.
6. Si aplica, ofrece un borrador de correo o resumen que el usuario revisa antes de usar [RN-CNS-08]. El caso de uso termina.

## Flujos alternativos

### A1. Consulta ambigua

1. La pregunta no tiene contexto suficiente.
2. El asistente solicita una aclaración concreta antes de responder.

### A2. Consulta sobre información no autorizada

1. El usuario pide datos fuera de su alcance.
2. El asistente no los expone y responde respetando permisos [RN-CNS-07].

### A3. Pregunta sobre el contenido de un documento

1. El usuario pregunta por el contenido de un contrato o archivo.
2. El asistente busca en los documentos indexados y responde citando el origen interno.

## Excepciones

### E1. Acción no autorizada propuesta

1. El asistente sugiere una acción del flujo operativo (p. ej. enviar un correo o cambiar un estado).
2. El asistente la **propone** pero no la ejecuta: las acciones formales siguen requiriendo la confirmación del usuario [RN-CNS-06].

## Postcondiciones

- **Éxito:** el usuario obtiene una respuesta útil y contextual, o un borrador listo para revisar.
- **Fallo:** ante datos fuera de alcance o contexto insuficiente, el asistente no responde con información indebida.

## Reglas de negocio relacionadas

- **RN-CNS-06** (RF_13): el asistente propone; no sustituye las reglas del flujo formal ni ejecuta acciones no autorizadas, y no inventa estados ni datos.
- **RN-CNS-07** (RF_13 / RNF_02): el asistente solo consulta información permitida para el usuario autenticado.
- **RN-CNS-08** (RF_13): los correos o resúmenes que redacta el asistente los revisa el usuario antes de usarlos.
