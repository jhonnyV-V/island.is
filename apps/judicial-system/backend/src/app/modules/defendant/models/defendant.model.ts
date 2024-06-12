import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import {
  DefendantPlea,
  DefenderChoice,
  Gender,
  ServiceRequirement,
  SubpoenaType,
} from '@island.is/judicial-system/types'

import { Case } from '../../case/models/case.model'

@Table({
  tableName: 'defendant',
  timestamps: true,
})
export class Defendant extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  @ApiProperty({ type: String })
  id!: string

  @CreatedAt
  @ApiProperty({ type: Date })
  created!: Date

  @UpdatedAt
  @ApiProperty({ type: Date })
  modified!: Date

  @ForeignKey(() => Case)
  @Column({ type: DataType.UUID, allowNull: false })
  @ApiProperty({ type: String })
  caseId!: string

  @BelongsTo(() => Case, 'case_id')
  @ApiPropertyOptional({ type: () => Case })
  case?: Case

  @Column({ type: DataType.BOOLEAN, allowNull: true })
  @ApiPropertyOptional({ type: Boolean })
  noNationalId?: boolean

  @Column({ type: DataType.STRING, allowNull: true })
  @ApiPropertyOptional({ type: String })
  nationalId?: string

  @Column({ type: DataType.STRING, allowNull: true })
  @ApiPropertyOptional({ type: String })
  name?: string

  @Column({
    type: DataType.ENUM,
    allowNull: true,
    values: Object.values(Gender),
  })
  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender

  @Column({ type: DataType.STRING, allowNull: true })
  @ApiPropertyOptional({ type: String })
  address?: string

  @Column({ type: DataType.STRING, allowNull: true })
  @ApiPropertyOptional({ type: String })
  citizenship?: string

  @Column({ type: DataType.STRING, allowNull: true })
  @ApiPropertyOptional({ type: String })
  defenderName?: string

  @Column({ type: DataType.STRING, allowNull: true })
  @ApiPropertyOptional({ type: String })
  defenderNationalId?: string

  @Column({ type: DataType.STRING, allowNull: true })
  @ApiPropertyOptional({ type: String })
  defenderEmail?: string

  @Column({ type: DataType.STRING, allowNull: true })
  @ApiPropertyOptional({ type: String })
  defenderPhoneNumber?: string

  @Column({
    type: DataType.ENUM,
    allowNull: true,
    values: Object.values(DefenderChoice),
  })
  @ApiPropertyOptional({ enum: DefenderChoice })
  defenderChoice?: DefenderChoice

  @Column({
    type: DataType.ENUM,
    allowNull: true,
    values: Object.values(DefendantPlea),
  })
  @ApiProperty({ enum: DefendantPlea })
  defendantPlea?: DefendantPlea

  @Column({
    type: DataType.ENUM,
    allowNull: true,
    values: Object.values(ServiceRequirement),
  })
  @ApiProperty({ enum: ServiceRequirement })
  serviceRequirement?: ServiceRequirement

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty()
  verdictViewDate?: string

  @Column({ type: DataType.BOOLEAN, allowNull: true })
  @ApiPropertyOptional({ type: Boolean })
  acceptCompensationClaim?: boolean

  @Column({
    type: DataType.ENUM,
    allowNull: true,
    values: Object.values(SubpoenaType),
  })
  @ApiPropertyOptional({ enum: SubpoenaType })
  subpoenaType?: SubpoenaType
}
