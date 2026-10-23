> Registro del uso de IA en el proyecto. Los prompts están **resumidos y reescritos** a partir de las conversaciones
> reales con el asistente: conservan la intención, el contexto y las restricciones de cada pedido, sin las
> iteraciones intermedias. Cada prompt indica la herramienta y el modelo usados, el resultado y, cuando
> corresponde, el ajuste humano sobre la salida de la IA.

## Resumen del flujo de trabajo con IA

**Herramientas**


| Herramienta                        | Uso                                                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code (app de escritorio)    | Análisis de viabilidad, prototipos desechables, investigación de proveedores y documentación                                                   |
| Navegador integrado de Claude Code | Lectura de documentación oficial (Affiliate.com, Amazon Associates, AliExpress, Canopy) y verificación visual de prototipos y diagramas |
| Servidor MCP de Canopy             | Fuente de datos de productos de amazon.com, consumida con un cliente MCP propio                                                                |
| OpenSpec                           | Spec Driven Development a partir de la implementación                                                                                          |


**Modelos**


| Modelo                             | Uso                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Claude Opus 5.5 (Claude Code)      | Razonamiento para viabilidad, arquitectura, modelo de datos y documentación |
| Claude Sonnet 5.5 (en el producto) | Agente buscador: borrador de la ficha de recomendación y notas por criterio |
| Claude Haiku 5.5 (en el producto)  | Asistente conversacional: respuesta rápida y de bajo costo                  |


**Contexto avanzado**

- Memoria persistente de Claude Code con la visión del producto y las decisiones sobre proveedores.
- `CLAUDE.md` con las reglas del proyecto (TDD, reglas de dominio no negociables, seguridad).
- OpenSpec con sus comandos para proponer, aplicar y archivar cambios.
- Hook `PreToolUse` de Claude Code que impide al agente leer, editar o subir secretos.

**IA en el ciclo de vida**


| Fase           | Uso de IA                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Análisis       | Pruebas de viabilidad con APIs reales, investigación de proveedores de afiliación, modelo de negocio |
| Diseño         | Arquitectura, modelo de datos, especificación de la API, historias de usuario y tickets              |
| Implementación | Prototipos de viabilidad; desarrollo con OpenSpec + TDD en la fase de implementación                     |
| Pruebas        | Tests del prototipo de autenticación; estrategia de pirámide de tests y evals de IA                  |
| Despliegue     | Workflow de CI (lint, tests, escaneo de secretos)                                                    |
| Mantenimiento  | Specs vivas con OpenSpec, hooks y `CLAUDE.md` como guardrails permanentes                            |


**Criterio humano**

- **Validar antes de documentar.** Exigí probar cada proveedor con servicios reales y buscar evidencia para
descartarlo, no para confirmarlo. Esto evitó construir sobre Affiliate.com vía ZeroClick, cuyos links no
atribuyen la venta.
- **Decisiones de negocio.** Descarté opciones que la IA propuso o evaluó: AutoDS (dropshipping, otro modelo de
negocio), tarjetas sin imágenes o con fotos propias, y Amazon como único proveedor por las restricciones de cobro
desde Perú.
- **Redefinición del MVP.** Corregí la propuesta inicial de un asesor conversacional como centro del producto: el
MVP es un catálogo tipo e-commerce cuyo valor es la ficha de recomendación y el comparador; el chat es un
complemento.
- **Coherencia del diseño.** Detecté una contradicción de experiencia de usuario (el cliente parecía esperar a la
búsqueda y aprobación) y pedí separar los flujos de curaduría y de compra.
- **Stack.** Elegí AdonisJS por ser un stack que ya trabajé y Nuxt por dominio propio y SSR, en lugar de la propuesta
inicial de la IA (Fastify + React).
- **Alcance y promesas.** Recorté lo que la IA agregó de más a la documentación y ajusté el CI/CD a lo que se puede
cumplir. Ningún commit ni push sin mi revisión.

---



## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---



## 1. Descripción general del producto

**Prompt 1 — Prueba de viabilidad del primer proveedor**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Quiero construir un e-commerce de afiliados donde una IA consulte un catálogo de productos y seleccione recomendaciones con links de referido. Evalúa con evidencia si la API de Affiliate.com, accedida vía ZeroClick, sirve como base del proyecto.

