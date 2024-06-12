import { Inject, Injectable } from '@nestjs/common'
import { DocumentsClientV2Service } from '@island.is/clients/documents-v2'
import { LOGGER_PROVIDER, type Logger } from '@island.is/logging'
import { isDefined } from '@island.is/shared/utils'
import { Category } from './models/v2/category.model'
import { MailAction } from './models/v2/bulkMailAction.input'
import {
  PaginatedDocuments,
  Document,
  DocumentPageNumber,
} from './models/v2/document.model'
import type { ConfigType } from '@island.is/nest/config'
import { DocumentsInput } from './models/v2/documents.input'
import { PaperMailPreferences } from './models/v2/paperMailPreferences.model'
import { Sender } from './models/v2/sender.model'
import { FileType } from './models/v2/documentContent.model'
import { HEALTH_CATEGORY_ID } from './document.types'
import { Type } from './models/v2/type.model'
import { DownloadServiceConfig } from '@island.is/nest/config'
import { DocumentV2MarkAllMailAsRead } from './models/v2/markAllMailAsRead.model'

const LOG_CATEGORY = 'documents-api-v2'
@Injectable()
export class DocumentServiceV2 {
  constructor(
    private documentService: DocumentsClientV2Service,
    @Inject(LOGGER_PROVIDER) private readonly logger: Logger,
    @Inject(DownloadServiceConfig.KEY)
    private downloadServiceConfig: ConfigType<typeof DownloadServiceConfig>,
  ) {}

  async findDocumentById(
    nationalId: string,
    documentId: string,
  ): Promise<Document | null> {
    const document = await this.documentService.getCustomersDocument(
      nationalId,
      documentId,
    )

    if (!document) {
      return null // Null document logged in clients-documents-v2
    }

    let type: FileType
    switch (document.fileType) {
      case 'html':
        type = FileType.HTML
        break
      case 'pdf':
        type = FileType.PDF
        break
      case 'url':
        type = FileType.URL
        break
      default:
        type = FileType.UNKNOWN
    }

    return {
      ...document,
      publicationDate: document.date,
      id: documentId,
      name: document.fileName,
      downloadUrl: `${this.downloadServiceConfig.baseUrl}/download/v1/electronic-documents/${documentId}`,
      sender: {
        id: document.senderNationalId,
        name: document.senderName,
      },
      content: {
        type,
        value: document.content,
      },
    }
  }

  async listDocuments(
    nationalId: string,
    input: DocumentsInput,
  ): Promise<PaginatedDocuments> {
    //If a delegated user is viewing the mailbox, do not return any health related data
    //Category is now "1,2,3,...,n"
    const { categoryIds, ...restOfInput } = input
    let mutableCategoryIds = categoryIds ?? []

    if (input.isLegalGuardian) {
      if (!mutableCategoryIds.length) {
        mutableCategoryIds = (await this.getCategories(nationalId, true)).map(
          (c) => c.id,
        )
      } else {
        mutableCategoryIds = mutableCategoryIds.filter(
          (c) => c === HEALTH_CATEGORY_ID,
        )
      }
    }

    const documents = await this.documentService.getDocumentList({
      ...restOfInput,
      categoryId: mutableCategoryIds.join(),
      nationalId,
    })

    if (typeof documents?.totalCount !== 'number') {
      this.logger.warn('Document total count unavailable', {
        category: LOG_CATEGORY,
        totalCount: documents?.totalCount,
      })
    }

    const documentData: Array<Document> =
      documents?.documents
        .map((d) => {
          if (!d) {
            return null
          }

          return {
            ...d,
            id: d.id,
            downloadUrl: `${this.downloadServiceConfig.baseUrl}/download/v1/electronic-documents/${d.id}`,
            sender: {
              name: d.senderName,
              id: d.senderNationalId,
            },
          }
        })
        .filter(isDefined) ?? []

    return {
      data: documentData,
      totalCount: documents?.totalCount ?? 0,
      unreadCount: documents?.unreadCount,
      pageInfo: {
        hasNextPage: false,
      },
    }
  }

