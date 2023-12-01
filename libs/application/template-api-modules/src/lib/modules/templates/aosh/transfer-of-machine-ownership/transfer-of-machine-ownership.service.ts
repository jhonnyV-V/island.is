import { Inject, Injectable } from '@nestjs/common'
import { SharedTemplateApiService } from '../../../shared'
import { TemplateApiModuleActionProps } from '../../../../types'
import { ApplicationTypes } from '@island.is/application/types'
import { BaseTemplateApiService } from '../../../base-template-api.service'

import { TemplateApiError } from '@island.is/nest/problem'
import { coreErrorMessages } from '@island.is/application/core'
import { EmailRecipient, EmailRole } from './types'
import { TransferOfMachineOwnershipAnswers } from '@island.is/application/templates/aosh/transfer-of-machine-ownership'
import { generateRequestReviewEmail } from './emailGenerators/requestReviewEmail'
import {
  getRecipientBySsn,
  getRecipients,
} from './transfer-of-machine-ownership.utils'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import { generateRequestReviewSms } from './smsGenerators/requestReviewSms'
import {
  ChangeMachineOwner,
  TransferOfMachineOwnershipClient,
} from '@island.is/clients/aosh/transfer-of-machine-ownership'
import { generateApplicationSubmittedEmail } from './emailGenerators/applicationSubmittedEmail'
import { generateApplicationSubmittedSms } from './smsGenerators/applicationSubmittedSms'
import { applicationCheck } from '@island.is/application/templates/aosh/transfer-of-machine-ownership'
import {
  ChargeFjsV2ClientService,
  getPaymentIdFromExternalData,
} from '@island.is/clients/charge-fjs-v2'
import { generateApplicationRejectedEmail } from './emailGenerators/applicationRejectedEmail'
import { generateApplicationRejectedSms } from './smsGenerators/applicationRejectedSms'
@Injectable()
export class TransferOfMachineOwnershipTemplateService extends BaseTemplateApiService {
  constructor(
    @Inject(LOGGER_PROVIDER) private logger: Logger,
    private readonly sharedTemplateAPIService: SharedTemplateApiService,
    private readonly transferOfMachineOwnershipClient: TransferOfMachineOwnershipClient,
    private readonly chargeFjsV2ClientService: ChargeFjsV2ClientService,
  ) {
    super(ApplicationTypes.TRANSFER_OF_MACHINE_OWNERSHIP)
  }

  async getMachines({ auth }: TemplateApiModuleActionProps) {
    const result = await this.transferOfMachineOwnershipClient.getMachines(auth)

    // Validate that user has at least 1 machine
    if (!result || !result.length) {
      throw new TemplateApiError(
        {
          title: coreErrorMessages.machinesEmptyListDefault,
          summary: coreErrorMessages.machinesEmptyListDefault,
        },
        400,
      )
    }

    return result
  }

