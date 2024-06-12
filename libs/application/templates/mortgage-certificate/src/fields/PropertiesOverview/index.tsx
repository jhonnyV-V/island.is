import React, { FC, useEffect, useState } from 'react'
import { FieldBaseProps } from '@island.is/application/types'
import { useLocale } from '@island.is/localization'
import { overview } from '../../lib/messages'
import { Box, Text } from '@island.is/island-ui/core'
import { InputController } from '@island.is/shared/form-fields'
import { getValueViaPath } from '@island.is/application/core'
import { SelectedProperty } from '../../shared'
import { gql, useLazyQuery } from '@apollo/client'
import { VALIDATE_MORTGAGE_CERTIFICATE_QUERY } from '../../graphql/queries'

export const validateMortgageCertificateQuery = gql`
  ${VALIDATE_MORTGAGE_CERTIFICATE_QUERY}
`

export const PropertiesOverview: FC<
  React.PropsWithChildren<FieldBaseProps>
> = ({ application }) => {
  const { formatMessage } = useLocale()
  const properties = getValueViaPath(
    application.answers,
    'selectedProperties.properties',
    [],
  ) as SelectedProperty[]
  const [propertiesShown, setPropertiesShown] = useState<
    (SelectedProperty & { exists: boolean; hasKMarking: boolean })[] | undefined
  >(undefined)
  const [incorrectPropertiesSent, setIncorrectPropertiesSent] = useState<
    SelectedProperty[]
  >(
    getValueViaPath(
      application.answers,
      'incorrectPropertiesSent',
      [],
    ) as SelectedProperty[],
  )

  const [runQuery, { loading }] = useLazyQuery(
    validateMortgageCertificateQuery,
    {
      onCompleted(result) {
        // setShowSearchError(false)
        // console.log(result)
        // setFoundProperties(result.searchForAllProperties)
      },
      onError() {
        // setShowSearchError(true)
        // setFoundProperties(undefined)
      },
    },
  )

  useEffect(() => {
    properties.map(({ propertyNumber, propertyName }) => {
      return null
    })
  }, [properties])

  return (
    <Box paddingTop={1}>
      <Text variant="h4" paddingBottom={3}>
        {formatMessage(overview.general.description)}
      </Text>
      {properties.map((property, index) => {
        return (
          <Box paddingBottom={2} key={`${property.propertyNumber}-${index}`}>
            <InputController
              id={`${property.propertyNumber}-${index}`}
              label="Valin eign"
              defaultValue={property.propertyName}
              readOnly
            />
          </Box>
        )
      })}
    </Box>
  )
}
