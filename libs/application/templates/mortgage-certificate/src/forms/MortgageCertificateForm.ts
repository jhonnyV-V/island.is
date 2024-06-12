import {
  buildForm,
  buildDescriptionField,
  buildMultiField,
  buildSection,
  buildExternalDataProvider,
  buildDataProviderItem,
  buildCustomField,
  buildSubmitField,
  buildSelectField,
  buildSubSection,
} from '@island.is/application/core'
import { Form, FormModes, DefaultEvents } from '@island.is/application/types'
import { m } from '../lib/messagess'
import {
  IdentityApi,
  NationalRegistryRealEstateApi,
  UserProfileApi,
  SyslumadurPaymentCatalogApi,
} from '../dataProviders'
import { overview, propertySearch } from '../lib/messages'

export const MortgageCertificateForm: Form = buildForm({
  id: 'MortgageCertificateFormDraft',
  title: '',
  mode: FormModes.DRAFT,
  renderLastScreenBackButton: true,
  renderLastScreenButton: true,
  children: [
    buildSection({
      id: 'externalData',
      title: m.externalDataSection,
      children: [
        buildExternalDataProvider({
          title: m.externalDataTitle,
          id: 'approveExternalData',
          subTitle: m.externalDataSubTitle,
          checkboxLabel: m.externalDataAgreement,
          dataProviders: [
            buildDataProviderItem({
              provider: IdentityApi,
              title: m.nationalRegistryTitle,
              subTitle: m.nationalRegistrySubTitle,
            }),
            // buildDataProviderItem({
            //   provider: NationalRegistryRealEstateApi,
            //   title: m.nationalRegistryRealEstateTitle,
            //   subTitle: m.nationalRegistryRealEstateSubTitle,
            // }),
            buildDataProviderItem({
              provider: UserProfileApi,
              title: m.userProfileInformationTitle,
              subTitle: m.userProfileInformationSubTitle,
            }),
            buildDataProviderItem({
              provider: SyslumadurPaymentCatalogApi,
              title: '',
            }),
          ],
        }),
      ],
    }),
    buildSection({
      id: 'selectRealEstate',
      title: m.property,
      children: [
        buildSubSection({
          title: propertySearch.general.sectionTitle,
          children: [
            buildMultiField({
              id: 'selectRealEstate.info',
              title: propertySearch.general.pageTitle,
              description: propertySearch.general.description,
              space: 1,
              children: [
                buildCustomField({
                  id: 'selectedProperties',
                  title: '',
                  component: 'SelectProperty',
                }),
                // buildSubmitField({
                //   id: 'submit',
                //   placement: 'footer',
                //   title: m.confirm,
                //   refetchApplicationAfterSubmit: true,
                //   actions: [
                //     {
                //       event: DefaultEvents.SUBMIT,
                //       name: m.confirm,
                //       type: 'primary',
                //     },
                //   ],
                // }),
              ],
            }),
          ],
        }),
        buildSubSection({
          title: overview.general.sectionTitle,
          children: [
            buildMultiField({
              id: 'selectRealEstate.info',
              title: overview.general.pageTitle,
              description: overview.general.description,
              space: 1,
              children: [
                buildCustomField({
                  id: 'propertiesOverview',
                  title: '',
                  component: 'PropertiesOverview',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    buildSection({
      id: 'payment',
      title: m.payment,
      children: [
        buildMultiField({
          id: 'selectRealEstate.info',
          title: propertySearch.general.pageTitle,
          description: propertySearch.general.description,
          space: 1,
          children: [
            buildDescriptionField({
              id: 'temp',
              title: 'Temp',
            }),
          ],
        }),
      ],
    }),
    buildSection({
      id: 'confirmation',
      title: m.confirmation,
      children: [],
    }),
  ],
})