  async submitApplication({
    application,
    auth,
  }: TemplateApiModuleActionProps): Promise<void> {
    // Validate payment
    // Make sure a paymentUrl was created
    const { paymentUrl } = application.externalData.createCharge.data as {
      paymentUrl: string
    }
    if (!paymentUrl) {
      throw new Error(
        'Ekki er búið að staðfesta greiðslu, hinkraðu þar til greiðslan er staðfest.',
      )
    }

    // Make sure payment is fulfilled (has been paid)
    const payment: { fulfilled: boolean } | undefined =
      await this.sharedTemplateAPIService.getPaymentStatus(auth, application.id)
    if (!payment?.fulfilled) {
      throw new Error(
        'Ekki er búið að staðfesta greiðslu, hinkraðu þar til greiðslan er staðfest.',
      )
    }

    // Confirm owner change in AOSH
    const answers = application.answers as TransferOfMachineOwnershipAnswers
    if (answers?.seller?.nationalId !== application.applicant) {
      throw new TemplateApiError(
        {
          title: applicationCheck.submitApplication.sellerNotValid,
          summary: applicationCheck.submitApplication.sellerNotValid,
        },
        400,
      )
    }

    await this.transferOfMachineOwnershipClient.confirmOwnerChange(auth, {
      applicationId: application.id,
      machineId: answers.machine.id,
      machineMoreInfo: answers.location.moreInfo,
      machinePostalCode: answers.location.postCode,
      buyerNationalId: answers.buyer.nationalId,
      delegateNationalId:
        auth.nationalId != '' ? auth.nationalId : answers.buyer.nationalId,
      supervisorNationalId: answers.buyerOperator?.nationalId,
      supervisorEmail: answers.buyerOperator?.email,
      supervisorPhoneNumber: answers.buyerOperator?.phone,
      machineAddress: answers.location.address,
    })

    // send email/sms to all recipients
    const recipientList = getRecipients(answers, [
      EmailRole.buyer,
      EmailRole.seller,
    ])
    // 2b. Send email/sms individually to each recipient
    for (let i = 0; i < recipientList.length; i++) {
      if (recipientList[i].email) {
        await this.sharedTemplateAPIService
          .sendEmail(
            (props) =>
              generateApplicationSubmittedEmail(props, recipientList[i]),
            application,
          )
          .catch(() => {
            this.logger.error(
              `Error sending email about initReview to ${recipientList[i].email}`,
            )
          })
      }

      if (recipientList[i].phone) {
        await this.sharedTemplateAPIService
          .sendSms(
            () =>
              generateApplicationSubmittedSms(application, recipientList[i]),
            application,
          )
          .catch(() => {
            this.logger.error(
              `Error sending sms about initReview to ${recipientList[i].phone}`,
            )
          })
      }
    }
  }
  async initReview({
    application,
    auth,
  }: TemplateApiModuleActionProps): Promise<Array<EmailRecipient>> {
    // 1. Validate payment

    // 1a. Make sure a paymentUrl was created
    const { paymentUrl, id: paymentId } = application.externalData.createCharge
      .data as {
      paymentUrl: string
      id: string
    }

    if (!paymentUrl) {
      throw new Error(
        'Ekki er búið að staðfesta greiðslu, hinkraðu þar til greiðslan er staðfest.',
      )
    }

    // 1b. Make sure payment is fulfilled (has been paid)
    const payment: { fulfilled: boolean } | undefined =
      await this.sharedTemplateAPIService.getPaymentStatus(auth, application.id)
    if (!payment?.fulfilled) {
      throw new Error(
        'Ekki er búið að staðfesta greiðslu, hinkraðu þar til greiðslan er staðfest.',
      )
    }

    const answers = application.answers as TransferOfMachineOwnershipAnswers
    if (!answers.machine.id) {
      throw new Error('Ekki er búið að velja vél')
    }
    const ownerChange: ChangeMachineOwner = {
      applicationId: application.id,
      machineId: answers.machine.id,
      buyerNationalId: answers.buyer.nationalId,
      sellerNationalId: answers.seller.nationalId,
      delegateNationalId: answers.seller.nationalId,
      dateOfOwnerChange: new Date(),
      paymentId: paymentId,
      phoneNumber: answers.buyer.phone,
      email: answers.buyer.email,
    }

    await this.transferOfMachineOwnershipClient.initiateOwnerChangeProcess(
      auth,
      ownerChange,
    )

    const recipientList = getRecipients(answers, [EmailRole.buyer])
    // 2b. Send email/sms individually to each recipient
    for (let i = 0; i < recipientList.length; i++) {
      if (recipientList[i].email) {
        await this.sharedTemplateAPIService
          .sendEmail(
            (props) => generateRequestReviewEmail(props, recipientList[i]),
            application,
          )
          .catch(() => {
            this.logger.error(
              `Error sending email about initReview to ${recipientList[i].email}`,
            )
          })
      }

      if (recipientList[i].phone) {
        await this.sharedTemplateAPIService
          .sendSms(
            (_, options) =>
              generateRequestReviewSms(application, options, recipientList[i]),
            application,
          )
          .catch(() => {
            this.logger.error(
              `Error sending sms about initReview to ${recipientList[i].phone}`,
            )
          })
      }
    }

    return recipientList
  }
  async rejectApplication({
    application,
    auth,
  }: TemplateApiModuleActionProps): Promise<void> {
    // 1. Delete charge so that the seller gets reimburshed
    const chargeId = getPaymentIdFromExternalData(application)
    if (chargeId) {
      await this.chargeFjsV2ClientService.deleteCharge(chargeId)
    }

    // 2. Notify everyone in the process that the application has been withdrawn

    // 2a. Get list of users that need to be notified
    const answers = application.answers as TransferOfMachineOwnershipAnswers
    const recipientList = getRecipients(answers, [EmailRole.seller])

    // 2b. Send email/sms individually to each recipient about success of withdrawing application
    const rejectedByRecipient = getRecipientBySsn(answers, auth.nationalId)
    for (let i = 0; i < recipientList.length; i++) {
      if (recipientList[i].email) {
        await this.sharedTemplateAPIService
          .sendEmail(
            (props) =>
              generateApplicationRejectedEmail(
                props,
                recipientList[i],
                rejectedByRecipient,
              ),
            application,
          )
          .catch(() => {
            this.logger.error(
              `Error sending email about rejectApplication to ${recipientList[i].email}`,
            )
          })
      }

      if (recipientList[i].phone) {
        await this.sharedTemplateAPIService
          .sendSms(
            () =>
              generateApplicationRejectedSms(
                application,
                recipientList[i],
                rejectedByRecipient,
              ),
            application,
          )
          .catch(() => {
            this.logger.error(
              `Error sending sms about rejectApplication to ${recipientList[i].phone}`,
            )
          })
      }
    }
  }
}
