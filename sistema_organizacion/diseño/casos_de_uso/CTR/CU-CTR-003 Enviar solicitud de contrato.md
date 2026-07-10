---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/contratos
  - tema/contrato
  - tema/correo
fecha: 2026-07-08
id: CU-CTR-003
modulo: Contratos
actor_principal: Secretaría
requisitos_relacionados:
  - RF_06
  - RF_08
  - RNF_11
dependencias:
  - CU-CTR-001
  - CU-CTR-002
  - CU-CTR-004
---

# CU-CTR-003 Enviar solicitud de contrato

## Descripción

La Secretaría envía al revisor jurídico la solicitud de revisión del contrato. El sistema
**prepara** el correo con el folio del trámite y los adjuntos, pero el envío **siempre lo
confirma un humano** (M5): ni la IA ni n8n envían correo oficial por su cuenta. Así el patrón
central del sistema —el sistema propone, la persona confirma— se respeta también aquí.

## Actores

- **Actor principal:** Secretaría
- **Actores secundarios:** Sistema/n8n (prepara el borrador, asigna/reutiliza el folio, registra el evento de comunicación), Revisor jurídico (destinatario)

## Precondiciones

- El contrato está en `BORRADOR` (primer envío) o en `OBSERVADO` (reenvío con corrección).
- El contrato tiene los adjuntos mínimos y un folio de trámite (RF_08).

## Disparador

La Secretaría pulsa "Enviar solicitud" en el contrato.

## Flujo principal

1. Con el contrato en `BORRADOR` u `OBSERVADO`, la Secretaría elige enviar la solicitud.
2. El sistema prepara el borrador de correo al jurídico con el folio del trámite (RF_08) y los adjuntos [RN-CTR-08].
3. El sistema muestra el borrador para revisión; **no lo envía automáticamente** [RN-CTR-09] **(M5)**.
4. La Secretaría revisa y confirma el envío.
5. El sistema envía el correo, registra el evento de comunicación saliente contra el folio y pasa el contrato a `ENVIADO`.
6. Al llegar el acuse del revisor, el contrato pasa a `EN_REVISION` (seguimiento en CU-CTR-004). El caso de uso termina.

## Flujos alternativos

### A1. Reenvío tras observación

1. El contrato parte de `OBSERVADO` con la corrección ya cargada (CU-CTR-002).
2. El envío conserva el historial de envíos previos y reinicia el ciclo de revisión.

## Excepciones

### E1. Intento de envío automático

1. Un flujo de n8n o el asistente de IA intenta enviar la solicitud sin intervención de la Secretaría.
2. El sistema lo bloquea: el envío de correo oficial exige confirmación humana [RN-CTR-09].

### E2. Faltan datos mínimos

1. El contrato no tiene adjuntos o carece de folio.
2. El sistema impide el envío y señala qué falta.

## Postcondiciones

- **Éxito:** el contrato queda en `ENVIADO`, con el correo registrado contra su folio.
- **Fallo:** no se envía nada; el contrato permanece en su estado anterior.

## Reglas de negocio relacionadas

- **RN-CTR-08** (RF_08): todo envío operativo se vincula a un folio único que identifica el trámite dentro de la unidad.
- **RN-CTR-09** (RNF_11, M5): el sistema propone el correo; el envío de cualquier comunicación oficial lo confirma siempre un humano — nunca es automático ni lo dispara la IA.
