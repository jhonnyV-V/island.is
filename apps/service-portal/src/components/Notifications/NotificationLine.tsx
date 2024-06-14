import { FC, useRef } from 'react'
import { Box, Text } from '@island.is/island-ui/core'
import { dateFormat } from '@island.is/shared/constants'
import { LinkResolver } from '@island.is/service-portal/core'
import format from 'date-fns/format'
import cn from 'classnames'
import * as styles from './Notifications.css'
import {
  NotificationMessage,
  NotificationMetadata,
  NotificationSender,
} from '@island.is/api/schema'
import { AvatarImage } from '@island.is/service-portal/documents'
import { resolveLink } from '@island.is/service-portal/information'

interface Props {
  data: {
    metadata: NotificationMetadata
    message: Omit<NotificationMessage, 'body'>
    sender: NotificationSender
  }
  onClickCallback: () => void
}

export const NotificationLine = ({ data, onClickCallback }: Props) => {
  const date = data.metadata?.created
    ? format(new Date(data.metadata.created), dateFormat.is)
    : ''

  const isRead = data.metadata?.read

  return (
    <Box className={styles.lineWrapper}>
      <LinkResolver
        className={styles.link}
        href={resolveLink(data.message?.link)}
        callback={onClickCallback}
      >
        <Box
          display="flex"
          position="relative"
          borderColor="blue200"
          borderBottomWidth="standard"
          paddingX={2}
          width="full"
          className={cn(styles.line, {
            [styles.unread]: !isRead,
          })}
        >
          {data.sender?.logoUrl ? (
            <AvatarImage
              img={data.sender.logoUrl}
              background={!isRead ? 'white' : 'blue100'}
              as="div"
              imageClass={styles.img}
            />
          ) : undefined}
          <Box
            width="full"
            display="flex"
            flexDirection="column"
            paddingLeft={2}
            minWidth={0}
          >
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="spaceBetween"
            >
              <Text
                fontWeight={isRead ? 'regular' : 'medium'}
                variant="medium"
                color="blue400"
                truncate
              >
                {data.message.title}
              </Text>
              <Text variant="small">{date}</Text>
            </Box>
            <Box
              marginTop={1}
              display="flex"
              flexDirection="row"
              justifyContent="spaceBetween"
            >
              <Text variant="small">{data.message.displayBody}</Text>
            </Box>
          </Box>
        </Box>
      </LinkResolver>
    </Box>
  )
}

export default NotificationLine
