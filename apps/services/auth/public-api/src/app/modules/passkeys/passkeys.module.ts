import { Module } from '@nestjs/common'
import { PasskeysController } from './passkeys.controller'
import { PasskeysCoreModule } from '@island.is/auth-api-lib'

// TODO:
// import { FeatureFlagModule } from '@island.is/nest/feature-flags'

@Module({
  imports: [PasskeysCoreModule],
  controllers: [PasskeysController],
  providers: [],
})
export class PasskeysModule {}
