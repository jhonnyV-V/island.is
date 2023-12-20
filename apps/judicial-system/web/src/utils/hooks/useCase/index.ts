import { useContext, useMemo } from 'react'
import { useIntl } from 'react-intl'
import formatISO from 'date-fns/formatISO'
import isNil from 'lodash/isNil'
import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'

import { toast } from '@island.is/island-ui/core'
import {
  CaseTransition,
  NotificationType,
} from '@island.is/judicial-system/types'
import { errors } from '@island.is/judicial-system-web/messages'
import { UserContext } from '@island.is/judicial-system-web/src/components'
import {
  TempCase as Case,
  TempCreateCase as CreateCase,
  TempUpdateCase as UpdateCase,
} from '@island.is/judicial-system-web/src/types'

import { useCreateCaseMutation } from './createCase.generated'
import { useCreateCourtCaseMutation } from './createCourtCase.generated'
import { useExtendCaseMutation } from './extendCase.generated'
import {
  LimitedAccessTransitionCaseMutation,
  useLimitedAccessTransitionCaseMutation,
} from './limitedAccessTransitionCase.generated'
import {
  LimitedAccessUpdateCaseMutation,
  useLimitedAccessUpdateCaseMutation,
} from './limitedAccessUpdateCase.generated'
import { useSendNotificationMutation } from './sendNotification.generated'
import {
  TransitionCaseMutation,
  useTransitionCaseMutation,
} from './transitionCase.generated'
import {
  UpdateCaseMutation,
  useUpdateCaseMutation,
} from './updateCase.generated'

type ChildKeys = Pick<
  UpdateCase,
  | 'courtId'
  | 'prosecutorId'
  | 'sharedWithProsecutorsOfficeId'
  | 'registrarId'
  | 'judgeId'
  | 'appealAssistantId'
  | 'appealJudge1Id'
  | 'appealJudge2Id'
  | 'appealJudge3Id'
>

export type autofillEntry = Partial<UpdateCase> & {
  force?: boolean
}

export type autofillFunc = (
  entries: Array<autofillEntry>,
  workingCase: Case,
  setWorkingCase: React.Dispatch<React.SetStateAction<Case>>,
) => void

function isChildKey(key: keyof UpdateCase): key is keyof ChildKeys {
  return [
    'courtId',
    'prosecutorId',
    'sharedWithProsecutorsOfficeId',
    'registrarId',
    'judgeId',
    'appealAssistantId',
    'appealJudge1Id',
    'appealJudge2Id',
    'appealJudge3Id',
  ].includes(key)
}

const childof: { [Property in keyof ChildKeys]-?: keyof Case } = {
  courtId: 'court',
  prosecutorId: 'prosecutor',
  sharedWithProsecutorsOfficeId: 'sharedWithProsecutorsOffice',
  registrarId: 'registrar',
  judgeId: 'judge',
  appealAssistantId: 'appealAssistant',
  appealJudge1Id: 'appealJudge1',
  appealJudge2Id: 'appealJudge2',
  appealJudge3Id: 'appealJudge3',
}

const overwrite = (update: UpdateCase): UpdateCase => {
  const validUpdates = omitBy<UpdateCase>(update, isUndefined)

  return validUpdates
}

export const fieldHasValue =
  (workingCase: Case) => (value: unknown, key: string) => {
    const theKey = key as keyof UpdateCase // loadash types are not better than this

    if (
      isChildKey(theKey) // check if key is f.example `judgeId`
        ? isNil(workingCase[childof[theKey]])
        : isNil(workingCase[theKey])
    ) {
      return value === undefined
    }

    return true
  }

export const update = (update: UpdateCase, workingCase: Case): UpdateCase => {
  const validUpdates = omitBy<UpdateCase>(update, fieldHasValue(workingCase))

  return validUpdates
}

