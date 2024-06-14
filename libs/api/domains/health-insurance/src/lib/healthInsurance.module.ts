import { Module } from '@nestjs/common'
import {
  HealthInsuranceAccidentNotificationResolver,
  HealthInsuranceResolver,
} from './graphql'
import { HealthInsuranceService } from './healthInsurance.service'
import { HealthInsuranceV2ClientModule } from '@island.is/clients/icelandic-health-insurance/health-insurance'
import { AccidentNotificationService } from './accident-notification.service'

@Module({
  imports: [HealthInsuranceV2ClientModule],
  providers: [
    HealthInsuranceService,
    AccidentNotificationService,
    HealthInsuranceResolver,
    HealthInsuranceAccidentNotificationResolver,
  ],
  exports: [],
})
export class HealthInsuranceModule {}
