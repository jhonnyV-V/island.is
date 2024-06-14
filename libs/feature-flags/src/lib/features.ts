export enum Features {
  testing = 'do-not-remove-for-testing-only',
  // Integrate auth-api with user-profile-api.
  userProfileClaims = 'shouldAuthApiReturnUserProfileClaims',
  shouldAuthIdsApiUseNationalRegistryV3 = 'shouldAuthIdsApiUseNationalRegistryV3',

  // Application visibility flags
  exampleApplication = 'isExampleApplicationEnabled',
  accidentNotification = 'isAccidentNotificationEnabled',
  europeanHealthInsuranceCard = 'isEuropeanHealthInsuranceCardApplicationEnabled',
  passportApplication = 'isPassportApplicationEnabled',
  passportAnnulmentApplication = 'isPassportAnnulmentApplicationEnabled',
  financialStatementInao = 'financialStatementInao',
  inheritanceReport = 'isInheritanceReportApplicationEnabled',
  transportAuthorityDigitalTachographCompanyCard = 'isTransportAuthorityDigitalTachographCompanyCardEnabled',
  transportAuthorityDigitalTachographWorkshopCard = 'isTransportAuthorityDigitalTachographWorkshopCardEnabled',
  alcoholTaxRedemption = 'isAlcoholTaxRedemptionEnabled',
  consultationPortalApplication = 'isConsultationPortalEnabled',
  childrenResidenceChangeV2 = 'isChildrenResidenceChangeV2Enabled',
  signatureListCreation = 'isSignatureListCreationEnabled',
  citizenship = 'isCitizenshipEnabled',
  energyFunds = 'isEnergyFundsEnabled',
  complaintsToAlthingiOmbudsman = 'isComplaintToAlthingiOmbudsmanEnabled',
  healthcareLicenseCertificate = 'isHealthcareLicenseCertificateEnabled',
  transferOfMachineOwnership = 'isTransferOfMachineOwnershipEnabled',
  university = 'isUniversityEnabled',
  homeSupport = 'isHomeSupportEnabled',
  ChangeMachineSupervisor = 'isChangeMachineSupervisorEnabled',
  DeregisterMachine = 'isDeregisterMachineEnabled',
  grindavikHousingBuyout = 'isGrindavikHousingBuyoutEnabled',
  RequestInspection = 'isRequestInspectionForMachineEnabled',
  officialJournalOfIceland = 'isOfficialJournalOfIcelandEnabled',
  StreetRegistration = 'isStreetRegistrationEnabled',
  HealthInsuranceDeclaration = 'isHealthInsuranceDeclarationEnabled',

  // Application System Delegations active
  applicationSystemDelegations = 'applicationSystemDelegations',

  // Service portal modules
  servicePortalPetitionsModule = 'isServicePortalPetitionsModuleEnabled',
  servicePortalConsentModule = 'isServicePortalConsentModuleEnabled',
  servicePortalSecondaryEducationPages = 'isServicePortalSecondaryEducationPageEnabled',
  servicePortalWorkMachinesModule = 'isServicePortalWorkMachinesPageEnabled',
  servicePortalSignatureCollection = 'isServicePortalSignatureCollectionEnabled',
  servicePortalVehicleMileagePageEnabled = 'isServicePortalVehicleMileagePageEnabled',
  servicePortalSocialInsurancePageEnabled = 'isServicePortalSocialInsurancePageEnabled',
  ServicePortalNotificationsEnabled = 'isServicePortalNotificationsPageEnabled',

  //Occupational License Health directorate fetch enabled
  occupationalLicensesHealthDirectorate = 'isHealthDirectorateOccupationalLicenseEnabled',

  //Occupational License Health directorate fetch enabled
  occupationalLicensesV2 = 'isOccupationalLicensesV2Enabled',

  //Possible universities
  isUniversityOfAkureyriEnabled = 'isUniversityOfAkureyriEnabled',
  isAgriculturalUniversityOfIcelandEnabled = 'isAgriculturalUniversityOfIcelandEnabled',
  isBifrostUniversityEnabled = 'isBifrostUniversityEnabled',
  isHolarUniversityEnabled = 'isHolarUniversityEnabled',
  isIcelandUniversityOfTheArtsEnabled = 'isIcelandUniversityOfTheArtsEnabled',

  //License service new drivers license client enabled
  licenseServiceDrivingLicenseClient = 'isLicenseServiceDrivingLicenceClientV2Enabled',
  licenseServiceDrivingLicencePhotoCheckDisabled = 'isLicenseServiceDrivingLicencePhotoCheckDisabled',

  //Enable intellectual properties fetch
  isIntellectualPropertyModuleEnabled = 'isIntellectualPropertyModuleEnabled',

  // Application delegation flags
  isFishingLicenceCustomDelegationEnabled = 'isFishingLicenceCustomDelegationEnabled',

  //Application system
  applicationSystemHistory = 'applicationSystemHistory',

  // Search indexer
  shouldSearchIndexerResolveNestedEntries = 'shouldSearchIndexerResolveNestedEntries',

  // Userprofile Collection
  isIASSpaPagesEnabled = 'isiasspapagesenabled',

  // Disable new login restrictions
  disableNewDeviceLogins = 'disableNewDeviceLogins',

  // Notifications
  isNotificationEmailWorkerEnabled = 'isnotificationemailworkerenabled',

  // New/updated delegation notification
  isDelegationNotificationEnabled = 'isDelegationNotificationEnabled',

  shouldSendEmailNotificationsToDelegations = 'shouldSendEmailNotificationsToDelegations',

  // Single sign on passkeys
  isPasskeyRegistrationEnabled = 'isPasskeyRegistrationEnabled',
  isPasskeyAuthEnabled = 'isPasskeyAuthEnabled',
}

export enum ServerSideFeature {
  testing = 'do-not-remove-for-testing-only',
  drivingLicense = 'driving-license-use-v1-endpoint-for-v2-comms',
}
