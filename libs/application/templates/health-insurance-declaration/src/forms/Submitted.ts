import {
  buildCustomField,
  buildDescriptionField,
  buildForm,
  buildMessageWithLinkButtonField,
  buildMultiField,
  buildSection,
  coreMessages,
} from '@island.is/application/core'
import { Form, FormModes } from '@island.is/application/types'
import { application } from '../lib/messages'
import * as m from '../lib/messages'

const bottomButtonLink = '/minarsidur/umsoknir'

export const HealthInsuranceDeclarationSubmitted: Form = buildForm({
  id: 'HealthInsuranceDeclarationSubmitted',
  title: application.general.name,
  mode: FormModes.APPROVED,
  children: [
    buildSection({
      id: 'conclutionSection',
      title: m.conclution.general.sectionTitle,
      children: [
        buildMultiField({
          id: 'conclusionMultifield',
          title: m.conclution.general.descriptionFieldTitle,
          children: [
            buildDescriptionField({
              id: 'conclusionExpandableDescription',
              title: '',
              description: m.conclution.general.descriptionFieldMessage,
            }),
            buildCustomField({
              id: 'applicantList',
              title: '',
              component: 'ApplicantList',
            }),
            buildMessageWithLinkButtonField({
              id: 'conclusionBottomLink',
              title: '',
              url: bottomButtonLink,
              buttonTitle: coreMessages.openServicePortalButtonTitle,
              message: coreMessages.openServicePortalMessageText,
              marginBottom: [4, 4, 12],
            }),
          ],
        }),
      ],
    }),
  ],
})
