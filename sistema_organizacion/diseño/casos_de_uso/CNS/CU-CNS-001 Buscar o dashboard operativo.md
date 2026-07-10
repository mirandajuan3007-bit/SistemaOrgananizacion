---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/consulta
fecha: 2026-07-08
id: CU-CNS-001
modulo: Consulta
actor_principal: Secretaría
requisitos_relacionados:
  - RF_12
  - RNF_02
dependencias:
  - CU-EXP-002
  - CU-CTR-001
---

# CU-CNS-001 Buscar o dashboard operativo

## Descripción

El usuario encuentra proyectos, participantes y contratos, y ve el estado general de la
operación sin revisar carpetas, correos ni Excel. Combina tres capacidades: listar, buscar y
visualizar indicadores en un dashboard. Da a la Secretaría ubicación rápida y a la Dirección
visibilidad real.

## Actores

- **Actor principal:** Secretaría · Director
- **Actores secundarios:** Sistema/n8n (calcula indicadores y aplica permisos)

## Precondiciones

- Existen registros operativos cargados en el sistema.
- El usuario tiene permisos para consultar la información (RNF_02).

## Disparador

El usuario abre un listado o el dashboard principal.

## Flujo principal

1. El usuario abre el listado o el dashboard; el sistema carga los indicadores generales y los resultados iniciales [RN-CNS-01].
2. Aplica filtros o escribe un criterio (nombre, folio, proyecto, estado, rango de fechas).
3. El sistema actualiza los resultados respetando la unidad y el rol del usuario [RN-CNS-02].
4. El usuario selecciona un registro y navega a su detalle (expediente o contrato). El caso de uso termina.

## Flujos alternativos

### A1. Búsqueda sin resultados

1. El criterio no tiene coincidencias.
2. El sistema lo informa y sugiere limpiar filtros o refinar la búsqueda.

### A2. Acceso restringido por rol

1. El usuario visualiza un dashboard o listado.
2. El sistema solo muestra la información permitida por su rol.

### A3. Dashboard con datos históricos

1. El usuario selecciona un periodo específico.
2. El sistema recalcula los indicadores para ese rango.

## Excepciones

> Sin excepciones relevantes: la consulta es de solo lectura y no altera datos. Los accesos no
> permitidos se resuelven mostrando únicamente lo autorizado (A2).

## Postcondiciones

- **Éxito:** el usuario ubica el registro buscado o interpreta el estado general y navega al detalle.
- **Fallo:** no hay coincidencias; no se altera ningún dato.

## Reglas de negocio relacionadas

- **RN-CNS-01** (RF_12): los indicadores del dashboard se calculan a partir de datos reales del sistema, no se capturan manualmente.
- **RN-CNS-02** (RF_12 / RNF_02): los resultados de búsqueda y la navegación al detalle respetan la unidad y los permisos del usuario.
