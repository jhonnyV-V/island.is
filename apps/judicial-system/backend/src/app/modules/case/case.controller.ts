import { Response } from 'express'

import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  HttpException,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'

import {
  DokobitError,
  SigningServiceResponse,
} from '@island.is/dokobit-signing'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'

import {
  CurrentHttpUser,
  JwtAuthGuard,
  RolesGuard,
  RolesRules,
} from '@island.is/judicial-system/auth'
import { capitalize, formatDate } from '@island.is/judicial-system/formatters'
import type { User } from '@island.is/judicial-system/types'
import {
  CaseAppealDecision,
  CaseAppealRulingDecision,
  CaseAppealState,
  CaseDecision,
  CaseState,
  CaseTransition,
  CaseType,
  indictmentCases,
  investigationCases,
  isIndictmentCase,
  isRestrictionCase,
  restrictionCases,
  UserRole,
} from '@island.is/judicial-system/types'

import { nowFactory } from '../../factories'
import {
  courtOfAppealsAssistantRule,
  courtOfAppealsJudgeRule,
  courtOfAppealsRegistrarRule,
  defenderRule,
  districtCourtAssistantRule,
  districtCourtJudgeRule,
  districtCourtRegistrarRule,
  prisonSystemStaffRule,
  prosecutorRepresentativeRule,
  prosecutorRule,
  publicProsecutorStaffRule,
} from '../../guards'
import { CaseEvent, EventService } from '../event'
import { UserService } from '../user'
import { CreateCaseDto } from './dto/createCase.dto'
import { TransitionCaseDto } from './dto/transitionCase.dto'
import { UpdateCaseDto } from './dto/updateCase.dto'
import { CurrentCase } from './guards/case.decorator'
import { CaseCompletedGuard } from './guards/caseCompleted.guard'
import { CaseExistsGuard } from './guards/caseExists.guard'
import { CaseReadGuard } from './guards/caseRead.guard'
import { CaseTypeGuard } from './guards/caseType.guard'
import { CaseWriteGuard } from './guards/caseWrite.guard'
import {
  courtOfAppealsAssistantTransitionRule,
  courtOfAppealsAssistantUpdateRule,
  courtOfAppealsJudgeTransitionRule,
  courtOfAppealsJudgeUpdateRule,
  courtOfAppealsRegistrarTransitionRule,
  courtOfAppealsRegistrarUpdateRule,
  districtCourtAssistantTransitionRule,
  districtCourtAssistantUpdateRule,
  districtCourtJudgeTransitionRule,
  districtCourtJudgeUpdateRule,
  districtCourtRegistrarTransitionRule,
  districtCourtRegistrarUpdateRule,
  prosecutorRepresentativeTransitionRule,
  prosecutorRepresentativeUpdateRule,
  prosecutorTransitionRule,
  prosecutorUpdateRule,
  publicProsecutorStaffUpdateRule,
} from './guards/rolesRules'
import { CaseInterceptor } from './interceptors/case.interceptor'
import { CaseListInterceptor } from './interceptors/caseList.interceptor'
import { Case } from './models/case.model'
import { SignatureConfirmationResponse } from './models/signatureConfirmation.response'
import { transitionCase } from './state/case.state'
import { CaseService, UpdateCase } from './case.service'
import { PDFService } from './pdf.service'

@Controller('api')
@ApiTags('cases')
export class CaseController {
  constructor(
    private readonly caseService: CaseService,
    private readonly userService: UserService,
    private readonly eventService: EventService,
    private readonly pdfService: PDFService,
    @Inject(LOGGER_PROVIDER) private readonly logger: Logger,
  ) {}

