import { Configuration, DrivingLicenseBookApi } from '../../gen/fetch'
import { createEnhancedFetch } from '@island.is/clients/middlewares'
import { XRoadConfig } from '@island.is/nest/config'
import type { ConfigType } from '@island.is/nest/config'
import { DrivingLicenseBookClientConfig } from './drivingLicenseBookClient.config'
import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { AuthHeaderMiddleware, User } from '@island.is/auth-nest-tools'
import {
  CreateDrivingSchoolTestResultInput,
  CreatePracticalDrivingLessonInput,
  DeletePracticalDrivingLessonInput,
  DrivingLicenseBookStudent,
  DrivingLicenseBookStudentForTeacher,
  DrivingLicenseBookStudentInput,
  DrivingLicenseBookStudentOverview,
  DrivingLicenseBookStudentsInput,
  LICENSE_CATEGORY_B,
  Organization,
  PracticalDrivingLesson,
  PracticalDrivingLessonsInput,
  SchoolType,
  UpdatePracticalDrivingLessonInput,
} from './drivingLicenseBookType.types'
import { getStudentMapper } from '../utils/drivingLicenseBookMapper'

@Injectable()
export class DrivingLicenseBookClientApiFactory {
  constructor(
    @Inject(DrivingLicenseBookClientConfig.KEY)
    private clientConfig: ConfigType<typeof DrivingLicenseBookClientConfig>,
    @Inject(XRoadConfig.KEY)
    private xroadConfig: ConfigType<typeof XRoadConfig>,
  ) {}

  async create() {
    const api = new DrivingLicenseBookApi(
      new Configuration({
        fetchApi: createEnhancedFetch({
          name: 'clients-driving-license-book',
          ...this.clientConfig.fetch,
        }),
        basePath: `${this.xroadConfig.xRoadBasePath}/r1/${this.clientConfig.xRoadServicePath}`,
        headers: {
          'X-Road-Client': this.xroadConfig.xRoadClient,
        },
      }),
    )

    const config = {
      username: this.clientConfig.username,
      password: this.clientConfig.password,
    }

    const { token } = await api.apiAuthenticationAuthenticatePost({
      authenticateModel: config,
    })
    if (token) {
      return api.withMiddleware(new AuthHeaderMiddleware(`Bearer ${token}`))
    } else {
      throw new Error('Syslumenn client configuration and login went wrong')
    }
  }

  async createPracticalDrivingLesson(
    input: CreatePracticalDrivingLessonInput,
    user: User,
  ): Promise<Partial<Pick<PracticalDrivingLesson, 'id'>> | null> {
    const api = await this.create()
    const { data } = await api.apiTeacherCreatePracticalDrivingLessonPost({
      practicalDrivingLessonCreateRequestBody: {
        ...input,
        teacherSsn: user.nationalId,
      },
    })
    if (data && data.id) {
      return { id: data.id }
    }
    return null
  }

  async updatePracticalDrivingLesson(
    {
      bookId,
      id,
      minutes,
      createdOn,
      comments,
    }: UpdatePracticalDrivingLessonInput,
    user: User,
  ): Promise<{ success: boolean }> {
    const api = await this.create()
    const lesson: PracticalDrivingLesson[] = await this.getPracticalDrivingLessons(
      { bookId, id },
    )
    if (lesson[0].teacherNationalId === user.nationalId) {
      try {
        await api.apiTeacherUpdatePracticalDrivingLessonIdPut({
          id: id,
          practicalDrivingLessonUpdateRequestBody: {
            minutes: minutes,
            createdOn: createdOn,
            comments: comments,
          },
        })
        return { success: true }
      } catch (e) {
        return { success: false }
      }
    }
    throw new ForbiddenException(
      `User ${user.nationalId} can not update practical driving lesson ${id}`,
    )
  }

