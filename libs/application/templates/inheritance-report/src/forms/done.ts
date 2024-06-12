import { buildForm } from '@island.is/application/core'
import { Form, FormModes } from '@island.is/application/types'
import { buildFormConclusionSection } from '@island.is/application/ui-forms'
import { m } from '../lib/messages'
import { PREPAID_INHERITANCE } from '../lib/constants'

export const done: Form = buildForm({
  id: 'inheritanceReportDone',
  title: '',
  mode: FormModes.COMPLETED,
  children: [
    buildFormConclusionSection({
      sectionTitle: '',
      multiFieldTitle: m.doneMultiFieldTitleEFS,
      alertTitle: m.doneAlertTitleEFS,
      alertMessage: ({ answers }) =>
        answers.applicationFor === PREPAID_INHERITANCE
          ? m.doneTitlePrepaidEFS
          : m.doneTitleEFS,
      expandableHeader: m.nextSteps,
      expandableDescription: ({ answers }) =>
        answers.applicationFor === PREPAID_INHERITANCE
          ? m.doneDescriptionPrepaidEFS
          : m.doneDescriptionEFS,
    }),
  ],
})
