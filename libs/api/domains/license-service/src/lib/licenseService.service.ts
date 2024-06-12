import { User } from '@island.is/auth-nest-tools'
import isAfter from 'date-fns/isAfter'
import {
  LicenseClient,
  LicenseClientService,
  LicenseType,
  LicenseVerifyExtraDataResult,
} from '@island.is/clients/license-client'
import { CmsContentfulService } from '@island.is/cms'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import {
  BarcodeService,
  TOKEN_EXPIRED_ERROR,
} from '@island.is/services/license'

import { Locale } from '@island.is/shared/types'
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { isJSON, isJWT } from 'class-validator'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import ShortUniqueId from 'short-unique-id'
import { GenericUserLicense } from './dto/GenericUserLicense.dto'
import { UserLicensesResponse } from './dto/UserLicensesResponse.dto'
import {
  VerifyLicenseBarcodeError,
  VerifyLicenseBarcodeResult,
  VerifyLicenseBarcodeType,
} from './dto/VerifyLicenseBarcodeResult.dto'
import {
  GenericLicenseFetchResult,
  GenericLicenseLabels,
  GenericLicenseMapper,
  GenericLicenseType,
  GenericLicenseTypeType,
  GenericLicenseUserdata,
  GenericUserLicenseFetchStatus,
  GenericUserLicensePkPassStatus,
  GenericUserLicenseStatus,
  PkPassVerification,
} from './licenceService.type'
import {
  AVAILABLE_LICENSES,
  DEFAULT_LICENSE_ID,
  LICENSE_MAPPER_FACTORY,
} from './licenseService.constants'
import { CreateBarcodeResult } from './dto/CreateBarcodeResult.dto'
import { isDefined } from '@island.is/shared/utils'

const LOG_CATEGORY = 'license-service'

export type GetGenericLicenseOptions = {
  includedTypes?: Array<GenericLicenseTypeType>
  excludedTypes?: Array<GenericLicenseTypeType>
  force?: boolean
  onlyList?: boolean
}

const { randomUUID } = new ShortUniqueId({ length: 16 })

const COMMON_VERIFY_ERROR = {
  valid: false,
  error: VerifyLicenseBarcodeError.ERROR,
}

type Namespace = {
  namespace: string
  fields?: string
}

@Injectable()
export class LicenseServiceService {
  constructor(
    @Inject(LOGGER_PROVIDER) private logger: Logger,
    private readonly barcodeService: BarcodeService,
    private readonly licenseClient: LicenseClientService,
    private readonly cmsContentfulService: CmsContentfulService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(LICENSE_MAPPER_FACTORY)
    private readonly licenseMapperFactory: (
      type: GenericLicenseType,
    ) => Promise<GenericLicenseMapper | null>,
  ) {}

  /**
   * Maps the generic license type to the actual license type used by the license clients
   */
  private mapLicenseType = (type: GenericLicenseType) =>
    type === GenericLicenseType.DriversLicense
      ? LicenseType.DrivingLicense
      : (type as unknown as LicenseType)

  /**
   * Maps the client license type to the generic license type
   */
  private mapGenericLicenseType = (type: LicenseType) =>
    type === LicenseType.DrivingLicense
      ? GenericLicenseType.DriversLicense
      : (type as unknown as GenericLicenseType)

  private getLicenseLabels = async (
    locale: Locale,
  ): Promise<GenericLicenseLabels> => {
    const cacheKey = `namespace-licenses-${locale}`
    const namespace = await this.cacheManager.get<Namespace | null>(cacheKey)

    let licenseNamespace: Namespace | null
    if (!namespace) {
      const result = await this.cmsContentfulService.getNamespace(
        'Licenses',
        locale,
      )
      await this.cacheManager.set(cacheKey, result)
      licenseNamespace = result
    } else {
      licenseNamespace = namespace
    }

    return {
      labels: licenseNamespace?.fields
        ? JSON.parse(licenseNamespace.fields)
        : undefined,
    }
  }

