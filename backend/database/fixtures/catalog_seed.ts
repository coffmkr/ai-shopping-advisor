import type { Badge, KeySpecs } from '#models/types'

/**
 * Fichas de recomendación de los 12 productos de ejemplo de la semilla.
 * Los datos del producto (precio, valoración, imagen) salen de las respuestas de
 * Canopy grabadas en database/fixtures/canopy/product-{ASIN}.json; aquí solo va
 * la parte editorial, redactada con palabras propias (sin copiar reseñas).
 */
export interface SheetFixture {
  asin: string
  categorySlug: string
  slug: string
  title: string
  summary: string
  idealFor: string
  notFor: string
  pros: string[]
  cons: string[]
  scores: Record<string, number>
  keySpecs: KeySpecs
  badges: Badge[]
  pairsWith: string[]
}

export const SHEET_FIXTURES: SheetFixture[] = [
  // ── Soportes para laptop ──────────────────────────────────────────────
  {
    asin: 'B08BRCT4JH',
    categorySlug: 'soportes-laptop',
    slug: 'besign-ls03-soporte-laptop-aluminio',
    title: 'BESIGN LS03 — soporte de aluminio para laptop',
    summary:
      'El soporte fijo más sólido de su precio: eleva la pantalla unos 15 cm hasta la altura de los ojos, no se mueve al escribir y deja circular el aire bajo la laptop.',
    idealFor: 'Home office diario con laptop de 10 a 15,6 pulgadas y teclado externo.',
    notFor: 'Necesitas ajustar la altura o llevarlo en la mochila todos los días.',
    pros: [
      'Aluminio firme, sin vibraciones al teclear',
      'Eleva la pantalla a la altura de los ojos',
      'Se desarma en piezas planas para guardarlo',
    ],
    cons: ['La altura es fija', 'No admite laptops de más de 15,6 pulgadas'],
    scores: { ergonomia: 9, construccion: 9, portabilidad: 5, calidad_precio: 10 },
    keySpecs: {
      'Material': 'Aluminio',
      'Compatibilidad': 'Laptops de 10 a 15,6"',
      'Carga máxima': '4 kg',
      'Altura': 'Fija (≈15 cm)',
    },
    badges: ['best_value', 'editor_choice'],
    pairsWith: ['B0G3PTHM36', 'B08D7CWTXY'],
  },
  {
    asin: 'B08M94BTYC',
    categorySlug: 'soportes-laptop',
    slug: 'lamicall-soporte-laptop-ajustable',
    title: 'Lamicall — soporte ajustable para laptop',
    summary:
      'Un soporte de aluminio con altura y ángulo regulables y base ancha: se adapta a pantallas de hasta 17,3 pulgadas y se pliega para llevarlo cuando hace falta.',
    idealFor:
      'Quien alterna entre laptops grandes o quiere afinar la altura exacta de la pantalla.',
    notFor: 'Buscas lo más barato posible o una solución para trabajar de pie.',
    pros: [
      'Altura y ángulo ajustables',
      'Base amplia y pesada, muy estable',
      'Compatible hasta 17,3 pulgadas',
    ],
    cons: ['Más pesado que los plegables básicos', 'Las bisagras requieren ajuste inicial'],
    scores: { ergonomia: 9, construccion: 8, portabilidad: 7, calidad_precio: 8 },
    keySpecs: {
      Material: 'Aleación de aluminio',
      Compatibilidad: 'Laptops de 10 a 17,3"',
      Ajustes: 'Altura y ángulo',
      Plegable: 'Sí',
    },
    badges: [],
    pairsWith: ['B0CLLHSWRL'],
  },
  {
    asin: 'B09Y8B81F7',
    categorySlug: 'soportes-laptop',
    slug: 'tounee-soporte-laptop-telescopico-giratorio',
    title: 'tounee — soporte telescópico con base giratoria',
    summary:
      'Convierte cualquier mesa en un escritorio para trabajar de pie: sube de 5 a 45 cm, gira 360° para compartir la pantalla y se pliega cuando no se usa.',
    idealFor: 'Quien quiere alternar entre sentado y de pie sin comprar un escritorio elevable.',
    notFor: 'Escribes mucho sobre el teclado de la propia laptop en la posición más alta.',
    pros: [
      'Rango de altura muy amplio, permite trabajar de pie',
      'Base giratoria de 360°',
      'Plegable para guardarlo',
    ],
    cons: ['En la posición más alta tiene algo de juego', 'Precio alto frente a un soporte fijo'],
    scores: { ergonomia: 10, construccion: 8, portabilidad: 6, calidad_precio: 7 },
    keySpecs: {
      Material: 'Aleación de aluminio',
      Compatibilidad: 'Laptops de 10 a 17"',
      Altura: 'Ajustable, de ≈5 a ≈45 cm',
      Base: 'Giratoria 360°',
    },
    badges: ['premium_pick'],
    pairsWith: ['B0CLLHSWRL', 'B0D1T1HZCC'],
  },

  // ── Soportes para celular ────────────────────────────────────────────
  {
    asin: 'B0744DM3Y3',
    categorySlug: 'soportes-celular',
    slug: 'omoton-c2-soporte-celular-aluminio',
    title: 'OMOTON C2 — soporte de aluminio para celular',
    summary:
      'Una pieza de aluminio grueso que no se vuelca, sostiene el teléfono con funda y deja libre el puerto de carga: lo justo para videollamadas y notificaciones a la vista.',
    idealFor: 'Tener el celular en el escritorio, cargando y a la vista, sin complicaciones.',
    notFor:
      'Necesitas elevar el teléfono a la altura de la cara para grabar o en videollamadas largas.',
    pros: [
      'Muy estable gracias al aluminio de 3 mm',
      'Funciona con fundas gruesas',
      'Hueco para el cable de carga',
    ],
    cons: ['Altura fija y baja', 'Solo se ajusta el ángulo'],
    scores: { estabilidad: 9, ajuste: 6, compatibilidad: 9, calidad_precio: 10 },
    keySpecs: {
      'Material': 'Aluminio de 3 mm',
      'Compatibilidad': 'Teléfonos de 4 a 8" e iPad mini',
      'Ajustes': 'Ángulo',
      'Hueco para cargador': 'Sí',
    },
    badges: ['best_rated', 'best_value'],
    pairsWith: ['B086BLQZ5L'],
  },
  {
    asin: 'B09MCKK9NX',
    categorySlug: 'soportes-celular',
    slug: 'lamicall-soporte-celular-altura-ajustable',
    title: 'Lamicall — soporte de celular con altura ajustable',
    summary:
      'Además del ángulo, sube el teléfono unos 8 cm y se pliega hasta caber en el bolsillo: la opción más versátil para videollamadas a la altura de la cara.',
    idealFor: 'Videollamadas, recetas o clases en el celular, en casa y de viaje.',
    notFor: 'Prefieres un bloque macizo que no tenga piezas móviles.',
    pros: [
      'Altura y ángulo ajustables',
      'Se pliega a tamaño de bolsillo',
      'Admite fundas de hasta 18 mm',
    ],
    cons: ['Las articulaciones se aflojan con el uso intensivo', 'Algo menos estable extendido'],
    scores: { estabilidad: 8, ajuste: 10, compatibilidad: 9, calidad_precio: 9 },
    keySpecs: {
      Material: 'Base de metal con peso',
      Compatibilidad: 'Teléfonos y tablets de 4 a 8"',
      Ajustes: 'Altura (+8 cm) y ángulo',
      Plegable: 'Sí',
    },
    badges: ['editor_choice'],
    pairsWith: ['B08BRCT4JH'],
  },
  {
    asin: 'B0BRN58CXR',
    categorySlug: 'soportes-celular',
    slug: 'nulaxy-pack-2-soportes-celular',
    title: 'Nulaxy — pack de 2 soportes plegables para celular',
    summary:
      'Dos soportes de aluminio plegables por el precio de uno de gama media: uno para el escritorio y otro para la mesa de noche o la cocina.',
    idealFor: 'Hogares con dos puntos de uso o parejas que trabajan desde casa.',
    notFor: 'Solo necesitas un soporte y quieres pagar lo mínimo.',
    pros: [
      'Dos unidades en la caja',
      'Aluminio estable y plegable',
      'Gancho ancho para fundas gruesas',
    ],
    cons: ['Ajuste de altura limitado', 'Cada unidad es algo más ligera que la OMOTON'],
    scores: { estabilidad: 8, ajuste: 8, compatibilidad: 9, calidad_precio: 8 },
    keySpecs: {
      Material: 'Aluminio',
      Unidades: '2',
      Compatibilidad: 'Teléfonos de 4 a 8" y e-readers',
      Plegable: 'Sí',
    },
    badges: [],
    pairsWith: [],
  },

  // ── Teclados mecánicos ───────────────────────────────────────────────
  {
    asin: 'B07G11G2X8',
    categorySlug: 'teclados-mecanicos',
    slug: 'redragon-k580-teclado-mecanico',
    title: 'Redragon K580 — teclado mecánico completo con macros',
    summary:
      'Un teclado mecánico completo con interruptores intercambiables sin soldar y teclas de macro dedicadas: la puerta de entrada más sensata a los mecánicos.',
    idealFor: 'Quien empieza en los teclados mecánicos y quiere teclado numérico y atajos.',
    notFor: 'Trabajas en espacios compartidos: los interruptores azules hacen bastante ruido.',
    pros: [
      'Interruptores intercambiables sin soldar',
      '5 teclas de macro y rueda multimedia',
      'Teclas de doble inyección que no se borran',
    ],
    cons: ['Solo con cable', 'Interruptores azules ruidosos'],
    scores: { comodidad: 8, construccion: 8, conectividad: 6, calidad_precio: 9 },
    keySpecs: {
      Formato: 'Completo (104 teclas)',
      Interruptores: 'Azules, intercambiables',
      Conexión: 'USB-C con cable',
      Iluminación: 'RGB',
    },
    badges: ['best_value'],
    pairsWith: ['B0D1T1HZCC'],
  },
  {
    asin: 'B0G3PTHM36',
    categorySlug: 'teclados-mecanicos',
    slug: 'aula-f75-teclado-mecanico-inalambrico',
    title: 'AULA F75 — teclado mecánico 75 % inalámbrico',
    summary:
      'Formato compacto del 75 %, sonido amortiguado y tres modos de conexión: un teclado que se siente premium y deja sitio para el ratón en escritorios pequeños.',
    idealFor: 'Escritorios pequeños y quien conecta el mismo teclado a laptop, tablet y PC.',
    notFor: 'Usas a diario el teclado numérico.',
    pros: [
      'Bluetooth, 2,4 GHz y cable',
      'Sonido suave gracias a la estructura amortiguada',
      'Interruptores intercambiables',
    ],
    cons: ['Sin teclado numérico', 'El software de configuración es básico'],
    scores: { comodidad: 9, construccion: 9, conectividad: 10, calidad_precio: 9 },
    keySpecs: {
      Formato: '75 % (81 teclas)',
      Interruptores: 'Lineales prelubricados, intercambiables',
      Conexión: 'Bluetooth 5.0, 2,4 GHz y USB-C',
      Iluminación: 'RGB',
    },
    badges: ['best_rated', 'editor_choice'],
    pairsWith: ['B08BRCT4JH', 'B08D7CWTXY'],
  },
  {
    asin: 'B0CLLHSWRL',
    categorySlug: 'teclados-mecanicos',
    slug: 'aula-f99-teclado-mecanico-inalambrico',
    title: 'AULA F99 — teclado mecánico 96 % inalámbrico',
    summary:
      'Toda la comodidad del F75 con teclado numérico en un formato del 96 % y una batería grande: para quien trabaja con números y no quiere renunciar al inalámbrico.',
    idealFor: 'Trabajo con hojas de cálculo y quien necesita el teclado numérico sin cables.',
    notFor: 'Te falta espacio en el escritorio o lo vas a transportar a menudo.',
    pros: [
      'Teclado numérico en formato compacto',
      'Tres modos de conexión',
      'Teclas PBT y batería de larga duración',
    ],
    cons: ['Pesado para llevarlo de un lado a otro', 'El más caro de la selección'],
    scores: { comodidad: 9, construccion: 9, conectividad: 10, calidad_precio: 8 },
    keySpecs: {
      Formato: '96 % (99 teclas)',
      Interruptores: 'Intercambiables',
      Conexión: 'Bluetooth 5.0, 2,4 GHz y USB-C',
      Teclas: 'PBT',
    },
    badges: ['premium_pick'],
    pairsWith: ['B08M94BTYC'],
  },

  // ── Desk pads ────────────────────────────────────────────────────────
  {
    asin: 'B086BLQZ5L',
    categorySlug: 'desk-pads',
    slug: 'aothia-desk-pad-cuero-sintetico',
    title: 'Aothia — desk pad de cuero sintético',
    summary:
      'Protege la mesa de rayones y derrames con una superficie lisa que sirve de alfombrilla para el ratón; el tamaño justo para laptop, ratón y una libreta.',
    idealFor: 'Escritorios de madera que quieres proteger con un gasto mínimo.',
    notFor: 'Quieres cubrir todo el escritorio o usarlo con un teclado completo y ratón a la vez.',
    pros: [
      'Impermeable y fácil de limpiar',
      'Reverso de ante que no se desliza',
      'Precio muy bajo',
    ],
    cons: ['Tamaño mediano (60 × 35 cm)', 'Los bordes se marcan con el tiempo'],
    scores: { superficie: 8, tamano: 6, durabilidad: 7, calidad_precio: 10 },
    keySpecs: {
      Material: 'Cuero sintético (PU)',
      Tamaño: '60 × 35 cm',
      Reverso: 'Ante antideslizante',
      Impermeable: 'Sí',
    },
    badges: ['best_value'],
    pairsWith: ['B0744DM3Y3'],
  },
  {
    asin: 'B08D7CWTXY',
    categorySlug: 'desk-pads',
    slug: 'ysagi-desk-pad-cuero-grande',
    title: 'YSAGi — desk pad de cuero grande',
    summary:
      'Más grande que la media (80 × 40 cm) para que quepan teclado, ratón y laptop, con un acabado de cuero que da un aspecto ordenado al escritorio.',
    idealFor: 'Configuraciones con teclado externo, ratón y laptop sobre la misma superficie.',
    notFor: 'Buscas una superficie optimizada para juegos y precisión del ratón.',
    pros: [
      'Tamaño amplio para todo el set',
      'Muy valorado por durabilidad',
      'Limpieza con un paño húmedo',
    ],
    cons: ['Es de una sola cara', 'El color oscuro marca el polvo'],
    scores: { superficie: 8, tamano: 9, durabilidad: 9, calidad_precio: 9 },
    keySpecs: {
      Material: 'Cuero sintético y ante',
      Tamaño: '80 × 40 cm',
      Reverso: 'Ante antideslizante',
      Impermeable: 'Sí',
    },
    badges: ['best_rated', 'editor_choice'],
    pairsWith: ['B08BRCT4JH', 'B0G3PTHM36'],
  },
  {
    asin: 'B0D1T1HZCC',
    categorySlug: 'desk-pads',
    slug: 'steelseries-qck-xxl-alfombrilla',
    title: 'SteelSeries QcK XXL — alfombrilla de tela extragrande',
    summary:
      'La alfombrilla de tela de referencia, en tamaño extragrande para cubrir el escritorio: el ratón se desliza con precisión y la base de goma no se mueve.',
    idealFor: 'Quien juega o hace diseño y quiere precisión del ratón en todo el escritorio.',
    notFor: 'Te preocupan los derrames: la tela absorbe líquidos.',
    pros: [
      'Superficie de tela muy precisa para el ratón',
      'Cubre teclado, ratón y más',
      'Base de goma que no se desplaza',
    ],
    cons: ['No es impermeable', 'Precio alto frente a los de cuero sintético'],
    scores: { superficie: 10, tamano: 10, durabilidad: 8, calidad_precio: 7 },
    keySpecs: {
      Material: 'Tela microtejida y goma',
      Tamaño: 'XXL (≈90 × 40 cm)',
      Reverso: 'Goma antideslizante',
      Impermeable: 'No',
    },
    badges: ['premium_pick'],
    pairsWith: ['B07G11G2X8'],
  },
]
