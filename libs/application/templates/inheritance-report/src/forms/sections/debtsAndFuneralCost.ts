import {
  buildCustomField,
  buildDescriptionField,
  buildMultiField,
  buildSection,
  buildSubSection,
} from '@island.is/application/core'
import { m } from '../../lib/messages'
import { DebtTypes } from '../../types'

export const debtsAndFuneralCost = buildSection({
  id: 'debts',
  title: m.debtsAndFuneralCostTitle,
  children: [
    buildSubSection({
      id: 'domesticAndForeignDebts',
      title: m.debtsTitle,
      children: [
        buildMultiField({
          id: 'domesticAndForeignDebts',
          title: m.debtsAndFuneralCost,
          description: m.debtsAndFuneralCostDescription,
          children: [
            buildDescriptionField({
              id: 'domesticAndForeignDebtsHeader',
              title: m.domesticAndForeignDebts,
              description: m.domesticAndForeignDebtsDescription,
              titleVariant: 'h3',
            }),
            buildDescriptionField({
              id: 'debts.domesticAndForeignDebts.total',
              title: '',
            }),
            buildCustomField(
              {
                title: '',
                id: 'debts.domesticAndForeignDebts.data',
                component: 'ReportFieldsRepeater',
              },
              {
                fields: [
                  {
                    title: m.debtsCreditorName,
                    id: 'description',
                  },
                  {
                    title: m.creditorsNationalId,
                    id: 'nationalId',
                    format: '######-####',
                  },
                  {
                    title: m.debtType,
                    id: 'debtType',
                  },
                  {
                    title: m.debtsLoanIdentity,
                    id: 'assetNumber',
                  },
                  {
                    title: m.debtsBalance,
                    id: 'propertyValuation',
                    required: true,
                    currency: true,
                  },
                ],
                hideDeceasedShare: true,
                repeaterButtonText: m.debtsRepeaterButton,
                fromExternalData: 'otherDebts',
                sumField: 'propertyValuation',
                selections: [
                  {
                    label: m.debtOverDraft,
                    value: DebtTypes.Overdraft,
                  },
                  {
                    label: m.debtCreditCard,
                    value: DebtTypes.CreditCard,
                  },
                  {
                    label: m.debtLoan,
                    value: DebtTypes.Loan,
                  },
                  {
                    label: m.debtInsuranceCompany,
                    value: DebtTypes.InsuranceCompany,
                  },
                  {
                    label: m.debtPropertyFees,
                    value: DebtTypes.PropertyFees,
                  },
                ],
              },
            ),
          ],
        }),
      ],
    }),
    buildSubSection({
      id: 'funeralCost',
      title: m.funeralCostTitle,
      children: [
        buildMultiField({
          id: 'funeralCost',
          title: m.funeralCostTitle,
          description: m.funeralCostDescription,
          children: [
            buildDescriptionField({
              id: 'overviewFuneralCost',
              title: m.funeralCostTitle,
              titleVariant: 'h3',
              marginBottom: 'gutter',
              space: 'gutter',
            }),
            buildCustomField(
              {
                title: '',
                id: 'funeralCost',
                doesNotRequireAnswer: false,
                component: 'FuneralCost',
                childInputIds: [
                  'funeralCost.other',
                  'funeralCost.otherDetails',
                ],
              },
              {
                fields: [
                  {
                    id: 'build',
                    title: m.funeralBuildCost,
                  },
                  {
                    id: 'cremation',
                    title: m.funeralCremationCost,
                  },
                  {
                    id: 'print',
                    title: m.funeralPrintCost,
                  },
                  {
                    id: 'flowers',
                    title: m.funeralFlowersCost,
                  },
                  {
                    id: 'music',
                    title: m.funeralMusicCost,
                  },
                  {
                    id: 'rent',
                    title: m.funeralRentCost,
                  },
                  {
                    id: 'food',
                    title: m.funeralFoodAndDrinkCost,
                  },
                  {
                    id: 'tombstone',
                    title: m.funeralTombstoneCost,
                  },
                ],
              },
            ),
          ],
        }),
      ],
    }),
    buildSubSection({
      id: 'debtsAndFuneralCostOverview',
      title: m.overview,
      children: [
        buildMultiField({
          id: 'debtsAndFuneralCostOverview',
          title: m.debtsAndFuneralCostOverview,
          description: m.overviewDescription,
          children: [
            buildCustomField({
              title: '',
              description: '',
              id: 'overviewDebts',
              component: 'OverviewDebts',
            }),
            buildCustomField({
              title: '',
              id: 'debts.debtsTotal',
              doesNotRequireAnswer: true,
              component: 'CalculateTotalDebts',
            }),
          ],
        }),
      ],
    }),
  ],
})
