import { lazy } from 'react'
import { defineMessage } from 'react-intl'
import {
  ServicePortalModule,
  ServicePortalRoute,
  ServicePortalPath,
} from '@island.is/service-portal/core'

export const assetsModule: ServicePortalModule = {
  name: 'Eignir',
  widgets: () => [],
  routes: () => {
    const routes: ServicePortalRoute[] = [
      {
        name: defineMessage({
          id: 'service.portal:real-estate',
          defaultMessage: 'Fasteignir',
        }),
        path: ServicePortalPath.AssetsRoot,
        render: () =>
          lazy(() => import('./screens/AssetsOverview/AssetsOverview')),
      },
    ]

    return routes
  },
}
