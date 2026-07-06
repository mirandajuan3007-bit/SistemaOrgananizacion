# RNF_02 — Seguridad y control de acceso basado en roles

## por qué existe este requisito en este sistema

El sistema almacena y opera sobre información institucional sensible y personal: RFC, CURP, datos bancarios para pago de honorarios, números de INE, currículos, contratos firmados, y montos de pago. Además, los proyectos de investigación tienen información confidencial sobre presupuestos y convenios con clientes externos (ayuntamientos, empresas, dependencias).

No todos los usuarios del sistema deben tener el mismo nivel de acceso. Un investigador que participa en un proyecto solo necesita ver su propio expediente y saber qué documentos le faltan. La secretaría necesita ver y modificar todos los expedientes de todos los proyectos. El director necesita vista ejecutiva del estado de los proyectos sin necesariamente ver datos bancarios de participantes. Un administrador del sistema necesita acceso técnico para configuración pero no necesariamente a datos operativos.

Sin control de acceso, cualquier persona que obtenga acceso al sistema podría ver los datos bancarios de todos los investigadores, modificar estados de contratos, eliminar documentos, o exportar el historial completo de pagos. Eso es un riesgo legal, institucional y operativo.

Adicionalmente, el sistema se autenticará contra Microsoft Entra ID (Azure AD), que es la plataforma de identidad institucional de UADY. Esto significa que los usuarios no crean credenciales nuevas: usan su cuenta de correo institucional existente, est acuenat es proporcionada por la UADY.

---

## descripción del requisito

El sistema debe garantizar que solo usuarios autenticados puedan acceder a cualquier recurso protegido, y que dentro del sistema cada usuario solo pueda ver y modificar lo que le corresponde según su rol.

La autenticación se delega completamente a Microsoft Entra ID via flujo OAuth 2.0 con PKCE. El sistema no almacena contraseñas propias.

La autorización se implementa mediante roles definidos en el sistema. Cada endpoint del API verifica el rol del usuario antes de ejecutar la operación. Cada componente de la interfaz renderiza o bloquea acciones según el rol del usuario autenticado.

**roles definidos:**

| rol | descripción |
|---|---|
| `ADMIN` | Administrador técnico del sistema. Acceso completo a configuración, usuarios y logs de auditoría. No tiene acceso a datos operativos por defecto. |
| `SECRETARIA` | Usuario operativo principal. Acceso completo de lectura y escritura sobre todos los expedientes, contratos, documentos y participantes. |
| `DIRECTOR` | Vista ejecutiva. Acceso de lectura a todos los proyectos, estados y dashboards. No puede modificar expedientes ni ver datos bancarios. |
| `INVESTIGADOR` | Participante en proyectos. Solo puede ver su propio expediente: documentos requeridos, estado de su contrato, pendientes. No puede ver expedientes de otros participantes. |
| `REVISOR_EXTERNO` | Uso futuro. Para instituciones externas que requieran acceso de lectura limitado a un proyecto específico. |

---

## cómo se mide este requisito

**cobertura de protección de endpoints**
El 100% de los endpoints del API que retornan o modifican datos debe estar protegido por el guard de autenticación. Se verifica que no existe ningún endpoint de datos accesible sin token válido. Esto se comprueba con pruebas automáticas que intentan llamar a cada endpoint sin token y esperan un 401.

**correctitud de autorización por rol**
Se define una matriz de acceso (rol × operación) y se prueba automáticamente cada combinación. Un `INVESTIGADOR` intentando acceder al expediente de otro participante debe recibir 403. Un `DIRECTOR` intentando modificar un contrato debe recibir 403.

**control de interfaz**
Las acciones restringidas no solo devuelven 403 en el API, también están ocultas o deshabilitadas en la interfaz. Un `INVESTIGADOR` no ve el botón "modificar contrato" porque no aparece en su UI.

**sesiones y tokens**
Los tokens JWT tienen un tiempo de expiración de no más de 8 horas. Al cerrar sesión, el token es invalidado (lista de tokens revocados o expiración corta con refresh tokens). No existe ningún token con duración indefinida.

---

## cómo se traduce en el sistema

### en la autenticación (Microsoft Entra ID + MSAL)

El frontend (Next.js esta definido temporalmente) implementa el flujo OAuth 2.0 Authorization Code con PKCE usando la librería MSAL de Microsoft. Cuando un usuario accede al sistema por primera vez, es redirigido a la pantalla de login institucional de UADY. Una vez autenticado, el sistema recibe un token de acceso de Microsoft.

