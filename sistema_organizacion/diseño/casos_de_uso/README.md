---
tags:
  - tipo/indice
  - tema/mapa-maestro
---

# Casos de uso — Mapa maestro

Los casos de uso del **módulo de honorarios** se organizan en **dominios verticales por
fase del proceso**. Cada dominio es una carpeta autocontenida con su propio índice
(`CU-XXX Índice.md`), que lista sus casos de uso con el **actor** responsable de cada uno.

La numeración sigue el patrón `CU-DOM-NNN` (por ejemplo `CU-CTR-005`). Los identificadores
antiguos `UCn` del diagrama general se conservan en la tabla de correspondencia al final.

Fuente de verdad del diagrama general (Mermaid), trazabilidad a RF/RNF y acciones que exigen
confirmación humana: [`../diagramas/01_casos_de_uso.md`](../diagramas/01_casos_de_uso.md).

---

## Nomenclatura — qué significa cada código

Los casos de uso se identifican con la forma **`CU-DOM-NNN`**:

- **`CU`** — **C**aso de **U**so.
- **`DOM`** — código de **tres letras del dominio** (la fase del proceso). Se decodifica abajo.
- **`NNN`** — número **secuencial** dentro del dominio (`001`, `002`, …).

> Ejemplo: **`CU-CTR-005`** = el 5.º caso de uso del dominio **Contratos**.

### Códigos de dominio (qué significa cada uno)

| código | se lee | dominio | qué agrupa |
|---|---|---|---|
| **ACC** | **ACC**eso | Acceso | autenticación e ingreso al sistema |
| **PRY** | **PR**o**Y**ecto | Proyectos | alta/cierre de proyectos y su presupuesto por rubro |
| **EXP** | **EXP**ediente | Participantes y Expediente | participante, checklist documental, carga y recepción de documentos |
| **CTR** | con**TR**ato | Contratos | ciclo de vida del contrato, observaciones, folio y visto bueno |
| **PAG** | **PAG**o | Pagos | registro de pagos de honorarios y cierre presupuestal |
| **CNS** | **C**o**NS**ulta | Consulta | búsqueda, dashboards, historial y asistente de IA |
| **CTL** | con**T**ro**L** | Control | alertas, bandeja de pendientes y administración |

### Otras siglas que aparecen dentro de los CU

- **RF / RNF** — **R**equisito **F**uncional / **R**equisito **N**o **F**uncional (carpeta `../requeriments/`).
- **RN** — **R**egla de **N**egocio; dentro de cada CU se citan como `RN-DOM-NN` (p. ej. `RN-CTR-14`).
- **M1–M6** — mecanismos del actor **Sistema/n8n** definidos en `RNF_11` (M1 barridos/recordatorios,
  M2 transiciones automáticas, M4 correo entrante, M5 **confirmación humana obligatoria**, …).
- **VoBo** — Visto Bueno: aprobación ejecutiva del Director (`RF_16`).
- **RBAC** — control de acceso por roles (`RNF_02`).

---

## Actores del sistema

| actor | rol | alcance |
|---|---|---|
| **Secretaría** | usuario operativo principal (Elda) | lectura/escritura total en su unidad |
| **Director** | vista ejecutiva; decide escalados y **otorga vistos buenos** (RF_16) | lectura + decisión; sin datos bancarios |
| **Investigador** | participante interno con cuenta | solo su expediente |
| **Administrador** | técnico del sistema | configuración, usuarios, auditoría |
| **Sistema / n8n** | actor no humano (barridos, alertas, asociación de correo) | mecanismos M1–M6 (RNF_11) |
| **Revisor jurídico (UADY)** | jurídico de la UADY que revisa contratos | lectura de contratos + observaciones |
| **Participante externo** | envía documentos sin cuenta (Gmail/Hotmail, RF_15) | acceso anónimo acotado a su enlace |

---

## Dominios

### Prioritarios (MVP)