export const formatUpdates = (
  updates: Array<autofillEntry>,
  workingCase: Case,
) => {
  const changes: UpdateCase[] = updates.map((entry) => {
    if (entry.force) {
      return overwrite(entry)
    }
    return update(entry, workingCase)
  })

  const newWorkingCase = changes.reduce<UpdateCase>(
    (currentUpdates, nextUpdates) => {
      return { ...currentUpdates, ...nextUpdates }
    },
    {} as UpdateCase,
  )

  return newWorkingCase
}

export const formatDateForServer = (date: Date) => {
  return formatISO(date, { representation: 'complete' })
}

const useCase = () => {
  const { limitedAccess } = useContext(UserContext)
  const { formatMessage } = useIntl()

  const [createCaseMutation, { loading: isCreatingCase }] =
    useCreateCaseMutation()

  const [createCourtCaseMutation, { loading: isCreatingCourtCase }] =
    useCreateCourtCaseMutation()

  const [updateCaseMutation, { loading: isUpdatingCase }] =
    useUpdateCaseMutation()

  const [
    limitedAccessUpdateCaseMutation,
    { loading: isLimitedAccessUpdatingCase },
  ] = useLimitedAccessUpdateCaseMutation()

  const [transitionCaseMutation, { loading: isTransitioningCase }] =
    useTransitionCaseMutation()

  const [
    limitedAccessTransitionCaseMutation,
    { loading: isLimitedAccessTransitioningCase },
  ] = useLimitedAccessTransitionCaseMutation()

  const [
    sendNotificationMutation,
    { loading: isSendingNotification, error: sendNotificationError },
  ] = useSendNotificationMutation()

  const [extendCaseMutation, { loading: isExtendingCase }] =
    useExtendCaseMutation()

  const createCase = useMemo(
    () =>
      async (theCase: CreateCase): Promise<Case | undefined> => {
        try {
          if (isCreatingCase === false) {
            const { data } = await createCaseMutation({
              variables: {
                input: {
                  type: theCase.type,
                  indictmentSubtypes: theCase.indictmentSubtypes,
                  description: theCase.description,
                  policeCaseNumbers: theCase.policeCaseNumbers,
                  defenderName: theCase.defenderName,
                  defenderNationalId: theCase.defenderNationalId,
                  defenderEmail: theCase.defenderEmail,
                  defenderPhoneNumber: theCase.defenderPhoneNumber,
                  requestSharedWithDefender: theCase.requestSharedWithDefender,
                  leadInvestigator: theCase.leadInvestigator,
                  crimeScenes: theCase.crimeScenes,
                },
              },
            })

            if (data) {
              return data.createCase as Case
            }
          }
        } catch (error) {
          toast.error(formatMessage(errors.createCase))
        }
      },
    [createCaseMutation, formatMessage, isCreatingCase],
  )

  const createCourtCase = useMemo(
    () =>
      async (
        workingCase: Case,
        setWorkingCase: React.Dispatch<React.SetStateAction<Case>>,
        setCourtCaseNumberErrorMessage: React.Dispatch<
          React.SetStateAction<string>
        >,
      ): Promise<string> => {
        try {
          if (isCreatingCourtCase === false) {
            const { data, errors } = await createCourtCaseMutation({
              variables: { input: { caseId: workingCase.id } },
            })

            if (data?.createCourtCase?.courtCaseNumber && !errors) {
              setWorkingCase((theCase) => ({
                ...theCase,
                courtCaseNumber: (data.createCourtCase as Case).courtCaseNumber,
              }))

              setCourtCaseNumberErrorMessage('')

              return data.createCourtCase.courtCaseNumber
            }
          }
        } catch (error) {
          // Catch all so we can set an eror message
          setCourtCaseNumberErrorMessage(
            'Ekki tókst að stofna nýtt mál, reyndu aftur eða sláðu inn málsnúmer',
          )
        }

        return ''
      },
    [createCourtCaseMutation, isCreatingCourtCase],
  )

  const updateCase = useMemo(
    () => async (id: string, updateCase: UpdateCase) => {
      const mutation = limitedAccess
        ? limitedAccessUpdateCaseMutation
        : updateCaseMutation

      const resultType = limitedAccess
        ? 'limitedAccessUpdateCase'
        : 'updateCase'

      try {
        if (!id || Object.keys(updateCase).length === 0) {
          return
        }

        const { data } = await mutation({
          variables: { input: { id, ...updateCase } },
        })

        const res = data as UpdateCaseMutation & LimitedAccessUpdateCaseMutation

        return res && res[resultType]
      } catch (error) {
        toast.error(formatMessage(errors.updateCase))
      }
    },
    [
      formatMessage,
      limitedAccess,
      limitedAccessUpdateCaseMutation,
      updateCaseMutation,
    ],
  )

  const transitionCase = useMemo(
    () =>
      async (
        caseId: string,
        transition: CaseTransition,
        setWorkingCase?: React.Dispatch<React.SetStateAction<Case>>,
      ): Promise<boolean> => {
        const mutation = limitedAccess
          ? limitedAccessTransitionCaseMutation
          : transitionCaseMutation

        const resultType = limitedAccess
          ? 'limitedAccessTransitionCase'
          : 'transitionCase'

        try {
          const { data } = await mutation({
            variables: {
              input: {
                id: caseId,
                transition,
              },
            },
          })

          const res = data as TransitionCaseMutation &
            LimitedAccessTransitionCaseMutation

          const state = res && res[resultType]?.state
          const appealState = res && res[resultType]?.appealState

          if (!state && !appealState) {
            return false
          }

          if (setWorkingCase) {
            setWorkingCase((theCase) => ({
              ...theCase,
              ...(res[resultType] as Case),
            }))
          }

          return true
        } catch (e) {
          toast.error(formatMessage(errors.transitionCase))
          return false
        }
      },
    [
      limitedAccess,
      limitedAccessTransitionCaseMutation,
      transitionCaseMutation,
      formatMessage,
    ],
  )

  const sendNotification = useMemo(
    () =>
      async (
        id: string,
        notificationType: NotificationType,
        eventOnly?: boolean,
      ): Promise<boolean> => {
        try {
          const { data } = await sendNotificationMutation({
            variables: {
              input: {
                caseId: id,
                type: notificationType,
                eventOnly,
              },
            },
          })
          return Boolean(data?.sendNotification?.notificationSent)
        } catch (e) {
          return false
        }
      },
    [sendNotificationMutation],
  )

  const extendCase = useMemo(
    () => async (id: string) => {
      try {
        const { data } = await extendCaseMutation({
          variables: { input: { id } },
        })

        return data?.extendCase
      } catch (error) {
        toast.error(formatMessage(errors.extendCase))
      }
    },
    [extendCaseMutation, formatMessage],
  )

  const setAndSendCaseToServer = async (
    updates: autofillEntry[],
    workingCase: Case,
    setWorkingCase: React.Dispatch<React.SetStateAction<Case>>,
  ) => {
    try {
      const updatesToCase: autofillEntry = formatUpdates(updates, workingCase)
      delete updatesToCase.force

      if (Object.keys(updatesToCase).length === 0) {
        return
      }

      // The case has not been created
      if (!workingCase.id) {
        setWorkingCase((theCase) => ({ ...theCase, ...updatesToCase }))
        return
      }

      const newWorkingCase = await updateCase(workingCase.id, updatesToCase)

      if (!newWorkingCase) {
        throw new Error()
      }

      setWorkingCase((theCase) => ({ ...theCase, ...(newWorkingCase as Case) }))
    } catch (error) {
      toast.error(formatMessage(errors.updateCase))
    }
  }

  return {
    createCase,
    isCreatingCase,
    createCourtCase,
    isCreatingCourtCase,
    updateCase,
    isUpdatingCase: isUpdatingCase || isLimitedAccessUpdatingCase,
    transitionCase,
    isTransitioningCase:
      isTransitioningCase || isLimitedAccessTransitioningCase,
    sendNotification,
    isSendingNotification,
    sendNotificationError,
    extendCase,
    isExtendingCase,
    setAndSendCaseToServer,
  }
}

export default useCase
