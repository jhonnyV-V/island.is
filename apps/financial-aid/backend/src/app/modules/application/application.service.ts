import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import {
  ApplicationModel,
  FilterApplicationsResponse,
  SpouseResponse,
} from './models'

import { Op } from 'sequelize'

import {
  CreateApplicationDto,
  FilterApplicationsDto,
  SpouseEmailDto,
  UpdateApplicationDto,
} from './dto'
import {
  ApplicationEventType,
  ApplicationFilters,
  ApplicationState,
  ApplicationStateUrl,
  getStateFromUrl,
  User,
  Staff,
  FileType,
  getApplicantEmailDataFromEventType,
  firstDateOfMonth,
  UserType,
  applicationPageSize,
  Routes,
  calculatePersonalTaxAllowanceFromAmount,
  getNavEmploymentStatus,
} from '@island.is/financial-aid/shared/lib'
import { FileService } from '../file'
import {
  ApplicationEventService,
  ApplicationEventModel,
} from '../applicationEvent'
import { StaffModel } from '../staff'

import { EmailService } from '@island.is/email-service'

import { ApplicationFileModel } from '../file/models'
import { environment } from '../../../environments'
import { ApplicantEmailTemplate } from './emailTemplates/applicantEmailTemplate'
import { MunicipalityService } from '../municipality'
import { logger } from '@island.is/logging'
import { AmountModel, AmountService, CreateAmountDto } from '../amount'
import { DeductionFactorsModel } from '../deductionFactors'
import { DirectTaxPaymentService } from '../directTaxPayment'
import { DirectTaxPaymentModel } from '../directTaxPayment/models'
import { ChildrenModel, ChildrenService } from '../children'
import { nowFactory } from './factories/date.factory'

interface Recipient {
  name: string
  address: string
}

const linkToStatusPage = (applicationId: string) => {
  return `${environment.oskBaseUrl}${Routes.statusPage(applicationId)}`
}

