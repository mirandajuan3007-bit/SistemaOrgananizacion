---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/acceso
  - tema/autenticacion
fecha: 2026-07-08
id: CU-ACC-001
modulo: Acceso
actor_principal: Secretaría
requisitos_relacionados:
  - RF_01
  - RNF_02
dependencias:
  - CU-CTL-002
---

# CU-ACC-001 Iniciar sesión con cuenta institucional

## Descripción

El sistema opera sobre información sensible, así que no usa usuarios ni contraseñas locales:
cada usuario interno entra con su **cuenta institucional de Microsoft (Entra ID)**, la misma que
ya usa en Outlook/OneDrive. Al autenticarse, el sistema carga su rol, su unidad y los módulos
que le corresponden. Autenticarse en Microsoft no basta: también hay que estar autorizado dentro
del sistema.

## Actores

- **Actor principal:** Secretaría · Director · Investigador · Administrador · Revisor jurídico
- **Actores secundarios:** Sistema/n8n (valida el token contra Entra ID y carga el perfil)

## Precondiciones

- El usuario tiene una cuenta válida en Microsoft Entra ID.
- El usuario está dado de alta y activo en el sistema (CU-CTL-002) y su unidad existe.

## Disparador

El usuario abre la aplicación web sin una sesión activa.

## Flujo principal

1. El usuario abre la aplicación; el sistema detecta que no hay sesión.
2. Redirige al login institucional de Microsoft (OAuth 2.0 Authorization Code + PKCE) [RN-ACC-01].
3. El usuario se autentica y Microsoft retorna un token.
4. El backend valida el token criptográficamente contra Entra ID y obtiene el identificador institucional (`oid`).
5. Busca al usuario local; si existe y está activo, carga su rol, su unidad y sus módulos [RN-ACC-02].
6. Muestra la pantalla inicial correspondiente a su perfil. El caso de uso termina.

## Flujos alternativos

### A1. Usuario en varias unidades

1. El usuario pertenece a más de una unidad académica.
2. Selecciona su contexto de trabajo al entrar (o lo cambia dentro de la aplicación).

### A2. Primer acceso autorizado

1. Es el primer ingreso de un usuario ya autorizado.
2. El sistema crea su registro local y continúa el flujo.

## Excepciones

### E1. Autenticado en Microsoft pero no autorizado en el sistema

1. El usuario se autentica con Microsoft, pero no tiene registro activo en el sistema.
2. El sistema bloquea el acceso con un mensaje claro; queda pendiente de autorización [RN-ACC-03].

### E2. Usuario inactivo o suspendido

1. El usuario se autentica, pero su registro está inactivo.
2. El sistema impide el ingreso y muestra "acceso suspendido".

### E3. Fallo del proveedor de autenticación

1. Microsoft no responde o retorna error.
2. El sistema informa que no fue posible autenticar y sugiere reintentar.

## Postcondiciones

- **Éxito:** el usuario entra con identidad institucional y llega a su pantalla inicial según su rol y unidad.
- **Fallo:** el acceso queda bloqueado sin exponer información interna.

## Reglas de negocio relacionadas

- **RN-ACC-01** (RF_01 / RNF_02): el 100 % de los accesos pasa por autenticación institucional; el sistema no almacena contraseñas locales.
- **RN-ACC-02** (RNF_02): cada usuario accede solo a las unidades y módulos autorizados; los tokens expiran en no más de 8 horas.
- **RN-ACC-03** (RF_01): autenticarse en Microsoft no garantiza acceso; se requiere autorización previa en el sistema (son dos cosas distintas).
