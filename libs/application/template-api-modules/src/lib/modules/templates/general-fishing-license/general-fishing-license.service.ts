import { Inject, Injectable } from '@nestjs/common'
import { TemplateApiModuleActionProps } from '../../../types'
import { SharedTemplateApiService } from '../../shared'
import { GeneralFishingLicenseAnswers } from '@island.is/application/templates/general-fishing-license'
import { getValueViaPath } from '@island.is/application/core'
import {
  FishingLicenseCodeType,
  FishingLicenseService,
  UmsoknirApi,
} from '@island.is/clients/fishing-license'
import { LOGGER_PROVIDER } from '@island.is/logging'
import type { Logger } from '@island.is/logging'
import { Auth, AuthMiddleware } from '@island.is/auth-nest-tools'
import { BaseTemplateApiService } from '../../base-template-api.service'
import { ApplicationTypes } from '@island.is/application/types'

@Injectable()
export class GeneralFishingLicenseService extends BaseTemplateApiService {
  constructor(
    @Inject(LOGGER_PROVIDER) private logger: Logger,
    private readonly sharedTemplateAPIService: SharedTemplateApiService,
    private readonly fishingLicenceApi: FishingLicenseService,
    private readonly umsoknirApi: UmsoknirApi,
  ) {
    super(ApplicationTypes.GENERAL_FISHING_LICENSE)
  }

  async createCharge({ application, auth }: TemplateApiModuleActionProps) {
    const FISKISTOFA_NATIONAL_ID = '6608922069'

    const answers = application.answers as GeneralFishingLicenseAnswers
    const chargeItemCode = getValueViaPath(
      answers,
      'fishingLicense.chargeType',
    ) as string

    if (!chargeItemCode) {
      this.logger.error('Charge item code missing in General Fishing License.')
      throw new Error('Vörunúmer fyrir FJS vantar.')
    }

    const response = await this.sharedTemplateAPIService.createCharge(
      auth,
      application.id,
      FISKISTOFA_NATIONAL_ID,
      [chargeItemCode],
    )

    if (!response?.paymentUrl) {
      this.logger.error(
        'paymentUrl missing in response in General Fishing License.',
      )
      throw new Error('Ekki hefur tekist að búa til slóð fyrir greiðslugátt.')
    }

    return response
  }

  async submitApplication({ application, auth }: TemplateApiModuleActionProps) {
    const paymentStatus = await this.sharedTemplateAPIService.getPaymentStatus(
      auth,
      application.id,
    )

    if (paymentStatus?.fulfilled !== true) {
      this.logger.error(
        'Trying to submit General Fishing License application that has not been paid.',
      )
      throw new Error(
        'Ekki er hægt að skila inn umsókn af því að ekki hefur tekist að taka við greiðslu.',
      )
    }

    try {
      const applicantNationalId = getValueViaPath(
        application.answers,
        'applicant.nationalId',
      ) as string
      const applicantPhoneNumber = getValueViaPath(
        application.answers,
        'applicant.phoneNumber',
      ) as string
      const applicantEmail = getValueViaPath(
        application.answers,
        'applicant.email',
      ) as string
      const registrationNumber = getValueViaPath(
        application.answers,
        'shipSelection.registrationNumber',
      ) as string
      const fishingLicense = getValueViaPath(
        application.answers,
        'fishingLicense.license',
      ) as string

      await this.umsoknirApi
        .withMiddleware(new AuthMiddleware(auth as Auth))
        .v1UmsoknirPost({
          umsokn: {
            umsaekjandiKennitala: applicantNationalId,
            simanumer: applicantPhoneNumber,
            email: applicantEmail,
            utgerdKennitala: applicantNationalId,
            skipaskrarnumer: parseInt(registrationNumber, 10),
            umbedinGildistaka: null,
            veidileyfiKodi:
              fishingLicense === 'catchMark'
                ? FishingLicenseCodeType.catchMark
                : fishingLicense === 'hookCatchLimit'
                ? FishingLicenseCodeType.hookCatchLimit
                : '0',
          },
        })
      return { success: true }
    } catch (e) {
      this.logger.error(
        'Error submitting General Fishing License application to SÍ',
        e,
      )
      throw new Error('Villa kom upp við skil á umsókn.')
    }
  }

  async getShips({ auth }: TemplateApiModuleActionProps) {
    const ships = await this.fishingLicenceApi.getShips(auth.nationalId, auth)
    return { ships }
  }
}
