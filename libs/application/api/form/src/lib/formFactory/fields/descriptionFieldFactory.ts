import { DescriptionField } from '@island.is/application/types'
import { FieldDto } from '../../dto/form.dto'
import { IFieldFactory } from './IFormFieldFactory'
import { Injectable } from '@nestjs/common'
import { ContextService } from '@island.is/application/api/core'

@Injectable()
export class DescriptionFieldFactory implements IFieldFactory {
  constructor(private contextService: ContextService) {}

  createField(field: DescriptionField): FieldDto {
    const result: FieldDto = {
      id: field.id,
      description: field.description
        ? this.contextService.formatText(field.description)
        : '',
      title: field.title ? this.contextService.formatText(field.title) : '',
      type: field.type,
      component: field.component,
      specifics: {
        marginBottom: field.marginBottom?.toString() ?? undefined,
      },
    }
    return result
  }
}
