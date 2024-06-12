import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useWindowSize } from 'react-use'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import {
  Box,
  BreadCrumbItem,
  Breadcrumbs,
  Button,
  Divider,
  GridColumn,
  GridContainer,
  GridRow,
  Inline,
  Link,
  LinkV2,
  Navigation,
  NavigationItem,
  ProfileCard,
  ResponsiveSpace,
  Stack,
  Text,
} from '@island.is/island-ui/core'
import { theme } from '@island.is/island-ui/theme'
import {
  DefaultHeaderProps,
  Footer as WebFooter,
  HeadWithSocialSharing,
  LiveChatIncChatPanel,
  SearchBox,
  SidebarShipSearchInput,
  Sticky,
  Webreader,
} from '@island.is/web/components'
import { DefaultHeader, WatsonChatPanel } from '@island.is/web/components'
import { SLICE_SPACING, STICKY_NAV_MAX_WIDTH } from '@island.is/web/constants'
import {
  Image,
  Organization,
  OrganizationPage,
} from '@island.is/web/graphql/schema'
import {
  useLinkResolver,
  useNamespace,
  usePlausiblePageview,
} from '@island.is/web/hooks'
import { useI18n } from '@island.is/web/i18n'
import { LayoutProps } from '@island.is/web/layouts/main'
import SidebarLayout from '@island.is/web/screens/Layouts/SidebarLayout'
import { getBackgroundStyle } from '@island.is/web/utils/organization'

import { LatestNewsCardConnectedComponent } from '../LatestNewsCardConnectedComponent'
import { DigitalIcelandHeader } from './Themes/DigitalIcelandTheme'
import { FiskistofaHeader } from './Themes/FiskistofaTheme'
import { FiskistofaFooter } from './Themes/FiskistofaTheme'
import {
  FjarsyslaRikisinsFooter,
  FjarsyslaRikisinsHeader,
} from './Themes/FjarsyslaRikisinsTheme'
import { GevFooter, GevHeader } from './Themes/GevTheme'
import {
  HeilbrigdisstofnunAusturlandsFooter,
  HeilbrigdisstofnunAusturlandsHeader,
} from './Themes/HeilbrigdisstofnunAusturlandsTheme'
import { HeilbrigdisstofnunNordurlandsHeader } from './Themes/HeilbrigdisstofnunNordurlandsTheme'
import { HeilbrigdisstofnunNordurlandsFooter } from './Themes/HeilbrigdisstofnunNordurlandsTheme'
import { HeilbrigdisstofnunSudurlandsFooter } from './Themes/HeilbrigdisstofnunSudurlandsTheme'
import { HeilbrigdisstofnunSudurlandsHeader } from './Themes/HeilbrigdisstofnunSudurlandsTheme'
import { HljodbokasafnIslandsHeader } from './Themes/HljodbokasafnIslandsTheme'
import { HmsHeader } from './Themes/HmsTheme'
import { HveFooter, HveHeader } from './Themes/HveTheme'
import {
  IcelandicNaturalDisasterInsuranceFooter,
  IcelandicNaturalDisasterInsuranceHeader,
} from './Themes/IcelandicNaturalDisasterInsuranceTheme'
import { IcelandicRadiationSafetyAuthorityHeader } from './Themes/IcelandicRadiationSafetyAuthority'
import { LandskjorstjornFooter } from './Themes/LandkjorstjornTheme'
import { LandskjorstjornHeader } from './Themes/LandkjorstjornTheme'
import { LandlaeknirFooter } from './Themes/LandlaeknirTheme'
import { LandlaeknirHeader } from './Themes/LandlaeknirTheme'
import { MannaudstorgFooter } from './Themes/MannaudstorgTheme'
import { RettindagaeslaFatladsFolksHeader } from './Themes/RettindagaeslaFatladsFolksTheme'
import { RikislogmadurHeader } from './Themes/RikislogmadurTheme'
import { RikislogmadurFooter } from './Themes/RikislogmadurTheme'
import { RikissaksoknariHeader } from './Themes/RikissaksoknariTheme'
import { SAkFooter, SAkHeader } from './Themes/SAkTheme'
import { ShhFooter, ShhHeader } from './Themes/SHHTheme'
import {
  SjukratryggingarFooter,
  SjukratryggingarHeader,
} from './Themes/SjukratryggingarTheme'
import { SyslumennFooter, SyslumennHeader } from './Themes/SyslumennTheme'
import { TransportAuthorityHeader } from './Themes/TransportAuthorityTheme'
import { UniversityStudiesHeader } from './Themes/UniversityStudiesTheme'
import UniversityStudiesFooter from './Themes/UniversityStudiesTheme/UniversityStudiesFooter'
import {
  UtlendingastofnunFooter,
  UtlendingastofnunHeader,
} from './Themes/UtlendingastofnunTheme'
import { VinnueftilitidHeader } from './Themes/VinnueftirlitidTheme'
import { liveChatIncConfig, watsonConfig } from './config'
import * as styles from './OrganizationWrapper.css'

