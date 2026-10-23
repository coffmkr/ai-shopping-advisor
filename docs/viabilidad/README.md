# Pruebas de viabilidad

Antes de diseñar el producto se probaron proveedores con servicios y datos reales, con el objetivo de descartar
opciones con evidencia y no de confirmar supuestos.

| Informe | Proveedor | Veredicto |
|---|---|---|
| [01-affiliate-zeroclick.md](01-affiliate-zeroclick.md) | Affiliate.com vía ZeroClick | Descartado: los links no atribuyen la venta al afiliado |
| [02-amazon-canopy.md](02-amazon-canopy.md) | Amazon (datos por MCP de Canopy) + Amazon Associates | Elegido para el MVP, con restricciones de negocio |

Los scripts de los prototipos (cliente MCP, búsquedas, módulo de autenticación y sus tests) se ejecutaron en una
carpeta de pruebas aparte y no forman parte de este repositorio: eran desechables y contenían configuración local
con credenciales. El código del producto se construirá desde cero a partir de la documentación del `README.md`.
