import {
  courtOfAppealsAssistantRule,
  courtOfAppealsJudgeRule,
  courtOfAppealsRegistrarRule,
  districtCourtAssistantRule,
  districtCourtJudgeRule,
  districtCourtRegistrarRule,
  prosecutorRepresentativeRule,
  prosecutorRule,
  publicProsecutorStaffRule,
} from '../../../../guards'
import { CaseController } from '../../case.controller'

describe('CaseController - Get by id rules', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rules: any[]

  beforeEach(() => {
    rules = Reflect.getMetadata('roles-rules', CaseController.prototype.getById)
  })

  it('should give permission to roles', () => {
    expect(rules).toHaveLength(9)
    expect(rules).toContain(prosecutorRule)
    expect(rules).toContain(prosecutorRepresentativeRule)
    expect(rules).toContain(districtCourtJudgeRule)
    expect(rules).toContain(districtCourtRegistrarRule)
    expect(rules).toContain(districtCourtAssistantRule)
    expect(rules).toContain(courtOfAppealsJudgeRule)
    expect(rules).toContain(courtOfAppealsRegistrarRule)
    expect(rules).toContain(courtOfAppealsAssistantRule)
    expect(rules).toContain(publicProsecutorStaffRule)
  })
})
