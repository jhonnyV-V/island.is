import {
  ApplicationFiltersEnum,
  ApplicationHeaderSortByEnum,
} from '@island.is/financial-aid/shared/lib'

export const navigationItems = [
  {
    group: 'Innhólf',
    label: 'Ný mál',
    link: `/nymal`,
    applicationState: [ApplicationFiltersEnum.NEW],
    headers: [
      { title: 'Nafn', sortBy: ApplicationHeaderSortByEnum.NAME },
      { title: 'Staða', sortBy: ApplicationHeaderSortByEnum.STATE },
      { title: 'Tími án umsjár', sortBy: ApplicationHeaderSortByEnum.MODIFIED },
      { title: 'Tímabil', sortBy: ApplicationHeaderSortByEnum.APPLIEDDATE },
      { title: 'Umsjá', sortBy: ApplicationHeaderSortByEnum.STAFF },
    ],
    defaultHeaderSort: ApplicationHeaderSortByEnum.APPLIEDDATE,
  },
  {
    group: 'Mitt',
    label: 'Mál í vinnslu',
    link: `/vinnslu`,
    applicationState: [ApplicationFiltersEnum.MYCASES],
    headers: [
      { title: 'Nafn', sortBy: ApplicationHeaderSortByEnum.NAME },
      { title: 'Staða', sortBy: ApplicationHeaderSortByEnum.STATE },
      { title: 'Síðast uppfært', sortBy: ApplicationHeaderSortByEnum.MODIFIED },
      { title: 'Tímabil', sortBy: ApplicationHeaderSortByEnum.APPLIEDDATE },
      { title: 'Unnið af', sortBy: ApplicationHeaderSortByEnum.STAFF },
    ],
    defaultHeaderSort: ApplicationHeaderSortByEnum.MODIFIED,
  },
  {
    group: 'Teymið',
    label: 'Öll mál í vinnslu',
    link: `/teymid`,
    applicationState: [
      ApplicationFiltersEnum.INPROGRESS,
      ApplicationFiltersEnum.DATANEEDED,
    ],
    headers: [
      { title: 'Nafn', sortBy: ApplicationHeaderSortByEnum.NAME },
      { title: 'Staða', sortBy: ApplicationHeaderSortByEnum.STATE },
      { title: 'Úrlausnartími', sortBy: ApplicationHeaderSortByEnum.MODIFIED },
      { title: 'Sótt um', sortBy: ApplicationHeaderSortByEnum.CREATED },
      { title: 'Unnið af', sortBy: ApplicationHeaderSortByEnum.STAFF },
    ],
    defaultHeaderSort: ApplicationHeaderSortByEnum.MODIFIED,
  },
  {
    label: 'Afgreidd mál',
    link: `/afgreidd`,
    applicationState: [
      ApplicationFiltersEnum.APPROVED,
      ApplicationFiltersEnum.REJECTED,
    ],
    headers: [
      { title: 'Nafn', sortBy: ApplicationHeaderSortByEnum.NAME },
      { title: 'Staða', sortBy: ApplicationHeaderSortByEnum.STATE },
      { title: 'Úrlausnartími', sortBy: ApplicationHeaderSortByEnum.MODIFIED },
      { title: 'Sótt um', sortBy: ApplicationHeaderSortByEnum.CREATED },
      { title: 'Unnið af', sortBy: ApplicationHeaderSortByEnum.STAFF },
    ],
    defaultHeaderSort: ApplicationHeaderSortByEnum.MODIFIED,
  },
]
