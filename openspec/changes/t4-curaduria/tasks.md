## 1. Candidatos en la semilla

- [x] 1.1 Tests (deben fallar): 8 pendientes con borrador y búsqueda de origen de semilla; la semilla no reabre un candidato ya revisado
- [x] 1.2 Fixture de candidatos y seeder; tests en verde

## 2. API de revisión

- [x] 2.1 Tests funcionales (deben fallar): 401 sin sesión, cola solo con pendientes, detalle con borrador y rúbrica, 404 de inexistente
- [x] 2.2 Tests funcionales de aprobación (deben fallar): aprobar publica la ficha editada y conserva el borrador, link con el tag propio y sin el ajeno, 422 por nota faltante o criterio ajeno o resumen corto, 409 en doble aprobación simultánea, rangos de precio recalculados
- [x] 2.3 Tests funcionales de rechazo (deben fallar): queda rechazado con motivo, fuera de la cola y del catálogo, 409 si ya estaba revisado
- [x] 2.4 Validador de la ficha, servicio `review`, controlador y rutas; tests en verde

## 3. Pantallas del panel

- [ ] 3.1 Tests de componentes (deben fallar): el editor emite la ficha con notas por criterio, pros y contras por línea; muestra los errores 422 por campo
- [ ] 3.2 `SheetEditor`, páginas `admin/revision` y `admin/revision/[id]`; tests en verde
- [ ] 3.3 Verificación manual: aprobar un candidato y verlo en el catálogo; rechazar el Redragon K521

## 4. Cierre

- [ ] 4.1 `make test`, typecheck y lint en verde