  private async validateAssignedUser(
    assignedUserId: string,
    assignableUserRoles: UserRole[],
    institutionId?: string,
  ) {
    const assignedUser = await this.userService.findById(assignedUserId)

    if (!assignableUserRoles.includes(assignedUser.role)) {
      throw new ForbiddenException(
        `User ${assignedUserId} does not have an acceptable role ${assignableUserRoles}}`,
      )
    }

    if (institutionId && assignedUser.institutionId !== institutionId) {
      throw new ForbiddenException(
        `User ${assignedUserId} belongs to the wrong institution`,
      )
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesRules(prosecutorRule, prosecutorRepresentativeRule)
  @Post('case')
  @ApiCreatedResponse({ type: Case, description: 'Creates a new case' })
  async create(
    @CurrentHttpUser() user: User,
    @Body() caseToCreate: CreateCaseDto,
  ): Promise<Case> {
    this.logger.debug('Creating a new case')

    const createdCase = await this.caseService.create(caseToCreate, user)

    this.eventService.postEvent(CaseEvent.CREATE, createdCase as Case)

    return createdCase
  }

  @UseGuards(JwtAuthGuard, RolesGuard, CaseExistsGuard, CaseWriteGuard)
  @RolesRules(
    prosecutorUpdateRule,
    prosecutorRepresentativeUpdateRule,
    districtCourtJudgeUpdateRule,
    districtCourtRegistrarUpdateRule,
    districtCourtAssistantUpdateRule,
    courtOfAppealsJudgeUpdateRule,
    courtOfAppealsRegistrarUpdateRule,
    courtOfAppealsAssistantUpdateRule,
    publicProsecutorStaffUpdateRule,
  )
  @Patch('case/:caseId')
  @ApiOkResponse({ type: Case, description: 'Updates an existing case' })
  async update(
    @Param('caseId') caseId: string,
    @CurrentHttpUser() user: User,
    @CurrentCase() theCase: Case,
    @Body() updateDto: UpdateCaseDto,
  ): Promise<Case> {
    this.logger.debug(`Updating case ${caseId}`)

    const update: UpdateCase = updateDto

    // Make sure valid users are assigned to the case's roles
    if (update.prosecutorId) {
      await this.validateAssignedUser(
        update.prosecutorId,
        [UserRole.PROSECUTOR],
        theCase.prosecutorsOfficeId,
      )
    }

    if (update.judgeId) {
      await this.validateAssignedUser(
        update.judgeId,
        [UserRole.DISTRICT_COURT_JUDGE, UserRole.DISTRICT_COURT_ASSISTANT],
        theCase.courtId,
      )
    }

    if (update.registrarId) {
      await this.validateAssignedUser(
        update.registrarId,
        [UserRole.DISTRICT_COURT_REGISTRAR],
        theCase.courtId,
      )
    }

    if (update.appealAssistantId) {
      await this.validateAssignedUser(update.appealAssistantId, [
        UserRole.COURT_OF_APPEALS_ASSISTANT,
      ])
    }

    if (update.appealJudge1Id) {
      await this.validateAssignedUser(update.appealJudge1Id, [
        UserRole.COURT_OF_APPEALS_JUDGE,
      ])
    }

    if (update.appealJudge2Id) {
      await this.validateAssignedUser(update.appealJudge2Id, [
        UserRole.COURT_OF_APPEALS_JUDGE,
      ])
    }

    if (update.appealJudge3Id) {
      await this.validateAssignedUser(update.appealJudge3Id, [
        UserRole.COURT_OF_APPEALS_JUDGE,
      ])
    }

    if (update.rulingModifiedHistory) {
      const history = theCase.rulingModifiedHistory
        ? `${theCase.rulingModifiedHistory}\n\n`
        : ''
      const today = capitalize(formatDate(nowFactory(), 'PPPPp'))
      update.rulingModifiedHistory = `${history}${today} - ${user.name} ${user.title}\n\n${update.rulingModifiedHistory}`
    }

    if (update.caseResentExplanation) {
      // We want to overwrite certain fields that the court sees so they're always seeing
      // the correct information post resend
      update.courtCaseFacts = `Í greinargerð sóknaraðila er atvikum lýst svo: ${theCase.caseFacts}`
      update.courtLegalArguments = `Í greinargerð er krafa sóknaraðila rökstudd þannig: ${theCase.legalArguments}`
      update.prosecutorDemands = update.demands ?? theCase.demands
      if (!theCase.decision) {
        update.validToDate =
          update.requestedValidToDate ?? theCase.requestedValidToDate
      }
    }

    if (update.prosecutorStatementDate) {
      update.prosecutorStatementDate = nowFactory()
    }

    if (update.appealRulingModifiedHistory) {
      const history = theCase.appealRulingModifiedHistory
        ? `${theCase.appealRulingModifiedHistory}\n\n`
        : ''
      const today = capitalize(formatDate(nowFactory(), 'PPPPp'))
      update.appealRulingModifiedHistory = `${history}${today} - ${user.name} ${user.title}\n\n${update.appealRulingModifiedHistory}`
    }

    return this.caseService.update(theCase, update, user) as Promise<Case> // Never returns undefined
  }

  @UseGuards(JwtAuthGuard, CaseExistsGuard, RolesGuard, CaseWriteGuard)
  @RolesRules(
    prosecutorTransitionRule,
    prosecutorRepresentativeTransitionRule,
    districtCourtJudgeTransitionRule,
    districtCourtRegistrarTransitionRule,
    districtCourtAssistantTransitionRule,
    courtOfAppealsJudgeTransitionRule,
    courtOfAppealsRegistrarTransitionRule,
    courtOfAppealsAssistantTransitionRule,
  )
  @Patch('case/:caseId/state')
  @ApiOkResponse({
    type: Case,
    description: 'Transitions an existing case to a new state',
  })
  async transition(
    @Param('caseId') caseId: string,
    @CurrentHttpUser() user: User,
    @CurrentCase() theCase: Case,
    @Body() transition: TransitionCaseDto,
  ): Promise<Case> {
    this.logger.debug(`Transitioning case ${caseId}`)

    const states = transitionCase(
      transition.transition,
      theCase.type,
      theCase.state,
      theCase.appealState,
    )

    let update: UpdateCase = states

    switch (transition.transition) {
      case CaseTransition.DELETE:
        update.parentCaseId = null
        break
      case CaseTransition.SUBMIT:
        if (isIndictmentCase(theCase.type)) {
          if (!user.canConfirmIndictment) {
            throw new ForbiddenException(
              `User ${user.id} does not have permission to confirm indictments`,
            )
          }

          update.indictmentDeniedExplanation = null
        }
        break
      case CaseTransition.ACCEPT:
      case CaseTransition.REJECT:
      case CaseTransition.DISMISS:
      case CaseTransition.COMPLETE:
        update.rulingDate = isIndictmentCase(theCase.type)
          ? nowFactory()
          : theCase.courtEndTime

        // Handle appealed in court
        if (
          !theCase.appealState && // don't appeal twice
          (theCase.prosecutorAppealDecision === CaseAppealDecision.APPEAL ||
            theCase.accusedAppealDecision === CaseAppealDecision.APPEAL)
        ) {
          if (theCase.prosecutorAppealDecision === CaseAppealDecision.APPEAL) {
            update.prosecutorPostponedAppealDate = nowFactory()
          } else {
            update.accusedPostponedAppealDate = nowFactory()
          }

          update = {
            ...update,
            ...transitionCase(
              CaseTransition.APPEAL,
              theCase.type,
              states.state ?? theCase.state,
              states.appealState ?? theCase.appealState,
            ),
          }
        }
        break
      case CaseTransition.REOPEN:
        update.rulingDate = null
        update.courtRecordSignatoryId = null
        update.courtRecordSignatureDate = null
        break
      // TODO: Consider changing the names of the postponed appeal date variables
      // as they are now also used when the case is appealed in court
      case CaseTransition.APPEAL:
        // The only roles that can appeal a case here are prosecutor roles
        update.prosecutorPostponedAppealDate = nowFactory()
        break
      case CaseTransition.RECEIVE_APPEAL:
        update.appealReceivedByCourtDate = nowFactory()
        break
      case CaseTransition.COMPLETE_APPEAL:
        if (
          isRestrictionCase(theCase.type) &&
          theCase.state === CaseState.ACCEPTED &&
          (theCase.decision === CaseDecision.ACCEPTING ||
            theCase.decision === CaseDecision.ACCEPTING_PARTIALLY)
        ) {
          if (
            theCase.appealRulingDecision === CaseAppealRulingDecision.CHANGED ||
            theCase.appealRulingDecision ===
              CaseAppealRulingDecision.CHANGED_SIGNIFICANTLY
          ) {
            // The court of appeals has modified the ruling of a restriction case
            update.validToDate = theCase.appealValidToDate
            update.isCustodyIsolation = theCase.isAppealCustodyIsolation
            update.isolationToDate = theCase.appealIsolationToDate
          } else if (
            theCase.appealRulingDecision === CaseAppealRulingDecision.REPEAL
          ) {
            // The court of appeals has repealed the ruling of a restriction case
            update.validToDate = nowFactory()
          }
        }
        break
      case CaseTransition.WITHDRAW_APPEAL:
        // We only want to set the appeal ruling decision if the
        // case has already been received.
        // Otherwise the court of appeals never knew of the appeal in
        // the first place so it remains withdrawn without a decision.
        if (
          !theCase.appealRulingDecision &&
          theCase.appealState === CaseAppealState.RECEIVED
        ) {
          update.appealRulingDecision = CaseAppealRulingDecision.DISCONTINUED
        }
        break
      case CaseTransition.DENY_INDICTMENT:
        if (!user.canConfirmIndictment) {
          throw new ForbiddenException(
            `User ${user.id} does not have permission to reject indictments`,
          )
        }
        break
      case CaseTransition.ASK_FOR_CONFIRMATION:
        update.indictmentReturnedExplanation = null
        break
      case CaseTransition.RETURN_INDICTMENT:
        update.courtCaseNumber = null
        update.indictmentHash = null
        break
      case CaseTransition.REDISTRIBUTE:
        update.judgeId = null
        break
      case CaseTransition.ASK_FOR_CANCELLATION:
        if (theCase.indictmentDecision) {
          throw new ForbiddenException(
            `Cannot ask for cancellation of an indictment that is already in progress at the district court`,
          )
        }
    }

    const updatedCase = await this.caseService.update(
      theCase,
      update,
      user,
      states.state !== CaseState.DELETED,
    )

    // No need to wait
    this.eventService.postEvent(
      transition.transition as unknown as CaseEvent,
      updatedCase ?? theCase,
    )

    return updatedCase ?? theCase
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesRules(
    prosecutorRule,
    prosecutorRepresentativeRule,
    publicProsecutorStaffRule,
    districtCourtJudgeRule,
    districtCourtRegistrarRule,
    districtCourtAssistantRule,
    courtOfAppealsJudgeRule,
    courtOfAppealsRegistrarRule,
    courtOfAppealsAssistantRule,
    prisonSystemStaffRule,
    defenderRule,
  )
  @Get('cases')
  @ApiOkResponse({
    type: Case,
    isArray: true,
    description: 'Gets all existing cases',
  })
  @UseInterceptors(CaseListInterceptor)
  getAll(@CurrentHttpUser() user: User): Promise<Case[]> {
    this.logger.debug('Getting all cases')

    return this.caseService.getAll(user)
  }

  @UseGuards(JwtAuthGuard, RolesGuard, CaseExistsGuard, CaseReadGuard)
  @RolesRules(
    prosecutorRule,
    prosecutorRepresentativeRule,
    publicProsecutorStaffRule,
    districtCourtJudgeRule,
    districtCourtRegistrarRule,
    districtCourtAssistantRule,
    courtOfAppealsJudgeRule,
    courtOfAppealsRegistrarRule,
    courtOfAppealsAssistantRule,
  )
  @Get('case/:caseId')
  @ApiOkResponse({ type: Case, description: 'Gets an existing case' })
  @UseInterceptors(CaseInterceptor)
  getById(@Param('caseId') caseId: string, @CurrentCase() theCase: Case): Case {
    this.logger.debug(`Getting case ${caseId} by id`)

    return theCase
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseReadGuard,
  )
  @RolesRules(
    prosecutorRule,
    districtCourtJudgeRule,
    districtCourtRegistrarRule,
    districtCourtAssistantRule,
    courtOfAppealsJudgeRule,
    courtOfAppealsRegistrarRule,
    courtOfAppealsAssistantRule,
  )
  @Get('case/:caseId/request')
  @Header('Content-Type', 'application/pdf')
  @ApiOkResponse({
    content: { 'application/pdf': {} },
    description: 'Gets the request for an existing case as a pdf document',
  })
  async getRequestPdf(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      `Getting the request for case ${caseId} as a pdf document`,
    )

    const pdf = await this.pdfService.getRequestPdf(theCase)

    res.end(pdf)
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard(indictmentCases),
    CaseReadGuard,
  )
  @RolesRules(
    prosecutorRule,
    prosecutorRepresentativeRule,
    districtCourtJudgeRule,
    districtCourtRegistrarRule,
    districtCourtAssistantRule,
  )
  @Get('case/:caseId/caseFilesRecord/:policeCaseNumber')
  @ApiOkResponse({
    content: { 'application/pdf': {} },
    description:
      'Gets the case files record for an existing case as a pdf document',
  })
  async getCaseFilesRecordPdf(
    @Param('caseId') caseId: string,
    @Param('policeCaseNumber') policeCaseNumber: string,
    @CurrentCase() theCase: Case,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      `Getting the case files record for case ${caseId} and police case ${policeCaseNumber} as a pdf document`,
    )

    if (!theCase.policeCaseNumbers.includes(policeCaseNumber)) {
      throw new BadRequestException(
        `Case ${caseId} does not include police case number ${policeCaseNumber}`,
      )
    }

    const pdf = await this.pdfService.getCaseFilesRecordPdf(
      theCase,
      policeCaseNumber,
    )

    res.end(pdf)
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseReadGuard,
  )
  @RolesRules(
    prosecutorRule,
    districtCourtJudgeRule,
    districtCourtRegistrarRule,
    districtCourtAssistantRule,
    courtOfAppealsJudgeRule,
    courtOfAppealsRegistrarRule,
    courtOfAppealsAssistantRule,
  )
  @Get('case/:caseId/courtRecord')
  @Header('Content-Type', 'application/pdf')
  @ApiOkResponse({
    content: { 'application/pdf': {} },
    description: 'Gets the court record for an existing case as a pdf document',
  })
  async getCourtRecordPdf(
    @Param('caseId') caseId: string,
    @CurrentHttpUser() user: User,
    @CurrentCase() theCase: Case,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      `Getting the court record for case ${caseId} as a pdf document`,
    )

    const pdf = await this.pdfService.getCourtRecordPdf(theCase, user)

    res.end(pdf)
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseReadGuard,
  )
  @RolesRules(
    prosecutorRule,
    districtCourtJudgeRule,
    districtCourtRegistrarRule,
    districtCourtAssistantRule,
    courtOfAppealsJudgeRule,
    courtOfAppealsRegistrarRule,
    courtOfAppealsAssistantRule,
  )
  @Get('case/:caseId/ruling')
  @Header('Content-Type', 'application/pdf')
  @ApiOkResponse({
    content: { 'application/pdf': {} },
    description: 'Gets the ruling for an existing case as a pdf document',
  })
  async getRulingPdf(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(`Getting the ruling for case ${caseId} as a pdf document`)

    const pdf = await this.pdfService.getRulingPdf(theCase)

    res.end(pdf)
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard([CaseType.CUSTODY, CaseType.ADMISSION_TO_FACILITY]),
    CaseReadGuard,
    CaseCompletedGuard,
  )
  @RolesRules(
    prosecutorRule,
    districtCourtJudgeRule,
    districtCourtRegistrarRule,
  )
  @Get('case/:caseId/custodyNotice')
  @Header('Content-Type', 'application/pdf')
  @ApiOkResponse({
    content: { 'application/pdf': {} },
    description:
      'Gets custody notice for an existing custody case as a pdf document',
  })
  async getCustodyNoticePdf(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      `Getting the custody notice for case ${caseId} as a pdf document`,
    )