  async getCategories(
    nationalId: string,
    filterHealth = false,
  ): Promise<Array<Category>> {
    const categories = await this.documentService.getCustomersCategories(
      nationalId,
    )

    return (
      categories.categories
        ?.map((c) => {
          if (!c.id || (filterHealth && c.id === HEALTH_CATEGORY_ID)) {
            return null
          }
          return {
            id: c.id,
            name: c.name,
          }
        })
        .filter(isDefined) ?? []
    )
  }

  async getTypes(nationalId: string): Promise<Array<Type>> {
    const res = await this.documentService.getCustomersTypes(nationalId)

    return (
      res.types
        ?.map((t) => {
          if (!t.id) {
            return null
          }
          return {
            id: t.id,
            name: t.name,
          }
        })
        .filter(isDefined) ?? []
    )
  }

  async getSenders(nationalId: string): Promise<Array<Sender>> {
    const res = await this.documentService.getCustomersSenders(nationalId)

    return (
      res.senders
        ?.map((s) => {
          if (!s.kennitala) {
            return null
          }
          return {
            id: s.kennitala,
            name: s.name,
          }
        })
        .filter(isDefined) ?? []
    )
  }

  async getPageNumber(
    nationalId: string,
    documentId: string,
    pageSize: number,
  ): Promise<DocumentPageNumber> {
    const res = await this.documentService.getPageNumber(
      nationalId,
      documentId,
      pageSize,
    )

    return {
      pageNumber: res ?? 1,
    }
  }

  async getPaperMailInfo(
    nationalId: string,
  ): Promise<PaperMailPreferences | null> {
    const res = await this.documentService.requestPaperMail({
      kennitala: nationalId,
    })

    if (!res.kennitala || !res.wantsPaper) {
      return null
    }

    return {
      wantsPaper: res.wantsPaper,
      nationalId: res.kennitala,
    }
  }

  async postPaperMailInfo(
    nationalId: string,
    wantsPaper: boolean,
  ): Promise<PaperMailPreferences | null> {
    const res = await this.documentService.updatePaperMailPreference(
      nationalId,
      wantsPaper,
    )

    if (!res.kennitala || !res.wantsPaper) {
      return null
    }

    return {
      wantsPaper: res.wantsPaper,
      nationalId: res.kennitala,
    }
  }

  async markAllMailAsRead(
    nationalId: string,
  ): Promise<DocumentV2MarkAllMailAsRead> {
    this.logger.debug('Marking all mail as read', {
      category: LOG_CATEGORY,
    })
    const res = await this.documentService.markAllMailAsRead(nationalId)

    return {
      success: res.success,
    }
  }

  async postMailAction(
    nationalId: string,
    documentId: string | Array<string>,
    action: MailAction,
  ) {
    if (Array.isArray(documentId)) {
      switch (action) {
        case MailAction.ARCHIVE:
          return this.documentService.batchArchiveMail(
            nationalId,
            documentId,
            true,
          )
        case MailAction.UNARCHIVE:
          return this.documentService.batchArchiveMail(
            nationalId,
            documentId,
            false,
          )
        case MailAction.BOOKMARK:
          return this.documentService.batchBookmarkMail(
            nationalId,
            documentId,
            true,
          )
        case MailAction.UNBOOKMARK:
          return this.documentService.batchBookmarkMail(
            nationalId,
            documentId,
            false,
          )
        case MailAction.READ:
          return this.documentService.batchReadMail(nationalId, documentId)
        default:
          this.logger.error('Invalid bulk document action', {
            action,
            category: LOG_CATEGORY,
          })
          throw new Error('Invalid bulk document action')
      }
    }
    switch (action) {
      case MailAction.ARCHIVE:
        return this.documentService.archiveMail(nationalId, documentId)
      case MailAction.UNARCHIVE:
        return this.documentService.unarchiveMail(nationalId, documentId)
      case MailAction.BOOKMARK:
        return this.documentService.bookmarkMail(nationalId, documentId)
      case MailAction.UNBOOKMARK:
        return this.documentService.unbookmarkMail(nationalId, documentId)
      default:
        this.logger.error('Invalid single document action', {
          action,
          category: LOG_CATEGORY,
        })
        throw new Error('Invalid single document action')
    }
  }
}
