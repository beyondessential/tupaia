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
  PDFExportRoute,
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

const { CENTRAL_API_URL = 'http://localhost:8090/v2' } = process.env;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/**
 * Set up express server with middleware,
 */
export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase(), 'lesmis')
    .useSessionModel(LesmisSessionModel)
    .useAttachSession(attachSession)
    .verifyLogin(hasLesmisAccess)
    .useTranslation(['en', 'lo'], path.join(__dirname, '../../locales'), 'locale')

    /**
     * GET
     */
    .get<DashboardRequest>('dashboard/:entityCode', handleWith(DashboardRoute))
    .get<UserRequest>('user', handleWith(UserRoute))
    .get<EntitiesRequest>('entities/:entityCode', handleWith(EntitiesRoute))
    .get<MapOverlaysRequest>('map-overlays/:entityCode', handleWith(MapOverlaysRoute))
    .get<EntityRequest>('entity/:entityCode', handleWith(EntityRoute))
    .get<ReportRequest>('report/:entityCode/:reportCode', handleWith(ReportRoute))
    .get<VerifyEmailRequest>('verify/:emailToken', handleWith(VerifyEmailRoute))

    /**
     * POST
     */

    .post<RegisterRequest>('register', handleWith(RegisterRoute))
    .post<ReportRequest>('report/:entityCode/:reportCode', handleWith(ReportRoute))
    .post<ReportRequest>('pdf', handleWith(PDFExportRoute))

    /**
     * PUT
     */
    .put<UpdateSurveyResponseRequest>('survey-response/:id', handleWith(UpdateSurveyResponseRoute))

    .build();

  // Forward any unhandled request to central-server
  useForwardUnhandledRequests(app, CENTRAL_API_URL, '/admin', attachSession);

  return app;
}
