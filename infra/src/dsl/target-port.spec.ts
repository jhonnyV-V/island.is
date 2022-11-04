import { service } from './dsl'
import { Kubernetes } from './kubernetes'
import { serializeService } from './map-to-helm-values'
import { SerializeSuccess, ServiceHelm } from './types/output-types'
import { EnvironmentConfig } from './types/charts'

const Staging: EnvironmentConfig = {
  auroraHost: 'a',
  domain: 'staging01.devland.is',
  type: 'staging',
  featuresOn: [],
  defaultMaxReplicas: 3,
  defaultMinReplicas: 2,
  releaseName: 'web',
  awsAccountId: '111111',
  awsAccountRegion: 'eu-west-1',
  global: {},
}

describe('Basic serialization', () => {
  it('service account', async () => {
    const sut = service('api').targetPort(4200)
    const result = (await serializeService(
      sut,
      new Kubernetes(Staging),
    )) as SerializeSuccess<ServiceHelm>
    expect(result.serviceDef[0].service).toEqual({
      targetPort: 4200,
    })
  })
})
