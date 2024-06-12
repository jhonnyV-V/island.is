import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

import { DefenderChoice } from '@island.is/judicial-system/types'

export class UpdateSubpoenaDto {
  @IsNotEmpty()
  @IsEnum(DefenderChoice)
  @ApiProperty({ enum: DefenderChoice })
  defenderChoice!: DefenderChoice

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  defenderNationalId?: string

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  acceptCompensationClaim?: boolean
}
