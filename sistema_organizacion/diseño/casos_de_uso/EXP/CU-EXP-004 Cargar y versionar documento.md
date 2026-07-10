---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/expediente
  - tema/documento
fecha: 2026-07-08
id: CU-EXP-004
modulo: Participantes y Expediente
actor_principal: Secretaría
requisitos_relacionados:
  - RF_10
dependencias:
  - CU-EXP-003
  - CU-EXP-002
---

# CU-EXP-004 Cargar y versionar documento

## Descripción

Además de saber qué documento se requiere, el sistema gestiona el archivo real: lo guarda en el
repositorio institucional (SharePoint/OneDrive vía Graph), lo vincula al expediente y al
requisito correcto, y conserva sus versiones sin perder el historial. Así se corta una de las
causas principales del desorden actual: archivos que se suben, se mueven y se pierden en
carpetas mal organizadas.

## Actores

- **Actor principal:** Secretaría *(también el participante o el revisor, según permiso)*
- **Actores secundarios:** Sistema/n8n (guarda en el repositorio, registra metadatos, versiona)

## Precondiciones

- Existe un expediente o proyecto al cual vincular el documento (CU-EXP-003).
- El usuario tiene permiso de carga y el repositorio documental está disponible.

## Disparador

El usuario adjunta un archivo a un requisito del checklist o como documento libre.

## Flujo principal

1. El usuario abre el expediente y selecciona el requisito documental (o "adjuntar archivo").
2. Elige el archivo a cargar.
3. El sistema valida formato, tamaño y la asociación [RN-EXP-10].
4. Guarda el archivo en el repositorio institucional y registra la referencia y sus metadatos (quién lo subió y cuándo).
5. El documento aparece en el expediente con estado `RECIBIDO` y el checklist reacciona. El caso de uso termina.

## Flujos alternativos

### A1. Nueva versión del documento

1. Un documento fue `OBSERVADO` y el usuario sube una corrección.
2. El sistema conserva la referencia histórica, crea un documento hijo y marca la nueva como versión vigente [RN-EXP-09].

### A2. Documento libre

1. El usuario carga un archivo informativo o complementario.
2. El sistema lo registra como documento adicional con categoría libre.

## Excepciones

### E1. Formato inválido

1. El usuario intenta subir un archivo no permitido.
2. El sistema rechaza la carga e informa el motivo [RN-EXP-10].

## Postcondiciones

- **Éxito:** el archivo queda vinculado al expediente, consultable, con su versión vigente identificada.
- **Fallo:** no se guarda nada; el checklist permanece igual.

## Reglas de negocio relacionadas

- **RN-EXP-09** (RF_10): una nueva versión no sobrescribe la anterior; el documento vigente se distingue de sus versiones históricas.
- **RN-EXP-10** (RF_10): la carga respeta los formatos y políticas definidos; todo documento se asocia a un elemento operativo válido.
