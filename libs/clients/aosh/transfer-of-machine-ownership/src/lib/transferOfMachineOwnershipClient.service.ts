import { Auth, AuthMiddleware, User } from '@island.is/auth-nest-tools'
import { Injectable } from '@nestjs/common'
import {
  MachineCategoryApi,
  MachineOwnerChangeApi,
  MachineSupervisorChangeApi,
  MachinesApi,
} from '../../gen/fetch/apis'
import {
  ChangeMachineOwner,
  ConfirmOwnerChange,
} from './transferOfMachineOwnershipClient.types'
import { CustomMachineApi } from './apiConfiguration'
import {
  apiChangeMachineOwnerToApiRequest,
  apiChangeMachineSupervisorToApiRequest,
  confirmChangeToApiRequest,
} from './transferOfMachineOwnershipClient.utils'
import { MachineFriendlyDto } from '../../gen/fetch/models/MachineFriendlyDto'
import { MachineHateoasDto } from '../../gen/fetch/models/MachineHateoasDto'

@Injectable()
export class TransferOfMachineOwnershipClient {
  constructor(
    private readonly machinesApi: MachinesApi,
    private readonly machineApi: CustomMachineApi,
    private readonly machineOwnerChangeApi: MachineOwnerChangeApi,
    private readonly machineCategoryApi: MachineCategoryApi,
    private readonly machineSupervisorChangeApi: MachineSupervisorChangeApi,
  ) {}

  private machinesApiWithAuth(auth: Auth) {
    return this.machinesApi.withMiddleware(new AuthMiddleware(auth))
  }

  private machineApiWithAuth(auth: Auth) {
    return this.machineApi.withMiddleware(new AuthMiddleware(auth))
  }

  private machineOwnerChangeApiWithAuth(auth: Auth) {
    return this.machineOwnerChangeApi.withMiddleware(new AuthMiddleware(auth))
  }

  private machineCategoryApiWithAuth(auth: Auth) {
    return this.machineCategoryApi.withMiddleware(new AuthMiddleware(auth))
  }

  private machineSupervisorChangeApiWithAuth(auth: Auth) {
    return this.machineSupervisorChangeApi.withMiddleware(
      new AuthMiddleware(auth),
    )
  }

  public async getMachines(auth: User): Promise<MachineFriendlyDto[]> {
    const result = await this.machinesApiWithAuth(auth).apiMachinesGet({
      onlyShowOwnedMachines: true,
    })
    return result?.value || []
  }

  public async getMachineDetail(
    auth: User,
    id: string,
  ): Promise<MachineHateoasDto> {
    return await this.machineApiWithAuth(auth).getMachine({
      id,
    })
  }

  public async isPaymentRequired(auth: Auth, regNumber: string) {
    const result = await this.machineCategoryApiWithAuth(
      auth,
    ).apiMachineCategoryGet({ registrationNumber: regNumber })

    return result.paymentRequiredForOwnerChange || false
  }

  public async initiateOwnerChangeProcess(
    auth: Auth,
    ownerChange: ChangeMachineOwner,
  ) {
    const input = apiChangeMachineOwnerToApiRequest(ownerChange)

    await this.machineOwnerChangeApiWithAuth(auth).apiMachineOwnerChangePost(
      input,
    )
  }

  public async confirmOwnerChange(
    auth: Auth,
    confirmChange: ConfirmOwnerChange,
  ) {
    const input = confirmChangeToApiRequest(
      confirmChange,
      auth.nationalId || '',
    )

    await this.machineOwnerChangeApiWithAuth(auth).apiMachineOwnerChangePut(
      input,
    )
  }

  public async changeMachineSupervisor(
    auth: Auth,
    ownerChange: ChangeMachineOwner,
  ) {
    const input = apiChangeMachineSupervisorToApiRequest(ownerChange)

    await this.machineSupervisorChangeApiWithAuth(
      auth,
    ).apiMachineSupervisorChangePost(input)
  }
}
