import { Field, ID, ObjectType } from '@nestjs/graphql'

import { Environment } from '@island.is/shared/types'
import { TranslatedValue } from '../../models/translated-value.model'

@ObjectType('AuthAdminScopeEnvironment')
export class ScopeEnvironment {
  @Field(() => Environment)
  environment!: Environment

  @Field(() => ID)
  name!: string

  @Field(() => [TranslatedValue], { nullable: false })
  displayName!: TranslatedValue[]

  @Field(() => [TranslatedValue], { nullable: false })
  description!: TranslatedValue[]

  @Field(() => String)
  domainName!: string

  @Field(() => Number, { nullable: true })
  order?: number

  @Field(() => String, { nullable: true })
  groupId?: string

  @Field(() => Boolean)
  showInDiscoveryDocument!: boolean

  @Field(() => Boolean)
  required!: boolean

  @Field(() => Boolean)
  emphasize!: boolean

  @Field(() => Boolean)
  grantToAuthenticatedUser!: boolean

  @Field(() => Boolean, {
    deprecationReason: 'Use supportedDelegationTypes instead',
  })
  grantToLegalGuardians!: boolean

  @Field(() => Boolean, {
    deprecationReason: 'Use supportedDelegationTypes instead',
  })
  grantToProcuringHolders!: boolean

  @Field(() => Boolean, {
    deprecationReason: 'Use supportedDelegationTypes instead',
  })
  grantToPersonalRepresentatives!: boolean

  @Field(() => [String])
  supportedDelegationTypes!: string[]

  @Field(() => Boolean, {
    deprecationReason: 'Use supportedDelegationTypes instead',
  })
  allowExplicitDelegationGrant!: boolean

  @Field(() => Boolean)
  automaticDelegationGrant!: boolean

  @Field(() => Boolean)
  alsoForDelegatedUser!: boolean

  @Field(() => Boolean)
  isAccessControlled!: boolean
}
