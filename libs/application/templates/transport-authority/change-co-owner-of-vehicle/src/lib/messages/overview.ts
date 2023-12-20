import { defineMessages } from 'react-intl'

export const overview = {
  general: defineMessages({
    title: {
      id: 'ta.ccov.application:overview.general.title',
      defaultMessage: 'Yfirlit skráningar meðeiganda',
      description: 'Title of overview screen',
    },
    description: {
      id: 'ta.ccov.application:overview.general.description',
      defaultMessage:
        'Vinsamlegast farðu yfir gögnin hér að neðan til að staðfesta að réttar upplýsingar hafi verið gefnar upp.',
      description: 'Description of overview screen',
    },
  }),
  labels: defineMessages({
    ownersCoOwner: {
      id: 'ta.ccov.application:overview.labels.ownersCoOwner',
      defaultMessage: 'Meðeigandi',
      description: 'Owners co owner label',
    },
    coOwnerRemoved: {
      id: 'ta.ccov.application:overview.labels.coOwnerRemoved',
      defaultMessage: 'fjarlægður',
      description: 'co owner removed label',
    },
    mileage: {
      id: 'ta.ccov.application:overview.labels.mileage',
      defaultMessage: 'Kílómetrar:',
      description: 'Mileage label',
    },
  }),
  confirmationModal: defineMessages({
    title: {
      id: 'ta.ccov.application:overview.confirmationModal.title',
      defaultMessage: 'Hafna tilkynningu',
      description: 'Confirmation modal reject title',
    },
    text: {
      id: 'ta.ccov.application:overview.confirmationModal.text',
      defaultMessage: 'Þú ert að fara að hafna tilkynningu.',
      description: 'Confirmation modal reject text',
    },
    buttonText: {
      id: 'ta.ccov.application:overview.confirmationModal.buttonText',
      defaultMessage: 'Hafna tilkynningu',
      description: 'Confirmation modal reject button',
    },
    cancelButton: {
      id: 'ta.ccov.application:overview.confirmationModal.cancelButton',
      defaultMessage: 'Hætta við',
      description: 'Confirmation modal cancel button',
    },
  }),
}
