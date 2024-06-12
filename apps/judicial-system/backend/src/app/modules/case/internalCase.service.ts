import CryptoJS from 'crypto-js'
import format from 'date-fns/format'
import { Base64 } from 'js-base64'
import { Op } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/sequelize'

import { FormatMessage, IntlService } from '@island.is/cms-translations'
import { type Logger, LOGGER_PROVIDER } from '@island.is/logging'
import type { ConfigType } from '@island.is/nest/config'

import {
  formatCaseType,
  formatNationalId,
} from '@island.is/judicial-system/formatters'
import {
  CaseFileCategory,
  CaseOrigin,
  CaseState,
  CaseType,
  isIndictmentCase,
  isProsecutionUser,
  isRestrictionCase,
  isTrafficViolationCase,
  NotificationType,
  restrictionCases,
  type User as TUser,
  UserRole,
} from '@island.is/judicial-system/types'

import { nowFactory, uuidFactory } from '../../factories'
import {
  getCourtRecordPdfAsBuffer,
  getCourtRecordPdfAsString,
  getCustodyNoticePdfAsString,
  getRequestPdfAsBuffer,
  getRequestPdfAsString,
} from '../../formatters'
import { courtUpload } from '../../messages'
import { AwsS3Service } from '../aws-s3'
import { CourtDocumentFolder, CourtService } from '../court'
import { Defendant, DefendantService } from '../defendant'
import { CaseEvent, EventService } from '../event'
import { EventLogService } from '../event-log'
import { CaseFile, FileService } from '../file'
import { IndictmentCount, IndictmentCountService } from '../indictment-count'
import { Institution } from '../institution'
import { PoliceDocument, PoliceDocumentType, PoliceService } from '../police'
import { User, UserService } from '../user'
import { InternalCreateCaseDto } from './dto/internalCreateCase.dto'
import { archiveFilter } from './filters/case.archiveFilter'
import { ArchiveResponse } from './models/archive.response'
import { Case } from './models/case.model'
import { CaseArchive } from './models/caseArchive.model'
import { DateLog } from './models/dateLog.model'
import { DeliverResponse } from './models/deliver.response'
import { caseModuleConfig } from './case.config'
import { PDFService } from './pdf.service'

const caseEncryptionProperties: (keyof Case)[] = [
  'description',
  'demands',
  'requestedOtherRestrictions',
  'caseFacts',
  'legalArguments',
  'prosecutorOnlySessionRequest',
  'comments',
  'caseFilesComments',
  'courtAttendees',
  'prosecutorDemands',
  'courtDocuments',
  'sessionBookings',
  'courtCaseFacts',
  'introduction',
  'courtLegalArguments',
  'ruling',
  'conclusion',
  'endOfSessionBookings',
  'accusedAppealAnnouncement',
  'prosecutorAppealAnnouncement',
  'caseModifiedExplanation',
  'caseResentExplanation',
  'crimeScenes',
  'indictmentIntroduction',
  'appealConclusion',
]

const defendantEncryptionProperties: (keyof Defendant)[] = [
  'nationalId',
  'name',
  'address',
]

const caseFileEncryptionProperties: (keyof CaseFile)[] = [
  'name',
  'key',
  'userGeneratedFilename',
]

const indictmentCountEncryptionProperties: (keyof IndictmentCount)[] = [
  'vehicleRegistrationNumber',
  'incidentDescription',
  'legalArguments',
]

const collectEncryptionProperties = (
  properties: string[],
  unknownSource: unknown,
): [{ [key: string]: string | null }, { [key: string]: unknown }] => {
  const source = unknownSource as { [key: string]: unknown }
  return properties.reduce<
    [{ [key: string]: string | null }, { [key: string]: unknown }]
  >(
    (data, property) => [
      {
        ...data[0],
        [property]: typeof source[property] === 'string' ? '' : null,
      },
      { ...data[1], [property]: source[property] },
    ],
    [{}, {}],
  )
}

