# RNF_10 — Mantenibilidad y extensibilidad del código

## por qué existe este requisito en este sistema

Este sistema será construido por un equipo pequeño, muy probablemente una sola persona en la fase inicial. Va a crecer durante años: módulos nuevos, facultades nuevas, integraciones nuevas, correcciones, mejoras. Si el código no está estructurado de forma mantenible desde el inicio, cada nueva funcionalidad se vuelve exponencialmente más difícil de agregar, los bugs se acumulan más rápido de lo que se pueden corregir, y llega un punto en que el sistema es tan frágil que cualquier cambio tiene el riesgo de romper algo más.

En el contexto universitario, el desarrollador principal puede cambiar. Puede ser que la persona que construyó el módulo de honorarios ya no esté disponible cuando se construya el módulo de becas. Si el código no es legible, no está tipado, y no tiene separación de responsabilidades, el siguiente desarrollador tendrá que entender el sistema desde cero para hacer cualquier cambio.

La mantenibilidad tampoco es solo para el futuro. Durante el desarrollo activo, código mal estructurado hace que depurar un error tome el triple de tiempo, que las revisiones sean ineficientes, y que agregar una feature simple requiera modificar cinco archivos en cinco partes distintas del sistema.

---

## descripción del requisito

El código del sistema debe estar estructurado de forma que sea comprensible para cualquier desarrollador con experiencia en el stack (NestJS + Next.js + TypeScript), sin necesidad de conocer el historial del proyecto. Debe ser modificable con confianza: agregar una feature no debe romper partes no relacionadas, y un bug en un módulo no debe propagarse a otros módulos.

**dimensiones del requisito:**

- **tipado estricto**: el código TypeScript usa el modo `strict` activado. No existen tipos `any` explícitos en la lógica de negocio. El compilador detecta la mayoría de los errores antes de ejecutar el código.
- **separación de responsabilidades**: cada archivo, clase y función tiene una responsabilidad única y bien definida. Los servicios de NestJS no contienen lógica de base de datos directa (esa es responsabilidad de los repositorios o del acceso a Prisma). Los controladores no contienen lógica de negocio (esa es responsabilidad de los servicios).
- **independencia de módulos**: los módulos de negocio no se importan entre sí directamente. La comunicación entre módulos ocurre a través del núcleo compartido o mediante eventos.
- **trazabilidad del esquema de base de datos**: todos los cambios al schema de la base de datos se hacen mediante migraciones controladas de Prisma, no directamente sobre la base de datos. El historial de migraciones vive en el repositorio.
- **estándares de código**: el código sigue las convenciones de ESLint y Prettier configuradas en el proyecto. Estas herramientas se ejecutan automáticamente en cada commit.
- **cobertura de tests**: la lógica de negocio (servicios de NestJS) tiene tests unitarios que cubren los casos más importantes, especialmente las validaciones de estado y las reglas de negocio.

---

## cómo se mide este requisito

**compilación sin errores en modo strict**
El comando `tsc --noEmit` ejecutado sobre el proyecto no debe producir ningún error de tipo. Si hay errores de compilación, el CI/CD pipeline falla y no se puede desplegar.

**cero tipos `any` en lógica de negocio**
La regla ESLint `@typescript-eslint/no-explicit-any` está configurada como error (no warning) en los directorios `src/modules/` y `src/shared/`. Se puede relajar en scripts de migración o en archivos de configuración técnica, pero no en la lógica de negocio.

**cobertura de tests**
La cobertura de líneas en los archivos de servicios (`*.service.ts`) debe ser de al menos 70%. Esto se verifica con el reporte de cobertura de Jest. No se exige 100% porque hay código de inicialización y configuración que no necesita tests.

**análisis de dependencias circulares**
El comando `npx madge --circular src/` no debe reportar dependencias circulares. Las dependencias circulares son uno de los síntomas más comunes de una arquitectura mal estructurada.

**linting sin supresiones**
El código no contiene comentarios `// eslint-disable` ni `// @ts-ignore` en archivos de lógica de negocio. Si hay un caso legítimo que necesita suprimir una regla, está documentado en el mismo comentario con la razón.

**tiempo de comprensión por módulo**
Un desarrollador externo que conoce NestJS y TypeScript puede entender la responsabilidad de un módulo, sus entidades principales, y sus flujos de negocio en menos de 30 minutos leyendo el código, sin necesitar documentación externa.

---

## cómo se traduce en el sistema

### en la configuración de TypeScript

El archivo `tsconfig.json` tiene las siguientes opciones activadas en modo strict:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Estas opciones obligan al desarrollador a ser explícito sobre los tipos, a manejar los casos `null` y `undefined`, y a eliminar código muerto.

### en la estructura de carpetas del backend (NestJS)

Cada módulo de negocio sigue la misma estructura interna:

```
src/modules/honorarios/
├── honorarios.module.ts          ← registro del módulo en NestJS
├── contracts/
│   ├── contracts.controller.ts  ← solo recibe request, delega al servicio
│   ├── contracts.service.ts     ← lógica de negocio, reglas, validaciones
│   ├── contracts.repository.ts  ← acceso a Prisma (opcional, o directo en service)
│   ├── dto/
│   │   ├── create-contract.dto.ts
│   │   └── update-contract.dto.ts
│   └── contracts.service.spec.ts  ← tests unitarios del servicio
├── participants/
│   └── (misma estructura)
└── payments/
    └── (misma estructura)
```

