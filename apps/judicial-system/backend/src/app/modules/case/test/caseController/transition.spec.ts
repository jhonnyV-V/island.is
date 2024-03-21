import each from 'jest-each'
import { Transaction } from 'sequelize'
import { uuid } from 'uuidv4'

import { MessageService, MessageType } from '@island.is/judicial-system/message'
import {
  CaseAppealRulingDecision,
  CaseAppealState,
  CaseFileCategory,
  CaseFileState,
  CaseOrigin,
  CaseState,
  CaseTransition,
  completedCaseStates,
  indictmentCases,
  investigationCases,
  isIndictmentCase,
  restrictionCases,
  User,
} from '@island.is/judicial-system/types'

import { createTestingCaseModule } from '../createTestingCaseModule'

import { nowFactory } from '../../../../factories'
import { randomDate } from '../../../../test'
import { include, order } from '../../case.service'
import { TransitionCaseDto } from '../../dto/transitionCase.dto'
import { Case } from '../../models/case.model'

jest.mock('../../../factories')

interface Then {
  result: Case
  error: Error
}

type GivenWhenThen = (
  caseId: string,
  theCase: Case,
  transition: TransitionCaseDto,
) => Promise<Then>

describe('CaseController - Transition', () => {
  const date = randomDate()
  const userId = uuid()
  const defaultUser = { id: userId, canConfirmIndictment: false } as User

  let mockMessageService: MessageService
  let transaction: Transaction
  let mockCaseModel: typeof Case
  let givenWhenThen: GivenWhenThen

  beforeEach(async () => {
    const { messageService, sequelize, caseModel, caseController } =
      await createTestingCaseModule()

    mockMessageService = messageService
    mockCaseModel = caseModel

    const mockTransaction = sequelize.transaction as jest.Mock
    transaction = {} as Transaction
    mockTransaction.mockImplementationOnce(
      (fn: (transaction: Transaction) => unknown) => fn(transaction),
    )

    const mockToday = nowFactory as jest.Mock
    mockToday.mockReturnValue(date)
    const mockUpdate = mockCaseModel.update as jest.Mock
    mockUpdate.mockResolvedValue([1])

    givenWhenThen = async (
      caseId: string,
      theCase: Case,
      transition: TransitionCaseDto,
    ) => {
      const then = {} as Then

      try {
        then.result = await caseController.transition(
          caseId,
          {
            ...defaultUser,
            canConfirmIndictment: isIndictmentCase(theCase.type),
          },
          theCase,
          transition,
        )
      } catch (error) {
        then.error = error as Error
      }

      return then
    }
  })

  each`
      transition                | oldState                                  | newState
      ${CaseTransition.OPEN}    | ${CaseState.NEW}                          | ${CaseState.DRAFT}
      ${CaseTransition.SUBMIT}  | ${CaseState.DRAFT}                        | ${CaseState.SUBMITTED}
      ${CaseTransition.SUBMIT}  | ${CaseState.WAITING_FOR_CONFIRMATION}     | ${CaseState.SUBMITTED}
      ${CaseTransition.RECEIVE} | ${CaseState.SUBMITTED}                    | ${CaseState.RECEIVED}
      ${CaseTransition.ACCEPT}  | ${CaseState.RECEIVED}                     | ${CaseState.ACCEPTED}
      ${CaseTransition.REJECT}  | ${CaseState.RECEIVED}                     | ${CaseState.REJECTED}
      ${CaseTransition.DISMISS} | ${CaseState.RECEIVED}                     | ${CaseState.DISMISSED}
      ${CaseTransition.DELETE}  | ${CaseState.NEW}                          | ${CaseState.DELETED}
      ${CaseTransition.DELETE}  | ${CaseState.DRAFT}                        | ${CaseState.DELETED}
      ${CaseTransition.DELETE}  | ${CaseState.SUBMITTED}                    | ${CaseState.DELETED}
      ${CaseTransition.DELETE}  | ${CaseState.RECEIVED}                     | ${CaseState.DELETED}
      ${CaseTransition.REOPEN}  | ${CaseState.ACCEPTED}                     | ${CaseState.RECEIVED}
    `.describe(
    '$transition $oldState case transitioning to $newState case',
    ({ transition, oldState, newState }) => {
      each([
        ...restrictionCases,
        ...investigationCases,
        ...indictmentCases,
      ]).describe('%s case', (type) => {
        const caseId = uuid()
        const policeCaseNumber = uuid()
        const caseFileId1 = uuid()
        const caseFileId2 = uuid()
        const caseFiles = [
          {
            id: caseFileId1,
            key: uuid(),
            state: CaseFileState.STORED_IN_RVG,
          },
          {
            id: caseFileId2,
            key: uuid(),
            state: CaseFileState.STORED_IN_COURT,
          },
        ]
        const courtEndTime = randomDate()
        const theCase = {
          id: caseId,
          origin: CaseOrigin.LOKE,
          type,
          policeCaseNumbers: [policeCaseNumber],
          state: oldState,
          caseFiles,
          courtEndTime,
        } as Case
        const updatedCase = {
          id: caseId,
          origin: CaseOrigin.LOKE,
          type,
          policeCaseNumbers: [policeCaseNumber],
          state: newState,
          caseFiles,
          courtEndTime,
        } as Case
        let then: Then

        beforeEach(async () => {
          const mockFindOne = mockCaseModel.findOne as jest.Mock
          mockFindOne.mockResolvedValueOnce(updatedCase)

          then = await givenWhenThen(caseId, theCase, { transition })
        })

        it('should transition the case', () => {
          expect(mockCaseModel.update).toHaveBeenCalledWith(
            {
              state: newState,
              parentCaseId:
                transition === CaseTransition.DELETE ? null : undefined,
              rulingDate: [
                CaseTransition.ACCEPT,
                CaseTransition.REJECT,
                CaseTransition.DISMISS,
              ].includes(transition)
                ? isIndictmentCase(type)
                  ? date
                  : courtEndTime
                : transition === CaseTransition.REOPEN
                ? null
                : undefined,
              courtRecordSignatoryId:
                transition === CaseTransition.REOPEN ? null : undefined,
              courtRecordSignatureDate:
                transition === CaseTransition.REOPEN ? null : undefined,
            },
            { where: { id: caseId }, transaction },
          )

          if (
            isIndictmentCase(type) &&
            completedCaseStates.includes(newState)
          ) {
            expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith(
              [
                {
                  type: MessageType.ARCHIVE_CASE_FILE,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  caseFileId: caseFileId1,
                },
                {
                  type: MessageType.ARCHIVE_CASE_FILE,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  caseFileId: caseFileId2,
                },
                {
                  type: MessageType.ARCHIVE_CASE_FILES_RECORD,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  policeCaseNumber,
                },
                {
                  type: MessageType.SEND_RULING_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
                {
                  type: MessageType.DELIVER_INDICTMENT_CASE_TO_POLICE,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
              ],
            )
          } else if (isIndictmentCase(type) && newState === CaseState.DELETED) {
            expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith(
              [
                {
                  type: MessageType.SEND_REVOKED_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
                {
                  type: MessageType.ARCHIVE_CASE_FILE,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  caseFileId: caseFileId1,
                },
                {
                  type: MessageType.ARCHIVE_CASE_FILE,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  caseFileId: caseFileId2,
                },
                ...(oldState === CaseState.RECEIVED
                  ? [
                      {
                        type: MessageType.ARCHIVE_CASE_FILES_RECORD,
                        user: {
                          ...defaultUser,
                          canConfirmIndictment: isIndictmentCase(theCase.type),
                        },
                        caseId,
                        policeCaseNumber,
                      },
                    ]
                  : []),
              ],
            )
          } else if (
            isIndictmentCase(type) &&
            newState === CaseState.SUBMITTED
          ) {
            expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith(
              [
                {
                  type: MessageType.SEND_READY_FOR_COURT_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
              ],
            )
          } else if (
            isIndictmentCase(theCase.type) &&
            oldState === CaseState.SUBMITTED &&
            newState === CaseState.RECEIVED
          ) {
            expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith(
              [
                {
                  type: MessageType.SEND_RECEIVED_BY_COURT_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
                {
                  type: MessageType.DELIVER_INDICTMENT_TO_POLICE,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
                {
                  type: MessageType.DELIVER_CASE_FILES_RECORD_TO_POLICE,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  policeCaseNumber,
                },
              ],
            )
          } else if (
            !isIndictmentCase(theCase.type) &&
            completedCaseStates.includes(newState)
          ) {
            expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith(
              [
                {
                  type: MessageType.DELIVER_CASE_CONCLUSION_TO_COURT,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
                {
                  type: MessageType.DELIVER_COURT_RECORD_TO_COURT,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
                {
                  type: MessageType.DELIVER_CASE_FILE_TO_COURT,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  caseFileId: caseFileId1,
                },
                {
                  type: MessageType.DELIVER_CASE_TO_POLICE,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
              ],
            )
          } else if (
            !isIndictmentCase(theCase.type) &&
            newState === CaseState.DELETED
          ) {
            expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith(
              [
                {
                  type: MessageType.SEND_REVOKED_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
              ],
            )
          } else if (
            !isIndictmentCase(theCase.type) &&
            oldState === CaseState.SUBMITTED &&
            newState === CaseState.RECEIVED
          ) {
            expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith(
              [
                {
                  type: MessageType.SEND_RECEIVED_BY_COURT_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
              ],
            )
          } else {
            expect(
              mockMessageService.sendMessagesToQueue,
            ).not.toHaveBeenCalled()
          }

          if (transition === CaseTransition.DELETE) {
            expect(then.result).toBe(theCase)
          } else {
            expect(mockCaseModel.findOne).toHaveBeenCalledWith({
              include,
              order,
              where: {
                id: caseId,
                isArchived: false,
              },
            })
            expect(then.result).toBe(updatedCase)
          }
        })
      })
    },
  )

  each`
      transition                        | caseState                    | currentAppealState           | newAppealState
      ${CaseTransition.APPEAL}          | ${CaseState.ACCEPTED}        | ${undefined}                 | ${CaseAppealState.APPEALED}
      ${CaseTransition.RECEIVE_APPEAL}  | ${CaseState.ACCEPTED}        | ${CaseAppealState.APPEALED}  | ${CaseAppealState.RECEIVED}
      ${CaseTransition.COMPLETE_APPEAL} | ${CaseState.ACCEPTED}        | ${CaseAppealState.RECEIVED}  | ${CaseAppealState.COMPLETED}
      ${CaseTransition.REOPEN_APPEAL}   | ${CaseState.ACCEPTED}        | ${CaseAppealState.COMPLETED} | ${CaseAppealState.RECEIVED}
      ${CaseTransition.WITHDRAW_APPEAL} | ${CaseState.ACCEPTED}        | ${CaseAppealState.APPEALED}  | ${CaseAppealState.WITHDRAWN}
      ${CaseTransition.WITHDRAW_APPEAL} | ${CaseState.ACCEPTED}        | ${CaseAppealState.RECEIVED}  | ${CaseAppealState.WITHDRAWN}
     

    `.describe(
    '$transition $caseState case transitioning from $currentAppealState to $newAppealState appeal state',
    ({ transition, caseState, currentAppealState, newAppealState }) => {
      each([...restrictionCases, ...investigationCases]).describe(
        '%s case',
        (type) => {
          const caseId = uuid()
          const prosecutorAppealBriefId = uuid()
          const prosecutorAppealBriefCaseFileId1 = uuid()
          const prosecutorAppealBriefCaseFileId2 = uuid()
          const appealRulingId = uuid()
          const caseFiles = [
            {
              id: prosecutorAppealBriefId,
              key: uuid(),
              state: CaseFileState.STORED_IN_RVG,
              category: CaseFileCategory.PROSECUTOR_APPEAL_BRIEF,
            },
            {
              id: prosecutorAppealBriefCaseFileId1,
              key: uuid(),
              state: CaseFileState.STORED_IN_RVG,
              category: CaseFileCategory.PROSECUTOR_APPEAL_BRIEF_CASE_FILE,
            },
            {
              id: prosecutorAppealBriefCaseFileId2,
              key: uuid(),
              state: CaseFileState.STORED_IN_RVG,
              category: CaseFileCategory.PROSECUTOR_APPEAL_BRIEF_CASE_FILE,
            },
            {
              id: appealRulingId,
              key: uuid(),
              state: CaseFileState.STORED_IN_RVG,
              category: CaseFileCategory.APPEAL_RULING,
            },
          ]
          const theCase = {
            id: caseId,
            type,
            state: caseState,
            caseFiles,
            appealState: currentAppealState,
            origin: CaseOrigin.LOKE,
          } as Case

          const updatedCase = {
            id: caseId,
            type,
            state: caseState,
            caseFiles,
            appealState: newAppealState,
            origin: CaseOrigin.LOKE,
          } as Case

          beforeEach(async () => {
            const mockFindOne = mockCaseModel.findOne as jest.Mock
            mockFindOne.mockResolvedValueOnce(updatedCase)

            await givenWhenThen(caseId, theCase, {
              transition,
            })
          })

          it('should transition the case', () => {
            expect(mockCaseModel.update).toHaveBeenCalledWith(
              {
                appealState: newAppealState,
                prosecutorPostponedAppealDate:
                  transition === CaseTransition.APPEAL ? date : undefined,
                appealReceivedByCourtDate:
                  transition === CaseTransition.RECEIVE_APPEAL
                    ? date
                    : undefined,
                appealRulingDecision:
                  transition === CaseTransition.WITHDRAW_APPEAL &&
                  currentAppealState === CaseAppealState.RECEIVED
                    ? CaseAppealRulingDecision.DISCONTINUED
                    : undefined,
              },
              { where: { id: caseId }, transaction },
            )
          })

          it('should send notifications to queue when case is appealed', () => {
            if (transition === CaseTransition.APPEAL) {
              expect(
                mockMessageService.sendMessagesToQueue,
              ).toHaveBeenCalledWith([
                {
                  type: MessageType.DELIVER_CASE_FILE_TO_COURT,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  caseFileId: prosecutorAppealBriefId,
                },
                {
                  type: MessageType.DELIVER_CASE_FILE_TO_COURT,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  caseFileId: prosecutorAppealBriefCaseFileId1,
                },
                {
                  type: MessageType.DELIVER_CASE_FILE_TO_COURT,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  caseFileId: prosecutorAppealBriefCaseFileId2,
                },
                {
                  type: MessageType.SEND_APPEAL_TO_COURT_OF_APPEALS_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
              ])
            }
          })

          it('should send notifications to queue when appeal is received', () => {
            if (transition === CaseTransition.RECEIVE_APPEAL) {
              expect(
                mockMessageService.sendMessagesToQueue,
              ).toHaveBeenCalledWith([
                {
                  type: MessageType.SEND_APPEAL_RECEIVED_BY_COURT_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
              ])
            }
          })

          it('should send notifications to queue when appeal is completed', () => {
            if (transition === CaseTransition.COMPLETE_APPEAL) {
              expect(
                mockMessageService.sendMessagesToQueue,
              ).toHaveBeenCalledWith([
                {
                  type: MessageType.DELIVER_CASE_FILE_TO_COURT,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                  caseFileId: appealRulingId,
                },
                {
                  type: MessageType.SEND_APPEAL_COMPLETED_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
                {
                  type: MessageType.DELIVER_APPEAL_TO_POLICE,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId: theCase.id,
                },
              ])
            }
          })

          it('should send notifications to queue when appeal is withdrawn', () => {
            if (transition === CaseTransition.WITHDRAW_APPEAL) {
              expect(
                mockMessageService.sendMessagesToQueue,
              ).toHaveBeenCalledWith([
                {
                  type: MessageType.SEND_APPEAL_WITHDRAWN_NOTIFICATION,
                  user: {
                    ...defaultUser,
                    canConfirmIndictment: isIndictmentCase(theCase.type),
                  },
                  caseId,
                },
              ])
            }
          })
        },
      )
    },
  )
})
