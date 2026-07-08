# Preguntas que hay que hacerce 

en este docuemto lo que se haran son las preguintas que hay que reposnderse o los pendientes que no quedan claros del sistema, y quizas tener un contexto mas grande de lo que es el sistema en si.

## preguntas 

1) ¿cada cuanto n8n hará el barrido para chehacr los estados de los procesos?

**RESUELTO (consenso definitivo).** El barrido **no es un solo proceso global**: se divide
en **tres niveles de frecuencia**, y todos los umbrales viven en la tabla
`configuracion_automatizacion` (nunca hardcodeados), configurables por unidad.

| nivel | cada cuánto corre | qué revisa | ejecutor |
|---|---|---|---|
| **crítico** | cada **1 h**, solo en horario laboral (L–V 7:00–20:00) | contratos/observaciones vencidos (24/48/72h), correos sin respuesta, respaldo de M4 | n8n |
| **diario** | 1×/día a las **7:00** (antes de la jornada) | expedientes incompletos, pagos y complementos pendientes, semáforos del dashboard | n8n |
| **nocturno** | 1×/día a las **2:00** | mantenimiento: normalización de nombres, mapeo de carpetas OneDrive, reportes | n8n |

**Por qué esta cadencia y no otra:**
- **Se ajusta a la regla de negocio más fina, que es el umbral de 24 h.** Un barrido crítico
  cada hora detecta un vencimiento de 24 h con ≤1 h de retraso: más que suficiente. Bajar a
  cada 5 min no aporta nada operativo (nadie reacciona en minutos a un "sin movimiento") y sí
  multiplica llamadas a Graph y ejecuciones de n8n.
- **El crítico corre solo en horario laboral** porque sus alertas las consume una persona en
  su jornada; correrlo de madrugada generaría alertas que nadie ve y gastaría cuota de API.
- **El diario a las 7:00** hace que la secretaría abra el sistema con la lista de pendientes
  ya lista, alineado con el ritmo humano real de trabajo.
- **El nocturno a las 2:00** hace el mantenimiento pesado cuando la carga es cero.
- Es coherente con RNF_11 (regla 2: *ausencia = M1*): solo un barrido por tiempo puede
  detectar **lo que NO pasó**; un evento no existe para algo que no ocurrió.

**Descartado:** (a) un único barrido global —forzaría una sola frecuencia: demasiado seguido
para mantenimiento o demasiado lento para vencimientos; (b) puro event-driven sin barrido —no
puede ver ausencias. Como los umbrales ya son configurables, una unidad de alto volumen puede
apretar el crítico a 30 min sin tocar código.

2) ¿Los participantes externos tienen correo institucional UADY?

**RESUELTO (2026-07-08, respuesta del cliente).** No necesariamente: usan **Gmail/Hotmail**.
Consecuencia de diseño: cualquier mecanismo de acceso para participantes basado en Entra ID
queda descartado. La recepción de documentos es **híbrida por fases** (RF_15): fase 1 correo
asistido con clasificación confirmada por la Secretaría; fase 2 **enlace tokenizado** por
expediente (sin contraseña); portal con login diferido.

3) ¿Quién es el "despacho externo" que revisa contratos?

**RESUELTO (2026-07-08, respuesta del cliente).** Es el **jurídico de la UADY**, no un
despacho contratado, y **sí se le puede pedir que use el sistema** "para hacerle la vida más
fácil". Consecuencia: existe el rol `REVISOR_JURIDICO` (cuenta institucional) que registra el
resultado de la revisión y sus observaciones dentro del sistema; el correo con folio (RF_08)
queda como canal alterno si responde fuera. El prototipo se actualizó: "despacho externo" →
"Jurídico UADY".

4) ¿El Director necesita aprobar algo formalmente o solo enterarse?

**RESUELTO (2026-07-08, respuesta del cliente).** **Sí aprueba**: contratos y cierres, "más
que nada por el dinero que se maneja". Restricción clave: el Director no puede estar en tantas
cosas a la vez — la información debe llegarle **resumida y rápida de visualizar** para decidir
en segundos. Consecuencia: RF_16 (visto bueno del Director), estado `VOBO_DIRECCION` en la
máquina del contrato, VoBo obligatorio para `EN_CIERRE → CERRADO`, y bandeja de
tarjetas-resumen con dos acciones (aprobar / devolver con comentario) en la vista del
Director. Transferencia entre rubros: **sigue pendiente** por decisión del cliente.

5) ¿