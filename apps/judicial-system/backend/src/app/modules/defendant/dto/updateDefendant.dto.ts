import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'

import { ApiPropertyOptional } from '@nestjs/swagger'

import {
  DefendantPlea,
  DefenderChoice,
  Gender,
  ServiceRequirement,
  SubpoenaType,
} from '@island.is/judicial-system/types'

export class UpdateDefendantDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: Boolean })
  readonly noNationalId?: boolean

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  readonly nationalId?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  readonly name?: string

  @IsOptional()
  @IsEnum(Gender)
  @ApiPropertyOptional({ enum: Gender })
  readonly gender?: Gender

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  readonly address?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  readonly citizenship?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  readonly defenderName?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  readonly defenderNationalId?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  readonly defenderEmail?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  readonly defenderPhoneNumber?: string

  @IsOptional()
  @IsEnum(DefenderChoice)
  @ApiPropertyOptional({ enum: DefenderChoice })
  readonly defenderChoice?: DefenderChoice

  @IsOptional()
  @IsEnum(DefendantPlea)
  @ApiPropertyOptional({ enum: DefendantPlea })
  readonly defendantPlea?: DefendantPlea

  @IsOptional()
  @IsEnum(ServiceRequirement)
  @ApiPropertyOptional({ enum: ServiceRequirement })
  readonly serviceRequirement?: ServiceRequirement

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  readonly verdictViewDate?: string

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: Boolean })
  readonly acceptCompensationClaim?: boolean

  @IsOptional()
  @IsEnum(SubpoenaType)
  @ApiPropertyOptional({ enum: SubpoenaType })
  readonly subpoenaType?: SubpoenaType
}
