export interface DriversLicenseCategory {
  id: number
  name: string
  issued: Date | null
  expires: Date | null
  comments: string | null
  validToText?: string | null
  validToCode?: number | null
  nr?: string | null
}

export interface Disqualification {
  to: Date
  from: Date
}

export interface DriversLicense {
  id: number
  name: string
  issued?: Date | null
  expires?: Date | null
  categories: DriversLicenseCategory[]
  healthRemarks?: string[]
  disqualification?: Disqualification | null
  birthCountry?: string | null
}

export interface RemarkCode {
  index: string
  name: string
}

export interface Teacher {
  nationalId: string
  name: string
}

export interface TeacherV4 {
  name: string
  nationalId: string
  driverLicenseId: number | null | undefined
}
export interface DriverLicenseWithoutImages {
  id?: number;
  name?: string | null;
  socialSecurityNumber?: string | null;
  birthPlace?: string | null;
  birthPlaceName?: string | null;
  publishDate?: Date | null;
  dateValidTo?: Date;
  publishPlaceNr?: number;
  publishPlaceName?: string | null;
  categories?: Category[] | null;
  licenseComments?: string | null;
  comments?: LicenseComments[] | null;
  deprivation?: Deprivation;
}

export interface Category {
  id?: number;
  nr?: string | null;
  categoryName?: string | null;
  publishDate?: Date | null;
  dateTo?: Date;
  validToCode?: number;
  validToText?: string | null;
  comment?: string | null;
}

interface Deprivation {
  dateFrom?: Date | null;
  dateTo?: Date | null;
  licenseLost?: boolean | null;
  deprivationName?: string | null;
  deprivationType?: number | null;
  licenseExpired?: boolean | null;
  retakeLicense?: boolean | null;
}

interface LicenseComments {
  id?: number;
  nr?: string | null;
  comment?: string | null;
}

export interface Jurisdiction {
  id: number
  name: string
  zip: number
}

export interface DrivingAssessment {
  nationalIdStudent: string
  nationalIdTeacher: string
  created: Date | null
}

export interface QualityPhoto {
  data: string
}

export interface QualitySignature {
  data: string
}

export type CanApplyErrorCodeBTemporary =
  | 'PERSON_NOT_FOUND_IN_NATIONAL_REGISTRY'
  | 'NO_LICENSE_FOUND'
  | 'PERSON_NOT_17_YEARS_OLD'
  | 'HAS_DEPRIVATION'
  | 'HAS_NO_PHOTO'
  | 'HAS_NO_SIGNATURE'
  | 'HAS_B_CATEGORY'

export type CanApplyErrorCodeBFull =
  | 'HAS_POINTS'
  | 'NO_TEMP_LICENSE'
  | 'HAS_DEPRIVATION'

export interface CanApplyForCategoryResult<
  T extends CanApplyErrorCodeBFull | CanApplyErrorCodeBTemporary,
> {
  result: boolean
  errorCode?: T | undefined
}
