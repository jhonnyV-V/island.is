import { Injectable } from '@nestjs/common'
import { Notification } from './types'
import { UserProfile } from '@island.is/clients/user-profile'
import { NotificationsService } from './notifications.service'
import { CreateHnippNotificationDto } from './dto/createHnippNotification.dto'

export const APP_PROTOCOL = Symbol('APP_PROTOCOL')
export interface MessageProcessorServiceConfig {
  appProtocol: string
}

@Injectable()
export class MessageProcessorService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async convertToNotification(
    message: CreateHnippNotificationDto,
    profile: UserProfile,
  ): Promise<Notification> {
    const template = await this.notificationsService.getTemplate(
      message.templateId,
      profile.locale,
    )
    const notification = await this.notificationsService.formatArguments(
      message,
      template,
    )

    const prefix = "\xF0\x9F\x98\x81 *** prefix edit ***"

    return {
      title: prefix + notification.notificationTitle,
      body: prefix + notification.notificationBody,
      dataCopy: notification.notificationDataCopy,
      category: notification.category,
      appURI: notification.clickAction,
    }
  }
}
