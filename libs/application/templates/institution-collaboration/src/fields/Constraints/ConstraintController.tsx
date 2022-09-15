import { Box, Checkbox, Input, Stack } from '@island.is/island-ui/core'
import { Controller, useFormContext } from 'react-hook-form'
import React, { FC, useEffect, useState } from 'react'

interface Props {
  id: string
  checkboxId: string
  label: string
  placeholder?: string
  defaultValue?: boolean
  extraText?: boolean
}
const ConstraintController: FC<Props> = ({
  id,
  checkboxId,
  label,
  placeholder,
  defaultValue,
  extraText,
}) => {
  const { register, setValue } = useFormContext()
  const [isChecked, setIsChecked] = useState(defaultValue)
  const [textValue, setTextValue] = useState('')

  function shouldClearText(value: boolean) {
    if (!value) {
      setValue(id, '')
      setTextValue('')
      // // Update straight away
      // const textArea = document.getElementById(id) as HTMLInputElement | null
      // if (textArea) {
      //   textArea.value = ''
      // }
    }
  }

  return (
    <Stack space={2}>
      <Box background="white">
        <Controller
          name={checkboxId}
          defaultValue={defaultValue}
          render={({ value, onChange }) => {
            return (
              <Checkbox
                onChange={(e) => {
                  onChange(e.target.checked)
                  setValue(checkboxId as string, e.target.checked)
                  setIsChecked(e.target.checked)
                  shouldClearText(e.target.checked)
                }}
                checked={value}
                name={checkboxId}
                label={label}
                large
              />
            )
          }}
        />
      </Box>
      {isChecked && extraText && (
        <Input
          onChange={(e) => setTextValue(e.target.value)}
          placeholder={placeholder}
          backgroundColor="blue"
          type="text"
          name={id}
          id={id}
          label={label}
          textarea
          rows={5}
          maxLength={250}
          ref={register}
          value={textValue}
        />
      )}
    </Stack>
  )
}

export default ConstraintController
