import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { DegreeType, Season } from '../types'
import { ProgramExtraApplicationField } from './programExtraApplicationField'
import { ProgramTag } from './programTag'
import { ProgramModeOfDelivery } from './programModeOfDelivery'
import { University } from '../../university/model'
import { ProgramCourse } from './programCourse'
//import { PageInfo } from '@island.is/nest/pagination'

@Table({
  tableName: 'program',
})
export class Program extends Model {
  @ApiProperty({
    description: 'Program ID',
    example: '00000000-0000-0000-0000-000000000000',
  })
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string

  @ApiProperty({
    description: 'External ID for the program (from University)',
    example: 'ABC12345',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  externalId!: string

  @ApiProperty({
    description:
      'Whether the program is active and should be displayed on the external web',
    example: true,
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  active!: boolean

  @ApiProperty({
    description: 'Program name (Icelandic)',
    example: 'Tölvunarfræði',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nameIs!: string

  @ApiProperty({
    description: 'Program name (English)',
    example: 'Computer science',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nameEn!: string

  @ApiProperty({
    description: 'University ID',
    example: '00000000-0000-0000-0000-000000000000',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ForeignKey(() => University)
  universityId!: string

  @ApiProperty({
    description:
      'Name of the department that the program belongs to (Icelandic)',
    example: 'Verkfræði og náttúruvísindasvið',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  departmentNameIs!: string

  @ApiProperty({
    description: 'Name of the department that the program belongs to (English)',
    example: 'Engineering and Natural Sciences',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  departmentNameEn!: string

  @ApiProperty({
    description: 'Which year this program started on',
    example: 2023,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  startingSemesterYear!: number

  @ApiProperty({
    description: 'Which season this program started on',
    example: Season.FALL,
    enum: Season,
  })
  @Column({
    type: DataType.ENUM,
    values: Object.values(Season),
    allowNull: false,
  })
  startingSemesterSeason!: Season

  @ApiProperty({
    description: 'When the application period for this program starts',
    example: new Date('2023-05-01'),
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  applicationStartDate!: Date

  @ApiProperty({
    description: 'When the application period for this program ends',
    example: new Date('2023-08-01'),
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  applicationEndDate!: Date

  @ApiProperty({
    description: 'Degree type',
    example: DegreeType.UNDERGRADUATE,
    enum: DegreeType,
  })
  @Column({
    type: DataType.ENUM,
    values: Object.values(DegreeType),
    allowNull: false,
  })
  degreeType!: DegreeType

  @ApiProperty({
    description: 'Degree abbreviation',
    example: 'BSc',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  degreeAbbreviation!: string

  @ApiProperty({
    description: 'Number of course credits (in ECTS)',
    example: 180,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  credits!: number

  @ApiProperty({
    description: 'Program description (Icelandic)',
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  descriptionIs!: string

  @ApiProperty({
    description: 'Program description (English)',
    example: 'Mauris a justo arcu. Orci varius natoque penatibus.',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  descriptionEn!: string

  @ApiProperty({
    description: 'Total duration for this program (in years)',
    example: 3,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  durationInYears!: number

  @ApiProperty({
    description: 'Cost for program (per year)',
    example: 75000,
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  costPerYear?: number

  @ApiProperty({
    description: 'ISCED code for program',
    example: '481',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  iscedCode!: string

  @ApiProperty({
    description: 'Search keywords for the program',
    example: ['stærðfræði'],
  })
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  searchKeywords!: string[]

  @ApiProperty({
    description:
      'External url  for the program from the university web page (Icelandic)',
    example: 'https://www.ru.is/grunnnam/tolvunarfraedi',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  externalUrlIs?: string

  @ApiProperty({
    description:
      'External url  for the program from the university web page (English)',
    example: 'https://en.ru.is/st/dcs/undergraduate-study/bsc-computer-science',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  externalUrlEn?: string

  @ApiProperty({
    description: 'Admission requirements for program (Icelandic)',
    example: 'Nemandinn verður að hafa klárað stúdentspróf',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  admissionRequirementsIs?: string

  @ApiProperty({
    description: 'Admission requirements for program (English)',
    example: 'The student needs to have finished the matriculation exam',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  admissionRequirementsEn?: string

  @ApiProperty({
    description: 'Study requirements for program (Icelandic)',
    example: 'Nemandinn verður að vera með lágmarkseinkunn 6 í öllum áföngum',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  studyRequirementsIs?: string

  @ApiProperty({
    description: 'Study requirements for program (English)',
    example: 'The student must have a minimum grade of 6 in all courses',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  studyRequirementsEn?: string

  @ApiProperty({
    description: 'Cost information for program (Icelandic)',
    example: 'Það verður að borga 10.000 kr staðfestingargjald fyrir 1. ágúst',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  costInformationIs?: string

  @ApiProperty({
    description: 'Cost information for program (English)',
    example: 'A confirmation fee of ISK 10.000 must be paid before August 1',
  })
  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  costInformationEn?: string

  @ApiProperty({
    description: 'List of courses that belong to this program',
    type: [ProgramCourse],
  })
  @HasMany(() => ProgramCourse)
  courses!: ProgramCourse[]

  @ApiProperty({
    description:
      'List of (interest) tags connected to this program (to be able to categorize programs after interest)',
    type: [ProgramTag],
  })
  @HasMany(() => ProgramTag)
  tag?: [ProgramTag]

  @ApiProperty({
    description: 'Modes of deliveries available for the program',
    type: [ProgramModeOfDelivery],
  })
  @HasMany(() => ProgramModeOfDelivery)
  modeOfDelivery!: [ProgramModeOfDelivery]

  @ApiProperty({
    description:
      'Extra application fields that should be displayed in the application for the program',
    type: [ProgramExtraApplicationField],
  })
  @HasMany(() => ProgramExtraApplicationField)
  extraApplicationField?: [ProgramExtraApplicationField]

  @ApiProperty({
    type: String,
  })
  @CreatedAt
  readonly created!: Date

  @ApiProperty({
    type: String,
  })
  @UpdatedAt
  readonly modified!: Date
}

export class ProgramResponse {
  @ApiProperty({
    description: 'Program data',
    type: [Program],
  })
  data!: Program[]

//  @ApiProperty({
//    description: 'Page information (for pagination)',
//  })
//  pageInfo!: PageInfo

//  @ApiProperty({
//    description: 'Total number of items in result (for pagination)',
//  })
//  totalCount!: number
}

export class ProgramDetailsResponse {
  @ApiProperty({
    description: 'Program data',
    type: Program,
  })
  data!: Program
}
