export const SEARCH_PROPERTIES_QUERY = `
    query SearchPropertiesQuery($input: SearchForPropertyInput!) {
      searchForProperty(input: $input) {
        propertyNumber
        defaultAddress {
          display
        }
        unitsOfUse {
          unitsOfUse {
            explanation
          }
        }
      }
    }
  `

export const SEARCH_ALL_PROPERTIES_QUERY = `
    query SearchPropertiesQuery($input: SearchForPropertyInput!) {
      searchForAllProperties(input: $input) {
        propertyNumber
        defaultAddress {
          display
        }
        unitsOfUse {
          unitsOfUse {
            explanation
          }
        }
      }
    }
`

export const VALIDATE_MORTGAGE_CERTIFICATE_QUERY = `
    query ValidateMortgageCertificateQuery($input: ValidateMortgageCertificateInput!) {
      validateMortgageCertificate(input: $input) {
        propertyNumber
        isFromSearch
        exists
        hasKMarking
      }
    }
  `
