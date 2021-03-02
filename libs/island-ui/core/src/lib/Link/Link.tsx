import * as React from 'react'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import cn from 'classnames'
import * as styles from './Link.treat'

const isLinkInternal = (href: string) => {
  if (typeof href === 'string' && href.indexOf('://') !== -1) return false

  return true
}

export type LinkColor = 'white' | 'blue400' | 'blue600'
export type UnderlineVisibility = 'always' | 'hover'
export type UnderlineVariants = 'normal' | 'small'

export interface LinkProps extends NextLinkProps {
  color?: LinkColor
  className?: string
  id?: string
  underline?: UnderlineVariants
  underlineVisibility?: UnderlineVisibility
  skipTab?: boolean
  onClick?: () => void
  pureChildren?: boolean
}

// Next link that can handle external urls
export const Link: React.FC<LinkProps> = ({
  children,
  href,
  as,
  replace,
  scroll,
  shallow,
  prefetch,
  color,
  skipTab,
  className,
  id,
  underline,
  underlineVisibility = 'hover',
  pureChildren,
  ...linkProps
}) => {
  const isInternal = isLinkInternal(href as string)
  const classNames = cn(
    styles.link,
    color ? styles.colors[color] : undefined,
    underline ? styles.underlines[underline] : undefined,
    underline && underlineVisibility
      ? styles.underlineVisibilities[underlineVisibility]
      : undefined,
    className,
    {
      [styles.pointer]: href || linkProps.onClick,
    },
  )

  if (!href) {
    return (
      <span className={classNames} {...linkProps} id={id}>
        {children}
      </span>
    )
  }

  if (isInternal) {
    return (
      <NextLink
        href={href}
        as={as}
        shallow={shallow}
        scroll={scroll}
        passHref
        prefetch={prefetch}
      >
        {pureChildren ? (
          children
        ) : (
          <a
            className={classNames}
            {...linkProps}
            tabIndex={skipTab ? -1 : undefined}
            id={id}
          >
            {children}
          </a>
        )}
      </NextLink>
    )
  } else {
    return (
      <a
        href={href as string}
        target="_blank"
        rel="noopener noreferrer"
        className={classNames}
        {...linkProps}
        tabIndex={skipTab ? -1 : undefined}
        id={id}
      >
        {children}
      </a>
    )
  }
}
