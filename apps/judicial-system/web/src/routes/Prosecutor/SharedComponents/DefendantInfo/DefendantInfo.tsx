import React, { useEffect, useState } from 'react'
import InputMask from 'react-input-mask'
import { useIntl } from 'react-intl'
import { ValueType } from 'react-select'

import {
  Defendant,
  Gender,
  UpdateDefendant,
} from '@island.is/judicial-system/types'
import { BlueBox } from '@island.is/judicial-system-web/src/components'
import {
  Box,
  Checkbox,
  GridColumn,
  GridContainer,
  GridRow,
  Icon,
  Input,
  Select,
  Text,
} from '@island.is/island-ui/core'
import {
  defendant as defendantMessages,
  core,
} from '@island.is/judicial-system-web/messages'
import { Validation } from '@island.is/judicial-system-web/src/utils/validate'
import {
  removeErrorMessageIfValid,
  validateAndSetErrorMessage,
} from '@island.is/judicial-system-web/src/utils/formHelper'
import { ReactSelectOption } from '@island.is/judicial-system-web/src/types'
import useNationalRegistry from '@island.is/judicial-system-web/src/utils/hooks/useNationalRegistry'

interface Props {
  defendant: Defendant
  onChange: (
    defendantId: string,
    updatedDefendant: UpdateDefendant,
  ) => Promise<void>
  updateDefendantState: (defendantId: string, update: UpdateDefendant) => void
  onDelete?: (defendant: Defendant) => Promise<void>
}

