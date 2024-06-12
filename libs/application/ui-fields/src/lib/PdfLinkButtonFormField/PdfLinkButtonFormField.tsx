import { formatText } from '@island.is/application/core'
import {
  FieldBaseProps,
  PdfLinkButtonField,
} from '@island.is/application/types'
import {
  Box,
  Button,
  Link,
  LinkContext,
  PdfViewer,
  Text,
  TopicCard,
} from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { FC, useState } from 'react'
import { conclusionMessages } from '@island.is/application/ui-forms'
import * as styles from './PdfLinkButtonFormField.css'

interface Props extends FieldBaseProps {
  field: PdfLinkButtonField
}

export const PdfLinkButtonFormField: FC<React.PropsWithChildren<Props>> = ({
  application,
  field,
}) => {
  const { lang, formatMessage } = useLocale()

  const files = field.getPdfFiles && field.getPdfFiles(application)

  const [fileToView, setFileToView] = useState<
    | {
        base64: string
        filename: string
      }
    | undefined
  >(undefined)

  if (!files || files.length === 0) return undefined

  if (fileToView) {
    return (
      <>
        <Box
          display="flex"
          marginBottom={5}
          justifyContent="spaceBetween"
          alignItems="center"
        >
          <Button
            circle
            icon="arrowBack"
            onClick={() => {
              setFileToView(undefined)
            }}
            colorScheme="light"
            title="Go back"
          />
          <a
            href={`data:application/pdf;base64,${fileToView.base64}`}
            download={fileToView.filename}
            className={styles.linkWithoutDecorations}
          >
            <Button icon="download" iconType="outline" variant="text">
              {formatText(
                conclusionMessages.pdfLinkButtonField.downloadButtonTitle,
                application,
                formatMessage,
              )}
            </Button>
          </a>
        </Box>

        <PdfViewer file={`data:application/pdf;base64,${fileToView.base64}`} />
      </>
    )
  }

  return (
    <>
      {files.map((file) => (
        <Box marginBottom={2}>
          <TopicCard
            onClick={() => {
              field.setViewPdfFile &&
                field.setViewPdfFile({
                  base64: file.base64,
                  filename: file.filename,
                })
              !field.setViewPdfFile &&
                field.viewPdfFile &&
                setFileToView({
                  base64: file.base64,
                  filename: file.filename,
                })
            }}
            tag="PDF"
            colorScheme="blue"
          >
            {file.buttonText &&
              formatText(file.buttonText, application, formatMessage)}
            {file.customButtonText &&
              (lang === 'is'
                ? file.customButtonText.is
                : file.customButtonText.en)}
          </TopicCard>
        </Box>
      ))}
      <Box background="blue100" padding={4} display="flex">
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
            {formatText(
              field.verificationDescription,
              application,
              formatMessage,
            )}{' '}
            <Link
              href={formatText(
                field.verificationLinkUrl,
                application,
                formatMessage,
              )}
              color="blue400"
              underline="normal"
              underlineVisibility="always"
            >
              {formatText(
                field.verificationLinkTitle,
                application,
                formatMessage,
              )}
            </Link>
          </Text>
        </LinkContext.Provider>
      </Box>
    </>
  )
}