@Injectable()
export class InternalCaseService {
  private throttle = Promise.resolve(false)

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Case) private readonly caseModel: typeof Case,
    @InjectModel(CaseArchive)
    private readonly caseArchiveModel: typeof CaseArchive,
    @Inject(caseModuleConfig.KEY)
    private readonly config: ConfigType<typeof caseModuleConfig>,
    @Inject(forwardRef(() => IntlService))
    private readonly intlService: IntlService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
    @Inject(forwardRef(() => AwsS3Service))
    private readonly awsS3Service: AwsS3Service,
    @Inject(forwardRef(() => CourtService))
    private readonly courtService: CourtService,
    @Inject(forwardRef(() => PoliceService))
    private readonly policeService: PoliceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => IndictmentCountService))
    private readonly indictmentCountService: IndictmentCountService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => DefendantService))
    private readonly defendantService: DefendantService,
    @Inject(forwardRef(() => EventLogService))
    private readonly eventLogService: EventLogService,
    private readonly pdfService: PDFService,
    @Inject(LOGGER_PROVIDER) private readonly logger: Logger,
  ) {}

  private formatMessage: FormatMessage = () => {
    throw new InternalServerErrorException('Format message not initialized')
  }

  private async refreshFormatMessage(): Promise<void> {
    return this.intlService
      .useIntl(['judicial.system.backend'], 'is')
      .then((res) => {
        this.formatMessage = res.formatMessage
      })
      .catch((reason) => {
        this.logger.error('Unable to refresh format messages', { reason })
      })
  }

  private async uploadSignedRulingPdfToCourt(
    theCase: Case,
    buffer: Buffer,
    user: TUser,
  ): Promise<boolean> {
    const fileName = this.formatMessage(courtUpload.ruling, {
      courtCaseNumber: theCase.courtCaseNumber,
      date: format(nowFactory(), 'yyyy-MM-dd HH:mm'),
    })

    try {
      await this.courtService.createDocument(
        user,
        theCase.id,
        theCase.courtId,
        theCase.courtCaseNumber,
        CourtDocumentFolder.COURT_DOCUMENTS,
        fileName,
        `${fileName}.pdf`,
        'application/pdf',
        buffer,
      )

      return true
    } catch (error) {
      this.logger.warn(
        `Failed to upload signed ruling pdf to court for case ${theCase.id}`,
        { error },
      )

      return false
    }
  }

  private async uploadCourtRecordPdfToCourt(
    theCase: Case,
    user: TUser,
  ): Promise<boolean> {
    try {
      const pdf = await getCourtRecordPdfAsBuffer(theCase, this.formatMessage)

      const fileName = this.formatMessage(courtUpload.courtRecord, {
        courtCaseNumber: theCase.courtCaseNumber,
        date: format(nowFactory(), 'yyyy-MM-dd HH:mm'),
      })

      await this.courtService.createCourtRecord(
        user,
        theCase.id,
        theCase.courtId,
        theCase.courtCaseNumber,
        fileName,
        `${fileName}.pdf`,
        'application/pdf',
        pdf,
      )

      return true
    } catch (error) {
      // Log and ignore this error. The court record can be uploaded manually.
      this.logger.warn(
        `Failed to upload court record pdf to court for case ${theCase.id}`,
        { error },
      )

      return false
    }
  }

  private async upploadRequestPdfToCourt(
    theCase: Case,
    user: TUser,
  ): Promise<boolean> {
    return getRequestPdfAsBuffer(theCase, this.formatMessage)
      .then((pdf) => {
        const fileName = this.formatMessage(courtUpload.request, {
          caseType: formatCaseType(theCase.type),
          date: format(nowFactory(), 'yyyy-MM-dd HH:mm'),
        })

        return this.courtService.createDocument(
          user,
          theCase.id,
          theCase.courtId,
          theCase.courtCaseNumber,
          CourtDocumentFolder.REQUEST_DOCUMENTS,
          fileName,
          `${fileName}.pdf`,
          'application/pdf',
          pdf,
        )
      })
      .then(() => {
        return true
      })
      .catch((error) => {
        // Tolerate failure, but log error
        this.logger.warn(
          `Failed to upload request pdf to court for case ${theCase.id}`,
          { error },
        )

        return false
      })
  }

  private getSignedRulingPdf(theCase: Case) {
    return this.awsS3Service.getGeneratedObject(
      theCase.type,
      `${theCase.id}/ruling.pdf`,
    )
  }

  private async deliverSignedRulingPdfToCourt(
    theCase: Case,
    user: TUser,
  ): Promise<boolean> {
    return this.getSignedRulingPdf(theCase)
      .then((pdf) => this.uploadSignedRulingPdfToCourt(theCase, pdf, user))
      .catch((reason) => {
        this.logger.error(
          `Faild to deliver the ruling for case ${theCase.id} to court`,
          { reason },
        )

        return false
      })
  }

  async create(caseToCreate: InternalCreateCaseDto): Promise<Case> {
    const creator = await this.userService
      .findByNationalId(caseToCreate.prosecutorNationalId)
      .catch(() => undefined)

    if (!creator) {
      throw new BadRequestException('Creating user not found')
    }

    if (!isProsecutionUser(creator)) {
      throw new BadRequestException(
        'Creating user is not registered as a prosecution user',
      )
    }

    if (
      creator.role === UserRole.PROSECUTOR_REPRESENTATIVE &&
      !isIndictmentCase(caseToCreate.type)
    ) {
      throw new BadRequestException(
        'Creating user is registered as a representative and can only create indictments',
      )
    }

    return this.sequelize.transaction(async (transaction) => {
      return this.caseModel
        .create(
          {
            ...caseToCreate,
            state: isIndictmentCase(caseToCreate.type)
              ? CaseState.DRAFT
              : undefined,
            origin: CaseOrigin.LOKE,
            creatingProsecutorId: creator.id,
            prosecutorId:
              creator.role === UserRole.PROSECUTOR ? creator.id : undefined,
            courtId: creator.institution?.defaultCourtId,
            prosecutorsOfficeId: creator.institution?.id,
          },
          { transaction },
        )
        .then((theCase) =>
          this.defendantService.createForNewCase(
            theCase.id,
            {
              nationalId: caseToCreate.accusedNationalId,
              name: caseToCreate.accusedName,
              gender: caseToCreate.accusedGender,
              address: (caseToCreate.accusedAddress || '').trim(),
              citizenship: caseToCreate.citizenship,
            },
            transaction,
          ),
        )
        .then(
          (defendant) =>
            this.caseModel.findByPk(defendant.caseId, {
              transaction,
            }) as Promise<Case>,
        )
    })
  }

  async archive(): Promise<ArchiveResponse> {
    const theCase = await this.caseModel.findOne({
      include: [
        { model: Defendant, as: 'defendants' },
        { model: IndictmentCount, as: 'indictmentCounts' },
        { model: CaseFile, as: 'caseFiles' },
      ],
      order: [
        [{ model: Defendant, as: 'defendants' }, 'created', 'ASC'],
        [{ model: IndictmentCount, as: 'indictmentCounts' }, 'created', 'ASC'],
        [{ model: CaseFile, as: 'caseFiles' }, 'created', 'ASC'],
      ],
      where: {
        isArchived: false,
        [Op.or]: [{ state: CaseState.DELETED }, archiveFilter],
      },
    })

    if (!theCase) {
      return { caseArchived: false }
    }

    await this.sequelize.transaction(async (transaction) => {
      const [clearedCaseProperties, caseArchive] = collectEncryptionProperties(
        caseEncryptionProperties,
        theCase,
      )

      const defendantsArchive = []
      for (const defendant of theCase.defendants ?? []) {
        const [clearedDefendantProperties, defendantArchive] =
          collectEncryptionProperties(defendantEncryptionProperties, defendant)
        defendantsArchive.push(defendantArchive)

        await this.defendantService.updateForArcive(
          theCase.id,
          defendant.id,
          clearedDefendantProperties,
          transaction,
        )
      }

      const caseFilesArchive = []
      for (const caseFile of theCase.caseFiles ?? []) {
        const [clearedCaseFileProperties, caseFileArchive] =
          collectEncryptionProperties(caseFileEncryptionProperties, caseFile)
        caseFilesArchive.push(caseFileArchive)

        await this.fileService.updateCaseFile(
          theCase.id,
          caseFile.id,
          clearedCaseFileProperties,
          transaction,
        )
      }

      const indictmentCountsArchive = []
      for (const count of theCase.indictmentCounts ?? []) {
        const [clearedIndictmentCountProperties, indictmentCountArchive] =
          collectEncryptionProperties(
            indictmentCountEncryptionProperties,
            count,
          )
        indictmentCountsArchive.push(indictmentCountArchive)

        await this.indictmentCountService.update(
          theCase.id,
          count.id,
          clearedIndictmentCountProperties,
          transaction,
        )
      }

      await this.caseArchiveModel.create(
        {
          caseId: theCase.id,
          archive: CryptoJS.AES.encrypt(
            JSON.stringify({
              ...caseArchive,
              defendants: defendantsArchive,
              caseFiles: caseFilesArchive,
              indictmentCounts: indictmentCountsArchive,
            }),
            this.config.archiveEncryptionKey,
            { iv: CryptoJS.enc.Hex.parse(uuidFactory()) },
          ).toString(),
          // To decrypt:
          // JSON.parse(
          //   Base64.fromBase64(
          //     CryptoJS.AES.decrypt(
          //       archive,
          //       this.config.archiveEncryptionKey,
          //     ).toString(CryptoJS.enc.Base64),
          //   ),
          // )
        },
        { transaction },
      )

      await this.caseModel.update(
        { ...clearedCaseProperties, isArchived: true },
        { where: { id: theCase.id }, transaction },
      )
    })

    this.eventService.postEvent(CaseEvent.ARCHIVE, theCase)

    return { caseArchived: true }
  }

  async deliverProsecutorToCourt(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    return this.courtService
      .updateCaseWithProsecutor(
        user,
        theCase.id,
        theCase.courtId ?? '',
        theCase.courtCaseNumber ?? '',
        theCase.prosecutor?.nationalId ?? '',
        theCase.prosecutorsOffice?.nationalId ?? '',
      )
      .then(() => ({ delivered: true }))
      .catch((reason) => {
        this.logger.error(
          `Failed to update case ${theCase.id} with prosecutor`,
          { reason },
        )

        return { delivered: false }
      })
  }

  async deliverIndictmentToCourt(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    return this.pdfService
      .getIndictmentPdf(theCase)
      .then(async (pdf) => {
        await this.refreshFormatMessage()

        const fileName = this.formatMessage(courtUpload.indictment)

        return this.courtService.createDocument(
          user,
          theCase.id,
          theCase.courtId,
          theCase.courtCaseNumber,
          CourtDocumentFolder.INDICTMENT_DOCUMENTS,
          fileName,
          `${fileName}.pdf`,
          'application/pdf',
          pdf,
        )
      })
      .then(() => ({ delivered: true }))
      .catch((reason) => {
        // Tolerate failure, but log error
        this.logger.warn(
          `Failed to upload indictment pdf to court for case ${theCase.id}`,
          { reason },
        )

        return { delivered: false }
      })
  }

  async deliverCaseFilesRecordToCourt(
    theCase: Case,
    policeCaseNumber: string,
    user: TUser,
  ): Promise<DeliverResponse> {
    return this.pdfService
      .getCaseFilesRecordPdf(theCase, policeCaseNumber)
      .then(async (pdf) => {
        await this.refreshFormatMessage()

        const fileName = this.formatMessage(courtUpload.caseFilesRecord, {
          policeCaseNumber,
        })

        return this.courtService.createDocument(
          user,
          theCase.id,
          theCase.courtId,
          theCase.courtCaseNumber,
          CourtDocumentFolder.CASE_DOCUMENTS,
          fileName,
          `${fileName}.pdf`,
          'application/pdf',
          pdf,
        )
      })
      .then(() => ({ delivered: true }))
      .catch((reason) => {
        // Tolerate failure, but log reason
        this.logger.warn(
          `Failed to upload case files record pdf to court for case ${theCase.id}`,
          { reason },
        )

        return { delivered: false }
      })
  }

  async archiveCaseFilesRecord(
    theCase: Case,
    policeCaseNumber: string,
  ): Promise<DeliverResponse> {
    return this.awsS3Service
      .archiveObject(
        theCase.type,
        theCase.state,
        `${theCase.id}/${policeCaseNumber}/caseFilesRecord.pdf`,
      )
      .then(() => ({ delivered: true }))
      .catch((reason) => {
        this.logger.error(
          `Failed to archive case files record for case ${theCase.id} and police case ${policeCaseNumber}`,
          { reason },
        )

        return { delivered: false }
      })
  }

  async deliverRequestToCourt(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    await this.refreshFormatMessage()

    return this.upploadRequestPdfToCourt(theCase, user).then((delivered) => ({
      delivered,
    }))
  }

  async deliverCourtRecordToCourt(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    await this.refreshFormatMessage()

    return this.uploadCourtRecordPdfToCourt(theCase, user).then(
      (delivered) => ({ delivered }),
    )
  }

  async deliverSignedRulingToCourt(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    await this.refreshFormatMessage()

    return this.deliverSignedRulingPdfToCourt(theCase, user).then(
      (delivered) => ({ delivered }),
    )
  }

  async deliverCaseConclusionToCourt(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    return this.courtService
      .updateCaseWithConclusion(
        user,
        theCase.id,
        theCase.court?.name,
        theCase.courtCaseNumber,
        Boolean(theCase.rulingModifiedHistory),
        theCase.decision,
        theCase.rulingDate,
        isRestrictionCase(theCase.type) ? theCase.validToDate : undefined,
        theCase.type === CaseType.CUSTODY && theCase.isCustodyIsolation
          ? theCase.isolationToDate
          : undefined,
      )
      .then(() => ({ delivered: true }))
      .catch((reason) => {
        this.logger.error(
          `Failed to update case ${theCase.id} with conclusion`,
          { reason },
        )

        return { delivered: false }
      })
  }

  async deliverReceivedDateToCourtOfAppeals(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    return this.courtService
      .updateAppealCaseWithReceivedDate(
        user,
        theCase.id,
        theCase.appealCaseNumber,
        theCase.appealReceivedByCourtDate,
      )
      .then(() => ({ delivered: true }))
      .catch((reason) => {
        this.logger.error(
          `Failed to update appeal case ${theCase.id} with received date`,
          { reason },
        )

        return { delivered: false }
      })
  }

  async deliverAssignedRolesToCourtOfAppeals(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    return this.courtService
      .updateAppealCaseWithAssignedRoles(
        user,
        theCase.id,
        theCase.appealCaseNumber,
        theCase.appealAssistant?.nationalId,
        theCase.appealAssistant?.name,
        theCase.appealJudge1?.nationalId,
        theCase.appealJudge1?.name,
        theCase.appealJudge2?.nationalId,
        theCase.appealJudge2?.name,
        theCase.appealJudge3?.nationalId,
        theCase.appealJudge3?.name,
      )
      .then(() => ({ delivered: true }))
      .catch((reason) => {
        this.logger.error(
          `Failed to update appeal case ${theCase.id} with assigned roles`,
          { reason },
        )

        return { delivered: false }
      })
  }

  async deliverConclusionToCourtOfAppeals(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    // There is no timestamp for appeal ruling, so we use notifications to approximate the time.
    // We know notifications occur in a decending order by time.
    const appealCompletedNotifications = theCase.notifications?.filter(
      (notification) => notification.type === NotificationType.APPEAL_COMPLETED,
    )
    const appealRulingDate =
      appealCompletedNotifications && appealCompletedNotifications.length > 0
        ? appealCompletedNotifications[appealCompletedNotifications.length - 1]
            .created
        : undefined

    return this.courtService
      .updateAppealCaseWithConclusion(
        user,
        theCase.id,
        theCase.appealCaseNumber,
        Boolean(theCase.appealRulingModifiedHistory),
        theCase.appealRulingDecision,
        appealRulingDate,
      )
      .then(() => ({ delivered: true }))
      .catch((reason) => {
        this.logger.error(
          `Failed to update appeal case ${theCase.id} with conclusion`,
          { reason },
        )

        return { delivered: false }
      })
  }

  private async deliverCaseToPoliceWithFiles(
    theCase: Case,
    user: TUser,
    courtDocuments: PoliceDocument[],
  ): Promise<boolean> {
    const originalAncestor = await this.findOriginalAncestor(theCase)

    const defendantNationalIds = theCase.defendants?.reduce<string[]>(
      (ids, defendant) =>
        !defendant.noNationalId && defendant.nationalId
          ? [...ids, defendant.nationalId]
          : ids,
      [],
    )

    const validToDate =
      (restrictionCases.includes(theCase.type) &&
        theCase.state === CaseState.ACCEPTED &&
        theCase.validToDate) ||
      nowFactory() // The API requires a date so we send now as a dummy date

    return this.policeService.updatePoliceCase(
      user,
      originalAncestor.id,
      theCase.type,
      theCase.state,
      theCase.policeCaseNumbers.length > 0 ? theCase.policeCaseNumbers[0] : '',
      theCase.courtCaseNumber ?? '',
      defendantNationalIds && defendantNationalIds[0]
        ? defendantNationalIds[0].replace('-', '')
        : '',
      validToDate,
      theCase.conclusion ?? '', // Indictments do not have a conclusion
      courtDocuments,
    )
  }

  async deliverCaseToPolice(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    const delivered = await this.refreshFormatMessage()
      .then(async () => {
        const courtDocuments = [
          {
            type: PoliceDocumentType.RVKR,
            courtDocument: Base64.btoa(
              await getRequestPdfAsString(theCase, this.formatMessage),
            ),
          },
          {
            type: PoliceDocumentType.RVTB,
            courtDocument: Base64.btoa(
              await getCourtRecordPdfAsString(theCase, this.formatMessage),
            ),
          },
          ...([CaseType.CUSTODY, CaseType.ADMISSION_TO_FACILITY].includes(
            theCase.type,
          ) && theCase.state === CaseState.ACCEPTED
            ? [
                {
                  type: PoliceDocumentType.RVVI,
                  courtDocument: Base64.btoa(
                    await getCustodyNoticePdfAsString(
                      theCase,
                      this.formatMessage,
                    ),
                  ),
                },
              ]
            : []),
        ]

        return this.deliverCaseToPoliceWithFiles(theCase, user, courtDocuments)
      })
      .catch((reason) => {
        // Tolerate failure, but log error
        this.logger.error(`Failed to deliver case ${theCase.id} to police`, {
          reason,
        })

        return false
      })

    return { delivered }
  }

  async deliverIndictmentCaseToPolice(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    const delivered = await Promise.all(
      theCase.caseFiles
        ?.filter(
          (caseFile) =>
            caseFile.category &&
            [CaseFileCategory.COURT_RECORD, CaseFileCategory.RULING].includes(
              caseFile.category,
            ) &&
            caseFile.key,
        )
        .map(async (caseFile) => {
          // TODO: Tolerate failure, but log error
          const file = await this.awsS3Service.getObject(
            theCase.type,
            theCase.state,
            caseFile.key,
          )

          return {
            type:
              caseFile.category === CaseFileCategory.COURT_RECORD
                ? PoliceDocumentType.RVTB
                : PoliceDocumentType.RVDO,
            courtDocument: Base64.btoa(file.toString('binary')),
          }
        }) ?? [],
    )
      .then((courtDocuments) =>
        this.deliverCaseToPoliceWithFiles(theCase, user, courtDocuments),
      )
      .catch((reason) => {
        // Tolerate failure, but log error
        this.logger.error(`Failed to deliver case ${theCase.id} to police`, {
          reason,
        })

        return false
      })

    return { delivered }
  }

  async deliverIndictmentToPolice(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    try {
      let policeDocuments: PoliceDocument[]

      if (isTrafficViolationCase(theCase)) {
        const file = await this.pdfService.getIndictmentPdf(theCase)

        policeDocuments = [
          {
            type: PoliceDocumentType.RVAS,
            courtDocument: Base64.btoa(file.toString('binary')),
          },
        ]
      } else {
        policeDocuments = await Promise.all(
          theCase.caseFiles
            ?.filter(
              (caseFile) =>
                caseFile.category === CaseFileCategory.INDICTMENT &&
                caseFile.key,
            )
            .map(async (caseFile) => {
              // TODO: Tolerate failure, but log error
              const file = await this.fileService.getCaseFileFromS3(
                theCase,
                caseFile,
              )

              return {
                type: PoliceDocumentType.RVAS,
                courtDocument: Base64.btoa(file.toString('binary')),
              }
            }) ?? [],
        )
      }

      const delivered = await this.deliverCaseToPoliceWithFiles(
        theCase,
        user,
        policeDocuments,
      )

      return { delivered }
    } catch (error) {
      // Tolerate failure, but log error
      this.logger.error(
        `Failed to deliver indictment for case ${theCase.id} to police`,
        { error },
      )

      return { delivered: false }
    }
  }

  async deliverCaseFilesRecordToPolice(
    theCase: Case,
    policeCaseNumber: string,
    user: TUser,
  ): Promise<DeliverResponse> {
    const delivered = await this.pdfService
      .getCaseFilesRecordPdf(theCase, policeCaseNumber)
      .then((pdf) =>
        this.deliverCaseToPoliceWithFiles(theCase, user, [
          {
            type: PoliceDocumentType.RVMG,
            courtDocument: Base64.btoa(pdf.toString('binary')),
          },
        ]),
      )
      .catch((error) => {
        // Tolerate failure, but log error
        this.logger.warn(
          `Failed to deliver case files record pdf to police for case ${theCase.id}`,
          { error },
        )

        return false
      })

    return { delivered }
  }

  async deliverSignedRulingToPolice(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    const delivered = await await this.getSignedRulingPdf(theCase)
      .then((pdf) =>
        this.deliverCaseToPoliceWithFiles(theCase, user, [
          {
            type: PoliceDocumentType.RVUR,
            courtDocument: Base64.btoa(pdf.toString('binary')),
          },
        ]),
      )
      .catch((reason) => {
        // Tolerate failure, but log error
        this.logger.error(
          `Failed to deliver sigend ruling for case ${theCase.id} to police`,
          { reason },
        )

        return false
      })

    return { delivered }
  }

  async deliverAppealToPolice(
    theCase: Case,
    user: TUser,
  ): Promise<DeliverResponse> {
    const delivered = await Promise.all(
      theCase.caseFiles
        ?.filter((file) => file.category === CaseFileCategory.APPEAL_RULING)
        .map(async (caseFile) => {
          // TODO: Tolerate failure, but log error
          const file = await this.awsS3Service.getObject(
            theCase.type,
            theCase.state,
            caseFile.key,
          )

          return {
            type: PoliceDocumentType.RVUL,
            courtDocument: Base64.btoa(file.toString('binary')),
          }
        }) ?? [],
    )
      .then(async (courtDocuments) =>
        this.deliverCaseToPoliceWithFiles(theCase, user, courtDocuments),
      )
      .catch((reason) => {
        // Tolerate failure, but log error
        this.logger.error(
          `Failed to deliver appeal for case ${theCase.id} to police`,
          { reason },
        )

        return false
      })

    return { delivered }
  }

  async findOriginalAncestor(theCase: Case): Promise<Case> {
    let originalAncestor: Case = theCase

    while (originalAncestor.parentCaseId) {
      const parentCase = await this.caseModel.findByPk(
        originalAncestor.parentCaseId,
      )

      if (!parentCase) {
        throw new InternalServerErrorException(
          `Original ancestor of case ${theCase.id} not found`,
        )
      }

      originalAncestor = parentCase
    }

    return originalAncestor
  }

  // As this is only currently used by the digital mailbox API
  // we will only return indictment cases that have a court date
  async getIndictmentCases(nationalId: string): Promise<Case[]> {
    const formattedNationalId = formatNationalId(nationalId)

    return this.caseModel.findAll({
      include: [
        { model: Defendant, as: 'defendants' },
        {
          model: DateLog,
          as: 'dateLogs',
          where: {
            date_type: 'ARRAIGNMENT_DATE',
          },
          required: true,
        },
      ],
      order: [[{ model: DateLog, as: 'dateLogs' }, 'created', 'DESC']],
      attributes: ['id', 'courtCaseNumber', 'type', 'state'],
      where: {
        type: CaseType.INDICTMENT,
        [Op.or]: [
          { '$defendants.national_id$': nationalId },
          { '$defendants.national_id$': formattedNationalId },
        ],
      },
    })
  }

  async getIndictmentCase(
    caseId: string,
    nationalId: string,
  ): Promise<Case | null> {
    // The national id could be without a hyphen or with a hyphen so we need to
    // search for both
    const formattedNationalId = formatNationalId(nationalId)

    const caseById = await this.caseModel.findOne({
      include: [
        { model: Defendant, as: 'defendants' },
        { model: Institution, as: 'court' },
        { model: Institution, as: 'prosecutorsOffice' },
        { model: User, as: 'judge' },
        { model: User, as: 'prosecutor' },
      ],
      attributes: ['courtCaseNumber', 'id'],
      where: {
        type: CaseType.INDICTMENT,
        id: caseId,
        [Op.or]: [
          { '$defendants.national_id$': nationalId },
          { '$defendants.national_id$': formattedNationalId },
        ],
      },
    })

    if (!caseById) {
      throw new NotFoundException(`Case ${caseId} not found`)
    }

    return caseById
  }
}
