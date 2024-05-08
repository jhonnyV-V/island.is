import {
  coreHistoryMessages,
  EphemeralStateLifeCycle,
  getValueViaPath,
  pruneAfterDays,
} from '@island.is/application/core'
import {
  Application,
  ApplicationContext,
  ApplicationRole,
  ApplicationStateSchema,
  ApplicationTemplate,
  ApplicationTypes,
  DefaultEvents,
  defineTemplateApi,
  DistrictsApi,
  InstitutionNationalIds,
  PassportsApi,
} from '@island.is/application/types'
import { Features } from '@island.is/feature-flags'
import { assign } from 'xstate'
import {
  IdentityDocumentApi,
  SyslumadurPaymentCatalogApi,
  DeliveryAddressApi,
  UserInfoApi,
  NationalRegistryUser,
} from '../dataProviders'
import { application as applicationMessage } from './messages'
import { Events, Roles, States, ApiActions } from './constants'
import { IdCardSchema } from './dataSchema'
import { buildPaymentState } from '@island.is/application/utils'
// import { needAssignment } from './utils'

const getCode = (application: Application) => {
  const chargeItemCode = getValueViaPath<string>(
    application.answers,
    'chargeItemCode',
  )
  if (!chargeItemCode) {
    throw new Error('chargeItemCode missing in request')
  }
  return [chargeItemCode]
}

// export const hasReviewer = (context: ApplicationContext) => {
//   const { answers, externalData } = context.application
//   return needAssignment(answers, externalData)
// }

const IdCardTemplate: ApplicationTemplate<
  ApplicationContext,
  ApplicationStateSchema<Events>,
  Events
