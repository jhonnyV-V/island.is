import {
  buildForm,
  buildMultiField,
  buildSection,
  buildCustomField,
  buildSubSection,
} from '@island.is/application/core'
import { Form, FormModes } from '@island.is/application/types'
import {
  confirmation,
  externalData,
  overview,
  payment,
  property,
  propertySearch,
} from '../lib/messages'
import { buildFormPaymentChargeOverviewSection } from '@island.is/application/ui-forms'
import { getChargeItemCodesAndExtraLabel } from '../util'
import Logo from '../assets/Logo'

export const MortgageCertificateForm: Form = buildForm({
  id: 'MortgageCertificateFormDraft',
  title: '',
  logo: Logo,
  mode: FormModes.DRAFT,
  renderLastScreenBackButton: true,
  renderLastScreenButton: true,
  children: [
    buildSection({
      id: 'externalData',
      title: externalData.general.sectionTitle,
      children: [],
    }),
    buildSection({
      id: 'selectRealEstate',
      title: property.general.sectionTitle,
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
    buildFormPaymentChargeOverviewSection({
      sectionTitle: payment.general.sectionTitle,
      forPaymentLabel: payment.labels.forPayment,
      getSelectedChargeItems: (application) =>
        getChargeItemCodesAndExtraLabel(application),
    }),
    buildSection({
      id: 'confirmation',
      title: confirmation.general.sectionTitle,
      children: [],
    }),
  ],
})
