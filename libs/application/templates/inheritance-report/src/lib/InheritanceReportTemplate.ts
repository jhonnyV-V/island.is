import {
  coreHistoryMessages,
  EphemeralStateLifeCycle,
} from '@island.is/application/core'
import {
  ApplicationTemplate,
  ApplicationTypes,
  ApplicationContext,
  ApplicationRole,
  ApplicationStateSchema,
  Application,
  defineTemplateApi,
  NationalRegistryUserApi,
  UserProfileApi,
  DefaultEvents,
} from '@island.is/application/types'
import { m } from './messages'
import { inheritanceReportSchema } from './dataSchema'
import {
  ApiActions,
  ESTATE_INHERITANCE,
  InheritanceReportEvent,
  PREPAID_INHERITANCE,
  Roles,
  States,
} from './constants'
import { Features } from '@island.is/feature-flags'
import { EstateOnEntryApi, MaritalStatusApi } from '../dataProviders'

const InheritanceReportTemplate: ApplicationTemplate<
  ApplicationContext,
  ApplicationStateSchema<InheritanceReportEvent>,
  InheritanceReportEvent
> = {
  type: ApplicationTypes.INHERITANCE_REPORT,
  name: ({ answers }) =>
    answers.applicationFor === PREPAID_INHERITANCE
      ? m.prerequisitesTitle.defaultMessage +
        ' - ' +
        m.applicationNamePrepaid.defaultMessage
      : answers.applicationFor === ESTATE_INHERITANCE
      ? m.prerequisitesTitle.defaultMessage +
        ' - ' +
        m.applicationNameEstate.defaultMessage
      : m.prerequisitesTitle.defaultMessage,
  institution: m.institution,
  dataSchema: inheritanceReportSchema,
  featureFlag: Features.inheritanceReport,
  allowMultipleApplicationsInDraft: false,
  stateMachineConfig: {
    initial: States.prerequisites,
    states: {
      [States.prerequisites]: {
        meta: {
          name: '',
          status: 'draft',
          progress: 0,
          lifecycle: EphemeralStateLifeCycle,
          roles: [
            {
              id: Roles.ESTATE_INHERITANCE_APPLICANT,
              formLoader: async () => {
                const getForm = await import('../forms/prerequisites').then(
                  (val) => val.getForm,
                )

                return getForm()
              },
              actions: [{ event: 'SUBMIT', name: '', type: 'primary' }],
              write: 'all',
              delete: true,
            },
          ],
          actionCard: {
            historyLogs: [
              {
                logMessage: coreHistoryMessages.applicationStarted,
                onEvent: DefaultEvents.SUBMIT,
              },
            ],
          },
        },
        on: {
          SUBMIT: {
            target: States.draft,
          },
        },
      },
      [States.draft]: {
        meta: {
          name: '',
          status: 'draft',
          progress: 0.15,
          lifecycle: EphemeralStateLifeCycle,
          roles: [
            {
              id: Roles.ESTATE_INHERITANCE_APPLICANT,
              formLoader: () =>
                import('../forms/form').then((module) =>
                  Promise.resolve(module.estateInheritanceForm),
                ),
              actions: [{ event: 'SUBMIT', name: '', type: 'primary' }],
              write: 'all',
              delete: true,
              api: [NationalRegistryUserApi, UserProfileApi, EstateOnEntryApi],
            },
            {
              id: Roles.PREPAID_INHERITANCE_APPLICANT,
              formLoader: () =>
                import('../forms/form').then((module) =>
                  Promise.resolve(module.prepaidInheritanceForm),
                ),
              actions: [{ event: 'SUBMIT', name: '', type: 'primary' }],
              write: 'all',
              delete: true,
              api: [
                NationalRegistryUserApi,
                UserProfileApi,
                EstateOnEntryApi,
                MaritalStatusApi,
              ],
            },
          ],
        },
        on: {
          SUBMIT: {
            target: States.done,
          },
        },
      },
      [States.done]: {
        meta: {
          name: 'Done',
          status: 'approved',
          progress: 1,
          lifecycle: EphemeralStateLifeCycle,
          onEntry: defineTemplateApi({
            action: ApiActions.completeApplication,
            throwOnError: true,
          }),
          roles: [
            {
              id: Roles.ESTATE_INHERITANCE_APPLICANT,
              formLoader: () =>
                import('../forms/done').then((val) =>
                  Promise.resolve(val.done),
                ),
              read: 'all',
            },
            {
              id: Roles.PREPAID_INHERITANCE_APPLICANT,
              formLoader: () =>
                import('../forms/done').then((val) =>
                  Promise.resolve(val.done),
                ),
              read: 'all',
            },
          ],
        },
      },
    },
  },
  mapUserToRole(
    nationalId: string,
    application: Application,
  ): ApplicationRole | undefined {
    if (application.applicant === nationalId) {
      if (application.answers.applicationFor === PREPAID_INHERITANCE) {
        return Roles.PREPAID_INHERITANCE_APPLICANT
      }
      return Roles.ESTATE_INHERITANCE_APPLICANT
    }
  },
}

export default InheritanceReportTemplate
