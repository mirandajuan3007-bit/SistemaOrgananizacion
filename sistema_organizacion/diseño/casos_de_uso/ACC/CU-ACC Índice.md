---
tags:
  - tipo/indice
  - dom/acceso
  - tema/autenticacion
---

# CU-ACC · Índice — Acceso

Entrada al sistema con identidad institucional. Cubre la autenticación de los usuarios
internos (Secretaría, Director, Investigador, Administrador, Revisor jurídico) mediante la
cuenta institucional de la UADY (Entra ID). Los **participantes externos quedan fuera de este
dominio**: no tienen login y acceden solo por enlace tokenizado (ver `CU-EXP-006`, RF_15).

**Actores:** Secretaría · Director · Investigador · Administrador · Revisor jurídico

### Todos los usuarios internos

- [**CU-ACC-001**](<CU-ACC-001 Iniciar sesión con cuenta institucional.md>) Iniciar sesión con cuenta institucional — *Secretaría · Director · Investigador · Administrador · Revisor jurídico*
  Autenticarse con Entra ID; el sistema aplica el RBAC de RNF_02 según el rol. — `RF_01`, `RNF_02`

---

## Artefactos relacionados

- [README maestro](../README.md)
- [Diagrama general de casos de uso](../../diagramas/01_casos_de_uso.md)
- [Arquitectura lógica](../../diagramas/03_arquitectura_logica.md)
- Requisitos: `RF_01`, `RNF_02`
