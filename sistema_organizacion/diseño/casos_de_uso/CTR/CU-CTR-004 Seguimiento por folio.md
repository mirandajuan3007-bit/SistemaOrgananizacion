---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/contratos
  - tema/correo
  - tema/alertas
fecha: 2026-07-08
id: CU-CTR-004
modulo: Contratos
actor_principal: Secretaría
requisitos_relacionados:
  - RF_08
  - RF_11
dependencias:
  - CU-CTR-003
  - CU-CTL-001
---

# CU-CTR-004 Seguimiento por folio

## Descripción

El sistema asocia por **folio** las comunicaciones (salientes y entrantes) de un contrato o
trámite, conserva el historial cronológico, marca quién tiene pendiente responder y detecta la
inactividad para convertirla en alerta. El correo sigue siendo el canal, pero deja de ser el
lugar donde se pierde el control: ya no hay que buscar a mano en Gmail/Outlook para saber el
estado de un intercambio.

## Actores

- **Actor principal:** Secretaría (consulta el hilo, vincula manualmente lo no reconocido)
- **Actores secundarios:** Sistema/n8n (asocia por folio con M4, calcula el estado de respuesta, genera alertas con M1), Revisor jurídico o emisor externo (participan de forma indirecta por correo)

## Precondiciones

- Existe un contrato o trámite con folio activo.
- La integración de correo está habilitada (RNF_11, M4).

## Disparador

Se envía o llega un correo relacionado con el trámite.

## Flujo principal

1. El sistema asigna o reutiliza el folio del trámite.
2. La Secretaría envía un correo usando el folio en el asunto (o lo hace el flujo de CU-CTR-003).
3. El sistema registra el envío como evento de comunicación saliente.
4. Cuando llega una respuesta con ese folio, n8n (M4) la asocia al mismo folio y contrato.
5. El contrato muestra la línea de tiempo de interacciones, la última respuesta y **quién tiene la pelota** [RN-CTR-10].
6. Si pasan 24/48/72 h sin respuesta, el barrido M1 genera una alerta operativa (CU-CTL-001) [RN-CTR-12]. El caso de uso continúa vivo hasta que el hilo se cierra.

## Flujos alternativos

### A1. Respuesta sin folio reconocible

1. Llega un correo sin el folio esperado ni remitente conocido.
2. El sistema no lo asocia automáticamente; queda en la bandeja "sin asociar".
3. La Secretaría lo vincula manualmente al expediente/contrato correcto [RN-CTR-11].

### A2. Múltiples mensajes en el mismo hilo

1. Se intercambian varias respuestas.
2. El sistema conserva el orden cronológico y marca quién respondió por última vez.

### A3. Hilo cerrado

1. El asunto ya fue atendido.
2. La Secretaría marca el hilo como cerrado; el sistema deja de considerarlo pendiente para alertas.

## Excepciones

### E1. Correo entrante no clasificable

1. Llega un correo sin folio ni remitente conocido y no puede asociarse.
2. Permanece en la bandeja "sin asociar" hasta que un humano lo vincule; no se descarta.

## Postcondiciones

- **Éxito:** desde el contrato se ve el historial de comunicación, la última interacción y el responsable pendiente.
- **Fallo:** un correo entrante queda sin asociar, disponible para vinculación manual.

## Reglas de negocio relacionadas

- **RN-CTR-10** (RF_08): el folio identifica unívocamente el trámite dentro de la unidad; el sistema conserva la última fecha de interacción y el último emisor.
- **RN-CTR-11** (RF_08): una respuesta no asociable no se pierde ni se descarta; queda disponible para vinculación manual.
- **RN-CTR-12** (RF_08 / RF_11): la falta de respuesta más allá del umbral configurado se convierte en alerta operativa.
