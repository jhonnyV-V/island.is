import {
  FieldBaseProps,
  getErrorViaPath,
  getValueViaPath,
} from '@island.is/application/core'
import { Box, LoadingDots, Text } from '@island.is/island-ui/core'
import React, { FC, useState } from 'react'
import { FishingLicenseAlertMessage, ShipInformation, Tag } from '../components'
import {
  FishingLicense as FishingLicenseSchema,
  FishingLicenseCodeType,
  Ship,
} from '@island.is/api/schema'
import { useQuery } from '@apollo/client'
import { queryFishingLicense } from '../../graphql/queries'
import { RadioController } from '@island.is/shared/form-fields'
import { fishingLicense, shipSelection } from '../../lib/messages'
import { useLocale } from '@island.is/localization'
import { useFormContext } from 'react-hook-form'

export const FishingLicense: FC<FieldBaseProps> = ({
  application,
  field,
  errors,
}) => {
  const { formatMessage } = useLocale()
  const { register } = useFormContext()
  const [chargeType, setChargeType] = useState<string>('')

  const ships = getValueViaPath(
    application.externalData,
    'directoryOfFisheries.data.ships',
  ) as Ship[]
  const shipIndex = getValueViaPath(
    application.answers,
    'shipSelection.ship',
    '0',
  ) as string
  const registrationNumber = getValueViaPath(
    application.answers,
    'shipSelection.registrationNumber',
  ) as string

  const { data, loading } = useQuery(queryFishingLicense, {
    variables: {
      registrationNumber: parseInt(registrationNumber),
    },
  })

  const ship = ships[parseInt(shipIndex)]

  const handleOnSelect = (value: FishingLicenseCodeType) => {
    const selectedLicense = data?.fishingLicenses?.find(
      ({ fishingLicenseInfo }: FishingLicenseSchema) =>
        fishingLicenseInfo.code === value,
    ) as FishingLicenseSchema

    if (selectedLicense)
      setChargeType(selectedLicense.fishingLicenseInfo.chargeType)
  }
  return (
    <>
      <Box marginBottom={3}>
        <Box
          border="standard"
          borderRadius="large"
          padding={3}
          width="full"
          display="flex"
          justifyContent="spaceBetween"
        >
          <ShipInformation ship={ship} seaworthinessHasColor />
          <Box>
            <Tag variant="purple">
              {formatMessage(shipSelection.tags.noFishingLicensesFound)}
            </Tag>
          </Box>
        </Box>
      </Box>
      <Box>
        <Text variant="h4" marginBottom={3}>
          {formatMessage(fishingLicense.labels.radioButtonTitle)}
        </Text>
        {loading ? (
          <LoadingDots large color="gradient" />
        ) : (
          <>
            <RadioController
              id={`${field.id}.license`}
              largeButtons
              backgroundColor="blue"
              error={errors && getErrorViaPath(errors, field.id)}
              onSelect={(value) =>
                handleOnSelect(value as FishingLicenseCodeType)
              }
              options={data?.fishingLicenses
                ?.filter(({ answer }: FishingLicenseSchema) => answer)
                .map(({ fishingLicenseInfo }: FishingLicenseSchema) => {
                  return {
                    value: fishingLicenseInfo.code,
                    label:
                      fishingLicenseInfo.code === FishingLicenseCodeType.unknown
                        ? fishingLicenseInfo.name
                        : formatMessage(
                            fishingLicense.labels[fishingLicenseInfo.code],
                          ),
                    tooltip:
                      fishingLicenseInfo.code === FishingLicenseCodeType.unknown
                        ? ''
                        : formatMessage(
                            fishingLicense.tooltips[fishingLicenseInfo.code],
                          ),
                  }
                })}
            />
            {data?.fishingLicenses.map(
              ({
                fishingLicenseInfo,
                answer,
                reasons,
              }: FishingLicenseSchema) => {
                if (answer) return null
                if (reasons.length === 0) return null
                return (
                  <Box marginBottom={2} key={fishingLicenseInfo.code}>
                    <FishingLicenseAlertMessage
                      title={
                        fishingLicenseInfo.code ===
                        FishingLicenseCodeType.unknown
                          ? ''
                          : formatMessage(
                              fishingLicense.warningMessageTitle[
                                fishingLicenseInfo.code
                              ],
                            )
                      }
                      description={
                        fishingLicenseInfo.code ===
                        FishingLicenseCodeType.unknown
                          ? ''
                          : formatMessage(
                              fishingLicense.warningMessageDescription[
                                fishingLicenseInfo.code
                              ],
                            )
                      }
                      reasons={reasons}
                    />
                  </Box>
                )
              },
            )}
          </>
        )}
        <input
          type="hidden"
          ref={register({ required: true })}
          id={`${field.id}.chargeType`}
          name={`${field.id}.chargeType`}
          value={chargeType}
        />
      </Box>
    </>
  )
}
