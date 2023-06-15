import { bootstrap } from '@island.is/infra-nest-server'
// temp stuff to trigger for #deploy-feature
import { AppModule } from './app/app.module'
import { environment } from './environments'
import { openApi } from './openApi'

export const bootstrapServer = () => {
  bootstrap({
    appModule: AppModule,
    name: 'application-system-api',
    openApi,
  })
}
