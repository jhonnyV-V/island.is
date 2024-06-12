import { Injectable } from '@nestjs/common'
import { CoursesApi, ProgramsApi } from '../../gen/fetch/apis'
import { ICourse, IProgram } from '@island.is/university-gateway'
import { logger } from '@island.is/logging'
import {
  mapUglaPrograms,
  mapUglaCourses,
} from '@island.is/clients/university-application/university-of-iceland'

@Injectable()
export class AgriculturalUniversityOfIcelandApplicationClient {
  constructor(
    private readonly programsApi: ProgramsApi,
    private readonly coursesApi: CoursesApi,
  ) {}

  async getPrograms(): Promise<IProgram[]> {
    const res = await this.programsApi.activeProgramsGet()

    return mapUglaPrograms(res, 'agricultural-university-of-iceland')
  }

  async getCourses(programExternalId: string): Promise<ICourse[]> {
    const res = await this.coursesApi.programExternalIdCoursesGet({
      externalId: programExternalId,
      // specializationExternalId // TODO missing in api
    })

    return mapUglaCourses(res, (courseExternalId: string, e: Error) => {
      logger.error(
        `Failed to map course with externalId ${courseExternalId} for program with externalId ${programExternalId} (agricultural-university-of-iceland), reason:`,
        e,
      )
    })
  }
}
