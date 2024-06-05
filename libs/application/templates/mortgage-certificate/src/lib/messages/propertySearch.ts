import { defineMessages } from 'react-intl'
import { PropertyTypes } from '../constants'

export const propertySearch = {
  general: defineMessages({
    sectionTitle: {
      id: 'mc.application:propertySearch.general.sectionTitle',
      defaultMessage: 'Eignaleit',
      description: 'Property search section title',
    },
    pageTitle: {
      id: 'mc.application:propertySearch.general.pageTitle',
      defaultMessage: 'Eignaleit',
      description: 'Property search page title',
    },
    description: {
      id: 'mc.application:propertySearch.general.description',
      defaultMessage:
        'Hér getur þú leitað að fasteignum, skipum og ökutækjum. Athugaðu að þú getur sótt vottorð fyrir allt að tíu eignir í senn.',
      description: 'Property search description',
    },
  }),
  labels: defineMessages({
    selectLabel: {
      id: 'mc.application:propertySearch.labels.selectLabel',
      defaultMessage: 'Veldu tegund eignar',
      description: 'Property search select label',
    },
    selectPlaceholder: {
      id: 'mc.application:propertySearch.labels.selectPlaceholder',
      defaultMessage: 'Veldu tegund: Fasteign, skip, ökutæki, lausafé... ',
      description: 'Property search select placeholder',
    },
    searchLabel: {
      id: 'mc.application:propertySearch.labels.searchLabel',
      defaultMessage: 'Leitaðu að eignum',
      description: 'Property search search label',
    },
    searchPlaceholder: {
      id: 'mc.application:propertySearch.labels.searchPlaceholder',
      defaultMessage:
        'Leitaðu að eignum (fastanúmer, landnúmer, skipanúmer...)',
      description: 'Property search search placeholder',
    },
    propertyNotFound: {
      id: 'mc.application:propertySearch.labels.propertyNotFound',
      defaultMessage: 'Eign með þessu númeri fannst ekki.',
      description: 'Property not found alert message',
    },
  }),
  propertyTypes: defineMessages({
    [PropertyTypes.REAL_ESTATE]: {
      id: 'mc.application:propertySearch.propertyTypes.realEstate',
      defaultMessage: 'Fasteign',
      description: 'Property type real estate',
    },
    [PropertyTypes.VEHICLE]: {
      id: 'mc.application:propertySearch.propertyTypes.vehicle',
      defaultMessage: 'Ökutæki',
      description: 'Property search vehicle',
    },
    [PropertyTypes.SHIP]: {
      id: 'mc.application:propertySearch.propertyTypes.ship',
      defaultMessage: 'Skip',
      description: 'Property search ship',
    },
  }),
}