> = {
  type: ApplicationTypes.ID_CARD,
  name: applicationMessage.name,
  featureFlag: Features.idCardApplication,
  dataSchema: IdCardSchema,
  stateMachineConfig: {
    initial: States.PARENT_B_CONFIRM,
    states: {
      [States.PREREQUISITES]: {
        meta: {
          name: 'Gagnaöflun',
          status: 'draft',
          progress: 0.1,
          lifecycle: EphemeralStateLifeCycle,
          actionCard: {
            tag: {
              label: applicationMessage.actionCardPrerequisites,
              variant: 'blue',
            },
            historyLogs: [
              {
                logMessage: coreHistoryMessages.applicationStarted,
                onEvent: DefaultEvents.SUBMIT,
              },
            ],
          },
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/Prerequisites').then((module) =>
                  Promise.resolve(module.Prerequisites),
                ),
              actions: [
                {
                  event: DefaultEvents.SUBMIT,
                  name: 'Staðfesta',
                  type: 'primary',
                },
              ],
              write: 'all',
              delete: true,
              api: [
                NationalRegistryUser,
                UserInfoApi,
                SyslumadurPaymentCatalogApi,
                PassportsApi,
                DistrictsApi,
                IdentityDocumentApi,
                DeliveryAddressApi,
              ],
            },
          ],
        },
        on: {
          [DefaultEvents.SUBMIT]: { target: States.DRAFT },
        },
      },
      [States.DRAFT]: {
        meta: {
          name: 'Umsókn um nafnskírteini',
          status: 'draft',
          progress: 0.25,
          lifecycle: pruneAfterDays(2),
          //   onExit: defineTemplateApi({
          //     action: ApiActions.checkForDiscount,
          //   }),
          actionCard: {
            historyLogs: [
              {
                logMessage: coreHistoryMessages.applicationStarted,
                onEvent: DefaultEvents.PAYMENT,
              },
            ],
          },
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/IdCardForm').then((module) =>
                  Promise.resolve(module.IdCardForm),
                ),
              write: 'all',
              delete: true,
            },
          ],
        },
        on: {
          [DefaultEvents.SUBMIT]: { target: States.PAYMENT },
        },
      },
      [States.PAYMENT]: buildPaymentState({
        organizationId: InstitutionNationalIds.SYSLUMENN,
        chargeItemCodes: getCode,
        submitTarget: [
          //   {
          //     target: States.PARENT_B_CONFIRM, // TODO CHANGE TO CHECK ALL PARENTS FOR ALL CHILDREN
          //     // cond: hasReviewer,
          //   },
          {
            target: States.COMPLETED,
          },
        ],
      }),
      [States.PARENT_B_CONFIRM]: {
        entry: 'assignToParentB',
        meta: {
          name: 'ParentB',
          status: 'draft',
          progress: 0.7, // Þarf þetta?
          lifecycle: pruneAfterDays(7) /*
            Á þetta að vera?
            {
              ...pruneAfter(sevenDays),
              shouldDeleteChargeIfPaymentFulfilled: true,
            } */,
          onEntry: defineTemplateApi({
            action: ApiActions.assignParentB,
          }),
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/Review').then((val) =>
                  Promise.resolve(val.Review),
                ),
              delete: true, // TODO: Remove before production
              // actions: [
              //   { event: DefaultEvents.EDIT, name: '', type: 'primary' },
              // ],
              write: 'all',
              read: {
                answers: ['childsPersonalInfo'],
                externalData: ['submitPassportApplication'],
              },
            },
            {
              id: Roles.ASSIGNEE,
              formLoader: () =>
                import('../forms/Review').then((val) =>
                  Promise.resolve(val.Review),
                ),
              actions: [
                { event: DefaultEvents.SUBMIT, name: '', type: 'primary' },
              ],
              write: 'all',
              api: [
                // NationalRegistryUserParentB,
                UserInfoApi,
                SyslumadurPaymentCatalogApi,
                PassportsApi,
                DistrictsApi,
                IdentityDocumentApi,
                DeliveryAddressApi,
              ],
            },
          ],
          actionCard: {
            historyLogs: [
              {
                logMessage: applicationMessage.historyWaitingForParentB,
                onEvent: DefaultEvents.SUBMIT,
              },
            ],
            /* pendingAction: {
                title: m.waitingForConfirmationFromParentBTitle,
                content: m.waitingForConfirmationFromParentBDescription,
                displayStatus: 'warning',
              }, */
          },
        },
        on: {
          [DefaultEvents.SUBMIT]: { target: States.COMPLETED },
          // What happens during reject?
          [DefaultEvents.REJECT]: { target: States.REJECTED },
        },
      },
      [States.REJECTED]: {
        meta: {
          name: 'Rejected',
          status: 'rejected',
          lifecycle: pruneAfterDays(3 * 30), // TODO HOW MANY DAYS SHOULD THIS BE?
          //   onEntry: defineTemplateApi({
          //     action: ApiActions.submitPassportApplication,
          //   }),
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/Rejected').then((val) =>
                  Promise.resolve(val.Rejected),
                ),
              // read: {
              //   externalData: ['submitPassportApplication'],
              //   answers: [
              //     'submitPassportApplication',
              //     'childsPersonalInfo',
              //     'personalInfo',
              //     'passport',
              //   ],
              // },
            },
            {
              id: Roles.ASSIGNEE,
              formLoader: () =>
                import('../forms/Rejected').then((val) =>
                  Promise.resolve(val.Rejected),
                ),
              // read: {
              //   externalData: ['submitPassportApplication'],
              //   answers: ['passport', 'childsPersonalInfo'],
              // },
            },
          ],
        },
      },
      [States.COMPLETED]: {
        meta: {
          name: 'Completed',
          status: 'completed',
          lifecycle: pruneAfterDays(3 * 30), // TODO HOW MANY DAYS SHOULD THIS BE?
          //   onEntry: defineTemplateApi({
          //     action: ApiActions.submitPassportApplication,
          //   }),
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/Approved').then((val) =>
                  Promise.resolve(val.Approved),
                ),
              // read: {
              //   externalData: ['submitPassportApplication'],
              //   answers: [
              //     'submitPassportApplication',
              //     'childsPersonalInfo',
              //     'personalInfo',
              //     'passport',
              //   ],
              // },
            },
            {
              id: Roles.ASSIGNEE,
              formLoader: () =>
                import('../forms/Approved').then((val) =>
                  Promise.resolve(val.Approved),
                ),
              // read: {
              //   externalData: ['submitPassportApplication'],
              //   answers: ['passport', 'childsPersonalInfo'],
              // },
            },
          ],
          actionCard: {
            pendingAction: {
              title: coreHistoryMessages.applicationReceived,
              content: '',
              displayStatus: 'success',
            },
          },
        },
      },
    },
  },
  stateMachineOptions: {
    actions: {
      assignToParentB: assign((context) => {
        const parentB = getValueViaPath<string>(
          context.application.answers,
          'childsPersonalInfo.guardian2.nationalId',
        )

        return {
          ...context,
          application: {
            ...context.application,
            assignees: parentB ? [parentB] : [],
          },
        }
      }),
    },
  },
  mapUserToRole(
    nationalId: string,
    application: Application,
  ): ApplicationRole | undefined {
    if (application.assignees.includes(nationalId)) {
      return Roles.ASSIGNEE
    }
    if (nationalId === application.applicant) {
      return Roles.APPLICANT
    }
    return undefined
  },
}

export default IdCardTemplate
