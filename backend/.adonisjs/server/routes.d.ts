import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'health.show': { paramsTuple?: []; params?: {} }
    'catalog.categories': { paramsTuple?: []; params?: {} }
    'catalog.category_products': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.product': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.compare': { paramsTuple?: []; params?: {} }
    'redirect.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.show': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'agent_runs.index': { paramsTuple?: []; params?: {} }
    'agent_runs.store': { paramsTuple?: []; params?: {} }
    'agent_runs.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'candidates.index': { paramsTuple?: []; params?: {} }
    'candidates.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'candidates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'health.show': { paramsTuple?: []; params?: {} }
    'catalog.categories': { paramsTuple?: []; params?: {} }
    'catalog.category_products': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.product': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.compare': { paramsTuple?: []; params?: {} }
    'redirect.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.show': { paramsTuple?: []; params?: {} }
    'agent_runs.index': { paramsTuple?: []; params?: {} }
    'agent_runs.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'candidates.index': { paramsTuple?: []; params?: {} }
    'candidates.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'health.show': { paramsTuple?: []; params?: {} }
    'catalog.categories': { paramsTuple?: []; params?: {} }
    'catalog.category_products': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.product': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.compare': { paramsTuple?: []; params?: {} }
    'redirect.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.show': { paramsTuple?: []; params?: {} }
    'agent_runs.index': { paramsTuple?: []; params?: {} }
    'agent_runs.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'candidates.index': { paramsTuple?: []; params?: {} }
    'candidates.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'session.store': { paramsTuple?: []; params?: {} }
    'agent_runs.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'candidates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}