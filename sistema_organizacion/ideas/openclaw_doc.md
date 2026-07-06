# OpenClaw en el sistema

## 1. Descripción

En este documento se analiza qué representa OpenClaw dentro de un sistema como este, si conviene usarlo o no, y por qué probablemente sea mejor dejarlo fuera de la arquitectura principal.

## 2. ¿Qué es OpenClaw?

OpenClaw es una tecnología open source orientada a crear asistentes personales capaces de operar sobre una computadora mediante acceso a archivos, scripts, APIs y otras herramientas.

En términos prácticos, funciona como un runtime para agentes o asistentes con capacidad de ejecutar acciones, no solo responder preguntas.

### 2.1. Qué resuelve realmente

El problema clásico es este:

**Los LLM son inteligentes, pero no pueden hacer cosas por sí solos si no tienen herramientas.**

OpenClaw conecta el razonamiento del modelo con:

- archivos;
- scripts;
- APIs;
- bases de datos;
- flujos automáticos.

Así, el asistente no solo responde, sino que también puede actuar.

## 3. Inconvenientes de OpenClaw

- Puede ser vulnerable a inyección de prompt, incluso mediante texto oculto o malicioso.
- Tiene riesgos serios de seguridad si se le da acceso amplio al sistema de archivos, terminal o correo.
- Al ser una tecnología experimental, todavía no tiene la madurez ideal para un sistema institucional sensible.
- Su complejidad operativa puede generar problemas de estabilidad, permisos e integración.
- No está pensado como solución principal para entornos multiusuario con control estricto por roles.
- En sistemas con información confidencial, su nivel de autonomía puede convertirse en un riesgo más que en una ventaja.

## 4. Recomendación para este proyecto

Mi recomendación es no usar OpenClaw como base principal del sistema.

Para este proyecto conviene más utilizar una arquitectura controlada con:

- backend propio;
- herramientas seguras expuestas por API;
- permisos por usuario y rol;
- RAG para documentos y contexto;
- un proveedor de modelo externo como OpenAI o Gemini;
- un framework como LlamaIndex o LangChain para orquestar el asistente.

En resumen, OpenClaw puede servir para explorar ideas, pero no parece la mejor opción para un sistema escolar multiusuario con información sensible.

