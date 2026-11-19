## Why

Implementa el ticket **T5 — Búsqueda de productos con el agente** de la historia **HU1 — El agente propone
candidatos con su ficha** (README, secciones 5 y 6). Hasta ahora los candidatos solo llegan por la semilla; el agente
es lo que permite al administrador ampliar el catálogo sin buscar producto por producto en Amazon.

## What Changes

- Lanzar una búsqueda en una categoría con precio máximo opcional; la petición responde enseguida y la búsqueda se
  ejecuta en segundo plano con estados `queued → running → completed | failed`.
- Una sola búsqueda activa por categoría (409) y límite diario de búsquedas (429).
- Listado y estado de las búsquedas para el panel.
- El agente busca en Canopy, filtra en código (patrocinados, sin precio o valoración, por encima del precio máximo,
  variantes repetidas, productos que ya existen en cualquier estado), obtiene el detalle de los mejores y pide a
  Claude el borrador de la ficha de cada uno, que se valida antes de guardarlo.
- Si no hay clave de la API de Claude, el agente deja un borrador básico construido con los datos del producto,
  marcado para que el administrador lo complete.
- Pantalla "Búsquedas" del panel con el formulario, el estado en vivo y el enlace a sus candidatos.

## Capabilities

### New Capabilities

- `agente-buscador`: búsqueda de candidatos en el proveedor de datos, filtrado, redacción del borrador de la ficha y
  ejecución asíncrona con estados.

### Modified Capabilities

(ninguna; la cola de revisión de `curaduria` ya admite filtrar por búsqueda de origen)

## Fuera de alcance

- Evals del agente con búsquedas grabadas (entrega final, README 2.6).
- Programar búsquedas periódicas.
- Reseñas de Amazon como entrada del borrador: Canopy 3.0 ya no las ofrece (ver design.md de T1).

## Impact

- `backend/`: puertos `LlmClient` y `JobQueue`; adaptadores de Claude, borrador básico y pg-boss; servicios de
  búsquedas y del agente; controlador y rutas `/api/admin/agent-runs`; comando `agent:work` (worker).
- `frontend/`: página `admin/busquedas`.
- Dependencias: `pg-boss`, `@anthropic-ai/sdk`. `make start` levanta también el worker.
- Coste por búsqueda real: 1 petición de búsqueda y hasta 4 de detalle en Canopy, y hasta 4 llamadas a Claude.
