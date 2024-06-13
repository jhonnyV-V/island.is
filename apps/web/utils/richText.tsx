import {
  FaqList,
  FaqListProps,
  renderConnectedComponent,
  richText,
  SectionWithImage,
  SliceType,
} from '@island.is/island-ui/contentful'
import {
  defaultRenderComponentObject,
  defaultRenderMarkObject,
  defaultRenderNodeObject,
} from '@island.is/island-ui/contentful'
import { Locale } from '@island.is/shared/types'
import {
  AccordionSlice,
  AircraftSearch,
  AlcoholLicencesList,
  BrokersList,
  CatchQuotaCalculator,
  Chart,
  ChartNumberBox,
  ChartsCard,
  ChartsCardsProps,
  DrivingInstructorList,
  EmailSignup,
  Form,
  GenericList,
  KilometerFee,
  MasterList,
  MultipleStatistics,
  OneColumnTextSlice,
  OverviewLinksSlice,
  PlateAvailableSearch,
  PowerBiSlice,
  PublicShipSearch,
  PublicVehicleSearch,
  SectionWithVideo,
  SelectedShip,
  ShipSearch,
  ShipSearchBoxedInput,
  SidebarShipSearchInput,
  SliceDropdown,
  SpecificHousingBenefitSupportCalculator,
  StraddlingStockCalculator,
  TableSlice,
  TemporaryEventLicencesList,
  TwoColumnTextSlice,
} from '@island.is/web/components'
import {
  AccordionSlice as AccordionSliceSchema,
  Chart as ChartSchema,
  ChartNumberBox as ChartNumberBoxSchema,
  ConnectedComponent,
  EmailSignup as EmailSignupSchema,
  Embed as EmbedSchema,
  FeaturedEvents as FeaturedEventsSchema,
  FeaturedSupportQnAs as FeaturedSupportQNAsSchema,
  Form as FormSchema,
  GenericList as GenericListSchema,
  MultipleStatistics as MultipleStatisticsSchema,
  OneColumnText,
  OverviewLinks as OverviewLinksSliceSchema,
  PowerBiSlice as PowerBiSliceSchema,
  SectionWithImage as SectionWithImageSchema,
  SectionWithVideo as SectionWithVideoSchema,
  Slice,
  SliceDropdown as SliceDropdownSchema,
  TableSlice as TableSliceSchema,
  TwoColumnText,
} from '@island.is/web/graphql/schema'

import AdministrationOfOccupationalSafetyAndHealthCourses from '../components/connected/AdministrationOfOccupationalSafetyAndHealthCourses/AdministrationOfOccupationalSafetyAndHealthCourses'
import { MonthlyStatistics } from '../components/connected/electronicRegistrationStatistics'
import { GrindavikResidentialPropertyPurchaseCalculator } from '../components/connected/GrindavikResidentialPropertyPurchaseCalculator'
import HousingBenefitCalculator from '../components/connected/HousingBenefitCalculator/HousingBenefitCalculator'
import { UmsCostOfLivingCalculator } from '../components/connected/UmbodsmadurSkuldara'
import FeaturedEvents from '../components/FeaturedEvents/FeaturedEvents'
import FeaturedSupportQNAs from '../components/FeaturedSupportQNAs/FeaturedSupportQNAs'
import { EmbedSlice } from '../components/Organization/Slice/EmbedSlice/EmbedSlice'

export const webRenderConnectedComponent = (
  slice: ConnectedComponent & { componentType?: string },
) => {
  const data = slice.json ?? {}

  switch (slice.componentType) {
    case 'Fiskistofa/ShipSearch':
      return <ShipSearch namespace={data} />
    case 'Fiskistofa/ShipSearchSidebarInput':
      return <SidebarShipSearchInput namespace={data} />
    case 'Fiskistofa/StraddlingStockCalculator':
      return <StraddlingStockCalculator namespace={data} />
    case 'Fiskistofa/CatchQuotaCalculator':
      return <CatchQuotaCalculator namespace={data} />
    case 'Fiskistofa/SelectedShip':
      return <SelectedShip />
    case 'ElectronicRegistrations/MonthlyStatistics':
      return <MonthlyStatistics slice={slice} />
    case 'Fiskistofa/ShipSearchBoxedInput':
      return <ShipSearchBoxedInput namespace={data} />
    case 'Áfengisleyfi/AlcoholLicences':
      return <AlcoholLicencesList slice={slice} />
    case 'Tækifærisleyfi/TemporaryEventLicences':
      return <TemporaryEventLicencesList slice={slice} />
    case 'Verðbréfamiðlarar/Brokers':
      return <BrokersList slice={slice} />
    case 'PublicVehicleSearch':
      return <PublicVehicleSearch slice={slice} />
    case 'AircraftSearch':
      return <AircraftSearch slice={slice} />
    case 'DrivingInstructorList':
      return <DrivingInstructorList slice={slice} />
    case 'PlateAvailableSearch':
      return <PlateAvailableSearch slice={slice} />
    case 'HousingBenefitCalculator':
      return <HousingBenefitCalculator slice={slice} />
    case 'PublicShipSearch':
      return <PublicShipSearch slice={slice} />
    case 'Meistaraleyfi/MasterLicences':
      return <MasterList slice={slice} />
    case 'Vinnueftirlitid/Namskeid':
      return (
        <AdministrationOfOccupationalSafetyAndHealthCourses slice={slice} />
      )
    case 'KilometerFee':
      return <KilometerFee slice={slice} />
    case 'SpecificHousingBenefitSupportCalculator':
      return <SpecificHousingBenefitSupportCalculator slice={slice} />
    case 'GrindavikResidentialPropertyPurchaseCalculator':
      return <GrindavikResidentialPropertyPurchaseCalculator slice={slice} />
    case 'Ums/CostOfLivingCalculator':
      return <UmsCostOfLivingCalculator slice={slice} />
    default:
      break
  }

  return renderConnectedComponent(slice)
}

