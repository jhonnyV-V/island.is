import React, { FC } from 'react'
import { FieldBaseProps } from '@island.is/application/types'
import { PropertyTypes } from '../../lib/constants'
import { useLocale } from '@island.is/localization'
import { propertySearch } from '../../lib/messages'
import { Box, Text } from '@island.is/island-ui/core'
import { InputController } from '@island.is/shared/form-fields'
import { getValueViaPath } from '@island.is/application/core'
import { SelectedProperty } from '../../shared'

export const PropertiesOverview: FC<
  React.PropsWithChildren<FieldBaseProps>
> = ({ application, field }) => {
  const { formatMessage } = useLocale()
  const properties = getValueViaPath(
    application.answers,
    'selectedProperties.properties',
    [],
  ) as SelectedProperty[]

  return (
    <Box paddingTop={3}>
      <Text variant="h3" paddingBottom={1}>
        Valdar eignir
      </Text>
      {properties.map((property, index) => {
        return (
          <Box
            display="flex"
            justifyContent="spaceBetween"
            alignItems="center"
            paddingBottom={1}
            key={`${property.propertyNumber}-${index}`}
          >
            <Box width="full" paddingRight={1}>
              <InputController
                id={`${property.propertyNumber}-${index}`}
                label="Valin eign"
                defaultValue={property.propertyName}
                readOnly
              />
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
