import {
  Uppbod,
  VirkarHeimagistingar,
  VirkLeyfi,
  VottordSkeyti,
  EmbaettiOgStarfsstodvar,
  Skilabod,
  SyslMottakaGognPostRequest,
  AdiliTegund,
  VedbandayfirlitReguverkiSvarSkeyti,
  SkraningaradiliDanarbusSkeyti,
  TegundAndlags,
  DanarbuUppl,
  DanarbuUpplRadstofun,
  EignirDanarbus,
  Fasteignasalar,
  Logmenn,
  Afengisleyfi,
  Taekifaerisleyfi,
  Verdbrefamidlari,
  Erfingar,
  Malsvari,
  Meistaraleyfi,
  Okutaeki,
  ThjodskraSvarSkeyti,
  ErfdafjarskatturSvar,
  DanarbuUpplErfdafjarskatt,
  EignirDanarbusErfdafjarskatt,
} from '../../gen/fetch'
import { uuid } from 'uuidv4'
import {
  AlcoholLicence,
  SyslumennAuction,
  DataUploadResponse,
  Homestay,
  OperatingLicense,
  PaginatedOperatingLicenses,
  PaginationInfo,
  SyslumennApiPaginationInfo,
  Person,
  Attachment,
  CertificateInfoResponse,
  DistrictCommissionerAgencies,
  PersonType,
  AssetName,
  EstateMember,
  EstateAsset,
  EstateRegistrant,
  RealEstateAgent,
  Lawyer,
  OperatingLicensesCSV,
  TemporaryEventLicence,
  Broker,
  Advocate,
  MasterLicence,
  VehicleRegistration,
  EstateInfo,
  AvailableSettlements,
  RegistryPerson,
  InheritanceTax,
  InheritanceReportAsset,
  InheritanceEstateMember,
  InheritanceReportInfo,
  PropertyDetail,
} from './syslumennClient.types'
const UPLOAD_DATA_SUCCESS = 'Gögn móttekin'

export const cleanPropertyNumber = (propertyNumber: string): string => {
  const firstChar = propertyNumber.charAt(0).toUpperCase()
  return firstChar === 'F' || firstChar === 'L'
    ? propertyNumber.substring(1, propertyNumber.length)
    : propertyNumber
}

export const mapDistrictCommissionersAgenciesResponse = (
  response: EmbaettiOgStarfsstodvar,
): DistrictCommissionerAgencies => {
  return {
    id: response.starfsstodID ?? '',
    name: response.nafn ?? '',
    place: response.stadur ?? '',
    address: response.adsetur ?? '',
  }
}

export const mapAllPropertiesDetailResponse = (
  response: VedbandayfirlitReguverkiSvarSkeyti,
): PropertyDetail => {
  return {
    propertyNumber: response.fastnum,
    defaultAddress: {
      display: response.heiti,
    },
    unitsOfUse: {
      unitsOfUse: [
        {
          explanation: response.notkun,
        },
      ],
    },
  }
}

export const mapCertificateInfo = (
  response: VottordSkeyti,
): CertificateInfoResponse => {
  return {
    nationalId: response.kennitala,
    expirationDate: response.gildisTimi,
    releaseDate: response.utgafudagur,
  }
}
export const mapDataUploadResponse = (
  response: Skilabod,
): DataUploadResponse => {
  return {
    success: response.skilabod === UPLOAD_DATA_SUCCESS,
    message: response.skilabod,
    id: response.audkenni,
    caseNumber: response.malsnumer,
  }
}

export const mapHomestay = (homestay: VirkarHeimagistingar): Homestay => {
  return {
    registrationNumber: homestay.skraningarnumer ?? '',
    name: homestay.heitiHeimagistingar ?? '',
    address: homestay.heimilisfang ?? '',
    manager: homestay.abyrgdarmadur ?? '',
    year: homestay.umsoknarAr ? parseInt(homestay.umsoknarAr) : undefined,
    city: homestay.sveitarfelag ?? '',
    guests: homestay.gestafjoldi,
    rooms: homestay.fjoldiHerbergja,
    propertyId: homestay.fastanumer ?? '',
    apartmentId: homestay.ibudanumer ?? '',
  }
}

