import { Alert, Button, Input, InputRow, NavigationBarSheet } from '@ui'
import React from 'react'
import { useIntl } from 'react-intl'
import { ScrollView, View } from 'react-native'
import {
  Navigation,
  NavigationFunctionComponent,
} from 'react-native-navigation'
import { useNationalRegistryUserQuery } from '../../graphql/types/schema'
import { createNavigationOptionHooks } from '../../hooks/create-navigation-option-hooks'
import { navigateTo } from '../../lib/deep-linking'
import { formatNationalId } from '../../lib/format-national-id'
import { usePreferencesStore } from '../../stores/preferences-store'
import { testIDs } from '../../utils/test-ids'

const { getNavigationOptions, useNavigationOptions } =
  createNavigationOptionHooks(() => ({
    topBar: {
      visible: false,
    },
  }))

export const PersonalInfoScreen: NavigationFunctionComponent = ({
  componentId,
}) => {
  useNavigationOptions(componentId)
  const intl = useIntl()
  const { dismiss, dismissed } = usePreferencesStore()
  const natRegRes = useNationalRegistryUserQuery()
  const natRegData = natRegRes?.data?.nationalRegistryUser
  const errorNatReg = !!natRegRes.error && !natRegData
  const loadingNatReg = natRegRes.loading && !natRegData

  return (
    <View style={{ flex: 1 }} testID={testIDs.SCREEN_PERSONAL_INFO}>
      <NavigationBarSheet
        componentId={componentId}
        title={intl.formatMessage({ id: 'personalInfo.screenTitle' })}
        onClosePress={() => Navigation.dismissModal(componentId)}
        style={{ marginHorizontal: 16 }}
        showLoading={natRegRes.loading}
      />
      <ScrollView style={{ flex: 1 }} testID={testIDs.USER_SCREEN_PROFILE_INFO}>
        <Alert
          type="info"
          visible={!dismissed.includes('userNatRegInformational')}
          message={intl.formatMessage({ id: 'user.natreg.infoBox' })}
          onClose={() => dismiss('userNatRegInformational')}
          hideIcon
        />
        <View style={{ height: 8 }} />
        <Input
          loading={loadingNatReg}
          error={errorNatReg}
          label={intl.formatMessage({ id: 'user.natreg.displayName' })}
          value={natRegData?.fullName}
          valueTestID={testIDs.USER_PROFILE_INFO_DISPLAY_NAME_VALUE}
        />
        <InputRow>
          <Input
            loading={loadingNatReg}
            error={errorNatReg}
            label={intl.formatMessage({ id: 'user.natreg.nationalId' })}
            value={
              !loadingNatReg && !errorNatReg && natRegData?.nationalId
                ? formatNationalId(natRegData?.nationalId)
                : undefined
            }
          />
          <Input
            loading={loadingNatReg}
            error={errorNatReg}
            label={intl.formatMessage({ id: 'user.natreg.birthPlace' })}
            value={natRegData?.birthPlace}
          />
        </InputRow>
        <Input
          loading={loadingNatReg}
          error={errorNatReg}
          label={intl.formatMessage({ id: 'user.natreg.legalResidence' })}
          value={natRegData?.legalResidence}
        />
        <InputRow>
          <Input
            loading={loadingNatReg}
            error={errorNatReg}
            label={intl.formatMessage({ id: 'user.natreg.gender' })}
            value={
              !loadingNatReg && !errorNatReg
                ? intl.formatMessage(
                    { id: 'user.natreg.genderValue' },
                    {
                      gender: natRegData?.gender ?? '',
                    },
                  )
                : undefined
            }
          />
          <Input
            loading={loadingNatReg}
            error={errorNatReg}
            label={intl.formatMessage({
              id: 'user.natreg.maritalStatus',
            })}
            value={
              !loadingNatReg && !errorNatReg
                ? intl.formatMessage(
                    { id: 'user.natreg.maritalStatusValue' },
                    {
                      gender: natRegData?.gender ?? '',
                      maritalStatus: natRegData?.maritalStatus ?? '',
                    },
                  )
                : undefined
            }
          />
        </InputRow>
        <Input
          loading={loadingNatReg}
          error={errorNatReg}
          label={intl.formatMessage({ id: 'user.natreg.citizenship' })}
          value={natRegData?.citizenship?.name}
        />
        <Input
          loading={loadingNatReg}
          error={errorNatReg}
          label={intl.formatMessage({ id: 'user.natreg.religion' })}
          value={natRegData?.religion}
        />

        <View style={{ paddingHorizontal: 16, paddingVertical: 32 }}>
          <Button
            isOutlined
            title={intl.formatMessage({
              id: 'user.natreg.settingsButton',
              defaultMessage: 'Fara í stillingar',
            })}
            onPress={() => navigateTo(`/settings`)}
          />
        </View>
      </ScrollView>
    </View>
  )
}

PersonalInfoScreen.options = getNavigationOptions
