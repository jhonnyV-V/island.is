import { defineMessages, MessageDescriptor } from 'react-intl'

type MessageDir = Record<string, Record<string, MessageDescriptor>>

export const newPrimarySchoolMessages: MessageDir = {
  // Messages shared across the New Primary School application templates
  shared: defineMessages({
    applicationName: {
      id: 'dess.nps.application:application.name',
      defaultMessage: 'Nýr grunnskóli',
      description: 'New primary school',
    },
    institution: {
      id: 'dess.nps.application:institution.name',
      defaultMessage: 'Miðstöð menntunar og skólaþjónustu',
      description: 'Directorate of Education and School Services',
    },
    formTitle: {
      id: 'dess.nps.application:form.title',
      defaultMessage: 'Umsókn',
      description: 'Application',
    },
    alertTitle: {
      id: 'dess.nps.application:alert.title',
      defaultMessage: 'Athugið',
      description: 'Attention',
    },
  }),

  pre: defineMessages({
    prerequisitesSection: {
      id: 'dess.nps.application:prerequisites.section',
      defaultMessage: 'Forsendur',
      description: 'Prerequisites',
    },
    externalDataSubSection: {
      id: 'dess.nps.application:external.data.sub.section',
      defaultMessage: 'Gagnaöflun',
      description: 'Data collection',
    },
    externalDataDescription: {
      id: 'dess.nps.application:external.data.description',
      defaultMessage: 'Eftirfarandi upplýsingar verða sóttar rafrænt',
      description: 'The following information will be retrieved electronically',
    },
    nationalRegistryInformationTitle: {
      id: 'dess.nps.application:prerequisites.national.registry.title',
      defaultMessage: 'Upplýsingar frá Þjóðskrá',
      description: 'Information from Registers Iceland',
    },
    nationalRegistryInformationSubTitle: {
      id: 'dess.nps.application:prerequisites.national.registry.subtitle',
      defaultMessage: 'Upplýsingar um þig.',
      description: 'Information about you.',
    },
    userProfileInformationTitle: {
      id: 'dess.nps.application:prerequisites.userprofile.title',
      defaultMessage: 'Upplýsingar af mínum síðum á Ísland.is',
      description: 'Information from My Pages at Ísland.is',
    },
    userProfileInformationSubTitle: {
      id: 'dess.nps.application:prerequisites.userprofile.subtitle',
      defaultMessage:
        'Upplýsingar um netfang og símanúmer eru sóttar á mínar síður á Ísland.is.',
      description:
        'Information about email address and phone number will be retrieved from My Pages at Ísland.is.',
    },
    checkboxProvider: {
      id: 'dess.nps.application:prerequisites.checkbox.provider',
      defaultMessage:
        'Ég skil að ofangreindra upplýsinga verður aflað í umsóknarferlinu',
      description:
        'I understand that the above information will be collected during the application process',
    },
  }),

  childrenNParents: defineMessages({
    sectionTitle: {
      id: 'dess.nps.application:childrenNParents.section.title',
      defaultMessage: 'Börn og foreldrar',
      description: 'Children and parents',
    },
    children: {
      id: 'dess.nps.application:childrenNParents.children',
      defaultMessage: 'Börn',
      description: 'Children',
    },
    parentsSection: {
      id: 'dess.nps.application:childrenNParents.parentsSection',
      defaultMessage: 'Foreldrar/forsjáraðilar',
      description: 'Parents/guardians',
    },
    name: {
      id: 'dess.nps.application:childrenNParents.name',
      defaultMessage: 'Nafn',
      description: 'Name',
    },
    nationalId: {
      id: 'dess.nps.application:childrenNParents.nationalId',
      defaultMessage: 'Kennitala',
      description: 'National id',
    },
    email: {
      id: 'dess.nps.application:childrenNParents.email',
      defaultMessage: 'Netfang',
      description: 'Email address',
    },
    municipality: {
      id: 'dess.nps.application:childrenNParents.municipality',
      defaultMessage: 'Sveitarfélag',
      description: 'Municipality',
    },
    postalcode: {
      id: 'dess.nps.application:childrenNParents.postalcode',
      defaultMessage: 'Póstfang',
      description: 'Postalcode',
    },
    address: {
      id: 'dess.nps.application:childrenNParents.address',
      defaultMessage: 'Heimilisfang',
      description: 'Address',
    },
    phoneNumber: {
      id: 'dess.nps.application:childrenNParents.phoneNumber',
      defaultMessage: 'Símanúmer',
      description: 'Phonenumber',
    },
    otherParent: {
      id: 'dess.nps.application:childrenNParents.otherParent',
      defaultMessage: 'Upplýsingar um forsjáraðila 2 / Foreldri/forsjáraðili 2',
      description: 'Information about guardian 2 / parent 2',
    },
    parent: {
      id: 'dess.nps.application:childrenNParents.parent',
      defaultMessage: 'Upplýsingar um forsjáraðila 1 / Foreldri/forsjáraðili 1',
      description: 'Information about guardian 1 / parent 1',
    },

    description: {
      id: 'dess.nps.application:childrenNParents.description',
      defaultMessage:
        'Aðeins forsjáaraðili sem deilir lögheimili með barni getur skráð það í grunnskóla. Ef þú sérð ekki barnið þitt í þessu ferli, þá bendum við á að skoða upplýsingar um forsjá á island.is',
      description: 'Parents section description',
    },
  }),

  school: defineMessages({
    sectionTitle: {
      id: 'dess.nps.application:school.section.title',
      defaultMessage: 'Skóli',
      description: 'School',
    },
  }),

  relatives: defineMessages({
    sectionTitle: {
      id: 'dess.nps.application:relatives.section.title',
      defaultMessage: 'Aðstandendur',
      description: 'Relatives',
    },
  }),

  meal: defineMessages({
    sectionTitle: {
      id: 'dess.nps.application:meal.section.title',
      defaultMessage: 'Mataráskrift',
      description: 'Meal subscription',
    },
  }),

  confirm: defineMessages({
    sectionTitle: {
      id: 'dess.nps.application:confirmation.section.title',
      defaultMessage: 'Yfirlit',
      description: 'Overview',
    },
    overviewDescription: {
      id: 'dess.nps.application:confirmation.description',
      defaultMessage:
        'Vinsamlegast farðu yfir umsóknina áður en þú sendir hana inn.',
      description: 'Please review the application before submitting.',
    },
    child: {
      id: 'dess.nps.application:confirmation.child',
      defaultMessage: 'Barn',
      description: 'Child',
    },
    name: {
      id: 'dess.nps.application:review.name',
      defaultMessage: 'Nafn',
      description: 'Name',
    },
    nationalId: {
      id: 'dess.nps.application:review.national.id',
      defaultMessage: 'Kennitala',
      description: 'Icelandic ID number',
    },
    address: {
      id: 'dess.nps.application:review.address',
      defaultMessage: 'Heimilisfang',
      description: 'Address',
    },
    municipality: {
      id: 'dess.nps.application:review.municipality',
      defaultMessage: 'Sveitarfélag',
      description: 'Municipality',
    },
    submitButton: {
      id: 'dess.nps.application:confirm.submit.button',
      defaultMessage: 'Senda inn umsókn',
      description: 'Submit application',
    },
    editButton: {
      id: 'dess.nps.application:confirm.edit.button',
      defaultMessage: 'Breyta umsókn',
      description: 'Edit application',
    },
    canceled: {
      id: 'dess.nps.application:review.canceled',
      defaultMessage: 'Hætt við afskráningu',
      description: 'Deregistration canceled',
    },
    email: {
      id: 'dess.nps.application:review.email',
      defaultMessage: 'Netfang',
      description: 'Email address',
    },
    phoneNumber: {
      id: 'dess.nps.application:review.email',
      defaultMessage: 'Símanúmer',
      description: 'Phone number',
    },
    parents: {
      id: 'dess.nps.application:review.parents',
      defaultMessage: 'Foreldri/forsjáraðili',
      description: 'Parent / guardian',
    },
  }),

  conclusion: defineMessages({
    sectionTitle: {
      id: 'dess.nps.application:conclusion.section.title',
      defaultMessage: 'Staðfesting',
      description: 'Confirmation',
    },
    overviewTitle: {
      id: 'dess.nps.application:conclusion.overview.title',
      defaultMessage: 'TBD',
      description: 'TBD',
    },
    title: {
      id: 'dess.nps.application:conclusion.title',
      defaultMessage: 'Umsókn móttekin',
      description: 'Application received',
    },
    alertTitle: {
      id: 'dess.nps.application:conclusion.screen.title',
      defaultMessage: 'TBD',
      description: 'TBD',
    },
    accordionText: {
      id: 'dess.nps.application:conclusion.accordion.text#markdown',
      defaultMessage: 'TBD',
      description: 'TBD',
    },
    nextStepsLabel: {
      id: 'dess.nps.application:conclusion.screen.next.steps.label',
      defaultMessage: 'Hvað gerist næst?',
      description: 'What happens next?',
    },
    buttonsViewApplication: {
      id: 'dess.nps.application:conclusion.screen.buttons.view.application',
      defaultMessage: 'Skoða umsókn',
      description: 'View application',
    },
  }),
}

export const inReviewFormMessages = defineMessages({
  formTitle: {
    id: 'dess.nps.application:inReview.form.title',
    defaultMessage: 'Umsókn um nýjan grunnskóla',
    description: 'New primary school',
  },
})

export const statesMessages = defineMessages({
  draftDescription: {
    id: 'dess.nps.application:draft.description',
    defaultMessage: 'Þú hefur útbúið drög að umsókn.',
    description: 'You have create a draft application.',
  },
  applicationSent: {
    id: 'dess.nps.application:application.sent.title',
    defaultMessage: 'Umsókn hefur verið send.',
    description: 'The application has been sent',
  },
  applicationSentDescription: {
    id: 'dess.nps.application:application.sent.description',
    defaultMessage: 'Hægt er að breyta umsókn',
    description: 'It is possible to edit the application',
  },
})

export const errorMessages = defineMessages({})
