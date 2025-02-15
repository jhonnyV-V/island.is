import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'

import { Box, Input } from '@island.is/island-ui/core'
import { formatDate } from '@island.is/judicial-system/formatters'
import {
  Modal,
  UserContext,
} from '@island.is/judicial-system-web/src/components'
import {
  Case,
  CaseTransition,
} from '@island.is/judicial-system-web/src/graphql/schema'
import useCase from '@island.is/judicial-system-web/src/utils/hooks/useCase'
import { validate } from '@island.is/judicial-system-web/src/utils/validate'

import { strings } from './ReturnIndictmentCaseModal.strings'

interface Props {
  workingCase: Case
  setWorkingCase: React.Dispatch<React.SetStateAction<Case>>
  onClose: () => void
  onComplete: () => void
}

const ReturnIndictmentModal: React.FC<React.PropsWithChildren<Props>> = ({
  workingCase,
  setWorkingCase,
  onClose,
  onComplete,
}) => {
  const { formatMessage } = useIntl()
  const { updateCase, transitionCase } = useCase()
  const { user } = useContext(UserContext)

  const [explanation, setExplanation] = useState<string>()
  const [explanationErrorMessage, setExplanationErrorMessage] =
    useState<string>('')

  const handleExplanationChange = (reason: string) => {
    setExplanationErrorMessage('')
    setExplanation(reason)
  }

  const validateExplanation = (reason: string) => {
    const { isValid, errorMessage } = validate([[reason, ['empty']]])
    if (!isValid) {
      setExplanationErrorMessage(errorMessage)
    }
  }

  const handleReturnIndictmentCase = async () => {
    if (!explanation) {
      return
    }

    const now = new Date()
    const prependedReturnedExplanation = `${formatMessage(
      strings.prependedReturnedExplanation,
      {
        date: formatDate(now, 'PPPp')?.replace('dagur,', 'daginn') ?? '',
        name: user?.name,
        courtName: workingCase.court?.name,
      },
    )} ${explanation}`

    const updatedCase = await updateCase(workingCase.id, {
      indictmentReturnedExplanation: prependedReturnedExplanation,
    })

    if (!updatedCase) {
      return
    }

    const transitioned = await transitionCase(
      workingCase.id,
      CaseTransition.RETURN_INDICTMENT,
      setWorkingCase,
    )

    if (transitioned) {
      onComplete()
    }
  }

  return (
    <Modal
      title={formatMessage(strings.returnModalTitle)}
      text={formatMessage(strings.returnModalText)}
      onClose={() => onClose()}
      primaryButtonText={formatMessage(strings.returnModalPrimaryButtonText)}
      secondaryButtonText={formatMessage(
        strings.returnModalSecondaryButtonText,
      )}
      onPrimaryButtonClick={handleReturnIndictmentCase}
      onSecondaryButtonClick={onClose}
    >
      <Box marginBottom={5}>
        <Input
          name="indictmentReturnedExplanation"
          label={formatMessage(strings.returnExplanationLabel)}
          placeholder={formatMessage(strings.returnExplanationLabel)}
          onChange={(event) => {
            handleExplanationChange(event.target.value)
          }}
          onBlur={(event) => {
            validateExplanation(event.target.value)
          }}
          hasError={explanationErrorMessage !== ''}
          errorMessage={explanationErrorMessage}
          textarea
          rows={9}
          required
        />
      </Box>
    </Modal>
  )
}

export default ReturnIndictmentModal
