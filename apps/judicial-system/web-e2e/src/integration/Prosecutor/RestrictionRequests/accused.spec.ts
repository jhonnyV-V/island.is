describe('/krafa/ny/gaesluvardhald', () => {
  beforeEach(() => {
    cy.stubAPIResponses()
    cy.visit('/krafa/ny/gaesluvardhald')
  })

  it('should require a valid police case number', () => {
    cy.getByTestid('policeCaseNumber').type('0').blur()
    cy.getByTestid('inputErrorMessage').contains('Dæmi: 012-3456-7890')
    cy.getByTestid('policeCaseNumber').clear().blur()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('policeCaseNumber').clear().type('00000000000')
    cy.getByTestid('inputErrorMessage').should('not.exist')
  })

  it.skip('should require the accused gender be selected', () => {
    cy.getByTestid('policeCaseNumber').type('00000000000')
    cy.getByTestid('nationalId').type('0000000000')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
    cy.getByTestid('nationalId').blur()
    cy.getByTestid('accusedName').type('Donald Duck')
    cy.getByTestid('accusedAddress').type('Batcave 1337')
    cy.getByTestid('leadInvestigator').type('John Doe')
    cy.getByTestid('continueButton').should('be.disabled')
    cy.getByTestid('select-defendantGender').click()
    cy.get('#react-select-defendantGender-option-0').click()
    cy.getByTestid('continueButton').should('not.be.disabled')
  })

  it('should require a valid accused national id if the user has a national id', () => {
    cy.getByTestid('nationalId').type('0').blur()
    cy.getByTestid('inputErrorMessage').contains('Dæmi: 000000-0000')
    cy.getByTestid('nationalId').clear().blur()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('nationalId').clear().type('0000000000')
    cy.getByTestid('inputErrorMessage').should('not.exist')
  })

  it('should require a valid accused date of birth if the user does not have a national id', () => {
    cy.get('[type="checkbox"]').check()
    cy.getByTestid('nationalId').type('0').blur()
    cy.getByTestid('inputErrorMessage').contains('Dæmi: 00.00.0000')
    cy.getByTestid('nationalId').clear().blur()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('nationalId').clear().type('01.01.2000')
    cy.getByTestid('inputErrorMessage').should('not.exist')
  })

  it('should require a valid accused name', () => {
    cy.getByTestid('accusedName').click().blur()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('accusedName').clear().type('Sidwell Sidwellsson')
    cy.getByTestid('inputErrorMessage').should('not.exist')
  })

  it('should require a valid accused address', () => {
    cy.getByTestid('accusedAddress').click().blur()
    cy.getByTestid('inputErrorMessage').contains('Reitur má ekki vera tómur')
    cy.getByTestid('accusedAddress').clear().type('Sidwellssongata 300')
    cy.getByTestid('inputErrorMessage').should('not.exist')
  })

  it.skip('should not allow users to move forward if they entered an invalid defender email address', () => {
    cy.getByTestid('policeCaseNumber').type('00000000000')
    cy.getByTestid('nationalId').type('0000000000')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
    cy.getByTestid('nationalId').blur()
    cy.getByTestid('accusedName').type('Donald Duck')
    cy.getByTestid('accusedAddress').type('Batcave 1337')
    cy.getByTestid('select-defendantGender').click()
    cy.get('#react-select-defendantGender-option-0').click()
    cy.getByTestid('leadInvestigator').type('John Doe')
    cy.getByTestid('continueButton').should('not.be.disabled')
    cy.getByTestid('defenderEmail').type('ill formed email address')
    cy.getByTestid('continueButton').should('be.disabled')
  })
})
