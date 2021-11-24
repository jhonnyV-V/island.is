import {
  buildCheckboxField,
  buildForm,
  buildDescriptionField,
  buildMultiField,
  buildRadioField,
  buildSection,
  buildSubmitField,
  buildSubSection,
  buildTextField,
  Comparators,
  Form,
  FormModes,
  FormValue,
  buildFileUploadField,
  buildExternalDataProvider,
  buildDataProviderItem,
  buildCustomField,
  DefaultEvents,
  StaticText,
  buildDividerField,
  buildKeyValueField,
} from '@island.is/application/core'
import { NationalRegistryUser, UserProfile } from '../types/schema'
import { m } from '../lib/messages'
import { ApiActions } from '../shared'

export const CriminalRecordForm: Form = buildForm({
  id: 'CriminalRecordFormDraft',
  title: '',
  mode: FormModes.APPLYING,
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
            // buildDataProviderItem({
            //   id: 'nationalRegistry',
            //   type: 'NationalRegistryProvider',
            //   title: m.nationalRegistryTitle,
            //   subTitle: m.nationalRegistrySubTitle,
            // }),
            // buildDataProviderItem({
            //   id: 'userProfile',
            //   type: 'UserProfileProvider',
            //   title: m.userProfileInformationTitle,
            //   subTitle: m.userProfileInformationSubTitle,
            // }),
            buildDataProviderItem({
              id: 'payment',
              type: 'FeeInfoProvider',
              title: '',
            }),
            buildDataProviderItem({
              id: 'criminalRecord',
              type: 'CriminalRecordProvider',
              title: m.criminalRecordInformationTitle,
              subTitle: m.criminalRecordInformationSubTitle,
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
          id: 'payment.info',
          title: 'Greiðsla',
          space: 1,
          children: [
            buildSubmitField({
              id: 'submit',
              placement: 'footer',
              title: 'Staðfesta',
              refetchApplicationAfterSubmit: true,
              actions: [
                {
                  event: DefaultEvents.SUBMIT,
                  name: 'Staðfesta',
                  type: 'primary',
                },
              ],
            }),
            buildCustomField({
              id: 'payment.over',
              title: '',
              component: 'OverviewPaymentCharge',
            }),
          ],
        }),
        buildDescriptionField({
          id: 'final',
          title: 'Takk',
          description: (application) => {
            const sendApplicationActionResult =
              application.externalData[ApiActions.createApplication]

            let id = 'unknown'
            if (sendApplicationActionResult) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              id = sendApplicationActionResult.data.id
            }
            return {
              ...m.outroMessage,
              values: {
                id,
              },
            }
          },
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
