import { Field, ObjectType } from '@nestjs/graphql'
import { UserCaseSubscriptionResult } from './userCaseSubscriptionResult.model'
import { UserSubscriptionResult } from './userSubscriptionResult.model'
import { UserSubscriptionsResult } from './userSubscriptionsResult.model'

@ObjectType('ConsultationPortalUserSubscriptionsAggregate')
export class UserSubscriptionsAggregate {
  @Field(() => Boolean, { nullable: true })
  subscribedToAll?: boolean

  @Field(() => Boolean, { nullable: true })
  subscribedToAllNew?: boolean

  @Field(() => [UserCaseSubscriptionResult], { nullable: true })
  cases?: UserCaseSubscriptionResult[] | null

  @Field(() => [UserSubscriptionResult], { nullable: true })
  institutions?: UserSubscriptionResult[] | null

  @Field(() => [UserSubscriptionResult], { nullable: true })
  policyAreas?: UserSubscriptionResult[] | null
}
