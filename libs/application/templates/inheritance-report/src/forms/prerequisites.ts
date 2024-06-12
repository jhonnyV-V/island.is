import {
  buildForm,
  buildMultiField,
  buildRadioField,
  buildSection,
  buildSubmitField,
} from '@island.is/application/core'
import { DefaultEvents, Form, FormModes } from '@island.is/application/types'
import { ESTATE_INHERITANCE, PREPAID_INHERITANCE } from '../lib/constants'
import { m } from '../lib/messages'

export const getForm = (): Form =>
  buildForm({
    id: 'PrerequisitesDraft',
    title: '',
    mode: FormModes.DRAFT,
    renderLastScreenButton: true,
    children: [
      buildSection({
        id: 'selectApplicationFor',
        title: '',
        children: [
          buildMultiField({
            title: m.preDataCollectionApplicationFor,
            description: m.preDataCollectionApplicationFoDescription,
            children: [
              buildRadioField({
                id: 'applicationFor',
                title: '',
                largeButtons: true,
                backgroundColor: 'blue',
                required: true,
                options: [
                  {
                    value: ESTATE_INHERITANCE,
                    label: m.preDataCollectionApplicationForDefault,
                  },
                  {
                    value: PREPAID_INHERITANCE,
                    label: m.preDataCollectionApplicationForPrepaid,
                  },
                ],
              }),
              buildSubmitField({
                id: 'inheritance.submit',
                title: '',
                refetchApplicationAfterSubmit: true,
                actions: [
                  {
                    event: DefaultEvents.SUBMIT,
                    name: m.confirmButton,
                    type: 'primary',
                  },
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
