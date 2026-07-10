---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/pagos
  - tema/pago
fecha: 2026-07-08
id: CU-PAG-001
modulo: Pagos
actor_principal: Secretaría
requisitos_relacionados:
  - RF_09
  - RNF_11
dependencias:
  - CU-CTR-001
  - CU-EXP-002
---

# CU-PAG-001 Registrar pago de honorarios

## Descripción

El flujo no termina con el contrato: falta la parte económica (factura, evidencia, cheque,
complemento) y el control de si la persona cobró o no. La Secretaría registra y hace avanzar el
pago por sus estados; cada transición exige **confirmación humana** (M5). Un caso clave: quien
cobró pero no entregó complemento queda `INCOMPLETO` y marcado como pendiente para futuras
contrataciones — justo lo que hoy genera problemas en auditoría.

## Actores

- **Actor principal:** Secretaría (con apoyo del personal contable)
- **Actores secundarios:** Director (consulta de seguimiento), Sistema/n8n (valida requisitos y audita cada transición)

## Precondiciones

- El contrato está en estado `VIGENTE`.
- Existen las evidencias mínimas requeridas para pago (RF_09).

## Flujo principal

1. La Secretaría abre el expediente; el sistema indica que el contrato ya puede pasar a pago.
2. Registra factura/referencia y evidencias; el pago pasa `PENDIENTE → EN_PROCESO` [RN-PAG-01] **(M5)**.
3. Se emite cheque o transferencia (`CHEQUE_EMITIDO`); al entregarlo, pasa a `PENDIENTE_COBRO`.
4. El participante cobra y el pago pasa a `COBRADO`.
5. Si no requiere complemento, pasa a `COMPLETO`; si lo requiere, a `COMPLEMENTO_PENDIENTE` y, al recibirlo, a `COMPLETO`. El caso de uso termina.

## Disparador

El contrato `VIGENTE` habilita la fase de pago del participante.

## Flujos alternativos

### A1. Cheque no cobrado

1. Se registró la emisión/entrega del cheque.
2. El pago permanece en `PENDIENTE_COBRO` y la operación lo sigue monitoreando.

### A2. Complemento de pago faltante

1. El pago se cobró pero falta el complemento.
2. Queda en `COMPLEMENTO_PENDIENTE`; si se cierra sin él, pasa a `INCOMPLETO` y marca al participante como pendiente para futuras contrataciones [RN-PAG-03].

## Excepciones

### E1. Evidencia insuficiente

1. Se intenta avanzar a pago sin las evidencias requeridas.
2. El sistema bloquea el avance y explica qué falta [RN-PAG-02].

## Postcondiciones

- **Éxito:** el pago llega a `COMPLETO` y el expediente refleja el cierre económico.
- **Fallo:** el pago no avanza (evidencia insuficiente) o queda `INCOMPLETO` con el participante marcado.

## Reglas de negocio relacionadas

- **RN-PAG-01** (RF_09 / RNF_11, M5): toda transición de pago exige confirmación humana; nunca es automática.
- **RN-PAG-02** (RF_09): el pago no avanza sin contrato `VIGENTE` y sin las evidencias mínimas.
- **RN-PAG-03** (RF_09): un pago `INCOMPLETO` (cobrado sin complemento) marca al participante como pendiente para futuras contrataciones.
