import { Nam } from '../../gen/fetch'

export interface HealthcareLicense {
  professionId: string
  professionNameIs: string
  professionNameEn: string
  specialityList: {
    specialityNameIs: string
    specialityNameEn: string
  }[]
  isTemporary: boolean
  validTo?: Date
  isRestricted: boolean
}

export interface HealthcareLicenseCertificateRequest {
  fullName: string
  dateOfBirth: Date
  email: string
  phone: string
  professionIdList: string[]
}

export interface HealthcareLicenseCertificate {
  professionId: string
  base64: string
}

export interface HealthcareWorkPermitRequest {
  name: string
  dateOfBirth: Date
  email: string
  phone: string
  idProfession: string
  citizenship: string
  education: Nam[]
}
