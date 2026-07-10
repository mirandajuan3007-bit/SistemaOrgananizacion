---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/expediente
fecha: 2026-07-08
id: CU-EXP-001
modulo: Participantes y Expediente
actor_principal: Secretaría
requisitos_relacionados:
  - RF_03
dependencias:
  - CU-PRY-001
  - CU-EXP-002
  - CU-EXP-003
---

# CU-EXP-001 Registrar participante

## Descripción

La Secretaría da de alta a un participante dentro de un proyecto, capturando sus datos
personales y fiscales y su tipo de participación. Al crearse, el sistema inicializa
automáticamente su expediente digital. El participante es la unidad humana sobre la que gira
todo el flujo documental, contractual y de pago, por lo que registrarlo bien —y sin duplicar—
es la base de la operación.

## Actores

- **Actor principal:** Secretaría
- **Actores secundarios:** Sistema/n8n (valida duplicados, inicializa el expediente)

## Precondiciones

- Existe un proyecto en estado `ACTIVO`.
- La Secretaría tiene permiso para operar participantes (RNF_02).

## Disparador

La Secretaría elige "Agregar participante" desde el detalle de un proyecto.

## Flujo principal

1. La Secretaría abre el detalle del proyecto y entra a la sección de participantes.
2. Selecciona agregar participante y captura datos personales, fiscales y de contacto, e indica el tipo de participación.
3. El sistema valida los campos obligatorios y detecta posibles duplicados por RFC o correo [RN-EXP-01].
4. El sistema crea el registro asociado al proyecto en estado `ACTIVO` [RN-EXP-02].
5. El sistema inicializa automáticamente su expediente con el checklist documental que corresponde a su tipo de participación (CU-EXP-003). El caso de uso termina.

## Flujos alternativos

### A1. Participante ya existente

1. Se captura el RFC o correo de una persona ya registrada.
2. El sistema detecta la coincidencia y, en lugar de duplicar, ofrece reutilizar los datos base y asociar a la persona al nuevo proyecto [RN-EXP-01].

### A2. Corrección de datos

1. La Secretaría edita un dato incorrecto del participante.
2. El sistema conserva registro de qué cambió y cuándo.

### A3. Baja lógica del participante

1. Se necesita retirar al participante del flujo.
2. El sistema no lo elimina: lo marca `INACTIVO`/`CANCELADO` preservando su historial [RN-EXP-03].

## Excepciones

### E1. Datos obligatorios incompletos o inconsistentes

1. Faltan campos obligatorios o hay inconsistencias básicas.
2. El sistema bloquea el alta e indica qué corregir.

## Postcondiciones

- **Éxito:** existe un participante asociado al proyecto, con expediente inicializado y estado `ACTIVO`.
- **Fallo:** no se crea el participante; no se altera nada.

## Reglas de negocio relacionadas

- **RN-EXP-01** (RF_03): no se duplica un participante que ya exista con el mismo identificador fiscal o institucional; el sistema ofrece reutilizarlo.
- **RN-EXP-02** (RF_03): un participante debe pertenecer al menos a un proyecto.
- **RN-EXP-03** (RF_03): la baja del participante no borra contratos, documentos ni pagos históricos.
