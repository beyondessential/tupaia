/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  handleWith,
  useForwardUnhandledRequests,
} from '@tupaia/server-boilerplate';
import { LesmisSessionModel } from '../models';
import {
  DashboardRoute,
  EntityRoute,
  EntitiesRoute,
  MapOverlaysRoute,
  RegisterRoute,
  ReportRoute,
  UserRoute,
  VerifyEmailRoute,
  UpdateSurveyResponseRoute,
} from '../routes';
import { attachSession } from '../session';
import { hasLesmisAccess } from '../utils';
import { DashboardRequest } from '../routes/DashboardRoute';
import { UserRequest } from '../routes/UserRoute';
import { EntitiesRequest } from '../routes/EntitiesRoute';
import { MapOverlaysRequest } from '../routes/MapOverlaysRoute';
import { EntityRequest } from '../routes/EntityRoute';
import { ReportRequest } from '../routes/ReportRoute';
import { VerifyEmailRequest } from '../routes/VerifyEmailRoute';
import { RegisterRequest } from '../routes/RegisterRoute';
import { UpdateSurveyResponseRequest } from '../routes/UpdateSurveyResponseRoute';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/**
 * Set up express server with middleware,
 */
export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase())
    .useSessionModel(LesmisSessionModel)
    .useAttachSession(attachSession)
    .verifyLogin(hasLesmisAccess)
    .useTranslation(['en', 'lo'], path.join(__dirname, '../../locales'), 'locale')

    /**
     * GET
     */
    .get<DashboardRequest>('/v1/dashboard/:entityCode', handleWith(DashboardRoute))
    .get<UserRequest>('/v1/user', handleWith(UserRoute))
    .get<EntitiesRequest>('/v1/entities/:entityCode', handleWith(EntitiesRoute))
    .get<MapOverlaysRequest>('/v1/map-overlays/:entityCode', handleWith(MapOverlaysRoute))
    .get<EntityRequest>('/v1/entity/:entityCode', handleWith(EntityRoute))
    .get<ReportRequest>('/v1/report/:entityCode/:reportCode', handleWith(ReportRoute))
    .get<VerifyEmailRequest>('/v1/verify/:emailToken', handleWith(VerifyEmailRoute))

    /**
     * POST
     */

    .post<RegisterRequest>('/v1/register', handleWith(RegisterRoute))
    .post<ReportRequest>('/v1/report/:entityCode/:reportCode', handleWith(ReportRoute))

    /**
     * PUT
     */
    .put<UpdateSurveyResponseRequest>('/v1/survey-response/:id', handleWith(UpdateSurveyResponseRoute))

    .build();

  // Forward any unhandled request to meditrak-server
  useForwardUnhandledRequests(app, MEDITRAK_API_URL, '/admin', attachSession);

  return app;
}