    if (theCase.state !== CaseState.ACCEPTED) {
      throw new BadRequestException(
        `Cannot generate a custody notice for ${theCase.state} cases`,
      )
    }

    const pdf = await this.pdfService.getCustodyNoticePdf(theCase)

    res.end(pdf)
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard(indictmentCases),
    CaseReadGuard,
  )
  @RolesRules(
    prosecutorRule,
    prosecutorRepresentativeRule,
    districtCourtJudgeRule,
    districtCourtRegistrarRule,
    districtCourtAssistantRule,
  )
  @Get('case/:caseId/indictment')
  @Header('Content-Type', 'application/pdf')
  @ApiOkResponse({
    content: { 'application/pdf': {} },
    description: 'Gets the indictment for an existing case as a pdf document',
  })
  async getIndictmentPdf(
    @Param('caseId') caseId: string,
    @CurrentCase() theCase: Case,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      `Getting the indictment for case ${caseId} as a pdf document`,
    )

    const pdf = await this.pdfService.getIndictmentPdf(theCase)

    res.end(pdf)
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseWriteGuard,
  )
  @RolesRules(districtCourtJudgeRule, districtCourtRegistrarRule)
  @Post('case/:caseId/courtRecord/signature')
  @ApiCreatedResponse({
    type: SigningServiceResponse,
    description: 'Requests a court record signature for an existing case',
  })
  async requestCourtRecordSignature(
    @Param('caseId') caseId: string,
    @CurrentHttpUser() user: User,
    @CurrentCase() theCase: Case,
  ): Promise<SigningServiceResponse> {
    this.logger.debug(
      `Requesting a signature for the court record of case ${caseId}`,
    )

    return this.caseService
      .requestCourtRecordSignature(theCase, user)
      .catch((error) => {
        if (error instanceof DokobitError) {
          throw new HttpException(
            {
              statusCode: error.status,
              message: `Failed to request a court record signature for case ${caseId}`,
              code: error.code,
              error: error.message,
            },
            error.status,
          )
        }

        throw error
      })
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseWriteGuard,
  )
  @RolesRules(districtCourtJudgeRule, districtCourtRegistrarRule)
  @Get('case/:caseId/courtRecord/signature')
  @ApiOkResponse({
    type: SignatureConfirmationResponse,
    description:
      'Confirms a previously requested court record signature for an existing case',
  })
  getCourtRecordSignatureConfirmation(
    @Param('caseId') caseId: string,
    @CurrentHttpUser() user: User,
    @CurrentCase() theCase: Case,
    @Query('documentToken') documentToken: string,
  ): Promise<SignatureConfirmationResponse> {
    this.logger.debug(
      `Confirming a signature for the court record of case ${caseId}`,
    )

    return this.caseService.getCourtRecordSignatureConfirmation(
      theCase,
      user,
      documentToken,
    )
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseWriteGuard,
  )
  @RolesRules(districtCourtJudgeRule)
  @Post('case/:caseId/ruling/signature')
  @ApiCreatedResponse({
    type: SigningServiceResponse,
    description: 'Requests a ruling signature for an existing case',
  })
  async requestRulingSignature(
    @Param('caseId') caseId: string,
    @CurrentHttpUser() user: User,
    @CurrentCase() theCase: Case,
  ): Promise<SigningServiceResponse> {
    this.logger.debug(`Requesting a signature for the ruling of case ${caseId}`)

    if (user.id !== theCase.judgeId) {
      throw new ForbiddenException(
        'A ruling must be signed by the assigned judge',
      )
    }

    return this.caseService.requestRulingSignature(theCase).catch((error) => {
      if (error instanceof DokobitError) {
        throw new HttpException(
          {
            statusCode: error.status,
            message: `Failed to request a ruling signature for case ${caseId}`,
            code: error.code,
            error: error.message,
          },
          error.status,
        )
      }

      throw error
    })
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseWriteGuard,
  )
  @RolesRules(districtCourtJudgeRule)
  @Get('case/:caseId/ruling/signature')
  @ApiOkResponse({
    type: SignatureConfirmationResponse,
    description:
      'Confirms a previously requested ruling signature for an existing case',
  })
  async getRulingSignatureConfirmation(
    @Param('caseId') caseId: string,
    @CurrentHttpUser() user: User,
    @CurrentCase() theCase: Case,
    @Query('documentToken') documentToken: string,
  ): Promise<SignatureConfirmationResponse> {
    this.logger.debug(`Confirming a signature for the ruling of case ${caseId}`)

    if (user.id !== theCase.judgeId) {
      throw new ForbiddenException(
        'A ruling must be signed by the assigned judge',
      )
    }

    return this.caseService.getRulingSignatureConfirmation(
      theCase,
      user,
      documentToken,
    )
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    CaseExistsGuard,
    new CaseTypeGuard([...restrictionCases, ...investigationCases]),
    CaseReadGuard,
  )
  @RolesRules(prosecutorRule)
  @Post('case/:caseId/extend')
  @ApiCreatedResponse({
    type: Case,
    description: 'Clones a new case based on an existing case',
  })
  async extend(
    @Param('caseId') caseId: string,
    @CurrentHttpUser() user: User,
    @CurrentCase() theCase: Case,
  ): Promise<Case> {
    this.logger.debug(`Extending case ${caseId}`)

    if (theCase.childCase) {
      return theCase.childCase
    }

    const extendedCase = await this.caseService.extend(theCase, user)

    this.eventService.postEvent(CaseEvent.EXTEND, extendedCase as Case)

    return extendedCase
  }

  @UseGuards(JwtAuthGuard, RolesGuard, CaseExistsGuard, CaseWriteGuard)
  @RolesRules(
    districtCourtJudgeRule,
    districtCourtRegistrarRule,
    districtCourtAssistantRule,
  )
  @Post('case/:caseId/court')
  @ApiCreatedResponse({
    type: Case,
    description: 'Creates a court case associated with an existing case',
  })
  async createCourtCase(
    @Param('caseId') caseId: string,
    @CurrentHttpUser() user: User,
    @CurrentCase() theCase: Case,
  ): Promise<Case> {
    this.logger.debug(`Creating a court case for case ${caseId}`)

    return this.caseService.createCourtCase(theCase, user)
  }
}
