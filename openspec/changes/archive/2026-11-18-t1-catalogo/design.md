## Context

El proyecto base (T0) ya tiene AdonisJS 7 sobre PostgreSQL, Nuxt con proxy de `/api/**` y `/go/**`, y una base de
pruebas separada. El backend todavía conserva las tablas `users` y `access_tokens` del starter. El modelo de datos
objetivo está en el README (sección 3) y el detalle técnico previo en `docs/detalle-tecnico-tickets.md`.

El proveedor de datos se verificó el 2026-11-18: Canopy responde en la versión 3.0.0 del servidor MCP y expone
`search_amazon_products` y `get_amazon_product`, pero **ya no** `get_amazon_product_top_reviews`, que el diseño
original preveía para el agente. Esto no afecta a este change; queda anotado para T5.

## Goals / Non-Goals

**Goals:**
- Crear de una vez el esquema completo que usan T1 a T5 (incluidas las columnas de curaduría de `products`), para
  que los tickets siguientes no tengan que migrar tablas ya pobladas.
- Que la semilla sea reproducible e idempotente y no dependa de la red.
- Dejar los puertos `CatalogProvider` y `AffiliateLinkBuilder` listos para que T4 y T5 los reutilicen.

**Non-Goals:**
- Autenticación del administrador: solo se crea la tabla y el usuario de prueba (T3 añade el login).
- Paginación del listado: una categoría tiene como mucho decenas de productos en el MVP.

## Decisions

**1. Esquema completo en este change, en varias migraciones.** Se crean `admin_users`, `categories`,
`rubric_criteria`, `agent_runs`, `products`, `product_scores`, `product_pairings` y `click_events` con los
enumerados y checks de la sección 3 del README (ASIN, notas 0–10, rating 0–5, ficha completa y link obligatorios
cuando el estado es `approved`, único parcial de búsqueda activa por categoría). Alternativa descartada: que cada
ticket cree sus tablas; `products` lo usan T1, T2, T4 y T5 y migrarla varias veces con datos de semilla añade
riesgo sin beneficio.

**2. `admin_users` sustituye a `users` y `access_tokens` del starter.** Se eliminan sus migraciones, el modelo
`User`, su transformer y su validador; se crea `AdminUser` con el mixin de autenticación de Lucid (hash argon2)
para que T3 solo tenga que configurar el guard de sesión.

**3. Fixtures grabadas + seeder determinista.** Un comando de consola (`node ace canopy:record`) llama a Canopy a
través del adaptador del puerto `CatalogProvider` y guarda en `database/fixtures/canopy/` una búsqueda por
categoría y el detalle de los productos elegidos. Las fichas de recomendación de los 12 productos de ejemplo se
redactan a mano en `database/fixtures/catalog_seed.ts` (texto propio, sin copiar reseñas) y referencian los ASIN
grabados. El seeder combina ambos y hace *upsert* por claves naturales (slug de categoría, clave de criterio,
`provider + ASIN`), por eso es idempotente. Los UUID de las búsquedas de origen de la semilla son fijos.
Alternativa descartada: redactar las fichas con Claude en la semilla; ataría la semilla a una API de pago y
haría el resultado no determinista.

**4. Hexagonal mínimo y explícito.**
- `app/ports/catalog_provider.ts`: `searchProducts(term, opts)` y `getProduct(asin)` con tipos propios del
  dominio (no los de Canopy).
- `app/adapters/canopy/canopy_catalog_provider.ts`: cliente MCP con `@modelcontextprotocol/sdk` (Streamable HTTP)
  y mapeo de la respuesta de Canopy al tipo de dominio. Ignora siempre la `url` del proveedor.
- `app/ports/affiliate_link_builder.ts` y `app/adapters/amazon/amazon_affiliate_link_builder.ts`: recibe solo el
  ASIN; no existe ninguna firma que acepte una URL.
- `app/services/catalog_service.ts`: consultas del catálogo; solo depende de los modelos y del puerto de links.

**5. Serialización pública explícita.** Los controladores públicos devuelven objetos construidos campo a campo por
el servicio (no `model.serialize()`), de modo que añadir una columna interna nunca la expone por accidente. Un test
funcional comprueba que la ficha no contiene `affiliateUrl`, `referencePriceUsd`, `providerSnapshot` ni
`agentDraft`.

**6. Rango de precio por terciles dentro de la categoría.** Se calcula al sembrar (y al aprobar en T4) con los
precios de referencia de los productos aprobados de la categoría; el visitante ve `$`, `$$` o `$$$`, nunca el precio.

**7. Redirección `/go/{id}`.** Valida `src` con VineJS antes de tocar la base (422 si no es válido), busca el
producto aprobado (404 si no), inserta el clic y responde 302 al `affiliate_url` guardado. No se guarda IP; el
`visitor_hash` queda nulo en el MVP.

**8. Frontend con SSR.** Páginas `index`, `categoria/[slug]` y `producto/[slug]` con `useFetch` contra el proxy;
componentes `ProductCard`, `ScoreList`, `PriceTier` y `RecommendationSheet`. El botón "Ver en Amazon" es un enlace
normal a `/go/{id}?src=...`, así funciona sin JavaScript.

## Risks / Trade-offs

- [Canopy cambia el formato de su respuesta (ya pasó de 2.1 a 3.0)] → El adaptador es el único punto que conoce
  el formato; las fixtures guardadas protegen la semilla y los tests.
- [Cuota gratuita de Canopy, 100 peticiones al mes] → La grabación se hace una vez (unas 16 peticiones) y el
  comando no vuelve a llamar si la fixture ya existe, salvo con `--force`.
- [Imágenes de Amazon servidas desde su CDN] → Aceptado solo para la demo académica (README 2.5).
- [Fichas de ejemplo redactadas a mano] → Son datos de demostración; la calidad real de las fichas la da el agente
  en T5 y la revisión humana en T4.

## Migration Plan

Base de datos de desarrollo sin datos reales: `make fresh` recrea el esquema y la semilla. Rollback con
`node ace migration:rollback`; cada migración define su `down`.
