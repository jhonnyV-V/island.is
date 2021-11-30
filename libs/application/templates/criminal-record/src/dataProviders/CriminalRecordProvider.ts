import {
  BasicDataProvider,
  Application,
  SuccessfulDataProviderResult,
  FailedDataProviderResult,
  coreErrorMessages,
} from '@island.is/application/core'
import { getAge } from '../utils'
import { m } from '../lib/messages'
import { MessageDescriptor } from '@formatjs/intl'

export class CriminalRecordProvider extends BasicDataProvider {
  type = 'CriminalRecordProvider'

  async provide(application: Application): Promise<unknown> {
    const applicantSsn = application.applicant

    const errorMessage = this.validateApplicant(applicantSsn)
    if (errorMessage) {
      return Promise.reject(errorMessage)
    }

    const query = `
    query CheckCriminalRecord($ssnInput: String!) {
        checkCriminalRecord(ssn: $ssnInput)
      }
    `

    return this.useGraphqlGateway(query, {
      ssnInput: applicantSsn,
    }).then(async (res: Response) => {
      const response = await res.json()

      if (response.errors) {
        console.error(
          `graphql error in ${this.type}: ${response.errors[0].message}`,
        )
        return Promise.reject({})
      }

      if (response.data.checkCriminalRecord !== true) {
        return Promise.reject({})
      }

      return Promise.resolve({ isValid: true })
    })
  }

  validateApplicant(ssn: string): MessageDescriptor | null {
    // Validate applicants age
    const minAge = 15
    const age = getAge(ssn)
    if (age < minAge) {
      return m.errorMinAgeNotFulfilled
    }

    return null
  }

  onProvideError(errorMessage: MessageDescriptor): FailedDataProviderResult {
    return {
      date: new Date(),
      reason: errorMessage?.id
        ? errorMessage
        : coreErrorMessages.errorDataProvider,
      status: 'failure',
      data: {},
    }
  }

  onProvideSuccess(
    result: Record<string, unknown>,
  ): SuccessfulDataProviderResult {
    return { date: new Date(), status: 'success', data: result }
  }
}