  async deletePracticalDrivingLesson(
    { bookId, id, reason }: DeletePracticalDrivingLessonInput,
    user: User,
  ) {
    const api = await this.create()
    const lesson: PracticalDrivingLesson[] = await this.getPracticalDrivingLessons(
      { bookId, id },
    )
    if (lesson[0].teacherNationalId === user.nationalId) {
      try {
        await api.apiTeacherDeletePracticalDrivingLessonIdDelete({ id, reason })
        return { success: true }
      } catch (e) {
        return { success: false }
      }
    }
    throw new ForbiddenException(
      `User ${user.nationalId} can not delete practical driving lesson ${id}`,
    )
  }

  async findStudent(
    input: DrivingLicenseBookStudentsInput,
  ): Promise<DrivingLicenseBookStudent[]> {
    const api = await this.create()
    const { data } = await api.apiStudentGetStudentListGet(input)
    if (!data) {
      throw new NotFoundException(`Student not found drivingLicenseBook`)
    }
    return data
      .filter((student) => !!student && !!student.ssn && !!student.id)
      .map((student) => ({
        id: student.id ?? '',
        nationalId: student.ssn ?? '',
        name: student.name ?? '',
        zipCode: student.zipCode ?? -1,
        address: student.address ?? '',
        email: student.email ?? '',
        primaryPhoneNumber: student.primaryPhoneNumber ?? '',
        secondaryPhoneNumber: student.secondaryPhoneNumber ?? '',
        active: student.active ?? false,
        bookLicenseCategories: student.bookLicenseCategories ?? [''],
      }))
  }

  async getStudentsForTeacher(
    user: User,
  ): Promise<DrivingLicenseBookStudentForTeacher[]> {
    const api = await this.create()
    const {
      data,
    } = await api.apiTeacherGetStudentOverviewForTeacherTeacherSsnGet({
      teacherSsn: user.nationalId,
    })
    if (!data) {
      throw new NotFoundException(
        `Students for teacher with nationalId ${user.nationalId} not found`,
      )
    }
    // Remove nullish students, then map the students' fields to sane non-nullish values.
    // Note that id and nationalId are never missing in practice.
    return data
      .filter((student) => !!student && !!student.ssn && !!student.studentId)
      .map((student) => ({
        id: student.studentId ?? '-1',
        nationalId: student.ssn ?? '',
        name: student.name ?? '',
        totalLessonCount: student.totalLessonCount ?? -1,
      }))
  }

  async getStudent({
    nationalId,
  }: DrivingLicenseBookStudentInput): Promise<DrivingLicenseBookStudentOverview> {
    const api = await this.create()
    const { data } = await api.apiStudentGetStudentOverviewSsnGet({
      ssn: nationalId,
    })
    if (data?.books && data?.ssn) {
      const activeBook = await this.getActiveBookId(data?.ssn)
      const book = data.books.filter((b) => b.id === activeBook && !!b.id)[0]
      return getStudentMapper(data, book)
    }

    throw new NotFoundException(
      `Student for nationalId ${nationalId} not found`,
    )
  }

  async getMostRecentStudentBook({
    nationalId,
  }: DrivingLicenseBookStudentInput): Promise<DrivingLicenseBookStudentOverview | null> {
    const api = await this.create()
    const { data } = await api.apiStudentGetStudentOverviewSsnGet({
      ssn: nationalId,
      showInactiveBooks: true,
    })
    if (data?.books) {
      const book = data.books.reduce((a, b) =>
        new Date(a.createdOn ?? '') > new Date(b.createdOn ?? '') ? a : b,
      )

      return getStudentMapper(data, book)
    }
    return null
  }

