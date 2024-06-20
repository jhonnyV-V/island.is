import { Button, Typography, NavigationBarSheet } from '@ui'
import React, { useEffect, useState } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import {
  View,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import styled, { useTheme } from 'styled-components/native'
import {
  Navigation,
  NavigationFunctionComponent,
} from 'react-native-navigation'
import { createNavigationOptionHooks } from '../../hooks/create-navigation-option-hooks'
import logo from '../../assets/logo/logo-64w.png'
import illustrationSrc from '../../assets/illustrations/digital-services-m1.png'
import { openNativeBrowser } from '../../lib/rn-island'
import { preferencesStore } from '../../stores/preferences-store'
import { useRegisterPasskey } from '../../lib/passkeys/useRegisterPasskey'
import { useAuthenticatePasskey } from '../../lib/passkeys/useAuthenticatePasskey'
import { authStore } from '../../stores/auth-store'
import { useBrowser } from '../../lib/useBrowser'
import { addPasskeyAsLoginHint } from '../../lib/passkeys/helpers'

const Text = styled.View`
  margin-horizontal: ${({ theme }) => theme.spacing[7]}px;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[5]}px;
  margin-top: ${({ theme }) => theme.spacing[5]}px;
`

const LoadingOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;

  background-color: #000;
  opacity: ${({ theme }) => (theme.isDark ? 0.6 : 0.4)};
  width: 100%;
  height: 100%;
`

const { getNavigationOptions, useNavigationOptions } =
  createNavigationOptionHooks(() => ({
    topBar: {
      visible: false,
    },
  }))

export const PasskeyScreen: NavigationFunctionComponent<{
  url?: string
  parentComponentId?: string
}> = ({ componentId, url, parentComponentId }) => {
  useNavigationOptions(componentId)
  const intl = useIntl()
  const theme = useTheme()
  const { openBrowser } = useBrowser()
  const [isLoading, setIsLoading] = useState(false)

  const { registerPasskey } = useRegisterPasskey()
  const { authenticatePasskey } = useAuthenticatePasskey()

  useEffect(() => {
    preferencesStore.setState({
      hasOnboardedPasskeys: true,
    })
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <NavigationBarSheet
        componentId={componentId}
        title={''}
        onClosePress={() => Navigation.dismissModal(componentId)}
        style={{ marginHorizontal: 16 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Image
            source={logo}
            resizeMode="contain"
            style={{ width: 45, height: 45 }}
          />
          <Text>
            <Typography
              variant={'heading2'}
              style={{
                paddingHorizontal: theme.spacing[2],
                marginBottom: theme.spacing[2],
              }}
              textAlign="center"
            >
              <FormattedMessage
                id="passkeys.headingTitle"
                defaultMessage="Innskrá með Ísland.is appinu"
              />
            </Typography>
            <Typography textAlign="center">
              <FormattedMessage
                id={
                  url
                    ? 'passkeys.openUrlHeadingSubtitle'
                    : 'passkeys.headingSubtitle'
                }
                defaultMessage={
                  url
                    ? 'Þú ert að fara að opna Ísland.is í vafra. Viltu búa til aðgangslykil til að skrá þig inn sjálfkrafa með appinu?'
                    : 'Viltu búa til aðgangslykil til að skrá þig inn sjálfkrafa með appinu?'
                }
              />
            </Typography>
          </Text>
          <Image
            source={illustrationSrc}
            style={{ width: 195, height: 223 }}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            paddingHorizontal: theme.spacing[2],
            paddingVertical: theme.spacing[4],
          }}
        >
          <Button
            title={intl.formatMessage({
              id: 'passkeys.createButton',
              defaultMessage: 'Búa til aðgangslykil',
            })}
            onPress={async () => {
              try {
                setIsLoading(true)
                // Don't show lockscreen behind native passkey modals
                authStore.setState(() => ({
                  noLockScreenUntilNextAppStateActive: true,
                }))

                const registered = await registerPasskey()

                if (!registered) {
                  setIsLoading(false)
                }

                // If we don't get url we are only registering, close modal after registering
                if (registered && !url) {
                  setIsLoading(false)
                  Navigation.dismissModal(componentId)
                }

                if (registered && url) {
                  // Don't show lockscreen behind native passkey modals
                  authStore.setState(() => ({
                    noLockScreenUntilNextAppStateActive: true,
                  }))

                  const passkey = await authenticatePasskey()

                  if (passkey) {
                    setIsLoading(false)
                    Navigation.dismissModal(componentId)
                    const urlWithLoginHint = addPasskeyAsLoginHint(url, passkey)
                    urlWithLoginHint && openNativeBrowser(urlWithLoginHint)
                  }
                  setIsLoading(false)
                }
              } catch (error) {
                setIsLoading(false)
                if (
                  error instanceof Error &&
                  error.message.startsWith('Register')
                ) {
                  // If register errors we show an alert and stay on the screen
                  Alert.alert(
                    intl.formatMessage({ id: 'passkeys.errorRegistering' }),
                    intl.formatMessage({
                      id: 'passkeys.errorRegisteringMessage',
                    }),
                  )
                  return
                }

                // If authenticate fails we fail silently - close the modal and open the browser
                Navigation.dismissModal(componentId)
                url && openNativeBrowser(url, parentComponentId)
              }
            }}
            style={{ marginBottom: theme.spacing[1] }}
          />
          <Button
            isOutlined
            title={intl.formatMessage({
              id: 'passkeys.skipButton',
              defaultMessage: 'Sleppa',
            })}
            onPress={() => {
              Navigation.dismissModal(componentId)
              url && openBrowser(url, parentComponentId)
            }}
          />
        </View>
      </SafeAreaView>
      {isLoading && (
        <LoadingOverlay>
          <ActivityIndicator
            size="large"
            color={theme.color.white}
            style={{ marginTop: theme.spacing[4] }}
          />
        </LoadingOverlay>
      )}
    </View>
  )
}

PasskeyScreen.options = getNavigationOptions
