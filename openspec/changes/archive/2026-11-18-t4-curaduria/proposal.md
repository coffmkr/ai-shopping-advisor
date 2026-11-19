## Why

Implementa el ticket **T4 — Revisión y publicación de candidatos** de la historia **HU2 — El administrador publica
la ficha con link de afiliado** (README, secciones 5 y 6). Es la pieza más delicada del producto: decide qué se
publica, con qué ficha y con qué link de afiliado. Sin ella, el catálogo solo puede crecer a mano.

## What Changes

- Cola de revisión: listado de candidatos por estado y detalle de un candidato con los datos del proveedor, el
  borrador de su ficha y la rúbrica de su categoría.
- Aprobación: el administrador corrige la ficha y la aprueba; el sistema la valida contra la rúbrica, guarda la
  versión editada sin tocar el borrador original, genera el link de afiliado desde el ASIN, recalcula los rangos de
  precio de la categoría y publica el producto, todo en una transacción y sin llamar a servicios externos.
- Rechazo con motivo opcional: el producto no aparece nunca en el catálogo ni vuelve a la cola.
- La semilla añade 8 candidatos pendientes (2 por categoría) para poder revisar antes de que exista el agente.
- Pantallas del panel: cola de revisión y editor de la ficha con aprobar y rechazar.

## Capabilities

### New Capabilities

- `curaduria`: revisión, corrección, aprobación y rechazo de candidatos por el administrador, y publicación con
  link de afiliado.

### Modified Capabilities

(ninguna; la capacidad `catalogo` ya exige mostrar solo aprobados y construir el link desde el ASIN)

## Fuera de alcance

- Despublicar un producto ya aprobado (el estado existe en el modelo, sin pantalla en el MVP).
- Editar fichas ya publicadas.
- Crear candidatos: los crea el agente (T5) o la semilla.

## Impact

- `backend/`: servicio `review`, validador de la ficha, controlador y rutas `/api/admin/candidates`, semilla de
  candidatos pendientes.
- `frontend/`: páginas `admin/revision` y `admin/revision/[id]`, componente `SheetEditor`.
