import { createEnhancedFetch } from '@island.is/clients/middlewares'
import { ConfigType, XRoadConfig } from '@island.is/nest/config'
import { AlthingiOmbudsmanClientConfig } from './clients-althingi-ombudsman.config'
import { Configuration } from '../gen/fetch/dev'

export const ApiConfiguration = {
  provide: 'AlthingiOmdudsmanClientApiConfiguration',
  useFactory: (
    xRoadConfig: ConfigType<typeof XRoadConfig>,
    config: ConfigType<typeof AlthingiOmbudsmanClientConfig>,
  ) =>
    new Configuration({
      fetchApi: createEnhancedFetch({
        name: 'clients-althingi-ombudsman',
        timeout: 30000, // 30 sec timeout
        logErrorResponseBody: true,
      }),
      basePath: `${xRoadConfig.xRoadBasePath}/r1/${config.xRoadServicePath}`,
      headers: {
        Accept: 'application/json',
        'X-Road-Client': xRoadConfig.xRoadClient,
      },
    }),
  inject: [XRoadConfig.KEY, AlthingiOmbudsmanClientConfig.KEY],
}
