import {
  DataValue,
  RadioValue,
  ReviewGroup,
  formatBankInfo,
} from '@island.is/application/ui-components'
import { GridColumn, GridRow } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { oldAgePensionFormMessage } from '../../../lib/messages'
import { ReviewGroupProps } from './props'
import { useStatefulAnswers } from '../../../hooks/useStatefulAnswers'
import { getTaxLevelOption } from './utils'
import { YES, BankAccountType } from '../../../lib/constants'

export const PaymentInformation = ({
  application,
  editable,
  goToScreen,
}: ReviewGroupProps) => {
  const [
    {
      taxLevel,
      personalAllowance,
      personalAllowanceUsage,
      bank,
      bankAccountType,
      iban,
      swift,
      bankName,
      bankAddress,
      currency,
    },
  ] = useStatefulAnswers(application)

  const { formatMessage } = useLocale()

  return (
    <ReviewGroup
      isLast
      isEditable={editable}
      editAction={() => goToScreen?.('paymentInfo')}
    >
      {bankAccountType === BankAccountType.ICELANDIC ? (
        <GridRow marginBottom={3}>
          <GridColumn span={['12/12', '12/12', '12/12', '5/12']}>
            <DataValue
              label={formatMessage(oldAgePensionFormMessage.review.bank)}
              value={formatBankInfo(bank)}
            />
          </GridColumn>
        </GridRow>
      ) : (
        <>
          <GridRow marginBottom={3}>
            <GridColumn span={['12/12', '12/12', '12/12', '12/12']}>
              <DataValue
                label={formatMessage(oldAgePensionFormMessage.payment.iban)}
                value={iban}
              />
            </GridColumn>
          </GridRow>
          <GridRow>
            <GridColumn
              span={['12/12', '12/12', '12/12', '5/12']}
              paddingBottom={3}
            >
              <DataValue
                label={formatMessage(oldAgePensionFormMessage.payment.swift)}
                value={swift}
              />
            </GridColumn>
            <GridColumn
              span={['12/12', '12/12', '12/12', '5/12']}
              paddingBottom={3}
            >
              <DataValue
                label={formatMessage(oldAgePensionFormMessage.payment.currency)}
                value={currency}
              />
            </GridColumn>
          </GridRow>

          <GridRow>
            <GridColumn
              span={['12/12', '12/12', '12/12', '5/12']}
              paddingBottom={3}
            >
              <DataValue
                label={formatMessage(oldAgePensionFormMessage.payment.bankName)}
                value={bankName}
              />
            </GridColumn>
            <GridColumn
              span={['12/12', '12/12', '12/12', '5/12']}
              paddingBottom={3}
            >
              <DataValue
                label={formatMessage(
                  oldAgePensionFormMessage.payment.bankAddress,
                )}
                value={bankAddress}
              />
            </GridColumn>
          </GridRow>
        </>
      )}

      <GridRow>
        <GridColumn
          span={['12/12', '12/12', '12/12', '5/12']}
          paddingBottom={3}
        >
          <RadioValue
            label={formatMessage(
              oldAgePensionFormMessage.review.personalAllowance,
            )}
            value={personalAllowance}
          />
        </GridColumn>

        {personalAllowance === YES && (
          <GridColumn
            span={['12/12', '12/12', '12/12', '5/12']}
            paddingBottom={3}
          >
            <DataValue
              label={formatMessage(oldAgePensionFormMessage.review.ratio)}
              value={`${personalAllowanceUsage}%`}
            />
          </GridColumn>
        )}
      </GridRow>

      <GridRow>
        <GridColumn span={['12/12', '12/12', '12/12', '12/12']}>
          <DataValue
            label={formatMessage(oldAgePensionFormMessage.review.taxLevel)}
            value={formatMessage(getTaxLevelOption(taxLevel))}
          />
        </GridColumn>
      </GridRow>
    </ReviewGroup>
  )
}
