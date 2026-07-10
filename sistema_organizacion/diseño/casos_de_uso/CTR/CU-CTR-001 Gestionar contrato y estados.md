---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/contratos
  - tema/contrato
fecha: 2026-07-08
id: CU-CTR-001
modulo: Contratos
actor_principal: Secretaría
requisitos_relacionados:
  - RF_06
dependencias:
  - CU-EXP-002
  - CU-CTR-002
  - CU-CTR-003
  - CU-CTR-005
---

# CU-CTR-001 Gestionar contrato y estados

## Descripción

La Secretaría crea el registro del contrato de un participante dentro de un proyecto, le
asigna un folio operativo y hace avanzar su ciclo de vida (`BORRADOR → … → CERRADO`) conforme a
las transiciones válidas. El sistema conserva el historial de cada cambio de estado, de modo
que en cualquier momento se sabe si un contrato está en borrador, enviado, en revisión,
observado, aprobado, con visto bueno, firmado, vigente o cerrado — que es justo la confusión
que hoy provoca el manejo por correo y Word.

## Actores

- **Actor principal:** Secretaría
- **Actores secundarios:** Sistema/n8n (valida transiciones, registra historial y auditoría)

## Precondiciones

- Existe un participante en estado `LISTO_PARA_CONTRATO` (expediente documental completo, RF_04/RF_10).
- La Secretaría tiene permiso de escritura sobre su unidad (RNF_02).

## Disparador

La Secretaría abre el expediente marcado como listo para contratar y crea el contrato.

## Flujo principal

1. La Secretaría abre el expediente del participante; el sistema indica que está `LISTO_PARA_CONTRATO`.
2. La Secretaría crea el registro del contrato.
3. El sistema le asigna un folio operativo y el estado inicial `BORRADOR` [RN-CTR-01].
4. Conforme avanza la operación, la Secretaría solicita las transiciones de estado (enviar solicitud → CU-CTR-003; observaciones → CU-CTR-002; visto bueno → CU-CTR-005).
5. Antes de persistir cada transición, el sistema valida que sea una transición autorizada desde el estado actual [RN-CTR-02].
6. El sistema registra la transición en `audit_log` (RNF_01) y actualiza el estado vigente.
7. Cuando el ciclo económico se completa (pago `COMPLETO`), el contrato `VIGENTE` puede pasar a `CERRADO`. El caso de uso termina.

## Flujos alternativos

### A1. Contrato observado

1. Durante la revisión se registran observaciones (CU-CTR-002).
2. El contrato pasa a `OBSERVADO` y no puede avanzar mientras haya observaciones críticas sin validar.

### A2. Reenvío tras corrección

1. La Secretaría sube la corrección y reenvía (CU-CTR-003).
2. El contrato vuelve a `ENVIADO → EN_REVISION` conservando el historial de ciclos previos.

## Excepciones

### E1. Transición inválida

1. La Secretaría intenta llevar el contrato a un estado no permitido desde el actual (p. ej. `FIRMADO` sin pasar por `VOBO_DIRECCION`).
2. El sistema bloquea la acción y explica la restricción [RN-CTR-02] [RN-CTR-03].

### E2. Expediente no listo

1. Se intenta crear un contrato para un participante con expediente `INCOMPLETO`.
2. El sistema lo impide e indica los requisitos documentales faltantes.

## Postcondiciones

- **Éxito:** existe un contrato con folio, estado vigente único e historial completo de transiciones.
- **Fallo:** no se crea el contrato o no se aplica la transición; el estado previo permanece intacto.

## Reglas de negocio relacionadas

- **RN-CTR-01** (RF_06): un contrato pertenece a un participante y a un proyecto, y tiene un único estado vigente en cada momento.
- **RN-CTR-02** (RNF_04): las transiciones de estado siguen la máquina de estados del contrato; el sistema no permite saltos ni estados inconsistentes.
- **RN-CTR-03** (RF_16): ningún contrato llega a `FIRMADO` sin pasar por `VOBO_DIRECCION`.
