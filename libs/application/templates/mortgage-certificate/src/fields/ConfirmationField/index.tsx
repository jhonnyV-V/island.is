import {
  AlertMessage,
  Button,
  TopicCard,
  Link,
  LinkContext,
  Text,
  Divider,
  PdfViewer,
} from '@island.is/island-ui/core'

import React, { FC, useState } from 'react'
import { useLocale } from '@island.is/localization'
import { formatText } from '@island.is/application/core'
import { FieldBaseProps } from '@island.is/application/types'
import { Box } from '@island.is/island-ui/core'
import { m } from '../../lib/messagess'
import * as styles from './ConfirmationField.css'
import { Bus } from '../../assets'

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
            {formatText(m.openMySites, application, formatMessage)}
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
            href={`data:application/pdf;base64,${externalData.getMortgageCertificate.data.contentBase64}`}
            download="vedbokavottord.pdf"
            className={styles.linkWithoutDecorations}
          >
            <Button icon="download" iconType="outline" variant="text">
              {formatText(
                m.downloadMortgageCertificate,
                application,
                formatMessage,
              )}
            </Button>
          </a>
        </Box>

        <PdfViewer
          file={`data:application/pdf;base64,${externalData.getMortgageCertificate.data.contentBase64}`}
        />
        {renderFooter()}
      </>
    )
  }

  return (
    <>
      <Text variant="h2" marginBottom={4}>
        {formatText(m.confirmation, application, formatMessage)}
      </Text>
      <Box marginBottom={3} paddingTop={0}>
        <AlertMessage
          type="success"
          title={formatText(m.successTitle, application, formatMessage)}
          message={
            <Box component="span" display="block">
              <Text variant="small">
                {formatText(m.successDescription, application, formatMessage)}
              </Text>
            </Box>
          }
        />
      </Box>
      <Box
        marginBottom={3}
        marginTop={0}
        background="blue100"
        padding={4}
        display="flex"
      >
        <LinkContext.Provider
          value={{
            linkRenderer: (href, children) => (
              <a
                style={{
                  color: '#0061ff',
                  textDecoration: 'none',
                  boxShadow: 'inset 0 -1px 0 0 currentColor',
                  paddingBottom: 4,
                }}
                href={href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {children}
              </a>
            ),
          }}
        >
          <Text variant="small">
            {formatText(m.verificationDescription, application, formatMessage)}{' '}
            <Link
              href={formatText(
                m.verificationLinkUrl,
                application,
                formatMessage,
              )}
              color="blue400"
              underline="normal"
              underlineVisibility="always"
            >
              {formatText(m.verificationLinkTitle, application, formatMessage)}
            </Link>
          </Text>
        </LinkContext.Provider>
      </Box>

      <Box marginBottom={3}>
        <TopicCard
          href="/"
          onClick={() => setViewMortgageCertificate(true)}
          tag="Pdf"
          colorScheme="blue"
        >
          {formatText(m.mortgageCertificate, application, formatMessage)}
        </TopicCard>
      </Box>

      <Button
        icon="open"
        iconType="outline"
        onClick={() => {
          window.open(
            formatText(
              m.mortgageCertificateInboxLink,
              application,
              formatMessage,
            ),
            '_blank',
          )
        }}
        variant="text"
      >
        {formatText(m.mortgageCertificateInboxText, application, formatMessage)}
      </Button>

      <Box
        display="flex"
        justifyContent="center"
        marginTop={2}
        marginBottom={4}
      >
        <Bus />
      </Box>

      {renderFooter()}
    </>
  )
}