export const mapSyslumennAuction = (auction: Uppbod): SyslumennAuction => ({
  office: auction.embaetti ?? '',
  location: auction.starfsstod ?? '',
  auctionType: auction.tegund ?? '',
  lotType: auction?.andlag?.trim() ?? '',
  lotName: auction.andlagHeiti ?? '',
  lotId: auction.fastanumer ?? '',
  lotItems: auction.lausafjarmunir ?? '',
  auctionDate: auction.dagsetning ? auction.dagsetning.toLocaleString() : '',
  auctionTime: auction.klukkan ?? '',
  petitioners: auction.gerdarbeidendur ?? '',
  respondent: auction.gerdartholar ?? '',
  publishText: auction.auglysingatexti ?? '',
  auctionTakesPlaceAt: auction.uppbodStadur ?? '',
})

export const mapRealEstateAgent = (agent: Fasteignasalar): RealEstateAgent => ({
  name: agent.nafn?.trim() ?? '',
  location: agent.starfsstod?.trim() ?? '',
})

export const mapLawyer = (lawyer: Logmenn): Lawyer => ({
  name: lawyer.nafn?.trim() ?? '',
  licenceType: lawyer.tegundRettinda?.trim() ?? '',
})

export const mapBroker = (broker: Verdbrefamidlari): Broker => ({
  name: broker.nafn?.trim() ?? '',
  nationalId: broker.kennitala?.trim() ?? '',
})

export const mapOperatingLicense = (
  operatingLicense: VirkLeyfi,
): OperatingLicense => ({
  id: operatingLicense.rowNum,
  issuedBy: operatingLicense.utgefidAf,
  licenseNumber: operatingLicense.leyfisnumer,
  location: operatingLicense.stadur,
  name: operatingLicense.kallast,
  street: operatingLicense.gata,
  postalCode: operatingLicense.postnumer,
  type: operatingLicense.tegund,
  type2: operatingLicense.tegund2,
  restaurantType: operatingLicense.tegundVeitingastadar,
  validFrom: operatingLicense.gildirFra,
  validTo: operatingLicense.gildirTil,
  licenseHolder: operatingLicense.leyfishafi,
  licenseResponsible: operatingLicense.abyrgdarmadur,
  category: operatingLicense.flokkur,
  outdoorLicense: operatingLicense.leyfiTilUtiveitinga,
  alcoholWeekdayLicense: operatingLicense.afgrAfgengisVirkirdagar,
  alcoholWeekendLicense: operatingLicense.afgrAfgengisAdfaranottFridaga,
  alcoholWeekdayOutdoorLicense:
    operatingLicense.afgrAfgengisVirkirdagarUtiveitingar,
  alcoholWeekendOutdoorLicense:
    operatingLicense.afgrAfgengisAdfaranottFridagaUtiveitingar,
  maximumNumberOfGuests: operatingLicense.hamarksfjoldiGesta,
  numberOfDiningGuests: operatingLicense.fjoldiGestaIVeitingum,
})

export const mapPaginationInfo = (
  paginationInfoHeaderJSON: string,
): PaginationInfo => {
  const paginationInfoFromHeader: SyslumennApiPaginationInfo = JSON.parse(
    paginationInfoHeaderJSON,
  )
  return {
    pageSize: paginationInfoFromHeader.PageSize,
    pageNumber: paginationInfoFromHeader.PageNumber,
    totalCount: paginationInfoFromHeader.TotalCount,
    totalPages: paginationInfoFromHeader.TotalPages,
    currentPage: paginationInfoFromHeader.CurrentPage,
    hasNext: paginationInfoFromHeader.HasNext,
    hasPrevious: paginationInfoFromHeader.HasPrevious,
  }
}

export const mapPaginatedOperatingLicenses = (
  searchQuery: string,
  paginationInfoHeaderJSON: string,
  results: VirkLeyfi[],
): PaginatedOperatingLicenses => ({
  paginationInfo: mapPaginationInfo(paginationInfoHeaderJSON),
  searchQuery: searchQuery,
  results: (results ?? []).map(mapOperatingLicense),
})

export const mapOperatingLicensesCSV = (
  responseStringCSV: string,
): OperatingLicensesCSV => ({
  value: responseStringCSV,
})

