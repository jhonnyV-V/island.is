import { Environment } from '@island.is/shared/types'
import { Field, InputType } from '@nestjs/graphql'

import { TranslatedValue } from '../../models/translated-value.model'

@InputType('AuthAdminPatchScopeInput')
export class AdminPatchScopeInput {
  @Field(() => [Environment], { nullable: false })
  environments!: Environment[]

  @Field(() => String, { nullable: false })
  scopeName!: string

  @Field(() => String, { nullable: false })
  tenantId!: string

  @Field(() => [TranslatedValue], { nullable: true })
  displayName?: TranslatedValue[]

  @Field(() => [TranslatedValue], { nullable: true })
  description?: TranslatedValue[]

  @Field(() => Boolean, { nullable: true })
  grantToAuthenticatedUser?: boolean

  @Field(() => Boolean, {
    nullable: true,
    deprecationReason:
      'Use addedDelegationTypes or removedDelegationTypes instead',
  })
  grantToLegalGuardians?: boolean

  @Field(() => Boolean, {
    nullable: true,
    deprecationReason:
      'Use addedDelegationTypes or removedDelegationTypes instead',
  })
  grantToProcuringHolders?: boolean

  @Field(() => Boolean, {
    nullable: true,
    deprecationReason:
      'Use addedDelegationTypes or removedDelegationTypes instead',
  })
  allowExplicitDelegationGrant?: boolean

  @Field(() => Boolean, { nullable: true })
  isAccessControlled?: boolean

  @Field(() => Boolean, {
    nullable: true,
    deprecationReason:
      'Use addedDelegationTypes or removedDelegationTypes instead',
  })
  grantToPersonalRepresentatives?: boolean

  @Field(() => [String], { nullable: true })
  addedDelegationTypes?: string[]

  @Field(() => [String], { nullable: true })
  removedDelegationTypes?: string[]
}
