import { Allow, IsOptional } from 'class-validator'

import { Field, ID, InputType } from '@nestjs/graphql'

import {
  DefendantPlea,
  DefenderChoice,
  Gender,
  ServiceRequirement,
} from '@island.is/judicial-system/types'

@InputType()
export class UpdateDefendantInput {
  @Allow()
  @Field(() => ID)
  readonly caseId!: string

  @Allow()
  @Field(() => ID)
  readonly defendantId!: string

  @Allow()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  readonly noNationalId?: boolean

  @Allow()
  @IsOptional()
  @Field(() => String, { nullable: true })
  readonly nationalId?: string

  @Allow()
  @IsOptional()
  @Field(() => String, { nullable: true })
  readonly name?: string

  @Allow()
  @IsOptional()
  @Field(() => Gender, { nullable: true })
  readonly gender?: Gender

  @Allow()
  @IsOptional()
  @Field(() => String, { nullable: true })
  readonly address?: string

  @Allow()
  @IsOptional()
  @Field(() => String, { nullable: true })
  readonly citizenship?: string

  @Allow()
  @IsOptional()
  @Field(() => String, { nullable: true })
  readonly defenderName?: string

  @Allow()
  @IsOptional()
  @Field(() => String, { nullable: true })
  readonly defenderNationalId?: string

  @Allow()
  @IsOptional()
  @Field(() => String, { nullable: true })
  readonly defenderEmail?: string

  @Allow()
  @IsOptional()
  @Field(() => String, { nullable: true })
  readonly defenderPhoneNumber?: string

  @Allow()
  @IsOptional()
  @Field(() => DefendantPlea, { nullable: true })
  readonly defendantPlea?: DefendantPlea

  @Allow()
  @IsOptional()
  @Field(() => ServiceRequirement, { nullable: true })
  readonly serviceRequirement?: ServiceRequirement

  @Allow()
  @IsOptional()
  @Field(() => String, { nullable: true })
  readonly verdictViewDate?: string

  @Allow()
  @IsOptional()
  @Field(() => DefenderChoice, { nullable: true })
  readonly defenderChoice?: DefenderChoice
}
