import { defineMessages } from 'react-intl'

export const overview = {
  general: defineMessages({
    sectionTitle: {
      id: 'mc.application:overview.general.sectionTitle',
      defaultMessage: 'Yfirlit',
      description: 'Overview section title',
    },
    pageTitle: {
      id: 'mc.application:overview.general.pageTitle',
      defaultMessage: 'Upplýsingar um eignir',
      description: 'Overview page title',
    },
    description: {
      id: 'mc.application:overview.general.description',
      defaultMessage: 'Þú ert að sækja um vottorð fyrir eftirtaldar eignir:',
      description: 'Overview description',
    },
  }),
  labels: defineMessages({
    chosenProperty: {
      id: 'mc.application:overview.labels.chosenProperty',
      defaultMessage: 'Valin eign',
      description: 'Overview chosen property label',
    },
  }),
}
