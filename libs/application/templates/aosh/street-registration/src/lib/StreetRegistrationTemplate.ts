import {
  ApplicationConfigurations,
  ApplicationTemplate,
  ApplicationTypes,
  ApplicationContext,
  ApplicationRole,
  ApplicationStateSchema,
  Application,
  DefaultEvents,
  defineTemplateApi,
  InstitutionNationalIds,
} from '@island.is/application/types'
import {
  EphemeralStateLifeCycle,
  coreHistoryMessages,
  corePendingActionMessages,
  getValueViaPath,
  pruneAfterDays,
} from '@island.is/application/core'
import { Events, States, Roles } from './constants'
import { ApiActions } from '../shared'
import { AuthDelegationType } from '@island.is/shared/types'
import { MachineAnswersSchema } from './dataSchema'
import { application as applicationMessage } from './messages'
import { assign } from 'xstate'
import set from 'lodash/set'
import {
  IdentityApi,
  UserProfileApi,
  MachinesApi,
  MustInspectBeforeRegistrationApi,
  VinnueftirlitidPaymentCatalogApi,
} from '../dataProviders'
import { ApiScope } from '@island.is/auth/scopes'
import { Features } from '@island.is/feature-flags'
import { getChargeItemCodes } from '../utils'
import { buildPaymentState } from '@island.is/application/utils'
import { getExtraData } from '../utils/getSelectedMachine'

const determineMessageFromApplicationAnswers = (application: Application) => {
  const regNumber = getValueViaPath(
    application.answers,
    'machine.regNumber',
    undefined,
  ) as string | undefined
  return {
    name: applicationMessage.name,
    value: regNumber ? `- ${regNumber}` : '',
  }
}

const template: ApplicationTemplate<
  ApplicationContext,
  ApplicationStateSchema<Events>,
  Events
> = {
  type: ApplicationTypes.STREET_REGISTRATION,
  name: determineMessageFromApplicationAnswers,
  institution: applicationMessage.institutionName,
  featureFlag: Features.StreetRegistration,
  translationNamespaces: [
    ApplicationConfigurations.StreetRegistration.translation,
  ],
  dataSchema: MachineAnswersSchema,
  allowedDelegations: [
    {
      type: AuthDelegationType.ProcurationHolder,
    },
    {
      type: AuthDelegationType.Custom,
    },
  ],
  requiredScopes: [ApiScope.vinnueftirlitid],
  stateMachineConfig: {
    initial: States.PREREQUISITES,
    states: {
      [States.PREREQUISITES]: {
        meta: {
          name: 'Gagnaöflun',
          status: 'draft',
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
          lifecycle: EphemeralStateLifeCycle,
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/Prerequisites').then((module) =>
                  Promise.resolve(module.PrerequisitesForm),
                ),
              actions: [
                {
                  event: DefaultEvents.SUBMIT,
                  name: 'Staðfesta',
                  type: 'primary',
                },
              ],
              write: 'all',
              read: 'all',
              delete: true,
              api: [
                IdentityApi,
                UserProfileApi,
                MachinesApi,
                MustInspectBeforeRegistrationApi,
                VinnueftirlitidPaymentCatalogApi,
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
          name: 'Tilkynning um götuskráningu tækis',
          status: 'draft',
          actionCard: {
            tag: {
              label: applicationMessage.actionCardDraft,
              variant: 'blue',
            },
            historyLogs: [
              {
                logMessage: coreHistoryMessages.applicationSent,
                onEvent: DefaultEvents.SUBMIT,
              },
            ],
          },
          lifecycle: EphemeralStateLifeCycle,

          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/StreetRegistrationForm/index').then((module) =>
                  Promise.resolve(module.StreetRegistrationForm),
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
            },
          ],
        },
        on: {
          [DefaultEvents.SUBMIT]: { target: States.PAYMENT },
        },
      },
      [States.PAYMENT]: buildPaymentState({
        organizationId: InstitutionNationalIds.SAMGONGUSTOFA,
        chargeItemCodes: getChargeItemCodes,
        submitTarget: States.COMPLETED,
        onExit: [
          defineTemplateApi({
            action: ApiActions.submitApplication,
            triggerEvent: DefaultEvents.SUBMIT,
          }),
        ],
        extraData: getExtraData,
      }),
      [States.COMPLETED]: {
        meta: {
          name: 'Completed',
          status: 'completed',
          lifecycle: pruneAfterDays(30),
          onEntry: defineTemplateApi({
            action: ApiActions.submitApplication,
          }),
          actionCard: {
            tag: {
              label: applicationMessage.actionCardDone,
              variant: 'blueberry',
            },
            pendingAction: {
              title: corePendingActionMessages.applicationReceivedTitle,
              displayStatus: 'success',
            },
          },
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/Conclusion').then((module) =>
                  Promise.resolve(module.Conclusion),
                ),
              read: 'all',
            },
          ],
        },
      },
    },
  },
  stateMachineOptions: {
    actions: {
      assignUsers: assign((context) => {
        const { application } = context

        const buyerNationalId = getBuyerNationalId(application)
        if (buyerNationalId !== null && buyerNationalId !== '') {
          set(application, 'assignees', [buyerNationalId])
        }
        return context
      }),
    },
  },
  mapUserToRole(
    id: string,
    application: Application,
  ): ApplicationRole | undefined {
    if (id === application.applicant) {
      return Roles.APPLICANT
    }

    return undefined
  },
}

export default template

const getBuyerNationalId = (application: Application) => {
  try {
    const buyerNationalId = getValueViaPath(
      application.answers,
      'buyer.nationalId',
      '',
    ) as string
    return buyerNationalId
  } catch (error) {
    console.error(error)
    return ''
  }
}