Antes de escribir código, lee la documentación oficial y no inventes campos ni endpoints; si algo no está documentado, indícalo. Construye un prototipo mínimo en Node.js: autenticación con renovación automática del token, compra de créditos (el pago lo hago yo), búsqueda por título e ISBN, un recomendador de 3 productos y una página con tarjetas. Presupuesto máximo de US$0.50, con contador de requests y caché en disco. Ningún secreto en el repositorio.

Pregunta clave: ¿los productos traen un link de afiliado que me atribuya la venta? Entrega un informe con lo que funcionó, lo que no, el costo real y un veredicto.
```

**Resultado:** prototipo funcional y informe `docs/viabilidad/01-affiliate-zeroclick.md`. La conexión y el catálogo
funcionan, pero los links no llevan el ID de afiliado propio: proveedor descartado (US$0.22 gastados).

**Prompt 2 — Visión del producto y criterios para elegir proveedor**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

El producto es una página de recomendación de productos que gana comisión por links de afiliado. El tema es intercambiable (libros, artículos de escritorio, merchandising temático). Un agente de IA debe buscar productos que encajen con el tema, idealmente por MCP o si no por API; luego pasan por una verificación y se publican.

A futuro debe conectarse con varios proveedores y comparar el mismo producto entre plataformas. El público objetivo está en Perú. Evalúa proveedores (Amazon, impact.com, AliExpress, Mercado Libre, otros) según: link de afiliado propio, acceso por MCP o API, riqueza de datos, alcance a Perú y facilidad de cobro.
```

**Resultado:** comparativa de proveedores. Amazon + Canopy (datos por MCP) elegido para el MVP; AliExpress como
candidato a segundo proveedor.
**Ajuste humano:** descarté AutoDS (dropshipping) y prioricé un proveedor que permitiera probar hoy, sin esperar
aprobaciones.

**Prompt 3 — Definición del MVP: roles, ficha de recomendación y alcance**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Define el MVP con tres roles: agente buscador (IA que propone productos), administrador (aprueba lo que se publica) y cliente (navega y compra en Amazon). El cliente debe ver los productos como en cualquier e-commerce, ya filtrados por categoría; el valor del producto es explicar por qué recomendamos cada uno.

Propón qué debe incluir la ficha de cada producto además del "por qué lo recomendamos", agrega un comparador entre productos de la misma categoría y un asistente conversacional con búsqueda semántica sobre el catálogo aprobado. Lo que el cliente pida y no exista queda registrado como demanda; la gestión de esa demanda queda fuera del MVP. Máximo 5 funcionalidades imprescindibles.
```

**Resultado:** sección 1 del README con 5 funcionalidades, ficha de recomendación de 10 bloques y dos flujos
independientes (curaduría y compra).
**Ajuste humano:** uní la generación del link con la aprobación, pedí que el MVP muestre imágenes por ser una demo
no publicada y separé los flujos para que el cliente nunca espere al agente.

---



## 2. Arquitectura del Sistema



### **2.1. Diagrama de arquitectura:**

**Prompt 1 — Separar el proveedor de datos del de afiliación**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

¿Puede el agente buscador conectarse a una fuente de datos de Amazon para buscar y proponer productos sin generar el link de afiliado? La generación del link puede ser un paso separado. Haz un prototipo con productos de escritorio que muestre los productos y su link de afiliado con mi tag, y verifica que todos los links lo lleven.
```

**Resultado:** informe `docs/viabilidad/02-amazon-canopy.md`. Conexión por MCP con Canopy y 12 links con el tag
propio. Hallazgo: Canopy devuelve URLs con el tag de un tercero, por lo que el link siempre se construye en el
sistema. Esto dio origen a los puertos `CatalogProvider` y `AffiliateLinkBuilder`.

### **2.2. Descripción de componentes principales:**

**Prompt 1 — Elección del stack**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Revisa un proyecto de referencia que ya trabajé con AdonisJS e identifica su stack. Para el backend quiero usar el mismo; para el frontend prefiero Nuxt, que es el framework que mejor conozco. Evalúa ventajas y desventajas de esa combinación para un catálogo con SEO, panel de administración y chat, y actualiza la arquitectura y los componentes.
```

**Resultado:** AdonisJS 7 (Lucid, VineJS, Japa) para el backend y Nuxt con SSR para el frontend.
**Ajuste humano:** la IA había propuesto Fastify + React sin considerar mi experiencia con otros frameworks.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1 — Prácticas de ingeniería con IA en el proyecto**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Incorpora en la arquitectura y la estructura: Spec Driven Development con OpenSpec, TDD con pirámide de tests, hooks de Claude Code como guardrails, evals de los componentes de IA y CI. Usa las convenciones de AdonisJS y Nuxt para la estructura de carpetas.
```

