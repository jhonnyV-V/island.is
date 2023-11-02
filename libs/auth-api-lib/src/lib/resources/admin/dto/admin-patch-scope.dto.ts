import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

import { TranslatedValueDto } from '../../../translation/dto/translated-value.dto'
import { CustomDelegationOnlyForDelegationType } from '../../types'

export class AdminPatchScopeDto {
  @ApiPropertyOptional({
    type: [TranslatedValueDto],
    example: [
      {
        locale: 'is',
        value: 'Samnefni á umfangi',
      },
      {
        locale: 'en',
        value: 'Scope alias name',
      },
    ],
  })
  @IsOptional()
  @Type(() => TranslatedValueDto)
  @ValidateNested({ each: true })
  @IsArray()
  displayName?: TranslatedValueDto[]

  @ApiPropertyOptional({
    type: [TranslatedValueDto],
    example: [
      {
        locale: 'is',
        value: 'Lýsing á umfangi',
      },
      {
        locale: 'en',
        value: 'Scope description',
      },
    ],
  })
  @IsOptional()
  @Type(() => TranslatedValueDto)
  @ValidateNested({ each: true })
  @IsArray()
  description?: TranslatedValueDto[]

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
  })
  grantToAuthenticatedUser?: boolean

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
  })
  grantToLegalGuardians?: boolean

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
  })
  grantToProcuringHolders?: boolean

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
  })
  allowExplicitDelegationGrant?: boolean

  @IsOptional()
  @IsArray()
  @IsEnum(CustomDelegationOnlyForDelegationType, { each: true })
  @ApiPropertyOptional({
    description:
      'See detailed documentation on this field in the GET endpoint response.',
    enum: CustomDelegationOnlyForDelegationType,
    enumName: 'CustomDelegationOnlyForDelegationType',
    isArray: true,
    example: [CustomDelegationOnlyForDelegationType.ProcurationHolder],
    default: undefined,
  })
  customDelegationOnlyFor?: CustomDelegationOnlyForDelegationType

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
  })
  isAccessControlled?: boolean

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
  })
  grantToPersonalRepresentatives?: boolean
}

export const superUserScopeFields = [
  'grantToAuthenticatedUser',
  'grantToLegalGuardians',
  'grantToProcuringHolders',
  'allowExplicitDelegationGrant',
  'isAccessControlled',
  'grantToPersonalRepresentatives',
  'customDelegationOnlyFor',
]
