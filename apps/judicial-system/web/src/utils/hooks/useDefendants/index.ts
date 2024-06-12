import React, { SetStateAction, useCallback } from 'react'
import { useIntl } from 'react-intl'

import { toast } from '@island.is/island-ui/core'
import { errors } from '@island.is/judicial-system-web/messages'
import {
  CreateDefendantInput,
  Defendant,
  UpdateDefendantInput,
} from '@island.is/judicial-system-web/src/graphql/schema'
import { TempCase as Case } from '@island.is/judicial-system-web/src/types'

import { useCreateDefendantMutation } from './createDefendant.generated'
import { useDeleteDefendantMutation } from './deleteDefendant.generated'
import { useUpdateDefendantMutation } from './updateDefendant.generated'

const useDefendants = () => {
  const { formatMessage } = useIntl()

  const [createDefendantMutation, { loading: isCreatingDefendant }] =
    useCreateDefendantMutation()
  const [deleteDefendantMutation] = useDeleteDefendantMutation()
  const [updateDefendantMutation] = useUpdateDefendantMutation()

  const createDefendant = useCallback(
    async (defendant: CreateDefendantInput) => {
      try {
        if (!isCreatingDefendant) {
          const { data } = await createDefendantMutation({
            variables: {
              input: defendant,
            },
          })

          if (data) {
            return data.createDefendant?.id
          }
        }
      } catch (error) {
        toast.error(formatMessage(errors.createDefendant))
      }
    },
    [createDefendantMutation, formatMessage, isCreatingDefendant],
  )

  const deleteDefendant = useCallback(
    async (caseId: string, defendantId: string) => {
      try {
        const { data } = await deleteDefendantMutation({
          variables: { input: { caseId, defendantId } },
        })

        if (data?.deleteDefendant?.deleted) {
          return true
        } else {
          return false
        }
      } catch (error) {
        formatMessage(errors.deleteDefendant)
      }
    },
    [deleteDefendantMutation, formatMessage],
  )

  const updateDefendant = useCallback(
    async (updateDefendant: UpdateDefendantInput) => {
      try {
        const { data } = await updateDefendantMutation({
          variables: {
            input: updateDefendant,
          },
        })

        if (data) {
          return true
        } else {
          return false
        }
      } catch (error) {
        toast.error(formatMessage(errors.updateDefendant))
      }
    },
    [formatMessage, updateDefendantMutation],
  )

  const updateDefendantState = useCallback(
    (
      update: UpdateDefendantInput,
      setWorkingCase: React.Dispatch<React.SetStateAction<Case>>,
    ) => {
      setWorkingCase((prevWorkingCase: Case) => {
        if (!prevWorkingCase.defendants) {
          return prevWorkingCase
        }
        const indexOfDefendantToUpdate = prevWorkingCase.defendants.findIndex(
          (defendant) => defendant.id === update.defendantId,
        )

        const newDefendants = [...prevWorkingCase.defendants]

        newDefendants[indexOfDefendantToUpdate] = {
          ...newDefendants[indexOfDefendantToUpdate],
          ...update,
        } as Defendant

        return { ...prevWorkingCase, defendants: newDefendants }
      })
    },
    [],
  )

  const setAndSendDefendantToServer = useCallback(
    (
      update: UpdateDefendantInput,
      setWorkingCase: React.Dispatch<SetStateAction<Case>>,
    ) => {
      updateDefendantState(update, setWorkingCase)
      updateDefendant(update)
    },
    [updateDefendant, updateDefendantState],
  )

  return {
    createDefendant,
    deleteDefendant,
    updateDefendant,
    updateDefendantState,
    setAndSendDefendantToServer,
  }
}

export default useDefendants
