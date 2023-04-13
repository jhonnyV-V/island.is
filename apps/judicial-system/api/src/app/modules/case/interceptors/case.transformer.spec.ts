import {
  CaseAppealState,
  CaseFileCategory,
} from '@island.is/judicial-system/types'
import each from 'jest-each'

import { Case } from '../models/case.model'
import { transformCase } from './case.transformer'

describe('transformCase', () => {
  each`
    originalValue | transformedValue
    ${null}       | ${false}
    ${false}      | ${false}
    ${true}       | ${true}
  `.describe(
    'when transforming boolean case attributes',
    ({ originalValue, transformedValue }) => {
      it(`should transform ${originalValue} sendRequestToDefender to ${transformedValue}`, () => {
        // Arrange
        const theCase = { sendRequestToDefender: originalValue } as Case

        // Act
        const res = transformCase(theCase)

        // Assert
        expect(res.sendRequestToDefender).toBe(transformedValue)
      })

      it(`should transform ${originalValue} requestProsecutorOnlySession to ${transformedValue}`, () => {
        // Arrange
        const theCase = { requestProsecutorOnlySession: originalValue } as Case

        // Act
        const res = transformCase(theCase)

        // Assert
        expect(res.requestProsecutorOnlySession).toBe(transformedValue)
      })

      it(`should transform ${originalValue} isClosedCourtHidden to ${transformedValue}`, () => {
        // Arrange
        const theCase = { isClosedCourtHidden: originalValue } as Case

        // Act
        const res = transformCase(theCase)

        // Assert
        expect(res.isClosedCourtHidden).toBe(transformedValue)
      })

      it(`should transform ${originalValue} isHightenedSecurityLevel to ${transformedValue}`, () => {
        // Arrange
        const theCase = { isHeightenedSecurityLevel: originalValue } as Case

        // Act
        const res = transformCase(theCase)

        // Assert
        expect(res.isHeightenedSecurityLevel).toBe(transformedValue)
      })
    },
  )

  describe('isValidToDateInThePast', () => {
    it('should not set custody end date in the past if no custody end date', () => {
      // Arrange
      const theCase = {} as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isValidToDateInThePast).toBeUndefined()
    })

    it('should set custody end date in the past to false if custody end date in the future', () => {
      // Arrange
      const validToDate = new Date()
      validToDate.setSeconds(validToDate.getSeconds() + 1)
      const theCase = { validToDate: validToDate.toISOString() } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isValidToDateInThePast).toBe(false)
    })

    it('should set custody end date in the past to true if custody end date in the past', () => {
      // Arrange
      const validToDate = new Date()
      validToDate.setSeconds(validToDate.getSeconds() - 1)
      const theCase = { validToDate: validToDate.toISOString() } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isValidToDateInThePast).toBe(true)
    })
  })

  describe('isAppealDeadlineExpired', () => {
    it('should be false when no court date is set', () => {
      // Arrange
      const theCase = {} as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isAppealDeadlineExpired).toBe(false)
    })

    it('should be false while the appeal window is open', () => {
      // Arrange
      const courtEndTime = new Date()
      courtEndTime.setDate(courtEndTime.getDate() - 3)
      courtEndTime.setSeconds(courtEndTime.getSeconds() + 1)
      const theCase = { courtEndTime: courtEndTime.toISOString() } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isAppealDeadlineExpired).toBe(false)
    })

    it('should be true when the appeal window has closed', () => {
      // Arrange
      const courtEndTime = new Date()
      courtEndTime.setDate(courtEndTime.getDate() - 3)
      const theCase = { courtEndTime: courtEndTime.toISOString() } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isAppealDeadlineExpired).toBe(true)
    })
  })

  describe('isAppealGracePeriodExpired', () => {
    it('should be false when no court end time is set', () => {
      // Arrange
      const theCase = {} as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isAppealGracePeriodExpired).toBe(false)
    })

    it('should be false while the appeal window is open', () => {
      // Arrange
      const courtEndTime = new Date()
      courtEndTime.setDate(courtEndTime.getDate() - 7)
      courtEndTime.setSeconds(courtEndTime.getSeconds() + 1)
      const theCase = { courtEndTime: courtEndTime.toISOString() } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isAppealGracePeriodExpired).toBe(false)
    })

    it('should be true when the appeal window has closed', () => {
      // Arrange
      const courtEndTime = new Date()
      courtEndTime.setDate(courtEndTime.getDate() - 7)
      const theCase = { courtEndTime: courtEndTime.toISOString() } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isAppealGracePeriodExpired).toBe(true)
    })
  })

  describe('isStatementDeadlineExpired', () => {
    it('should be false if the case has not been appealed', () => {
      // Arrange
      const theCase = { appealState: undefined } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isStatementDeadlineExpired).toBe(false)
    })

    it('should be true when more than one day has passed since the case was appealed', () => {
      // Arrange
      const prosecutorPostponedAppealDate = new Date()
      prosecutorPostponedAppealDate.setDate(
        prosecutorPostponedAppealDate.getDate() - 2,
      )
      const theCase = {
        prosecutorPostponedAppealDate: prosecutorPostponedAppealDate.toISOString(),
      } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isStatementDeadlineExpired).toBe(true)
    })

    it('should be false when less that one day has passed since the case was appealed', () => {
      // Arrange
      const accusedPostponedAppealDate = new Date()
      accusedPostponedAppealDate.setDate(accusedPostponedAppealDate.getDate())
      accusedPostponedAppealDate.setSeconds(
        accusedPostponedAppealDate.getSeconds() - 100,
      )
      const theCase = {
        accusedPostponedAppealDate: accusedPostponedAppealDate.toISOString(),
      } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.isStatementDeadlineExpired).toBe(false)
    })
  })

  describe('appealInfo', () => {
    it('should be undefined when no court end time is set', () => {
      // Arrange
      const theCase = {} as Case

      // Act
      const res = transformCase(theCase)

      // Assert

      expect(res.appealDeadline).toBeUndefined()
      expect(res.appealedByRole).toBeUndefined()
      expect(res.appealedDate).toBeUndefined()
      expect(res.hasBeenAppealed).toBe(false)
      expect(res.canBeAppealed).toBe(false)
    })

    it('should return appeal deadline and hasBeenAppealed set to false when case has not yet been appealed', () => {
      // Arrange
      const courtEndTime = new Date()
      courtEndTime.setDate(courtEndTime.getDate())
      courtEndTime.setSeconds(courtEndTime.getSeconds())
      const theCase = { courtEndTime: courtEndTime.toISOString() } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.appealDeadline).toBeDefined()
      expect(res.hasBeenAppealed).toBe(false)
    })

    it('should return hasBeenAppealed true and the correct appealed date when case has been appealed', () => {
      // Arrange
      const courtEndTime = new Date()
      courtEndTime.setDate(courtEndTime.getDate() - 1)
      const theCase = {
        courtEndTime: courtEndTime.toISOString(),
        accusedPostponedAppealDate: '2022-06-15T19:50:08.033Z',
        appealState: CaseAppealState.APPEALED,
      } as Case

      // Act
      const res = transformCase(theCase)

      // Assert
      expect(res.appealedDate).toBeDefined()
      expect(res.hasBeenAppealed).toBe(true)
    })

    it('should have correct prosecutor and defender statement dates when both parties have sent in their statements', () => {
      // Arrange
      const courtEndTime = new Date()
      courtEndTime.setDate(courtEndTime.getDate() - 1)
      const theCase = {
        caseFiles: [
          {
            id: '123',
            created: '2021-06-14T19:50:08.033Z',
            name: 'ProsecutorStatement',
            category: CaseFileCategory.PROSECUTOR_APPEAL_STATEMENT,
          },
          {
            id: '1234',
            created: '2021-06-15T19:50:08.033Z',
            name: 'DefenderStatement',
            category: CaseFileCategory.DEFENDANT_APPEAL_STATEMENT,
          },
        ],
      } as Case

      // Act
      const res = transformCase(theCase)

      //Assert
      expect(res.defenderStatementDate).toBeDefined()
      expect(res.prosecutorStatementDate).toBeDefined()
      expect(res.defenderStatementDate).toBe('2021-06-15T19:50:08.033Z')
      expect(res.prosecutorStatementDate).toBe('2021-06-14T19:50:08.033Z')
    })
  })
})