const defaultRenderComponent = {
  PowerBiSlice: (slice: PowerBiSliceSchema) => <PowerBiSlice slice={slice} />,
  AccordionSlice: (slice: AccordionSliceSchema) =>
    slice.accordionItems && <AccordionSlice slice={slice} />,
  ConnectedComponent: (slice: ConnectedComponent) =>
    webRenderConnectedComponent(slice),
  GraphCard: (chart: ChartsCardsProps['chart']) => <ChartsCard chart={chart} />,
  OneColumnText: (slice: OneColumnText) => <OneColumnTextSlice slice={slice} />,
  TwoColumnText: (slice: TwoColumnText) => <TwoColumnTextSlice slice={slice} />,
  EmailSignup: (slice: EmailSignupSchema) => <EmailSignup slice={slice} />,
  FaqList: (slice: FaqListProps, locale?: Locale) =>
    slice?.questions && <FaqList {...slice} locale={locale} />,
  FeaturedSupportQNAs: (slice: FeaturedSupportQNAsSchema) => (
    <FeaturedSupportQNAs slice={slice} />
  ),
  SliceDropdown: (slice: SliceDropdownSchema) => (
    <SliceDropdown
      slices={slice.slices}
      sliceExtraText={slice.dropdownLabel ?? ''}
      gridSpan="1/1"
      gridOffset="0"
      slicesAreFullWidth={true}
      dropdownMarginBottom={5}
      orderOptionsAlphabetically={slice.alphabeticallyOrdered}
    />
  ),
  SectionWithVideo: (slice: SectionWithVideoSchema) => (
    <SectionWithVideo slice={slice} />
  ),
  TableSlice: (slice: TableSliceSchema) => <TableSlice slice={slice} />,
  Embed: (slice: EmbedSchema) => <EmbedSlice slice={slice} />,
  OverviewLinks: (slice: OverviewLinksSliceSchema) => (
    <OverviewLinksSlice slice={slice} />
  ),
  Chart: (slice: ChartSchema) => <Chart slice={slice} />,
  ChartNumberBox: (
    slice: ChartNumberBoxSchema & { chartNumberBoxId: string },
  ) => <ChartNumberBox slice={slice} />,
  SectionWithImage: (slice: SectionWithImageSchema) => (
    <SectionWithImage
      title={slice.title}
      content={slice.content as SliceType[]}
      image={slice.image ?? undefined}
      contain={true}
    />
  ),
  MultipleStatistics: (slice: MultipleStatisticsSchema) => (
    <MultipleStatistics slice={slice} />
  ),
  FeaturedEvents: (slice: FeaturedEventsSchema) => (
    <FeaturedEvents slice={slice} />
  ),
  Form: (slice: FormSchema) => <Form form={slice} />,
  GenericList: (slice: GenericListSchema) => (
    <GenericList
      id={slice.id}
      firstPageItemResponse={slice.firstPageListItemResponse}
      searchInputPlaceholder={slice.searchInputPlaceholder}
      itemType={slice.itemType}
    />
  ),
}

export const webRichText = (
  slices: Slice[] | SliceType[],
  options?: {
    renderComponent?: Record<string, unknown>
    renderMark?: Record<string, unknown>
    renderNode?: Record<string, unknown>
  },
  activeLocale?: Locale,
) => {
  return richText(
    slices as SliceType[],
    {
      renderComponent: {
        ...defaultRenderComponentObject,
        ...defaultRenderComponent,
        ...options?.renderComponent,
      },
      renderMark: {
        ...defaultRenderMarkObject,
        ...options?.renderMark,
      },
      renderNode: {
        ...defaultRenderNodeObject,
        ...options?.renderNode,
      },
    },
    activeLocale,
  )
}