  private async fetchLicenses(
    user: User,
    licenseClient: LicenseClient<LicenseType>,
  ): Promise<GenericLicenseFetchResult> {
    if (!licenseClient) {
      throw new InternalServerErrorException('License service failed')
    }

    const licenseRes = await licenseClient.getLicenses(user)

    if (!licenseRes.ok) {
      return {
        data: [],
        fetch: {
          status: GenericUserLicenseFetchStatus.Error,
          updated: new Date(),
        },
      }
    }

    return {
      data: licenseRes.data,
      fetch: {
        status: GenericUserLicenseFetchStatus.Fetched,
        updated: new Date(),
      },
    }
  }

  async getUserLicenses(
    user: User,
    locale: Locale,
    { includedTypes, excludedTypes, onlyList }: GetGenericLicenseOptions = {},
  ): Promise<UserLicensesResponse> {
    const labels = await this.getLicenseLabels(locale)
    const fetchPromises = AVAILABLE_LICENSES.map(async (license) => {
      if (excludedTypes && excludedTypes.indexOf(license.type) >= 0) {
        return null
      }

      if (includedTypes && includedTypes.indexOf(license.type) < 0) {
        return null
      }

      if (!onlyList) {
        return this.getLicensesOfType(user, locale, license.type, labels)
      }

      return null
    }).filter(isDefined)

    const licenses: Array<GenericUserLicense> = []
    for (const licenseArrayResult of await Promise.allSettled(fetchPromises)) {
      if (
        licenseArrayResult.status === 'fulfilled' &&
        licenseArrayResult.value
      ) {
        licenses.push(...licenseArrayResult.value)
      }
    }

    return {
      nationalId: user.nationalId,
      licenses: licenses ?? [],
    }
  }
  async getAllLicenses(
    user: User,
    locale: Locale,
    { includedTypes, excludedTypes, onlyList }: GetGenericLicenseOptions = {},
  ): Promise<GenericUserLicense[]> {
    const licenseLabels = await this.getLicenseLabels(locale)

    const fetchPromises = AVAILABLE_LICENSES.map(async (license) => {
      if (excludedTypes && excludedTypes.indexOf(license.type) >= 0) {
        return null
      }

      if (includedTypes && includedTypes.indexOf(license.type) < 0) {
        return null
      }

      if (!onlyList) {
        return this.getLicensesOfType(user, locale, license.type, licenseLabels)
      }

      return null
    }).filter(isDefined)

    const licenses: Array<GenericUserLicense> = []
    for (const licenseArrayResult of await Promise.allSettled(fetchPromises)) {
      if (
        licenseArrayResult.status === 'fulfilled' &&
        licenseArrayResult.value
      ) {
        licenses.push(...licenseArrayResult.value)
      }
    }

    return licenses
  }

  async getLicensesOfType(
    user: User,
    locale: Locale,
    licenseType: GenericLicenseType,
    labels?: GenericLicenseLabels,
  ): Promise<Array<GenericUserLicense> | null> {
    const licenseTypeDefinition = AVAILABLE_LICENSES.find(
      (i) => i.type === licenseType,
    )

    const mappedLicenseType = this.mapLicenseType(licenseType)
    const licenseService = await this.licenseClient.getClientByLicenseType<
      typeof mappedLicenseType
    >(mappedLicenseType)

    if (!licenseTypeDefinition || !licenseService) {
      this.logger.error(`Invalid license type. type: ${licenseType}`, {
        category: LOG_CATEGORY,
      })
      return null
    }

    const licenseRes = await this.fetchLicenses(user, licenseService)

    const mapper = await this.licenseMapperFactory(licenseType)

    if (!mapper) {
      this.logger.warn('Service failure. No mapper created', {
        category: LOG_CATEGORY,
      })
      return null
    }

    const licensesPayload =
      licenseRes.fetch.status !== GenericUserLicenseFetchStatus.Error
        ? mapper.parsePayload(licenseRes.data, locale, labels)
        : []

    const mappedLicenses = licensesPayload.map((lp) => {
      const licenseUserData: GenericLicenseUserdata = {
        status: GenericUserLicenseStatus.Unknown,
        pkpassStatus: GenericUserLicensePkPassStatus.Unknown,
      }

      if (lp) {
        licenseUserData.pkpassStatus = licenseService.clientSupportsPkPass
          ? (licenseService.licenseIsValidForPkPass?.(
              lp.rawData,
              user,
            ) as unknown as GenericUserLicensePkPassStatus) ??
            GenericUserLicensePkPassStatus.Unknown
          : GenericUserLicensePkPassStatus.NotAvailable
        licenseUserData.status = GenericUserLicenseStatus.HasLicense
      } else {
        licenseUserData.status = GenericUserLicenseStatus.NotAvailable
      }

      return {
        nationalId: user.nationalId,
        license: {
          ...licenseTypeDefinition,
          status: licenseUserData.status,
          pkpassStatus: licenseUserData.pkpassStatus,
        },
        fetch: {
          ...licenseRes.fetch,
          updated: licenseRes.fetch.updated.getTime().toString(),
        },
        payload:
          {
            ...lp,
            rawData: lp.rawData ?? undefined,
          } ?? undefined,
      }
    })

    return (
      mappedLicenses ?? [
        {
          nationalId: user.nationalId,
          license: {
            ...licenseTypeDefinition,
            status: GenericUserLicenseStatus.Unknown,
            pkpassStatus: GenericUserLicenseStatus.Unknown,
          },
          fetch: {
            ...licenseRes.fetch,
            updated: licenseRes.fetch.updated.getTime().toString(),
          },
          payload: undefined,
        },
      ]
    )
  }

