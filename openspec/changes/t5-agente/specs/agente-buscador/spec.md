## Purpose

Permite al administrador lanzar búsquedas de productos en una categoría para que un agente proponga candidatos
filtrados, cada uno con un borrador de ficha de recomendación listo para revisar.

## ADDED Requirements

### Requirement: Lanzar una búsqueda
El administrador con sesión SHALL poder lanzar una búsqueda en una categoría, con un precio máximo opcional entre 1
y 1000 dólares. El sistema SHALL responder de inmediato (202) con la búsqueda en estado `queued` y ejecutarla en
segundo plano.

#### Scenario: Búsqueda aceptada
- **WHEN** el administrador lanza una búsqueda en "Soportes para laptop" con precio máximo de 40 dólares
- **THEN** el sistema responde 202 con la búsqueda en estado `queued` y la deja encolada para el agente

#### Scenario: Categoría inexistente
- **WHEN** el administrador lanza una búsqueda en una categoría que no existe
- **THEN** el sistema responde 404

#### Scenario: Sin sesión
- **WHEN** se lanza una búsqueda sin sesión de administrador
- **THEN** el sistema responde 401

### Requirement: Una búsqueda activa por categoría
El sistema MUST rechazar con 409 una búsqueda en una categoría que ya tiene otra `queued` o `running`. Las búsquedas
de categorías distintas SHALL aceptarse y ejecutarse de una en una.

#### Scenario: Segunda búsqueda en la misma categoría
- **WHEN** ya hay una búsqueda en curso en "Soportes para laptop" y el administrador lanza otra en esa categoría
- **THEN** el sistema responde 409 con el mensaje "Ya hay una búsqueda en curso para esta categoría"

#### Scenario: Búsqueda en otra categoría
- **WHEN** ya hay una búsqueda en curso en "Soportes para laptop" y el administrador lanza otra en "Desk pads"
- **THEN** el sistema responde 202

### Requirement: Límite diario de búsquedas
El sistema MUST rechazar con 429 una búsqueda cuando ya se lanzaron en el día tantas búsquedas como indica el límite
configurado. Las búsquedas de origen de la semilla MUST NOT contar.

#### Scenario: Límite alcanzado
- **WHEN** ya se lanzaron hoy tantas búsquedas como el límite diario
- **THEN** el sistema responde 429

### Requirement: Estado de las búsquedas
El sistema SHALL listar las búsquedas, de la más reciente a la más antigua, y devolver el estado de una búsqueda con
su categoría, precio máximo, candidatos creados y, si falló, un mensaje sin datos sensibles.

#### Scenario: Listado de búsquedas
- **WHEN** el administrador abre la pantalla de búsquedas
- **THEN** ve cada búsqueda con su categoría, su estado y el número de candidatos creados

### Requirement: Filtrado de resultados
El agente MUST descartar los resultados patrocinados, sin ASIN válido, sin precio o sin valoración, por encima del
precio máximo, variantes repetidas (misma valoración y mismo número de reseñas) y productos que ya existen en el
sistema en cualquier estado. De los restantes SHALL quedarse con los mejor valorados (valoración ponderada por número
de reseñas), como máximo 4 por búsqueda.

#### Scenario: Patrocinados y precio
- **WHEN** la búsqueda devuelve resultados patrocinados y productos por encima del precio máximo
- **THEN** ninguno de ellos aparece como candidato

#### Scenario: Producto rechazado antes
- **WHEN** el agente vuelve a encontrar un producto que el administrador rechazó
- **THEN** no aparece de nuevo en la cola de revisión

### Requirement: Borrador de la ficha validado
Por cada candidato el agente SHALL obtener un borrador con resumen, ideal para, no es para ti si, pros, contras,
especificaciones clave y una nota de 0 a 10 por cada criterio de la rúbrica de la categoría. El sistema MUST validar el
borrador y MUST descartar el candidato si el borrador se refiere a otro producto o no trae exactamente los criterios
de la rúbrica. El texto del proveedor MUST tratarse como datos, no como instrucciones.

#### Scenario: Borrador de otro producto
- **WHEN** el borrador devuelto se refiere a un ASIN distinto del producto pedido
- **THEN** ese candidato se descarta

#### Scenario: Criterio ajeno a la rúbrica
- **WHEN** el borrador incluye notas de criterios que no son de la rúbrica o le falta alguno
- **THEN** ese candidato se descarta

### Requirement: Fallo del proveedor sin candidatos parciales
Si el proveedor de datos no responde, la búsqueda MUST quedar `failed` con un mensaje claro y sin ningún candidato
creado.

#### Scenario: Canopy no responde
- **WHEN** el proveedor de datos falla durante la búsqueda
- **THEN** la búsqueda queda `failed` con un mensaje y no se crea ningún candidato

### Requirement: Borrador básico sin la API de Claude
Si no hay una clave de la API de Claude configurada, el agente SHALL crear igualmente los candidatos con un borrador
básico construido a partir de los datos del producto, cuyo resumen indique que debe completarlo el administrador.

#### Scenario: Sin clave de Claude
- **WHEN** se ejecuta una búsqueda sin clave de la API de Claude
- **THEN** los candidatos se crean con un borrador básico que el administrador debe completar
