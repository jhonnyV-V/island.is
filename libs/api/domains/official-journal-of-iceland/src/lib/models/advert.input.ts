import { InputType, Field, registerEnumType } from '@nestjs/graphql'

export enum AdvertSignatureBodyTypeEnum {
  Hefbundin = 'Hefðbundin',
  Nefnd = 'Nefnd',
}

registerEnumType(AdvertSignatureBodyTypeEnum, {
  name: 'OfficialJournalOfIcelandAdvertSignatureType',
})

@InputType('OfficialJournalOfIcelandAdvertsInput')
export class AdvertsInput {
  @Field(() => String, { nullable: true })
  search?: string

  @Field(() => Number, { nullable: true })
  page?: number

  @Field(() => Number, { nullable: true })
  pageSize?: number

  @Field(() => [String], { nullable: true })
  department?: string[]

  @Field(() => [String], { nullable: true })
  type?: string[]

  @Field(() => [String], { nullable: true })
  category?: string[]

  @Field(() => [String], { nullable: true })
  involvedParty?: string[]

  @Field(() => Date, { nullable: true })
  dateFrom?: Date

  @Field(() => Date, { nullable: true })
  dateTo?: Date
}

@InputType('OfficialJournalOfIcelandTypesInput')
export class TypeQueryParams {
  @Field(() => String, { nullable: true })
  search?: string

  @Field(() => String, { nullable: true })
  department?: string

  @Field(() => Number, { nullable: true })
  page?: number
}

@InputType('OfficialJournalOfIcelandAdvertSingleParams')
export class AdvertSingleParams {
  @Field(() => String)
  id!: string
}

@InputType('OfficialJournalOfIcelandQueryInput')
export class QueryParams {
  @Field(() => String, { nullable: true })
  search?: string

  @Field(() => Number, { nullable: true })
  page?: number

  @Field(() => Number, { nullable: true })
  pageSize?: number
}

@InputType('OfficialJournalOfIcelandAdvertSignatureMember')
export class AdvertSignatureMember {
  @Field(() => Boolean)
  isChairman!: boolean

  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: true })
  textAbove?: string

  @Field(() => String, { nullable: true })
  textAfter?: string

  @Field(() => String, { nullable: true })
  textBelow?: string
}
@InputType('OfficialJournalOfIcelandAdvertSignatureData')
export class AdvertSignatureData {
  @Field(() => String)
  institution!: string

  @Field(() => String)
  date!: string

  @Field(() => [AdvertSignatureMember])
  members!: AdvertSignatureMember[]
}
@InputType('OfficialJournalOfIcelandAdvertSignature')
export class AdvertSignature {
  @Field(() => AdvertSignatureBodyTypeEnum)
  type!: AdvertSignatureBodyTypeEnum

  @Field(() => String, { nullable: true })
  additional?: string

  @Field(() => [AdvertSignatureData])
  data!: AdvertSignatureData[]
}

@InputType('OfficialJournalOfIcelandSubmitApplicationInput')
export class SubmitApplicationInput {
  @Field(() => String)
  applicationId!: string

  @Field(() => String)
  department!: string

  @Field(() => String)
  type!: string

  @Field(() => [String])
  categories!: string[]

  @Field(() => String)
  subject!: string

  @Field(() => String)
  requestedPublicationDate!: string

  @Field(() => String)
  document!: string

  @Field(() => AdvertSignature)
  signature!: AdvertSignature
}
