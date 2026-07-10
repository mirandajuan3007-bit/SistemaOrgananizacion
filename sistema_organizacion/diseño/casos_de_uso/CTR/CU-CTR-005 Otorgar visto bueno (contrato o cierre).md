---
estado: propuesta
version: 0.1
tags:
  - tipo/caso-de-uso
  - dom/contratos
  - tema/contrato
  - tema/voto-bueno
fecha: 2026-07-08
id: CU-CTR-005
modulo: Contratos
actor_principal: Director
requisitos_relacionados:
  - RF_16
  - RF_02
  - RNF_02
dependencias:
  - CU-CTR-001
  - CU-CTR-002
  - CU-PAG-002
---

# CU-CTR-005 Otorgar visto bueno (contrato o cierre)

## Descripción

Tras la aprobación de la revisión jurídica, el contrato entra en `VOBO_DIRECCION` y **no puede
firmarse** sin el visto bueno del Director. El Director decide desde una **tarjeta-resumen
ejecutiva** —participante, proyecto, monto, rubro y su disponible, resultado jurídico, sin
datos bancarios— sin necesidad de abrir el expediente: aprobar (un clic + confirmación) o
devolver con comentario obligatorio. La misma mecánica aplica al **cierre de proyecto**. Así la
aprobación deja rastro (hoy ocurre por correo o de palabra) sin convertir al Director en cuello
de botella.

## Actores

- **Actor principal:** Director (decide)
- **Actores secundarios:** Secretaría (prepara; ve el estado "esperando VoBo"; ejecuta lo que sigue), Sistema/n8n (transición automática M2, notifica, recuerda con M1, audita)

## Precondiciones

- **Contrato:** revisión jurídica concluida sin observaciones pendientes (estado `APROBADO`).
- **Cierre:** proyecto en `EN_CIERRE` con cierre presupuestal consolidado y sin contratos abiertos ni pagos críticos pendientes (RF_02).

## Disparador

La revisión jurídica aprueba; el sistema pasa el contrato a `VOBO_DIRECCION` (M2) y notifica al Director.

## Flujo principal (contrato)

1. Al aprobar el jurídico, el sistema transiciona `APROBADO → VOBO_DIRECCION` automáticamente (M2) y notifica al Director [RN-CTR-13].
2. El Director abre su bandeja y ve la tarjeta-resumen: participante, proyecto, monto, rubro y su disponible, y el resultado de la revisión jurídica — **sin datos bancarios** [RN-CTR-15].
3. El Director pulsa "Dar visto bueno" y confirma [RN-CTR-14] **(M5)**.
4. El sistema registra la decisión en `audit_log` (quién, cuándo, en qué sentido) y habilita el contrato para firma.
5. Al firmar las partes, el contrato pasa a `FIRMADO`; la Secretaría ve el cambio y continúa el flujo. El caso de uso termina.

## Flujos alternativos

### A1. El Director devuelve

1. El Director pulsa "Devolver" y escribe el motivo (obligatorio) [RN-CTR-14].
2. El contrato pasa a `OBSERVADO` con una observación creada a partir del comentario (RF_07).
3. La Secretaría la atiende como cualquier observación (CU-CTR-002) y el ciclo se repite.

### A2. Visto bueno del cierre de proyecto

1. La Secretaría deja el cierre presupuestal consolidado; el proyecto está `EN_CIERRE`.
2. El sistema presenta al Director la tarjeta del cierre: total estimado vs. ejercido y rubros con desviación.
3. Con el visto bueno, el proyecto pasa `EN_CIERRE → CERRADO`; si lo devuelve, permanece `EN_CIERRE` con el comentario registrado [RN-CTR-13].

## Excepciones

### E1. Firma sin visto bueno

1. Se intenta marcar el contrato como `FIRMADO` sin un VoBo registrado.
2. El sistema lo rechaza y explica la restricción [RN-CTR-13].

### E2. Visto bueno sin atender

1. Un VoBo lleva más del umbral configurado (p. ej. 48 h) sin decisión.
2. El barrido M1 genera un recordatorio al Director y una alerta visible a la Secretaría.

### E3. Actor no autorizado

1. Un usuario distinto del rol `DIRECTOR` intenta otorgar el visto bueno.
2. El sistema lo impide: la decisión es personal e indelegable [RN-CTR-16].

## Postcondiciones

- **Éxito:** el contrato queda habilitado para firma (o el proyecto pasa a `CERRADO`), con la decisión auditada.
- **Fallo:** el contrato vuelve a `OBSERVADO` (devolución) o permanece bloqueado sin poder firmarse.

## Reglas de negocio relacionadas

- **RN-CTR-13** (RF_16 / RNF_04): ningún contrato llega a `FIRMADO` ni ningún proyecto pasa a `CERRADO` sin un visto bueno del Director registrado.
- **RN-CTR-14** (RF_16, M5): aprobar exige confirmación explícita; devolver exige comentario obligatorio; nunca hay aprobación automática ni por silencio.
- **RN-CTR-15** (RF_16 / RNF_02): la tarjeta-resumen no muestra datos bancarios (CLABE, cuentas); solo montos y presupuesto.
- **RN-CTR-16** (RF_16 / RNF_02): el visto bueno es personal e indelegable en el sistema; solo el rol `DIRECTOR` de la unidad puede otorgarlo.
