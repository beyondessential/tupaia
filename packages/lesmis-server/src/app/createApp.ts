/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { OrchestratorApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { LesmisSessionModel } from '../models';
import { UserRoute, EntityRequest, EntityRoute, EntitiesRoute } from '../routes';
import { verifyLogin } from '../auth';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  return new OrchestratorApiBuilder(new TupaiaDatabase())
    .useSessionModel(LesmisSessionModel)
    .verifyLogin(verifyLogin)
    .get('/v1/user', handleWith(UserRoute))
    .get('/v1/entities', handleWith(EntitiesRoute))
    .get<EntityRequest>('/v1/entity/:entityCode', handleWith(EntityRoute))
    .build();
}
