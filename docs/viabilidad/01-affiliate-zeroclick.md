# Viabilidad: Affiliate.com (vía ZeroClick)

Prueba hecha el 2026-10-21 con servicios reales. Tema: libros. Presupuesto: US$0.50 en créditos prepagados.

## Resultado

| Pregunta | Respuesta | Evidencia |
|---|---|---|
| ¿Me puedo conectar? | **Sí, por API** (sin MCP) | Registro con email verificado; token de acceso de 15 minutos que se renueva solo con un refresh token rotativo (probado forzando un token inválido) |
| ¿Obtiene datos para decidir? | **Sí** | Por producto: título, precio, moneda, imagen (99 %), código de barras (91 %), disponibilidad, estado (nuevo/usado), tienda. Sin ratings ni autor fiable (5 %) |
| ¿Sirve para comparar entre tiendas? | **Sí, muy bien** | Un ISBN de *Dune* devolvió 25 ofertas en ~20 tiendas; 11 ISBN en un solo request devolvieron 66 ofertas en 12 tiendas de EE. UU. |
| ¿Genera el link de afiliado con **mi ID**? | **No** | Todos los links traen `affiliate_id=@@@&sub_id=###` sin rellenar (ver hallazgo) |
| ¿Costo? | Bajo | US$0.02 por búsqueda; la prueba gastó US$0.22 (11 búsquedas) |

## Qué hizo el prototipo

1. Se registró, compró US$0.50 de créditos con checkout de Stripe y consultó el saldo.
2. Buscó libros por título y por ISBN, y probó filtros por categoría, moneda y precio.
3. Armó un recomendador: dado un pedido ("un libro de ciencia ficción para regalar, menos de 20 dólares") eligió 3
   libros con su explicación y los mostró en tarjetas.

Aprendizaje: la búsqueda por texto es difusa ("Foundation" trae "Founding") y el catálogo mezcla monedas y
productos usados; la búsqueda exacta por código de barras sí es confiable.

## Hallazgo importante

Los productos no traen un link de afiliado propio. El único link (`urls.outclick`) lleva los parámetros de afiliado
**sin rellenar** (`@@@` y `###`):

- Abriendo el primer salto de ese link, Barnes & Noble redirige a la **URL normal de la tienda, sin tracking**, y
  BiggerBooks agrega un referido de CJ **que no es mío**.
- El parámetro `networks` (documentado para poner el ID de afiliado propio por red) **no tuvo efecto**: con un ID de
  prueba en todas las redes aceptadas, los links volvieron idénticos.
- La API no expone a qué red pertenece cada tienda, y no acepta nombres como Impact, Awin o CJ.

Además, la documentación no coincide con la API real (por ejemplo, los campos de URL documentados no vienen en las
respuestas).

## Restricciones y riesgos

- **Monetización:** sin mi ID en los links, el negocio no existe. Es el riesgo decisivo.
- **Proveedor nuevo y documentación inconsistente:** cualquier cambio puede romper la integración.
- **Credencial rotativa:** el refresh token cambia en cada renovación y vence a los 30 días sin uso; si se pierde,
  hay que repetir el registro por email.
- **Pago por búsqueda:** cada consulta cuesta, incluso las que no sirven.

## Veredicto

**Técnicamente viable** (conexión, datos y comparación entre tiendas funcionan). **No viable para el negocio**: los
links no atribuyen la venta. **Descartado.** Queda abierto preguntar a Affiliate.com si su API nativa (sin ZeroClick),
que documenta el uso de IDs de afiliado propios, resuelve este punto.
