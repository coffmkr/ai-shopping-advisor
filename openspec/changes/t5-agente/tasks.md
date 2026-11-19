## 1. Filtrado

- [ ] 1.1 Tests unitarios con las fixtures (deben fallar): sin patrocinados, respeta el precio máximo, sin variantes repetidas, sin ASIN existentes, máximo 4 ordenados por valoración ponderada
- [ ] 1.2 Función pura `filterSearchResults`; tests en verde

## 2. API de búsquedas

- [ ] 2.1 Tests funcionales (deben fallar): 202 y trabajo encolado, 401 sin sesión, 404 categoría inexistente, 422 precio fuera de rango, 409 con búsqueda activa en la categoría, 202 en otra categoría, 429 al superar el límite diario sin contar la semilla, listado y detalle
- [ ] 2.2 Puertos `JobQueue` y `LlmClient`, proveedor del contenedor, servicio de búsquedas, controlador y rutas; tests en verde

## 3. Agente

- [ ] 3.1 Tests funcionales del agente con proveedor y LLM falsos (deben fallar): crea candidatos pendientes con borrador y estado `completed`, descarta borradores de otro ASIN o con criterios ajenos, error del proveedor deja `failed` sin candidatos, borrador básico sin clave de Claude
- [ ] 3.2 `ScoutService`, `BasicDraftLlmClient` y `ClaudeLlmClient` (salida estructurada, fallback, comprobación de `stop_reason`); tests en verde
- [ ] 3.3 Adaptador `PgBossJobQueue`, comando `agent:work` y `make start` con el worker

## 4. Panel

- [ ] 4.1 Test de componente (debe fallar): la lista muestra el estado de cada búsqueda y enlaza a sus candidatos
- [ ] 4.2 Página `admin/busquedas` con formulario, lista y consulta del estado; test en verde
- [ ] 4.3 Verificación manual: búsqueda real en Canopy con el worker, candidatos en la cola de revisión

## 5. Cierre

- [ ] 5.1 README actualizado (comandos y decisiones que cambien) y `make test`, typecheck y lint en verde
