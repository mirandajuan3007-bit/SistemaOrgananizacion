---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/control
  - tema/alertas
fecha: 2026-07-08
id: CU-CTL-001
modulo: Control
actor_principal: Secretaría
requisitos_relacionados:
  - RF_11
  - RNF_11
dependencias:
  - CU-CTR-004
  - CU-CNS-001
---

# CU-CTL-001 Alertas y bandeja de pendientes

## Descripción

Gran parte del problema actual no es que falte información, sino que nadie sabe a tiempo qué está
pendiente. El sistema funciona como tablero de control: los barridos de n8n (M1) detectan
condiciones que requieren atención y las convierten en alertas y tareas en la bandeja del
responsable, que se resuelven solas cuando la situación cambia. Empuja a la operación sobre lo
que necesita atención, en vez de depender de la memoria.

## Actores

- **Actor principal:** Secretaría · Director *(atienden los pendientes)*
- **Actores secundarios:** Sistema/n8n (evalúa, genera y escala alertas con M1), Administrador (configura umbrales)

## Precondiciones

- Existen reglas o umbrales de alerta definidos.
- Existe información operativa suficiente para calcular pendientes.

## Disparador

El barrido periódico (M1) evalúa los expedientes y contratos.

## Flujo principal

1. El sistema evalúa periódicamente expedientes y contratos (M1).
2. Detecta condiciones que requieren atención: contratos sin movimiento, documentos faltantes, observaciones abiertas, pagos o complementos pendientes [RN-CTL-01].
3. Genera una alerta o tarea asociada a una entidad concreta y a un responsable.
4. La alerta aparece en la bandeja del responsable y, si aplica, se envía notificación.
5. Cuando el usuario atiende el caso, la alerta se resuelve automáticamente o se marca como atendida [RN-CTL-02]. El caso de uso termina.

## Flujos alternativos

### A1. Alerta escalada

1. Un pendiente supera cierto tiempo sin atención.
2. El sistema lo escala a un responsable superior o lo marca como crítico.

### A2. Alerta descartada

1. El usuario determina que la alerta ya no aplica.
2. La marca como descartada con justificación.

### A3. Múltiples alertas de un mismo expediente

1. Un expediente tiene varios pendientes simultáneos.
2. El sistema los agrupa sin ocultar su detalle individual.

## Excepciones

### E1. Evento ya resuelto

1. La causa que originó una alerta ya se resolvió por otra vía.
2. La alerta no permanece activa: el sistema la cierra automáticamente [RN-CTL-02].

## Postcondiciones

- **Éxito:** el responsable ve en su bandeja los pendientes reales priorizados y los atiende.
- **Fallo:** —(el caso de uso es de detección continua; no tiene un fallo terminal).

## Reglas de negocio relacionadas

- **RN-CTL-01** (RF_11): los umbrales son configurables; cada alerta se asocia a una entidad y a un responsable, y las críticas se distinguen visualmente.
- **RN-CTL-02** (RF_11): una alerta no permanece activa si el evento que la originó ya fue resuelto.
