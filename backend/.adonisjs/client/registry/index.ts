/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

export type { Route, Path } from './schema.d.ts'

const placeholder: any = {}

const routes = {
  'health.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/health',
    tokens: [[0,"api"],[0,"health"]],
    types: placeholder as Registry['health.show']['types'],
  },
  'catalog.categories': {
    methods: ["GET","HEAD"],
    pattern: '/api/categories',
    tokens: [[0,"api"],[0,"categories"]],
    types: placeholder as Registry['catalog.categories']['types'],
  },
  'catalog.category_products': {
    methods: ["GET","HEAD"],
    pattern: '/api/categories/:slug/products',
    tokens: [[0,"api"],[0,"categories"],[1,"slug"],[0,"products"]],
    types: placeholder as Registry['catalog.category_products']['types'],
  },
  'catalog.product': {
    methods: ["GET","HEAD"],
    pattern: '/api/products/:slug',
    tokens: [[0,"api"],[0,"products"],[1,"slug"]],
    types: placeholder as Registry['catalog.product']['types'],
  },
  'catalog.compare': {
    methods: ["GET","HEAD"],
    pattern: '/api/compare',
    tokens: [[0,"api"],[0,"compare"]],
    types: placeholder as Registry['catalog.compare']['types'],
  },
  'redirect.show': {
    methods: ["GET","HEAD"],
    pattern: '/go/:id',
    tokens: [[0,"go"],[1,"id"]],
    types: placeholder as Registry['redirect.show']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/api/admin/session',
    tokens: [[0,"api"],[0,"admin"],[0,"session"]],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/session',
    tokens: [[0,"api"],[0,"admin"],[0,"session"]],
    types: placeholder as Registry['session.show']['types'],
  },
  'session.destroy': {
    methods: ["DELETE"],
    pattern: '/api/admin/session',
    tokens: [[0,"api"],[0,"admin"],[0,"session"]],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'agent_runs.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/agent-runs',
    tokens: [[0,"api"],[0,"admin"],[0,"agent-runs"]],
    types: placeholder as Registry['agent_runs.index']['types'],
  },
  'agent_runs.store': {
    methods: ["POST"],
    pattern: '/api/admin/agent-runs',
    tokens: [[0,"api"],[0,"admin"],[0,"agent-runs"]],
    types: placeholder as Registry['agent_runs.store']['types'],
  },
  'agent_runs.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/agent-runs/:id',
    tokens: [[0,"api"],[0,"admin"],[0,"agent-runs"],[1,"id"]],
    types: placeholder as Registry['agent_runs.show']['types'],
  },
  'candidates.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/candidates',
    tokens: [[0,"api"],[0,"admin"],[0,"candidates"]],
    types: placeholder as Registry['candidates.index']['types'],
  },
  'candidates.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/admin/candidates/:id',
    tokens: [[0,"api"],[0,"admin"],[0,"candidates"],[1,"id"]],
    types: placeholder as Registry['candidates.show']['types'],
  },
  'candidates.update': {
    methods: ["PATCH"],
    pattern: '/api/admin/candidates/:id',
    tokens: [[0,"api"],[0,"admin"],[0,"candidates"],[1,"id"]],
    types: placeholder as Registry['candidates.update']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