const DefendantInfo: React.FC<Props> = (props) => {
  const { defendant, onDelete, onChange, updateDefendantState } = props
  const { formatMessage } = useIntl()
  const { person, error } = useNationalRegistry(defendant.nationalId)

  const genderOptions: ReactSelectOption[] = [
    { label: formatMessage(core.male), value: Gender.MALE },
    { label: formatMessage(core.female), value: Gender.FEMALE },
    { label: formatMessage(core.otherGender), value: Gender.OTHER },
  ]

  const [nationalIdErrorMessage, setNationalIdErrorMessage] = useState<string>(
    '',
  )
  const [nationalIdNotFound, setNationalIdNotFound] = useState<boolean>(false)

  const [
    accusedNameErrorMessage,
    setAccusedNameErrorMessage,
  ] = useState<string>('')

  const [
    accusedAddressErrorMessage,
    setAccusedAddressErrorMessage,
  ] = useState<string>('')

  const mapNationalRegistryGenderToGender = (gender: string) => {
    return gender === 'male'
      ? Gender.MALE
      : gender === 'female'
      ? Gender.FEMALE
      : Gender.OTHER
  }

  useEffect(() => {
    if (error || person?.items.length === 0) {
      setNationalIdNotFound(true)
      return
    }

    if (person && person.items.length > 0) {
      setAccusedNameErrorMessage('')
      setAccusedAddressErrorMessage('')
      setNationalIdErrorMessage('')

      onChange(defendant.id, {
        name: person.items[0].name,
        gender: mapNationalRegistryGenderToGender(person.items[0].gender),
        address: person.items[0].permanent_address.street.nominative,
      })
    }
  }, [person])

  return (
    <BlueBox>
      <Box marginBottom={2} display="flex" justifyContent="flexEnd">
        {onDelete && (
          <button
            onClick={() => onDelete(defendant)}
            aria-label="Remove defendant"
          >
            <Icon icon="close" color="blue400" />
          </button>
        )}
      </Box>
      <Box marginBottom={2}>
        <Checkbox
          name={`noNationalId-${Math.random()}`}
          label={formatMessage(
            defendantMessages.sections.defendantInfo
              .doesNotHaveIcelandicNationalId,
          )}
          checked={defendant.noNationalId}
          onChange={() => {
            updateDefendantState(defendant.id, {
              noNationalId: !defendant.noNationalId,
              nationalId: undefined,
            })

            onChange(defendant.id, {
              noNationalId: !defendant.noNationalId,
              nationalId: undefined,
            })
          }}
          filled
          large
        />
      </Box>
      <Box marginBottom={2}>
        <InputMask
          mask={defendant.noNationalId ? '99.99.9999' : '999999-9999'}
          maskPlaceholder={null}
          value={defendant.nationalId ?? ''}
          onChange={(evt) => {
            setNationalIdErrorMessage('')
            setNationalIdNotFound(false)
            removeErrorMessageIfValid(
              defendant.noNationalId
                ? ['empty', 'date-of-birth']
                : ['empty', 'national-id'],
              evt.target.value,
              nationalIdErrorMessage,
              setNationalIdErrorMessage,
            )

            updateDefendantState(defendant.id, {
              nationalId: evt.target.value,
            })
          }}
          onBlur={async (evt) => {
            validateAndSetErrorMessage(
              defendant.noNationalId
                ? ['empty', 'date-of-birth']
                : ['empty', 'national-id'],
              evt.target.value,
              setNationalIdErrorMessage,
            )

            onChange(defendant.id, { nationalId: evt.target.value })
          }}
        >
          <Input
            data-testid="nationalId"
            name="accusedNationalId"
            autoComplete="off"
            label={formatMessage(
              defendant.noNationalId ? core.dateOfBirth : core.nationalId,
            )}
            placeholder={formatMessage(
              defendant.noNationalId
                ? core.dateOfBirthPlaceholder
                : core.nationalId,
            )}
            errorMessage={nationalIdErrorMessage}
            hasError={nationalIdErrorMessage !== ''}
            required
          />
        </InputMask>
        {defendant.nationalId?.length === 11 && nationalIdNotFound && (
          <Text color="red600" variant="eyebrow" marginTop={1}>
            {formatMessage(core.nationalIdNotFoundInNationalRegistry)}
          </Text>
        )}
      </Box>
      <Box marginBottom={2}>
        <Input
          data-testid="accusedName"
          name="accusedName"
          autoComplete="off"
          label={formatMessage(core.fullName)}
          placeholder={formatMessage(core.fullName)}
          value={defendant.name ?? ''}
          errorMessage={accusedNameErrorMessage}
          hasError={accusedNameErrorMessage !== ''}
          onChange={(evt) => {
            removeErrorMessageIfValid(
              ['empty'] as Validation[],
              evt.target.value,
              accusedNameErrorMessage,
              setAccusedNameErrorMessage,
            )

            updateDefendantState(defendant.id, {
              name: evt.target.value,
            })
          }}
          onBlur={(evt) => {
            validateAndSetErrorMessage(
              ['empty'] as Validation[],
              evt.target.value,
              setAccusedNameErrorMessage,
            )

            onChange(defendant.id, { name: evt.target.value })
          }}
          required
        />
      </Box>
      <Box marginBottom={2}>
        <Input
          data-testid="accusedAddress"
          name="accusedAddress"
          autoComplete="off"
          label={formatMessage(core.addressOrResidence)}
          placeholder={formatMessage(core.addressOrResidence)}
          value={defendant.address ?? ''}
          errorMessage={accusedAddressErrorMessage}
          hasError={
            Boolean(accusedAddressErrorMessage) &&
            accusedAddressErrorMessage !== ''
          }
          onChange={(evt) => {
            removeErrorMessageIfValid(
              ['empty'] as Validation[],
              evt.target.value,
              accusedAddressErrorMessage,
              setAccusedAddressErrorMessage,
            )

            updateDefendantState(defendant.id, {
              address: evt.target.value,
            })
          }}
          onBlur={(evt) => {
            validateAndSetErrorMessage(
              ['empty'] as Validation[],
              evt.target.value,
              setAccusedAddressErrorMessage,
            )

            onChange(defendant.id, { address: evt.target.value })
          }}
          required
        />
      </Box>
      <GridContainer>
        <GridRow>
          <GridColumn span="6/12">
            <Select
              name="defendantGender"
              placeholder={formatMessage(core.selectGender)}
              options={genderOptions}
              label={formatMessage(core.gender)}
              value={genderOptions.find(
                (option) => option.value === defendant.gender,
              )}
              onChange={(selectedOption: ValueType<ReactSelectOption>) =>
                onChange(defendant.id, {
                  gender: (selectedOption as ReactSelectOption).value as Gender,
                })
              }
              required
            />
          </GridColumn>
          <GridColumn span="6/12">
            <Input
              name="defendantCitizenship"
              autoComplete="off"
              label={formatMessage(core.citizenship)}
              placeholder={formatMessage(core.selectCitizenship)}
              value={defendant.citizenship ?? ''}
              onChange={(evt) => {
                updateDefendantState(defendant.id, {
                  citizenship: evt.target.value,
                })
              }}
              onBlur={(evt) => {
                onChange(defendant.id, { citizenship: evt.target.value })
              }}
            />
          </GridColumn>
        </GridRow>
      </GridContainer>
    </BlueBox>
  )
}

export default DefendantInfo
