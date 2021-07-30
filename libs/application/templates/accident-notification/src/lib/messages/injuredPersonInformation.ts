import { defineMessages } from 'react-intl'

export const injuredPersonInformation = {
  general: defineMessages({
    sectionTitle: {
      id: 'an.application:injuredPersonInformation.general.sectionTitle',
      defaultMessage: 'Upplýsingar um þann slasaða',
      description: 'Section title for injured person information person',
    },
    heading: {
      id: 'an.application:injuredPersonInformation.general.heading',
      defaultMessage: 'Upplýsingar um þann slasaða',
      description: 'Section title for injured person information person',
    },
    description: {
      id: 'an.application:injuredPersonInformation.general.description',
      defaultMessage:
        'Ef tilkynning er sett fram fyrir hönd einhvers annars þarftu að skila inn skriflegu og undirrituðu umboði frá viðkomandi aðila og skila því inn sem fylgiskjali með tilkynningunni.',
      description: 'Description label for injured person information section.',
    },
  }),
  labels: defineMessages({
    name: {
      id: 'an.application:injuredPersonInformation.labels.name',
      defaultMessage: 'Fullt nafn',
      description: 'Full name',
    },
    nationalId: {
      id: 'an.application:injuredPersonInformation.labels.nationalId',
      defaultMessage: 'Kennitala',
      description: 'National ID',
    },
    address: {
      id: 'an.application:injuredPersonInformation.labels.address',
      defaultMessage: 'Heimili / póstfang',
      description: 'Address',
    },
    postalCode: {
      id: 'an.application:injuredPersonInformation.labels.postalCode',
      defaultMessage: 'Póstnúmer',
      description: 'Postal Code',
    },
    city: {
      id: 'an.application:injuredPersonInformation.labels.city',
      defaultMessage: 'Sveitarfélag',
      description: 'City',
    },
    email: {
      id: 'an.application:injuredPersonInformation.labels.email',
      defaultMessage: 'Netfang',
      description: 'Email',
    },
    tel: {
      id: 'an.application:injuredPersonInformation.labels.tel',
      defaultMessage: 'Símanúmer',
      description: 'Telephone number',
    },
  }),
}
