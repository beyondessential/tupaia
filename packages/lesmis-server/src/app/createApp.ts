/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { OrchestratorApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { LesmisSessionModel } from '../models';
import {
  UserRoute,
  ReportRoute,
  EntityRequest,
  EntityRoute,
  EntitiesRoute,
  MeasuresRoute,
} from '../routes';
import { attachSession } from '../session';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  return new OrchestratorApiBuilder(new TupaiaDatabase())
    .useSessionModel(LesmisSessionModel)
    .useAttachSession(attachSession)
    .get('/v1/user', handleWith(UserRoute))
    .get('/v1/entities', handleWith(EntitiesRoute))
    .get('/v1/measures/:entityCode', handleWith(MeasuresRoute))
    .get<EntityRequest>('/v1/entity/:entityCode', handleWith(EntityRoute))
    .get('/v1/reportData/:entityCode/:reportCode', handleWith(ReportRoute))
    .build();
}
