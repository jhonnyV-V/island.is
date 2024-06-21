import { Locale } from '@island.is/shared/types'

import {
  LiveChatIncChatPanelProps,
  WatsonChatPanelProps,
} from '@island.is/web/components'

export const watsonConfig: Record<
  Locale,
  Record<string, WatsonChatPanelProps>
> = {
  is: {
    // Test page for Watson chat bot
    // https://app.contentful.com/spaces/8k0h54kbe6bj/entries/3NFDdRCIe5RVnlSEbHxoTT
    '3NFDdRCIe5RVnlSEbHxoTT': {
      integrationID: 'b1a80e76-da12-4333-8872-936b08246eaa',
      region: 'eu-gb',
      serviceInstanceID: 'bc3d8312-d862-4750-b8bf-529db282050a',
      showLauncher: false,
      carbonTheme: 'g10',
      namespaceKey: 'default',
    },

    // Information for Ukrainian citizens
    // https://app.contentful.com/spaces/8k0h54kbe6bj/entries/7GtuCCd7MEZhZKe0oXcHdb
    '7GtuCCd7MEZhZKe0oXcHdb': {
      integrationID: '89a03e83-5c73-4642-b5ba-cd3771ceca54',
      region: 'eu-gb',
      serviceInstanceID: 'bc3d8312-d862-4750-b8bf-529db282050a',
      showLauncher: true,
      carbonTheme: 'g10',
      namespaceKey: 'ukrainian-citizens',
    },
  },
  en: {
    // Test page for Watson chat bot
    // https://app.contentful.com/spaces/8k0h54kbe6bj/entries/3NFDdRCIe5RVnlSEbHxoTT
    '3NFDdRCIe5RVnlSEbHxoTT': {
      integrationID: 'b1a80e76-da12-4333-8872-936b08246eaa',
      region: 'eu-gb',
      serviceInstanceID: 'bc3d8312-d862-4750-b8bf-529db282050a',
      showLauncher: false,
      carbonTheme: 'g10',
      namespaceKey: 'default',
    },

    // Information for Ukrainian citizens
    // https://app.contentful.com/spaces/8k0h54kbe6bj/entries/7GtuCCd7MEZhZKe0oXcHdb
    '7GtuCCd7MEZhZKe0oXcHdb': {
      integrationID: '89a03e83-5c73-4642-b5ba-cd3771ceca54',
      region: 'eu-gb',
      serviceInstanceID: 'bc3d8312-d862-4750-b8bf-529db282050a',
      showLauncher: true,
      carbonTheme: 'g10',
      namespaceKey: 'ukrainian-citizens',
    },
  },
}

export const liveChatIncConfig: Record<
  Locale,
  Record<string, LiveChatIncChatPanelProps>
> = {
  is: {},
  en: {},
}
