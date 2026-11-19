## Context

El catálogo (T1) ya expone tarjetas con notas por criterio y una redirección `/go` que acepta el origen `compare`.
La capacidad `catalogo` tiene su spec viva en `openspec/specs/catalogo/spec.md`; este change le añade requisitos.

## Goals / Non-Goals

**Goals:**
- Un cálculo de "mejor por criterio" puro y determinista, probado con tests unitarios.
- Una página del comparador que llegue renderizada desde el servidor y se pueda compartir por URL.

**Non-Goals:**
- Persistir la selección más allá de la sesión del navegador.

## Decisions

**1. `GET /api/compare?ids=a,b,c`.** Los ids van separados por comas en un único parámetro, igual que en la URL
de la página (`/comparar?ids=…`), para que copiar el enlace reproduzca la comparación. Validación con VineJS: lista
de 2 a 4 UUID distintos (422 con mensaje del rango). Después, el servicio carga los productos aprobados: si falta
alguno, 404; si hay más de una categoría, 422.

**2. `bestByCriterion` como función pura** (`app/services/compare.ts`): recibe productos con notas, valoración y
número de reseñas, y devuelve `{ criterio: productId }`. Empate → mayor `rating` → más reseñas → menor id (último
desempate para que sea total). Alternativa descartada: calcularlo en el frontend; el contrato de la API ya lo
promete (README 4) y así se prueba una sola vez.

**3. Serialización pública con el mismo patrón del catálogo**: objetos construidos campo a campo, reutilizando las
funciones de `catalog_service` (notas y `goUrl` con origen `compare`).

**4. Selección en el frontend con `useState` + `sessionStorage`.** Un composable `useCompareSelection` guarda hasta
4 ids de una categoría; si el visitante marca un producto de otra categoría, la selección se reinicia con ese
producto (la API exige misma categoría). La barra inferior enlaza a `/comparar?ids=…`.

**5. Tabla accesible.** `CompareTable` usa `<table>` con `<th scope>`; el mejor de cada fila lleva el texto
"Mejor" además del color. En móvil la tabla se desplaza horizontalmente con la primera columna fija.

## Risks / Trade-offs

- [`sessionStorage` no existe en el servidor] → el composable solo lo lee en el cliente; la página del comparador
  depende únicamente de la URL, así que se renderiza en servidor sin él.
- [Un enlace compartido puede quedar obsoleto si un producto se despublica] → la API responde 404 y la página
  muestra un mensaje en lugar de la tabla.
