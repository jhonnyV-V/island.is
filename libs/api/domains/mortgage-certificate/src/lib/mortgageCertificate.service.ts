import { Inject, Injectable } from '@nestjs/common'
import {
  SyslumennService,
  MortgageCertificate,
  MortgageCertificateValidation,
  Person,
  PersonType,
} from '@island.is/clients/syslumenn'
import {
  Identity,
  RequestCorrection,
  UserProfile,
} from './mortgageCertificate.types'
import { LOGGER_PROVIDER } from '@island.is/logging'
import type { Logger } from '@island.is/logging'

@Injectable()
export class MortgageCertificateService {
  constructor(
    private readonly syslumennService: SyslumennService,
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
  ) {}

  async getMortgageCertificate(
    propertyNumber: string,
  ): Promise<MortgageCertificate> {
    return await this.syslumennService.getMortgageCertificate(propertyNumber)
  }

  async validateMortgageCertificate(
    propertyNumber: string,
    isFromSearch: boolean | undefined,
  ): Promise<MortgageCertificateValidation> {
    return await this.syslumennService.validateMortgageCertificateOld(
      propertyNumber,
      isFromSearch,
    )
  }

  async requestCorrectionOnMortgageCertificate(
    propertyNumber: string,
    identityData: Identity,
    userProfileData: UserProfile,
  ): Promise<RequestCorrection> {
    const person: Person = {
      name: identityData?.name,
      ssn: identityData?.nationalId,
      phoneNumber: userProfileData?.mobilePhoneNumber,
      email: userProfileData?.email,
      homeAddress: identityData?.address?.streetAddress || '',
      postalCode: identityData?.address?.postalCode || '',
      city: identityData?.address?.city || '',
      signed: true,
      type: PersonType.MortgageCertificateApplicant,
    }

    const persons: Person[] = [person]

    const extraData: { [key: string]: string } = {
      propertyNumber: propertyNumber,
    }

    const uploadDataName =
      'Umsókn um lagfæringu á veðbókarvottorði frá Ísland.is'
    const uploadDataId = 'VedbokavottordVilla1.0'

    try {
      const res = await this.syslumennService.uploadData(
        persons,
        undefined,
        extraData,
        uploadDataName,
        uploadDataId,
      )

      return {
        hasSentRequest: res.success,
      }
    } catch (error) {
      this.logger.error(
        'Error sending mortgage certificate to Sýslumenn',
        error,
      )
      return {
        hasSentRequest: false,
      }
    }
  }
}
