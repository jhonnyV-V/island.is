import {
  buildAlertMessageField,
  buildCustomField,
  buildDescriptionField,
  buildMultiField,
  buildSubSection,
  buildTextField,
} from '@island.is/application/core'
import { accidentDetails } from '../../../lib/messages'
import { isDateOlderThanAYear, isHomeActivitiesAccident } from '../../../utils'
import { isHealthInsured } from '../../../utils/isHealthInsured'

// Details of the accident
export const accidentDetailsSubSection = buildSubSection({
  id: 'accidentDetails.section',
  title: accidentDetails.general.sectionTitle,
  children: [
    buildMultiField({
      id: 'accidentDetails',
      title: accidentDetails.general.sectionTitle,
      description: accidentDetails.general.description,
      children: [
        buildCustomField({
          id: 'accidentDetails.dateOfAccident',
          title: accidentDetails.labels.date,
          component: 'DateOfAccident',
          width: 'half',
        }),
        buildTextField({
          id: 'accidentDetails.timeOfAccident',
          title: accidentDetails.labels.time,
          placeholder: accidentDetails.placeholder.time,
          backgroundColor: 'blue',
          required: true,
          width: 'half',
          format: '##:##',
        }),
        buildAlertMessageField({
          id: 'accidentDetails.moreThanAYearAlertMessage',
          title: accidentDetails.general.moreThanAYearAlertTitle,
          message: accidentDetails.general.moreThanAYearAlertMessage,
          width: 'full',
          alertType: 'warning',
          condition: (formValue) => isDateOlderThanAYear(formValue),
          marginBottom: 0,
        }),
        buildAlertMessageField({
          id: 'accidentDetails.notHealthInsuredAlertMessage',
          title: accidentDetails.general.insuranceAlertTitle,
          message: accidentDetails.general.insuranceAlertText,
          width: 'full',
          alertType: 'warning',
          condition: (formValue) =>
            !isHealthInsured(formValue) && isHomeActivitiesAccident(formValue),
          marginBottom: 0,
        }),
        buildTextField({
          id: 'accidentDetails.descriptionOfAccident',
          title: accidentDetails.labels.description,
          placeholder: accidentDetails.placeholder.description,
          backgroundColor: 'blue',
          required: true,
          rows: 10,
          variant: 'textarea',
          maxLength: 2000,
        }),
        buildTextField({
          id: 'accidentDetails.accidentSymptoms',
          title: accidentDetails.labels.symptoms,
          placeholder: accidentDetails.placeholder.symptoms,
          backgroundColor: 'blue',
          required: true,
          rows: 10,
          variant: 'textarea',
          maxLength: 2000,
        }),
        buildDescriptionField({
          id: 'accidentDetails.descriptionField',
          space: 'containerGutter',
          titleVariant: 'h5',
          title: accidentDetails.labels.doctorVisit,
          width: 'full',
        }),
        buildCustomField({
          id: 'accidentDetails.dateOfDoctorVisit',
          title: accidentDetails.labels.date,
          component: 'DateOfAccident',
          width: 'half',
        }),
        buildTextField({
          id: 'accidentDetails.timeOfDoctorVisit',
          title: accidentDetails.labels.time,
          placeholder: accidentDetails.placeholder.doctorVisitTime,
          backgroundColor: 'blue',
          width: 'half',
          format: '##:##',
        }),
      ],
    }),
  ],
})
