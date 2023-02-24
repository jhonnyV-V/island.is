export const GET_VEHICLE_INFORMATION = `
  query GetVehiclesDetail($input: GetVehicleDetailInput!) {
    vehiclesDetail(input: $input) {
      coOwners {
        nationalId
        owner
      }
    }
  }
`

export const IDENTITY_QUERY = `
  query IdentityQuery($input: IdentityInput!) {
    identity(input: $input) {
      name
      nationalId
    }
  }
`

export const GET_VEHICLE_OWNERCHANGE_CHECKS_BY_PERMNO = `
  query GetVehicleOwnerchangeChecksByPermno($permno: String!) {
    vehicleOwnerchangeChecksByPermno(permno: $permno) {
      isDebtLess
      validationErrorMessages {
        errorNo
        defaultMessage
      }
    }
  } 
`

export const VALIDATE_VEHICLE_OWNER_CHANGE = `
  query GetVehicleOwnerChangeValidation($answers: OwnerChangeAnswers!) {
    vehicleOwnerChangeValidation(answers: $answers) {
      hasError
      errorMessages {
        errorNo
        defaultMessage
      }
    }
  } 
`
