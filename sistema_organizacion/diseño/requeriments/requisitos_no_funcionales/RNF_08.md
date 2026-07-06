# RNF_08 — Recuperabilidad ante fallos

## por qué existe este requisito en este sistema

Los procesos que el sistema administra tienen fechas límite institucionales fijas que no se pueden mover: el cierre presupuestal ocurre en fechas determinadas por la UADY y las políticas de Hacienda, los pagos de honorarios tienen calendarios establecidos, las entregas de documentación para contratos tienen plazos legales.

Si el sistema pierde datos en un momento crítico (fallo del servidor, corrupción de la base de datos, error humano que elimina un expediente activo), el impacto no es un inconveniente técnico. Es un impacto directo en pagos a personas reales que trabajaron y dependen de recibir su compensación a tiempo. Reconstruir expedientes perdidos manualmente puede tomar semanas y puede ser imposible si los correos originales también se pierden.

El sistema reemplaza el método actual de trabajo. Cuando el personal administrativo migre a él, dejará de mantener los registros informales que usaba antes. Si el sistema falla sin posibilidad de recuperación, no hay fallback.

Adicionalmente, este es un sistema construido y mantenido por un equipo pequeño (posiblemente una sola persona). No hay un equipo de DevOps dedicado que responda incidentes 24/7. La estrategia de recuperación debe ser lo suficientemente simple y documentada para que alguien con acceso al servidor pueda ejecutarla.

---

## descripción del requisito

El sistema debe tener una estrategia de respaldo y recuperación que garantice que, ante cualquier tipo de fallo, los datos del sistema pueden ser restaurados a un estado reciente dentro de un tiempo razonable.

**objetivos de recuperación:**

- **RPO (Recovery Point Objective)**: el respaldo más antiguo que se puede aceptar perder. Para este sistema: máximo 24 horas. Eso significa que los respaldos automáticos ocurren al menos una vez al día.
- **RTO (Recovery Time Objective)**: el tiempo máximo para restaurar el sistema desde cero después de un fallo. Para este sistema: máximo 4 horas usando el respaldo más reciente. Eso incluye restaurar la base de datos, los contenedores y las configuraciones.

**alcance del respaldo:**

Los datos que deben respaldarse son:

- Base de datos PostgreSQL: todos los datos del sistema (proyectos, contratos, participantes, pagos, documentos, audit log, usuarios)
- Configuraciones de n8n: los flujos de automatización configurados
- Variables de entorno y configuraciones del sistema: no se respaldan en el mismo repositorio que el código, sino en un lugar seguro separado

Los archivos físicos de documentos (contratos, facturas, evidencias) NO necesitan ser respaldados por el sistema porque ya viven en SharePoint/OneDrive de Microsoft, que tiene su propia estrategia de respaldo y versionado. El sistema solo almacena referencias a esos archivos.

---

## cómo se mide este requisito

**frecuencia de respaldos**
Se verifica que el script de respaldo automático está programado para ejecutarse al menos una vez por día. El log del sistema de automatización (n8n o cron) muestra que el respaldo se ejecutó exitosamente en los últimos 7 días.

**prueba de restauración mensual**
Una vez al mes, se ejecuta una restauración completa en un entorno de prueba usando el respaldo del día anterior. La restauración se considera exitosa si el sistema inicia correctamente, los datos del respaldo son accesibles, y la restauración se completó en menos de 4 horas. Este proceso y su resultado se documentan en el log de incidentes.

**integridad del respaldo**
Cada respaldo incluye un hash SHA-256 del archivo generado. Antes de restaurar, se verifica que el hash del archivo coincide con el hash registrado al momento del respaldo, garantizando que el archivo no fue corrompido durante el almacenamiento o la transferencia.

**alertas de fallo de respaldo**
Si el proceso de respaldo automático falla, se envía una alerta inmediata al administrador del sistema. No debe haber fallos silenciosos de respaldo.

---

## cómo se traduce en el sistema

### en la automatización de respaldos (n8n o cron)

Se implementa un flujo de respaldo automático que se ejecuta diariamente a las 2:00 AM (fuera del horario de operación). El flujo realiza los siguientes pasos:

