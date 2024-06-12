import {
  buildMultiField,
  buildCustomField,
  buildSubSection,
  buildAlertMessageField,
  buildDescriptionField,
  YES,
} from '@island.is/application/core'
import { m } from '../../lib/messages'
import { hasNoDrivingLicenseInOtherCountry } from '../../lib/utils'
import {
  hasHealthRemarks,
  needsHealthCertificateCondition,
} from '../../lib/utils/formUtils'
import { BE } from '../../lib/constants'

export const subSectionHealthDeclaration = buildSubSection({
  id: 'healthDeclaration',
  title: m.healthDeclarationSectionTitle,
  condition: hasNoDrivingLicenseInOtherCountry,
  children: [
    buildMultiField({
      id: 'overview',
      title: m.healthDeclarationMultiFieldTitle,
      space: 2,
      children: [
        buildCustomField({
          id: 'remarks',
          title: '',
          component: 'HealthRemarks',
          condition: (_, externalData) => hasHealthRemarks(externalData),
        }),
        buildCustomField(
          {
            id: 'healthDeclaration.usesContactGlasses',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            title: m.healthDeclarationMultiFieldSubTitle,
            label: m.healthDeclaration1,
          },
        ),
        buildCustomField(
          {
            id: 'healthDeclaration.hasReducedPeripheralVision',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration2,
          },
        ),
        buildCustomField(
          {
            id: 'healthDeclaration.hasEpilepsy',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration3,
          },
        ),
        buildCustomField(
          {
            id: 'healthDeclaration.hasHeartDisease',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration4,
          },
        ),
        buildCustomField(
          {
            id: 'healthDeclaration.hasMentalIllness',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration5,
          },
        ),
        buildCustomField(
          {
            id: 'healthDeclaration.usesMedicalDrugs',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration6,
          },
        ),
        buildCustomField(
          {
            id: 'healthDeclaration.isAlcoholic',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration7,
          },
        ),
        buildCustomField(
          {
            id: 'healthDeclaration.hasDiabetes',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration8,
          },
        ),
        buildCustomField(
          {
            id: 'healthDeclaration.isDisabled',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration9,
          },
        ),
        buildCustomField(
          {
            id: 'healthDeclaration.hasOtherDiseases',
            title: '',
            component: 'HealthDeclaration',
          },
          {
            label: m.healthDeclaration10,
          },
        ),
        buildAlertMessageField({
          id: 'healthDeclaration.contactGlassesMismatch',
          title: '',
          message: m.alertHealthDeclarationGlassesMismatch,
          alertType: 'warning',
          condition: (answers) =>
            answers.applicationFor !== BE &&
            (answers.healthDeclaration as any)?.contactGlassesMismatch,
        }),
        //TODO: Remove when RLS/SGS supports health certificate in BE license
        buildDescriptionField({
          id: 'healthDeclarationValidForBELicense',
          title: '',
        }),
        buildAlertMessageField({
          id: 'healthDeclaration.BE',
          title: '',
          message: m.beLicenseHealthDeclarationRequiresHealthCertificate,
          alertType: 'warning',
          condition: (answers, externalData) =>
            needsHealthCertificateCondition(YES)(answers, externalData),
        }),
      ],
    }),
  ],
})