  async getSchoolForSchoolStaff(user: User): Promise<Organization> {
    const api = await this.create()
    const employee = await api.apiSchoolGetSchoolForSchoolStaffUserSsnGet({
      userSsn: user.nationalId,
    })
    if (!employee) {
      throw new NotFoundException(
        `School for user ${user.nationalId} not found`,
      )
    }
    const { data } = await api.apiSchoolGetSchoolTypesGet({
      licenseCategory: 'B',
    })

    const allowedSchoolTypes = data
      ?.filter(
        (type) =>
          type?.schoolTypeCode &&
          employee.allowedDrivingSchoolTypes?.includes(type?.schoolTypeCode),
      )
      .map(
        (type) =>
          ({
            schoolTypeId: type.schoolTypeId ?? -1,
            schoolTypeName: type.schoolTypeName ?? '',
            schoolTypeCode: type.schoolTypeCode ?? '',
            licenseCategory: type.licenseCategory ?? '',
          } as SchoolType),
      )

    return {
      nationalId: employee.ssn ?? '',
      name: employee.name ?? '',
      address: employee.address ?? '',
      zipCode: employee.zipCode ?? '',
      phoneNumber: employee.phoneNumber ?? '',
      email: employee.email ?? '',
      website: employee.website ?? '',
      allowedDrivingSchoolTypes: allowedSchoolTypes ?? [],
    }
  }

  async isSchoolStaff(user: User): Promise<boolean> {
    const api = await this.create()
    const employee = await api.apiSchoolGetSchoolForSchoolStaffUserSsnGet({
      userSsn: user.nationalId,
    })
    if (!employee) {
      return false
    }
    return true
  }

  async createDrivingSchoolTestResult(
    input: CreateDrivingSchoolTestResultInput,
  ): Promise<{ id: string } | null> {
    const api = await this.create()
    const { data } = await api.apiSchoolCreateSchoolTestResultPost({
      schoolTestResultCreateRequestBody: {
        bookId: input.bookId,
        schoolTypeId: input.schoolTypeId,
        schoolSsn: input.schoolNationalId,
        schoolEmployeeSsn: input.schoolEmployeeNationalId,
        createdOn: input.createdOn,
        comments: input.comments,
      },
    })
    return data?.id ? { id: data.id } : null
  }

  async getPracticalDrivingLessons(
    input: PracticalDrivingLessonsInput,
  ): Promise<PracticalDrivingLesson[]> {
    const api = await this.create()
    const { data } = await api.apiTeacherGetPracticalDrivingLessonsBookIdGet(
      input,
    )
    if (!data) {
      throw new NotFoundException(
        `Practical driving lesson for id ${input.id} not found`,
      )
    }
    return data
      .filter(
        (practical) => !!practical && !!practical.bookId && !!practical.id,
      )
      .map((practical) => ({
        bookId: practical.bookId ?? '',
        id: practical.id ?? '',
        studentNationalId: practical.studentSsn ?? '',
        studentName: practical.studentName ?? '',
        licenseCategory: practical.licenseCategory ?? '',
        teacherNationalId: practical.teacherSsn ?? '',
        teacherName: practical.teacherName ?? '',
        minutes: practical.minutes ?? -1,
        createdOn: practical.createdOn ?? '',
        comments: practical.comments ?? '',
      }))
  }

  async getSchoolTypes(): Promise<SchoolType[] | null> {
    const api = await this.create()
    const { data } = await api.apiSchoolGetSchoolTypesGet({
      licenseCategory: LICENSE_CATEGORY_B,
    })
    return (
      data?.map((type) => ({
        schoolTypeId: type.schoolTypeId ?? -1,
        schoolTypeName: type.schoolTypeName ?? '',
        schoolTypeCode: type.schoolTypeCode ?? '',
        licenseCategory: type.licenseCategory ?? '',
      })) || null
    )
  }

  private async getActiveBookId(nationalId: string): Promise<string | null> {
    const api = await this.create()
    const { data } = await api.apiStudentGetStudentActiveBookIdSsnGet({
      ssn: nationalId,
      licenseCategory: LICENSE_CATEGORY_B,
    })
    return data?.bookId || null
  }
}
