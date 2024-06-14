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
  pruneAfterDays,
} from '@island.is/application/core'
import { Events, States, Roles } from './constants'
import { ApiActions } from '../shared'
import {
  IdentityApi,
  UserProfileApi,
  SyslumadurPaymentCatalogApi,
} from '../dataProviders'
import { AuthDelegationType } from '@island.is/shared/types'
import { buildPaymentState } from '@island.is/application/utils'
import { getChargeItemCodes } from '../util'
import { MortgageCertificateSchema } from './dataSchema'
import { application } from './messages'

const template: ApplicationTemplate<
  ApplicationContext,
  ApplicationStateSchema<Events>,
  Events
> = {
  type: ApplicationTypes.MORTGAGE_CERTIFICATE,
  name: application.general.name,
  institution: application.general.institutionName,
  translationNamespaces: [
    ApplicationConfigurations.MortgageCertificate.translation,
  ],
  dataSchema: MortgageCertificateSchema,
  allowedDelegations: [
    {
      type: AuthDelegationType.ProcurationHolder,
    },
  ],
  stateMachineConfig: {
    initial: States.PREREQUISITES,
    states: {
      [States.PREREQUISITES]: {
        meta: {
          name: 'Gagnaöflun',
          status: 'draft',
          actionCard: {
            tag: {
              label: application.labels.actionCardPrerequisites,
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
              api: [IdentityApi, UserProfileApi, SyslumadurPaymentCatalogApi],
            },
          ],
        },
        on: {
          [DefaultEvents.SUBMIT]: { target: States.DRAFT },
        },
      },
      [States.DRAFT]: {
        meta: {
          name: 'Umsókn um veðbókarvottorð',
          status: 'draft',
          actionCard: {
            tag: {
              label: application.labels.actionCardDraft,
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
          // onExit: defineTemplateApi({
          //   action: ApiActions.validateMortgageCertificate,
          // }),
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/MortgageCertificateForm').then((module) =>
                  Promise.resolve(module.MortgageCertificateForm),
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
          [DefaultEvents.SUBMIT]: {
            target: States.PAYMENT,
          },
        },
      },
      [States.PAYMENT]: buildPaymentState({
        organizationId: InstitutionNationalIds.SYSLUMENN,
        chargeItemCodes: getChargeItemCodes,
        submitTarget: States.COMPLETED,
        onExit: [
          defineTemplateApi({
            action: ApiActions.submitApplication,
            triggerEvent: DefaultEvents.SUBMIT,
          }),
        ],
      }),
      [States.COMPLETED]: {
        meta: {
          name: 'Completed',
          status: 'completed',

          lifecycle: pruneAfterDays(3 * 30),
          actionCard: {
            tag: {
              label: application.labels.actionCardDone,
              variant: 'blueberry',
            },
            pendingAction: {
              title: application.labels.pendingActionApplicationCompletedTitle,
              displayStatus: 'success',
            },
          },
          // onEntry: defineTemplateApi({
          //   action: ApiActions.getMortgageCertificate,
          // }),
          roles: [
            {
              id: Roles.APPLICANT,
              formLoader: () =>
                import('../forms/Approved').then((val) =>
                  Promise.resolve(val.Approved),
                ),
              read: 'all',
            },
          ],
        },
      },
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
