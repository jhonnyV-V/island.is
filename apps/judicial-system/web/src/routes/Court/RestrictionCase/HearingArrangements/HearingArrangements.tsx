import React, { useCallback, useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import router from 'next/router'

import { AlertMessage, Box, Text } from '@island.is/island-ui/core'
import * as constants from '@island.is/judicial-system/consts'
import { errors, titles } from '@island.is/judicial-system-web/messages'
import {
  CourtArrangements,
  CourtCaseInfo,
  DefenderInfo,
  FormContentContainer,
  FormContext,
  FormFooter,
  Modal,
  PageHeader,
  PageLayout,
  useCourtArrangements,
} from '@island.is/judicial-system-web/src/components'
import {
  CaseCustodyRestrictions,
  CaseType,
  NotificationType,
} from '@island.is/judicial-system-web/src/graphql/schema'
import type { stepValidationsType } from '@island.is/judicial-system-web/src/utils/formHelper'
import {
  useCase,
  useOnceOn,
} from '@island.is/judicial-system-web/src/utils/hooks'
import { hasSentNotification } from '@island.is/judicial-system-web/src/utils/stepHelper'
import { isCourtHearingArrangemenstStepValidRC } from '@island.is/judicial-system-web/src/utils/validate'

import { rcHearingArrangements as m } from './HearingArrangements.strings'

export const HearingArrangements: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const {
    workingCase,
    setWorkingCase,
    isLoadingWorkingCase,
    caseNotFound,
    isCaseUpToDate,
  } = useContext(FormContext)

  const [navigateTo, setNavigateTo] = useState<keyof stepValidationsType>()

  const {
    setAndSendCaseToServer,
    sendNotification,
    isSendingNotification,
    sendNotificationError,
  } = useCase()
  const { formatMessage } = useIntl()
  const {
    courtDate,
    courtDateHasChanged,
    handleCourtDateChange,
    handleCourtRoomChange,
    sendCourtDateToServer,
  } = useCourtArrangements(workingCase, setWorkingCase, 'arraignmentDate')

  const initialize = useCallback(() => {
    if (!workingCase.arraignmentDate?.date && workingCase.requestedCourtDate) {
      handleCourtDateChange(new Date(workingCase.requestedCourtDate))
    }

    setAndSendCaseToServer(
      [
        // validToDate, isolationToDate and isCustodyIsolation are autofilled here
        // so they are ready for conclusion autofill later
        {
          validToDate: workingCase.requestedValidToDate,
          isolationToDate:
            workingCase.type === CaseType.CUSTODY ||
            workingCase.type === CaseType.ADMISSION_TO_FACILITY
              ? workingCase.requestedValidToDate
              : undefined,
          isCustodyIsolation:
            workingCase.type === CaseType.CUSTODY ||
            workingCase.type === CaseType.ADMISSION_TO_FACILITY
              ? workingCase.requestedCustodyRestrictions &&
                workingCase.requestedCustodyRestrictions.includes(
                  CaseCustodyRestrictions.ISOLATION,
                )
                ? true
                : false
              : undefined,
        },
      ],
      workingCase,
      setWorkingCase,
    )
  }, [
    handleCourtDateChange,
    setAndSendCaseToServer,
    setWorkingCase,
    workingCase,
  ])

  useOnceOn(isCaseUpToDate, initialize)

  const handleNavigationTo = useCallback(
    async (destination: keyof stepValidationsType) => {
      await sendCourtDateToServer()

      const isCorrectingRuling = workingCase.notifications?.some(
        (notification) => notification.type === NotificationType.RULING,
      )

      if (
        isCorrectingRuling ||
        (hasSentNotification(
          NotificationType.COURT_DATE,
          workingCase.notifications,
        ).hasSent &&
          !courtDateHasChanged)
      ) {
        router.push(`${destination}/${workingCase.id}`)
      } else {
        setNavigateTo(constants.RESTRICTION_CASE_RULING_ROUTE)
      }
    },
    [
      sendCourtDateToServer,
      workingCase.notifications,
      workingCase.id,
      courtDateHasChanged,
    ],
  )

  const stepIsValid = isCourtHearingArrangemenstStepValidRC(
    workingCase,
    courtDate?.date,
  )

  const isCorrectingRuling = workingCase.notifications?.some(
    (notification) => notification.type === NotificationType.RULING,
  )

  return (
    <PageLayout
      workingCase={workingCase}
      isLoading={isLoadingWorkingCase}
      notFound={caseNotFound}
      onNavigationTo={handleNavigationTo}
      isValid={stepIsValid}
    >
      <PageHeader
        title={formatMessage(titles.court.restrictionCases.hearingArrangements)}
      />
      <FormContentContainer>
        {workingCase.comments && (
          <Box marginBottom={5}>
            <AlertMessage
              type="warning"
              title={formatMessage(m.comments.title)}
              message={workingCase.comments}
            />
          </Box>
        )}
        <Box marginBottom={7}>
          <Text as="h1" variant="h1">
            {formatMessage(m.title)}
          </Text>
        </Box>
        <CourtCaseInfo workingCase={workingCase} />
        <Box component="section" marginBottom={8}>
          <Box marginBottom={2}>
            <Text as="h3" variant="h3">
              {formatMessage(m.sections.requestedCourtDate.title)}
            </Text>
          </Box>
          <Box marginBottom={3}>
            <CourtArrangements
              handleCourtDateChange={handleCourtDateChange}
              handleCourtRoomChange={handleCourtRoomChange}
              courtDate={courtDate}
              courtRoomDisabled={isCorrectingRuling}
              dateTimeDisabled={isCorrectingRuling}
            />
          </Box>
        </Box>
        <Box component="section" marginBottom={8}>
          <DefenderInfo
            workingCase={workingCase}
            setWorkingCase={setWorkingCase}
          />
        </Box>
      </FormContentContainer>
      <FormContentContainer isFooter>
        <FormFooter
          nextButtonIcon="arrowForward"
          previousUrl={`${constants.RESTRICTION_CASE_COURT_OVERVIEW_ROUTE}/${workingCase.id}`}
          onNextButtonClick={() =>
            handleNavigationTo(constants.RESTRICTION_CASE_RULING_ROUTE)
          }
          nextButtonText={formatMessage(m.continueButton.label)}
          nextIsDisabled={!stepIsValid}
        />
      </FormContentContainer>
      {navigateTo !== undefined && (
        <Modal
          title={formatMessage(
            workingCase.type === CaseType.CUSTODY ||
              workingCase.type === CaseType.ADMISSION_TO_FACILITY
              ? m.modal.custodyCases.heading
              : m.modal.travelBanCases.heading,
          )}
          text={formatMessage(
            workingCase.type === CaseType.CUSTODY ||
              workingCase.type === CaseType.ADMISSION_TO_FACILITY
              ? m.modal.custodyCases.text
              : m.modal.travelBanCases.text,
            {
              courtDateHasChanged,
            },
          )}
          isPrimaryButtonLoading={isSendingNotification}
          onSecondaryButtonClick={() => {
            sendNotification(workingCase.id, NotificationType.COURT_DATE, true)

            router.push(`${navigateTo}/${workingCase.id}`)
          }}
          onPrimaryButtonClick={async () => {
            const notificationSent = await sendNotification(
              workingCase.id,
              NotificationType.COURT_DATE,
            )

            if (notificationSent) {
              router.push(`${navigateTo}/${workingCase.id}`)
            }
          }}
          primaryButtonText={formatMessage(m.modal.shared.primaryButtonText)}
          secondaryButtonText={formatMessage(
            m.modal.shared.secondaryButtonText,
            {
              courtDateHasChanged,
            },
          )}
          errorMessage={
            sendNotificationError
              ? formatMessage(errors.sendNotification)
              : undefined
          }
        />
      )}
    </PageLayout>
  )
}

export default HearingArrangements
