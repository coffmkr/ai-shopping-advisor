## 1. Esquema de datos

- [x] 1.1 Tests de restricciones (deben fallar): producto duplicado por proveedor + ASIN, ASIN de 9 caracteres, nota 11, producto aprobado sin link o sin resumen, producto combinado consigo mismo, dos búsquedas activas en la misma categoría
- [x] 1.2 Eliminar `users`, `access_tokens`, el modelo `User` y su transformer y validador del starter
- [x] 1.3 Migraciones de enumerados y tablas (`admin_users`, `categories`, `rubric_criteria`, `agent_runs`, `products`, `product_scores`, `product_pairings`, `click_events`) con checks e índices
- [x] 1.4 Modelos Lucid con relaciones y `AdminUser` con hash
- [x] 1.5 Tests de restricciones en verde

## 2. Link de afiliado y proveedor de datos

- [x] 2.1 Tests unitarios de `AffiliateLinkBuilder` (deben fallar): formato exacto, ASIN inválido, sin forma de pasar una URL
- [x] 2.2 Puerto y adaptador de Amazon; tests en verde
- [x] 2.3 Puerto `CatalogProvider`, adaptador MCP de Canopy y test unitario del mapeo con una respuesta grabada
- [x] 2.4 Comando `canopy:record` y grabación de las fixtures de las 4 categorías

## 3. Semilla

- [ ] 3.1 Tests de la semilla (deben fallar): conteos esperados, link con el tag de la tienda, búsqueda de origen `is_seed`, idempotencia
- [ ] 3.2 Fichas de ejemplo redactadas para 12 productos y cálculo del rango de precio por terciles
- [ ] 3.3 Seeder idempotente; tests en verde

## 4. API pública

- [ ] 4.1 Tests funcionales (deben fallar): categorías con conteo, listado de una categoría solo con aprobados y ordenado, 404 de categoría, ficha completa, 404 de producto no aprobado, alternativas y combinables sin no aprobados, ficha sin datos internos
- [ ] 4.2 Servicio `catalog`, controladores y rutas; tests en verde
- [ ] 4.3 Tests funcionales de `/go` (deben fallar): 302 con el tag y clic `detail`, 422 con origen inválido sin clic, 404 de producto no aprobado sin clic
- [ ] 4.4 Controlador de redirección; tests en verde

## 5. Sitio público

- [ ] 5.1 Tests de componentes (deben fallar): tarjeta con nota, etiquetas, rango y enlace `/go` con `src=listing`; ficha con todos los bloques y enlace con `src=detail`
- [ ] 5.2 Componentes y páginas de inicio, categoría y ficha; tests en verde
- [ ] 5.3 Verificación manual con la semilla: inicio, categoría, ficha y salida a Amazon a través del proxy

## 6. Cierre

- [ ] 6.1 `make test`, typecheck y lint en verde
- [ ] 6.2 Actualizar README si alguna decisión cambió respecto a lo documentado
