import {
  Button,
  Divider,
  NavigationBarSheet,
  TextField,
  Typography,
  useDynamicColor,
} from '@ui'
import { useCallback, useMemo, useState } from 'react'
import { FormattedDate, useIntl } from 'react-intl'
import { Alert, FlatList, View } from 'react-native'
import {
  Navigation,
  NavigationFunctionComponent,
} from 'react-native-navigation'
import externalLinkIcon from '../../assets/icons/external-link.png'
import {
  GetVehicleDocument,
  GetVehicleMileageDocument,
  GetVehicleMileageQuery,
  useGetVehicleMileageQuery,
  useGetVehicleQuery,
  usePostVehicleMileageMutation,
  useUpdateVehicleMileageMutation,
} from '../../graphql/types/schema'
import { createNavigationOptionHooks } from '../../hooks/create-navigation-option-hooks'
import { useBrowser } from '../../lib/useBrowser'
import { MileageCell } from './components/mileage-cell'

const { getNavigationOptions, useNavigationOptions } =
  createNavigationOptionHooks(() => ({
    topBar: {
      visible: false,
    },
  }))

export const originCodes = {
  'ISLAND.IS': 'Ísland.is',
  SKODUN: 'Skoðun',
}

type ListItem =
  | NonNullable<
      NonNullable<GetVehicleMileageQuery['vehicleMileageDetails']>['data']
    >[number]
  | {
      __typename: 'Skeleton'
      internalId: number
    }

