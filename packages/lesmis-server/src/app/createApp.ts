/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import { LesmisSessionModel } from '../models';
import {
  OrchestratorApiBuilder,
  handleWith,
  useForwardUnhandledRequests,
} from '@tupaia/server-boilerplate';
import {
  DashboardRoute,
  EntityRoute,
  EntitiesRoute,
  MapOverlaysRoute,
  RegisterRoute,
  ReportRoute,
  UserRoute,
  ApproveSurveyResponse,
} from '../routes';
import { attachSession } from '../session';
import { hasLesmisAccess } from '../utils';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

/**
 * Set up express server with middleware,
 */
export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase())
    .useSessionModel(LesmisSessionModel)
    .useAttachSession(attachSession)
    .verifyLogin(hasLesmisAccess)
    .get('/v1/dashboard/:entityCode', handleWith(DashboardRoute))
    .get('/v1/user', handleWith(UserRoute))
    .get('/v1/entities/:entityCode', handleWith(EntitiesRoute))
    .get('/v1/map-overlays/:entityCode', handleWith(MapOverlaysRoute))
    .get('/v1/entity/:entityCode', handleWith(EntityRoute))
    .get('/v1/report/:entityCode/:reportCode', handleWith(ReportRoute))
    .post('/v1/register', handleWith(RegisterRoute))
    .post('/v1/approveSurveyResponse/:id', handleWith(ApproveSurveyResponse))
    .post('/v1/report/:entityCode/:reportCode', handleWith(ReportRoute))
    .build();

  // Forward any unhandled request to meditrak-server
  useForwardUnhandledRequests(app, MEDITRAK_API_URL, '/admin', attachSession);

  return app;
}
