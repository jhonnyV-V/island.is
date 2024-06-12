import {
  InstitutionNationalIds,
  PaymentCatalogApi,
} from '@island.is/application/types'

export { IdentityApi, UserProfileApi } from '@island.is/application/types'

export const SyslumadurPaymentCatalogApi = PaymentCatalogApi.configure({
  params: {
    organizationId: InstitutionNationalIds.SYSLUMENN,
  },
  externalDataId: 'payment',
})
