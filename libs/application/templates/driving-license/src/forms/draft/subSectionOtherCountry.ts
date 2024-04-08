import {
  buildMultiField,
  buildCheckboxField,
  buildRadioField,
  buildSubSection,
  getValueViaPath,
} from '@island.is/application/core'
import { m } from '../../lib/messages'
import { NO, YES, B_TEMP } from '../../lib/constants'
import { isApplicationForCondition } from '../../lib/utils'

export const subSectionOtherCountry = buildSubSection({
  id: 'otherCountry',
  title: m.foreignDrivingLicense,
  condition: isApplicationForCondition(B_TEMP),
  children: [
    buildMultiField({
      id: 'info',
      title: m.foreignDrivingLicense,
      description: m.drivingLicenseInOtherCountry,
      children: [
        buildRadioField({
          id: 'otherCountry.drivingLicenseInOtherCountry',
          backgroundColor: 'white',
          title: '',
          width: 'half',
          largeButtons: true,
          options: [
            {
              label: m.no,
              value: NO,
            },
            {
              label: m.yes,
              value: YES,
            },
          ],
        }),
        buildCheckboxField({
          id: 'otherCountry.drivingLicenseDeprivedOrRestrictedInOtherCountry',
          backgroundColor: 'white',
          title: '',
          condition: (answers) =>
            getValueViaPath(
              answers,
              'otherCountry.drivingLicenseInOtherCountry',
            ) === YES,
          options: [
            {
              value: NO,
              label: m.noDeprivedDrivingLicenseInOtherCountryTitle,
              subLabel:
                m.noDeprivedDrivingLicenseInOtherCountryDescription
                  .defaultMessage,
            },
          ],
        }),
      ],
    }),
  ],
})
