import {
  Query,
  Resolver,
  Context,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { Inject, UseGuards, UseInterceptors } from '@nestjs/common'

import { LOGGER_PROVIDER } from '@island.is/logging'
import type { Logger } from '@island.is/logging'
import {
  AuditedAction,
  AuditTrailService,
} from '@island.is/judicial-system/audit-trail'
//import type { Application } from '@island.is/university-gateway-types'
import {
  CurrentGraphQlUser,
  JwtGraphQlAuthGuard,
} from '@island.is/judicial-system/auth'

import { BackendApi } from '../../data-sources'
import { Course } from './models/course.model'

@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => Course)
export class CourseResolver {
  constructor(
    @Inject(LOGGER_PROVIDER)
    private readonly logger: Logger,
  ) { }
}
