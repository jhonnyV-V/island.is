import React from 'react'
import styled from 'styled-components/native'
import { dynamicColor } from '../../utils'
import { Skeleton } from './skeleton'

const Host = styled.SafeAreaView`
  position: relative;
  flex-direction: row;
  border-bottom-width: ${({ theme }) => theme.border.width.standard}px;
  border-bottom-color: ${dynamicColor(
    ({ theme }) => ({
      light: theme.color.blue200,
      dark: theme.shades.dark.shade400,
    }),
    true,
  )};
`

const Icon = styled.View`
  align-items: center;
  justify-content: center;
`

const Circle = styled.View`
  margin-vertical: ${({ theme }) => theme.spacing[3]}px;
  margin-horizontal: ${({ theme }) => theme.spacing[2]}px;
  height: 42px;
  width: 42px;
  border-radius: 50px;
  background-color: ${dynamicColor(({ theme }) => ({
    dark: theme.shades.dark.shade100,
    light: theme.color.dark100,
  }))};
`

const Content = styled.View`
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: ${({ theme }) => theme.spacing[3]}px;
  padding-top: ${({ theme }) => theme.spacing[3]}px;
  margin-right: ${({ theme }) => theme.spacing[2]}px;
`

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing[2]}px;
`

const Title = styled.View`
  flex: 1;
  padding-right: ${({ theme }) => theme.spacing[8]}px;
`

const Date = styled.View`
  width: 65px;
`

const Message = styled.View`
  width: 100%;
  padding-bottom: ${({ theme }) => theme.spacing[1]}px;
`

export function ListItemSkeleton() {
  return (
    <Host>
      <Icon>
        <Circle />
      </Icon>
      <Content>
        <Row>
          <Title>
            <Skeleton active style={{ borderRadius: 4 }} height={17} />
          </Title>
          <Date>
            <Skeleton active style={{ borderRadius: 4 }} height={17} />
          </Date>
        </Row>
        <Message>
          <Skeleton active style={{ borderRadius: 4 }} height={17} />
        </Message>
      </Content>
    </Host>
  )
}