  async getLicense(
    user: User,
    locale: Locale,
    licenseType: GenericLicenseType,
    licenseId?: string,
  ): Promise<GenericUserLicense | null> {
    const labels = await this.getLicenseLabels(locale)

    const licensesOfType =
      (await this.getLicensesOfType(user, locale, licenseType, labels)) ?? []

    if (!licenseId || licenseId === DEFAULT_LICENSE_ID) {
      return licensesOfType[0] ?? null
    }

    return (
      licensesOfType.find(
        (l) => l.payload?.metadata?.licenseId === licenseId,
      ) ?? null
    )
  }

  async getClient<Type extends LicenseType>(type: LicenseType) {
    const client = await this.licenseClient.getClientByLicenseType<Type>(type)

    if (!client) {
      const msg = `Invalid license type. "${type}"`
      this.logger.warn(msg, { category: LOG_CATEGORY })

      throw new InternalServerErrorException(msg)
    }

    return client
  }

  async generatePkPassUrl(
    user: User,
    licenseType: GenericLicenseType,
  ): Promise<string> {
    const mappedLicenseType = this.mapLicenseType(licenseType)
    const client = await this.getClient(mappedLicenseType)

    if (!client.clientSupportsPkPass) {
      this.logger.warn('client does not support pkpass', {
        category: LOG_CATEGORY,
        type: licenseType,
      })
      throw new BadRequestException(
        `License client does not support pkpass, type: ${licenseType}`,
      )
    }

    if (!client.getPkPassUrl) {
      this.logger.error('License client has no getPkPassUrl implementation', {
        category: LOG_CATEGORY,
        type: licenseType,
      })
      throw new BadRequestException(
        `License client has no getPkPassUrl implementation, type: ${licenseType}`,
      )
    }

    if (!client.clientSupportsPkPass) {
      this.logger.warn('client does not support pkpass', {
        category: LOG_CATEGORY,
        type: licenseType,
      })
      throw new BadRequestException(
        `License client does not support pkpass, type: ${licenseType}`,
      )
    }

    if (!client.getPkPassUrl) {
      this.logger.error('License client has no getPkPassUrl implementation', {
        category: LOG_CATEGORY,
        type: licenseType,
      })
      throw new BadRequestException(
        `License client has no getPkPassUrl implementation, type: ${licenseType}`,
      )
    }

    const pkPassRes = await client.getPkPassUrl(user)

    if (pkPassRes.ok) {
      return pkPassRes.data
    }

    throw new InternalServerErrorException(
      `Unable to get pkpass for ${licenseType} for user`,
    )
  }

