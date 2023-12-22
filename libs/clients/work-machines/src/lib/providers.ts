import {
  XRoadConfig,
  IdsClientConfig,
  LazyDuringDevScope,
} from '@island.is/nest/config'
import { ConfigType } from '@nestjs/config'
import {
  Configuration,
  MachineCategoryApi,
  MachineOwnerChangeApi,
  MachineSupervisorChangeApi,
  MachinesApi,
  MachinesDocumentApi,
} from '../../gen/fetch'
import { WorkMachinesClientConfig } from './workMachines.config'
import { createEnhancedFetch } from '@island.is/clients/middlewares'

const ConfigFactory = (
  xroadConfig: ConfigType<typeof XRoadConfig>,
  config: ConfigType<typeof WorkMachinesClientConfig>,
  idsClientConfig: ConfigType<typeof IdsClientConfig>,
  acceptHeader: string,
) => ({
  fetchApi: createEnhancedFetch({
    name: 'clients-work-machines',
    organizationSlug: 'vinnueftirlitid',
    logErrorResponseBody: true,
    autoAuth: idsClientConfig.isConfigured
      ? {
          mode: 'tokenExchange',
          issuer: idsClientConfig.issuer,
          clientId: idsClientConfig.clientId,
          clientSecret: idsClientConfig.clientSecret,
          scope: config.fetch.scope,
        }
      : undefined,
  }),
  basePath: `${xroadConfig.xRoadBasePath}/r1/${config.xRoadServicePath}`,
  headers: {
    'X-Road-Client': xroadConfig.xRoadClient,
    Accept: acceptHeader,
  },
})

export class CustomMachineApi extends MachinesApi {}

export const apiProviders = [
  {
    api: MachinesApi,
    provide: MachinesApi,
    acceptHeader: 'application/vnd.ver.machines.hateoas.v1+json',
  },
  {
    api: CustomMachineApi,
    provide: CustomMachineApi,
    acceptHeader: 'application/vnd.ver.machine.hateoas.v1+json',
  },
  {
    api: MachineOwnerChangeApi,
    provide: MachineOwnerChangeApi,
    acceptHeader: 'application/json',
  },
  {
    api: MachineSupervisorChangeApi,
    provide: MachineSupervisorChangeApi,
    acceptHeader: 'application/json-patch+json',
  },
  {
    api: MachineCategoryApi,
    provide: MachineCategoryApi,
    acceptHeader: 'application/json',
  },
  {
    api: MachinesDocumentApi,
    provide: MachinesDocumentApi,
    acceptHeader: 'application/vnd.ver.hateoas.v1+json',
  },
].map(({ api, provide, acceptHeader }) => ({
  provide: provide,
  scope: LazyDuringDevScope,
  useFactory: (
    xRoadConfig: ConfigType<typeof XRoadConfig>,
    config: ConfigType<typeof WorkMachinesClientConfig>,
    idsClientConfig: ConfigType<typeof IdsClientConfig>,
  ) => {
    return new api(
      new Configuration(
        ConfigFactory(xRoadConfig, config, idsClientConfig, acceptHeader),
      ),
    )
  },
  inject: [XRoadConfig.KEY, WorkMachinesClientConfig.KEY, IdsClientConfig.KEY],
}))
