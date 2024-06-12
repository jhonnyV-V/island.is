import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'

import {
  AlertMessage,
  Box,
  RadioButton,
  Text,
  toast,
} from '@island.is/island-ui/core'
import * as constants from '@island.is/judicial-system/consts'
import { core, errors, titles } from '@island.is/judicial-system-web/messages'
import {
  BlueBox,
  FormContentContainer,
  FormContext,
  FormFooter,
  IndictmentCaseFilesList,
  IndictmentsLawsBrokenAccordionItem,
  InfoCardActiveIndictment,
  InfoCardCaseScheduledIndictment,
  Modal,
  PageHeader,
  PageLayout,
  ProsecutorCaseInfo,
  SectionHeading,
  useIndictmentsLawsBroken,
  UserContext,
} from '@island.is/judicial-system-web/src/components'
import {
  CaseState,
  CaseTransition,
} from '@island.is/judicial-system-web/src/graphql/schema'
import { useCase } from '@island.is/judicial-system-web/src/utils/hooks'

import DenyIndictmentCaseModal from './DenyIndictmentCaseModal/DenyIndictmentCaseModal'
import { overview as strings } from './Overview.strings'
import * as styles from './Overview.css'

const Overview: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { workingCase, setWorkingCase, isLoadingWorkingCase, caseNotFound } =
    useContext(FormContext)
  const { user } = useContext(UserContext)
  const [modal, setModal] = useState<
    | 'noModal'
    | 'caseSubmitModal'
    | 'caseSentForConfirmationModal'
    | 'caseDeniedModal'
    | 'askForCancellationModal'
  >('noModal')
  const [indictmentConfirmationDecision, setIndictmentConfirmationDecision] =
    useState<'confirm' | 'deny'>()
  const router = useRouter()
  const { formatMessage } = useIntl()
  const { transitionCase, isTransitioningCase } = useCase()
  const lawsBroken = useIndictmentsLawsBroken(workingCase)

  const latestDate = workingCase.courtDate ?? workingCase.arraignmentDate

  const isIndictmentNew = workingCase.state === CaseState.DRAFT
  const isIndictmentSubmitted = workingCase.state === CaseState.SUBMITTED
  const isIndictmentWaitingForCancellation =
    workingCase.state === CaseState.WAITING_FOR_CANCELLATION
  const isIndictmentReceived =
    workingCase.state === CaseState.RECEIVED ||
    workingCase.state === CaseState.MAIN_HEARING

  const userCanSendIndictmentToCourt =
    Boolean(user?.canConfirmIndictment) &&
    workingCase.state === CaseState.WAITING_FOR_CONFIRMATION
  const userCanCancelIndictment =
    (workingCase.state === CaseState.SUBMITTED ||
      workingCase.state === CaseState.RECEIVED) &&
    !workingCase.indictmentDecision

  const handleTransition = async (transitionType: CaseTransition) => {
    const caseTransitioned = await transitionCase(
      workingCase.id,
      transitionType,
      setWorkingCase,
    )

    if (!caseTransitioned) {
      toast.error(formatMessage(errors.transitionCase))
      return false
    }

    return true
  }

  const handleNextButtonClick = async () => {
    let transitionType
    let modalType: typeof modal = 'noModal'

    if (userCanSendIndictmentToCourt) {
      if (indictmentConfirmationDecision === 'confirm') {
        modalType = 'caseSubmitModal'
      } else if (indictmentConfirmationDecision === 'deny') {
        modalType = 'caseDeniedModal'
      } else if (isIndictmentSubmitted) {
        transitionType = CaseTransition.ASK_FOR_CONFIRMATION
      }
    } else if (isIndictmentNew || isIndictmentSubmitted) {
      transitionType = CaseTransition.ASK_FOR_CONFIRMATION
      modalType = 'caseSentForConfirmationModal'
    } else if (workingCase.state === CaseState.WAITING_FOR_CONFIRMATION) {
      modalType = 'caseSentForConfirmationModal'
    }

    if (transitionType) {
      const transitionSuccess = await handleTransition(transitionType)

      if (!transitionSuccess) {
        return
      }
    }

    if (modalType !== 'noModal') {
      setModal(modalType)
    }
  }

  const handleConfirmIndictment = async () => {
    const transitionSuccess = await handleTransition(CaseTransition.SUBMIT)

    if (!transitionSuccess) {
      return
    }

    router.push(constants.CASES_ROUTE)
  }

  const handleAskForCancellation = async () => {
    const transitionSuccess = await handleTransition(
      CaseTransition.ASK_FOR_CANCELLATION,
    )

    if (!transitionSuccess) {
      return
    }

    router.push(constants.CASES_ROUTE)
  }

  return (
    <PageLayout
      workingCase={workingCase}
      isLoading={isLoadingWorkingCase}
      notFound={caseNotFound}
    >
      <PageHeader
        title={formatMessage(titles.prosecutor.indictments.overview)}
      />
      <FormContentContainer>
        {workingCase.indictmentDeniedExplanation && (
          <Box marginBottom={5}>
            <AlertMessage
              title={formatMessage(strings.indictmentDeniedExplanationTitle)}
              message={workingCase.indictmentDeniedExplanation}
              type="info"
            ></AlertMessage>
          </Box>
        )}
        {workingCase.indictmentReturnedExplanation && (
          <Box marginBottom={5}>
            <AlertMessage
              title={formatMessage(strings.indictmentReturnedExplanationTitle)}
              message={workingCase.indictmentReturnedExplanation}
              type="warning"
            ></AlertMessage>
          </Box>
        )}
        <Box marginBottom={7}>
          <Text as="h1" variant="h1">
            {formatMessage(strings.heading)}
          </Text>
        </Box>
        <ProsecutorCaseInfo workingCase={workingCase} />
        {workingCase.state === CaseState.RECEIVED &&
          workingCase.court &&
          latestDate?.date && (
            <Box component="section" marginBottom={5}>
              <InfoCardCaseScheduledIndictment
                court={workingCase.court}
                courtDate={latestDate.date}
                courtRoom={latestDate.location}
                postponedIndefinitelyExplanation={
                  workingCase.postponedIndefinitelyExplanation
                }
              />
            </Box>
          )}
        <Box component="section" marginBottom={5}>
          <InfoCardActiveIndictment />
        </Box>
        {lawsBroken.size > 0 && (
          <Box marginBottom={5}>
            <IndictmentsLawsBrokenAccordionItem workingCase={workingCase} />
          </Box>
        )}
        <Box marginBottom={userCanSendIndictmentToCourt ? 5 : 10}>
          <IndictmentCaseFilesList workingCase={workingCase} />
        </Box>
        {userCanSendIndictmentToCourt && (
          <Box marginBottom={10}>
            <SectionHeading
              title={formatMessage(strings.indictmentConfirmationTitle)}
              required
            />
            <BlueBox>
              <div className={styles.gridRowEqual}>
                <RadioButton
                  large
                  name="indictmentConfirmationRequest"
                  id="confirmIndictment"
                  backgroundColor="white"
                  label={formatMessage(strings.confirmIndictment)}
                  checked={indictmentConfirmationDecision === 'confirm'}
                  onChange={() => setIndictmentConfirmationDecision('confirm')}
                />
                <RadioButton
                  large
                  name="indictmentConfirmationRequest"
                  id="denyIndictment"
                  backgroundColor="white"
                  label={formatMessage(strings.denyIndictment)}
                  checked={indictmentConfirmationDecision === 'deny'}
                  onChange={() => setIndictmentConfirmationDecision('deny')}
                />
              </div>
            </BlueBox>
          </Box>
        )}
      </FormContentContainer>
      <FormContentContainer isFooter>
        <FormFooter
          nextButtonIcon="arrowForward"
          previousUrl={
            isIndictmentReceived || isIndictmentWaitingForCancellation
              ? constants.CASES_ROUTE
              : `${constants.INDICTMENTS_CASE_FILES_ROUTE}/${workingCase.id}`
          }
          nextButtonText={
            userCanSendIndictmentToCourt
              ? undefined
              : formatMessage(strings.nextButtonText, {
                  isNewIndictment: isIndictmentNew,
                })
          }
          hideNextButton={
            isIndictmentReceived || isIndictmentWaitingForCancellation
          }
          infoBoxText={
            isIndictmentReceived
              ? formatMessage(strings.indictmentSentToCourt)
              : undefined
          }
          onNextButtonClick={handleNextButtonClick}
          nextIsDisabled={
            userCanSendIndictmentToCourt && !indictmentConfirmationDecision
          }
          hideActionButton={isIndictmentWaitingForCancellation}
          actionButtonText={formatMessage(strings.askForCancellationButtonText)}
          actionButtonColorScheme="destructive"
          actionButtonIsDisabled={!userCanCancelIndictment}
          onActionButtonClick={() => setModal('askForCancellationModal')}
        />
      </FormContentContainer>
      <AnimatePresence>
        {modal === 'caseSubmitModal' ? (
          <Modal
            title={formatMessage(strings.caseSubmitModalTitle)}
            text={formatMessage(strings.caseSubmitModalText)}
            onClose={() => setModal('noModal')}
            secondaryButtonText={formatMessage(
              strings.caseSubmitSecondaryButtonText,
            )}
            onSecondaryButtonClick={() => setModal('noModal')}
            onPrimaryButtonClick={handleConfirmIndictment}
            primaryButtonText={formatMessage(
              strings.caseSubmitPrimaryButtonText,
            )}
            isPrimaryButtonLoading={isTransitioningCase}
          />
        ) : modal === 'caseSentForConfirmationModal' ? (
          <Modal
            title={formatMessage(strings.indictmentSentForConfirmationTitle)}
            text={formatMessage(strings.indictmentSentForConfirmationText)}
            onClose={() => router.push(constants.CASES_ROUTE)}
            onPrimaryButtonClick={() => {
              router.push(constants.CASES_ROUTE)
            }}
            primaryButtonText={formatMessage(core.closeModal)}
          />
        ) : modal === 'caseDeniedModal' ? (
          <DenyIndictmentCaseModal
            workingCase={workingCase}
            setWorkingCase={setWorkingCase}
            onClose={() => setModal('noModal')}
            onComplete={() => router.push(constants.CASES_ROUTE)}
          />
        ) : modal === 'askForCancellationModal' ? (
          <Modal
            title={formatMessage(strings.askForCancellationModalTitle)}
            text={formatMessage(strings.askForCancellationModalText)}
            onClose={() => setModal('noModal')}
            secondaryButtonText={formatMessage(
              strings.askForCancellationSecondaryButtonText,
            )}
            onSecondaryButtonClick={() => setModal('noModal')}
            onPrimaryButtonClick={handleAskForCancellation}
            primaryButtonText={formatMessage(
              strings.askForCancellationPrimaryButtonText,
            )}
            isPrimaryButtonLoading={isTransitioningCase}
          />
        ) : null}
      </AnimatePresence>
    </PageLayout>
  )
}

export default Overview