const linkToApplicationSystem = (applicationId: string) => {
  return `${environment.applicationSystemBaseUrl}/${applicationId}`
}

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(ApplicationModel)
    private readonly applicationModel: typeof ApplicationModel,
    private readonly fileService: FileService,
    private readonly amountService: AmountService,
    private readonly applicationEventService: ApplicationEventService,
    private readonly childrenService: ChildrenService,
    private readonly emailService: EmailService,
    private readonly municipalityService: MunicipalityService,
    private readonly directTaxPaymentService: DirectTaxPaymentService,
  ) {}

  async getSpouseInfo(spouseNationalId: string): Promise<SpouseResponse> {
    const application = await this.applicationModel.findOne({
      where: {
        spouseNationalId,
        created: { [Op.gte]: firstDateOfMonth() },
      },
    })

    const files = application
      ? await this.fileService.getApplicationFilesByType(
          application.id,
          FileType.SPOUSEFILES,
        )
      : false

    return {
      hasPartnerApplied: Boolean(application),
      hasFiles: Boolean(files),
      applicantName: application ? application.name : '',
      applicantSpouseEmail: application?.spouseEmail ?? '',
    }
  }

  async findByNationalId(
    nationalId: string,
    municipalityCodes: string[],
  ): Promise<ApplicationModel[]> {
    return this.applicationModel.findAll({
      where: {
        [Op.or]: [
          {
            nationalId,
            municipalityCode: { [Op.in]: municipalityCodes },
          },
          {
            spouseNationalId: nationalId,
            municipalityCode: { [Op.in]: municipalityCodes },
          },
        ],
      },
      order: [['modified', 'DESC']],
      include: [
        {
          model: ApplicationFileModel,
          as: 'files',
          separate: true,
          order: [['created', 'DESC']],
        },
      ],
    })
  }

  async getCurrentApplicationId(nationalId: string): Promise<string | null> {
    const currentApplication = await this.applicationModel.findOne({
      where: {
        [Op.or]: [
          {
            nationalId,
          },
          {
            spouseNationalId: nationalId,
          },
        ],
        appliedDate: { [Op.gte]: firstDateOfMonth() },
      },
    })

    if (currentApplication) {
      return currentApplication.id
    }

    return null
  }

  async getAll(
    stateUrl: ApplicationStateUrl,
    staffId: string,
    municipalityCodes: string[],
  ): Promise<ApplicationModel[]> {
    return this.applicationModel.findAll({
      where:
        stateUrl === ApplicationStateUrl.MYCASES
          ? {
              state: { [Op.in]: getStateFromUrl[stateUrl] },
              staffId,
              municipalityCode: { [Op.in]: municipalityCodes },
            }
          : {
              state: { [Op.in]: getStateFromUrl[stateUrl] },
              municipalityCode: { [Op.in]: municipalityCodes },
            },
      order: [['modified', 'DESC']],
      include: [{ model: StaffModel, as: 'staff' }],
    })
  }

  async findById(
    id: string,
    isEmployee: boolean,
  ): Promise<ApplicationModel | null> {
    const application = await this.applicationModel.findOne({
      where: { id },
      include: [
        { model: StaffModel, as: 'staff' },
        {
          model: ApplicationEventModel,
          as: 'applicationEvents',
          separate: true,
          where: {
            eventType: {
              [Op.in]: isEmployee
                ? Object.values(ApplicationEventType)
                : [
                    ApplicationEventType.DATANEEDED,
                    ApplicationEventType.APPROVED,
                  ],
            },
          },
          order: [['created', 'DESC']],
        },
        {
          model: ApplicationFileModel,
          as: 'files',
          separate: true,
          order: [['created', 'DESC']],
        },
        {
          model: ChildrenModel,
          as: 'children',
          separate: true,
          order: [['created', 'DESC']],
        },
        {
          model: AmountModel,
          as: 'amount',
          include: [{ model: DeductionFactorsModel, as: 'deductionFactors' }],
          separate: true,
          order: [['created', 'DESC']],
        },
        {
          model: DirectTaxPaymentModel,
          as: 'directTaxPayments',
        },
      ],
    })

    if (application?.amount) {
      application.setDataValue('amount', application.amount['0'])
    }

    return application
  }

  async getAllFilters(
    staffId: string,
    municipalityCodes: string[],
  ): Promise<ApplicationFilters> {
    const statesToCount = [
      ApplicationState.NEW,
      ApplicationState.INPROGRESS,
      ApplicationState.DATANEEDED,
      ApplicationState.REJECTED,
      ApplicationState.APPROVED,
    ]

    const countPromises = statesToCount.map((item) =>
      this.applicationModel.count({
        where: {
          state: item,
          municipalityCode: { [Op.in]: municipalityCodes },
        },
      }),
    )

    countPromises.push(
      this.applicationModel.count({
        where: {
          staffId,
          municipalityCode: { [Op.in]: municipalityCodes },
          state: {
            [Op.or]: [ApplicationState.INPROGRESS, ApplicationState.DATANEEDED],
          },
        },
      }),
    )

    const filterCounts = await Promise.all(countPromises)

    return {
      New: filterCounts[0],
      InProgress: filterCounts[1],
      DataNeeded: filterCounts[2],
      Rejected: filterCounts[3],
      Approved: filterCounts[4],
      MyCases: filterCounts[5],
    }
  }

  async create(
    application: CreateApplicationDto,
    user: User,
  ): Promise<ApplicationModel> {
    const hasAppliedForPeriod = await this.getCurrentApplicationId(
      user.nationalId,
    )
    if (hasAppliedForPeriod) {
      throw new ForbiddenException('User or spouse has applied for period')
    }

    const appModel = await this.applicationModel.create({
      ...application,
      appliedDate: nowFactory(),
      nationalId: application.nationalId || user.nationalId,
    })

    await Promise.all([
      application.directTaxPayments.map((d) => {
        return this.directTaxPaymentService.create({
          applicationId: appModel.id,
          ...d,
        })
      }),
      application.files?.map((f) => {
        return this.fileService.createFile({
          applicationId: appModel.id,
          name: f.name,
          key: f.key,
          size: f.size,
          type: f.type,
        })
      }),
      this.applicationEventService.create({
        applicationId: appModel.id,
        eventType: ApplicationEventType[appModel.state.toUpperCase()],
        emailSent: await this.createApplicationEmails(application, appModel),
      }),
      application.children?.map((child) => {
        return this.childrenService.create({
          applicationId: appModel.id,
          name: child.name,
          nationalId: child.nationalId,
          school: child?.school,
          livesWithApplicant: child.livesWithApplicant,
          livesWithBothParents: child.livesWithBothParents,
        })
      }),
    ])

    //For application system to map to json
    if (appModel.getDataValue('files') === undefined) {
      appModel.setDataValue('files', [])
    }
    if (appModel.getDataValue('applicationEvents') === undefined) {
      appModel.setDataValue('applicationEvents', [])
    }
    if (appModel.getDataValue('children') === undefined) {
      appModel.setDataValue('children', [])
    }
    if (appModel.getDataValue('directTaxPayments') === undefined) {
      appModel.setDataValue('directTaxPayments', [])
    }

    return appModel
  }

  private async createApplicationEmails(
    application: CreateApplicationDto,
    appModel: ApplicationModel,
  ) {
    try {
      const municipality = await this.municipalityService.findByMunicipalityId(
        application.municipalityCode,
      )
      const isApplicationSystem = application.applicationSystemId != null

      const emailData = getApplicantEmailDataFromEventType(
        ApplicationEventType.NEW,
        isApplicationSystem
          ? linkToApplicationSystem(application.applicationSystemId)
          : linkToStatusPage(appModel.id),
        application.email,
        municipality,
        appModel.created,
      )

      const emailPromises: Promise<void>[] = []

      emailPromises.push(
        this.sendEmail(
          {
            name: application.name,
            address: appModel.email,
          },
          emailData.subject,
          ApplicantEmailTemplate(emailData.data),
        ),
      )

      if (application.spouseNationalId && !isApplicationSystem) {
        const emailData = getApplicantEmailDataFromEventType(
          'SPOUSE',
          environment.oskBaseUrl,
          appModel.spouseEmail,
          municipality,
          appModel.created,
        )
        emailPromises.push(
          this.sendEmail(
            {
              name: appModel.spouseName,
              address: appModel.spouseEmail,
            },
            emailData.subject,
            ApplicantEmailTemplate(emailData.data),
          ),
        )
      }

      await Promise.all(emailPromises)
      return true
    } catch {
      return false
    }
  }

  async sendSpouseEmail(data: SpouseEmailDto) {
    try {
      const municipality = await this.municipalityService.findByMunicipalityId(
        data.municipalityCode,
      )

      const applicantEmailData = getApplicantEmailDataFromEventType(
        'WAITINGSPOUSE',
        linkToApplicationSystem(data.applicationSystemId),
        data.email,
        municipality,
        data.created,
      )

      const spouseEmailData = getApplicantEmailDataFromEventType(
        'SPOUSE',
        linkToApplicationSystem(data.applicationSystemId),
        data.spouseEmail,
        municipality,
        data.created,
      )

      await Promise.all([
        this.sendEmail(
          {
            name: data.name,
            address: data.email,
          },
          applicantEmailData.subject,
          ApplicantEmailTemplate(applicantEmailData.data),
        ),
        this.sendEmail(
          {
            name: data.spouseName,
            address: data.spouseEmail,
          },
          spouseEmailData.subject,
          ApplicantEmailTemplate(spouseEmailData.data),
        ),
      ])

      return { success: true }
    } catch {
      return { success: false }
    }
  }

  async update(
    id: string,
    update: UpdateApplicationDto,
    staff?: Staff,
  ): Promise<ApplicationModel> {
    if (update.state && update.state === ApplicationState.NEW) {
      update.staffId = null
    }

    if (update.event === ApplicationEventType.APPROVED) {
      update.navSuccess = await this.sendToNav(id, update.amount)
    } else if (
      [
        ApplicationEventType.NEW,
        ApplicationEventType.INPROGRESS,
        ApplicationEventType.DATANEEDED,
        ApplicationEventType.REJECTED,
      ].includes(update.event)
    ) {
      update.navSuccess = null
    }

    const [numberOfAffectedRows, [updatedApplication]] =
      await this.applicationModel.update(update, {
        where: { id },
        returning: true,
      })

    if (numberOfAffectedRows === 0) {
      throw new NotFoundException(`Application ${id} does not exist`)
    }

    await this.applicationEventService.create({
      applicationId: id,
      eventType: update.event,
      comment: update?.rejection || update?.comment,
      staffName: staff?.name,
      staffNationalId: staff?.nationalId,
      emailSent: await this.sendApplicationUpdateEmail(
        update,
        updatedApplication,
      ),
    })

    if (update.amount) {
      const amount = await this.amountService.create(update.amount)
      updatedApplication?.setDataValue('amount', amount)
    }

    const events = this.applicationEventService
      .findById(id)
      .then((eventsResolved) => {
        updatedApplication?.setDataValue('applicationEvents', eventsResolved)
      })

    const children = this.childrenService
      .findById(id)
      .then((childrenResolved) => {
        updatedApplication?.setDataValue('children', childrenResolved)
      })

    const files = this.fileService
      .getAllApplicationFiles(id)
      .then((filesResolved) => {
        updatedApplication?.setDataValue('files', filesResolved)
      })

    const directTaxPayments = this.directTaxPaymentService
      .getByApplicationId(id)
      .then((resolved) => {
        updatedApplication?.setDataValue('directTaxPayments', resolved)
      })

    if (
      update.event === ApplicationEventType.SPOUSEFILEUPLOAD &&
      update.directTaxPayments
    ) {
      await Promise.all([
        update.directTaxPayments.map((d) => {
          return this.directTaxPaymentService.create({
            applicationId: id,
            userType: UserType.SPOUSE,
            ...d,
          })
        }),
      ])
    }

    await Promise.all([events, files, directTaxPayments, children])

    return updatedApplication
  }

  async sendToNav(applicationId: string, amount: CreateAmountDto) {
    try {
      const application = await this.findById(applicationId, true)
      const municipality =
        await this.municipalityService.findByMunicipalityIdWithNav(
          application.municipalityCode,
        )

      if (!municipality.usingNav) {
        return null
      }

      const calculateNavAmount = (amount: CreateAmountDto) => {
        return amount.deductionFactors
          ?.map((d) => d.amount)
          .reduce(
            (previousValue, currentValue) => previousValue - currentValue,
            amount.aidAmount - (amount.income ?? 0),
          )
      }

      const token = await fetch(
        new URL('Authentication/Login', municipality.navUrl).href,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: municipality.navUsername,
            password: municipality.navPassword,
          }),
        },
      ).then((response) => response.text())

      const createdDate = application.created
      return await fetch(
        new URL(
          'WebApplication/CreateFinancialAssistanceApplication',
          municipality.navUrl,
        ).href,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'FJST',
            status: 'Umsókn',
            id: application.nationalId,
            phoneNo: application.phoneNumber,
            employeeKt: application?.staff?.nationalId,
            email: application.email,
            bankAccount: `${application.bankNumber}${application.ledger}${application.accountNumber}`,
            grantAmount: calculateNavAmount(amount),
            referenceNo: application.id,
            employmentStatus: getNavEmploymentStatus[application.employment],
            personalTaxCredit: calculatePersonalTaxAllowanceFromAmount(
              amount.tax,
              amount.personalTaxCredit,
              amount.spousePersonalTaxCredit,
            ),
            housingCode: application.homeCircumstances,
            dateFrom: new Date(
              createdDate.getFullYear(),
              createdDate.getMonth(),
              1,
            ), // First day of created month
            dateTo: new Date(
              createdDate.getFullYear(),
              createdDate.getMonth() + 1,
              0,
            ), // Last day of created month
          }),
        },
      ).then((response) => response.ok)
    } catch {
      return false
    }
  }

  async filter(
    filters: FilterApplicationsDto,
    municipalityCodes: string[],
  ): Promise<FilterApplicationsResponse> {
    const whereOptions = {
      state: {
        [Op.in]:
          filters.states.length > 0 ? filters.states : filters.defaultStates,
      },
      municipalityCode: { [Op.in]: municipalityCodes },
      ...(filters?.endDate && {
        created: { [Op.gte]: filters.endDate, [Op.lte]: filters.startDate },
      }),
    }

    const staffOptions =
      filters.staff.length > 0
        ? {
            model: StaffModel,
            as: 'staff',
            where: {
              nationalId: { [Op.in]: filters.staff },
            },
          }
        : { model: StaffModel, as: 'staff' }

    const resultsApplications = await this.applicationModel.findAndCountAll({
      where: whereOptions,
      order: [['modified', 'DESC']],
      include: [staffOptions],
      offset: (filters.page - 1) * applicationPageSize,
      limit: applicationPageSize,
    })

    const resultsMinDate = await this.applicationModel.findOne({
      where: {
        state: {
          [Op.in]:
            filters.states.length > 0 ? filters.states : filters.defaultStates,
        },
        municipalityCode: { [Op.in]: municipalityCodes },
      },
      attributes: ['appliedDate'],
      include: [staffOptions],
      order: [['appliedDate', 'ASC']],
    })

    const resultsStaffWithApplications = await this.applicationModel.findAll({
      where: {
        state: {
          [Op.in]: filters.defaultStates,
        },
        municipalityCode: { [Op.in]: municipalityCodes },
      },
      order: [['modified', 'DESC']],
      include: [{ model: StaffModel, as: 'staff' }],
    })

    await Promise.all([
      resultsStaffWithApplications,
      resultsApplications,
      resultsMinDate,
    ])

    const staffList = resultsStaffWithApplications.map((row) => row.staff)
    const staffListUniq = [...new Map(staffList.map((v) => [v.id, v])).values()]

    return {
      applications: resultsApplications.rows,
      totalCount: resultsApplications.count,
      minDateCreated: resultsMinDate?.appliedDate,
      staffList: staffListUniq,
    }
  }

  private async sendApplicationUpdateEmail(
    update: UpdateApplicationDto,
    updatedApplication: ApplicationModel,
  ) {
    if (
      update.event === ApplicationEventType.DATANEEDED ||
      update.event === ApplicationEventType.REJECTED ||
      update.event === ApplicationEventType.APPROVED
    ) {
      try {
        const municipality =
          await this.municipalityService.findByMunicipalityId(
            updatedApplication.municipalityCode,
          )
        const isApplicationSystem =
          updatedApplication.applicationSystemId != null

        const emailData = getApplicantEmailDataFromEventType(
          update.event,
          isApplicationSystem
            ? linkToApplicationSystem(updatedApplication.applicationSystemId)
            : linkToStatusPage(updatedApplication.id),
          updatedApplication.email,
          municipality,
          updatedApplication.created,
          update.event === ApplicationEventType.DATANEEDED
            ? update?.comment
            : undefined,
          update.event === ApplicationEventType.REJECTED
            ? update?.rejection
            : undefined,
        )

        await this.sendEmail(
          {
            name: updatedApplication.name,
            address: updatedApplication.email,
          },
          emailData.subject,
          ApplicantEmailTemplate(emailData.data),
        )
        return true
      } catch {
        return false
      }
    }

    return null
  }

  private async sendEmail(
    to: Recipient | Recipient[],
    subject: string,
    html: string,
  ) {
    try {
      await this.emailService.sendEmail({
        from: {
          name: 'Samband íslenskra sveitarfélaga',
          address: environment.emailOptions.fromEmail,
        },
        replyTo: {
          name: 'Samband íslenskra sveitarfélaga',
          address: environment.emailOptions.replyToEmail,
        },
        to,
        subject,
        html,
      })
    } catch (error) {
      logger.warn('failed to send email', error)
    }
  }
}
