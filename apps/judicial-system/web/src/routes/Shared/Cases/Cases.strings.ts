import { defineMessage, defineMessages } from 'react-intl'

export const cases = {
  createCaseButton: defineMessage({
    id: 'judicial.system.core:cases.create_case_button',
    defaultMessage: 'Stofna nýtt mál',
    description:
      'Notaður sem titill á takka sem notandi getur ýtt á til að stofna nýtt mál',
  }),
  filter: defineMessages({
    label: {
      id: 'judicial.system.core:cases.filter.label',
      defaultMessage: 'Málategund',
      description:
        'Notaður sem label á filter sem notandi getur notað til að sía mál',
    },
  }),
  activeRequests: {
    table: {
      headers: defineMessages({
        type: {
          id: 'judicial.system.core:cases.active_requests.table.headers.type',
          defaultMessage: 'Tegund',
          description:
            'Notaður sem titill fyrir tegund dálk í lista yfir mál í vinnslu.',
        },
        date: {
          id: 'judicial.system.core:cases.active_requests.table.headers.date',
          defaultMessage: 'Stofnað/Fyrirtaka',
          description:
            'Notaður sem titill fyrir dagsetningardálk í lista yfir óafgreidd mál í vinnslu.',
        },
        created: {
          id: 'judicial.system.core:cases.active_requests.table.headers.created',
          defaultMessage: 'Stofnað',
          description:
            'Notaður sem titill fyrir dagsetningu í lista yfir óafgreidd mál í vinnslu.',
        },
        prosecutor: {
          id: 'judicial.system.core:cases.active_requests.table.headers.prosecutor',
          defaultMessage: 'Sækjandi',
          description: 'Notaður sem titill fyrir sækjanda í málalista.',
        },
      }),
    },
    title: defineMessage({
      id: 'judicial.system.core:cases.active_requests.title',
      defaultMessage: 'Mál í vinnslu',
      description: 'Notaður sem titill í fyrsta málalista á heimaskjá.',
    }),
    infoContainerTitle: defineMessage({
      id: 'judicial.system.core:cases.active_requests.info_container_title',
      defaultMessage: 'Engin mál í vinnslu.',
      description:
        'Notaður sem titill í upplýsingasvæði sem segir að engin virk mál fundust á heimaskjá.',
    }),
    infoContainerText: defineMessage({
      id: 'judicial.system.core:cases.active_requests.info_container_text',
      defaultMessage: 'Öll mál hafa verið afgreidd.',
      description:
        'Notaður sem texti í upplýsingasvæði sem segir að engin virk mál fundust á heimaskjá fangelsisstarfsmanna.',
    }),
    prisonStaffUsers: defineMessages({
      title: {
        id: 'judicial.system.core:cases.active_requests.prison_staff_users.title',
        defaultMessage: 'Virkt gæsluvarðhald',
        description:
          'Notaður sem titill í fyrsta málalista á heimaskjá fangelsisstarfsmanna.',
      },
      prisonAdminTitle: {
        id: 'judicial.system.core:cases.active_requests.prison_staff_users.prison_admin_title',
        defaultMessage: 'Virkt gæsluvarðhald og farbann',
        description: 'Notaður sem titill í fyrsta málalista á heimaskjá FMST.',
      },
      infoContainerTitle: {
        id: 'judicial.system.core:cases.active_requests.prison_staff_users.info_container_title',
        defaultMessage: 'Engin mál fundust.',
        description:
          'Notaður sem titill í upplýsingasvæði sem segir að engin mál fundust á heimaskjá fangelsisstarfsmanna.',
      },
      infoContainerText: {
        id: 'judicial.system.core:cases.active_requests.prison_staff_users.info_container_text',
        defaultMessage: 'Engar samþykktar kröfur fundust.',
        description:
          'Notaður sem texti í upplýsingasvæði sem segir að engin mál fundust á heimaskjá fangelsisstarfsmanna.',
      },
    }),
    deleteCaseModal: defineMessages({
      title: {
        id: 'judicial.system.core:cases.active_requests.delete_case_modal.title',
        defaultMessage: 'Afturkalla mál',
        description: 'Notaður sem titill í Afturkalla mál modal.',
      },
      text: {
        id: 'judicial.system.core:cases.active_requests.delete_case_modal.text',
        defaultMessage: 'Ertu viss um að þú viljir afturkalla þetta mál?',
        description: 'Notaður sem texti í Afturkalla mál modal.',
      },
      primaryButtonText: {
        id: 'judicial.system.core:cases.active_requests.delete_case_modal.primary_button_text',
        defaultMessage: 'Afturkalla',
        description:
          'Notaður sem texti á Afturkalla mál takka í Afturkalla mál.',
      },
      secondaryButtonText: {
        id: 'judicial.system.core:cases.active_requests.delete_case_modal.secondary_button_text',
        defaultMessage: 'Hætta við',
        description: 'Notaður sem texti á Halda áfram takka í Afturkalla mál.',
      },
    }),
  },
  pastRequests: {
    table: {
      headers: defineMessages({
        caseNumber: {
          id: 'judicial.system.core:cases.past_requests.table.headers.case_number',
          defaultMessage: 'Málsnr.',
          description:
            'Notaður sem titill fyrir málsnúmer dálk í lista yfir afgreidd mál.',
        },
        type: {
          id: 'judicial.system.core:cases.past_requests.table.headers.type',
          defaultMessage: 'Tegund',
          description:
            'Notaður sem titill fyrir tegund dálk í lista yfir afgreidd mál.',
        },
        state: {
          id: 'judicial.system.core:cases.past_requests.table.headers.state',
          defaultMessage: 'Staða',
          description:
            'Notaður sem titill fyrir staða dálk í lista yfir afgreidd mál.',
        },
      }),
    },
    infoContainerTitle: defineMessage({
      id: 'judicial.system.core:cases.past_requests.info_container_title',
      defaultMessage: 'Engin mál hafa verið afgreidd.',
      description:
        'Notaður sem titill í upplýsingasvæði sem segir að engin afgreidd mál fundust á heimaskjá.',
    }),
    infoContainerText: defineMessage({
      id: 'judicial.system.core:cases.past_requests.info_container_text',
      defaultMessage: 'Öll mál eru í vinnslu.',
      description:
        'Notaður sem texti í upplýsingasvæði sem segir að engin afgreidd mál fundust á heimaskjá.',
    }),
    courtOfAppealsUsers: defineMessages({
      title: {
        id: 'judicial.system.core:cases.past_requests.court_of_appeals_users.title',
        defaultMessage: 'Kærðir úrskurðir',
        description:
          'Notaður sem titill í seinni málalista á heimaskjá landsréttarnotanda.',
      },
    }),
    prisonStaffUsers: defineMessages({
      title: {
        id: 'judicial.system.core:cases.past_requests.prison_staff_users.title',
        defaultMessage: 'Lokið gæsluvarðhald',
        description:
          'Notaður sem titill í seinni málalista á heimaskjá fangelsisstarfsmanna.',
      },
      prisonAdminTitle: {
        id: 'judicial.system.core:cases.past_requests.prison_staff_users.prison_admin_title',
        defaultMessage: 'Lokið gæsluvarðhald og farbann',
        description: 'Notaður sem titill í seinni málalista á heimaskjá FMST.',
      },
    }),
  },
}
