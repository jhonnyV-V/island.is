import { Op } from 'sequelize'

import type { User } from '@island.is/judicial-system/types'
import {
  CaseAppealState,
  CaseDecision,
  CaseState,
  CaseType,
  completedIndictmentCaseStates,
  completedRequestCaseStates,
  courtOfAppealsRoles,
  DateType,
  districtCourtRoles,
  indictmentCases,
  InstitutionType,
  investigationCases,
  publicProsecutorRoles,
  RequestSharedWithDefender,
  restrictionCases,
  UserRole,
} from '@island.is/judicial-system/types'

import { getCasesQueryFilter } from '../cases.filter'

describe('getCasesQueryFilter', () => {
  it('should get prosecutor filter', () => {
    // Arrange
    const user = {
      id: 'Prosecutor Id',
      role: UserRole.PROSECUTOR,
      institution: {
        id: 'Prosecutors Office Id',
        type: InstitutionType.PROSECUTORS_OFFICE,
      },
    }

    // Act
    const res = getCasesQueryFilter(user as User)

    // Assert
    expect(res).toStrictEqual({
      [Op.and]: [
        { isArchived: false },
        {
          state: [
            CaseState.NEW,
            CaseState.DRAFT,
            CaseState.WAITING_FOR_CONFIRMATION,
            CaseState.SUBMITTED,
            CaseState.RECEIVED,
            CaseState.MAIN_HEARING,
            CaseState.ACCEPTED,
            CaseState.REJECTED,
            CaseState.DISMISSED,
            CaseState.COMPLETED,
          ],
        },

        {
          [Op.or]: [
            { prosecutors_office_id: 'Prosecutors Office Id' },
            { shared_with_prosecutors_office_id: 'Prosecutors Office Id' },
            { indictment_reviewer_id: 'Prosecutor Id' },
          ],
        },
        {
          [Op.or]: [
            { is_heightened_security_level: { [Op.is]: null } },
            { is_heightened_security_level: false },
            { creating_prosecutor_id: 'Prosecutor Id' },
            { prosecutor_id: 'Prosecutor Id' },
          ],
        },
        {
          type: [
            ...restrictionCases,
            ...investigationCases,
            ...indictmentCases,
          ],
        },
      ],
    })
  })

  it('should get prosecutor representative filter', () => {
    // Arrange
    const user = {
      id: 'Prosecutor Id',
      role: UserRole.PROSECUTOR_REPRESENTATIVE,
      institution: {
        id: 'Prosecutors Office Id',
        type: InstitutionType.PROSECUTORS_OFFICE,
      },
    }

    // Act
    const res = getCasesQueryFilter(user as User)

    // Assert
    expect(res).toStrictEqual({
      [Op.and]: [
        { isArchived: false },
        {
          state: [
            CaseState.NEW,
            CaseState.DRAFT,
            CaseState.WAITING_FOR_CONFIRMATION,
            CaseState.SUBMITTED,
            CaseState.RECEIVED,
            CaseState.MAIN_HEARING,
            CaseState.ACCEPTED,
            CaseState.REJECTED,
            CaseState.DISMISSED,
            CaseState.COMPLETED,
          ],
        },
        {
          [Op.or]: [
            { prosecutors_office_id: 'Prosecutors Office Id' },
            { shared_with_prosecutors_office_id: 'Prosecutors Office Id' },
            { indictment_reviewer_id: 'Prosecutor Id' },
          ],
        },
        {
          [Op.or]: [
            { is_heightened_security_level: { [Op.is]: null } },
            { is_heightened_security_level: false },
            { creating_prosecutor_id: user.id },
            { prosecutor_id: user.id },
          ],
        },
        { type: indictmentCases },
      ],
    })
  })

  describe.each([
    UserRole.DISTRICT_COURT_JUDGE,
    UserRole.DISTRICT_COURT_REGISTRAR,
  ])('given %s role', (role) => {
    it(`should get ${role} filter`, () => {
      // Arrange
      const user = {
        role,
        institution: { id: 'Court Id', type: InstitutionType.DISTRICT_COURT },
      }

      // Act
      const res = getCasesQueryFilter(user as User)

      // Assert
      expect(res).toStrictEqual({
        [Op.and]: [
          { isArchived: false },
          {
            [Op.or]: [
              { court_id: { [Op.is]: null } },
              { court_id: 'Court Id' },
            ],
          },
          {
            [Op.or]: [
              {
                [Op.and]: [
                  { type: [...restrictionCases, ...investigationCases] },
                  {
                    state: [
                      CaseState.DRAFT,
                      CaseState.SUBMITTED,
                      CaseState.RECEIVED,
                      CaseState.ACCEPTED,
                      CaseState.REJECTED,
                      CaseState.DISMISSED,
                    ],
                  },
                ],
              },
              {
                [Op.and]: [
                  { type: indictmentCases },
                  {
                    state: [
                      CaseState.SUBMITTED,
                      CaseState.RECEIVED,
                      CaseState.MAIN_HEARING,
                      CaseState.COMPLETED,
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    })
  })

  describe.each(
    districtCourtRoles.filter(
      (role) =>
        ![
          UserRole.DISTRICT_COURT_JUDGE,
          UserRole.DISTRICT_COURT_REGISTRAR,
        ].includes(role as UserRole),
    ),
  )('given %s role', (role) => {
    it(`should get assistant filter`, () => {
      // Arrange
      const user = {
        role,
        institution: { id: 'Court Id', type: InstitutionType.DISTRICT_COURT },
      }

      // Act
      const res = getCasesQueryFilter(user as User)

      // Assert
      expect(res).toStrictEqual({
        [Op.and]: [
          { isArchived: false },
          {
            [Op.or]: [
              { court_id: { [Op.is]: null } },
              { court_id: 'Court Id' },
            ],
          },
          { type: indictmentCases },
          {
            state: [
              CaseState.SUBMITTED,
              CaseState.RECEIVED,
              CaseState.MAIN_HEARING,
              CaseState.COMPLETED,
            ],
          },
        ],
      })
    })
  })

  describe.each(courtOfAppealsRoles)('given %s role', (role) => {
    it('should get court of appeals filter', () => {
      // Arrange
      const user = {
        role,
        institution: {
          id: 'Court of Appeals Id',
          type: InstitutionType.COURT_OF_APPEALS,
        },
      }

      // Act
      const res = getCasesQueryFilter(user as User)

      // Assert
      expect(res).toStrictEqual({
        [Op.and]: [
          { isArchived: false },
          { type: [...restrictionCases, ...investigationCases] },
          {
            state: [
              CaseState.ACCEPTED,
              CaseState.REJECTED,
              CaseState.DISMISSED,
            ],
          },
          {
            [Op.or]: [
              {
                appeal_state: [
                  CaseAppealState.RECEIVED,
                  CaseAppealState.COMPLETED,
                ],
              },
              {
                [Op.and]: [
                  { appeal_state: [CaseAppealState.WITHDRAWN] },
                  { appeal_received_by_court_date: { [Op.not]: null } },
                ],
              },
            ],
          },
        ],
      })
    })
  })

  describe.each(publicProsecutorRoles)('given %s role', (role) => {
    it('should get public prosecutor filter', () => {
      // Arrange
      const user = {
        id: 'Public Prosecutor Office Id',
        role,
        institution: {
          id: '8f9e2f6d-6a00-4a5e-b39b-95fd110d762e',
          type: InstitutionType.PROSECUTORS_OFFICE,
        },
      }

      // Act
      const res = getCasesQueryFilter(user as User)

      // Assert
      expect(res).toStrictEqual({
        [Op.and]: [
          { isArchived: false },
          {
            state: [CaseState.COMPLETED],
          },
          {
            type: indictmentCases,
          },
        ],
      })
    })
  })

  it('should get prison staff filter', () => {
    // Arrange
    const user = {
      id: 'Staff Id',
      role: UserRole.PRISON_SYSTEM_STAFF,
      institution: {
        id: 'Prison Id',
        type: InstitutionType.PRISON,
      },
    }

    // Act
    const res = getCasesQueryFilter(user as User)

    // Assert
    expect(res).toStrictEqual({
      [Op.and]: [
        { isArchived: false },
        { state: CaseState.ACCEPTED },
        {
          type: [
            CaseType.CUSTODY,
            CaseType.ADMISSION_TO_FACILITY,
            CaseType.PAROLE_REVOCATION,
          ],
        },
        {
          decision: [CaseDecision.ACCEPTING, CaseDecision.ACCEPTING_PARTIALLY],
        },
      ],
    })
  })

  it('should get prison admin staff filter', () => {
    // Arrange
    const user = {
      id: 'Staff Id',
      role: UserRole.PRISON_SYSTEM_STAFF,
      institution: {
        id: 'Prison Id',
        type: InstitutionType.PRISON_ADMIN,
      },
    }

    // Act
    const res = getCasesQueryFilter(user as User)

    // Assert
    expect(res).toStrictEqual({
      [Op.and]: [
        { isArchived: false },
        { state: CaseState.ACCEPTED },
        {
          type: [
            CaseType.CUSTODY,
            CaseType.ADMISSION_TO_FACILITY,
            CaseType.PAROLE_REVOCATION,
            CaseType.TRAVEL_BAN,
          ],
        },
      ],
    })
  })

  it('should get defender filter', () => {
    // Arrange
    const user = {
      id: 'Defender Id',
      nationalId: 'Defender National Id',
      role: UserRole.DEFENDER,
    }

    // Act
    const res = getCasesQueryFilter(user as User)

    // Assert
    expect(res).toStrictEqual({
      [Op.and]: [
        { isArchived: false },
        {
          [Op.or]: [
            {
              [Op.and]: [
                { type: [...restrictionCases, ...investigationCases] },
                {
                  [Op.or]: [
                    {
                      [Op.and]: [
                        { state: [CaseState.SUBMITTED, CaseState.RECEIVED] },
                        {
                          request_shared_with_defender:
                            RequestSharedWithDefender.READY_FOR_COURT,
                        },
                      ],
                    },
                    {
                      [Op.and]: [
                        { state: CaseState.RECEIVED },
                        { '$dateLogs.date_type$': DateType.ARRAIGNMENT_DATE },
                      ],
                    },
                    { state: completedRequestCaseStates },
                  ],
                },
                {
                  defender_national_id: {
                    [Op.or]: [user.nationalId, user.nationalId],
                  },
                },
              ],
            },
            {
              [Op.and]: [
                { type: indictmentCases },
                {
                  state: [
                    CaseState.RECEIVED,
                    CaseState.MAIN_HEARING,
                    ...completedIndictmentCaseStates,
                  ],
                },
                {
                  '$defendants.defender_national_id$': {
                    [Op.or]: [user.nationalId, user.nationalId],
                  },
                },
              ],
            },
          ],
        },
      ],
    })
  })
})
