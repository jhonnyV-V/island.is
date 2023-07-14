import { DataValue, ReviewGroup } from '@island.is/application/ui-components'
import { GridColumn, GridRow } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'

import { householdSupplementFormMessage } from '../../../lib/messages'
import { ReviewGroupProps } from './props'
import { useStatefulAnswers } from '../../../hooks/useStatefulAnswers'

export const Payment = ({
  application,
  editable,
  goToScreen,
}: ReviewGroupProps) => {
  const [{ bank }] = useStatefulAnswers(application)

  const { formatMessage } = useLocale()

  return (
    <ReviewGroup
      isEditable={editable}
      editAction={() => goToScreen?.('paymentInfo')}
    >
      <GridRow marginBottom={3}>
        <GridColumn span={['12/12', '12/12', '12/12', '5/12']}>
          <DataValue
            label={formatMessage(
              householdSupplementFormMessage.info.paymentBank,
            )}
            value={bank}
          />
        </GridColumn>
      </GridRow>
    </ReviewGroup>
  )
}
