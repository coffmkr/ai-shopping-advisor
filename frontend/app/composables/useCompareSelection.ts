export const MAX_COMPARE = 4

/**
 * Productos marcados para comparar (máximo 4, de una sola categoría).
 * Vive en el estado de Nuxt; la página del comparador depende solo de la URL,
 * así que la selección es compartible copiando el enlace.
 */
export function useCompareSelection() {
  const ids = useState<string[]>('compare-ids', () => [])
  const categorySlug = useState<string | null>('compare-category', () => null)

  const isFull = computed(() => ids.value.length >= MAX_COMPARE)
  const compareUrl = computed(() => `/comparar?ids=${ids.value.join(',')}`)

  function has(id: string) {
    return ids.value.includes(id)
  }

  function toggle(id: string, slug: string) {
    if (has(id)) {
      ids.value = ids.value.filter((current) => current !== id)
      if (ids.value.length === 0) categorySlug.value = null
      return
    }
    if (categorySlug.value !== slug) {
      ids.value = [id]
      categorySlug.value = slug
      return
    }
    if (isFull.value) return
    ids.value = [...ids.value, id]
  }

  function clear() {
    ids.value = []
    categorySlug.value = null
  }

  return { ids, categorySlug, isFull, compareUrl, has, toggle, clear }
}
