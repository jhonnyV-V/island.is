import {
  buildDataProviderItem,
  buildExternalDataProvider,
  buildForm,
  buildSubmitField,
  buildSection,
} from '@island.is/application/core'
import {
  DefaultEvents,
  Form,
  FormModes,
  NationalRegistryUserApi,
  UserProfileApi,
} from '@island.is/application/types'

import { m } from '../lib/messages'

export const Prerequisites: Form = buildForm({
  id: 'CreateListPrerequisites',
  title: m.applicationName,
  mode: FormModes.NOT_STARTED,
  renderLastScreenButton: true,
  renderLastScreenBackButton: true,
  children: [
    buildSection({
      id: 'approveExternalData',
      title: m.dataCollection,
      children: [
        buildExternalDataProvider({
          id: 'approveExternalData',
          title: m.dataCollection,
          subTitle: m.dataCollectionSubtitle,
          checkboxLabel: m.dataCollectionCheckbox,
          submitField: buildSubmitField({
            id: 'submit',
            placement: 'footer',
            title: '',
            refetchApplicationAfterSubmit: true,
            actions: [
              {
                event: DefaultEvents.SUBMIT,
                name: m.dataCollectionSubmit,
                type: 'primary',
              },
            ],
          }),
          dataProviders: [
            buildDataProviderItem({
              provider: NationalRegistryUserApi,
              title: m.nationalRegistryProviderTitle,
              subTitle: m.nationalRegistryProviderSubtitle,
            }),
            buildDataProviderItem({
              provider: UserProfileApi,
              title: m.userProfileProviderTitle,
              subTitle: m.userProfileProviderSubtitle,
            }),
          ],
        }),
      ],
    }),
    buildSection({
      id: 'screen3',
      title: m.information,
      children: [],
    }),
    buildSection({
      id: 'screen4',
      title: m.overview,
      children: [],
    }),
    buildSection({
      id: 'screen5',
      title: m.listCreated,
      children: [],
    }),
  ],
})
