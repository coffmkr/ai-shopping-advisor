/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  health: {
    show: typeof routes['health.show']
  }
  catalog: {
    categories: typeof routes['catalog.categories']
    categoryProducts: typeof routes['catalog.category_products']
    product: typeof routes['catalog.product']
    compare: typeof routes['catalog.compare']
  }
  redirect: {
    show: typeof routes['redirect.show']
  }
  session: {
    store: typeof routes['session.store']
    show: typeof routes['session.show']
    destroy: typeof routes['session.destroy']
  }
  candidates: {
    index: typeof routes['candidates.index']
    show: typeof routes['candidates.show']
    update: typeof routes['candidates.update']
  }
}
