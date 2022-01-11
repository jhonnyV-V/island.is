import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, Mutation } from '@nestjs/graphql'

import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'

import { Authorize, CurrentUser, User, Role } from '../auth'

import { VehicleOwnerModel } from './vehicleOwner.model'
import { VehicleOwnerService } from './vehicleOwner.service'

@Authorize()
@Resolver(() => VehicleOwnerModel)
export class VehicleOwnerResolver {
  constructor(
    private vehicleOwnerService: VehicleOwnerService,
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
  ) {}

  @Authorize({
    roles: [Role.developer, Role.recyclingCompany, Role.recyclingFund],
  })
  @Query(() => [VehicleOwnerModel])
  async skilavottordRecyclingPartnerVehicles(
    @Args('partnerId') partnerId: string,
  ): Promise<VehicleOwnerModel[]> {
    const res = await this.vehicleOwnerService.findRecyclingPartnerVehicles(
      partnerId,
    )
    this.logger.debug('getTEST responce:' + JSON.stringify(res, null, 2))
    return res
  }

  @Mutation(() => Boolean)
  async createSkilavottordVehicleOwner(
    @CurrentUser() user: User,
    @Args('name') name: string,
  ) {
    const vm = new VehicleOwnerModel()
    vm.nationalId = user.nationalId
    vm.personname = name

    this.logger.info(
      'create new createSkilavottordVehicleOwner...' +
        JSON.stringify(vm, null, 2),
    )
    return await this.vehicleOwnerService.create(vm)
  }
}