Esta estructura es predecible. Cuando un desarrollador nuevo necesita agregar validación al flujo de contratos, sabe sin dudar que debe ir a `contracts.service.ts`.

### en las convenciones de nomenclatura

Existen convenciones documentadas en el proyecto para nombres de archivos, clases, métodos, y variables. Las convenciones principales son:

- Módulos en español descriptivo: `HonorariosModule`, `BecasModule`
- DTOs con sufijo claro: `CrearContratoDto`, `ActualizarEstadoContratoDto`
- Servicios con sufijo: `ContratosService`, `ParticipantesService`
- Enums en español con nombres claros: `EstadoContrato`, `TipoDocumento`, `RolUsuario`
- Constantes en mayúsculas: `TIEMPO_MAXIMO_INACTIVIDAD_HORAS`

### en las migraciones de base de datos (Prisma Migrate)

Todo cambio al schema de la base de datos se realiza mediante:

1. Modificar el archivo `schema.prisma`
2. Ejecutar `npx prisma migrate dev --name descripcion_del_cambio`
3. Hacer commit del archivo de migración generado junto con el cambio al schema

El directorio `prisma/migrations/` en el repositorio contiene el historial completo de todos los cambios al schema. Esto permite replicar exactamente la estructura de la base de datos en cualquier entorno ejecutando `npx prisma migrate deploy`.

**Nunca se modifican tablas directamente en la base de datos sin crear una migración.** Esta regla es la más importante para la mantenibilidad del schema.

### en el pipeline de CI/CD

El pipeline de integración continua ejecuta los siguientes pasos en orden en cada push al repositorio:

1. `tsc --noEmit` — verificación de tipos TypeScript
2. `eslint src/` — verificación de reglas de código
3. `prettier --check .` — verificación de formato
4. `jest --coverage` — ejecución de tests con reporte de cobertura
5. `npx madge --circular src/` — verificación de dependencias circulares

Si cualquier paso falla, el pipeline falla y el código no puede desplegarse. Esto garantiza que el código en producción siempre cumple con los estándares definidos.

### en la documentación técnica inline

Se documentan los casos no obvios con comentarios concisos. No se documentan funciones cuyo nombre ya lo dice todo, pero sí se documentan:

- La razón de una decisión técnica no obvia
- Las reglas de negocio complejas dentro de un servicio
- Las condiciones de borde que un método maneja
- Las restricciones del dominio que no son evidentes en el nombre del método

```typescript
/**
 * Registra un pago de honorarios.
 * 
 * El contrato debe estar en estado VIGENTE antes de registrar el pago.
 * Si el contrato tiene complemento de pago pendiente de versiones anteriores,
 * este método lo marca automáticamente como INCOMPLETO para seguimiento de auditoría.
 * 
 * Ver RNF_04 para la máquina de estados del contrato.
 */
async registrarPago(contratoId: string, pagoDto: RegistrarPagoDto): Promise<Pago> {
  // ...
}
```

---

## cómo se evidencia que se cumple

- El pipeline de CI/CD pasa exitosamente en cada pull request sin necesidad de suprimir errores.
- El reporte de cobertura de Jest muestra que los archivos de servicio tienen cobertura de al menos 70%.
- `npx madge --circular src/` no reporta ningún ciclo de dependencias.
- Un desarrollador externo que nunca ha visto el proyecto puede explicar correctamente qué hace el módulo de honorarios después de 30 minutos de leer el código (esto se puede verificar durante la incorporación de un colaborador nuevo).
- En 6 meses de desarrollo, no se han introducido regresiones en el módulo de honorarios al desarrollar el módulo de becas, lo que indica que los módulos son verdaderamente independientes.
- El historial de git de `prisma/migrations/` tiene un commit por cada cambio al schema, con un nombre descriptivo que explica qué se cambió y por qué.

---

## cómo se representa en el diseño

**en la estructura del repositorio**
La estructura de carpetas del repositorio está documentada en el `README.md` del proyecto. Cualquier desarrollador que clone el repositorio puede orientarse rápidamente sobre dónde vive cada parte del sistema.

**en las guías de contribución**
El archivo `CONTRIBUTING.md` en el repositorio describe:
- cómo agregar un módulo nuevo
- cómo hacer cambios al schema de la base de datos
- cómo escribir tests para servicios
- qué convenciones de nomenclatura seguir
- cómo correr el pipeline de CI/CD localmente antes de hacer push

**en la arquitectura del sistema**
El diagrama de arquitectura muestra las dependencias entre módulos y la separación entre el núcleo compartido y los módulos de negocio. Ese diagrama es la guía visual que cualquier desarrollador usa para entender dónde colocar código nuevo.

**en el plan de onboarding técnico**
Cuando se incorpore un nuevo desarrollador al proyecto, existe una guía de onboarding que describe en qué orden leer el código para entenderlo, qué tests ejecutar para verificar que el entorno está bien configurado, y cuál es la primera tarea pequeña recomendada para familiarizarse con el sistema sin riesgo.
