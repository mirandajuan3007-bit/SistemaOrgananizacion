---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/expediente
  - tema/documento
fecha: 2026-07-08
id: CU-EXP-003
modulo: Participantes y Expediente
actor_principal: Secretaría
requisitos_relacionados:
  - RF_04
dependencias:
  - CU-EXP-001
  - CU-EXP-004
---

# CU-EXP-003 Definir documentos requeridos

## Descripción

El sistema convierte la exigencia documental —hoy dispersa en correos y listas informales— en
un checklist explícito por expediente. Al definir qué documentos son obligatorios según el tipo
de participante o de trámite, el sistema puede decir en todo momento qué falta y decidir si
alguien está listo para contrato o pago.

## Actores

- **Actor principal:** Secretaría (o Administrador funcional)
- **Actores secundarios:** Sistema/n8n (recalcula la completitud del expediente)

## Precondiciones

- Existe un participante asociado a un proyecto (CU-EXP-001).
- Existen tipos de documento definidos en el catálogo del sistema.

## Disparador

Se configura el checklist documental del expediente (según su tipo de participación).

## Flujo principal

1. La Secretaría define o selecciona los tipos de documento requeridos para el flujo.
2. El sistema los asocia al expediente según el tipo de participación [RN-EXP-06].
3. El expediente muestra la lista de requisitos, cada uno en estado `PENDIENTE`.
4. Conforme llegan documentos, cada requisito cambia de estado (CU-EXP-004).
5. El sistema recalcula automáticamente si el expediente está `COMPLETO` o `INCOMPLETO` [RN-EXP-07]. El caso de uso termina.

## Flujos alternativos

### A1. Documento condicional

1. Se configura un documento que solo aplica en ciertos casos.
2. El sistema lo solicita únicamente cuando la condición se cumple.

### A2. Cambio en la política documental

1. La operación cambia qué documentos se exigen y se actualiza el catálogo.
2. El sistema aplica la nueva regla a expedientes nuevos y, si se decide, a los abiertos.

### A3. Exención de un requisito

1. La Secretaría marca un requisito como `EXCEPTUADO` para un caso concreto.
2. El sistema registra quién autorizó la excepción y por qué [RN-EXP-08].

## Excepciones

### E1. Marcar completo con obligatorios pendientes

1. Se intenta marcar el expediente como completo mientras conserva requisitos obligatorios sin cubrir.
2. El sistema lo impide [RN-EXP-07].

## Postcondiciones

- **Éxito:** el expediente tiene un checklist documental con estados y una completitud calculada automáticamente.
- **Fallo:** no se aplica la definición; el checklist permanece como estaba.

## Reglas de negocio relacionadas

- **RN-EXP-06** (RF_04): los documentos requeridos dependen del tipo de participante o del flujo; los catálogos son reutilizables entre expedientes similares.
- **RN-EXP-07** (RF_04): un expediente no puede quedar `COMPLETO` si conserva requisitos obligatorios fuera de `APROBADO`/`EXCEPTUADO`.
- **RN-EXP-08** (RF_04): toda excepción documental queda justificada y auditada (quién y por qué).
