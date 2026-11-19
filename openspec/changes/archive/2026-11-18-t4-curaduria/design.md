## Context

El esquema (T1) ya tiene en `products` las columnas de curaduría y el check que impide un `approved` sin ficha
completa o sin link. El acceso al panel (T3) protege `/api/admin/*`. Existen `AmazonAffiliateLinkBuilder` y
`assignPriceTiers` como piezas puras reutilizables. El detalle técnico previo está en
`docs/detalle-tecnico-tickets.md` ("Aprobación y rechazo del candidato").

## Goals / Non-Goals

**Goals:**
- Aprobación atómica y a prueba de dobles clics.
- Errores de validación comprensibles en el editor (campo por campo).

**Non-Goals:**
- Historial de versiones de la ficha más allá del borrador original.

## Decisions

**1. Contrato.** `GET /api/admin/candidates?status=pending&agentRunId=`, `GET /api/admin/candidates/:id` y
`PATCH /api/admin/candidates/:id` con `{ action: 'approve', sheet }` o `{ action: 'reject', reason? }` (README 4).

**2. Validación en dos pasos.** VineJS valida la forma de la ficha (longitudes, listas, notas 0–10). Después el
servicio valida contra la base: las claves de `scores` deben coincidir exactamente con los criterios de la
categoría del producto y los `pairedProductIds` deben ser productos aprobados. Ambos pasos devuelven 422 con
`errors: [{ field, message }]`.

**3. Transacción con bloqueo de fila.** `review.approve` abre una transacción, hace `SELECT … FOR UPDATE` del
producto, comprueba `status = pending` (si no, 409), escribe la ficha, reemplaza notas y emparejamientos, genera el
link, fija `approved`, `reviewed_by_id` y `reviewed_at`, y recalcula los rangos de precio de la categoría. Dos
aprobaciones simultáneas se serializan en el bloqueo: la segunda ve `approved` y responde 409. Alternativa
descartada: un `UPDATE … WHERE status = 'pending'` optimista; con varias tablas que escribir es más simple y claro
el bloqueo.

**4. Candidatos de la semilla.** `database/fixtures/candidates_seed.ts` define 8 candidatos (ASIN de las búsquedas
grabadas) con un borrador redactado a mano; uno de ellos (Redragon K521, que no es mecánico) sirve como caso de
rechazo en la demo. El seeder los inserta como `pending` con su borrador en `agent_draft` y los datos del resultado
de búsqueda en `provider_snapshot`, sin pisar el estado si ya fueron revisados (idempotente y respetando decisiones).

**5. Editor en el panel.** `SheetEditor` recibe el borrador y la rúbrica, y emite la ficha. Pros y contras se editan
como una línea por elemento; las especificaciones como "clave: valor" por línea; las notas con un campo numérico por
criterio. Los errores 422 se muestran junto a cada campo.

## Risks / Trade-offs

- [Recalcular rangos cambia el rango de productos ya publicados] → Es el comportamiento deseado: el rango es
  relativo a la categoría.
- [Borradores de la semilla redactados a mano] → Son datos de demostración; en T5 los redacta el agente.
