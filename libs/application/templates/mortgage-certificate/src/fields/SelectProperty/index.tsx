import React, { FC, useEffect, useState, useRef } from 'react'
import { FieldBaseProps } from '@island.is/application/types'
import { Box, AlertMessage } from '@island.is/island-ui/core'
import { PropertyTypeSelectField } from './PropertyTypeSelectField'
import { useLocale } from '@island.is/localization'
import { m } from '../../lib/messagess'
import { PropertyTypes } from '../../lib/constants'
import { PropertyTypeSearchField } from './PropertyTypeSearchField'
import { PropertyDetail } from '@island.is/api/schema'
import { useFieldArray, useForm } from 'react-hook-form'
import { MortgageCertificate } from '../../lib/dataSchema'
import { CheckedProperties } from './CheckedProperties'

export const SelectProperty: FC<React.PropsWithChildren<FieldBaseProps>> = (
  props,
) => {
  const { application } = props
  const { control } = useForm<MortgageCertificate>()
  const { externalData } = application
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false)
  const { formatMessage } = useLocale()
  const errorMessage = useRef<HTMLDivElement>(null)
  const [propertyType, setPropertyType] = useState<PropertyTypes | undefined>()
  const { fields, append, remove } = useFieldArray({
    name: 'selectedProperties.properties',
    control,
  })

  const { validation } =
    (externalData.validateMortgageCertificate?.data as {
      validation: {
        propertyNumber: string
        exists: boolean
      }
    }) || {}

  const handleAddProperty = (property: PropertyDetail, index: number) =>
    index >= 0
      ? handleRemoveProperty(index)
      : append({
          propertyNumber: property.propertyNumber ?? '',
          propertyName: property.defaultAddress?.display || '',
        })

  const handleRemoveProperty = (index: number) => remove(index)

  // Display error message if certificate does not exists,
  // that is, an error occured calling Syslumenn api
  if (validation?.propertyNumber && !validation.exists && !showErrorMsg) {
    setShowErrorMsg(true)
  }

  useEffect(() => {
    setTimeout(() => {
      if (errorMessage && errorMessage.current) {
        errorMessage.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }, [showErrorMsg, errorMessage])

  return (
    <>
      <PropertyTypeSelectField
        {...props}
        setPropertyType={setPropertyType}
        propertyType={propertyType}
      />
      <PropertyTypeSearchField
        {...props}
        propertyType={propertyType}
        checkedProperties={fields}
        setCheckedProperties={handleAddProperty}
      />

      {showErrorMsg ? (
        <Box ref={errorMessage} paddingTop={5} paddingBottom={5}>
          <AlertMessage
            type="error"
            title={formatMessage(m.errorSheriffApiTitle)}
            message={formatMessage(m.errorSheriffApiMessage)}
          />
        </Box>
      ) : null}
      {!!fields.length && (
        <CheckedProperties
          {...props}
          properties={fields}
          handleRemoveProperty={handleRemoveProperty}
        />
      )}
    </>
  )
}