interface NavigationData {
  title: string
  activeItemTitle?: string
  items: NavigationItem[]
}

interface WrapperProps {
  pageTitle: string
  pageDescription?: string
  pageFeaturedImage?: Image
  organizationPage: OrganizationPage
  breadcrumbItems?: BreadCrumbItem[]
  mainContent?: ReactNode
  sidebarContent?: ReactNode
  navigationData: NavigationData
  fullWidthContent?: boolean
  stickySidebar?: boolean
  minimal?: boolean
  showSecondaryMenu?: boolean
  showExternalLinks?: boolean
  showReadSpeaker?: boolean
  isSubpage?: boolean
  backLink?: { text: string; url: string }
}

interface HeaderProps {
  organizationPage: OrganizationPage
}

const darkThemes = ['hms']

const blueberryThemes = ['sjukratryggingar', 'rikislogmadur', 'nti']

const lightThemes = [
  'digital_iceland',
  'default',
  'fiskistofa',
  'landing_page',
  'tryggingastofnun',
  'hve',
  'hsa',
  'haskolanam',
  'nti',
  'samgongustofa',
  'rettindagaesla-fatlads-folks',
  'vinnueftirlitid',
  'hljodbokasafn-islands',
]

export const getThemeConfig = (
  theme?: string,
  organization?: Organization | null,
): { themeConfig: Partial<LayoutProps> } => {
  const footerVersion: LayoutProps['footerVersion'] =
    theme === 'landing-page' || (organization?.footerItems ?? [])?.length > 0
      ? 'organization'
      : 'default'

  if (blueberryThemes.includes(theme ?? ''))
    return {
      themeConfig: {
        headerButtonColorScheme: 'blueberry',
        headerColorScheme: 'blueberry',
        footerVersion,
      },
    }

  if (darkThemes.includes(theme ?? '')) {
    return {
      themeConfig: {
        headerColorScheme: 'dark',
        headerButtonColorScheme: 'dark',
        footerVersion,
      },
    }
  }

  if (lightThemes.includes(theme ?? '')) {
    return { themeConfig: { footerVersion } }
  }

  return {
    themeConfig: {
      headerColorScheme: 'white',
      headerButtonColorScheme: 'negative',
      footerVersion,
    },
  }
}

export const OrganizationHeader: React.FC<
  React.PropsWithChildren<HeaderProps>
