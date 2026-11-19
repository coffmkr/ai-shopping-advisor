## Why

Implementa el ticket **T1 — Catálogo: inicio, categorías, ficha y clic hacia Amazon** de la historia **HU5 — El
visitante navega el catálogo y ve por qué se recomienda cada producto** (README, secciones 5 y 6). Es el primer
flujo de punta a punta del producto: con él, la tienda ya funciona con los productos de ejemplo de la semilla y
genera ingresos de afiliado, sin depender todavía del agente ni del panel. Todo lo demás (comparador, revisión,
agente) se construye encima de este modelo de datos.

## What Changes

- Modelo de datos del catálogo: categorías, criterios de la rúbrica, administradores, búsquedas del agente (como
  origen obligatorio de cada producto), productos con su ficha de recomendación, notas por criterio, productos que
  combinan entre sí y clics de afiliado, con las restricciones de la sección 3 del README.
- Semilla reproducible: 4 categorías de escritorio con su rúbrica, un administrador de prueba, una búsqueda de
  origen ficticia por categoría y 12 productos aprobados con ficha, a partir de respuestas de Canopy grabadas en el
  repositorio. La semilla no llama a servicios externos.
- Herramienta de grabación de respuestas de Canopy (comando de consola) que se ejecuta una vez y guarda los datos
  como fixtures; reutiliza un adaptador de Canopy detrás del puerto `CatalogProvider`.
- Constructor del link de afiliado en el servidor a partir del ASIN y el tag configurado.
- API pública: categorías, listado de una categoría, ficha de un producto y redirección `/go/{id}` con registro
  del clic.
- Sitio público en Nuxt: inicio, página de categoría y ficha de producto, con el aviso de afiliado en todas las
  páginas.

## Capabilities

### New Capabilities

- `catalogo`: navegación pública del catálogo de productos recomendados (categorías, listado, ficha de
  recomendación), salida a Amazon con link de afiliado propio y registro del clic, y semilla de productos de
  ejemplo.

### Modified Capabilities

(ninguna)

## Fuera de alcance

- Comparador de productos (T2).
- Login y panel del administrador (T3, T4): aquí solo se crea la tabla de administradores y el administrador de
  prueba que necesita la semilla.
- Ejecución del agente buscador y su cola (T5): aquí solo se usa el adaptador de Canopy para grabar la semilla.
- Asistente conversacional y embeddings (ampliación).
- Filtros y ordenación avanzada del listado más allá del orden por defecto.

## Impact

- `backend/`: migraciones, modelos Lucid, seeders, fixtures grabadas, puertos `CatalogProvider` y
  `AffiliateLinkBuilder`, adaptadores de Canopy y Amazon, servicio `catalog`, controladores y rutas públicas.
  Se eliminan las tablas `users` y `access_tokens` del starter de AdonisJS, sustituidas por `admin_users`.
- `frontend/`: páginas `index`, `categoria/[slug]` y `producto/[slug]`, componentes de tarjeta y ficha.
- Dependencias nuevas: `@modelcontextprotocol/sdk` (cliente MCP de Canopy).
- Consumo de Canopy: unas 16 peticiones, una sola vez, para grabar la semilla.
