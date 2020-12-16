import React from 'react'
import { ServicePortalModuleComponent } from '@island.is/service-portal/core'
import { useLocale } from '@island.is/localization'
import { Box, Text, toast } from '@island.is/island-ui/core'
import { m } from '../../../lib/messages'
import {
  TechnicalContactForm,
  TechnicalContactFormData,
} from '../../../components/Forms/TechnicalContactForm'

const EditTechnicalContact: ServicePortalModuleComponent = ({ userInfo }) => {
  const { formatMessage } = useLocale()

  const handleSubmit = (data: TechnicalContactFormData) => {
    submitFormData(data)
  }

  const submitFormData = async (formData: TechnicalContactFormData) => {
    //TODO: Set up submit
    console.log(formData)
    toast.success('Tæknilegur tengiliður vistaður')
  }
  return (
    <Box marginBottom={[2, 3, 5]}>
      <Box marginBottom={4}>
        <Text variant="h1" as="h1">
          {formatMessage(m.SettingsEditTechnicalContactTitle)}
        </Text>
      </Box>
      <TechnicalContactForm onSubmit={handleSubmit} />
    </Box>
  )
}

export default EditTechnicalContact
