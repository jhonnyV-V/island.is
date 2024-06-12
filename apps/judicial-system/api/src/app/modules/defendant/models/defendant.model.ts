import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'

import {
  DefendantPlea,
  DefenderChoice,
  Gender,
  ServiceRequirement,
} from '@island.is/judicial-system/types'

registerEnumType(Gender, { name: 'Gender' })
registerEnumType(DefendantPlea, { name: 'DefendantPlea' })
registerEnumType(ServiceRequirement, { name: 'ServiceRequirement' })
registerEnumType(DefenderChoice, { name: 'DefenderChoice' })

@ObjectType()
export class Defendant {
  @Field(() => ID)
  readonly id!: string

  @Field(() => String, { nullable: true })
  readonly created?: string

  @Field(() => String, { nullable: true })
  readonly modified?: string

  @Field(() => ID, { nullable: true })
  readonly caseId?: string

  @Field(() => Boolean, { nullable: true })
  readonly noNationalId?: boolean

  @Field(() => String, { nullable: true })
  readonly nationalId?: string

  @Field(() => String, { nullable: true })
  readonly name?: string

  @Field(() => Gender, { nullable: true })
  readonly gender?: Gender

  @Field(() => String, { nullable: true })
  readonly address?: string

  @Field(() => String, { nullable: true })
  readonly citizenship?: string

  @Field(() => String, { nullable: true })
  readonly defenderName?: string

  @Field(() => String, { nullable: true })
  readonly defenderNationalId?: string

  @Field(() => String, { nullable: true })
  readonly defenderEmail?: string

  @Field(() => String, { nullable: true })
  readonly defenderPhoneNumber?: string

  @Field(() => DefendantPlea, { nullable: true })
  readonly defendantPlea?: DefendantPlea

  @Field(() => ServiceRequirement, { nullable: true })
  readonly serviceRequirement?: ServiceRequirement

  @Field(() => String, { nullable: true })
  readonly verdictViewDate?: string

  @Field(() => String, { nullable: true })
  readonly verdictAppealDeadline?: string

  @Field(() => DefenderChoice, { nullable: true })
  readonly defenderChoice?: DefenderChoice

  @Field(() => Boolean, { nullable: true })
  readonly acceptCompensationClaim?: boolean
}
