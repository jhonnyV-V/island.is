import { lazy } from 'react'
import { ApiScope } from '@island.is/auth/scopes'
import { PortalModule } from '@island.is/portals/core'
import { EducationStudentAssessmentPaths } from './lib/paths'
import { m } from '@island.is/service-portal/core'

export const educationStudentAssessmentModule: PortalModule = {
  name: 'Samræmd könnunarpróf',
  enabled: ({ isCompany }) => !isCompany,
  routes: ({ userInfo }) => [
    {
      name: m.educationStudentAssessment,
      path: EducationStudentAssessmentPaths.EducationStudentAssessment,
      enabled: userInfo.scopes.includes(ApiScope.education),
      render: () => lazy(() => import('./screens/EducationStudentAssessment')),
    },
  ],
}
