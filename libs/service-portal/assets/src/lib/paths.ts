export enum AssetsPaths {
  AssetsRoot = '/eignir',
  AssetsRealEstate = '/eignir/fasteignir',
  AssetsRealEstateDetail = '/eignir/fasteignir/:id',
  AssetsVehicles = '/eignir/okutaeki',
  AssetsMyVehicles = '/eignir/okutaeki/min-okutaeki',
  AssetsVehiclesDetail = '/eignir/okutaeki/min-okutaeki/:id',
  AssetsVehiclesDetailMileage = '/eignir/okutaeki/min-okutaeki/:id/kilometrastada',
  AssetsVehiclesLookup = '/eignir/okutaeki/leit',
  AssetsVehiclesHistory = '/eignir/okutaeki/okutaekjaferill',
  AssetsWorkMachines = '/eignir/vinnuvelar',
  AssetsWorkMachinesDetail = '/eignir/vinnuvelar/:regNumber/:id',
  AssetsIntellectualProperties = '/eignir/hugverkarettindi',
  AssetsIntellectualPropertiesTrademark = '/eignir/hugverkarettindi/vorumerki/:id',
  AssetsIntellectualPropertiesPatent = '/eignir/hugverkarettindi/einkaleyfi/:id',
  AssetsIntellectualPropertiesDesign = '/eignir/hugverkarettindi/honnun/:id',
}
