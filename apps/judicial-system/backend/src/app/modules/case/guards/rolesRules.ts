import { RolesRule, RulesType } from '@island.is/judicial-system/auth'
import { CaseTransition, UserRole } from '@island.is/judicial-system/types'

import { UpdateCaseDto } from '../dto/updateCase.dto'
import { Case } from '../models/case.model'

const prosecutorFields: (keyof UpdateCaseDto)[] = [
  'type',
  'indictmentSubtypes',
  'description',
  'policeCaseNumbers',
  'defenderName',
  'defenderNationalId',
  'defenderEmail',
  'defenderPhoneNumber',
  'requestSharedWithDefender',
  'isHeightenedSecurityLevel',
  'courtId',
  'leadInvestigator',
  'arrestDate',
  'requestedCourtDate',
  'translator',
  'requestedValidToDate',
  'validToDate',
  'demands',
  'lawsBroken',
  'legalBasis',
  'legalProvisions',
  'requestedCustodyRestrictions',
  'requestedOtherRestrictions',
  'caseFacts',
  'legalArguments',
  'requestProsecutorOnlySession',
  'prosecutorOnlySessionRequest',
  'comments',
  'caseFilesComments',
  'prosecutorId',
  'sharedWithProsecutorsOfficeId',
  'caseModifiedExplanation',
  'isolationToDate',
  'caseResentExplanation',
  'crimeScenes',
  'indictmentIntroduction',
  'requestDriversLicenseSuspension',
  'prosecutorStatementDate',
  'requestAppealRulingNotToBePublished',
  'indictmentDeniedExplanation',
  'indictmentReviewDecision',
]

const publicProsecutorFields: (keyof UpdateCaseDto)[] = ['indictmentReviewerId']

const districtCourtFields: (keyof UpdateCaseDto)[] = [
  'defenderName',
  'defenderNationalId',
  'defenderEmail',
  'defenderPhoneNumber',
  'courtCaseNumber',
  'sessionArrangements',
  'arraignmentDate',
  'courtDate',
  'courtLocation',
  'courtStartDate',
  'courtEndTime',
  'isClosedCourtHidden',
  'courtAttendees',
  'prosecutorDemands',
  'courtDocuments',
  'sessionBookings',
  'courtCaseFacts',
  'introduction',
  'courtLegalArguments',
  'ruling',
  'decision',
  'validToDate',
  'isCustodyIsolation',
  'isolationToDate',
  'conclusion',
  'endOfSessionBookings',
  'accusedAppealDecision',
  'accusedAppealAnnouncement',
  'prosecutorAppealDecision',
  'prosecutorAppealAnnouncement',
  'rulingSignatureDate',
  'judgeId',
  'registrarId',
  'caseModifiedExplanation',
  'rulingModifiedHistory',
  'defendantWaivesRightToCounsel',
  'prosecutorId',
  'indictmentReturnedExplanation',
  'postponedIndefinitelyExplanation',
  'indictmentRulingDecision',
  'indictmentDecision',
]

const courtOfAppealsFields: (keyof UpdateCaseDto)[] = [
  'appealCaseNumber',
  'appealAssistantId',
  'appealJudge1Id',
  'appealJudge2Id',
  'appealJudge3Id',
  'appealConclusion',
  'appealRulingDecision',
  'appealRulingModifiedHistory',
  'appealValidToDate',
  'isAppealCustodyIsolation',
  'appealIsolationToDate',
]

const limitedAccessFields: (keyof UpdateCaseDto)[] = ['defendantStatementDate']

// Allows prosecutors to update a specific set of fields
export const prosecutorUpdateRule: RolesRule = {
  role: UserRole.PROSECUTOR,
  type: RulesType.FIELD,
  dtoFields: prosecutorFields,
}

// Allows prosecutor representatives to update a specific set of fields
export const prosecutorRepresentativeUpdateRule: RolesRule = {
  role: UserRole.PROSECUTOR_REPRESENTATIVE,
  type: RulesType.FIELD,
  dtoFields: prosecutorFields,
}

// Allows public prosecutor staff to update a specific set of fields
export const publicProsecutorStaffUpdateRule: RolesRule = {
  role: UserRole.PUBLIC_PROSECUTOR_STAFF,
  type: RulesType.FIELD,
  dtoFields: publicProsecutorFields,
}

// Allows district court judges to update a specific set of fields
export const districtCourtJudgeUpdateRule: RolesRule = {
  role: UserRole.DISTRICT_COURT_JUDGE,
  type: RulesType.FIELD,
  dtoFields: districtCourtFields,
}

// Allows district court registrars to update a specific set of fields
export const districtCourtRegistrarUpdateRule: RolesRule = {
  role: UserRole.DISTRICT_COURT_REGISTRAR,
  type: RulesType.FIELD,
  dtoFields: districtCourtFields,
}

// Allows district court assistants to update a specific set of fields
export const districtCourtAssistantUpdateRule: RolesRule = {
  role: UserRole.DISTRICT_COURT_ASSISTANT,
  type: RulesType.FIELD,
  dtoFields: districtCourtFields,
}

// Allows court of appeals judges to update a specific set of fields
export const courtOfAppealsJudgeUpdateRule: RolesRule = {
  role: UserRole.COURT_OF_APPEALS_JUDGE,
  type: RulesType.FIELD,
  dtoFields: courtOfAppealsFields,
}

// Allows court of appeals registrars to update a specific set of fields
export const courtOfAppealsRegistrarUpdateRule: RolesRule = {
  role: UserRole.COURT_OF_APPEALS_REGISTRAR,
  type: RulesType.FIELD,
  dtoFields: courtOfAppealsFields,
}

