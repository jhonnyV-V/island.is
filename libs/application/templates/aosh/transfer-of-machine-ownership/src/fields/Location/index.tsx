import { getValueViaPath } from '@island.is/application/core'
import { FieldBaseProps } from '@island.is/application/types'
import {
  Box,
  Button,
  Divider,
  GridColumn,
  GridRow,
  Text,
} from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { FC, useState } from 'react'
import { review, error, location } from '../../lib/messages'
import { InputController } from '@island.is/shared/form-fields'
import { MachineLocation, ReviewScreenProps } from '../../shared'
import { useFormContext } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { UPDATE_APPLICATION } from '@island.is/application/graphql'

export const Location: FC<
  React.PropsWithChildren<FieldBaseProps & ReviewScreenProps>
> = ({ application, setLocation, setStep }) => {
  const { locale, formatMessage } = useLocale()
  const { setValue } = useFormContext()
  const [updateApplication] = useMutation(UPDATE_APPLICATION)

  const savedSelectedValue = getValueViaPath(
    application.answers,
    'location',
    undefined,
  ) as MachineLocation | undefined

  const [selectedValue, setSelectedValue] = useState<MachineLocation>({
    address: savedSelectedValue?.address || '',
    postCode: savedSelectedValue?.postCode || 0,
    moreInfo: savedSelectedValue?.moreInfo || '',
  })
  const [, setErrorMessage] = useState<string | undefined>(undefined)

  const onBackButtonClick = () => {
    setErrorMessage(undefined)
    setStep && setStep('overview')
  }

  const onForwardButtonClick = async () => {
    if (selectedValue && setLocation) {
      setValue('location.address', selectedValue.address)
      setValue('location.postCode', selectedValue.postCode)
      setValue('location.moreInfo', selectedValue.moreInfo)
      const res = await updateApplication({
        variables: {
          input: {
            id: application.id,
            answers: {
              location: {
                address: selectedValue.address,
                postCode: selectedValue.postCode,
                moreInfo: selectedValue.moreInfo,
              },
            },
          },
          locale,
        },
      })
      if (!res.data) {
        setErrorMessage(formatMessage(error.couldNotUpdateApplication))
      } else {
        setLocation(selectedValue)
        setErrorMessage(undefined)
        setStep && setStep('overview')
      }
    }
  }

  return (
    <Box>
      <Text marginBottom={1} variant="h2">
        {formatMessage(location.general.title)}
      </Text>
      <Text marginBottom={5}>
        {formatMessage(location.general.description)}
      </Text>
      <Text variant="h5">{formatMessage(location.labels.addressTitle)}</Text>
      <GridRow>
        <GridColumn span={['1/1', '1/1', '1/2']} paddingTop={2}>
          <InputController
            id="address"
            name="address"
            type="text"
            label={formatMessage(location.labels.addressLabel)}
            backgroundColor="blue"
            required
            onChange={(event) => {
              setSelectedValue({
                ...selectedValue,
                address: event.target.value,
              })
            }}
            defaultValue={selectedValue.address}
          />
        </GridColumn>
        <GridColumn span={['1/1', '1/1', '1/2']} paddingTop={2}>
          <InputController
            id="postcode"
            name="postcode"
            type="text"
            format="###"
            label={formatMessage(location.labels.postCodeLabel)}
            backgroundColor="blue"
            required
            onChange={(event) => {
              setSelectedValue({
                ...selectedValue,
                postCode: parseInt(event.target.value),
              })
            }}
            defaultValue={
              selectedValue.postCode === 0
                ? ''
                : selectedValue.postCode?.toString()
            }
          />
        </GridColumn>
        <GridColumn span={['1/1', '1/1', '1/1']} paddingTop={2}>
          <InputController
            id="moreInfo"
            name="moreInfo"
            type="text"
            label={formatMessage(location.labels.moreInfoLabel)}
            backgroundColor="blue"
            onChange={(event) => {
              setSelectedValue({
                ...selectedValue,
                moreInfo: event.target.value,
              })
            }}
            defaultValue={selectedValue.moreInfo}
          />
        </GridColumn>
      </GridRow>
      <Box style={{ marginTop: '40vh' }}>
        <Divider />
        <Box display="flex" justifyContent="spaceBetween" paddingY={5}>
          <Button variant="ghost" onClick={onBackButtonClick}>
            {formatMessage(review.buttons.back)}
          </Button>
          <Button icon="arrowForward" onClick={onForwardButtonClick}>
            {formatMessage(location.labels.approveButton)}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