export const mapAlcoholLicence = (
  alcoholLicence: Afengisleyfi,
): AlcoholLicence => ({
  licenceType: alcoholLicence.tegund?.trim() ?? '',
  licenceSubType: alcoholLicence.tegundLeyfis?.trim() ?? '',
  licenseNumber: alcoholLicence.leyfisnumer?.trim() ?? '',
  issuedBy: alcoholLicence.utgefidAf?.trim() ?? '',
  year: alcoholLicence.skraningarAr
    ? parseInt(alcoholLicence.skraningarAr)
    : undefined,
  validFrom: alcoholLicence.gildirFra ? alcoholLicence.gildirFra : undefined,
  validTo: alcoholLicence.gildirTil ? alcoholLicence.gildirTil : undefined,
  licenseHolder: alcoholLicence.leyfishafi?.trim() ?? '',
  licenseResponsible: alcoholLicence.abyrgdarmadur?.trim() ?? '',
  office: alcoholLicence.embaetti?.trim() ?? '',
  location: alcoholLicence.starfsstodEmbaettis?.trim() ?? '',
})

export const mapTemporaryEventLicence = (
  temporaryEventLicence: Taekifaerisleyfi,
): TemporaryEventLicence => ({
  licenceType: temporaryEventLicence.tegund?.trim() ?? '',
  licenceSubType: temporaryEventLicence.tegundLeyfis?.trim() ?? '',
  licenseNumber: temporaryEventLicence.leyfisnumer?.trim() ?? '',
  issuedBy: temporaryEventLicence.utgefidAf?.trim() ?? '',
  year: temporaryEventLicence.skraningarAr
    ? parseInt(temporaryEventLicence.skraningarAr)
    : undefined,
  validFrom: temporaryEventLicence.gildirFra
    ? temporaryEventLicence.gildirFra
    : undefined,
  validTo: temporaryEventLicence.gildirTil
    ? temporaryEventLicence.gildirTil
    : undefined,
  licenseHolder: temporaryEventLicence.leyfishafi?.trim() ?? '',
  licenseResponsible: temporaryEventLicence.abyrgdarmadur?.trim() ?? '',
  maximumNumberOfGuests: temporaryEventLicence.hamarksfjoldi,
  estimatedNumberOfGuests: temporaryEventLicence.aaetladurFjoldi,
})

export function constructUploadDataObject(
  id: string,
  persons: Person[],
  attachments: Attachment[] | undefined,
  extraData: { [key: string]: string },
  uploadDataName: string,
  uploadDataId?: string,
): SyslMottakaGognPostRequest {
  return {
    payload: {
      audkenni: id,
      gognSkeytis: {
        audkenni: uploadDataId || uuid(),
        skeytaHeiti: uploadDataName,
        adilar: persons.map((p) => {
          return {
            id: uuid(),
            nafn: p.name,
            kennitala: p.ssn,
            simi: p.phoneNumber,
            tolvupostur: p.email,
            heimilisfang: p.homeAddress,
            postaritun: p.postalCode,
            sveitafelag: p.city,
            undirritad: p.signed,
            tegund: mapPersonEnum(p.type),
          }
        }),
        attachments: attachments?.map((attachment) => ({
          nafnSkraar: attachment.name,
          innihaldSkraar: attachment.content,
        })),

        gagnaMengi: extraData ?? {},
      },
    },
  }
}

function mapAdvocate(advocateRaw: Malsvari): Advocate {
  return {
    address: advocateRaw.heimilisfang ?? '',
    email: advocateRaw.netfang ?? '',
    name: advocateRaw.nafn ?? '',
    nationalId: advocateRaw.kennitala ?? '',
    phone: advocateRaw.simi ?? '',
  }
}

function mapPersonEnum(e: PersonType) {
  switch (e) {
    case PersonType.Plaintiff:
      return AdiliTegund.NUMBER_0
    case PersonType.CounterParty:
      return AdiliTegund.NUMBER_1
    case PersonType.Child:
      return AdiliTegund.NUMBER_2
    case PersonType.CriminalRecordApplicant:
      return AdiliTegund.NUMBER_0
    case PersonType.MortgageCertificateApplicant:
      return AdiliTegund.NUMBER_0
    case PersonType.AnnouncerOfDeathCertificate:
      return AdiliTegund.NUMBER_0
  }
}

export const mapAssetName = (
  response: VedbandayfirlitReguverkiSvarSkeyti,
): AssetName => {
  return { name: response.heiti ?? '' }
}

