import React, { FC, useState, useEffect } from 'react'
import { FieldBaseProps } from '@island.is/application/types'
import {
  Box,
  Text,
  AlertMessage,
  Button,
  Link,
} from '@island.is/island-ui/core'
import { SUBMIT_APPLICATION } from '@island.is/application/graphql'
import { MCEvents } from '../../lib/constants'
import { useMutation } from '@apollo/client'
import { PropertyDetail } from '@island.is/api/schema'
import { useLocale } from '@island.is/localization'
import { property } from '../../lib/messages'

export const PendingRejected: FC<React.PropsWithChildren<FieldBaseProps>> = ({
  application,
}) => {
  const { externalData } = application
  const { formatMessage } = useLocale()

  const [runEvent, setRunEvent] = useState<string | undefined>(undefined)

  const [submitApplication] = useMutation(SUBMIT_APPLICATION, {
    onError: (e) => console.error(e.message),
  })

  useEffect(() => {
    document.title = 'Beiðni um vinnslu'
  }, [])

  const handleStateChange = (newRunEvent: string) => {
    if (runEvent !== newRunEvent) {
      setRunEvent(newRunEvent)

      submitApplication({
        variables: {
          input: {
            id: application.id,
            event: newRunEvent,
            answers: application.answers,
          },
        },
      })
    }
  }

  const { hasSentRequest } = externalData.submitRequestToSyslumenn?.data as {
    hasSentRequest: boolean
  }

  if (hasSentRequest) {
    handleStateChange(MCEvents.PENDING_REJECTED_TRY_AGAIN)
  }

  const { propertyDetails } = externalData.validateMortgageCertificate
    ?.data as {
    propertyDetails: PropertyDetail
  }

  return (
    <Box>
      <Text variant="h2" marginBottom={4}>
        {formatMessage(property.general.pageTitle)}
      </Text>

      <Box
        borderRadius="standard"
        background={'blue100'}
        paddingX={2}
        paddingY={1}
        marginBottom={5}
      >
        <Text fontWeight="semiBold">
          {formatMessage(property.labels.selectedProperty)}
        </Text>
        <Text>
          {propertyDetails?.propertyNumber}
          {' - '}
          {propertyDetails?.defaultAddress?.display}
        </Text>
      </Box>
      <Box marginBottom={5}>
        <AlertMessage
          type="warning"
          title={formatMessage(property.labels.propertyErrorCertificateTitle)}
          message={formatMessage(
            property.labels.propertyErrorCertificateMessage,
          )}
        />
      </Box>
      <Box marginBottom={5}>
        <AlertMessage
          type="success"
          title={formatMessage(
            property.labels.propertyErrorCertificateSheriffTitle,
          )}
          message={formatMessage(
            property.labels.propertyErrorCertificateSheriffMessage,
          )}
        />
      </Box>
      <Box display="flex" justifyContent={'flexEnd'}>
        <Button
          variant="primary"
          icon="arrowForward"
          onClick={() => {
            window.open(
              formatMessage(property.labels.mortgageCertificateInboxLink),
              '_blank',
            )
          }}
        >
          {formatMessage(property.labels.mysites)}
        </Button>
      </Box>
    </Box>
  )
}
