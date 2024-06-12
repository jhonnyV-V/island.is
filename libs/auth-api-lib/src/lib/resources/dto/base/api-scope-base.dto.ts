import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ApiScopeBaseDTO {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
  })
  readonly enabled!: boolean

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'set_name',
  })
  readonly name!: string

  @IsString()
  @ApiProperty({
    example: '@island.is',
  })
  readonly domainName!: string

  @IsInt()
  @Min(0)
  @Max(999)
  @IsOptional()
  @ApiProperty({
    example: 0,
    default: 0,
  })
  readonly order?: number

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly groupId?: string

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
  })
  readonly showInDiscoveryDocument!: boolean

  @IsBoolean()
  @ApiProperty({
    example: false,
  })
  readonly required!: boolean

  @IsBoolean()
  @ApiProperty({
    example: false,
  })
  readonly emphasize!: boolean

  @IsBoolean()
  @ApiProperty({
    example: false,
  })
  readonly grantToAuthenticatedUser!: boolean

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    deprecated: true,
    description: 'Use supportedDelegationTypes instead',
  })
  readonly grantToLegalGuardians!: boolean

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    deprecated: true,
    description: 'Use supportedDelegationTypes instead',
  })
  readonly grantToProcuringHolders!: boolean

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    deprecated: true,
    description: 'Use supportedDelegationTypes instead',
  })
  readonly grantToPersonalRepresentatives!: boolean

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    deprecated: true,
    description: 'Use supportedDelegationTypes instead',
  })
  readonly allowExplicitDelegationGrant!: boolean

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: false,
  })
  readonly automaticDelegationGrant!: boolean

  @IsArray()
  @ApiProperty({
    type: [String],
    example: ['Custom'],
  })
  supportedDelegationTypes!: string[]

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: false,
  })
  readonly alsoForDelegatedUser!: boolean

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: false,
  })
  readonly isAccessControlled?: boolean
}
