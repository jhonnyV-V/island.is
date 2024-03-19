import { Field, Int, ObjectType } from "@nestjs/graphql";
import { LanguageType } from "./global.model";
import { Input } from "./input.model";

@ObjectType('FormSystemGroup')
export class Group {
  @Field(() => Int, { nullable: true })
  id?: number

  @Field(() => LanguageType, { nullable: true })
  name?: LanguageType

  @Field(() => String, { nullable: true })
  guid?: string

  @Field(() => Number, { nullable: true })
  displayOrder?: number

  @Field(() => Boolean, { nullable: true })
  isHidden?: boolean

  @Field(() => [Input])
  inputs?: Input[] | null

  @Field(() => Int, { nullable: true })
  stepId?: number

  @Field(() => Number, { nullable: true })
  multiSet?: number

  @Field(() => String, { nullable: true })
  stepGuid?: string
}

