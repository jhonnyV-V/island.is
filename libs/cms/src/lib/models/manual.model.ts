import { Field, ID, ObjectType } from '@nestjs/graphql'
import { CacheField } from '@island.is/nest/graphql'
import { SystemMetadata } from '@island.is/shared/types'
import { IManual } from '../generated/contentfulTypes'
import { Organization, mapOrganization } from './organization.model'
import { SliceUnion, mapDocument } from '../unions/slice.union'
import { ManualChapter, mapManualChapter } from './manualChapter.model'
import { ArticleCategory, mapArticleCategory } from './articleCategory.model'
import { ArticleGroup, mapArticleGroup } from './articleGroup.model'
import { ArticleSubgroup, mapArticleSubgroup } from './articleSubgroup.model'

@ObjectType()
export class Manual {
  @Field(() => ID)
  id!: string

  @CacheField(() => Organization, { nullable: true })
  organization?: Organization | null

  @Field()
  title!: string

  @Field()
  slug!: string

  @CacheField(() => [SliceUnion], { nullable: true })
  info?: Array<typeof SliceUnion>

  @CacheField(() => [SliceUnion], { nullable: true })
  description?: Array<typeof SliceUnion>

  @CacheField(() => [ManualChapter])
  chapters!: ManualChapter[]

  @CacheField(() => ArticleCategory, { nullable: true })
  category?: ArticleCategory | null

  @CacheField(() => [ArticleCategory], { nullable: true })
  otherCategories?: Array<ArticleCategory>

  @CacheField(() => ArticleGroup, { nullable: true })
  group?: ArticleGroup | null

  @CacheField(() => [ArticleGroup], { nullable: true })
  otherGroups?: Array<ArticleGroup>

  @CacheField(() => ArticleSubgroup, { nullable: true })
  subgroup?: ArticleSubgroup | null

  @CacheField(() => [ArticleSubgroup], { nullable: true })
  otherSubgroups?: Array<ArticleSubgroup>

  @Field({ nullable: true })
  importance?: number
}

export const mapManual = (manual: IManual): SystemMetadata<Manual> => {
  const { sys, fields } = manual
  return {
    typename: 'Manual',
    id: sys.id,
    title: fields.title ?? '',
    slug: fields.slug ?? '',
    organization: fields.organization
      ? mapOrganization(fields.organization)
      : null,
    info: fields.info ? mapDocument(fields.info, sys.id + ':info') : [],
    description: fields.description
      ? mapDocument(fields.description, sys.id + ':description')
      : [],
    chapters: fields.chapters
      ? fields.chapters
          .filter((chapter) => chapter?.fields?.title && chapter?.fields?.slug)
          .map((chapter) => mapManualChapter({ chapter, manual }))
      : [],
    category: fields.category ? mapArticleCategory(fields.category) : null,
    group: fields.group ? mapArticleGroup(fields.group) : null,
    subgroup: fields.subgroup ? mapArticleSubgroup(fields.subgroup) : null,
    importance: fields.importance ?? 0,
    otherCategories: [],
    otherGroups: [],
    otherSubgroups: [],
  }
}
