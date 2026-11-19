## Purpose

Permite al visitante recorrer el catálogo de productos recomendados por categoría, entender por qué se recomienda
cada uno a través de su ficha y salir a Amazon con el link de afiliado de la tienda, registrando cada clic.

## ADDED Requirements

### Requirement: Solo los productos aprobados son públicos
El sistema SHALL mostrar en el catálogo únicamente productos en estado aprobado. Los productos pendientes,
rechazados o despublicados MUST NOT aparecer en ningún listado ni ficha pública.

#### Scenario: Listado sin productos no aprobados
- **WHEN** una categoría tiene productos aprobados, pendientes y rechazados y el visitante abre su listado
- **THEN** el listado contiene solo los productos aprobados

#### Scenario: Ficha de un producto no aprobado
- **WHEN** el visitante pide la ficha de un producto pendiente o rechazado
- **THEN** el sistema responde que el producto no existe (404)

### Requirement: Categorías de la tienda
El sistema SHALL listar las categorías de la tienda con su nombre, su identificador público (slug) y el número
de productos aprobados que contiene.

#### Scenario: Inicio con categorías
- **WHEN** el visitante abre el inicio de la tienda
- **THEN** ve todas las categorías y, para cada una, cuántos productos recomendados tiene

#### Scenario: Productos destacados en el inicio
- **WHEN** el visitante abre el inicio de la tienda y existen productos aprobados
- **THEN** ve una selección de productos destacados, como máximo uno por categoría, elegidos por su nota media

### Requirement: Listado público de una categoría
El sistema SHALL devolver, para una categoría, su nombre, los criterios de su rúbrica en orden y sus productos
aprobados ordenados por nota media descendente. Cada producto MUST incluir imagen, título, nota por criterio,
etiquetas, rango de precio (budget, mid o premium) y el resumen de por qué se recomienda.

#### Scenario: Listado de una categoría existente
- **WHEN** el visitante abre la categoría "soportes-laptop"
- **THEN** recibe la categoría, sus criterios y sus productos aprobados con los campos indicados, el de mejor nota media primero

#### Scenario: Categoría inexistente
- **WHEN** el visitante abre una categoría cuyo slug no existe
- **THEN** el sistema responde que la categoría no existe (404)

### Requirement: Ficha de recomendación completa
El sistema SHALL devolver la ficha de un producto aprobado con: imagen, título, marca, por qué lo recomendamos,
ideal para, no es para ti si, pros, contras, nota por cada criterio de la rúbrica de su categoría,
especificaciones clave, etiquetas, rango de precio y fecha de revisión.

#### Scenario: Ficha de un producto aprobado
- **WHEN** el visitante abre la ficha de un producto aprobado
- **THEN** recibe todos los bloques de la ficha, con una nota por cada criterio de la rúbrica de su categoría

### Requirement: Alternativas y productos que combinan
La ficha SHALL incluir hasta dos alternativas de la misma categoría con otro rango de precio (una más barata y una
más premium, si existen) y los productos aprobados que combinan bien con él. Ninguno de ellos MUST ser un producto
no aprobado.

#### Scenario: Producto de rango medio con alternativas
- **WHEN** el visitante abre la ficha de un producto de rango medio y su categoría tiene productos aprobados de rango económico y premium
- **THEN** la ficha incluye una alternativa económica y una premium

#### Scenario: Producto combinable con uno rechazado
- **WHEN** un producto está marcado como combinable con otro que fue rechazado
- **THEN** la ficha no muestra el producto rechazado entre los que combinan

### Requirement: Datos que nunca se exponen al público
Las respuestas públicas MUST NOT incluir el link de afiliado, el precio exacto de referencia, la respuesta original
del proveedor de datos ni el borrador original del agente. La única salida pública hacia Amazon SHALL ser la
redirección de la tienda.

#### Scenario: Respuesta de la ficha sin datos internos
- **WHEN** el visitante pide la ficha de un producto aprobado
- **THEN** la respuesta no contiene el link de afiliado, el precio exacto, los datos originales del proveedor ni el borrador del agente, y sí contiene la dirección de redirección de la tienda

### Requirement: Link de afiliado propio
El link de afiliado SHALL construirse en el servidor a partir del ASIN del producto y del tag de afiliado
configurado, con el formato `https://www.amazon.com/dp/{ASIN}?tag={TAG}`. El sistema MUST NOT reutilizar URLs
devueltas por el proveedor de datos y MUST rechazar ASIN que no tengan exactamente 10 caracteres alfanuméricos en
mayúsculas.

#### Scenario: ASIN válido
- **WHEN** se construye el link para el ASIN "B08BRCT4JH" con el tag "zapyens-20"
- **THEN** el link es `https://www.amazon.com/dp/B08BRCT4JH?tag=zapyens-20`

#### Scenario: ASIN inválido
- **WHEN** se intenta construir el link para un ASIN de 9 caracteres o con minúsculas
- **THEN** el sistema rechaza la operación

#### Scenario: Proveedor con tag ajeno
- **WHEN** los datos originales del proveedor de un producto incluyen una URL con otro tag de afiliado
- **THEN** el link de afiliado del producto contiene el tag de la tienda y no contiene el tag ajeno

### Requirement: Salida a Amazon con clic registrado
El sistema SHALL redirigir al visitante a Amazon desde `/go/{productId}?src={origen}` con una redirección temporal
al link de afiliado del producto, y MUST registrar el clic con el producto, el origen (`listing`, `detail` o
`compare`) y la fecha. No MUST guardar la IP ni datos personales del visitante.

#### Scenario: Clic desde la ficha
- **WHEN** el visitante pulsa "Ver en Amazon" en la ficha de un producto aprobado
- **THEN** llega a Amazon con el link de afiliado de la tienda y queda registrado un clic con origen `detail`

#### Scenario: Origen inválido
- **WHEN** se llama a la redirección con un origen distinto de `listing`, `detail` o `compare`
- **THEN** el sistema rechaza la petición (422) y no registra ningún clic

#### Scenario: Producto no aprobado
- **WHEN** se llama a la redirección de un producto pendiente o rechazado
- **THEN** el sistema responde 404 y no registra ningún clic

### Requirement: Aviso de afiliado
Todas las páginas públicas SHALL mostrar el aviso de afiliado de Amazon.

#### Scenario: Aviso en cualquier página
- **WHEN** el visitante abre el inicio, una categoría o una ficha
- **THEN** la página muestra el aviso de afiliado

### Requirement: Semilla de productos de ejemplo
El sistema SHALL poder cargar, con un comando y sin llamar a servicios externos, cuatro categorías de escritorio
con su rúbrica, un administrador de prueba, una búsqueda de origen ficticia por categoría y doce productos
aprobados con ficha completa construidos a partir de respuestas reales del proveedor grabadas en el repositorio.
Cargarla dos veces MUST dejar el mismo resultado.

#### Scenario: Semilla en una base vacía
- **WHEN** se ejecuta la semilla en una base de datos recién migrada
- **THEN** existen cuatro categorías con su rúbrica, doce productos aprobados con una nota por criterio y un link de afiliado con el tag de la tienda, y cada producto tiene una búsqueda de origen marcada como semilla

#### Scenario: Semilla repetida
- **WHEN** se ejecuta la semilla dos veces seguidas
- **THEN** el número de categorías, productos y búsquedas es el mismo que tras la primera ejecución
