import { Injectable } from '@nestjs/common'

import type { Auth } from '@island.is/auth-nest-tools'
import { AuthMiddleware } from '@island.is/auth-nest-tools'
import {
  ApplicationApi,
  MunicipalityApi,
  FilesApi,
  PersonalTaxReturnApi,
} from '@island.is/clients/municipalities-financial-aid'
import { FetchError } from '@island.is/clients/middlewares'
import { CreateSignedUrlInput, MunicipalityInput } from './dto'

@Injectable()
export class MunicipalitiesFinancialAidService {
  constructor(
    private applicationApi: ApplicationApi,
    private municipalityApi: MunicipalityApi,
    private filesApi: FilesApi,
    private personalTaxReturnApi: PersonalTaxReturnApi,
  ) {}

  applicationApiWithAuth(auth: Auth) {
    return this.applicationApi.withMiddleware(new AuthMiddleware(auth))
  }

  municipalityApiWithAuth(auth: Auth) {
    return this.municipalityApi.withMiddleware(new AuthMiddleware(auth))
  }

  fileApiWithAuth(auth: Auth) {
    return this.filesApi.withMiddleware(new AuthMiddleware(auth))
  }

  personalTaxReturnApiWithAuth(auth: Auth) {
    return this.personalTaxReturnApi.withMiddleware(new AuthMiddleware(auth))
  }

  private handle404(error: FetchError) {
    if (error.status === 404) {
      return null
    }
    throw error
  }

  async municipalitiesFinancialAidCurrentApplication(auth: Auth) {
    return await this.applicationApiWithAuth(auth)
      .applicationControllerGetCurrentApplication()
      .catch(this.handle404)
  }

  async municipalityInfoForFinancialAId(
    auth: Auth,
    municipalityCode: MunicipalityInput,
  ) {
    return await this.municipalityApiWithAuth(auth)
      .municipalityControllerGetById(municipalityCode)
      .catch(this.handle404)
  }

  async personalTaxReturnForFinancialAId(auth: Auth, folderId: string) {
    return await this.personalTaxReturnApiWithAuth(
      auth,
    ).personalTaxReturnControllerMunicipalitiesPersonalTaxReturn({
      id: folderId,
    })
  }

  async directTaxPaymentsForFinancialAId(auth: Auth) {
    return await this.personalTaxReturnApiWithAuth(
      auth,
    ).personalTaxReturnControllerMunicipalitiesDirectTaxPayments()
  }

  async municipalitiesFinancialAidCreateSignedUrl(
    auth: Auth,
    getSignedUrl: CreateSignedUrlInput,
  ) {
    return await this.fileApiWithAuth(auth).fileControllerCreateSignedUrl({
      getSignedUrlDto: getSignedUrl,
    })
  }
}