**Resultado:** arquitectura hexagonal sobre las convenciones de AdonisJS (`services`, `ports`, `adapters`),
estructura con `CLAUDE.md`, `.claude/` y `openspec/`.

### **2.4. Infraestructura y despliegue**

**Prompt 1 — CI realista**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Revisa lo que estamos prometiendo sobre CI/CD. Ajústalo a lo que se puede cumplir en el plazo del proyecto, sin prometer despliegue para una demo local.
```

**Resultado:** un workflow de CI en pull requests y push a `main` (lint, typecheck, tests, escaneo de secretos),
E2E de ejecución manual y despliegue fuera del alcance.
**Ajuste humano:** quité promesas que no iba a sostener en el MVP, como bloquear la rama ante cualquier fallo del CI.

### **2.5. Seguridad**

**Prompt 1 — Reglas de seguridad y cumplimiento**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Define las prácticas de seguridad del proyecto considerando: secretos fuera del repositorio, un agente de IA que procesa contenido externo (títulos, reseñas, mensajes del chat), autenticación del administrador, abuso del chat, privacidad de los visitantes y las reglas del programa de afiliados de Amazon.
```

**Resultado:** sección 2.5 del README. Incluye la regla de construir siempre el link de afiliado en el sistema, la
validación de las salidas del LLM, el rate limit del chat y el uso de imágenes solo en la demo.

### **2.6. Tests**

**Prompt 1 — Estrategia de pruebas**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Plantea la estrategia de tests con TDD: cada criterio de aceptación de las historias debe convertirse en al menos un test. Usa Japa para el backend contra una base de pruebas real, tests de componentes en Nuxt y E2E con Playwright. Como el agente y el chat usan un LLM, propone evals con criterios flexibles en lugar de comparar texto.
```

**Resultado:** pirámide de tests y evals del agente (10 casos) y del chat (15 casos) en la sección 2.6.

---



## 3. Modelo de Datos

**Prompt 1 — Modelo de datos del MVP**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Diseña el modelo de datos en PostgreSQL con pgvector para las 5 funcionalidades del MVP: búsquedas del agente, candidatos y productos aprobados con su ficha de recomendación completa, rúbricas de evaluación por categoría con notas por criterio, productos que combinan entre sí, consultas del chat y clics de afiliado. Usa un diagrama mermaid con claves primarias y foráneas, y describe cada atributo con su tipo y sus restricciones.
```

**Resultado:** 10 entidades, con checks que garantizan que un producto aprobado tenga ficha completa y link de
afiliado.
**Ajuste humano:** las alternativas se calculan en lugar de guardarse, y no se almacenan datos personales de los
visitantes.

---



## 4. Especificación de la API

**Prompt 1 — Endpoints principales**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Documenta en OpenAPI los 3 endpoints principales del MVP, uno por cada paso clave: lanzar el agente buscador, aprobar un candidato con su ficha y el comparador de productos. Incluye los códigos de error que se derivan de los criterios de aceptación y un ejemplo de petición y respuesta.
```

**Resultado:** sección 4 del README con un ejemplo completo del comparador.

---



## 5. Historias de Usuario

**Prompt 1 — Historias de usuario principales**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Escribe las 3 historias de usuario principales, una por cada rol: el agente propone candidatos con su ficha, el administrador publica con link de afiliado y el cliente compara y decide. Usa el formato "Como… quiero… para…" con criterios de aceptación Dado/Cuando/Entonces que se puedan convertir directamente en tests.
```

**Resultado:** sección 5 del README.

---



## 6. Tickets de Trabajo

**Prompt 1 — Tickets de trabajo**

```text
Herramienta: Claude Code · Modelo: Claude Opus 5.5

Documenta 3 tickets con el detalle necesario para desarrollarlos de principio a fin: uno de base de datos (esquema, migraciones y semilla), uno de backend (el agente buscador) y uno de frontend (el comparador). Cada ticket debe listar primero los tests que tienen que fallar, siguiendo TDD, y sus criterios de aceptación.
```

**Resultado:** sección 6 del README.

---



## 7. Pull Requests

Se documentarán cuando comience la implementación.