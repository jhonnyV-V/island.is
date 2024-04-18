import {
  CustomersApi,
  CustomersListDocumentsOrderEnum,
  CustomersListDocumentsSortByEnum,
  CustomersWantsPaperMailRequest,
} from '../../gen/fetch'
import { Injectable } from '@nestjs/common'
import { DocumentDto, mapToDocument } from './dto/document.dto'
import { ListDocumentsInputDto } from './dto/listDocuments.input'
import { ListDocumentsDto } from './dto/documentList.dto'
import { isDefined } from '@island.is/shared/utils'
import { mapToDocumentInfoDto } from './dto/documentInfo.dto'
import { MailAction } from './dto/mailAction.dto'

@Injectable()
export class DocumentsClientV2Service {
  constructor(private api: CustomersApi) {}

  async getDocumentList(
    input: ListDocumentsInputDto,
  ): Promise<ListDocumentsDto | null> {
    /**
     *
     * @param input List input object. Example: { dateFrom: undefined, nationalId: '123' }
     * @returns List object sanitized of unnecessary values. Example: { nationalId: '123' }
     */
    function sanitizeObject<T extends { [key: string]: any }>(obj: T): T {
      const sanitizedObj = {} as T
      for (const key in obj) {
        if (obj[key]) {
          sanitizedObj[key] = obj[key]
        }
      }
      return sanitizedObj
    }

    const inputObject = sanitizeObject({
      ...input,
      kennitala: input.nationalId,
      senderKennitala:
        input.senderNationalId && input.senderNationalId.length > 0
          ? input.senderNationalId.join()
          : undefined,
      order: input.order
        ? CustomersListDocumentsOrderEnum[input.order]
        : undefined,
      sortBy: input.sortBy
        ? CustomersListDocumentsSortByEnum[input.sortBy]
        : undefined,
    })

    const documents = await this.api.customersListDocuments(inputObject)

    if (!documents.totalCount) {
      return null
    }

    return {
      totalCount: documents.totalCount,
      unreadCount: documents.unreadCount,
      documents:
        documents.messages
          ?.map((m) => mapToDocumentInfoDto(m))
          .filter(isDefined) ?? [],
    }
  }

  async getCustomersDocument(
    customerId: string,
    documentId: string,
  ): Promise<DocumentDto | null> {
    const document = await this.api.customersDocument({
      kennitala: customerId,
      messageId: documentId,
      authenticationType: 'HIGH',
    })

    return mapToDocument(document)
  }

  async getPageNumber(
    nationalId: string,
    documentId: string,
    pageSize: number,
  ): Promise<number | null> {
    const res = await this.api.customersGetDocumentPage({
      kennitala: nationalId,
      messageId: documentId,
      pageSize,
    })

    return res.messagePage ?? null
  }
  getCustomersCategories(nationalId: string) {
    return this.api.customersCategories({ kennitala: nationalId })
  }
  getCustomersTypes(nationalId: string) {
    return this.api.customersMessageTypes({ kennitala: nationalId })
  }
  getCustomersSenders(nationalId: string) {
    return this.api.customersSenders({ kennitala: nationalId })
  }
  requestPaperMail(input: CustomersWantsPaperMailRequest) {
    return this.api.customersWantsPaperMail(input)
  }
  updatePaperMailPreference(nationalId: string, wantsPaper: boolean) {
    return this.api.customersUpdatePaperMailPreference({
      kennitala: nationalId,
      paperMail: {
        kennitala: nationalId,
        wantsPaper: wantsPaper,
      },
    })
  }
  async archiveMail(nationalId: string, documentId: string) {
    await this.api.customersArchive({
      kennitala: nationalId,
      messageId: documentId,
    })
    return {
      success: true,
      ids: [documentId],
    }
  }
  async unarchiveMail(nationalId: string, documentId: string) {
    await this.api.customersUnarchive({
      kennitala: nationalId,
      messageId: documentId,
    })
    return {
      success: true,
      ids: [documentId],
    }
  }
  async bookmarkMail(nationalId: string, documentId: string) {
    await this.api.customersBookmark({
      kennitala: nationalId,
      messageId: documentId,
    })
    return {
      success: true,
      ids: [documentId],
    }
  }
  async unbookmarkMail(nationalId: string, documentId: string) {
    await this.api.customersUnbookmark({
      kennitala: nationalId,
      messageId: documentId,
    })
    return {
      success: true,
      ids: [documentId],
    }
  }

  async batchArchiveMail(
    nationalId: string,
    documentIds: Array<string>,
    status: boolean,
  ): Promise<MailAction | null> {
    await this.api.customersBatchArchive({
      kennitala: nationalId,
      batchRequest: { ids: documentIds, status },
    })

    return {
      success: true,
      ids: documentIds,
    }
  }

  async batchBookmarkMail(
    nationalId: string,
    documentIds: Array<string>,
    status: boolean,
  ) {
    await this.api.customersBatchBookmark({
      kennitala: nationalId,
      batchRequest: { ids: documentIds, status },
    })

    return {
      success: true,
      ids: documentIds,
    }
  }

  async batchReadMail(nationalId: string, documentIds: Array<string>) {
    await this.api.customersBatchReadDocuments({
      kennitala: nationalId,
      request: { ids: documentIds },
    })
    return {
      success: true,
      ids: documentIds,
    }
  }
}
