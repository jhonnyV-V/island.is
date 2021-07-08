import { Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class GetDraftRegulationInput {
  @Field()
  @IsString()
  regulationId!: string
}
