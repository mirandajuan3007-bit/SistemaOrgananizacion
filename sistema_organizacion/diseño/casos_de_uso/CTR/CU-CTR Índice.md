---
tags:
  - tipo/indice
  - dom/contratos
  - tema/contrato
  - tema/voto-bueno
---

# CU-CTR · Índice — Contratos

Ciclo de vida del contrato de honorarios: creación y estados, observaciones (incluida la
revisión del jurídico UADY), envío de la solicitud, seguimiento por folio y el **visto bueno
del Director** que se intercala entre Aprobado y Firmado (RF_16). Es el dominio central del
módulo.

**Actores:** Secretaría · Director · Revisor jurídico · Sistema/n8n

### Secretaría

- [**CU-CTR-001**](<CU-CTR-001 Gestionar contrato y estados.md>) Gestionar contrato y estados — *Secretaría*
  Crear el contrato, asignar folio y transicionar sus estados con historial. — `RF_06`
- [**CU-CTR-003**](<CU-CTR-003 Enviar solicitud de contrato.md>) Enviar solicitud de contrato — *Secretaría*
  El sistema prepara la solicitud; el envío exige confirmación humana (M5). — `RF_06`, `RNF_11 (M5)`

### Secretaría · Revisor jurídico

- [**CU-CTR-002**](<CU-CTR-002 Registrar y atender observación.md>) Registrar / atender observación — *Secretaría · Revisor jurídico*
  El jurídico UADY registra observaciones; la Secretaría las atiende y reenvía. — `RF_07`

### Secretaría · Sistema/n8n

- [**CU-CTR-004**](<CU-CTR-004 Seguimiento por folio.md>) Seguimiento por folio — *Secretaría · Sistema/n8n*
  Asociar respuestas por folio y seguir el estado del trámite. — `RF_08`

### Director

- [**CU-CTR-005**](<CU-CTR-005 Otorgar visto bueno (contrato o cierre).md>) Otorgar visto bueno (contrato / cierre) — *Director*
  Dar VoBo o devolver con comentario obligatorio; decisión personal (M5). — `RF_16`, `RNF_11 (M5)`

---

## Artefactos relacionados

- [README maestro](../README.md)
- [Diagrama general de casos de uso](../../diagramas/01_casos_de_uso.md)
- [Máquinas de estado](../../diagramas/02_maquinas_de_estado.md)
- [Modelo de datos](../../modelo_de_datos.md)
- Requisitos: `RF_06`, `RF_07`, `RF_08`, `RF_16`, `RNF_11`