> = ({ organizationPage }) => {
  const { linkResolver } = useLinkResolver()
  const namespace = useMemo(
    () => JSON.parse(organizationPage?.organization?.namespace?.fields ?? '{}'),
    [organizationPage?.organization?.namespace?.fields],
  )
  const n = useNamespace(namespace)
  const { activeLocale } = useI18n()

  const organizationLogoAltText = n(
    'organizationLogoAltText',
    activeLocale === 'is'
      ? organizationPage.organization?.title + ' Forsíða'
      : organizationPage.organization?.title + ' Frontpage',
  )

  const organizationLogoAltTextFallback =
    activeLocale === 'is' ? 'Forsíða stofnunar' : 'Organization frontpage'

  const logoAltText = organizationPage.organization?.title
    ? organizationLogoAltText
    : organizationLogoAltTextFallback

  switch (organizationPage.theme) {
    case 'syslumenn':
      return (
        <SyslumennHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'sjukratryggingar':
      return (
        <SjukratryggingarHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'utlendingastofnun':
      return (
        <UtlendingastofnunHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'digital_iceland':
      return (
        <DigitalIcelandHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'hsn':
      return (
        <HeilbrigdisstofnunNordurlandsHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'hsu':
      return (
        <HeilbrigdisstofnunSudurlandsHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'landlaeknir':
      return (
        <LandlaeknirHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'fiskistofa':
      return (
        <FiskistofaHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'rikislogmadur':
      return (
        <RikislogmadurHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'landskjorstjorn':
      return (
        <LandskjorstjornHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'landing_page':
      return null
    case 'fjarsysla-rikisins':
      return (
        <FjarsyslaRikisinsHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'sak':
      return (
        <SAkHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'gev':
      return (
        <GevHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'hve':
      return (
        <HveHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'shh':
      return (
        <ShhHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'hsa':
      return (
        <HeilbrigdisstofnunAusturlandsHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'haskolanam':
      return (
        <UniversityStudiesHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'nti':
      return (
        <IcelandicNaturalDisasterInsuranceHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'samgongustofa':
      return (
        <TransportAuthorityHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'geislavarnir-rikisins':
      return (
        <IcelandicRadiationSafetyAuthorityHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'rettindagaesla-fatlads-folks':
      return (
        <RettindagaeslaFatladsFolksHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'hms':
      return (
        <HmsHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )

    case 'rikissaksoknari':
      return (
        <RikissaksoknariHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'vinnueftirlitid':
      return (
        <VinnueftilitidHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    case 'hljodbokasafn-islands':
      return (
        <HljodbokasafnIslandsHeader
          organizationPage={organizationPage}
          logoAltText={logoAltText}
        />
      )
    default:
      return (
        <DefaultHeader
          fullWidth={organizationPage.themeProperties.fullWidth ?? false}
          image={organizationPage.defaultHeaderImage?.url}
          background={getBackgroundStyle(organizationPage.themeProperties)}
          title={organizationPage.title}
          logo={organizationPage.organization?.logo?.url}
          logoHref={
            linkResolver('organizationpage', [organizationPage.slug]).href
          }
          titleColor={
            (organizationPage.themeProperties
              .textColor as DefaultHeaderProps['titleColor']) ?? 'dark400'
          }
          imagePadding={organizationPage.themeProperties.imagePadding || '20px'}
          imageIsFullHeight={
            organizationPage.themeProperties.imageIsFullHeight ?? true
          }
          imageObjectFit={
            organizationPage.themeProperties.imageObjectFit === 'cover'
              ? 'cover'
              : 'contain'
          }
          imageObjectPosition={
            organizationPage.themeProperties.imageObjectPosition === 'left'
              ? 'left'
              : organizationPage.themeProperties.imageObjectPosition === 'right'
              ? 'right'
              : 'center'
          }
          logoAltText={logoAltText}
          titleSectionPaddingLeft={
            organizationPage.themeProperties
              .titleSectionPaddingLeft as ResponsiveSpace
          }
          mobileBackground={
            organizationPage.themeProperties.mobileBackgroundColor
          }
        />
      )
  }
}

interface ExternalLinksProps {
  organizationPage: OrganizationPage
  showOnMobile?: boolean
}

export const OrganizationExternalLinks: React.FC<
  React.PropsWithChildren<ExternalLinksProps>
> = ({ organizationPage, showOnMobile = true }) => {
  if (organizationPage.externalLinks?.length) {
    const mobileDisplay = showOnMobile ? 'flex' : 'none'
    return (
      <Box
        display={[mobileDisplay, mobileDisplay, 'flex', 'flex']}
        justifyContent={[
          'center',
          showOnMobile ? 'flexEnd' : 'center',
          'flexEnd',
        ]}
        marginBottom={4}
      >
        <Inline
          flexWrap={
            organizationPage.externalLinks?.length === 2 ? 'nowrap' : 'wrap'
          }
          space={2}
        >
          {organizationPage.externalLinks.map((link, index) => {
            // Sjukratryggingar's external links have custom styled buttons
            const isSjukratryggingar =
              organizationPage.slug === 'sjukratryggingar' ||
              organizationPage.slug === 'icelandic-health-insurance' ||
              organizationPage.slug === 'iceland-health'

            let variant = undefined
            if (
              isSjukratryggingar &&
              organizationPage.externalLinks &&
              organizationPage.externalLinks.length === 2
            ) {
              variant = index === 0 ? 'primary' : 'ghost'
            }

            return (
              <Link
                href={link.url}
                key={'organization-external-link-' + index}
                pureChildren={true}
              >
                <Button
                  as="a"
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore make web strict
                  variant={variant}
                  icon={isSjukratryggingar ? 'lockClosed' : 'open'}
                  iconType="outline"
                  size="medium"
                >
                  <Box paddingY={[0, 2]} paddingLeft={[0, 2]}>
                    {link.text}
                  </Box>
                </Button>
              </Link>
            )
          })}
        </Inline>
      </Box>
    )
  }
  return null
}

interface FooterProps {
  organizations: Array<Organization>
  force?: boolean
}

export const OrganizationFooter: React.FC<
  React.PropsWithChildren<FooterProps>
> = ({ organizations, force = false }) => {
  const organization = force
    ? organizations[0]
    : organizations.find((x) => x?.footerItems?.length > 0)

  const namespace = useMemo(
    () => JSON.parse(organization?.namespace?.fields ?? '{}'),
    [],
  )
  const n = useNamespace(namespace)

  let OrganizationFooterComponent = null

  switch (organization?.slug) {
    case 'syslumenn':
    case 'district-commissioner':
      OrganizationFooterComponent = (
        <SyslumennFooter
          title={organization.title}
          logo={organization.logo?.url}
          footerItems={organization.footerItems}
          namespace={namespace}
        />
      )
      break
    case 'sjukratryggingar':
    case 'icelandic-health-insurance':
    case 'iceland-health':
      OrganizationFooterComponent = (
        <SjukratryggingarFooter
          footerItems={organization.footerItems}
          namespace={namespace}
          organizationSlug={organization.slug}
        />
      )
      break
    case 'utlendingastofnun':
    case 'directorate-of-immigration':
      OrganizationFooterComponent = (
        <UtlendingastofnunFooter
          title={organization.title}
          logo={organization.logo?.url}
          footerItems={organization.footerItems}
          organizationSlug={organization.slug}
          namespace={namespace}
        />
      )
      break
    case 'mannaudstorg':
      OrganizationFooterComponent = (
        <MannaudstorgFooter
          title={organization.title}
          logoSrc={organization.logo?.url}
          footerItems={organization.footerItems}
        />
      )
      break
    case 'landlaeknir':
    case 'directorate-of-health':
      OrganizationFooterComponent = (
        <LandlaeknirFooter
          footerItems={organization.footerItems}
          namespace={namespace}
        />
      )
      break
    case 'hsn':
      OrganizationFooterComponent = (
        <HeilbrigdisstofnunNordurlandsFooter
          footerItems={organization.footerItems}
          namespace={namespace}
        />
      )
      break
    case 'hsu':
      OrganizationFooterComponent = (
        <HeilbrigdisstofnunSudurlandsFooter
          footerItems={organization.footerItems}
          namespace={namespace}
        />
      )
      break
    case 'fiskistofa':
    case 'directorate-of-fisheries':
      OrganizationFooterComponent = (
        <FiskistofaFooter
          footerItems={organization.footerItems}
          namespace={namespace}
        />
      )
      break
    case 'landskjorstjorn':
      OrganizationFooterComponent = (
        <LandskjorstjornFooter
          footerItems={organization.footerItems}
          namespace={namespace}
        />
      )
      break
    case 'rikislogmadur':
    case 'office-of-the-attorney-general-civil-affairs':
      OrganizationFooterComponent = (
        <RikislogmadurFooter
          title={organization.title}
          footerItems={organization.footerItems}
          logo={organization.logo?.url}
        />
      )
      break
    case 'sak':
    case 'sjukrahusid-akureyri':
    case 'akureyri-hospital':
      OrganizationFooterComponent = (
        <SAkFooter
          title={organization.title}
          footerItems={organization.footerItems}
          logo={organization.logo?.url}
        />
      )
      break
    case 'fjarsysla-rikisins':
    case 'the-financial-management-authority':
      OrganizationFooterComponent = (
        <FjarsyslaRikisinsFooter
          namespace={namespace}
          title={organization.title}
        />
      )
      break
    case 'hve':
      OrganizationFooterComponent = (
        <HveFooter
          footerItems={organization.footerItems}
          namespace={namespace}
          logo={organization.logo?.url}
          title={organization.title}
        />
      )
      break
    case 'haskolanam':
    case 'university-studies':
      OrganizationFooterComponent = (
        <UniversityStudiesFooter organization={organization} />
      )
      break
    case 'gev':
      OrganizationFooterComponent = (
        <GevFooter
          title={organization.title}
          namespace={namespace}
          footerItems={organization.footerItems}
        />
      )
      break
    case 'shh':
    case 'samskiptamidstoed-heyrnarlausra-og-heyrnarskertra':
    case 'the-communication-center-for-the-deaf-and-hearing-impaired':
      OrganizationFooterComponent = (
        <ShhFooter
          title={organization.title}
          namespace={namespace}
          footerItems={organization.footerItems}
        />
      )
      break
    case 'hsa':
      OrganizationFooterComponent = (
        <HeilbrigdisstofnunAusturlandsFooter
          title={organization.title}
          namespace={namespace}
          footerItems={organization.footerItems}
        />
      )
      break
    case 'nti':
      OrganizationFooterComponent = (
        <IcelandicNaturalDisasterInsuranceFooter
          footerItems={organization.footerItems}
          namespace={namespace}
        />
      )
      break
    case 'samgongustofa':
    case 'transport-authority':
      OrganizationFooterComponent = (
        <WebFooter
          imageUrl={organization.logo?.url}
          heading={organization.title}
          columns={organization.footerItems}
          titleVariant="h2"
        />
      )
      break
    case 'rettindagaesla-fatlads-folks':
    case 'disability-rights-protection':
      OrganizationFooterComponent = (
        <>
          <WebFooter
            imageUrl={organization.logo?.url}
            heading={organization.title}
            columns={organization.footerItems}
            background={organization.footerConfig?.background}
            color={
              organization.footerConfig?.color ||
              organization.footerConfig?.textColor
            }
          />
          <Divider />
        </>
      )
      break
    default: {
      const footerItems = organization?.footerItems ?? []
      if (footerItems.length === 0) break
      OrganizationFooterComponent = (
        <WebFooter
          heading={organization?.title ?? ''}
          columns={footerItems}
          background={organization?.footerConfig?.background}
          color={organization?.footerConfig?.textColor}
        />
      )
    }
  }

  return OrganizationFooterComponent
}

export const OrganizationChatPanel = ({
  organizationIds,
}: {
  organizationIds: string[]
  pushUp?: boolean
}) => {
  const { activeLocale } = useI18n()

  const organizationIdWithLiveChat = organizationIds.find((id) => {
    return id in liveChatIncConfig[activeLocale]
  })

  if (organizationIdWithLiveChat) {
    return (
      <LiveChatIncChatPanel
        {...liveChatIncConfig[activeLocale][organizationIdWithLiveChat]}
      />
    )
  }

  const organizationIdWithWatson = organizationIds.find((id) => {
    return id in watsonConfig[activeLocale]
  })

  if (organizationIdWithWatson) {
    return (
      <WatsonChatPanel
        {...watsonConfig[activeLocale][organizationIdWithWatson]}
      />
    )
  }

  return null
}

const SecondaryMenu = ({
  title,
  items,
}: {
  title: string
  items: NavigationItem[]
}) => (
  <Box
    background="purple100"
    borderRadius="large"
    padding={[3, 3, 4]}
    marginY={3}
  >
    <Stack space={[1, 1, 2]}>
      <Text variant="eyebrow" as="h2">
        {title}
      </Text>
      {items.map((link) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore make web strict
        <Link key={link.href} href={link.href} underline="normal">
          <Text
            key={link.href}
            as="span"
            variant={link.active ? 'h5' : 'default'}
          >
            {link.title}
          </Text>
        </Link>
      ))}
    </Stack>
  </Box>
)

const getActiveNavigationItemTitle = (
  navigationItems: NavigationItem[],
  clientUrl: string,
) => {
  const clientUrlWithoutHashOrQueryParams = clientUrl
    .split('?')[0]
    .split('#')[0]

  for (const item of navigationItems) {
    if (clientUrlWithoutHashOrQueryParams === item.href) {
      return item.title
    }
    for (const childItem of item.items ?? []) {
      if (clientUrlWithoutHashOrQueryParams === childItem.href) {
        return childItem.title
      }
    }
  }
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore make web strict
const renderConnectedComponent = (slice) => {
  if (!slice?.componentType) return null

  switch (slice.componentType) {
    case 'LatestNewsCard':
      return (
        <LatestNewsCardConnectedComponent key={slice?.id} {...slice?.json} />
      )
    case 'Fiskistofa/ShipSearchSidebarInput':
      return (
        <SidebarShipSearchInput key={slice?.id} namespace={slice?.json ?? {}} />
      )
    case 'OrganizationSearchBox':
      return <SearchBox key={slice?.id} {...slice?.json} />
    default:
      return null
  }
}

export const OrganizationWrapper: React.FC<
  React.PropsWithChildren<WrapperProps>
> = ({
  pageTitle,
  pageDescription,
  pageFeaturedImage,
  organizationPage,
  breadcrumbItems,
  mainContent,
  sidebarContent,
  navigationData,
  fullWidthContent = false,
  stickySidebar = true,
  children,
  minimal = false,
  showSecondaryMenu = true,
  showExternalLinks = false,
  showReadSpeaker = true,
  isSubpage = true,
  backLink,
}) => {
  const router = useRouter()
  const { width } = useWindowSize()
  const [isMobile, setIsMobile] = useState<boolean | undefined>()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore make web strict
  usePlausiblePageview(organizationPage.organization?.trackingDomain)

  useEffect(() => {
    setIsMobile(width < theme.breakpoints.md)
  }, [width])

  const secondaryNavList: NavigationItem[] =
    organizationPage.secondaryMenu?.childrenLinks.map(({ text, url }) => ({
      title: text,
      href: url,
      active: router.asPath === url,
    })) ?? []

  const activeNavigationItemTitle = useMemo(
    () => getActiveNavigationItemTitle(navigationData.items, router.asPath),
    [navigationData.items, router.asPath],
  )

  const metaTitleSuffix =
    pageTitle !== organizationPage.title ? ` | ${organizationPage.title}` : ''

  const SidebarContainer = stickySidebar ? Sticky : Box

  const sidebarCards = organizationPage.sidebarCards ?? []

  return (
    <>
      <HeadWithSocialSharing
        title={`${pageTitle}${metaTitleSuffix}`}
        description={pageDescription}
        imageUrl={pageFeaturedImage?.url}
        imageContentType={pageFeaturedImage?.contentType}
        imageWidth={pageFeaturedImage?.width?.toString()}
        imageHeight={pageFeaturedImage?.height?.toString()}
      />
      <OrganizationHeader organizationPage={organizationPage} />
      {!minimal && (
        <SidebarLayout
          paddingTop={[2, 2, 9]}
          paddingBottom={[6, 6, 9]}
          isSticky={false}
          fullWidthContent={fullWidthContent}
          sidebarContent={
            <SidebarContainer>
              <Stack space={3}>
                {backLink && (
                  <Box display={['none', 'none', 'block']} printHidden>
                    <LinkV2 href={backLink.url}>
                      <Button
                        preTextIcon="arrowBack"
                        preTextIconType="filled"
                        size="small"
                        type="button"
                        variant="text"
                        truncate
                      >
                        {backLink.text}
                      </Button>
                    </LinkV2>
                  </Box>
                )}
                <Navigation
                  baseId="pageNav"
                  items={navigationData.items}
                  title={navigationData.title}
                  activeItemTitle={activeNavigationItemTitle}
                  renderLink={(link, item) => {
                    return item?.href ? (
                      <NextLink href={item?.href} legacyBehavior>
                        {link}
                      </NextLink>
                    ) : (
                      link
                    )
                  }}
                />
              </Stack>
              {showSecondaryMenu && (
                <>
                  {organizationPage.secondaryMenu &&
                    secondaryNavList.length > 0 && (
                      <SecondaryMenu
                        title={organizationPage.secondaryMenu.name}
                        items={secondaryNavList}
                      />
                    )}
                  <Box
                    marginY={
                      organizationPage.secondaryMenu &&
                      secondaryNavList.length > 0
                        ? 0
                        : 3
                    }
                    className={styles.sidebarCardContainer}
                  >
                    {(organizationPage.sidebarCards ?? []).map((card) => {
                      if (card.__typename === 'SidebarCard') {
                        let imageUrl =
                          card.image?.url ||
                          'https://images.ctfassets.net/8k0h54kbe6bj/6jpT5mePCNk02nVrzVLzt2/6adca7c10cc927d25597452d59c2a873/bitmap.png'

                        imageUrl += `?w=${STICKY_NAV_MAX_WIDTH}`

                        return (
                          <ProfileCard
                            key={card.id}
                            title={card.title}
                            description={card.contentString}
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore make web strict
                            link={card.link}
                            image={imageUrl}
                            size="small"
                          />
                        )
                      }

                      if (card.__typename === 'ConnectedComponent') {
                        return renderConnectedComponent(card)
                      }

                      return null
                    })}
                  </Box>
                </>
              )}
              {sidebarContent}
            </SidebarContainer>
          }
        >
          {isMobile && (
            <Box className={styles.menuStyle}>
              {showExternalLinks && (
                <OrganizationExternalLinks
                  organizationPage={organizationPage}
                  showOnMobile={true}
                />
              )}
              <Box marginY={2}>
                <Navigation
                  baseId="pageNavMobile"
                  isMenuDialog={true}
                  items={navigationData.items}
                  title={navigationData.title}
                  activeItemTitle={activeNavigationItemTitle}
                  renderLink={(link, item) => {
                    return item?.href ? (
                      <NextLink href={item?.href} legacyBehavior>
                        {link}
                      </NextLink>
                    ) : (
                      link
                    )
                  }}
                />
              </Box>
              {organizationPage.secondaryMenu && secondaryNavList.length > 0 && (
                <Box marginY={2}>
                  <Navigation
                    baseId="secondaryNav"
                    colorScheme="purple"
                    isMenuDialog={true}
                    title={organizationPage.secondaryMenu.name}
                    items={secondaryNavList}
                    renderLink={(link, item) => {
                      return item?.href ? (
                        <NextLink href={item?.href} legacyBehavior>
                          {link}
                        </NextLink>
                      ) : (
                        link
                      )
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          <GridContainer>
            <GridRow>
              <GridColumn
                span={fullWidthContent ? ['9/9', '9/9', '7/9'] : '9/9'}
                offset={fullWidthContent ? ['0', '0', '1/9'] : '0'}
              >
                {showExternalLinks && (
                  <OrganizationExternalLinks
                    organizationPage={organizationPage}
                    showOnMobile={false}
                  />
                )}
                {breadcrumbItems && (
                  <Breadcrumbs
                    items={breadcrumbItems ?? []}
                    renderLink={(link, item) => {
                      return item?.href ? (
                        <NextLink href={item?.href} legacyBehavior>
                          {link}
                        </NextLink>
                      ) : (
                        link
                      )
                    }}
                  />
                )}

                {showReadSpeaker && (
                  <Webreader
                    marginTop={breadcrumbItems?.length ? 3 : 0}
                    marginBottom={breadcrumbItems?.length ? 0 : 3}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore make web strict
                    readId={null}
                    readClass="rs_read"
                  />
                )}

                {pageDescription && (
                  <Box
                    className="rs_read"
                    paddingTop={[2, 2, breadcrumbItems ? 5 : 0]}
                    paddingBottom={SLICE_SPACING}
                  >
                    <Text variant="default">{pageDescription}</Text>
                  </Box>
                )}
              </GridColumn>
            </GridRow>
          </GridContainer>

          {isMobile && sidebarContent}

          <Box className="rs_read" paddingTop={fullWidthContent ? 0 : 4}>
            {mainContent ?? children}
          </Box>

          {isMobile && !isSubpage && sidebarCards.length > 0 && (
            <Box marginY={4}>
              <Stack space={3}>
                {sidebarCards.map((card) => {
                  if (card.__typename === 'SidebarCard') {
                    return (
                      <ProfileCard
                        key={card.id}
                        title={card.title}
                        description={card.contentString}
                        link={card.link ?? undefined}
                        size="small"
                      />
                    )
                  }

                  if (card.__typename === 'ConnectedComponent') {
                    return renderConnectedComponent(card)
                  }

                  return null
                })}
              </Stack>
            </Box>
          )}
        </SidebarLayout>
      )}

      {minimal && (
        <GridContainer>
          <GridRow>
            <GridColumn
              paddingTop={6}
              span={['12/12', '12/12', '10/12']}
              offset={['0', '0', '1/12']}
              className="rs_read"
            >
              {mainContent}
            </GridColumn>
          </GridRow>
        </GridContainer>
      )}
      {!!mainContent && <Box className="rs_read">{children}</Box>}
      {!minimal && (
        <Box className="rs_read">
          <OrganizationFooter
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore make web strict
            organizations={[organizationPage.organization]}
            force={true}
          />
        </Box>
      )}
      <OrganizationChatPanel
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore make web strict
        organizationIds={[organizationPage?.organization?.id]}
      />
    </>
  )
}
