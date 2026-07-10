---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/proyectos
  - tema/presupuesto
fecha: 2026-07-08
id: CU-PRY-001
modulo: Proyectos
actor_principal: Secretaría
requisitos_relacionados:
  - RF_02
dependencias:
  - CU-EXP-001
  - CU-PRY-002
---

# CU-PRY-001 Registrar o editar proyecto

## Descripción

La Secretaría da de alta un proyecto —contenedor operativo del que dependen participantes,
contratos, documentos y pagos— con su presupuesto de referencia por rubro, y puede editar sus
datos mientras esté vigente. Sin proyecto formal no hay forma de organizar el resto: se vuelve
a las carpetas sueltas y los seguimientos por memoria o Excel.

## Actores

- **Actor principal:** Secretaría
- **Actores secundarios:** Director / Administrador (consulta), Sistema/n8n (valida y conserva trazabilidad)

## Precondiciones

- El usuario inició sesión y tiene permisos operativos (RNF_02).
- La unidad académica existe y está activa.

## Disparador

La Secretaría elige crear un proyecto en el módulo de proyectos.

## Flujo principal

1. La Secretaría entra al módulo de proyectos y selecciona crear.
2. Captura los datos base: nombre, cliente/entidad, descripción, fechas, responsable, monto/referencia presupuestal y unidad.
3. El sistema valida los campos obligatorios y la unicidad del identificador dentro de la unidad [RN-PRY-01].
4. Genera el registro con estado inicial `BORRADOR`, que pasa a `ACTIVO` al completar los datos mínimos.
5. Muestra el detalle del proyecto, desde donde se registran participantes y documentos. El caso de uso termina.

## Flujos alternativos

### A1. Posible proyecto duplicado

1. Se intenta registrar un proyecto con el mismo nombre, cliente y periodo que uno existente.
2. El sistema advierte la coincidencia alta; el usuario cancela o continúa con justificación.

### A2. Edición de datos del proyecto

1. La Secretaría abre el proyecto y edita campos permitidos (no todos los campos son editables).
2. El sistema registra la modificación y conserva trazabilidad [RN-PRY-02].

## Excepciones

### E1. Datos obligatorios incompletos

1. Faltan campos obligatorios.
2. El sistema bloquea el alta e indica qué falta.

## Postcondiciones

- **Éxito:** existe un proyecto con identificador único en la unidad, listo para recibir participantes, contratos y pagos.
- **Fallo:** no se crea ni se modifica el proyecto.

## Reglas de negocio relacionadas

- **RN-PRY-01** (RF_02): el identificador del proyecto es único dentro de la unidad; todo contrato, participante, documento y pago pertenece a un proyecto.
- **RN-PRY-02** (RF_02): solo se editan los campos permitidos y cada cambio queda registrado (trazabilidad).
