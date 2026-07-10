---
estado: propuesta
version: 0.1
tags:
  - tipo/plantilla
fecha: 2026-07-08
id: CU-XXX-NNN
modulo: <Dominio — p. ej. Contratos>
actor_principal: <Actor — p. ej. Secretaría>
requisitos_relacionados:
  - RF_XX
dependencias:
  - CU-XXX-NNN
---

# CU-XXX-NNN <Nombre breve del caso de uso>

## Descripción

Qué hace el actor y qué resultado de valor obtiene. Dos o tres frases, en el lenguaje del
sistema UADY (no técnico). Si el caso resuelve un dolor concreto del cliente, mencionarlo.

## Actores

- **Actor principal:** <quién ejecuta el caso>
- **Actores secundarios:** <apoyo — p. ej. Sistema/n8n, Revisor jurídico> *(quitar si no aplica)*

## Precondiciones

- <estado o condición que debe cumplirse antes de empezar; citar estados como `EN_REVISION`>
- <permiso RBAC requerido, si aplica (RNF_02)>

## Disparador

Evento que inicia el caso de uso (un clic, la llegada de un correo, un barrido de n8n…).

## Flujo principal

1. <paso del actor>.
2. El sistema valida <condición> [RN-XXX-NN].
3. El sistema ejecuta <acción principal> y registra el cambio en `audit_log` (RNF_01).
4. El caso de uso termina.

> Cita `[RN-XXX-NN]` solo cuando el paso se apoye en una regla declarada abajo. Marca con
> **(M5)** los pasos que exigen confirmación humana obligatoria (RNF_11).

## Flujos alternativos

*(Quitar la sección si no hay variaciones válidas.)*

### A1. <nombre>

1. <condición que desvía del flujo principal>.
2. El sistema responde de forma alternativa [RN-XXX-NN].
3. El flujo termina o regresa al paso N del flujo principal.

## Excepciones

*(Debe existir al menos una E1; si no hay ninguna relevante, dejar una nota "Sin excepciones".)*

### E1. <nombre>

1. Ocurre una condición inválida o un error.
2. El sistema detiene o rechaza la operación y explica el motivo [RN-XXX-NN].

## Postcondiciones

- **Éxito:** <estado del sistema si el flujo termina bien>.
- **Fallo:** <estado si no puede completarse>.

## Reglas de negocio relacionadas

- **RN-XXX-01** (RF_XX): <regla que el sistema hace cumplir>.
- **RN-XXX-02** (RNF_XX): <regla>.
