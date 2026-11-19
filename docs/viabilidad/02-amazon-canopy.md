# Viabilidad: Amazon (datos vía MCP de Canopy + Amazon Afiliados)

Prueba hecha el 2026-10-21 con servicios reales. Tema: artículos de escritorio. Público objetivo: Perú.

## Resultado

| Pregunta | Respuesta | Evidencia |
|---|---|---|
| ¿El agente se conecta por **MCP**? | **Sí** | Cliente MCP propio contra `https://mcp.canopyapi.co/mcp`: servidor *Canopy 2.1.0*, protocolo MCP `2025-06-18`, 17 herramientas (búsqueda, ficha, reseñas, ventas, stock, ofertas, best sellers, ASIN↔GTIN) |
| ¿Obtiene datos para decidir? | **Sí** | Por producto: ASIN, título, precio, foto, rating, nº de reseñas, Prime, si es patrocinado. Hay herramientas extra para reseñas, ventas estimadas y stock |
| ¿Genera el link de afiliado con **mi ID**? | **Sí** | Cuenta de Amazon Afiliados (amazon.com) creada; tag `zapyens-20`. Links `https://www.amazon.com/dp/<ASIN>?tag=zapyens-20`; los 12 generados llevan el tag |
| ¿Costo? | Bajo | Canopy: 100 requests/mes gratis; esta prueba usó 4. Amazon Afiliados: gratis |

## Qué hizo el prototipo

1. Buscó 4 categorías por MCP: soportes para laptop, soportes para celular, teclados mecánicos, desk pads (10 resultados c/u).
2. Descartó anuncios patrocinados (14 de 40) y variantes repetidas del mismo producto.
3. Eligió 3 por categoría según rating × reseñas, con una explicación ("4.8★ con 24,411 reseñas; precio accesible").
4. Armó el link con mi tag y mostró las 12 tarjetas.

Ejemplos reales: BESIGN LS03 (US$16.99, 4.8★, 24,411 reseñas), Nulaxy phone stand (US$9.99, 4.7★, 81,971 reseñas),
Aothia desk pad (US$8.99, 4.6★, 79,526 reseñas).

## Hallazgo importante

La `url` que devuelve Canopy **ya trae un tag de afiliado ajeno** (`tag=superlink092-20`). Usarla tal cual le daría la
comisión a otro. El sistema la ignora y arma el link desde el ASIN con mi tag. Regla para el MVP: **el link siempre se
construye en nuestro sistema, nunca se copia del proveedor de datos.**

## Restricciones y riesgos

- **Fotos y precios en la web pública:** las reglas de Amazon Afiliados no permiten mostrar precios, fotos o reseñas de
  Amazon que no vengan de su API oficial (Creators API). Canopy es un tercero: sus datos sirven para el agente y el
  administrador, no para publicarlos tal cual. La Creators API exige ventas previas (≈10 en 30 días según terceros).
- **Plazo:** 180 días para lograr 3 ventas o Amazon cierra la cuenta (se puede volver a postular).
- **Cobro desde Perú:** no hay transferencia a bancos peruanos. Opciones: cheque desde US$100 (sin comisión de Amazon
  fuera de EE. UU.), tarjeta de regalo desde US$10, o depósito a una cuenta en EE. UU. (Wise/Payoneer: **por verificar**
  si están disponibles para residentes en Perú).
- **Impuestos:** no requiere empresa en EE. UU.; formulario W-8BEN (persona) o W-8BEN-E (empresa peruana).
- **Envío a Perú:** no todos los productos de amazon.com se envían a Perú; Canopy no lo filtra en la búsqueda.
- **Datos de terceros:** Canopy no es Amazon; si cambia o cierra, el agente pierde su fuente.

## Pendiente de verificar

- Que Amazon registre los clics del tag: abrir un link y revisar al día siguiente el informe de clics en Associates Central.

## Veredicto

**Técnicamente viable y probado** (MCP + datos + link con mi ID). **Viable para el negocio con restricciones**: sirve
para recomendar y cobrar comisión desde el día uno, pero la web pública no puede mostrar fotos ni precios de Amazon
hasta tener la API oficial, y el cobro desde Perú necesita resolverse (Wise/Payoneer o cheque).
