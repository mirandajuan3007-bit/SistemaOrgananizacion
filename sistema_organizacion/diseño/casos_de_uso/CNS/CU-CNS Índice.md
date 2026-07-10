---
tags:
  - tipo/indice
  - dom/consulta
  - tema/ia
  - tema/auditoria
---

# CU-CNS · Índice — Consulta

Capacidades transversales de consulta: búsqueda y dashboard operativo, historial de cambios
(auditoría legible) y el asistente de IA que responde sobre el estado del sistema. Ninguna de
estas acciones modifica datos operativos.

**Actores:** Secretaría · Director · Administrador

### Secretaría · Director

- [**CU-CNS-001**](<CU-CNS-001 Buscar o dashboard operativo.md>) Buscar / dashboard operativo — *Secretaría · Director*
  Buscar expedientes/contratos y ver el tablero de estado. — `RF_12`
- [**CU-CNS-003**](<CU-CNS-003 Consultar al asistente de IA.md>) Consultar al asistente de IA — *Secretaría · Director*
  Preguntar al asistente sobre estados, pendientes y cifras. — `RF_13`

### Secretaría · Director · Administrador

- [**CU-CNS-002**](<CU-CNS-002 Consultar historial de cambios.md>) Consultar historial de cambios — *Secretaría · Director · Administrador*
  Revisar el `audit_log` con origen de cada acción (WEB/AI_AGENT/N8N_FLOW/SYSTEM). — `RF_14`, `RNF_01`

---

## Artefactos relacionados

- [README maestro](../README.md)
- [Diagrama general de casos de uso](../../diagramas/01_casos_de_uso.md)
- [Modelo de datos](../../modelo_de_datos.md)
- Requisitos: `RF_12`, `RF_13`, `RF_14`, `RNF_01`
