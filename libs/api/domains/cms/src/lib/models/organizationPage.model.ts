import { Field, ObjectType, ID } from '@nestjs/graphql'

import { IOrganizationPage } from '../generated/contentfulTypes'
import { mapOrganization, Organization } from './organization.model'
import { LinkGroup, mapLinkGroup } from './linkGroup.model'
import { Image, mapImage } from './image.model'
import { safelyMapSliceUnion, SliceUnion } from '../unions/slice.union'
import { FooterItem, mapFooterItem } from './footerItem.model'
import { mapSidebarCard, SidebarCard } from './sidebarCard.model'

@ObjectType()
export class OrganizationPage {
  @Field(() => ID)
  id: string

  @Field()
  title: string

  @Field()
  slug: string

  @Field()
  description: string

  @Field()
  theme: string

  @Field()
  themeProperties?: string

  @Field(() => [SliceUnion])
  slices: Array<typeof SliceUnion>

  @Field(() => [LinkGroup])
  menuLinks?: Array<LinkGroup>

  @Field(() => Organization)
  organization: Organization

  @Field({ nullable: true })
  featuredImage?: Image

  @Field(() => [FooterItem], { nullable: true })
  footerItems?: Array<FooterItem>

  @Field(() => [SidebarCard], { nullable: true })
  sidebarCards?: Array<SidebarCard>
}

export const mapOrganizationPage = ({
  sys,
  fields,
}: IOrganizationPage): OrganizationPage => ({
  id: sys.id,
  title: fields.title ?? '',
  slug: fields.slug ?? '',
  description: fields.description ?? '',
  theme: fields.theme ?? '',
  themeProperties: fields.themeProperties
    ? JSON.stringify(fields.themeProperties)
    : '',
  slices: (fields.slices ?? []).map(safelyMapSliceUnion),
  menuLinks: (fields.menuLinks ?? []).map(mapLinkGroup),
  organization: fields.organization
    ? mapOrganization(fields.organization)
    : null,
  featuredImage: fields.featuredImage ? mapImage(fields.featuredImage) : null,
  footerItems: (fields.footerItems ?? []).map(mapFooterItem),
  sidebarCards: (fields.sidebarCards ?? []).map(mapSidebarCard),
})