  async generatePkPassQRCode(
    user: User,
    licenseType: GenericLicenseType,
  ): Promise<string> {
    const mappedLicenseType = this.mapLicenseType(licenseType)
    const client = await this.getClient(mappedLicenseType)

    if (!client.clientSupportsPkPass) {
      this.logger.warn('client does not support pkpass', {
        category: LOG_CATEGORY,
        type: licenseType,
      })
      throw new BadRequestException(
        `License client does not support pkpass, type: ${licenseType}`,
      )
    }

    if (!client.getPkPassQRCode) {
      this.logger.error(
        'License client has no getPkPassQRCode implementation',
        {
          category: LOG_CATEGORY,
          type: licenseType,
        },
      )
      throw new BadRequestException(
        `License client has no getPkPassQRCode implementation, type: ${licenseType}`,
      )
    }

    const pkPassRes = await client.getPkPassQRCode(user)

    if (pkPassRes.ok) {
      return pkPassRes.data
    }

    throw new InternalServerErrorException(
      `Unable to get pkpass for ${licenseType} for user`,
    )
  }

  async verifyPkPassDeprecated(data: string): Promise<PkPassVerification> {
    if (!data) {
      this.logger.warn('Missing input data for pkpass verification', {
        category: LOG_CATEGORY,
      })
      throw new Error(`Missing input data`)
    }

    const { passTemplateId }: { passTemplateId?: string } = JSON.parse(data)

    if (!passTemplateId) {
      throw new BadRequestException('Invalid pass template id supplied')
    }

    /*
     * PkPass barcodes provide a PassTemplateId that we can use to
     * map barcodes to license types.
     * Drivers licenses do NOT return a barcode so if the pass template
     * id is missing, then it's a driver's license.
     * Otherwise, map the id to its corresponding license type
     */
    const licenseService = await this.licenseClient.getClientByPassTemplateId(
      passTemplateId,
    )

    if (!licenseService) {
      throw new Error(`Invalid pass template id: ${passTemplateId}`)
    }

    if (!licenseService.clientSupportsPkPass) {
      this.logger.warn('client does not support pkpass', {
        category: LOG_CATEGORY,
        passTemplateId,
      })
      throw new BadRequestException(
        `License client does not support pkpass, passTemplateId: ${passTemplateId}`,
      )
    }

    if (licenseService.verifyPkPassDeprecated) {
      const verification = await licenseService.verifyPkPassDeprecated(data)

      if (!verification.ok) {
        throw new InternalServerErrorException(
          'Unable to verify pkpass for user',
        )
      }

      return verification.data
    }

    if (licenseService.verifyPkPass) {
      const verifyPkPassRes = await licenseService.verifyPkPass(data)

      if (!verifyPkPassRes.ok) {
        throw new InternalServerErrorException(
          `Unable to verify pkpass for user`,
        )
      }

      return {
        valid: verifyPkPassRes.data.valid,
        // Make sure to return the data as a string to be backwards compatible
        data: JSON.stringify(verifyPkPassRes.data.data),
      }
    }

    const missingMethodMsg =
      'License client has no verifyPkPass nor verifyPkPassDeprecated implementation'
    this.logger.error(missingMethodMsg, {
      passTemplateId,
    })

    throw new BadRequestException(
      `${missingMethodMsg}, passTemplateId: ${passTemplateId}`,
    )
  }

  async createBarcode(
    user: User,
    genericUserLicense: GenericUserLicense,
  ): Promise<CreateBarcodeResult | null> {
    const code = randomUUID()
    const genericUserLicenseType = genericUserLicense.license.type
    const licenseType = this.mapLicenseType(genericUserLicenseType)
    const client = await this.getClient<typeof licenseType>(licenseType)

    if (
      genericUserLicense.license.pkpassStatus !==
      GenericUserLicensePkPassStatus.Available
    ) {
      this.logger.info(
        `pkpassStatus not available for license: ${licenseType}`,
        {
          pkpassStatus: genericUserLicense.license.pkpassStatus,
        },
      )

      return null
    }

    let extraData: LicenseVerifyExtraDataResult<LicenseType> | undefined

    if (client?.verifyExtraData) {
      extraData = await client.verifyExtraData(user)

      if (!extraData) {
        const msg = `Unable to verify extra data for license: ${licenseType}`
        this.logger.error(msg, { category: LOG_CATEGORY })

        throw new InternalServerErrorException(msg)
      }
    }

    const [tokenPayload] = await Promise.all([
      // Create a token with the version and a server reference (Redis key) code
      this.barcodeService.createToken({
        v: VerifyLicenseBarcodeType.V2,
        t: licenseType,
        c: code,
      }),
      // Store license data in cache so that we can fetch data quickly when verifying the barcode
      this.barcodeService.setCache(code, {
        nationalId: user.nationalId,
        licenseType,
        extraData,
      }),
    ])

    return tokenPayload
  }

