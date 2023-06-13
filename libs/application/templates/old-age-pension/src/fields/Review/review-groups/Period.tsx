import { DataValue, ReviewGroup } from '@island.is/application/ui-components'
import { GridColumn, GridRow } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { oldAgePensionFormMessage } from '../../../lib/messages'
import { ReviewGroupProps } from './props'
import { useStatefulAnswers } from '../../../hooks/useStatefulAnswers'

export const Period = ({
  application,
  editable,
  goToScreen,
}: ReviewGroupProps) => {
  const [{ selectedYear, selectedMonth }, setStateful] = useStatefulAnswers(
    application,
  )

  const { formatMessage } = useLocale()

  return (
    <ReviewGroup
      isEditable={editable}
      editAction={() => goToScreen?.('period')}
      isLast={true}
    >
      <GridRow marginBottom={3}>
        <GridColumn span={['12/12', '12/12', '12/12', '5/12']}>
          <DataValue
            label={formatMessage(oldAgePensionFormMessage.review.fisher)}
            value={`${selectedMonth} ${selectedYear}`}
          />
        </GridColumn>
      </GridRow>
    </ReviewGroup>
  )
}
