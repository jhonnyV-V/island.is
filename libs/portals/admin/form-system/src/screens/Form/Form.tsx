import { useLoaderData } from 'react-router-dom'
import { Profiler, useCallback, useEffect, useReducer, useState } from 'react'
import {
  ButtonTypes,
  InputButton,
  NavbarSelectStatus,
} from '../../lib/utils/interfaces'
import { FormLoaderResponse } from './Form.loader'
import { ControlState, controlReducer } from '../../hooks/controlReducer'
import { baseSettingsStep } from '../../utils/getBaseSettingsStep'
import { defaultStep } from '../../utils/defaultStep'
import ControlContext, { IControlContext } from '../../context/ControlContext'
import {
  GridRow as Row,
  GridColumn as Column,
  Box,
} from '@island.is/island-ui/core'
import Navbar from '../../components/Navbar/Navbar'
import { FormSystemForm, FormSystemStep } from '@island.is/api/schema'
import MainContent from '../../components/MainContent/MainContent'
import { useFormSystemUpdateGroupMutation } from '../../gql/Group.generated'
import { useFormSystemUpdateStepMutation } from '../../gql/Step.generated'
import { useFormSystemUpdateInputMutation } from '../../gql/Input.generated'
import { updateActiveItemFn } from '../../lib/utils/updateActiveItem'
import { useFormSystemUpdateFormMutation } from '../../gql/Form.generated'
import { ActiveItem, ItemType } from '../../lib/utils/interfaces'
import { updateDnd } from '../../lib/utils/updateDnd'
import { entireFormUpdate } from '../../lib/utils/updateForm'
import { removeTypename } from '../../lib/utils/removeTypename'
import NavbarSelect from '../../components/NavbarSelect/NavbarSelect'
import { useFormSystemUpdateFormSettingsMutation } from '../../gql/FormSettings.generated'
import { updateSettings as us } from '../../lib/utils/updateFormSettings'
import { useFormSystemGetTranslationMutation } from '../../gql/Service.generated'
import { text } from 'stream/consumers'
import { translate as translationStation } from '../../lib/utils/translation'

const Form = () => {
  const { formBuilder } = useLoaderData() as FormLoaderResponse
  const { form, applicantTypes, documentTypes, inputTypes, listTypes } =
    formBuilder
  const [focus, setFocus] = useState<string>('')
  const [inSettings, setInSettings] = useState(form?.name?.is === '')
  const [inListBuilder, setInListBuilder] = useState(false)
  const [selectStatus, setSelectStatus] = useState<NavbarSelectStatus>(
    NavbarSelectStatus.OFF,
  )

  const [updateStep] = useFormSystemUpdateStepMutation()
  const [updateGroup] = useFormSystemUpdateGroupMutation()
  const [updateInput] = useFormSystemUpdateInputMutation()
  const [updateForm] = useFormSystemUpdateFormMutation()
  const [updateFormSettings] = useFormSystemUpdateFormSettingsMutation()
  const [getTranslation] = useFormSystemGetTranslationMutation()

  const initialControl: ControlState = {
    activeItem: {
      type: 'Step',
      data: inSettings
        ? baseSettingsStep
        : removeTypename(form?.stepsList)?.find(
          (s: FormSystemStep) => s?.type === 'Innsláttur',
        ) ?? defaultStep,
    },
    activeListItem: null,
    form: removeTypename(form) as FormSystemForm,
  }
  const [control, controlDispatch] = useReducer(controlReducer, initialControl)

  const updateActiveItem = useCallback(
    (updatedActiveItem?: ActiveItem) =>
      updateActiveItemFn(
        control.activeItem,
        updateStep,
        updateGroup,
        updateInput,
        updatedActiveItem,
      ),
    [control.activeItem, updateStep, updateGroup, updateInput],
  )

  const translate = (text: string) => translationStation(text, getTranslation)
  const translationButtons = (
    text: string,
    type: ButtonTypes,
  ): InputButton[] => {
    if (type === 'SET_MESSAGE_WITH_LINK_SETTINGS') {
      return [
        {
          label: 'Translate',
          name: 'reader',
          onClick: async () => {
            const translation = await translate(text)
            controlDispatch({
              type: type,
              payload: {
                property: 'buttonText',
                lang: 'en',
                value: translation,
              },
            })
          },
        },
      ]
    }
    return [
      {
        label: 'Translate',
        name: 'reader',
        onClick: async () => {
          const translation = await translate(text)
          controlDispatch({
            type: type,
            payload: {
              lang: 'en',
              newValue: translation,
            },
          })
        },
      },
    ]
  }

  const updateDragAndDrop = (type: ItemType) =>
    updateDnd(type, control, updateForm)

  const updateSettings = (updatedForm?: FormSystemForm) =>
    us(control, updatedForm, updateFormSettings)

  const formUpdate = (updatedForm?: FormSystemForm) =>
    entireFormUpdate(control, updateForm, updatedForm)


  const context: IControlContext = {
    control,
    controlDispatch,
    applicantTypes,
    documentTypes,
    inputTypes,
    listTypes,
    setInSettings,
    inSettings,
    updateActiveItem,
    focus,
    setFocus,
    updateDnD: updateDragAndDrop,
    selectStatus,
    setSelectStatus,
    formUpdate,
    inListBuilder,
    setInListBuilder,
    updateSettings,
    translate,
    translationButtons,
  }

  if (!form) {
    return <div>Loading...</div>
  }
  return (
    <ControlContext.Provider value={context}>
      <Row>
        <Column span="3/12">
          {selectStatus !== NavbarSelectStatus.OFF ? (
            <NavbarSelect />
          ) : (
            <Navbar />
          )}
        </Column>
        <Column span="9/12">
          <Box
            border="standard"
            borderRadius="standard"
            width="full"
            marginTop={5}
            style={{ minHeight: '500px' }}
          >
            <MainContent />
          </Box>
        </Column>
      </Row>
    </ControlContext.Provider>
  )
}

export default Form
