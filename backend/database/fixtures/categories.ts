/**
 * Categorías de la tienda y su rúbrica (criterios de la nota del asesor).
 * En el núcleo del MVP las rúbricas vienen de aquí; el editor de rúbricas es ampliación.
 */
export interface CategoryFixture {
  slug: string
  name: string
  searchTerm: string
  icon: string
  criteria: Array<{ key: string; label: string }>
}

export const CATEGORY_FIXTURES: CategoryFixture[] = [
  {
    slug: 'soportes-laptop',
    name: 'Soportes para laptop',
    searchTerm: 'laptop stand',
    icon: 'laptop',
    criteria: [
      { key: 'ergonomia', label: 'Ergonomía' },
      { key: 'construccion', label: 'Construcción' },
      { key: 'portabilidad', label: 'Portabilidad' },
      { key: 'calidad_precio', label: 'Calidad-precio' },
    ],
  },
  {
    slug: 'soportes-celular',
    name: 'Soportes para celular',
    searchTerm: 'cell phone stand for desk',
    icon: 'smartphone',
    criteria: [
      { key: 'estabilidad', label: 'Estabilidad' },
      { key: 'ajuste', label: 'Ajuste de ángulo' },
      { key: 'compatibilidad', label: 'Compatibilidad' },
      { key: 'calidad_precio', label: 'Calidad-precio' },
    ],
  },
  {
    slug: 'teclados-mecanicos',
    name: 'Teclados mecánicos',
    searchTerm: 'mechanical keyboard',
    icon: 'keyboard',
    criteria: [
      { key: 'comodidad', label: 'Comodidad al escribir' },
      { key: 'construccion', label: 'Construcción' },
      { key: 'conectividad', label: 'Conectividad' },
      { key: 'calidad_precio', label: 'Calidad-precio' },
    ],
  },
  {
    slug: 'desk-pads',
    name: 'Desk pads',
    searchTerm: 'desk pad',
    icon: 'square',
    criteria: [
      { key: 'superficie', label: 'Superficie' },
      { key: 'tamano', label: 'Tamaño' },
      { key: 'durabilidad', label: 'Durabilidad' },
      { key: 'calidad_precio', label: 'Calidad-precio' },
    ],
  },
]
