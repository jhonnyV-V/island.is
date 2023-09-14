import { Injectable } from '@nestjs/common'
import {
  CourseSemesterSeasonEnum,
  ProgramApi,
  ProgramControllerGetProgramsDegreeTypeEnum,
  ProgramControllerGetProgramsSeasonEnum,
  ProgramCourseRequirementEnum,
  ProgramDegreeTypeEnum,
  ProgramDetailsDegreeTypeEnum,
  ProgramDetailsStartingSemesterSeasonEnum,
  ProgramModeOfDeliveryModeOfDeliveryEnum,
  ProgramStartingSemesterSeasonEnum,
} from '@island.is/clients/university-gateway-api'
import { GetProgramByIdInput, ProgramsPaginated } from './graphql/dto'
import { GetProgramsInput } from './graphql/dto/getPrograms.input'
import { ProgramDetails } from './graphql/models'
import {
  DegreeType,
  ModeOfDelivery,
  Requirement,
  Season,
  mapEnum,
} from '@island.is/university-gateway-lib'

export
@Injectable()
class UniversityGatewayApi {
  constructor(private readonly programApi: ProgramApi) {}

  async getPrograms(input: GetProgramsInput): Promise<ProgramsPaginated> {
    const res = await this.programApi.programControllerGetPrograms({
      limit: input.limit,
      before: input.before,
      after: input.after,
      active: input.active,
      year: input.year,
      season:
        input.season &&
        mapEnum(input.season, Season, ProgramControllerGetProgramsSeasonEnum),
      universityId: input.universityId,
      degreeType:
        input.degreeType &&
        mapEnum(
          input.degreeType,
          DegreeType,
          ProgramControllerGetProgramsDegreeTypeEnum,
        ),
    })

    return {
      totalCount: res.totalCount,
      pageInfo: res.pageInfo,
      data: res.data.map((item) => ({
        id: item.id,
        externalId: item.externalId,
        active: item.active,
        nameIs: item.nameIs,
        nameEn: item.nameEn,
        universityId: item.universityId,
        departmentNameIs: item.departmentNameIs,
        departmentNameEn: item.departmentNameEn,
        startingSemesterYear: item.startingSemesterYear,
        startingSemesterSeason: mapEnum(
          item.startingSemesterSeason,
          ProgramStartingSemesterSeasonEnum,
          Season,
        ),
        applicationStartDate: item.applicationStartDate,
        applicationEndDate: item.applicationEndDate,
        degreeType: mapEnum(item.degreeType, ProgramDegreeTypeEnum, DegreeType),
        degreeAbbreviation: item.degreeAbbreviation,
        credits: item.credits,
        descriptionIs: item.descriptionIs,
        descriptionEn: item.descriptionEn,
        durationInYears: item.durationInYears,
        costPerYear: item.costPerYear,
        iscedCode: item.iscedCode,
        searchKeywords: item.searchKeywords,
        tag: item.tag.map((t) => ({
          id: t.tagId,
          code: t.details.code,
          nameIs: t.details.nameIs,
          nameEn: t.details.nameEn,
        })),
        modeOfDelivery: item.modeOfDelivery.map((m) =>
          mapEnum(
            m.modeOfDelivery,
            ProgramModeOfDeliveryModeOfDeliveryEnum,
            ModeOfDelivery,
          ),
        ),
      })),
    }
  }

  async getProgramById(input: GetProgramByIdInput): Promise<ProgramDetails> {
    const res = await this.programApi.programControllerGetProgramDetails({
      id: input.id,
    })

    const item = res.data

    return {
      id: item.id,
      externalId: item.externalId,
      active: item.active,
      nameIs: item.nameIs,
      nameEn: item.nameEn,
      universityId: item.universityId,
      departmentNameIs: item.departmentNameIs,
      departmentNameEn: item.departmentNameEn,
      startingSemesterYear: item.startingSemesterYear,
      startingSemesterSeason: mapEnum(
        item.startingSemesterSeason,
        ProgramDetailsStartingSemesterSeasonEnum,
        Season,
      ),
      applicationStartDate: item.applicationStartDate,
      applicationEndDate: item.applicationEndDate,
      degreeType: mapEnum(
        item.degreeType,
        ProgramDetailsDegreeTypeEnum,
        DegreeType,
      ),
      degreeAbbreviation: item.degreeAbbreviation,
      credits: item.credits,
      descriptionIs: item.descriptionIs,
      descriptionEn: item.descriptionEn,
      durationInYears: item.durationInYears,
      costPerYear: item.costPerYear,
      iscedCode: item.iscedCode,
      searchKeywords: item.searchKeywords,
      tag: item.tag.map((t) => ({
        id: t.tagId,
        code: t.details.code,
        nameIs: t.details.nameIs,
        nameEn: t.details.nameEn,
      })),
      modeOfDelivery: item.modeOfDelivery.map((m) =>
        mapEnum(
          m.modeOfDelivery,
          ProgramModeOfDeliveryModeOfDeliveryEnum,
          ModeOfDelivery,
        ),
      ),
      externalUrlIs: item.externalUrlIs,
      externalUrlEn: item.externalUrlEn,
      admissionRequirementsIs: item.admissionRequirementsIs,
      admissionRequirementsEn: item.admissionRequirementsEn,
      studyRequirementsIs: item.studyRequirementsIs,
      studyRequirementsEn: item.studyRequirementsEn,
      costInformationIs: item.costInformationIs,
      costInformationEn: item.costInformationEn,
      courses: item.courses.map((c) => ({
        id: c.details.id,
        externalId: c.details.externalId,
        nameIs: c.details.nameIs,
        nameEn: c.details.nameEn,
        credits: c.details.credits,
        semesterYear: c.details.semesterYear,
        semesterSeason: mapEnum(
          c.details.semesterSeason,
          CourseSemesterSeasonEnum,
          Season,
        ),
        descriptionIs: c.details.descriptionIs,
        descriptionEn: c.details.descriptionEn,
        externalUrlIs: c.details.externalUrlIs,
        externalUrlEn: c.details.externalUrlEn,
        requirement: mapEnum(
          c.requirement,
          ProgramCourseRequirementEnum,
          Requirement,
        ),
      })),
      // extraApplicationField: item.extraApplicationField.map((e) => ({
      //   nameIs: e.nameIs,
      //   nameEn: e.nameEn,
      //   descriptionIs: e.descriptionIs,
      //   descriptionEn: e.descriptionEn,
      //   required: e.required,
      //   fieldType: mapEnum(
      //     e.fieldType,
      //     ProgramExtraApplicationFieldFieldTypeEnum,
      //     FieldType,
      //   ),
      //   uploadAcceptedFileType: e.uploadAcceptedFileType,
      // })),
    }
  }
}
