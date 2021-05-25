import { defineMessages } from 'react-intl'

export const coreMessages = defineMessages({
  buttonNext: {
    id: 'application.system:button.next',
    defaultMessage: 'Halda áfram',
    description: 'Next',
  },
  buttonBack: {
    id: 'application.system:button.back',
    defaultMessage: 'Til baka',
    description: 'Back',
  },
  buttonSubmit: {
    id: 'application.system:button.submit',
    defaultMessage: 'Senda',
    description: 'Submit',
  },
  buttonEdit: {
    id: 'application.system:button.edit',
    defaultMessage: 'Breyta',
    description: 'Edit button for review screen and so on',
  },
  externalDataTitle: {
    id: 'application.system:externalData.title',
    defaultMessage: 'Eftirfarandi gögn verða sótt rafrænt með þínu samþykki',
    description:
      'The following data will be retrieved electronically with your consent',
  },
  externalDataAgreement: {
    id: 'application.system:externalData.agreement',
    defaultMessage: 'Ég samþykki',
    description: 'I agree',
  },
  updateOrSubmitError: {
    id: 'application.system:submit.error',
    defaultMessage: 'Eitthvað fór úrskeiðis: {error}',
    description: 'Error message on submit: {error}',
  },
  globalErrorTitle: {
    id: 'application.system:boundary.error.title',
    defaultMessage: 'Úps! Eitthvað fór úrskeiðis',
    description: 'Oops! Something went wrong',
  },
  globalErrorMessage: {
    id: 'application.system:boundary.error.message',
    defaultMessage:
      'Fyrirgefðu! Eitthvað fór rosalega úrskeiðis og við erum að skoða það',
    description:
      'Sorry! Something went terribly wrong and we are looking into it',
  },
  userRoleError: {
    id: 'application.system:user.role.error',
    defaultMessage:
      'Innskráður notandi hefur ekki hlutverk í þessu umsóknarástandi',
    description:
      'Logged in user does not have a role in this application state',
  },
  notFoundTitle: {
    id: 'application.system:notFound',
    defaultMessage: 'Umsókn finnst ekki',
    description: 'Application not found',
  },
  notFoundSubTitle: {
    id: 'application.system:notFound.message',
    defaultMessage: 'Engin umsókn fannst á þessari slóð.',
    description: 'No application was found at this URL.',
  },
  notFoundApplicationType: {
    id: 'application.system:notFound.application.type',
    defaultMessage: 'Þessi gerð umsókna er ekki til',
    description: 'This type of application does not exist',
  },
  notFoundApplicationTypeMessage: {
    id: 'application.system:notFound.application.message',
    defaultMessage: 'Engin umsókn er til af gerðinni: {type}',
    description: 'There is no application of the type: {type}',
  },
  createErrorApplication: {
    id: 'application.system:create.error.application',
    defaultMessage: 'Eitthvað fór úrskeiðis',
    description: 'Something went wrong',
  },
  createErrorApplicationMessage: {
    id: 'application.system:create.error.application.message',
    defaultMessage: 'Ekki tókst að búa til umsókn af gerðinni: {type}',
    description: 'Failed to create application of type: {type}',
  },
  applications: {
    id: 'application.system:applications',
    defaultMessage: 'Þínar umsóknir',
    description: 'Your applications',
  },
  newApplication: {
    id: 'application.system:new.application',
    defaultMessage: 'Ný umsókn',
    description: 'New application',
  },
  tagsInProgress: {
    id: 'application.system:tags.inProgress',
    defaultMessage: 'Í ferli',
    description: 'In progress status for an application',
  },
  tagsDone: {
    id: 'application.system:tags.completed',
    defaultMessage: 'Lokið',
    description: 'Done status for an application',
  },
  tagsRejected: {
    id: 'application.system:tags.rejected',
    defaultMessage: 'Hafnað',
    description: 'Rejected status for an application',
  },
  tagsRequiresAction: {
    id: 'application.system:tags.requiresAction',
    defaultMessage: 'Krefst aðgerða',
    description: 'Requires action',
  },
  thanks: {
    id: 'application.system:thanks',
    defaultMessage: 'Takk fyrir',
    description: 'Thank you',
  },
  thanksDescription: {
    id: 'application.system:thanks.description',
    defaultMessage:
      'Úrvinnslu þinni er lokið. Umsókn er komin áfram í ferlinu.',
    description:
      'Your application is complete. The application has progressed in the process.',
  },
  notLoggedIn: {
    id: 'application.system:not.logged.id',
    defaultMessage: 'Þú þarft að vera skrá þig inn.',
    description: 'You need to be logged in.',
  },
  notLoggedInDescription: {
    id: 'application.system:not.logged.id.description',
    defaultMessage: 'Til að halda áfram umsóknarferli þarftu að skrá þig inn.',
    description:
      'To continue the application process, you will need to sign in.',
  },
  radioYes: {
    id: 'application.system:radio.option.yes',
    defaultMessage: 'Já',
    description: 'Yes option value',
  },
  radioNo: {
    id: 'application.system:radio.option.no',
    defaultMessage: 'Nei',
    description: 'No option value',
  },
})

export const coreErrorMessages = defineMessages({
  defaultError: {
    id: 'application.system:core.default.error',
    defaultMessage: 'Ógilt gildi',
    description: 'Generic invalid value error message',
  },
  errorDataProvider: {
    id: 'application.system:core.error.dataProvider',
    defaultMessage: 'Úps! Eitthvað fór úrskeiðis við að sækja gögnin þín',
    description: 'Oops! Something went wrong when fetching your data',
  },
})
