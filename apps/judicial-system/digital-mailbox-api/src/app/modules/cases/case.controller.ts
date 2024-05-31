import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger'

import type { User } from '@island.is/auth-nest-tools'
import { CurrentUser, IdsUserGuard } from '@island.is/auth-nest-tools'
import { type Logger, LOGGER_PROVIDER } from '@island.is/logging'

import { UpdateSubpoenaDto } from './dto/subpoena.dto'
import { CaseResponse } from './models/case.response'
import { CasesResponse } from './models/cases.response'
import { SubpoenaResponse } from './models/subpoena.response'
import { CaseService } from './case.service'

@Controller('api')
@ApiTags('cases')
//@UseGuards(IdsUserGuard)
export class CaseController {
  constructor(
    private readonly caseService: CaseService,

    @Inject(LOGGER_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('cases')
  @ApiCreatedResponse({ type: String, description: 'Get all cases' })
  async getAllCases(
    @CurrentUser() user: User,
    @Query() query?: { lang: string },
  ): Promise<CasesResponse[]> {
    this.logger.debug('Getting all cases')

    return this.caseService.getCases(user.nationalId, query?.lang)
  }

  @Get('case/:caseId')
  @ApiCreatedResponse({ type: CaseResponse, description: 'Get case by id' })
  async getCase(
    @Param('caseId') caseId: string,
    @CurrentUser() user: User,
    @Query() query?: { lang: string },
  ): Promise<CaseResponse> {
    this.logger.debug('Getting case by id')

    return this.caseService.getCaseById(caseId, user.nationalId, query?.lang)
  }

  @Get('cases/:caseId/subpoena')
  // @ApiCreatedResponse({
  //   type: () => SubpoenaResponse,
  //   description: 'Get subpoena by case id',
  // })
  async getSubpoena(
    @Param('caseId') caseId: string,
    //@CurrentUser() user: User,
  ): Promise<SubpoenaResponse> {
    this.logger.debug(`Getting subpoena by case id ${caseId}`)

    return this.caseService.getSubpoena(caseId, '010891-2489')
  }

  // @HttpCode(200)
  @Patch('cases/:caseId/subpoena')
  async updateSubpoena(
    //@CurrentUser() user: User,
    @Param('caseId') caseId: string,
    @Body() defenderAssignment: UpdateSubpoenaDto,
  ): Promise<SubpoenaResponse> {
    this.logger.debug(`Assigning defender to subpoena ${caseId}`)

    return this.caseService.updateSubpoena(
      '010891-2489',
      caseId,
      defenderAssignment,
    )
  }
}
