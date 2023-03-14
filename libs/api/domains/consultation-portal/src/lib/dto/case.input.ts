import { FeatureFlag, Features } from '@island.is/nest/feature-flags'
import { InputType, Field, Float, Int } from '@nestjs/graphql'
import { GraphQLJSONObject } from 'graphql-type-json'

@InputType('ConsultationPortalCaseInput')
@FeatureFlag(Features.consultationPortalApplication)
export class GetCaseInput {
  @Field(() => Int)
  caseId = 0
}
