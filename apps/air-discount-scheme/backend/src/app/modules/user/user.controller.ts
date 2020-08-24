import { Controller, Param, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'

import { GetUserByDiscountCodeParams } from './user.validator'
import { UserService } from './user.service'
import { User } from './user.model'
import { DiscountService } from '../discount'
import { AuthGuard } from '../common'

@ApiTags('Users')
@Controller('api/public')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PublicUserController {
  constructor(
    private readonly discountService: DiscountService,
    private readonly userService: UserService,
  ) {}

  @Get('discounts/:discountCode/user')
  @ApiOkResponse({ type: User })
  async get(@Param() params: GetUserByDiscountCodeParams): Promise<User> {
    const nationalId = await this.discountService.validateDiscount(
      params.discountCode,
    )
    return this.userService.getUserInfoByNationalId(nationalId)
  }
}
