import React from 'react'
import {
  Box,
  Button,
  FocusableBox,
  Hidden,
  Link,
  Tag,
  Text,
} from '@island.is/island-ui/core'
import * as styles from './CardWithFeaturedItems.css'
import { LinkType, useLinkResolver } from '@island.is/web/hooks'
import { Featured } from '@island.is/web/graphql/schema'

type CardWithFeaturedItemsProps = {
  heading: string
  imgSrc: string
  imgAlt?: string
  href: string | null
  dataTestId?: string
  buttonTitle?: string
  featuredItems: Featured[]
}

export const FeaturedItemsLinks = ({
  featuredItems,
}: {
  featuredItems: Featured[]
}) => {
  const { linkResolver } = useLinkResolver()

  return (
    <Hidden below="sm">
      <Box marginY={2}>
        {featuredItems.map((item: Featured, index: number) => {
          const cardUrl = linkResolver(item.thing?.type as LinkType, [
            item.thing?.slug ?? '',
          ])
          return (
            <Box marginBottom={1} key={index}>
              <Tag
                key={item.title}
                {...(cardUrl.href.startsWith('/')
                  ? {
                      CustomLink: ({ children, ...props }) => (
                        <Link
                          key={item.title}
                          {...props}
                          {...cardUrl}
                          dataTestId="featured-link"
                        >
                          {children}
                        </Link>
                      ),
                    }
                  : { href: cardUrl.href })}
                variant="purple"
                whiteBackground
              >
                {item.title}
              </Tag>
            </Box>
          )
        })}
      </Box>
    </Hidden>
  )
}

export const CardWithFeaturedItems = ({
  heading,
  imgSrc,
  imgAlt = '',
  href,
  dataTestId,
  featuredItems,
  buttonTitle,
}: CardWithFeaturedItemsProps) => {
  return (
    <FocusableBox
      href={href ?? undefined}
      background="purple100"
      borderRadius="large"
      color="purple"
      data-testid={dataTestId}
      className={styles.container}
      justifyContent="spaceBetween"
      padding={3}
      flexDirection={['columnReverse', 'row']}
    >
      <Box display="flex" flexDirection="column" justifyContent="spaceBetween">
        <Box>
          <Text variant="h3" color="purple600" truncate marginBottom={[1, 0]}>
            {heading}
          </Text>
        </Box>
        <Box height="full">
          {featuredItems.length > 0 && (
            <FeaturedItemsLinks featuredItems={featuredItems} />
          )}
        </Box>
        <Box>
          <Button
            variant="text"
            as="span"
            icon="arrowForward"
            size="small"
            colorScheme="purple"
            nowrap
          >
            {buttonTitle || ''}
          </Button>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <img src={imgSrc} alt={imgAlt} className={styles.image} />
      </Box>
    </FocusableBox>
  )
}

export default CardWithFeaturedItems
