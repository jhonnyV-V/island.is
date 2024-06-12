import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'

import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'

import { TokenGuard } from '@island.is/judicial-system/auth'
import {
  messageEndpoint,
  MessageType,
} from '@island.is/judicial-system/message'
import {
  indictmentCases,
  investigationCases,
  restrictionCases,
} from '@island.is/judicial-system/types'

import { CaseEvent, EventService } from '../event'
import { DeliverDto } from './dto/deliver.dto'
import { InternalCasesDto } from './dto/internalCases.dto'
import { InternalCreateCaseDto } from './dto/internalCreateCase.dto'
import { CurrentCase } from './guards/case.decorator'
import { CaseCompletedGuard } from './guards/caseCompleted.guard'
import { CaseExistsGuard } from './guards/caseExists.guard'
import { CaseTypeGuard } from './guards/caseType.guard'
import { ArchiveResponse } from './models/archive.response'
import { Case } from './models/case.model'
import { DeliverResponse } from './models/deliver.response'
import { InternalCaseService } from './internalCase.service'

@Controller('api/internal')
@ApiTags('internal cases')
@UseGuards(TokenGuard)
export class InternalCaseController {
  constructor(
    private readonly internalCaseService: InternalCaseService,
    private readonly eventService: EventService,
    @Inject(LOGGER_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post('case')
  @ApiCreatedResponse({ type: Case, description: 'Creates a new case' })
  async create(@Body() caseToCreate: InternalCreateCaseDto): Promise<Case> {
    this.logger.debug('Creating a new case')

    const createdCase = await this.internalCaseService.create(caseToCreate)

    this.eventService.postEvent(CaseEvent.CREATE_XRD, createdCase as Case)

    return createdCase
  }

  @Post('cases/archive')
  @ApiOkResponse({
    type: ArchiveResponse,
    description: 'Archives a single case if any case is ready to be archived',
  })
  archive(): Promise<ArchiveResponse> {
    this.logger.debug('Archiving a case')

    return this.internalCaseService.archive()
  }

  @Post('cases/indictments')
  @ApiOkResponse({
    type: Case,
    isArray: true,
    description: 'Gets all indictment cases',
  })
  getIndictmentCases(
    @Body() internalCasesDto: InternalCasesDto,
  ): Promise<Case[]> {
    this.logger.debug('Getting all indictment cases')

    return this.internalCaseService.getIndictmentCases(
      internalCasesDto.nationalId,
    )
  }

  @Post('cases/indictment/:caseId')
  @ApiOkResponse({
    type: Case,
    description: 'Gets indictment case by id',
  })
  getIndictmentCase(
    @Param('caseId') caseId: string,
    @Body() internalCasesDto: InternalCasesDto,
  ): Promise<Case | null> {
    this.logger.debug(`Getting indictment case ${caseId}`)

    return this.internalCaseService.getIndictmentCase(
      caseId,
      internalCasesDto.nationalId,
    )
  }

  @UseGuards(CaseExistsGuard)
  @Post(
    `case/:caseId/${messageEndpoint[MessageType.DELIVERY_TO_COURT_PROSECUTOR]}`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a prosecutor to court',
  })
  deliverProsecutorToCourt(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(`Delivering the prosecutor for case ${caseId} to court`)

    return this.internalCaseService.deliverProsecutorToCourt(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(CaseExistsGuard, new CaseTypeGuard(indictmentCases))
  @Post(
    `case/:caseId/${messageEndpoint[MessageType.DELIVERY_TO_COURT_INDICTMENT]}`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers an indictment to court',
  })
  deliverIndictmentToCourt(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(`Delivering the indictment for case ${caseId} to court`)

    return this.internalCaseService.deliverIndictmentToCourt(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(CaseExistsGuard, new CaseTypeGuard(indictmentCases))
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_COURT_INDICTMENT_INFO]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers indictment info to court when case is received',
  })
  deliverIndictmentInfoToCourt(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Delivering the indictment info for case ${caseId} to court`,
    )

    return this.internalCaseService.deliverIndictmentInfoToCourt(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(CaseExistsGuard, new CaseTypeGuard(indictmentCases))
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_COURT_CASE_FILES_RECORD]
    }/:policeCaseNumber`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a case files record to court',
  })
  async deliverCaseFilesRecordToCourt(
    @Param('caseId') caseId: string,
    @Param('policeCaseNumber') policeCaseNumber: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Delivering the case files record for case ${caseId} and police case ${policeCaseNumber} to court`,
    )

    if (!theCase.policeCaseNumbers.includes(policeCaseNumber)) {
      throw new BadRequestException(
        `Case ${caseId} does not include police case number ${policeCaseNumber}`,
      )
    }

    return this.internalCaseService.deliverCaseFilesRecordToCourt(
      theCase,
      policeCaseNumber,
      deliverDto.user,
    )
  }

  @UseGuards(CaseExistsGuard, new CaseTypeGuard(indictmentCases))
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.ARCHIVING_CASE_FILES_RECORD]
    }/:policeCaseNumber`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Archives a case files record',
  })
  async archiveCaseFilesRecord(
    @Param('caseId') caseId: string,
    @Param('policeCaseNumber') policeCaseNumber: string,
    @CurrentCase() theCase: Case,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Archiving the case files record for case ${caseId} and police case ${policeCaseNumber}`,
    )

    if (!theCase.policeCaseNumbers.includes(policeCaseNumber)) {
      throw new BadRequestException(
        `Case ${caseId} does not include police case number ${policeCaseNumber}`,
      )
    }

    return this.internalCaseService.archiveCaseFilesRecord(
      theCase,
      policeCaseNumber,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
  )
  @Post(
    `case/:caseId/${messageEndpoint[MessageType.DELIVERY_TO_COURT_REQUEST]}`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a request to court',
  })
  deliverRequestToCourt(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(`Delivering the request for case ${caseId} to court`)

    return this.internalCaseService.deliverRequestToCourt(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseCompletedGuard,
  )
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_COURT_COURT_RECORD]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a court record to court',
  })
  deliverCourtRecordToCourt(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(`Delivering the court record for case ${caseId} to court`)

    return this.internalCaseService.deliverCourtRecordToCourt(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseCompletedGuard,
  )
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_COURT_SIGNED_RULING]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a court record to court',
  })
  deliverSignedRulingToCourt(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(`Delivering the court record for case ${caseId} to court`)

    return this.internalCaseService.deliverSignedRulingToCourt(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseCompletedGuard,
  )
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_COURT_CASE_CONCLUSION]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a case conclusion to court',
  })
  deliverCaseConclusionToCourt(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Delivering the case conclusion for case ${caseId} to court`,
    )

    return this.internalCaseService.deliverCaseConclusionToCourt(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseCompletedGuard,
  )
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_COURT_OF_APPEALS_RECEIVED_DATE]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a received date to court of appeals',
  })
  deliverReceivedDateToCourtOfAppeals(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Delivering the received date for case ${caseId} to court of appeals`,
    )

    return this.internalCaseService.deliverReceivedDateToCourtOfAppeals(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseCompletedGuard,
  )
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_COURT_OF_APPEALS_ASSIGNED_ROLES]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers assigned roles to court of appeals',
  })
  deliverAssignedRolesToCourtOfAppeals(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Delivering the assigned roles for case ${caseId} to court of appeals`,
    )

    return this.internalCaseService.deliverAssignedRolesToCourtOfAppeals(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseCompletedGuard,
  )
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_COURT_OF_APPEALS_CONCLUSION]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a conclusion to court of appeals',
  })
  deliverConclusionToCourtOfAppeals(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Delivering the conclusion for case ${caseId} to court of appeals`,
    )

    return this.internalCaseService.deliverConclusionToCourtOfAppeals(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseCompletedGuard,
  )
  @Post(`case/:caseId/${messageEndpoint[MessageType.DELIVERY_TO_POLICE_CASE]}`)
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a completed case to police',
  })
  deliverCaseToPolice(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(`Delivering case ${caseId} to police`)

    return this.internalCaseService.deliverCaseToPolice(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard(indictmentCases),
    CaseCompletedGuard,
  )
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_POLICE_INDICTMENT_CASE]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a completed indictment case to police',
  })
  deliverIndictmentCaseToPolice(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(`Delivering indictment case ${caseId} to police`)

    return this.internalCaseService.deliverIndictmentCaseToPolice(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(CaseExistsGuard, new CaseTypeGuard(indictmentCases))
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_POLICE_INDICTMENT]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers an indictment to police',
  })
  deliverIndictmentToPolice(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(`Delivering indictment for case ${caseId} to police`)

    return this.internalCaseService.deliverIndictmentToPolice(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(CaseExistsGuard, new CaseTypeGuard(indictmentCases))
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_POLICE_CASE_FILES_RECORD]
    }/:policeCaseNumber`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a case files record to police',
  })
  async deliverCaseFilesRecordToPolice(
    @Param('caseId') caseId: string,
    @Param('policeCaseNumber') policeCaseNumber: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Delivering the case files record for case ${caseId} and police case ${policeCaseNumber} to police`,
    )

    if (!theCase.policeCaseNumbers.includes(policeCaseNumber)) {
      throw new BadRequestException(
        `Case ${caseId} does not include police case number ${policeCaseNumber}`,
      )
    }

    return this.internalCaseService.deliverCaseFilesRecordToPolice(
      theCase,
      policeCaseNumber,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseCompletedGuard,
  )
  @Post(
    `case/:caseId/${
      messageEndpoint[MessageType.DELIVERY_TO_POLICE_SIGNED_RULING]
    }`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a signed ruling to police',
  })
  deliverSignedRulingToPolice(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Delivering the signed ruling for case ${caseId} to police`,
    )

    return this.internalCaseService.deliverSignedRulingToPolice(
      theCase,
      deliverDto.user,
    )
  }

  @UseGuards(
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseCompletedGuard,
  )
  @Post(
    `case/:caseId/${messageEndpoint[MessageType.DELIVERY_TO_POLICE_APPEAL]}`,
  )
  @ApiOkResponse({
    type: DeliverResponse,
    description: 'Delivers a completed appeal to police',
  })
  deliverAppealToPolice(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Body() deliverDto: DeliverDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(`Delivering appeal ${caseId} to police`)

    return this.internalCaseService.deliverAppealToPolice(
      theCase,
      deliverDto.user,
    )
  }
}