El backend (NestJS - definido temporalmente) valida ese token contra las claves públicas de Microsoft Entra ID en cada request. No confía en el token solo por su formato, lo valida criptográficamente. Este proceso se implementa con la librería `passport-azure-ad`.

El rol del usuario dentro del sistema se almacena en la tabla `usuarios` de PostgreSQL, vinculada al `oid` (object id) del usuario en Azure AD. Al hacer login, el sistema verifica si el usuario ya tiene registro, crea uno si no existe, y adjunta el rol al payload del contexto de request.

### en la autorización (NestJS Guards + Decoradores)

Se implementa un `RolesGuard` global que lee el rol del usuario del contexto de request y lo compara con los roles requeridos declarados en el endpoint mediante un decorador `@Roles()`.

```typescript
// ejemplo conceptual
@Get('participante/:id/datos-bancarios')
@Roles(RolUsuario.SECRETARIA, RolUsuario.ADMIN)
async getDatosBancarios(@Param('id') id: string) {
  // solo secretaria y admin llegan aquí, ya que solo ellos pueden obtener informacion delicada del sistema
}
```

Para el caso del `INVESTIGADOR`, la verificación no solo revisa el rol sino también que el `participante_id` en el parámetro de la ruta corresponda al propio usuario autenticado. Esto se implementa como un guard de propiedad separado (`OwnershipGuard`).


### en el frontend (Next.js)

Se implementa un contexto de autenticación global que expone el usuario actual y su rol. Los componentes de la UI consultan este contexto para decidir qué renderizar. Las rutas protegidas verifican autenticación y redirigen a login si no hay sesión activa.

---

## cómo se evidencia que se cumple

- Acceder a cualquier URL del sistema sin sesión activa redirige automáticamente al login de Microsoft. No existe ninguna pantalla de datos accesible sin autenticación.
- Un investigador que intenta abrir la URL del expediente de otro investigador ve una pantalla de "acceso denegado", no los datos.
- La secretaría puede modificar contratos y cargar documentos. El director puede ver esos mismos contratos pero no tiene el botón de modificar en su interfaz.
- Al revocar acceso de un usuario en Entra ID o desactivarlo en la tabla `usuarios`, ese usuario no puede acceder al sistema en el siguiente intento aunque tenga un token válido reciente.
- Los datos bancarios de un participante solo son visibles para usuarios con rol `SECRETARIA` o `ADMIN`. El director, el investigador, y cualquier otro rol ven esos campos ocultos o como `***`.

---

## cómo se representa en el diseño

**en la arquitectura**
Existe un módulo `auth` en NestJS que exporta el `JwtAuthGuard`, el `RolesGuard`, el `OwnershipGuard`, y el `AuthContext` del usuario. Todos los demás módulos importan `AuthModule` para proteger sus endpoints.

**en el esquema de base de datos**
La tabla `usuarios` está presente en el diagrama con su relación al campo `user_id` de la tabla `audit_log` y como FK en cualquier tabla que registre quién realizó una acción.

**en la documentación de API**
Cada endpoint en la especificación OpenAPI (Swagger) tiene anotado el rol requerido para accederlo. Esto sirve como referencia durante el desarrollo y como documentación técnica para mantenimiento futuro.

**en la matriz de acceso**
Existe un documento o tabla (puede ser parte del diseño del sistema) que cruza cada operación con cada rol y define si es permitida, denegada, o permitida con restricción de propiedad. Esa matriz es la fuente de verdad para configurar los guards.

| operación | ADMIN | SECRETARIA | DIRECTOR | INVESTIGADOR |
|---|---|---|---|---|
| ver lista de proyectos | ✅ | ✅ | ✅ | ❌ |
| ver detalle de proyecto | ✅ | ✅ | ✅ | solo los propios |
| crear proyecto | ✅ | ✅ | ❌ | ❌ |
| modificar contrato | ✅ | ✅ | ❌ | ❌ |
| ver datos bancarios | ✅ | ✅ | ❌ | ❌ |
| ver historial de auditoría | ✅ | ✅ | ❌ | ❌ |
| ver dashboard ejecutivo | ✅ | ✅ | ✅ | ❌ |
| ver propio expediente | ✅ | ✅ | ✅ | ✅ |


## Requisistos relacionados