---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/pagos
  - tema/presupuesto
fecha: 2026-07-08
id: CU-PAG-002
modulo: Pagos
actor_principal: Secretaría
requisitos_relacionados:
  - RF_02
dependencias:
  - CU-PRY-002
  - CU-PAG-001
---

# CU-PAG-002 Cierre presupuestal

## Descripción

Antes de cerrar un proyecto, la Secretaría consolida cuánto se ejerció por rubro frente al
presupuesto aprobado. El sistema calcula las desviaciones con datos reales (no capturados a
mano) y deja el cierre consolidado, que es lo que después revisa el Director para dar su visto
bueno (CU-PRY-002 / CU-CTR-005).

## Actores

- **Actor principal:** Secretaría
- **Actores secundarios:** Director (revisa el cierre para su VoBo), Sistema/n8n (concilia ejercido vs. presupuesto)

## Precondiciones

- La operación del proyecto concluyó.
- Los pagos del proyecto están en estado terminal (`COMPLETO`/`INCOMPLETO`).

## Disparador

La Secretaría inicia el cierre presupuestal del proyecto.

## Flujo principal

1. La Secretaría consolida el ejercido por rubro frente al presupuesto aprobado.
2. El sistema calcula las desviaciones por rubro (estimado vs. ejercido) [RN-PAG-04].
3. Deja el cierre consolidado; el proyecto queda `EN_CIERRE`, lo que habilita el visto bueno del Director (CU-PRY-002). El caso de uso termina.

## Flujos alternativos

### A1. Rubro con sobregiro o desviación

1. Un rubro presenta sobregiro o desviación significativa.
2. El sistema lo marca visiblemente para la decisión del Director en la tarjeta de cierre.

## Excepciones

### E1. Pagos críticos sin estado terminal

1. Existen pagos críticos que aún no están en estado terminal.
2. El sistema no permite consolidar el cierre e indica cuáles faltan [RN-PAG-05].

## Postcondiciones

- **Éxito:** el proyecto queda `EN_CIERRE` con un cierre presupuestal consolidado y sus desviaciones calculadas.
- **Fallo:** no se consolida el cierre; el proyecto permanece `ACTIVO`.

## Reglas de negocio relacionadas

- **RN-PAG-04** (RF_02): el cierre concilia el ejercido contra el presupuesto por rubro usando datos reales del sistema.
- **RN-PAG-05** (RF_02): no se consolida el cierre con pagos críticos pendientes.
