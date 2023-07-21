import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { z } from 'zod'
import { NO, YES } from './constants'
import { errorMessages } from './messages'
import { ApplicationReason } from './constants'
import addYears from 'date-fns/addYears'

export const dataSchema = z.object({
  approveExternalData: z.boolean().refine((v) => v),
  questions: z.object({
    pensionFund: z.enum([YES, NO]),
    abroad: z.enum([YES, NO]),
  }),
  applicantInfo: z.object({
    email: z.string().email(),
    phonenumber: z.string().refine(
      (p) => {
        const phoneNumber = parsePhoneNumberFromString(p, 'IS')
        const phoneNumberStartStr = ['6', '7', '8']
        return (
          phoneNumber &&
          phoneNumber.isValid() &&
          (phoneNumber.country === 'IS'
            ? phoneNumberStartStr.some((substr) =>
                phoneNumber.nationalNumber.startsWith(substr),
              )
            : true)
        )
      },
      { params: errorMessages.phoneNumber },
    ),
  }),
  paymentInfo: z.object({
    bank: z.string().refine(
      (b) => b.length === 12, // 4 (bank) + 2 (ledger) + 6 (number)
      { params: errorMessages.bank },
    ),
  }),
  applicationReason: z
    .array(
      z.enum([
        ApplicationReason.MEDICINE_COST,
        ApplicationReason.ASSISTED_CARE_AT_HOME,
        ApplicationReason.OXYGEN_FILTER_COST,
        ApplicationReason.PURCHASE_OF_HEARING_AIDS,
        ApplicationReason.ASSISTED_LIVING,
        ApplicationReason.HALFWAY_HOUSE,
        ApplicationReason.HOUSE_RENT,
      ]),
    )
    .refine((a) => a.length !== 0, {
      params: errorMessages.applicationReason,
    }),
  period: z
    .object({
      year: z.string(),
      month: z.string(),
    })
    .refine(
      (p) => {
        const today = new Date()
        const startDate = addYears(today, -2)
        const selectedDate = new Date(p.year + p.month)
        return startDate < selectedDate
      },
      { params: errorMessages.period },
    ),
})

export type SchemaFormValues = z.infer<typeof dataSchema>
