import { boostChatPanelEndpoints } from './BoostChatPanel/config'

export interface BoostChatPanelProps {
  endpoint: keyof typeof boostChatPanelEndpoints
  pushUp?: boolean
}

export interface LiveChatIncChatPanelProps {
  license: number
  version: string
  group?: number
}

export interface WatsonChatPanelProps {
  // The region your integration is hosted in.
  region: string

  integrationID: WatsonIntegration
  serviceInstanceID: WatsonServiceInstance
  version?: string
  carbonTheme?: string

  // What key in the 'ChatPanels' UI Configuration in Contentful stores the language pack for this chat bot
  namespaceKey?: 'default' | 'ukrainian-citizens' | 'skatturinn'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLoad?: (instance: any) => void

  // Whether the default launcher is shown
  showLauncher?: boolean

  // If don't use the default launcher that IBM Watson provides, should the chat bubble launcher be pushed up?
  pushUp?: boolean
}

export type WatsonIntegration =
  // Askur
  | 'b1a80e76-da12-4333-8872-936b08246eaa'

  // Askur syslumenn
  | '0c96e8fb-d4dc-420e-97db-18b0f8bb4e3f'

  // Askur - english
  | '2e32cba8-7379-44e9-b03e-af1ccdbe5982'

  // Útlendingastofnun
  | '89a03e83-5c73-4642-b5ba-cd3771ceca54'

  // Sjúkratryggingar
  | 'e625e707-c9ce-4048-802c-c12b905c28be'

  // Sjúkratryggingar - english
  | 'cba41fa0-12fb-4cb5-bd98-66a57cee42e0'

  // Askur - stofnanir
  | '9aed32e0-8009-49ef-8c26-1220ed86e250'

  // Grindavík
  | 'fd247025-59fc-4ccd-83eb-7ae960019e37'

  // Grindavík - english
  | 'e72d26ef-92eb-4e66-bdae-1f13a72a887a'

  // Skatturinn
  | '84f62b21-aa50-4d49-b413-597b6a959910'

  // Skatturinn - english
  | '98ba51da-1677-4881-a133-7ea019ae7b87'

  // Samgöngustofa
  | 'fe12e960-329c-46d5-9ae1-8bd8b8219f43'

  // Samgöngustofa - english
  | '1e649a3f-9476-4995-ba24-0e72040b0cc0'

export type WatsonServiceInstance =
  // Askur
  'bc3d8312-d862-4750-b8bf-529db282050a'
