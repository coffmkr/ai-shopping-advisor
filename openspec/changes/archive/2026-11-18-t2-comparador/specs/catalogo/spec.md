## ADDED Requirements

### Requirement: Comparación lado a lado
El sistema SHALL comparar de 2 a 4 productos aprobados de una misma categoría y devolver la categoría, los
criterios de su rúbrica en orden y, por cada producto, su imagen, título, rango de precio, nota por criterio, ideal
para, pros, contras, especificaciones clave, etiquetas y la dirección de salida a Amazon con origen `compare`. El
orden de los productos en la respuesta MUST ser el mismo en que se pidieron.

#### Scenario: Comparar dos productos de la misma categoría
- **WHEN** el visitante compara dos productos aprobados de "Soportes para laptop"
- **THEN** recibe la categoría, sus cuatro criterios y los dos productos con todos sus campos, en el orden pedido

#### Scenario: Salida a Amazon desde el comparador
- **WHEN** el visitante pulsa "Ver en Amazon" en una columna del comparador
- **THEN** la dirección de salida es la redirección de la tienda con origen `compare`

### Requirement: Rango permitido del comparador
El sistema MUST rechazar con un error de validación (422) y un mensaje que indique el rango permitido cualquier
comparación con menos de 2 o más de 4 productos, con productos repetidos o con identificadores mal formados.

#### Scenario: Un solo producto
- **WHEN** el visitante intenta comparar un solo producto
- **THEN** el sistema responde 422 indicando que se comparan de 2 a 4 productos

#### Scenario: Cinco productos
- **WHEN** el visitante intenta comparar cinco productos
- **THEN** el sistema responde 422 indicando que se comparan de 2 a 4 productos

#### Scenario: Producto repetido
- **WHEN** el visitante pide comparar el mismo producto dos veces
- **THEN** el sistema responde 422

### Requirement: Solo productos aprobados de la misma categoría
El sistema MUST rechazar con 422 la comparación de productos de categorías distintas y MUST responder 404 si alguno
de los productos no existe o no está aprobado.

#### Scenario: Categorías distintas
- **WHEN** el visitante intenta comparar un soporte de laptop con un teclado
- **THEN** el sistema responde 422 indicando que solo se comparan productos de la misma categoría

#### Scenario: Producto no aprobado
- **WHEN** uno de los productos pedidos está pendiente o rechazado
- **THEN** el sistema responde 404

### Requirement: Mejor producto por criterio
Para cada criterio de la rúbrica el sistema SHALL indicar qué producto tiene la nota más alta. En caso de empate
MUST ganar el de mayor valoración en Amazon y, si persiste, el de más reseñas, de modo que el resultado no dependa
del orden en que se pidieron los productos. La interfaz MUST marcar al mejor de cada criterio con una señal que no
dependa solo del color.

#### Scenario: Nota más alta
- **WHEN** se comparan dos productos con notas de ergonomía 9 y 7
- **THEN** el mejor en ergonomía es el de nota 9

#### Scenario: Empate en un criterio
- **WHEN** dos productos tienen la misma nota en un criterio y distinta valoración en Amazon
- **THEN** el mejor en ese criterio es el de mayor valoración, sea cual sea el orden de la petición

### Requirement: Selección compartible y limitada
La interfaz SHALL permitir marcar productos para comparar desde el listado de una categoría, con un máximo de 4, y
la selección MUST quedar en la dirección de la página del comparador para poder compartirla. Con menos de 2
productos MUST indicar que se elijan al menos 2.

#### Scenario: Quinto producto
- **WHEN** el visitante ya marcó 4 productos
- **THEN** la casilla "Comparar" de los demás productos queda deshabilitada

#### Scenario: Comparador con un solo producto
- **WHEN** el visitante abre el comparador con un solo producto seleccionado
- **THEN** ve el mensaje "Elige al menos 2 productos para comparar" y no ve la tabla