export const mapVehicle = (response: Okutaeki): VehicleRegistration => {
  return {
    licensePlate: response.numerOkutaekis,
    modelName: response.framleidandaGerd,
    manufacturer: response.framleidandi,
    color: response.litur,
  }
}

export const estateMemberMapper = (estateRaw: Erfingar): EstateMember => {
  return {
    name: estateRaw.nafn ?? '',
    nationalId: estateRaw.kennitala ?? '',
    relation: estateRaw.tengsl ?? 'Annað',
    advocate: estateRaw.malsvari ? mapAdvocate(estateRaw.malsvari) : undefined,
  }
}

export const assetMapper = (assetRaw: EignirDanarbus): EstateAsset => {
  return {
    description: assetRaw.lysing ?? '',
    assetNumber: assetRaw.fastanumer ?? '',
    share:
      assetRaw.eignarhlutfall !== undefined
        ? parseShare(assetRaw.eignarhlutfall)
        : 100,
  }
}

export const mapAvailableSettlements = (
  settlementRaw: DanarbuUpplRadstofun['mogulegSkipti'],
): AvailableSettlements | undefined => {
  if (settlementRaw) {
    return {
      divisionOfEstateByHeirs: settlementRaw.Einkaskipti,
      estateWithoutAssets: settlementRaw.EignalaustDanarbu,
      officialDivision: settlementRaw.OpinberSkipti,
      permitForUndividedEstate: settlementRaw.SetaiOskiptuBui,
    }
  }
  return undefined
}

export const mapEstateRegistrant = (
  syslaData: SkraningaradiliDanarbusSkeyti,
): EstateRegistrant => {
  return {
    applicantEmail: syslaData.tolvuposturSkreningaradila ?? '',
    applicantPhone: syslaData.simiSkraningaradila ?? '',
    knowledgeOfOtherWills: syslaData.vitneskjaUmAdraErfdaskra ? 'Yes' : 'No',
    districtCommissionerHasWill: syslaData.erfdaskraIVorsluSyslumanns ?? false,
    assets: syslaData.eignir
      ? syslaData.eignir
          .filter(
            (a) =>
              a.tegundAngalgs === TegundAndlags.NUMBER_0 &&
              a?.fastanumer &&
              /^[Ff]{0,1}\d{7}$|^[Ll]{0,1}\d{6}$/.test(a.fastanumer),
          )
          .map(assetMapper)
      : [],
    vehicles: syslaData.eignir
      ? syslaData.eignir
          .filter((a) => a.tegundAngalgs === TegundAndlags.NUMBER_1)
          .map(assetMapper)
      : [],
    ships: syslaData.eignir
      ? syslaData.eignir
          .filter((a) => a.tegundAngalgs === TegundAndlags.NUMBER_2)
          .map(assetMapper)
      : [],
    cash: syslaData.eignir
      ? syslaData.eignir
          .filter((a) => a.tegundAngalgs === TegundAndlags.NUMBER_3)
          .map(assetMapper)
      : [],
    flyers: syslaData.eignir
      ? syslaData.eignir
          .filter((a) => a.tegundAngalgs === TegundAndlags.NUMBER_4)
          .map(assetMapper)
      : [],
    guns: syslaData.eignir
      ? syslaData.eignir
          .filter((a) => a.tegundAngalgs === TegundAndlags.NUMBER_10)
          .map(assetMapper)
      : [],
    estateMembers: syslaData.adilarDanarbus
      ? syslaData.adilarDanarbus.map(estateMemberMapper)
      : [],
    marriageSettlement: syslaData.kaupmaili ?? false,
    office: syslaData.embaetti ?? '',
    caseNumber: syslaData.malsnumer ?? '',
    dateOfDeath: syslaData.danardagur ?? '',
    nameOfDeceased: syslaData.nafnLatins ?? '',
    nationalIdOfDeceased: syslaData.kennitalaLatins ?? '',
    ownBusinessManagement: syslaData.eiginRekstur ?? false,
    assetsAbroad: syslaData.eignirErlendis ?? false,
    occupationRightViaCondominium:
      syslaData.buseturetturVegnaKaupleiguIbuda ?? false,
    bankStockOrShares: syslaData.bankareikningarVerdbrefEdaHlutabref ?? false,
  }
}