1. Ejecutar `pg_dump` sobre la base de datos PostgreSQL, generando un archivo de respaldo comprimido con timestamp en el nombre (`backup_YYYY-MM-DD_HH-MM.sql.gz`)
2. Exportar la configuración de n8n (workflows y credenciales cifradas)
3. Calcular el hash SHA-256 del archivo de respaldo
4. Subir el archivo al destino de almacenamiento de respaldos (carpeta de OneDrive institucional o Azure Blob Storage)
5. Registrar en un log de respaldos: fecha, tamaño del archivo, hash, y estado (exitoso/fallido)
6. Si el proceso falla en cualquier punto, enviar alerta por correo al administrador del sistema

Los respaldos se retienen por 30 días. Los respaldos de fin de mes se retienen por 12 meses.

### en la infraestructura de Docker

Los volúmenes de Docker que persisten los datos de PostgreSQL y n8n están montados en directorios del sistema de archivos del servidor con rutas conocidas. Esto facilita la restauración: simplemente se reemplaza el contenido del directorio con el respaldo y se reinicia el contenedor.

```yaml
# fragmento de docker-compose.yml
services:
  database:
    volumes:
      - /var/data/sistema_uady/postgres:/var/lib/postgresql/data
  n8n:
    volumes:
      - /var/data/sistema_uady/n8n:/home/node/.n8n
```

### en el procedimiento de restauración

Existe un documento `RUNBOOK_RECOVERY.md` en el repositorio que describe paso a paso cómo restaurar el sistema ante diferentes escenarios de fallo:

**escenario A: fallo del proceso de aplicación (NestJS o Next.js se cae)**
- Docker reinicia el contenedor automáticamente (política de reinicio)
- Si el reinicio automático falla, el administrador ejecuta `docker-compose restart app-backend` o `app-frontend`
- Tiempo estimado: menos de 5 minutos

**escenario B: fallo de la base de datos (PostgreSQL no inicia o datos corrompidos)**
- Detener todos los contenedores: `docker-compose down`
- Descargar el respaldo más reciente del almacenamiento de respaldos
- Verificar el hash SHA-256 del archivo
- Restaurar el volumen: `pg_restore` sobre el volumen de datos de PostgreSQL
- Iniciar los contenedores: `docker-compose up -d`
- Verificar el health check
- Tiempo estimado: 1-3 horas dependiendo del tamaño del respaldo

**escenario C: pérdida total del servidor**
- Aprovisionar un nuevo servidor con Docker instalado
- Clonar el repositorio del sistema
- Descargar el respaldo más reciente
- Configurar las variables de entorno (desde el almacenamiento seguro de configuraciones)
- Restaurar los volúmenes de datos
- Iniciar los contenedores
- Tiempo estimado: 3-4 horas

---

## cómo se evidencia que se cumple

- El log de respaldos de los últimos 30 días muestra que no ha habido ningún día sin respaldo exitoso.
- Al ejecutar la prueba mensual de restauración, el sistema restaurado tiene los datos del respaldo accesibles y funcionando en menos de 4 horas.
- Al revisar el almacenamiento de respaldos, existen archivos de respaldo de los últimos 30 días con sus hashes correspondientes.
- Al simular un fallo del proceso de base de datos y ejecutar el procedimiento de restauración documentado, un administrador que nunca lo ha hecho antes puede completarlo siguiendo solo el `RUNBOOK_RECOVERY.md` sin asistencia adicional.
- Si el proceso de respaldo automático falla, llega una alerta por correo al administrador en menos de 30 minutos después del fallo.

---

## cómo se representa en el diseño

**en el diagrama de infraestructura**
El diagrama de infraestructura muestra el flujo del proceso de respaldo: desde el servidor donde corre el sistema, hasta el destino de almacenamiento de los archivos de respaldo. Se indica la frecuencia del respaldo y la política de retención.

**en el diagrama de arquitectura**
Los volúmenes de Docker que persisten datos están marcados explícitamente en el diagrama de arquitectura con sus rutas en el servidor. Esto hace evidente qué directorios del servidor son críticos.

**en el runbook**
El archivo `RUNBOOK_RECOVERY.md` existe en el repositorio y está actualizado. Es el documento central de operación ante incidentes. Cualquier persona con acceso al repositorio y al servidor puede seguirlo.

**en el plan de pruebas**
El plan de pruebas del sistema incluye una categoría de "pruebas de recuperación" con los casos de prueba para los tres escenarios de fallo documentados. Los resultados de las pruebas de recuperación se archivan mensualmente.
