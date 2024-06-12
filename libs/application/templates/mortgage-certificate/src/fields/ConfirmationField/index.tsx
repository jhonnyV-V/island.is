import {
  AlertMessage,
  Button,
  TopicCard,
  Text,
  Divider,
} from '@island.is/island-ui/core'

import React, { FC, useState } from 'react'
import { useLocale } from '@island.is/localization'
import { formatText } from '@island.is/application/core'
import { FieldBaseProps } from '@island.is/application/types'
import { Box } from '@island.is/island-ui/core'
import * as styles from './ConfirmationField.css'
import { confirmation } from '../../lib/messages'

type ConfirmationFieldProps = {
  field: {
    props: {
      link?: {
        title: string
        url: string
      }
    }
  }
  application: {
    externalData: {
      getMortgageCertificate: {
        data: {
          contentBase64: string
        }
      }
    }
  }
}

export const ConfirmationField: FC<
  React.PropsWithChildren<FieldBaseProps & ConfirmationFieldProps>
> = ({ application }) => {
  const { externalData } = application
  const { formatMessage } = useLocale()
  const [viewMortgageCertificate, setViewMortgageCertificate] = useState(false)

  function renderFooter() {
    return (
      <>
        <Divider />
        <Box
          display="flex"
          justifyContent="flexEnd"
          paddingTop={4}
          marginBottom={4}
        >
          <Button
            icon="arrowForward"
            iconType="outline"
            onClick={() => {
              window.open(`${window.location.origin}/minarsidur`, '_blank')
            }}
          >
            {formatText(
              confirmation.labels.openMySites,
              application,
              formatMessage,
            )}
          </Button>
        </Box>
      </>
    )
  }

  if (viewMortgageCertificate) {
    return (
      <>
        <Box
          display="flex"
          marginBottom={2}
          justifyContent="spaceBetween"
          alignItems="center"
        >
          <Button
            circle
            icon="arrowBack"
            onClick={() => setViewMortgageCertificate(false)}
            colorScheme="light"
            title="Go back"
          />
          <a
            href={`data:application/pdf;base64,${
              externalData.getMortgageCertificate.data.contentBase64 ?? ''
            }`}
            download="vedbokavottord.pdf"
            className={styles.linkWithoutDecorations}
          >
            <Button icon="download" iconType="outline" variant="text">
              {formatText(
                confirmation.labels.downloadMortgageCertificate,
                application,
                formatMessage,
              )}
            </Button>
          </a>
        </Box>

        {/* <PdfViewer
          file={`data:application/pdf;base64,${
            externalData.getMortgageCertificate.data.contentBase64 ?? ''
          }`}
        /> */}
        {renderFooter()}
      </>
    )
  }

  return (
    <>
      {/* <Text variant="h2" marginBottom={4}>
        {formatText(
          confirmation.labels.confirmation,
          application,
          formatMessage,
        )}
      </Text> */}
      {/* <Box marginBottom={3} paddingTop={0}>
        <AlertMessage
          type="success"
          title={formatText(
            confirmation.labels.successTitle,
            application,
            formatMessage,
          )}
          message={
            <Box component="span" display="block">
              <Text variant="small">
                {formatText(
                  confirmation.labels.successDescription,
                  application,
                  formatMessage,
                )}
              </Text>
            </Box>
          }
        />
      </Box> */}

      <Box marginBottom={3}>
        <TopicCard
          // href="/"
          onClick={() => setViewMortgageCertificate(true)}
          tag="Pdf"
          colorScheme="blue"
        >
          {formatText(
            confirmation.labels.mortgageCertificate,
            application,
            formatMessage,
          )}
        </TopicCard>
      </Box>

      <Box display="flex" wrap="nowrap" paddingBottom={4}>
        <Text variant="h5">
          {formatMessage(confirmation.labels.mortgageCertificateInboxText)}
        </Text>

        <Box paddingLeft={1}>
          <Button
            icon="open"
            iconType="outline"
            onClick={() => {
              window.open(
                formatText(
                  confirmation.labels.mortgageCertificateInboxLink,
                  application,
                  formatMessage,
                ),
                '_blank',
              )
            }}
            variant="text"
          >
            {formatText(
              confirmation.labels.mortgageCertificateInboxLinkText,
              application,
              formatMessage,
            )}
          </Button>
        </Box>
      </Box>

      {/** Will only be visible if there are any incorrectPropertiesSent data */}
      <Box paddingBottom={3}>
        <AlertMessage
          title="Beiðni um lagfæringu á veðbókarvottorði fyir F20257866 - Meistaravellir 31, 01 0204 Reykjavík hefur verið send sýslumanni."
          message="Þú munt fá tilkynningu á netfangið [netfang] að yfirferð lokinni og getur þá reynt aftur og klárað umsóknina þína."
          type="info"
        />
      </Box>
    </>
  )
}
