import { Service } from './types/input-types'
import { Kubernetes } from './kubernetes-runtime'
import { getWithDependantServices } from './service-dependencies'

export const getFeatureAffectedServices = async (
  uberChart: Kubernetes,
  habitat: Service[],
  services: Service[],
  excludedServices: Service[] = [],
) => {
  const feature = uberChart.env.feature
  if (typeof feature !== 'undefined') {
    const excludedServiceNames = excludedServices.map((f) => f.serviceDef.name)

    return (
      await getWithDependantServices(uberChart.env, habitat, ...services)
    ).filter((f) => !excludedServiceNames.includes(f.serviceDef.name))
  } else {
    throw new Error('Feature deployment with a feature name not defined')
  }
}
