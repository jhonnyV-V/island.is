import { ApiProperty } from '@nestjs/swagger'

export class HnippTemplate {
  @ApiProperty({ example: 'HNIPP.POSTHOLF.NEW_DOCUMENT' })
  templateId!: string

  @ApiProperty({ example: 'New document' })
  title!: string

  @ApiProperty({ example: 'New document from {{organization}}' })
  externalBody!: string

  @ApiProperty({ example: 'Some extra text ...' })
  internalBody?: string

  // DEPRECATED - LEGACY SUPPORT
  @ApiProperty({ example: '//inbox/{{documentId}}' })
  clickAction?: string

  // DEPRECATED - WILL BE REMOVED
  @ApiProperty({ example: 'https://island.is/minarsidur/postholf' })
  clickActionWeb?: string

  @ApiProperty({ example: 'https://island.is/minarsidur/postholf' })
  clickActionUrl?: string

  @ApiProperty({ example: ['arg1', 'arg2'] })
  args!: string[]
}
