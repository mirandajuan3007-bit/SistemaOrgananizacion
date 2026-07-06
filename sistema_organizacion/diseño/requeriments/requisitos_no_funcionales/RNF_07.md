# RNF_07 — Privacidad y protección de datos personales

## por qué existe este requisito en este sistema

El sistema almacena y procesa información personal de investigadores, estudiantes y participantes en proyectos universitarios. Esa información incluye datos que en México están protegidos por ley: RFC, CURP, número de INE, datos bancarios (CLABE interbancaria, banco, número de cuenta), domicilio, y documentos de identidad.

En México, la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y sus normas derivadas establecen obligaciones concretas sobre cómo deben manejarse estos datos: deben recabarse con propósito específico, almacenarse con medidas de seguridad, no divulgarse sin consentimiento, y eliminarse cuando ya no sean necesarios. La UADY como institución pública también está sujeta a la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO).

Más allá del marco legal, hay una razón operativa: el sistema manejará datos bancarios que están directamente vinculados al cobro de honorarios. Un RFC o una CLABE expuesta en el lugar equivocado puede derivar en fraude, errores de pago, o reclamaciones legales hacia la institución.

A diferencia de los demás RNFs que son sobre cómo el sistema funciona, este es sobre cómo el sistema trata a las personas.

---

## descripción del requisito

El sistema debe tratar los datos personales sensibles con medidas técnicas que limiten su exposición, controlen quién puede verlos, y garanticen que no aparecen en lugares inesperados.

**campos sensibles del sistema:**

| campo | entidad | nivel de sensibilidad |
|---|---|---|
| RFC | participante | alto — datos fiscales |
| CURP | participante | alto — identificador único nacional |
| CLABE interbancaria | participante | crítico — datos bancarios |
| número de cuenta bancaria | participante | crítico — datos bancarios |
| número de INE | participante | medio — documento de identidad |
| domicilio completo | participante | medio |
| importe de pago | pago | medio — información financiera |

**principios aplicados:**

- **minimización**: el sistema solo almacena los datos personales que son estrictamente necesarios para el proceso que los requiere. No se registran campos "por si acaso".
- **acceso restringido**: los datos sensibles solo son accesibles para los roles que operativamente los necesitan.
- **cifrado**: los datos más sensibles (RFC, CURP, datos bancarios) se almacenan cifrados en la base de datos, no en texto plano.
- **no en logs**: los datos personales sensibles nunca aparecen en los logs del sistema, en mensajes de error, ni en respuestas de la API que no los soliciten explícitamente.
- **retención**: existe una política de cuánto tiempo se conservan los datos personales y un mecanismo para cumplirla.

---

## cómo se mide este requisito

**cobertura de cifrado**
Los campos clasificados como "alto" y "crítico" en la tabla anterior están almacenados cifrados en la base de datos. Esto se verifica consultando directamente la tabla en PostgreSQL: el valor almacenado en la columna `rfc` o `clabe` no es legible en texto plano.

**ausencia de PII en logs**
Se ejecuta una búsqueda en los archivos de log del sistema buscando patrones que coincidan con RFC (formato XX-DDDDDD-DDDD), CURP (18 caracteres alfanuméricos), o CLABE (18 dígitos). Los resultados deben ser vacíos.

**control de acceso a datos sensibles**
Se verifica que los endpoints que retornan campos sensibles tienen el guard de roles configurado correctamente y que solo los roles autorizados pueden obtener esos valores sin ofuscar. Todos los demás roles reciben esos campos como `null` o `"***"`.

**registro de acceso a datos sensibles**
Cada vez que un usuario accede a los datos bancarios de un participante, queda un registro en `audit_log`. Se verifica que en el log existen entradas de tipo `SENSITIVE_DATA_ACCESS` para cada consulta de ese tipo.

---

## cómo se traduce en el sistema

### en la base de datos (PostgreSQL + pgcrypto)

Se usa la extensión `pgcrypto` de PostgreSQL para cifrar los campos sensibles a nivel de base de datos. Los campos se almacenan como `bytea` (bytes cifrados) y el sistema los descifra cuando los necesita usar.

La llave de cifrado no se almacena en la base de datos ni en el código fuente. Se almacena como variable de entorno en el servidor (o en Azure Key Vault si se despliega en Azure).

En el schema de Prisma, los campos sensibles están marcados como `Bytes` en lugar de `String`, lo que hace evidente en el código que requieren manejo especial:

