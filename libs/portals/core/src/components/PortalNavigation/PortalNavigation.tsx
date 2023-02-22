import { Navigation, useBreakpoint } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useNavigation } from '../../hooks/useNavigation'
import { PortalNavigationItem } from '../../types/portalCore'

interface PortalNavigationProps {
  navigation: PortalNavigationItem
  title?: string
}

const findActiveNav = (
  navigation?: PortalNavigationItem,
): PortalNavigationItem | undefined => {
  if (!navigation) {
    return undefined
  }
  const activeChild = navigation.children?.find((item) => item.active)
  return findActiveNav(activeChild) || activeChild
}

export function PortalNavigation({
  navigation,
  title = '',
}: PortalNavigationProps) {
  const { formatMessage } = useLocale()
  const nav = useNavigation(navigation)
  const { lg } = useBreakpoint()
  const activeNav = useMemo(() => findActiveNav(nav), [nav])
  const params = useParams()
  if (!nav) {
    return null
  }

  return (
    <Navigation
      title={title ? title : formatMessage(nav.name)}
      baseId={'navigation'}
      isMenuDialog={!lg}
      activeItemTitle={activeNav ? formatMessage(activeNav.name) : undefined}
      renderLink={(link, item) => {
        Object.keys(params).forEach((key) => {
          if (item?.href) {
            item.href = item.href.replace(`:${key}`, params[key] as string)
          }
        })
        return item?.href ? <Link to={item.href}>{link}</Link> : link
      }}
      items={
        nav.children?.map((child) => ({
          href: child.path,
          title: formatMessage(child.name),
          active: child.active,
          items: child.children?.map((grandChild) => ({
            href: grandChild.path,
            title: formatMessage(grandChild.name),
            active: child.active,
          })),
        })) ?? []
      }
    />
  )
}
