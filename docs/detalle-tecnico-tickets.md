# Detalle técnico de los tickets (insumo para OpenSpec)

Detalle técnico redactado durante el diseño (primera entrega y su revisión). El backlog vigente está en el
README, sección 6. Este documento no es el backlog: es material de entrada para el `/opsx:propose` de cada
ticket que va por OpenSpec, de donde salen su `design.md` y su `tasks.md`.

| Ticket vigente | Secciones de este documento que sirven de insumo |
|---|---|
| T1 Catálogo | Esquema y semilla · Catálogo público, comparador y redirección (parte de catálogo y `/go`) |
| T2 Comparador | Catálogo público, comparador y redirección (parte de comparador) · Página del comparador |
| T4 Revisión y publicación | Aprobación y rechazo del candidato |
| T5 Búsqueda con el agente | Agente buscador |

---

## [Base de datos] Esquema inicial, migraciones y semilla

- **Descripción:** crear el esquema de la sección 3 con migraciones de Lucid sobre PostgreSQL 16 + pgvector, con
  base de desarrollo y base de pruebas separadas, y una semilla reproducible.
- **Alcance:**
  1. `docker-compose.yml` con la imagen `pgvector/pgvector:pg16` y dos bases (desarrollo y pruebas) en puertos
     no estándar para no chocar con un PostgreSQL local.
  2. Migraciones de Lucid para las 8 tablas y los 5 enumerados del núcleo (sección 3.1; pgvector y las tablas del
     chat llegan con la migración de la ampliación).
  3. Restricciones: unique (`provider`, `provider_product_id`), unique (`category_id`, `key`) en la rúbrica,
     formato del ASIN, `score` entre 0 y 10, `rating` entre 0 y 5, checks de ficha completa y `affiliate_url`
     cuando `status = approved`, `product_id <> paired_product_id`, y único parcial de búsqueda activa por
     categoría en AGENT_RUN.
  4. Índices: (`category_id`, `status`), (`category_id`, `price_tier`), (`product_id`, `occurred_at`),
     (`status`, `created_at`).
  5. Modelos Lucid con sus relaciones.
  6. Semilla: 4 categorías de escritorio con sus rúbricas, un administrador de prueba (contraseña desde `.env`),
     una búsqueda de origen ficticia por categoría (`is_seed = true`, `completed`) y 12 productos aprobados con
     ficha colgados de ellas, a partir de respuestas grabadas (sin llamar a Canopy).
- **TDD — tests primero (Japa contra la base de pruebas real):**
  - Insertar dos productos con el mismo (`amazon`, ASIN) falla por unicidad.
  - Aprobar un producto sin `affiliate_url` o sin `summary` falla por el check.
  - Un ASIN con 9 caracteres falla.
  - Una nota de 11 falla.
  - Un producto no puede combinarse consigo mismo.
  - Borrar una categoría con productos falla por la FK.
  - Dos AGENT_RUN `queued` en la misma categoría fallan por el único parcial; uno `completed` y otro `queued`, no.
  - Tras la semilla, todo producto tiene una búsqueda de origen con `is_seed = true`.
- **Criterios de aceptación:** `make setup` funciona en una máquina limpia; los tests pasan con `make test`; la semilla no
  llama a servicios externos.

## [Backend] Agente buscador: endpoint y trabajo asíncrono

- **Descripción:** implementar `POST /api/admin/agent-runs` y el trabajo que busca en Canopy, filtra, obtiene
  especificaciones y reseñas, y pide al LLM el borrador de la ficha de cada candidato.
