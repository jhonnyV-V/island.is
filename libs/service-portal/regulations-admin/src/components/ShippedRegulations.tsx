import React from 'react'

import { ISODate, RegName } from '@island.is/regulations'
import { gql, useQuery } from '@apollo/client'
import { Query } from '@island.is/api/schema'
import { Box, Stack, Text, TopicCard } from '@island.is/island-ui/core'
// import { mockShippedList, useMockQuery } from '../_mockData'
import { homeMessages as msg } from '../messages'
import { prettyName } from '@island.is/regulations'
import { useLocale } from '../utils'

const ShippedRegulationsQuery = gql`
  query ShippedRegulationsQuery {
    getShippedRegulations {
      id
      name
      title
      idealPublishDate
    }
  }
`

// const ShippedRegulationsQuery = gql`
//   query ShippedRegulationsQuery {
//     getShippedRegulations
//   }
// `

export const ShippedRegulations = () => {
  const { formatMessage, formatDateFns } = useLocale()
  // const { data, loading } = useMockQuery({
  //   shippedRegulations: mockShippedList,
  // })
  const { data, loading } = useQuery<Query>(ShippedRegulationsQuery)

  const getShippedRegulations = data?.getShippedRegulations || []

  if (loading) {
    return null
  }
  if (getShippedRegulations.length === 0) {
    return null
  }

  return (
    <Box marginTop={[4, 4, 8]}>
      <Text variant="h3" as="h2" marginBottom={[2, 2, 3]}>
        {formatMessage(msg.shippedTitle)}
      </Text>
      <Stack space={2}>
        {getShippedRegulations.map((shipped) => {
          // @ts-expect-error  (DraftRegulationModel uses string|undefined — at the moment)
          const name: RegName | undefined = shipped.name

          return (
            <TopicCard
              key={shipped.id}
              tag={formatDateFns(shipped.idealPublishDate as ISODate)}
              onClick={() => undefined}
            >
              {name && prettyName(name)} {shipped.title}
            </TopicCard>
          )
        })}
      </Stack>
    </Box>
  )
}
