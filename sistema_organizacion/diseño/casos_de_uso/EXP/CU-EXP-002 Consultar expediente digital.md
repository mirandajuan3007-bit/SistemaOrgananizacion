---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/expediente
fecha: 2026-07-08
id: CU-EXP-002
modulo: Participantes y Expediente
actor_principal: Secretaría
requisitos_relacionados:
  - RF_05
  - RNF_02
dependencias:
  - CU-EXP-001
---

# CU-EXP-002 Consultar expediente digital

## Descripción

El expediente digital concentra en una sola pantalla toda la información operativa de un
participante: datos, estado documental, contrato, observaciones, pagos e historial. Es la vista
que da sentido al sistema — sustituye el tener que abrir carpetas, correos y Excel para saber
en qué situación está una persona. La Secretaría y el Director lo consultan; el Investigador
solo ve el suyo.

## Actores

- **Actor principal:** Secretaría · Director · Investigador *(el Investigador, solo su propio expediente)*
- **Actores secundarios:** Sistema/n8n (consolida la información de varias entidades)

## Precondiciones

- El participante existe dentro de un proyecto y su expediente fue inicializado (CU-EXP-001).
- El usuario tiene permiso para consultar ese expediente (RNF_02).

## Disparador

El usuario abre el detalle de un participante.

## Flujo principal

1. El usuario abre el detalle del participante.
2. El sistema consolida y carga el expediente agregando datos, documentos, contrato, observaciones, pagos e historial [RN-EXP-04].
3. Muestra un resumen de estado (completitud documental, etapa actual, observaciones abiertas).
4. El usuario navega entre secciones: datos, documentos, contrato, observaciones, pagos e historial.
5. Usa el expediente como punto central de operación y consulta. El caso de uso termina.

## Flujos alternativos

### A1. Expediente incompleto

1. El sistema detecta pendientes documentales o contractuales.
2. El encabezado del expediente lo indica de forma visible.

### A2. Expediente listo para la siguiente etapa

1. El sistema detecta que se cumplieron los requisitos de una etapa.
2. Muestra el expediente como listo para contrato, pago o cierre según corresponda.

### A3. El Investigador consulta su propio expediente

1. El Investigador abre su expediente con acceso restringido.
2. El sistema no muestra datos bancarios ni expedientes de terceros [RN-EXP-05].

## Excepciones

### E1. Acceso a un expediente ajeno

1. Un Investigador intenta abrir el expediente de otro participante.
2. El sistema deniega el acceso (403) [RN-EXP-05].

## Postcondiciones

- **Éxito:** el usuario ve la situación completa y actualizada del participante en una sola pantalla.
- **Fallo:** el acceso se deniega por falta de permiso, sin exponer información.

## Reglas de negocio relacionadas

- **RN-EXP-04** (RF_05): el expediente es una agregación estructurada que refleja el estado real más reciente; se actualiza automáticamente al cambiar cualquiera de sus componentes.
- **RN-EXP-05** (RNF_02): el Investigador solo ve su propio expediente; los datos bancarios solo son visibles para Secretaría y Admin.
