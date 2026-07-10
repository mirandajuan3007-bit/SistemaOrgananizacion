---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/control
  - tema/auditoria
fecha: 2026-07-08
id: CU-CTL-002
modulo: Control
actor_principal: Administrador
requisitos_relacionados:
  - RNF_02
  - RNF_01
  - RF_11
dependencias:
  - CU-ACC-001
  - CU-CNS-002
---

# CU-CTL-002 Administrar usuarios, configuración y auditoría

## Descripción

El Administrador técnico gestiona quién puede entrar y con qué rol, configura los parámetros del
sistema (incluidos los umbrales de alerta) y consulta el `audit_log` global. Es un rol de
control, no operativo: por defecto no accede a datos operativos ni bancarios, para separar la
administración técnica de la información sensible.

## Actores

- **Actor principal:** Administrador
- **Actores secundarios:** Sistema/n8n (aplica el RBAC, registra la auditoría de cada cambio)

## Precondiciones

- El usuario tiene rol `ADMIN` y sesión activa (CU-ACC-001).

## Disparador

El Administrador entra al módulo de administración.

## Flujo principal

1. El Administrador entra al módulo de administración.
2. Gestiona usuarios: da de alta/autoriza cuentas, asigna rol y unidad, y activa o desactiva usuarios [RN-CTL-03].
3. Configura los parámetros del sistema y los umbrales de alerta (RF_11).
4. Consulta el `audit_log` global para tareas de auditoría [RN-CTL-04].
5. Cada cambio de configuración queda auditado. El caso de uso termina.

## Flujos alternativos

### A1. Desactivar un usuario

1. El Administrador desactiva a un usuario.
2. El sistema no borra su historial y le impide ingresar en el siguiente intento, aunque tenga un token reciente.

## Excepciones

### E1. Intento de acceso a datos operativos

1. El Administrador intenta ver datos operativos o bancarios.
2. Por defecto no tiene ese acceso: el sistema lo restringe [RN-CTL-05].

## Postcondiciones

- **Éxito:** los usuarios, roles y parámetros quedan configurados y auditados.
- **Fallo:** el cambio no se aplica; la configuración previa permanece.

## Reglas de negocio relacionadas

- **RN-CTL-03** (RNF_02): el Administrador gestiona usuarios, roles y unidades; el acceso se rige por la matriz RBAC.
- **RN-CTL-04** (RNF_01): el `audit_log` es consultable por `ADMIN` y `SECRETARIA`.
- **RN-CTL-05** (RNF_02): el `ADMIN` no tiene acceso a datos operativos ni bancarios por defecto.
