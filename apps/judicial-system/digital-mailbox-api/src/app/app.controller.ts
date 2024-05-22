import { Controller, Get, Headers, Inject } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { ApiCreatedResponse } from '@nestjs/swagger'

import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'

import { AuthGuard } from './guards/auth.guard'
import { AppService } from './app.service'

@Controller('api')
@UseGuards(AuthGuard)
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(LOGGER_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('test')
  @ApiCreatedResponse({ type: String, description: 'Test connection' })
  async test(): Promise<string> {
    this.logger.debug('Testing connection')

    return this.appService.testConnection()
  }
}
