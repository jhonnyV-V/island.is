import {
  buildForm,
  buildCustomField,
  buildSection,
  buildMessageWithLinkButtonField,
  coreMessages,
  buildMultiField,
  buildAlertMessageField,
  buildRepeater,
  buildPdfLinkButtonField,
} from '@island.is/application/core'
import { Form, FormModes } from '@island.is/application/types'
import Logo from '../assets/Logo'
import { confirmation, externalData, payment, property } from '../lib/messages'

export const Approved: Form = buildForm({
  id: 'ApprovedApplicationForm',
  title: '',
  logo: Logo,
  mode: FormModes.COMPLETED,
  children: [
    buildSection({
      id: 'externalData',
      title: externalData.general.sectionTitle,
      children: [],
    }),
    buildSection({
      id: 'selectProperty',
      title: property.general.sectionTitle,
      children: [],
    }),
    buildSection({
      id: 'payment',
      title: payment.general.sectionTitle,
      children: [],
    }),
    buildSection({
      id: 'confirmation',
      title: confirmation.general.sectionTitle,
      children: [
        buildMultiField({
          id: 'confirmationMultiField',
          title: confirmation.labels.confirmation,
          children: [
            buildAlertMessageField({
              id: 'confirmationAlertSuccess',
              alertType: 'success',
              title: confirmation.labels.successTitle,
              message: confirmation.labels.successDescription,
              marginBottom: 3,
              marginTop: 0,
            }),
            buildPdfLinkButtonField({
              id: 'confirmationPdfLinkButtonField',
              title: '',
              verificationDescription: '',
              verificationLinkTitle: '',
              verificationLinkUrl: '',
              getPdfFiles: (application) => {
                return []
              },
              viewPdfFile: true,
            }),
            buildCustomField({
              component: 'ConfirmationField',
              id: 'confirmationField',
              title: '',
              description: '',
            }),
            buildMessageWithLinkButtonField({
              id: 'uiForms.conclusionBottomLink',
              title: '',
              url: '/minarsidur/umsoknir',
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
