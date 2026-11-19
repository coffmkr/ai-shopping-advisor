import type { KeySpecs } from '#models/types'

/**
 * Candidatos pendientes de la semilla (2 por categoría) para revisar en el panel
 * sin ejecutar el agente. Los datos del producto salen del resultado de búsqueda
 * grabado (database/fixtures/canopy/search-{categoría}.json); el borrador imita
 * lo que redactaría el agente y el administrador lo corrige antes de aprobar.
 *
 * El Redragon K521 se incluye a propósito: se anuncia con "mechanical feeling"
 * pero no es mecánico, así que es el caso de rechazo de la demo.
 */
export interface CandidateFixture {
  asin: string
  categorySlug: string
  slug: string
  draft: {
    summary: string
    idealFor: string
    notFor: string
    pros: string[]
    cons: string[]
    scores: Record<string, number>
    keySpecs: KeySpecs
  }
}

export const CANDIDATE_FIXTURES: CandidateFixture[] = [
  {
    asin: 'B077B9W343',
    categorySlug: 'soportes-laptop',
    slug: 'nulaxy-soporte-laptop-plegable',
    draft: {
      summary:
        'Soporte plegable de aluminio con doble ajuste de altura y ángulo que se guarda en la mochila.',
      idealFor:
        'Quien trabaja en distintos lugares y quiere elevar la laptop también fuera de casa.',
      notFor: 'Buscas un soporte fijo y muy rígido para un escritorio permanente.',
      pros: ['Plegable y ligero', 'Doble ajuste de altura y ángulo'],
      cons: ['Algo de juego en la posición más alta'],
      scores: { ergonomia: 8, construccion: 7, portabilidad: 9, calidad_precio: 8 },
      keySpecs: { Material: 'Aluminio', Plegable: 'Sí' },
    },
  },
  {
    asin: 'B08G84P8ZX',
    categorySlug: 'soportes-laptop',
    slug: 'soporte-laptop-ajustable-economico',
    draft: {
      summary: 'El soporte ajustable más barato de la búsqueda, de plástico y plegable.',
      idealFor: 'Un uso ocasional con laptops ligeras.',
      notFor: 'Usas laptops pesadas o escribes mucho sobre el propio teclado.',
      pros: ['Precio muy bajo', 'Plegable'],
      cons: ['Construcción de plástico', 'Marca genérica'],
      scores: { ergonomia: 7, construccion: 5, portabilidad: 9, calidad_precio: 8 },
      keySpecs: { Material: 'Plástico', Plegable: 'Sí' },
    },
  },
  {
    asin: 'B07F8S18D5',
    categorySlug: 'soportes-celular',
    slug: 'nulaxy-soporte-celular-aluminio',
    draft: {
      summary:
        'Soporte de aluminio de doble plegado, muy popular, que sube el teléfono más que los modelos fijos.',
      idealFor: 'Videollamadas y ver contenido con el teléfono a una altura cómoda.',
      notFor: 'Necesitas un soporte de bolsillo para viajar.',
      pros: ['Aluminio macizo', 'Doble articulación'],
      cons: ['Más voluminoso plegado'],
      scores: { estabilidad: 9, ajuste: 8, compatibilidad: 9, calidad_precio: 9 },
      keySpecs: { Material: 'Aluminio', Plegable: 'Sí' },
    },
  },
  {
    asin: 'B07Z82895W',
    categorySlug: 'soportes-celular',
    slug: 'lisen-soporte-celular-escritorio',
    draft: {
      summary:
        'Soporte de escritorio con base pesada y diseño discreto, pensado como regalo de oficina.',
      idealFor: 'Mantener el teléfono a la vista en el escritorio de la oficina.',
      notFor: 'Quieres ajustar mucho la altura.',
      pros: ['Base pesada y estable', 'Diseño discreto'],
      cons: ['Ajuste de altura limitado'],
      scores: { estabilidad: 8, ajuste: 6, compatibilidad: 8, calidad_precio: 8 },
      keySpecs: { Material: 'Aleación de aluminio' },
    },
  },
  {
    asin: 'B0DRFGNWV1',
    categorySlug: 'teclados-mecanicos',
    slug: 'redragon-k521-teclado-gaming',
    draft: {
      summary:
        'Teclado completo muy barato con iluminación de colores y teclas multimedia, con buena valoración.',
      idealFor: 'Quien busca un primer teclado para juegos con poco presupuesto.',
      notFor: 'Esperas la sensación de un teclado mecánico de verdad.',
      pros: ['Precio muy bajo', 'Teclas multimedia'],
      cons: ['Teclas de membrana con "sensación mecánica"'],
      scores: { comodidad: 6, construccion: 5, conectividad: 5, calidad_precio: 8 },
      keySpecs: { Formato: 'Completo (104 teclas)', Conexión: 'USB-A con cable' },
    },
  },
  {
    asin: 'B07ZGDD6B1',
    categorySlug: 'teclados-mecanicos',
    slug: 'steelseries-apex-5-teclado-hibrido',
    draft: {
      summary:
        'Teclado con interruptores híbridos mecánicos, pantalla OLED y reposamuñecas magnético incluido.',
      idealFor: 'Quien quiere un teclado completo de gama alta con reposamuñecas.',
      notFor: 'Prefieres interruptores mecánicos intercambiables.',
      pros: ['Reposamuñecas incluido', 'Construcción de aluminio'],
      cons: ['Interruptores híbridos, no totalmente mecánicos', 'Precio alto'],
      scores: { comodidad: 8, construccion: 9, conectividad: 6, calidad_precio: 6 },
      keySpecs: {
        Formato: 'Completo',
        Interruptores: 'Híbridos mecánicos',
        Conexión: 'USB con cable',
      },
    },
  },
  {
    asin: 'B06X19FLTC',
    categorySlug: 'desk-pads',
    slug: 'amazon-basics-alfombrilla-extendida',
    draft: {
      summary: 'Alfombrilla extendida de tela a buen precio que cubre teclado y ratón.',
      idealFor: 'Un escritorio de juego o trabajo con un presupuesto ajustado.',
      notFor: 'Quieres una superficie impermeable.',
      pros: ['Tamaño extendido', 'Precio bajo'],
      cons: ['No es impermeable'],
      scores: { superficie: 8, tamano: 9, durabilidad: 7, calidad_precio: 9 },
      keySpecs: { Material: 'Tela y goma', Tamaño: '42 × 90 cm' },
    },
  },
  {
    asin: 'B0788LMLZL',
    categorySlug: 'desk-pads',
    slug: 'ktrio-alfombrilla-gaming-xl',
    draft: {
      summary: 'Alfombrilla XL de tela con bordes cosidos para que no se deshilache.',
      idealFor: 'Juegos y uso diario con teclado y ratón sobre la misma superficie.',
      notFor: 'Tu escritorio mide menos de 80 cm de ancho.',
      pros: ['Bordes cosidos', 'Muy económica'],
      cons: ['Olor inicial a goma'],
      scores: { superficie: 8, tamano: 8, durabilidad: 8, calidad_precio: 9 },
      keySpecs: { Material: 'Tela y goma', Tamaño: '80 × 30 cm' },
    },
  },
]
