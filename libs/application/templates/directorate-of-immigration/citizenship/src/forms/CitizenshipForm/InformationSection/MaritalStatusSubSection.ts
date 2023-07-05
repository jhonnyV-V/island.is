import {
  buildMultiField,
  buildTextField,
  buildSubSection,
  buildDescriptionField,
  getValueViaPath,
} from '@island.is/application/core'
import { information } from '../../../lib/messages'
import { Application } from '@island.is/api/schema'
import { Answer } from '@island.is/application/types'
import { Citizenship } from '../../../lib/dataSchema'
import { CitizenIndividual, SpouseIndividual } from '../../../shared'
import { ResidenceCondition } from '@island.is/clients/directorate-of-immigration/citizenship'
import { formatDate } from '../../../utils'

export const MaritalStatusSubSection = buildSubSection({
  id: 'maritalStatus',
  title: information.labels.maritalStatus.subSectionTitle,
  children: [
    buildMultiField({
      id: 'maritalStatusMultiField',
      title: information.labels.maritalStatus.pageTitle,
      condition: (_, externalData) => {
        const residenceConditions = getValueViaPath(
          externalData,
          'residenceConditions.data',
          [],
        ) as ResidenceCondition[]

        const individual = getValueViaPath(
          externalData,
          'individual.data',
          undefined,
        ) as CitizenIndividual | undefined

        const spouseDetails = getValueViaPath(
          externalData,
          'spouseDetails.data',
          undefined,
        ) as SpouseIndividual | undefined

        const hasMaritalStatus =
          residenceConditions.filter((x) => x.isTypeMaritalStatus).length > 0

        let hasDifferentAddress = false
        if (hasMaritalStatus && spouseDetails) {
          const myAddressCombination = `${individual?.address?.streetAddress}, ${individual?.address?.postalCode} ${individual?.address?.city}`
          const mySpouseAddressCombination = `${spouseDetails?.spouse?.address?.streetAddress}, ${spouseDetails?.spouse?.address?.postalCode} ${spouseDetails?.spouse?.address?.city}`
          hasDifferentAddress =
            myAddressCombination !== mySpouseAddressCombination
        }

        //Only show if individual has an option of marriageType in Hjúskapaskylirði and if the individual does not have the same legal address as the spouse
        return hasMaritalStatus && hasDifferentAddress
      },
      children: [
        buildDescriptionField({
          id: 'maritalStatus.title',
          title: information.labels.maritalStatus.titleStatus,
          titleVariant: 'h5',
        }),
        buildTextField({
          id: 'maritalStatus.status',
          title: information.labels.maritalStatus.status,
          backgroundColor: 'white',
          width: 'half',
          readOnly: true,
          defaultValue: (application: Application) => {
            const individual = getValueViaPath(
              application.externalData,
              'individual.data',
              undefined,
            ) as CitizenIndividual | undefined

            return individual?.maritalTitle?.description
          },
        }),
        buildTextField({
          id: 'maritalStatus.dateOfMarritalStatus',
          title: information.labels.maritalStatus.marritalStatusDate,
          backgroundColor: 'white',
          width: 'half',
          readOnly: true,
          defaultValue: (application: Application) =>
            formatDate(
              application.externalData?.spouseDetails?.data?.lastModified,
            ),
        }),
        buildTextField({
          id: 'maritalStatus.nationalId',
          title: information.labels.maritalStatus.nationalId,
          backgroundColor: 'white',
          width: 'half',
          readOnly: true,
          format: '######-####',
          required: true,
          defaultValue: (application: Application) => {
            const spouseDetails = getValueViaPath(
              application.externalData,
              'spouseDetails.data',
              undefined,
            ) as SpouseIndividual | undefined

            return spouseDetails?.nationalId
          },
        }),
        buildTextField({
          id: 'maritalStatus.name',
          title: information.labels.maritalStatus.name,
          backgroundColor: 'white',
          width: 'half',
          readOnly: true,
          defaultValue: (application: Application) => {
            const spouseDetails = getValueViaPath(
              application.externalData,
              'spouseDetails.data',
              undefined,
            ) as SpouseIndividual | undefined

            return spouseDetails?.name
          },
        }),
        buildTextField({
          id: 'maritalStatus.birthCountry',
          title: information.labels.maritalStatus.spouseBirthCountry,
          backgroundColor: 'white',
          width: 'half',
          readOnly: true,
          defaultValue: (application: Application) => {
            const spouseDetails = getValueViaPath(
              application.externalData,
              'spouseDetails.data',
              undefined,
            ) as SpouseIndividual | undefined

            return spouseDetails?.spouseBirthplace?.location
          },
        }),
        buildTextField({
          id: 'maritalStatus.citizenship',
          title: information.labels.maritalStatus.spouseCitizenship,
          backgroundColor: 'white',
          width: 'half',
          readOnly: true,
          defaultValue: (application: Application) => {
            const spouseDetails = getValueViaPath(
              application.externalData,
              'spouseDetails.data',
              undefined,
            ) as SpouseIndividual | undefined

            return spouseDetails?.spouse?.citizenship?.name
          },
        }),
        buildTextField({
          id: 'maritalStatus.applicantAddress',
          title: information.labels.maritalStatus.applicantAddress,
          backgroundColor: 'white',
          width: 'half',
          readOnly: true,
          defaultValue: (application: Application) => {
            const individual = getValueViaPath(
              application.externalData,
              'individual.data',
              undefined,
            ) as CitizenIndividual | undefined

            return `${individual?.address?.streetAddress}, ${individual?.address?.postalCode} ${individual?.address?.city}`
          },
          condition: (_, externalData: any) => {
            const individual = getValueViaPath(
              externalData,
              'individual.data',
              undefined,
            ) as CitizenIndividual | undefined

            const spouseDetails = getValueViaPath(
              externalData,
              'spouseDetails.data',
              undefined,
            ) as SpouseIndividual | undefined

            const myAddressCombination = `${individual?.address?.streetAddress}, ${individual?.address?.postalCode} ${individual?.address?.city}`
            const mySpouseAddressCombination = `${spouseDetails?.spouse?.address?.streetAddress}, ${spouseDetails?.spouse?.address?.postalCode} ${spouseDetails?.spouse?.address?.city}`
            return myAddressCombination !== mySpouseAddressCombination
          },
        }),
        buildTextField({
          id: 'maritalStatus.spouseAddress',
          title: information.labels.maritalStatus.spouseAddress,
          backgroundColor: 'white',
          width: 'half',
          readOnly: true,
          defaultValue: (application: Application) => {
            const spouseDetails = getValueViaPath(
              application.externalData,
              'spouseDetails.data',
              undefined,
            ) as SpouseIndividual | undefined

            return `${spouseDetails?.spouse?.address?.streetAddress}, ${spouseDetails?.spouse?.address?.postalCode} ${spouseDetails?.spouse?.address?.city}`
          },
          condition: (_, externalData: any) => {
            const individual = getValueViaPath(
              externalData,
              'individual.data',
              undefined,
            ) as CitizenIndividual | undefined

            const spouseDetails = getValueViaPath(
              externalData,
              'spouseDetails.data',
              undefined,
            ) as SpouseIndividual | undefined

            const myAddressCombination = `${individual?.address?.streetAddress}, ${individual?.address?.postalCode} ${individual?.address?.city}`
            const mySpouseAddressCombination = `${spouseDetails?.spouse?.address?.streetAddress}, ${spouseDetails?.spouse?.address?.postalCode} ${spouseDetails?.spouse?.address?.city}`
            return myAddressCombination !== mySpouseAddressCombination
          },
        }),
        buildDescriptionField({
          id: 'maritalStatus.explanationTitle',
          title: information.labels.maritalStatus.explanationTitle,
          titleVariant: 'h5',
          space: 'gutter',
          condition: (_, externalData: any) => {
            const individual = getValueViaPath(
              externalData,
              'individual.data',
              undefined,
            ) as CitizenIndividual | undefined

            const spouseDetails = getValueViaPath(
              externalData,
              'spouseDetails.data',
              undefined,
            ) as SpouseIndividual | undefined

            const myAddressCombination = `${individual?.address?.streetAddress}, ${individual?.address?.postalCode} ${individual?.address?.city}`
            const mySpouseAddressCombination = `${spouseDetails?.spouse?.address?.streetAddress}, ${spouseDetails?.spouse?.address?.postalCode} ${spouseDetails?.spouse?.address?.city}`
            return myAddressCombination !== mySpouseAddressCombination
          },
        }),
        buildTextField({
          id: 'maritalStatus.explanation',
          title: information.labels.maritalStatus.explanation,
          backgroundColor: 'blue',
          width: 'full',
          variant: 'textarea',
          condition: (_, externalData: any) => {
            const individual = getValueViaPath(
              externalData,
              'individual.data',
              undefined,
            ) as CitizenIndividual | undefined

            const spouseDetails = getValueViaPath(
              externalData,
              'spouseDetails.data',
              undefined,
            ) as SpouseIndividual | undefined

            const myAddressCombination = `${individual?.address?.streetAddress}, ${individual?.address?.postalCode} ${individual?.address?.city}`
            const mySpouseAddressCombination = `${spouseDetails?.spouse?.address?.streetAddress}, ${spouseDetails?.spouse?.address?.postalCode} ${spouseDetails?.spouse?.address?.city}`
            return myAddressCombination !== mySpouseAddressCombination
          },
        }),
      ],
    }),
  ],
})
