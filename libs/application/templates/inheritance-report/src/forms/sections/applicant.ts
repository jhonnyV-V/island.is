import {
  buildMultiField,
  buildSection,
  buildSelectField,
  buildTextField,
} from '@island.is/application/core'
import { UserProfile, Application } from '@island.is/api/schema'
import { format as formatNationalId } from 'kennitala'
import { removeCountryCode } from '@island.is/application/ui-components'
import { m } from '../../lib/messages'
import { RelationEnum } from '../../types'
import { PREPAID_INHERITANCE } from '../../lib/constants'

export const applicant = buildSection({
  id: 'applicantsInformation',
  title: m.applicantsInfo,
  children: [
    buildMultiField({
      id: 'applicant',
      title: m.applicantsInfo,
      description: m.applicantsInfoSubtitle,
      children: [
        buildTextField({
          id: 'applicant.nationalId',
          title: m.nationalId,
          readOnly: true,
          width: 'half',
          defaultValue: ({ externalData }: Application) => {
            return formatNationalId(
              externalData.nationalRegistry?.data.nationalId,
            )
          },
        }),
        buildTextField({
          id: 'applicant.name',
          title: m.name,
          readOnly: true,
          width: 'half',
          defaultValue: ({ externalData }: Application) => {
            return externalData.nationalRegistry?.data.fullName
          },
        }),
        buildTextField({
          id: 'applicant.address',
          title: m.address,
          readOnly: true,
          width: 'half',
          defaultValue: ({ externalData }: Application) => {
            return externalData.nationalRegistry?.data.address.streetAddress
          },
        }),
        buildTextField({
          id: 'applicant.phone',
          title: m.phone,
          width: 'half',
          required: true,
          format: '###-####',
          defaultValue: (application: Application) => {
            const phone =
              (
                application.externalData.userProfile?.data as {
                  mobilePhoneNumber?: string
                }
              )?.mobilePhoneNumber ?? ''

            return removeCountryCode(phone)
          },
        }),
        buildTextField({
          id: 'applicant.email',
          title: m.email,
          width: 'half',
          required: true,
          defaultValue: ({ externalData }: Application) => {
            const data = externalData.userProfile?.data as UserProfile
            return data?.email
          },
        }),
        buildSelectField({
          id: 'applicant.relation',
          title: m.relation,
          width: 'half',
          required: true,
          options: [
            { label: m.heir, value: RelationEnum.HEIR },
            { label: m.representative, value: RelationEnum.REPRESENTATIVE },
            { label: m.exchangeManager, value: RelationEnum.EXCHANGEMANAGER },
          ],
        }),
      ],
    }),
  ],
})