export const VehicleMileageScreen: NavigationFunctionComponent<{
  id: string
  title?: { type: string; year: string; color: string }
}> = ({ componentId, id, title }) => {
  useNavigationOptions(componentId)

  const intl = useIntl()
  const dynamicColor = useDynamicColor()
  const { openBrowser } = useBrowser()
  const [input, setInput] = useState('')
  const info = useGetVehicleQuery({
    fetchPolicy: 'cache-first',
    variables: {
      input: {
        regno: '',
        permno: id,
        vin: '',
      },
    },
  })
  const res = useGetVehicleMileageQuery({
    variables: {
      input: {
        permno: id,
      },
    },
  })
  const [postMileage] = usePostVehicleMileageMutation({
    refetchQueries: [GetVehicleMileageDocument, GetVehicleDocument],
  })
  const [updateMileage] = useUpdateVehicleMileageMutation({
    refetchQueries: [GetVehicleMileageDocument, GetVehicleDocument],
  })

  const data = useMemo<ListItem[]>(() => {
    if (res.loading && !res.data) {
      return Array.from({ length: 6 }).map((_, index) => ({
        __typename: 'Skeleton',
        internalId: index,
      }))
    }
    return res.data?.vehicleMileageDetails?.data ?? []
  }, [res.data, res.loading])

  // Calculate highest mileage
  const highestMileage = useMemo(() => {
    return data.reduce((acc, item) => {
      if (
        item.__typename === 'VehicleMileageDetail' &&
        typeof item.mileage === 'string'
      ) {
        const m = parseInt(item.mileage, 10)
        if (m > acc) {
          return m
        }
      }
      return acc
    }, 0)
  }, [data])

  // Editable Flags
  const isFormEditable = !!res.data?.vehicleMileageDetails?.editing
  const canRegisterMileage =
    !!res.data?.vehicleMileageDetails?.canRegisterMileage
  const canUserRegisterVehicleMileage =
    !!res.data?.vehicleMileageDetails?.canUserRegisterVehicleMileage

  const vehicle = useMemo(() => {
    return {
      type:
        title?.type ??
        `${info.data?.vehiclesDetail?.basicInfo?.model} ${info.data?.vehiclesDetail?.basicInfo?.subModel}`,
      year: title?.year ?? info.data?.vehiclesDetail?.basicInfo?.year,
      color: title?.color ?? info.data?.vehiclesDetail?.registrationInfo?.color,
    }
  }, [info.data, title])

  const parseMileage = useCallback(
    (value?: string, allowLower?: boolean) => {
      const mileage = Number(String(value ?? '').replace(/\D/g, ''))
      if (mileage <= highestMileage && !allowLower) {
        Alert.alert(
          intl.formatMessage({ id: 'vehicle.mileage.errorTitle' }),
          intl.formatMessage({ id: 'vehicle.mileage.errorMileageInputTooLow' }),
        )
        return false
      } else if (mileage > 9999999) {
        Alert.alert(
          intl.formatMessage({ id: 'vehicle.mileage.errorTitle' }),
          intl.formatMessage({
            id: 'vehicle.mileage.errorMileageInputTooHigh',
          }),
        )
        return false
      }
      return String(mileage)
    },
    [highestMileage, intl],
  )

  const onSubmit = useCallback(() => {
    const mileage = parseMileage(input)
    if (!mileage) {
      return
    }
    return postMileage({
      variables: {
        input: {
          mileage,
          originCode: 'ISLAND.IS',
          permno: id,
        },
      },
    }).then((res) => {
      if (res.data?.vehicleMileagePost?.mileage !== String(mileage)) {
        Alert.alert(
          intl.formatMessage({ id: 'vehicle.mileage.errorTitle' }),
          intl.formatMessage({ id: 'vehicle.mileage.errorFailedToUpdate' }),
        )
      } else {
        Alert.alert(
          intl.formatMessage({ id: 'vehicle.mileage.successTitle' }),
          intl.formatMessage({ id: 'vehicle.mileage.successMessage' }),
        )
      }
    })
  }, [id, input, parseMileage, postMileage, intl])

  const onEdit = useCallback(() => {
    return Alert.prompt(
      intl.formatMessage({ id: 'vehicle.mileage.promptEditTitle' }),
      undefined,
      [
        {
          isPreferred: true,
          onPress(value) {
            const mileage = parseMileage(value, true)
            const internalId = data[0].internalId
            if (!mileage) {
              return
            }
            if (!internalId) {
              return Alert.alert(
                intl.formatMessage({ id: 'vehicle.mileage.errorTitle' }),
                intl.formatMessage({
                  id: 'vehicle.mileage.errorFailedToUpdate',
                }),
              )
            }
            updateMileage({
              variables: {
                input: {
                  mileage: mileage.toString(),
                  permno: id,
                  internalId: Number(internalId),
                },
              },
            }).then((res) => {
              if (res.data?.vehicleMileagePut?.mileage !== String(mileage)) {
                Alert.alert(
                  intl.formatMessage({ id: 'vehicle.mileage.errorTitle' }),
                  intl.formatMessage({
                    id: 'vehicle.mileage.errorFailedToUpdate',
                  }),
                )
              } else {
                Alert.alert(
                  intl.formatMessage({ id: 'vehicle.mileage.successTitle' }),
                  intl.formatMessage({ id: 'vehicle.mileage.successMessage' }),
                )
              }
            })
          },
          text: intl.formatMessage({ id: 'vehicle.mileage.promptEditButton' }),
          style: 'default',
        },
        {
          text: intl.formatMessage({
            id: 'vehicle.mileage.promptCancelButton',
          }),
          style: 'cancel',
        },
      ],
      'plain-text',
      String(highestMileage),
      'number-pad',
    )
  }, [data, highestMileage, id, parseMileage, updateMileage, intl])

  return (
    <>
      <NavigationBarSheet
        componentId={componentId}
        title={
          <View
            style={{ flexDirection: 'column', marginTop: 8, marginBottom: 16 }}
          >
            <Typography variant="heading4">{vehicle.type}</Typography>
            <Typography variant="body">
              {vehicle.color} - {id}
            </Typography>
          </View>
        }
        onClosePress={() => Navigation.dismissModal(componentId)}
        style={{ marginHorizontal: 16 }}
        showLoading={res.loading && !!res.data}
      />
      <FlatList
        data={data}
        renderItem={({ item, index }) =>
          item.__typename === 'Skeleton' ? (
            <MileageCell skeleton />
          ) : (
            <MileageCell
              title={
                originCodes[item.originCode as keyof typeof originCodes] ??
                item.originCode
              }
              subtitle={
                item.readDate ? <FormattedDate value={item.readDate} /> : '-'
              }
              accessory={
                item.mileage
                  ? `${intl.formatNumber(parseInt(item.mileage, 10))} km`
                  : '-'
              }
              editable={isFormEditable && index === 0}
              onPress={onEdit}
            />
          )
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        keyExtractor={(item, index) => String(item.internalId ?? index)}
        ListHeaderComponent={
          <View key="list-header">
            <View style={{ flexDirection: 'column', gap: 16 }}>
              <TextField
                editable={canRegisterMileage}
                key="mileage-input"
                placeholder={intl.formatMessage({
                  id: 'vehicle.mileage.inputPlaceholder',
                })}
                placeholderTextColor={dynamicColor({
                  light: '#999999',
                  dark: '#999999',
                })}
                label={intl.formatMessage({ id: 'vehicle.mileage.inputLabel' })}
                value={input}
                maxLength={9}
                keyboardType="decimal-pad"
                onChange={(value) =>
                  setInput(
                    value.length
                      ? Intl.NumberFormat('is-IS').format(
                          Math.max(
                            0,
                            Math.min(9999999, Number(value.replace(/\D/g, ''))),
                          ),
                        )
                      : value,
                  )
                }
              />
              <Button
                title={intl.formatMessage({
                  id: 'vehicle.mileage.inputSubmitButton',
                })}
                onPress={onSubmit}
                disabled={!canRegisterMileage}
              />
            </View>
            <View>
              {!canRegisterMileage && (
                <Typography
                  variant="body3"
                  textAlign="center"
                  style={{ marginTop: 16 }}
                >
                  {!canUserRegisterVehicleMileage
                    ? intl.formatMessage({
                        id: 'vehicle.mileage.youAreNotAllowedCopy',
                      })
                    : intl.formatMessage({
                        id: 'vehicle.mileage.registerIntervalCopy',
                      })}
                </Typography>
              )}
              <Button
                icon={externalLinkIcon}
                title={intl.formatMessage({
                  id: 'vehicle.mileage.moreInformationCopy',
                })}
                onPress={() =>
                  openBrowser(
                    'https://island.is/flokkur/akstur-og-bifreidar',
                    componentId,
                  )
                }
                isTransparent
                textStyle={{ fontSize: 12, lineHeight: 16 }}
              />
            </View>
            <Divider style={{ marginLeft: 0, marginRight: 0 }} />
            <Typography
              variant="heading4"
              style={{ marginTop: 16, marginBottom: 16 }}
            >
              {intl.formatMessage({ id: 'vehicle.mileage.historyTitle' })}
            </Typography>
          </View>
        }
        style={{ flex: 1, margin: 16, marginTop: 0 }}
      />
    </>
  )
}

VehicleMileageScreen.options = getNavigationOptions()
