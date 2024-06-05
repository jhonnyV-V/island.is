import { z } from 'zod'
import { PropertyTypes } from './constants'

export const MortgageCertificateSchema = z.object({
  approveExternalData: z.boolean().refine((v) => v),
  selectedProperties: z.object({
    propertyType: z.enum([
      PropertyTypes.REAL_ESTATE,
      PropertyTypes.VEHICLE,
      PropertyTypes.SHIP,
    ]),
    properties: z
      .array(
        z.object({
          propertyNumber: z.string().optional(),
          propertyName: z.string().optional(),
        }),
      )
      .optional(),
  }),
})

export type MortgageCertificate = z.TypeOf<typeof MortgageCertificateSchema>
