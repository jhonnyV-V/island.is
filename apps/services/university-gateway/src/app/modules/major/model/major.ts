import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Column, DataType, HasMany } from 'sequelize-typescript'
import { DegreeType, InterestTag, Season } from '../types'
import { StudyType } from '../../application/types'
import { PageInfo } from './pageInfo'

export class Major {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Major ID',
    example: '00000000-0000-0000-0000-000000000000',
  })
  id!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({
    description: 'External ID for the major (from University)',
    example: 'ABC12345',
  })
  externalId!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Major name (Icelandic)',
    example: 'Tölvunarfræði',
  })
  nameIs!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Major name (English)',
    example: 'Computer science',
  })
  nameEn!: string

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ApiProperty({
    description: 'University ID',
    example: '00000000-0000-0000-0000-000000000000',
  })
  universityId!: string

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Name of the department that the major belongs to (Icelandic)',
    example: 'Verkfræði og náttúruvísindasvið',
  })
  departmentNameIs!: string

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Name of the department that the major belongs to (English)',
    example: 'Engineering and Natural Sciences',
  })
  departmentNameEn!: string

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Which year this major started on',
    example: 2023,
  })
  startingSemesterYear!: number

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: Object.values(Season),
  })
  @ApiProperty({
    description: 'Which season this major started on',
    example: Season.FALL,
    enum: Season,
  })
  startingSemesterSeason!: Season

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  @ApiProperty({
    description: 'When registration for this major opens',
    example: new Date('2023-05-01'),
  })
  registrationStart!: Date

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  @ApiProperty({
    description: 'When registration for this major closes',
    example: new Date('2023-01-01'),
  })
  registrationEnd!: Date

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: Object.values(DegreeType),
  })
  @ApiProperty({
    description: 'Degree type',
    example: DegreeType.UNDERGRADUATE,
    enum: DegreeType,
  })
  degreeType!: DegreeType

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Degree abbreviation',
    example: 'BSc',
  })
  degreeAbbreviation!: string

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Number of course credits (in ECTS)',
    example: 180,
  })
  credits!: number

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty({
    description: 'Major description (Icelandic)',
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
  @ApiPropertyOptional()
  descriptionIs?: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty({
    description: 'Major description (English)',
    example: 'Mauris a justo arcu. Orci varius natoque penatibus.',
  })
  @ApiPropertyOptional()
  descriptionEn?: string

  @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  @ApiProperty({
    description: 'Total duration for this major (in years)',
    example: 3,
  })
  @ApiPropertyOptional()
  durationInYears?: number

  @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  @ApiProperty({
    description: 'Price for major (per year)',
    example: 75000,
  })
  @ApiPropertyOptional()
  pricePerYear?: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({
    description: 'ISCED code for major',
    example: '481',
  })
  iscedCode!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty({
    description: 'External url for university web page (Icelandic)',
    example: 'https://www.ru.is/grunnnam/tolvunarfraedi/',
  })
  @ApiPropertyOptional()
  externalUrlIs?: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty({
    description: 'External url for university web page (English)',
    example: 'https://en.ru.is/st/dcs/undergraduate-study/bsc-computer-science',
  })
  @ApiPropertyOptional()
  externalUrlEn?: string

  @ApiProperty({
    description: 'Study types available for the major',
    example: [StudyType.ON_SITE],
    enum: StudyType,
    isArray: true,
  })
  studyTypes!: [StudyType]

  @ApiProperty({
    description:
      'Interest tag for the major (to be able to categorize majors after interest)',
    example: [InterestTag.ENGINEER],
    enum: InterestTag,
    isArray: true,
  })
  interestTags?: [InterestTag]
}

export class MajorDetails extends Major {}

export class MajorResponse {
  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Column description for data',
    type: Major,
    isArray: true,
  })
  data!: Major[]

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Page information (for pagination)',
    type: PageInfo,
  })
  pageInfo!: PageInfo

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Total number of items in result (for pagination)',
    example: 25,
  })
  totalCount!: number
}

export class MajorDetailsResponse {
  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  @ApiProperty({
    description: 'Column description for data',
    type: MajorDetails,
  })
  data!: MajorDetails
}
