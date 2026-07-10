---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/expediente
  - tema/documento
  - tema/enlace-token
fecha: 2026-07-08
id: CU-EXP-006
modulo: Participantes y Expediente
actor_principal: Participante externo
requisitos_relacionados:
  - RF_15
  - RNF_07
dependencias:
  - CU-EXP-005
  - CU-EXP-004
---

# CU-EXP-006 Subir documento por enlace seguro

## Descripción

En la fase 2, cada correo de solicitud incluye un **enlace único por expediente** (token). El
participante abre el enlace y sube directamente los documentos faltantes, **sin cuenta ni
contraseña**. La página muestra solo los faltantes de su propio expediente y lo subido entra
como `RECIBIDO` disparando la validación automática. Es el único punto de la aplicación
accesible sin identidad institucional.

## Actores

- **Actor principal:** Participante externo
- **Actores secundarios:** Sistema/n8n (genera y valida el enlace, valida formato), Secretaría (recibe la notificación de recepción)

## Precondiciones

- El expediente tiene un enlace de carga vigente (token no expirado ni revocado).

## Disparador

El participante abre el enlace de subida incluido en su correo de solicitud.

## Flujo principal

1. El participante abre el enlace tokenizado desde su correo.
2. La página muestra **únicamente** los requisitos faltantes de su expediente, sin exponer datos personales ya capturados ni información de otros participantes [RN-EXP-14].
3. Sube los archivos; el sistema valida el formato y los registra como `RECIBIDO` contra el requisito concreto.
4. Se dispara la validación automática (M2) y la Secretaría recibe la notificación de recepción (no necesita clasificar). El caso de uso termina.

## Flujos alternativos

### A1. Enlace expirado o agotado

1. El participante abre un enlace vencido o sin usos disponibles.
2. La página informa que expiró y ofrece pedir uno nuevo; el sistema notifica a la Secretaría, que reenvía la solicitud con un enlace fresco (M5) [RN-EXP-15].

## Excepciones

### E1. Enlace manipulado o revocado

1. Se abre un enlace alterado o revocado.
2. El sistema no da acceso a nada [RN-EXP-15].

## Postcondiciones

- **Éxito:** el participante completa su expediente desde el enlace; los archivos entran como `RECIBIDO` y se validan.
- **Fallo:** el enlace no da acceso; no se expone información.

## Reglas de negocio relacionadas

- **RN-EXP-14** (RF_15 / RNF_07): el enlace muestra solo los faltantes del expediente propio (minimización); no lista documentos ya entregados ni datos personales.
- **RN-EXP-15** (RF_15): el enlace es único por expediente, con expiración y revocable; se guarda solo el hash del token, nunca el token en claro.