// TODO: get updated types into the client
export const mapEstateInfo = (syslaData: DanarbuUpplRadstofun): EstateInfo => {
  return {
    assets: syslaData.eignir
      ? syslaData.eignir
          .filter(
            (a) =>
              a?.tegundAngalgs !== undefined &&
              a.tegundAngalgs === TegundAndlags.NUMBER_0 &&
              /^[Ff]{0,1}\d{7}$|^[Ll]{0,1}\d{6}$/.test(a.fastanumer ?? ''),
          )
          .map(assetMapper)
      : [],
    vehicles: syslaData.eignir
      ? syslaData.eignir
          .filter((a) => a.tegundAngalgs === TegundAndlags.NUMBER_1)
          .map(assetMapper)
      : [],
    ships: syslaData.eignir
      ? syslaData.eignir
          .filter((a) => a.tegundAngalgs === TegundAndlags.NUMBER_2)
          .map(assetMapper)
      : [],
    cash: syslaData.eignir
      ? syslaData.eignir
          .filter((a) => a.tegundAngalgs === TegundAndlags.NUMBER_3)
          .map(assetMapper)
      : [],
    flyers: syslaData.eignir
      ? syslaData.eignir
          .filter((a) => a.tegundAngalgs === TegundAndlags.NUMBER_4)
          .map(assetMapper)
      : [],
    // TODO: update once implemented in District Commissioner's backend
    guns: [],
    estateMembers: syslaData.erfingar
      ? syslaData.erfingar.map(estateMemberMapper)
      : [],
    addressOfDeceased: syslaData?.logheimili ?? '',
    caseNumber: syslaData?.malsnumer ?? '',
    dateOfDeath: syslaData?.danardagur
      ? new Date(syslaData.danardagur)
      : new Date(),
    districtCommissionerHasWill: Boolean(syslaData?.erfdaskra),
    knowledgeOfOtherWills: syslaData.erfdakraVitneskja ? 'Yes' : 'No',
    marriageSettlement: syslaData.kaupmali,
    nameOfDeceased: syslaData?.nafn ?? '',
    nationalIdOfDeceased: syslaData?.kennitala ?? '',
    availableSettlements: mapAvailableSettlements(syslaData.mogulegSkipti),
  }
}
export const mapMasterLicence = (licence: Meistaraleyfi): MasterLicence => {
  return {
    name: licence.nafn,
    dateOfPublication: licence.gildirFra,
    profession: licence.idngrein,
    office: licence.embaetti,
  }
}

export const mapDepartedToRegistryPerson = (
  departed: ThjodskraSvarSkeyti,
): RegistryPerson => {
  return {
    address: departed.heimili ?? '',
    city: departed.sveitarfelag ?? '',
    name: departed.nafn ?? '',
    nationalId: departed.kennitala ?? '',
    postalCode: departed.postaritun?.split('-')[0] ?? '',
  }
}

export const mapInheritanceTax = (
  inheritance: ErfdafjarskatturSvar,
): InheritanceTax => {
  return {
    inheritanceTax: inheritance.erfdafjarskattur,
    taxExemptionLimit: inheritance.skattfrelsismorkUpphaed,
    validFrom: inheritance.gildirFra,
  }
}

const mapInheritanceReportAsset = (
  iAsset: EignirDanarbusErfdafjarskatt,
): InheritanceReportAsset => {
  const {
    eignarhlutfall,
    fastanumer,
    fasteignamat,
    gengiVextir,
    lysing,
    upphaed,
  } = iAsset
  return {
    description: lysing ?? '',
    assetNumber: fastanumer ?? '',
    share: parseShare(eignarhlutfall) ?? 100,
    propertyValuation: fasteignamat ?? '',
    amount: upphaed ?? '',
    exchangeRateOrInterest: gengiVextir ?? '',
  }
}

const mapInheritanceReportHeirs = (
  heirs: Array<Erfingar>,
): Array<InheritanceEstateMember> => {
  return heirs.map((heir) => ({
    name: heir.nafn ?? '',
    nationalId: heir.kennitala ?? '',
    relation: heir.tengsl ?? 'Annað',
    advocate: heir.malsvari ? mapAdvocate(heir.malsvari) : undefined,
    email: heir.netfang,
    phone: heir.simi,
    relationWithApplicant: heir.tengsl,
    address: heir.heimilisfang,
  }))
}

