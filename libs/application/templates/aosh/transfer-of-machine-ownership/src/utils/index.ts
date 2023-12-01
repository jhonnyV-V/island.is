import { ChargeItemCode } from '@island.is/shared/constants'

export const formatIsk = (value: number): string =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' kr.'

export const formatPhoneNumber = (value: string): string =>
  value.length === 7 ? value.substr(0, 3) + '-' + value.substr(3, 6) : value

export { getSelectedMachine } from './getSelectedMachine'
export { getReviewSteps } from './getReviewSteps'
export { hasReviewerApproved } from './hasReviewerApproved'
export { getApproveAnswers } from './getApproveAnswers'
export { getRejecter } from './getRejecter'

export const getChargeItemCodes = (): Array<string> => {
  return [ChargeItemCode.AOSH_TRANSFER_OF_MACHINE_OWNERSHIP.toString()]
}
