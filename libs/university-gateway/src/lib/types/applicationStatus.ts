export enum ApplicationStatus {
  IN_REVIEW = 'IN_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  ACCEPTED_BY_UNIVERSITY = 'ACCEPTED_BY_UNIVERSITY',
  ACCEPTED_BY_UNIVERSITY_WITH_CONDITION = 'ACCEPTED_BY_UNIVERSITY_WITH_CONDITION',
  ACCEPTED_BY_UNIVERSITY_AND_STUDENT = 'ACCEPTED_BY_UNIVERSITY_AND_STUDENT',
  REJECTED_BY_STUDENT_REASON_CANCELLED = 'REJECTED_BY_STUDENT_REASON_CANCELLED',
  REJECTED_BY_STUDENT_REASON_OTHER_ACCEPTED = 'REJECTED_BY_STUDENT_REASON_OTHER_ACCEPTED',
  REJECTED_BY_UNIVERSITY_REASON_INSUFFICIENT = 'REJECTED_BY_UNIVERSITY_REASON_INSUFFICIENT',
  REJECTED_BY_UNIVERSITY_REASON_NO_AVAILABILITY = 'REJECTED_BY_UNIVERSITY_REASON_NO_AVAILABILITY',
  CANCELLED_BY_STUDENT = 'CANCELLED_BY_STUDENT',
  PAYMENT_COMPLETE = 'PAYMENT_COMPLETE',
}
