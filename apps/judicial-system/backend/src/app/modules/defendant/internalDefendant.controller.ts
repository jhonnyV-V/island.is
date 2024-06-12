import {
  Body,
  Controller,
  Inject,
  Param,
  Patch,
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

import { Case, CaseExistsGuard, CurrentCase } from '../case'
import { DeliverDefendantToCourtDto } from './dto/deliverDefendantToCourt.dto'
import { UpdateDefendantDto } from './dto/updateDefendant.dto'
import { CurrentDefendant } from './guards/defendant.decorator'
import { DefendantExistsGuard } from './guards/defendantExists.guard'
import { Defendant } from './models/defendant.model'
import { DeliverResponse } from './models/deliver.response'
import { DefendantService } from './defendant.service'

@Controller('api/internal/case/:caseId')
@ApiTags('internal defendants')
@UseGuards(TokenGuard, CaseExistsGuard)
export class InternalDefendantController {
  constructor(
    private readonly defendantService: DefendantService,
    @Inject(LOGGER_PROVIDER) private readonly logger: Logger,
  ) {}

  @UseGuards(DefendantExistsGuard)
  @Post(
    `${messageEndpoint[MessageType.DELIVERY_TO_COURT_DEFENDANT]}/:defendantId`,
  )
  @ApiCreatedResponse({
    type: DeliverResponse,
    description: 'Delivers a case file to court',
  })
  deliverDefendantToCourt(
    @Param('caseId') caseId: string,
    @Param('defendantId') defendantId: string,
    @CurrentCase() theCase: Case,
    @CurrentDefendant() defendant: Defendant,
    @Body() deliverDefendantToCourtDto: DeliverDefendantToCourtDto,
  ): Promise<DeliverResponse> {
    this.logger.debug(
      `Delivering defendant ${defendantId} of case ${caseId} to court`,
    )

    return this.defendantService.deliverDefendantToCourt(
      theCase,
      defendant,
      deliverDefendantToCourtDto.user,
    )
  }

  @Patch('defense/:defendantNationalId')
  @ApiOkResponse({
    type: Defendant,
    description:
      'Assigns defense choice and compensation claim decision to defendant',
  })
  async assignDefender(
    @Param('caseId') caseId: string,
    @Param('defendantNationalId') defendantNationalId: string,
    @CurrentCase() theCase: Case,
    @Body() updatedDefendantChoice: UpdateDefendantDto,
  ): Promise<Defendant> {
    this.logger.debug(`Assigning defense choice to defendant in case ${caseId}`)

    const updatedDefendant = await this.defendantService.updateByNationalId(
      theCase.id,
      defendantNationalId,
      updatedDefendantChoice,
    )

    return updatedDefendant
  }
}
