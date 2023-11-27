import { useMutation } from '@apollo/client'
import { Application, DefaultEvents } from '@island.is/application/types'
import { SUBMIT_APPLICATION } from '@island.is/application/graphql'
import { Box, Button, Icon, ModalBase, Text } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { FC } from 'react'
import { overview } from '../../../lib/messages'
import * as styles from './RejectConfirmationModal.css'
import { getRejecter } from '../../../utils'

type RejectConfirmationModalProps = {
  visibility: boolean
  setVisibility: (visibility: boolean) => void
  application: Application
  refetch?: () => void
  reviewerNationalId?: string
}

export const RejectConfirmationModal: FC<
  React.PropsWithChildren<RejectConfirmationModalProps>
> = ({
  visibility,
  setVisibility,
  application,
  reviewerNationalId = '',
  refetch,
}) => {
  const { formatMessage } = useLocale()
  console.log('application', application)
  console.log('visibility', visibility)
  console.log('setVisibility', setVisibility)
  console.log(
    'getRejecter(reviewerNationalId, application.answers)',
    getRejecter(reviewerNationalId, application.answers),
  )
  const [submitApplication, { loading: loadingSubmit }] = useMutation(
    SUBMIT_APPLICATION,
    {
      onError: (e) => {
        console.error(e, e.message)
        return
      },
    },
  )

  const submitAndMoveToFinalReview = async () => {
    const res = await submitApplication({
      variables: {
        input: {
          id: application.id,
          event: DefaultEvents.REJECT,
          answers: {
            rejecter: getRejecter(reviewerNationalId, application.answers),
          },
        },
      },
    })

    if (res?.data) {
      // Takes them to the next state (which loads the relevant form)
      refetch?.()
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }
  return (
    <ModalBase
      baseId="confirmationModal"
      isVisible={visibility}
      className={`${styles.dialog} ${styles.background} ${styles.center}`}
      onVisibilityChange={(visibility) => setVisibility(visibility)}
    >
      <Box background="white" padding={10}>
        <Box
          className={styles.close}
          onClick={closeModal}
          role="button"
          aria-label="close button"
        >
          <Icon icon="close" size="large" />
        </Box>
        <Text variant="h1" marginBottom={2}>
          {formatMessage(overview.confirmationModal.title)}
        </Text>
        <Text variant="intro" marginBottom={7}>
          {formatMessage(overview.confirmationModal.text)}
        </Text>
        <Box display="flex" justifyContent="spaceBetween">
          <Button variant="ghost" onClick={closeModal}>
            {formatMessage(overview.confirmationModal.cancelButton)}
          </Button>
          <Button
            colorScheme="destructive"
            onClick={submitAndMoveToFinalReview}
            loading={loadingSubmit}
          >
            {formatMessage(overview.confirmationModal.buttonText)}
          </Button>
        </Box>
      </Box>
    </ModalBase>
  )
}
