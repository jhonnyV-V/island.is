import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { EExternalEndpointType, EExternalEndpointEnvironment } from '@island.is/clients/form-system'

registerEnumType(EExternalEndpointType, {
  name: 'FormSystemExternalEndpointType',
})

registerEnumType(EExternalEndpointEnvironment, {
  name: 'FormSystemExternalEndpointEnvironment',
})

@ObjectType('FormSystemExternalEndpoints')
export class ExternalEndpoints {
  @Field(() => ID, { nullable: true })
  id?: number

  @Field(() => String, { nullable: true })
  url?: string | null

  @Field(() => EExternalEndpointType)
  type?: EExternalEndpointType

  @Field(() => EExternalEndpointEnvironment, { nullable: true })
  environment?: EExternalEndpointEnvironment
}
