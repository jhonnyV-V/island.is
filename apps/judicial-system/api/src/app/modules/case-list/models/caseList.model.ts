import { Field, ID, ObjectType } from '@nestjs/graphql'

import {
  CaseAppealDecision,
  CaseAppealRulingDecision,
  CaseAppealState,
  CaseDecision,
  CaseIndictmentRulingDecision,
  CaseState,
  CaseType,
  IndictmentCaseReviewDecision,
  IndictmentDecision,
} from '@island.is/judicial-system/types'

import { Defendant } from '../../defendant'
import { Institution } from '../../institution'
import { User } from '../../user'

@ObjectType()
export class CaseListEntry {
  @Field(() => ID)
  readonly id!: string

  @Field(() => String, { nullable: true })
  readonly created?: string

  @Field(() => String, { nullable: true })
  readonly courtDate?: string

  @Field(() => [String], { nullable: true })
  readonly policeCaseNumbers?: string[]

  @Field(() => CaseState, { nullable: true })
  readonly state?: CaseState

  @Field(() => CaseType, { nullable: true })
  readonly type?: CaseType

  @Field(() => [Defendant], { nullable: true })
  readonly defendants?: Defendant[]

  @Field(() => String, { nullable: true })
  readonly courtCaseNumber?: string

  @Field(() => CaseDecision, { nullable: true })
  readonly decision?: CaseDecision

  @Field(() => String, { nullable: true })
  readonly validToDate?: string

  @Field(() => Boolean, { nullable: true })
  readonly isValidToDateInThePast?: boolean

  @Field(() => String, { nullable: true })
  readonly initialRulingDate?: string

  @Field(() => String, { nullable: true })
  readonly rulingDate?: string

  @Field(() => String, { nullable: true })
  readonly rulingSignatureDate?: string

  @Field(() => String, { nullable: true })
  readonly courtEndTime?: string

  @Field(() => CaseAppealDecision, { nullable: true })
  readonly prosecutorAppealDecision?: CaseAppealDecision

  @Field(() => CaseAppealDecision, { nullable: true })
  readonly accusedAppealDecision?: CaseAppealDecision

  @Field(() => String, { nullable: true })
  readonly accusedPostponedAppealDate?: string

  @Field(() => String, { nullable: true })
  readonly prosecutorPostponedAppealDate?: string

  @Field(() => User, { nullable: true })
  readonly creatingProsecutor?: User

  @Field(() => User, { nullable: true })
  readonly prosecutor?: User

  @Field(() => User, { nullable: true })
  readonly judge?: User

  @Field(() => User, { nullable: true })
  readonly registrar?: User

  @Field(() => ID, { nullable: true })
  readonly parentCaseId?: string

  @Field(() => CaseAppealState, { nullable: true })
  readonly appealState?: CaseAppealState

  @Field(() => String, { nullable: true })
  readonly appealedDate?: string

  @Field(() => String, { nullable: true })
  readonly appealCaseNumber?: string

  @Field(() => CaseAppealRulingDecision, { nullable: true })
  readonly appealRulingDecision?: CaseAppealRulingDecision

  @Field(() => Institution, { nullable: true })
  readonly prosecutorsOffice?: Institution

  @Field(() => String, { nullable: true })
  readonly postponedIndefinitelyExplanation?: string

  @Field(() => User, { nullable: true })
  readonly indictmentReviewer?: User

  @Field(() => IndictmentCaseReviewDecision, { nullable: true })
  readonly indictmentReviewDecision?: IndictmentCaseReviewDecision

  @Field(() => String, { nullable: true })
  readonly indictmentAppealDeadline?: string

  @Field(() => Boolean, { nullable: true })
  readonly indictmentVerdictViewedByAll?: boolean

  @Field(() => String, { nullable: true })
  readonly indictmentVerdictAppealDeadline?: string

  @Field(() => IndictmentDecision, { nullable: true })
  readonly indictmentDecision?: IndictmentDecision

  @Field(() => CaseIndictmentRulingDecision, { nullable: true })
  readonly indictmentRulingDecision?: CaseIndictmentRulingDecision
}
