import { ChargeItemCode } from '@island.is/shared/constants'

export const getChargeItemCodes = (): Array<string> => {
  return [ChargeItemCode.CRIMINAL_RECORD.toString()]
}
