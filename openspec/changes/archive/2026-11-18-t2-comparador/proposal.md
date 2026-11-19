## Why

Implementa el ticket **T2 — Comparador de productos** de la historia **HU3 — El cliente compara y decide**
(README, secciones 5 y 6). Con el catálogo ya publicado (T1), el visitante ve los productos de uno en uno; el
comparador es el diferencial del producto: poner de 2 a 4 opciones lado a lado, con la nota por criterio y el mejor
de cada criterio resaltado, para decidir rápido.

## What Changes

- Endpoint público que compara de 2 a 4 productos aprobados de la misma categoría y calcula el mejor producto de
  cada criterio de la rúbrica, con un desempate determinista.
- Casilla "Comparar" en las tarjetas del listado de una categoría, con un máximo de 4 productos y una barra que
  muestra la selección.
- Página del comparador cuya selección vive en la dirección de la página, para poder compartirla.
- Cada columna sale a Amazon por la redirección de la tienda con origen `compare`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `catalogo`: se añaden los requisitos del comparador (rango permitido, misma categoría, mejor por criterio,
  salida a Amazon desde el comparador). Los requisitos existentes no cambian.

## Fuera de alcance

- Comparar productos de categorías distintas o de otras tiendas (evolución prevista, README 1.2).
- Guardar comparaciones del visitante: la selección vive solo en la dirección de la página.

## Impact

- `backend/`: servicio de comparación, validador, controlador y ruta `GET /api/compare`.
- `frontend/`: composable de selección, componentes `CompareToggle`, `CompareBar` y `CompareTable`, página
  `comparar`.
