/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  handleWith,
  useForwardUnhandledRequests,
  attachSessionIfAvailable,
} from '@tupaia/server-boilerplate';
import { SessionSwitchingAuthHandler } from '@tupaia/api-client';
import { TupaiaWebSessionModel } from '../models';
import {
  DashboardsRoute,
  ReportRoute,
  UserRoute,
  TempLogoutRoute,

  DashboardsRequest,
  ReportRequest,
  UserRequest,
  TempLogoutRequest,
} from '../routes';

const { WEB_CONFIG_API_URL = 'http://localhost:8000/api/v1' } = process.env;

export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase(), 'tupaia-web')
    .useSessionModel(TupaiaWebSessionModel)
    .useAttachSession(attachSessionIfAvailable)
    .attachApiClientToContext(req => new SessionSwitchingAuthHandler(req.session))
    .get<ReportRequest>('report/:reportCode', handleWith(ReportRoute))
    .get<UserRequest>('getUser', handleWith(UserRoute))
    .get<DashboardsRequest>('dashboards', handleWith(DashboardsRoute))
    // TODO: Stop using get for logout, then delete this
    .get<TempLogoutRequest>('logout', handleWith(TempLogoutRoute))
    .build();

  useForwardUnhandledRequests(app, WEB_CONFIG_API_URL);

  return app;
}
