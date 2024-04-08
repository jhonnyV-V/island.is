import React from 'react'
import { IntlShape, useIntl } from 'react-intl'

import { Tag, TagVariant } from '@island.is/island-ui/core'
import {
  isIndictmentCase,
  isInvestigationCase,
} from '@island.is/judicial-system/types'
import { tables } from '@island.is/judicial-system-web/messages'
import {
  CaseState,
  CaseType,
} from '@island.is/judicial-system-web/src/graphql/schema'

import { tagCaseState as m } from './TagCaseState.strings'

interface Props {
  caseState?: CaseState | null
  caseType?: CaseType | null
  isCourtRole?: boolean
  isValidToDateInThePast?: boolean | null
  courtDate?: string | null
}

export const mapCaseStateToTagVariant = (
  formatMessage: IntlShape['formatMessage'],
  state?: CaseState | null,
  caseType?: CaseType | null,
  isValidToDateInThePast?: boolean | null,
  courtDate?: string | null,
  isCourtRole?: boolean,
): { color: TagVariant; text: string } => {
  switch (state) {
    case CaseState.NEW:
    case CaseState.DRAFT:
    case CaseState.WAITING_FOR_CONFIRMATION:
      return { color: 'red', text: formatMessage(m.draft) }
    case CaseState.SUBMITTED:
      return {
        color: 'purple',
        text: formatMessage(isCourtRole ? tables.newTag : m.sent),
      }
    case CaseState.RECEIVED:
      return courtDate
        ? { color: 'mint', text: formatMessage(m.scheduled) }
        : { color: 'blueberry', text: formatMessage(tables.receivedTag) }
    case CaseState.ACCEPTED:
      return isIndictmentCase(caseType) || isValidToDateInThePast
        ? { color: 'darkerBlue', text: formatMessage(m.inactive) }
        : {
            color: 'blue',
            text: formatMessage(
              isInvestigationCase(caseType) ? m.accepted : m.active,
            ),
          }

    case CaseState.REJECTED:
      return { color: 'rose', text: formatMessage(m.rejected) }
    case CaseState.DISMISSED:
      return { color: 'dark', text: formatMessage(m.dismissed) }
    default:
      return { color: 'white', text: formatMessage(m.unknown) }
  }
}

const TagCaseState: React.FC<React.PropsWithChildren<Props>> = (Props) => {
  const { formatMessage } = useIntl()
  const {
    caseState,
    caseType,
    isCourtRole,
    isValidToDateInThePast,
    courtDate,
  } = Props

  const tagVariant = mapCaseStateToTagVariant(
    formatMessage,
    caseState,
    caseType,
    isValidToDateInThePast,
    courtDate,
    isCourtRole,
  )

  if (!tagVariant) return null

  return (
    <Tag variant={tagVariant?.color} outlined disabled truncate>
      {tagVariant.text}
    </Tag>
  )
}

export default TagCaseState
