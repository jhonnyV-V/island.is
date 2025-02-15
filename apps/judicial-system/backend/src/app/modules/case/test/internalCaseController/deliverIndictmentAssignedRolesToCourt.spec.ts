import { uuid } from 'uuidv4'

import { CaseType, User, UserRole } from '@island.is/judicial-system/types'

import { createTestingCaseModule } from '../createTestingCaseModule'

import { CourtService } from '../../../court'
import { Case } from '../../models/case.model'
import { DeliverResponse } from '../../models/deliver.response'

interface Then {
  result: DeliverResponse
  error: Error
}

type GivenWhenThen = (
  caseId: string,
  theCase: Case,
  nationalId: string,
) => Promise<Then>

describe('InternalCaseController - Deliver assigned roles for indictment case to court', () => {
  const user = { id: uuid() } as User
  const caseId = uuid()
  const courtCaseNumber = uuid()

  const theCase = {
    id: caseId,
    type: CaseType.INDICTMENT,
    courtCaseNumber,
    judge: { name: 'Test Dómari', nationalId: '0101010101' },
    registrar: { name: 'Test Ritari', nationalId: '0202020202' },
  } as Case

  let mockCourtService: CourtService
  let givenWhenThen: GivenWhenThen

  beforeAll(async () => {
    const { courtService, internalCaseController } =
      await createTestingCaseModule()

    mockCourtService = courtService
    const mockUpdateIndictmentCaseWithAssignedRoles =
      mockCourtService.updateIndictmentCaseWithAssignedRoles as jest.Mock
    mockUpdateIndictmentCaseWithAssignedRoles.mockResolvedValue(uuid())

    givenWhenThen = async (
      caseId: string,
      theCase: Case,
      nationalId: string,
    ) => {
      const then = {} as Then

      await internalCaseController
        .deliverIndictmentAssignedRoleToCourt(
          caseId,
          theCase,
          { user },
          nationalId,
        )
        .then((result) => (then.result = result))
        .catch((error) => (then.error = error))

      return then
    }
  })

  describe('deliver assigned roles in indictment case to court', () => {
    let then: Then

    beforeAll(async () => {
      then = await givenWhenThen(caseId, theCase, '0101010101')
    })

    it('should deliver the assigned roles to the court', () => {
      expect(
        mockCourtService.updateIndictmentCaseWithAssignedRoles,
      ).toHaveBeenCalledWith(user, theCase.id, theCase.courtCaseNumber, {
        name: theCase.judge?.name,
        role: UserRole.DISTRICT_COURT_JUDGE,
      })

      expect(then.result).toEqual({ delivered: true })
    })
  })
})
