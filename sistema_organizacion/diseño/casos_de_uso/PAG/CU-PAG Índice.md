---
tags:
  - tipo/indice
  - dom/pagos
  - tema/pago
  - tema/presupuesto
---

# CU-PAG · Índice — Pagos

Registro de los pagos de honorarios y el cierre presupuestal del proyecto. El avance de un pago
exige confirmación humana (M5) y el cierre presupuestal es condición para cerrar el proyecto
(ver `CU-PRY-002`).

**Actores:** Secretaría

### Secretaría

- [**CU-PAG-001**](<CU-PAG-001 Registrar pago de honorarios.md>) Registrar pago de honorarios — *Secretaría*
  Registrar y avanzar un pago; el avance exige confirmación humana (M5). — `RF_09`, `RNF_11 (M5)`
- [**CU-PAG-002**](<CU-PAG-002 Cierre presupuestal.md>) Cierre presupuestal — *Secretaría*
  Conciliar ejercido vs. presupuesto por rubro al cerrar. — `RF_02` (rubros)

---

## Artefactos relacionados

- [README maestro](../README.md)
- [Diagrama general de casos de uso](../../diagramas/01_casos_de_uso.md)
- [Máquinas de estado](../../diagramas/02_maquinas_de_estado.md)
- [Modelo de datos](../../modelo_de_datos.md)
- Requisitos: `RF_02`, `RF_09`, `RNF_11`
