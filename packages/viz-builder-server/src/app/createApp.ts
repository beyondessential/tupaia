/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { NonSessionOrchestratorApiBuilder, handleWith } from '@tupaia/server-boilerplate';

import { hasBESAdminAccess } from '../utils';
import { FetchDataSourcesRoute, FetchPermissionGroupsRoute } from '../routes';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  return new NonSessionOrchestratorApiBuilder(new TupaiaDatabase())
    .useBearerAuth()
    .verifyAuth(hasBESAdminAccess)
    .get('/v1/dataSources', handleWith(FetchDataSourcesRoute))
    .get('/v1/permissionGroups', handleWith(FetchPermissionGroupsRoute))
    .build();
}