- **Alcance:**
  1. Puerto `CatalogProvider` y adaptador `CanopyCatalogProvider` (cliente MCP): `search_amazon_products`
     (`domain: US`), `get_amazon_product` y `get_amazon_product_top_reviews`.
  2. Filtros deterministas en código: excluir `sponsored`, sin ASIN, sin precio o valoración, sobre
     `maxPriceUsd`, variantes con las mismas valoraciones y ASIN que ya existen en la base (en cualquier estado).
  3. `LlmClient` con `claude-sonnet-5-5`: recibe cada producto filtrado (datos, especificaciones y reseñas como
     bloques de datos delimitados) y la rúbrica de la categoría; devuelve JSON con `summary`, `idealFor`, `notFor`,
     `pros`, `cons` (con palabras propias), `scores` por criterio y `keySpecs`. Se valida con VineJS; se
     descartan ASINs que no estaban en la entrada y notas de criterios que no son de la rúbrica.
  4. Cola con **pg-boss**: el endpoint crea el AGENT_RUN `queued` y publica el trabajo `agent-run` con su id; un
     worker (`bin/worker.ts`, concurrencia 1) lo ejecuta con estados `queued → running → completed | failed`,
     una transacción para los candidatos, `agent_draft` guardado tal cual y contador `provider_requests`. Reintento
     solo ante errores transitorios del proveedor (máx. 2, con espera creciente); al agotarse, `failed`.
  5. `GET /api/admin/agent-runs` y `GET /api/admin/agent-runs/{id}` para el listado y el estado.
  6. Una búsqueda activa por categoría → 409; límite diario de búsquedas (`CANOPY_MAX_SEARCHES_PER_DAY`, sin
     contar las de la semilla) → 429.
- **TDD — tests primero:**
  - Unitarios (fixtures grabadas de Canopy): 10 resultados con 3 patrocinados → ningún candidato patrocinado;
    producto de US$64.99 con tope de US$40 → descartado; un ASIN que ya existe como `rejected` → omitido.
  - Unitario: el LLM simulado devuelve un ASIN inventado o un criterio fuera de la rúbrica → se descarta.
  - Funcionales: 202 con sesión; 401 sin sesión; 404 con categoría inexistente; proveedor simulado con error →
    `failed` y 0 candidatos; 409 con otra búsqueda activa en la misma categoría; 202 en otra categoría; 429 al
    superar el límite diario.
  - Eval: 10 búsquedas grabadas cumplen los criterios de HU1 (ficha completa, notas en rango, sin patrocinados).
- **Criterios de aceptación:** todos los criterios de HU1 cubiertos por tests; ningún test llama a Canopy ni a
  Claude reales; la API key nunca aparece en logs.

## [Backend] Aprobación y rechazo del candidato

- **Descripción:** implementar la cola de revisión y la decisión del administrador sobre cada candidato:
  `GET /api/admin/candidates`, `GET /api/admin/candidates/{id}` y `PATCH /api/admin/candidates/{id}`.
- **Alcance:**
  1. `AffiliateLinkBuilder` (puerto + implementación Amazon): recibe solo el ASIN, lo valida
     (`^[A-Z0-9]{10}$`) y devuelve `https://www.amazon.com/dp/{ASIN}?tag={AMAZON_TAG}`. Nunca recibe ni reutiliza
     URLs del proveedor.
  2. Validador VineJS de la ficha (`Sheet`): longitudes de 4.3, una nota 0–10 **por cada** criterio de la rúbrica
     de la categoría del producto y ningún criterio ajeno; `pairedProductIds` deben ser productos aprobados.
  3. Servicio `review.approve`: en **una sola transacción** con bloqueo de la fila (`SELECT … FOR UPDATE`)
     comprueba que el candidato sigue `pending`, guarda la ficha (sin tocar `agent_draft`), las notas en
     PRODUCT_SCORE y los PRODUCT_PAIRING, genera `affiliate_url`, calcula `price_tier` por terciles de la
     categoría y fija `status = approved`, `reviewed_by_id` y `reviewed_at`. No llama a ningún servicio externo.
  4. Servicio `review.reject`: `status = rejected`, `rejection_reason` opcional, `reviewed_*`.
  5. Errores: 401 sin sesión, 404 inexistente, 409 si no está `pending`, 422 con la lista de campos que fallan.
- **TDD — tests primero:**
  - Unitarios `AffiliateLinkBuilder`: ASIN válido → URL exacta con el tag; ASIN de 9 caracteres o con minúsculas
    → error; no expone ningún parámetro para pasarle una URL.
  - Funcional: aprobar un candidato cuyo `provider_snapshot` trae `tag=otro-20` → el `affiliate_url` guardado
    contiene `tag=zapyens-20` y no contiene `otro-20`.
  - Funcional: aprobar con una nota de menos o un criterio de otra categoría → 422 y sigue `pending`.
  - Funcional: aprobar con un resumen editado → se publica el editado y `agent_draft` no cambia.
  - Funcional: aprobar dos veces el mismo candidato (dos peticiones simultáneas) → una 200 y otra 409.
  - Funcional: rechazar → `rejected` y el producto no aparece en `GET /api/categories/{slug}/products`.
  - Funcional: sin sesión → 401 en los tres endpoints.
