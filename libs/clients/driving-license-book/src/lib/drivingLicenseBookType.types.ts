export const LICENSE_CATEGORY_B = 'B'

export interface CreatePracticalDrivingLessonInput {
  bookId: string
  minutes: number
  createdOn: string
  comments: string
}

export interface UpdatePracticalDrivingLessonInput {
  id: string
  bookId: string
  minutes: number
  createdOn: string
  comments: string
}

export interface DeletePracticalDrivingLessonInput {
  id: string
  bookId: string
  reason?: string
}

export interface PracticalDrivingLesson {
  bookId: string
  id: string
  studentNationalId: string
  studentName: string
  licenseCategory: string
  teacherNationalId: string
  teacherName: string
  minutes: number
  createdOn: string
  comments: string
}

export interface PracticalDrivingLessonsInput {
  bookId: string
  id: string
}

export interface DrivingLicenseBookStudentsInput {
  key: string
  licenseCategory: string
  cursor: string
  limit: number
}

export interface DrivingLicenseBookStudent {
  id: string
  nationalId: string
  name: string
  zipCode: number
  address: string
  email: string
  primaryPhoneNumber: string
  secondaryPhoneNumber: string
  active: boolean
  bookLicenseCategories: string[]
}

export interface DrivingLicenseBookStudentForTeacher {
  id: string
  nationalId: string
  name: string
  totalLessonCount: number
}

export interface DrivingLicenseBookStudentInput {
  nationalId: string
  licenseCategory?: 'B' | 'BE'
}

export interface DrivingLicenseBook {
  id: string
  licenseCategory: string
  createdOn: string
  teacherNationalId: string
  teacherName: string
  schoolNationalId: string
  schoolName: string
  isDigital: boolean
  status: number
  statusName: string
  totalLessonTime: number
  totalLessonCount: number
  teachersAndLessons: DrivingBookLesson[]
  drivingSchoolExams: DrivingSchoolExam[]
  testResults: DrivingLicenceTestResult[]
  practiceDriving?: boolean
}

export interface DrivingLicenseBookStudentOverview
  extends DrivingLicenseBookStudent {
  book: DrivingLicenseBook
}

export interface DrivingBookLesson {
  id: string
  registerDate: string
  lessonTime: number
  teacherNationalId: string
  teacherName: string
  comments: string
}

export interface DrivingSchoolExam {
  id: string
  examDate: string
  schoolNationalId: string
  schoolName: string
  schoolEmployeeNationalId: string
  schoolEmployeeName: string
  schoolTypeId: number
  schoolTypeName: string
  schoolTypeCode: string
  comments: string
  status: number
  statusName?: string
}

export interface DrivingLicenceTestResult {
  id: string
  examDate: string
  score: number
  scorePart1: number
  scorePart2: number
  hasPassed: boolean
  testCenterNationalId: string
  testCenterName: string
  testExaminerNationalId: string
  testExaminerName: string
  testTypeId: number
  testTypeName: string
  testTypeCode: string
  comments: string
}

export interface Organization {
  nationalId: string
  name: string
  address: string
  zipCode: string
  phoneNumber: string
  email: string
  website: string
  allowedDrivingSchoolTypes: SchoolType[]
}

export interface SchoolType {
  schoolTypeId: number
  schoolTypeName: string
  schoolTypeCode: string
  licenseCategory: string
}

export interface CreateDrivingSchoolTestResultInput {
  bookId: string
  schoolTypeId: number
  schoolNationalId: string
  schoolEmployeeNationalId: string
  createdOn: string
  comments?: string
}

export interface AllowedPractieDrivingInput {
  teacherNationalId: string
  studentNationalId: string
}

export interface TeacherRights {
  active: boolean
  hasRegisteredDrivingLessons: boolean
  rights: string[]
}
