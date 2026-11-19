## Context

T1 dejó el adaptador de Canopy (`CatalogProvider`), las fixtures grabadas y el índice único parcial de una búsqueda
activa por categoría. T4 dejó la cola de revisión filtrable por búsqueda. Canopy 3.0 ofrece búsqueda y detalle, pero
no reseñas. El README fija `claude-sonnet-5-5` como modelo del agente (`AGENT_MODEL`).

## Goals / Non-Goals

**Goals:**
- Que la lógica del agente sea testeable sin red: proveedor, LLM y cola detrás de puertos con adaptadores falsos.
- Que la demo funcione sin clave de Claude.

**Non-Goals:**
- Reintentos automáticos de la búsqueda completa: una búsqueda fallida se vuelve a lanzar a mano.

## Decisions

**1. Puertos como clases abstractas** (`CatalogProvider`, `LlmClient`, `JobQueue`) para usarlas como claves del
contenedor de AdonisJS. Un proveedor (`providers/agent_provider.ts`) registra los adaptadores reales: Canopy,
`ClaudeLlmClient` si hay `ANTHROPIC_API_KEY` o `BasicDraftLlmClient` si no, y `PgBossJobQueue`. Los tests los
sustituyen con `app.container.swap`.

**2. Cola con pg-boss.** `POST /api/admin/agent-runs` valida, crea el `AgentRun` `queued` y publica el trabajo
`agent-run` con su id. El comando `node ace agent:work` arranca pg-boss y procesa la cola de uno en uno (un único
worker, `batchSize` 1). pg-boss crea su propio esquema `pgboss` en la misma base. La regla de una búsqueda activa por
categoría la garantiza el índice único parcial; la API responde 409 antes de llegar a él.

**3. El agente (`ScoutService.run`).** Pone la búsqueda en `running`; busca en Canopy; filtra con una función pura
(`filterSearchResults`) probada con las fixtures; obtiene el detalle de los 4 mejores; pide el borrador de cada uno;
valida cada borrador; inserta todos los candidatos en **una transacción al final** y marca `completed`. Cualquier
`CatalogProviderError` deja la búsqueda en `failed` y, como las inserciones van al final, sin candidatos parciales. Si
el LLM falla con un producto, ese producto se omite; si falla con todos, la búsqueda queda `failed`.

**4. Borrador con Claude (`ClaudeLlmClient`).** Una llamada por producto a `messages.create` del SDK oficial con
salida estructurada (`output_config.format` de tipo `json_schema`) y el modelo `AGENT_MODEL`. El esquema exige `asin`,
textos, listas y un objeto `scores` con exactamente las claves de la rúbrica. Los datos del producto van en un bloque
delimitado y el prompt de sistema indica que son datos, no instrucciones. Se activa el fallback del servidor ante
rechazos (`fallbacks: "default"` con la beta `server-side-fallback-2026-07-01`) y se comprueba `stop_reason`: un
`refusal` o un `max_tokens` cuentan como fallo de ese producto. La salida se vuelve a validar con VineJS (defensa en
profundidad) y se comprueba que el `asin` coincide.

**5. Borrador básico (`BasicDraftLlmClient`).** Sin clave de Claude, construye un borrador determinista con los datos
del producto (marca, valoración, primeras viñetas como especificaciones) y notas neutras de 5; el resumen empieza por
"Borrador automático sin IA" para que el administrador lo reescriba.

**6. Panel.** `admin/busquedas` muestra el formulario (categoría y precio máximo), la lista de búsquedas y consulta el
estado cada 3 segundos mientras alguna está `queued` o `running`. Cada búsqueda enlaza a su cola de candidatos.

## Risks / Trade-offs

- [Cuota de Canopy, 100 peticiones al mes] → Una búsqueda gasta hasta 5; límite diario configurable (5 por defecto).
- [Coste de Claude] → Hasta 4 llamadas por búsqueda; sin clave no hay coste.
- [El worker no corre] → La búsqueda queda `queued`; `make start` levanta el worker junto al servidor.
