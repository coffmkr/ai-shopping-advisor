## 1. Mejor por criterio

- [x] 1.1 Tests unitarios (deben fallar): nota más alta gana, empate por valoración, empate por reseñas, resultado independiente del orden
- [x] 1.2 Función `bestByCriterion`; tests en verde

## 2. API del comparador

- [x] 2.1 Tests funcionales (deben fallar): comparación válida con campos y orden pedido, `goUrl` con `src=compare`, 422 con 1 y 5 productos, 422 con repetidos o id mal formado, 422 con categorías distintas, 404 con producto no aprobado
- [x] 2.2 Validador, servicio, controlador y ruta `GET /api/compare`; tests en verde

## 3. Interfaz del comparador

- [x] 3.1 Tests de componentes (deben fallar): tabla con una columna por producto y una fila por criterio, marca "Mejor" en texto, mensaje con menos de 2 productos, botón con `src=compare`, casilla deshabilitada con 4 seleccionados
- [x] 3.2 Composable `useCompareSelection`, `CompareToggle`, `CompareBar`, `CompareTable` y página `comparar`; tests en verde
- [x] 3.3 Verificación manual: marcar productos en una categoría, abrir el comparador, compartir la URL y salir a Amazon

## 4. Cierre

- [x] 4.1 `make test`, typecheck y lint en verde
