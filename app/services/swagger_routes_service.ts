import router from '@adonisjs/core/services/router'

type RouteHandler = {
  method?: string
  moduleNameOrPath?: string
  reference?: string
  type?: string
}

type RouteRecord = {
  handler?: RouteHandler
  meta?: {
    resolvedHandler?: unknown
  }
}

type RouteDomain = {
  routes?: RouteRecord[]
}

type RouterLike = {
  commit?(): void
  toJSON(): unknown
}

export const getSwaggerRoutes = (sourceRouter: RouterLike = router) => {
  sourceRouter.commit?.()
  const routesByDomain = sourceRouter.toJSON()
  const routes = Array.isArray(routesByDomain)
    ? (routesByDomain as RouteDomain[]).flatMap((domain) => domain.routes ?? [])
    : Object.values(
        routesByDomain as { [domain: string]: RouteRecord[] }
      ).flat()

  return {
    root: routes.map((route) => {
      if (
        route.handler?.type !== 'controller' ||
        route.handler.reference !== undefined ||
        route.handler.moduleNameOrPath === undefined ||
        route.handler.method === undefined
      ) {
        return {
          ...route,
          meta: route.meta ?? { resolvedHandler: null },
        }
      }

      return {
        ...route,
        handler: {
          ...route.handler,
          reference: `${route.handler.moduleNameOrPath}.${route.handler.method}`,
        },
        meta: route.meta ?? { resolvedHandler: null },
      }
    }),
  }
}
