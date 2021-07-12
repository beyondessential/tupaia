/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { OrchestratorApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { LesmisSessionModel } from '../models';
import {
  DashboardRoute,
  EntityRoute,
  EntitiesRoute,
  MapOverlaysRoute,
  RegisterRoute,
  ReportRoute,
  UserRoute,
  UsersRoute,
  UpdateUserEntityPermissionRoute,
} from '../routes';
import { attachSession } from '../session';
import { hasLesmisAccess } from '../utils';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  return new OrchestratorApiBuilder(new TupaiaDatabase())
    .useSessionModel(LesmisSessionModel)
    .useAttachSession(attachSession)
    .verifyLogin(hasLesmisAccess)
    .get('/v1/dashboard/:entityCode', handleWith(DashboardRoute))
    .get('/v1/user', handleWith(UserRoute))
    .get('/v1/users', handleWith(UsersRoute))
    .get('/v1/entities/:entityCode', handleWith(EntitiesRoute))
    .get('/v1/map-overlays/:entityCode', handleWith(MapOverlaysRoute))
    .get('/v1/entity/:entityCode', handleWith(EntityRoute))
    .get('/v1/report/:entityCode/:reportCode', handleWith(ReportRoute))
    .post('/v1/register', handleWith(RegisterRoute))
    .post('/v1/report/:entityCode/:reportCode', handleWith(ReportRoute))
    .put('/v1/userEntityPermission', handleWith(UpdateUserEntityPermissionRoute))
    .build();
}