// Allows court of appeals assistants to update a specific set of fields
export const courtOfAppealsAssistantUpdateRule: RolesRule = {
  role: UserRole.COURT_OF_APPEALS_ASSISTANT,
  type: RulesType.FIELD,
  dtoFields: courtOfAppealsFields,
}

// Allows defenders to update a specific set of fields
export const defenderUpdateRule: RolesRule = {
  role: UserRole.DEFENDER,
  type: RulesType.FIELD,
  dtoFields: limitedAccessFields,
}

// Allows prosecutors to transition cases
export const prosecutorTransitionRule: RolesRule = {
  role: UserRole.PROSECUTOR,
  type: RulesType.FIELD_VALUES,
  dtoField: 'transition',
  dtoFieldValues: [
    CaseTransition.OPEN,
    CaseTransition.ASK_FOR_CONFIRMATION,
    CaseTransition.SUBMIT,
    CaseTransition.ASK_FOR_CANCELLATION,
    CaseTransition.DELETE,
    CaseTransition.APPEAL,
    CaseTransition.WITHDRAW_APPEAL,
    CaseTransition.DENY_INDICTMENT,
  ],
  canActivate: (request) => {
    const theCase: Case = request.case

    // Deny if the case is missing - shuould never happen
    if (!theCase) {
      return false
    }

    // Deny transition if prosecutor did not appeal the case
    if (
      request.body.transition === CaseTransition.WITHDRAW_APPEAL &&
      !theCase.prosecutorPostponedAppealDate
    ) {
      return false
    }

    return true
  },
}

// Allows prosecutor representatives to transition cases
export const prosecutorRepresentativeTransitionRule: RolesRule = {
  role: UserRole.PROSECUTOR_REPRESENTATIVE,
  type: RulesType.FIELD_VALUES,
  dtoField: 'transition',
  dtoFieldValues: [CaseTransition.ASK_FOR_CONFIRMATION, CaseTransition.DELETE],
}

// Allows defenders to transition cases
export const defenderTransitionRule: RolesRule = {
  role: UserRole.DEFENDER,
  type: RulesType.FIELD_VALUES,
  dtoField: 'transition',
  dtoFieldValues: [CaseTransition.APPEAL, CaseTransition.WITHDRAW_APPEAL],
  canActivate: (request) => {
    const theCase: Case = request.case

    // Deny if the case is missing - should never happen
    if (!theCase) {
      return false
    }

    // Deny withdrawal if defender did not appeal the case
    if (
      request.body.transition === CaseTransition.WITHDRAW_APPEAL &&
      !theCase.accusedPostponedAppealDate
    ) {
      return false
    }

    return true
  },
}

// Allows judges to transition cases
export const districtCourtJudgeTransitionRule: RolesRule = {
  role: UserRole.DISTRICT_COURT_JUDGE,
  type: RulesType.FIELD_VALUES,
  dtoField: 'transition',
  dtoFieldValues: [
    CaseTransition.RECEIVE,
    CaseTransition.RETURN_INDICTMENT,
    CaseTransition.REDISTRIBUTE,
    CaseTransition.ACCEPT,
    CaseTransition.REJECT,
    CaseTransition.DISMISS,
    CaseTransition.COMPLETE,
    CaseTransition.REOPEN,
    CaseTransition.RECEIVE_APPEAL,
  ],
}

// Allows registrars to transition cases
export const districtCourtRegistrarTransitionRule: RolesRule = {
  role: UserRole.DISTRICT_COURT_REGISTRAR,
  type: RulesType.FIELD_VALUES,
  dtoField: 'transition',
  dtoFieldValues: [
    CaseTransition.RECEIVE,
    CaseTransition.ACCEPT,
    CaseTransition.REJECT,
    CaseTransition.DISMISS,
    CaseTransition.COMPLETE,
    CaseTransition.REOPEN,
    CaseTransition.RECEIVE_APPEAL,
  ],
}

// Allows district court assistants to transition cases.
export const districtCourtAssistantTransitionRule: RolesRule = {
  role: UserRole.DISTRICT_COURT_ASSISTANT,
  type: RulesType.FIELD_VALUES,
  dtoField: 'transition',
  dtoFieldValues: [CaseTransition.RECEIVE, CaseTransition.COMPLETE],
}

// Allows court of appeals judges to transition cases.
export const courtOfAppealsJudgeTransitionRule: RolesRule = {
  role: UserRole.COURT_OF_APPEALS_JUDGE,
  type: RulesType.FIELD_VALUES,
  dtoField: 'transition',
  dtoFieldValues: [
    CaseTransition.COMPLETE_APPEAL,
    CaseTransition.REOPEN_APPEAL,
  ],
}

// Allows court of appeals registrars to transition cases.
export const courtOfAppealsRegistrarTransitionRule: RolesRule = {
  role: UserRole.COURT_OF_APPEALS_REGISTRAR,
  type: RulesType.FIELD_VALUES,
  dtoField: 'transition',
  dtoFieldValues: [
    CaseTransition.COMPLETE_APPEAL,
    CaseTransition.REOPEN_APPEAL,
  ],
}

// Allows court of appeals assistants to transition cases.
export const courtOfAppealsAssistantTransitionRule: RolesRule = {
  role: UserRole.COURT_OF_APPEALS_ASSISTANT,
  type: RulesType.FIELD_VALUES,
  dtoField: 'transition',
  dtoFieldValues: [
    CaseTransition.COMPLETE_APPEAL,
    CaseTransition.REOPEN_APPEAL,
  ],
}
