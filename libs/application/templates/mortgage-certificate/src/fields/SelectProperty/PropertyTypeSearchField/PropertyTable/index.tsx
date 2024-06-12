import React, { FC } from 'react'
import { Box, Text, Table as T, Checkbox } from '@island.is/island-ui/core'
import { FieldBaseProps } from '@island.is/application/types'
import { PropertyDetail } from '@island.is/api/schema'
import { useLocale } from '@island.is/localization'
import { FieldArrayWithId } from 'react-hook-form'
import { MortgageCertificate } from '../../../../lib/dataSchema'
import { propertySearch } from '../../../../lib/messages'

interface PropertyTableProps {
  selectHandler: (property: PropertyDetail, index: number) => void
  propertyInfo: PropertyDetail[] | undefined
  checkedProperties: FieldArrayWithId<
    MortgageCertificate,
    'selectedProperties.properties',
    'id'
  >[]
}

export const PropertyTable: FC<
  React.PropsWithChildren<FieldBaseProps & PropertyTableProps & PropertyDetail>
> = ({ selectHandler, propertyInfo, checkedProperties }) => {
  const { formatMessage } = useLocale()
  return (
    <>
      <Box paddingY={2}>
        <T.Table>
          <T.Head>
            <T.Row>
              <T.HeadData></T.HeadData>
              <T.HeadData>
                <TableHeadText
                  text={formatMessage(propertySearch.labels.propertyNumber)}
                />
              </T.HeadData>
              <T.HeadData>
                <TableHeadText
                  text={formatMessage(
                    propertySearch.labels.propertyDescription,
                  )}
                />
              </T.HeadData>
              <T.HeadData>
                <TableHeadText
                  text={formatMessage(propertySearch.labels.propertyAddress)}
                />
              </T.HeadData>
            </T.Row>
          </T.Head>
          <T.Body>
            {propertyInfo?.map((propertyDetail) => {
              const { unitsOfUse, propertyNumber, defaultAddress } =
                propertyDetail
              const unitOfUse = (unitsOfUse?.unitsOfUse || [])[0]
              return (
                propertyNumber && (
                  <T.Row key={propertyNumber}>
                    <T.Data>
                      <Checkbox
                        id={propertyNumber}
                        name={propertyNumber}
                        checked={
                          !!checkedProperties?.find(
                            (property) =>
                              property.propertyNumber === propertyNumber,
                          )
                        }
                        onChange={() => {
                          selectHandler(
                            propertyDetail,
                            checkedProperties?.findIndex(
                              (property) =>
                                property.propertyNumber === propertyNumber,
                            ),
                          )
                        }}
                      />
                    </T.Data>
                    <T.Data>{propertyNumber}</T.Data>
                    <T.Data>{unitOfUse?.explanation}</T.Data>
                    <T.Data>{defaultAddress?.display}</T.Data>
                  </T.Row>
                )
              )
            })}
          </T.Body>
        </T.Table>
      </Box>
    </>
  )
}

const TableHeadText: FC<React.PropsWithChildren<{ text: string }>> = ({
  text,
}) => {
  return (
    <Text variant={'small'} as={'p'} fontWeight={'semiBold'}>
      {text}
    </Text>
  )
}
