import { Field, InputType, Int } from "@nestjs/graphql";
import { LanguageTypeInput } from "./language.input";
import { ApplicantTypeNameSuggestionInput } from "./applicantTypeNameSuggestion.input";


@InputType('FormSystemApplicantTypeInput')
export class ApplicantTypeInput {
  @Field(() => Int, { nullable: true })
  id?: number

  @Field(() => Int, { nullable: true })
  applicantTypeId?: number

  @Field(() => LanguageTypeInput, { nullable: true })
  name?: LanguageTypeInput

  @Field(() => LanguageTypeInput, { nullable: true })
  description?: LanguageTypeInput

  @Field(() => String, { nullable: true })
  type?: string | null

  @Field(() => ApplicantTypeNameSuggestionInput, { nullable: true })
  nameSuggestion?: ApplicantTypeNameSuggestionInput
}

@InputType('FormSystemFormApplicantTypeInput')
export class FormApplicantTypeInput {
  @Field(() => Int, { nullable: true })
  formId?: number

  @Field(() => Int, { nullable: true })
  applicantTypeId?: number

  @Field(() => LanguageTypeInput, { nullable: true })
  name?: LanguageTypeInput

  @Field(() => String)
  type?: string | null
}

