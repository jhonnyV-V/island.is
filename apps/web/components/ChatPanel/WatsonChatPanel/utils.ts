import { Locale } from '@island.is/shared/types'
import { uuid } from 'uuidv4'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { storageFactory } from '@island.is/shared/utils'
import initApollo from '@island.is/web/graphql/client'
import {
  Query,
  QueryWatsonAssistantChatIdentityTokenArgs,
} from '@island.is/web/graphql/schema'
import { GET_WATSON_ASSISTANT_CHAT_IDENTITY_TOKEN } from '@island.is/web/screens/queries/WatsonAssistantChat'

import type { WatsonInstance } from './types'

const emailInputId = 'watson-assistant-chat-email'
const nameInputId = 'watson-assistant-chat-name'
const submitButtonId = 'watson-assistant-chat-submit-button'

const storageForSession = storageFactory(() => sessionStorage)
const storageForReturningUsers = storageFactory(() => localStorage)

type TranslationVariant = 'directorateOfImmigration'

const getTranslations = (
  namespace: Record<string, string>,
  activeLocale: Locale,
  variant: TranslationVariant,
) => {
  const introText = namespace?.[`${variant}ChatIntroText`]
  const panelTitle = namespace?.[`${variant}ChatPanelTitle`]

  const missingEmailText =
    namespace?.chatMissingEmailText ??
    (activeLocale === 'is' ? 'Netfang vantar' : 'Email missing')

  const missingNameText =
    namespace?.chatMissingNameText ??
    (activeLocale === 'is' ? 'Nafn vantar' : 'Name missing')

  const continueText =
    namespace?.chatContinue ?? (activeLocale === 'is' ? 'Áfram' : 'Continue')

  const nameText =
    namespace?.chatName ?? (activeLocale === 'is' ? 'Nafn' : 'Name')

  const emailText =
    namespace?.chatEmail ?? (activeLocale === 'is' ? 'Netfang' : 'Email')

  return {
    introText,
    panelTitle,
    missingEmailText,
    missingNameText,
    continueText,
    nameText,
    emailText,
  }
}

const getUserID = () => {
  const storageID = 'watsonChatUserID'

  let userID = storageForReturningUsers.getItem(storageID)

  if (!userID) {
    userID = uuid()
    storageForReturningUsers.setItem(storageID, userID)
  }

  return userID
}

const getUserInformation = async (
  instance: WatsonInstance,
  namespace: Record<string, string>,
  activeLocale: Locale,
  translationVariant: TranslationVariant,
  callback: (userInfo: { name: string; email: string }) => void,
) => {
  const storedName = storageForSession.getItem(nameInputId)
  const storedEmail = storageForSession.getItem(emailInputId)

  // If we have stored the user information previously we simply return that
  if (storedName && storedEmail) {
    callback({ name: storedName, email: storedEmail })
    return
  }

  // Otherwise we prompt the user to enter his information
  const customPanel = instance.customPanels.getPanel()

  const translations = getTranslations(
    namespace,
    activeLocale,
    translationVariant,
  )

  customPanel.hostElement.innerHTML = `
          <div style="padding: 16px">
            ${
              translations.introText
                ? `<p style="font-size: 14px">${translations.introText}</p><br /><br />`
                : ''
            }

            <div class="bx--form-item">
              <label for="${emailInputId}" class="bx--label">${
    translations.emailText
  } <span style="color: red">*</span></label>
              <input id="${emailInputId}" name="${emailInputId}" type="text" class="bx--text-input">
              <span id="${emailInputId}-error" style="color: red; min-height: 18px"></span>
            </div>

            <br />

            <div class="bx--form-item">
              <label for="${nameInputId}" class="bx--label">${
    translations.nameText
  } <span style="color: red">*</span></label>
              <input id="${nameInputId}" type="text" class="bx--text-input">
              <span id="${nameInputId}-error" style="color: red; min-height: 18px"></span>
            </div>

            <br />

            <div style="display: flex; justify-content: center">
              <button id="${submitButtonId}" type="button" style="display: flex; justify-content: center; border-radius: 4px; padding: 12px; background-color: #0061FF; color: white; font-size: 15px; cursor:pointer; border:none">${
    translations.continueText
  }</button>
            </div>
          </div>
        `

  customPanel.open({
    title: translations.panelTitle,
    hideBackButton: true,
  })

  const emailInput = document.getElementById(emailInputId) as HTMLInputElement
  const nameInput = document.getElementById(nameInputId) as HTMLInputElement
  const submitButton = document.getElementById(submitButtonId)

  const emailInputErrorMessage = document.getElementById(
    `${emailInputId}-error`,
  )
  const nameInputErrorMessage = document.getElementById(`${nameInputId}-error`)

  if (submitButton) {
    submitButton.onclick = () => {
      const email = emailInput?.value ?? ''
      const name = nameInput?.value ?? ''

      if (emailInputErrorMessage) {
        emailInputErrorMessage.innerText = !email
          ? translations.missingEmailText
          : ''
      }

      if (nameInputErrorMessage) {
        nameInputErrorMessage.innerText = !name
          ? translations.missingNameText
          : ''
      }

      if (!email || !name) {
        return
      }

      storageForSession.setItem(emailInputId, email)
      storageForSession.setItem(nameInputId, name)

      callback({ email, name })

      customPanel.close()
    }
  }
}

const fetchIdentityToken = async (
  apolloClient: ApolloClient<NormalizedCacheObject>,
  userID: string,
  name: string,
  email: string,
) => {
  return apolloClient.query<Query, QueryWatsonAssistantChatIdentityTokenArgs>({
    query: GET_WATSON_ASSISTANT_CHAT_IDENTITY_TOKEN,
    variables: {
      input: {
        name,
        email,
        userID,
      },
    },
  })
}

export const onAuthenticatedWatsonAssistantChatLoad = (
  instance: WatsonInstance,
  namespace: Record<string, string>,
  activeLocale: Locale,
  translationVariant: TranslationVariant,
) => {
  const apolloClient = initApollo({})

  instance.on({
    type: 'identityTokenExpired',
    handler: (event) => {
      return new Promise((resolve, reject) => {
        // Make sure we are authenticated from the start
        // Because if not then the connection will timeout in 30 seconds
        if (
          !(
            storageForSession.getItem(nameInputId) &&
            storageForSession.getItem(emailInputId)
          )
        ) {
          fetchIdentityToken(apolloClient, getUserID(), '', '')
            .then((response) => {
              const token = response.data.watsonAssistantChatIdentityToken.token
              instance.updateIdentityToken(token)
              event.identityToken = token

              resolve(token)
            })
            .catch(reject)
          return
        }

        getUserInformation(
          instance,
          namespace,
          activeLocale,
          translationVariant,
          ({ email, name }) => {
            fetchIdentityToken(apolloClient, getUserID(), name, email)
              .then((response) => {
                const token =
                  response.data.watsonAssistantChatIdentityToken.token
                instance.updateIdentityToken(token)
                event.identityToken = token
                resolve(token)
              })
              .catch(reject)
          },
        )
      })
    },
  })

  instance.on({
    type: 'window:open',
    handler: () => {
      if (
        storageForSession.getItem(nameInputId) &&
        storageForSession.getItem(emailInputId)
      ) {
        return
      }

      getUserInformation(
        instance,
        namespace,
        activeLocale,
        translationVariant,
        ({ email, name }) => {
          fetchIdentityToken(apolloClient, getUserID(), name, email).then(
            (response) => {
              const token = response.data.watsonAssistantChatIdentityToken.token
              instance.updateIdentityToken(token)
            },
          )
        },
      )
    },
  })
}
