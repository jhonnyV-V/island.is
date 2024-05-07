import React, { isValidElement } from 'react'
import { FormattedDate } from 'react-intl'
import { ColorValue, Image, ImageSourcePropType } from 'react-native'
import styled, { useTheme } from 'styled-components/native'
import { dynamicColor } from '../../utils/dynamic-color'
import { Typography } from '../typography/typography'

const Host = styled.TouchableHighlight<{ unread?: boolean }>`
  background-color: ${dynamicColor((props) => ({
    dark: props.unread ? 'shade100' : 'transparent',
    light: props.unread ? props.theme.color.blue100 : 'transparent',
  }))};
`

const Cell = styled.View`
  flex-direction: row;
  padding-horizontal: ${({ theme }) => theme.spacing[2]}px;
  padding-vertical: ${({ theme }) => theme.spacing[3]}px;
  border-bottom-width: ${({ theme }) => theme.border.width.standard}px;
  border-bottom-color: ${dynamicColor(
    ({ theme }) => ({
      light: theme.color.blue200,
      dark: theme.shades.dark.shade300,
    }),
    true,
  )};
`

const Container = styled.View`
  flex-direction: column;
`

const Icon = styled.View<{ unread?: boolean }>`
  margin-right: ${({ theme }) => theme.spacing[2]}px;
  background-color: ${({ theme, unread }) =>
    unread ? theme.color.white : theme.color.blue100};
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.border.radius.circle};
  flex-direction: column;
`

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.smallGutter}px;
`

const Date = styled.View`
  flex-direction: row;
  align-items: center;
`

interface CardProps {
  id: number
  icon?: ImageSourcePropType | React.ReactNode
  date?: Date
  title: string
  message: string
  unread?: boolean
  actions?: Array<{ text: string; onPress(): void }>
  underlayColor?: ColorValue
  testID?: string
  onPress(id: number): void
}

export function NotificationCard({
  id,
  onPress,
  title,
  message,
  date,
  icon,
  unread,
  underlayColor,
  testID,
}: CardProps) {
  const theme = useTheme()

  return (
    <Host
      onPress={() => onPress(id)}
      underlayColor={
        underlayColor ?? theme.isDark ? theme.shade.shade200 : '#EBEBFA'
      }
      unread={unread}
      testID={testID}
    >
      <Cell>
        {icon && isValidElement(icon) ? (
          icon
        ) : icon ? (
          <Icon unread={unread}>
            <Image
              source={icon as ImageSourcePropType}
              style={{ width: 16, height: 16 }}
            />
          </Icon>
        ) : null}
        <Container>
          <Row>
            <Typography variant="heading5">{title}</Typography>
            {date && (
              <Date>
                <Typography variant="body3">
                  <FormattedDate value={date} />
                </Typography>
              </Date>
            )}
          </Row>
          <Typography>{message}</Typography>
        </Container>
      </Cell>
    </Host>
  )
}
