import {
  BasicDataProvider,
  SuccessfulDataProviderResult,
  FailedDataProviderResult,
} from '@island.is/application/core'
import { Vehicle } from '../types/schema'
import { m } from '../lib/messages'

export class VehicleProvider extends BasicDataProvider {
  type = 'VehicleProvider'

  async provide(): Promise<Array<Vehicle>> {
    // TODO implement from external client
    return [
      { plateNumber: 'AB123', numberOfWheels: 4, weight: 1234, year: 2010},
      { plateNumber: 'BEAN', numberOfWheels: 3, weight: 700, year: 1990},
    ]

    /*
    const query = `
      query GetVehicleQuery($input: GetMultiVehicleInput!) {
        vehicleOverview(input: $input) {
          properties {
            propertyNumber
            defaultAddress {
              locationNumber
              postNumber
              municipality
              propertyNumber
              display
              displayShort
            }
          }
          paging {
            page
            pageSize
            totalPages
            offset
            total
            hasPreviousPage
            hasNextPage
          }
        }
      }
    `

    return this.useGraphqlGateway(query)
      .then(async (res: Response) => {
        const response = await res.json()
        if (response.errors?.length > 0) {
          return this.handleError(response.errors[0])
        }

        return Promise.resolve(
          response.data.getAssetsOverview,
        )
      })
      .catch((error) => this.handleError(error))
    */
  }

  handleError(error: any) {
    return Promise.reject({})
  }

  onProvideError(): FailedDataProviderResult {
    return {
      date: new Date(),
      reason: m.errorDataProvider,
      status: 'failure',
    }
  }

  onProvideSuccess(result: object): SuccessfulDataProviderResult {
    return { date: new Date(), status: 'success', data: result }
  }
}