| dominio | nombre | responsable principal | necesidad que cubre | CUs | índice |
|---|---|---|---|---|---|
| **ACC** | Acceso | Administrador · Secretaría | entrar con identidad institucional (Entra ID) | 1 | [ACC](ACC/CU-ACC%20%C3%8Dndice.md) |
| **PRY** | Proyectos | Secretaría | alta/cierre de proyectos y su presupuesto por rubro | 2 | [PRY](PRY/CU-PRY%20%C3%8Dndice.md) |
| **EXP** | Expediente | Secretaría | expediente digital del participante y su documentación | 6 | [EXP](EXP/CU-EXP%20%C3%8Dndice.md) |
| **CTR** | Contratos | Secretaría · Director · Jurídico | ciclo de vida del contrato con VoBo del Director | 5 | [CTR](CTR/CU-CTR%20%C3%8Dndice.md) |
| **PAG** | Pagos | Secretaría | registrar pagos de honorarios y cierre presupuestal | 2 | [PAG](PAG/CU-PAG%20%C3%8Dndice.md) |

### Transversales

| dominio | nombre | responsable principal | necesidad que cubre | CUs | índice |
|---|---|---|---|---|---|
| **CNS** | Consulta | Secretaría · Director | búsqueda, dashboards, historial y asistente de IA | 3 | [CNS](CNS/CU-CNS%20%C3%8Dndice.md) |
| **CTL** | Control | Sistema/n8n · Administrador | alertas, bandeja de pendientes y administración | 2 | [CTL](CTL/CU-CTL%20%C3%8Dndice.md) |

**Total: 21 casos de uso.**

### Fuera del alcance actual (diferidos)

- **Portal completo con login para participantes externos** — diferido; solo si los enlaces
  tokenizados (RF_15 fase 2) resultan insuficientes.
- **Transferencia entre rubros** — pendiente por decisión del usuario (ver
  [[pendientes-diseno]]).

---

## Correspondencia con la numeración anterior (UCn → CU-DOM-NNN)

| UCn | CU-DOM-NNN | título |
|---|---|---|
| UC1 | CU-ACC-001 | Iniciar sesión con cuenta institucional |
| UC2 | CU-PRY-001 | Registrar / editar proyecto |
| UC3 | CU-PRY-002 | Cerrar proyecto |
| UC4 | CU-EXP-001 | Registrar participante |
| UC5 | CU-EXP-002 | Consultar expediente digital |
| UC6 | CU-EXP-003 | Definir documentos requeridos |
| UC7 | CU-EXP-004 | Cargar / versionar documento |
| UC19 | CU-EXP-005 | Recibir y clasificar documento externo |
| UC21 | CU-EXP-006 | Subir documento por enlace seguro |
| UC8 | CU-CTR-001 | Gestionar contrato y estados |
| UC9 | CU-CTR-002 | Registrar / atender observación |
| UC10 | CU-CTR-003 | Enviar solicitud de contrato |
| UC11 | CU-CTR-004 | Seguimiento por folio |
| UC20 | CU-CTR-005 | Otorgar visto bueno (contrato / cierre) |
| UC12 | CU-PAG-001 | Registrar pago de honorarios |
| UC13 | CU-PAG-002 | Cierre presupuestal |
| UC14 | CU-CNS-001 | Buscar / dashboard operativo |
| UC15 | CU-CNS-002 | Consultar historial de cambios |
| UC16 | CU-CNS-003 | Consultar al asistente de IA |
| UC17 | CU-CTL-001 | Alertas y bandeja de pendientes |
| UC18 | CU-CTL-002 | Administrar usuarios / config / auditoría |

---

## Taxonomía de etiquetas (frontmatter)

Cada archivo declara etiquetas faceteadas (una etiqueta solo vale si agrupa varios elementos):

- **`tipo/`** (exactamente 1): `indice`, `caso-de-uso`, `plantilla`, `proceso`, `referencia`.
- **`dom/`** (0+): `acceso`, `proyectos`, `expediente`, `contratos`, `pagos`, `consulta`, `control` (CNS usa `dom/consulta`, sin relación con el código de carpeta).
- **`tema/`** (0+): `contrato`, `pago`, `documento`, `presupuesto`, `ia`, `alertas`,
  `auditoria`, `voto-bueno`, `correo`, `enlace-token`, etc.
