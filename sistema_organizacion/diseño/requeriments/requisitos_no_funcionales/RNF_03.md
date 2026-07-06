# RNF_03 — Disponibilidad del sistema

## por qué existe este requisito en este sistema

Este sistema no opera sobre tareas opcionales ni en contextos de uso casual. Opera sobre procesos que tienen fechas límite institucionales fijas e inamovibles: el cierre presupuestal de fin de año, las fechas de pago de honorarios, los periodos de entrega de documentos para contratos. Si el sistema no está disponible en esos momentos críticos, el impacto es directo y grave: contratos no se pueden registrar, documentos no se pueden cargar, pagos no se pueden gestionar.

El problema que el cliente describió hoy ocurre con el sistema informal que usan actualmente (correos, Word, OneDrive) y uno de los dolores es precisamente la falta de control. Si el sistema nuevo, que se construye como solución a ese problema, tiene interrupciones frecuentes o largas, genera desconfianza y abandono. El personal volvería a los métodos informales.

Adicionalmente, el sistema de automatización (n8n) ejecuta flujos de manera periódica: verifica inactividad de contratos, envía recordatorios, procesa respuestas de correo. Si el sistema está caído durante horas, esos flujos no se ejecutan, las alertas no salen, y los vencimientos no se detectan.

---

## descripción del requisito

El sistema debe estar disponible para sus usuarios en el horario de operación normal de la facultad. El objetivo no es disponibilidad del 99.999% que requeriría infraestructura de alta disponibilidad costosa, sino disponibilidad confiable en horario laboral con tiempo de recuperación corto ante fallos.

**objetivo de disponibilidad:**

- Disponibilidad mínima del 99.5% medida mensualmente en horario de operación (lunes a viernes, 7:00 a 20:00 ).
- Eso equivale a un máximo de aproximadamente 3.3 horas de inactividad no planificada al mes en horario laboral.
- El mantenimiento planificado se programa fuera del horario de operación (noches o fines de semana) y no cuenta como inactividad.

**tiempos de recuperación ante fallo:**

- RTO (Recovery Time Objective): el sistema debe recuperarse en un máximo de 2 horas ante un fallo no planificado.
- Para fallos menores (servicio de aplicación caído, error de proceso): recuperación automática en menos de 5 minutos mediante reinicio de contenedor.
- Para fallos mayores (base de datos corrompida, servidor perdido): recuperación en menos de 4 horas usando el respaldo más reciente.

---

## cómo se mide este requisito

**uptime mensual**
Se instala un monitor externo (UptimeRobot o servicio equivalente) que hace ping al endpoint de health check del sistema cada 5 minutos. El uptime se calcula como el porcentaje del tiempo de horario laboral en que el sistema respondió correctamente durante el mes.

**tiempo de respuesta del health check**
El endpoint `/health` del backend debe responder en menos de 500ms. Si responde en más de 500ms tres veces consecutivas, el monitor registra una degradación de servicio aunque no sea una caída total.

**tiempo de recuperación real**
Se registra en el log de incidencias el timestamp de detección del fallo y el timestamp de restauración completa. La diferencia es el tiempo de recuperación medido, que debe mantenerse bajo el umbral definido.

---

## cómo se traduce en el sistema

### en la infraestructura (Docker + docker-compose)

Todos los servicios del sistema corren en contenedores Docker orquestados con docker-compose. Cada contenedor tiene una política de reinicio automático configurada con `restart: unless-stopped` o equivalente. Si un proceso falla inesperadamente, Docker reinicia el contenedor automáticamente sin intervención humana.

Los servicios que componen el sistema son:

- `app-frontend`: contenedor de Next.js
- `app-backend`: contenedor de NestJS
- `app-database`: contenedor de PostgreSQL con pgvector
- `app-n8n`: contenedor de n8n con su base de datos propia (SQLite o PostgreSQL)
- (opcional) `app-ollama`: contenedor del modelo de lenguaje local si se usa Ollama

Cada contenedor expone un endpoint de health check propio. Docker verifica esos endpoints periódicamente y reinicia el contenedor si el health check falla consecutivamente.

### en el backend (NestJS)

Se implementa un módulo `health` usando `@nestjs/terminus` que expone el endpoint `GET /health`. Este endpoint verifica:

- conexión a la base de datos PostgreSQL
- conexión a la base de datos de n8n (si aplica)
- disponibilidad de la API de Microsoft Graph (verificación ligera, ping)
- espacio en disco disponible en el volumen de logs

La respuesta del health check indica el estado de cada dependencia de forma individual, lo que permite identificar rápidamente cuál componente específico está fallando.

```json
// ejemplo de respuesta del health check
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "graph_api": { "status": "up" },
    "disk": { "status": "up", "used_percent": 42 }
  }
}
```

### en el hospedaje (Azure o VPS Ubuntu)

El servidor donde corre el sistema tiene monitoreo de recursos (CPU, RAM, disco) configurado con alertas. Si la CPU supera el 90% por más de 5 minutos consecutivos, o si el disco supera el 85% de capacidad, se envía una alerta al administrador del sistema.

En Azure App Service, la configuración de escalamiento automático puede manejar picos de carga sin intervención manual.

### en los flujos de n8n

Los flujos de n8n que ejecutan tareas críticas (recordatorios de vencimiento, alertas de inactividad) tienen manejo de errores configurado: si un flujo falla, genera una notificación al administrador con el detalle del error antes de reintentar. Los flujos no fallan silenciosamente.

---

## cómo se evidencia que se cumple

- Existe un dashboard de UptimeRobot (u otro monitor externo) que muestra el historial de disponibilidad del sistema. El reporte mensual muestra el porcentaje de uptime en horario laboral.
- Al detener manualmente el contenedor `app-backend` en el servidor, Docker lo reinicia automáticamente en menos de 30 segundos y el sistema vuelve a responder.
- El endpoint `GET /health` responde con `status: ok` en menos de 500ms cuando todos los servicios están funcionando, y responde con `status: error` indicando qué componente falló cuando hay un problema.
- En el historial de incidentes del sistema, ningún fallo no planificado tiene un tiempo de recuperación registrado mayor a 2 horas.
- Al perder la conexión a internet del servidor momentáneamente y recuperarla, los flujos de n8n que estaban programados durante ese tiempo se ejecutan en cuanto la conexión regresa.

---

## cómo se representa en el diseño

**en la arquitectura**
El diagrama de arquitectura del sistema incluye la capa de infraestructura con los contenedores Docker, sus dependencias entre sí, y los puntos de monitoreo. Se marca explícitamente cuáles contenedores tienen reinicio automático configurado.

**en el diagrama de despliegue**
Existe un diagrama que muestra cómo los contenedores se despliegan en el servidor o en Azure, qué puertos exponen, qué volúmenes persisten datos, y cómo se conectan entre sí.

**en el runbook de operación**
Existe un documento de operación (puede ser un archivo `RUNBOOK.md` en el repositorio) que describe los pasos para: verificar el estado del sistema, reiniciar servicios individualmente, escalar recursos, y restaurar desde un respaldo. Ese documento es la guía del administrador del sistema ante cualquier incidente.

**en el diagrama de red**
Se documenta qué servicios son accesibles desde internet (solo el frontend y el API a través del proxy reverso), cuáles son internos (PostgreSQL, n8n admin), y qué puertos están abiertos en el firewall del servidor.
