import React, { useCallback, useContext, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useRouter } from 'next/router'

import { Box, Option, Select, Text } from '@island.is/island-ui/core'
import * as constants from '@island.is/judicial-system/consts'
import { formatDate } from '@island.is/judicial-system/formatters'
import { isCompletedCase } from '@island.is/judicial-system/types'
import { core, titles } from '@island.is/judicial-system-web/messages'
import {
  BlueBox,
  CourtCaseInfo,
  FormContentContainer,
  FormContext,
  FormFooter,
  IndictmentCaseFilesList,
  IndictmentsLawsBrokenAccordionItem,
  InfoCardClosedIndictment,
  Modal,
  PageHeader,
  PageLayout,
  PageTitle,
  SectionHeading,
  useIndictmentsLawsBroken,
  UserContext,
} from '@island.is/judicial-system-web/src/components'
import { useProsecutorSelectionUsersQuery } from '@island.is/judicial-system-web/src/components/ProsecutorSelection/prosecutorSelectionUsers.generated'
import { Defendant } from '@island.is/judicial-system-web/src/graphql/schema'
import {
  formatDateForServer,
  useCase,
  useDefendants,
} from '@island.is/judicial-system-web/src/utils/hooks'

import { strings } from './Overview.strings'
type VisibleModal = 'REVIEWER_ASSIGNED' | 'DEFENDANT_VIEWS_VERDICT'

export const Overview = () => {
  const router = useRouter()
  const { formatMessage: fm } = useIntl()
  const { user } = useContext(UserContext)
  const { updateCase } = useCase()
  const { workingCase, isLoadingWorkingCase, caseNotFound, setWorkingCase } =
    useContext(FormContext)
  const [selectedIndictmentReviewer, setSelectedIndictmentReviewer] =
    useState<Option<string> | null>()
  const [modalVisible, setModalVisible] = useState<VisibleModal>()
  const lawsBroken = useIndictmentsLawsBroken(workingCase)

  const displayReviewerChoices = workingCase.indictmentReviewer === null

  const [selectedDefendant, setSelectedDefendant] = useState<Defendant | null>()
  const { setAndSendDefendantToServer } = useDefendants()

  const assignReviewer = async () => {
    if (!selectedIndictmentReviewer) {
      return
    }
    const updatedCase = await updateCase(workingCase.id, {
      indictmentReviewerId: selectedIndictmentReviewer.value,
    })
    if (!updatedCase) {
      return
    }

    setModalVisible('REVIEWER_ASSIGNED')
  }

  const handleDefendantViewsVerdict = () => {
    if (!selectedDefendant) {
      return
    }

    const updatedDefendant = {
      caseId: workingCase.id,
      defendantId: selectedDefendant.id,
      verdictViewDate: formatDateForServer(new Date()),
    }

    setAndSendDefendantToServer(updatedDefendant, setWorkingCase)

    setModalVisible(undefined)
  }

  const handleNavigationTo = useCallback(
    (destination: string) => router.push(`${destination}/${workingCase.id}`),
    [router, workingCase.id],
  )

  const { data, loading } = useProsecutorSelectionUsersQuery({
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  })

  const publicProsecutors = useMemo(() => {
    if (!data?.users || !user) {
      return []
    }
    return data.users.reduce(
      (acc: { label: string; value: string }[], prosecutor) => {
        if (prosecutor.institution?.id === user?.institution?.id) {
          acc.push({
            label: prosecutor.name ?? '',
            value: prosecutor.id,
          })
        }
        return acc
      },
      [],
    )
  }, [data?.users, user])

  return (
    <PageLayout
      workingCase={workingCase}
      isLoading={isLoadingWorkingCase}
      notFound={caseNotFound}
      isValid={true}
      onNavigationTo={handleNavigationTo}
    >
      <PageHeader
        title={fm(titles.shared.closedCaseOverview, {
          courtCaseNumber: workingCase.courtCaseNumber,
        })}
      />
      <FormContentContainer>
        <PageTitle>{fm(strings.title)}</PageTitle>
        <CourtCaseInfo workingCase={workingCase} />
        <Box component="section" marginBottom={5}>
          <InfoCardClosedIndictment
            defendantInfoActionButton={
              isCompletedCase(workingCase.state) &&
              workingCase.indictmentReviewer !== null
                ? {
                    text: fm(strings.displayVerdict),
                    onClick: (defendant) => {
                      setSelectedDefendant(defendant)
                      setModalVisible('DEFENDANT_VIEWS_VERDICT')
                    },
                    icon: 'mailOpen',
                    isDisabled: (defendant) =>
                      defendant.verdictViewDate !== null,
                  }
                : undefined
            }
            displayAppealExpirationInfo={true}
          />
        </Box>
        {lawsBroken.size > 0 && (
          <Box marginBottom={5}>
            <IndictmentsLawsBrokenAccordionItem workingCase={workingCase} />
          </Box>
        )}
        {workingCase.caseFiles && (
          <Box component="section" marginBottom={5}>
            <IndictmentCaseFilesList workingCase={workingCase} />
          </Box>
        )}
        {displayReviewerChoices && (
          <Box marginBottom={5}>
            <SectionHeading
              title={fm(strings.reviewerTitle)}
              description={
                <Text variant="eyebrow">
                  {fm(strings.reviewerSubtitle, {
                    indictmentAppealDeadline: formatDate(
                      workingCase.indictmentAppealDeadline,
                      'P',
                    ),
                  })}
                </Text>
              }
            />
            <BlueBox>
              <Select
                name="reviewer"
                label={fm(strings.reviewerLabel)}
                placeholder={fm(strings.reviewerPlaceholder)}
                value={selectedIndictmentReviewer}
                options={publicProsecutors}
                onChange={(value) => {
                  setSelectedIndictmentReviewer(value as Option<string>)
                }}
                isDisabled={loading}
                required
              />
            </BlueBox>
          </Box>
        )}
      </FormContentContainer>

      {displayReviewerChoices && (
        <FormContentContainer isFooter>
          <FormFooter
            nextButtonIcon="arrowForward"
            previousUrl={`${constants.CASES_ROUTE}`}
            nextIsLoading={isLoadingWorkingCase}
            nextIsDisabled={!selectedIndictmentReviewer || isLoadingWorkingCase}
            onNextButtonClick={assignReviewer}
            nextButtonText={fm(core.continue)}
          />
        </FormContentContainer>
      )}

      {modalVisible === 'REVIEWER_ASSIGNED' && (
        <Modal
          title={fm(strings.reviewerAssignedModalTitle)}
          text={fm(strings.reviewerAssignedModalText, {
            caseNumber: workingCase.courtCaseNumber,
            reviewer: selectedIndictmentReviewer?.label,
          })}
          secondaryButtonText={fm(core.back)}
          onSecondaryButtonClick={() => router.push(constants.CASES_ROUTE)}
        />
      )}

      {modalVisible === 'DEFENDANT_VIEWS_VERDICT' && (
        <Modal
          title={fm(strings.defendantViewsVerdictModalTitle)}
          text={fm(strings.defendantViewsVerdictModalText)}
          primaryButtonText={fm(
            strings.defendantViewsVerdictModalPrimaryButtonText,
          )}
          onPrimaryButtonClick={() => handleDefendantViewsVerdict()}
          secondaryButtonText={fm(core.back)}
          onSecondaryButtonClick={() => setModalVisible(undefined)}
        />
      )}
    </PageLayout>
  )
}

export default Overview