```typescript
// en el schema de Prisma
model Participante {
  id          String @id @default(uuid())
  nombre      String
  email       String
  rfc         Bytes  // cifrado con pgcrypto
  curp        Bytes  // cifrado con pgcrypto
  clabe       Bytes  // cifrado con pgcrypto
  // ...
}
```

El servicio de participantes tiene métodos específicos para leer y escribir campos sensibles que gestionan el cifrado/descifrado de forma centralizada.

### en el backend (NestJS)

**interceptor de sanitización de logs**
Se implementa un `LogSanitizationInterceptor` que, antes de escribir cualquier log, aplica expresiones regulares para detectar y reemplazar patrones que coincidan con RFC, CURP, CLABE, o números de tarjeta con el texto `[DATO_SENSIBLE_OMITIDO]`. Este interceptor se aplica al sistema de logging de NestJS globalmente.

**serialización selectiva por rol**
Los DTOs de respuesta del API usan grupos de serialización de `class-transformer`. Los campos sensibles solo se incluyen en la respuesta cuando el usuario tiene el rol autorizado. Para todos los demás roles, esos campos quedan excluidos automáticamente de la serialización sin necesidad de if/else en cada endpoint.

```typescript
// ejemplo conceptual de DTO con grupos de serialización
export class ParticipanteResponseDto {
  id: string;
  nombre: string;
  
  @Expose({ groups: ['secretaria', 'admin'] })
  rfc: string;
  
  @Expose({ groups: ['secretaria', 'admin'] })
  clabe: string;
}
```

**registro de acceso a datos sensibles**
Los endpoints que acceden a campos sensibles llaman explícitamente al `AuditService` con acción `SENSITIVE_DATA_ACCESS`, registrando quién accedió a los datos de qué participante y cuándo.

### en el frontend (Next.js)

Los campos sensibles nunca se almacenan en localStorage, sessionStorage, ni en el caché del navegador. TanStack Query está configurado para no persistir en disco las respuestas que contienen datos sensibles.

Cuando la interfaz muestra datos sensibles (por ejemplo, la pantalla de datos bancarios para la secretaría), hay un aviso visual que indica que se está viendo información confidencial. Los campos como CLABE se muestran con enmascaramiento parcial por defecto (`**** **** **** 1234`) y requieren un clic explícito para revelar el valor completo, generando el registro de auditoría en ese momento.

---

## cómo se evidencia que se cumple

- Al consultar directamente la tabla `participantes` en PostgreSQL con un cliente SQL, los campos RFC, CURP y CLABE muestran valores cifrados (bytes ilegibles), no texto plano.
- Al revisar los archivos de log del servidor, no aparece ningún RFC, CURP ni CLABE en texto plano en ninguna línea.
- Al hacer una petición GET al endpoint de participante con un token de rol `INVESTIGADOR`, la respuesta no contiene los campos `rfc`, `curp` ni `clabe` en ningún formato. Los campos están ausentes de la respuesta JSON.
- Al hacer una petición GET al endpoint de participante con un token de rol `SECRETARIA`, la respuesta contiene esos campos descifrados correctamente.
- Al revisar `audit_log`, cada consulta a datos sensibles tiene su registro correspondiente.
- La variable de entorno que contiene la llave de cifrado no aparece en ningún archivo del repositorio de código (`.gitignore` incluye el archivo `.env`).

---

## cómo se representa en el diseño

**en el diagrama de la base de datos**
Los campos cifrados están marcados con una anotación especial (por ejemplo, un candado o la nota "cifrado con pgcrypto"). Esto comunica desde el diseño que esos campos requieren manejo especial en la capa de aplicación.

**en el flujo de datos con PII**
Existe un diagrama de flujo que muestra el ciclo de vida de un dato sensible: desde dónde se captura (formulario del frontend), cómo viaja (HTTPS, nunca en texto plano en logs), cómo se almacena (cifrado en base de datos), y desde dónde es accesible (solo por roles autorizados via endpoint protegido).

**en la política de retención**
Se documenta cuánto tiempo se conservan los datos personales de participantes después de que termina su relación con el proyecto. Por ejemplo, los datos bancarios se mantienen el tiempo que establecen las políticas de archivo institucional (típicamente 5 años para documentos fiscales) y luego se eliminan o anonimizan según las instrucciones de la institución.

**en el aviso de privacidad del sistema**
El sistema muestra un aviso de privacidad al primer login de cada usuario que explica qué datos se recaban, para qué, y cuáles son sus derechos. Esto cumple con el requisito de información al interesado establecido en la LGPDPPSO.
