import { MappedData } from '@island.is/content-search-indexer/types'
import { logger } from '@island.is/logging'
import { Injectable } from '@nestjs/common'
import { Entry } from 'contentful'
import { ILink, IGenericListItem } from '../../generated/contentfulTypes'
import { CmsSyncProvider, processSyncDataInput } from '../cmsSync.service'
import { mapGenericListItem } from '../../models/genericListItem.model'
import {
  extractStringsFromObject,
  pruneNonSearchableSliceUnionFields,
} from './utils'

@Injectable()
export class GenericListItemSyncService
  implements CmsSyncProvider<IGenericListItem>
{
  processSyncData(entries: processSyncDataInput<ILink>) {
    return entries.filter(
      (entry: Entry<any>): entry is IGenericListItem =>
        entry.sys.contentType.sys.id === 'genericListItem' &&
        entry.fields.title,
    )
  }

  doMapping(entries: IGenericListItem[]) {
    if (entries.length > 0) {
      logger.info('Mapping generic list items', { count: entries.length })
    }

    return entries
      .map<MappedData | boolean>((entry) => {
        try {
          const mapped = mapGenericListItem(entry)

          const content = extractStringsFromObject(
            mapped.cardIntro.map(pruneNonSearchableSliceUnionFields),
            100,
            2,
          )

          const tags: MappedData['tags'] = []

          if (mapped.genericList) {
            tags.push({
              type: 'referencedBy',
              key: mapped.genericList.id,
            })
          }
          if (mapped.slug) {
            tags.push({ type: 'slug', key: mapped.slug })
          }

          return {
            _id: mapped.id,
            title: mapped.title,
            type: 'webGenericListItem',
            content,
            contentWordCount: content.split(/\s+/).length,
            response: JSON.stringify({
              ...mapped,
              typename: 'GenericListItem',
            }),
            dateCreated: entry.sys.createdAt,
            dateUpdated: new Date().getTime().toString(),
            tags,
            releaseDate: mapped.date,
          }
        } catch (error) {
          logger.warn('Failed to import generic list item', {
            error: error.message,
            id: entry?.sys?.id,
          })
          return false
        }
      })
      .filter((value): value is MappedData => Boolean(value))
  }
}
