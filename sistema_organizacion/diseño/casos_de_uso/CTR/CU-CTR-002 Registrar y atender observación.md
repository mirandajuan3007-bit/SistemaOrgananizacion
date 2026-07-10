---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/contratos
  - tema/contrato
  - tema/documento
fecha: 2026-07-08
id: CU-CTR-002
modulo: Contratos
actor_principal: Revisor jurídico
requisitos_relacionados:
  - RF_07
dependencias:
  - CU-CTR-001
  - CU-CTR-003
  - CU-EXP-004
---

# CU-CTR-002 Registrar y atender observación

## Descripción

El revisor jurídico de la UADY registra observaciones formales sobre un contrato (o documento)
en revisión; la Secretaría las atiende subiendo la corrección o una nueva versión, y el revisor
las valida. Cada observación es una **entidad operativa con estado propio**, no un comentario
suelto en un Word o en un correo — que es exactamente el desorden que hoy provoca idas y
vueltas difíciles de controlar.

## Actores

- **Actor principal:** Revisor jurídico (registra y valida las observaciones)
- **Actores secundarios:** Secretaría (atiende y corrige), Sistema/n8n (recalcula el estado del contrato según sus observaciones)

## Precondiciones

- Existe un contrato en `EN_REVISION` (o un documento activo) sobre el cual operar.
- El usuario tiene permiso para registrar o resolver observaciones (RNF_02).

## Disparador

El revisor jurídico detecta, durante la revisión, un ajuste requerido en el contrato.

## Flujo principal

1. El revisor jurídico revisa el contrato en `EN_REVISION`.
2. Registra una observación con descripción clara y severidad (p. ej. `CRÍTICA` / `MENOR`) [RN-CTR-04].
3. El sistema vincula la observación al contrato y lo pasa a `OBSERVADO` [RN-CTR-05].
4. La Secretaría atiende la observación y sube la corrección o una nueva versión (documento hijo, RF_10, sin sobrescribir la anterior).
5. La Secretaría reenvía el contrato (CU-CTR-003); pasa a `ENVIADO → EN_REVISION` conservando el historial.
6. El revisor valida la corrección y la observación pasa a `VALIDADA`.
7. Cuando no quedan observaciones críticas abiertas, el contrato puede pasar a `APROBADO`. El caso de uso termina.

## Flujos alternativos

### A1. Múltiples observaciones simultáneas

1. Un mismo contrato recibe varias observaciones.
2. El sistema las muestra por separado, cada una con su estado.
3. El contrato solo queda libre de observaciones cuando **todas las críticas** están validadas [RN-CTR-06].

### A2. Nueva observación sobre una versión ya corregida

1. Se revisa la versión corregida y persisten problemas o aparecen nuevos.
2. El sistema permite registrar nuevas observaciones sin borrar las anteriores.

### A3. Observación descartada

1. Se determina que una observación no aplica.
2. Se marca como `DESCARTADA` con justificación registrada [RN-CTR-07].

## Excepciones

### E1. Cierre de observación sin resolución

1. Se intenta cerrar una observación sin corrección ni justificación.
2. El sistema lo impide: exige una acción de resolución o una justificación explícita [RN-CTR-07].

## Postcondiciones

- **Éxito:** la observación queda `VALIDADA` o `DESCARTADA` con trazabilidad; el contrato refleja si aún tiene pendientes.
- **Fallo:** la observación permanece abierta y el contrato no avanza.

## Reglas de negocio relacionadas

- **RN-CTR-04** (RF_07): toda observación debe estar asociada a un elemento concreto (contrato o documento).
- **RN-CTR-05** (RF_06): pasar un contrato a `OBSERVADO` exige registrar al menos una observación.
- **RN-CTR-06** (RF_07): el contrato no se considera libre de observaciones hasta que todas las críticas estén validadas.
- **RN-CTR-07** (RF_07): una observación no se cierra sin acción de resolución o justificación; las versiones nuevas conservan referencia histórica de las previas.