const mapInheritanceReportAssets = (
  iAssets: DanarbuUpplErfdafjarskatt['eignir'],
) => {
  const assets: Array<InheritanceReportAsset> = []
  const vehicles: Array<InheritanceReportAsset> = []
  const ships: Array<InheritanceReportAsset> = []
  const cash: Array<InheritanceReportAsset> = []
  const flyers: Array<InheritanceReportAsset> = []
  const otherAssets: Array<InheritanceReportAsset> = []
  const stocks: Array<InheritanceReportAsset> = []
  const bankAccounts: Array<InheritanceReportAsset> = []
  const depositsAndMoney: Array<InheritanceReportAsset> = []
  const guns: Array<InheritanceReportAsset> = []
  const sharesAndClaims: Array<InheritanceReportAsset> = []
  const funeralCosts: Array<InheritanceReportAsset> = []
  const officialFees: Array<InheritanceReportAsset> = []
  const otherDebts: Array<InheritanceReportAsset> = []
  const assetsInBusiness: Array<InheritanceReportAsset> = []
  const debtsInBusiness: Array<InheritanceReportAsset> = []

  iAssets?.forEach((iAsset) => {
    const asset = mapInheritanceReportAsset(iAsset)
    switch (iAsset.tegundAngalgs) {
      case TegundAndlags.NUMBER_0:
        assets.push(asset)
        break
      case TegundAndlags.NUMBER_1:
        vehicles.push(asset)
        break
      case TegundAndlags.NUMBER_2:
        ships.push(asset)
        break
      case TegundAndlags.NUMBER_3:
        cash.push(asset)
        break
      case TegundAndlags.NUMBER_4:
        flyers.push(asset)
        break
      // NUMBER_5 represents unregistered assets so this is skipped
      case TegundAndlags.NUMBER_6:
        otherAssets.push(asset)
        break
      case TegundAndlags.NUMBER_7:
        stocks.push(asset)
        break
      case TegundAndlags.NUMBER_8:
        bankAccounts.push({
          ...asset,
          exchangeRateOrInterest: String(
            Math.round(parseShare(iAsset.gengiVextir ?? 0)),
          ),
        })
        break
      case TegundAndlags.NUMBER_9:
        depositsAndMoney.push(asset)
        break
      case TegundAndlags.NUMBER_10:
        guns.push(asset)
        break
      case TegundAndlags.NUMBER_11:
        sharesAndClaims.push(asset)
        break
      case TegundAndlags.NUMBER_12:
        funeralCosts.push(asset)
        break
      case TegundAndlags.NUMBER_13:
        officialFees.push(asset)
        break
      case TegundAndlags.NUMBER_14:
        otherDebts.push(asset)
        break
      case TegundAndlags.NUMBER_15:
        assetsInBusiness.push(asset)
        break
      case TegundAndlags.NUMBER_16:
        debtsInBusiness.push(asset)
        break
      default:
        break
    }
  })

  return {
    assets,
    vehicles,
    ships,
    cash,
    flyers,
    otherAssets,
    stocks,
    bankAccounts,
    depositsAndMoney,
    guns,
    sharesAndClaims,
    funeralCosts,
    officialFees,
    otherDebts,
    assetsInBusiness,
    debtsInBusiness,
  }
}

export const mapEstateToInheritanceReportInfo = (
  estate: DanarbuUpplErfdafjarskatt,
): InheritanceReportInfo => {
  return {
    caseNumber: estate.malsnumer,
    dateOfDeath: estate.danardagur,
    will: estate.erfdaskra,
    knowledgeOfOtherWill: estate.erfdakraVitneskja,
    settlement: estate.kaupmali,
    nameOfDeceased: estate.nafn,
    nationalId: estate.kennitala,
    addressOfDeceased: estate.logheimili,
    heirs: mapInheritanceReportHeirs(estate.erfingar ?? []),
    ...mapInheritanceReportAssets(estate.eignir),
  }
}
// This has untested behaviour if share is outside of [0, 100].
// That should be fine since it is the DC's responsibility to return
// valid percentages.
export const parseShare = (share: string | number): number => {
  return typeof share === 'string' ? parseFloat(share.replace(',', '.')) : share
}
