import {
  CaseCustodyRestrictions,
  CaseType,
} from '@island.is/judicial-system/types'
import { restrictionsV2 as m } from '@island.is/judicial-system-web/messages'

import type { CheckboxInfo } from '../components/CheckboxList/CheckboxList'
import { IntlFormatters } from 'react-intl'

const makeCheckboxInfo = (
  restriction: CaseCustodyRestrictions,
): CheckboxInfo => ({
  title: m[restriction].title,
  id: restriction,
  info: m[restriction].description,
})

export const restrictionsCheckboxes: CheckboxInfo[] = [
  makeCheckboxInfo(CaseCustodyRestrictions.NECESSITIES),
  makeCheckboxInfo(CaseCustodyRestrictions.VISITAION),
  makeCheckboxInfo(CaseCustodyRestrictions.COMMUNICATION),
  makeCheckboxInfo(CaseCustodyRestrictions.MEDIA),
  makeCheckboxInfo(CaseCustodyRestrictions.WORKBAN),
]

export const formatRequestedCustodyRestrictions = (
  formatMessage: IntlFormatters['formatMessage'],
  type: CaseType,
  requestedCustodyRestrictions?: CaseCustodyRestrictions[],
  requestedOtherRestrictions?: string,
) => {
  const hasRequestedCustodyRestrictions =
    requestedCustodyRestrictions && requestedCustodyRestrictions?.length > 0
  const hasRequestedOtherRestrictions =
    requestedOtherRestrictions && requestedOtherRestrictions?.length > 0

  // No restrictions
  if (!hasRequestedCustodyRestrictions && !hasRequestedOtherRestrictions) {
    return formatMessage(m.fallback, { caseType: type })
  }

  const requestedCustodyRestrictionsText = hasRequestedCustodyRestrictions
    ? requestedCustodyRestrictions &&
      requestedCustodyRestrictions.reduce(
        (acc, restriction, index) =>
          `${acc}${index > 0 ? '\n' : ''}${formatMessage(
            m[restriction].title,
          )}`,
        '',
      )
    : ''

  const paragraphBreak =
    hasRequestedCustodyRestrictions && hasRequestedOtherRestrictions ? '\n' : ''

  const requestedOtherRestrictionsText = hasRequestedOtherRestrictions
    ? requestedOtherRestrictions
    : ''

  return `${requestedCustodyRestrictionsText}${paragraphBreak}${requestedOtherRestrictionsText}`
}

export const travelBanRestrictionsCheckboxes = [
  makeCheckboxInfo(
    CaseCustodyRestrictions.ALTERNATIVE_TRAVEL_BAN_REQUIRE_NOTIFICATION,
  ),
]
