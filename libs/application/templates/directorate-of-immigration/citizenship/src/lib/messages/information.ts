import { defineMessages } from 'react-intl'

export const information = {
  general: defineMessages({
    sectionTitle: {
      id: 'doi.cs.application:information.general.sectionTitle',
      defaultMessage: 'Upplýsingar',
      description: 'Title of information section',
    },
    pageTitle: {
      id: 'doi.cs.application:information.general.pageTitle',
      defaultMessage: 'Upplýsingar',
      description: 'Title of information page',
    },
    description: {
      id: 'doi.cs.application:information.general.description',
      defaultMessage:
        'Mauris lacus lorem, cursus ac ante nec, luctus lobortis orci',
      description: 'Description of information page',
    },
  }),
  labels: {
    test: defineMessages({
      sectionTitle: {
        id: 'doi.cs.application:information.labels.test.sectionTitle',
        defaultMessage: 'Test',
        description: 'Test subsection section title',
      },
      pageTitle: {
        id: 'doi.cs.application:information.test.pageTitle',
        defaultMessage: 'Upplýsingar um test',
        description: 'Test subsection page title',
      },
      title: {
        id: 'doi.cs.application:information.labels.test.title',
        defaultMessage: 'Test',
        description: 'Test subsection title',
      },
    }),
  },
}
