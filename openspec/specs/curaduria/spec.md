# curaduria Specification

## Purpose
Permite al administrador revisar los candidatos propuestos, corregir su ficha de recomendación y decidir cuáles se
publican en la tienda con el link de afiliado propio.

## Requirements

### Requirement: Cola de revisión
El sistema SHALL listar para el administrador los candidatos filtrados por estado (por defecto, pendientes) y,
opcionalmente, por búsqueda de origen, con imagen, título, marca, valoración, número de reseñas, categoría y
estado. Solo el administrador con sesión MUST poder verla.

#### Scenario: Pendientes por defecto
- **WHEN** el administrador abre la cola de revisión
- **THEN** ve solo los candidatos pendientes

#### Scenario: Sin sesión
- **WHEN** se pide la cola de revisión sin sesión de administrador
- **THEN** el sistema responde 401

### Requirement: Detalle del candidato
El sistema SHALL mostrar un candidato con su ASIN, sus datos del proveedor (incluido el precio de referencia, solo
visible en el panel), el borrador de su ficha y los criterios de la rúbrica de su categoría.

#### Scenario: Candidato con borrador
- **WHEN** el administrador abre un candidato pendiente
- **THEN** recibe sus datos, el borrador de la ficha y los criterios de su categoría

#### Scenario: Candidato inexistente
- **WHEN** el administrador pide un candidato que no existe
- **THEN** el sistema responde 404

### Requirement: Aprobar con la ficha editada
Al aprobar, el sistema SHALL publicar la ficha enviada por el administrador (no el borrador), MUST conservar intacto
el borrador original y SHALL dejar el producto aprobado con la fecha y el administrador que lo revisó. Aprobar MUST
NOT depender de ningún servicio externo.

#### Scenario: Aprobar con resumen editado
- **WHEN** el administrador cambia el resumen del borrador y aprueba
- **THEN** el producto queda aprobado con el resumen editado, el borrador original no cambia y el producto aparece en el listado público de su categoría

### Requirement: Link de afiliado al aprobar
Al aprobar, el sistema SHALL generar el link de afiliado a partir del ASIN del producto y del tag de la tienda. El
link MUST NOT contener el tag de afiliado de ninguna URL del proveedor.

#### Scenario: Proveedor con tag ajeno
- **WHEN** el administrador aprueba un candidato cuyos datos del proveedor incluyen una URL con otro tag
- **THEN** el link guardado es `https://www.amazon.com/dp/{ASIN}?tag=zapyens-20` y no contiene el tag ajeno

### Requirement: Validación de la ficha contra la rúbrica
El sistema MUST rechazar con 422 y la lista de campos que fallan una aprobación cuya ficha no tenga: resumen de 20 a
500 caracteres, ideal para, no es para ti si, entre 1 y 5 pros, entre 1 y 5 contras, y exactamente una nota de 0 a
10 por cada criterio de la rúbrica de la categoría del producto, sin criterios de otras categorías. Los productos
indicados como "combina bien con" MUST estar aprobados. El candidato MUST seguir pendiente.

#### Scenario: Falta una nota
- **WHEN** el administrador aprueba una ficha sin la nota de uno de los criterios
- **THEN** el sistema responde 422 indicando el criterio que falta y el candidato sigue pendiente

#### Scenario: Resumen demasiado corto
- **WHEN** el administrador aprueba una ficha con un resumen de menos de 20 caracteres
- **THEN** el sistema responde 422 y el candidato sigue pendiente

### Requirement: Una sola revisión por candidato
El sistema MUST aceptar la aprobación o el rechazo solo si el candidato está pendiente; en otro caso SHALL responder
409 sin modificarlo, incluso si llegan dos peticiones a la vez.

#### Scenario: Doble aprobación
- **WHEN** se envían dos aprobaciones del mismo candidato a la vez
- **THEN** una responde 200 y la otra 409

### Requirement: Rechazo
El sistema SHALL marcar como rechazado un candidato pendiente, con un motivo opcional. Un producto rechazado MUST
NOT aparecer en el catálogo, el comparador ni la cola de pendientes.

#### Scenario: Rechazar un candidato
- **WHEN** el administrador rechaza un candidato con el motivo "No es mecánico"
- **THEN** queda rechazado con ese motivo y no aparece en la cola de pendientes ni en el catálogo

### Requirement: Rango de precio al publicar
Al aprobar, el sistema SHALL recalcular el rango de precio (económico, medio o premium) de todos los productos
aprobados de la categoría por terciles de su precio de referencia.

#### Scenario: Recalcular rangos
- **WHEN** se aprueba un cuarto producto en una categoría con tres aprobados
- **THEN** todos los productos aprobados de la categoría tienen rango de precio

### Requirement: Candidatos pendientes en la semilla
La semilla SHALL incluir dos candidatos pendientes por categoría, con borrador de ficha, construidos a partir de
respuestas reales del proveedor grabadas, para poder revisar sin ejecutar el agente.

#### Scenario: Pendientes tras la semilla
- **WHEN** se carga la semilla
- **THEN** existen 8 candidatos pendientes, cada uno con borrador de ficha y búsqueda de origen marcada como semilla
