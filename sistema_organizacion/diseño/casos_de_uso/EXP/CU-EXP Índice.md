---
tags:
  - tipo/indice
  - dom/expediente
  - tema/documento
  - tema/correo
  - tema/enlace-token
---

# CU-EXP · Índice — Participantes y Expediente

Expediente digital del participante y su documentación: alta del participante, checklist de
documentos requeridos, carga y versionado, y la **recepción de documentos de participantes
externos** por canal híbrido (correo asistido en fase 1, enlace tokenizado en fase 2, RF_15).

**Actores:** Secretaría · Director · Investigador · Sistema/n8n · Participante externo

### Secretaría

- [**CU-EXP-001**](<CU-EXP-001 Registrar participante.md>) Registrar participante — *Secretaría*
  Alta del participante dentro de un proyecto. — `RF_03`
- [**CU-EXP-003**](<CU-EXP-003 Definir documentos requeridos.md>) Definir documentos requeridos — *Secretaría*
  Configurar el checklist documental del expediente. — `RF_04`
- [**CU-EXP-004**](<CU-EXP-004 Cargar y versionar documento.md>) Cargar / versionar documento — *Secretaría*
  Subir un documento y conservar versiones. — `RF_10`

### Secretaría · Director · Investigador

- [**CU-EXP-002**](<CU-EXP-002 Consultar expediente digital.md>) Consultar expediente digital — *Secretaría · Director · Investigador*
  Ver el expediente; el Investigador solo el propio. — `RF_05`

### Secretaría · Sistema/n8n

- [**CU-EXP-005**](<CU-EXP-005 Recibir y clasificar documento externo.md>) Recibir y clasificar documento externo — *Secretaría · Sistema/n8n*
  n8n asocia el correo entrante y propone clasificación; la Secretaría confirma (M4 + M5). — `RF_15 (fase 1)`, `RNF_11 (M4, M5)`

### Participante externo

- [**CU-EXP-006**](<CU-EXP-006 Subir documento por enlace seguro.md>) Subir documento por enlace seguro — *Participante externo*
  Subir faltantes por enlace tokenizado, sin cuenta ni contraseña. — `RF_15 (fase 2)`, `RNF_07`

---

## Artefactos relacionados

- [README maestro](../README.md)
- [Diagrama general de casos de uso](../../diagramas/01_casos_de_uso.md)
- [Máquinas de estado](../../diagramas/02_maquinas_de_estado.md)
- [Modelo de datos](../../modelo_de_datos.md)
- Requisitos: `RF_03`, `RF_04`, `RF_05`, `RF_10`, `RF_15`, `RNF_07`, `RNF_11`
