# Máquinas de estado — Módulo de honorarios

> Define las **transiciones válidas** entre estados. La base de datos fija el conjunto de
> valores (ENUM); estas máquinas fijan *qué transición se permite desde dónde* y se validan en
> la capa de negocio (RNF_04). Cada transición genera un registro en `audit_log` (RNF_01) y es
> consultable como historial (RF_14).

---

## 1. Contrato (RF_06) — la más crítica

```mermaid
stateDiagram-v2
    [*] --> BORRADOR : crear registro (expediente listo)
    BORRADOR --> ENVIADO : enviar solicitud (M5, confirmación humana)
    ENVIADO --> EN_REVISION : acuse del revisor jurídico
    EN_REVISION --> OBSERVADO : registrar observación(es)
    EN_REVISION --> APROBADO : sin observaciones
    OBSERVADO --> ENVIADO : subir corrección / nueva versión
    APROBADO --> VOBO_DIRECCION : pasa a visto bueno (automático M2, RF_16)
    VOBO_DIRECCION --> FIRMADO : VoBo otorgado → firma de partes
    VOBO_DIRECCION --> OBSERVADO : Director devuelve con comentario
    FIRMADO --> VIGENTE : resguardo del contrato final
    VIGENTE --> CERRADO : ciclo económico completo
    CERRADO --> [*]

    note right of OBSERVADO
        No puede cerrarse mientras
        haya observaciones CRITICAS
        sin VALIDAR (RF_07)
    end note

    note right of VOBO_DIRECCION
        Solo el rol DIRECTOR decide.
        Devolver exige comentario,
        que se registra como
        observación (RF_16)
    end note
```

**Reglas duras:**
- No se puede saltar de `BORRADOR` a `FIRMADO` (RNF_04): debe pasar por revisión.
- Pasar a `OBSERVADO` **exige** registrar al menos una observación (RF_06).
- El ciclo `OBSERVADO → ENVIADO → EN_REVISION` puede repetirse N veces sin perder historial.
- **Ningún contrato llega a `FIRMADO` sin pasar por `VOBO_DIRECCION`** (RF_16): la entrada a
  VoBo es automática al aprobar la revisión; la salida solo la decide el Director (M5).
- `VIGENTE → CERRADO` solo si el pago llegó a estado terminal (`COMPLETO`).

> **Nota sobre el revisor (decisión 2026-07-08):** la revisión de `EN_REVISION` la hace el
> **jurídico de la UADY** (no un despacho contratado). Se le pedirá usar el sistema con rol
> `REVISOR_JURIDICO` (registra resultado y observaciones directamente); el correo con folio
> (RF_08) queda como canal alterno si responde fuera del sistema.

---

## 2. Documento / requisito documental (RF_04, RF_10)

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE : requisito creado en el checklist
    PENDIENTE --> RECIBIDO : se carga archivo
    RECIBIDO --> EN_REVISION : revisor lo toma
    EN_REVISION --> APROBADO : cumple
    EN_REVISION --> OBSERVADO : requiere corrección
    EN_REVISION --> RECHAZADO : no válido
    OBSERVADO --> RECIBIDO : nueva versión (documento_padre_id)
    RECHAZADO --> RECIBIDO : re-carga
    PENDIENTE --> EXCEPTUADO : excepción justificada (RF_04)
    APROBADO --> [*]
    EXCEPTUADO --> [*]
```

**Regla:** una nueva versión no sobrescribe la anterior; crea un `documento` hijo y marca
`es_version_vigente`. El expediente pasa a COMPLETO solo cuando no quedan requisitos
OBLIGATORIOS fuera de `APROBADO`/`EXCEPTUADO`.

---

## 3. Pago de honorarios (RF_09)

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE : contrato VIGENTE habilita pago
    PENDIENTE --> EN_PROCESO : factura + evidencia registradas (M5)
    EN_PROCESO --> CHEQUE_EMITIDO : se emite cheque/transferencia
    CHEQUE_EMITIDO --> PENDIENTE_COBRO : entregado, aún no cobrado
    PENDIENTE_COBRO --> COBRADO : participante cobra
    CHEQUE_EMITIDO --> COBRADO : cobro inmediato
    COBRADO --> COMPLEMENTO_PENDIENTE : falta complemento de pago
    COBRADO --> COMPLETO : no requiere complemento
    COMPLEMENTO_PENDIENTE --> COMPLETO : complemento recibido
    COMPLEMENTO_PENDIENTE --> INCOMPLETO : cierra sin complemento
    COMPLETO --> [*]
    INCOMPLETO --> [*]
```

**Reglas duras:**
- No se registra pago si el contrato no está `VIGENTE` y faltan evidencias mínimas (RF_09).
- `INCOMPLETO` (cobró pero sin complemento) **marca al participante como pendiente para
  futuras contrataciones** — dato clave que hoy genera problemas en auditoría.
- Toda transición de pago es **M5 (confirmación humana obligatoria)** — nunca automática
  (RNF_11, regla 3).

---

## 4. Proyecto (RF_02)

```mermaid
stateDiagram-v2
    [*] --> BORRADOR : alta
    BORRADOR --> ACTIVO : datos mínimos completos
    ACTIVO --> EN_CIERRE : operación concluida, iniciando cierre
    EN_CIERRE --> CERRADO : VoBo del Director sobre el cierre presupuestal (RF_16)
    ACTIVO --> SUSPENDIDO : pausa administrativa
    SUSPENDIDO --> ACTIVO : reanuda
    CERRADO --> [*]

    note right of EN_CIERRE
        No cierra si hay contratos
        abiertos o pagos críticos
        pendientes (RF_02).
        Cerrar exige además el
        visto bueno del Director
        (RF_16)
    end note
```

---

## 5. Participante (RF_03)

```mermaid
stateDiagram-v2
    [*] --> ACTIVO : alta en proyecto
    ACTIVO --> INCOMPLETO : faltan documentos obligatorios
    INCOMPLETO --> LISTO_PARA_CONTRATO : expediente documental completo
    ACTIVO --> LISTO_PARA_CONTRATO : ya tenía todo
    LISTO_PARA_CONTRATO --> OBSERVADO : contrato con observaciones
    OBSERVADO --> LISTO_PARA_CONTRATO : corregido
    LISTO_PARA_CONTRATO --> EN_PAGO : contrato VIGENTE
    EN_PAGO --> CERRADO : pago COMPLETO
    ACTIVO --> CANCELADO : baja lógica (conserva historial)
    CERRADO --> [*]
    CANCELADO --> [*]
```

> **Nota de diseño:** el estado del participante es en buena medida *derivado* de sus
> componentes (expediente, contrato, pago). Se persiste para poder filtrarlo/indexarlo rápido
> (RNF_09) pero su fuente de verdad son las entidades subordinadas; se recalcula ante cada
> cambio relevante.