- **Criterios de aceptación:** todos los criterios de HU2 cubiertos por tests; ningún test de este ticket
  necesita red; la regla "el link se construye en el servidor desde el ASIN" está cubierta por un test que
  fallaría si alguien reutilizara la URL del proveedor.

## [Backend] Catálogo público, comparador y redirección

- **Descripción:** implementar los endpoints públicos sobre los que se apoyan el sitio y el comparador:
  `GET /api/categories`, `GET /api/categories/{slug}/products`, `GET /api/products/{slug}`,
  `GET /api/compare` y `GET /go/{productId}`.
- **Alcance:**
  1. Servicio `catalog`: solo productos `approved`; nunca expone `reference_price_usd`, `provider_snapshot`,
     `agent_draft` ni `affiliate_url` (el visitante siempre sale por `/go`).
  2. Ficha: alternativas = aprobados de la misma categoría con otro `price_tier` (máx. 2: uno más barato y uno
     más premium si existen); "combina bien con" desde PRODUCT_PAIRING, solo aprobados.
  3. Comparador: parsea `ids` (2 a 4 uuids distintos), carga los productos, exige que todos estén aprobados y
     sean de la misma categoría, arma `criteria` desde la rúbrica y calcula `bestByCriterion` (en empate gana el de
     mejor `rating` y luego el de más reseñas, para que el resultado sea determinista).
  4. `/go/{productId}`: valida `src`, inserta CLICK_EVENT y responde 302 al `affiliate_url`; producto no aprobado
     → 404 sin registrar el clic.
- **TDD — tests primero:**
  - Unitario `bestByCriterion`: gana la nota más alta; empate resuelto por `rating` y luego por reseñas.
  - Funcional: 1 id o 5 ids → 422; ids repetidos → 422; dos categorías distintas → 422; uno `rejected` → 404.
  - Funcional: comparar 2 productos aprobados devuelve el ejemplo de la sección 4 a partir de la semilla.
  - Funcional: el listado de una categoría no incluye `pending` ni `rejected` ni el precio exacto.
  - Funcional: `/go/{id}?src=compare` → 302 con `tag=zapyens-20` y un CLICK_EVENT con `source = compare`;
    `src=foo` → 422; producto `pending` → 404 y ningún clic registrado.
- **Criterios de aceptación:** la página del comparador puede construirse contra estos endpoints sin simularlos; el contrato
  coincide con la sección 4.

## [Frontend] Comparador por categoría

- **Descripción:** página pública de Nuxt que muestra de 2 a 4 productos de una categoría lado a lado y ayuda a
  decidir.
- **Alcance:**
  1. Casilla "Comparar" en `ProductCard` del listado; la selección vive en la URL
     (`/comparar?ids=…`) para que se pueda compartir, y una barra inferior muestra cuántos van (máx. 4).
  2. Página `pages/comparar.vue` renderizada en el servidor con `useFetch` a `GET /api/compare`.
  3. Componente `CompareTable`: cabecera con imagen, título, rango de precio y etiquetas; una fila por criterio de
     la rúbrica con la nota y el mejor resaltado (`bestByCriterion`); filas de ideal para, pros, contras y
     especificaciones; botón "Ver en Amazon" por columna hacia `goUrl`.
  4. En móvil, columnas desplazables horizontalmente con la primera columna fija.
  5. Estados: menos de 2 productos ("Elige al menos 2 productos"), error de la API y carga.
  6. Accesible: tabla con encabezados (`<th scope>`), el resaltado no depende solo del color.
- **TDD — tests primero (Vitest + `@nuxt/test-utils`, API simulada):**
  - Con 3 productos renderiza 3 columnas y una fila por criterio.
  - El mejor de cada criterio tiene la marca de "mejor" (texto o ícono, no solo color).
  - Con 1 producto muestra el mensaje y no la tabla.
  - El botón de cada columna apunta a `/go/{id}?src=compare`.
  - Marcar un quinto producto en el listado queda deshabilitado.
- **Criterios de aceptación:** el E2E de compra pasa por esta página; la página llega renderizada desde el
  servidor (visible sin JavaScript); sin errores de accesibilidad críticos (axe).