  logWarn(msg: string) {
    this.logger.warn(msg, {
      category: LOG_CATEGORY,
    })
  }

  async getDataFromToken(token: string) {
    let code: string | undefined

    try {
      const payload = await this.barcodeService.verifyToken(token)
      code = payload.c
    } catch (error) {
      this.logger.warn(error, {
        category: LOG_CATEGORY,
      })

      if (error.name === TOKEN_EXPIRED_ERROR) {
        // If the token is expired, we can still get the token payload by ignoring the expiration date
        const { t: licenseType } = await this.barcodeService.verifyToken(
          token,
          {
            ignoreExpiration: true,
          },
        )

        return {
          licenseType: this.mapGenericLicenseType(licenseType),
          valid: false,
          error: VerifyLicenseBarcodeError.EXPIRED,
        }
      }

      return COMMON_VERIFY_ERROR
    }

    const data = await this.barcodeService.getCache(code)

    if (!data) {
      this.logWarn('No data found in cache')

      return COMMON_VERIFY_ERROR
    }

    const licenseType = this.mapGenericLicenseType(data.licenseType)

    return {
      valid: true,
      licenseType,
      data: data.extraData
        ? {
            ...data.extraData,
            // type here is used to resolve the union type in the graphql schema
            type: licenseType,
          }
        : null,
    }
  }

  async verifyLicenseBarcode(
    data: string,
  ): Promise<VerifyLicenseBarcodeResult> {
    if (isJWT(data)) {
      // Verify the barcode data as a token, e.g. new barcode format
      const tokenData = await this.getDataFromToken(data)

      return {
        barcodeType: VerifyLicenseBarcodeType.V2,
        ...tokenData,
      }
    }

    // else fallback to the old barcode format

    if (!isJSON(data)) {
      this.logWarn('Invalid JSON data')

      return {
        barcodeType: VerifyLicenseBarcodeType.UNKNOWN,
        ...COMMON_VERIFY_ERROR,
      }
    }

    const {
      passTemplateId,
      expires,
      date,
    }: { passTemplateId?: string; expires?: string; date?: string } =
      JSON.parse(data)

    if (!passTemplateId) {
      this.logWarn('No passTemplateId found in data')

      return {
        barcodeType: VerifyLicenseBarcodeType.UNKNOWN,
        ...COMMON_VERIFY_ERROR,
      }
    }

    const client = await this.licenseClient.getClientByPassTemplateId(
      passTemplateId,
    )

    if (!client) {
      this.logWarn(
        'Invalid passTemplateId supplied to getClientByPassTemplateId',
      )

      return {
        barcodeType: VerifyLicenseBarcodeType.PK_PASS,
        ...COMMON_VERIFY_ERROR,
      }
    }

    const licenseType = this.mapGenericLicenseType(client.type)
    const commonResult = {
      licenseType,
      barcodeType: VerifyLicenseBarcodeType.PK_PASS,
    }
    const parsedExpireTime = expires || date

    // If the expiration date is in the past, the barcode is expired
    if (parsedExpireTime && !isAfter(new Date(parsedExpireTime), new Date())) {
      return {
        ...commonResult,
        valid: false,
        error: VerifyLicenseBarcodeError.EXPIRED,
      }
    }

    if (!client.verifyPkPass) {
      this.logWarn('License client has no verifyPkPass implementation')

      return {
        ...commonResult,
        ...COMMON_VERIFY_ERROR,
      }
    }

    const res = await client.verifyPkPass(data)

    if (!res.ok) {
      this.logWarn('Unable to verify pkpass for user')

      return {
        ...commonResult,
        ...COMMON_VERIFY_ERROR,
      }
    }

    const licenseData = res.data.data

    return {
      ...commonResult,
      valid: true,
      data: licenseData
        ? {
            type: licenseType,
            ...licenseData,
          }
        : null,
    }
  }
}
