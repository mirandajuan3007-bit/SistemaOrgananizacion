---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/proyectos
  - tema/presupuesto
  - tema/voto-bueno
fecha: 2026-07-08
id: CU-PRY-002
modulo: Proyectos
actor_principal: Secretaría
requisitos_relacionados:
  - RF_02
  - RF_16
  - RNF_11
dependencias:
  - CU-PRY-001
  - CU-PAG-002
  - CU-CTR-005
---

# CU-PRY-002 Cerrar proyecto

## Descripción

La Secretaría cierra un proyecto cuya operación concluyó. El sistema impide cerrar si quedan
contratos abiertos o pagos críticos pendientes, y —además— el cierre exige el **visto bueno del
Director** sobre el cierre presupuestal (RF_16). Así el cierre deja de ser un cambio silencioso
y queda con validación y rastro.

## Actores

- **Actor principal:** Secretaría (solicita el cierre)
- **Actores secundarios:** Director (otorga el VoBo del cierre, CU-CTR-005 A2), Sistema/n8n (valida pendientes y consolida)

## Precondiciones

- El proyecto está `ACTIVO` y su operación concluyó.
- Existe un cierre presupuestal consolidado (CU-PAG-002).

## Disparador

La Secretaría solicita cerrar el proyecto.

## Flujo principal

1. La Secretaría solicita cerrar; el proyecto pasa a `EN_CIERRE`.
2. El sistema valida que no existan contratos abiertos ni pagos críticos pendientes [RN-PRY-03].
3. Presenta al Director la tarjeta del cierre (total estimado vs. ejercido, rubros con desviación) para su visto bueno (CU-CTR-005 A2).
4. Con el visto bueno, el proyecto pasa `EN_CIERRE → CERRADO` [RN-PRY-04] **(M5)**. El caso de uso termina.

## Flujos alternativos

### A1. El Director devuelve el cierre

1. El Director devuelve con comentario obligatorio.
2. El proyecto permanece `EN_CIERRE` con el comentario registrado, para que la Secretaría lo resuelva.

## Excepciones

### E1. Pendientes que impiden el cierre

1. Existen contratos abiertos o pagos críticos pendientes.
2. El sistema bloquea el cierre e informa qué pendientes lo impiden [RN-PRY-03].

## Postcondiciones

- **Éxito:** el proyecto queda `CERRADO`, con el VoBo del Director auditado.
- **Fallo:** el proyecto permanece `ACTIVO` o `EN_CIERRE`, según dónde se detuvo.

## Reglas de negocio relacionadas

- **RN-PRY-03** (RF_02): un proyecto no puede cerrarse con contratos abiertos o pagos críticos pendientes.
- **RN-PRY-04** (RF_16): la transición `EN_CIERRE → CERRADO` exige el visto bueno del Director registrado.
