---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/expediente
  - tema/documento
  - tema/correo
fecha: 2026-07-08
id: CU-EXP-005
modulo: Participantes y Expediente
actor_principal: Secretaría
requisitos_relacionados:
  - RF_15
  - RNF_11
dependencias:
  - CU-EXP-003
  - CU-EXP-004
  - CU-CTR-004
---

# CU-EXP-005 Recibir y clasificar documento externo

## Descripción

Los documentos del expediente los envían participantes **externos** que usan su correo personal
(Gmail/Hotmail) y no van a aprender un sistema nuevo. En la fase 1 (MVP), el correo sigue siendo
el canal: n8n asocia el correo entrante al expediente y **propone** la clasificación de cada
adjunto; la Secretaría **confirma o corrige**. Es el patrón central del sistema aplicado a la
recepción: el sistema propone, la persona confirma.

## Actores

- **Actor principal:** Secretaría (confirma la clasificación)
- **Actores secundarios:** Sistema/n8n (asocia el correo con M4, propone clasificación), Participante externo (envía documentos por correo)

## Precondiciones

- Existe un expediente con requisitos documentales definidos (CU-EXP-003).
- El correo institucional está conectado vía Microsoft Graph (RNF_11, M4).

## Disparador

Llega a la Secretaría un correo del participante con adjuntos.

## Flujo principal

1. La Secretaría solicita documentos al participante (correo preparado por el sistema, M5).
2. El participante responde desde su correo personal con los adjuntos.
3. n8n asocia el correo al expediente por el folio en el asunto o por remitente conocido [RN-EXP-11].
4. El sistema notifica "Correo de [participante] con N adjuntos" y propone la clasificación de cada adjunto.
5. La Secretaría abre el modal de clasificación, revisa la propuesta y confirma o corrige [RN-EXP-12] **(M5)**.
6. Cada adjunto confirmado se registra como documento `RECIBIDO` (CU-EXP-004) y el checklist se actualiza. El caso de uso termina.

## Flujos alternativos

### A1. Correo sin asociación reconocible

1. El correo no trae folio ni remitente conocido.
2. Queda en la bandeja "sin asociar" para vinculación manual (mismo criterio que CU-CTR-004) [RN-EXP-11].

## Excepciones

### E1. Clasificación automática sin confirmación

1. Un flujo intenta clasificar y registrar los adjuntos sin la confirmación de la Secretaría.
2. El sistema lo impide: en fase 1 la clasificación siempre pasa por confirmación humana [RN-EXP-12].

## Postcondiciones

- **Éxito:** los adjuntos quedan clasificados y registrados como `RECIBIDO`; el checklist se actualiza.
- **Fallo:** el correo queda sin asociar o los adjuntos sin clasificar, disponibles para acción manual.

## Reglas de negocio relacionadas

- **RN-EXP-11** (RF_15 / RF_08): la asociación se hace por folio o remitente; un correo no asociable no se pierde, queda para vinculación manual.
- **RN-EXP-12** (RF_15 / RNF_11, M5): el sistema propone la clasificación; la Secretaría la confirma — nunca es automática en fase 1.
- **RN-EXP-13** (RF_15): ningún participante externo necesita cuenta, contraseña ni correo institucional.
