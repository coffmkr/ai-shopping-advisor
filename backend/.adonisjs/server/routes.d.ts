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
  }
  GET: {
    'health.show': { paramsTuple?: []; params?: {} }
    'catalog.categories': { paramsTuple?: []; params?: {} }
    'catalog.category_products': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.product': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.compare': { paramsTuple?: []; params?: {} }
    'redirect.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'health.show': { paramsTuple?: []; params?: {} }
    'catalog.categories': { paramsTuple?: []; params?: {} }
    'catalog.category_products': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.product': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'catalog.compare': { paramsTuple?: []; params?: {} }
    'redirect.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.show': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'session.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}